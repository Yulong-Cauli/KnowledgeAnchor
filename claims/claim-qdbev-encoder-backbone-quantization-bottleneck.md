---
id: claim-qdbev-encoder-backbone-quantization-bottleneck
title: "QD-BEV 论文声称：BEVFormer 各模块单独 W4A6 量化时，Encoder 与 Backbone 是精度瓶颈，Neck/Decoder 几乎无损（NDS 变化 ≤0.002）"
type: claim
status: asserted
scope: "nuScenes（数据集名据 arXiv:2308.10515 摘要核对，笔记正文未注明）；BEVFormer-Tiny/Small/Base；单模块量化、其余模块保持全精度（论文 Table 1 表题自述逐模块施加 PTQ，§4.2.1，2026-11-05 ar5iv 实抓；W4A6 位宽为笔记转录表头标注，ar5iv 渲染表头无位宽标注，待对 PDF 核实）；指标 NDS；数字为论文自报；尚未独立验证"
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
  - "官方实现复现模块级量化（同 Table 1 的逐模块 PTQ 口径）：单独量化 Neck 或 Decoder 导致 NDS 下降超过 0.002，或单独量化 Encoder/Backbone 下降不足 0.04"
  - "换位宽/校准配置（非 W4A6 对称线性量化）后敏感度排序改变，Encoder/Backbone 不再是最敏感模块"
  - "在其它 BEV 检测器（非 BEVFormer 系）上复现时瓶颈模块易位，说明结论依赖特定架构"
review_due: 2026-12-02
related: [claim-qwt-r2-gate-nonregression, claim-repqvit-layernorm-reparam-recovers-layerwise]
signoff: null
---

## 我的理解

论文声称（asserted，尚未独立验证）：按笔记 §3.1 Table 1，BEVFormer 三个规模模型各自做「仅量化一个模块、其余保持全精度」的 W4A6 实验，单独量化 Encoder 使 NDS 至少下降 0.058（Tiny 0.354→0.295、Small 0.479→0.421、Base 0.517→0.303），单独量化 Backbone 至少下降 0.044（Base 0.517→0.440）；而单独量化 Neck 或 Decoder 的 NDS 变化不超过 0.002。

限定：
1. 敏感度是 PTQ 口径（表题原文 "Results with PTQ separately applied on each part in BEVFormer."，2026-11-05 实抓）；位宽 W4A6 来自笔记转录的表头标注（ar5iv 渲染表头为 "Quantized Module"，未见位宽，待对 PDF 核实）；其它位宽/粒度下排序可能不同。
2. 这是「单模块量化」口径；ar5iv 版 Table 1 另含四个模块同时量化的行（NDS 0.246/0.369/0.224，2026-11-05 实抓，笔记未转录该行）——单模块行与全网行的差可作为交互效应的观察入口，但单模块量化损失不能直接当作渐进式 QAT 中引入该模块时的损失。
3. 表内五行数字已与 ar5iv HTML 版论文 Table 1 逐项核对一致（抓取 2026-11-02；2026-11-05 复抓再核一致，未对照 PDF），且内部换算自洽。

该表是 QD-BEV 渐进式量化「按敏感度排序分阶段」的直接依据，与 [QwT 的按模块补偿](claim-qwt-r2-gate-nonregression.md)、[RepQ-ViT 的 Transformer 激活难量化](claim-repqvit-layernorm-reparam-recovers-layerwise.md)同属「量化难度集中在特定模块/激活」主线。原始笔记见 [QD-BEV](../library/Quantization/QD-BEV.md#31-模块量化敏感度分析-table-1)。

## 待验证

- 用官方仓库 https://github.com/Niko-zyf/QD-BEV 复现单模块 W4A6 量化，核对 Table 1 五行数字。
- 换 W8A8 / W4A4 或非对称量化重测敏感度排序，确认排序是否随位宽稳定。
- 确认 Encoder 掉点是否主要来自注意力/LayerNorm 激活（可对照 RepQ-ViT 的重参数化是否单独救回 Encoder）。

## 若成立 / 不成立意味着什么

成立：BEV 模型做低比特量化时，预算与更强方法（重参数化、蒸馏）应优先投向 Backbone/Encoder，Neck/Decoder 可激进量化；渐进式量化的分阶段顺序有实验依据。
不成立：敏感度排序依赖 W4A6 对称量化口径或特定架构，设计量化方案前需重测排序，不能直接沿用 Backbone→Neck→Encoder→Decoder 顺序。

## 核查记录

- 2026-11-05（P1-B2a 量化主线经典组）：evidence 六条 quote 对笔记逐字机械核对命中；复抓 ar5iv（2308.10515）再核 Table 1 五行数字一致，并核得表题自述 PTQ（§4.2.1 PTQ results）、表含四个模块同时量化的行（NDS 0.246/0.369/0.224，笔记未转录）。据此修订 scope 与限定 1–3 的口径表述、falsifier 1 的口径限定；五行已转录数字与命题未改。笔记侧两处缺口（表头 W4A6 标注在 ar5iv 无佐证、全网量化行未转录）已转调度班遗留清单（library 只读）。
