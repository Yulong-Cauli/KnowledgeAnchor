---
id: claim-bevplanner-unidad-postprocessing-raises-ccr
title: "BEV-Planner 论文声称：UniAD 轨迹后处理降低碰撞率却显著推高 CCR（1.72→7.83），旧指标评判开环方法有偏"
type: claim
status: asserted
scope: "nuScenes val；UniAD 官方开源权重；对比为其轨迹后处理模块（P.P.，非线性优化避开 occupancy grid）开/关两种配置；指标为 Avg L2、Avg 碰撞率、Avg CCR（Table 6）；论文自报数字"
tags: [end-to-end-driving, open-loop, nuscenes, bev-planner, evaluation-metric, curb-collision-rate, unidad]
note: library/ADe2e/BEV-Planner.md#4-核心结论
paper: "CVPR 2024, Is Ego Status All You Need for Open-Loop End-to-End Autonomous Driving? (BEV-Planner, arXiv:2312.03031)"
stance: watch
evidence:
  - source: library/ADe2e/BEV-Planner.md
    locator: "§4.3 (d) New metrics will bring new conclusions"
    quote: "Our new metrics, the CCR reveal that UniAD's post-processing substantially increases the risk of the ego vehicle running off the road."
    relation: supports
  - source: library/ADe2e/BEV-Planner.md
    locator: "§4.3 / Table 6（P.P. ✓ 行）"
    quote: "| UniAD | ✓ | 0.77 | 0.51 | 7.83 |"
    relation: supports
  - source: library/ADe2e/BEV-Planner.md
    locator: "§4.3 / Table 6（P.P. ✗ 行）"
    quote: "| UniAD | ✗ | 0.66 | 0.62 | 1.72 |"
    relation: supports
  - source: library/ADe2e/BEV-Planner.md
    locator: "§4.3（默认报告口径）"
    quote: "In this paper, we report the results of UniAD without its post-processing by default."
    relation: supports
falsifiers:
  - "同范围复现（主张侧）：用 UniAD 官方权重复现：开启后处理后 CCR 与关闭时相当（未显著升高，例如仍 <2——预设判据），而碰撞率确实下降，即后处理的冲出路面风险不成立"
  - "实现核查（机制辨别）：发现 Table 6 的 CCR 差异来自评测实现问题（路沿栅格化分辨率、自车 yaw 估计修正、有效样本口径），修正实现后后处理不再显著推高 CCR"
  - "指标定义核查：后处理后的轨迹在可行驶区域内（未冲出路面）却被误判为越界，说明 CCR 定义本身把合法变道/绕行误判为碰撞"
review_due: 2026-12-02
related: [claim-bevplanner-egomlp-parity-l2-collision, claim-bevplanner-egostatus-injection-closes-gap, claim-unidad-upstream-tasks-improve-planning, claim-unidad-nlo-training-only-improves-motion]
signoff: null
---

## 主张

论文声称：UniAD 的轨迹后处理（P.P.，非线性优化避开 occupancy grid）把 Avg 碰撞率从 0.62 降到 0.51，却把 Avg CCR 从 1.72 推高到 7.83（Table 6，官方权重），即它在压低碰撞率的同时显著增加冲出路面的风险；论文据此声称"依赖旧指标评判开环方法优劣是有偏的"（§4.3：relying on past metrics to judge the superiority of different open-loop methods is biased），并默认报告 UniAD 无后处理的结果。与 egomlp-parity 卡（旧指标无区分度）对照：本卡主张换指标结论会反转。

## 证据与边界

- 四条 evidence：§4.3 判读句 + Table 6 两行 + 默认口径声明。Table 6 P.P.✗ 行（0.66/0.62/1.72）与 Table 1 ID-2 行完全吻合——内部交叉一致，round2 QA 确认笔记无错位。
- 同向佐证：GoStright（ID-7）的例子——其 L2/碰撞率"surprisingly good"（笔记 §3.5(a) 转述）但 CCR-Avg 8.62 为全表最差（Table 1）。
- 证据边界：单表两行、官方权重单点；CCR 是论文自定义指标（0.1m 路沿栅格化 + 碰撞率定义修正 Eq.3 + 自车 yaw 修正，笔记 §3.2），其可信度绑定在实现细节上（deep-read §1.5 评 ★★，报告层评估）。全部为论文报告数字，本库无独立复现。

