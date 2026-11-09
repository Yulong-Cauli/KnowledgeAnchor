---
id: claim-r4det-plugplay-vod-eaa-gain
title: "R4Det 声称：其模块即插即用挂到 BEVFusion / RCBEVDet 上，在 VoD 的 mAP_EAA 分别 +6.34% / +5.34%"
type: claim
status: asserted
scope: "VoD val set（论文 Table 3 caption 自述 'on the val set of VoD'）；宿主模型为 BEVFusion 与 RCBEVDet（各自叠加 R4Det 模块；原文未写明挂载的是 PDF/DGTF/IGDR 中哪些模块的组合，仅 IGDR 节自述为 plug-and-play refinement block）；指标 mAP_EAA 口径已按原文补核（2026-11-05 实抓）：论文 §4.1 自述 APEAA = Entire Annotated Area，统一 IoU 约定 0.50（Car/Truck）、0.25（Pedestrian/Cyclist）；挂载前后绝对值已补核：BEVFusion 49.25→55.59、RCBEVDet 49.99→55.33，+6.34 / +5.34 为绝对点数（非相对百分比）；与其他论文的 VoD 数字（mAP_DC / EAA AP / RoI AP 及各自 mAP_EAA）横向比较仍需逐篇核对 split 与 IoU 约定（cross M1 的比较禁令对跨论文比较仍适用）；R4Det 自报数字；单源结论（cross 文档 C5，其余 4D 雷达笔记无对应迁移实验）"
tags: [4d-radar, radar-camera-fusion, r4det, plug-and-play, bevfusion, rcbevdet, vod]
note: library/Classical_Detection/R4Det.md#32-关键机制分析
paper: "CVPR 2026 · R4Det: 4D Radar-Camera Fusion for High-Performance 3D Object Detection（笔记标注未开源，未记录 arXiv 号）"
stance: watch
evidence:
  - source: library/Classical_Detection/R4Det.md
    locator: "§3.2【即插即用性】"
    quote: "将 R4Det 模块附加于 BEVFusion 和 RCBEVDet 上，在 VoD 数据集上的 $\text{mAP}_{\text{EAA}}$ 分别提升了 +6.34% 和 +5.34%。"
    relation: supports
  - source: https://openaccess.thecvf.com/content/CVPR2026/papers/Xia_R4Det_4D_Radar-Camera_Fusion_for_High-Performance_3D_Object_Detection_CVPR_2026_paper.pdf
    locator: "§4.1 Datasets and Metrics（跨行连字符已还原；pdftotext -layout 提取，抓取 2026-11-05）"
    quote: "For VoD, we report two complementary metrics: APEAA (Entire Annotated Area) and APDC (Driving Corridor). A unified IoU threshold convention is used: 0.50 for Car and Truck, and 0.25 for Pedestrian and Cyclist."
    relation: supports
  - source: https://openaccess.thecvf.com/content/CVPR2026/papers/Xia_R4Det_4D_Radar-Camera_Fusion_for_High-Performance_3D_Object_Detection_CVPR_2026_paper.pdf
    locator: "§4.3 末段（即插即用增量句，跨行与公式下标空格已按排版还原；pdftotext -layout 提取，抓取 2026-11-05）"
    quote: "We also applied the proposed module to BEVFusion [13] and RCBEVDet [14]. As shown in Table 3, our approach achieves improvements of +6.34% and +5.34% in mAPEAA, respectively."
    relation: supports
  - source: https://openaccess.thecvf.com/content/CVPR2026/papers/Xia_R4Det_4D_Radar-Camera_Fusion_for_High-Performance_3D_Object_Detection_CVPR_2026_paper.pdf
    locator: "Table 3（val set of VoD，BEVFusion 基线行；pdftotext -layout 提取，右栏串扰已截去，抓取 2026-11-05）"
    quote: "BEVFusion [13]        37.85       40.96        68.95      49.25"
    relation: supports
  - source: https://openaccess.thecvf.com/content/CVPR2026/papers/Xia_R4Det_4D_Radar-Camera_Fusion_for_High-Performance_3D_Object_Detection_CVPR_2026_paper.pdf
    locator: "Table 3，BEVFusion + Ours 行（pdftotext -layout 提取，右栏串扰已截去，抓取 2026-11-05）"
    quote: "BEVFusion + Ours      41.98       48.15        76.64      55.59"
    relation: supports
  - source: https://openaccess.thecvf.com/content/CVPR2026/papers/Xia_R4Det_4D_Radar-Camera_Fusion_for_High-Performance_3D_Object_Detection_CVPR_2026_paper.pdf
    locator: "Table 3，RCBEVDet 基线行（pdftotext -layout 提取，右栏串扰已截去，抓取 2026-11-05）"
    quote: "RCBEVDet [14]         40.63       38.86        70.48      49.99"
    relation: supports
  - source: https://openaccess.thecvf.com/content/CVPR2026/papers/Xia_R4Det_4D_Radar-Camera_Fusion_for_High-Performance_3D_Object_Detection_CVPR_2026_paper.pdf
    locator: "Table 3，RCBEVDet + Ours 行（pdftotext -layout 提取，右栏串扰已截去，抓取 2026-11-05）"
    quote: "RCBEVDet + Ours       41.02       48.85        76.12      55.33"
    relation: supports
