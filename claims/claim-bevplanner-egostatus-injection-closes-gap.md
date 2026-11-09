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
  - "同范围复现（对照侧）：同口径复现中，UniAD/VAD 不在 planner 注入 ego status 的版本（Table 1 口径下 ID-1/ID-4 一类）也已达到或超过 Ego-MLP 的 L2/碰撞率，即注入与否不改变追平关系"
  - "同范围复现（机制辨别）：发现注入 ego status 带来的指标提升主要来自评测实现差异（如 ckpt source、碰撞网格、后处理口径）而非注入本身"
review_due: 2026-12-02
related: [claim-bevplanner-egomlp-parity-l2-collision, claim-bevplanner-ego-velocity-dominates-planning]
signoff: null
---

## 这条主张是什么意思

论文声称：nuScenes 开环 Table 1 上，UniAD/VAD 只有把 ego status 注入 planner 后（ID-3：L2-Avg 0.46 / Colli-Avg 0.37；ID-6：0.37 / 0.33）才追平无感知的 Ego-MLP（0.35 / 0.37）；只靠相机输入的版本（ID-1：1.03 / 0.77；ID-4：1.25 / 1.09）显著更差。论文据此声称"利用 ego status 的方法之间不具直接可比性，不应由这类比较得出结论"（§4.3）。这张卡是机制系的"注入位置"卡：它给 egomlp-parity 现象卡提供第一层机制解释。

## 证据支持到哪里

- 三条 evidence：§4.3 结论句 + ID-6/ID-4 两端行。中间档 ID-2（UniAD 仅 BEV 注入，0.66/0.62）与 ID-5（VAD 仅 BEV 注入，0.72/0.54）行值在笔记 §3.3，本班逐行核对一致——两架构各自构成"无注入 → 仅 BEV → BEV+planner"三档剂量-反应，同方向排序在两个架构上重复。
- 证据边界：全部为论文自报数字，本库无独立复现。deep-read §1.3（报告层评估）将其评为链内横向最广的受控对比（★★★），但 ckpt source 混杂与"追平"无显著性检验是明确薄弱点（见下节）。

## 可能的解释与未排除的因素

- 行为观察（Table 1 直接报告）：同架构内注入档位与 L2/碰撞率单调相关，方向跨架构重复。
- 作者解释（论文立场，非本库复核）：ego status 在场时感知贡献被边缘化，注入位置不同导致含 ego status 的方法间不可比。
- 未排除因素：① **ckpt source 混杂**——UniAD 组 ID-1/ID-3 同为 Reproduce（两端干净），但中间档 ID-2 为 Official；VAD 组 ID-4（Reproduce）↔ ID-6（Official）跨源，注入效应与权重来源未完全解耦；② "追平"无显著性检验（ID-3 0.46 vs Ego-MLP 0.35 的差距无方差报告）；③ ego status 有两处入口——BEV 模块（跟随 BEVFormer/UniAD/VAD 惯例，UniAD 经 `use_can_bus` 开关控制，Appendix A）与 planner 拼接（ID-3/ID-6 及 BEV-Planner++）——"无注入"行并非绝对无 ego 信息，归因时两处入口要分开核对（笔记 §3.5(b)、Appendix C 在案）。
- 口径警示（笔记 §4 明确提示）：Table 1 中 UniAD 数字默认为无后处理口径，与 Table 6 不可混用（见 claim-bevplanner-unidad-postprocessing-raises-ccr）。

## 适用范围与迁移限制

- 结论绑定：Table 1 统一评测口径 + UniAD/VAD 两架构的具体行。注入位置区分必须随结论携带：论文的"追平"指 **planner 注入**（ID-3/ID-6）；仅 BEV 注入（ID-2/ID-5）介于两者之间，BEV-Planner 自身的 ID-9→ID-11→ID-12 序列（0.57/0.55 → 0.46 → 0.35）是论文内的第三组同构对照，行为同向。
- 论文 §4.3 的更大结论（"利用 ego status 的方法不可直接比较"）是方法论主张，其证据限于 Table 1 的两架构三档；推广到其他评测协议/其他 ego status 形式属跨条件迁移，不可预支。
- 不外推：闭环或实车场景；其他数据集。

## 对研究问题的启发

- 引用任何 UniAD/VAD 开环数字前先问 "in BEV? in planner?"（deep-read §2.3 第 1 条）。
- "注入位置审计"可作为评估开环方法的固定检查项；ego status 的两处入口（BEV 特征 / planner 拼接）提示消融要在两个入口分别做开关，而不是只切一个（本班整理者按笔记 §2.1/§3.5(b) 整理，尚未验证）。

## 当前立场与下一步

- 当前 stance：watch。原卡未记录立场依据，按未记录处理。
- 优先执行的最小检查——同范围复现（机制辨别）：优先复现 UniAD 组 ID-1 vs ID-3（两端同为 Reproduce 源，权重混杂最小），仅切换 planner 注入开关、固定数据/指标实现/训练配置，观察 L2/碰撞率/CCR 档位差。若不注入版已追平 Ego-MLP → 论文"追平"叙事弱化，Table 1 其余归因（数据失衡、指标偏差）需重新评估（原卡"不成立"分支，hub 卡连带重审）；若复现成功 → 再补 VAD 组 ID-4/ID-6（跨源）前先核对两 ckpt 训练配置一致性。
- 原文核查（可并行）：对照 BEV-Planner Appendix A "Ego Status Usage Details" 与 UniAD/VAD 仓库 `use_can_bus` 实现，确认"BEV 注入"与"planner 注入"的机制归因可分离（deep-read 遗留 #2 同项）。

## 核查记录

- 2026-11-02（建卡，commit c3ecdd4）：数字自 arXiv HTML v2 实抓。
- 2026-11-05（02 任务书 P1-B3a 批）：表达整理，数字与 quote 未改写。3 条 evidence Grep 逐字命中笔记；ID-2/ID-5 中间档行值逐行核对一致；新增 ckpt source 混杂、"追平"无显著性检验、use_can_bus 两处入口三条未排除因素；注入路径区分与 Table 1 无后处理口径警示保留；falsifier 加分层标注。id/status/stance/review_due/signoff 未动。
