---
id: claim-drocc-cotr-plus-1p0-miou
title: "Dr.Occ 论文声称：Dr.Occ 模块插入 COTR 后 mIoU 43.1→44.1（+1.0），增益跨基线可迁移"
type: claim
status: asserted
scope: "Occ3D-nuScenes；COTR 为 Dr.Occ 作者重训版本（Table 1 ‡ 标注：官方预训练权重不可得，本文重训），非官方发布权重；R50、704×256、∗ 相机掩码监督；数字为论文自报（arXiv HTML v3，2026-11-04 抓取）"
tags: [occupancy-prediction, drocc, cotr, cvpr2026, plug-and-play]
note: library/3D_Occupancy/DrOcc.md#3-实验
paper: "CVPR 2026, Dr.Occ: Depth- and Region-Guided 3D Occupancy from Surround-View Cameras for Autonomous Driving (arXiv:2603.01007)"
stance: watch
evidence:
  - source: https://arxiv.org/html/2603.01007v3
    locator: "§1（抓取 2026-11-04）"
    quote: "when our modules are integrated into the SOTA method COTR [21], they further boost the overall mIoU by 1.0%"
    relation: supports
  - source: library/3D_Occupancy/DrOcc.md
    locator: "§3.2 / Table 1 转录行"
    quote: "| COTR∗‡ [21] | R50 | 704×256 | 43.1 |"
    relation: supports
  - source: library/3D_Occupancy/DrOcc.md
    locator: "§3.2 / Table 1 转录行"
    quote: "| **COTR(+Dr.Occ)∗** | R50 | 704×256 | **44.1** |"
    relation: supports
falsifiers:
  - "用 COTR 官方发布权重（或第三方复现的 43.1 口径）插入 Dr.Occ 模块后增益 < 1.0 mIoU"
  - "复现发现作者重训的 COTR 基线明显低于 43.1（对比基准被压低，增益虚高）"
review_due: 2027-02-02
related: [claim-cotr-compact-occupancy-1-16-no-perf-drop, claim-cotr-plugin-lowers-latency-flops, claim-drocc-bevdet4d-43p4-miou-occ3d]
signoff: null
---

## 我的理解

论文声称（asserted）：Dr.Occ 的两组模块不只是 BEVDet4D 专属，插入更强的 COTR 仍能再拿 +1.0 mIoU（43.1→44.1）。注意增益从 BEVDet4D 的 +7.4 缩到 COTR 的 +1.0——基线越强，剩余可提升空间越小，引用"即插即用增益"时必须带上基线档位。

关键限定：43.1 的 COTR 是 Dr.Occ 作者自己重训的（‡），不是 [COTR 官方口径](claim-cotr-compact-occupancy-1-16-no-perf-drop.md)（官方笔记记录的是 Occ3D-nuScenes 上的效率与精度自报，两处训练配方可能不同）。重训基线是否等价于官方 43.1 无从核对，falsifier 已覆盖。

## 待验证

- 等论文开源（或 CVPR open access 放出补充材料）后核对重训 COTR 的训练配方与 43.1。
- 若 Dr.Occ 放出代码，直接在 COTR 官方权重上插模块复测。

## 若成立 / 不成立意味着什么

成立：深度掩码 + 区域专家作为通用组件成立，占用主线的组件库多一件可插拔工具。
不成立：增益只对弱基线有效，或重训基线不可比，跨基线迁移主张放弃。
