---
id: claim-vqmap-tiny-868g-macs-matches-ddp
title: "论文声称：VQ-Map Tiny 以 86.8G MACs 达到 59.6 mIoU，以约 1/7 的计算量追平 DDP（614.1G MACs，59.4 mIoU），且为单次前向传播、无扩散迭代去噪"
type: claim
status: asserted
scope: "nuScenes val 环视 BEV 地图分割；VQ-Map Tiny（59.6 mIoU，86.8G MACs）与 Standard（62.2，231.6G）对比 DDP 3 步去噪（59.4，614.1G）；数字为论文自报，已对照 arXiv:2411.01618 Table 5 核实与笔记一致（同表同列，另含 Params 与训练时长列及 BEVFusion、MapPrior、VQ-Map(light) 行）；MACs 为论文自报计算量口径，论文全文未注明统计工具（FLOPs/MACs 定义）与输入分辨率（缺口保持开放）；时间列为训练时长（GPU hours，A100 40G，Table 5 原注确认）而非推理实测延迟；'单次前向传播'指推理无需扩散式多步去噪"
tags: [bev, map-segmentation, vqvae, efficiency, diffusion-baseline, nuscenes, vq-map]
note: library/Quantization/VQ-Map.md#44-计算开销与性能权衡-computational-overhead
paper: "NeurIPS 2024, VQ-Map (arXiv:2411.01618)（代码：https://github.com/Z1zyw/VQ-Map）"
stance: watch
evidence:
  - source: library/Quantization/VQ-Map.md
    locator: "§4.4 / 开销对比"
    quote: "*   **DDP (3步去噪)**：mIoU 59.4，MACs = 614.1G。"
    relation: supports
  - source: library/Quantization/VQ-Map.md
    locator: "§4.4 / 开销对比"
    quote: "*   **VQ-Map (Tiny)**：mIoU 59.6，MACs = **86.8G**。"
    relation: supports
  - source: library/Quantization/VQ-Map.md
    locator: "§4.4 / 开销对比"
    quote: "*   **VQ-Map (Standard)**：mIoU 62.2，MACs = 231.6G。"
    relation: supports
  - source: https://arxiv.org/pdf/2411.01618
    locator: "Table 5（Computational overhead，DDP(3 steps) 行；pdftotext -layout 提取，抓取 2026-11-02）"
    quote: "DDP(3 steps)        59.4           53.6               614.1               160"
    relation: supports
  - source: https://arxiv.org/pdf/2411.01618
    locator: "Table 5（Computational overhead，VQ-Map(tiny) 行；pdftotext -layout 提取，抓取 2026-11-02）"
    quote: "VQ-Map(tiny)        59.6           44.2                86.8           30+74=104"
    relation: supports
  - source: https://arxiv.org/pdf/2411.01618
    locator: "Table 5（Computational overhead，VQ-Map 标准版行；pdftotext -layout 提取，抓取 2026-11-02）"
    quote: "VQ-Map              62.2          108.3               231.6           35+96=131"
    relation: supports
  - source: https://arxiv.org/pdf/2411.01618
    locator: "Table 5 caption 首两句（时间列=训练时长的原文依据；pdftotext -layout 提取，跨行按空格还原；抓取 2026-11-05）"
    quote: "Training time is measured in GPU hours using NVIDIA A100 (40G)."
    relation: supports
falsifiers:
  - "〔同范围复现（主张侧+对照侧）〕复现中 VQ-Map Tiny 的 MACs 显著高于 86.8G，或其 mIoU 低于 DDP 的 59.4（追平不成立）"
  - "〔口径核对（MACs 统计）〕MACs 统计口径不对等：DDP 的 614.1G 与 VQ-Map 的 86.8G 在输入分辨率 / 是否计入多步去噪重复前向 / 是否含解码器上采样上定义不同，导致约 7 倍差距被高估（2026-11-05 复查确认论文全文未给统计工具与输入分辨率，此条仍开放）"
  - "〔机制核对（推理路径）〕Tiny 变体实际需要多步推理、级联或 TTA 才能达到 59.6，'一次前向传播出图'不成立"
review_due: 2026-12-02
related: [claim-vqmap-nuscenes-map-miou-622-leads-table]
signoff: null
---

## 主张

论文声称：与同样引入生成先验的 DDP（扩散去噪）相比，VQ-Map 的推理是"一次概率预测 + 解码器上采样"的单次前向传播——Tiny 版以 86.8G MACs 做到 59.6 mIoU，略高于 DDP 3 步去噪的 59.4，而计算量约为其 1/7（614.1 / 86.8 ≈ 7.1）；Standard 版 231.6G MACs 达到 62.2。论文只报告了 MACs 对比、没有实测延迟数字。

限定：
1. MACs 不等于延迟——DDP 的去噪步骤若可并行或被蒸馏掉，实际部署差距会小于 MACs 之比；论文也未注明双方 MACs 是否在同一输入分辨率与同一统计工具下测得。这是一个"论文自报、口径待核"的效率主张。
2. Table 5 的"时间"列是**训练时长**（GPU hours，A100 40G，原注在案，如 tiny 30+74=104h），不是推理延迟——笔记把它记成"前向推理极其高效"的佐证时未做此区分；MACs 之外的推理延迟证据仍缺失。
3. 同表上下文：VQ-Map(light) 以 137.3G MACs 得 60.1 mIoU（约 DDP 的 1/4.5 计算量，仍高于 DDP 的 59.4），与"追平"方向一致；同表另有 BEVFusion（155.5G / 100h）与 MapPrior（396.0G / >200h）行。

## 待验证

- 已核对（2026-11-02 + 2026-11-05 复抓）：arXiv:2411.01618 Table 5 三行数字与笔记一致（见 evidence）；该表时间为训练时长（GPU hours，A100 40G，表原注在案），非推理延迟。
- 待补：MACs 统计工具（如 fvcore/ptflops）与输入分辨率，以及 DDP 的 614.1G 是否已包含 3 步去噪的全部前向。
- 用开源仓库在相同硬件上实测 VQ-Map Tiny 与 DDP 的端到端延迟（ms），补上 MACs 之外的证据。
- 检查 Tiny 变体的配置（码本大小、解码器宽度），确认其 59.6 是单次前向所得。

## 成立/不成立的含义

成立：需要生成式地图先验但受算力约束的部署场景（车端 / 边缘），可以优先考虑 one-pass 离散 Token 路线而非扩散去噪路线。
不成立：效率优势是统计口径造成的（或 Tiny 精度靠额外推理步骤撑起来），则 VQ-Map 相对 DDP 没有真实的效率壁垒，选型回到"生成先验 = 贵"的默认判断。

## 核查记录

- 2026-11-05（P1-B7b 零散组）：本卡 3 条 library 笔记引句经 grep -F 逐字验证全部命中（library/Quantization/VQ-Map.md §4.4）；11-02 的 3 条 arXiv Table 5 行引句经 11-05 复抓逐字一致（含行内空格）。同日实抓补充：Table 5 原注「Training time is measured in GPU hours using NVIDIA A100 (40G)」作为"时间列=训练时长"的原文依据（新增 evidence，抓取 2026-11-05）；确认论文全文未给出 MACs 统计工具与输入分辨率（falsifier 2 口径缺口保持开放）；记录同表 BEVFusion / MapPrior / VQ-Map(light) 行（light 60.1 / 137.3G，与本卡方向一致）。scope、falsifiers 分层标注、复审段、待验证已同步更新。论文数字未改写，status/stance/related 不变。
