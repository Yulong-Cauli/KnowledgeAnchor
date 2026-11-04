---
id: claim-unidad-planning-oriented-stack-beats-mtl
title: "UniAD 论文声称：planning-oriented 五任务联合栈在 nuScenes val 上全面优于同模块朴素 MTL（各任务独立头）方案（Table 2 Exp.12 vs Exp.0）"
type: claim
status: asserted
scope: "nuScenes val；UniAD arXiv v2（arXiv:2212.10156，html/2212.10156v2）主文 Table 2 联合消融；消融训练 8 epochs（Appendix E.6 口径）；对比 Exp.0∗（MTL scheme with separate heads for each task，五任务模块全开但各自独立头）与 Exp.12（完整 UniAD，query 接口联合）；指标 minADE/minFDE/MR/IoU-f/VPQ-f/avg.L2/avg.Col.；论文自报数字，尚未独立验证"
tags: [end-to-end-driving, open-loop, nuscenes, planning-oriented, multi-task-learning, unidad]
note: library/ADe2e/UniAD.md#31-联合消融
paper: "CVPR 2023 Best Paper, Planning-oriented Autonomous Driving (UniAD, arXiv:2212.10156)"
stance: watch
evidence:
  - source: library/ADe2e/UniAD.md
    locator: "§3.1（正文对 Exp.12 vs Exp.0 的总结原句）"
    quote: "Exp.12 outperforms it by a significant margin in all essential metrics (-15.2% minADE, -17.0% minFDE, -3.2 MR(%)), +4.9 IoU-f.(%)., +5.9 VPQ-f.(%), -0.15 m avg.L2, -0.51 avg.Col.(%)), showing the superiority of our planning-oriented design."
    relation: supports
  - source: library/ADe2e/UniAD.md
    locator: "§3.1 / Table 2（ID-0∗ 行，MTL scheme，五任务全开）"
    quote: "| 0∗ | ✓ | ✓ | ✓ | ✓ | ✓ | 0.356 | 1.328 | 893 | 0.302 | 0.675 | 0.858 | 1.270 | 0.186 | 55.9 | 34.6 | 47.8 | 26.4 | 1.154 | 0.941 |"
    relation: supports
  - source: library/ADe2e/UniAD.md
    locator: "§3.1 / Table 2（ID-12 行，全 UniAD）"
    quote: "| 12（全 UniAD） | ✓ | ✓ | ✓ | ✓ | ✓ | 0.358 | 1.334 | 641 | 0.302 | 0.672 | 0.728 | 1.054 | 0.154 | 62.3 | 39.5 | 52.8 | 32.3 | 1.004 | 0.430 |"
    relation: supports
  - source: library/ADe2e/UniAD.md
    locator: "§3.1 / Table 2 caption 注（Exp.0 的定义）"
    quote: "MTL scheme with separate heads for each task"
    relation: supports
falsifiers:
  - "同范围复现（主张侧）：按 Appendix E.6 的 8-epoch 配置复现 Exp.0 与 Exp.12：MTL 独立头方案在 minADE/minFDE/avg.L2/avg.Col. 任一关键指标上追平或反超完整 UniAD（差距 <2%——预设判据，无既有统计锚点）"
  - "同范围复现（对照侧/预算核对）：把 Exp.0 的训练轮数/参数量补齐到与 Exp.12 相同计算预算后差距消失，说明增益来自训练量而非任务协作方式"
  - "原文核查（可比性核查）：发现 Table 2 两行在 BEV encoder、输入分辨率或数据配置上不可比（未控制变量），差值不能归因于 planning-oriented 联合设计"
review_due: 2026-12-03
related: [claim-unidad-upstream-tasks-improve-planning, claim-unidad-nlo-training-only-improves-motion, claim-bevplanner-unidad-postprocessing-raises-ccr]
signoff: null
---

## 这条主张是什么意思

论文声称（尚未独立验证）：同样配备五个任务模块，用 query 接口把 Track/Map/Motion/Occ/Plan 联合成一个网络（Exp.12），在 nuScenes val 上全面优于各任务独立头的朴素 MTL 方案（Exp.0∗）——minADE 0.858→0.728（-15.2%）、minFDE 1.270→1.054（-17.0%）、avg.L2 1.154→1.004（-0.15 m）、avg.Col. 0.941→0.430（-0.51）。两行模块列全勾，隔离的变量是"任务联合方式"而非"是否加任务"，这正是"统一范式多任务堆叠"主张的核心证据（Table 2，arXiv v2）。

