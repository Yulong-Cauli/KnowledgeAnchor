---
id: claim-r4det-tj4dradset-ablation-5407-bev-map
title: "R4Det 声称：TJ4DRadSet 上 PDF/DGTF/IGDR 逐级叠加使 BEV mAP 从 45.15 增至 54.07、3D mAP 从 39.86 增至 47.29"
type: claim
status: asserted
scope: "TJ4DRadSet validation set（论文 §4.4 自述 'chained ablation study on the TJ4DRadSet validation set'；表首行基线为 SGDet3D——论文自述 'the first row presents the SGDet3D baseline'）；4D 雷达-相机（含时序）3D 检测；累计式（逐级链式）消融：Baseline 45.15 / 39.86 → +PDF 46.86 (+1.71) / 41.41 → +DGTF 50.41 (+3.55) / 44.86 → +IGDR 54.07 (+3.66) / 47.29（BEV mAP / 3D mAP，笔记 §3.1 转录，2026-11-05 已实抓原文对照论文 Table 4 逐格核实）；完整模型 54.07 / 47.29 与论文 Table 1（TJ4DRadSet testset）R4Det 行同值；R4Det 自报数字；消融仅在 TJ4DRadSet（nightshift/cross/4d-radar.md M4），不可与 VoD 上的消融数字相加或比较"
tags: [4d-radar, radar-camera-fusion, r4det, detection, tj4dradset, ablation]
note: library/Classical_Detection/R4Det.md#31-模块正交增益-tj4dradset
paper: "CVPR 2026 · R4Det: 4D Radar-Camera Fusion for High-Performance 3D Object Detection（笔记标注未开源，未记录 arXiv 号）"
stance: watch
evidence:
  - source: library/Classical_Detection/R4Det.md
    locator: "§3.1 模块正交增益 / 消融表"
    quote: "| **Baseline**      | 45.15             | 39.86      |"
    relation: supports
  - source: library/Classical_Detection/R4Det.md
    locator: "§3.1 模块正交增益 / 消融表"
    quote: "| **+ IGDR (Ours)** | **54.07** (+3.66) | **47.29**  |"
    relation: supports
  - source: library/Classical_Detection/R4Det.md
    locator: "§3.1 模块正交增益"
    quote: "系统级消融实验证明各模块带来的性能提升是正交叠加的。"
    relation: supports
  - source: https://openaccess.thecvf.com/content/CVPR2026/papers/Xia_R4Det_4D_Radar-Camera_Fusion_for_High-Performance_3D_Object_Detection_CVPR_2026_paper.pdf
    locator: "§4.4 Ablation 首句（跨行已还原；pdftotext -layout 提取，抓取 2026-11-05）"
    quote: "We conduct a chained ablation study on the TJ4DRadSet validation set [27]. As shown in Table 1, the first row presents the SGDet3D baseline."
    relation: supports
  - source: https://openaccess.thecvf.com/content/CVPR2026/papers/Xia_R4Det_4D_Radar-Camera_Fusion_for_High-Performance_3D_Object_Detection_CVPR_2026_paper.pdf
    locator: "§4.4 Ablation（三模块增量叙述句，句尾 '(+3.66 mAP).' 跨栏续行，跨行连字符与跨栏断句已还原；pdftotext -layout/-raw 双模式提取，抓取 2026-11-05）"
    quote: "PDF enhances geometric perception through fine-grained depth completion (+1.71 mAP), DGTF strengthens temporal consistency via gated recurrent fusion (+3.55 mAP), and IGDR further refines BEV representations with instance-guided calibration (+3.66 mAP)."
    relation: supports
  - source: https://openaccess.thecvf.com/content/CVPR2026/papers/Xia_R4Det_4D_Radar-Camera_Fusion_for_High-Performance_3D_Object_Detection_CVPR_2026_paper.pdf
    locator: "Table 1（TJ4DRadSet testset 对比表，R4Det 行：mAP3D=47.29、mAPBEV=54.07；pdftotext -layout 提取，抓取 2026-11-05）"
    quote: "R4Det                  R+C       63.60     31.24      62.84     31.46      47.29   72.36     33.48     64.58    45.85    54.07"
    relation: supports
