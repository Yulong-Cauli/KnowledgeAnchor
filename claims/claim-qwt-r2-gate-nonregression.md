---
id: claim-qwt-r2-gate-nonregression
title: "QwT 的 R² 门控能保证补偿后的模型不劣于原 PTQ"
type: claim
status: asserted
scope: "ImageNet 分类；4-bit PTQ；R² 在校准集上计算"
tags: [quantization, ptq, qwt]
note: library/Quantization/QwT.md#3-r2-门控机制判定系数
paper: "CVPR 2025, Quantization without Tears"
stance: watch
evidence:
  - source: library/Quantization/QwT.md
    locator: "§3 / 论文第 3 节"
    quote: "如果 R² ≤ 0：说明线性拟合失败，强制令 W=0, b=0"
    relation: supports
  - source: library/Quantization/QwT.md
    locator: "§3"
    quote: "这一机制确保了 QwT 在最坏情况下也不会比原始 PTQ 模型差"
    relation: supports
falsifiers:
  - "找到 R² > 0（校准集）但测试集精度低于 PTQ 的案例"
  - "在检测/部署模型上复现，观察门控是否仍能兜底"
review_due: 2026-11-15
related: [claim-repqvit-w4a4-imagenet-leads-ptq-baselines, claim-pdquant-pd-loss-alone-overfits-calibration]
signoff: null
---

## 我的理解

> 附注（2026-11-03，笔记修正同步）：笔记 L101「意义」句后已按 verify 报告 §4 建议 1/3 加限定——标注该句为笔记概括，论文「理论上不会更差」仅覆盖 R²≤0 置零分支，R²>0 分支仅校准集意义下成立、测试集为经验观察（补充材料 Table 4 含 BoolQ −0.03 / HellaSwag −0.51 逐数据集退化实例）。本卡 evidence quote 2 所引原句未改动；verify §4 对本卡的拆分主张 / 增补论文原文 evidence 等建议仍待主人定夺，本卡未动。

按论文描述，R² ≤ 0 时令 W=0、b=0，补偿后的模型与原 PTQ 模型完全一致，这一部分是逻辑上的兜底。但 R² > 0 只说明线性补偿在校准集上解释了部分残差，**不保证测试集上一定不退化**。

“无痛”是论文的措辞，不是已经验证的结论。原始笔记见 [QwT](../library/Quantization/QwT.md#3-r2-门控机制判定系数)。

## 待验证

- 构造或找到一个案例：校准集 R² > 0，但测试集精度低于 PTQ。
- 在检测或实际部署模型上复现，观察 R² 门控是否仍能兜底。

## 若成立 / 不成立意味着什么

成立则 QwT 是一个低成本的 4-bit 补偿选项；不成立则说明“门控保证”只在校准集意义下成立，选型时需要额外留出退化余量。
