---
id: claim-lsq-top1-beats-previous-2-3-4bit
title: "LSQ 自报：ImageNet 上 2/3/4-bit 全量化网络 top-1 高于此前所有已报告方法（ResNet-18 2-bit 67.6 vs QIL 65.7 / LQ-Nets 64.9 / PACT 64.4）"
type: claim
status: asserted
scope: "ImageNet；pre-activation ResNet-18/34/50/101/152、VGG-16bn、SqueezeNext-23-2x；权重与激活同 bit（W2A2/W3A3/W4A4 类，首末层恒 8-bit）；QAT 微调（2/3/4-bit 训 90 epochs、从全精度权重初始化）；对比方法 QIL/FAQ/LQ-Nets/PACT/NICE/Regularization 的数字为 LSQ 论文 Table 1 转引（各方法原论文口径未逐一核对）；『高于所有已报告方法』为论文自报口径"
tags: [quantization, qat, lsq, low-bit, imagenet]
note: library/Quantization/LSQ.md#31-与其他方法对比32-table-1
paper: "ICLR 2020（arXiv:1902.08153）, Learned Step Size Quantization（IBM Research；论文未给官方代码链接）"
stance: watch
evidence:
  - source: library/Quantization/LSQ.md
    locator: "§3.2 正文结论"
    quote: "We found that LSQ achieved a higher top-1 accuracy than all previous reported approaches for 2-, 3- and 4- bit networks with the architectures considered here."
    relation: supports
  - source: library/Quantization/LSQ.md
    locator: "§3.2 / Table 1（ResNet-18，LSQ 行）"
    quote: "| — | LSQ (Ours) | 67.6 | 70.2 | 71.1 | 71.1 | 87.6 | 89.4 | 90.0 | 90.1 |"
    relation: supports
  - source: library/Quantization/LSQ.md
    locator: "§3.2 / Table 1（ResNet-18，QIL 行）"
    quote: "| — | QIL | 65.7 | 69.2 | 70.1 | — | — | — | — | — |"
    relation: supports
  - source: library/Quantization/LSQ.md
    locator: "§3.2 / Table 1（ResNet-18，PACT 行）"
    quote: "| — | PACT | 64.4 | 68.1 | 69.2 | — | — | 85.6 | 88.2 | 89.0 |"
    relation: supports
  - source: library/Quantization/LSQ.md
    locator: "§3.2 / Table 1（ResNet-18，全精度基线行）"
    quote: "| ResNet-18 | Full precision | 70.5 | — | — | — | 89.6 | — | — | — |"
    relation: supports
falsifiers:
  - "同口径复现（如 NNI/Brevitas 等第三方实现）中任一所测架构、任一 2/3/4-bit 设置下 LSQ 不高于 QIL/PACT/LQ-Nets 等的可比复现"
  - "统一训练预算与 schedule 后做公平比较，LSQ 相对次优（QIL）的优势消失或反转"
  - "对照 ar5iv/arXiv 发现 Table 1 数字与笔记不一致（2026-11-03 已实抓核对 ResNet-18 各行一致，若其他架构行有出入则触发）"
review_due: 2026-12-03
related: [claim-lsq-3bit-distillation-matches-full-precision, claim-brecq-w4a4-comparable-qat-1024-images]
signoff: null
---

## 主张

论文声称（asserted）：给每层权重/激活各加一个可学习步长（用对量化切换点敏感的分段梯度 + 步长梯度尺度 $1/\sqrt{NQ_P}$），在 ImageNet 上把 2/3/4-bit 全量化网络的 top-1 推到当时所有已报告方法之上。锚单表 ResNet-18：2-bit 67.6 / 3-bit 70.2 / 4-bit 71.1，对 QIL 65.7/69.2/70.1、PACT 64.4/68.1/69.2——2-bit 领先次优 1.9 点、4-bit 反超全精度基线（71.1 vs 70.5）。

口径限定：

1. **自报跨论文对比**：Table 1 的 QIL/FAQ/LQ-Nets/PACT/NICE/Regularization 数字为转引，方法原论文的训练预算、数据增强、首末层口径未必一致（LSQ 只比较"已发表的、全层量化到指定精度"的模型，首末层允许更高精度）；"高于所有已报告方法"只在论文自报的这张表内成立。
2. **WxAx 而非 W2A4**：LSQ 的位宽记法是权重与激活同 bit（2/2、3/3、4/4）；引用时勿与 BRECQ 的 W2A4、PD-Quant 的 4/2 等异构配置混比（各卡 scope 已分开）。
3. **QAT 成本**：LSQ 需从全精度权重初始化后微调 90 epochs 量级——与 PTQ（BRECQ 1024 图 20 分钟）是不同成本档；BRECQ Table 4 也把 LSQ 71.1 作为 QAT 侧参照（见 [BRECQ QAT 对比卡](claim-brecq-w4a4-comparable-qat-1024-images.md)，两处 71.1 一致）。
4. 论文未开源（笔记核实 arXiv/abs 页无代码链接），复现依赖第三方实现。

原文复核：ar5iv（https://ar5iv.labs.arxiv.org/html/1902.08153 ）2026-11-03 实抓，Table 1 ResNet-18 各行（LSQ 67.6/70.2/71.1，QIL 65.7/69.2/70.1，PACT 64.4/68.1/69.2，FP 70.5）、§3.2 结论句与 Table 4 三行逐项核对一致。

## 待验证

- 用第三方实现（如 NVIDIA/TensorRT Model Optimizer 或 NNI 的 LSQ）复现 2-bit ResNet-18 67.6，确认无官方码下的可复现性。
- 同口径复跑 QIL/PACT（或引用其原论文数字）核对 Table 1 转引是否低报。
- 验证步长梯度尺度 $1/\sqrt{NQ_P}$ 的消融（笔记 Table 3：去掉则不收敛或掉 3.4 点）——方法有效性的第二支柱。

## 成立/不成立的含义

成立：可学习步长是 QAT 低比特的标配组件（后续 LSQ+、APOT 等沿此线），2-bit 全量化 QAT 的精度上限由 LSQ 类方法定义。
不成立：领先来自训练预算/口径差，步长学习退化为普通可学习量化参数，低比特 QAT 选型回到 PACT/QIL 系或 PTQ 路线。
