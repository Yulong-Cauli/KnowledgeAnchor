---
id: claim-qwen3vl-length-adaptive-sampling-pretraining
title: "Qwen3-VL 论文声称：预训练采用 Length-Adaptive Sampling——按序列长度约束动态调整视频 fps 与最大帧数以减少信息损失"
type: claim
status: asserted
scope: "Qwen3-VL 预训练数据管线（§3.2.7 Video Data Balancing and Sampling (ii)）；主张内容为『采样参数（fps、最大帧数）随序列长度约束动态调整』这一机制描述，不含性能数字；依据 arXiv:2511.21631v2（2026-11-03 抓取 HTML v2 逐字核对），尚未独立验证"
tags: [vlm, qwen3-vl, video-sampling, pretraining, data-pipeline]
note: library/VLM_VLA/Qwen3-VL.md#2-方法
paper: "arXiv 2025, Qwen3-VL Technical Report (arXiv:2511.21631)"
stance: watch
evidence:
  - source: https://arxiv.org/html/2511.21631v2
    locator: "§3.2.7 / Video Data Balancing and Sampling (ii)（HTML v2，2026-11-03 抓取）"
    quote: "Length-Adaptive Sampling: During pre-training stages, we dynamically adjust sampling parameters, such as frames per second (fps) and the maximum number of frames, according to different sequence length constraints."
    relation: supports
  - source: https://arxiv.org/html/2511.21631v2
    locator: "§3.2.7 同节（HTML v2，2026-11-03 抓取）"
    quote: "This adaptive strategy mitigates information loss associated with suboptimal sampling practices (e.g., overly sparse frame selection or excessively low spatial resolution), thus preserving visual details and optimizing training efficacy."
    relation: supports
  - source: library/VLM_VLA/Qwen3-VL.md
    locator: "§2.6 / 视频采样条（笔记转述）"
    quote: "数据源平衡与按序列长度自适应的 fps/帧数采样。"
    relation: supports
falsifiers:
  - "原文核查（开源配置）：开源训练配置或后续技术报告显示采样并非按序列长度约束动态调整（如固定 fps/固定帧数），机制描述不成立"
  - "同范围复现（消融，主张侧）：该策略的消融显示对长视频理解基准无收益或负收益（论文正文未给出该项独立消融）"
  - "原文核查（版本差异）：v1（2025-11-26）与 v3（如有）正文删除或改写该机制"
review_due: 2026-12-03
related: [claim-qwen3vl-235b-thinking-mmstar-787-highest]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：Qwen3-VL 的预训练在视频数据采样上按「序列长度约束」动态调整 fps 与最大帧数（Length-Adaptive Sampling），动机是避免过稀帧选择或过低空间分辨率造成的信息损失。这是一个机制描述型主张，论文正文没有给该项的独立消融数字。

三条记录性说明：
1. 任务描述写作「Length-adaptive Visual Resolution」，论文 v2 实际术语为 **Length-Adaptive Sampling**（§3.2.7），本卡以论文术语为准；笔记对应内容在 §2.6 视频采样条（转述、无直接引文），故本卡 evidence 以本次抓取的 arXiv HTML 逐字引文为主（URL + 抓取日期 2026-11-03）。
2. 笔记头部三处原文瑕疵照录处（§2 "three dense variants" 计数与列举 4 个规模不符、§5.8 两处型号 "Qwen3-VL-235B-A22" 缺尾字母 B、§6 结论段一句无谓语收尾）均不在本卡引用范围内，未引其所在句。
3. §5.9 视频评测另有帧数/token 上限设定（每视频统一 ≤2048 帧、每帧 ≤768/640 token、总 video token ≤224K——全基准统一上限，并非按序列长度自适应），与本卡的预训练采样机制是两回事，勿混引。

## 待验证

当前 stance：watch；原卡未记录立场依据，按未记录处理。

- 原文核查（开源配置）：等官方开源训练配置后，核对采样器实现是否真的以序列长度为约束动态选 fps/帧数；实现为固定 fps/固定帧数即触发 falsifier 1。
- 同范围复现（消融）：若复现 Qwen3-VL，做固定 fps vs length-adaptive 采样的对照消融，看长视频基准（如 VideoMME/Charades-STA）差异——固定 fps 不显著更差则该机制只是叙述性包装。
- 原文核查（版本差异）：比对 v1 与 v2 该段措辞是否一致（本笔记仅基于 v2）。

## 若成立 / 不成立意味着什么

成立：长视频/长文档预训练的数据工程可参考「token 预算驱动采样」路线，而不是统一 fps。
不成立：该机制只是叙述性包装（无消融支撑），引用时只能作为设计描述、不能作为有效组件的证据。

## 核查记录

- 2026-11-05（02 任务书整理班 P1-B3c）：表达整理，主张未改。3 条 evidence 全部逐字命中来源（1 条 library 笔记 Grep 命中；2 条 arXiv HTML v2 引文于 2026-11-05 实抓复核逐字命中，并确认 "Length-adaptive Visual Resolution" 在 HTML v2 中不存在，QUESTIONS #41 术语勘误的论文侧证据成立）；正文记录 3 的「按序列长度自适应的帧数上限」改为如实表述（§5.9 为全基准统一上限 2048 帧 + 每帧 768/640 token + 总 224K，非自适应），消除与预训练采样机制的术语混淆；falsifiers 补分层标注；scope 末补「尚未独立验证」；待验证补立场记录、检查分类与结果含义。id/status/stance/review_due/signoff 未动。
