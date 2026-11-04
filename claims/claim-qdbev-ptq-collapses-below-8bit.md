---
id: claim-qdbev-ptq-collapses-below-8bit
title: "QD-BEV 论文声称：BEVFormer-Base 直接 PTQ 在低于 8-bit 后性能崩塌（W4A6 NDS 0.226、下降 56.3%，W4A4 近乎失效 mAP 0.000）"
type: claim
status: asserted
scope: "nuScenes；BEVFormer-Base；对称线性量化、不训练的 PTQ（笔记 §3.2 Table 2 口径；是否用校准集及校准方法笔记未注明）；FP32 基线 NDS 0.517 / mAP 0.416；数字为论文自报；尚未独立验证"
tags: [quantization, ptq, bev, bevformer, nuscenes, qd-bev]
note: library/Quantization/QD-BEV.md#32-ptq-不同位宽的表现-table-2
paper: "ICCV 2023, QD-BEV: Quantization-aware View-guided Distillation for Multi-view 3D Object Detection (arXiv:2308.10515)"
stance: watch
evidence:
  - source: library/Quantization/QD-BEV.md
    locator: "§3.2 / Table 2"
    quote: "| **W32A32**     | Tiny / Base | 0.354 / 0.517 | -              | 0.252 / 0.416 |"
    relation: supports
  - source: library/Quantization/QD-BEV.md
    locator: "§3.2 / Table 2"
    quote: "| **W8A8**       | Base        | 0.487         | 5.8%           | 0.384         |"
    relation: supports
  - source: library/Quantization/QD-BEV.md
    locator: "§3.2 / Table 2"
    quote: "| **W4A6**       | Base        | 0.226         | 56.3%          | 0.076         |"
    relation: supports
  - source: library/Quantization/QD-BEV.md
    locator: "§3.2 / Table 2"
    quote: "| **W4A4**       | Base        | 0.023         | 95.6%          | 0.000         |"
    relation: supports
  - source: library/Quantization/QD-BEV.md
    locator: "§3.2 分析"
    quote: "**分析**：当位宽低于 8-bit 后，PTQ 性能崩塌。**4-bit 下模型近乎失效**，必须引入 QAT 和蒸馏。"
    relation: supports
falsifiers:
  - "同范围复现（主张侧）：官方实现复现中 W4A6 PTQ NDS 明显高于 0.226（预设阈值如 ≥0.4，无原文锚点，待定）或 W4A4 不失效（mAP 不为 ~0）"
  - "机制辨别（不充当原主张反证）：加入常规 PTQ 手段（逐通道 scale、clip 搜索、偏差校正，或 RepQ-ViT 式激活重参数化）后 BEV 模型 sub-8-bit PTQ 保持可用精度——改进 PTQ 有效说明崩塌并非位宽本身所致，但不推翻「朴素对称线性 PTQ 崩塌」这一原主张"
  - "同范围复现（口径校准）：同设置下 W8A8 复现值低于 0.487 达 2 个点以上（预设阈值待定），说明实现口径与论文不一致，崩塌曲线不可比"
review_due: 2026-12-02
related: [claim-repqvit-w4a4-imagenet-leads-ptq-baselines, claim-omniquant-w4a4-llama7b-zeroshot-5265]
signoff: null
---

## 我的理解

论文声称（asserted，尚未独立验证）：BEVFormer-Base 不训练直接量化时，W8A8 尚可（NDS 0.487，相对 FP32 0.517 下降 5.8%），但 W4A6 崩塌至 NDS 0.226（下降 56.3%、mAP 0.076），W4A4 近乎失效（NDS 0.023、mAP 0.000）。表内下降比与原始数字换算一致（(0.517−0.487)/0.517≈5.8%，(0.517−0.226)/0.517≈56.3%），无错位迹象。

限定：
1. 这是朴素对称线性 PTQ 的结果，不代表所有 PTQ 方法。[RepQ-ViT](claim-repqvit-w4a4-imagenet-leads-ptq-baselines.md) 在 ImageNet 分类 W4A4、[OmniQuant](claim-omniquant-w4a4-llama7b-zeroshot-5265.md) 在 LLM W4A4 都能撑住，说明「低比特必崩」与任务域和激活分布强相关，跨域结论不可直接移植。
2. 笔记未注明 PTQ 是否用校准数据及校准方法，复现时需先对齐口径。
3. 该表是论文引入 QAT + 蒸馏的动机实验，本身不证明 QD-BEV 方法有效。

原始笔记见 [QD-BEV](../library/Quantization/QD-BEV.md#32-ptq-不同位宽的表现-table-2)。

## 待验证

- 用官方仓库复现 W8A8 / W6A6 / W4A6 / W4A4 的 PTQ 曲线，核对 Table 2。
- 在同设置下叠加 RepQ-ViT 式激活重参数化或逐通道 scale，检验崩塌是否可被常规 PTQ 手段缓解。
- 确认论文 PTQ 的校准口径（有无校准集、scale 统计方式）。

## 若成立 / 不成立意味着什么

成立：BEVFormer-Base 在 nuScenes sub-8-bit 下朴素对称线性 PTQ 不可用，该配置部署需预算 QAT/蒸馏工程量。其他 BEV 模型或更强 PTQ 方法是否同样崩塌是跨条件/机制检查（见 falsifier 2），不能由本卡直接外推。
不成立：崩塌是特定校准/实现口径的产物，该场景低比特部署可先试改进 PTQ（更便宜），再考虑 QAT。

## 核查记录

- 2026-11-05（02 任务书整理班 P1-B2b）：5 条笔记 quote Grep 逐字命中笔记当前版（Table 2 未在已知笔记问题清单内）。本轮为表达整理：falsifiers 补分层标注（阈值标注为预设待定）、成立/不成立段约束回 scope 配置；数字未改写。
