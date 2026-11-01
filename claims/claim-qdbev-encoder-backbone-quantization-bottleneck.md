---
id: claim-qdbev-encoder-backbone-quantization-bottleneck
title: "QD-BEV 论文声称：BEVFormer 各模块单独 W4A6 量化时，Encoder 与 Backbone 是精度瓶颈，Neck/Decoder 几乎无损（NDS 变化 ≤0.002）"
type: claim
status: asserted
scope: "nuScenes（数据集名据 arXiv:2308.10515 摘要核对，笔记正文未注明）；BEVFormer-Tiny/Small/Base；单模块 W4A6 对称线性量化、其余模块保持全精度（笔记 §3.1 Table 1 口径）；指标 NDS；数字为论文自报；尚未独立验证"
tags: [quantization, qat, bev, bevformer, nuscenes, qd-bev]
note: library/Quantization/QD-BEV.md#31-模块量化敏感度分析-table-1
paper: "ICCV 2023, QD-BEV: Quantization-aware View-guided Distillation for Multi-view 3D Object Detection (arXiv:2308.10515)"
stance: watch
evidence:
  - source: library/Quantization/QD-BEV.md
    locator: "§3.1 / Table 1"
    quote: "| **全精度 (Baseline)** | **0.354**          | **0.479**           | **0.517**          |"
    relation: supports
  - source: library/Quantization/QD-BEV.md
    locator: "§3.1 / Table 1"
    quote: "| 仅 Encoder            | 0.295              | 0.421               | 0.303              |"
    relation: supports
  - source: library/Quantization/QD-BEV.md
    locator: "§3.1 / Table 1"
    quote: "| 仅 Backbone           | 0.310              | 0.417               | 0.440              |"
    relation: supports
  - source: library/Quantization/QD-BEV.md
    locator: "§3.1 / Table 1"
    quote: "| 仅 Neck               | 0.353              | 0.478               | 0.516              |"
    relation: supports
  - source: library/Quantization/QD-BEV.md
    locator: "§3.1 / Table 1"
    quote: "| 仅 Decoder            | 0.353              | 0.477               | 0.517              |"
    relation: supports
  - source: library/Quantization/QD-BEV.md
    locator: "§3.1 分析"
    quote: "**分析**：**Backbone 和 Encoder 是核心瓶颈**，量化后精度跌落最严重。Neck 和 Decoder 对量化高度不敏感。"
    relation: supports
falsifiers:
  - "官方实现复现模块级 W4A6 量化：单独量化 Neck 或 Decoder 导致 NDS 下降超过 0.002，或单独量化 Encoder/Backbone 下降不足 0.04"
  - "换位宽/校准配置（非 W4A6 对称线性量化）后敏感度排序改变，Encoder/Backbone 不再是最敏感模块"
  - "在其它 BEV 检测器（非 BEVFormer 系）上复现时瓶颈模块易位，说明结论依赖特定架构"
review_due: 2026-12-02
related: [claim-qwt-r2-gate-nonregression, claim-repqvit-layernorm-reparam-recovers-layerwise]
signoff: null
---

## 我的理解

论文声称（asserted，尚未独立验证）：按笔记 §3.1 Table 1，BEVFormer 三个规模模型各自做「仅量化一个模块、其余保持全精度」的 W4A6 实验，单独量化 Encoder 使 NDS 至少下降 0.058（Tiny 0.354→0.295、Small 0.479→0.421、Base 0.517→0.303），单独量化 Backbone 至少下降 0.044（Base 0.517→0.440）；而单独量化 Neck 或 Decoder 的 NDS 变化不超过 0.002。

限定：
1. 敏感度是在 W4A6 对称线性量化下测的，其它位宽/粒度下排序可能不同。
2. 这是「单模块量化」口径，全网同时量化的交互效应未在此表体现（笔记同节未给全网 PTQ 的模块分解）。
3. 表内数字已与 ar5iv HTML 版论文 Table 1 逐项核对一致（抓取 2026-11-02，未对照 PDF），且内部换算自洽。

该表是 QD-BEV 渐进式量化「按敏感度排序分阶段」的直接依据，与 [QwT 的按模块补偿](claim-qwt-r2-gate-nonregression.md)、[RepQ-ViT 的 Transformer 激活难量化](claim-repqvit-layernorm-reparam-recovers-layerwise.md)同属「量化难度集中在特定模块/激活」主线。原始笔记见 [QD-BEV](../library/Quantization/QD-BEV.md#31-模块量化敏感度分析-table-1)。

## 待验证

- 用官方仓库 https://github.com/Niko-zyf/QD-BEV 复现单模块 W4A6 量化，核对 Table 1 五行数字。
- 换 W8A8 / W4A4 或非对称量化重测敏感度排序，确认排序是否随位宽稳定。
- 确认 Encoder 掉点是否主要来自注意力/LayerNorm 激活（可对照 RepQ-ViT 的重参数化是否单独救回 Encoder）。

## 若成立 / 不成立意味着什么

成立：BEV 模型做低比特量化时，预算与更强方法（重参数化、蒸馏）应优先投向 Backbone/Encoder，Neck/Decoder 可激进量化；渐进式量化的分阶段顺序有实验依据。
不成立：敏感度排序依赖 W4A6 对称量化口径或特定架构，设计量化方案前需重测排序，不能直接沿用 Backbone→Neck→Encoder→Decoder 顺序。
