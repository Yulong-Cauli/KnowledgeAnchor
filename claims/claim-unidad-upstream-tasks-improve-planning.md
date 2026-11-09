---
id: claim-unidad-upstream-tasks-improve-planning
title: "UniAD 论文声称：Track/Map/Motion/Occ 前置任务联合训练使规划 L2 与碰撞率同时最优——仅规划器（Exp.10）avg.L2 1.131/avg.Col. 0.773，完整栈（Exp.12）1.004/0.430（Table 2）"
type: claim
status: asserted
scope: "nuScenes val；UniAD arXiv v2（arXiv:2212.10156，html/2212.10156v2）主文 Table 2 联合消融；消融训练 8 epochs（Appendix E.6 口径）；BEV 特征均来自 BEVFormer 的 BEV encoder（§2，可替换）；对比 Exp.10（仅 Plan：planner attend BEV 特征 + command embedding，无 Track/Map/Motion/Occ 分支）与 Exp.12（完整 UniAD）；指标 avg.L2（m）与 avg.Col.（%）；论文自报数字"
tags: [end-to-end-driving, open-loop, nuscenes, planning, multi-task-learning, unidad, bevformer]
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
  - "同范围复现（对照侧）：复现 Exp.10（仅规划器，BEVFormer BEV 特征 + command embedding）：其 avg.Col. ≤0.43 或 avg.L2 ≤1.00，即前置任务对规划无增益"
  - "同范围复现（预算核对）：把 Exp.10 补齐到与 Exp.12 相同训练预算/参数量后两者规划指标差距消失（增益来自训练量或正则而非上游任务）"
  - "同范围复现（机制辨别）：仅加 motion 或仅加 occ 单个预测任务（不动另一个）即达 Exp.12 水平，与论文'两个预测任务须同时引入'矛盾"
  - "跨口径复现（机制辨别）：按 BEV-Planner 的统一实现复测：Exp.10 与 Exp.12 的规划差距可被 ego status 注入位置差异解释（感知分支增益不成立）"
review_due: 2026-12-03
related: [claim-unidad-planning-oriented-stack-beats-mtl, claim-unidad-nlo-training-only-improves-motion, claim-bevplanner-egostatus-injection-closes-gap, claim-bevplanner-ego-velocity-dominates-planning, claim-bevplanner-unidad-postprocessing-raises-ccr]
signoff: null
---

## 这条主张是什么意思

论文声称：在同样的 BEVFormer BEV 特征之上，只留规划器（Exp.10，avg.L2 1.131 / avg.Col. 0.773）不如把 Track/Map/Motion/Occ 四个前置任务联合进来再规划（Exp.12，avg.L2 1.004 / avg.Col. 0.430）；且论文强调两种预测表示（agent 级 motion + scene 级 occupancy）必须同时引入，规划的 L2 与碰撞率才同时最优（Table 2，arXiv v2）。这是"检测/跟踪等前置任务对规划有增益"主张的受控对比。

## 证据支持到哪里

- 四条 evidence：ID-10/ID-12 两行 + §3.1"两预测任务缺一不可"句 + §2.1 BEV encoder 可替换声明。行值逐字在库，本班与笔记逐格核对一致。
- 证据边界（重要缺口）：Table 2 笔记仅逐字摘录 ID-0/6/9/10/12 五行（笔记 TODO 注明），中间行（含 11）未在库内——"单任务不足"的行级数字（如 Exp.11）暂无支撑，相关判断以复现为准。
- 全部为 8-epoch 消融口径的论文自报数字，无独立复现；笔记数字 arXiv HTML v2 与 ar5iv 交叉核对（2026-11-02）。

## 口径警示（四套 UniAD 数字并存，bevplanner-deep-read.md §3.2）

本卡数字绑定 UniAD 原文 arXiv v2 主文 Table 2（8-epoch 消融口径），不可与 Table 7 主结果（1.03/0.31）、BEV-Planner 复现（1.03/0.77/CCR 1.93）或官方 ckpt（0.66/0.62/1.72）混用。

## 可能的解释与未排除的因素

