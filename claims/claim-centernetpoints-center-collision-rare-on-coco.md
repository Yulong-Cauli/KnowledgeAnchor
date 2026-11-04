---
id: claim-centernetpoints-center-collision-rare-on-coco
title: "CenterNet 论文声称：同类中心点碰撞在 COCO 上 <0.1%，远低于 anchor 方法 IoU 匹配失败漏检率（约 20%），理论缺陷实际可忽略"
type: claim
status: asserted
scope: "COCO train2017（118,287 图 / 860,001 物体，论文 Appendix C）标注统计；输出步长 R=4 下同类物体对中心点取整落入同格共 614 对，占比 <0.1%；对照数字 20.0% 为 Faster-RCNN（15 anchors）在 IoU 0.5 阈值下因 anchor 位置不足的漏检率（与碰撞率口径不同，论文自陈为对比参照）；数字为论文自报（arXiv 1904.07850v2，2026-11-05 实抓命中），尚未独立验证"
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
  - source: https://arxiv.org/pdf/1904.07850
    locator: "§6.1.1 Center point collision（arXiv PDF v2，pdftotext 提取，抓取 2026-11-05）"
    quote: "In the COCO training set, there are 614 pairs of objects that collide onto the same center point at stride 4. There are 860001 objects in total, hence CenterNet is unable to predict < 0.1% of objects due to collisions in center points."
    relation: supports
  - source: https://arxiv.org/pdf/1904.07850
    locator: "§6.1.1 Center point collision（句首承前句“…This is much less than slow- or fast-RCNN miss…”；跨行连字符已还原；pdftotext 提取，抓取 2026-11-05）"
    quote: "and fewer than anchor-based methods miss due to insufficient anchor placement [46] (20.0% for Faster-RCNN with 15 anchors at 0.5 IOU threshold)."
    relation: supports
  - source: https://arxiv.org/pdf/1904.07850
    locator: "Appendix C: Collision Experiment Details（pdftotext 提取，抓取 2026-11-05）"
    quote: "COCO training set (train 2017) contains N = 118287 images and M = 860001 objects"
    relation: supports
falsifiers:
  - "原文核查（已完成，未触发，2026-11-05）：原论文无此统计，或数字与 <0.1% / 20.0% 不符——已实抓 arXiv 1904.07850v2 核对命中（614 对碰撞 / 860001 物体、Faster-RCNN 15 anchors IoU 0.5 下 20.0%），此分支闭合"
  - "同范围复现：在 COCO train2017 标注上按论文 Appendix C 公式（stride=4 同类中心点取整落同格）重算碰撞对数，明显偏离 614 对 / <0.1%（尤其小目标或密集区域子集单独远高于 0.1%）"
  - "跨条件迁移检查（不充当原范围反证）：密集场景数据集（CrowdHuman / VisDrone 等）上中心点碰撞导致的漏检率接近甚至超过 anchor 方法漏检率量级，说明『实际可忽略』边界只限 COCO 类常规场景，不能外推到密集场景选型"
review_due: 2026-12-02
related: [claim-centernetpoints-heatmap-peaks-replace-nms]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：CenterNet 的理论短板是中心点重叠——同类别两个物体的中心点经 stride R=4 下采样落入同一特征图格子时只能检出一个；但作者在 COCO 上统计这种碰撞发生率 <0.1%，远低于 anchor 方法因 IoU 匹配失败导致的约 20% 漏检率，故该缺陷实际可忽略。

这是论文自报的统计口径，尚未独立验证。<0.1% 与 20.0% 两个数字已于 2026-11-05 在 arXiv 1904.07850v2 原文核对命中：<0.1% = COCO train2017 上同类物体对经 stride 4 取整落同格的碰撞占比（614 对 / 860001 物体）；20.0% = Faster-RCNN（15 anchors）在 IoU 0.5 阈值下因 anchor 位置不足的漏检率。两者口径不同（标注统计 vs 检测器漏检），论文是将其并列作为"量级参照"，引用时不得当成同一指标的直接对比；笔记把后者转述为"IoU 匹配失败"，原文措辞是 "miss due to insufficient anchor placement"。

## 待验证

- 已核对（2026-11-05）：<0.1% 与 20.0% 的原始定义、统计对象（train2017 全部 80 类物体）均在原文命中，见 evidence。
- 用 COCO 标注重算：按论文 Appendix C 公式（stride=4 将同类 GT 中心点取整到输出格子）统计碰撞对数，并按小目标 / 密集子集分桶——论文只报了全体 614 对，未给尺寸分桶。
- 在 CrowdHuman 等高密度数据集上做同样统计，检验"实际可忽略"的边界条件（跨条件迁移，不充当原范围反证）。

## 若成立 / 不成立意味着什么

成立：单点建模的主要理论缺陷在 COCO 类常规场景可忽略，支持 CenterNet 设计主张（[claim-centernetpoints-heatmap-peaks-replace-nms](claim-centernetpoints-heatmap-peaks-replace-nms.md)）的适用范围。
不成立：碰撞率在密集/小目标场景显著更高，选型时该场景必须避开 CenterNet 类单点检测器或改用多点/角点建模。

## 核查记录

- 2026-11-05（02 任务书 P1-B7a 整理班）：表达整理 + 原文核查，数字未改写。两条笔记 quote Grep 逐字命中；新增 3 条 arXiv 1904.07850v2 原文 evidence（§6.1.1 碰撞统计句、20.0% 句、Appendix C train2017 口径句），原「待人工核对原文」falsifier 闭合；scope 由「笔记未注明 split」升级为 train2017 已核口径；falsifiers 分层为原文核查（已闭合）/ 同范围复现 / 跨条件迁移。id/status/stance/review_due/signoff 未动。
