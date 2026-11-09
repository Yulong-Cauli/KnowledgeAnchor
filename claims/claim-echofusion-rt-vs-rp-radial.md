---
id: claim-echofusion-rt-vs-rp-radial
title: "在 RADIal 的受控消融中，RT+C 的 BEV AP 高于 RP+C，优势集中在 50–100m"
type: claim
status: asserted
scope: "RADIal test split；refined 3D 标注；BEV AP@0.7；RT+C vs RP+C；同一 EchoFusion 架构（同一论文 Table 6 内比较）；每组实验重复 3 次、模态消融报 mean 与 variance（论文 §5.1 所述设置）；论文自报数字"
tags: [radar, sensor-fusion, echofusion, radial]
note: library/3D_Occupancy/EchoFusion.md#32-消融实验雷达数据格式与模态影响
paper: "NeurIPS 2023, Echoes Beyond Points: Unleashing the Power of Raw Radar Data in Multi-modality Fusion"
stance: watch
evidence:
  - source: https://arxiv.org/abs/2307.16532
    locator: "§5.4 / Table 6 / p.9（arXiv HTML v2，2026-11-05 本班实抓复核逐字命中）"
    quote: "both RT and RA outperform traditional cloud points, especially in the 50-100m range, in which the difference is as large as 4 points in AP."
    relation: supports
  - source: https://arxiv.org/abs/2307.16532
    locator: "Table 6 / p.9（arXiv HTML v2，2026-11-05 本班实抓复核逐字命中）"
    quote: "Table 6: BEV detection performances of different modality combinations of our algorithm on RADIal Dataset test split. Refined 3D bounding box annotations are applied."
    relation: supports
  - source: https://arxiv.org/pdf/2307.16532v2
    locator: "Table 6 模态区第 6 数据行（第 1、2 个 ✓ 落在 C、RT 列 = C+RT；pdftotext -layout 文本层原样空格，p.9）；URL+抓取日期 2026-11-05"
    quote: " ✓    ✓                          84.92±0.98    87.56±1.58   91.06±1.18   88.86±0.62    92.81±1.37    94.81±0.52"
    relation: supports
  - source: https://arxiv.org/pdf/2307.16532v2
    locator: "Table 6 模态区第 8 数据行（第 1、4 个 ✓ 落在 C、RP 列 = C+RP；pdftotext -layout 文本层原样空格，p.9）；URL+抓取日期 2026-11-05"
    quote: " ✓                    ✓          82.35±0.93    86.97±1.01   86.39±0.74   88.35±0.78    93.07±0.80    92.77±0.69"
    relation: supports
falsifiers:
  - "在相同 RADIal 划分、相同 RT/RP 编码器容量与训练配置下复现，RT+C 相对 RP+C 的 BEV AP 增益消失或反转"
  - "增益主要来自 RP 分支的编码器容量/预处理不对等；匹配后差异不再显著"
review_due: 2026-11-30
related: [claim-echofusion-rt-vs-ra-noise, claim-echofusion-radial-ap-ar-tradeoff, claim-echofusion-note-table-mismatch]
signoff: null
---

## 主张

论文 Table 6 在同一 EchoFusion 架构下比较了多种模态组合：RT+C 的总体 BEV AP@0.7 为 **84.92**，RP+C 为 **82.35**；50–100m 分别为 **91.06** 和 **86.39**，0–50m 为 87.56 对 86.97。“原始雷达优于 CFAR 点云”在这张表里有直接证据：总体差距约 2.6 个点，50–100m 约 4.7 个点，0–50m 仅 0.59 个点，优势集中在远距。论文正文对 RT/RA vs 点云只给了「差距最大约 4 个点」的量级表述，未对 RT vs RP 单独给增量句。笔记 §3.2 的 42.4 vs 33.1（mAP）无法在论文原表中找到对应数据，见 [笔记偏差卡](claim-echofusion-note-table-mismatch.md)。

证据边界：数字为论文自报；每组实验重复 3 次、模态消融报 mean 与 variance（论文 §5.1），±值的统计口径未进一步定义。RP 行的 ✓ 组合由 PDF 文本层 ✓ 落位列判读（C、RP 两列）。RT 与 RP 分支的容量/预处理对等性论文未说明（见待验证）。

## 待验证

- 核对 Table 6 的 RT/RP 分支是否使用相同容量、相同图像骨干与相同训练计划（论文附录/官方代码）：不对等则按 falsifier 2，匹配容量后重比。
- 用作者代码或独立复现确认 84.92 vs 82.35 的差距是否超出 3 次运行的方差：超出则增益成立；不超出则“RT 优于 RP”记为误差内差异。
- 检查 RP 分支的 CFAR/点云预处理是否被调优：未调优则增益可能被高估，引用时注明基线调优状态。

## 成立/不成立的含义

成立：雷达-相机融合值得优先尝试 RT/原始雷达输入，远距目标的预期收益最大。
不成立：增益消失或反转，则“原始数据优越”至少在这套实现里不成立，选型应回到受控的容量/预处理对比。

## 核查记录

- 建卡（日期未记录）：§5.4 句与 Table 6 表题自 arXiv abs 页摘录，当时未记录抓取日期；正文 Table 6 数字无 quote 支撑。
- 2026-11-05（02 任务书整理班）：实抓 arXiv v2 HTML 复核两条 quote 逐字命中；实抓 v2 PDF（pdftotext -layout）补 Table 6 C+RT、C+RP 两行原文行作 evidence，正文数字（84.92±0.98 / 91.06±1.18 与 82.35±0.93 / 86.39±0.74）与行数字一致；正文补证据边界与「正文无 RT vs RP 专项增量句」说明。id/status/stance/review_due/signoff 未动。
