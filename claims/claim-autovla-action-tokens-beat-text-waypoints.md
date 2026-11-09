---
id: claim-autovla-action-tokens-beat-text-waypoints
title: "AutoVLA 论文声称：物理动作 token 输出优于文本 waypoint 输出——同批混训模型开环对比 PDMS 80.54 vs 71.31、Runtime 3.95 vs 7.65 s（Table 5）"
type: claim
status: asserted
scope: "AutoVLA arXiv v3（arXiv:2506.13757，html/2506.13757v3）；nuPlan+nuScenes 混合训练集 SFT 模型（Qwen2.5-VL-3B 骨干，2048 K-disk 动作 codebook，K-disk 聚类自 WOMD）；同批模型改输出接口对比：Physical Action（动作 token，0.5s/Token，5s 时域 10 token）vs Text Waypoint（语言模型直接生成文本数值 waypoint）；指标 PDM Score（NAVSIM 口径）、Avg L2（m）、Avg Col.（%）、Runtime（s）；论文自报数字"
tags: [end-to-end-driving, vla, action-tokenization, nuplan, nuscenes, autovla]
note: library/ADe2e/AutoVLA.md#38-动作-token-化消融
paper: "NeurIPS 2025, AutoVLA: A Vision-Language-Action Model for End-to-End Autonomous Driving with Adaptive Reasoning and Reinforcement Fine-Tuning (arXiv:2506.13757)"
stance: watch
evidence:
  - source: library/ADe2e/AutoVLA.md
    locator: "§3.8 / Table 5（PDM Score 行）"
    quote: "| PDM Score↑ | 71.31 | 80.54 |"
    relation: supports
  - source: library/ADe2e/AutoVLA.md
    locator: "§3.8 / Table 5（Avg. L2 行）"
    quote: "| Avg. L2 (m)↓ | 0.89 | 0.70 |"
    relation: supports
  - source: library/ADe2e/AutoVLA.md
    locator: "§3.8 / Table 5（Runtime 行）"
    quote: "| Runtime (s)↓ | 7.65 | 3.95 |"
    relation: supports
  - source: library/ADe2e/AutoVLA.md
    locator: "§3.8（§4.3 正文结论原句）"
    quote: "The results, shown in Table 5, indicate that our action tokenization and generation method significantly outperforms the text-based waypoint prediction approach."
    relation: supports
  - source: library/ADe2e/AutoVLA.md
    locator: "§2.2（轨迹 token 化的机制原句，§3.1）"
    quote: "This transforms the planning task into a next-token prediction problem, which can be conducted within the language model."
    relation: supports
falsifiers:
  - "同数据同骨干复现：text waypoint 输出的 PDM Score ≥80.5 或 Runtime ≤4 s（差距消失或反转）"
  - "text waypoint 的 Avg L2 不劣于动作 token（论文声称 0.89 vs 0.70 m）"
  - "差距主要由 prompt 模板/解码超参等非输出接口因素造成，控制后 Table 5 差距不显著"
review_due: 2026-12-03
related: [claim-autovla-rft-raises-pdms-cuts-runtime]
signoff: null
---

## 主张

论文声称：把连续轨迹离散为 2048 个 K-disk 动作 token（每 token = 0.5s 的 Δx/Δy/Δθ 位移+朝向变化）加入 VLM 词表、让模型直接自回归输出动作 token 再解码轨迹，比让语言模型直接生成文本数值 waypoint 更准且更快——同批 nuPlan+nuScenes 混训模型上 PDM Score 80.54 vs 71.31、Avg L2 0.70 vs 0.89 m、Avg Col. 0.31 vs 0.36、Runtime 3.95 vs 7.65 s（Table 5，arXiv v3）。论文归因：文本解码数值的计算开销大、"This shows the limitation of language models in handling precise numerical reasoning."（§4.3）。

边界与限定：
1. 本卡不引用 §1 的 "superior performance" 表述——笔记 ⚠ 注记指出该措辞与 Table 1/S2/S3 多处"非第一"矛盾（如 NAVSIM 上 Post-RFT 89.11 < TrajHF 93.95）；本卡主张仅限"同模型下动作 token 优于文本 waypoint"这一受控对比。
2. token 化方法内部的对比是另一维度：K-disk PDMS 80.54 vs FAST(DCT) 67.63（Table 6）；80.54 同时出现在 Table 1 One-shot / Table 5 Physical Action / Table 6 K-disk，三处口径一致（SFT 一次性输出，无 RFT）。
3. 笔记 TODO 注明 Table S3（Waymo leaderboard）有两行同名 DriveTraj 照抄待核——本卡不引用 Table S3，不受影响。

## 待验证

- 复现 Table 5：同一 SFT checkpoint 分别接动作 token 解码头与文本 waypoint 解码头，核对四项指标。
- 核对 80.54 在 Table 1/5/6 三处确为同一配置（防止版本间数字漂移）。

## 成立/不成立的含义

成立：VLA 驾驶模型的动作接口应优先物理动作 token 化而非文本数值回归——对 Qwen2.5-VL 类骨干的选型与训练目标设计有直接指导意义。
不成立：则"语言模型做精确数值推理的局限"论证被削弱，文本 waypoint 路线（如部分 VLM 方案）重新可行，Table 5 的 runtime 优势也需另找原因（如输出长度）。
