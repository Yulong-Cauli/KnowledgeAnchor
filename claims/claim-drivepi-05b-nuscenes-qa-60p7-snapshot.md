---
id: claim-drivepi-05b-nuscenes-qa-60p7-snapshot
title: "DrivePI 论文声称（CVPR 2026）：0.5B 统一模型 nuScenes-QA 60.7% 超 OpenDriveVLA-7B 2.5 个点；OpenOcc RayIoU 49.3；nuScenes 规划（有 ego）碰撞率 0.11%"
type: claim
status: asserted
scope: "DrivePI 0.5B 统一模型（Qwen2.5-0.5B 底座，UniLION 视觉编码器，LiDAR+多视角相机输入；除注明外均为此统一权重）；基准：nuScenes-QA val（文本）、OpenOcc 验证集（3D 占据+流）、nuScenes val 开环规划（表 2 有 ego status 行）；对比行 OpenDriveVLA-7B 为 ego status ✓ 行；数字为论文自报（CVPR 2026，arXiv:2512.12799v1）"
tags: [end-to-end-driving, mllm, drivepi, nuscenes-qa, benchmark-snapshot]
note: library/VLM_VLA/DrivePI.md#3-实验
paper: "CVPR 2026, DrivePI: Spatial-aware 4D MLLM for Unified Autonomous Driving Understanding, Perception, Prediction and Planning (arXiv:2512.12799)"
stance: watch
evidence:
  - source: library/VLM_VLA/DrivePI.md
    locator: "§3.2 / 表 3（DrivePI 行，nuScenes-QA）"
    quote: "| DrivePI (Ours) | 85.3 | 22.4 | 57.5 | 59.1 | 68.3 | 60.7 |"
    relation: supports
  - source: library/VLM_VLA/DrivePI.md
    locator: "§3.2 / 表 1（DrivePI 行，OpenOcc）"
    quote: "| DrivePI (Ours) | ✓ | 49.3 | 49.3 | 0.509 | 45.0 | 50.0 | 52.9 |"
    relation: supports
  - source: library/VLM_VLA/DrivePI.md
    locator: "§3.2 / 表 2（DrivePI 有 ego 行，nuScenes 规划）"
    quote: "| DrivePI (Ours) | ✓ | ✓ | 0.19 | 0.36 | 0.64 | 0.40 | 0.00 | 0.05 | 0.28 | 0.11 |"
    relation: supports
  - source: library/VLM_VLA/DrivePI.md
    locator: "§3.2 / 表 2 caption（ego status 默认设定）"
    quote: "Note that our unified model DrivePI does not incorporate ego status during training by default to avoid potential shortcut learning."
    relation: supports
  - source: https://arxiv.org/abs/2512.12799
    locator: "Abstract（abs 页，2026-11-03 抓取）"
    quote: "outperforms OpenDriveVLA-7B by 2.5% mean accuracy on nuScenes-QA and reduces collision rate by 70% over ORION (from 0.37% to 0.11%) on nuScenes"
    relation: supports
falsifiers:
  - "同范围复现（主张侧，nuScenes-QA）：同 nuScenes-QA val 协议复现中 DrivePI-0.5B 总准确率低于 58.2%（即不超过 OpenDriveVLA-7B），『+2.5%』不成立"
  - "同范围复现（主张侧，OpenOcc）：OpenOcc 复现 RayIoU 显著低于 49.3，或发现与 FB-Occ 等基线的输入模态不对等（DrivePI 额外用 LiDAR）导致领先不可比——模态不对等属口径问题，先逐基线核对输入构成再定性，不直接判伪"
  - "同范围复现（对照侧，设定统一）：ego status 设定统一后（DrivePI 有 ego vs OpenDriveVLA 有 ego 已同设；或两者均无 ego：0.38% vs 对应行）对比反转"
