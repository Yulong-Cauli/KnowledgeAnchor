# QUEUE（清仓班工作队列；由调度班次自维护、自扩队）

排序：P0 > P1 > P2 > P3 > P4 > QA（定义见各班提示词第 4 节与 RULES.md）

## 进行中

- [fire-now] [draft|P0|已授权直写 library/ADe2e/BEV-Planner.md] 整理 BEV-Planner（CVPR 2024, arXiv:2312.03031）：① `library/ADe2e/BEV-Planner.pdf` 存在则读本地；② 否则抓 arXiv，必须核对论文标题为 "Is Ego Status All You Need for Open-Loop End-to-End Autonomous Driving?" 才可使用，对不上就停手写 QUESTIONS.md。按库内约定写 L1（三行头部：出处/开源/关键词；编号章节：概述→方法→实验→核心结论），数字逐字抄原文并标章节 locator；配图目录不存在就文末留 TODO。另写建议到 `nightshift/suggestions/library-README-ADe2e.md`。⭐ 主人当前研究重点
- [fire-now|R2新增] [draft|P1] AutoVLA（端到端自动驾驶 VLA）→ `nightshift/drafts/AutoVLA.md`，检索 arXiv 后先核对标题再使用，有歧义就停手
- [fire-now|R2新增] [draft|P1] BEVDet → `nightshift/drafts/BEVDet.md`，按库内约定写 L1 草稿
- [fire-now] [audit|P3] claims/claim-echofusion-3d-ap-below-lidar.md 与 claims/claim-echofusion-note-table-mismatch.md 对照笔记逐条复核 evidence

## 待办

- [claim|P0] library/ADe2e/BEV-Planner.md → 提炼 2–5 张 asserted claim 卡（依赖上面的 draft 完成，笔记不存在则跳过）。围绕 ego status / 开环评测类核心可证伪主张；每卡 scope + falsifiers 齐全，quote 从笔记逐字复制并 Grep 验证。⭐ 主人当前研究重点
- [draft|P1] TODO.md「待读 / 待写 L1」其余论文（PillarNet、MIT-BEVFusion、RCBEVDet++、Deep Compression、LSQ、MobileNet/V2/V3、MobileOne、ShuffleNet、LLaVA、Qwen3-VL、OpenVLA、OpenDriveVLA、OneVL、DrivePI、Alpamago、BRCEQ、COTR、MSMDFusion、QLoRA）→ 由各班按 R2 逐篇展开为任务，产出 `nightshift/drafts/<论文名>.md`

## 完成

- [fire-now|00:48✅] [verify|P3] claim-qwt-r2-gate-nonregression → `nightshift/verify/claim-qwt-r2-gate-nonregression.md`。结论：**部分支持**——R²≤0 分支严格等价原 PTQ（论文+代码双重确认，无条件保证）；R² 仅由 512 张校准图计算，R²>0 分支「不劣于」只在校准集意义下有定义；补材 Table 4 自带逐数据集测试退化实例（LLaMA3 BoolQ −0.03 / HellaSwag −0.51）。卡片未动，报告含 6 条修改建议待主人定夺
- [fire-now|00:53✅] [cross|P4] 4D 雷达四篇横向对比 → `nightshift/cross/4d-radar.md`。33 处引文程序逐字验证；要点：RadarOcc（4DRT 俯仰维是管线基础）与 HGSFusion（称俯仰分辨率不足引入噪声）表态相反；三篇在 VoD 的指标族互不可比但都声称 SOTA；HGSFusion 概述头条 88.28% 实为 Car 类 RoI AP 而非 mAP
- [fire-now|00:55✅] [draft|P1] UniAD → `nightshift/drafts/UniAD.md`（3.7M token，46 条引句 + 13 张表逐格校验）。自查发现原文不自洽：§3.4 正文 −15.8%/−11.2% 与 Table 8 行内数字（−9.0%/−13.2%）对不上，已在笔记 ⚠ 标注；Table 2 仅逐字摘录 5/13 行，TODO 注明

## 扩队提示

各班按提示词第 4 节 R2–R5 持续扩队：P1 待写 L1 约 20 篇、P2 全库还没有 claim 的笔记（每篇一条 [claim]）、P3 全部现有 claim 的审计。扩队工作可以交给一个子代理代做。
