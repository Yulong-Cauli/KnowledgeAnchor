---
id: claim-pdquant-pd-metric-beats-mse-cosine-2bit-activation
title: "PD-Quant 声称在 ResNet-18 的 2-bit 激活量化（W8A2/W4A2）下，PD 度量选出的激活缩放因子精度高于 MSE / Cosine（Min-Max 行论文原文无数字）"
type: claim
status: asserted
scope: "ResNet-18 分类；W8A2 与 W4A2 两种设置（激活均为 2-bit，权重 8/4-bit）；对比 Cosine / MSE / PD 三种有数字的激活缩放因子度量（Min-Max 行论文原文为「-」无数字）；精度口径为验证集 top-1 accuracy(%)（论文 Table 1 caption 原文，2026-11-03 实抓核对）；Table 1 的数据集与校准集大小论文 caption 未直接写明（同论文 Table 2 口径为 ImageNet、1024 张校准图，不能默认套用）；PD-Quant 论文自报数字"
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
    quote: "| Cosine (l)       | 11.09              | 4.15               | 2.19               | 1.14               | 0.96                 | 0.65                 |"
    relation: supports
  - source: library/Quantization/PD-Quant.md
    locator: "§4.1 / Table 1 caption 原文（2026-11-03 实抓核对）"
    quote: "Metric test (top-1 accuracy(%) on validation set for activation scaling factors"
    relation: supports
  - source: library/Quantization/PD-Quant.md
    locator: "§4.1 / Table 1"
    quote: "- **分析**：在 2-bit 激活量化下，传统的局部度量（MSE/Cosine）几乎失效，而 PD 指标能准确捕获对精度贡献最大的激活范围。"
    relation: supports
falsifiers:
  - "同范围复现（主张侧）：复现中同一搜索流程下，PD 度量选出的缩放因子在 ResNet-18 W8A2/W4A2 验证集 top-1 不高于 MSE 或 Cosine"
  - "原文核查：对照论文发现修正后 Table 1 数字与论文不符（笔记已于 2026-11-03 按 v1/v3/CVF 三版本重建并逐格核对，当前引文即修正后数字）"
  - "跨条件迁移（不充当原范围反证）：在激活 ≥3-bit 或常规 W8A8/W4A16 设置时 PD 相对 MSE 无增益，说明优势仅限极端 2-bit 激活；不直接证伪本卡 2-bit 范围内的主张"
review_due: 2026-12-02
related: [claim-pdquant-beats-brecq-qdrop-lowbit]
signoff: null
---

## 主张

> **2026-11-03 笔记数字修正（依据：nightshift/cross/quantization.md §8 + 实抓 URL：https://arxiv.org/pdf/2212.07048v3 、https://arxiv.org/pdf/2212.07048v1 、https://openaccess.thecvf.com/content/CVPR2023/papers/Liu_PD-Quant_Post-Training_Quantization_Based_on_Prediction_Difference_Metric_CVPR_2023_paper.pdf ，2026-11-03 抓取，pdftotext 提取，三版本一致）**：原笔记 Table 1 的 Min-Max 1.83/0.81、Cosine 23.36/15.68、MSE W4A2 17.55、PD W4A2 23.51 在论文三版本中均不存在，笔记已按论文原表逐格重建（还补上了 ResNet-50 与 RegNet-600M 两组列）；W8A2 的 MSE 23.15 与 PD 28.41 两值原本就与论文一致。卡内 evidence quote 已同步为新表逐字引文。**主张方向不变且被修正后数字继续支持**：ResNet-18 W8A2/W4A2 下 PD 28.41/12.27 > MSE 23.15/10.31 > Cosine 11.09/4.15，Min-Max 行论文原文即为「-」（无数字）。另：论文 Table 1 caption 明确口径为「top-1 accuracy(%) on validation set」——本卡 scope 中「精度口径笔记均未注明」的缺口已补上（验证集 top-1）。status 不动。

论文声称：为激活缩放因子 S_a 选度量时，局部特征度量在 2-bit 激活下几乎失效——ResNet-18 W8A2/W4A2 下 MSE 23.15% / 10.31%、Cosine 11.09% / 4.15%，而 PD（把量化误差传播到最终输出、算与全精度预测的 KL 散度）达到 28.41% / 12.27%；Min-Max 行论文原文即为「-」，没有数字（「高于 Min-Max」不构成 Table 1 支持的数字对比）。修正后的 Table 1 还含 ResNet-50 与 RegNet-600M 列，排序方向相同（如 ResNet-50 W8A2：PD 11.31 / MSE 9.23 / Cosine 2.19），本卡主张仍以 ResNet-18 为核心。

历史记录（2026-11-03 修正前的旧转录，论文 v1/v3/CVF 三版本中均不存在，仅作历史保留、不作当前证据）：Min-Max 1.83%/0.81%、Cosine 23.36%/15.68%、MSE W4A2 17.55%、PD W4A2 23.51%。

两个限定：
1. 口径已部分补齐：论文 Table 1 caption 写明「top-1 accuracy(%) on validation set」（验证集 top-1，2026-11-03 实抓核对）。Table 1 的数据集与校准集大小 caption 未直接写明（同论文 Table 2 为 ImageNet、1024 张校准图，不能默认套用到 Table 1），引用时仍需注明，避免 QwT 卡同类的校准/测试口径混淆。
2. 表内全部为 2-bit 激活（三个架构 × W8A2/W4A2），"PD 优于局部度量"不能外推到常规 W8A8 / W4A16 等设置。

## 待验证

- 对照 CVPR 2023 原文 / [hustvl/PD-Quant](https://github.com/hustvl/PD-Quant) 确认 Table 1 的数据集与校准集大小（数字与验证集口径已于 2026-11-03 按三版本核对，见顶部修订注记）。
- 在 ResNet-18 W4A2 上复现：MSE 与 PD 各搜一次缩放因子，比较同一验证集精度。
- 补测激活 3/4-bit 下两种度量的差距，确认"局部度量失效"的边界（跨条件迁移检查）。

## 成立/不成立的含义

成立：ResNet-18（修正后 Table 1 同表的 ResNet-50/RegNet-600M 同向）在 2-bit 激活下，PTQ 缩放因子搜索换用任务级度量（预测差异类）优于 MSE/Cosine，对端侧极限压缩选型有参考意义。其他架构类型/任务/位宽是跨条件迁移检查（见 falsifier 3），不能由本卡直接外推。
不成立：增益依赖论文特定实现或口径，该场景缩放因子搜索继续用 MSE 即可，PD-Quant 的方法论优势降级为"仅在个别设置成立"。

## 核查记录

- 2026-11-03：笔记 Table 1/2/3 按论文三版本重建；本卡 evidence 引文同步为修正后数字（见顶部修订注记）。
- 2026-11-05（02 任务书整理班 P1-B2b）：3 条既有 quote + 新增 2 条（Cosine 行、Table 1 caption）Grep 逐字命中笔记当前版。本轮完成修订注记承诺但未落地的 scope 口径更新；正文旧数字降级为历史记录块；falsifiers 补分层标注并更新原文核查条；成立/不成立段约束回 scope 配置。数字未改写（引用即笔记修正后数字）。
