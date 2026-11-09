---
id: claim-surroundocc-3d-voxel-query-vertical-structure-advantage
title: "SurroundOcc 声称：显式 3D 体素查询在捕捉立交桥、电线杆等垂直结构上优于高度压缩的 BEV 查询"
type: claim
status: asserted
scope: "nuScenes 上 SurroundOcc 的显式 3D 体素查询 vs 高度压缩 BEV 查询的对比分析；笔记 §5.2 仅给定性结论，未附定量消融数字、指标与场景切片口径；本卡为窄卡，主张限定为「论文声称存在该优势」这一转述本身，不含优势幅度"
tags: [occupancy-prediction, 3d-voxel, bev, surroundocc, vertical-structure]
note: library/3D_Occupancy/SurroundOcc.md#52-关键消融实验结论
paper: "ICCV 2023 · SurroundOcc: Multi-Camera 3D Occupancy Prediction for Autonomous Driving · arXiv:2303.09551 · https://github.com/weiyithu/SurroundOcc"
stance: watch
evidence:
  - source: library/3D_Occupancy/SurroundOcc.md
    locator: "§5.2 关键消融实验结论"
    quote: "显式的 3D 体素查询比将高度压缩的 BEV 查询在捕捉立交桥、电线杆等垂直结构上具有明显优势"
    relation: supports
falsifiers:
  - "复现同配置的 3D 查询 vs BEV 查询消融：在含立交桥 / 电线杆的场景切片上，BEV 版本的 SC IoU 或垂直结构占用召回不低于 3D 版本"
  - "对照 arXiv:2303.09551 原文，发现该结论对应的定量证据与笔记转述不符（如消融变量并非查询形式，或结论有附加条件）"
  - "垂直结构优势无法归因于查询形式：换成同容量的 BEV + 高度扩展头后差距消失"
review_due: 2026-12-02
related: [claim-surroundocc-nuscenes-iou-3149-miou-2030-table-lead, claim-surroundocc-dense-gt-supervision-sc-iou-1196-to-3149]
signoff: null
---

## 我的理解

论文声称（据笔记 §5.2 转述）：以显式 3D 体素为查询（保留高度维）优于把高度压缩掉的 BEV 查询，差别集中体现在立交桥、电线杆等垂直结构上。这是笔记对「3D vs BEV」消融的定性总结——笔记没有给出任何数字，因此本卡只立窄主张：论文声称存在该优势；优势的幅度、指标（SC IoU？召回？）与场景切片口径笔记均未记录，须回原文。

限定与注意：
1. 「明显优势」是笔记措辞，非量化结论；不能直接引用「3D 查询比 BEV 好 X」这类量化表述。
2. 该结论与 §5.1 对比表（见 [对比表卡](claim-surroundocc-nuscenes-iou-3149-miou-2030-table-lead.md)）是两类证据：本卡是消融内部对比，不涉及跨方法排名。
3. 若原文该消融同样依赖密集真值监督（见 [消融卡](claim-surroundocc-dense-gt-supervision-sc-iou-1196-to-3149.md)），则结论前提包含该监督信号质量。

## 待验证

- 回 arXiv:2303.09551 找到该消融的定量表格与实验设置，确认「明显优势」对应的指标与数字。
- 用官方实现复现 3D 查询 vs BEV 查询消融，在垂直结构场景切片（立交桥 / 电线杆）上单独评测。
- 确认消融变量是否只有查询形式（容量、参数量是否对齐）。

## 若成立 / 不成立意味着什么

成立：涉及高架桥、杆状物等垂直结构的安全相关感知（本仓库关注方向）应避免高度压缩的 BEV 表示，3D 体素 / 稀疏 3D 查询为默认选项。
不成立：BEV 表示在垂直结构上并无劣势，垂直结构场景可用更省显存的 BEV 方案，3D 查询的额外开销需要另找理由。
