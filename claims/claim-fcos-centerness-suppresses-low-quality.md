---
id: claim-fcos-centerness-suppresses-low-quality
title: "FCOS 声称 center-ness 分支以“分类置信度 × center-ness”打分，使低质量边缘框在 NMS 中被过滤"
type: claim
status: asserted
scope: "2D 目标检测（FCOS，ICCV 2019）；center-ness 取值 0~1（到四边距离的 sqrt(min/max) 比值连乘），推理时与分类置信度相乘后参与 NMS；笔记未载 AP 数字与有无 center-ness 的消融表，只主张机制层面（打分方式 + NMS 过滤路径），不主张具体涨点幅度，尚未独立验证"
tags: [fcos, anchor-free, detection, centerness, nms]
note: library/Classical_Detection/FCOS.md#center-ness-分支
paper: "ICCV 2019, FCOS: Fully Convolutional One-Stage Object Detection（开源：https://github.com/tianzhi0549/FCOS）"
stance: watch
evidence:
  - source: library/Classical_Detection/FCOS.md
    locator: "§方法 / Center-ness 分支"
    quote: "**痛点**：由于所有“框内点”都被视为正样本，**远离中心的边缘位置**产生的预测框质量通常很差，拉低了检测精度。"
    relation: supports
  - source: library/Classical_Detection/FCOS.md
    locator: "§方法 / Center-ness 分支（推理公式）"
    quote: '\text{最终得分} = \text{分类置信度} \times \text{Center-ness}'
    relation: supports
  - source: library/Classical_Detection/FCOS.md
    locator: "§方法 / Center-ness 分支"
    quote: "这使得低质量的边缘框得分变低，从而在 NMS（非极大值抑制）过程中被过滤掉。"
    relation: supports
  - source: library/Classical_Detection/FCOS.md
    locator: "§方法 / Loss Function（中心度损失）"
    quote: "- **作用**：迫使网络学习区分“高质量中心点”和“低质量边缘点”。"
    relation: supports
falsifiers:
  - "复现中去掉 center-ness 分支（最终得分只用分类置信度），AP 不下降甚至上升，说明该分支对精度并非必要"
  - "分类分数乘 center-ness 前后 NMS 保留框集合完全相同（排序不变），说明“经 NMS 过滤低质量框”的机制描述不成立"
review_due: 2026-12-02
related: [claim-fcos-centerness-regression-branch-ap-gain, claim-fcos-fpn-scale-range-assignment]
signoff: null
---

## 我的理解

笔记声称（尚未独立验证）：由于框内点全为正样本（见 [anchor-free formulation 卡](claim-fcos-anchorfree-pixelwise-formulation.md)），远离中心的边缘位置产生低质量预测框；FCOS 增加 center-ness 分支预测“位置离几何中心的程度”（0~1，sqrt(min/max) 公式，BCE 训练），推理时最终得分 = 分类置信度 × center-ness，使低质量边缘框得分变低、在 NMS 中被过滤，从而缓解精度损失。

限定：笔记未载 AP 数字与“有无 center-ness”消融表，故本卡只主张机制路径（低质量框 → 得分压低 → NMS 过滤），不主张任何具体涨点幅度。

## 待验证

- 复现去掉 center-ness 分支的消融（得分只用分类置信度），对照 AP 变化——需先从原论文补消融基线数字。
- 对比得分乘法前后 NMS 保留框集合，验证过滤路径确实经由 NMS 排序变化实现。
- 核对 center-ness 目标值公式与笔记一致（根号、min/max 比值连乘）。

## 若成立 / 不成立意味着什么

成立：逐像素“框内即正样本”引入的低质量框问题可用一个轻量 center-ness 分支缓解，这是该设计被后续检测器沿用的核心机制。
不成立：center-ness 非必要或过滤路径不成立，则引用时只能把它当辅助头，不能当关键设计。
