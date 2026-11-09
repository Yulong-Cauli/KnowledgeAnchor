---
id: claim-sparseocc-miou141-beats-dense-baselines
title: "SparseOcc 声称：nuScenes-Occupancy 验证集上 IoU 21.8 / mIoU 14.1，同表高于三条相机稠密基线（C-CONet 20.1/12.8、OpenOccupancy 19.3/10.3、TPVFormer 15.3/7.8）"
type: claim
status: asserted
scope: "nuScenes-Occupancy 验证集（笔记措辞；准确基准名需回原文核对，见正文限定 2）；相机输入；SparseOcc 自报对比表（笔记 §4.1 / Table 1），基线数字是同协议复现还是引用各自原文、评测硬件论文未注明；据库内笔记转述"
tags: [occupancy-prediction, sparse-3d, sparse-conv, sparseocc, nuscenes, sparse-tokens]
note: library/3D_Occupancy/SparseOcc.md#41-nuscenes-occupancy-性能对比-table-1
paper: "CVPR 2024 · SparseOcc: Rethinking Sparse Latent Representation for Vision-Based Semantic Occupancy Prediction · arXiv:2404.09502 · https://github.com/VISION-SJTU/SparseOcc"
stance: watch
evidence:
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
    quote: "| OpenOccupancy        | Camera     | 19.3     | 10.3     | 1716G     | 19G      | 0.84s       |"
    relation: supports
  - source: library/3D_Occupancy/SparseOcc.md
    locator: "§4.1 / Table 1"
    quote: "| TPVFormer            | Camera     | 15.3     | 7.8      | 1132G     | 20G      | 0.57s       |"
    relation: supports
  - source: library/3D_Occupancy/SparseOcc.md
    locator: "§1 概述"
    quote: "- **精度提升**：在 nuScenes-Occupancy 验证集上，mIoU 从 12.8% 提升至 14.1%，有效避免了空体素上的“幻觉（Hallucinations）”。"
    relation: supports
  - source: https://arxiv.org/abs/2404.09502
    locator: "§ Abstract"
    quote: "Interestingly, it also improves accuracy, from 12.8% to 14.1% mIOU"
    relation: supports
falsifiers:
  - "同基准同协议复现中，SparseOcc 的 IoU 或 mIoU 低于任一同表稠密基线（如 mIoU 低于 C-CONet 的 12.8）"
  - "基线口径不对等：三条基线行的数字系引用各自原文（不同输入分辨率 / 预训练 / 评测协议），并非同一协议下的受控对比，『同表高于稠密基线』失去可比性"
  - "对照 arXiv:2404.09502 原文 Table 1 核对发现笔记表格转抄错误（数字、基线名或指标列错位）"
review_due: 2026-12-02
related: [claim-sparseocc-flops-749pct-below-dense, claim-sparseocc-decomposed-kernel-beats-full-kernel]
signoff: null
---

## 主张

论文声称（据笔记 §4.1 Table 1 转述）：在 nuScenes-Occupancy 验证集、相机输入口径下，SparseOcc 取得 IoU 21.8 / mIoU 14.1，IoU 与 mIoU 两项均高于同表三条稠密基线——C-CONet（20.1 / 12.8）、OpenOccupancy（19.3 / 10.3）、TPVFormer（15.3 / 7.8）。

限定与注意：

1. 命名消歧：本卡对应 CVPR 2024、VISION-SJTU 的 SparseOcc（arXiv:2404.09502，"Rethinking Sparse Latent Representation"）；库内另一笔记 `library/3D_Occupancy/NJU-SparseOcc.md` 对应 ECCV 2024、MCG-NJU 的 "Fully Sparse 3D Occupancy Prediction"（arXiv:2312.17118）。两篇方法同名，勿混。
2. 基准名称：笔记写 "nuScenes-Occupancy 验证集"；官方 GitHub README（抓取于 2026-11-02，https://github.com/VISION-SJTU/SparseOcc）写基准为 OpenOccupancy validation set（README 原句 "Occupancy Prediction on OpenOccupancy validation set"）；arXiv 摘要未点名基准。两者应指同一基准（表中 C-CONet 的 12.8 与摘要 "from 12.8% to 14.1% mIOU" 交叉一致），准确措辞需回原文核对。
3. Table 1 的延迟列（0.19s vs 0.57–2.18s）与显存列未注明硬件与统计口径，跨论文可比性存疑（[EMC2 卡](claim-emc2-orin-sub400ms-leading-accuracy.md)前车之鉴），故延迟不进本卡主张；算力对比另见 [FLOPs 卡](claim-sparseocc-flops-749pct-below-dense.md)。
4. arXiv 摘要抓取于 2026-11-02（https://arxiv.org/abs/2404.09502），仅核对到摘要句，未核对原文 Table 1 全表。

## 待验证

- 用官方实现（github.com/VISION-SJTU/SparseOcc）在 OpenOccupancy-nuScenes val 上复测 IoU / mIoU，核对输入分辨率与预训练设置。
- 回原文 Table 1 核对三条基线行：数字是复现还是引用，评测协议是否与 SparseOcc 行对齐。
- 确认基准准确名称（nuScenes-Occupancy vs OpenOccupancy-nuScenes）及延迟/显存的测量硬件。

## 成立/不成立的含义

成立：纯稀疏潜变量管线在语义占用上能同时超过稠密基线精度并大幅省算力（见 FLOPs 卡），自研占据方案可把「全稀疏表示」列为候选路线做复现验证。
不成立：精度领先依赖口径不对等或笔记转抄错误，稀疏路线的选型依据回到复现数据，稠密 / 投影表示（BEV、TPV）仍是默认。
