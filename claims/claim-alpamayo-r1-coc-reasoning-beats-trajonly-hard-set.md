---
id: claim-alpamayo-r1-coc-reasoning-beats-trajonly-hard-set
title: "Alpamayo-R1 论文声称：CoC 因果链推理微调在挑战集上 minADE6@6.4s 0.868m，较仅轨迹微调 0.994m 提升 12%（0.5B，含 route 输入）"
type: claim
status: asserted
scope: "Alpamayo-R1 0.5B（base model 先在内部 𝒟_overall 预训练并注入动作模态；0.5B 底座具体型号笔记未载，笔记 §6.4 仅记 0.5B 'uses a smaller backbone'）；对比为同底座三种微调：仅轨迹 / meta-action+轨迹 / CoC 推理+轨迹；评测为自建 CoC 挑战集 𝒟_hard（held-out，含 route 输入，预测时域 6.4s，minADE6）；数据来自 NVIDIA 内部 80,000 小时 geo-fenced 车队数据；数字为论文自报（arXiv:2511.00088v2 TABLE 6/7）"
tags: [end-to-end-driving, vla, alpamayo-r1, chain-of-causation, reasoning]
note: library/VLM_VLA/Alpamayo-R1.md#3-实验
paper: "arXiv 2025, Alpamayo-R1: Bridging Reasoning and Action Prediction for Generalizable Autonomous Driving in the Long Tail (arXiv:2511.00088)"
stance: watch
evidence:
  - source: library/VLM_VLA/Alpamayo-R1.md
    locator: "§3.2 / TABLE 7（AR1 行，挑战集）"
    quote: "| 3 | Ft. w/ CoC & Traj. (AR1) | «\\checkmark» | 0.5B | 0.290 | 0.868 |"
    relation: supports
  - source: library/VLM_VLA/Alpamayo-R1.md
    locator: "§3.2 / TABLE 7（仅轨迹行，挑战集）"
    quote: "| 1 | Ft. w/ Traj. | «\\checkmark» | 0.5B | 0.315 | 0.994 |"
    relation: supports
  - source: library/VLM_VLA/Alpamayo-R1.md
    locator: "§3.2 / §6.2 读数原句"
    quote: "In challenging scenarios, the improvements are even larger, with AR1 achieving 0.868m, a 12% improvement over the trajectory-only baseline (0.994m)."
    relation: supports
  - source: library/VLM_VLA/Alpamayo-R1.md
    locator: "§3.2 / TABLE 6（常规集含 route 行 12 与行 10）"
    quote: "| 12 | + Ft. w/ CoC & Traj. (AR1) | «\\checkmark» | 0.5B | 0.254 | 0.794 |"
    relation: supports
  - source: https://arxiv.org/abs/2511.00088
    locator: "Abstract（abs 页，2026-11-03 抓取）"
    quote: "up to a 12% improvement in planning accuracy on challenging cases compared to a trajectory-only baseline"
    relation: supports
falsifiers:
  - "跨条件迁移检查（𝒟_hard 与 CoC 数据均为内部、未公开，同范围复现不可行；本条不判原命题伪，只判外推）：用公开权重（Alpamayo-R1-10B 或后续开源配方）在公开数据上重做「CoC 微调 vs trajectory-only」对照，minADE6 增益显著小于 12% 或为负"
  - "发现 12% 增益主要来自 CoC 数据量更大/标注更干净（而非推理结构本身），控制数据变量后增益消失"
  - "挑战集评测协议（关键帧选取、geo-fence 划分）不可复现，𝒟_hard 划分方式使对比偏向 CoC 版本"
  - "原文核查：论文其他版本（v1，2025-10-30）或勘误中 TABLE 6/7 数字与本卡所引不一致"
review_due: 2026-12-03
related: [claim-alpamayo-r1-rl-consistency-reward-gains, claim-alpamayo-r1-10b-physicalai-av-public-snapshot, claim-onevl-latent-cot-surpasses-explicit-four-benchmarks, claim-opendrivevla-autoregressive-waypoint-planning-nuscenes]
signoff: null
---

## 我的理解

论文声称：以「决策闭集 + 因果因素开集 + 关键帧切分历史/未来」的 Chain of Causation 结构化推理数据做 SFT，在 0.5B 模型上带来开环规划增益——挑战集 𝒟_hard 上 minADE6@6.4s 0.868m vs 仅轨迹微调 0.994m（12%）；常规集含 route 输入时 0.794m vs 0.834m（4.8%）；meta-action（弱推理）中间档 0.928m。增益随场景难度上升（论文定位是长尾/安全关键场景）。

三条必须记住的限定：
1. 对照基线是**自家 trajectory-only 版本**，不是外部 SOTA；12% 是「加推理」的增益，不是「超过业界」的排位。
2. 全部数字来自内部数据（80,000 小时、geo-fenced）与自建 CoC 评测集；公开可复现的只有 PhysicalAI-AV 644 例 / AlpaSim 公开 920 场景 / LingoQA 三处（前两处见本组快照卡 claim-alpamayo-r1-10b-physicalai-av-public-snapshot；LingoQA 本组未建卡）。
3. 谱系：论文 §2.1 引用并批评 OpenDriveVLA 一类自回归反应式 VLA "largely operate reactively without explicit reasoning"，但未在公开基准上与其比数字；OneVL 则复用本文 checkpoint 生成 CoT 标签并把 Alpamayo-R1 列为其第四个 benchmark。

## 待验证

- HF 权重（nvidia/Alpamayo-R1-10B，gated）+ alpamayo-recipes 的 SFT 配方，在 PhysicalAI-AV 上复现「CoC vs 无 CoC」的差值（需自建 trajectory-only 对照）。
- 核对 𝒟_hard 的构建协议（论文 §6.1）是否公开足够细节以复现划分。
- 用 OneVL 论文的 Table 5（Alpamayo-R1 benchmark）交叉检验 0.5B 量级在该数据上的成绩量级。

## 若成立 / 不成立意味着什么

成立：结构化因果推理数据是驾驶 VLA 在长尾场景的主要杠杆，值得投入标注管线。
不成立：增益是数据工程假象，则 CoC 管线降级为普通数据清洗。

## 核查记录

- 2026-11-05 表达整理（P1-B3b 班）：scope 原写「Cosmos-Reason 谱系 VLM 底座」无笔记依据（笔记 §6.4 对 0.5B 仅记 "uses a smaller backbone"，底座具体型号未载；笔记 ⚠⑥ 的「主模型（Cosmos-Reason 底座）」仅对 10B 成立，TABLE 11 亦记 Cosmos-Reason-7B）→ 改为如实未载；正文「分别见本组另两张卡」与实际不符（三处公开评测中 LingoQA 本组无卡）→ 修正指向；falsifier 第 1 条标注为跨条件迁移（内部数据不可同范围复现），新增原文核查条。数字未改写。
