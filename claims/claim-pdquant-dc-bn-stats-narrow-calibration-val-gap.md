---
id: claim-pdquant-dc-bn-stats-narrow-calibration-val-gap
title: "PD-Quant 论文声称分布修正（DC）以 BN 全局统计量为真值修正校准特征，并在 ResNet-18 W2A2 消融中把验证精度再抬 0.40%、缩小校准-验证差距"
type: claim
status: asserted
scope: "ResNet-18；W2A2 消融（Table 2，PD+Reg+Drop → PD+Reg+Drop+DC：验证 52.74% → 53.14%，校准 53.07% → 53.33%）；DC 的对齐真值为预训练模型 BN 层 Running Mean / Running Variance；仅适用于带 BN 的 CNN（笔记未讨论 Transformer 无 BN 时如何替代）；校准集大小笔记未注明（方法部分举例'如 1024 张图'，未与该实验绑定）；PD-Quant 论文自报数字"
tags: [quantization, ptq, pdquant]
note: library/Quantization/PD-Quant.md#21-分布修正-distribution-correction-dc
paper: "CVPR 2023, PD-Quant: 基于预测差异度量的后训练量化（开源：https://github.com/hustvl/PD-Quant）"
stance: watch
evidence:
  - source: library/Quantization/PD-Quant.md
    locator: "§2.1"
    quote: "针对校准集样本（如 1024 张图）无法代表全局分布的问题，PD-Quant 利用预训练模型 BN 层中存储的全局统计量（Running Mean 和 Running Variance）作为“真值”，对输入特征图进行精修。"
    relation: supports
  - source: library/Quantization/PD-Quant.md
    locator: "§4.2 / DC 消融注记（论文附录 Table 11）"
    quote: "- **DC 消融不在 Table 2**：论文 Table 2 无 DC 行。DC 的消融证据在附录 Table 11（\"Effects on different calibration dataset sizes for PD-Quant\"，W2A2）：校准 256/1024/4096 张时 ResNet-18 为 PD 46.76/52.74/55.30 → PD+DC 47.28/53.08/55.33（1024 张时 +0.34，论文明言「The effect of DC decreases as the size of calibration sets increases」）；MobileNetV2 为 PD 9.29/13.49/16.47 → PD+DC 9.48/14.17/16.55。"
    relation: supports
  - source: library/Quantization/PD-Quant.md
    locator: "§4.2 / Table 2"
    quote: "| PD + Reg + Drop | 2/2            | 52.74        | 68.26         |"
    relation: supports
falsifiers:
  - "复现消融中去掉 DC 后验证精度不低于 53.14%（DC 无正增益）"
  - "对照原文或代码发现 DC 对齐的目标并非 BN 层 Running Mean/Variance（如实际用批统计量或其他来源）"
  - "在更大校准集或无 BN 架构（Transformer）上 DC 增益消失，说明其作用仅限小校准集 + BN CNN 的特定组合"
review_due: 2026-12-02
related: [claim-pdquant-pd-loss-alone-overfits-calibration]
signoff: null
---

## 当前状态与待决（读卡先读本节）

**待主人裁定**（2026-11-03 笔记数字修正后；修正依据：nightshift/cross/quantization.md §8 + 实抓 https://arxiv.org/pdf/2212.07048v3 、https://arxiv.org/pdf/2212.07048v1 、https://openaccess.thecvf.com/content/CVPR2023/papers/Liu_PD-Quant_Post-Training_Quantization_Based_on_Prediction_Difference_Metric_CVPR_2023_paper.pdf ，2026-11-03 抓取，pdftotext 提取，三版本一致）：

