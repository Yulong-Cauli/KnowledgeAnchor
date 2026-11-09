---
id: claim-sparseocc-decomposed-kernel-beats-full-kernel
title: "SparseOcc 声称：单个补全块下，分解 3D 核比同数量 3×3×3 普通卷积高 IoU 0.7 / mIoU 0.9（36.5/13.1 vs 35.8/12.2），且两者均高于无补全块（35.5/12.1）"
type: claim
status: asserted
scope: "笔记 §4.2 消融表（Table 3）；笔记未注明该消融的数据集、体素分辨率与训练配置；消融表数值区间（IoU 35.5-36.5 / mIoU 12.1-13.1）与主表（IoU 21.8 / mIoU 14.1）不一致，应为不同评测口径，故本卡只主张同表内三行的相对序（分解 > 普通 > 无补全，补全块数量对齐），不涉及绝对数值；自报数字"
tags: [occupancy-prediction, sparse-3d, sparse-conv, sparseocc, ablation]
note: library/3D_Occupancy/SparseOcc.md#42-消融实验补全块设计-table-3
paper: "CVPR 2024 · SparseOcc: Rethinking Sparse Latent Representation for Vision-Based Semantic Occupancy Prediction · arXiv:2404.09502 · https://github.com/VISION-SJTU/SparseOcc"
stance: watch
evidence:
  - source: library/3D_Occupancy/SparseOcc.md
    locator: "§4.2 / Table 3"
    quote: "| **分解卷积** | **1**    | **分解 3D 核**        | **36.5** | **13.1** |"
    relation: supports
  - source: library/3D_Occupancy/SparseOcc.md
    locator: "§4.2 / Table 3"
    quote: '| 普通卷积     | 1        | $3 \times 3 \times 3$ | 35.8     | 12.2     |'
    relation: supports
  - source: library/3D_Occupancy/SparseOcc.md
    locator: "§4.2 / Table 3"
    quote: "| 无补全       | 0        | -                     | 35.5     | 12.1     |"
    relation: supports
  - source: library/3D_Occupancy/SparseOcc.md
    locator: "§4.2 / Table 3"
    quote: "- **分析**：分解后的正交卷积内核比传统的 full kernel 具有更强的表达能力，且能更有效地利用驾驶场景的几何形状先验。"
    relation: supports
falsifiers:
  - "同设置复现中，分解核补全块的 IoU 或 mIoU 不高于同数量 full-kernel 普通卷积补全块（即 36.5/13.1 vs 35.8/12.2 的差距不可复现或反转）"
  - "原文 Table 3 中三行并非受控对比（补全块数量、内核大小、训练配置不一致），相对序失去受控比较意义"
  - "对照 arXiv:2404.09502 原文 Table 3 核对发现笔记转抄错误（数字或配置列不符）"
review_due: 2026-12-02
related: [claim-sparseocc-miou141-beats-dense-baselines, claim-sparseocc-flops-749pct-below-dense]
signoff: null
---

## 我的理解

论文声称（据笔记 §4.2 Table 3 转述）：补全块数量同为 1 时，分解 3D 核（把 k×k×k 核分解为三个正交的 k×k×1、k×1×k、1×k×k 核）优于 full 3×3×3 核——IoU 36.5 vs 35.8（+0.7）、mIoU 13.1 vs 12.2（+0.9）；且两者均高于无补全块（35.5 / 12.1）。

限定与注意（本卡为何立窄）：

1. 差异幅度小：IoU +0.7 约为该表量级的 2% 相对提升，单次消融不排除训练随机性。
2. 消融表的绝对数值与主表不一致（此处 IoU 35.5-36.5 / mIoU 12.1-13.1，主表 IoU 21.8 / mIoU 14.1），笔记未解释，说明两者不是同一评测口径（数据集或体素分辨率不同）——因此本卡只主张同表内的相对序，不把 36.5/13.1 当作 SparseOcc 在 nuScenes-Occupancy 主基准上的成绩。
3. 笔记未注明消融的数据集、分辨率与训练配置；「分解核利用驾驶场景几何先验」是笔记转述的论文归因，非独立结论。

## 待验证

- 回原文 Table 3 核对三行数字与配置列（数据集、块数、内核、训练轮数）。
- 在官方仓库（github.com/VISION-SJTU/SparseOcc）找到对应消融配置复跑，确认分解核 vs full kernel 的差距方向与幅度。

## 若成立 / 不成立意味着什么

成立：驾驶场景的几何先验（扁平路面、垂直建筑）可以通过核分解以近零参数代价注入 3D 稀疏卷积，稀疏占据主干的补全块设计可直接复用该模式。
不成立：分解核优势不显著或不可复现，稀疏补全块退回常规稀疏卷积即可，方法部分的「内核分解」不作为选型依据。
