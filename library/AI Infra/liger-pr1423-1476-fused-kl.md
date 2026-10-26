# 融合线性 KL 散度算子

> **Triton Kernel · Study Notes**
> PR [#1423](https://github.com/linkedin/Liger-Kernel/pull/1423) `feat: add FusedLinearKLDivLoss`
> PR [#1476](https://github.com/linkedin/Liger-Kernel/pull/1476) `refactor(kl_div): route fused-linear KL inner kernel through the dispatcher`
> linkedin/Liger-Kernel · 验证环境：RTX 4060 Laptop (sm89) + Kaggle T4 (sm75) + A100 (sm80)

**#1423 交付算子本体**（数学推导 → 分块工程 → 172 项验证 → 评审轮把 log-softmax 融进 Triton 内核）
**#1476 把内核注册为可调度的 primitive**（对齐 JSD/FLCE 的生态位，为 CuTe DSL 后端铺路）

---

## 01 · 理论基础

### 1.1 KL 散度：定义与两条关键性质

对教师分布 $Q$ 与学生分布 $P$（同一离散支撑集，此处为词表 $V$）：

$$
D_{KL}(Q \,\|\, P) = \sum_i q_i \log \frac{q_i}{p_i} = \sum_i q_i (\log q_i - \log p_i)
$$

### 1.2 蒸馏场景的形式：P 是 log-softmax 的输出

一个 token 的隐藏向量 $x \in \mathbb{R}^H$，输出头 $W \in \mathbb{R}^{V \times H}$，logits $z = xW^\top$，除温度 $T$ 后取 log-softmax 得 $y$，逐 token 损失：

$$
L_{\text{row}} = \sum_i q_i \big(\log q_i - y_i\big), \qquad y = \log\text{softmax}(z/T)
$$

关键恒等式：$D_{KL}(Q\|P) = H(Q,P) - H(Q)$。教师分布 $Q$ 是给定数据，$H(Q)$ 是常数，**最小化 KL 等价于以 $Q$ 为软标签的交叉熵**。这解释了本算子与 `fused_linear_cross_entropy` 的高度同源：CE 只是把 $q$ 换成 one-hot。

### 1.3 梯度推导：三步

记 $\alpha$ 为 reduction 缩放因子（见 1.4，代码里的 `scale`）。

**第一步 · 对 log-probs 的梯度**（$\log q$ 项是常数，直接消失）：

$$
\frac{\partial L}{\partial y_i} = -\alpha \, q_i
$$

> **核心洞察**：KL 损失对 log-probs 的梯度就是（负的、缩放过的）**目标分布本身**，与 $y$ 的值无关。梯度可以在看到 $y$ 之前算出来 → 可以在 forward 阶段原地写进 $y$ 的存储。整个 gradient-in-forward 设计的数学入场券就是这一行。

**第二步 · log-softmax 的雅可比回传**（$\partial y_i / \partial z_j = (\delta_{ij} - p_j)/T$，$p = \text{softmax}(z/T)$）：

$$
\frac{\partial L}{\partial z_j} = \frac{1}{T}\Big(g_j - p_j \sum_i g_i\Big), \qquad g = -\alpha\, q
$$

当 $q$ 是合法概率（行和为 1）时 $\sum_i g_i = -\alpha$，可化简为著名的蒸馏梯度形式 $\frac{\partial L}{\partial z} = \frac{\alpha}{T}(p - q)$ —— "把学生分布往教师推"，直觉上就是蒸馏的全部含义。但实现**故意走通式** $g - p\sum g$：$\sum g$ 从实际写入的梯度求和，当行被 `ignore_index` 整行置零、或软标签未严格归一时，通式依然正确，捷径会引入系统性偏差。**正确性优先于优雅。**

**第三步 · 线性层回传**（$z = xW^\top$ 的链式法则，对每个 chunk 累加）：

$$
\frac{\partial L}{\partial W} = \Big(\frac{\partial L}{\partial z}\Big)^{\!\top} X \quad (V{\times}H), \qquad \frac{\partial L}{\partial x_{\text{row}}} = \frac{\partial L}{\partial z_{\text{row}}} W
$$

### 1.4 reduction 语义与缩放因子 $\alpha$

逐行 KL 得到 $(BT,)$ 向量后按 `torch.nn.KLDivLoss` 语义归约。$\alpha$ **预先算好并融进 kernel**（loss 与梯度统一乘）：

| reduction | $\alpha$ | 语义 | 梯度量级 |
|---|---|---|---|
| `batchmean` | $1 / n_{\text{non-ignore}}$ | 逐行 KL 平均（统计学正解） | $O(q/BT)$，小而稳 |
| `mean` | $1 / (n_{\text{non-ignore}} \cdot V)$ | 全元素平均（对齐老版 torch 的争议默认） | 再小 $V$ 倍 |
| `sum` | $1$ | 全量求和 | $O(q)$，绝对误差放大约 $BT$ 倍 → 第 5 章调试主角 |
| `none` | — | **不支持**（ValueError 并指向 `LigerKLDIVLoss`） | gradient-in-forward 需要标量 loss |

### 1.5 温度 $T$ 的双重作用

梯度多一个 $1/T$ 因子；且 $T=2$ 时 softmax 更平 → $p-q$ 差异被压小、有效梯度信号变小而数值噪声不变 —— 这是后文 bf16 + sum 组合误差敏感的理论根源之一。

### 1.6 数值约定：$0 \cdot \log 0 = 0$

教师分布大量条目为 0。浮点直接算 $\log 0 = -\infty$ 再乘 0 得 NaN → `clamp(q, eps)`（默认 `eps=1e-10`），与 PyTorch 参考 `q.clamp_min(eps)` 逐位对齐。PR #1397 处理过 JSD 同类下溢的更极端版本。

---

## 02 · 生态定位：为什么值得做

把相关方按两个轴分类：**是否融合线性投影**、**教师信号以什么形式输入**：

| 方案 | 融合线性层 | 教师信号 | 物化 $BT{\times}V$ | 局限 |
|---|---|---|---|---|
| `torch.nn.KLDivLoss` | ✗ | log-probs | **是** | logits 必须先完整算出；默认 `mean` 而非 `batchmean` 的历史坑 |
| `LigerKLDIVLoss` | ✗ | log-probs | **是** | 逐元素 Triton 内核，快但输入仍需物化 —— 内存问题原封不动 |
| `LigerFusedLinearJSD`（#408） | ✓ | 教师 hidden + 教师权重 | 否（chunked） | 需要部署教师权重；JSD 是对称度量 |
| `LigerFusedLinearCrossEntropy` | ✓ | one-hot 硬标签 | 否（chunked） | 硬标签无法表达暗知识 |
| **本 PR** | ✓ | **显式概率 $Q\ (BT,V)$** | 否（chunked） | **填补空缺** |

> **空缺论证**：离线/缓存蒸馏时教师概率 $Q$ 作为数据集一部分预先存在，不需要教师权重参与计算图 → JSD 的"教师投影"是多余负担，逐元素 KLDivLoss 又退回物化 logits。$Q$ 已知 + 学生投影可融合 → 融合 forward-KL 算子是拼图的最后一片。

三个近邻构成技术谱系：**JSD #408** 给了 chunked gradient-in-forward 骨架；**FLCE #1414** 给了分块几何常量 $C=16$；**#1397** 给了数值容差哲学（bf16+sum 用 `atol=5, rtol=50` 的仓库惯例）。

---

## 03 · PR #1423（上）：算子设计与实现

### 3.1 标准四件套分层

| 层 | 文件 | 职责 |
|---|---|---|
| ops | `ops/fused_linear_kl_div.py` | Triton kernel `_kl_div_kernel` + autograd Function |
| module | `transformers/fused_linear_kl_div.py` | `LigerFusedLinearKLDivLoss` · nn.Module 包装 |
| functional | `transformers/functional.py` | `liger_fused_linear_kl_div(...)` |
| test / bench / docs | `test/transformers/test_fused_linear_kl_div.py` 等 | 双参考对比、容差矩阵、统一基准框架、README/docs 条目 |

### 3.2 核心算法：一个 chunk 的旅程（评审融合**前**的版本）

外层按 `chunk_size` 切片循环，每块：投影 GEMM → fp32 log-softmax → Triton kernel 原地写 $-\alpha q$ 并累加行损失 → torch 重算 softmax 做 log-softmax backward → 两个 GEMM 回传 dX/dW。当时的实现把 fp32 上转型、温度缩放、log-softmax 都放在 **torch 侧**，HBM 里要经历 fp32 logits、fp32 log_prob、fp32 softmax 三个 chunk 级临时量 —— 这正是评审轮要改造的点（第 4 章）。

### 3.3 八条关键设计决策

| # | 决策 | 为什么 |
|---|---|---|
| 1 | **gradient-in-forward** | KL 是网络末端损失，backward 只剩乘 grad_output → 梯度可在 forward 算好。代价：forward 变慢；要求标量 loss → `none` 不支持 |
| 2 | **按 token 维 chunk** | 损失沿 token 可加，切片不改数学；峰值显存 $O(BT \cdot V) \to O(C \cdot BT \cdot H)$ |
| 3 | **C=16 分块几何** | 沿用 FLCE #1414：预算放宽 16 倍换 chunk 足够大，GEMM 不 launch-bound |
| 4 | **logits 起全 fp32**（后改为内核寄存器内 fp32） | bf16 的 8 位尾数在 log/exp 下不可用 |
| 5 | **原地写 + 及时 del** | 同一块 chunk×V 内存复用三个身份（log_prob → dY → dZ） |
| 6 | **accum_dtype 可选 fp32** | dW 跨 chunk 累加，低精度逐块累加会漂移 |
| 7 | **addmm(out_dtype=fp32) 快路径** | torch ≥ 2.8 且 sm80+ 时让 cuBLAS 直接在 fp32 输出里累加（`171c172` 对齐 FLCE #1454） |
| 8 | **scale 预计算融进 kernel** | loss 与梯度共用一个缩放；$n_{\text{non-ignore}}=0$ 时 $\alpha=0$ 天然零损失零梯度 |

> **刻意的不做**：`reduction="none"` 抛 ValueError 并指引去 `LigerKLDIVLoss` —— 逐元素损失的梯度形状恰好是 $(BT,V)$，留到 backward 就失去全部内存收益。**拒绝一个功能有时比实现它更正确。**

### 3.4 内存账本：收益来源是"不物化"

以 llama-3 词表头（$H=4096$, $V=128256$, bf16）为例，fp32 的 $BT{\times}V$ 在 $BT=4096$ 时占 2.05 GB：

| 路径 | 必须存活的张量 | 实测峰值（BT=4096, bf16, 开发期数据） |
|---|---|---|
| PyTorch 基线 | logits / log_softmax 输出 / q 的 fp32 副本 / 中间量 / backward 重算的 softmax，各 ~2.05GB | **12072 MB** |
| 本算子 | X、dX（各 33MB）· W、dW（各 1.05GB）· loss_1d（16KB）· 瞬时块临时 | **6594 MB**（**1.83×**） |

$$
\text{基线} \approx k \cdot BT{\cdot}V \ (k \approx 3{-}5 \text{ 个 fp32 副本})， \qquad \text{融合} \approx 2{\cdot}V{\cdot}H + 2{\cdot}BT{\cdot}H + 3C{\cdot}BT{\cdot}H
$$

词表越宽（$V/H$ 越大）、batch 越大，收益越大 —— 1.13×（BT=1024）→ 1.52×（2048）→ 1.83×（4096）随 BT 单调上升，与账本模型吻合。

### 3.5 时间守恒：forward 慢 / backward 快是指纹

gradient-in-forward 不减少总计算量，只是重排计时。BT=1024 实测（4060，开发期）：

| 阶段 | 基线 | 本算子 | 比值 |
|---|---|---|---|
| forward | 77.5 ms | 184.8 ms | 2.39× 慢 |
| backward | 110.2 ms | 24.3 ms | **4.53× 快** |
| **full** | **187.8 ms** | **209.7 ms** | **0.90× 持平** |

> 评审融合算子**不要单独看 forward 或 backward** —— 那只是同一份总工作在时间轴上的两种切法；full 持平才是"没付出速度代价"的证据。JSD #408 的数据也是这个形态，是该类算子的指纹。

分块几何的教训：$C=1$（JSD 沿用的旧公式）在大词表下 chunk 只有 128 行 × 32 块，launch-bound 实测 full 慢约 5.1×；$C=16$ 把瞬时预算放宽到 $16 \cdot BT \cdot H$（本例 ~1GB），GEMM 回到高效区间。**chunk 不是越小越好，分块几何是显存与吞吐的连续谱。**

---

## 04 · PR #1423（下）：评审轮把 log-softmax 融进 Triton 内核

### 4.1 评审意见与应对

PR 开启后静置约两周，9-13 主动 ping，当天收到 kolehma8 **5 条行级意见**，归结为两点：

1. **把 fp32 上转型、温度缩放、log-softmax、为 backward 重算的 softmax 全部融进 Triton kernel** —— 不要在 torch 侧物化这些 fp32 中间量；
2. **补对 torch 的基准数据**。

应对 = 两个 commit + 一条带表格与原始日志的回复：

- `171c172`（9-13 白天）：dW 低精度累加对齐当天刚合入 main 的 FLCE #1454（addmm 直接在 fp32 out 里累加）；
- `ef19754`（9-13 深夜）：**内核融合改造**，见下；
- 基准回复：A100 bf16 速度 **1.43–1.96×**、显存 **−87~89%**；T4 fp16 **1.69× / −73.5%**；fp32 诚实汇报 **0.94×–1.16×**（不隐瞒弱点）；表格 + `<details>` 折叠原始日志。

**合入发生在改造后 <24 小时。** 复盘：快速响应 + 弱点诚实披露 + 原始日志可查，是这次一轮过审的配方。

### 4.2 融合后的内核：三 pass online logsumexp

改造后 kernel 直接收**原生精度的 logits** $X$（GEMM 输出不做 fp32 上转，HBM 只见 bf16/fp16），fp32 数学全部发生在寄存器里；$Y = \log\text{softmax}(x/T)$ **从不物化**。每个行程序三 pass：

$$
\text{Pass 1:} \quad m = \max_i \frac{x_i}{T} \qquad (\text{mask 位} = -\infty)
$$

$$
\text{Pass 2:} \quad s = \sum_i e^{x_i/T - m}, \qquad a_1 = \sum_i q_i \Big(\log\max(q_i, \varepsilon) - \frac{x_i}{T}\Big), \qquad a_2 = \sum_i q_i
$$

利用 $y_i = x_i/T - \mathrm{lse}$，损失分解为两个与 $\mathrm{lse}$ 无关的部分式：

$$
\mathrm{lse} = m + \log s, \qquad \text{loss} = \big(a_1 + \mathrm{lse} \cdot a_2\big) \cdot \alpha
$$

$$
\text{Pass 3:} \quad d_i = \frac{\partial L}{\partial z_i} = -\frac{\alpha}{T}\big(q_i - p_i\, a_2\big), \qquad p_i = \frac{e^{x_i/T - m}}{s} \quad \text{（原地写回 } X\text{）}
$$

注意 Pass 3 仍是**通式** $g - p\sum g$ 的化简：$g = -\alpha q$、$\sum g = -\alpha \, a_2$，其中 $a_2$ 是**实际读到的** $q$ 行和而非假设 1 —— ignore 行与未归一标签下依然正确。且 $a_2$ 在 Pass 2 已顺带算出，**softmax 重算完全消失**（原 torch 侧的 `torch.softmax` 只为 backward 服务，现在 Pass 3 的 $e^{x_i/T-m}/s$ 就是它，且从未离开寄存器）。

### 4.3 融合改造的收益机理

改造前后 chunk 级 HBM 临时量对比（以 bf16 输入、chunk×V 计）：

| | torch 侧 fp32 物化 | HBM 峰值（每元素） |
|---|---|---|
| 融合前 | fp32 logits + fp32 log_prob + fp32 softmax ≈ 3 × 4B | **12 B** |
| 融合后 | 无（原生 logits 1 份，既是 GEMM 输出又是梯度写回目标） | **2 B** |

开发期（融合前）4060 全流程峰值 1.83×；评审回复中（融合后）A100 bf16 段级显存 **−87~89%** —— 深一档的收益正是这次融合换来的。

### 4.4 #1423 最终基准（评审回复数据）

| 硬件 / dtype | 速度 vs torch | 显存 |
|---|---|---|
| A100 / bf16 | 1.43–1.96× | −87~89% |
| T4 / fp16 | 1.69× | −73.5% |
| A100 / fp32 | **0.94×–1.16×**（诚实披露：fp32 无收益） | — |

---

## 05 · #1423 的验证工程

### 5.1 双参考实现 + 172 项测试矩阵

`TorchLMHeadKLDiv`（朴素组合）vs `LigerLMHeadKLDiv`（本算子），同 seed/权重/输入下对比 loss、dX、dW：

| 用例族 | 覆盖 | 项数 |
|---|---|---|
| correctness | 2 形状 × 3 dtype × 3 reduction × {T=1,2} | 36 |
| + ignore_index | 同矩阵 + 掩码（2 与 −100） | 36 |
| all_ignored | 全 ignore → $\alpha=0$ → 零损失零梯度 | 36 |
| functional | 入口 + eps/温度组合 | 24 |
| amp / torch-parity / invalid-reduction | autocast、逐位语义对齐、ValueError 指引 | 4 |

两个形状：规整 $(8,128,1024,4096)$ + 刁钻 $(4,423,167,1423)$（非二次幂、非对齐、$V \gg H$，专测 Triton mask）。4060 上 **172/172**；T4 上 51 通过 / 25 跳过（全部为 bf16 门控，sm75 无原生 bf16）。

### 5.2 调试故事：bf16 + T=2 + sum 的 5 个失败

失败全部集中在 `temperature=2.0 + reduction="sum" + 大形状`，且只有 dX 超差。三因素叠加：

1. **sum 的 $\alpha=1$ 暴露绝对误差**（batchmean 的梯度小 $BT$ 倍）；
2. **bf16 只有 8 位尾数**（相对精度 ~$2^{-8} \approx 0.4\%$；fp16 有 10 位，所以 fp16 全绿）；
3. **$T=2$ 压低信号**（softmax 变平，$p-q$ 变小，噪声不变 → 信噪比恶化）。

定位走"**失败面 → 逐阶段 diff → 根因**"三步：小形状与 fp32 全过排除算法错误；逐张量对比 logits → softmax → dY → dX，发现真正放大在 `dZ @ W` 的 GEMM 段 —— **分块 GEMM 与整块 GEMM 归约顺序不同**，数学等价、浮点不等价。修复两层：消除可控误差（`accum_dtype=fp32`），承认不可控误差（bf16+sum 容差对齐 FLCE 惯例 `atol=5, rtol=50`，并配 30-seed 扫描证明残差是浮点下界：fp16 最坏误差 9.77e-4 = $2^{-10}$，恰好一次量化）。

### 5.3 套件健康度与跨 GPU

合入门槛：全仓库 `make test` **4152 通过 / 32 失败** —— 32 个失败先在 main 基线复现定罪（18 个 = test_mlp 需 128KB 共享内存超 4060 的 101KB 上限；14 个 = GRPO 既有数值问题），再写进 PR。跨架构 sm89 + sm75 双端通过说明 kernel 未依赖 Ampere+ 特性。

---

## 06 · PR #1476：把内核注册为可调度的 primitive

### 6.1 问题类：组合算子绕过 dispatcher

`LigerFusedLinearKLDivFunction` 的 chunk 循环里直接 launch `_kl_div_kernel`，**绕过了 impl 选择** —— 这正是 JSD 后端 docstring（#1228）点名的 bug 类：组合算子绕过 dispatcher，未来新增后端时它永远走不到。元素级 `kl_div` 已有 CuTe DSL 后端（#1418），cuTile 注册正在成波落地（#1456，追踪于 #1205）—— KL 的下一个后端只差一个 `@register_op`。

### 6.2 设计与契约

最小范围 4 个文件（scope 决策：**只**注册 primitive，不注册 `fused_linear_kl_div` 组合 op、不加 `impl=` 函数式入口 —— KL 只有一个 impl；JSD 是在 CuTeDSL 出现后才拿到的完整入口。roadmap 写进 PR 描述即可）：

1. `ops/backends/_triton/kl_div.py`：`@register_op("kl_loss_and_grad", impl_name="nvidia-triton")` 包装 `_kl_div_kernel`（kernel 留在 ops 文件，镜像 FLCE 的 backend 布局；backends 懒加载，无循环导入）；
2. `functional.py`：`declare_op_locations("kl_loss_and_grad", (...))`；
3. `ops/fused_linear_kl_div.py`：chunk 循环里换成 `dispatch("kl_loss_and_grad", ...)`，并**重新绑定返回的 dx** —— 未来 impl 可能返回新张量而非原地写，组合算子无需再改；
4. 新 `test/ops/test_fused_linear_kl_div.py`：primitive 数值 vs torch（2 形状 × 3 dtype × ±ignore_index）、`available_backends` sanity、**tracking-dispatch 路由测试**（monkeypatch dispatch 断言默认路径真的经过调度器）。

**契约**：每 chunk 一次，返回 `(loss_rows (chunk_BT,) fp32, dx)`；`scale` 由调用方预计算（JSD 先例）；行级归约在 kernel 内完成（不同于 JSD 的 $(BT,V)$ tile）。

### 6.3 两个 gotcha

- **`loss_rows` 必须 `torch.zeros`** 而非 `empty`：kernel 对 `ignore_index` 行提前 return、**不写 loss**，而调用方对每行求和 —— 旧组合算子的 `loss_1d` 隐式提供了清零，primitive 化后必须显式补上。（顺带：`torch.zeros` 没有 `generator=` 参数。）
- 组合算子不再需要 V 相关的 `BLOCK_SIZE` 行 —— 那是 kernel 启动细节，下沉进 primitive。

### 6.4 验证与合入

新测试 14/14；回归 184 passed / 19 skipped（test_fused_linear_kl_div 全网 + test_kl_div + test_fused_linear_jsd + backends）；ruff 全绿（RTX 4060）。无用户可见 API 或数值行为变化：同 kernel、同分块几何、同 GEMM。**refactor PR 不需要基准数据** —— 这个判断被零评审合入验证（9-19 开，9-24 合，kolehma8 先点了 Update branch 再合，原 commit 未动）。

---

## 07 · 时间线与过程复盘

**#1423**（15 天）：

| 日期 | 事件 |
|---|---|
| 08-30 | 开发完成 + 172 项验证 + 基准，PR 开启（同日还开了 #1424） |
| 09-13 | 主动 ping → 当天收到 5 条行级评审 → `171c172` + `ef19754` 重塑 + 基准回复（含 fp32 弱点披露、`<details>` 原始日志） |
| 09-14 | 合入（squash `f6385e9`，kolehma8）——改造后 <24h |
| 评审评论区 | 承诺 follow-up：把 `kl_loss_and_grad` 注册为 primitive |

**#1476**（5.5 天，零评审）：

| 日期 | 事件 |
|---|---|
| 09-19 | 尽调（全仓库 0 处 `kl_loss_and_grad`/`fused_linear_kl_div`，无人认领）；设计 4 文件最小方案；PR 开启 |
| 09-24 | kolehma8 Update branch + 合入（`aed0dfb`），零评论零修改 |

**可复用的合入配方**（两次验证）：开启后静置是常态，主动 ping 触发评审；**评审响应当天出 commit + 基准表**；诚实披露弱数据（fp32 0.94×）；原始日志放 `<details>`；方法论对齐仓库先例（分块几何抄 FLCE、容差抄 #1397、基准方法抄 #1454）。兑现评论区的 follow-up 承诺（#1476）是建立信任的续作。

---

## 08 · 方法论清单

1. **融合损失的收益模型是内存不是速度**：总计算量守恒（full 0.90×），红利是"不物化"；评估先算 $BT{\times}V$ 字节账本。
2. **梯度推导先行且推到底**：$\partial L/\partial y = -\alpha q$ 与 $y$ 无关，是 gradient-in-forward 的合法性证明。
3. **优雅式与稳健式分开**：$(p-q)$ 捷径很美，通式 $g - p\sum g$ 才对 ignore/未归一正确。
4. **先读三个近邻再动手**：骨架（JSD）+ 几何（FLCE）+ 容差哲学（#1397）。
5. **chunk 不是越小越好**：$C=1$ 内存地板但 launch-bound（5.1× 慢），$C=16$ 用 16× 瞬时预算买回 GEMM 效率。
6. **数值调试三步**：失败面（参数空间哪个角落）→ 逐阶段 diff → 根因；先排除算法错误再谈精度。
7. **容差是社区契约**：bf16+sum `atol=5/rtol=50` 跟随 FLCE 惯例 + 多 seed 扫描证明残差 = 一次量化（9.77e-4 = $2^{-10}$）。
8. **评审是把内核推到最终形态的力量**：torch 侧 fp32 物化 → 三 pass 寄存器内融合，HBM 每元素 12B → 2B；评审意见的技术判断要当真。
9. **refactor PR 的证据是测试不是基准**：路由测试证明"真的经过 dispatcher"，数值测试证明"没改行为"。
10. **primitive 化的成本几乎为零、回报是整个后端生态**：一个 `@register_op` + 一次 rebind，换来未来 CuTe DSL/cuTile 后端的免费接入。

---

## 参考

1. PR #1423: feat: add FusedLinearKLDivLoss — <https://github.com/linkedin/Liger-Kernel/pull/1423>（评审回复：issuecomment-5654867464）
2. PR #1476: route fused-linear KL inner kernel through the dispatcher — <https://github.com/linkedin/Liger-Kernel/pull/1476>
3. 开发期完整复盘（数学推导与调试时间线的底稿）— `Liger-Kernel/liger-kl-study/liger-kl-study.md`
4. PR #408: Chunked, Fused Linear JS-Divergence Loss — <https://github.com/linkedin/Liger-Kernel/pull/408>
5. PR #1414: FLCE chunk-memory budget C=16；#1454: low-precision dW with addmm；#1397: JSD underflow fix
6. PyTorch, `torch.nn.KLDivLoss` — <https://docs.pytorch.org/docs/stable/generated/torch.nn.KLDivLoss.html>
7. Hinton et al., 2015, *Distilling the Knowledge in a Neural Network* — <https://arxiv.org/abs/1503.02531>

---

*LIGER-KERNEL · PR #1423 + #1476 · STUDY NOTES · 2026-09*
