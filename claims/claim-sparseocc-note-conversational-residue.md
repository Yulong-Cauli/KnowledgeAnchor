---
id: claim-sparseocc-note-conversational-residue
title: "SparseOcc 笔记「总结：公式如何体现“Sparse”？」末尾残留一句对话式问句（「……需要细讲吗？」），非笔记正文内容"
type: claim
status: asserted
scope: "笔记质量记录，仅针对 library/3D_Occupancy/SparseOcc.md §「总结：公式如何体现“Sparse”？」末一行加粗问句；不涉及论文内容主张；该行不被任何已立 SparseOcc claim 卡的 evidence quote 引用；QA round2 复审（2026-11-02）发现"
tags: [sparseocc, note-quality, evidence]
note: library/3D_Occupancy/SparseOcc.md#总结公式如何体现sparse
paper: "CVPR 2024 · SparseOcc: Rethinking Sparse Latent Representation for Vision-Based Semantic Occupancy Prediction · arXiv:2404.09502 · https://github.com/VISION-SJTU/SparseOcc"
stance: watch
evidence:
  - source: library/3D_Occupancy/SparseOcc.md
    locator: "§总结：公式如何体现“Sparse”？ / 末行"
    quote: "关于损失函数中如何利用匈牙利匹配（Hungarian Matching）来训练这套流程，需要细讲吗？"
    relation: supports
falsifiers:
  - "该问句在笔记语境中确有正文功能（例如确为作者计划展开的章节引子且后文有对应小节）"
  - "笔记经用户同意修复后该行删除或改写为陈述句（届时本卡按已修复改写或删除）"
review_due: 2026-12-02
related: [claim-sparseocc-miou141-beats-dense-baselines, claim-sparseocc-flops-749pct-below-dense, claim-sparseocc-decomposed-kernel-beats-full-kernel]
signoff: null
---

## 主张

本卡是笔记质量记录（asserted，未经用户复核处置）：SparseOcc 笔记「总结：公式如何体现"Sparse"？」小节末尾曾残留一行加粗的 AI 对话式问句（"你会发现这本质上是一个"由面及点"的过程……关于损失函数中如何利用匈牙利匹配（Hungarian Matching）来训练这套流程，需要细讲吗？"），是 AI 对话残留而非笔记应有内容。QA round2（2026-11-02）复审时发现。

## 当前状态与历史记录

**当前状态（2026-11-03 已修复）**：该对话式问句已按 fix-list F24 改写为陈述句（指向笔记 §3 的匈牙利匹配条目，未引入新事实），笔记同位置现为一行排版注记录此次改写；本卡 evidence quote 所指原文行已不存在（2026-11-05 Grep 复核：「需要细讲吗」仅存于该排版注内，非笔记正文）。另记中的 §2.4 小节重号也已按 F25 重编号（→ 2.4.1–2.4.4）。

**历史记录（修复前行文）**：该行不含数字，不影响三张 SparseOcc 卡的任何 evidence；但风格上不属于库内笔记正文，且易被误读为待办问题——此即立卡理由，quote 保留作为历史记录。SparseOcc 笔记其余数字（Table 1、Table 3、§1 概述）经 round2 复审与三张卡逐字一致，未发现数值类转抄错误。

**补充核查（2026-11-03）**：上文「其余数字未发现数值类转抄错误」不覆盖 §2.1 的稀疏度统计句（「约 80% 的体素是空的」）。该句后经实抓 arXiv:2404.09502v1（pdftotext 提取逐字核对）复核：与原文 §3.1（"approximately 80% of the voxels in V are empty…"，LSS 特征体口径）一致、数字本身无误；原文 §1 另有 67% 统计（considered 3D space 口径，脚注注明 SemanticKITTI 前 10 序列 GT 占据标签），两者并存、口径不同。`nightshift/cross/occupancy-sparsification.md` §3-M7/C2 曾记「笔记 80% 与原文 67% 不符、"80%" 未检得于 v1」，系其提取遗漏。笔记 §2.1 已于 2026-11-03 补引文与口径注记（该句不在本卡与三张 SparseOcc 卡的任何 evidence quote 内）。

## 待决事项（登记）

- 本卡 status 不动（铁律 3）。falsifier 2 的触发条件（「笔记经用户同意修复后该行删除或改写」）已于 2026-11-03 满足——本卡按已修复改写、删除还是转 stale，由主人裁定。
- falsifier 1（问句确有正文功能/有意行文风格或待办标记）随该行改写已无事实载体。

## 核查记录

- 2026-11-02：QA round2 发现对话残留，立本卡。
- 2026-11-03：F24 改写为陈述句、F25 小节重编号；§2.1 80% 句经 arXiv v1 实抓复核无误并补注记。
- 2026-11-05：本班表达整理与历史/当前分层（数字未改写）；Grep 复核 evidence quote 已成历史记录（原问句行不存在，字符串仅存于笔记排版注内）。
