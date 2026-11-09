---
id: claim-fcos-anchorfree-pixelwise-formulation
title: "FCOS 声称检测可重构为无锚框逐像素预测：GT 框内特征点全为正样本，直接回归到框四边的距离"
type: claim
status: asserted
scope: "2D 目标检测（FCOS，ICCV 2019）；formulation 层面设计主张，不涉及精度对比；笔记未载任何数据集性能数字（仅以 COCO 80 类说明正负样本悬殊的动机）；2026-11-05 实抓 arXiv 1904.01355v5（ICCV camera-ready 同源）补核：§3 方法陈述即『框内即正样本』+ 回归到四边距离；中心采样（ctr. sampling）仅作为 'after our submission' 的 Table 3 改进行与 center-ness 的替代方案讨论出现，不属正文方法"
tags: [fcos, anchor-free, detection, per-pixel-prediction]
note: library/Classical_Detection/FCOS.md#anchor-free-的逐像素回归
paper: "ICCV 2019, FCOS: Fully Convolutional One-Stage Object Detection（开源：https://github.com/tianzhi0549/FCOS）"
stance: watch
evidence:
  - source: library/Classical_Detection/FCOS.md
    locator: "§文首核心思想"
    quote: "**核心思想**：将目标检测从传统的 “Anchor-based” 回归问题，重构为类似语义分割的 **全卷积逐像素预测** 问题。"
    relation: supports
  - source: library/Classical_Detection/FCOS.md
    locator: "§方法 / Anchor-free 的逐像素回归"
    quote: "**FCOS 解法**：彻底抛弃 Anchor，将特征图上的点视为训练样本。"
    relation: supports
  - source: library/Classical_Detection/FCOS.md
    locator: "§方法 / Anchor-free 的逐像素回归"
    quote: "* **定义样本**：特征图上的点 $(x, y)$ 映射回原图，只要落在真实框（Ground Truth）内部，即视为**正样本**。"
    relation: supports
  - source: library/Classical_Detection/FCOS.md
    locator: "§方法 / Anchor-free 的逐像素回归"
    quote: "* **回归目标**：直接预测该点到真实框四条边的距离 $t = (l, t, r, b)$ 。"
    relation: supports
  - source: https://arxiv.org/pdf/1904.01355
    locator: "§3.1 Fully Convolutional One-Stage Detector（正样本定义；arXiv PDF v5，pdftotext 提取，抓取 2026-11-05）"
    quote: "Specifically, location (x, y) is considered as a positive sample if it falls into any ground-truth box and the class label c∗ of the location is the class label of the ground-truth box."
    relation: supports
  - source: https://arxiv.org/pdf/1904.01355
    locator: "§3.1（回归目标定义；pdftotext 提取，抓取 2026-11-05）"
    quote: "Here l∗ , t∗ , r∗ and b∗ are the distances from the location to the four sides of the bounding box, as shown in Fig. 1 (left)."
    relation: supports
  - source: https://arxiv.org/pdf/1904.01355
    locator: "Table 3 caption（Improvements 为投稿后补充改进；pdftotext 提取，抓取 2026-11-05）"
    quote: "After our submission, some almost cost-free improvements have been made for FCOS and the performance has been improved by a large margin, as shown by the rows below “Improvements”."
    relation: supports
  - source: https://arxiv.org/pdf/1904.01355
    locator: "Table 3 caption 对 'ctr. sampling' 的定义（pdftotext 提取，抓取 2026-11-05）"
    quote: "“ctr. sampling”: only sampling the central portion of ground-truth boxes as positive samples."
    relation: supports
  - source: https://arxiv.org/pdf/1904.01355
    locator: "Table 3 Improvements 行（minival、R-50-FPN；行首 'ctr. sampling' 为在前一行基础上累计；pdftotext -layout 提取，抓取 2026-11-05）"
    quote: "+ ctr. sampling [1] P5 X .60 38.1 56.7 41.4 22.6 41.6 50.4 32.1 52.8 56.3"
    relation: supports
