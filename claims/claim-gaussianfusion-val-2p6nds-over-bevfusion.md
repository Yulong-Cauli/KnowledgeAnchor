---
id: claim-gaussianfusion-val-2p6nds-over-bevfusion
title: "GaussianFusion 论文声称：nuScenes 3D 检测 val 上 74.0 NDS / 71.7 mAP，超 BEVFusion(M) +2.6 NDS / +3.2 mAP"
type: claim
status: asserted
scope: "nuScenes val（val split，非 test）；C+L 多模态；Swin-T（相机）+ VoxelNet（LiDAR），follow BEVFusion(M)；图像 704×256、点云体素 0.075m、BEV 200×200、20 epochs、8×A800；指标 NDS/mAP（Table 2）；同表还列 MSMDFusion 72.1/69.3、UniTR 73.3/70.5、EA-LSS 73.1/71.2；对照数字部分转引自原论文；数字为论文自报（arXiv HTML v1，2026-11-04 抓取）；尚未独立验证"
tags: [lidar-camera-fusion, gaussianfusion, iclr2026, nuscenes, 3d-detection]
note: library/Multimodal_Fusion/GaussianFusion.md#3-实验
paper: "ICLR 2026, GaussianFusion: Unified 3D Gaussian Representation for Multi-Modal Fusion Perception (arXiv:2607.00746)"
stance: watch
evidence:
  - source: https://arxiv.org/html/2607.00746v1
    locator: "§4.3（抓取 2026-11-04）"
    quote: "Specifically, compared with BEVFusion (Liu et al., 2023b), our GaussianFusion achieves +2.6 NDS and +3.2 mAP on val split by exploring a more natural continuous Gaussian cross-modal complementary fusion."
    relation: supports
  - source: https://arxiv.org/html/2607.00746v1
    locator: "§4.3（抓取 2026-11-04）"
    quote: "As shown in Table 2, GaussianFusion achieves SOTA results compared to previous discrete BEV representation multimodal fusion methods(Liu et al., 2023b; Ge et al., 2023; Wang et al., 2023a; Hu et al., 2023b) on nuScenes dataset, achieving 74.0 NDS and 71.7 mAP on the val split."
    relation: supports
falsifiers:
  - "同配置（Swin-T+VoxelNet、704×256、0.075m、200×200 BEV、20 epochs）复现 val NDS ≤ 71.4（即不超过 BEVFusion(M) 基线）"
  - "官方 BEVFusion 复现显著高于 71.4/68.5（如训练更久或多尺度增强），使 +2.6/+3.2 增量不成立"
  - "复现发现 74.0 依赖论文未写明的额外组件（如更长时序、更大 backbone 或 TTA）"
review_due: 2027-02-02
related: [claim-mitbevfusion-nuscenes-waymo-sota-snapshot, claim-msmdfusion-nuscenes-test-sota-single-model]
signoff: null
---

## 我的理解

论文声称（asserted，尚未独立验证）：把多模态融合的统一空间从离散 BEV 网格换成连续 3D 高斯（前向投影初始化 μ + 共享 Gaussian Encoder + GMM 聚合），nuScenes 检测 val 74.0 NDS / 71.7 mAP，比同配置 BEVFusion(M)（71.4/68.5）高 +2.6 NDS / +3.2 mAP，也高于同表 UniTR/EA-LSS/MSMDFusion。

三个口径注记：

1. 这是 **val** 口径；[MIT BEVFusion 的 70.2 mAP SOTA 快照卡](claim-mitbevfusion-nuscenes-waymo-sota-snapshot.md)是 **test** 口径，Table 2 里 BEVFusion test 行 72.9/70.2 与该卡一致——引用时 val/test 别混。
2. Table 2 的对照（UniTR/EA-LSS 等）分辨率与骨干不一（UniTR 未注明、EA-LSS 同配置），跨行比较要逐行看配置列。
3. 论文的 Waymo 泛化实验（Table 6）未注明 split（笔记遗留），本卡不涉及。

## 待验证

- 按官方配置（若开源）复现 74.0/71.7；未开源则先复现 BEVFusion(M) 71.4/68.5 锚点。
- 用 [MSMDFusion 卡](claim-msmdfusion-nuscenes-test-sota-single-model.md) 的 test 口径对照：GaussianFusion test 74.9/72.4 vs MSMDFusion 74.0/71.5，确认增量在 test 口径是否保持。

## 若成立 / 不成立意味着什么

成立：连续高斯融合空间在检测主线上成立，BEV 网格不再是融合的唯一统一表示，融合主线（BEVFusion/MSMDFusion 之后）多一条路线候选。
不成立：+2.6 NDS 依赖配置或对照口径，高斯表示回到与 BEV 网格打平的水平，只作记录。
