---
id: claim-caddn-joint-training-beats-frozen-depth-branch
title: "CaDDN 消融自报：端到端联合训练比先训后冻结的分步训练高 +2.97% AP（同结构、Hard 选择）"
type: claim
status: asserted
scope: "CaDDN（CVPR 2021）深度估计策略消融，笔记 §4 Table 4 Exp 3 vs Exp 4；双方均为 CaDDN 结构、外积均用 Hard 选择，仅深度分支训练方式不同（先训好并冻结 vs 与检测头端到端联合）；单目 3D 检测；笔记未标注数据集与 AP 指标版本，数字为论文自报相对增量"
tags: [caddn, monocular-3d, joint-training, end-to-end, depth-distribution, ablation]
note: library/Classical_Detection/CaDDN.md#4-消融实验
paper: "CVPR 2021, CaDDN: Categorical Depth Distribution Network for Monocular 3D Object Detection"
stance: watch
evidence:
  - source: library/Classical_Detection/CaDDN.md
    locator: "§4 / Table 4 Exp 4"
    quote: "对比 Exp 4 vs 3：证明**联合训练**有效 (+2.97% AP)，因为深度模块会为了适应检测任务而优化。"
    relation: supports
  - source: library/Classical_Detection/CaDDN.md
    locator: "§4 / Table 4 Exp 3"
    quote: "**CaDDN 分步训练版** 使用 CaDDN 的结构，但是**先把深度分支训练好，冻结参数**，再训练检测头。"
    relation: supports
  - source: library/Classical_Detection/CaDDN.md
    locator: "§4 / 结论要点"
    quote: "通用的深度估计网络（BTS/DORN）不如专门为了检测任务而联合训练的网络 (Table 4 Exp 4 vs 1/2)。"
    relation: supports
falsifiers:
  - "复现 Table 4 Exp 3 vs Exp 4：分步冻结训练与联合训练的差距显著低于 +2.97% AP，或分步反超联合"
  - "以预训练 SOTA 深度估计网络（BTS/DORN 或现成深度图）固定输入的两阶段基准反超联合训练版（这会推翻笔记转述的 Exp 4 vs 1/2 结论）"
  - "笔记转载数字与原论文 Table 4 不符"
review_due: 2026-12-02
related: [claim-caddn-soft-depth-distribution-beats-hard-argmax, claim-caddn-depth-supervision-dominant-ablation-gain, claim-caddn-lid-discretization-beats-uniform]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：Table 4 中 Exp 3（CaDDN 分步训练版：先把深度分支训练好、冻结参数，再训检测头）与 Exp 4（端到端联合训练）同为 CaDDN 结构、同用 Hard 选择，联合训练高 +2.97% AP，原因是深度模块会为适应检测任务而优化。笔记还转述论文进一步结论：联合训练版优于用预训练 BTS/DORN 深度图固定输入的两阶段基准（Exp 4 vs 1/2），即"通用的深度估计网络不如专门为检测任务联合训练的网络"——注意笔记对该对比只给定性结论，未给具体数字。

笔记未标注数据集与 AP 口径，+2.97% 为论文自报相对增量。硬选择（Hard）下的联合增益与本卡对应；Soft 分布自身的增益另见姊妹卡（Exp 5 vs 4，+2.96% AP）。

## 待验证

- 用 OpenPCDet 复现 Exp 3 vs Exp 4，核对 +2.97% AP。
- 构造 BTS/DORN（或现成 SOTA 深度图）冻结输入的两阶段基线，验证是否确实不敌联合训练版。
- 确认分步训练细节与论文一致（深度分支是否用同样的 $L_{depth}$ 训练、冻结哪些参数）。

## 若成立 / 不成立意味着什么

成立：深度分支应与检测头端到端联合训练；"预训练深度图当输入"的两阶段路线在同等结构下是次优，方案设计时不必为先训一个 SOTA 深度网络额外投入。
不成立：联合训练优势不可复现或依赖超参，则模块化两阶段（复用现成深度估计器）重新成为合理选型。