## 解释与未排除因素

- 行为观察（Table 6 直接报告）：同一开关下，碰撞率与 CCR 反向变化。
- 作者解释（论文立场，非本库复核）：后处理只优化避开 occupancy、缺少地图先验，因此压碰撞率的同时增加冲出路面风险（§4.3）。
- 未排除因素：CCR 实现对合法绕行/变道的判定未独立审查（falsifier 2/3 覆盖）；论文 Limitation 自认不同指标间存在 trade-off、BEV-Planner 基线自身 CCR 也不突出——新指标同样不完善，论文自己也示范了"换指标换结论"的双向性。
- 跨笔记张力（整理者对照两份笔记整理，尚未验证）：UniAD 笔记记载同一机制的另一面——Planner 的推理期牛顿法避撞优化（Eq.9-11）在原文以碰撞率下降论证"安全优先于轨迹模仿"（Table 10：3s Col 1.39→1.05、L2 1.76→1.81）；BEV-Planner 用 CCR 暴涨论证"旧指标有偏"。两个指标在该模块上方向相反，谁更接近真实安全，库内两份笔记无法裁决；两处描述是否严格同一模块也未经代码核对。

## 范围与迁移限制

- 引用时的口径警示（笔记 §4 明确提示）：Table 1 中 UniAD 各行是无后处理结果（ID-2 的 0.66/0.62/1.72 与 Table 6 P.P. ✗ 行一致）；Table 6 P.P. ✓ 行（0.77/0.51/7.83）才是带后处理结果，两套数字不可混用。
- 结论绑定：UniAD 官方权重 + 该后处理模块 + BEV-Planner 的 CCR 实现 + nuScenes val。不外推到其他带后处理的方法、其他 CCR 实现。
- 机制区分：本卡的 P.P. 是推理期优化；UniAD MotionFormer 的训练期 NLO（Eq.4/5）是另一机制，见 claim-unidad-nlo-training-only-improves-motion，不可混谈。

## 研究启发

- 安全评估要成对报告"碰撞率 + 道路边界类指标"：单看碰撞率可能奖励把风险推出可行驶区域的设计（论文以 GoStright 和后处理两个例子示范）。
- 对带后处理的系统，消融要单列后处理的副作用，不能把端到端成绩与后处理成绩混为一谈。

## 下一步

- 当前 stance：watch。原卡未记录立场依据，按未记录处理。
- 优先执行的最小检查——同范围复现（主张侧）：UniAD 官方权重 + 官方后处理开关，在 nuScenes val 上复测 Table 6 两组数字。前置核对：所用 CCR 实现与论文一致（0.1m 栅格化、yaw 修正——falsifier 2 的检查对象）；再审查 7.83 是否把可行驶区域内的合法绕行误判为越界（falsifier 3）。
- 结果含义：复现出同量级 CCR 推高 → 论文论据成立，但 CCR 实现审查仍需独立通过；复现不出 → 按 falsifier 登记，论文"换指标换结论"论据收窄到 GoStright/Ego-MLP 两条其余证据支撑。

## 核查记录

- 2026-11-02（建卡，commit c3ecdd4）：数字自 arXiv HTML v2 实抓。
- 2026-11-05（02 任务书 P1-B3a 批）：表达整理，数字与 quote 未改写。4 条 evidence Grep 逐字命中笔记；Table 6 与 Table 1 ID-2 的交叉一致、口径警示与 GoStright 佐证保留；新增与 UniAD 原文 Table 10 视角的张力（整理者对照笔记，未验证）与 NLO/P.P. 机制区分；falsifier 加分层标注并标记预设判据。id/status/stance/review_due/signoff 未动。
