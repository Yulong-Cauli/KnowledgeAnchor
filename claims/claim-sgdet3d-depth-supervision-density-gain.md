---
id: claim-sgdet3d-depth-supervision-density-gain
title: "SGDet3D 自报：深度监督源消融中 mAP_EAA 随监督密度单调上升（无监督 56.95 < 雷达点云 58.75 < LiDAR 真值 59.49）"
type: claim
status: asserted
scope: "VoD 数据集；SGDet3D 管线内深度监督标签来源消融（论文 Table，据库内笔记 §5.3 转录）；主张仅限 mAP_EAA 口径——同表 mAP_DC 非单调（Radar 74.03 略低于 None 74.12）；mAP_EAA/DC 口径笔记未定义，与 HGSFusion 的 EAA AP / RoI AP 口径互不可比（nightshift/cross/4d-radar.md M1）；LiDAR 为训练期深度损失（KL）真值，推理期输入笔记未明说（按 §4 损失设计推定为雷达+相机，需回原文核对）；自报数字，尚未独立验证"
tags: [4d-radar, radar-camera-fusion, sgdet3d, vod, ablation, depth-supervision, lidar-supervision]
note: library/Classical_Detection/SGDet3D.md#53-深度监督源分析
paper: "RA-L 2025 · SGDet3D（面向 4D 雷达-相机融合的语义与几何融合 3D 目标检测；笔记未记录英文原题与 arXiv 号；开源：https://github.com/shawnnnkb/SGDet3D）"
stance: watch
evidence:
  - source: library/Classical_Detection/SGDet3D.md
    locator: "§5.3 / 监督源消融表"
    quote: "| None                           | 56.95                 | 74.12                |"
    relation: supports
  - source: library/Classical_Detection/SGDet3D.md
    locator: "§5.3 / 监督源消融表"
    quote: "| Radar Point Cloud              | 58.75                 | 74.03                |"
    relation: supports
  - source: library/Classical_Detection/SGDet3D.md
    locator: "§5.3 / 监督源消融表"
    quote: "| **LiDAR Point Cloud**          | **59.49**             | **77.11**            |"
    relation: supports
  - source: library/Classical_Detection/SGDet3D.md
    locator: "§5.3 分析"
    quote: "**分析**：仅使用稀疏的雷达点云监督即可达到 58.75 的 mAP，验证了该几何感知范式的可行性。引入高密度 LiDAR 真值监督可进一步解锁深度估计算子的性能上限。"
    relation: supports
falsifiers:
  - "复现消融：雷达点云监督未超无监督（mAP_EAA ≤ 56.95），「雷达监督即可行」不成立"
  - "复现：LiDAR 监督未超雷达监督（mAP_EAA ≤ 58.75），或三档排序与自报不符（56.95 < 58.75 < 59.49 被打破）"
  - "发现增益来自标签密度以外的混淆因素（各行损失权重 / 训练轮数不一致），或原文口径下 mAP_DC 单调性与笔记转录相反"
review_due: 2026-12-02
related: [claim-sgdet3d-srp-gdc-laca-vod-monotonic, claim-r4det-pdf-depth-supervision-monotonic-gain, claim-hgsfusion-2d-spatial-mode-beats-3d]
signoff: null
---

## 我的理解

论文声称（据笔记 §5.3 转录，尚未独立验证）：GDC 深度估计的监督标签来源消融中，mAP_EAA 随监督密度单调上升——无监督 56.95，仅稀疏雷达点云监督 58.75（+1.80），LiDAR 真值监督 59.49（再 +0.74）。论文据此主张两点：稀疏雷达点云监督即可验证几何感知范式可行；高密度 LiDAR 真值进一步解锁深度估计算子上限。

引用前必读的三个限定：
1. **单调性只在 mAP_EAA 成立**：mAP_DC 上 Radar 74.03 略低于 None 74.12（−0.09，非单调）。本卡主张仅限 mAP_EAA，「雷达监督全面优于无监督」不成立。
2. **LiDAR 行即完整模型**：59.49 / 77.11 与 §5.1 完整模型行完全相同，两表自洽，说明 SGDet3D 的默认配置用 LiDAR 真值监督。按 §4 深度损失（KL）设计，LiDAR 应为训练期真值、推理仍用雷达+相机——但笔记未明说推理期输入，**若推理需要 LiDAR，该路线对车载部署的意义完全不同**，引用前必须回原文核对。
3. LiDAR 监督在部署场景未必可得（VoD 提供 LiDAR 真值），训练期依赖 LiDAR 是该范式的隐性成本。

该结论与 R4Det 三重监督（每加一项 BEV mAP 单调增长）和 HGSFusion 显式占据监督（+0.69% RoI AP）同向（cross 文档 S5）：三篇独立得出「中间几何量显式监督优于无监督」，但监督源口径各不相同。

## 待验证

- 回 SGDet3D 原文核对 §5.3 表三行数字与三行除监督源外配置是否一致；确认推理期是否需要 LiDAR。
- 用开源实现复现三档：56.95 / 58.75 / 59.49 排序是否跨种子稳定；mAP_DC 的非单调（74.12 > 74.03）是否复现。
- 换非 LiDAR 的密集深度真值（视觉基础模型伪标签、低成本深度传感器）训练，看能否逼近 59.49——检验「LiDAR 解锁上限」是密度效应还是 LiDAR 特定绑定。

## 若成立 / 不成立意味着什么

成立：4D 雷达-相机融合的深度补全类模块，用车上已有的雷达点云做监督已可得大部分收益（+1.80 mAP_EAA），LiDAR 真值仅作训练期奢侈品补最后一段；自研管线可先上雷达监督再评估是否值得引入 LiDAR 标注。
不成立：雷达监督增益不复现或与无监督打平，「几何感知范式可行」的支撑塌掉；或增益依赖特定监督配置，需重新拆解归因。