review_due: 2026-12-03
related: [claim-drivepi-unified-text-vision-joint-gains, claim-opendrivevla-autoregressive-waypoint-planning-nuscenes, claim-bevplanner-egostatus-injection-closes-gap]
signoff: null
---

## 我的理解

论文声称（CVPR 2026）：仅 0.5B 的统一 4D MLLM 在三个基准上同时拿到达标线以上的表现——nuScenes-QA 60.7%（超 OpenDriveVLA-7B 的 58.2% 共 2.5 个点）、OpenOcc RayIoU 49.3%（超 FB-OCC 10.3）、nuScenes 开环规划（有 ego status）L2 avg 0.40 m / 碰撞率 0.11%（较 ORION 0.37% 降 70%）。

两个必须记住的口径差异（读表注意，笔记已注）：
1. DrivePI 规划默认**不用** ego status 训练（caption 称避免 shortcut learning）：无 ego 行碰撞率 0.38%，有 ego 行才 0.11%；而对比行 OpenDriveVLA-7B / OmniDrive / ORION 全部是有 ego status 配置——0.11% 对 0.25%（OpenDriveVLA-7B）的跨行比较携带设定差。
2. 感知侧 DrivePI 输入含 LiDAR（+多视角相机，论文自述的差异化特征第一条）；表 1 各占据基线的输入模态构成笔记未逐行记载，「10.3 RayIoU 领先含模态红利」是本卡整理者推断、尚未验证，需逐基线核对输入后才能定性。且表 4 的 Occ3D 46.0 RayIoU 来自「仅 3D 占据单任务训练」的 DrivePI*，不能与统一模型混读。
3. 口径迁移提醒（整理者注）：本库驾驶侧 nuScenes 相关分数分三族口径——nuScenes 开环 L2/碰撞率（本卡表 2 与 bevplanner / OpenDriveVLA 系卡）、NAVSIM PDMS（nuPlan 衍生，OneVL 卡）、nuScenes-QA 文本准确率（本卡表 3）——三族不可互换；related 挂链是条件差异与共享待检验问题的提醒，不是互相支持（相关卡均为 asserted）。

## 待验证

当前 stance：watch；原卡未记录立场依据，按未记录处理。

- 同范围复现（主张侧）：官方仓库（github.com/happinesslz/DrivePI，无 license）代码已发布；等 checkpoints/数据集（README 承诺「within a week」，截至 2026-11-02 未发布）后复测表 1/2/3。
- 同范围复现（对照侧）：用 OpenDriveVLA 官方 0.5B/7B checkpoint 在 DrivePI 的 nuScenes-QA 评测脚本下重测，统一实现后再比。
- 同范围复现（对照侧，设定统一）：做「无 ego」同设对比：DrivePI 0.38% vs OpenDriveVLA-7B 无 ego 行（本笔记表 2 无此行，需自行评测）。

## 若成立 / 不成立意味着什么

成立：0.5B 统一模型可在理解/感知/规划三线同时压过 7B 级 VLA，驾驶 MLLM 的参数门槛大幅下降。
不成立：领先是 ego-status 设定差或 LiDAR 模态红利，则对比回到同模态同设定重测。

## 核查记录

- 2026-11-05（02 任务书整理班 P1-B3c）：表达整理，数字未改写。5 条 evidence 全部逐字命中来源（4 条 library 笔记 Grep 命中；1 条 arXiv abs 页 Abstract 句于 2026-11-05 原文复抓逐字命中）；falsifiers 补分层标注；正文「多数占据基线为纯视觉」改为整理者推断标注（笔记未逐行记载各基线输入模态）；待验证第 3 条 locator「TABLE I」更正为「表 2」（nuScenes 规划表）；正文补三族口径迁移提醒（开环 L2/碰撞、NAVSIM PDMS、nuScenes-QA）；scope 末补「尚未独立验证」；待验证补立场记录与检查分类。id/status/stance/review_due/signoff 未动。
