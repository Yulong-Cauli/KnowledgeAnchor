---
id: claim-centernetpoints-coco-train2017-same-class-center-collision-rare
title: "COCO train2017 同类物体中心点碰撞少见"
type: claim
status: verified
scope: "COCO train2017 的 118,287 张图和 860,001 条边界框标注，含 crowd 标注。使用原图坐标和输出步长 4，统计同一张图内的同类物体。"
tags: [centernet, center-collision, coco, dataset-property]
note: library/Classical_Detection/CenterNet：Objects as Points.md#潜在局限性-center-collision
paper: "CenterNet: Objects as Points（arXiv:1904.07850v2）"
stance: watch
evidence:
  - source: library/Classical_Detection/CenterNet：Objects as Points.md
    locator: "§潜在局限性 Center Collision，首段"
    quote: "如果两个不同物体（同类别）的中心点，在经过下采样（Stride $R=4$ ）后，落入了特征图的同一个像素格子里"
    relation: supports
  - source: https://arxiv.org/pdf/1904.07850v2
    locator: "§6.1.1 Center point collision；附录 C 的式 (9) 给出逐图、逐类的碰撞对数定义。"
    quote: "there are 614 pairs of objects that collide onto the same center point at stride 4."
    relation: supports
  - source: https://www.kaggle.com/code/cauliyulong/ka-verify-coco-center-collision
    locator: "Kaggle kernel v2 用整数截断，结果归档于 experiments/centernetpoints-coco-train2017-same-class-center-collision-rare/results/metrics-v2.json。按论文向下取整的本地复算见同目录 metrics-floor.json，含标注文件校验值、分格差异和碰撞对数。"
    quote: '"pairs_floor": 708'
    relation: supports
related: [claim-centernetpoints-heatmap-peaks-replace-nms]
signoff:
  by: Yulong-Cauli
  at: 2026-11-09
---

## 主张概述

本库对 COCO train2017 的 118,287 张图、860,001 条边界框标注进行复算。在原图坐标上使用输出步长 4，统计到 **708 对同图、同类的物体中心落在同一网格单元**。碰撞对数除以标注总数为 **0.0823%**，低于 0.1%。

## 实验定义

使用 `instances_train2017.json` 中的边界框标注，包含 crowd 标注。边界框左上角为 `(x, y)`、宽高为 `(w, h)` 时，中心为 `(x + w/2, y + h/2)`。按论文附录 C，将横、纵中心坐标分别除以 4，再向下取整，得到网格坐标。就近取整用于敏感性检查。

按图像、类别和网格坐标分组。一个组有 `n` 条标注时，计入 `n(n − 1)/2` 对碰撞，对所有组求和。比如三个同类中心落在同一格会计为三对。表中的比例以碰撞对数为分子、边界框标注总数为分母。

## 总体结果

| 统计口径 | 碰撞对数 | 标注总数 | 碰撞对数 ÷ 标注总数 |
| --- | ---: | ---: | ---: |
| 本库复算（向下取整） | 708 | 860,001 | 0.0823% |
| 本库复算（就近取整） | 660 | 860,001 | 0.0767% |
| 论文报告 | 614 | 860,001 | 0.0714% |

主结果比论文多 94 对（15.3%），落在实验预先设定的 491–737 对范围内，重复计算得到相同对数。两种取整口径下的比例均低于 0.1%。全量标注的中心坐标均为非负数，向下取整与旧版整数截断得到的网格坐标完全一致。

## 与 CenterNet 的关系

CenterNet 的类别热图在每个网格单元只有一个同类中心预测位置。两个同类标注中心落入同一格时，就会共用这个位置。这里的 0.0823% 来自标注统计。模型实际漏检率需要用检测输出评估，小目标和密集图像的碰撞对数仍待单独统计。
