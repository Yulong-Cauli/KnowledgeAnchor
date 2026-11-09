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
  - "同范围复现（主张侧）：按 8-epoch 消融配置复现 Table 8 ID-4 与 ID-5：两者 minADE/minFDE 差距 <1%（预设判据，无既有统计锚点）或方向反转（NLO 无增益或有损）"
  - "机制辨别（代码核对）：发现 NLO 增益实际来自推理期平滑而非训练目标调整（训练-推理行为与论文声明'仅训练期'不符）"
  - "同范围复现（次要指标）：复现中 minFDE-mAP 不升反降（论文声称 +0.7），或 MR 不降（论文声称 -1.0 MR(%)）"
review_due: 2026-12-03
related: [claim-unidad-planning-oriented-stack-beats-mtl, claim-unidad-upstream-tasks-improve-planning, claim-bevplanner-unidad-postprocessing-raises-ccr]
signoff: null
---

## 这条主张是什么意思

论文声称：MotionFormer 训练时用 non-linear smoother 调整回归目标（代价含 λ_xy、λ_goal 两项 L2 与 jerk/curvature/curvature rate/acceleration/lateral acceleration 五项运动学项，Eq.4/5），以规避"端到端上游检测不完美时直接回归真值 waypoints 产生大曲率/大加速度轨迹"的问题；该优化仅作用于训练目标、不影响推理，却带来 minADE 0.747→0.710（-5.0%）、minFDE 1.096→1.004（-8.4%）、MR 0.156→0.146、minFDE-mAP 0.266→0.273（+0.7）的增益（Table 8 ID-4→ID-5，arXiv v2）。这是"训练期即插即用模块消融"主张：零推理成本的训练技巧。

## 证据支持到哪里

- 四条 evidence：论文 §3.4 NLO 贡献句（百分比与行内数字一致）+ "仅训练期"声明（笔记 §2.3，论文 §2.2）+ Table 8 ID-4/ID-5 两行。ID-1..5 完整梯度（minADE 0.844/0.768/0.755/0.747/0.710）在笔记 §3.5 表内，本班逐行核对一致。
- 证据边界：单表自报、8-epoch 消融口径（Appendix E.6）、无方差报告；笔记数字来自 arXiv HTML v2 抓取（2026-11-02，与 ar5iv 交叉核对在案）。"仅训练期"是论文声明，代码层面的核对尚未发生（falsifier 2 覆盖）。

## 口径与边界（两条，均刻意规避笔记已标 ⚠ 的位置）

1. 本卡不引用论文 §3.4 正文 scene-level anchor 的 -15.8%/-11.2%（与 Table 8 行内 -9.0%/-13.2% 不自洽，笔记 §3.5 ⚠ 注记在案）；NLO 一句的百分比与 Table 8 ID-4→ID-5 行内数字核对一致，可安全引用。
2. 本卡的 NLO（MotionFormer 训练目标优化，笔记 §2.3 / 论文 §2.2）与 claim-bevplanner-unidad-postprocessing-raises-ccr 所测的推理期轨迹后处理（P.P.，Planner Eq.9-11 牛顿法避撞，BEV-Planner Table 6 实测 Col 0.62→0.51、CCR 1.72→7.83）是两个不同机制，不可混谈；后者另有"推理期优化以 L2 换碰撞率"的 Planner 消融（UniAD 笔记 Table 10）。

## 可能的解释与未排除的因素

- 行为观察（Table 8 直接报告）：ID-4→ID-5 加 NLO 后 minADE/minFDE/MR/minFDE-mAP 四指标同向改善。
- 作者解释（论文立场，非本库复核）：non-linear smoother 把感知不确定性纳入训练目标，避免直接回归真值 waypoints 产生的不现实轨迹监督（§2.2）。
- 未排除因素：① NLO 与其他三组件（anchor/goal interaction/ego query）的交互未单独消融，-5.0%/-8.4% 是在该消融阶梯末端的净增量；② 8-epoch 消融口径不能直接外推 20-epoch 主结果口径；③ "仅训练期"声明未做代码核对。

## 适用范围与迁移限制

- 绑定：nuScenes val、MotionFormer（scene-centric、K=6 模态）、8-epoch 消融配置、论文自报指标实现。
- 迁移：作为"训练期目标平滑"技巧移植到其他轨迹预测/规划栈属于跨条件迁移，收益不可预支；其动机前提是"上游预测不完美、GT waypoints 不是好监督目标"——在没有端到端上游误差的单任务栈里，前提可能不成立（本班整理者按 §2.2 动机整理，尚未验证）。

## 对研究问题的启发

- 端到端栈中"直接回归 GT waypoints"可能不是最优监督目标——上游误差通过训练目标进入模型；检查自己管线里有哪些 GT 直连回归点（研究启发，尚未验证）。
- 与后处理路线的对照：同是轨迹优化，放在训练目标（本卡）与放在推理期（P.P. 卡）在 BEV-Planner/UniAD 两套评测里得到不同的指标画像——"优化放在哪一阶段"本身是值得设计的实验变量（本班整理者对照两份笔记提出，尚未验证）。

## 当前立场与下一步

- 当前 stance：watch。原卡未记录立场依据，按未记录处理。
- 原文核查/代码核对（最优先、零训练成本）：审查官方代码中 NLO 的实现位置（dataloader/loss 侧 vs 推理侧），验证"仅训练期"声明——这是本卡与 P.P. 卡机制区分成立的前提；若不实，本卡与 BEV-Planner 的后处理批评将在同一机制上撞车（原卡"不成立"分支已写明）。
- 同范围复现：按 8-epoch 消融配置复现 ID-4/ID-5 两行，重点核对 minADE/minFDE 与 minFDE-mAP；差距 <1%（预设判据）或方向反转 → 按 falsifier 登记，UniAD 的运动预测增益需重新归因（如 anchor 设计、ego query）。
- 结果含义：复现成功且代码核对通过 → "训练期平滑零推理成本增益"可作为待验证的移植假设进入下一轮讨论；任一失败 → 相关归因与机制区分重审。

## 核查记录

- 建卡：数字自 arXiv HTML v2 实抓（笔记 2026-11-03 自草稿入库，入库 QA 逐字自洽在案）。
- 2026-11-05（02 任务书 P1-B3a 批）：表达整理，数字与 quote 未改写。4 条 evidence Grep 逐字命中笔记；Table 8 ID-1..5 梯度逐行核对一致；⚠ 区规避与 NLO/P.P. 机制区分保留并注明笔记/论文章节号对应；falsifier 加分层标注并标记预设判据。id/status/stance/review_due/signoff 未动。
