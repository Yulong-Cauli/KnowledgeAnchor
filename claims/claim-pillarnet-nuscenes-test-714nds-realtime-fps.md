---
id: claim-pillarnet-nuscenes-test-714nds-realtime-fps
title: "PillarNet 论文声称（nuScenes test 快照，截至 arXiv v5 2022-08-26）：PillarNet-vgg/18/34 达 69.6/70.8/71.4 NDS（63.3/65.0/66.0 mAP），以 14/13/12 FPS 实时运行，超过 2022-03-07 榜上全部已发表 LiDAR-only 非集成方法"
type: claim
status: asserted
scope: "nuScenes test set（官方 700/150/150 划分的 test split，150 序列）；LiDAR-only 单模型，无模型 ensemble（唯一例外是 CenterPoint 式 double-flip test-time augmentation，§4）；三变体 PillarNet-vgg / PillarNet-18 / PillarNet-34（复杂度分别对齐 VGGNet / ResNet-18 / ResNet-34，§3.2）；FPS 为论文自报推理速度，硬件口径 = i9 CPU + RTX 3090 桌面机（§4 runtime 对比设置），不是车规平台实测；'超过全部已发表 LiDAR-only 非集成方法'是论文对 2022-03-07 leaderboard 快照的自报说法，不主张当前仍成立；论文声称，尚未独立验证；Waymo 结果（Table 2/3）与 encoder/OD-IoU 消融不在此卡（另有专卡）"
tags: [pillarnet, 3d-detection, nuscenes, lidar, pillar-based, real-time, benchmark-snapshot]
note: library/BEV_Detection/PillarNet.md#32-nuscenes-test-set
paper: "ECCV 2022, PillarNet: Real-Time and High-Performance Pillar-based 3D Object Detection (arXiv:2205.07403)"
stance: watch
evidence:
  - source: library/BEV_Detection/PillarNet.md
    locator: '§3.2 / Table 1（逐行照抄 ar5iv 渲染）'
    quote: '| PillarNet-vgg | One | 69.6 | 63.3 | 86.9 | 56.0 | 62.2 | 62.0 | 28.6 | 86.3 | 62.6 | 33.5 | 79.6 | 75.6 |'
    relation: supports
  - source: library/BEV_Detection/PillarNet.md
    locator: '§3.2 / Table 1（逐行照抄 ar5iv 渲染）'
    quote: '| PillarNet-18 | One | 70.8 | 65.0 | 87.4 | 56.7 | 60.9 | 61.8 | 30.4 | 87.2 | 67.4 | 40.3 | 82.1 | 76.0 |'
    relation: supports
  - source: library/BEV_Detection/PillarNet.md
    locator: '§3.2 / Table 1（逐行照抄 ar5iv 渲染）'
    quote: '| PillarNet-34 | One | 71.4 | 66.0 | 87.6 | 57.5 | 63.6 | 63.1 | 27.9 | 87.3 | 70.1 | 42.3 | 83.3 | 77.2 |'
    relation: supports
  - source: library/BEV_Detection/PillarNet.md
    locator: '§3.2 正文要点（§4.1）'
    quote: all our PillarNet-vgg/18/34 go beyond the stage-of-the-art methods by a large margin while running at a real-time speed of 14, 13 and 12 FPS, respectively
    relation: supports
  - source: library/BEV_Detection/PillarNet.md
    locator: '§1.3 主要结果速览（§4.1）'
    quote: surpasses all the published LiDAR-only non-ensemble methods on the nuScenes Detection leaderboard on Mar 7, 2022
    relation: supports
  - source: library/BEV_Detection/PillarNet.md
    locator: '§3.1 实验设置（§4）'
    quote: we do not use any model ensembling except double-flip test-time augmentation as CenterPoint
    relation: supports
  - source: https://ar5iv.labs.arxiv.org/html/2205.07403
    locator: '§4.1（ar5iv 全文 HTML，2026-11-03 抓取）'
    quote: all our PillarNet-vgg/18/34 go beyond the stage-of-the-art methods by a large margin while running at a real-time speed of 14, 13 and 12 FPS, respectively
    relation: supports
  - source: https://ar5iv.labs.arxiv.org/html/2205.07403
    locator: '§4（ar5iv 全文 HTML，2026-11-03 抓取）'
    quote: We make runtime comparison with two baselines ( i.e., CenterPoint-SECOND and CenterPoint-PointPillars ) on desktop equipped with an i9 CPU and RTX 3090 GPU
    relation: supports
  - source: https://ar5iv.labs.arxiv.org/html/2205.07403
    locator: '§4（ar5iv 全文 HTML，2026-11-03 抓取）'
    quote: we do not use any model ensembling except double-flip test-time augmentation as CenterPoint
    relation: supports
