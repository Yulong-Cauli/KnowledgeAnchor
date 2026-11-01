---
id: claim-echofusion-note-table-mismatch
title: "EchoFusion 笔记的 §3.2/3.3 消融表与论文原表不一致"
type: claim
status: asserted
scope: "library/3D_Occupancy/EchoFusion.md §3.2–3.3；对照 arXiv:2307.16532 Table 6 / Table S4；不评价笔记 §3.1 主表"
tags: [echofusion, note-quality, evidence, radar]
note: library/3D_Occupancy/EchoFusion.md#32-消融实验雷达数据格式与模态影响
paper: "NeurIPS 2023, Echoes Beyond Points: Unleashing the Power of Raw Radar Data in Multi-modality Fusion"
stance: watch
evidence:
  - source: library/3D_Occupancy/EchoFusion.md
    locator: "§3.2 消融表：图像 + RT Map"
    quote: "| **4**        | **图像 + RT Map** | **距离-时间图** | **42.4**    | **59.3**    |"
    relation: supports
  - source: library/3D_Occupancy/EchoFusion.md
    locator: "§3.3 坐标系对比表：Cartesian"
    quote: "| 直角坐标系 (Cartesian)         | 41.5        | 58.6        |"
    relation: supports
  - source: https://arxiv.org/abs/2307.16532
    locator: "§5.4 / Table 6 / p.9"
    quote: "both RT and RA outperform traditional cloud points, especially in the 50-100m range, in which the difference is as large as 4 points in AP."
    relation: supports
  - source: https://arxiv.org/abs/2307.16532
    locator: "Appendix D / Table S4 / p.16"
    quote: "Though the range dimension is under sphere system, we found that a polar system can achieve on par performance, as shown in Table S4."
    relation: supports
falsifiers:
  - "找到笔记所依据的论文版本（如 NeurIPS camera-ready 或其他 arXiv 版本），其中 Table 6/S4 的数值与笔记一致"
  - "笔记的 42.4/59.3 等数字来自另一篇论文的另一张表，且笔记在上下文中正确标注了数据集与指标"
  - "论文原表在后续版本中被修订为笔记的数值"
review_due: 2026-11-30
related: [claim-echofusion-rt-vs-rp-radial, claim-echofusion-rt-vs-ra-noise, claim-echofusion-radial-ap-ar-tradeoff]
signoff: null
---

## 我的理解

笔记 §3.1 主表与论文 Table 2 一致（96.95/93.43/95.16 等；笔记省略了 CMS、T-FFTRadNet 两行，已收录行的数字均一致），但 §3.2/3.3 的消融数字对不上论文原表：

- 笔记 §3.2 用 mAP/NDS，写 RT 42.4 / PCD 33.1、RA 38.6；论文 Table 6 用的是 **BEV AP@0.7**，RT+C 84.92、RP+C 82.35、RA+C 84.77，论文正文说 RT/RA 相对点云的差距“最大约 4 个点”，不是 9.3 个点。
- 笔记 §3.3 比较 **Cartesian vs Polar**（41.5/42.4）；论文的坐标消融是 **Polar vs Sphere**（84.92 vs 85.02），原文说 polar 只是“on par”，并没有 Cartesian 结果。
- 论文还有 KRadar-20 结果，笔记完全没有收录。

结论：笔记的方法描述和 §3.1 可以用，但 §3.2/3.3 的定量数字不能作为 EchoFusion 的证据。是否修正 `library/` 原笔记需要你确认；在修正前，以论文 Table 6/S4 为准。

## 待验证

- 确认笔记所依据的论文版本；若笔记来自另一版 arXiv/会议版，逐表对照差异。
- 检查笔记 §3.2 的 42.4/59.3 是否来自另一篇雷达融合论文（搜索相同数值组合）。
- 如果决定修正笔记，只改 §3.2/3.3，并在改动处注明论文版本与表号。

## 若成立 / 不成立意味着什么

成立则这条笔记的消融部分不可引用，EchoFusion 的定量 claim 必须回到论文原表；不成立则说明笔记使用的是另一个版本/来源，需要补上版本信息，否则仍无法追溯。
