---
id: claim-drocc-90pct-voxels-empty
title: "Dr.Occ 论文声称：占据网格约 90% 体素为空，直接拟合全部体素低效，应聚焦非空体素"
type: claim
status: asserted
scope: "Occ3D-nuScenes 标注口径的观察性主张（论文未给出统计的序列/帧/类别分布细节）；注意与 §3.4.2 前向投影输出口径的 '30% occupancy' 是两个不同口径（一个是标注网格空体素占比，一个是前向投影稀疏表示的占比），引用勿混用；数字为论文自报（arXiv HTML v3，2026-11-04 抓取）；尚未独立验证"
tags: [occupancy-prediction, drocc, cvpr2026]
note: library/3D_Occupancy/DrOcc.md#2-方法
paper: "CVPR 2026, Dr.Occ: Depth- and Region-Guided 3D Occupancy from Surround-View Cameras for Autonomous Driving (arXiv:2603.01007)"
stance: watch
evidence:
  - source: https://arxiv.org/html/2603.01007v3
    locator: "§3.4.1（抓取 2026-11-04）"
    quote: "We make a critical observation: approximately 90% of voxels in the occupancy grid are empty, suggesting that directly fitting all voxels is inefficient."
    relation: supports
  - source: library/3D_Occupancy/DrOcc.md
    locator: "§2.2 / Stage 1（前向投影输出口径，另一口径的锚点）"
    quote: "producing sparse representations with 30% occupancy"
    relation: supports
falsifiers:
  - "对 Occ3D-nuScenes 标注直接统计，空体素占比明显低于 80%（如 ~60%）"
  - "该口径仅在特定体素分辨率（0.4m）/感知范围（80×80×6.4m）下成立，常用口径（如 0.2m 或 200×200×16 之外的设置）下不成立"
review_due: 2027-02-02
related: [claim-drocc-bevdet4d-43p4-miou-occ3d]
signoff: null
---

## 我的理解

论文声称（asserted，尚未独立验证）：Occ3D-nuScenes 的占据网格里约 90% 体素是空的，所以"对所有体素均匀拟合"浪费容量，应先用深度线索构造 geometry-aware occupancy mask 聚焦非空体素，再两步精化。这与 [SparseOcc 的「约 80% 体素为空」](../library/3D_Occupancy/SparseOcc.md)（v1 §3.1，LSS 特征体素口径）是同类观察但口径不同：Dr.Occ 说的是标注网格，SparseOcc 说的是 LSS 特征体素，两条引用时都必须注明口径，不能互相换算。

注意：90% 这个数没有给出统计方法（哪一帧、哪一序列、是否含车体自身遮挡区域），falsifier 里放了可直接执行的复算路径。

## 待验证

- 下载 Occ3D-nuScenes 标注，统计全验证集空体素占比（0.4m、80×80×6.4m 口径），核对是否 ≈90%。
- 顺带统计 SparseOcc 的 LSS 口径与 GT 口径（80%/67%）在本机数据上的对应值，把三条口径注记收进两条笔记。

## 若成立 / 不成立意味着什么

成立：占用预测的稀疏化/掩码化设计（SparseOcc 剪枝、Dr.Occ 掩码、NJU 粗到细）共享同一物理依据，跨论文对比时"有效体素率"应作为标准口径注记。
不成立：90% 高估了空体素占比，掩码聚焦的动机减弱，需重新审视 D2-VFormer 消融增益（mIoU +5.44）的真实来源。
