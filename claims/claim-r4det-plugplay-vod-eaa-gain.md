---
id: claim-r4det-plugplay-vod-eaa-gain
title: "R4Det 声称：其模块即插即用挂到 BEVFusion / RCBEVDet 上，在 VoD 的 mAP_EAA 分别 +6.34% / +5.34%"
type: claim
status: asserted
scope: "VoD 数据集；宿主模型为 BEVFusion 与 RCBEVDet（各自叠加 R4Det 模块）；指标 mAP_EAA——笔记与 nightshift/cross/4d-radar.md M1 均未定义其口径，数值不可与其他论文的 VoD 结果（mAP_DC / EAA AP / RoI AP）横向比较；+6.34% / +5.34% 是百分比还是绝对点，笔记未注明；R4Det 自报数字，尚未独立验证；单源结论（cross 文档 C5，其余 4D 雷达笔记无对应迁移实验）"
tags: [4d-radar, radar-camera-fusion, r4det, plug-and-play, bevfusion, rcbevdet, vod]
note: library/Classical_Detection/R4Det.md#32-关键机制分析
paper: "CVPR 2026 · R4Det: 4D Radar-Camera Fusion for High-Performance 3D Object Detection（笔记标注未开源，未记录 arXiv 号）"
stance: watch
evidence:
  - source: library/Classical_Detection/R4Det.md
    locator: "§3.2【即插即用性】"
    quote: "将 R4Det 模块附加于 BEVFusion 和 RCBEVDet 上，在 VoD 数据集上的 $\\text{mAP}_{\\text{EAA}}$ 分别提升了 +6.34% 和 +5.34%。"
    relation: supports
falsifiers:
  - "把 R4Det 模块挂到 BEVFusion / RCBEVDet 在 VoD 上复测，mAP_EAA 增益显著小于 +6.34% / +5.34%，或为负"
  - "口径核对后发现 +6.34% / +5.34% 与常见 EAA 口径（或原文实际指标）不一致，增益不可比或需重新换算"
  - "增益只在特定宿主上成立（如仅 BEVFusion 有增益、RCBEVDet 无），『即插即用』的普适性不成立"
review_due: 2026-12-02
related: [claim-r4det-tj4dradset-ablation-5407-bev-map]
signoff: null
---

## 我的理解

论文声称（据笔记 §3.2 转述，尚未独立验证）：R4Det 的模块（PDF / DGTF / IGDR）可以作为附加组件挂到已有的雷达-相机融合检测器上——挂到 BEVFusion 在 VoD 上 mAP_EAA 提升 +6.34%，挂到 RCBEVDet 提升 +5.34%，即「即插即用」的迁移性主张。

必须记住的限定：
1. mAP_EAA 的定义在笔记中未给出，cross 文档 M1 明确记录 VoD 上各家指标族（mAP_EAA / mAP_DC / EAA AP / RoI AP）口径未核对，**不可**拿这两个增量与其他论文的 VoD 数字横向比较。
2. 「+6.34%」是绝对点还是相对提升未注明，两种口径含义差数倍，回原文核对前按「论文自报增量」原样引用。
3. 笔记只给了增量，没给宿主模型挂载前后的绝对值，无法据此判断挂载后的绝对水平。
4. 单源结论（cross 文档 C5）：其余 4D 雷达笔记无对应迁移实验。

## 待验证

- 回 R4Det 原文核对迁移实验表：mAP_EAA 定义、+6.34% / +5.34% 的口径（点数 vs 相对百分比）、挂载前后绝对值、宿主模型版本。
- 复现：开源 BEVFusion / RCBEVDet 上接入等价模块（R4Det 未开源，只能按笔记复现 PDF / DGTF / IGDR），在 VoD 上测 mAP 增量。
- 与 cross 文档 M1 的遗留问题合并：先核对 EAA 口径，再做任何 VoD 数值横向比较。

## 若成立 / 不成立意味着什么

成立：这套雷达-相机融合模块对异构宿主（BEVFusion 系 / RCBEVDet 系）都可移植，自研管线可以用「先挂模块测增量」的低成本方式评估，不必整体换主干。
不成立：增益依赖 R4Det 自身的特征基底或特定实现，迁移需大改宿主，即插即用叙事不能作为选型依据。
