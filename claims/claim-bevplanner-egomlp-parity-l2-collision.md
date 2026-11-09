---
id: claim-bevplanner-egomlp-parity-l2-collision
title: "BEV-Planner 论文声称：无感知的 Ego-MLP 仅靠 ego status 在 nuScenes 开环 L2/碰撞率上与 SOTA 持平"
type: claim
status: asserted
scope: "nuScenes val（有效样本 5119/6019，Appendix B）；开环规划评测，论文统一实现（Union Implementation，碰撞率默认 0.1m 网格）；Ego-MLP 仅输入 ego velocity / acceleration / yaw angle / driving command，无任何相机/LiDAR 感知；比较基线为同表 UniAD（ID-1/2/3）与 VAD-Base（ID-4/5/6）各行；Table 1 自报数字（复现 AD-MLP 时修复 issue #4、去除历史轨迹 GT 防标签泄露后的配置）"
tags: [end-to-end-driving, open-loop, ego-status, nuscenes, bev-planner, benchmark]
note: library/ADe2e/BEV-Planner.md#33-主结果
paper: "CVPR 2024, Is Ego Status All You Need for Open-Loop End-to-End Autonomous Driving? (BEV-Planner, arXiv:2312.03031)"
stance: watch
evidence:
  - source: library/ADe2e/BEV-Planner.md
    locator: "§4 / Table 1 caption"
    quote: "Without the perception module, Ego-MLP (ID-8), utilizing solely ego velocity, acceleration, yaw angle, and driving command, achieves performance on par with current state-of-the-art models on previous L2 distance and collision rate metrics."
    relation: supports
  - source: library/ADe2e/BEV-Planner.md
    locator: "§4 / Table 1 ID-8 行"
    quote: "| 8 | Ego-MLP | - | ✓ | 0.15 | 0.32 | 0.59 | 0.35 | 0.00 | 0.27 | 0.85 | 0.37 | 0.27 | 2.52 | 6.60 | 2.93 | （原表为空） |"
    relation: supports
falsifiers:
  - "同范围复现（主张侧）：在 nuScenes val 同口径（统一指标实现、0.1m 网格碰撞率）复现中，Ego-MLP 的 L2-Avg 或 Colli-Avg 显著差于 UniAD/VAD 同表配置（例如高出 2 倍以上——预设判据，无既有统计锚点），而非持平"
  - "原文核查与配置核查：发现 Ego-MLP 的持平依赖历史轨迹 GT 等标签泄露（论文声称已通过修复 AD-MLP issue #4 去除），或其输入实际包含 ego status 之外的未来信息"
review_due: 2026-12-02
related: [claim-bevplanner-egostatus-injection-closes-gap, claim-bevplanner-unidad-postprocessing-raises-ccr, claim-bevplanner-ego-velocity-dominates-planning, claim-nuscenes-three-second-ego-motion-distribution]
signoff: null
---

## 主张

论文声称：在 nuScenes 开环评测的 L2 距离与碰撞率两个旧指标口径下，完全不用感知模块、只吃 ego status 的 Ego-MLP（Table 1 ID-8：L2-Avg 0.35 m / Colli-Avg 0.37%）与 UniAD、VAD 等 SOTA 方法持平。该 Ego-MLP 是论文作者复现 AD-MLP 时修复其 issue #4、去掉历史轨迹 GT 以防标签泄露之后的版本，对应笔记 §1 "Yes 的一面"。nuScenes 数据分布普查卡（claim-nuscenes-three-second-ego-motion-distribution）与本卡互不替代：本卡证“模型持平”现象，普查卡证“数据分布”背景。

## 证据与边界

- 两条 evidence 支撑：Table 1 caption 的"on par"概括句 + ID-8 行内数字。"on par"是论文对全表的定性判断，无统计检验、无显著性报告（deep-read §1.1 评 ★★，报告层评估）。
- quote 2 末尾"（原表为空）"是笔记自注（原表 ckpt. source 单元格为空），不是论文原文；round2 QA 已判"逐字引用成立，不判错"。
- 同表基线行（UniAD ID-1 1.03/0.77/1.93、ID-3 0.46/0.37/1.59；VAD-Base ID-4 1.25/1.09/3.82、ID-6 0.37/0.33/2.47；GoStright ID-7 0.83/1.08/8.62）在笔记 §3.3，已逐行核对一致。
- 证据边界：全部是论文报告数字，本库无独立复现；笔记数字来自 arXiv HTML v2 实抓（2026-11-02），代码开源（github.com/NVlabs/BEV-Planner，无 LICENSE 文件，GitHub API 2026-11-03 核实在案）。读到原文 ≠ 效果复现，由 falsifier 分别检验。

## 解释与未排除因素

