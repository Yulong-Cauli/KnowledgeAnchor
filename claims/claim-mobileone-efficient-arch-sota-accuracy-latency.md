---
id: claim-mobileone-efficient-arch-sota-accuracy-latency
title: "MobileOne 论文声称 iPhone12 实测口径下高效架构内 SOTA：S1 75.9 top-1 @0.89ms（<1ms）、S4 79.4 @1.86ms，后者比 79.3 @70.76ms 的 MobileFormer 变体快约 38×"
type: claim
status: asserted
scope: "MobileOne Table 9（ImageNet-1k val；对比集限定同分辨率、参数 <20M、均不用蒸馏）；延迟为 iPhone12 CoreML round-trip 最小值口径（预热后多次运行取 min，§3.5）；「快约 38×」由 70.76/1.86≈38 换算，且该 MobileFormer 变体（79.3@70.76ms）未列于 Table 9（表内 Mobileformer-96 为 72.8@16.95ms）；论文声称口径，尚未独立验证"
tags: [mobileone, imagenet, latency, iphone12, efficient-backbone]
note: library/Efficient_Backbone/MobileOne.md#31-imagenet-1k-分类4-table-9
paper: "CVPR 2023, MobileOne: An Improved One millisecond Mobile Backbone (arXiv:2206.04040)"
stance: watch
evidence:
  - source: library/Efficient_Backbone/MobileOne.md
    locator: "§1 / Abstract"
    quote: "To this end, we design an efficient backbone MobileOne, with variants achieving an inference time under 1 ms on an iPhone12 with 75.9% top-1 accuracy on ImageNet. We show that MobileOne achieves state-of-the-art performance within the efficient architectures while being many times faster on mobile."
    relation: supports
  - source: library/Efficient_Backbone/MobileOne.md
    locator: "§3.1 / Table 9（MobileOne-S1 行）"
    quote: "| **MobileOne-S1** | 75.9 | 825 | 4.8 | 13.04 | **0.66** | **0.89** |"
    relation: supports
  - source: library/Efficient_Backbone/MobileOne.md
    locator: "§3.1 / Table 9（MobileOne-S4 行）"
    quote: "| **MobileOne-S4** | 79.4 | 2978 | 14.8 | 26.60 | **0.95** | **1.86** |"
    relation: supports
  - source: library/Efficient_Backbone/MobileOne.md
    locator: "§3.1 / §4 头条对比自述（MobileFormer 70.76ms 变体未列于 Table 9）"
    quote: "Current state-of-the-art MobileFormer mobileformer_cvpr2022 attains top-1 accuracy of 79.3% with a latency of 70.76ms, while MobileOne-S4 attains 79.4% with a latency of only 1.86ms"
    relation: supports
  - source: library/Efficient_Backbone/MobileOne.md
    locator: "§2.5 / §3.5（延迟报告口径：取最小值）"
    quote: "In order to filter out interrupts from other processes, we report the minimum latency for all the models."
    relation: supports
  - source: library/Efficient_Backbone/MobileOne.md
    locator: "§3.6 / Table 14 下方 ⚠ 注记（MNASNet-A1 双口径）"
    quote: "⚠ 原文自不一致：MNASNet-A1 的 Top-1 在 Table 9 为 **75.2**、在 Table 14 为 **75.8**（两处均照抄，建 claim 时勿混用）。"
    relation: supports
  - source: https://ar5iv.labs.arxiv.org/html/2206.04040
    locator: "Table 9 MobileOne-S1 行；ar5iv 渲染版（对应 arXiv v2，笔记抓取约定），2026-11-03 抓取；引句为 HTML 去标签 + math alttext 还原的归一化文本"
    quote: "MobileOne-S1 75.9 825 4.8 13.04 0.66 0.89"
    relation: supports
  - source: https://ar5iv.labs.arxiv.org/html/2206.04040
    locator: "Table 9 MobileOne-S4 行（同上抓取方式，2026-11-03）"
    quote: "MobileOne-S4 79.4 2978 14.8 26.60 0.95 1.86"
    relation: supports
  - source: https://ar5iv.labs.arxiv.org/html/2206.04040
    locator: "Table 9 MNASNet-A1 行 = 75.2 与 Table 14 MNASNet-A1 行 = 75.8（同上抓取方式，2026-11-03；两处双照抄，引用注明表号）"
    quote: "MNASNet-A1 mnasnet_cvpr 75.2 312 3.9 24.06 0.95 1.00"
    relation: supports
  - source: https://ar5iv.labs.arxiv.org/html/2206.04040
    locator: "Table 14 MNASNet-A1 行（同上抓取方式，2026-11-03）"
    quote: "MNASNet-A1 75.8 24.06 1.00 0.95 0.88"
    relation: supports
  - source: https://ar5iv.labs.arxiv.org/html/2206.04040
    locator: "§4 头条对比句（同上抓取方式，2026-11-03）"
    quote: "attains top-1 accuracy of 79.3% with a latency of 70.76ms, while MobileOne-S4 attains 79.4% with a latency of only 1.86ms"
    relation: supports
