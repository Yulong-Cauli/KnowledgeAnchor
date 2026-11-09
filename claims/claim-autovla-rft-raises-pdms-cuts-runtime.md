---
id: claim-autovla-rft-raises-pdms-cuts-runtime
title: "AutoVLA 论文声称：GRPO 强化微调（CoT 长度惩罚）实现自适应推理——NAVSIM PDMS 80.54→89.11（+10.6%）且平均推理时长 −66.8%（500 场景均值）"
type: claim
status: asserted
scope: "NAVSIM 测试集（nuPlan navtest，12.1k 测试样本）；AutoVLA arXiv v3（arXiv:2506.13757，html/2506.13757v3）；对比 RFT 前（SFT，One-shot）与 RFT 后（Post-RFT：GRPO，驾驶奖励=PDMS（Eq. S3），CoT 长度惩罚 r_CoT 权重 λ_r=0.3，LoRA rank/alpha=8，6000 步，navtrain split）；runtime 为 500 测试场景平均；论文自报数字。边界：Post-RFT PDMS 89.11 在 Table 1 中仍低于 TrajHF 93.95 / Centaur 92.10 / Hydra-MDP 91.26，非榜单第一；Best-of-N 92.12 依赖 oracle 打分器（§4.2），与本卡无关"
tags: [end-to-end-driving, vla, reinforcement-fine-tuning, grpo, navsim, nuplan, adaptive-reasoning, autovla]
note: library/ADe2e/AutoVLA.md#33-navsim-nuplan-开环结果
paper: "NeurIPS 2025, AutoVLA: A Vision-Language-Action Model for End-to-End Autonomous Driving with Adaptive Reasoning and Reinforcement Fine-Tuning (arXiv:2506.13757)"
stance: watch
evidence:
  - source: library/ADe2e/AutoVLA.md
    locator: "§3.3（§4.2 RFT 增益原句）"
    quote: "RFT yields a 10.6% improvement in PDMS (on the NAVSIM testing set) and a 66.8% reduction in runtime (average over 500 testing scenarios)."
    relation: supports
  - source: library/ADe2e/AutoVLA.md
    locator: "§3.3 / Table 1（AutoVLA One-shot 行）"
    quote: "| AutoVLA (One-shot) | 80.54 | 96.89 | 92.42 | 94.43 | 75.82 | 88.06 | 99.94 |"
    relation: supports
  - source: library/ADe2e/AutoVLA.md
    locator: "§3.3 / Table 1（AutoVLA Post-RFT 行）"
    quote: "| AutoVLA (Post-RFT) | 89.11 | 98.41 | 95.64 | 95.40 | 81.87 | 98.04 | 99.94 |"
    relation: supports
  - source: library/ADe2e/AutoVLA.md
    locator: "§2.6（§3.4 CoT 长度惩罚动机原句）"
    quote: "To discourage unnecessary long reasoning chains, we incorporate a CoT length penalty"
    relation: supports
  - source: library/ADe2e/AutoVLA.md
    locator: "§3.3 / Table 2（快/慢思考运行时，s）"
    quote: "| Fast Thinking | 0.997 | 1.116 | 1.072 |"
    relation: supports
falsifiers:
  - "复现 RFT（同 navtrain 数据、GRPO + PDMS 奖励 + λ_r=0.3）：navtest 上 PDMS 相对 One-shot 提升不足 10.6% 或反而下降"
  - "同 500 测试场景口径复测平均推理时长：RFT 后削减不足 66.8%"
  - "消融 CoT 长度惩罚（λ_r=0，其余不变）：PDMS 提升保留但 runtime 不降——说明 runtime 收益不来自'自适应削减不必要推理'，机制归因错误"
review_due: 2026-12-03
related: [claim-autovla-action-tokens-beat-text-waypoints]
signoff: null
---

## 我的理解

论文声称：在 SFT 之上用 GRPO 做强化微调，奖励 = PDMS 驾驶奖励 − λ_r·r_CoT（CoT 长度惩罚，sigmoid 形式，容忍阈值 L_tol=400），使模型学会"该快则快、该慢则慢"的自适应推理——NAVSIM 上 PDMS 从 80.54（One-shot）升到 89.11（Post-RFT，+10.6%），同时 500 场景平均推理时长减少 66.8%（§4.2，arXiv v3）。背景数字：快/慢两模式平均单次推理 1.072 s vs 10.518 s（Table 2），差约一个数量级，这是"削减不必要推理"可换来的收益空间。

边界与措辞（遵守笔记 ⚠ 注记）：
1. 本卡不引 §1 "superior performance" 表述：Post-RFT 89.11 在 Table 1 中低于 TrajHF（93.95）/Centaur（92.10）/Hydra-MDP（91.26），本卡只主张"RFT 相对自身 SFT 基线的 PDMS 与 runtime 双改善"，不主张 SOTA。
2. +10.6% 与 Table 1 的 80.54→89.11（+10.6% 相对值）核对一致；runtime −66.8% 的原始对比基准（RFT 前慢思考平均 10.518 s × 0.332 ≈ 3.5 s）笔记未给出逐场景分解，复现时按 500 场景均值口径对账。
3. 笔记 TODO 注明 Table S3 两行同名 DriveTraj 照抄待核——本卡不引用 Table S3（Waymo），不受影响。

## 待验证

- 用官方 RFT 配置（若 checkpoint/推理数据可得；推理数据 GitHub Release Plan 标 TBD）复现 PDMS +10.6% 与 runtime −66.8%。
- λ_r=0 消融：分离"PDMS 增益"与"runtime 削减"是否同源于 CoT 长度惩罚。

## 若成立 / 不成立意味着什么

成立（目前只是论文声称）：RL 后训练 + 推理长度惩罚可以让 VLA 驾驶模型同时提分提速，"自适应推理时刻"是比固定 CoT 或双模块双过程更省的方案。
不成立：则 runtime 收益可能来自别的因素（采样参数、输出截断），GRPO 的归因失效；NAVSIM 上该增益与其他模型的差距（仍输 TrajHF 4.8 分）也会让该方法吸引力下降。
