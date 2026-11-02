---
id: claim-unidad-planning-oriented-stack-beats-mtl
title: "UniAD 论文声称：planning-oriented 五任务联合栈在 nuScenes val 上全面优于同模块朴素 MTL（各任务独立头）方案（Table 2 Exp.12 vs Exp.0）"
type: claim
status: asserted
scope: "nuScenes val；UniAD arXiv v2（arXiv:2212.10156，html/2212.10156v2）主文 Table 2 联合消融；消融训练 8 epochs（Appendix E.6 口径）；对比 Exp.0∗（MTL scheme with separate heads for each task，五任务模块全开但各自独立头）与 Exp.12（完整 UniAD，query 接口联合）；指标 minADE/minFDE/MR/IoU-f/VPQ-f/avg.L2/avg.Col.；论文自报数字"
tags: [end-to-end-driving, open-loop, nuscenes, planning-oriented, multi-task, unidad]
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
  - "同 8-epoch 配置复现 Exp.0 与 Exp.12：MTL 独立头方案在 minADE/minFDE/avg.L2/avg.Col. 任一关键指标上追平或反超完整 UniAD（差距 <2%）"
  - "把 Exp.0 的训练轮数/参数量补齐到与 Exp.12 相同计算预算后差距消失，说明增益来自训练量而非任务协作方式"
  - "发现 Table 2 两行在 BEV encoder、输入分辨率或数据配置上不可比（未控制变量），差值不能归因于 planning-oriented 联合设计"
review_due: 2026-12-03
related: [claim-unidad-upstream-tasks-improve-planning, claim-unidad-nlo-training-only-improves-motion, claim-bevplanner-unidad-postprocessing-raises-ccr]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：同样配备五个任务模块，用 query 接口把 Track/Map/Motion/Occ/Plan 联合成一个网络（Exp.12），在 nuScenes val 上全面优于各任务独立头的朴素 MTL 方案（Exp.0∗）——minADE 0.858→0.728（-15.2%）、minFDE 1.270→1.054（-17.0%）、avg.L2 1.154→1.004（-0.15 m）、avg.Col. 0.941→0.430（-0.51）。两行模块列全勾，隔离的变量是"任务联合方式"而非"是否加任务"，这正是"统一范式多任务堆叠"主张的核心证据（Table 2，arXiv v2）。

口径警示（bevplanner-deep-read.md §3.2 四套 UniAD 数字并存）：本卡全部数字绑定 UniAD 原文 arXiv v2 主文 Table 2（8-epoch 消融口径）；不可与 Table 7 主结果口径（avg.L2 1.03/avg.Col. 0.31）、BEV-Planner 复现口径（1.03/0.77/CCR 1.93）或官方 ckpt 口径混用。原文该总结句括号排版有笔误（"-3.2 MR(%)),"多余括号），笔记逐字照录，引用时保持原样。

## 待验证

- 按 Appendix E.6 的 8-epoch 消融配置复现 Exp.0∗ 与 Exp.12 两行，重点核对 avg.L2/avg.Col. 与 minADE/minFDE。
- 检查 Exp.0∗ 的官方实现细节（独立头是否共享 BEV encoder 与训练 schedule），确认对比控制了变量。

## 若成立 / 不成立意味着什么

成立（目前只是论文声称，尚未独立验证）：多任务端到端驾驶栈中，任务间的 query 接口联合优于朴素 MTL，"planning-oriented 设计"有受控对比支撑。
不成立：则 UniAD 的核心卖点退化为"堆任务+堆数据"，后续工作（如 BEV-Planner 一系）对端到端联合收益的质疑获得直接证据。
