# QUEUE（清仓班工作队列；由调度班次自维护、自扩队）

排序：P0 > P1 > P2 > P3 > P4 > QA（定义见各班提示词第 4 节与 RULES.md）

## 进行中

- [fire-now] [draft|P1] QLoRA（NeurIPS 2023, "QLoRA: Efficient Finetuning of Quantized LLMs"）→ `nightshift/drafts/QLoRA.md`
- [fire-now] [claim|P2] library/Multimodal_Fusion/RCBEVDet.md → 提炼 2–4 张 asserted 卡（雷达-相机融合 RadarBEVNet 方向）
- [fire-now] [claim|P2] library/Quantization/OmniQuant.md → 提炼 2–4 张 asserted 卡（LLM 量化 PTQ；校准集 vs 测试集口径写进 scope）
- [fire-now] [claim|P2] library/Quantization/VQ-Map.md → 提炼 2–4 张 asserted 卡（BEV 离散表示方向）
- [fire-now] [claim|P2] library/Multimodal_Fusion/Ali-BEVFusion.md → 提炼 2–4 张 asserted 卡（注意与 MIT 版区分）
- [fire-now] [claim|P2] library/Classical_Detection/FCOS.md → 提炼 2–4 张 asserted 卡（经典设计主张与消融结论）

## 待办

