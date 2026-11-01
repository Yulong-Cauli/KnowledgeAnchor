---
id: claim-bevplanner-egostatus-injection-closes-gap
title: "BEV-Planner 论文声称：UniAD/VAD 仅在 planner 注入 ego status 后才追平无感知 Ego-MLP，含 ego status 的方法间不可直接比较"
type: claim
status: asserted
scope: "nuScenes val；Table 1 统一评测口径（L2 距离、碰撞率、0.1m 网格）；对比对象为 UniAD（ID-1 无注入 / ID-2 仅 BEV 注入 / ID-3 BEV+planner 注入）与 VAD-Base（ID-4 无注入 / ID-5 仅 BEV 注入 / ID-6 BEV+planner 注入），参照系为无感知 Ego-MLP（ID-8）；论文自报数字（UniAD/VAD 部分为复现或官方 ckpt，详见 ckpt. source 列）"
tags: [end-to-end-driving, open-loop, ego-status, nuscenes, bev-planner, benchmark]
note: library/ADe2e/BEV-Planner.md#35-讨论
paper: "CVPR 2024, Is Ego Status All You Need for Open-Loop End-to-End Autonomous Driving? (BEV-Planner, arXiv:2312.03031)"
stance: watch
evidence:
  - source: library/ADe2e/BEV-Planner.md
    locator: "§4.3 (a) Ego status plays a key role"
    quote: "we argue that methods utilizing ego status are not directly comparable and conclusions should not be drawn from such comparisons."
    relation: supports
  - source: library/ADe2e/BEV-Planner.md
    locator: "§4 / Table 1 ID-6 行（VAD-Base，BEV+planner 注入）"
    quote: "| 6 | VAD-Base | ✓ | ✓ | 0.17 | 0.34 | 0.60 | 0.37 | 0.04 | 0.27 | 0.67 | 0.33 | 0.21 | 2.13 | 5.06 | 2.47 | Official |"
    relation: supports
  - source: library/ADe2e/BEV-Planner.md
    locator: "§4 / Table 1 ID-4 行（VAD-Base，无注入）"
    quote: "| 4 | VAD-Base | ✗ | ✗ | 0.69 | 1.22 | 1.83 | 1.25 | 0.06 | 0.68 | 2.52 | 1.09 | 1.02 | 3.44 | 7.00 | 3.82 | Reproduce |"
    relation: supports
falsifiers:
  - "同口径复现中，UniAD/VAD 不在 planner 注入 ego status 的版本（Table 1 口径下 ID-1/ID-4 一类）也已达到或超过 Ego-MLP 的 L2/碰撞率，即注入与否不改变追平关系"
  - "发现注入 ego status 带来的指标提升主要来自评测实现差异（如 ckpt source、碰撞网格、后处理口径）而非注入本身"
review_due: 2026-12-02
related: [claim-bevplanner-egomlp-parity-l2-collision, claim-bevplanner-ego-velocity-dominates-planning]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：nuScenes 开环 Table 1 上，UniAD/VAD 只有把 ego status 注入 planner 后（ID-3：L2-Avg 0.46 / Colli-Avg 0.37；ID-6：0.37 / 0.33）才追平无感知的 Ego-MLP（0.35 / 0.37）；只靠相机输入的版本（ID-1：1.03 / 0.77；ID-4：1.25 / 1.09）显著更差。论文据此声称"利用 ego status 的方法之间不具直接可比性，不应由这类比较得出结论"。

需要注意的注入路径区分：ego status 有两处入口——BEV 模块（跟随 BEVFormer/UniAD/VAD 惯例，ID-2/ID-5 及 BEV-Planner+）与 planner 拼接（ID-3/ID-6 及 BEV-Planner++）。论文的"追平"指 planner 注入；仅 BEV 注入（ID-2/ID-5）介于两者之间。另外笔记 §4 提示：Table 1 中 UniAD 数字默认为无后处理口径，与 Table 6 不可混用（见 claim-bevplanner-unidad-postprocessing-raises-ccr）。

## 待验证

- 用 NVlabs/BEV-Planner 及 UniAD/VAD 官方仓库，在同口径下复现 ID-1 vs ID-3、ID-4 vs ID-6 的开关对比（仅切换 ego status 注入位置，其余不变）。
- 核对 UniAD `use_can_bus` 开关（笔记 Appendix A 提及）对 BEV 特征的实际影响，确认"BEV 注入"与"planner 注入"的归因分离。

## 若成立 / 不成立意味着什么

成立（目前只是论文声称，尚未独立验证）：开环 SOTA 榜单上 UniAD/VAD 对无注入变体的领先不能解读为感知或端到端架构的优越；任何"方法 A 优于方法 B"的开环结论，必须先声明双方 ego status 注入位置是否一致。
不成立：若不注入 planner 的版本也能追平 Ego-MLP，则"ego status 主导开环指标"的叙事弱化，Table 1 其余归因（数据失衡、指标偏差）需重新评估。
