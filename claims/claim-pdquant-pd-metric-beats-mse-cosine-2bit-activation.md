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
    quote: "| **PD (g, Ours)** | **28.41**          | **12.27**          | **11.31**          | **6.01**           | **7.47**             | **3.17**             |"
    relation: supports
  - source: library/Quantization/PD-Quant.md
    locator: "§4.1 / Table 1"
    quote: "| MSE (l)          | 23.15              | 10.31              | 9.23               | 4.85               | 3.71                 | 1.88                 |"
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

> **2026-11-03 笔记数字修正（依据：nightshift/cross/quantization.md §8 + 实抓 URL：https://arxiv.org/pdf/2212.07048v3 、https://arxiv.org/pdf/2212.07048v1 、https://openaccess.thecvf.com/content/CVPR2023/papers/Liu_PD-Quant_Post-Training_Quantization_Based_on_Prediction_Difference_Metric_CVPR_2023_paper.pdf ，2026-11-03 抓取，pdftotext 提取，三版本一致）**：原笔记 Table 1 的 Min-Max 1.83/0.81、Cosine 23.36/15.68、MSE W4A2 17.55、PD W4A2 23.51 在论文三版本中均不存在，笔记已按论文原表逐格重建（还补上了 ResNet-50 与 RegNet-600M 两组列）；W8A2 的 MSE 23.15 与 PD 28.41 两值原本就与论文一致。卡内 evidence quote 已同步为新表逐字引文。**主张方向不变且被修正后数字继续支持**：ResNet-18 W8A2/W4A2 下 PD 28.41/12.27 > MSE 23.15/10.31 > Cosine 11.09/4.15，Min-Max 行论文原文即为「-」（无数字）。另：论文 Table 1 caption 明确口径为「top-1 accuracy(%) on validation set」——本卡 scope 中「精度口径笔记均未注明」的缺口已补上（验证集 top-1）。status 不动。

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
