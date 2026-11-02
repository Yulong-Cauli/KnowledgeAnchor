---
id: claim-unidad-upstream-tasks-improve-planning
title: "UniAD 论文声称：Track/Map/Motion/Occ 前置任务联合训练使规划 L2 与碰撞率同时最优——仅规划器（Exp.10）avg.L2 1.131/avg.Col. 0.773，完整栈（Exp.12）1.004/0.430（Table 2）"
type: claim
status: asserted
scope: "nuScenes val；UniAD arXiv v2（arXiv:2212.10156，html/2212.10156v2）主文 Table 2 联合消融；消融训练 8 epochs（Appendix E.6 口径）；BEV 特征均来自 BEVFormer 的 BEV encoder（§2，可替换）；对比 Exp.10（仅 Plan：planner attend BEV 特征 + command embedding，无 Track/Map/Motion/Occ 分支）与 Exp.12（完整 UniAD）；指标 avg.L2（m）与 avg.Col.（%）；论文自报数字"
tags: [end-to-end-driving, open-loop, nuscenes, planning, multi-task, unidad, bevformer]
note: library/ADe2e/UniAD.md#31-联合消融
paper: "CVPR 2023 Best Paper, Planning-oriented Autonomous Driving (UniAD, arXiv:2212.10156)"
stance: watch
evidence:
  - source: library/ADe2e/UniAD.md
    locator: "§3.1 / Table 2（ID-10 行，仅 Plan）"
    quote: "| 10（仅 Plan） |  |  |  |  | ✓ | - | - | - | - | - | - | - | - | - | - | - | - | 1.131 | 0.773 |"
    relation: supports
  - source: library/ADe2e/UniAD.md
    locator: "§3.1 / Table 2（ID-12 行，全 UniAD）"
    quote: "| 12（全 UniAD） | ✓ | ✓ | ✓ | ✓ | ✓ | 0.358 | 1.334 | 641 | 0.302 | 0.672 | 0.728 | 1.054 | 0.154 | 62.3 | 39.5 | 52.8 | 32.3 | 1.004 | 0.430 |"
    relation: supports
  - source: library/ADe2e/UniAD.md
    locator: "§3.1（两种预测任务缺一不可的原句）"
    quote: "In Exp.10-12, only when the two tasks are introduced simultaneously (Exp.12), both metrics of the planning L2 and collision rate achieve the best results"
    relation: supports
  - source: library/ADe2e/UniAD.md
    locator: "§2.1（BEV 前置编码器口径）"
    quote: "Note that UniAD is not confined to a specific BEV encoder"
    relation: supports
falsifiers:
  - "复现 Exp.10（仅规划器，BEVFormer BEV 特征 + command embedding）：其 avg.Col. ≤0.43 或 avg.L2 ≤1.00，即前置任务对规划无增益"
  - "把 Exp.10 补齐到与 Exp.12 相同训练预算/参数量后两者规划指标差距消失（增益来自训练量或正则而非上游任务）"
  - "仅加 motion 或仅加 occ 单个预测任务（不动另一个）即达 Exp.12 水平，与论文'两个预测任务须同时引入'矛盾"
  - "按 BEV-Planner 的统一实现复测：Exp.10 与 Exp.12 的规划差距可被 ego status 注入位置差异解释（感知分支增益不成立）"
review_due: 2026-12-03
related: [claim-unidad-planning-oriented-stack-beats-mtl, claim-unidad-nlo-training-only-improves-motion, claim-bevplanner-egostatus-injection-closes-gap, claim-bevplanner-ego-velocity-dominates-planning, claim-bevplanner-unidad-postprocessing-raises-ccr]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：在同样的 BEVFormer BEV 特征之上，只留规划器（Exp.10，avg.L2 1.131 / avg.Col. 0.773）不如把 Track/Map/Motion/Occ 四个前置任务联合进来再规划（Exp.12，avg.L2 1.004 / avg.Col. 0.430）；且论文强调两种预测表示（agent 级 motion + scene 级 occupancy）必须同时引入，规划的 L2 与碰撞率才同时最优（Table 2，arXiv v2）。这是"检测/跟踪等前置任务对规划有增益"主张的受控对比。

口径警示（bevplanner-deep-read.md §3.2）：本卡数字绑定 UniAD 原文 arXiv v2 主文 Table 2（8-epoch 消融口径），不可与 Table 7 主结果（1.03/0.31）、BEV-Planner 复现（1.03/0.77/CCR 1.93）或官方 ckpt（0.66/0.62/1.72）混用。Table 2 仅逐字摘录了 ID-0/6/9/10/12 五行（笔记 TODO 注明），中间行（含 11）未在库内，引用"单任务不足"时暂无行内数字支撑，故相关 falsifier 以复现为准。

与 BEV-Planner 系卡的关系：claim-bevplanner-egostatus-injection-closes-gap 与 claim-bevplanner-ego-velocity-dominates-planning 分别从"注入位置"与"ego 扰动因果"两端质疑开环规划增益的归因；本卡是 UniAD 原文的正方证据，两方口径不同（原文自报 vs 统一实现复测），不构成直接互相否定，待同口径复现对账。

## 待验证

- 复现 Exp.10 与 Exp.12（8-epoch 消融配置），核对 avg.L2/avg.Col. 两列。
- 对照 Table 2 未摘录的中间行（ID-1..5、7-8、11），确认"两预测任务缺一不可"的行级证据。

## 若成立 / 不成立意味着什么

成立（目前只是论文声称，尚未独立验证）：感知/预测前置任务对开环规划指标有可测增益，端到端联合训练的路线有价值。
不成立：则 UniAD 类栈的规划增益需重新归因（ego status、数据失衡、训练量），与 BEV-Planner 的结论合流，选型上不再为"前置任务堆叠"付算力代价。
