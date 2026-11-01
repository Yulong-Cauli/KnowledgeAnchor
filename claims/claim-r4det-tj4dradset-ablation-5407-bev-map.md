---
id: claim-r4det-tj4dradset-ablation-5407-bev-map
title: "R4Det 声称：TJ4DRadSet 上 PDF/DGTF/IGDR 逐级叠加使 BEV mAP 从 45.15 增至 54.07、3D mAP 从 39.86 增至 47.29"
type: claim
status: asserted
scope: "TJ4DRadSet；4D 雷达-相机（含时序）3D 检测；累计式（逐级叠加）系统消融：Baseline 45.15 / 39.86 → +PDF 46.86 (+1.71) / 41.41 → +DGTF 50.41 (+3.55) / 44.86 → +IGDR 54.07 (+3.66) / 47.29（BEV mAP / 3D mAP，据库内笔记 §3.1 转录的论文消融表）；R4Det 自报数字，尚未独立验证；消融仅在 TJ4DRadSet（nightshift/cross/4d-radar.md M4），不可与 VoD 上的消融数字相加或比较"
tags: [4d-radar, radar-camera-fusion, r4det, bevdetection, tj4dradset, ablation]
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
falsifiers:
  - "复现中任一级叠加后数字低于表中值（如 +DGTF 后 BEV mAP 达不到 50.41，或完整模型达不到 54.07 / 47.29）"
  - "全因子消融（各模块单独用、两两组合）显示某模块增益依赖其他模块存在（例如无 PDF 时 DGTF 增益消失），『正交叠加』不成立"
  - "表格转录或口径问题：BEV 与 3D 两列数字互换、验证集划分与原文不同、+PDF/+DGTF 行与笔记 §2.1 Table 5 出现同位数字冲突"
review_due: 2026-12-02
related: [claim-r4det-pdf-depth-supervision-monotonic-gain, claim-r4det-dgtf-t1-single-step-best, claim-r4det-plugplay-vod-eaa-gain]
signoff: null
---

## 我的理解

论文声称（据笔记 §3.1 转述，尚未独立验证）：在 TJ4DRadSet 上以 Baseline（45.15 BEV mAP / 39.86 3D mAP）为起点，依次叠加 PDF、DGTF、IGDR 三个模块，BEV mAP 逐级 +1.71 / +3.55 / +3.66 至 54.07，3D mAP 至 47.29。

两个必须记住的限定：
1. 这是**累计式**消融（每行在前一行基础上加模块）。笔记里「性能提升是正交叠加的」是论文对逐级消融的解读；严格的正交性需要全因子实验（各模块单独用与所有组合），笔记未记录此类实验。本卡的可证伪内容是表中四行数字本身，正交性只作为论文声称收录。
2. 笔记没有 R4Det 与其他方法的 SOTA 对比表（§3 只有消融与机制分析），因此本卡**不立**「R4Det 是 SOTA / 稳定优于其他融合方法」的主张；54.07 是自报消融终值，不是同口径排行榜数字。

## 待验证

- 回 R4Det 原文核对 §3.1 消融表四行数字与列名（BEV mAP / 3D mAP），确认与笔记转录一致（防 EMC2 笔记表格错位一类问题）。
- 复现或找到第三方复现：TJ4DRadSet 上 Baseline 与完整模型数字是否对得上 45.15 / 54.07。
- 若原文有全因子消融，核对「正交」是否成立；若无，把正交性降级为未验证的解读。

## 若成立 / 不成立意味着什么

成立：深度监督（PDF）、无位姿时序融合（DGTF）、2D 先验精炼（IGDR）三件事在雷达-相机 BEV 检测里各有独立可加的收益，值得逐个移植评估。
不成立：54.07 依赖特定配置或口径，模块级收益需重新归因；「正交叠加」说法不能再用于选型论证。
