---
id: claim-r4det-dgtf-t1-single-step-best
title: "R4Det 声称：DGTF 时序融合在单步长（t-1）下最佳（BEV mAP 50.41），跨帧（t-2/t-3）引发轨迹错位与误差累积"
type: claim
status: asserted
scope: "TJ4DRadSet；R4Det 的 DGTF 模块（DCNv2 空间对齐 + ConvGRU 门控更新，无自车位姿先验）；帧距消融：单步长 t-1 融合 BEV mAP 50.41 最佳（与主消融 +DGTF 行同值，已对照论文 Table 4 核实），t-2 / t-3 跨帧融合更差；t-2 / t-3 具体数字已对照论文补充材料 Table 9 补核（BEV mAP 49.87 / 49.20，2026-11-05 实抓）；该消融出自补充材料 §B Table 9（Sensitivity to historical frame gap），主文无此表；论文未给重复实验或方差；R4Det 自报数字，尚未独立验证；单源结论（nightshift/cross/4d-radar.md C4，其余三篇 4D 雷达笔记无时序模块可交叉验证）"
tags: [4d-radar, radar-camera-fusion, r4det, temporal-fusion, dcn, convgru, tj4dradset]
note: library/Classical_Detection/R4Det.md#32-关键机制分析
paper: "CVPR 2026 · R4Det: 4D Radar-Camera Fusion for High-Performance 3D Object Detection（笔记标注未开源，未记录 arXiv 号）"
stance: watch
evidence:
  - source: library/Classical_Detection/R4Det.md
    locator: "§3.2【时序帧距敏感度】"
    quote: "在 DGTF 模块中，单步长（$t-1$）融合表现最佳（BEV mAP 50.41）。跨帧融合（$t-2, t-3$）会引发轨迹错位与误差累积。"
    relation: supports
  - source: https://openaccess.thecvf.com/content/CVPR2026/supplemental/Xia_R4Det_4D_Radar-Camera_CVPR_2026_supplemental.pdf
    locator: "Supplementary §B Additional ablation of the DGTF module（跨行已还原；pdftotext -layout 提取，抓取 2026-11-05）"
    quote: "We also examine temporal depth sensitivity (Table 9): using the immediate predecessor (t−1) achieves the best accuracy and stability, whereas fusing more distant frames (t − 2, t − 3) leads to noise accumulation."
    relation: supports
  - source: https://openaccess.thecvf.com/content/CVPR2026/supplemental/Xia_R4Det_4D_Radar-Camera_CVPR_2026_supplemental.pdf
    locator: "Supplementary Table 9（Sensitivity to historical frame gap，t−1 行；pdftotext -layout 提取，行内空格原样，抓取 2026-11-05）"
    quote: "t&t−1                   50.41                44.86"
    relation: supports
  - source: https://openaccess.thecvf.com/content/CVPR2026/supplemental/Xia_R4Det_4D_Radar-Camera_CVPR_2026_supplemental.pdf
    locator: "Supplementary Table 9，t−2 行（pdftotext -layout 提取，行内空格原样，抓取 2026-11-05）"
    quote: "t&t−2                   49.87                43.12"
    relation: supports
  - source: https://openaccess.thecvf.com/content/CVPR2026/supplemental/Xia_R4Det_4D_Radar-Camera_CVPR_2026_supplemental.pdf
    locator: "Supplementary Table 9，t−3 行（pdftotext -layout 提取，行内空格原样，抓取 2026-11-05）"
    quote: "t&t−3                   49.20                42.74"
    relation: supports
falsifiers:
  - "原文核查（已完成，未触发，2026-11-05）：回原文发现 t-2 / t-3 的数字实际并不低于 t-1——补充材料 Table 9 实际为 t-1 50.41 > t-2 49.87 > t-3 49.20，此分支已闭合"
  - "同范围复现（主张侧）：同配置多种子复现中 t-2 或 t-3 跨帧融合的 BEV mAP ≥ 50.41（不劣于甚至优于单步长）；或 t-1 与 t-2/t-3 的差距（原文 0.54 / 1.21）落在种子噪声范围内，『跨帧更差』不成立——论文未给方差，显著性待复现检验"
  - "跨条件迁移（不充当原范围反证）：修复对齐后（如提供 ego-pose 或更强的对齐分支）跨帧融合稳定超过单步长，说明退化是对齐实现问题而非帧距本身"
review_due: 2026-12-02
related: [claim-r4det-tj4dradset-ablation-5407-bev-map]
signoff: null
---

## 我的理解

论文声称（据笔记 §3.2 转述，尚未独立验证）：DGTF 在无自车位姿先验下用 DCNv2 做空间对齐、ConvGRU 做门控状态更新；帧距消融里只用前一帧（t-1）效果最好（BEV mAP 50.41），拉长到 t-2 / t-3 跨帧融合反而因轨迹错位与误差累积变差。

必须记住的限定：
1. 笔记未记录 t-2 / t-3 的具体数字；2026-11-05 实抓论文补充材料 Table 9（Sensitivity to historical frame gap）已补核：BEV mAP t-1 50.41 > t-2 49.87 > t-3 49.20，3D mAP 44.86 > 43.12 > 42.74，随帧距单调下降。该消融表在补充材料 §B，主文没有帧距消融表。
2. 50.41 与主消融表 +DGTF 行同值（已对照论文 Table 4 核实），说明帧距消融的最佳配置就是主消融采用的配置；本卡只立「t-1 优于 t-2/t-3」这一窄主张。
3. 同节还记录「在 DGTF 中叠加 SE 通道注意力会使 BEV mAP 从 50.41 降至 49.12」（R4Det.md §3.2【通道对齐与优化冲突】），属另一独立观察，本卡不立，留待需要时另建卡（该数字已对照论文 Table 6 V3/V4 行核实一致）。
4. 单源结论：其余 4D 雷达笔记（RadarOcc / SGDet3D / HGSFusion）均无时序模块，无法交叉验证（cross 文档 C4）。
5. 用词溯源：笔记的「轨迹错位与误差累积」是转述——补充材料原文只写 "leads to noise accumulation"（并称 t−1 "achieves the best accuracy and stability"）；「轨迹错位」无逐字对应（主文 §3.3 的 spatial misalignment 是 DCNv2 设计动机句，不是帧距消融结论）。论文未给重复实验或方差，退化幅度（0.54 / 1.21）的显著性未知。

## 待验证

- 已核对（2026-11-05）：帧距消融在补充材料 §B Table 9（主文无此表），t-1 / t-2 / t-3 三档数字见 evidence 与限定 1；来源 URL：https://openaccess.thecvf.com/content/CVPR2026/supplemental/Xia_R4Det_4D_Radar-Camera_CVPR_2026_supplemental.pdf（pdftotext -layout 提取）。
- 复现：同一 DGTF 配置下改历史帧数（1 / 2 / 3 帧），多种子看 BEV mAP 是否随帧距单调下降、差距是否超出种子噪声。
- 对照：带 ego-pose 的时序融合（如标准 BEV 卷积时序对齐）在同数据集上多帧是否同样退化，区分「无位姿对齐的帧距问题」与「帧距本身问题」。

## 若成立 / 不成立意味着什么

成立：无位姿的可变形时序融合对帧距敏感，工程上多帧历史不必贪多，t-1 是性价比点；做多帧方案前需先验证对齐质量。
不成立：跨帧退化不成立则 DGTF 的对齐分支可在更长时序上受益，时序长度应按常规多帧方案调参而非固定 t-1。