falsifiers:
  - "〔同范围复现（主张侧+对照侧）〕第三方在同一 iPhone12/CoreML round-trip 协议下复测：同延迟档内存在精度更高的模型，或 MobileOne 变体实测延迟显著高于 Table 9（如 S1 明显高于 0.89ms；注意 round-trip 取 min 的口径与其他论文 mean/median 口径不可直接混比）"
  - "〔原文核查（对照侧）〕MobileFormer 79.3%/70.76ms 数字在其原始论文无法核实，或该变体使用了更大输入分辨率/蒸馏等不对等设置（38× 为 70.76/1.86 换算，且该变体未列于 MobileOne Table 9——表内可比的 Mobileformer-96 为 72.8@16.95ms，约 9.1×）"
  - "〔原文核查〕论文勘误或新版本更改 Table 9 关键行（S1 75.9/0.89、S4 79.4/1.86）"
review_due: 2026-12-03
related: [claim-mobileone-reparam-train-inference-asymmetry, claim-mobilenet-series-accuracy-latency-progression]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：在「同分辨率、参数 <20M、不用蒸馏」的高效架构集合内，MobileOne 于 iPhone12 真机延迟口径下取得精度-延迟 SOTA——Table 9 中五个变体为 S0 71.4@0.79ms、S1 75.9@0.89ms、S2 77.4@1.18ms、S3 78.1@1.53ms、S4 79.4@1.86ms（Mobile 列）；摘要头条即 S1 的 <1ms / 75.9。跨架构头条：S4 对 79.3@70.76ms 的 MobileFormer 变体快约 38×（70.76/1.86 换算；该变体未列于 Table 9，表内可比的 Mobileformer-96 为 72.8@16.95ms，约 9.1×，见笔记 §4 核心结论 5）。

两条引用纪律：
1. **MNASNet-A1 双口径**：其 Top-1 在 Table 9 为 75.2、在 Table 14 为 75.8（论文自不一致，笔记两处照抄）——引用 MNASNet 数字必须注明表号；本次实抓 ar5iv 确认两处原文即如此。
2. **边界**：本卡不覆盖任何「比 MobileViT-S 快 N×」类倍数主张（库内笔记未收录该句、配对变体不明，未立卡）；MobileViT-S 在 Table 9 的行是 78.4@9.21ms，与 S1 75.9@0.89ms 相比约 10.3×，与论文摘要口径不同源，不作为本卡证据。检测/分割（Table 11）与蒸馏（Table 10）的领先主张亦不在本卡范围。

## 待验证

- 在 iPhone12 上按论文协议（CoreML、round-trip、取 min）复测 S1/S4 延迟，核对 0.89/1.86ms。
- 核对 MobileFormer 原文（arXiv:2111.09883）中 79.3%/70.76ms 变体的实验设置是否与 Table 9 对比集同口径。
- 用同一延迟测量框架横向复测 MobileNetV2-x1.0（0.98ms）与 S1（0.89ms），确认差距方向。

## 若成立 / 不成立意味着什么

成立：端侧分类骨干选型可在 <2ms 档优先试 MobileOne 变体（推理图无分支，利于部署与量化）；引用其「SOTA」必须带上「高效架构集合内 + 该延迟协议」两个限定。
不成立：SOTA 依赖对比集选择或延迟测量口径（取 min vs mean、ANE vs CPU），选型回到 MobileNetV2/V3、MNASNet 等基线同等对待，按实测重排。

## 核查记录

- 2026-11-05（P1-B6 表达整理班）：本卡 6 条 library 笔记引句经 grep -F 逐字验证全部命中（MobileOne.md，含 MNASNet-A1 Table 9=75.2 / Table 14=75.8 双口径 ⚠ 注记）；5 条 ar5iv 句为卡内已注 2026-11-03 抓取记录，本轮未重抓。内容审阅未发现问题：SOTA 的两个限定（高效架构集合内 + 该延迟协议）、38× 换算来源与 MobileFormer 变体未列于 Table 9、取 min 口径均已在 scope/falsifiers 在案；仅补 falsifiers 分层标注，论文数字未改写。
