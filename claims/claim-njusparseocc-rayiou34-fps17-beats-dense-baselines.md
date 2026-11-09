---
id: claim-njusparseocc-rayiou34-fps17-beats-dense-baselines
title: "SparseOcc 声称：Occ3D-nuScenes + A100 上 7 帧输入达 RayIoU 34.0 / 17.3 FPS，高于同表稠密基线 BEVFormer（32.4 / 3.0）与 FB-Occ（33.5 / 10.3）"
type: claim
status: asserted
scope: "Occ3D-nuScenes 数据集、Tesla A100 (fp32)；SparseOcc 7 历史帧时序输入（摘要口径，Table 1 行标 8f=7+1），对比同表稠密（Dense Cost Volume）基线 BEVFormer（4f）与 FB-Occ（16f）；数字为论文自报对比表，已与 arXiv:2312.17118v5（ECCV 2024 camera-ready）Table 1 逐格核对（2026-11-03 实抓），据库内笔记转述，尚未独立复现验证；基线是否作者复训、FPS 是否含数据加载论文未写明（RayIoU 指标归属与基线口径的完整陈述见 falsifier 2 注）"
tags: [occupancy-prediction, sparse-3d, rayiou, nuscenes, sparseocc]
note: library/3D_Occupancy/NJU-SparseOcc.md#3-实验数据与因果关联
paper: "ECCV 2024 · Fully Sparse 3D Occupancy Prediction (SparseOcc) · arXiv:2312.17118 · https://github.com/MCG-NJU/SparseOcc"
stance: watch
evidence:
  - source: library/3D_Occupancy/NJU-SparseOcc.md
    locator: "§3 实验数据与因果关联 / 方法对比表"
    quote: "| **SparseOcc** | **全稀疏 (Sparse Tokens)** | **7帧**      | **34.0**   | **17.3**           |"
    relation: supports
  - source: library/3D_Occupancy/NJU-SparseOcc.md
    locator: "§3 实验数据与因果关联 / 方法对比表"
    quote: "| BEVFormer     | 稠密 (Dense Cost Volume)   | 4帧          | 32.4       | 3.0                |"
    relation: supports
  - source: library/3D_Occupancy/NJU-SparseOcc.md
    locator: "§3 实验数据与因果关联 / 方法对比表"
    quote: "| FB-Occ        | 稠密 (Dense Cost Volume)   | 16帧         | 33.5       | 10.3               |"
    relation: supports
  - source: library/3D_Occupancy/NJU-SparseOcc.md
    locator: "§3 / 测试环境"
    quote: "**测试环境**：Occ3D-nuScenes 数据集，Tesla A100 (fp32)。"
    relation: supports
  - source: https://arxiv.org/abs/2312.17118
    locator: "§ Abstract"
    quote: "SparseOcc demonstrates its effectiveness by achieving a RayIoU of 34.0, while maintaining a real-time inference speed of 17.3 FPS, with 7 history frames inputs."
    relation: supports
  - source: https://arxiv.org/pdf/2312.17118v5
    locator: "Table 1, p.8（BEVFormer 行；pdftotext -raw 提取，抓取 2026-11-03）"
    quote: "BEVFormer (4f) [27] R101 1600×900 24 32.4 26.1 32.9 38.0 39.2 3.0"
    relation: supports
  - source: https://arxiv.org/pdf/2312.17118v5
    locator: "Table 1, p.8（FB-Occ 行；pdftotext -raw 提取，抓取 2026-11-03）"
    quote: "FB-Occ (16f) [28] R50 704×256 90 33.5 26.7 34.1 39.7 39.1 10.3"
    relation: supports
