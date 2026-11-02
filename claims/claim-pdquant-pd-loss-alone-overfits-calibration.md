---
id: claim-pdquant-pd-loss-alone-overfits-calibration
title: "PD-Quant 论文声称 PD 损失单独使用在小校准集上严重过拟合（校准 70.51% vs 验证 1.07%），MSE 正则化是恢复泛化的关键"
type: claim
status: asserted
scope: "ResNet-18；W2A2 极端低比特消融（Table 2）；明确区分 Calibration Acc 与 Validation Acc 两列（70.51% 是校准集精度、1.07% 是验证集精度，不可混用）；校准集大小笔记未注明（方法部分举例'如 1024 张图'，未与该实验绑定）；PD-Quant 论文自报数字"
tags: [quantization, ptq, pdquant]
note: library/Quantization/PD-Quant.md#42-消融实验过拟合与正则化-table-2
paper: "CVPR 2023, PD-Quant: 基于预测差异度量的后训练量化（开源：https://github.com/hustvl/PD-Quant）"
stance: watch
evidence:
  - source: library/Quantization/PD-Quant.md
    locator: "§4.2 / Table 2"
    quote: "| PD-only         | 2/2            | 1.07         | 70.51         |"
    relation: supports
  - source: library/Quantization/PD-Quant.md
    locator: "§4.2 / Table 2"
    quote: "| PD + Reg        | 2/2            | 49.16        | 71.09         |"
    relation: supports
  - source: library/Quantization/PD-Quant.md
    locator: "§4.2 / Table 2"
    quote: "- **分析**：仅使用 PD 损失会导致严重的过拟合（校准集高，验证集低），正则化 (Reg) 是恢复验证精度的关键，Random Drop 进一步提升。"
    relation: supports
falsifiers:
  - "复现中 PD-only 在 ResNet-18 W2A2 下校准/验证精度不出现大幅分离（验证精度未崩塌到个位数）"
  - "加入 MSE 正则化后验证精度未从 1.07% 量级恢复到 49.16% 量级"
  - "过拟合另有主因（如 20,000 次迭代过多、学习率设置、缺少 Random Drop），正则化并非关键因素"
review_due: 2026-12-02
related: [claim-qwt-r2-gate-nonregression, claim-pdquant-dc-bn-stats-narrow-calibration-val-gap]
signoff: null
---

## 我的理解

> **2026-11-03 笔记数字修正（依据：nightshift/cross/quantization.md §8 + 实抓 URL：https://arxiv.org/pdf/2212.07048v3 、https://arxiv.org/pdf/2212.07048v1 、https://openaccess.thecvf.com/content/CVPR2023/papers/Liu_PD-Quant_Post-Training_Quantization_Based_on_Prediction_Difference_Metric_CVPR_2023_paper.pdf ，2026-11-03 抓取，pdftotext 提取，三版本一致）**：本卡核心主张（PD-only 校准 70.51% vs 验证 1.07% 的极端分离、Reg 恢复验证精度）**仍双源成立**——论文 Table 2 原值即 1.07(val)/70.51(cali) 与 49.16(val)/71.09(cali)。修正点：① 原笔记 +Reg 校准 51.56%、+Drop 校准 53.07% 两值论文中不存在（论文 Acc(cali) 为 71.09/68.26）；② 论文 Table 2 **无 DC 行**，原笔记「再加 DC 53.14%」不属于 Table 2（53.14 是 Table 3 完整方法 ResNet-18 2/2 的值）；③ 论文列序是 Acc(val) 在前、Acc(cali) 在后，原笔记表头两列写反；④ Table 2 caption 明确 ImageNet + 1024 张校准图——scope 中「校准集大小未注明」的缺口已补上。笔记已重建（含 FP 行与 W4A2 消融块），卡内 evidence quote 已同步；status 不动，主张不变。另见 claim-pdquant-note-table-mismatch。

论文声称（尚未独立验证）：在 ResNet-18 W2A2 消融中，只用 PD 损失时校准集精度 70.51%、验证集精度仅 1.07%——校准与验证相差约 70 个百分点，是"校准集数字好看 ≠ 测试可用"的极端案例；加上 MSE 正则化后验证精度恢复到 49.16%（校准 51.56%），再加 Random Drop 52.74%、再加 DC 53.14%。

口径提醒（QwT 教训）：Table 2 是本笔记里唯一明确分列 Calibration Acc 与 Validation Acc 的表，引用时必须带上两列，不能只抄 70.51%。这篇卡与 [claim-qwt-r2-gate-nonregression](claim-qwt-r2-gate-nonregression.md) 同属"校准集意义下的结论不自动等于测试集结论"主线。

机理推测（笔记未展开，待验证）：PD 损失直接以最终输出 KL 为目标、在极小校准集上迭代 20,000 次，优化器有能力把校准样本的决策"记住"，因此需要正则项把量化输出拉回局部邻域。

## 待验证

- 复现 Table 2 消融（PD-only / +Reg / +Drop / +DC），确认 70.51% → 1.07% 的分离与各级恢复幅度。
- 核对原文校准集大小（是否 1024 张）与迭代次数（笔记 §3 写 20,000 次）。
- 检查"PD-only 过拟合"是否随校准集增大而缓解（若 10k 张图下不发生过拟合，则该结论限于小校准集）。

## 若成立 / 不成立意味着什么

成立：任何把任务级损失（PD/蒸馏类）直接放进 PTQ 优化的方案都必须配正则化或数据增广，评估时只看校准集指标会严重误判；这是低比特 PTQ 复现时的通用检查项。
不成立：过拟合是特定超参/实现的伪影，PD 损失本身可裸用，PD-Quant 的"正则化 + Drop + DC"组合必要性下降。
