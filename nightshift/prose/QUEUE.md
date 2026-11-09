# QUEUE — 卡面文字质量整改班（prose 班，2026-11-10 建）

- mode: **active**（active = 正常执行；⛔ = 停机注记——**REPORT 生成前的所有班次直接退出，报告已存在则按提示词退出分支处理**）
- 依据：主人 2026-11-10 00:4x 批示——按其签署定稿的两张 verified 卡的标准修全库卡面文字：**意义不明的、过度防御的、自我窄化的、问题不闭环说不清楚的，全部改过来**；把东西写明白。
- automation: `automation-d6c0d81c-3ef5-4755-88a3-c7777bb62b2f`（2026-11-10 00:4x 建，`*/15`，首火 01:0x）
- 唯一规格：本文件 + nightshift/prose/style-guide.md（P0 产出）。与验证池班互不越界：不碰 nightshift/verify/、REPORT-2026-11-10.md、QUESTIONS.md；本班问题登记 nightshift/prose/QUESTIONS-prose.md。

## 样板（绝对不改，只学）

- `claims/claim-centernetpoints-coco-train2017-same-class-center-collision-rare.md`（verified，signoff 2026-11-09）
- `claims/claim-nuscenes-three-second-ego-motion-distribution.md`（verified，signoff 2026-11-09）

主人标准要点（P0 精读两卡后细化成 style-guide.md 并给判例）：直给、结果先行，主张概述直接给结论数字；实验定义写到能复算（公式/分组/取整口径/分母）；表格给原始计数+分母，不只给百分比；偏差直接说（比论文多 94 对就写多 94 对）；主张→证据→可推翻条件→机制含义→剩余缺口，一句话闭环；**事实归属声明（论文声称/本库实测/复算/理论推导）是 AGENTS.md 引用规则的硬要求，必须保留——不算防御性废话**；要删的是同层免责堆叠、空转 hedge、无信息量的窄化、读了不知道在说什么的句子。

## 批次

（P0 首火盘点填入：按主题分批，每批 8–16 张；三计数 随批记账）

## 班次记录（append-only，时间戳取实际 date）