## 证据支持到哪里

- 四条 evidence：§3.1 总结句（括号排版笔误照录）+ Table 2 ID-0∗/ID-12 两行 + caption 对 Exp.0∗ 的定义。行值 1.154/0.941 与 1.004/0.430 逐字在库，本班与笔记逐格核对一致。
- 证据边界：单表两行、8-epoch 消融口径（Appendix E.6）、无方差报告；笔记数字 arXiv HTML v2 与 ar5iv 交叉核对（2026-11-02）。全部为论文自报数字，无独立复现。

## 口径警示（四套 UniAD 数字并存，bevplanner-deep-read.md §3.2）

本卡全部数字绑定 UniAD 原文 arXiv v2 主文 Table 2（8-epoch 消融口径）；不可与 Table 7 主结果口径（avg.L2 1.03/avg.Col. 0.31）、BEV-Planner 复现口径（1.03/0.77/CCR 1.93）或官方 ckpt 口径（0.66/0.62/1.72）混用。原文该总结句括号排版有笔误（"-3.2 MR(%)),"多余括号），笔记逐字照录，引用时保持原样；行值以表格为准。

## 可能的解释与未排除的因素

- 行为观察（Table 2 直接报告）：同模块配置下，query 接口联合优于独立头，多指标同向。
- 作者解释（论文立场，非本库复核）：query 接口让节点间通信拥有更大感受野、软化上游误差累积（§1），任务协作方式而非任务数量带来增益。
- 未排除因素：① Exp.0∗ 独立头的实现细节（是否共享 BEV encoder、训练 schedule）未核对——若两行训练量/参数量不匹配，增益可能来自训练量（falsifier 2 覆盖）；② 8-epoch 消融口径不能直接外推 20-epoch 主结果；③ "全面优于"的判定基于论文选择的"essential metrics"集合，无显著性检验。

## 适用范围与迁移限制

- 绑定：nuScenes val、五任务模块全开的两配置、8-epoch 消融、论文自报指标实现。
- 不外推：任务数不同的栈——两行都五任务全开，结论只覆盖"query 联合 vs 独立头"这一维；"planning-oriented 设计优越"是论文对该表的整体解读，跨栈外推（如换 BEV encoder、改任务集合后 query 接口是否仍优）属迁移检查。
- 与"任务变量"对比的关系（本班整理者对照 Table 2 结构整理，尚未验证）：Exp.10 vs Exp.12（claim-unidad-upstream-tasks-improve-planning）隔离的是"是否加上游任务"，本卡隔离的是"联合方式"；两卡合看才能把归因拆开，单独引用任一卡都不能推出"planning-oriented 设计整体优越"。

## 对研究问题的启发

- 多任务端到端栈的消融要把"加任务"与"改接口"两个变量分开设计——本卡是论文提供的"接口变量"受控对比模板（研究启发，尚未验证）。
- 复现或自建同类对比时，先审计独立头基线的实现自由度（共享底座、训练预算），否则增益归因会混入训练量。

## 当前立场与下一步

- 当前 stance：watch。原卡未记录立场依据，按未记录处理。
- 同范围复现：按 Appendix E.6 的 8-epoch 配置复现 Exp.0∗ 与 Exp.12 两行，重点核对 avg.L2/avg.Col. 与 minADE/minFDE；MTL 独立头任一关键指标追平或反超（差距 <2%，预设判据）→ 按 falsifier 登记，UniAD 核心卖点退化为"堆任务+堆数据"（原卡"不成立"分支）。
- 原文核查（可并行）：检查 Exp.0∗ 的官方实现细节（独立头是否共享 BEV encoder 与训练 schedule），确认对比控制了变量——若不控制，增益归因降级为"口径问题登记待决"，不据此判伪。

## 核查记录

- 建卡：数字自 arXiv HTML v2 实抓（笔记 2026-11-03 自草稿入库，入库 QA 逐字自洽在案）。
- 2026-11-05（02 任务书 P1-B3a 批）：表达整理，数字与 quote 未改写。4 条 evidence Grep 逐字命中笔记；四套数字口径警示与括号笔误注记保留；新增"接口变量 vs 任务变量"两卡合看的跨卡关系（整理者整理，未验证）；falsifier 加分层标注并标记预设判据。id/status/stance/review_due/signoff 未动。
