---
id: claim-echofusion-rt-vs-ra-noise
title: "在 RADIal 上，RT+C 与 RA+C 的总体 BEV AP 差异在误差范围内"
type: claim
status: asserted
scope: "RADIal test split；refined 3D 标注；BEV AP@0.7；RT+C vs RA+C；3 次运行均值与误差条"
tags: [radar, sensor-fusion, echofusion, radial]
note: library/3D_Occupancy/EchoFusion.md#32-消融实验雷达数据格式与模态影响
paper: "NeurIPS 2023, Echoes Beyond Points: Unleashing the Power of Raw Radar Data in Multi-modality Fusion"
stance: watch
evidence:
  - source: https://arxiv.org/abs/2307.16532
    locator: "§5.4 / Table 6 / p.9"
    quote: "The performance gap between RT and RA with camera modality is within the error bar, indicating that it is not necessary to explicitly solve the azimuth, nor necessary to permute the Doppler-angle dimensions as FFTRadNet does."
    relation: supports
  - source: https://arxiv.org/abs/2307.16532
    locator: "Table 6 / p.9"
    quote: "Table 6: BEV detection performances of different modality combinations of our algorithm on RADIal Dataset test split. Refined 3D bounding box annotations are applied."
    relation: supports
falsifiers:
  - "多种子复现显示 RT+C 与 RA+C 的总体 BEV AP 差异稳定超出误差条"
  - "误差条的计算方式或训练配置不一致，导致“在误差范围内”的结论不成立"
review_due: 2026-11-30
related: [claim-echofusion-rt-vs-rp-radial, claim-echofusion-note-table-mismatch]
signoff: null
---

## 我的理解

论文明确说 RT+C 与 RA+C 的差距在误差条内；Table 6 的总体 BEV AP 是 **84.92**（RT+C，±0.98）对 **84.77**（RA+C，±0.65），LET-BEV-AP 则是 **88.86** 对 **89.54**。因此“RT 比 RA 更好”不是这篇论文支持的结论；它只支持“RT 与 RA 都优于点云，且不必显式解算方位角”。

## 待验证

- 按论文设置多种子复跑，确认 84.92 与 84.77 的差异是否始终小于误差条。
- 检查 RT/RA 分支的预处理与容量是否对等；RA 分支多做了一次角度 FFT。
- 如果换成别的雷达或数据集，RT vs RA 的排序可能改变，需要单独验证。

## 若成立 / 不成立意味着什么

成立则工程上可以选更便宜的 RA 或 RT，取决于数据管线；不成立则说明 RT 的多普勒/时间信息确实带来稳定增益，不能把两者视为等价。
