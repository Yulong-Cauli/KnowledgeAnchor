---
id: claim-gaussianfusion-lowres-bev-outperforms-highres-bevfusion
title: "GaussianFusion 论文声称：100×100 BEV（1.008m 网格）下 73.1 NDS / 3576 M 显存已超 BEVFusion 400×400（0.252m）的 72.7 NDS / 20560 M"
type: claim
status: asserted
scope: "nuScenes 3D 检测 val；BEV 分辨率扫描（Table 1，§1）；GaussianFusion 100×100→73.1/3576M、200×200→74.0/5418M、400×400→74.4/6151M；BEVFusion 100×100→70.5/3228M、200×200→71.4/5140M、400×400→72.7/20560M；BEVFusion 各档是否同配置重训未注明（笔记遗留）；数字为论文自报（arXiv HTML v1，2026-11-04 抓取）"
tags: [bev, lidar-camera-fusion, gaussianfusion, iclr2026, nuscenes]
note: library/Multimodal_Fusion/GaussianFusion.md#1-概述
paper: "ICLR 2026, GaussianFusion: Unified 3D Gaussian Representation for Multi-Modal Fusion Perception (arXiv:2607.00746)"
stance: watch
evidence:
  - source: https://arxiv.org/html/2607.00746v1
    locator: "§1（抓取 2026-11-04）"
    quote: "While increasing the BEV resolution will bring unacceptable computational overhead, as shown in Table 1."
    relation: supports
  - source: library/Multimodal_Fusion/GaussianFusion.md
    locator: "§1 / Table 1 转录行"
    quote: "| GaussianFusion | 100×100 | 1.008m | 3576 M | 73.1 |"
    relation: supports
  - source: library/Multimodal_Fusion/GaussianFusion.md
    locator: "§1 / Table 1 转录行"
    quote: "| | 400×400 | 0.252m | 20560 M | 72.7 |"
    relation: supports
falsifiers:
  - "原文核查：重新抓取 arXiv（或对照 PDF/ar5iv）发现 Table 1 六行（尤其 BEVFusion 400×400 行 72.7/20560 M 与 GaussianFusion 100×100 行 73.1/3576 M）或 §1 表述与本卡所引不符（笔记与原句均为单源 HTML v1 抓取，未与 PDF/ar5iv 交叉核对）"
  - "同配置重训 BEVFusion@400×400 复现 NDS ≥ 73.1（反超 GaussianFusion@100×100）"
  - "复现的显存曲线明显偏离（如 BEVFusion@400×400 实际 < 10GB，说明 20560 M 是特定 batch/实现口径）"
review_due: 2027-02-02
related: [claim-gaussianfusion-val-2p6nds-over-bevfusion]
signoff: null
---

## 主张

论文声称：离散 BEV 表示的精度提升靠分辨率堆显存（BEVFusion 100×100→400×400 显存 3228M→20560M 只换 2.2 NDS），而连续高斯表示在 100×100 粗网格（1.008m）就有 73.1 NDS，超过 BEVFusion 精细 16 倍网格的 72.7，显存只有其 17%。这是"连续表示避免早期量化信息损失"主张的直接证据。

引用限制：该表未注明 BEVFusion 高分辨率档是否同配置重训、显存的 batch 口径；且 GaussianFusion@100×100 的 73.1 与主表（Table 2/3）的 74.0（200×200）是不同档，跨卡引用时注明档位。

## 待验证

- 复现 BEVFusion 400×400 档（确认重训配置与显存口径）。
- 核对高斯表示在更粗网格（50×50）下的衰减曲线，验证"分辨率不敏感"边界的另一侧。

## 成立/不成立的含义

成立：部署侧可放弃高分辨率 BEV 网格换连续表示省显存（5.7×），对边缘/多任务并发的场景有直接价值。
不成立：分辨率扫描是配置不对等的产物，BEV 网格在同等显存下仍可打平，连续表示的优势收缩到训练侧。

## 核查记录

- 2026-11-04（建卡时）：数字自 arXiv HTML v1 实抓，quote 当时完成；BEVFusion 各档是否同配置重训未注明（笔记遗留）在案。
- 2026-11-05（02 任务书整理班）：表达复核，数字未改写；2 条笔记 quote Grep 逐字命中；重抓 https://arxiv.org/html/2607.00746v1 复核 §1 表述句逐字命中（「Table 1 .」处空格为链接边界渲染伪迹）；falsifiers 补「原文核查」条（单源 HTML 抓取、未与 PDF/ar5iv 交叉核对的缺口）。id/status/stance/review_due/signoff 未动。
