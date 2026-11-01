---
id: claim-bevplanner-ego-velocity-dominates-planning
title: "BEV-Planner 论文声称：ego status 在场时，图像 corruption（含全黑）对规划影响小，扰动 ego 速度才显著改变规划轨迹"
type: claim
status: asserted
scope: "nuScenes val；官方 VAD-Base checkpoint（planner 注入 ego status）；Table 2 扰动实验：图像退化（Snow/Fog/Glare/Rain/Blank）vs ego 速度扰动（v×0.0 / v×0.5 / v×1.5 / v=100 m/s）；指标为 L2 距离、碰撞率、CCR 及感知 NDS/mAP；论文自报数字"
tags: [end-to-end-driving, open-loop, ego-status, nuscenes, bev-planner, robustness]
note: library/ADe2e/BEV-Planner.md#34-图像退化-vs-ego-status-扰动
paper: "CVPR 2024, Is Ego Status All You Need for Open-Loop End-to-End Autonomous Driving? (BEV-Planner, arXiv:2312.03031)"
stance: watch
evidence:
  - source: library/ADe2e/BEV-Planner.md
    locator: "§1 三个缺点之（3）"
    quote: "blanking all the camera input in VAD [16] leads to complete failure of the perception module but minor degrade in planning, when ego status is present. However, altering the input ego velocity can significantly influence the final predicted trajectory."
    relation: supports
  - source: library/ADe2e/BEV-Planner.md
    locator: "§4 / Table 2 caption"
    quote: "In contrast to the minor impact of image corruption on planning, modifications to the ego vehicle's velocity have a significant effect on the planning results."
    relation: supports
  - source: library/ADe2e/BEV-Planner.md
    locator: "§4 / Table 2 v×0.0 行"
    quote: "| VAD-Base | - | v×0.0 | 3.81 | 6.19 | 8.48 | 6.16 | 1.00 | 6.76 | 16.18 | 7.98 | 0.19 | 0.41 | 3.10 | 1.23 | 45.5 | 47.0 |"
    relation: supports
falsifiers:
  - "同配置（官方 VAD-Base、nuScenes val）复现中，图像置空（Blank）使规划指标恶化到与速度扰动同量级（例如 L2-Avg 从约 0.37 升到 2 以上），而非论文所述的小幅退化"
  - "对 ego 速度施加 v×0.5 / v×1.5 级别扰动时，预测轨迹几乎不变（L2-Avg 变化在 0.1 以内），与 Table 2 的 3.19 / 3.20 相差甚远"
review_due: 2026-12-02
related: [claim-bevplanner-egostatus-injection-closes-gap, claim-bevplanner-egomlp-parity-l2-collision]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：只要 ego status 进入模型（此处为 planner 注入 ego status 的 VAD-Base），最终预测轨迹就主要由 ego status 支配，感知输入被弱化——把相机输入全部置黑，感知 NDS/mAP 崩到 0.0/0.0，但 L2-Avg 仅从 0.37 变到 0.46（Table 2 Blank 行）；而把速度设为 0.5 倍 / 100 m/s，L2-Avg 分别恶化到 3.19 / 208，且感知 NDS/mAP（45.5/47.0）完全不变。§4.3 还给出极端例子：速度设 100 m/s 时模型生成完全不可行的轨迹。

两个必须记住的限定：
1. 前提是"ego status is present"：Appendix E 显示对不含 ego status 的 VAD-Base 屏蔽相机输入时，L2-Avg 恶化到 4.33、Colli-Avg 到 7.63——视觉信息在无 ego status 时确实重要，本卡结论不可外推到无 ego status 的模型。
2. 速度置零时 CCR 反而很好（1.23），论文自注这是 CCR 指标的局限（静止轨迹不碰路沿），说明 CCR 同样有盲区。

## 待验证

- 用 VAD 官方仓库 + 论文扰动脚本，复现 Table 2 的 Blank 行与 v×0.0 / v=100 m/s 行，核对 L2/碰撞率/NDS/mAP 量级。
- 用 UniAD 或 BEV-Planner++ 重复同样的图像/速度双扰动，检验"速度主导"是否跨模型成立（Table 2 仅测 VAD-Base）。

## 若成立 / 不成立意味着什么

成立（目前只是论文声称，尚未独立验证）：nuScenes 开环模型在 ego status 在场时基本不依赖视觉做规划，安全论证中不能把开环 L2/碰撞率当作感知有效性的证据；评测应报告"扰动 ego status"的敏感性。
不成立：若图像 corruption 同样显著改变规划，则"感知被弱化"的指控不成立，开环榜单的区分度需要另找解释（回到数据分布与指标口径问题）。
