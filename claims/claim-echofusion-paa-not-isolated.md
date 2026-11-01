---
id: claim-echofusion-paa-not-isolated
title: "论文的消融没有单独隔离 PAA 的贡献"
type: claim
status: asserted
scope: "arXiv:2307.16532 的消融范围（Table 5/6/S4）；不声称 PAA 无效，也不评价未公开的补充实验"
tags: [echofusion, paa, ablation, radar]
note: library/3D_Occupancy/EchoFusion.md#21-极坐标对齐注意力-polar-aligned-attention-paa
paper: "NeurIPS 2023, Echoes Beyond Points: Unleashing the Power of Raw Radar Data in Multi-modality Fusion"
stance: watch
evidence:
  - source: https://arxiv.org/abs/2307.16532
    locator: "§5.3 / p.8"
    quote: "We ablate the input format to the radar feature extraction network in Table 5."
    relation: supports
  - source: https://arxiv.org/abs/2307.16532
    locator: "§5.4 / p.9"
    quote: "To further study the effects of different modalities, we change the input format indicated in Figure 2 and corresponding backbones, and test with and without image modality."
    relation: supports
  - source: https://arxiv.org/abs/2307.16532
    locator: "Appendix D / Table S4 / p.16"
    quote: "We also carried out experiments on coordinate system of BEV space. Though the range dimension is under sphere system, we found that a polar system can achieve on par performance, as shown in Table S4."
    relation: supports
falsifiers:
  - "论文正文或补充材料中存在 PAA 专项消融（移除 PAA、替换为普通 cross-attention、打乱列/行对应），且显示显著下降"
  - "独立复现中保持 RT 输入与极坐标解码不变，仅替换 PAA 后性能不降或提升"
review_due: 2026-11-30
related: [claim-echofusion-rt-vs-rp-radial, claim-echofusion-rt-vs-ra-noise, claim-echofusion-note-table-mismatch]
signoff: null
---

## 我的理解

论文的消融覆盖了三类因素：雷达输入格式（Table 5）、模态组合（Table 6）、BEV 坐标系（Table S4）。没有看到“移除 PAA / 替换 PAA / 打乱列行对应”的专项消融。因此 Table 6 中 RT+C 相对 RP+C 的增益，可能来自原始雷达输入、相机融合、极坐标查询、解码器或 PAA，不能单独归因于 PAA 的几何对齐。

## 待验证

- 查论文正文、附录和补充材料，确认是否有未摘录的 PAA 消融。
- 做一次控制实验：保持 RT 输入与极坐标解码不变，只把 PAA 换成不带列/行对齐的 cross-attention；再做一个打乱列/行对应的版本。
- 对比 PAA 与替代方案的参数量、FLOPs 和延迟，排除“容量更大”的解释。
- 数值检查 PAA 的远距离近似：同一方位角的图像列漂移是否在目标距离范围内可忽略。

## 若成立 / 不成立意味着什么

成立则“PAA 是核心贡献”目前只是机制解释，尚未被实验隔离；不成立则可以为 PAA 的独立有效性提供证据，进而决定是否值得在别的雷达-相机模型里复用它。