falsifiers:
  - "原文核查（已完成，未触发，2026-11-05）：笔记 formulation 与原文方法陈述不符——已实抓 arXiv 1904.01355v5，§3.1 'falls into any ground-truth box' 即正样本 + 四边距离回归均命中；且原文明确中心采样是投稿后 Improvements 行与 center-ness 的替代讨论，非正文方法，此分支闭合"
  - "代码核查：官方实现（github.com/tianzhi0549/FCOS）实际保留 anchor 机制，或默认配置开启中心采样/框内子区域限制（与 camera-ready 方法陈述不同源）——若属实，本卡需注明『论文方法陈述为框内即正、官方复现默认配置含中心采样』的表述/实现差异"
  - "同范围复现：同一设置下按'框内即正样本'训练无法复现论文报告精度——注意原文 Table 3 自报锚点：相机就绪版配置 37.1 AP，'+ ctr. sampling' 行累计 38.1（minival、R-50-FPN），即论文自己的最优报告数字含中心采样；复现对齐时先分清对齐的是 37.1（无中心采样）还是 38.1+（含）口径"
review_due: 2026-12-02
related: [claim-fcos-fpn-scale-range-assignment]
signoff: null
---

## 我的理解

笔记声称：FCOS 把检测从 anchor-based 回归重构为全卷积逐像素预测——特征图位置映射回原图后只要落在 GT 框内部就是正样本，回归目标直接是该点到框四边的距离 $(l,t,r,b)$，全程不需要 anchor 先验与尺寸/长宽比超参。

限定：这是 formulation 层面的设计主张。笔记未载任何数据集性能数字，因此本卡不涉及“比 anchor-based 更好”之类的精度结论，只主张 formulation 本身。

2026-11-05 补核：原文 §3.1 方法陈述与笔记一致（框内即正 + 四边距离回归）。需要分清的口径：论文 Table 3（minival、R-50-FPN）自报相机就绪版配置 37.1 AP，“Improvements” 各行（+ ctr. on reg. / + ctr. sampling / + GIoU / + Normalization）为投稿后累计改进，其中 “ctr. sampling” 定义为 “only sampling the central portion of ground-truth boxes as positive samples”——即中心采样在原文中是改进项与 center-ness 的替代方案讨论，不属正文方法；但论文自己的最优报告数字含它。官方仓库默认配置是否开中心采样，仍待查代码。

## 待验证

- 已核对（2026-11-05，论文侧）：§3.1 正样本定义与回归目标、中心采样的“投稿后改进”定位均与 arXiv v5 原文一致，见 evidence。
- 读官方仓库 tianzhi0549/FCOS：确认预测头无 anchor，正样本分配代码的默认配置是“框内即正”还是含中心采样（代码侧仍未查，falsifier 2 保留）。
- 从原论文补 COCO 基线数字后复现训练，验证该 formulation 能独立收敛并达到报告精度——先按 Table 3 分清 37.1（camera-ready 口径）与 38.1+（含 ctr. sampling 等改进）的对齐目标（同范围复现）。

## 若成立 / 不成立意味着什么

成立：无锚框逐像素 formulation 的可行性有据可依，可作为无锚框检测路线的引用起点（进选型/方案前仍需 verified）。
不成立：官方实现实际依赖 anchor 或中心采样等修正，本卡改为记录“笔记表述与实现不符”，无锚框主张按实际实现重写。

## 核查记录

- 2026-11-05（02 任务书 P1-B7a 整理班）：表达整理 + 论文侧核查，数字未改写。四条笔记 quote Grep 逐字命中；新增 5 条 arXiv 1904.01355v5 原文 evidence（§3.1 正样本定义句、回归目标句、Table 3 caption 两句、'+ ctr. sampling' 行）；falsifier 1（论文 formulation 转述）闭合，并把 falsifier 2 细化为代码默认配置问题（camera-ready 方法 vs 官方实现可能不同源）；falsifier 3 补 37.1 / 38.1 口径锚点。id/status/stance/review_due/signoff 未动。
- 2026-11-05（P3 深核·批二独立复审）：修正本批引入的 5 处 ”…” 成对引号误排为 “…”（正文排版，未动任何数字与命题）；独立实抓 arXiv 1904.01355v5（FCOS，ICCV 2019）二次复核：4 条笔记 quote 与 5 条 arXiv evidence 逐字命中（含 Table 3 '+ ctr. sampling' 行与 37.1 相机就绪版锚点）。id/status/stance/review_due/signoff 未动。