falsifiers:
  - "复现中任一级叠加后数字低于表中值（如 +DGTF 后 BEV mAP 达不到 50.41，或完整模型达不到 54.07 / 47.29）"
  - "全因子消融（各模块单独用、两两组合）显示某模块增益依赖其他模块存在（例如无 PDF 时 DGTF 增益消失）——链式消融的逐级增益不能解读为各模块独立有效，跨配置移植时模块级收益需重新归因"
  - "表格转录或口径问题：BEV 与 3D 两列数字互换、验证集划分与原文不同、+PDF/+DGTF 行与笔记 §2.1 Table 5 出现同位数字冲突"
review_due: 2026-12-02
related: [claim-r4det-pdf-depth-supervision-monotonic-gain, claim-r4det-dgtf-t1-single-step-best, claim-r4det-plugplay-vod-eaa-gain]
signoff: null
---

## 主张

论文声称（据笔记 §3.1 转述）：在 TJ4DRadSet 上以 Baseline（45.15 BEV mAP / 39.86 3D mAP）为起点，依次叠加 PDF、DGTF、IGDR 三个模块，BEV mAP 逐级 +1.71 / +3.55 / +3.66 至 54.07，3D mAP 至 47.29。

三条限定：
1. 这是**累计式**消融（每行在前一行基础上加模块；论文原文自称 "chained ablation study"，2026-11-05 实抓）。笔记里「性能提升是正交叠加的」一句**不是论文原话**——原文只用 chained（逐级链式）表述，全文未出现 orthogonal（同日全文核对）；该句应记为笔记作者对链式消融的解读，不再作为论文声称收录。严格的正交性需要全因子实验（各模块单独用与所有组合），论文与笔记均未做（原文只有链式消融 + 各模块内部设计消融 Table 5–7 与补充材料 Table 8/9）。本卡的可证伪内容是表中四行数字本身。
2. 消融口径已按原文补核：在 TJ4DRadSet **validation set** 上（§4.4 自述），基线行为 SGDet3D（论文自述）；完整模型 54.07 / 47.29 与论文 Table 1（TJ4DRadSet **testset**）R4Det 行同值。同值但口径不同（val 消融终值 / test 榜单行），引用时须注明。另注：§4.4 正文写 "As shown in Table 1, the first row presents the SGDet3D baseline"，但其描述的表实为 Table 4（Table 1 是 testset SOTA 对比表），疑为论文笔误——本卡以 Table 4 数字为准（整理者观察，2026-11-05）。
3. 笔记没有 R4Det 与其他方法的 SOTA 对比表（§3 只有消融与机制分析），因此本卡**不立**「R4Det 是 SOTA / 稳定优于其他融合方法」的主张；54.07 是自报消融终值，不是同口径排行榜数字。（2026-11-05 补记：论文另有 Table 1（testset）/ Table 2（VoD val）SOTA 对比，本笔记未转录；如需 SOTA 主张应另立卡并对照完整表。）

## 待验证

- 已核对（2026-11-05）：论文 Table 4 四行数字与列名（mAPBEV / mAP3D）与笔记 §3.1 转录逐格一致，无 EMC2 式错位；+PDF 行 BEV 46.86 与笔记 §2.1 Table 5 设置 C 同值，两表自洽（见 evidence；来源 URL：https://openaccess.thecvf.com/content/CVPR2026/papers/Xia_R4Det_4D_Radar-Camera_Fusion_for_High-Performance_3D_Object_Detection_CVPR_2026_paper.pdf，pdftotext -layout 提取）。
- 复现或找到第三方复现：TJ4DRadSet val 上 Baseline（SGDet3D）与完整模型数字是否对得上 45.15 / 54.07。
- 已核对（2026-11-05）：原文无全因子消融（仅 chained 消融与各模块内部设计消融），「正交叠加」已在正文降级为笔记作者的未验证解读；若日后出现全因子结果再复核。

## 成立/不成立的含义

成立：深度监督（PDF）、无位姿时序融合（DGTF）、2D 先验精炼（IGDR）三件事在该链式配置下逐级各有正增益（+1.71 / +3.55 / +3.66），值得逐个移植评估（是否独立可加，待全因子或跨宿主复现检验）。
不成立：54.07 依赖特定配置或口径，模块级收益需重新归因；「正交叠加」说法不能再用于选型论证。
