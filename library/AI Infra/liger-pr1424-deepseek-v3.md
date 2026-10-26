# DeepSeek-V3 支持 · 一次"零评审"合入的模型支持 PR（#1424）

> **Monkey Patch · Study Notes**
> PR [#1424](https://github.com/linkedin/Liger-Kernel/pull/1424) `[Feature] Support apply_liger_kernel_to_deepseek_v3`
> 2026-08-30 开启 · 2026-09-25 合入（kolehma8，squash `40a9d8a`，+602/−2，10 files，**全程零评审意见**）
> linkedin/Liger-Kernel · Closes #623 · 用户第 3 个合入的 Liger PR
> 配套底稿：`Liger-Kernel/liger-dsv3-study/`（前期显存实验）、`Liger-Kernel/dev/kaggle-dsv3-bench/`（基准战役全部产物）

模型支持类 PR 的完整样本：**改什么**（lce_forward + monkey patch 面）、**怎么验证**（三环境验证矩阵 + 上游变动后的重验证）、**怎么用数据说话**（A100 显存扫描 + 吞吐稀释论证 + 一段 T4 排障史诗）、**怎么合入**（零评审配方的 model-support 变体）。

---

## 00 · 全景卡片

| 项 | 内容 |
|---|---|
| 动机 | DeepSeek-V3 在 transformers 里没有 Liger 支持；issue #623（2024-08 开）长期无人合入 |
| 交付 | `model/deepseek_v3.py`（lce_forward，143 行）+ `apply_liger_kernel_to_deepseek_v3`（96 行）+ 测试 + README |
| 合入 | 2026-09-25 02:26 UTC，squash `40a9d8a`，零评审评论 —— 依据 = 仓库先例 + 9-19 的实质性基准评论 |
| 关键数字 | A100 bf16 显存：2K +4% → 16K **+50%**，32K 时 HF OOM 而 Liger 36.6 GiB；吞吐 0.97×–1.00×（真实模型 lm_head 占参 0.14% → 端到端 ≈1.00×） |

---

## 01 · 背景：缺口与 DeepSeek-V3 架构速览

### 1.1 缺口定位

- Issue **#623**（"Support for DeepSeek models"）2024-08 开着，多人 #take 但无 PR 合入；
- PR #499（V2 支持）2025-03 后死掉（pre-v5 时代，mergeable=dirty）；
- PR #1264（DeepSeek-V3.2）2026-06 起开放未合；
- → V3 是明确空缺，且 `LigerExperts` / `LigerQwen3MoeSwiGLUMLP` / `IS_TRANSFORMERS_V5_OR_LATER` 都已在 main —— 万事俱备。

### 1.2 真实配置（transformers `DeepseekV3Config` 默认值，写 PR 时逐一核对过）

| 维度 | 值 | 对 patch 的意义 |
|---|---|---|
| vocab_size | **129280** | logits 物化代价巨大 → FLCE 是主菜（第 2 章） |
| hidden_size | 7168 | — |
| layers | 61（`first_k_dense_replace=3`，前 3 层稠密） | patch 循环要区分 MoE 层与稠密层 |
| attention | MLA，128 heads，带 `q_a_layernorm` / `kv_a_layernorm` | RMSNorm patch 要覆盖这两个压缩层 norm |
| MoE | 256 experts，top-8，`n_group=8`/`topk_group=4`，`routed_scaling_factor=2.5`，`moe_intermediate_size=2048` | v5 批量 experts → `LigerExperts`；router **不 patch** |
| 位置编码 | **interleaved partial RoPE** | 与 `liger_rotary_pos_emb` 不兼容 → rope=True 警告+跳过 |

> **Liger 的 patch 哲学**：只动 norm / MLP / loss 这三类"实现替换不改语义"的组件，**attention 与 RoPE 一律不碰**。V3 的 MLA 和部分 RoPE 因此天然在 patch 面之外 —— issue #129 里对 V2 的担心（decoupled RoPE、MLA）同样落空。

---

## 02 · 核心技术点一：logits 回避（FLCE 路径）

### 2.1 为什么 129280 的词表让 logits 物化不可接受

HF 训练路径：`lm_head(hidden)` 物化 `[tokens, 129280]` logits → loss 内部 fp32 上转 + softmax。bf16 下 seq 8K、batch 1 的 logits 就有 ~2.1 GB，加上 fp32 副本翻倍；A100 实测边际成本 **每多 1K tokens ≈ +2.4 GiB**（由 (46.06−26.18)/8.192 反推，见第 5 章）。

### 2.2 lce_forward 的分支逻辑（`model/deepseek_v3.py`）

```python
if skip_logits is None:
    skip_logits = self.training and (labels is not None or shift_labels is not None)

if skip_logits:   # 训练 + 有标签：logits 从不物化
    result = LigerForCausalLMLoss(hidden_states=kept_hidden_states,
                                  lm_head_weight=self.lm_head.weight, labels=labels, ...)
else:             # 推理 / 无标签 / 显式要 logits
    logits = self.lm_head(kept_hidden_states)
    if labels is not None:
        loss = self.loss_function(logits=logits, ...)
```

- 训练默认 `skip_logits=True` → 走 `LigerForCausalLMLoss`（FLCE：按 token 分块投影 + Triton 内核算 CE，logits 只以 chunk 瞬时量存在）；
- 否则物化 logits 走 HF 原生 `self.loss_function`（推理/评估行为不变）；
- 返回 `LigerCausalLMOutputWithPast`（带 `token_accuracy` / `predicted_tokens`）。

### 2.3 一个重要的"反派角色"：固定 3.45 GiB 的 fp32 dW 累加器

FLCE 为了跨 chunk 数值稳定，把 `dW`（形状 `[129280, 7168]`）在 **fp32** 里累加，backward 结束才 cast 回原精度：

$$
129280 \times 7168 \times 4\,\text{B} = 3.45\,\text{GiB（固定开销，与 seq 无关）}
$$

它是显存收益公式的常数项，也是第 5 章 T4 排障史诗的最终答案 —— **记住这个数**。

---

## 03 · 核心技术点二：monkey patch 面（`apply_liger_kernel_to_deepseek_v3`）

```python
def apply_liger_kernel_to_deepseek_v3(rope=False, cross_entropy=False,
                                      fused_linear_cross_entropy=True,
                                      rms_norm=True, swiglu=True, model=None):
```

| 组件 | 替换 | 细节 |
|---|---|---|
| RMSNorm | `DeepseekV3RMSNorm` → `LigerRMSNorm` | 实例级要覆盖 `norm`、每层 `input_layernorm` / `post_attention_layernorm`，以及 MLA 的 `q_a_layernorm` / `kv_a_layernorm` |
| SwiGLU（稠密 + 共享专家） | `DeepseekV3MLP` → `LigerQwen3MoeSwiGLUMLP` | 所有版本一致（复用 qwen3_moe 的实现，forward 签名匹配） |
| Routed experts（v5+） | 批量 `DeepseekV3Experts` → **`LigerExperts`**（融合 MoE） | 批量权重布局 `(N, 2I, H)` / `(N, H, I)` 与 HF 一致 → **checkpoint 无需转换**；`num_local_experts` 别名 `n_routed_experts` |
| Routed experts（v4） | 每个 expert 是一个 `DeepseekV3MLP` → 逐个 `_patch_swiglu_module` | 镜像 mixtral / qwen3_moe 的 v4 模式；本地只有 v5，v4 分支靠 CI 矩阵覆盖（PR 里如实披露） |
| RoPE | **不支持**：`rope=True` → `warning_once` + 跳过 | 不静默改行为；README 表格刻意不列 rope |
| loss | `forward` 换成 lce_forward | 类级（class swap）或实例级（`MethodType` 绑定）；注册进 `MODEL_TYPE_TO_APPLY_LIGER_FN` → `AutoLigerKernelForCausalLM` 自动生效 |

两个实现细节值得记：

- **`_patch_swiglu_module` 只 rebind `forward` / `_get_name`**（不换 `__class__`）→ 实例级 patch 对命名/配置不敏感，只有类替换的构造路径才 config-sensitive；
- MoE 层判定：`isinstance(decoder_layer.mlp, DeepseekV3MoE)` 分流 —— MoE 层 patch `experts` + `shared_experts`，稠密层直接 patch `mlp`。

### 测试面

- 实例 monkey-patch 测试（**同时断言 v5 与 v4 两个分支的结果**）；
- 4 条收敛测试：bf16/fp32 × FLCE/logits，用 mini `deepseek_v3` config（随机初始化、真实 hidden/vocab、减层）；
- `test/utils.py` 加 `revert_liger_kernel_to_deepseek_v3`（可逆性）；
- README 条目。

---

## 04 · 验证矩阵：三个环境 + 一次上游变动重验证

| 环境 | torch / transformers | 结果 |
|---|---|---|
| 本地 RTX 4060（快迭代） | 2.11.0+cu128 / 5.16.1 | 10/10（v3+v4 分支 × bf16/fp32 × FLCE/logits，102s） |
| Kaggle T4（老架构 + 旧版本组合） | 2.10.0+cu128 / 5.0.0 | 3/3（monkey-patch 实例 + fp32 FLCE 收敛 + fp32 logits；v4 测试因 5.0.0 无 `deepseek_v4` 自动 SKIP） |
| 实验室 A100（真基准） | 2.11.0+cu130 / 5.8.1 | mini smoke loss rel=2.8e-06 → 全量基准（第 5 章） |

**上游变动的教训**：9-13 验证完之后，main 的 FLCE 内部变了（#1468 logits 缓冲复用、#1472 C=1 默认）—— 分支不动地放着，验证结论会**过期**。9-19 把分支 rebase 到新 main（range-diff 证明 patch 字节不变）后**重新验证** 5/5（77s），再谈基准。PR 的可信度 = 验证时点 × 当时跑的代码，不是"我曾经验过"。

---

## 05 · 基准战役（本 PR 最有复盘价值的部分）

### 5.1 方法论：对齐 #1390 先例

model-support PR 的仓库门槛（由 #1390 Muse Glimmer 确立）：**峰值显存表**（seq 扫描，HF vs Liger）+ **吞吐表**（层数扫描），随机初始化模型、真实 hidden/vocab、减层并**披露**、不做 optimizer step。所有基准必须随机初始化（无公开 checkpoint 可用）+ 真实维度词表 129280。

### 5.2 A100 结果（bf16，真实 129280 词表，2 层 + 16 experts top-2，披露精简）

显存（fwd+bwd，无 optimizer step）：

| batch × seq | HF | Liger | 节省 |
|---|---|---|---|
| 1 × 2048 | 13.1 GiB | 12.61 GiB | 4% |
| 1 × 4096 | 16.24 | 13.02 | 20% |
| 1 × 8192 | 26.18 | 16.4 | 37% |
| 1 × 16384 | 46.06 | 23.15 | **50%** |
| 1 × 32768 | **OOM** | 36.64 | — |
| 4 × 8192 | **OOM** | 36.67 | — |

解读：HF 的 loss 管线物化 `[tokens, 129280]` logits 及其 fp32 上转/softmax（**+2.4 GiB / 1K tokens**），FLCE 换成 chunk 瞬时量 + **固定 3.45 GiB fp32 dW 累加器**。固定项稀释后，**token 越多省得越多，且不存在 T4 上那种交叉点下行** —— 32K 处 HF 直接放不下 80 GB，Liger 还剩一倍余量。所有 cell 的 loss 相对误差 ≤ 7e-06。

吞吐（同硬件，b=1, seq 4096，变深度）：

| layers | lm_head 占比 | HF tok/s | Liger tok/s | ratio |
|---|---|---|---|---|
| 2 | 27% | 8457 | 8172 | 0.97× |
| 4 | 18% | 5117 | 5039 | 0.98× |
| 8 | 10% | 2871 | 2862 | 1.00× |

### 5.3 T4 排障史诗：五轮 kernel 迭代与 OOM 之谜

Kaggle T4（15 GB，fp16）跑吞吐基准，v1 的吞吐实验连环 OOM。三轮假设迭代：

1. **v2（碎片假设）**：Liger 在 allocated 6.25 / reserved 9.96 GiB 时 OOM → 看似碎片化；
2. **v3（检验）**：加 `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True`，失败点 reserved ≈ allocated → **碎片假说被证伪**；
3. **v4（OOM 消息给出答案）**：失败请求正是 fp32 `[V,H]` dW 累加缓冲 = **3.45 GiB**。稳态训练循环的真实需求：

$$
\underbrace{4.46}_{\text{权重}} + \underbrace{4.25}_{\text{已保留的 grads}} + \underbrace{3.45}_{\text{fp32 dW}} + \text{fp16 cast} \approx 15.4\,\text{GiB} > \text{T4 上限（任意 seq）}
$$

**v1 单发测量"11.43 GiB 能放下"是假阳性** —— 第 1 次迭代还没有保留的 `.grad`。单次 `max_memory_allocated` ≠ 稳态训练显存，基准必须跑循环。

4. **v5（绕行）**：吞吐实验降到 **vocab 66,536**（真实 hidden/MLA 维度保留，PR 里披露；显存表保持真实词表）→ 跑通，得到 **Liger 0.27× / 0.36× HF tok/s**（L2/L4）。

### 5.4 吞吐数字的稀释论证（怎么诚实地呈现 0.27×）

0.27× 的机理：Triton 的 fp32-累加 GEMM 打不过 cuBLAS 的 fp16 tensor core（sm_75 上尤其悬殊；仓库自己的 FLCE 基准 CSV 在 A100 上也有同样形态）。但这是 **loss 段**的数字，端到端代价由 lm_head 的参数占比稀释：

- 实测配置（2/4 层）：占比 36% / 25% → 0.27×/0.36×；
- **真实 61 层模型：lm_head 占参 ~0.14% → 端到端 ≈ 1.00×**（与 A100 吞吐表随深度收敛到 1.00× 相互印证）。

> **严谨性审计的教训**（发表前用户要求逐句核实措辞时发现的）：
> - "~2 GB" 改成 "**~2.4 GiB per additional 1K tokens**"（用实测边际速率 (46.06−26.18)/8.192 支撑）；
> - 实测显存 GB → **GiB**（脚本按 2^30 除；GPU 产品名 "80 GB" 保留）；
> - 精简配置披露补全：`n_group=8, topk_group=4, routed_scaling_factor=2.5, first_k_dense_replace=3` 均按 transformers 真实默认值核对（初稿凭记忆写成 8/3，**错了**）；
> - **删掉了站不住的推导**：T4 "~3.7× loss 段减速"的拆解经参数占比反解出负的 s，数学上自相矛盾 → 只保留实测事实（T4 交叉点 ~4K）。**推不出来的结论宁可删，也不留一个会被评审戳破的数字。**

### 5.5 最终发表策略（方案 A）

PR body = 显存表 + 定量文字（含 T4 交叉点一句话披露），**不放** T4 吞吐表；follow-up 评论带两张表 + `<details>` 原始 A100 日志（#1423 的惯例），@kolehma8 @arde171。

---

## 06 · 时间线与"零评审"合入机制

| 日期 | 事件 |
|---|---|
| 08-30 | PR 开启（与 #1423 同日） |
| 09-13 | rebase 到 main + **@-mention ping**（arde171/kolehma8/byhsu）+ Kaggle T4 3/3 + 4060 10/10 验证（`mergeable_state: unstable` = 等 workflow 批准，fork PR 无自动 GPU CI） |
| 09-19 | main 领先 15 commits 且 FLCE 内部已变 → rebase + 重验证 5/5；决定"带实质内容跟进"而非干 ping；基准战役（Kaggle T4 v1–v5，配额 2.8h/30h每周 + 实验室 A100 ~35 min）；措辞审计后 14:41 UTC PATCH PR body + 发 follow-up 评论 |
| 09-25 | 最终 rebase force-push（`896f3a4`）→ **~20 分钟后合入**（squash `40a9d8a`），全程零评审评论；准备好的轻量 ping 没用上（"不用发了"） |

**model-support 变体的零评审配方**：keep-alive（rebase + 重验证）→ **一条带完整基准表的实质评论**（而不是干催）→ 诚实披露（精简配置、T4 交叉点、fp16 环境）→ 方法论对齐仓库先例（#1390）。评审者的信任来自"表格自己会说话"。

**运维经验**（可复用）：

- Kaggle：`machine_shape: "NvidiaTeslaT4"` 必须显式设置（否则静默回退 P100）；CLI 走系统代理会间歇性 TLS 重置 → `NO_PROXY="kaggle.com,.kaggle.com"`；取日志用 API `curl .../kernels/output`（按文件下载 clone 产物是陷阱）；配额 30h/周；
- 实验室 A100：`nvidia-smi` 挑空闲卡 + `CUDA_VISIBLE_DEVICES` 钉死；一切留在自己的目录、不装进任何 conda env；`cmd1 && cmd2 && nohup ... &` 会把**整条 && 链**放后台（日志路径要用绝对路径验证）；
- GitHub API：issue-comments 端点忽略 sort 参数（恒升序，取全部再取最后）；改 PR body 用 `PATCH /pulls/{n}`；token 走 `git credential fill`。

---

## 07 · 方法论清单

1. **模型支持 PR 的本质是"接线"不是"造轮子"**：lce_forward 模板 + 现成的 LigerRMSNorm/LigerQwen3MoeSwiGLUMLP/LigerExperts 组合，~600 行含测试；难点在 patch 面的完备性（MLA 的两个 layernorm、MoE 层分流、v4/v5 分支）而不是算法。
2. **不支持的特性要显式 warn + skip + 文档三连**（RoPE）：不静默改行为，也不假装支持。
3. **验证结论有时效**：上游 FLCE 变了就要 rebase + 重验；PR 里写清楚验证时的 commit。
4. **单发显存测量是假阳性之源**：稳态循环才有保留的 `.grad` 和分配器残渣；基准必须迭代跑。
5. **坏数字靠稀释论证救，不靠藏**：loss 段 0.27× → 参数占比 0.14% → 端到端 1.00×，链条摆出来。
6. **每个数字都要能指着公式或日志**：边际速率给出计算式、单位统一 GiB、配置披露对着真实 config 默认值核对、推不出的推导直接删。
7. **交叉验证三环境**：4060（快迭代）/ T4（老架构 + 旧 transformers）/ A100（旗舰数据），覆盖面本身就是说服力。

---

## 08 · 后续：DeepSeek-V2 是这条线的自然续作

transformers v5 里 `modeling_deepseek_v2` 与 V3 逐类几乎相同（批量 experts、相同 forward 签名、相同 norm 命名）；差异只在 router（V2 softmax+greedy vs V3 sigmoid+noaux_tc，而 router 不在 patch 面内）和少量命名（v5 里 `DeepseekV2MoE`→`DeepseekV2Moe` 需要 try/except 导入；V2 config 无 `rope_interleave`）。已确认 issue #129（help wanted）开放、stale PR #499 死亡（新 PR 将 supersede 它）→ V2 patch ~250 行，直接复用本 PR 的全套方法论。

---

## 参考

1. PR #1424: Support apply_liger_kernel_to_deepseek_v3 — <https://github.com/linkedin/Liger-Kernel/pull/1424>（follow-up 评论：issuecomment-5742751248）
2. Issue #623: Support for DeepSeek models — <https://github.com/linkedin/Liger-Kernel/issues/623>
3. PR #1390（Muse Glimmer）: model-support PR 的基准方法论先例
4. 上游相关改动：#1468（FLCE logits 缓冲复用）、#1472（FLCE C=1 默认）、#1454（addmm dW）
5. 本地产物：`dev/kaggle-dsv3-bench/`（基准脚本、PR body 终稿、A100 日志）、`liger-dsv3-study/`（早期显存实验）

---

*LIGER-KERNEL · PR #1424 · STUDY NOTES · 2026-09*
