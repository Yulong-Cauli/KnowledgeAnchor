---
id: claim-mitbevfusion-modality-importance-flips-bev-seg
title: "MIT BEVFusion 声称模态重要性随任务翻转：nuScenes 检测上 LiDAR-only 领先 camera-only 约 20 mAP，而 BEV 地图分割上 camera-only BEVFusion 反超 LiDAR-only 基线 8–13% mIoU"
type: claim
status: asserted
scope: "MIT Han Lab BEVFusion（ICRA 2023，arXiv:2205.13542，笔记按官方 HTML v3 2024-09-01 转写）的实验观察声明（论文声称）；nuScenes val；BEV 地图分割为 6 类（drivable / ped-crossing / walkway / stop line / carpark / divider）IoU 均值口径、评测区域 [-50m,50m]²（§IV-B）；分割/检测两侧对照数字见正文与 evidence；本卡不主张多模态 BEVFusion 62.7 mIoU 的 SOTA 数字（归 SOTA 快照卡）"
tags: [bevfusion-mit, modality-balance, map-segmentation, nuscenes]
note: library/Multimodal_Fusion/MIT-BEVFusion.md#33-bev-地图分割table-iiiiv-b
paper: "ICRA 2023, BEVFusion: Multi-Task Multi-Sensor Fusion with Unified Bird's-Eye View Representation (arXiv:2205.13542, MIT Han Lab)"
stance: watch
evidence:
  - source: library/Multimodal_Fusion/MIT-BEVFusion.md
    locator: "§3.3（§IV-B 原句，翻转观察）"
    quote: "our camera-only BEVFusion model outperforms LiDAR-only baselines by 8-13%. This observation is the exact opposite of results in Table I, where state-of-the-art camera-only 3D detectors got outperformed by LiDAR-only detectors by almost 20 mAP."
    relation: supports
  - source: library/Multimodal_Fusion/MIT-BEVFusion.md
    locator: "§3.3 Table III BEVFusion（C）行（mean IoU 56.6）"
    quote: "| BEVFusion (Ours) | C | 81.7 | 54.8 | 58.4 | 47.4 | 50.7 | 46.4 | 56.6 |"
    relation: supports
  - source: library/Multimodal_Fusion/MIT-BEVFusion.md
    locator: "§3.3 Table III CenterPoint（L）行（mean IoU 48.6）"
    quote: "| CenterPoint [17] | L | 75.6 | 48.4 | 57.5 | 36.5 | 31.7 | 41.9 | 48.6 |"
    relation: supports
  - source: library/Multimodal_Fusion/MIT-BEVFusion.md
    locator: "§3.3 Table III PointPillars（L）行（mean IoU 43.8）"
    quote: "| PointPillars [10] | L | 72.0 | 43.1 | 53.1 | 29.7 | 27.7 | 37.5 | 43.8 |"
    relation: supports
  - source: library/Multimodal_Fusion/MIT-BEVFusion.md
    locator: "§3.3 Table I 检测侧对照两行（CenterPoint L 59.6 vs BEVFormer C 41.6，val mAP）"
    quote: "| CenterPoint [17] | L | 60.3 | 67.3 | 59.6 | 66.8 | 153.5 | 80.7 |"
    relation: supports
  - source: library/Multimodal_Fusion/MIT-BEVFusion.md
    locator: "§3.3 Table I BEVFormer 行（检测侧对照）"
    quote: "| BEVFormer [43] | C | 44.5 | 53.5 | 41.6 | 51.7 | – | – |"
    relation: supports
  - source: library/Multimodal_Fusion/MIT-BEVFusion.md
    locator: "§3.3 评测口径（§IV-B 原句）"
    quote: 'For each frame, we only perform the evaluation in the [-50m, 50m] \times [-50m, 50m] region around the ego car following [6, 8, 41, 43].'
    relation: supports
  - source: https://arxiv.org/html/2205.13542v3
    locator: "§IV-B（官方 HTML v3，抓取 2026-11-03，与笔记引句一致）"
    quote: "got outperformed by LiDAR-only detectors by almost 20 mAP"
    relation: supports
falsifiers:
  - "在 nuScenes val、同 6 类 IoU 口径与 [-50m,50m]² 区域复现：camera-only BEVFusion mean IoU 不高于 LiDAR-only 基线（PointPillars/CenterPoint），翻转不成立"
  - "检测侧复现中 camera-only 与 LiDAR-only 的 mAP 差远小于 Table I 的约 18 点（如新 camera-only 检测器已追平 LiDAR-only），『exact opposite』的对照前提失效"
  - "翻转只在个别类别（如 drivable area）成立而 mean IoU 口径下不成立，或依赖特定阈值选取"
review_due: 2026-12-03
related: [claim-mitbevfusion-shared-bev-space-unified-fusion, claim-mitbevfusion-nuscenes-waymo-sota-snapshot]
signoff: null
---

## 主张

论文声称：模态重要性随任务类型翻转——3D 检测上 LiDAR-only 明显强于 camera-only（Table I：CenterPoint 59.6 vs BEVFormer 41.6 val mAP，约 18 点，论文称 almost 20），但在 BEV 地图分割上恰好相反：camera-only 的 BEVFusion（mean IoU 56.6）反超 LiDAR-only 基线（PointPillars 43.8、CenterPoint 48.6）8–13 点（Table III，6 类 IoU 均值、[-50m,50m]² 区域）。这也是对 point-level 融合的间接否定：PointPainting/MVP 这类把相机信息绑在 LiDAR 点上的方法在分割上几乎无效（49.1 / 49.0），因为它们预设了 LiDAR 是更强模态。对设计「模态均衡」的含义：融合框架不应把相机特征当作 LiDAR 的附属品，语义类任务中相机才是主模态。

注意边界：camera-only BEVFusion 56.6 依赖其共享 BEV 框架 + 相机 BEV 变换，不是任意 camera-only 模型都达得到；翻转结论绑定 nuScenes val 的 6 类地图分割口径。

## 待验证

- 复现 Table III 的三行（BEVFusion-C 56.6、CenterPoint-L 48.6、PointPillars-L 43.8），核对 8–13 点差。
- 已核对（2026-11-03）：官方 HTML v3 中 "got outperformed by LiDAR-only detectors by almost 20 mAP" 句与 Table III BEVFusion-C 行（81.7 … 56.6）、CenterPoint-L 行（75.6 … 48.6）均与笔记一致（URL 见 evidence）。
- 用官方分割头对调模态（camera-only vs LiDAR-only 各训一版）验证翻转是否稳健于训练配方。

## 成立/不成立的含义

成立：多传感器方案按任务分配模态权重——检测以 LiDAR 为主、地图/语义分割以相机为主，融合框架必须保留两侧信息才能两头受益。
不成立：分割上 LiDAR 仍占优或翻转只在特定类别成立，则「模态均衡」论述降级，融合设计继续以 LiDAR 为主模态、相机作辅助。
