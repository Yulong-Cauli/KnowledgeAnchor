---
id: claim-caddn-lid-discretization-beats-uniform
title: "CaDDN 消融自报：深度离散化从均匀 UD 改为线性递增 LID 带来 +3.17% AP"
type: claim
status: asserted
scope: "CaDDN（CVPR 2021）内部模块消融，笔记 §4 Table 3 Exp 5（Full CaDDN）；其余模块（预测分布、深度监督、前景加权）均已开启，仅把深度离散化从 UD 换成 LID；单目 3D 检测；口径：KITTI val set（3,712/3,769 划分）Car 类 3D 检测 AP|R40（IoU 0.7）、Easy/Moderate/Hard 三档（笔记 §4 口径注载明，2026-11-05 实抓原论文 Table 3 表题/表体二次核对）；+3.17% 为 Easy 档差值（Mod/Hard 分别 +1.21/+1.09），数字为论文自报相对增量，尚未独立验证"
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
  - source: library/Classical_Detection/CaDDN.md
    locator: "§4 消融实验 / 口径注（2026-11-03 补）"
    quote: "本节 Table 3 / Table 4 的数字均为论文在 **KITTI val set**（官方 3,712 train / 3,769 val 划分，消融仅在 train 上训练、在 val 上评测）上的 **Car 类 3D 检测 AP|R40**（Car IoU 阈值 0.7），按 Easy / Moderate / Hard 三档报告。"
    relation: supports
  - source: https://arxiv.org/pdf/2103.01100v2
    locator: "§4.2 Table 3 Exp 4 行（同结构、UD 离散化；pdftotext -layout 提取，列间空格为排版对齐，抓取 2026-11-05）"
    quote: "4      X       X        X             20.40 15.10 12.75"
    relation: supports
  - source: https://arxiv.org/pdf/2103.01100v2
    locator: "§4.2 Table 3 Exp 5 行（同结构、LID 离散化，Full CaDDN；pdftotext -layout 提取，列间空格为排版对齐，抓取 2026-11-05）"
    quote: "5      X       X        X      X      23.57 16.31 13.84"
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

口径：KITTI val Car AP|R40 三档（笔记 §4 口径注载明，本班 2026-11-05 实抓原论文 arXiv:2103.01100v2 Table 3 表题与表体二次核对）；+3.17% 为 Easy 档差值（20.40→23.57），Mod/Hard 档分别 +1.21/+1.09——Easy 档增益最大但三档方向一致；原论文另有 Table 6 深度离散化专项消融，UD/LID 两行绝对值与 Table 3 Exp 4/5 相同（20.40/15.10/12.75 vs 23.57/16.31/13.84）。数字为论文自报，尚未独立验证。笔记表格有抄错先例（EMC2 表格错位卡），本轮已对 Table 3 五行绝对值逐项核对无误，引用前仍建议对原论文再核。

## 待验证

- 用 OpenPCDet 复现 Exp 5 vs Exp 4（同配置仅切换 UD/LID），核对三档增量（Easy +3.17 / Mod +1.21 / Hard +1.09）与绝对 AP（20.40/15.10/12.75 → 23.57/16.31/13.84）。
- 变化深度范围 [d_min, d_max] 与 Bin 数 D，确认 LID 优势是否稳健还是依赖特定设置。
- 已核对（2026-11-05）：原论文 Table 3 表题/表体五行逐项核对（见 evidence），+3.17% 为 Easy 档差值；Table 6 专项消融两行与 Table 3 Exp 4/5 同值。

## 若成立 / 不成立意味着什么

成立：深度 bin 划分不是无关紧要的工程细节而是可测的精度来源；做 frustum/BEV 投影类方案时，深度离散化应按距离非均匀设计。
不成立：LID 相对 UD 的增益不可复现或仅属特定设置的巧合，则深度离散化退回普通超参选择，本卡降级。
