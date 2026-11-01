---
id: claim-repqvit-calibration-32-images-1point3-min
title: "RepQ-ViT 论文自报：仅需 32 张校准图、单卡 RTX 3090 上 1.3 分钟完成整卡量化，无需梯度重建与超参搜索"
type: claim
status: asserted
scope: "ImageNet ViT 的 PTQ 校准/量化阶段（笔记效率表未注明具体模型与校准集来源 split——校准 32 张 vs 测试 ImageNet，两个口径必须区分）；耗时口径为校准+量化流程在单卡 RTX 3090 上的时间，不是推理延迟；对比 FQ-ViT（1000 张 / 0.5 分钟）与 PTQ4ViT（32 张 / 3.2 分钟）为论文转引；该口径下的测试精度另见 [W4A4 主卡](claim-repqvit-w4a4-imagenet-leads-ptq-baselines.md)；尚未独立验证"
tags: [quantization, ptq, repqvit, vit, calibration-efficiency]
note: library/Quantization/RepQ-ViT.md#33-部署与校准效率-efficiency
paper: "ICCV 2023, RepQ-ViT: Scale Reparameterization for Post-Training Quantization of Vision Transformers（代码：https://github.com/zkkli/RepQ-ViT）"
stance: watch
evidence:
  - source: library/Quantization/RepQ-ViT.md
    locator: "§3.3 / 效率表（PTQ4ViT 行）"
    quote: "| PTQ4ViT      | 32 张          | 3.2 分钟             |"
    relation: supports
  - source: library/Quantization/RepQ-ViT.md
    locator: "§3.3 / 效率表（RepQ-ViT 行）"
    quote: "| **RepQ-ViT** | **32 张**      | **1.3 分钟**         |"
    relation: supports
  - source: library/Quantization/RepQ-ViT.md
    locator: "§3.3 / 效率表（FQ-ViT 行）"
    quote: "| FQ-ViT       | 1000 张        | 0.5 分钟             |"
    relation: supports
  - source: library/Quantization/RepQ-ViT.md
    locator: "§3.3 / 表后分析"
    quote: "- **分析**：因为没有任何梯度重建和复杂的超参搜索，RepQ-ViT 只需要 32 张校准图，在 1 分钟出头即可完成一整个 ViT 模型的量化，极其契合工业界快速落地的需求。"
    relation: supports
falsifiers:
  - "复现中校准所需图片数显著多于 32 张，或单卡 3090 上校准+量化耗时与 1.3 分钟差一个量级"
  - "复现发现流程实际含梯度重建或超参搜索（No REC / No HP 不成立）"
  - "32 张校准图导致量化参数在测试集上不稳定（不同校准子集间测试精度方差大），即低成本以稳健性为代价"
review_due: 2026-12-02
related: [claim-repqvit-w4a4-imagenet-leads-ptq-baselines]
signoff: null
---

## 我的理解

论文声称（asserted，尚未独立验证）：RepQ-ViT 没有梯度重建和超参搜索，量化一个 ViT 模型只需 32 张校准图、单卡 3090 上 1.3 分钟；对比 PTQ4ViT 同为 32 张但需 3.2 分钟，FQ-ViT 需 1000 张 0.5 分钟。

必须记住的口径限定（QwT 教训）：

1. **32 张是校准集大小，1.3 分钟是校准+量化流程耗时**——两者都不涉及测试精度；测试在 ImageNet 上（笔记未写明 split，也未注明这 32 张图取自哪里）。"又快又准"要拆成两条独立可证伪的主张看：本卡只管校准成本，精度归 [W4A4 主卡](claim-repqvit-w4a4-imagenet-leads-ptq-baselines.md)。
2. **效率表未注明具体模型**：笔记分析只说"一整个 ViT 模型"，1.3 分钟对应 ViT-B 还是 DeiT-S 不明，复现时不能混比。
3. 32 张图属"极少量校准"，与 [LayerNorm 消融卡](claim-repqvit-layernorm-reparam-recovers-layerwise.md) 中权重重校准的"极少量校准数据"是同一量级口径，但其稳健性（换校准子集的方差）论文未报告。

原始笔记见 [RepQ-ViT](../library/Quantization/RepQ-ViT.md#33-部署与校准效率-efficiency)。

## 待验证

- 用官方仓库计时复现：确认 32 张校准图 + 1.3 分钟（注明所用模型与 GPU）。
- 确认校准图来源 split 与测试集无重叠；用多个不同 32 张子集各校准一次，测测试精度方差。
- 对照论文原文核对效率表三个行的数字与单位。

## 若成立 / 不成立意味着什么

成立：RepQ-ViT 的校准成本接近零，适合迭代式选型（先 1.3 分钟量化、再看精度），工业落地友好。
不成立：低成本口径依赖未写明的设定（模型、硬件、校准子集），或 32 张图方差过大不可复现，选型时按更保守的校准预算估计。
