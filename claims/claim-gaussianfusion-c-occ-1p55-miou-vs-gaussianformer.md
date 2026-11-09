---
id: claim-gaussianfusion-c-occ-1p55-miou-vs-gaussianformer
title: "GaussianFusion 论文声称：相机支路 GaussianFusion-C 以约 30% 高斯数（43,296 vs 140,000）与约 4.5× 推理速度（105ms vs 475ms）取得 20.65 vs 19.10 mIoU（+1.55）"
type: claim
status: asserted
scope: "nuScenes 占用 val（语义场景补全口径，IoU/mIoU follow SurroundOcc，Table 5/Table 7）；camera-only（GaussianFusion-C 支路）；对照 GaussianFormer；延迟口径论文未注明硬件与 batch（Table 7 只有 ms）；数字为论文自报（arXiv HTML v1，2026-11-04 抓取）"
tags: [occupancy-prediction, gaussianfusion, iclr2026, nuscenes]
note: library/Multimodal_Fusion/GaussianFusion.md#3-实验
paper: "ICLR 2026, GaussianFusion: Unified 3D Gaussian Representation for Multi-Modal Fusion Perception (arXiv:2607.00746)"
stance: watch
evidence:
  - source: https://arxiv.org/html/2607.00746v1
    locator: "§4.4（抓取 2026-11-04）"
    quote: "More importantly, benefiting from our proposed Gaussian initialization strategy and iterative update mechanism, GaussianFusion-C achieves a 1.55 mIoU improvement and nearly 4.5× computational efficiency compared to GaussianFormer, while using only 30% of the Gaussians, as shown in Table 7."
    relation: supports
  - source: library/Multimodal_Fusion/GaussianFusion.md
    locator: "§3.7 / Table 7 转录"
    quote: "| GaussianFormer | 140,000 | 19.10 | 475 ms |"
    relation: supports
  - source: library/Multimodal_Fusion/GaussianFusion.md
    locator: "§3.7 / Table 7 转录"
    quote: "| GaussianFusion-C | 43,296 | 20.65 | 105 ms |"
    relation: supports
falsifiers:
  - "原文核查：重新抓取 arXiv（或对照 PDF/ar5iv）发现 §4.4 增量句或 Table 7 两行数字与本卡所引不符（笔记与原句均为单源 HTML v1 抓取，未与 PDF/ar5iv 交叉核对）"
  - "同设置复现 GaussianFormer mIoU ≥ 20.65，或 GaussianFusion-C ≤ 19.10"
  - "复现的高斯数比（43,296/140,000 ≈ 31%）或延迟比（475/105 ≈ 4.5×）明显偏离论文口径（如延迟在同级 GPU 上 > 2×）"
review_due: 2027-02-02
related: [claim-surroundocc-nuscenes-iou-3149-miou-2030-table-lead, claim-gaussianfusion-val-2p6nds-over-bevfusion]
signoff: null
---

## 我的理解

论文声称（asserted）：同样是相机高斯路线，GaussianFusion-C 用"前向投影初始化 + 共享编码器增量更新"替代 GaussianFormer 的"随机初始化 + 每层重预测"，以约 30% 的高斯数和约 4.5× 的推理速度把 mIoU 从 19.10 提到 20.65。同表（Table 5）里它也高于 SurroundOcc 的 20.30 与 TPVFormer 的 17.10——即"高斯表示 + 好的初始化"在相机占用线上追平了 BEV/TPV 稠密路线。

注意两点：

1. 20.65 是 **IoU 32.48 / mIoU 20.65** 里的 mIoU；对比 [SurroundOcc 卡](claim-surroundocc-nuscenes-iou-3149-miou-2030-table-lead.md)（31.49/20.30）时两行 IoU 差 1.0、mIoU 差 0.35，主张只在 mIoU 侧成立优势，IoU 侧也是领先的但幅度更小。
2. 延迟的硬件/batch 口径论文没写（笔记遗留），4.5× 不可跨硬件引用。

## 待验证

- 复现 GaussianFormer（开源）19.10 锚点与 GaussianFusion-C 20.65（若开源）。
- 同硬件同 batch 重测两者延迟，核对 4.5×。

## 若成立 / 不成立意味着什么

成立：初始化策略本身是高斯感知的主要收益来源（与 G3 消融一致），相机占用的高斯路线具备效率优势。
不成立：+1.55 依赖对比实现的次优配置，高斯路线回到与 GaussianFormer 打平的水平。

## 核查记录

- 2026-11-04（建卡时）：数字自 arXiv HTML v1 实抓，quote 与算术验算（1.55 / 30.9% / 4.52×）当时完成。
- 2026-11-05（02 任务书整理班）：表达复核，数字未改写；2 条笔记 quote Grep 逐字命中；重抓 https://arxiv.org/html/2607.00746v1 复核 §4.4 增量句逐字命中（「Table 7 .」处空格为链接边界渲染伪迹）；falsifiers 补「原文核查」条（对应笔记单源 HTML 抓取、未与 PDF/ar5iv 交叉核对的缺口）。id/status/stance/review_due/signoff 未动。
