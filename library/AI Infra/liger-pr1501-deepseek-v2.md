# DeepSeek-V2 支持 · 一条"命名兼容链"引发的跨版本排障（#1501）

> **Monkey Patch · Study Notes**
> PR [#1501](https://github.com/linkedin/Liger-Kernel/pull/1501) `[Feature] Support apply_liger_kernel_to_deepseek_v2`
> 2026-09-25 实现并验证 · 2026-10-05 合入（vaibhavjindal，merge `8343b3c`，11 files，+600/−3，**全程零评审意见**）
> linkedin/Liger-Kernel · Closes #129 · Supersedes #499 · 用户第 4 个合入的 Liger PR
> 配套底稿：`Liger-Kernel/dev/kaggle-dsv2-129/`（patch、kernel 脚本、两轮日志、PR body 草稿）

#1424 的姊妹篇：同样是模型支持 PR，但这次**没有任何基准数据**——技术风险全部集中在"版本差异"而不是"性能论证"。最有复盘价值的是一次本地永远无法复现的失败：**Kaggle 的旧版 transformers 抓出了 `LigerExperts` 命名兼容链的缺口**。

---

## 00 · 全景卡片

| 项 | 内容 |
|---|---|
| 动机 | issue **#129**（2024-08 开，`help wanted`，被 ByronHsu 列入官方 2024 Q4 Roadmap）；stale PR #499 已死（dirty，2025-03 后无活动） |
| 交付 | `model/deepseek_v2.py`（lce_forward，143 行）+ `apply_liger_kernel_to_deepseek_v2`（108 行）+ 测试 + README；**外加一处共享代码修复**（`swiglu.py` 命名链） |
| 合入 | 2026-10-05 18:55 UTC，merge `8343b3c`，零评论零 review —— correctness PR 无需基准表的判断被验证 |
| 关键数字 | Kaggle T4（torch 2.10 / **transformers 5.0.0**）：v1 **4 failed** → 修复 → v2 **13 passed / 0 failed**（含 v3/qwen3_moe 回归） |

---

## 01 · 需求真实性的四条证据（提 PR 前逐一核实）

"这个需求是不是真的"值得单独记一笔——最终报告用了四条独立证据，全部 API 现查：

1. **Issue 本体**：#129 开放，`help wanted` + `feature` 标签，发起人 tmm1（自己已经在 DeepSeek-Coder-V2-Lite 上手动 monkey-patch，是真实使用场景）；
2. **官方路线图背书（最硬）**：timeline 显示 2024-09-30 维护者 ByronHsu 把 #129 交叉引用进官方 "2024 Q4 Roadmap"——进过正式路线图，不是野生 wishlist；
3. **无竞争者**：标题含 deepseek_v2 的 PR 全库搜索 = 0；open 的 deepseek PR（#1387 V4 RoPE、#1264 V3.2）都不碰 V2；
4. **代码级痛点**：`_apply_liger_kernel_to_instance` 对未注册的 model_type 只打一条 INFO 日志（"no Liger kernels supported for model type: deepseek_v2"）就返回——用户用 `AutoLigerKernelForCausalLM` 加载 V2 系模型会**静默拿不到任何 kernel**。

---

## 02 · 版本考古：V2 与 V3 的三个实质差异（实现前逐一核实）

V2 在 transformers v5 里与 V3 逐类几乎相同（批量 experts、相同 forward 签名 `(hidden, top_k_index, top_k_weights)`、相同 norm 命名、router 不在 patch 面内）——所以实现是"V3 模板改名 + 接线"。真正的风险全在版本差异：

| 差异 | 事实 | 应对 |
|---|---|---|
| MoE 类名 | v4 叫 `DeepseekV2MoE`，**v5 改名 `DeepseekV2Moe`**（V3 保留 `DeepseekV3MoE` 未改名） | try/except 双名导入；instance 路径的 isinstance 用 sys.modules 直取的真类，不受测试 mock 影响 |
| 模块起点 | `deepseek_v2` 从 **v4.54** 才进 transformers（repo floor 是 4.52） | apply 函数内 import（不阻塞模块导入）+ docstring 注明 ≥ 4.54 |
| config 字段 | V2 config **没有** `rope_interleave`（V3 独有）；`mlp_bias` 默认 False | mini config 去掉该字段；`mlp_bias=True` 不支持写进 docstring |

另一个关键机制认知（来自读源码）：**`_patch_swiglu_module` 只 rebind `forward` / `_get_name`，不换 `__class__`** → 实例级 patch 的属性由 HF 自己的 `__init__` 设置，对 config 命名不敏感；**只有类替换（`modeling.X = LigerY`）后的未来构造路径才是 config-sensitive**。这个区别直接解释了第 03 章的症状。

---

## 03 · 排障主线：一条命名兼容链（本篇核心）

### 3.1 症状：本地全绿，Kaggle v1 四连挂

本地（transformers 5.16.1，CPU）：ruff 干净、v2/v3/v4 实例测试全过。Kaggle T4 v1 跑到建模阶段就崩：

```
E   AttributeError: 'DeepseekV2Config' object has no attribute 'num_local_experts'
```

4 个 `mini_deepseek_v2` 收敛测试全挂；v2/v3/v4 实例测试**通过**；v3 收敛测试**通过**。

### 3.2 机理链条

类替换路径下，`DeepseekV2Experts(config)` 的构造体被换成了 `LigerExperts.__init__`，它按命名链取专家数：

```python
if hasattr(config, "num_experts"):          # qwen3_moe, qwen3_next
    ...
else:                                       # mixtral, deepseek_v3
    self.num_experts = config.num_local_experts   # ← V2 两个名字都没有 → 崩
```

而 `DeepseekV2Config` 的专家数字段命名在版本间**漂移**过：

| transformers | V2 config 暴露 | V3 config 暴露 |
|---|---|---|
| 5.0.0（Kaggle 实装） | **只有 `n_routed_experts`** | `num_local_experts`（+`n_routed_experts` 别名） |
| 5.16.1（本地实装） | `num_experts` ⇄ `n_routed_experts` **真别名**（实测 setattr 一个另一个跟着变） | 同上，无 `num_experts` |

→ 本地 5.16.1 走第一分支（`num_experts` 存在）永远踩不到 else；Kaggle pip `install 'transformers>=4.52'` 解析到 **5.0.0**，只有 `n_routed_experts`，两个已知名字都 miss。

### 3.3 为什么实例测试过了而收敛测试挂

实例测试：`_patch_swiglu_module` 只 rebind forward → V2 实例属性（`num_experts`/`hidden_dim`/`intermediate_dim`/批量权重名）与 V3 **恰好同名**，forward 逻辑直接可用；
收敛测试：类替换后**从零构造**模型 → 走 `LigerExperts.__init__` → 命名链崩。
**两个测试覆盖的失败面不同：rebind 路径 vs 构造路径。**

### 3.4 修复与回归

共享 `swiglu.py` 加第三条分支（对既有用户零改变——前两个分支原样保留）：

```python
elif hasattr(config, "num_local_experts"):
    # mixtral, deepseek_v3 use num_local_experts
    ...
else:
    # deepseek_v2 on early transformers v5 uses n_routed_experts
    self.num_experts = config.n_routed_experts
```

因为动了共享代码，同一轮 Kaggle 回归把 `-k` 从 `deepseek` 扩成 `'deepseek or qwen3_moe'`——**qwen3_moe 踩第一分支、deepseek_v3 踩第二分支、deepseek_v2 踩新分支**，三个命名分支一次跑全。

> **教训**：跨版本命名兼容链是**隐式接口**——每一条 `elif` 都是一个"某版本某模型才走得到"的分支，新增分支必须让邻接分支的测试同轮跑过，否则你只是在"没弄坏我能看到的路径"。

---

## 04 · 验证矩阵与两个意外发现

| 环境 | torch / transformers | 结果 |
|---|---|---|
| 本地 CPU（快迭代） | — / 5.16.1 | 实例测试 3/3（v2/v3/v4）+ ruff |
| Kaggle T4 v1 | 2.10.0+cu128 / 5.0.0 | 4 failed（命名链崩，本章 03） |
| Kaggle T4 v2 | 同上 | **13 passed / 7 skipped / 0 failed**（4 条 V2 收敛 fp32/bf16 × FLCE/logits + 实例 + v3/qwen3_moe 回归；v4 测试 SKIP 因 5.0.0 无 `deepseek_v4` 模块） |

两个推翻旧认知的发现：

1. **T4 能跑 bf16**：torch 2.10 下 `supports_bfloat16()` 为 True，bf16 收敛测试在 T4 上真实执行并通过——#1424 时代"T4 无 bf16 tensor core 所以只能 fp16"的假设已过时，验证环境的结论也要重验；
2. **Kaggle pip 钉在旧版是资产不是劣势**：`transformers>=4.52` 在 Kaggle 解析到 5.0.0 而非最新——**版本敏感的命名 bug 恰好只有旧版能暴露**。本地最新版全绿 ≠ 用户真实环境 OK；一个"落后"的环境是最便宜的兼容性试金石。

---

## 05 · 为什么这次不放基准表（与 #1424 的对照决策）

#1424 需要显存/吞吐表，是因为它主张"训练更省更快"——性能主张必须数据支撑。#1501 是 **correctness PR**：主张是"patch 后与 HF 等价"，证据是收敛测试矩阵（等价性）+ 实例测试（接线完备性），repo 对模型支持 PR 的合并门槛就是这个（CI 本来就不在 PR 上自动跑 GPU 测试）。

PR body 里的处理：Testing Done 表如实列出（含 SKIP 项与原因），结尾主动 offer："Happy to add a memory/throughput table on A100 for DeepSeek-V2-Lite dims if reviewers find it useful."——**把加数据的开关递给评审者**。最终零评论合入，判断成立。真模型在哪都跑不动（V2 236B / V2-Lite 16B），mini 模型本来就是 repo 的标准验证方式。

---

## 06 · 流程纪律：不 push 分支也能跑真 GPU 验证

这次的约束是"commit/push 前必须过目 diff"（[[review-before-submit]]），但验证需要 GPU。解法：**把 patch 内嵌进 Kaggle 脚本**——

```text
git fetch --depth 1 origin <BASE_SHA>   # 钉死上游 commit
git apply <base64 内嵌 patch>            # 不产生任何本地 git 历史
pip install -e . && pytest -k ...
```

全程零 commit、零 push 就完成了真 GPU 验证；评审通过后才 commit/push。副作用收获：kernel v1 的 ERROR（pytest 退出码非零）不影响 `kaggle kernels output` 取日志——**失败的 run 也是完整的排障素材**。

并行的另一条线：我们的 JSD 修复 PR #1494 在 9-28 被上游同主题的 #1397 取代（对方还多覆盖了两个后端）→ 主动留言致谢并关闭。**上游速度很快，挂着的分支要定期看有没有被"顺手修掉"，被取代就体面让位**——#1494 的根因分析与 #1397 的方案同源，方向判断没错，只是慢了一步。

---

## 07 · 时间线

| 日期 | 事件 |
|---|---|
| 09-25 | 调研（需求四证据 + 版本考古）→ 实现 11 files → 本地全绿 → Kaggle v1 **4 failed** → 定位命名链 → 修复 + 扩回归 → v2 **13/0** 全绿 |
| 09-29 | #1494 被上游 #1397 取代 → 留言致谢并关闭；V2 PR body 交用户审 |
| 10-05 | 用户 approve body → rebase 到 9-28 main 批次（重叠仅 README + `__init__.py`，与预判一致）→ 开 PR #1501 → **当天被 vaibhavjindal 合入**（`8343b3c`），零评论 |
| 10-11 | 确认合并；删除本地 + fork 分支；#129 关闭确认 |

---

## 08 · 方法论清单

1. **模型支持 PR 的技术风险藏在版本差异里，不在算法里**：V3→V2 是 600 行含测试的"改名 + 接线"，真正的坑是类改名、模块起点、config 字段漂移——每一条都要在动手前用 installed source 现场核实，不靠记忆。
2. **共享代码的每条命名分支都要有测试踩到**：命名兼容链是隐式接口，新增 `elif` 时把邻接分支的模型加进同一轮回归。
3. **instance 测试与构造路径测试覆盖不同失败面**：rebind（forward 换绑）vs class-swap（未来构造）要分开想清楚哪个路径 config-sensitive。
4. **本地最新版全绿 ≠ 兼容**：保留一个"落后"环境（Kaggle 免费榜）做版本敏感 bug 的试金石；Kaggle pip 钉在 5.0.0 这件事要写进肌肉记忆。
5. **老假设要重验**："T4 不能跑 bf16"在 torch 2.10 时代已不成立。
6. **correctness PR 不需要基准表，但要主动 offer**：Testing Done 如实列（含 SKIP），把"要不要 A100 表"的开关递给评审者。
7. **不 push 也能跑 GPU 验证**：pinned SHA + 内嵌 patch 的 kernel 模式，与"提交前过目"纪律完全兼容。
8. **盯上游**：同主题修复随时可能落地；被取代就体面关闭并致谢，不硬蹭 rebase。

---

## 参考

1. PR #1501: Support apply_liger_kernel_to_deepseek_v2 — <https://github.com/linkedin/Liger-Kernel/pull/1501>（merge `8343b3c` by vaibhavjindal）
2. Issue #129: [feat] support for DeepseekV2 — <https://github.com/linkedin/Liger-Kernel/issues/129>（2024 Q4 Roadmap 交叉引用）
3. PR #499（被取代的 stale V2 PR）、PR #1397 / #1433（上游 JSD 修复批次，#1494 让位）
4. 姊妹篇：`liger-pr1424-deepseek-v3.md`（模板来源 + 基准方法论）
5. 本地产物：`dev/kaggle-dsv2-129/`（deepseek_v2_support.patch、run_tests.py 内嵌 kernel、v1/v2 日志、pr-body-draft.md）

---

*LIGER-KERNEL · PR #1501 · STUDY NOTES · 2026-10*
