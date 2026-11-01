---
id: claim-caddn-lid-discretization-beats-uniform
title: "CaDDN 消融自报：深度离散化从均匀 UD 改为线性递增 LID 带来 +3.17% AP"
type: claim
status: asserted
scope: "CaDDN（CVPR 2021）内部模块消融，笔记 §4 Table 3 Exp 5（Full CaDDN）；其余模块（预测分布、深度监督、前景加权）均已开启，仅把深度离散化从 UD 换成 LID；单目 3D 检测；笔记未标注数据集与 AP 指标版本，数字为论文自报相对增量"
tags: [caddn, monocular-3d, depth-discretization, lid, frustum, ablation]
note: library/Classical_Detection/CaDDN.md#4-消融实验
paper: "CVPR 2021, CaDDN: Categorical Depth Distribution Network for Monocular 3D Object Detection"
stance: watch
evidence:
  - source: library/Classical_Detection/CaDDN.md
    locator: "§4 / Table 3 Exp 5"
    quote: "将深度划分方式从均匀 (UD) 改为线性递增 (LID)。 **结果**：最终提升 (+3.17% AP)。证明 LID 在近处的高精度和远处的稀疏性之间取得了更好的平衡。"
    relation: supports
  - source: library/Classical_Detection/CaDDN.md
    locator: "§2 / 视锥到体素转换"
    quote: "相比均匀切分（UD），LID 在近处网格密（精度高），远处网格稀（适应稀疏点云），实现了更好的平衡。"
    relation: supports
  - source: library/Classical_Detection/CaDDN.md
    locator: "§4 / 结论要点"
    quote: '前景加权 ($\alpha_{fg}$) 和 LID 离散化这些工程细节对最终达到 SOTA 贡献显著。'
    relation: supports
falsifiers:
  - "复现 Table 3 Exp 4 vs Exp 5（仅切换 UD/LID）：增量显著低于 +3.17% AP，或 UD 反超 LID"
  - "LID 的增益只在特定深度范围 / Bin 数设置下出现，更换设置后消失或反向"
  - "笔记转载数字与原论文 Table 3 不符"
review_due: 2026-12-02
related: [claim-caddn-depth-supervision-dominant-ablation-gain, claim-caddn-soft-depth-distribution-beats-hard-argmax, claim-caddn-joint-training-beats-frozen-depth-branch]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：Table 3 消融最后一行（Exp 5，Full CaDDN）只把深度离散化从均匀切分（UD）换成线性递增离散化（LID，见笔记 §2 的 LID 公式），其余模块不变，得到 +3.17% AP——是该表中仅次于深度监督（+10.4%）的单项增量。笔记给出的机制解释：LID 近处网格密、远处网格稀，与单目场景近处目标多、远处稀疏的分布匹配。

笔记未标注数据集与 AP 口径，数字为论文自报相对增量；笔记表格有抄错先例（EMC2 表格错位卡），引用前应对照原论文再核对一遍。

## 待验证

- 用 OpenPCDet 复现 Exp 5 vs Exp 4（同配置仅切换 UD/LID），核对 +3.17% AP。
- 变化深度范围 [d_min, d_max] 与 Bin 数 D，确认 LID 优势是否稳健还是依赖特定设置。
- 对照原论文 Table 3 核对增量数字与行序。

## 若成立 / 不成立意味着什么

成立：深度 bin 划分不是无关紧要的工程细节而是可测的精度来源；做 frustum/BEV 投影类方案时，深度离散化应按距离非均匀设计。
不成立：LID 相对 UD 的增益不可复现或仅属特定设置的巧合，则深度离散化退回普通超参选择，本卡降级。
