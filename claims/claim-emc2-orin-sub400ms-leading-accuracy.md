---
id: claim-emc2-orin-sub400ms-leading-accuracy
title: "EMC2 在 Jetson AGX Orin 上以 <400ms 延迟保持 KITTI Hard / nuScenes 对比表中最高的自报精度"
type: claim
status: asserted
scope: "KITTI val（3712 train / 3769 val；R40 AP，Car IoU 0.7 / Ped-Cyc 0.5）与 nuScenes val；Jetson AGX Orin；LiDAR+相机输入；EMC2 自报数字，对比方法多为 A4000 数字或 N/A"
tags: [moe, sensor-fusion, emc2, jetson, edge-deployment, kitti, nuscenes]
note: library/Multimodal_Fusion/EMC2.md#51-kitti-数据集性能对比-table-1
paper: "ICCV 2025, Towards Accurate and Efficient 3D Object Detection for Autonomous Driving: A Mixture of Experts Computing System on Edge (arXiv:2507.04123)"
stance: watch
evidence:
  - source: library/Multimodal_Fusion/EMC2.md
    locator: "§5.1 / Table 1"
    quote: "| **EMC2 (Ours)**   | **66.81**             | **88.15**             | **77.62**               | **160**             | **372.5**            |"
    relation: supports
  - source: library/Multimodal_Fusion/EMC2.md
    locator: "§5.2 / Table 2"
    quote: "| **EMC2 (Ours)**   | **87M (Active)**  | **0.7241** | **0.7316** | **229.3**            |"
    relation: supports
  - source: https://arxiv.org/abs/2507.04123
    locator: "§ 实验 / Table 1"
    quote: "average latency of 372.5 ms on the Jetson AGX Orin for KITTI"
    relation: supports
  - source: https://arxiv.org/abs/2507.04123
    locator: "§ 实验 / Table 2"
    quote: "an average inference latency of 229.3 ms on the Jetson AGX Orin for nuScenes"
    relation: supports
falsifiers:
  - "同一 Jetson AGX Orin 复现中，KITTI 平均延迟 ≥400ms 或 nuScenes 延迟显著高于 229.3ms"
  - "复现精度显著低于自报值（KITTI Hard 66.81 / 88.15 / 77.62 或 nuScenes mAP 0.7241 / NDS 0.7316）"
  - "延迟测量口径与对比方法不对等（输入分辨率、是否含预处理/后处理、批大小）；或开源实现跑不出 SAD 的动态调度，实际延迟落在 APE 单专家水平（约 526ms）"
review_due: 2026-12-01
related: [claim-emc2-note-table-mismatch]
signoff: null
---

## 我的理解

> 修订注记 2026-11-03：笔记 §5.1 表已按论文原表重建（恢复 A4000/Jetson 两列延迟列，并修正 Second-IoU/LoGoNet/TED 三行的错位数字），EMC2 自身行数字 66.81 / 88.15 / 77.62 / 372.5 未变、仅新增 A4000 列 160，本卡 §5.1 evidence quote 已同步更新。修正依据：arXiv:2507.04123v1 与 ICCV 2025 camera-ready（CVF Open Access）Table 1，2026-11-03 抓取逐格核对一致。本卡主张与 status 不受影响（EMC2 自身行数字一致，且本卡限定 1 本就按 v1 指出对比方法 Jetson 列多为 N/A / 972ms）。

EMC2 自报：KITTI 上 372.5ms 且三类 Hard AP（66.81 / 88.15 / 77.62）为对比表最高；nuScenes 上 229.3ms 且 mAP/NDS（0.7241 / 0.7316）高于 BEVFusion（0.6852 / 0.7138）。"表中领先"成立的前提是精度数字来自同一评测协议（KITTI R40 Hard；nuScenes val）。

两个必须记住的限定：
1. arXiv v1 的 Table 1 中，Second-IoU / LoGoNet / TED 的 Jetson 延迟列均为 N/A（原注释：开源实现不兼容 Jetson），PointPillar 的 Jetson 延迟是 972ms。"在 Jetson 上比基线快"实际只在 EMC2 vs PointPillar 之间有直接同硬件数字。
2. 延迟是动态调度的期望值：APE 单专家在远场模糊场景要 526ms（笔记 §5.3 消融），<400ms 是全场景平均，不是最坏情况延迟。做安全分析时不能把 372.5ms 当作上界。

笔记对比行与 arXiv v1 有出入，见 [笔记偏差卡](claim-emc2-note-table-mismatch.md)；EMC2 自身行已核对一致。

## 待验证

- 用 [LinshenLiu622/EMC2](https://github.com/LinshenLiu622/EMC2)（笔记标注"没有完全开源"）在 Jetson AGX Orin 上复测 KITTI / nuScenes 延迟与精度。
- 确认延迟统计口径：是否含 AMDB 预处理与后处理，是否为全验证集平均，P99 延迟是多少。
- 确认 SAD 的 D/C 阈值与路由分布：极端场景占比多高时延迟会越过 400ms。

## 若成立 / 不成立意味着什么

成立：边缘平台（Jetson 级）做多模态 3D 检测时，MoE 动态分流是可行路线，可作为部署选型参考；但方案落地仍需按第 2 条限定补最坏情况延迟。
不成立：精度优势或 <400ms 延迟依赖论文自报口径，选型回到传统单专家模型 + TensorRT 加速的老路。
