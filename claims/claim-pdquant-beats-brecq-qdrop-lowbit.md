---
id: claim-pdquant-beats-brecq-qdrop-lowbit
title: "PD-Quant 自报在四个低比特设置（ResNet-18/ResNet-50 2/2、MobileNetV2 4/2、MNasNet 2/2）下精度均高于 BRECQ 与 QDrop"
type: claim
status: asserted
scope: "ResNet-18 2/2（53.14%）、ResNet-50 2/2（63.15%）、MobileNetV2 4/2（20.10%）、MNasNet 2/2（27.58%）四个设置；对比 BRECQ 与 QDrop；数据集与校准配置笔记未注明（方法部分举例校准集'如 1024 张图'，未与 Table 3 绑定）；'均高于'仅在笔记列出的这四个设置内成立；PD-Quant 论文自报数字"
tags: [quantization, ptq, pdquant]
note: library/Quantization/PD-Quant.md#43-与-sota-方法对比-table-3
paper: "CVPR 2023, PD-Quant: 基于预测差异度量的后训练量化（开源：https://github.com/hustvl/PD-Quant）"
stance: watch
evidence:
  - source: library/Quantization/PD-Quant.md
    locator: "§4.3 / Table 3"
    quote: "| **ResNet-18**   | 2/2           | 51.42       | **53.14±0.14** |"
    relation: supports
  - source: library/Quantization/PD-Quant.md
    locator: "§4.3 / Table 3"
    quote: "| **MNasNet**     | 2/2           | 23.59       | **27.58±0.60** |"
    relation: supports
  - source: library/Quantization/PD-Quant.md
    locator: "§4.3 / Table 3"
    quote: "- **分析**：在笔记摘录的四个低比特设置下 PD-Quant 均高于 QDrop（+1.72 / +1.71 / +2.80 / +3.99 个百分点）。特别是在 MobileNet 和 MNasNet 等紧凑型网络上，由于其对分布更敏感，PD-Quant 带来的增益更加显著（最高接近 4 个百分点）。"
    relation: supports
falsifiers:
  - "复现任一列出设置（ResNet-18/ResNet-50 2/2、MobileNetV2 4/2、MNasNet 2/2）中 PD-Quant 精度不高于 QDrop"
  - "对照原文发现 Table 3 数字与笔记不一致（表格抄写错位，参照 EMC2 笔记表格错位教训）"
  - "统一校准集大小 / 迭代预算等口径后做公平比较，PD-Quant 相对 QDrop 的优势消失"
review_due: 2026-12-02
related: [claim-pdquant-pd-metric-beats-mse-cosine-2bit-activation, claim-pdquant-pd-loss-alone-overfits-calibration]
signoff: null
---

## 我的理解

> **待主人裁定**（2026-11-03 笔记数字修正（依据：nightshift/cross/quantization.md §8 + 实抓 URL：https://arxiv.org/pdf/2212.07048v3 、https://arxiv.org/pdf/2212.07048v1 、https://openaccess.thecvf.com/content/CVPR2023/papers/Liu_PD-Quant_Post-Training_Quantization_Based_on_Prediction_Difference_Metric_CVPR_2023_paper.pdf ，2026-11-03 抓取，pdftotext 提取，三版本一致））：本卡 BRECQ 半边主张被证伪——论文 Table 3 **没有 BRECQ 基线列**（基线为 ACIQ-Mix/LAPQ/Bit-Split/AdaRound/QDrop），原笔记 BRECQ 列数字（46.58/55.33/15.11/20.33）在论文 v1/v3/CVF 三个版本中均不存在，QDrop 论文（arXiv:2203.05740v2）与 BRECQ 论文中也未命中，「PD-Quant 均高于 BRECQ」的对比在论文中不存在，**falsifier 2 被触发**。QDrop 半边主张仍成立且更强：ResNet-50 行修正为 QDrop 55.45 / PD-Quant 57.16±0.15（原 61.94/63.15 三版本均不存在），四个设置相对 QDrop 为 +1.72 / +1.71 / +2.80 / +3.99 个百分点。笔记已按论文原表重建（见 library/Quantization/PD-Quant.md §4.3 修正注记），卡内 evidence quote 已同步为新表逐字引文；卡 title/scope 内的 BRECQ 对比与 63.15% 为修正前旧数字，**不改卡 status**，改写主张（如拆掉 BRECQ 半边或整卡重述）待主人裁定。另见 claim-pdquant-note-table-mismatch。

论文声称（尚未独立验证）：在笔记列出的四个低比特设置里，PD-Quant 精度全部高于 BRECQ 与 QDrop，相对 QDrop 的增益为 +1.72 / +1.21 / +2.80 / +3.99 个百分点（ResNet-18 / ResNet-50 / MobileNetV2 / MNasNet），紧凑型网络增益更大（笔记称"最高提升 4%"，对应 MNasNet 2/2 的 +3.99%）。

限定：
1. 这是自报对比，且笔记的表只有 4 行，不含 ViT / LLM、不含 W4A16 等常规设置，不能外推。
2. 笔记未注明数据集与校准集配置，也未注明 BRECQ/QDrop 数字是复现还是引用——做公平性判断前需对照原文。
3. 2/2 精度本身很低（MNasNet 27.58%），"领先"是相对的，不代表该精度可直接部署。

## 待验证

- 对照 CVPR 2023 原文核对 Table 3 全部数字、数据集（应为主流 ImageNet 分类基准，待确认）、校准集大小与对比数字来源。
- 用官方仓库在 ResNet-18 2/2 上复现 53.14%，并同口径复跑 QDrop 对照。
- 确认"紧凑网络增益更大"是否统计上站得住（只有 2 个紧凑网络样本点）。

## 若成立 / 不成立意味着什么

成立：2-bit 极限压缩场景下 PD-Quant 是当时（CVPR 2023）ImageNet 分类 PTQ 的优先候选，尤其对 MobileNet/MNasNet 类轻量骨干。
不成立：优势依赖口径或特定实现，2-bit 场景选型回到 QDrop / BRECQ 及其后继者，PD-Quant 降级为方法学参考。
