---
id: claim-cotr-plugin-lowers-latency-flops
title: "COTR 论文声称：即插即用嵌入后各基线延迟与 FLOPs 均低于原基线（RTX A6000，Table 7），且 CFSG 仅训练期使用、推理零开销"
type: claim
status: asserted
scope: "Occ3D-nuScenes；COTR arXiv v2（arXiv:2312.01919，html/2312.01919v2）补充材料 Table 7（效率消融，单卡 RTX A6000）；对比 TPVFormer、BEVDet4D（R50 与 Swin-B 骨干，含/不含长期时序 LT）嵌入 COTR 前后；Latency 单位 s；论文自报数字。边界：表注 '† input size of 256×704, others same as Tab. 1'——无 † 的基线行沿用 Table 1 的更大输入（TPVFormer 900×1600、BEVDet4D R50 384×704、Swin-B 512×1408），而 + COTR 行均为 256×704，严格同输入对比不成立（笔记遗留观察 7 同此提示）"
tags: [3d-occupancy, occupancy-prediction, plug-in, efficiency, latency, nuscenes, cotr]
note: library/3D_Occupancy/COTR.md#34-表示分辨率与效率消融
paper: "CVPR 2024, COTR: Compact Occupancy TRansformer for Vision-based 3D Occupancy Prediction (arXiv:2312.01919)"
stance: watch
evidence:
  - source: library/3D_Occupancy/COTR.md
    locator: "§3.4 / Table 7（TPVFormer 基线行）"
    quote: "| TPVFormer | 54.05 | 972.75 | ✘ | 0.59 |"
    relation: supports
  - source: library/3D_Occupancy/COTR.md
    locator: "§3.4 / Table 7（TPVFormer + COTR 行）"
    quote: "| + COTR (R50) | 53.30 | 784.85 | ✘ | 0.43 |"
    relation: supports
  - source: library/3D_Occupancy/COTR.md
    locator: "§3.4 / Table 7（BEVDet4D† 基线行，256×704 输入）"
    quote: "| BEVDet4D $\dagger$ | 35.67 | 924.07 | ✘ | 0.67 |"
    relation: supports
  - source: library/3D_Occupancy/COTR.md
    locator: "§3.4 / Table 7（BEVDet4D† + COTR 行）"
    quote: "| + COTR (R50) | 38.87 | 747.26 | ✘ | 0.42 |"
    relation: supports
  - source: library/3D_Occupancy/COTR.md
    locator: "§3.4 / Table 7（BEVDet4D 长期时序基线行）"
    quote: "| BEVDet4D | 35.67 | 1049.52 | ✔ | 1.89 |"
    relation: supports
  - source: library/3D_Occupancy/COTR.md
    locator: "§3.4（Supplementary CFSG 推理零开销原句）"
    quote: "since we only used the Coarse-to-Fine Semantic Grouping (CFSG) strategy during training and kept only one group during inference, CFSG doesn’t introduce any extra overhead."
    relation: supports
falsifiers:
  - "复现 Table 7 任一对'基线 ± COTR'：+ COTR 行的 Latency 或 FLOPs 高于对应基线行（方向反转）"
  - "统一输入尺寸重测（全部 256×704）：基线延迟大幅下降致 + COTR 不再更快——即论文的延迟优势部分来自输入尺寸差异而非 COTR 本身"
  - "CFSG 推理期并未如论文所述合并为单组（多组 mask query 仍在跑），实测产生额外开销"
review_due: 2026-12-03
related: [claim-cotr-compact-occupancy-1-16-no-perf-drop]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：COTR 可即插即用嵌入主流占据模型；嵌入后整体延迟与 FLOPs 反而低于原基线——TPVFormer 0.59 s/972.75G → 0.43 s/784.85G，BEVDet4D† 0.67 s/924.07G → 0.42 s/747.26G，BEVDet4D（LT）1.89 s/1049.52G → 1.43 s/747.26G（Table 7，RTX A6000，arXiv v2 补充材料）。机制：IVT 只在 1/16 紧凑表示上计算（姊妹卡 claim-cotr-compact-occupancy-1-16-no-perf-drop），且 CFSG（粗到细语义分组）只在训练期使用、推理期保持单组，零额外开销（Supplementary 原句）。另 Swin-B 对：BEVDet4D 121.28M/4195.12G/1.67 s → +COTR(SwinB) 104.99M/3761.06G/1.43 s（参数下降机制论文未解释，笔记已注明）。

口径与边界：
1. 输入尺寸不完全对齐：表注 † 表示 256×704 输入，无 † 的基线行沿用 Table 1 的更大输入（TPVFormer 900×1600 等），+ COTR 行均为 256×704——延迟/FLOPs 双降中混入了输入尺寸变量，falsifier 2 专测此点。
2. 本卡不引用笔记照录的三处原文数字不一致处（41.05 vs 41.39、"2.3%" vs 2.4、K=6 vs 4 组），全部数字取自 Table 7 与 Supplementary 原句。

## 待验证

- 统一输入（256×704）复测 TPVFormer 与 BEVDet4D 基线延迟，检验 falsifier 2（输入尺寸混淆）。
- 审查官方代码 CFSG 推理分支：确认推理时只保留一组 mask query。

## 若成立 / 不成立意味着什么

成立（目前只是论文声称，尚未独立验证）：占据预测模型可以"加模块反而更快"，紧凑表示 + 训练期分组是可复用的效率配方；在延迟预算紧的部署场景可直接优先尝试 COTR 化改造。
不成立：则效率收益主要来自输入缩水或测量口径，COTR 的部署价值回落到精度增益（姊妹卡）本身。
