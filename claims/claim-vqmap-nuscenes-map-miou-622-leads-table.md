---
id: claim-vqmap-nuscenes-map-miou-622-leads-table
title: "论文声称：VQ-Map 在 nuScenes val 环视 BEV 地图分割上 mean mIoU 62.2，高于同表全部对比方法（BEVFusion 56.6 / MapPrior 56.7 / DDP 59.4）"
type: claim
status: asserted
scope: "nuScenes 验证集、环视（Surround-View）BEV 语义地图分割（Drivable / Ped. Cross. / Walkway / Stopline 四类 mIoU）；VQ-Map 自报数字与 BEVFusion、MapPrior、DDP 同表对比；数字已对照 arXiv:2411.01618 Table 1 核实与笔记一致（2026-11-02 抓取；论文原表为 6 类 + 7 个对比方法行——另有 Carpark/Divider 两类与 X-Align 58.0、MetaBEV 59.3 等，笔记只抄了 4 类与 3 行，全部方法行均低于 62.2）；笔记未注明对比方法的输入模态（BEVFusion 通常为 LiDAR+相机多模态，而 VQ-Map 为纯相机查询）、数据划分与后处理是否同口径"
tags: [bev, map-segmentation, vqvae, discrete-representation, nuscenes, vq-map]
note: library/Quantization/VQ-Map.md#41-核心指标对比-state-of-the-art-comparison
paper: "NeurIPS 2024, VQ-Map (arXiv:2411.01618)（代码：https://github.com/Z1zyw/VQ-Map）"
stance: watch
evidence:
  - source: library/Quantization/VQ-Map.md
    locator: "§4.1 / 核心指标对比表"
    quote: "| **VQ-Map (Ours)** | **83.8**     | **60.9**        | **64.2**    | **57.7**     | **62.2**        |"
    relation: supports
  - source: library/Quantization/VQ-Map.md
    locator: "§4.1 / 核心指标对比表"
    quote: "| BEVFusion (基线)  | 81.7         | 54.8            | 58.4        | 47.4         | 56.6            |"
    relation: supports
  - source: library/Quantization/VQ-Map.md
    locator: "§4.1 / 核心指标对比表"
    quote: "| MapPrior (VQ-GAN) | 81.7         | 54.6            | 58.3        | 46.7         | 56.7            |"
    relation: supports
  - source: library/Quantization/VQ-Map.md
    locator: "§4.1 / 核心指标对比表"
    quote: "| DDP (Diffusion)   | 83.6         | 58.3            | 61.6        | 52.4         | 59.4            |"
    relation: supports
  - source: library/Quantization/VQ-Map.md
    locator: "§4.1 / 表后分析"
    quote: "Stopline 停止线涨幅 +10.3、Walkway 人行道涨幅 +5.8"
    relation: supports
  - source: https://arxiv.org/pdf/2411.01618
    locator: "Table 1（nuScenes surround-view，VQ-Map 行；pdftotext -layout 提取，抓取 2026-11-02）"
    quote: "VQ-Map            83.8         60.9        64.2         57.7      55.7      50.8     62.2"
    relation: supports
  - source: https://arxiv.org/pdf/2411.01618
    locator: "Table 1（nuScenes surround-view，DDP 行；pdftotext -layout 提取，抓取 2026-11-02）"
    quote: "DDP [19]          83.6         58.3        61.6         52.4      51.4      49.2     59.4"
    relation: supports
falsifiers:
  - "用开源仓库（Z1zyw/VQ-Map）在 nuScenes val 复现，mean mIoU 显著低于 62.2，或不高于 DDP 的 59.4"
  - "原文 Table 与笔记数字不一致（VQ-Map mean 并非 62.2，或任一对比方法行数字有出入）"
  - "对比口径不对等：对比方法输入模态 / 数据划分 / 后处理与 VQ-Map 不同（如 BEVFusion 为多模态、VQ-Map 为纯相机），导致领先在同口径下不成立"
review_due: 2026-12-02
related: [claim-vqmap-token-classification-618-beats-regression, claim-vqmap-tiny-868g-macs-matches-ddp]
signoff: null
---

## 我的理解

论文声称：在 nuScenes val 环视 BEV 地图分割上，VQ-Map 取得 mean mIoU 62.2，高于同表所列全部对比方法（BEVFusion 56.6、MapPrior 56.7、DDP 59.4），且提升集中在依赖结构先验的细粒度类别——相对 BEVFusion，Stopline +10.3（47.4 → 57.7）、Walkway +5.8（58.4 → 64.2）。该主张尚未独立验证，数字均为论文自报。

必须记住的限定：笔记没有注明对比方法的输入模态与口径。VQ-Map 是纯相机方法（不依赖显式深度估计），而 BEVFusion 常见配置是 LiDAR+相机多模态；若同表混用不同模态口径，"领先"的含义需要重新解释。涨幅 +10.3 / +5.8 是相对 BEVFusion（基线行）的差值，不是相对最强基线 DDP。

**复审更新（2026-11-02）**：数字已对照 arXiv:2411.01618 Table 1 逐格核实与笔记一致；论文原表实为 6 类（另有 Carpark/Divider）+ 7 个对比方法行（OFT/LSS/CVT/M2 BEV/BEVFusion/MapPrior/X-Align/MetaBEV/DDP），最高对手 DDP 59.4，「VQ-Map 62.2 高于同表全部对比方法」在论文全表口径下同样成立；但表内未标注各方法输入模态，模态口径问题仍未解。

## 待验证

- 已核对（2026-11-02）：arXiv:2411.01618 Table 1 数字行与笔记一致（见 evidence）；各对比方法的输入模态标注表内未给出，仍需查正文实现细节。
- 待补：确认 BEVFusion 行用的输入配置（LiDAR+相机还是相机-only）。
- 用 [Z1zyw/VQ-Map](https://github.com/Z1zyw/VQ-Map) 在 nuScenes val 上复现 mean mIoU 与四类逐项指标。
- 确认评测口径：验证集划分、Patch 网格（8×8）与 mIoU 计算是否与对比方法一致。

## 若成立 / 不成立意味着什么

成立：纯相机 BEV 地图估计用"离散 Token 分类 + 生成式地图字典"可以在细粒度类别上压过多模态基线，值得在 BEV 感知选型中把 VQ-Map 列为相机-only 路线的候选基线。
不成立：领先依赖对比口径不对等或自报数字偏差，地图先验路线退回与 DDP / MapPrior 同档，选型时不应给 VQ-Map 额外权重。
