---
id: claim-brecq-w4a4-comparable-qat-1024-images
title: "BRECQ 自报：W4A4 下用 1024 张校准图、0.4–0.8 GPU hours 达到与 QAT 可比精度（ResNet-18 69.60 vs PACT 69.2；MobileNetV2 66.57 超两者），仍低于 QAT 最强 LSQ 71.1"
type: claim
status: asserted
scope: "ImageNet top-1；ResNet-18 与 MobileNetV2；W4A4 全量化；PTQ 校准成本口径：1024 张校准图、单卡 GPU hours（BRECQ 自报含 2/4/8-bit 三次统一精度训练的合并口径，§4.3）；对比的 PACT/DSQ/LSQ 数字为 BRECQ 论文 Table 4 转引（各自 1.2M 训练图、100–192 GPU hours，自报口径未独立核对）；摘要 240× 为『quantized model 生产速度』的论文声称；尚未独立验证"
tags: [quantization, ptq, qat, brecq, lsq, cost-accuracy]
note: library/Quantization/BRECQ.md#34-与-qat-的成本-精度对比43-table-4
paper: "ICLR 2021（arXiv:2102.05426）, BRECQ: Pushing the Limit of Post-Training Quantization by Block Reconstruction（开源：https://github.com/yhhhli/BRECQ）"
stance: watch
evidence:
  - source: library/Quantization/BRECQ.md
    locator: "§4.3 / Table 4（ResNet-18，Brecq 行）"
    quote: "| | Brecq (Ours) | 4/4 | 69.60 | 5.81 MB | 1024 | 0.4 |"
    relation: supports
  - source: library/Quantization/BRECQ.md
    locator: "§4.3 / Table 4（ResNet-18，PACT 行）"
    quote: "| | PACT (Choi et al., 2018) | 4/4 | 69.2 | 5.81 MB | 1.2 M | 100 |"
    relation: supports
  - source: library/Quantization/BRECQ.md
    locator: "§4.3 / Table 4（ResNet-18，LSQ 行——QAT 侧最强）"
    quote: "| | LSQ (Esser et al., 2020) | 4/4 | 71.1 | 5.81 MB | 1.2 M | 100 |"
    relation: supports
  - source: library/Quantization/BRECQ.md
    locator: "§4.3 / Table 4（MobileNetV2，Brecq 行）"
    quote: "| MobileNetV2 FP: 72.49 | Brecq (Ours) | 4/4 | 66.57 | 2.26 MB | 1024 | 0.8 |"
    relation: supports
  - source: library/Quantization/BRECQ.md
    locator: "§4.3 正文结论"
    quote: "Table 4 shows that although Brecq is a PTQ method with limited available data, it can achieve comparable accuracy results with existing quantization-aware training models. In addition, our method can surpass them in 4-bit MobileNetV2 while using less than one training GPU hours."
    relation: supports
  - source: library/Quantization/BRECQ.md
    locator: "Abstract（abs 页抓取引文）"
    quote: "And for the first time we prove that, without bells and whistles, PTQ can attain 4-bit ResNet and MobileNetV2 comparable with QAT and enjoy 240 times faster production of quantized models."
    relation: supports
falsifiers:
  - "官方仓库复现 W4A4 ResNet-18 明显低于 69.60（如 <69）或 MobileNetV2 明显低于 66.57，或 1024 图 / 0.4–0.8 GPU hours 的成本口径不成立（显著超时）"
  - "同口径重跑 PACT/DSQ 后精度显著高于 BRECQ 转引值，『可比』反转成『明显更低』"
  - "发现 BRECQ 的 GPU hours 口径（3 次统一精度训练合并 + 查表法混合精度）与 QAT 的 100/192 hours 不可比（如不含搜索/调参时间），成本优势被高估"
review_due: 2026-12-03
related: [claim-brecq-block-granularity-best-w2-ablation, claim-brecq-w2a4-first-usable-level, claim-lsq-top1-beats-previous-2-3-4bit]
signoff: null
---

## 我的理解

论文声称（asserted，尚未独立验证）：4-bit 全量化下，BRECQ 作为 PTQ 方法（1024 张校准图、ResNet-18 0.4 / MobileNetV2 0.8 GPU hours）达到与 QAT 方法可比的精度，并在 4-bit MobileNetV2 上反超 QAT——这是「PTQ 首次追平 QAT（4-bit）」这一论文头衔主张的证据表（Table 4，2026-11-03 已对 arXiv HTML v2 逐行实抓核对一致）。

必须记住的三个限定：

1. **"可比" ≠ "超过 LSQ"**：ResNet-18 上 BRECQ 69.60 仍比 QAT 最强的 LSQ（71.1）低 1.5 点；"comparable" 成立的对象是 PACT（69.2）/ DSQ（69.56），且 MobileNetV2 上超 PACT（61.40）/ DSQ（64.80）达 1.8～5.2 点。引用时不能写成「BRECQ 精度等于/高于 QAT」。
2. **成本口径不对称**：BRECQ 的 0.4/0.8 GPU hours 是校准+逐块重建（§4.3 自述含 2/4/8-bit 三次统一精度训练、混合精度只查表），QAT 的 100/192 GPU hours 是端到端训练；两边都不含超参搜索时间，但数据量（1024 vs 1.2M）与流程性质不同，比较是数量级意义上的。摘要的 240× 是"quantized models 生产速度"，与 GPU hours 列不是同一口径。
3. **转引未核对**：PACT/DSQ/LSQ 的数字来自 BRECQ Table 4 转引（各方法原论文口径可能不同，如训练 schedule），本卡按单表锚定；LSQ 侧的原文自报见 [LSQ 领先卡](claim-lsq-top1-beats-previous-2-3-4bit.md)（其 Table 1 中 4-bit ResNet-18 也是 71.1，两处一致）。校准集细节（1024 张 224×224、fold BN、freeze BN 统计量）见笔记 §B.4.4。

## 待验证

- 官方仓库跑 W4A4 ResNet-18 / MobileNetV2，核对 69.60 / 66.57 与 1024 图 / 0.4–0.8 GPU hours（注明 GPU 型号；笔记另处称 GTX 1080TI 20 分钟出 ResNet-18，可与 0.4 GPU hours 互证）。
- 用 LSQ 官方代码核对其 4-bit ResNet-18 71.1 的训练配置，确认 BRECQ 转引无低报。
- 澄清 240× 的分母（相对什么流程的"production"时间）。

## 若成立 / 不成立意味着什么

成立：4-bit 场景下 PTQ 是默认起点（成本差 2–3 个数量级，精度代价 ≤1.5 点），只有追求最后零点几点的场景才上 QAT；边缘部署选型可按此估成本。
不成立：精度-成本优势依赖口径（校准集、GPU hours 计法、转引基线），4-bit 部署仍需按 QAT 流程做预算，BRECQ 降级为快速估算工具。
