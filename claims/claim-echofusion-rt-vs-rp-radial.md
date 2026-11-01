---
id: claim-echofusion-rt-vs-rp-radial
title: "在 RADIal 的受控消融中，RT+C 的 BEV AP 高于 RP+C，优势主要在中远距"
type: claim
status: asserted
scope: "RADIal test split；refined 3D 标注；BEV AP@0.7；RT+C vs RP+C；同一 EchoFusion 架构；3 次运行均值"
tags: [radar, sensor-fusion, echofusion, radial]
note: library/3D_Occupancy/EchoFusion.md#32-消融实验雷达数据格式与模态影响
paper: "NeurIPS 2023, Echoes Beyond Points: Unleashing the Power of Raw Radar Data in Multi-modality Fusion"
stance: watch
evidence:
  - source: https://arxiv.org/abs/2307.16532
    locator: "§5.4 / Table 6 / p.9"
    quote: "both RT and RA outperform traditional cloud points, especially in the 50-100m range, in which the difference is as large as 4 points in AP."
    relation: supports
  - source: https://arxiv.org/abs/2307.16532
    locator: "Table 6 / p.9"
    quote: "Table 6: BEV detection performances of different modality combinations of our algorithm on RADIal Dataset test split. Refined 3D bounding box annotations are applied."
    relation: supports
falsifiers:
  - "在相同 RADIal 划分、相同 RT/RP 编码器容量与训练配置下复现，RT+C 相对 RP+C 的 BEV AP 增益消失或反转"
  - "增益主要来自 RP 分支的编码器容量/预处理不对等；匹配后差异不再显著"
review_due: 2026-11-30
related: [claim-echofusion-rt-vs-ra-noise, claim-echofusion-radial-ap-ar-tradeoff, claim-echofusion-note-table-mismatch]
signoff: null
---

## 我的理解

论文 Table 6 在同一 EchoFusion 架构下比较了多种模态组合：RT+C 的总体 BEV AP@0.7 为 **84.92**，RP+C 为 **82.35**；50–100m 分别为 **91.06** 和 **86.39**。因此“原始雷达优于 CFAR 点云”在这张表里有直接证据，但总体差距约 2.6 个点，远距约 4.7 个点；笔记 §3.2 的 42.4 vs 33.1（mAP）无法在论文原表中找到对应数据，见 [笔记偏差卡](claim-echofusion-note-table-mismatch.md)。

## 待验证

- 核对 Table 6 的 RT/RP 分支是否使用相同容量、相同图像骨干与相同训练计划。
- 用作者代码或独立复现确认 84.92 vs 82.35 的差距是否超出 3 次运行的方差。
- 检查 RP 分支的 CFAR/点云预处理是否被调优；若未调优，增益可能被高估。

## 若成立 / 不成立意味着什么

成立则值得在雷达-相机融合中优先尝试 RT/原始雷达输入；不成立则说明“原始数据优越”至少在这套实现里不成立，选型应回到受控的容量/预处理对比。
