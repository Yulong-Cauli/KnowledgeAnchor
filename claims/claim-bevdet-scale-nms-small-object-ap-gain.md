---
id: claim-bevdet-scale-nms-small-object-ap-gain
title: "BEVDet 声称经典 NMS 在 BEV 空间对小目标失效，按类别缩放目标尺寸后再 NMS（Scale-NMS）使 BEVDet-Tiny mAP 29.5%→31.2%、小目标受益最大"
type: claim
status: asserted
scope: "BEVDet（arXiv:2112.11790，笔记按 ar5iv 渲染版转写，对应 v3 2022-06-16）的方法/消融声明；口径：nuScenes val、BEVDet-Tiny（Table 5；原文该段仅作 'We adopt BEVDet-Tiny in Tab. 1'，未明示增强配置——'与 Table 4 D 行同配置'系整理者据 Scale-NMS 行 mAP 0.312 与 Table 4 D 行末轮 mAP 0.312 及 Table 2 BEVDet-Tiny 一致所作推断，2026-11-05 单次实抓核对，待核）；主张=问题定位（BEV 中各类目标占地固有不同、小目标占地可小于输出分辨率致 TP 与冗余框 IOU≈0、经典 NMS 失效）+补救设计（按类别缩放目标尺寸后做经典 NMS、缩放因子由验证集超参搜索、barrier 类除外）+增益（mAP 29.5→31.2，pedestrian +4.8 AP、traffic cone +7.5 AP）；不主张该增益可迁移到其他检测器或其他 NMS 实现"
tags: [bevdet, bev, scale-nms, nms, small-objects, nuscenes]
note: library/BEV_Detection/BEVDet.md#23-scale-nms33
paper: "arXiv:2112.11790, BEVDet: High-Performance Multi-Camera 3D Object Detection in Bird-Eye-View（v3 2022-06-16）"
stance: watch
evidence:
  - source: library/BEV_Detection/BEVDet.md
    locator: "§2.3（§3.3 原句，问题定位）"
    quote: "the occupied areas of various classes are intrinsically different and the overlap between instances should be closed to zero."
    relation: supports
  - source: library/BEV_Detection/BEVDet.md
    locator: "§2.3（§3.3 原句，做法）"
    quote: "Scale-NMS scales the size of each object according to its category before performing the classical NMS algorithm."
    relation: supports
  - source: library/BEV_Detection/BEVDet.md
    locator: "§3.3（2）Table 5 NMS 行（基线）"
    quote: "| NMS | 0.295 | 0.512 | 0.220 | 0.305 | 0.153 | 0.069 | 0.297 | 0.273 | 0.225 | 0.425 | 0.467 |"
    relation: supports
  - source: library/BEV_Detection/BEVDet.md
    locator: "§3.3（2）Table 5 Scale-NMS 行"
    quote: "| Scale-NMS | 0.312 | 0.512 | 0.223 | 0.313 | 0.160 | 0.072 | 0.345 | 0.273 | 0.225 | 0.500 | 0.498 |"
    relation: supports
  - source: library/BEV_Detection/BEVDet.md
    locator: "§3.3（2）正文要点（数字可由 Table 5 行差验算：ped 0.345−0.297=+4.8、cone 0.500−0.425=+7.5、mAP 0.312−0.295=+1.7）"
    quote: "小目标受益最大——pedestrians +4.8% AP、traffic cones +7.5% AP"
    relation: supports
  - source: https://ar5iv.labs.arxiv.org/html/2112.11790
    locator: "Table 5 Scale-NMS 行（ar5iv 渲染文本，抓取 2026-11-03；NMS 行 0.295…0.467 与 Scale-NMS 行均已对上）"
    quote: "Scale-NMS 0.312 0.512 0.223 0.313 0.160 0.072 0.345 0.273 0.225 0.500 0.498"
    relation: supports
  - source: https://arxiv.org/abs/2112.11790
    locator: "Abstract（抓取 2026-11-03）"
    quote: "We merely reuse existing modules to build its framework but substantially develop its performance by constructing an exclusive data augmentation strategy and upgrading the Non-Maximum Suppression strategy."
    relation: supports
