---
id: claim-pdquant-pd-metric-beats-mse-cosine-2bit-activation
title: "PD-Quant 声称在 2-bit 激活量化下，PD 度量选出的激活缩放因子精度高于 MSE / Cosine / Min-Max"
type: claim
status: asserted
scope: "ResNet-18 分类；W8A2 与 W4A2 两种设置（激活均为 2-bit，权重 8/4-bit）；对比 Min-Max / Cosine / MSE / PD 四种激活缩放因子度量；数据集、校准集大小与精度口径（校准集还是验证集）笔记均未注明；PD-Quant 论文自报数字"
tags: [quantization, ptq, pdquant]
note: library/Quantization/PD-Quant.md#41-激活缩放因子度量对比-table-1
paper: "CVPR 2023, PD-Quant: 基于预测差异度量的后训练量化（开源：https://github.com/hustvl/PD-Quant）"
stance: watch
evidence:
  - source: library/Quantization/PD-Quant.md
    locator: "§4.1 / Table 1"
    quote: "| **PD (Ours)** | **28.41%** | **23.51%** |"
    relation: supports
  - source: library/Quantization/PD-Quant.md
    locator: "§4.1 / Table 1"
    quote: "| MSE           | 23.15%     | 17.55%     |"
    relation: supports
  - source: library/Quantization/PD-Quant.md
    locator: "§4.1 / Table 1"
    quote: "- **分析**：在 2-bit 激活量化下，传统的局部度量（MSE/Cosine）几乎失效，而 PD 指标能准确捕获对精度贡献最大的激活范围。"
    relation: supports
falsifiers:
  - "复现中同一搜索流程下，PD 度量选出的缩放因子在 ResNet-18 W8A2/W4A2 精度不高于 MSE 或 Cosine"
  - "对照原文发现 Table 1 数字与笔记不符，或精度口径与笔记暗示的对比方式不一致"
  - "在激活 ≥3-bit 时 PD 相对 MSE 无增益（说明优势仅限极端 2-bit 激活，笔记未给其他位宽数据）"
review_due: 2026-12-02
related: [claim-pdquant-beats-brecq-qdrop-lowbit]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：为激活缩放因子 S_a 选度量时，局部特征度量在 2-bit 激活下几乎失效——Min-Max 只有 1.83%（W8A2）/ 0.81%（W4A2），MSE 23.15% / 17.55%，Cosine 23.36% / 15.68%，而 PD（把量化误差传播到最终输出、算与全精度预测的 KL 散度）达到 28.41% / 23.51%。

两个限定：
1. 笔记没有写 Table 1 的数据集和精度口径（校准集还是验证集），也没写校准集大小——引用这条数字时必须注明"口径未核对原文"，避免 QwT 卡同类的校准/测试口径混淆。
2. 表里只有 2-bit 激活的两个点，"PD 优于局部度量"不能外推到常规 W8A8 / W4A16 等设置。

## 待验证

- 对照 CVPR 2023 原文 / [hustvl/PD-Quant](https://github.com/hustvl/PD-Quant) 核对 Table 1 的数据集、指标（是否 ImageNet top-1）与数字。
- 在 ResNet-18 W4A2 上复现：MSE 与 PD 各搜一次缩放因子，比较同一验证集精度。
- 补测激活 3/4-bit 下两种度量的差距，确认"局部度量失效"的边界。

## 若成立 / 不成立意味着什么

成立：极低比特激活（≤2-bit）的 PTQ 参数搜索应换用任务级度量（预测差异类），MSE/Cosine 不可信；这对端侧极限压缩选型有直接指导意义。
不成立：增益依赖论文特定实现或口径，缩放因子搜索继续用 MSE 即可，PD-Quant 的方法论优势降级为"仅在个别设置成立"。
