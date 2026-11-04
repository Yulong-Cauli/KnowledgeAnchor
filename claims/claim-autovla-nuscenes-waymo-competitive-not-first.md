---
id: claim-autovla-nuscenes-waymo-competitive-not-first
title: "AutoVLA 论文自报的开环表现为 competitive 而非榜首：NAVSIM Post-RFT PDMS 89.11 低于 TrajHF 93.95（Table 1，Best-of-N 92.12 亦然且依赖 oracle 选优）；nuScenes（UniAD 口径）avg.Col. 0.31% 劣于 OpenDriveVLA-3B 的 0.30%（Table S2）；Waymo E2E 挑战榜（截至 2025-05-22）RFS Overall 7.5566 列所录 17 行第 5、RFS Spotlight 6.9436 为所录最高（Table S3）"
type: claim
status: asserted
scope: "AutoVLA arXiv v3（arXiv:2506.13757，html/2506.13757v3），三张表的快照口径：① Table 1 = NAVSIM（nuPlan navtest，12.1k 测试样本，PDMS 越高越好），引 Post-RFT 与 Best-of-N 行（RFT 增益与 runtime 另有专卡）；② Table S2 = nuScenes 开环规划（ST-P3 与 UniAD 双协议并存、1/2/3s 分列不平均，Appendix E.2 'We follow the UniAD protocol'），本卡引 UniAD 口径 avg.L2/avg.Col.（w/ CoT 行）；③ Table S3 = Waymo Vision-based End-to-End Driving Challenge leaderboard，论文限定 'As of May 22, 2025'，按论文所录 17 行计名次；⚠ 原表存在两行同名 DriveTraj（RFS Overall 7.4957 与 7.2787，笔记照抄待核），本卡不引该两行（两行数字均低于 AutoVLA，不影响第 5 名次）；'competitive / 部分基准第一'为论文自述措辞 + 笔记事实核对的合并口径；论文自报数字，尚未独立验证"
tags: [autovla, vla, end-to-end-driving, nuscenes, waymo, navsim, benchmark-snapshot]
note: library/ADe2e/AutoVLA.md#34-waymo-e2e-结果
paper: "NeurIPS 2025, AutoVLA: A Vision-Language-Action Model for End-to-End Autonomous Driving with Adaptive Reasoning and Reinforcement Fine-Tuning (arXiv:2506.13757)"
stance: watch
evidence:
  - source: library/ADe2e/AutoVLA.md
    locator: '§3.3 / Table 1（NAVSIM，逐字行）'
    quote: '| TrajHF [85] | 93.95 | 99.30 | 97.51 | 91.72 | 90.39 | 98.02 | 99.81 |'
    relation: supports
  - source: library/ADe2e/AutoVLA.md
    locator: '§3.3 / Table 1（NAVSIM，逐字行）'
    quote: '| AutoVLA (Post-RFT) | 89.11 | 98.41 | 95.64 | 95.40 | 81.87 | 98.04 | 99.94 |'
    relation: supports
  - source: library/ADe2e/AutoVLA.md
    locator: '§3.3 / Table 1（NAVSIM，逐字行）'
    quote: '| AutoVLA (Best-of-N) | 92.12 | 99.14 | 97.08 | 95.51 | 87.55 | 97.12 | 99.98 |'
    relation: supports
  - source: library/ADe2e/AutoVLA.md
    locator: '§1 概述 ⚠ 措辞提示'
    quote: 且 Table 1 中 Post-RFT PDMS（89.11）低于 TrajHF（93.95）、Centaur（92.10）、Hydra-MDP（91.26），Table S2 nuScenes 上低于 EMMA 与 OpenDriveVLA-3B 的多项指标
    relation: supports
  - source: library/ADe2e/AutoVLA.md
    locator: '§3.3 评测方式（§4.2 原句注记）'
    quote: best-of-N 用 oracle 打分器，非纯在线能力
    relation: supports
  - source: library/ADe2e/AutoVLA.md
    locator: '§3.6 / Table S2（nuScenes，UniAD 口径，逐字行）'
    quote: '| AutoVLA (w/ CoT) | 0.21 | 0.38 | 0.60 | 0.40 | 0.13 | 0.18 | 0.28 | 0.20 | 0.28 | 0.66 | 1.16 | 0.70 | 0.14 | 0.25 | 0.53 | 0.31 |'
    relation: supports
  - source: library/ADe2e/AutoVLA.md
    locator: '§3.6 / Table S2（nuScenes，UniAD 口径，逐字行）'
    quote: '| OpenDriveVLA-3B [34] | 0.14 | 0.30 | 0.55 | 0.33 | 0.02 | 0.07 | 0.22 | 0.10 | 0.19 | 0.58 | 1.24 | 0.67 | 0.02 | 0.18 | 0.70 | 0.30 |'
    relation: supports
  - source: library/ADe2e/AutoVLA.md
    locator: '§3.4 / Table S3（Waymo leaderboard，逐字行）'
    quote: '| AutoVLA | 7.5566 | 2.9580 | 1.3507 | 6.9436 |'
    relation: supports
  - source: library/ADe2e/AutoVLA.md
    locator: '§3.4 排名事实核对'
    quote: RFS Overall 7.5566 低于 Poutine/HMVLM/UniPlan/DiffusionLTF 四行，RFS Spotlight 6.9436 为所列 17 行中最高
    relation: supports
  - source: library/ADe2e/AutoVLA.md
    locator: 'TODO 节（Table S3 DriveTraj 待核注记）'
    quote: 'Table S3（Waymo leaderboard）原文表中出现两行同名 "DriveTraj"（RFS Overall 7.4957 与 7.2787），本笔记照抄未做合并/解释，是否为同一方法两次提交未核实。'
    relation: supports
  - source: https://arxiv.org/html/2506.13757v3
    locator: 'Appendix F.3（arXiv HTML v3，2026-11-03 抓取）'
    quote: As of May 22, 2025, AutoVLA achieves competitive performance on the Waymo End-to-End Driving Challenge leaderboard
    relation: supports
  - source: https://arxiv.org/html/2506.13757v3
    locator: 'Appendix F.3（arXiv HTML v3，2026-11-03 抓取）'
    quote: The model ranks highly in both RFS Overall and ADE metrics and achieves the top score in the RFS Spotlight metric
    relation: supports
  - source: https://arxiv.org/html/2506.13757v3
    locator: '§4.2（arXiv HTML v3，2026-11-03 抓取）'
    quote: Overall, AutoVLA achieves competitive results while demonstrating scalability across diverse datasets.
    relation: supports
  - source: https://arxiv.org/html/2506.13757v3
    locator: 'Table S3（arXiv HTML v3 去标签文本，2026-11-03 抓取）'
    quote: AutoVLA 7.5566 2.9580 1.3507 6.9436
    relation: supports
  - source: https://arxiv.org/html/2506.13757v3
    locator: 'Table S2（arXiv HTML v3 去标签文本，2026-11-03 抓取）'
    quote: AutoVLA (w/ CoT) 0.21 0.38 0.60 0.40 0.13 0.18 0.28 0.20 0.28 0.66 1.16 0.70 0.14 0.25 0.53 0.31
    relation: supports
