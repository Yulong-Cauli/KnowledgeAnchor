---
id: claim-bevplanner-egomlp-parity-l2-collision
title: "BEV-Planner 论文声称：无感知的 Ego-MLP 仅靠 ego status 在 nuScenes 开环 L2/碰撞率上与 SOTA 持平"
type: claim
status: asserted
scope: "nuScenes val（有效样本 5119/6019，Appendix B）；开环规划评测，论文统一实现（Union Implementation，碰撞率默认 0.1m 网格）；Ego-MLP 仅输入 ego velocity / acceleration / yaw angle / driving command，无任何相机/LiDAR 感知；Table 1 自报数字（复现 AD-MLP 时修复 issue #4、去除历史轨迹 GT 防标签泄露后的配置）"
tags: [end-to-end-driving, open-loop, ego-status, nuscenes, bev-planner, benchmark]
note: library/ADe2e/BEV-Planner.md#33-主结果
paper: "CVPR 2024, Is Ego Status All You Need for Open-Loop End-to-End Autonomous Driving? (BEV-Planner, arXiv:2312.03031)"
stance: watch
evidence:
  - source: library/ADe2e/BEV-Planner.md
    locator: "§4 / Table 1 caption"
    quote: "Without the perception module, Ego-MLP (ID-8), utilizing solely ego velocity, acceleration, yaw angle, and driving command, achieves performance on par with current state-of-the-art models on previous L2 distance and collision rate metrics."
    relation: supports
  - source: library/ADe2e/BEV-Planner.md
    locator: "§4 / Table 1 ID-8 行"
    quote: "| 8 | Ego-MLP | - | ✓ | 0.15 | 0.32 | 0.59 | 0.35 | 0.00 | 0.27 | 0.85 | 0.37 | 0.27 | 2.52 | 6.60 | 2.93 | （原表为空） |"
    relation: supports
falsifiers:
  - "在 nuScenes val 同口径（统一指标实现、0.1m 网格碰撞率）复现中，Ego-MLP 的 L2-Avg 或 Colli-Avg 显著差于 UniAD/VAD 同表配置（例如高出 2 倍以上），而非持平"
  - "发现 Ego-MLP 的持平依赖历史轨迹 GT 等标签泄露（论文声称已通过修复 AD-MLP issue #4 去除），或其输入实际包含 ego status 之外的未来信息"
review_due: 2026-12-02
related: [claim-bevplanner-egostatus-injection-closes-gap, claim-bevplanner-unidad-postprocessing-raises-ccr]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：在 nuScenes 开环评测的 L2 距离与碰撞率两个旧指标口径下，完全不用感知模块、只吃 ego status 的 Ego-MLP（Table 1 ID-8：L2-Avg 0.35 m / Colli-Avg 0.37%）与 UniAD、VAD 等 SOTA 方法持平。该 Ego-MLP 是论文作者复现 AD-MLP 时修复其 issue #4、去掉历史轨迹 GT 以防标签泄露之后的版本，对应笔记 §1 "Yes 的一面"。

两个必须记住的限定：
1. "持平"只覆盖 L2 与碰撞率两个旧指标。按论文新提的 CCR 口径，Ego-MLP（CCR-Avg 2.93）并不优于 UniAD（1.93）/VAD（2.47），不能外推为"Ego-MLP 整体与 SOTA 相当"。
2. 该对比成立的前提是同一评测实现与网格分辨率（0.1m）；若沿用 AD-MLP 的 0.5m 粗网格，论文认为碰撞率本身有假碰撞问题。

## 待验证

- 用官方仓库 NVlabs/BEV-Planner 复现 Ego-MLP（ID-8）配置，在 nuScenes val 上按统一实现重算 L2 与碰撞率，与 UniAD（ID-1/2/3）、VAD-Base（ID-4/5/6）同表对比。
- 核对 Ego-MLP 训练/评测配置确实不含历史轨迹 GT 及其他未来信息（无标签泄露）。
- 确认碰撞率网格分辨率（0.1m vs 0.5m）与论文默认口径一致。

## 若成立 / 不成立意味着什么

成立（目前只是论文声称，尚未独立验证）：nuScenes 开环上 L2/碰撞率不足以区分"有无感知"，任何只报这两个指标的开环对比都不能作为感知贡献的证据；选型与方案引用该类榜单前必须先核对 ego status 注入位置（见 claim-bevplanner-egostatus-injection-closes-gap）。
不成立：若复现中 Ego-MLP 显著落后，说明 Table 1 对比另有口径问题，本卡及其 related 卡的结论都需重审。