falsifiers:
  - "同范围复现：把 R4Det 模块挂到 BEVFusion / RCBEVDet 在 VoD val 上复测（同 IoU 约定），mAP_EAA 增益显著小于 +6.34 / +5.34 个点，或为负"
  - "口径核查（2026-11-05 已完成，未触发）：若 +6.34% / +5.34% 的口径与原文实际不符则引用需修正——已核实 Table 3 挂载前后绝对值（BEVFusion 49.25→55.59、RCBEVDet 49.99→55.33），增益为 APEAA 绝对点数，原文「%」系记法不严谨，分支闭合"
  - "挂载组合核对：若原文细节或开源复现表明 Table 3 增益并非来自 PDF/DGTF/IGDR 模块组合（如仅挂 IGDR 单模块），「整套模块即插即用」的解读需收窄为「所挂模块即插即用」"
  - "增益只在特定宿主上成立（如仅 BEVFusion 有增益、RCBEVDet 无），『即插即用』的普适性不成立——原文 Table 3 两个宿主均为正增益，此条目前未触发"
review_due: 2026-12-02
related: [claim-r4det-tj4dradset-ablation-5407-bev-map]
signoff: null
---

## 主张

论文声称（据笔记 §3.2 转述）：R4Det 的模块（PDF / DGTF / IGDR）可以作为附加组件挂到已有的雷达-相机融合检测器上——挂到 BEVFusion 在 VoD 上 mAP_EAA 提升 +6.34%，挂到 RCBEVDet 提升 +5.34%，即「即插即用」的迁移性主张。2026-11-05 实抓原文补核：Table 3 给出挂载前后绝对值，BEVFusion 49.25 → 55.59（+6.34 点）、RCBEVDet 49.99 → 55.33（+5.34 点）。

四条限定：
1. mAP_EAA 口径已按原文补核：论文 §4.1 自述 APEAA = Entire Annotated Area，统一 IoU 约定 0.50（Car/Truck）、0.25（Pedestrian/Cyclist）；+6.34 / +5.34 为绝对点数（非相对百分比）。跨论文横向比较禁令仍适用：cross 文档 M1 记录 VoD 上各家指标族（mAP_EAA / mAP_DC / EAA AP / RoI AP）口径不一，且 R4Det Table 2 中 SGDet3D 行报 mAP_EAA 59.75 / mAP_DC 77.42，与 SGDet3D 笔记自报 59.49 / 77.11（cross M1 转引 SGDet3D.md §5.1）相差 0.26 / 0.31——同一方法两个来源数字已不一致，任何跨论文 VoD 比较前必须核对 split 与 IoU 约定。
2. 挂载模块组合原文未写明：§4.3 只说 "the proposed module(s)"，贡献列表称三个模块均 plug-and-play，IGDR 节自述为 "a highly plug-and-play refinement block without modifying the backbone"；Table 3 未标注挂载了 PDF/DGTF/IGDR 中哪些。故「整套模块可挂」与「仅个别模块可挂」在原文层面无法区分。
3. 宿主配置未记录：BEVFusion [13] / RCBEVDet [14] 的具体版本、是否为作者重训复测，Table 3 与正文均未写明。
4. 单源结论（cross 文档 C5）：其余 4D 雷达笔记无对应迁移实验。

## 待验证

- 已核对（2026-11-05）：mAP_EAA 定义、口径（绝对点数）、挂载前后绝对值均已按原文补核（见 evidence；来源 URL：https://openaccess.thecvf.com/content/CVPR2026/papers/Xia_R4Det_4D_Radar-Camera_Fusion_for_High-Performance_3D_Object_Detection_CVPR_2026_paper.pdf，pdftotext -layout 提取）；剩余待核：挂载模块组合与宿主模型版本/配置（原文未写明）。
- 复现：开源 BEVFusion / RCBEVDet 上接入等价模块（R4Det 未开源，只能按笔记复现 PDF / DGTF / IGDR），在 VoD val 上测 mAP_EAA 增量（同 IoU 约定 0.50/0.25）。
- 与 cross 文档 M1 的遗留问题合并：R4Det 自身口径已核，跨论文比较仍需先核对各论文的 EAA 定义、split 与 IoU 约定。

## 成立/不成立的含义

成立：这套雷达-相机融合模块对异构宿主（BEVFusion 系 / RCBEVDet 系）都可移植，自研管线可以用「先挂模块测增量」的低成本方式评估，不必整体换主干。
不成立：增益依赖 R4Det 自身的特征基底或特定实现，迁移需大改宿主，即插即用叙事不能作为选型依据。