- [draft|P2] P2 挖矿池（P1 已近清空）：library/ 下还没有 claim 的笔记 → 每篇一条 [claim] 任务。优先级：有 PDF 的（RadarOcc✅派出、R4Det、NJU-SparseOcc）> TODO 点名的 > 其余。已知无卡笔记：RadarOcc、R4Det、NJU-SparseOcc、SparseOcc、SurroundOcc、HGSFusion、RadarDistill、RCBEVDet、Ali-BEVFusion、CaDDN、CenterNet×2、CornerNet、FCOS、Fast R-CNN、PointNet&PointPillars、SGDet3D、MQBench、RepQ-ViT、PD-Quant、QD-BEV、OmniQuant、VQ-Map 等（注：TODO 用名 "BRCEQ" 经查证为 BRECQ 笔误，已按 BRECQ 产出）

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
- [fire-now|02:41✅] [draft|P1] Qwen3-VL → `nightshift/drafts/Qwen3VL.md`（328 行，4.4M token，arXiv:2511.21631 Technical Report，Table 1–9 逐字转抄，194/194 引文核验）。吸取 EMC2 教训：HTML 缺失的 PDF 大表不硬转抄只抽查（MMStar 78.7 / MMMU 80.6 与 prose 一致）。遗留：三处原文瑕疵照录待勘误；v1↔v2 差异未比对
- [fire-now|03:06✅] [draft|P1] OpenVLA → `nightshift/drafts/OpenVLA.md`（227 行，**9.6M token** 新纪录，126 次工具调用，四源核验 arXiv+PMLR+GitHub API，132 引文 + 48 表行 0 失败）。与 LLaVA 草稿互链有据。遗留：HuggingFace 不可达（SSL），开源核验基于 GitHub API；PMLR 作者 17 vs arXiv 18（缺 Grace Lam）已备忘
- [fire-now|03:09✅] [draft|P1] OpenDriveVLA → `nightshift/drafts/OpenDriveVLA.md`（243 行，5.9M token，arXiv:2503.23463 API 唯一命中，9 表逐格 + 165 引文核验）。⚠ 实际标题为 "...Large Vision Language **Action** Model"（与任务给定单复数不同），按"唯一命中+主题吻合"采用 → QUESTIONS 待主人确认；assets 预存 Table4/5/TableB.png 经比对对应 TABLE IV/V/XI
- [fire-now|03:26✅] [draft|P1] OneVL → `nightshift/drafts/OneVL.md`（274 行，5.0M token，arXiv:2604.18486 "Xiaomi OneVL" API 唯一命中，10 表逐格 + 145 引文五池核验 0 失败，Eq.(1)–(6) alttext 逐字）。遗留：README 称 Apache-2.0 但仓库无 LICENSE 文件 → 待人工确认；延迟测量硬件环境 HTML 未载，引用绝对值前查 PDF
- [fire-now|03:49✅] [draft|P1] DrivePI → `nightshift/drafts/DrivePI.md`（229 行，**9.2M token**，arXiv:2512.12799 CVPR 2026，表 1–9 逐格 + 151 引文五源核验）。主动与库内 OpenDriveVLA/LLaVA 草稿交叉核对数字一致。遗留：GitHub 无 license 引用代码前需确认；PDF/HTML 参考文献编号有局部偏移，引用按版本核对
- [fire-now|03:53✅] [draft|P1] Alpamago → `nightshift/drafts/Alpamago.md`（239 行，5.9M token，实为 **Alpamayo-R1** arXiv:2511.00088 NVIDIA——"Alpamago" 是 TODO 笔误，身份经预存 assets 表格逐值交叉确认）。TABLE 6–14 全抄 + 198 引文核验，初检 8 处问题已修复复验 0 失败。遗留：HF 页抓取超时，开源状态以论文 §7 + GitHub Apache-2.0 为准 → QUESTIONS 待确认命名更正
- [fire-now|04:11✅] [draft|P1] BRCEQ → `nightshift/drafts/BRCEQ.md`（348 行，**6.9M token**，实为 **BRECQ** arXiv:2102.05426 ICLR 2021——字母易位笔误，assets 全部为 BRECQ 内容佐证）。Table 1–6 逐行 + 81 引文核验，§4.4 数字对账一致。遗留：ICLR 2021 仅 GitHub 自述未核 OpenReview；原文 3 处笔误照抄注记 → TODO 更正留 QUESTIONS
- [fire-now|04:15✅] [draft|P1] COTR → `nightshift/drafts/COTR.md`（288 行，4.5M token，7 个同名论文中锁定 CVPR 2024 占用预测版，7 表 66 行 + 38 引文核验）。发现原文内部不一致（§4.3 41.05 vs Table 2 41.39 等）已注记；assets/COTR/Table4.png 实为 HTML Table 3（表号疑错位）→ QUESTIONS
- [fire-now|04:28✅] [draft|P1] MSMDFusion → `nightshift/drafts/MSMDFusion.md`（290 行，4.3M token，CVPR 2023 LiDAR-相机融合确认，6 表逐格 + 57 引文核验，assets 9 图抽验一致）。诚实标注：本文是 LiDAR-相机非雷达-相机，未强加库内关联。遗留：assets Table7.png 实为 Figure 6、公式截图未嵌入待确认
- [fire-now|04:34✅] [claim|P2] RadarOcc → **4 张 asserted 窄卡**（0.75M token，review_due 2026-12-02，related 互链）：claim-radarocc-sss-rangewise-preserves-lowrcs / dbd-compresses-doppler-to-8-descriptors / s2c-deformable-avoids-interp-degradation / cfar-pointcloud-loses-lowrcs。9 条 quote 逐字验证，validate OK(21)，index 已重建。关键决定：笔记无实验章节（cross 文件 M5 已证实），拒绝立"stable-beats-Cartesian"强主张，全部窄卡 + scope 口径限定。遗留：回原文核对有无 SSS/DBD/S2C 消融表（涉及补笔记，需主人同意）→ QUESTIONS
- [fire-now|04:39✅] [claim|P2] R4Det → **4 张 asserted 卡**（0.44M token，互链）："正交叠加"已注明是累计式消融解读、未立 SOTA 主张；EAA 口径未定义 caveat 已写入 scope。8 条 quote 逐字验证，validate OK(25)，index 已重建。遗留：t-2/t-3 帧距消融数字需回原文；笔记 §2.1 小节编号瑕疵未改（禁改）
- [fire-now|04:40✅] [draft|P1] QLoRA → `nightshift/drafts/QLoRA.md`（277 行，**7.1M token**，NeurIPS 2023 五源确认，13 表 + 90 引文双 HTML 源核验 0 失败）。🎉 **P1 草稿流水线 22/22 全清**。遗留："& Meta" 署名未见抓取材料 → 待用户确认；Table 9–12 未逐行转录（TODO 已记）
- [fire-now|04:48✅] [claim|P2] HGSFusion → **4 张 asserted 窄卡**（0.66M token，互链）：cyclist-roi-ap-below-all-baselines / rhgm-dsm-superadditive-roi-gain / dark-scene-gain-dominates / 2d-spatial-mode-beats-3d。88.28% 口径警告入卡；"高度角分辨率"归因只记录不立主张（与 RadarOcc C1 张力）。16 条 quote 逐字验证，validate OK(33)
- [fire-now|04:48✅] [claim|P2] NJU-SparseOcc → **4 张 asserted 卡**（0.89M token，互链）：rayiou34-fps17-beats-dense-baselines / decoder-pruning-complexity-onactive / mgss-complexity-onquery-np / rayiou-penalizes-thick-surface。13 条笔记 quote + 3 条 arXiv 摘要实时复核。遗留：BEVFormer/FB-Occ 基线行来源不明已写进 falsifiers；"15 帧→35.1"数据点未单独立卡（可补第 5 张）
- [fire-now|04:54✅] [claim|P2] SGDet3D → **4 张 asserted 卡**（0.65M token，互链）：组件叠加单调 / 无 GDC 深度定向污染 / 深度监督密度增益 / SOTA 绑定 EAA-DC 口径。遗留：mAP_DC 口径非单调（主张已限缩至 EAA）；推理期是否需 LiDAR 待回原文。agent 自行重建 index（合规）
- [fire-now|04:59✅] [claim|P2] RadarDistill → **4 张 asserted 卡**（0.52M token，互链）：主卡 radar-only 蒘馏提升（mAP 20.5/43.7 vs 8.6/34.7，数字补自官方 README 实抓并记 URL）+ 机制卡×3。遗留：笔记零实验数字，口径依赖 README 需对照 arXiv:2403.05061 正文；笔记"AFD 的教学"疑笔误已标注
- [fire-now|05:03✅] [claim|P2] RCBEVDet → **4 张 asserted 窄卡**（0.76M token，互链）：rcs-aware-scattering / dmsa-gaussian-mask / camf-alignment-then-fusion / dualstream-injection-extraction。笔记无实验数字→全窄卡，扩展版数字只以"论文声称/待人工核对"入正文未进 evidence。13 条 quote 逐字验证，validate OK(45)
- [fire-now|05:08✅] [claim|P2] VQ-Map → **4 张 asserted 卡**（0.54M token，互链）：miou-622-leads-table / argoverse-zero-shot-iou-734 / token-classification-beats-regression（窄卡：差距仅 1.5）/ tiny-868g-macs-matches-ddp（1/7 计算量，无实测延迟已限定）。13 条 quote 逐字验证，validate OK(49)。遗留：笔记 §4.1 有一处乱码"细□度"（约 105 行）需人工修 → QUESTIONS；四卡均单源自报未抓原文（笔记无 arXiv 号）
- [fire-now|05:14✅] [claim|P2] Ali-BEVFusion → **4 张方法/协议级窄卡**（0.57M token，互链）：dynamic-fusion-SE / camera-stream-independent / lidar-backbone-compatible / two-stage-9epoch。笔记无实验数字→无性能主张（不硬凑）；与 MIT 版同名不同作已在各卡注明。18 条 quote 逐字验证，validate OK(53)。遗留：官方仓库与原文抓取超时，对照待人工

## 扩队提示

各班按提示词第 4 节 R2–R5 持续扩队：P1 待写 L1 约 20 篇、P2 全库还没有 claim 的笔记（每篇一条 [claim]）、P3 全部现有 claim 的审计。扩队工作可以交给一个子代理代做。