- 行为观察（Table 2 直接报告）：Exp.10→Exp.12 规划两指标同向大幅改善（Col 0.773→0.430 接近减半）。
- 作者解释（论文立场，非本库复核）：agent 级 motion（带身份稀疏轨迹）与 scene 级 occupancy（稠密未来场景）互补，同时引入才最优（§3.1；Appendix B 原句见笔记 §4）。
- 未排除因素（本班整理者对照两份笔记整理，尚未验证）：① Exp.12 相对 Exp.10 同时改变了任务、参数量、监督信号与 ego 信息通路——MotionFormer 的 ego-vehicle query 是显式自车建模（§2.1 原句在笔记 §2.2），Planner 用的正是 MotionFormer 的 ego-vehicle query（§2.4），gap 是否来自"上游任务协作"还是"新增自车信息/监督量"未分离（falsifier 2/4 覆盖）；② BEV 阶段经 BEVFormer 的 ego status 隐式注入（UniAD 经 `use_can_bus` 开关，BEV-Planner 笔记 §3.5(b) 转述）在两行可能同在——此时不解释行间差，但复测时要固定。
- "两任务缺一不可"句覆盖 Exp.10-12，但库内只有两端行（10/12）的数字，中间档（11）行值缺失，该句的行级支撑不完整。

## 与 BEV-Planner 系卡的关系（条件不同，不互相否定）

claim-bevplanner-egostatus-injection-closes-gap 与 claim-bevplanner-ego-velocity-dominates-planning 分别从"注入位置"与"ego 扰动因果"两端质疑开环规划增益的归因；本卡是 UniAD 原文的正方证据。两方口径不同（原文自报 vs 统一实现复测）——BEV-Planner 用统一实现 + 0.1m 网格 + 碰撞率定义修正，UniAD 原文"采用与 ST-P3 相同的指标"——不构成直接互相否定，待同口径复现对账。

## 适用范围与迁移限制

- 绑定：nuScenes val、BEVFormer BEV 特征（论文声明可替换，但本表未测其他 encoder）、8-epoch 消融、论文自报指标实现。
- 不外推：前置任务有增益 ≠ 联合训练整体优于分阶段（后者是 stack-beats-mtl 卡的命题，两卡变量不同）；跨 encoder、跨数据集、20-epoch 主口径均属迁移检查。
- "前置任务对规划有增益"是端到端联合训练路线的核心卖点，若 falsifier 1/2 成立则增益需重新归因（ego status、数据失衡、训练量），与 BEV-Planner 结论合流（原卡"不成立"分支）。

## 对研究问题的启发

- "上游预测表示（agent 级 + scene 级）互补"是可检验的设计假设：在自己栈上加预测头时按"单加 motion / 单加 occ / 双加"设计消融，而不是直接全开（论文的 Exp.10-12 正是该设计的两端，研究启发，尚未验证）。
- 归因检查通用化：任何"上游任务帮助规划"的对比，先审计参数量、监督量、自车信息通路是否同时改变（本卡 falsifier 2/4 的通用化，本班整理者整理）。

## 当前立场与下一步

- 当前 stance：watch。原卡未记录立场依据，按未记录处理。
- 同范围复现：复现 Exp.10 与 Exp.12（8-epoch 消融配置），核对 avg.L2/avg.Col. 两列，并记录两边参数量与训练预算（falsifier 2 的前置）。
- 原文核查（零成本，可先行）：对照 Table 2 未摘录的中间行（ID-1..5、7-8、11），确认"两预测任务缺一不可"的行级证据——补笔记转录或引原文行值。
- 跨口径对账（单独任务）：按 BEV-Planner 统一实现复测两行，检验 gap 是否被 ego status 注入位置解释；结果只改变归因判断，不动本卡原命题。

## 核查记录

- 建卡：数字自 arXiv HTML v2 实抓（笔记 2026-11-03 自草稿入库，入库 QA 逐字自洽在案）。
- 2026-11-05（02 任务书 P1-B3a 批）：表达整理，数字与 quote 未改写。4 条 evidence Grep 逐字命中笔记；五行摘录限制、四套数字口径警示与 BEV-Planner 关系段保留；新增 ego-vehicle query 通路与 `use_can_bus` 两处 ego 信息入口的未排除因素（整理者对照两份笔记整理，尚未验证）；falsifier 加分层标注。id/status/stance/review_due/signoff 未动。