falsifiers:
  - "在 nuScenes val、BEVDet-Tiny 同配置下复现 Table 5：Scale-NMS 相对经典 NMS 无 +1.7% mAP，或 pedestrian / traffic cone AP 无明显增益"
  - "论文原文或官方实现显示 Scale-NMS 并非按类别缩放（如对所有类统一缩放），或 barrier 类也参与缩放（与笔记所记 barrier 除外矛盾），或缩放因子并非来自验证集搜索"
  - "复现中 BEV 空间 TP 与冗余框的 IOU 分布并不趋近 0（问题定位不成立），经典 NMS 在 BEV 下表现正常、Scale-NMS 无必要"
review_due: 2026-12-03
related: [claim-bevdet-bda-decouple-imageview-bev-augmentation, claim-bevdet-tiny-fcos3d-accuracy-11pct-compute]
signoff: null
---

## 我的理解

论文声称：image-view 中各类目标因透视成像共享相似空间分布，固定阈值的经典 NMS 有效；BEV 空间则不然——各类目标占地固有不同，行人、交通锥等小目标的占地可能小于输出分辨率（CenterPoint 头 0.8 m），冗余预测框与真阳框可能完全无交集、IOU 恒为 0，经典 NMS 无法消除这类冗余框。Scale-NMS 的做法是先按类别缩放目标尺寸（小目标放大以建立空间关系，之后还原）再做经典 NMS。Table 5（nuScenes val，BEVDet-Tiny）：mAP 0.295→0.312（+1.7），其中 pedestrian 0.297→0.345（+4.8）、traffic cone 0.425→0.500（+7.5）受益最大，大目标也有小幅收益；缩放因子按类别由验证集超参搜索得到，barrier 类除外（尺寸变化大）。

## 待验证

- 复现 Table 5 三行（NMS / Circular-NMS / Scale-NMS），核对 +1.7 mAP 与 per-class 增益分布（小目标 > 大目标）。
- 已核对（2026-11-03）：ar5iv 渲染版 Table 5 的 NMS 行与 Scale-NMS 行数值与笔记逐值一致（见 evidence）。
- 读官方仓库确认 Scale-NMS 的类别缩放因子表与 barrier 除外逻辑。
- 消融配置口径（2026-11-05 单次实抓 ar5iv，经摘要模型转述，待二次复核）：原文 §4.3 Scale-NMS 段仅作 "We adopt BEVDet-Tiny in Tab. 1 for ablation study on the NMS strategy"，未明示该消融的增强配置；本卡 scope 中"与 Table 4 D 行同配置"为整理者按 mAP 0.312 数值吻合所作推断（原文未述，待核）。原文其余各句（+4.8%/+7.5% AP、barrier "as its size is various" 除外、缩放因子验证集超参搜索）均与笔记一致。

## 若成立 / 不成立意味着什么

成立：BEV 头的后处理要按类别几何尺度定制，小目标检测的输出端收益可观；自研 BEV 检测器可直接借用该设计与验证集调参流程。
不成立：BEV 中经典 NMS 并不失效或 Scale-NMS 增益无法复现，则笔记 §2.3/§3.3（2）的转写需回原文重核，后处理设计回退到经典 NMS/Circular-NMS 对比。

## 核查记录

- 2026-11-05（02 任务书整理班 P1-B4a）：本卡 5 条 library 侧 evidence quote 逐字 Grep 验证命中笔记现状文本（另 2 条 ar5iv/abs 外部 quote 保留 2026-11-03 抓取记录）；行差验算 ped 0.345−0.297=+4.8、cone 0.500−0.425=+7.5、mAP 0.312−0.295=+1.7 与卡内口径一致；scope 中"与 Table 4 D 行同配置"改标为整理者推断并记 2026-11-05 实抓发现（原文仅述 BEVDet-Tiny、未述增强配置），待验证新增对应条目。表达整理，数字未改写。
