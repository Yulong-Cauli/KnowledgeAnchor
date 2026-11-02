---
id: claim-cotr-compact-occupancy-1-16-no-perf-drop
title: "COTR 论文声称：高分辨占用表示（200×200×16）下采样 16 倍为紧凑表示（50×50×16）性能不掉，IVT FLOPs 降至约 1/5（Table 5：402.98G→78.47G）"
type: claim
status: asserted
scope: "Occ3D-nuScenes val；COTR arXiv v2（arXiv:2312.01919，html/2312.01919v2，含补充材料）；消融基线 BEVDet4D，无 Semantic-aware Group Decoder、无长期时序（Table 5 caption 口径）；EVT 分辨率 200×200×16（C=32）经 σx=σy=4、σz=1 下采样至 50×50×16 紧凑表示，IVT 仅在紧凑表示上做 spatial cross-attention；FLOPs 口径为 Implicit View Transformation 模块（Table 5 caption）；论文自报数字。边界：Table 5 未报告 200×200×16 全分辨率的 IoU/mIoU（仅 FLOPs 402.98G），'不掉点'的可查证口径是紧凑表示 70.89/37.97 不低于表中其他表示配置"
tags: [3d-occupancy, occupancy-prediction, compact-representation, view-transformation, nuscenes, cotr]
note: library/3D_Occupancy/COTR.md#34-表示分辨率与效率消融
paper: "CVPR 2024, COTR: Compact Occupancy TRansformer for Vision-based 3D Occupancy Prediction (arXiv:2312.01919)"
stance: watch
evidence:
  - source: library/3D_Occupancy/COTR.md
    locator: "§一（§1 摘要式主张原句）"
    quote: "Specifically, after generating a sparse yet high-resolution 3D OCC feature by Explicit View Transformation (EVT), we downsampled it to a compact OCC representation, a size merely 1/16 of the original, without any performance drop."
    relation: supports
  - source: library/3D_Occupancy/COTR.md
    locator: "§2.2（§3.3 实践配置原句）"
    quote: "In practice, we construct a compact OCC representation with a size merely 1/16 of the original while achieving a better performance."
    relation: supports
  - source: library/3D_Occupancy/COTR.md
    locator: "§3.4 / Table 5（Voxel 全分辨行，仅 FLOPs）"
    quote: "| Voxel | $200\times 200\times 16$ | - | - | 402.98 |"
    relation: supports
  - source: library/3D_Occupancy/COTR.md
    locator: "§3.4 / Table 5（紧凑 50×50×16 行）"
    quote: "| $50\times 50\times 16$ | 70.89 | 37.97 | 78.47 |"
    relation: supports
  - source: library/3D_Occupancy/COTR.md
    locator: "§3.4（Supplementary 正文 ~5× 原句）"
    quote: "It is abundantly clear that the high-resolution ( $200\times 200\times 16$ ) OCC representation incurs a massive computational overhead, with the FLOPs approximately $5\times$ that of the compact ( $50\times 50\times 16$ ) OCC representation, respectively."
    relation: supports
falsifiers:
  - "复现 Table 5：50×50×16 紧凑表示的 IoU/mIoU 低于表中任一其他配置（BEV 70.48/37.51、TPV 70.41/37.21、voxel 各档），'不掉点'不成立"
  - "补测 200×200×16 全分辨率 IVT（论文未给该档精度）：其 IoU/mIoU 显著高于紧凑表示（如 mIoU 高 >0.5），则'without any performance drop'不成立"
  - "IVT FLOPs 实测比偏离 ~5×（如 <3× 或 >8×），或下采样非 16 倍（形状核对失败）"
review_due: 2026-12-03
related: [claim-cotr-plugin-lowers-latency-flops]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：视觉 3D 占据预测不必在 200×200×16 的全分辨 3D OCC 特征上做隐式视角变换——先经 EVT 得稀疏高分辨特征，下采样 16 倍为 50×50×16 紧凑表示，IVT（spatial cross-attention + self-attention）只在该紧凑表示上计算，再经 U-Net 结构上采样找回几何细节；结果是精度不掉（Table 5：紧凑 50×50×16 为 IoU 70.89 / mIoU 37.97，不低于 BEV 70.48/37.51、TPV 70.41/37.21 等其他配置），而 IVT 模块 FLOPs 从 402.98G 降到 78.47G（约 1/5，Supplementary 正文称 "approximately 5×"）（arXiv v2 补充材料）。

口径与边界：
1. "不掉点"的可查证口径有限：Table 5 未给 200×200×16 全分辨档的精度（该档算力不可行，仅报 FLOPs），故"与全分辨等精度"目前只是论文自述（§1/§3.3 两句原话），可查证的是"紧凑档不低于表中其他表示配置"——falsifiers 按此分层设计。
2. 本卡刻意避开笔记照录的三处原文数字不一致（不作为证据）：§4.3 正文 41.05 vs Table 2 全组件行 41.39、§4.2 "surpasses it by 2.3%" vs 表内差值 2.4、§4.1 分组数 K=6 vs 4 组；本卡全部数字取自 Table 5 与 §1/§3.3 原句，无涉上述三处。
3. 表号引用以内容为准（QUESTIONS #10/#17 已否定"PDF 与 HTML 表号错位"假设；错位的只是库内截图 Table4.png 文件名），本卡引用的是 HTML v2 Table 5 本体行，无碍。

## 待验证

- 复现 Table 5 的 voxel 各档（重点 50×50×16 与 100×100×8），核对 IoU/mIoU/FLOPs 三列。
- 若算力允许，补测 200×200×16 全分辨 IVT 一次，直接检验"without any performance drop"。

## 若成立 / 不成立意味着什么

成立（目前只是论文声称，尚未独立验证）：3D 占用预测的视角变换可以只在 1/16 紧凑表示上做，"先显式、再紧凑隐式"是省算力的通用配方；对库内 SurroundOcc/OccFormer 等视觉占据方法的部署成本评估有直接参考价值。
不成立：则紧凑表示损失几何/语义精度（尤其小物体），U-Net 补偿不足以回本，占据模型仍需为分辨率付算力。
