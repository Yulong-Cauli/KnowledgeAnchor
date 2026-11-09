---
id: claim-sparseocc-flops-749pct-below-dense
title: "SparseOcc 声称：相对稠密基线 FLOPs 减少 74.9%（笔记 Table 1：455G vs C-CONet 1810G，约 1/4）"
type: claim
status: asserted
scope: "nuScenes-Occupancy 验证集（笔记措辞，基准名口径同 claim-sparseocc-miou141-beats-dense-baselines）；相机输入；74.9% 为论文摘要口径（over the dense baseline，摘要未点名基线）；按笔记 Table 1 数字 1-455/1810 约等于 74.9% 推断对比对象为 C-CONet，笔记未明说；FLOPs 统计口径（是否含 2D 图像主干 / 深度网络）笔记未注明；自报数字"
tags: [occupancy-prediction, sparse-3d, sparse-conv, sparseocc, nuscenes, sparse-tokens]
note: library/3D_Occupancy/SparseOcc.md#1-概述
paper: "CVPR 2024 · SparseOcc: Rethinking Sparse Latent Representation for Vision-Based Semantic Occupancy Prediction · arXiv:2404.09502 · https://github.com/VISION-SJTU/SparseOcc"
stance: watch
evidence:
  - source: library/3D_Occupancy/SparseOcc.md
    locator: "§1 概述"
    quote: "- **计算效率**：相比稠密基线，FLOPs 减少了 74.9%，内存占用减少约 31.6%~40.9%。"
    relation: supports
  - source: library/3D_Occupancy/SparseOcc.md
    locator: "§4.1 / Table 1"
    quote: "| **SparseOcc (Ours)** | **Camera** | **21.8** | **14.1** | **455G**  | **13G**  | **0.19s**   |"
    relation: supports
  - source: library/3D_Occupancy/SparseOcc.md
    locator: "§4.1 / Table 1"
    quote: "| C-CONet              | Camera     | 20.1     | 12.8     | 1810G     | 21G      | 2.18s       |"
    relation: supports
  - source: library/3D_Occupancy/SparseOcc.md
    locator: "§4.1 / Table 1"
    quote: "- **结论**：SparseOcc 在精度大幅领先的同时，计算开销仅为稠密基线的约 1/4。"
    relation: supports
  - source: https://arxiv.org/abs/2404.09502
    locator: "§ Abstract"
    quote: "SparseOcc achieves a remarkable 74.9% reduction on FLOPs over the dense baseline."
    relation: supports
falsifiers:
  - "同口径复现中 SparseOcc 的 FLOPs 显著高于 455G，或与同表稠密基线实测比值明显高于 1/4"
  - "74.9% 的对比对象并非 Table 1 中的 C-CONet（例如是未列入笔记的其他稠密基线），或 FLOPs 统计口径与常用口径（如是否含 2D 图像主干、深度网络、后处理）不一致导致不可比"
  - "对照 arXiv:2404.09502 原文核对发现笔记表格或概述数字转抄错误"
review_due: 2026-12-02
related: [claim-sparseocc-miou141-beats-dense-baselines, claim-sparseocc-decomposed-kernel-beats-full-kernel]
signoff: null
---

## 我的理解

论文声称（据笔记 §1 概述与 §4.1 转述）：相对稠密基线，SparseOcc 的 FLOPs 减少 74.9%。笔记 Table 1 给出 SparseOcc 455G、C-CONet 1810G，455/1810 约 25.1%，即约 1/4，与 74.9% 自洽；显存 13G vs 21G（约省 38.1%）、3D 延迟 0.19s vs 2.18s（延迟口径未注明，不进本卡主张）。

限定与注意：

1. 摘要只写 over the dense baseline，未点名是哪条基线；「74.9% 对应 C-CONet」是从笔记表内数字反推（1-455/1810 约 74.9%），需回原文确认。
2. 概述的显存区间 31.6%~40.9%：按笔记表内可对上 19G→31.6%、21G→38.1%；40.9% 反推对应约 22G 显存的基线，未出现在笔记表中——说明该区间涉及笔记未列全的对比对象。
3. arXiv 摘要与官方 GitHub README（均抓取于 2026-11-02，https://arxiv.org/abs/2404.09502 、https://github.com/VISION-SJTU/SparseOcc）均含 74.9% 句，与笔记一致；但 FLOPs 的测量口径（官方库用何种工具、是否含 LSS 深度网与 2D 主干）未核对。

## 待验证

- 用官方仓库的 FLOPs 统计脚本（或 fvcore / ptflops 对照）在相同输入分辨率下复测 455G 与 1810G，确认口径。
- 回原文确认 74.9% 的基线对象与 FLOPs 统计范围。
- 确认显存 31.6%~40.9% 区间对应的基线全集。

## 若成立 / 不成立意味着什么

成立：稀疏潜变量表示能把相机占据预测的算力压到稠密管线的约 1/4，做大分辨率 / 长距离占据时可作为首选工程路线复现验证。
不成立：FLOPs 优势来自统计口径不对等或数字转抄错误，算力问题回到稠密表示 + 剪枝 / 量化的老路。