falsifiers:
  - "同设置（Occ3D-nuScenes、A100 fp32）复现中 SparseOcc 的 RayIoU 低于 33.5（不及表中 FB-Occ），或 FPS 显著低于 17.3"
  - "基线口径不对等：BEVFormer / FB-Occ 两行经查证并非作者侧同一评测器 / 同硬件测量（如 FPS 不含数据加载而 SparseOcc 行含，或复用他人公开数字而非复训重评测），『高于同表稠密基线』失去可比性（注：『引用各自原文』分支已被结构性排除——RayIoU 为本文提出的指标，BEVFormer / FB-Occ 原文不可能报告该指标；2026-11-03 原文核查）"
  - "对照 arXiv v5 原文表格核对发现笔记表格转抄错误（数字或时序帧数与原文不符）"
review_due: 2026-12-02
related: [claim-njusparseocc-decoder-pruning-complexity-onactive, claim-njusparseocc-mgss-complexity-onquery-np, claim-njusparseocc-rayiou-penalizes-thick-surface]
signoff: null
---

## 主张

> 修订注记（2026-11-03 基线行修正）：笔记 §3 两条基线行已按 arXiv:2312.17118v5 Table 1 逐格修正——BEVFormer 32.2 / 2.3 → **32.4 / 3.0**、FB-Occ 33.7 / 5.2 → **33.5 / 10.3**（旧值系转抄错误），本卡 title、scope、evidence、falsifier 已同步；依据 `nightshift/reports/njusparseocc-rayiou-deep-read.md` 与 `nightshift/cross/occupancy-sparsification.md` §3-M6。

论文声称（据笔记 §3 转述）：在 Occ3D-nuScenes、Tesla A100 (fp32) 口径下，全稀疏架构的 SparseOcc 以 7 历史帧时序输入（摘要口径；Table 1 行标 8f=7+1）取得 RayIoU 34.0、17.3 FPS；同表两条稠密基线为 BEVFormer 4f 32.4 / 3.0 FPS、FB-Occ 16f 33.5 / 10.3 FPS。注意差距的结构：FPS 为 FB-Occ 的约 1.68 倍（17.3 vs 10.3）、BEVFormer 的约 5.77 倍（17.3 vs 3.0），RayIoU 只高 0.5–1.6——本卡主张是「同表高于稠密基线」，不是 SOTA。

限定与注意：
1. 基线数字的产生方式：「引用各自原文」已结构性排除（完整陈述见 falsifier 2 注），剩余缺口是论文未写明基线是否作者复训、FPS 是否含数据加载；FPS 跨论文对比口径常不可比（[EMC2 卡](claim-emc2-orin-sub400ms-leading-accuracy.md)的前车之鉴），故 scope 写明「自报对比表」。
2. 笔记另记录 15 帧输入时 RayIoU 35.1（arXiv 摘要亦证实；Table 1 行标 16f=15+1），属时序扩展数据点，不在本卡主张内。
3. 34.0 / 17.3 / 7 帧（摘要口径）三个数字已与 arXiv:2312.17118 摘要逐字核对一致（抓取于 2026-11-02，https://arxiv.org/abs/2312.17118），并于 2026-11-03 以 v5 Table 1（p.8）逐格复核、两条基线行一并核对（见 evidence）；笔记旧基线行 32.2 / 2.3、33.7 / 5.2 与原表不符，系转抄错误，已随笔记修正同步（见顶部修订注记）。

## 待验证

- 用官方实现（github.com/MCG-NJU/SparseOcc）在 A100（或注明差异的替代卡）上复测 RayIoU 与 FPS，核对评测协议与 RayIoU 阈值档位（以原文为准）。
- 查证两条基线行的产生方式（作者复训 or 复用公开 checkpoint 重评测）与 FPS 统计口径（是否含数据加载 / 预处理 / 后处理、batch size、fp32）——论文均无明文；表格数字本身已于 2026-11-03 与 v5 Table 1 逐格核对一致（见 evidence）。

## 成立/不成立的含义

成立：稀疏 token 管线能在占据预测上同时拿到 RayIoU 与实时性，自研占据方案可把「全稀疏 + RayIoU」列为候选路线做复现验证。
不成立：FPS 优势依赖口径不对等或数字转抄错误，选型回到稠密 cost volume + 推理加速工程的老路。
