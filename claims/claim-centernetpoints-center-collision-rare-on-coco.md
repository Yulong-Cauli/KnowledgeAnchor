---
id: claim-centernetpoints-center-collision-rare-on-coco
title: "CenterNet 论文声称：同类中心点碰撞在 COCO 上 <0.1%，远低于 anchor 方法 IoU 匹配失败漏检率（约 20%），理论缺陷实际可忽略"
type: claim
status: asserted
scope: "COCO 数据集统计（笔记未注明 train/val split 与物体尺寸子集）；输出步长 R=4；碰撞率 <0.1% 对比 anchor IoU 匹配失败漏检率约 20%；论文自报统计，尚未独立验证"
tags: [centernet, center-collision, limitation, coco]
note: library/Classical_Detection/CenterNet：Objects as Points.md#潜在局限性-center-collision
paper: "arXiv 2019, CenterNet: Objects as Points（开源：https://github.com/xingyizhou/CenterNet）"
stance: watch
evidence:
  - source: library/Classical_Detection/CenterNet：Objects as Points.md
    locator: "§潜在局限性 Center Collision / 实际影响"
    quote: "**实际影响**：CenterNet 作者在 COCO 数据集上进行了统计，发现这种“中心点碰撞”极为罕见（<0.1%），远远低于基于 Anchor 的方法因 IoU 匹配失败导致的漏检率（约 20%）。"
    relation: supports
  - source: library/Classical_Detection/CenterNet：Objects as Points.md
    locator: "§潜在局限性 Center Collision / 定义"
    quote: "如果两个不同物体（同类别）的中心点，在经过下采样（Stride $R=4$ ）后，落入了特征图的同一个像素格子里，CenterNet 就只能检测出其中一个，另一个会被“吃掉”。"
    relation: supports
falsifiers:
  - "在 COCO 上重算同类物体中心点碰撞率 ≥1% 或显著高于 <0.1%（尤其限定小目标或密集区域子集）"
  - "密集场景数据集（CrowdHuman / VisDrone 等）上中心点碰撞导致的漏检率接近甚至超过 anchor 方法 IoU 匹配失败率（约 20%），使该缺陷不再可忽略"
  - "原论文无此统计，或数字与笔记所载 <0.1% / 约 20% 不符（待人工核对原文）"
review_due: 2026-12-02
related: [claim-centernetpoints-heatmap-peaks-replace-nms]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：CenterNet 的理论短板是中心点重叠——同类别两个物体的中心点经 stride R=4 下采样落入同一特征图格子时只能检出一个；但作者在 COCO 上统计这种碰撞发生率 <0.1%，远低于 anchor 方法因 IoU 匹配失败导致的约 20% 漏检率，故该缺陷实际可忽略。

这是论文自报的统计口径（<0.1% 与约 20% 均来自笔记转述），且 <0.1% 与约 20% 的可比性依赖各自定义（碰撞率 vs 匹配失败率），引用时不得当成同一指标的直接对比。

## 待验证

- 查原论文相应段落：确认 <0.1% 与约 20% 的原始定义、统计对象（哪些类别、哪些 split）。
- 用 COCO 标注重算：按 stride=4 将同类 GT 中心点下采样到输出格子，统计碰撞帧比例，并按小目标 / 密集子集分桶。
- 在 CrowdHuman 等高密度数据集上做同样统计，检验"实际可忽略"的边界条件。

## 若成立 / 不成立意味着什么

成立：单点建模的主要理论缺陷在 COCO 类常规场景可忽略，支持 CenterNet 设计主张（[claim-centernetpoints-heatmap-peaks-replace-nms](claim-centernetpoints-heatmap-peaks-replace-nms.md)）的适用范围。
不成立：碰撞率在密集/小目标场景显著更高，选型时该场景必须避开 CenterNet 类单点检测器或改用多点/角点建模。
