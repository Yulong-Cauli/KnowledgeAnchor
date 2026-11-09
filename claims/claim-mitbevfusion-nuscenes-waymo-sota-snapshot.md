---
id: claim-mitbevfusion-nuscenes-waymo-sota-snapshot
title: "MIT BEVFusion 自报 SOTA 快照：nuScenes test 70.2 mAP / 72.9 NDS（比 TransFusion +1.3/+1.3、MACs 1/1.9），Waymo test 85.7 mAP/L1（3 帧、单模型+TTA）"
type: claim
status: asserted
scope: "MIT Han Lab BEVFusion（ICRA 2023，arXiv:2205.13542，笔记按官方 HTML v3 2024-09-01 转写）的基准快照声明（论文自报）；nuScenes test：单模型无 TTA（Table I）；Waymo test：3 帧、单模型+测试时增强（†）的当时提交快照；快照时点=论文 HTML v3（2024-09-01），非当前榜单状态；SOTA 措辞按论文 caption（nuScenes 'without bells and whistles'、Waymo 'among all submissions'）；各对照数字见正文与 evidence"
tags: [bevfusion-mit, sota-snapshot, nuscenes, waymo, lidar-camera-fusion]
note: library/Multimodal_Fusion/MIT-BEVFusion.md#31-nuscenes-3d-检测table-iiv-a
paper: "ICRA 2023, BEVFusion: Multi-Task Multi-Sensor Fusion with Unified Bird's-Eye View Representation (arXiv:2205.13542, MIT Han Lab)"
stance: watch
evidence:
  - source: library/Multimodal_Fusion/MIT-BEVFusion.md
    locator: "§3.1 Table I TransFusion 行（nuScenes test/val）"
    quote: "| TransFusion [49] | C+L | 68.9 | 71.6 | 67.5 | 71.3 | 485.8 | 156.6 |"
    relation: supports
  - source: library/Multimodal_Fusion/MIT-BEVFusion.md
    locator: "§3.1 Table I BEVFusion (Ours) 行（nuScenes test/val）"
    quote: "| BEVFusion (Ours) | C+L | 70.2 | 72.9 | 68.5 | 71.4 | 253.2 | 119.2 |"
    relation: supports
  - source: library/Multimodal_Fusion/MIT-BEVFusion.md
    locator: "§3.1（§IV-A 原句，对 TransFusion 差值与效率）"
    quote: 'Compared with TransFusion [49], BEVFusion offers 1.3% improvement in test split mAP and NDS, while significantly reduces the MACs by 1.9 \times and measured latency by 1.3 \times .'
    relation: supports
  - source: library/Multimodal_Fusion/MIT-BEVFusion.md
    locator: "§3.2 Table II BEVFusion (Ours) † 行（Waymo test，3 帧，单模型+TTA）"
    quote: "| BEVFusion (Ours) † | 3 | 85.7 | 84.4 | 80.8 | 79.5 |"
    relation: supports
  - source: library/Multimodal_Fusion/MIT-BEVFusion.md
    locator: "§3.2（§IV-A 原句，Waymo 对 DeepFusion）"
    quote: "BEVFusion outperforms the previous state-of-the-art multi-modal detector, DeepFusion [3] with 60% of input frames."
    relation: supports
  - source: library/Multimodal_Fusion/MIT-BEVFusion.md
    locator: "§1（arXiv abs 页摘要原句）"
    quote: "It establishes the new state of the art on nuScenes, achieving 1.3% higher mAP and NDS on 3D object detection and 13.6% higher mIoU on BEV map segmentation, with 1.9x lower computation cost."
    relation: supports
  - source: https://arxiv.org/html/2205.13542v3
    locator: "Table I BEVFusion 行（官方 HTML v3，抓取 2026-11-03，与笔记行逐值一致）"
    quote: "BEVFusion (Ours) C+L 70.2 72.9 68.5 71.4 253.2 119.2"
    relation: supports
  - source: https://arxiv.org/html/2205.13542v3
    locator: 'Table II BEVFusion 行（官方 HTML v3，抓取 2026-11-03；† 后为 dagger 符号的 LaTeX 残留 {\dagger}，与笔记行逐值一致）'
    quote: 'BEVFusion (Ours) † {\dagger} 3 85.7 84.4 80.8 79.5'
    relation: supports
falsifiers:
  - "向 nuScenes 官方评测服务器提交同配置（单模型、无 TTA）复现，test mAP/NDS 低于 TransFusion 的 68.9/71.6（SOTA 不成立）或远低于自报 70.2/72.9（自报数字不实）"
  - "Waymo 官方榜复核：同配置（3 帧、单模型+TTA）mAP/L1 低于当时提交（如 MPPNet-Ens 85.0），或发现该提交实际使用了模型 ensemble（与论文自述 single model 矛盾）"
  - "复测 MACs/延迟：253.2G / 119.2ms @RTX3090 显著不符，1.9×/1.3× 效率差反转"
review_due: 2026-12-03
related: [claim-mitbevfusion-shared-bev-space-unified-fusion, claim-mitbevfusion-modality-importance-flips-bev-seg]
signoff: null
---

## 主张

论文声称：BEVFusion 在两个基准上同时取得 SOTA 且计算更低——nuScenes test 70.2 mAP / 72.9 NDS（单模型、无 TTA），比此前领先的 TransFusion（68.9 / 71.6）高 1.3 点，而 MACs 只有其 1/1.9（253.2G vs 485.8G）、延迟 1/1.3（119.2ms vs 156.6ms @RTX3090，8.4 FPS）；nuScenes val 68.5 / 71.4。Waymo test 以 3 帧、单模型+TTA 提交 85.7 mAP/L1 / 84.4 mAPH/L1（mAP/L2 80.8 / mAPH/L2 79.5），超过当时全部提交（含多模型 ensemble 的 MPPNet-Ens 85.0/83.7 与 3DAM-Ens 85.3/83.8，及用 5 帧的 DeepFusion-Ens）。效率来源是论文的设计主张（共享 BEV 空间充分利用全部相机特征，故可用更小相机分辨率）+ BEV pooling 优化。

口径注意：两表均为论文自报（Waymo 为官方提交、nuScenes test 为官方榜口径，但本库未独立复核）；快照截至论文 HTML v3（2024-09-01），当前榜单大概率已被超越，引用时作历史快照使用。

## 待验证

- 已核对（2026-11-03）：官方 HTML v3 的 Table I BEVFusion 行与 Table II BEVFusion 行均与笔记逐值一致（URL 见 evidence）；abs 页摘要 "1.3% higher mAP and NDS … 1.9x lower computation cost" 与笔记一致。
- 有余力时向 nuScenes 官方服务器复验 test 提交，或至少核对 nuScenes/Waymo 榜单存档确认该快照曾是榜一。
- 复测 MACs/延迟（同 RTX3090、同精度模式）核对 253.2G / 119.2ms。

## 成立/不成立的含义

成立：LiDAR+camera 融合可以在不增加计算预算的前提下超过 LiDAR-only/point-level 融合方案，作为多传感器检测的强基线进入选型清单。
不成立：复现达不到自报数字或效率差反转，则该 SOTA 主张降级为「与 TransFusion 相当」，选型依据回退到复现结果。