- 行为观察（Table 1 直接报告）：无感知模型在旧指标上与感知 SOTA 同档。
- 论文的解释框架（作者立场，非本库复核）：直行场景主导 + ego status 注入让模型无需感知即可拿到低误差——即“持平”反映指标/数据的区分度问题，而非“感知无用”（论文自己用 CCR 与 Appendix E 反例区分了这两件事）。注入位置见 claim-bevplanner-egostatus-injection-closes-gap。数据背景见 [claim-nuscenes-three-second-ego-motion-distribution](claim-nuscenes-three-second-ego-motion-distribution.md)（asserted / adopt，本库普查）；该卡描述约 3 秒轨迹窗口的横向位移与速度分布，不证明论文成因解释。
- 未排除因素：① "持平"无显著性检验——ID-8 的 0.35/0.37 与 ID-3 的 0.46/0.37、ID-6 的 0.37/0.33 之间差距无方差报告，"持平"的判读区间未定义；② Ego-MLP 防泄露配置只有论文自述，未独立核对；③ "持平"只覆盖旧指标——按 CCR，Ego-MLP（2.93）差于 UniAD（1.93）/VAD（2.47），结论在新指标下已不同。

## 范围与迁移限制

- 两个限定：① "持平"只覆盖 L2 与碰撞率两个旧指标，不能外推为"Ego-MLP 整体与 SOTA 相当"；② 该对比成立的前提是同一评测实现与网格分辨率（0.1m）——若沿用 AD-MLP 的 0.5m 粗网格，论文认为碰撞率本身有假碰撞问题（笔记 §3.2）。
- 结论绑定 nuScenes val + 论文统一实现口径 + Table 1 的具体方法行；不外推到 CCR 或其他新指标口径、闭环/实车、其他数据集。
- 依存关系：若同口径复现中 Ego-MLP 显著落后，说明 Table 1 对比或其解释需重审；这不会直接推翻 nuScenes 数据分布普查卡的独立计算结果。

## 研究启发

- 引用任何只报 L2/碰撞率的开环对比前，先核对：双方 ego status 注入位置、碰撞率网格与实现、是否带后处理——这三项任一不同，数字不可比（deep-read §2.3 第 1/2/6 条的通用化，整理者整理）。
- "加一个无信息基线"（仅 ego status 的 MLP）是检验指标区分度的廉价手段，可迁移到其他开环 benchmark；但"其他 benchmark 上也持平"属于跨条件迁移，结论不可预支，需单独检查。

## 下一步

- 当前 stance：watch。原卡未记录立场依据，按未记录处理。
- 优先执行的最小检查——同范围复现（对照侧）：用官方仓库复现 Ego-MLP（ID-8）配置，与同表 UniAD（ID-1/2/3）、VAD-Base（ID-4/5/6）在同一指标实现下重算 L2/碰撞率。固定：数据 split、指标实现、0.1m 网格；只改"有无感知输入"。观察 L2-Avg/Colli-Avg 差距：若 Ego-MLP 落后 2 倍以上（预设判据，见 falsifier）→ 按 falsifier 登记并启动 related 卡重审；若复现持平 → 现象成立，但这只是行为复现，不构成对"为何持平"任何解释的证明。
- 原文核查（可并行、零训练成本）：核对 Ego-MLP 训练/评测配置确实不含历史轨迹 GT 及其他未来信息（防泄露声明），并确认碰撞率网格分辨率与论文默认口径一致——两项任一不实都直接动摇"持平"证据的可解释性。

## 核查记录

- 2026-11-08：旧 imbalance 卡由 nuScenes 数据集性质卡替代，迁移 related 与当前正文引用；数据属性与模型捷径因果明确分离。以下旧 id 仅作为历史核查记录保留。status/stance/signoff 未改。

- 2026-11-02（建卡，commit c3ecdd4）：数字自 arXiv HTML v2 实抓。
- 2026-11-05（02 任务书 P1-B3a 批）：表达整理，数字与 quote 未改写。2 条 evidence Grep 逐字命中笔记；同表基线行逐行核对一致；正文按样板结构重排，"持平仅限旧指标 + 统一实现前提"两个限定从理解段提升为范围节主体；新增"on par 无显著性检验"与防泄露配置未核对两条未排除因素；falsifier 加分层标注并标记预设判据；枢纽依存关系显式保留。id/status/stance/review_due/signoff 未动。
- 2026-11-05（P3 深核·批二独立复审）：related 补齐 claim-bevplanner-ego-velocity-dominates-planning 与 claim-bevplanner-nuscenes-straight-driving-imbalance（四张机制卡 related 均单向指向本卡，按 related 双向约定对齐正文「被四卡 related」表述，枢纽依存关系不变）。2 条 evidence quote 与同表基线行独立复核命中。id/status/stance/review_due/signoff 未动。
