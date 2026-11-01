# QUEUE（清仓班工作队列；由调度班次自维护、自扩队）

排序：P0 > P1 > P2 > P3 > P4 > QA（定义见各班提示词第 4 节与 RULES.md）

## 待办

- [ ] [draft|P0|已授权直写 library/ADe2e/BEV-Planner.md] 整理 BEV-Planner（CVPR 2024, arXiv:2312.03031）：① `library/ADe2e/BEV-Planner.pdf` 存在则读本地；② 否则抓 arXiv，必须核对论文标题为 "Is Ego Status All You Need for Open-Loop End-to-End Autonomous Driving?" 才可使用，对不上就停手写 QUESTIONS.md。按库内约定写 L1（三行头部：出处/开源/关键词；编号章节：概述→方法→实验→核心结论），数字逐字抄原文并标章节 locator；配图目录不存在就文末留 TODO。另写一条建议到 `nightshift/suggestions/library-README-ADe2e.md`（library/README.md 缺 ADe2e 小节，给出建议追加的表格行）。⭐ 主人当前研究重点，最高优先级
- [ ] [claim|P0] library/ADe2e/BEV-Planner.md → 提炼 2–5 张 asserted claim 卡（依赖上一条完成，笔记不存在则跳过）。围绕 ego status / 开环评测类核心可证伪主张；每卡 scope + falsifiers 齐全，quote 从笔记逐字复制并 Grep 验证。⭐ 主人当前研究重点
- [ ] [verify|P3] claims/claim-qwt-r2-gate-nonregression.md → 对照 QwT 原文核对「R² 门控保证不劣于原 PTQ」是否只在校准集意义下成立；报告写 `nightshift/verify/claim-qwt-r2-gate-nonregression.md`；注意 TODO 截止 2026-11-15；只写证据报告，不碰 status/signoff
- [ ] [audit|P3] claims/claim-echofusion-3d-ap-below-lidar.md 与 claims/claim-echofusion-note-table-mismatch.md 对照笔记逐条复核 evidence（quote 逐字、locator、数字）
- [ ] [cross|P4] 4D 雷达四篇（RadarOcc / R4Det / SGDet3D / HGSFusion）横向对比 → `nightshift/cross/4d-radar.md`，只记录互相支持/矛盾/口径差异（TODO 候选池项）

## 进行中

（无）

## 完成

（由各班从上面移入，注明产出路径与班次）

## 扩队提示

第一班请立即按提示词第 4 节 R2–R5 扩队：P1 待写 L1（TODO.md「待读/待写 L1」约 20 篇）、P2 全库还没有 claim 的笔记、P3 全部现有 claim 的审计任务。扩队工作可以交给一个子代理代做。