falsifiers:
  - "Waymo leaderboard 同期或后续复核显示 AutoVLA 的 RFS Overall 高于 Poutine（7.9860）/HMVLM（7.7367）/UniPlan（7.6925）/DiffusionLTF（7.5919）任一档，即 Overall 并非第 5（或所录 17 行名次口径有误）"
  - "nuScenes 复评或论文勘误显示 AutoVLA (w/ CoT) 的 UniAD 口径 avg.Col. 低于 OpenDriveVLA-3B 的 0.30%，或 avg.L2 实际优于 OpenDriveVLA-3B 的 0.67（本卡「两项均劣于」的表述不成立）"
  - "NAVSIM 复现中 Post-RFT PDMS ≥ TrajHF 的 93.95，或 Best-of-N 在无 oracle 打分器的在线设定下仍达 92.12"
  - "查得论文其他版本（v1/v2）或 NeurIPS camera-ready 中三张表数字与上述不一致"
review_due: 2026-12-03
related: [claim-autovla-rft-raises-pdms-cuts-runtime, claim-autovla-action-tokens-beat-text-waypoints]
signoff: null
---

## 我的理解

这张卡是 AutoVLA 的"表现定位"诚实注记卡：论文 §1 自称 "superior performance across various benchmarks"，但三张表的实际相对位置是 competitive / 部分指标第一，笔记 ⚠ 已做事实核对，本卡把核对结论钉成可证伪主张：

