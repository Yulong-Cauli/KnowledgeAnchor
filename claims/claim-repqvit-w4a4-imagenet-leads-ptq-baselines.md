---
id: claim-repqvit-w4a4-imagenet-leads-ptq-baselines
title: "RepQ-ViT 论文自报：W4A4 下 ViT-B / DeiT-S / Swin-S 在 ImageNet 达 68.48 / 69.03 / 79.45，高于 PTQ4ViT 与 APQ-ViT，且无超参调节、无重建"
type: claim
status: asserted
scope: "ImageNet 图像分类；W4A4 PTQ（权重与激活均 4-bit）；模型 ViT-B / DeiT-S / Swin-S（FP32 基准 84.54 / 79.85 / 83.23）；精度为论文自报测试集准确率（笔记未写明 val split 与 top-1 口径）；RepQ-ViT 在无超参调节（No HP）、无昂贵重建（No REC）设定下运行，校准仅用 32 张图（§3.3，笔记未注明校准集来源与 split，校准 vs 测试口径以此区分）；对比方法（FQ-ViT / PTQ4ViT / APQ-ViT）数字为论文转引"
tags: [quantization, ptq, repqvit, vit, w4a4, imagenet]
note: library/Quantization/RepQ-ViT.md#31-极限-4-bit-图像分类-imagenet
paper: "ICCV 2023, RepQ-ViT: Scale Reparameterization for Post-Training Quantization of Vision Transformers（代码：https://github.com/zkkli/RepQ-ViT）"
stance: watch
evidence:
  - source: library/Quantization/RepQ-ViT.md
    locator: "§3.1 / W4A4 ImageNet 对比表"
    quote: "| **RepQ-ViT (Ours)** |   **✓**   |   **✓**    | **68.48** | **69.03**  | **79.45**  |"
    relation: supports
  - source: library/Quantization/RepQ-ViT.md
    locator: "§3.1 / W4A4 ImageNet 对比表（FQ-ViT 崩盘行）"
    quote: "| FQ-ViT              |     ×     |     ✓      |   0.10    |    0.10    |    0.10    |"
    relation: supports
  - source: library/Quantization/RepQ-ViT.md
    locator: "§3.1 / 表后分析"
    quote: "**分析**：在无超参 (No HP) 且无昂贵重建 (No REC) 的纯 PTQ 设定下，RepQ-ViT 在 DeiT-S 上将准确率从 43.55% 暴涨至 69.03% (+25.48%)，首次将 ViT 的 4-bit 量化推向可用水平。"
    relation: supports
falsifiers:
  - "官方实现（zkkli/RepQ-ViT）同设置复现中，任一模型 W4A4 测试精度显著低于自报值 68.48 / 69.03 / 79.45（如差距 > 2 点）"
  - "复现发现 No HP / No REC 设定不成立：需要超参搜索或梯度重建才能达到该精度"
  - "统一评测协议下对比方法数字与论文转引不符，PTQ4ViT / APQ-ViT 追平或反超 RepQ-ViT"
  - "对照论文原文发现笔记表格数字错位（参照 claim-emc2-note-table-mismatch、claim-echofusion-note-table-mismatch 先例）"
review_due: 2026-12-02
related: [claim-qwt-r2-gate-nonregression, claim-omniquant-w4a4-llama7b-zeroshot-5265]
signoff: null
---

## 我的理解

论文声称（asserted）：W4A4 极限设定下此前 PTQ 方法全面崩盘（FQ-ViT 0.10、PTQ4ViT 30.69 / 34.08 / 76.09、APQ-ViT 41.41 / 43.55 / 77.15），RepQ-ViT 在 ViT-B / DeiT-S / Swin-S 上达 68.48 / 69.03 / 79.45，且不需要超参调节和梯度重建。论文将此归因于"量化-推理解耦"：量化阶段用复杂量化器（逐通道、log_√2）保精度，推理阶段经尺度重参数化转换为硬件友好的简单量化器（逐层、log_2）。

三个必须记住的限定：

1. **校准 vs 测试口径**（QwT 教训）：表中精度是测试集（ImageNet）自报数字；校准只用了 32 张图（§3.3），笔记未注明校准集来源与 split。复现时必须先确认校准/测试互不重叠。
2. **对比方法设定不完全对齐**：表中 FQ-ViT 用超参（No HP ×）、PTQ4ViT 与 APQ-ViT 用重建（No REC ×），只有 RepQ-ViT 两列全 ✓。"高于基线"成立，但不是同设定下的受控对比。
3. "首次将 ViT 的 4-bit 量化推向可用水平"是论文措辞；69.03% 距 FP32 基准 79.85% 仍差约 10.8 点，"可用"是相对此前 0.10%~43.55% 而言。

机制细节见消融卡：[LayerNorm 重参数化](claim-repqvit-layernorm-reparam-recovers-layerwise.md)、[Softmax 重参数化](claim-repqvit-softmax-reparam-log2-lossless.md)、[校准效率](claim-repqvit-calibration-32-images-1point3-min.md)。原始笔记见 [RepQ-ViT](../library/Quantization/RepQ-ViT.md#31-极限-4-bit-图像分类-imagenet)。

## 待验证

- 用官方仓库复现 DeiT-S W4A4 top-1（目标 69.03），并确认校准集构成（32 张图的来源 split）与测试 split 互不重叠。
- 对照论文原文核对笔记 §3.1 表格全部数字（含 FP32 行与三个基线行）。
- 在目标部署硬件上确认逐层量化 + log_2 量化（重参数化后形态）是否有开箱即用的内核支持。

## 若成立 / 不成立意味着什么

成立：ViT 4-bit PTQ 有可用路线，"量化-推理解耦 + 尺度重参数化"可作为低比特 ViT 部署选型参考（与 OmniQuant 的 W4A4、QwT 的补偿同属 PTQ 主线，但 RepQ-ViT 针对 ViT 激活极端分布）。
不成立：精度依赖自报口径或未写明的校准设定，4-bit ViT 选型回退 W8A8 或 QAT。
