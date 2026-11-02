---
id: claim-unidad-nlo-training-only-improves-motion
title: "UniAD 论文声称：MotionFormer 的非线性优化（NLO，仅训练期、不影响推理）改善运动预测——Table 8 ID-4→ID-5：minADE 0.747→0.710、minFDE 1.096→1.004、minFDE-mAP 0.266→0.273"
type: claim
status: asserted
scope: "nuScenes val；UniAD arXiv v2（arXiv:2212.10156，html/2212.10156v2）主文 Table 8（MotionFormer 设计消融）；消融训练 8 epochs（Appendix E.6 口径）；对比 ID-4（Scene-l. Anch.+Goal Inter.+Ego Q，无 NLO）与 ID-5（再加 NLO）；指标 minADE/minFDE（m）、MR、minFDE-mAP；论文自报数字。机制边界：此处 NLO 是 MotionFormer 训练目标的 non-linear smoother（Eq.4/5，仅训练期），不是 Planner 推理期避撞优化（Eq.9-11，牛顿法）"
tags: [end-to-end-driving, nuscenes, motion-forecasting, training-trick, unidad]
note: library/ADe2e/UniAD.md#35-模块内消融
paper: "CVPR 2023 Best Paper, Planning-oriented Autonomous Driving (UniAD, arXiv:2212.10156)"
stance: watch
evidence:
  - source: library/ADe2e/UniAD.md
    locator: "§3.5（§3.4 NLO 贡献原句，与 Table 8 ID-4→ID-5 行内数字一致）"
    quote: "the non-linear optimization strategy improves the performance (-5.0% minADE, -8.4% minFDE, -1.0 MR(%), +0.7 minFDE-mAP(%)) by taking perceptual uncertainty into account"
    relation: supports
  - source: library/ADe2e/UniAD.md
    locator: "§2.3（NLO 仅训练期的原句）"
    quote: "This target trajectory optimization is only conducted in training and does not affect inference."
    relation: supports
  - source: library/ADe2e/UniAD.md
    locator: "§3.5 / Table 8（ID-4 行，无 NLO）"
    quote: "| 4 | ✓ | ✓ | ✓ |  | 0.747 | 1.096 | 0.156 | 0.266 |"
    relation: supports
  - source: library/ADe2e/UniAD.md
    locator: "§3.5 / Table 8（ID-5 行，加 NLO，即完整 MotionFormer）"
    quote: "| 5 | ✓ | ✓ | ✓ | ✓ | 0.710 | 1.004 | 0.146 | 0.273 |"
    relation: supports
falsifiers:
  - "复现 Table 8 ID-4 与 ID-5：两者 minADE/minFDE 差距 <1% 或方向反转（NLO 无增益或有损）"
  - "发现 NLO 增益实际来自推理期平滑而非训练目标调整（训练-推理行为与 §2.2 声明'仅训练期'不符）"
  - "复现中 minFDE-mAP 不升反降（论文声称 +0.7），或 MR 不降（论文声称 -1.0 MR(%)）"
review_due: 2026-12-03
related: [claim-unidad-planning-oriented-stack-beats-mtl, claim-unidad-upstream-tasks-improve-planning, claim-bevplanner-unidad-postprocessing-raises-ccr]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：MotionFormer 训练时用 non-linear smoother 调整回归目标（代价含 λ_xy、λ_goal 两项 L2 与 jerk/curvature/curvature rate/acceleration/lateral acceleration 五项运动学项，Eq.4/5），以规避"端到端上游检测不完美时直接回归真值 waypoints 产生大曲率/大加速度轨迹"的问题；该优化仅作用于训练目标、不影响推理，却带来 minADE 0.747→0.710（-5.0%）、minFDE 1.096→1.004（-8.4%）、MR 0.156→0.146、minFDE-mAP 0.266→0.273（+0.7）的增益（Table 8 ID-4→ID-5，arXiv v2）。这是"训练期即插即用模块消融"主张：零推理成本的训练技巧。

口径与边界（两条，均刻意规避笔记已标 ⚠ 的位置）：
1. 本卡不引用 §3.4 正文 scene-level anchor 的 -15.8%/-11.2%（与 Table 8 行内 -9.0%/-13.2% 不自洽，见笔记 §3.5 ⚠ 注记与笔记 TODO）；NLO 一句的百分比与 Table 8 ID-4→ID-5 行内数字核对一致，可安全引用。
2. 本卡的 NLO（MotionFormer 训练目标优化，§2.2）与 claim-bevplanner-unidad-postprocessing-raises-ccr 所测的推理期轨迹后处理（P.P.，Planner Eq.9-11 牛顿法避撞，BEV-Planner Table 6 实测 Col 0.62→0.51、CCR 1.72→7.83）是两个不同机制，不可混谈；后者另有"推理期优化以 L2 换碰撞率"的 Planner 消融（笔记 Table 10）。

## 待验证

- 按 8-epoch 消融配置复现 Table 8 ID-4/ID-5 两行，重点核对 minADE/minFDE 与 minFDE-mAP。
- 审查官方代码中 NLO 的实现位置（dataloader/loss 侧 vs 推理侧），验证"仅训练期"声明。

## 若成立 / 不成立意味着什么

成立（目前只是论文声称，尚未独立验证）：运动预测/规划类端到端模型可用"训练期目标平滑"零成本拿到精度增益，值得在其他栈上移植验证。
不成立：则 UniAD 的运动预测增益需重新归因（如 anchor 设计、ego query），且"仅训练期"若不实，本卡与 BEV-Planner 的后处理批评（CCR 推高）将在同一机制上撞车。