falsifiers:
  - "nuScenes 官方 test 评测服务器或第三方复现中，任一变体 NDS 低于自报值（vgg 69.6 / 18 70.8 / 34 71.4）或 mAP 低于 63.3/65.0/66.0"
  - "同硬件口径（i9 CPU + RTX 3090 桌面机、官方开源实现 github.com/agent-sgs/PillarNet）实测任一变体 FPS 明显低于 14/13/12（如 <10 FPS），或 FPS 口径实为其他硬件"
  - "查得 2022-03-07 前已发表的 LiDAR-only 非集成方法在 nuScenes test 上 NDS ≥ 71.4，推翻'超过全部已发表同类方法'的快照声明"
review_due: 2026-12-03
related: [claim-pillarnet-sparse2dcnn-encoder-decouple-pillar-size, claim-pillarnet-od-diou-decouple-orientation-regression]
signoff: null
---

## 我的理解

这是 PillarNet 论文的 nuScenes test 精度-速度快照卡：三个 encoder 尺寸（vgg / ResNet-18 / ResNet-34 复杂度对齐）在 nuScenes test split 上自报 69.6 / 70.8 / 71.4 NDS、63.3 / 65.0 / 66.0 mAP，对应 14 / 13 / 12 FPS。三个前提必须一起记住：

1. **FPS 口径是桌面机**：论文 §4 明确 runtime 对比在 "an i9 CPU and RTX 3090 GPU" 的桌面机上进行。"real-time" 是桌面 GPU 意义上的实时，不能直接外推到车规 SoC（Orin 等）——跨硬件引用时必须带口径。
2. **非集成但有 TTA**：nuScenes test 上无模型 ensemble，但保留了 CenterPoint 式 double-flip test-time augmentation；与完全无 TTA 的方法对比时有轻微口径差。
3. **"超榜"是时间锚定快照**：论文的 "surpasses all the published LiDAR-only non-ensemble methods" 限定在 2022-03-07 的 leaderboard 快照，且自报时点为 arXiv v5（2022-08-26）；2026 年的榜早已被刷新，引用时必须带日期。

数字已于 2026-11-03 实抓 ar5iv 全文 HTML（https://ar5iv.labs.arxiv.org/html/2205.07403 ）复核：Table 1 三行 NDS/mAP 与 §4.1 的 "14, 13 and 12 FPS" 句、i9+RTX 3090 硬件句、double-flip TTA 句均逐字命中。同篇 encoder 消融（+7.61 mAP/+5.94 NDS）与 OD-IoU 消融见 related 两张专卡；本卡不重复其内容。

## 待验证

- 用官方仓库（github.com/agent-sgs/PillarNet）在 RTX 3090 桌面机复测三变体 FPS 与精度，确认 14/13/12 FPS 与 69.6/70.8/71.4 NDS 可复现（含 double-flip TTA 开关的口径区分）。
- 查 nuScenes Detection leaderboard 存档，确认 2022-03-07 时点上 LiDAR-only 非集成组的最高 NDS 确低于 71.4。
- 若要用于车规部署论证：在目标平台（如 Orin）实测，本卡数字不构成依据。

## 若成立 / 不成立意味着什么

成立：pillar-based（纯 2D 卷积）路线在 2022 年中可以达到与 voxel-based 二阶段方法相当或更高的 nuScenes test 精度、同时保持桌面机实时速度，可作为"LiDAR-only 实时检测"选型里的低成本基线快照（须带时间与硬件口径）。
不成立：精度或速度数字依赖特定口径（TTA、桌面 GPU、快照时点），选型时应回退到 CenterPoint 系 voxel 方法或按目标硬件重测；"pillar 系追平 voxel 系"的叙事需重新审视。
