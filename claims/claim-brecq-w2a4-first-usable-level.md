---
id: claim-brecq-w2a4-first-usable-level
title: "BRECQ 自报：首次把 PTQ 的 W2A4 精度推到可用水平（ResNet-18 64.80 / ResNet-50 70.29），表中其余方法同设置全部崩塌（≤0.21）"
type: claim
status: asserted
scope: "ImageNet top-1；ResNet-18/50、MobileNetV2、RegNet-600MF/3.2GF、MNasNet-2.0 六个 CNN；权重 2-bit / 激活 4-bit 全量化（首末层 8-bit）；『崩塌』指 BRECQ Table 3 内 ZeroQ/LAPQ/AdaQuant 的 2/4 行（0.05–0.21）；『首次/first』为论文自报（作者所知范围）；跨方法对比为 BRECQ 论文自报口径，尚未独立验证"
tags: [quantization, ptq, brecq, low-bit, w2a4]
note: library/Quantization/BRECQ.md#33-imagenet全量化-w4a4--w2a42-table-3
paper: "ICLR 2021（arXiv:2102.05426）, BRECQ: Pushing the Limit of Post-Training Quantization by Block Reconstruction（开源：https://github.com/yhhhli/BRECQ）"
stance: watch
evidence:
  - source: library/Quantization/BRECQ.md
    locator: "§4.2 正文"
    quote: "To be noted, Brecq is the first to promote the 2W4A accuracy of PTQ to a usable level while all other existing methods crashed."
    relation: supports
  - source: library/Quantization/BRECQ.md
    locator: "§4.2 / Table 3（Brecq 2/4 行，含 ± 方差）"
    quote: "| Brecq (Ours) | 2/4 | 64.80±0.08 | 70.29±0.23 | 53.34±0.15 | 59.31±0.49 | 67.15±0.11 | 63.01±0.35 |"
    relation: supports
  - source: library/Quantization/BRECQ.md
    locator: "§4.2 / Table 3（LAPQ 2/4 行，* 为 BRECQ 作者实现）"
    quote: "| LAPQ (Nahshan et al., 2019)* | 2/4 | 0.18 | 0.14 | 0.13 | 0.17 | 0.12 | 0.18 |"
    relation: supports
  - source: library/Quantization/BRECQ.md
    locator: "§4.2 / Table 3（Full Prec. 行，作崩塌参照）"
    quote: "| Full Prec. | 32/32 | 71.08 | 77.00 | 72.49 | 73.71 | 78.36 | 76.68 |"
    relation: supports
falsifiers:
  - "官方仓库复现 W2A4 任一模型明显低于 Table 3（如 ResNet-18 <64 或 ResNet-50 <70），或方差远大于 ±0.5"
  - "同设置复现 ZeroQ/LAPQ/AdaQuant 中任一方法精度明显高于 0.21（即『其余全崩』不成立，或崩塌是 BRECQ 作者实现的工件）"
  - "发现更早的 PTQ 工作已在 W2A4（或等价 2W4A）设置达到可用精度（>50），推翻论文自报的 first"
review_due: 2026-12-03
related: [claim-brecq-block-granularity-best-w2-ablation, claim-brecq-w4a4-comparable-qat-1024-images]
signoff: null
---

## 我的理解

论文声称（asserted，尚未独立验证）：激活压到 4-bit 后（W2A4），既有 PTQ 方法（ZeroQ / LAPQ / AdaQuant，部分为 BRECQ 作者复现，标 *）精度全部崩到 0.05–0.21（对照全精度 71.08–78.36），而 BRECQ 达到 53.34–70.29——论文据此自称首次把 PTQ 的 2W4A 精度推到"可用水平"（usable level）。这是摘要贡献 3（"quantize weights to INT2 without significant accuracy loss for the first time"）在激活 4-bit 设置下的证据。

必须记住的口径限定：

1. **"可用"是相对词**：W2A4 下 BRECQ 相对全精度仍掉 3.4～13.2 点（如 ResNet-50 70.29 vs 77.00、MobileNetV2 53.34 vs 72.49），"usable" 指相对其余方法的崩塌，不是无损。
2. **跨方法对比为自报口径**：ZeroQ/LAPQ/AdaQuant 行部分标 *（BRECQ 作者基于开源码实现），其原始论文未必报告过 W2A4；崩塌结论只在 Table 3 这张表内成立，引用时注明「BRECQ 论文自报」。
3. **"first" 是作者所知范围的自报**（同类措辞见 [LSQ 3-bit 蒸馏卡](claim-lsq-top1-beats-previous-2-3-4bit.md) 的 "for the first time that we are aware of"），本卡按自报口径收录。
4. W2A4 ≠ W2A2：本卡激活是 4-bit；更激进的 W2A2 见 [PD-Quant 对比卡](claim-pdquant-beats-brecq-qdrop-lowbit.md) 的低比特设置（那张卡里 BRECQ W2A2 数字已证伪，勿与本卡 W2A4 数字混用）。

## 待验证

- 官方仓库复现 W2A4 ResNet-18 64.80±0.08 与 ResNet-50 70.29±0.23（笔记 §B.4.4：每块 2×10⁴ 次迭代、Adam、rounding lr 10⁻³、激活步长 lr 4e-5）。
- 用 ZeroQ / LAPQ 官方码复跑 2/4 设置，确认崩塌非复现工件。
- 检索 2021 年前文献确认无更早的可用级 W2A4 PTQ 结果。

## 若成立 / 不成立意味着什么

成立：权重 2-bit / 激活 4-bit 的 PTQ 从此有可用起点，块重建 + FIM 平方梯度加权是关键组件；极低比特压缩选型先试 BRECQ 系。
不成立：W2A4 可用性依赖 BRECQ 自报的对比表，基线崩塌系复现或口径工件，极低比特 PTQ 选型回到 QAT 或混合精度路线。

## 核查记录

- 2026-11-05（P1-B2a 量化主线经典组）：evidence 四条 quote 对笔记逐字机械核对命中；发现正文 W2A4 BRECQ 区间上界误写为 73.56（该值属 Table 3 的 4/4 行 MnasNet），改为 2/4 行实际的 70.29（53.34–70.29），其余数字与命题未改。
