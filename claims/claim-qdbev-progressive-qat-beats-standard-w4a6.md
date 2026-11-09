---
id: claim-qdbev-progressive-qat-beats-standard-w4a6
title: "QD-BEV 论文声称：BEVFormer-Base W4A6 下按模块敏感度分四阶段的渐进式 QAT 达 NDS 0.485，比标准一次性 QAT（0.224）高 0.261"
type: claim
status: asserted
scope: "nuScenes；BEVFormer-Base；W4A6；渐进式 = 按 Backbone→Neck→Encoder→Decoder 分四阶段，每阶段仅量化当前模块并独立训练 N_i 个 epoch（epoch 数笔记未注明），未轮到模块保持高精度（笔记 §2 渐进式策略 + §3.3 Table 3 口径）；对比对象为同配置标准一次性全网 QAT；数字为论文自报"
tags: [quantization, qat, progressive-quantization, bev, bevformer, nuscenes, qd-bev]
note: library/Quantization/QD-BEV.md#33-渐进式-qat-与标准-qat-对比-table-3
paper: "ICCV 2023, QD-BEV: Quantization-aware View-guided Distillation for Multi-view 3D Object Detection (arXiv:2308.10515)"
stance: watch
evidence:
  - source: library/Quantization/QD-BEV.md
    locator: "§3.3 / Table 3"
    quote: "| **Standard QAT**    | Base     | 0.224     | 56.7%        | 0.071     |"
    relation: supports
  - source: library/Quantization/QD-BEV.md
    locator: "§3.3 / Table 3"
    quote: "| **Progressive QAT** | Base     | **0.485** | **6.2%**     | **0.376** |"
    relation: supports
  - source: library/Quantization/QD-BEV.md
    locator: "§2 渐进式策略"
    quote: "作者将量化过程分为四个阶段，按敏感度排序逐步引入"
    relation: supports
  - source: library/Quantization/QD-BEV.md
    locator: "§3.3 分析"
    quote: "**分析**：渐进式策略显著缓解了量化扰动，使大模型（Base）在 4-bit 下依然能维持极高精度。"
    relation: supports
falsifiers:
  - "官方实现复现中标准 QAT 与渐进 QAT 的 NDS 差距显著小于 0.261（如 <0.05）"
  - "标准 QAT 经常规稳定化（warmup/学习率调度、梯度裁剪、LSQ 可学习 scale）后达到 ≥0.45 NDS，渐进策略优势消失"
  - "打乱分阶段顺序（如先 Decoder 后 Backbone）后收益不变，说明增益不来自按敏感度渐进引入量化"
review_due: 2026-12-02
related: [claim-qwt-r2-gate-nonregression, claim-ptqat-w4-outperforms-full-qat-fewer-params, claim-qdbev-tiny-w4a6-nds-surpasses-fp32]
signoff: null
---

## 我的理解

论文声称（asserted）：BEVFormer-Base 在 W4A6 下，标准一次性全网 QAT 仅 NDS 0.224（相对 FP32 0.517 下降 56.7%、mAP 0.071），而按 Backbone→Neck→Encoder→Decoder 四阶段渐进 QAT 达 NDS 0.485（下降 6.2%、mAP 0.376），两者相差 0.261 NDS——训练稳定性是分阶段策略的核心收益。

必须记住的限定：
1. **差距主要体现在 Base**。据 ar5iv HTML 版论文 Table 3（抓取 2026-11-02；2026-11-05 复抓再核一致，表题原文 "Comparsion between progressive and standard QAT with W4A6" 确认 W4A6 且 "Comparsion" 为原文拼写；未对照 PDF）：Tiny 为标准 0.326 vs 渐进 0.348（差 0.022）、Small 为 0.421 vs 0.467（差 0.046）。小模型上标准 QAT 本来就不崩，收益随模型增大而放大；选型时不能把 0.261 的差距套到所有规模。
2. 笔记只列了 Base 行；每阶段 epoch 数 N_i 未注明，训练成本（约 4 倍 QAT 轮次）未在笔记中量化，部署评估需补。
3. 这是「渐进式 vs 标准」的消融，不含蒸馏项；完整方法的数字见 [QD-BEV-T 卡](claim-qdbev-tiny-w4a6-nds-surpasses-fp32.md)。

原始笔记见 [QD-BEV](../library/Quantization/QD-BEV.md#33-渐进式-qat-与标准-qat-对比-table-3)。

## 待验证

- 用官方仓库复现 Table 3：同配置下标准 QAT vs 渐进 QAT（Base，W4A6），核对 0.224 / 0.485。
- 给标准 QAT 加 warmup、梯度裁剪、可学习 scale 后重跑，确认差距是否收敛。
- 交换阶段顺序（Decoder 优先）重跑，验证「按敏感度排序」是否为增益来源。
- 记录各阶段 N_i 与总训练开销，评估渐进策略的时间成本。

## 若成立 / 不成立意味着什么

成立：大模型（Base 级）BEV 感知做 sub-8-bit QAT 时应采用分模块渐进引入，否则 QAT 训练不稳定；顺序按模块敏感度（见 [敏感度卡](claim-qdbev-encoder-backbone-quantization-bottleneck.md)）设计。
不成立：差距主要靠训练技巧或仅在特定规模出现，直接用调好参的标准 QAT + 蒸馏即可，省去多阶段流程。

## 核查记录

- 2026-11-05（P1-B2a 量化主线经典组）：evidence 四条 quote 对笔记逐字机械核对命中；复抓 ar5iv 再核 Table 3 三对数字（Base 0.224/0.485、Tiny 0.326/0.348、Small 0.421/0.467）与表题（含 W4A6 字样）一致。仅补核查日期与表题信息，数字与命题未改。
