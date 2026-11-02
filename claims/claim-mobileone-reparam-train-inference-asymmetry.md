---
id: claim-mobileone-reparam-train-inference-asymmetry
title: "MobileOne 论文声称训练期多分支、推理期重参数化折叠为无分支单路，Table 5 自报去分支掉 1.8/1.3/0.9 点（S0/S1/S3）"
type: claim
status: asserted
scope: "MobileOne（arXiv:2206.04040，CVPR 2023）§3.3 设计 + Table 5 消融（MobileOne-S0/S1/S3，ImageNet top-1，论文 300 epochs 配方）；重参数化指结构分支折叠（RepVGG 系），参数量为推理期（折叠后）口径；训练期另含 trivial over-parameterization（k=1–5 复制分支）；论文声称口径，尚未独立验证"
tags: [mobileone, reparameterization, over-parameterization, efficient-backbone]
note: library/Efficient_Backbone/MobileOne.md#23-mobileone-块训练期多分支推理期单路33
paper: "CVPR 2023, MobileOne: An Improved One millisecond Mobile Backbone (arXiv:2206.04040)"
stance: watch
evidence:
  - source: library/Efficient_Backbone/MobileOne.md
    locator: "§2.3 / §3.3（推理期无分支）"
    quote: "At inference, MobileOne model does not have any branches."
    relation: supports
  - source: library/Efficient_Backbone/MobileOne.md
    locator: "§2.3 / §3.3（trivial over-parameterization 因子）"
    quote: "The trivial over-parameterization factor $k$ is a hyperparameter which is varied from 1 to 5."
    relation: supports
  - source: library/Efficient_Backbone/MobileOne.md
    locator: "§1 / §1（与既有重参数化工作的差异自述）"
    quote: "However, a key difference between our model and prior structural re-parameterization works is the introduction of trivial over-parameterization branches, which provides further improvements in low parameter regime and model scaling strategy."
    relation: supports
  - source: library/Efficient_Backbone/MobileOne.md
    locator: "§2.3 / Table 5（with 行）"
    quote: "| **with** | 71.4 | 75.9 | 78.1 |"
    relation: supports
  - source: library/Efficient_Backbone/MobileOne.md
    locator: "§2.3 / Table 5（without 行）"
    quote: "| **without** | 69.6 | 74.6 | 77.2 |"
    relation: supports
  - source: https://ar5iv.labs.arxiv.org/html/2206.04040
    locator: "§3.3；ar5iv 渲染版（对应 arXiv v2，笔记抓取约定），2026-11-03 抓取；引句为 HTML 去标签 + math alttext 还原的归一化文本"
    quote: "At inference, MobileOne model does not have any branches"
    relation: supports
  - source: https://ar5iv.labs.arxiv.org/html/2206.04040
    locator: "Table 5 without 行（同上抓取方式，2026-11-03）"
    quote: "without 69.6 74.6 77.2"
    relation: supports
falsifiers:
  - "同配方复现中移除重参数化分支不掉点甚至涨点（方向与 Table 5 相反），或三个变体差值显著小于 +1.8/+1.3/+0.9 点"
  - "折叠后单路模型与训练期多分支模型在相同输入下输出超出数值容差（卷积+BN 线性折叠 / 分支求和的等价变换失败）"
  - "arXiv 新版本或勘误更改 Table 5 数字或「At inference ... no branches」表述"
review_due: 2026-12-03
related: [claim-mobileone-efficient-arch-sota-accuracy-latency]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：MobileOne 的训练-推理不对称体现在两层——(a) 结构重参数化：训练期每个卷积带可折叠的 BN 分支与带 BN 的 skip 分支，推理期全部线性折叠（卷积+BN 折叠为单卷积、M 个分支核逐元素求和）为无分支直筒；(b) 平凡过参数化：再复制 k 份同结构分支（k=1–5，小模型取大 k、大模型 k=1）。收益消融（Table 5）：去掉全部重参数化分支后 S0/S1/S3 的 top-1 从 71.4/75.9/78.1 掉到 69.6/74.6/77.2，即 +1.8/+1.3/+0.9 点；Figure 4 caption 另称加分支使训练 loss 降 3.4%（k=1）。

与 RepVGG 的差异自述：MobileOne 引入 trivial over-parameterization branches，声称在低参数量区间与模型缩放上收益更大。注意 Table 5 的「with」行即各变体的最终报告精度（与 Table 9 一致：S0 71.4、S1 75.9、S3 78.1），消融与主表数字自洽。

## 待验证

- 复现 Table 5：同配方训练 S0/S1 各一次「有分支/无分支」，核对 +1.8/+1.3 点量级。
- 数值等价性检查：折叠前后单 batch 前向输出 max abs diff < 1e-5。
- 消融 k 扫描（Table 6：S0 在 k=4 取 71.4 最优、大变体收益递减）与 Table 19（μ 系列）是否一致。

## 若成立 / 不成立意味着什么

成立：训练期过参数化换推理期无分支直筒，是移动端「白拿精度」的可用配方；推理侧只需实现单路卷积，利于图优化与量化。
不成立：收益若依赖特定训练配方（论文 Table 8 的退火权重衰减等），换框架/换配方时增益可能消失，须按 falsifier 复核。
