---
id: claim-drocc-90pct-voxels-empty
title: "Dr.Occ 论文声称：占据网格约 90% 体素为空，直接拟合全部体素低效，应聚焦非空体素"
type: claim
status: asserted
scope: "Occ3D-nuScenes 标注口径的观察性主张（论文未给出统计的序列/帧/类别分布细节；论文实现口径为 0.4m 体素、200×200×16，据笔记 §3.1 设置）；注意与 §3.4.2 前向投影输出口径的 '30% occupancy' 是两个不同口径（一个是标注网格空体素占比，一个是前向投影稀疏表示的占比），引用勿混用；数字为论文自报（arXiv HTML v3，2026-11-04 抓取；2026-11-05 复核命中）"
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
  - "跨条件迁移检查（不充当原范围反证）：空体素占比与体素分辨率定义绑定——若 ≈90% 仅在 0.4m 体素 / 200×200×16（80×80×6.4m）单一口径下成立、在更细常用分辨率（如 0.2m）下明显更低，则『90%』应降级为窄口径数字，不得作为占据预测稀疏化的通用动机跨口径引用"
review_due: 2027-02-02
related: [claim-drocc-bevdet4d-43p4-miou-occ3d]
signoff: null
---

## 我的理解

论文声称（asserted）：Occ3D-nuScenes 的占据网格里约 90% 体素是空的，所以"对所有体素均匀拟合"浪费容量，应先用深度线索构造 geometry-aware occupancy mask 聚焦非空体素，再两步精化。这与 [SparseOcc 的「约 80% 体素为空」](../library/3D_Occupancy/SparseOcc.md)（v1 §3.1，LSS 特征体素口径）是同类观察但口径不同：Dr.Occ 说的是标注网格，SparseOcc 说的是 LSS 特征体素，两条引用时都必须注明口径，不能互相换算。

注意：90% 这个数没有给出统计方法（哪一帧、哪一序列、是否含车体自身遮挡区域），falsifier 里放了可直接执行的复算路径。另注（本班整理者推断，尚未验证）：空体素占比与体素分辨率绑定——体素越细，物体表面占据的体素数相对越多，空体素占比通常随之下降，故 90% 不可跨分辨率口径直接换算。

## 待验证

- 下载 Occ3D-nuScenes 标注，统计全验证集空体素占比（0.4m、80×80×6.4m 口径），核对是否 ≈90%。
- 顺带统计 SparseOcc 的 LSS 口径与 GT 口径（80%/67%）在本机数据上的对应值，把三条口径注记收进两条笔记。

## 若成立 / 不成立意味着什么

成立：占用预测的稀疏化/掩码化设计（SparseOcc 剪枝、Dr.Occ 掩码、NJU 粗到细）共享同一物理依据，跨论文对比时"有效体素率"应作为标准口径注记。
不成立：90% 高估了空体素占比，掩码聚焦的动机减弱，需重新审视 D2-VFormer 消融增益（mIoU +5.44）的真实来源。

## 核查记录

- 2026-11-05（02 任务书 P1-B5 整理班）：表达整理，数字未改写。两条 quote 核对：论文句经本次实抓 arXiv v3 HTML（https://arxiv.org/html/2603.01007v3 ）逐字命中；笔记「30% occupancy」句 Grep 命中 DrOcc.md §2.2。falsifier 2 原为口径混排（0.2m 与 200×200×16 并列易误读、跨口径反例会冒充原范围反证），改写为显式「跨条件迁移检查」，并补分辨率-空体素占比的整理者推断注。id/status/stance/review_due/signoff 未动。
