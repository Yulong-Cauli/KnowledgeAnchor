---
id: claim-gaussianfusion-forward-projection-init-2p8nds
title: "GaussianFusion 论文自报消融：前向投影初始化比随机初始化 +2.8 NDS（74.0 vs 71.2），并优于 backward projection（72.4）"
type: claim
status: asserted
scope: "nuScenes 3D 检测 val 消融（Table 8；注意 §4.5 正文把该表误称为 Table 9，本卡按表 caption 编号引用，见笔记遗留）；C+L 全配置，仅初始化策略不同；Lidar projection 初始化 73.6 与 forward 74.0 相当；随机初始化 71.2 / mAP 68.3；数字为论文自报（arXiv HTML v1，2026-11-04 抓取）；尚未独立验证"
tags: [lidar-camera-fusion, gaussianfusion, iclr2026, nuscenes, ablation]
note: library/Multimodal_Fusion/GaussianFusion.md#3-实验
paper: "ICLR 2026, GaussianFusion: Unified 3D Gaussian Representation for Multi-Modal Fusion Perception (arXiv:2607.00746)"
stance: watch
evidence:
  - source: https://arxiv.org/html/2607.00746v1
    locator: "§4.5（抓取 2026-11-04）"
    quote: "The forward projection and Lidar projection strategies show comparable performance (74.0 NDS v.s 73.6 NDS), both outperforming the backward projection method (72.4 NDS). Notably, the forward projection strategy brings a significant improvement of +2.8 NDS over random initialization."
    relation: supports
  - source: library/Multimodal_Fusion/GaussianFusion.md
    locator: "§3.8 / Table 8 转录"
    quote: "| Random Initialization | 71.2 | 68.3 |"
    relation: supports
  - source: library/Multimodal_Fusion/GaussianFusion.md
    locator: "§3.8 / Table 8 转录"
    quote: "| Forward Projection | 74.0 | 71.7 |"
    relation: supports
falsifiers:
  - "复现消融中 forward projection ≤ random initialization，或增量显著小于 +2.8 NDS"
  - "复现发现 +2.8 主要来自初始化以外的耦合差异（如不同学习率/训练时长），控制变量后增量消失"
review_due: 2027-02-02
related: [claim-gaussianfusion-val-2p6nds-over-bevfusion, claim-gaussianfusion-c-occ-1p55-miou-vs-gaussianformer]
signoff: null
---

## 我的理解

论文声称（asserted，尚未独立验证）：高斯初始化策略本身就是可观的收益来源——同一模型只换初始化，前向投影（LSS 深度分布直接作高斯中心初值）74.0 NDS > LiDAR 投影 73.6 > backward projection（BEVFormer 式）72.4 > 随机初始化 71.2。forward 对 random 的 +2.8 NDS 比很多结构改动都大，支撑"GaussianFormer 的随机初始化是高斯感知主要瓶颈"的论断。

口径注记：论文 §4.5 正文把该表称为 Table 9，但表 caption 是 Table 8（HTML 内部矛盾，笔记遗留有记录）；backward projection / Lidar projection 的实现细节在未随 HTML 发布的 Appendix 里，独立复现需等代码。

## 待验证

- 控制变量复现四种初始化（若开源）；至少先复现 random vs forward 两端。
- 核对 PDF 版本中该表的真实编号与数值。

## 若成立 / 不成立意味着什么

成立：3DGS 感知方法的初始化应作为标准消融维度，GaussianFormer 系（含库内关注的占用线）的改进空间先看初始化。
不成立：+2.8 是与训练配置耦合的产物，初始化策略收益存疑。
