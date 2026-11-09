---
id: claim-opendrivevla-multistage-projector-alignment-lowers-collision
title: "OpenDriveVLA 论文声称：Stage 1 层级对齐仅训 3.1 MB projector 即降碰撞率，四阶段训练把 0.5B 模型 UniAD 口径平均碰撞率 0.37%→0.26%"
type: claim
status: asserted
scope: "OpenDriveVLA-0.5B；四阶段训练（Stage 1 层级视觉-语言对齐 / Stage 2 指令微调 / Stage 2.5 agent-env-ego 交互建模 / Stage 3 轨迹规划）；各阶段均 1 epoch、4×H100、per-GPU batch 1；消融在 nuScenes 开环（UniAD/ST-P3 两口径的平均碰撞率与 L2）；数字为论文自报（AAAI 2026，arXiv:2503.23463v2 TABLE V / TABLE VIII）"
tags: [end-to-end-driving, vla, opendrivevla, multi-stage-training, parameter-efficient-finetuning]
note: library/VLM_VLA/OpenDriveVLA.md#3-实验
paper: "AAAI 2026, OpenDriveVLA: Towards End-to-end Autonomous Driving with Large Vision Language Action Model (arXiv:2503.23463)"
stance: watch
evidence:
  - source: library/VLM_VLA/OpenDriveVLA.md
    locator: "§2.2 / §III-B 冻结策略原句"
    quote: "During this stage, both the visual encoder and LLM remain frozen to preserve pretrained semantics, with only the token-specific projectors being trainable."
    relation: supports
  - source: library/VLM_VLA/OpenDriveVLA.md
    locator: "§3.1 / TABLE VIII（Trainable Params 行）"
    quote: "| Trainable Params (MB) | 3.1 | 496.9 | 496.9 | 552.6 |"
    relation: supports
  - source: library/VLM_VLA/OpenDriveVLA.md
    locator: "§3.4 / TABLE V（仅 Stage 3 行）"
    quote: "|  |  |  | ✓ | 0.37 | 0.13 | 0.70 | 0.36 |"
    relation: supports
  - source: library/VLM_VLA/OpenDriveVLA.md
    locator: "§3.4 / TABLE V（全四阶段行）"
    quote: "| ✓ | ✓ | ✓ | ✓ | 0.26 | 0.09 | 0.68 | 0.35 |"
    relation: supports
  - source: library/VLM_VLA/OpenDriveVLA.md
    locator: "§3.4 / §IV-E 读数原句"
    quote: "As shown in Table V, each additional stage consistently improves performance, with the most notable reductions in collision rate observed after Hierarchical Vision-Language Alignment and Agent-Environment-Ego Interaction Modeling."
    relation: supports
falsifiers:
  - "同配置复现中跳过 Stage 1（仅 Stage 2/2.5/3）不劣化 UniAD 口径平均碰撞率（即 3.1 MB 的对齐阶段无实际贡献）"
  - "复现中 Stage 1 需要解冻 LLM 或更多可训参数才能达到同等对齐效果，『仅 3.1 MB projector 即可』不成立"
  - "TABLE V 的 0.37→0.26 差异在 StdErr/多次种子下方差不显著，或来自数据量差异（各阶段样本数不同：536k/566k/459k/28k）而非阶段机制本身"
review_due: 2026-12-03
related: [claim-opendrivevla-autoregressive-waypoint-planning-nuscenes, claim-bevplanner-egostatus-injection-closes-gap]
signoff: null
---

## 我的理解

论文声称：参数高效的多阶段适配配方——Stage 1 用三个 token 专属 projector（scene/agent/map）做层级视觉-语言对齐，此阶段视觉编码器与 LLM 全冻结、仅 3.1 MB 可训参数；逐阶段消融（TABLE V）显示仅 Stage 3 时 UniAD 口径平均碰撞率 0.37%，+Stage 1 降到 0.32%，再 +Stage 2 到 0.31%、+Stage 2.5（agent 轨迹预测辅助任务）后到 0.26%，全四阶段 L2 0.68/碰撞 0.26 为最优。

限定：
1. 这是 0.5B 模型上的消融，且各阶段训练数据不同（TABLE XI：Stage 1 536k / Stage 2 566k / Stage 2.5 459k / Stage 3 28k），「逐阶段收益」混有数据量因素。
2. Stage 2/2.5 需训 projector+LLM（496.9 MB 可训参数），全流程并非全程 3.1 MB——3.1 MB 只指 Stage 1 对齐阶段。
3. 输入消融（TABLE IV）另显示 ego state 在 nuScenes 开环上作用关键（"consistent with prior findings [53]"），与 BEV-Planner 的 ego-status 结论同向。

## 待验证

- 复现四阶段训练（训练脚本未开源，需按 TABLE VIII 超参自行实现），跑「仅 Stage 3」vs「全四阶段」两组对照。
- 固定各阶段数据量重跑消融，分离「阶段机制」与「数据量」的贡献。
- 检查 Stage 1 对齐质量：agent token 逐实例 caption 匹配的收敛情况（3.1 MB 参数上限下的对齐容量）。

## 若成立 / 不成立意味着什么

成立：驾驶 VLM 的对齐可以极便宜（MB 级 projector）完成，四阶段课程值得作为 VLA 后训练模板。
不成立：收益主要来自数据量或 LLM 解冻，则配方简化为「直接端到端 + 好数据」。

## 核查记录

- 2026-11-05 表达整理（P1-B3b 班）：正文逐阶段序列补上 TABLE V 中 +Stage 2 的中间档 0.31%（原表述把 0.32→0.26 的降幅直接归给 +Stage 2.5，混入了 Stage 2 的贡献），避免把多阶段合计收益归因到单模块。数字未改写（仅补入笔记 TABLE V 已有的 0.31 一档）。
