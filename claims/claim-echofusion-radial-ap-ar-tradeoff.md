---
id: claim-echofusion-radial-ap-ar-tradeoff
title: "EchoFusion 在 RADIal 原始协议下的主要收益是 AR/F1，AP 仅与 FFTRadNet 持平"
type: claim
status: asserted
scope: "RADIal test split；original protocol；AP/AR/F1/RE/AE；EchoFusion RT+C vs FFTRadNet RD / ADCNet ADC；数字为论文自报（Table 2，arXiv:2307.16532v2 PDF 文本层，2026-11-05 实抓逐值核对；笔记 §3.1 主表同值），尚未独立验证"
tags: [radar, sensor-fusion, echofusion, radial, evaluation]
note: library/3D_Occupancy/EchoFusion.md#31-radial-数据集主要性能对比
paper: "NeurIPS 2023, Echoes Beyond Points: Unleashing the Power of Raw Radar Data in Multi-modality Fusion"
stance: watch
evidence:
  - source: https://arxiv.org/abs/2307.16532
    locator: "Table 2 / p.7（arXiv:2307.16532v2 PDF 文本层，pdftotext -layout 提取、列间空格为排版对齐；2026-11-05 实抓逐值复核）"
    quote: "FFTRadNet [39]   RD        96.84  82.18  88.91  0.11   0.17"
    relation: supports
  - source: https://arxiv.org/abs/2307.16532
    locator: "Table 2 / p.7（arXiv:2307.16532v2 PDF 文本层，pdftotext -layout 提取、列间空格为排版对齐；2026-11-05 实抓逐值复核）"
    quote: "ADCNet [52]      ADC       95.00  89.00  91.90  0.13   0.11"
    relation: supports
  - source: https://arxiv.org/abs/2307.16532
    locator: "Table 2 / p.7（arXiv:2307.16532v2 PDF 文本层，pdftotext -layout 提取、列间空格为排版对齐；2026-11-05 实抓逐值复核）"
    quote: "EchoFusion       RT&C      96.95  93.43  95.16  0.12   0.18"
    relation: supports
  - source: library/3D_Occupancy/EchoFusion.md
    locator: "§3.1 RADIal 数据集主要性能对比表（FFTRadNet 行，L1 来源）"
    quote: "| FFTRadNet             | RD                  | 96.84      | 82.18      | 88.91      | 0.11       | 0.17       |"
    relation: supports
  - source: library/3D_Occupancy/EchoFusion.md
    locator: "§3.1 RADIal 数据集主要性能对比表（EchoFusion 行，L1 来源；模态列笔记作 RT + Image，即论文 Table 2 的 RT&C）"
    quote: "| **EchoFusion (Ours)** | **RT + Image**      | **96.95**  | **93.43**  | **95.16**  | 0.12       | 0.18       |"
    relation: supports
falsifiers:
  - "用同一评测脚本复现，AR/F1 增益消失或 AP 差距显著扩大"
  - "三个方法的评测协议/匹配阈值不一致，导致表格不可比"
review_due: 2026-11-30
related: [claim-echofusion-rt-vs-rp-radial, claim-echofusion-3d-ap-below-lidar, claim-echofusion-note-table-mismatch]
signoff: null
---

## 我的理解

论文 Table 2 报告（数字尚未独立验证）：EchoFusion 的 AP 是 **96.95**，仅比 FFTRadNet 的 **96.84** 高 0.11；真正的差距在 AR（**93.43 vs 82.18**）和 F1（**95.16 vs 88.91**）。同时 RE **0.12** / AE **0.18** 不如 FFTRadNet 的 0.11 / 0.17，AE 也不如 ADCNet 的 0.11。论文自己指出 RE/AE 对高召回模型不公平（§5.2.1 原句已于 2026-11-05 实抓核实），因此“主要收益是召回/F1”比“全面领先”更准确。

这张表也不是受控的模态比较：FFTRadNet 用 RD、ADCNet 用 ADC、EchoFusion 用 RT+C。要判断方法本身的贡献，应看 [受控消融卡](claim-echofusion-rt-vs-rp-radial.md)。笔记 §3.1 主表数字与论文 Table 2 一致（96.95/93.43/95.16 等逐值相同，见 evidence；笔记省略 CMS、T-FFTRadNet 两行）。

## 待验证

- 已核对（2026-11-05）：本班二次实抓 arXiv:2307.16532v2，PDF 文本层 Table 2 三行逐值命中（表题 original protocol）；笔记 §3.1 对应行逐值命中（见 evidence）。
- 核对三个方法是否使用同一 RADIal 划分、同一 AP/AR 定义与同一匹配阈值。
- 检查 AR/F1 的提升是否来自更宽松的阈值或更多查询，而非更好的特征。
- 在受控模态设置下（都带相机）重新比较 AP/AR/F1。

## 若成立 / 不成立意味着什么

成立则 EchoFusion 适合“少漏检”优先的场景，但不能宣称 AP 或定位精度全面领先；不成立则说明主表比较存在协议差异，需要重新对齐评测。
