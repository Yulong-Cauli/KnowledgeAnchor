---
id: claim-fcos-fpn-scale-range-assignment
title: "FCOS 声称按回归距离范围（而非锚框尺寸）划分 FPN 层级，可使重叠物体的模糊样本比例大幅下降"
type: claim
status: asserted
scope: "2D 目标检测（FCOS，ICCV 2019）；FPN P3–P7 分层，距离范围 P3:[0,64] 到 P7:[512,∞]（笔记所载回归距离，未标单位与数据集版本）；笔记未载模糊样本比例的具体数字，只主张分层规则与消歧方向，尚未独立验证"
tags: [fcos, anchor-free, detection, fpn, multi-scale]
note: library/Classical_Detection/FCOS.md#fpn-解决重叠
paper: "ICCV 2019, FCOS: Fully Convolutional One-Stage Object Detection（开源：https://github.com/tianzhi0549/FCOS）"
stance: watch
evidence:
  - source: library/Classical_Detection/FCOS.md
    locator: "§方法 / FPN 解决重叠"
    quote: "* **分层规则**：根据**回归距离的范围**（而不是锚框大小）进行限制。"
    relation: supports
  - source: library/Classical_Detection/FCOS.md
    locator: "§方法 / FPN 解决重叠"
    quote: "* **效果**：绝大多数重叠物体因尺寸不同被分到了不同层级，模糊样本比例大幅下降。若仍有重叠，则取面积最小的框。"
    relation: supports
falsifiers:
  - "在官方实现上统计“一个位置落入多个 GT”的模糊样本占比，发现按距离范围分层相对不分层并未显著下降"
  - "改用其他层级分配规则（如按目标面积 / 按长宽比）在同等设置下精度不降甚至更高，说明按回归距离范围分层并非消歧的必要设计"
review_due: 2026-12-02
related: [claim-fcos-anchorfree-pixelwise-formulation, claim-fcos-centerness-suppresses-low-quality]
signoff: null
---

## 我的理解

笔记声称（尚未独立验证）：逐像素预测会遇到一个位置落在多个重叠物体内的模糊问题；FCOS 不按锚框尺寸、而按回归距离范围给 FPN 各层划分预测职责（P3:[0,64] … P7:[512,∞]），使绝大多数尺寸不同的重叠物体被分到不同层级，模糊样本比例大幅下降；仍有重叠时取面积最小的框。

限定：笔记只给了规则与方向性效果（“大幅下降”），未载模糊样本占比的前后数字，故本卡不含任何数字结论，只主张“分层规则 + 消歧方向”。

## 待验证

- 在官方实现中找到各层 scale range 配置，核对与笔记所载 P3:[0,64] … P7:[512,∞] 一致。
- 统计开启 / 关闭分层限制时的模糊样本占比，验证“大幅下降”是否成立。
- 对照按目标面积分配层级的变体，确认消歧效果是否为距离范围规则特有。

## 若成立 / 不成立意味着什么

成立：FPN 多尺度消歧靠“回归距离范围”而非锚框超参，是 anchor-free 设计中可迁移的分层原则，后续无锚框检测器可直接引用。
不成立：消歧主要来自其他机制（如 center-ness 或回归目标形式），分层规则的作用需降级，引用时不可把消歧归因于它。
