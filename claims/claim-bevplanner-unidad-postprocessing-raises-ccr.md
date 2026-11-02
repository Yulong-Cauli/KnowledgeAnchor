---
id: claim-bevplanner-unidad-postprocessing-raises-ccr
title: "BEV-Planner 论文声称：UniAD 轨迹后处理降低碰撞率却显著推高 CCR（1.72→7.83），旧指标评判开环方法有偏"
type: claim
status: asserted
scope: "nuScenes val；UniAD 官方开源权重；对比为其轨迹后处理模块（P.P.，非线性优化避开 occupancy grid）开/关两种配置；指标为 Avg L2、Avg 碰撞率、Avg CCR（Table 6）；论文自报数字"
tags: [end-to-end-driving, open-loop, nuscenes, bev-planner, metric, curb-collision-rate, unidad]
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
  - "用 UniAD 官方权重复现：开启后处理后 CCR 与关闭时相当（未显著升高，例如仍 <2），而碰撞率确实下降，即后处理的冲出路面风险不成立"
  - "发现 Table 6 的 CCR 差异来自评测实现问题（路沿栅格化分辨率、自车 yaw 估计修正、有效样本口径），修正实现后后处理不再显著推高 CCR"
  - "后处理后的轨迹在可行驶区域内（未冲出路面）却被误判为越界，说明 CCR 定义本身把合法变道/绕行误判为碰撞"
review_due: 2026-12-02
related: [claim-bevplanner-egomlp-parity-l2-collision, claim-bevplanner-egostatus-injection-closes-gap, claim-unidad-upstream-tasks-improve-planning, claim-unidad-nlo-training-only-improves-motion]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：UniAD 的轨迹后处理（非线性优化避开 occupancy grid）把 Avg 碰撞率从 0.62 降到 0.51，却把 Avg CCR 从 1.72 推高到 7.83（Table 6，官方权重），即它在压低碰撞率的同时显著增加冲出路面的风险；论文据此声称"依赖旧指标评判开环方法优劣是有偏的"（§4.3：relying on past metrics to judge the superiority of different open-loop methods is biased），并默认报告 UniAD 无后处理的结果。

引用时的口径警示（笔记 §4 明确提示）：Table 1 中 UniAD 各行是无后处理结果（ID-2 的 0.66/0.62/1.72 与 Table 6 P.P. ✗ 行一致）；Table 6 P.P. ✓ 行（0.77/0.51/7.83）才是带后处理结果，两套数字不可混用。另注意 GoStright 的例子同向支持该卡：其 L2/碰撞率"surprisingly good"但 CCR-Avg 8.62 为全表最差。

## 待验证

- 用 UniAD 官方权重 + 官方后处理开关，在 nuScenes val 上按论文 CCR 实现（0.1m 路沿栅格化、自车 yaw 修正）复测 Table 6 两组数字。
- 审查 CCR 实现对合法绕行/变道的判定，确认 7.83 不是把可行驶区域内的轨迹误判为越界。

## 若成立 / 不成立意味着什么

成立（目前只是论文声称，尚未独立验证）：开环方法的碰撞率排名不能单独作为安全性依据，必须同时报告 CCR 一类的道路边界指标；对 UniAD 类带后处理的系统，安全评估要单列后处理的副作用。
不成立：若后处理并不推高 CCR，则论文"换指标换结论"的核心论据之一被削弱，新指标主张需靠其余证据（GoStright、Ego-MLP 的 CCR 表现）支撑。
