# QUEUE — 卡面文字质量整改班（prose 班，2026-11-10 建）

- mode: **active**（active = 正常执行；⛔ = 停机注记——**REPORT 生成前的所有班次直接退出，报告已存在则按提示词退出分支处理**）
- 依据：主人 2026-11-10 00:4x 批示——按其签署定稿的两张 verified 卡的标准修全库卡面文字：**意义不明的、过度防御的、自我窄化的、问题不闭环说不清楚的，全部改过来**；把东西写明白。
- automation: `automation-d6c0d81c-3ef5-4755-88a3-c7777bb62b2f`（2026-11-10 00:4x 建，`*/15`，首火 01:0x）
- 唯一规格：本文件 + nightshift/prose/style-guide.md（P0 产出）。与验证池班互不越界：不碰 nightshift/verify/、REPORT-2026-11-10.md、QUESTIONS.md；本班问题登记 nightshift/prose/QUESTIONS-prose.md。

## 样板（绝对不改，只学）

- `claims/claim-centernetpoints-coco-train2017-same-class-center-collision-rare.md`（verified，signoff 2026-11-09）
- `claims/claim-nuscenes-three-second-ego-motion-distribution.md`（verified，signoff 2026-11-09）

主人标准要点（P0 精读两卡后细化成 style-guide.md 并给判例）：直给、结果先行，主张概述直接给结论数字；实验定义写到能复算（公式/分组/取整口径/分母）；表格给原始计数+分母，不只给百分比；偏差直接说（比论文多 94 对就写多 94 对）；主张→证据→可推翻条件→机制含义→剩余缺口，一句话闭环；**事实归属声明（论文声称/本库实测/复算/理论推导）是 AGENTS.md 引用规则的硬要求，必须保留——不算防御性废话**；要删的是同层免责堆叠、空转 hedge、无信息量的窄化、读了不知道在说什么的句子。

## 批次（P0 定稿 2026-11-10 01:0x，机器对账 189/189 全覆盖；派发=2 并发滚动）

| 批 | 主题 | 卡数 | 状态 |
| --- | --- | ---: | --- |
| H1-历史标记批 | 节名+title+falsifier | 6 | 完成 6/0/0（3d0ad93） |
| Q1-量化经典A | title+scope+闭环 | 10 | 完成 10/0/登记3（3d0ad93） |
| Q2-量化经典B | scope剥离+闭环+falsifier指针化 | 14 | 完成 14/0/登记R4-R5 |
| Q3-量化现代 | 节名映射为主+1夸大注修实数 | 16 | 完成 15/1/0 |
| C1-经典检测A | scope瘦身+过时下一步指向verified卡 | 11 | 完成 11/0/登记R6 |
| C2-经典检测B | scope瘦身+节名 | 8 | 完成 8/0/登记R7 |
| B1-BEV检测A | 夸饰落数字+节名 | 10 | 完成 10/0/0 |
| B2-BEV检测B | 班次语言清除+探针指针闭环 | 8 | 完成 8/0/登记R8 |
| BB-骨干网络 | title压缩+台账行清除 | 9 | 完成 7/2/登记R9 |
| F1-融合A | 节名+scope瘦身+归因引申改标 | 15 | 完成 14/1/0（cyclist 整卡KEEP） |
| F2-融合B | title补归属+待验证挂判据+无据scope收敛 | 10 | 完成 10/0/登记R10 |
| F3-雷达融合C | scope去重指针化+删元话语 | 10 | 完成 10/0/0 |
| F4-雷达融合D | title归属校准+falsifier对准 | 9 | 完成 9/0/登记R11-R12 |
| O1-占据 | 注记压缩+同名消歧+定案织入 | 16 | 完成 16/0/登记R13等3项 |
| V1-VLA组一 | 元话语清除+待验证闭环 | 10 | 完成 10/0/登记R14 |
| V2-VLA组二 | title瘦身+scope三要素+去祈使 | 10 | 完成 10/0/登记3 |
| P1-规划评测 | 拆P1a/P1b双代理 | 17 | 完成 17/0/登记R15-R16（P1 收官） |


## 班次记录（append-only，时间戳取实际 date）
