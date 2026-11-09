---
id: claim-echofusion-3d-ap-below-lidar
title: "EchoFusion 在 RADIal 上的 3D AP 仍远低于 LiDAR"
type: claim
status: asserted
scope: "RADIal test split；refined 3D 标注；3D AP@0.5；ATE/ASE/AOE；论文 Table 7 行名 RT&C vs L / L&C；数字为论文自报（Table 7，arXiv:2307.16532v2 PDF 文本层，2026-11-05 实抓逐值核对）"
tags: [radar, sensor-fusion, echofusion, radial, lidar]
note: library/3D_Occupancy/EchoFusion.md#3-实验结果
paper: "NeurIPS 2023, Echoes Beyond Points: Unleashing the Power of Raw Radar Data in Multi-modality Fusion"
stance: watch
evidence:
  - source: https://arxiv.org/abs/2307.16532
    locator: "Table 7 / 印刷页 p.10（arXiv:2307.16532v2 PDF 文本层，pdftotext -layout 提取、列间空格为排版对齐；原 locator 记 p.9，2026-11-05 实抓 v2 更正为印刷页 p.10）"
    quote: "L         62.69  80.04  54.26        0.243 0.171 0.027"
    relation: supports
  - source: https://arxiv.org/abs/2307.16532
    locator: "Table 7 / 印刷页 p.10（arXiv:2307.16532v2 PDF 文本层，pdftotext -layout 提取、列间空格为排版对齐；2026-11-05 实抓逐值复核）"
    quote: "L&C       68.36  84.74  61.54        0.239 0.180 0.020"
    relation: supports
  - source: https://arxiv.org/abs/2307.16532
    locator: "Table 7 / 印刷页 p.10（arXiv:2307.16532v2 PDF 文本层，pdftotext -layout 提取、列间空格为排版对齐；2026-11-05 实抓逐值复核）"
    quote: "RT&C      39.81  56.05  31.24        0.301 0.173 0.020"
    relation: supports
falsifiers:
  - "复现后 EchoFusion 的 3D AP@0.5 显著高于 39.81，或接近 LiDAR 的 62.69 / 68.36"
  - "3D AP 的评测协议或标注不同，导致跨方法不可比"
review_due: 2026-11-30
related: [claim-echofusion-radial-ap-ar-tradeoff, claim-echofusion-kradar-gain]
signoff: null
---

## 我的理解

论文表格报告：EchoFusion 的 BEV AP 接近 LiDAR（Table 6：RT+C 84.92 vs L 84.47），但 Table 7 的 **3D AP@0.5** 是 **39.81**（行名 RT&C），远低于 LiDAR 的 **62.69**（L）和 **68.36**（L&C）；ATE 也更高（**0.301 vs 0.243 / 0.239**）。论文把差距归因于 RADIal 的 16 线 LiDAR 标注粗糙和雷达俯仰分辨率低（作者解释，§5.5 原句已于 2026-11-05 实抓核实），但这仍是“方法有效”的边界：BEV 好不等于 3D 定位好。

## 待验证

- 在 KRadar-20 这类有更准确 3D 标注的数据上复核 3D AP，而不是只看 RADIal。
- 检查 3D AP 的 IoU 阈值、中心点定义和高度标注是否与 LiDAR 基线一致。
- 本卡数字全部来自论文 Table 6/7；library 笔记 §3 未收录 Table 3/6/7 与 KRadar 结果，引用 EchoFusion 数字时以论文原表为准。
- 已核对（2026-11-05）：本班二次实抓 arXiv:2307.16532v2——PDF 文本层 Table 7 三行逐值命中（L/L&C/RT&C 六项误差列含 ATE/ASE/AOE），HTML v2 的 Table 6 行值 84.92±0.98 / 84.47±0.15 与 §5.5「coarse LiDAR annotation and inferior radar elevation resolution」归因句逐字命中；Table 7 在 v2 印刷页 p.10（原 locator 记 p.9，已更正）。此前卡内记录的 2026-11-02 复核未留抓取凭证细节，以本轮实抓为准。
- 把 BEV AP 与 3D AP 分开报告，避免用 BEV 指标宣称“接近 LiDAR”。

## 若成立 / 不成立意味着什么

成立则 EchoFusion 更适合 BEV 级检测或对高度/3D 定位要求不高的场景；不成立则说明 RADIal 的标注限制了结论，需要换数据集重新评估。