1. **NAVSIM（Table 1）**：Post-RFT 89.11 在表中非 AutoVLA 方法里列第 4（高于它的只有 TrajHF 93.95 / Centaur 92.10 / Hydra-MDP 91.26；表中另一更高行 Best-of-N 92.12 是 AutoVLA 自身，若按全部行计名次则列第 5）；Best-of-N 92.12 也不是第一，且依赖 oracle 打分器从 6 个候选里选优（§4.2），不能当在线能力引用。RFT 自身带来的 80.54→89.11 增益是另一码事，见 related RFT 专卡。
2. **nuScenes（Table S2）**：UniAD 协议口径（1/2/3s 分列不平均）下 AutoVLA (w/ CoT) avg.L2 0.70 m 好于 UniAD 的 1.03、与碰撞率 0.31% 持平，但两项都劣于 OpenDriveVLA-3B（0.67 / 0.30）；ST-P3 口径下劣于 VAD 与 EMMA（L2）。结论：nuScenes 上无一项全面领先。
3. **Waymo（Table S3）**：截至 2025-05-22 的挑战榜所录 17 行中，RFS Overall 7.5566 列第 5（低于 Poutine/HMVLM/UniPlan/DiffusionLTF），论文最响的卖点是 RFS Spotlight 6.9436 为所录最高——论文自己用的措辞也是 "ranks highly" + "top score in the RFS Spotlight metric"，而非 Overall 第一。

⚠ 口径警告：Table S3 原表有两行同名 DriveTraj（RFS Overall 7.4957 / 7.2787），笔记照抄待核，本卡不引该两行；两者均低于 AutoVLA，即便日后合并/更正也不改变"第 5 / Spotlight 第一"的名次结论。引用本表其余行时同样建议避开这两行直到查清。

三张表的 AutoVLA 行数字与 "As of May 22, 2025"、"top score in the RFS Spotlight"、"Overall, AutoVLA achieves competitive results" 等句已于 2026-11-03 实抓 arXiv HTML v3（https://arxiv.org/html/2506.13757v3 ）逐字复核命中。

## 待验证

- 在 Waymo 网站核对 2025-05-22 前后的 challenge leaderboard 快照，确认 17 行名次与 RFS Spotlight 最高分归属。
- 用官方 checkpoint（2026/05 已发布）在 nuScenes val 复跑 Table S2 的 UniAD 口径指标，核对 0.70/0.31。
- 查清 Table S3 两行同名 DriveTraj 是否为同一方法两次提交（转 QUESTIONS 由人工决定是否需要向作者/榜方求证）。

## 若成立 / 不成立意味着什么

成立：AutoVLA 的正确引用姿势是"competitive + RFT 效率卖点 + Waymo Spotlight 榜内第一"，任何"SOTA VLA 驾驶模型"的笼统说法都不成立；做 VLA 驾驶选型对比时应逐基准逐口径引用（NAVSIM/nuScenes 双协议/Waymo 榜）。
不成立：三表中任一基准 AutoVLA 实为榜首（或名次核对有误），则笔记 ⚠ 与本卡的"非榜首"定位需反转，"superior performance" 的论文自述反而成立，本卡作废并需审计 related 两卡的表述边界。

## 核查记录

- 2026-11-05 表达整理（P1-B3b 班）：修正 falsifier 第 2 条的反向措辞（原句「avg.L2 0.70 优于其 0.67 的表述有误」的语义与本卡「两项均劣于」的主张方向相反）；正文「列第 4」限定为「非 AutoVLA 方法中列第 4」（表中 Best-of-N 92.12 为 AutoVLA 自身行）。除该措辞外数字未改写。
- 2026-11-05 实抓复核 https://arxiv.org/html/2506.13757v3 ：五条外部 quote（Appendix F.3 两句、§4.2 一句、Table S3 / Table S2 线性化行）逐字命中；Table S3 确为 17 行、AutoVLA RFS Overall 7.5566 列第 5（高于 Poutine 7.9860 / HMVLM 7.7367 / UniPlan 7.6925 / DiffusionLTF 7.5919 四行）、两行同名 DriveTraj（7.4957 / 7.2787）在案且均低于 AutoVLA，名次结论维持。