- **本卡数值锚点被修正**：原笔记 Table 2 的「PD + Reg + Drop + DC 53.33%/53.14%」整行在论文 v1/v3/CVF 中均不存在（论文 Table 2 无 DC 行），title/scope 中的「验证 52.74% → 53.14%，校准 53.07% → 53.33%」（即「+0.40%」）失去原出处（53.14 是论文 Table 3 完整方法 ResNet-18 2/2 的值，不是 Table 2 的 DC 行）。
- **本次实抓新发现（可作改写锚点的候选证据）**：论文附录 Table 11（"Effects on different calibration dataset sizes for PD-Quant"，W2A2）有真实的 DC 消融——校准 256/1024/4096 张时 ResNet-18 为 PD 46.76/52.74/55.30 → PD+DC 47.28/53.08/55.33，即 1024 张时 +0.34、4096 张时仅 +0.03（论文明言 DC 增益随校准集增大而缩小）；MobileNetV2 同向（1024 张 13.49→14.17）。Table 11 未提供校准-验证差距口径，「缩小校准-验证差距」半边暂无替代锚点。
- DC 机制描述（BN running stats 真值、分布对齐 + 语义保持项）与论文 §3.3 一致的部分不受影响；evidence quote 1（§2.1）为现引文，quote 2/3 已同步为论文支撑的新注记引文（2026-11-05 复核命中）。
- **待主人裁定（登记，本班不代行）**：改写数字锚点（如改为 Table 11 的 +0.34@1024 张，并相应调整 title/scope 与 falsifier 1 的 53.14% 锚点）或拆卡（机制描述 / Table 11 消融分立）；本班不改命题。

## 这条主张是什么意思（机制部分，现引文支撑）

论文声称（尚未独立验证）：DC 针对"校准集样本（如 1024 张图）无法代表全局分布"的问题，用预训练模型 BN 层已有的 Running Mean / Running Variance 当"真值"，以梯度下降修正在量化块输入上的特征（分布对齐项 + 语义保持 L2 项），得到更代表性的"虚拟特征图"再去做量化参数搜索。

依赖前提（仍有效）：模型带 BN 层且预训练统计量可信（BN running stats 与训练分布一致）；无 BN 的 Transformer 架构笔记未覆盖。

## 历史记录（立卡时的数值锚点，已被来源核对取代）

立卡时刻意立窄：笔记实验部分当时只能支撑 DC 在 ResNet-18 W2A2 消融中 +0.40% 验证精度（52.74% → 53.14%）并把校准-验证差距从 0.33% 缩到 0.19%——增益很小，所以**不声称"DC 大幅提升精度"或"DC 解决分布偏移"**，只声称机制描述与这点消融增益。该段数字锚点已被上节 Table 11 核对结果取代（+0.34@1024、+0.03@4096）；「不夸大增益」的立卡意图在改写时应保留。

## 待验证

- 用 [hustvl/PD-Quant](https://github.com/hustvl/PD-Quant) 复现 Table 11 消融（PD vs PD+DC × 256/1024/4096 张），确认 +0.34@1024 与 4096 张时增益缩至 +0.03 的走势。（原「复现 Table 2 消融确认 +0.40%」已被来源核对否定——Table 2 无 DC 行。）
- 核对代码中 DC 的真值来源确实是 BN running statistics，以及语义保持项的权重设置。
- 若改用 Table 11 锚点：在更大校准集（4096 张）与无 BN 架构（Transformer）上分别测 DC 增益是否消失——检验「小校准集 + BN CNN 特定组合」的 scope 边界。

## 若成立 / 不成立意味着什么

成立：做低比特 PTQ 且只能拿到小校准集、模型又带 BN 时，BN 统计量可以免费充当分布参照，是低成本增强项；但预期收益只有零点几个百分点（1024 张 +0.34、4096 张 +0.03），不值得为它重构流程。
不成立：DC 的增益是噪声级或来自实现细节，"用 BN 统计量修正校准分布"这条路线对选型没有参考价值。

## 核查记录

- 立卡（据修正前笔记，数字锚点 +0.40%，日期未记录）。
- 2026-11-03：三版本实抓核对（arXiv v1/v3 + CVF），确认 Table 2 无 DC 行、附录 Table 11 有真实 DC 消融；笔记 §4.2 修正注记落档；本卡 evidence quote 2/3 同步、status 未动。
- 2026-11-05：本班表达整理与历史/当前分层（命题、status、stance、数字未改写）；Grep 复核三条 evidence quote 逐字命中。
