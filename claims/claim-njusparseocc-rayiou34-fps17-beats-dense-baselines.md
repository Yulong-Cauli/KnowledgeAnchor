---
id: claim-njusparseocc-rayiou34-fps17-beats-dense-baselines
title: "SparseOcc 声称：Occ3D-nuScenes + A100 上 7 帧输入达 RayIoU 34.0 / 17.3 FPS，高于同表稠密基线 BEVFormer（32.2 / 2.3）与 FB-Occ（33.7 / 5.2）"
type: claim
status: asserted
scope: "Occ3D-nuScenes 数据集、Tesla A100 (fp32)；SparseOcc 7 帧时序输入，对比同表稠密（Dense Cost Volume）基线 BEVFormer（4 帧）与 FB-Occ（16 帧）；全部为论文自报对比表数字，据库内笔记转述，尚未独立验证；笔记未说明两条基线的 RayIoU / FPS 是同硬件复现还是引用各自原文"
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
    quote: "| BEVFormer     | 稠密 (Dense Cost Volume)   | 4帧          | 32.2       | 2.3                |"
    relation: supports
  - source: library/3D_Occupancy/NJU-SparseOcc.md
    locator: "§3 实验数据与因果关联 / 方法对比表"
    quote: "| FB-Occ        | 稠密 (Dense Cost Volume)   | 16帧         | 33.7       | 5.2                |"
    relation: supports
  - source: library/3D_Occupancy/NJU-SparseOcc.md
    locator: "§3 / 测试环境"
    quote: "**测试环境**：Occ3D-nuScenes 数据集，Tesla A100 (fp32)。"
    relation: supports
  - source: https://arxiv.org/abs/2312.17118
    locator: "§ Abstract"
    quote: "SparseOcc demonstrates its effectiveness by achieving a RayIoU of 34.0, while maintaining a real-time inference speed of 17.3 FPS, with 7 history frames inputs."
    relation: supports
falsifiers:
  - "同设置（Occ3D-nuScenes、A100 fp32）复现中 SparseOcc 的 RayIoU 低于 33.7（不及表中 FB-Occ），或 FPS 显著低于 17.3"
  - "基线口径不对等：BEVFormer / FB-Occ 两行的 RayIoU 与 FPS 系引用各自原文（不同硬件 / 输入分辨率 / 时序帧数），并非同硬件同协议测得，『高于同表稠密基线』失去可比性"
  - "对照 arXiv v5 原文表格核对发现笔记表格转抄错误（数字或时序帧数与原文不符）"
review_due: 2026-12-02
related: [claim-njusparseocc-decoder-pruning-complexity-onactive, claim-njusparseocc-mgss-complexity-onquery-np, claim-njusparseocc-rayiou-penalizes-thick-surface]
signoff: null
---

## 我的理解

论文声称（据笔记 §3 转述，尚未独立验证）：在 Occ3D-nuScenes、Tesla A100 (fp32) 口径下，全稀疏架构的 SparseOcc 以 7 帧时序输入取得 RayIoU 34.0、17.3 FPS；同表两条稠密基线为 BEVFormer 4 帧 32.2 / 2.3 FPS、FB-Occ 16 帧 33.7 / 5.2 FPS。注意差距的结构：FPS 差 3.3 倍（17.3 vs 5.2；对 BEVFormer 的 2.3 约 7.5 倍），RayIoU 只高 0.3–1.8——本卡主张是「同表高于稠密基线」，不是 SOTA。

限定与注意：
1. 笔记未说明基线数字是复现还是引用；FPS 跨论文对比口径常不可比（[EMC2 卡](claim-emc2-orin-sub400ms-leading-accuracy.md)的前车之鉴），故 scope 写明「自报对比表」。
2. 笔记另记录 15 帧输入时 RayIoU 35.1（arXiv 摘要亦证实），属时序扩展数据点，不在本卡主张内。
3. 34.0 / 17.3 / 7 帧三个数字已与 arXiv:2312.17118 摘要逐字核对一致（抓取于 2026-11-02，https://arxiv.org/abs/2312.17118）；对比表中两条基线行未能从摘要核对，须回原文表格。

## 待验证

- 用官方实现（github.com/MCG-NJU/SparseOcc）在 A100（或注明差异的替代卡）上复测 RayIoU 与 FPS，核对评测协议与 RayIoU 阈值档位（以原文为准）。
- 回 arXiv v5 原文表格核对 BEVFormer / FB-Occ 两行：复现还是引用，硬件、输入分辨率、帧数是否与 SparseOcc 行对齐。
- 确认 FPS 统计口径：是否含预处理 / 后处理、batch size、fp32 与否。

## 若成立 / 不成立意味着什么

成立：稀疏 token 管线能在占据预测上同时拿到 RayIoU 与实时性，自研占据方案可把「全稀疏 + RayIoU」列为候选路线做复现验证。
不成立：FPS 优势依赖口径不对等或数字转抄错误，选型回到稠密 cost volume + 推理加速工程的老路。
