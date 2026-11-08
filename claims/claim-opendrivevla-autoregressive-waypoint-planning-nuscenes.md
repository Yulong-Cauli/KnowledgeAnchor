---
id: claim-opendrivevla-autoregressive-waypoint-planning-nuscenes
title: "OpenDriveVLA 论文声称：轨迹离散 token 自回归生成，nuScenes 开环规划 ST-P3/UniAD 两口径达 3B/7B 平均 L2 0.33m/0.66m，开源模型中 best-in-class"
type: claim
status: asserted
scope: "nuScenes val 开环规划（ST-P3 与 UniAD 两种评测口径；L2@1/2/3s + 平均碰撞率）；OpenDriveVLA-0.5B/3B/7B（Qwen2.5-Instruct 底座，BEVFormer+TrackQFormer+MapQFormer 视觉侧）；轨迹 3 秒 6 waypoints@0.5s 离散 token 自回归生成；数字为论文自报（AAAI 2026，arXiv:2503.23463v2 TABLE I）"
tags: [end-to-end-driving, vla, opendrivevla, nuscenes, open-loop, autoregressive]
note: library/VLM_VLA/OpenDriveVLA.md#3-实验
paper: "AAAI 2026, OpenDriveVLA: Towards End-to-end Autonomous Driving with Large Vision Language Action Model (arXiv:2503.23463)"
stance: watch
evidence:
  - source: library/VLM_VLA/OpenDriveVLA.md
    locator: "§2.5 / §III-E 原句（轨迹 token 化）"
    quote: "The waypoints are tokenized into a sequence of discrete textual tokens for autoregressive generation in the LLM"
    relation: supports
  - source: library/VLM_VLA/OpenDriveVLA.md
    locator: "§3.2 / TABLE I（0.5B 行）"
    quote: "| OpenDriveVLA-0.5B (Ours) | 0.15 | 0.32 | 0.57 | 0.35 | 0.01 | 0.06 | 0.20 | 0.09 | 0.21 | 0.60 | 1.22 | 0.68 | 0.00 | 0.15 | 0.63 | 0.26 | Qwen2.5-0.5B | Visual |"
    relation: supports
  - source: library/VLM_VLA/OpenDriveVLA.md
    locator: "§3.2 / TABLE I（7B 行）"
    quote: "| OpenDriveVLA-7B (Ours) | 0.15 | 0.31 | 0.55 | 0.33 | 0.01 | 0.08 | 0.21 | 0.10 | 0.20 | 0.58 | 1.21 | 0.66 | 0.00 | 0.22 | 0.55 | 0.25 | Qwen2.5-7B | Visual |"
    relation: supports
  - source: library/VLM_VLA/OpenDriveVLA.md
    locator: "§3.2 / §IV-D 读数原句"
    quote: "both 3B and 7B version models achieve an average L2 error of 0.33m under ST-P3 metrics, outperforming prior autoregressive language models [38, 21]. On the UniAD metrics, OpenDriveVLA-7B also achieves great performance with an average L2 error of 0.66m. Notably, despite significantly fewer parameters, the 0.5B version still outperforms prior models obviously."
    relation: supports
  - source: https://arxiv.org/html/2503.23463v2
    locator: "TABLE I（HTML v2，2026-11-03 抓取，线性化表格文本）"
    quote: "OpenDriveVLA-3B (Ours) 0.14 0.30 0.55 0.33 0.02 0.07 0.22 0.10 0.19 0.58 1.24 0.67 0.02 0.18 0.70 0.30 Qwen2.5-3B Visual"
    relation: supports
falsifiers:
  - "同 nuScenes val、同 ST-P3/UniAD 口径复现中，OpenDriveVLA-3B/7B 平均 L2 显著高于 0.33m/0.66m 或平均碰撞率高于表中自报（UniAD 口径 3B/7B 为 0.30%/0.25%；ST-P3 口径 3B/7B 均为 0.10%）"
  - "按 BEV-Planner 的 CCR 等更严口径重评，领先消失或反转（论文自述仅开环评测、且 nuScenes 开环可能高估稳健性）"
  - "发现 TABLE I 中对比行的口径不可比（如部分基线无 ego status / 输入模态不同），best-in-class 声称不成立"
review_due: 2026-12-03
related: [claim-opendrivevla-multistage-projector-alignment-lowers-collision, claim-drivepi-05b-nuscenes-qa-60p7-snapshot, claim-bevplanner-egomlp-parity-l2-collision, claim-nuscenes-three-second-low-lateral-displacement-majority, claim-bevplanner-unidad-postprocessing-raises-ccr]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：OpenDriveVLA 把 ego 未来轨迹（3 秒、6 个 waypoints、0.5s 间隔）token 化为离散文本 token，用 LLM 自回归解码，在 nuScenes 开环规划上 ST-P3 口径 3B/7B 平均 L2 0.33m、UniAD 口径 7B 平均 L2 0.66m、0.5B 平均碰撞率低至 0.09%（ST-P3）/0.26%（UniAD），自称 "state-of-the-art ... across both settings"（TABLE I caption 另限定为 "best-in-class results among open-source models"）。

三个必须记住的限定：
1. 仅开环：Abstract 的 SOTA 只覆盖 nuScenes 开环规划与驾驶 VQA；论文 §VIII-D2/D3 自述开环“may lead to overly optimistic conclusions”、闭环是 future work。本库 BEV-Planner 系列 claim（status: asserted / stance: watch，论文声称、尚未独立验证）讨论 ego status 与评测口径影响；OpenDriveVLA 自己的消融（TABLE IV）也报告 ego state 作用关键。另见 [nuScenes 六步低横向位移卡](claim-nuscenes-three-second-low-lateral-displacement-majority.md)（asserted / watch，普查观察尚未独立验证）：它只描述数据属性，不证明指标被直行分布主导，也不直接支持 OpenDriveVLA 性能结论。
2. 规模不单调：Nu-X 上 0.5B（CIDEr 32.3）优于 7B（26.2），TABLE I 内三档互有胜负，勿写「越大越好」。
3. 推理延迟 1.36–1.85 s/样本（TABLE IX，A100 BF16），论文自认是高速场景部署瓶颈（自回归解码的代价）。

## 待验证

- 用官方仓库（Apache-2.0，0.5B checkpoint 已发布；训练脚本截至 2026-11-02 未发布）在 nuScenes val 复现 TABLE I 三行。
- 用 UniAD 官方评测实现重算碰撞率（0.1m 网格等口径），对照 0.26/0.30/0.25 三格。
- 若可复现：换 CCR 口径重评（对齐 claim-bevplanner-unidad-postprocessing-raises-ccr 的教训）。

## 若成立 / 不成立意味着什么

成立：自回归 token 化是小参数量（0.5B 级）开环规划的可行路线，可与 VAD 类 VA 模型同台比较。
不成立：领先依赖对比行口径差异，则驾驶 VLA 选型需回到统一实现下的重测。

## 核查记录

- 2026-11-08：原 BEV-Planner imbalance 卡由 nuScenes 数据集性质卡替代，迁移 related；正文明确数据分布与模型/指标因果不等同。status/stance/signoff 未改。

- 2026-11-05 表达整理（P1-B3b 班）：falsifier 第 1 条碰撞率锚点按 TABLE I 实际行更正口径错位（原「0.10%/0.25% UniAD 口径」：UniAD 口径 3B/7B 实为 0.30%/0.25%，0.10% 是 ST-P3 口径值）；正文「BEV-Planner 系列卡已证明」降格为 asserted 口径（引用规则：尚未独立验证不得写成事实）。
