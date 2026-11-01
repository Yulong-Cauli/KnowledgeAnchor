# QUEUE（清仓班工作队列；由调度班次自维护、自扩队）

排序：P0 > P1 > P2 > P3 > P4 > QA（定义见各班提示词第 4 节与 RULES.md）

## 进行中

- [fire-now] [draft|P1] Qwen3-VL（可能无独立 arXiv 论文，按提示词分流：正式论文 / 官方文档短版 / 停手）→ `nightshift/drafts/Qwen3VL.md`
- [fire-now] [draft|P1] OpenVLA（CoRL 2024, "OpenVLA: An Open-Source Vision-Language-Action Model"）→ `nightshift/drafts/OpenVLA.md`

## 待办

- [draft|P1] TODO.md「待读 / 待写 L1」其余论文（OpenDriveVLA、OneVL、DrivePI、Alpamago、BRCEQ、COTR、MSMDFusion、QLoRA）→ 由各班按 R2 逐篇展开为任务，产出 `nightshift/drafts/<论文名>.md`

## 完成

- [fire-now|00:48✅] [verify|P3] claim-qwt-r2-gate-nonregression → `nightshift/verify/claim-qwt-r2-gate-nonregression.md`。结论：**部分支持**——R²≤0 分支严格等价原 PTQ（论文+代码双重确认，无条件保证）；R² 仅由 512 张校准图计算，R²>0 分支「不劣于」只在校准集意义下有定义；补材 Table 4 自带逐数据集测试退化实例（LLaMA3 BoolQ −0.03 / HellaSwag −0.51）。卡片未动，报告含 6 条修改建议待主人定夺
- [fire-now|00:53✅] [cross|P4] 4D 雷达四篇横向对比 → `nightshift/cross/4d-radar.md`。33 处引文程序逐字验证；要点：RadarOcc（4DRT 俯仰维是管线基础）与 HGSFusion（称俯仰分辨率不足引入噪声）表态相反；三篇在 VoD 的指标族互不可比但都声称 SOTA；HGSFusion 概述头条 88.28% 实为 Car 类 RoI AP 而非 mAP
- [fire-now|00:55✅] [draft|P1] UniAD → `nightshift/drafts/UniAD.md`（3.7M token，46 条引句 + 13 张表逐格校验）。自查发现原文不自洽：§3.4 正文 −15.8%/−11.2% 与 Table 8 行内数字（−9.0%/−13.2%）对不上，已在笔记 ⚠ 标注；Table 2 仅逐字摘录 5/13 行，TODO 注明
- [fire-now|01:01✅] [draft|P0] BEV-Planner → **直写 `library/ADe2e/BEV-Planner.md`**（172 行，标题核对一致，引文与表格逐字核验；原文拼写照抄加注）+ `nightshift/suggestions/library-README-ADe2e.md`。遗留：GitHub README 抓取超时（开源状态仅以 arXiv 摘要为据）；输入分辨率 256×704 来自 HTML alttext，建议主人对 PDF 复核。后续 [claim|P0] 已派发
- [fire-now|01:07✅] [draft|P1] BEVDet → `nightshift/drafts/BEVDet.md`（235 行，1.35M token，Table 1–7 全部行 + 13 条引文脚本核验）。发现原文自相矛盾：§4.3 称配置 C "peaks at epoch 15" vs Table 4 C 行 "0.262 (e11)"，两处照抄已标注；assets 文件名与论文编号错位（Table2.png 实为论文 Table 4），回填配图时注意
- [fire-now|01:13✅] [claim|P0] BEV-Planner → **5 张 asserted 卡**（0.33M token，review_due 2026-12-02，related 互链）：claim-bevplanner-egomlp-parity-l2-collision / egostatus-injection-closes-gap / ego-velocity-dominates-planning / nuscenes-straight-driving-imbalance / unidad-postprocessing-raises-ccr。16 条 quote 全部逐字验证，validate OK(17)，index 已重建。遗留（留 QA 轮）：note 锚点风格统一、数字回源逐格复核
- [fire-now|01:21✅] [audit|P3] EchoFusion 两卡 → 小修 2 张卡（Table 7 行名对齐论文原文、注明笔记 §3.1 省略行），validate OK(17)。未新建卡：笔记错误已被现有 mismatch 卡覆盖；新发现候选：论文正文 "only 0.03 less than LiDAR" vs Table 6 实差 0.45（疑论文笔误）→ 已记 QUESTIONS 待主人定
- [fire-now|01:29✅] [draft|P1] AutoVLA → `nightshift/drafts/AutoVLA.md`（259 行，**5.9M token**，NeurIPS 2025, arXiv:2506.13757，10 张表逐字行 + 140 引文程序验证，开源状态实抓确认）。自查：§1 "superior performance" 与 Table 1/S2/S3 多处非第一矛盾已 ⚠（建卡时建议只锚单一数字）；Table S3 两行同名 DriveTraj 照抄待核
- [fire-now|01:28✅] [draft|P1] MIT-BEVFusion → `nightshift/drafts/MIT-BEVFusion.md`（185 行，2.4M token，Table I–IV 42 行 + 64 引句脚本核验，正确避开同名异 arXiv 号 2205.13590）。遗留：ICRA 2023 出处依据 GitHub News+BibTeX（IEEE Xplore 页待人工补）；abs 与 HTML v3 摘要措辞差异已在头部对照列出
- [fire-now|01:29✅] [draft|P1] RCBEVDet++ → `nightshift/drafts/RCBEVDetPP.md`（426 行，3.6M token，arXiv:2409.04979 标题核对一致，14 张表 122 行逐格 + 67 引文逐字核验，含与 RCBEVDet.md 关系说明）。遗留：正式发表出处未知按 arXiv v1 标注；原文 Table II 引用编号与 "diving" 拼写疑原文笔误已照抄标注；反向链接 RCBEVDet.md 需主人同意
- [fire-now|01:31✅] [draft|P1] PillarNet → `nightshift/drafts/PillarNet.md`（288 行，**6.0M token** 新高，110 引句 + Table 1–6 逐格 0 错位，正文数字对表验算）。发现多处原文疑点："+0.34% mAP" 对不上 Table 4 行差（实为 +0.08）、§4.2 交叉引用 Table 6 疑应为 Table 5、多处拼写瑕疵照抄加注——均留人工裁决
- [fire-now|01:41✅] [draft|P1] LSQ → `nightshift/drafts/LSQ.md`（253 行，1.7M token，Table 1–4 逐行 + 式 (1)–(11) 转写标注，43/43 表行匹配）。开源状态 grep 核实：官方未开源，如实标注
- [fire-now|01:55✅] [draft|P1] Deep Compression → `nightshift/drafts/DeepCompression.md`（218 行，3.6M token，528 项核验全过：66 引文逐字 + 7 表 62 行逐格，另用 v5 PDF 交叉复核）。遗留：Appendix A Table 8/9 未逐行转录（TODO 注明）；开源状态"abs 页未给出、实现基于 Caffe"如实写
- [fire-now|02:18✅] [draft|P1] MobileOne → `nightshift/drafts/MobileOne.md`（526 行，3.8M token，CVPR 2023，24 表 216 行逐格 + 36 引文核验，含与 RepQ-ViT 关系一句）。⚠ 原文自不一致：MNASNet-A1 Table 9=75.2 vs Table 14=75.8 双照抄加标注（建卡勿混用）；"比 MobileViT-S 快 5×" 未采信（配对变体不明）
- [fire-now|02:20✅] [draft|P1] ShuffleNet → `nightshift/drafts/ShuffleNet.md`（Table 1–8 逐行 + 40 引文核验 ALL PASSED，开源 megvii-model 实抓确认）。插曲：01:55 派发后被限流打断约 20 分钟，恢复后确认已完成无需重跑。遗留：CVPR 2018 出处 camera-ready 未核对（v2 自称 "This report"）→ QUESTIONS
- [fire-now|02:20✅] [draft|P1] MobileNet V1/V2/V3 三篇合一 → `nightshift/drafts/MobileNet.md`（599 行，**11.3M token** 历史新高，103 次工具调用，26 表 150 引句 0 失败）。⚠ 最重遗留：V2/V3 的 ar5iv 摘要与 abs 页 v1–v5 摘要均不一致（V3 数字 20/6.6/34 vs 15/4.6/30），正文按 ar5iv、摘要按 abs 分别标注，严格对版需 PDF 复核 → QUESTIONS
- [fire-now|02:36✅] [draft|P1] LLaVA → `nightshift/drafts/LLaVA.md`（173 行，2.4M token，NeurIPS 2023 oral 经 API 核对唯一同名，115 引文 + 4 表逐格 + 4 公式 alttext 0 失败）。遗留：GPT-4-judge 相对分性质已标注；v1↔v2 差异未核对

## 扩队提示

各班按提示词第 4 节 R2–R5 持续扩队：P1 待写 L1 约 20 篇、P2 全库还没有 claim 的笔记（每篇一条 [claim]）、P3 全部现有 claim 的审计。扩队工作可以交给一个子代理代做。
