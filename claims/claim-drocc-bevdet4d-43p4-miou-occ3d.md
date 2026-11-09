---
id: claim-drocc-bevdet4d-43p4-miou-occ3d
title: "Dr.Occ 论文声称：Occ3D-nuScenes 纯视觉设置下 BEVDet4D 加 Dr.Occ 后 mIoU 36.0→43.4（自报 +7.43% mIoU / +3.09% IoU），超过同表全部公开方法"
type: claim
status: asserted
scope: "Occ3D-nuScenes（850 标注场景、0.4m 体素、18 类）；BEVDet4D（R50，704×256，∗=相机掩码监督）+ D2-VFormer + R2-EFormer；训练 8×L20、24 epochs；指标：Table 1 逐类 mIoU（无总体 IoU 列）+ Table 2 消融 IoU/mIoU；自报 +7.43 mIoU 与表格舍入差（43.4−36.0=7.4）有 0.01 级缝隙，+3.09 IoU 出自 Table 2 消融行（73.45−70.36）而非 Table 1；数字为论文自报（arXiv HTML v3，2026-11-04 抓取）"
tags: [occupancy-prediction, drocc, cvpr2026, nuscenes]
note: library/3D_Occupancy/DrOcc.md#3-实验
paper: "CVPR 2026, Dr.Occ: Depth- and Region-Guided 3D Occupancy from Surround-View Cameras for Autonomous Driving (arXiv:2603.01007)"
stance: watch
evidence:
  - source: https://arxiv.org/html/2603.01007v3
    locator: "Abstract（抓取 2026-11-04）"
    quote: "Experiments on the Occ3D–nuScenes benchmark demonstrate that Dr.Occ improves the strong baseline BEVDet4D by 7.43% mIoU and 3.09% IoU under the full vision-only setting."
    relation: supports
  - source: library/3D_Occupancy/DrOcc.md
    locator: "§3.2 / Table 1 转录行"
    quote: "| BEVDet4D∗ [8] | R50 | 704×256 | 36.0 |"
    relation: supports
  - source: library/3D_Occupancy/DrOcc.md
    locator: "§3.2 / Table 1 转录行"
    quote: "| **BEVDet4D(+Dr.Occ)∗** | R50 | 704×256 | **43.4** |"
    relation: supports
falsifiers:
  - "第三方同设置复现 BEVDet4D+Dr.Occ 的 mIoU 明显低于 43.4（如 < 42.4），或增益 < 7 mIoU"
  - "复现发现 +7.43 依赖相机掩码监督（∗）之外论文未写明的额外监督或更长时间训练"
  - "同表其他公开方法（ViewFormer 41.9、FB-Occ 39.1）在官方实现下反超 43.4"
review_due: 2027-02-02
related: [claim-surroundocc-nuscenes-iou-3149-miou-2030-table-lead]
signoff: null
---

## 我的理解

论文声称（asserted）：纯视觉 3D 语义占用预测在 Occ3D-nuScenes 上，Dr.Occ 的两个组件——D2-VFormer（把 MoGe-2 稠密深度转成 geometry-aware occupancy mask 做引导，而非直接投影）与 R-EFormer/R2-EFormer（按距离×高度划分区域分配专家）——把 BEVDet4D 从 36.0 mIoU 拉到 43.4，超过同表 ViewFormer（41.9）、FB-Occ（39.1）等全部公开方法。

三个引用时必须带上的口径注记：

1. ∗ = 相机掩码监督训练（Table 1 caption），基线与 +Dr.Occ 都带该监督，属同口径对比，但与无 ∗ 方法（SparseOcc 30.9）跨口径。
2. +7.43 是正文精确值，表格舍入值只支持 ~7.4；+3.09 IoU 不是来自 Table 1（它没有总体 IoU 列），而是 Table 2 消融行 73.45−70.36。
3. COTR 行是作者重训（‡），官方权重不可得，见 [D3 卡](claim-drocc-cotr-plus-1p0-miou.md) 单独立卡。

## 待验证

- 复现 BEVDet4D∗ 基线（36.0）与 +Dr.Occ（43.4），重点核对相机掩码监督的实现细节。
- 对照 CVPR 2026 open access 版确认 Table 1 数值与 HTML v3 一致（论文无开源代码，需自行实现，成本高；至少先核对 camera-ready 数值未变）。

## 若成立 / 不成立意味着什么

成立：深度先验的"掩码引导"用法与区域专家是占用预测的有效组件，纯视觉占用 SOTA 推进到 ~43 mIoU 量级，占用主线（SparseOcc/SurroundOcc/COTR 之后）的新参照点。
不成立：+7.43 依赖特定监督或评测口径，Dr.Occ 回到与 FlashOcc/FB-Occ 同档，深度掩码思路降级为待验证假设。
