---
id: claim-msmdfusion-nuscenes-test-sota-single-model
title: "MSMDFusion 论文声称：单模型、无 TTA/ensemble 在 nuScenes test 达到 71.5% mAP / 74.0% NDS，超过 Table 1 所列全部方法（CVPR 2023 时间点）"
type: claim
status: asserted
scope: "nuScenes test set（官方评测口径）；MSMDFusion arXiv v3（arXiv:2209.03102，html/2209.03102v3）；单模型，无 Test-Time Augmentation、无模型 ensemble（§1 脚注与 §4.1.1 明示）；LiDAR-相机融合（LC）；对比范围限 Table 1 所列方法（PointPillars 至 DeepInteraction，论文发表时点）；论文自报数字"
tags: [lidar-camera-fusion, 3d-detection, nuscenes, benchmark, virtual-points, msmdfusion]
note: library/Multimodal_Fusion/MSMDFusion.md#32-nuscenes-test-3d-检测-sota-对比
paper: "CVPR 2023, MSMDFusion: Fusing LiDAR and Camera at Multiple Scales with Multi-Depth Seeds for 3D Object Detection (arXiv:2209.03102)"
stance: watch
evidence:
  - source: library/Multimodal_Fusion/MSMDFusion.md
    locator: "§1.2（Abstract 结果原句）"
    quote: "On the nuScenes test benchmark, our proposed method, abbreviated as MSMDFusion, achieves state-of-the-art 3D object detection results with 71.5% mAP and 74.0% NDS, and strong tracking results with 74.0% AMOTA without using test-time-augmentation and ensemble techniques."
    relation: supports
  - source: library/Multimodal_Fusion/MSMDFusion.md
    locator: "§3.2 / Table 1（MSMDFusion 行）"
    quote: "| MSMDFusion (Ours) | LC | 71.5 | 74.0 | 88.4 | 61.0 | 35.2 | 71.4 | 64.2 | 80.7 | 76.9 | 58.3 | 90.6 | 88.1 |"
    relation: supports
  - source: library/Multimodal_Fusion/MSMDFusion.md
    locator: "§3.2（§4.2 正文结论原句）"
    quote: "Overall, Table 1 shows that our method surpasses all existing methods, and achieves the new state-of-the-art performances of 71.5 mAP and 74.0 NDS."
    relation: supports
  - source: library/Multimodal_Fusion/MSMDFusion.md
    locator: "§3.2 / Table 1（最强竞品 BEVFusion [16] 行）"
    quote: "| BEVFusion [16] | LC | 70.2 | 72.9 | 88.6 | 60.1 | 39.3 | 69.8 | 63.8 | 80.0 | 74.1 | 51.0 | 89.2 | 86.5 |"
    relation: supports
  - source: library/Multimodal_Fusion/MSMDFusion.md
    locator: "§3.2 / Table 1（最强竞品 DeepInteraction 行）"
    quote: "| DeepInteraction [26] | LC | 70.8 | 73.4 | 87.9 | 60.2 | 37.5 | 70.8 | 63.8 | 80.4 | 75.4 | 54.5 | 90.3 | 87.0 |"
    relation: supports
falsifiers:
  - "nuScenes 官方 test 榜单上 MSMDFusion 提交记录的 mAP/NDS 低于 71.5/74.0，或低于 Table 1 任一所列方法"
  - "按官方配置（ResNet50+FPN、448×800、两阶段 20+6 epochs、无 TTA/ensemble）复现得不到 71.5/74.0（偏差 >0.5；该容差系本卡预设、无原文锚点，待定）"
  - "发现 Table 1 竞品数字引用了过旧版本或非最优配置（如 BEVFusion [16] 有更高官方数字未被引用），'surpasses all'不成立"
review_due: 2026-12-03
related: [claim-msmdfusion-multidepth-unprojection-no-noise, claim-msmdfusion-multiscale-fusion-gain]
signoff: null
---

## 我的理解

论文声称：MSMDFusion 以单模型、无 TTA/ensemble 在 nuScenes test 上取得 71.5% mAP / 74.0% NDS，超过 Table 1 所列全部方法（最强竞品 BEVFusion [16] 70.2/72.9、DeepInteraction 70.8/73.4）（arXiv v3）。配套的跟踪结果为 74.0 AMOTA（Table 2，greedy tracker）：与使用 ensemble 的 BEVFusion [16]*（74.1）相当，单模型中为最高——但这是次要主张，本卡可证伪核心是检测的 71.5/74.0。

类别层面的边界（笔记观察，防"全类别第一"误读）：MSMDFusion 的 C.V.（construction vehicle）35.2 低于 BEVFusion [16] 的 39.3 与 DeepInteraction 的 37.5；Bike 58.3 为全表最高（较 UVTR 54.8 高 +3.5，论文专门点名）。"surpasses all"是总体 mAP/NDS 层面。

效率背景（同论文 Table 3，非本卡核心）：该成绩以每帧仅 16k 虚拟点取得（BEVFusion [16] 为 2M、[13] 为 5M），FPS 2.1（RTX 3090）低于 BEVFusion [16] 的 8.4——选型时注意速度不占优。

## 待验证

- 查 nuScenes 官方 test 榜单提交记录，核对 71.5/74.0 与单模型/无 TTA 声明。
- 核对 BEVFusion [16]、DeepInteraction 官方论文最终版数字，确认无低引竞品。

## 若成立 / 不成立意味着什么

成立（目前只是论文声称）：nuScenes test 榜在 CVPR 2023 时点的 LC 融合 SOTA 基准线为 71.5/74.0（单模型口径）；库内后续融合方法笔记（RCBEVDet、HGSFusion 等）对比时有了一条单模型锚点。
不成立：则该 SOTA 主张依赖特定对比口径（竞品数字低引或配置差异），本卡降级为"论文自报数字"，榜单核对结果回填。

## 核查记录

- 2026-11-05（02 任务书整理班 P1-B4a）：本卡 5 条 evidence quote 逐字 Grep 验证命中笔记现状文本；related 补 claim-msmdfusion-multiscale-fusion-gain（与该卡 related 已含本卡，此前单向，现双向）；falsifier 2 的 0.5 容差补"预设待定"标注。类别边界（C.V. 低于两竞品、Bike +3.5）、效率背景（16k 虚拟点 vs 2M/5M、FPS 2.1 vs 8.4）与笔记 Table 1/Table 3 核对一致。表达整理，数字未改写。
