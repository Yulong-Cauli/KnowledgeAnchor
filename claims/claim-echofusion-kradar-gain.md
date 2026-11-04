---
id: claim-echofusion-kradar-gain
title: "EchoFusion 在 KRadar-20 上显著优于 RTNH 点云基线"
type: claim
status: asserted
scope: "KRadar-20 trainval/test；KITTI protocol（40 recall positions）；EchoFusion RA+C vs RTNH 点云基线；数字为论文自报（Table 4，arXiv:2307.16532v2 PDF 文本层，2026-11-05 实抓逐值核对），尚未独立验证"
tags: [radar, sensor-fusion, echofusion, kradar]
note: library/3D_Occupancy/EchoFusion.md#3-实验结果
paper: "NeurIPS 2023, Echoes Beyond Points: Unleashing the Power of Raw Radar Data in Multi-modality Fusion"
stance: watch
evidence:
  - source: https://arxiv.org/abs/2307.16532
    locator: "Table 4 / p.8（arXiv:2307.16532v2 PDF 文本层，pdftotext -layout 提取、列间空格为排版对齐；2026-11-05 实抓逐值复核）"
    quote: "KRadar-20-trainval  RTNH[35]    61.38  46.47      10.47    53.05  17.98     3.03"
    relation: supports
  - source: https://arxiv.org/abs/2307.16532
    locator: "Table 4 / p.8（arXiv:2307.16532v2 PDF 文本层，pdftotext -layout 提取、列间空格为排版对齐；2026-11-05 实抓逐值复核）"
    quote: "KRadar-20-trainval  EchoFusion  69.95  57.28      33.07    68.35  43.87     14.00"
    relation: supports
falsifiers:
  - "在同一 KRadar-20 划分与 KITTI 评测协议下复现，增益消失或大幅缩小"
  - "RTNH 基线未调优，或输入模态/训练预算不对等"
  - "KRadar-20 子集的结果不能代表完整 KRadar 或真实部署条件"
review_due: 2026-11-30
related: [claim-echofusion-3d-ap-below-lidar, claim-echofusion-paa-not-isolated]
signoff: null
---

## 我的理解

论文 Table 4 报告（数字尚未独立验证）：KRadar-20 test split 上 EchoFusion（RA map+图像）的 BEV AP@0.7 是 **33.07 vs 10.47**，3D AP@0.7 是 **14.00 vs 3.03**（vs RTNH 点云基线）。这是论文除 RADIal 外的第二个数据集证据，说明“原始/半原始雷达 + 图像”在 4D 雷达数据上也有明显增益。但绝对 3D AP 仍只有 14.00，且 RTNH 在 AP@0.7 上本身很弱，不能据此宣称已接近 LiDAR。

## 待验证

- 已核对（2026-11-05）：本班二次实抓 arXiv:2307.16532v2，PDF 文本层 Table 4 两行逐值命中；表头为 BEV AP@0.3/0.5/0.7 与 3D AP@0.3/0.5/0.7 各三列，33.07/10.47 为 BEV AP@0.7、14.00/3.03 为 3D AP@0.7，与卡内读法一致；表题为 KRadar Dataset test split + KITTI protocol，EchoFusion 输入为 RA map + image（§5.2.2）。
- 核对 KRadar-20 的 train/val/test 划分和 KITTI 40 recall 协议是否与 RTNH 基线完全一致。
- 检查 RTNH 是否经过同等调参；若基线未调优，增益会被高估。
- 在完整 KRadar 或另一个 4D 雷达数据集上复核，避免子集选择偏差。

## 若成立 / 不成立意味着什么

成立则 EchoFusion 的结论不只适用于 RADIal，值得在 4D 雷达数据上继续验证；不成立则说明增益可能依赖特定数据集或弱基线，跨数据集有效性仍待证明。
