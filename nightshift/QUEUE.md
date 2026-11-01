# QUEUE（清仓班工作队列；由调度班次自维护、自扩队）

排序：P0 > P1 > P2 > P3 > P4 > QA（定义见各班提示词第 4 节与 RULES.md）

## 进行中

- [fire-now] [draft|P1] QLoRA（NeurIPS 2023, "QLoRA: Efficient Finetuning of Quantized LLMs"）→ `nightshift/drafts/QLoRA.md`
- [fire-now] [claim|P2] library/Multimodal_Fusion/RCBEVDet.md → 提炼 2–4 张 asserted 卡（雷达-相机融合 RadarBEVNet 方向）
- [fire-now] [claim|P2] library/Quantization/VQ-Map.md → 提炼 2–4 张 asserted 卡（BEV 离散表示方向）
- [fire-now] [claim|P2] library/Multimodal_Fusion/Ali-BEVFusion.md → 提炼 2–4 张 asserted 卡（注意与 MIT 版区分）
- [fire-now] [claim|P2] library/Classical_Detection/FCOS.md → 提炼 2–4 张 asserted 卡（经典设计主张与消融结论）
- [fire-now] [claim|P2] "library/Classical_Detection/PointNet & PointPillars.md" → 提炼 2–4 张 asserted 卡（置换不变性、Pillar 编码方向）
- [fire-now] [claim|P2] "library/Classical_Detection/Fast R-CNN 和 Faster R-CNN .md" → 提炼 2–4 张 asserted 卡（RoI Pooling、RPN 设计主张）
- [fire-now] [claim|P2] "library/Classical_Detection/CenterNet：Keypoint Triplets.md" → 提炼 2–4 张 asserted 卡（勿与 Objects as Points 混）
- [fire-now] [report] BEV-Planner 深度精读报告 → nightshift/reports/bevplanner-deep-read.md（论证链 + 5 卡关系 + UniAD 对照 + 人工核验建议；仅本地素材）
- [fire-now] [suggest|P4] AI Infra 三篇笔记 claim 适配性评估 → nightshift/suggestions/ai-infra-claim-assessment.md（TODO 候选池项，只评估不建卡）
- [fire-now] [report] 全库 claim 地图 → nightshift/reports/claim-map.md（114 卡按主题分组 + 强度标注 + signoff 候选 Top5 + 薄弱点清单）
- [fire-now] [QA|round2|补批] 24 卡复审（在跑，最终一批）

## ⛔ 停机注记（07:09，fire-now 调度器）

**值班工作已全部完成，队列清空。** QA round2 七批 + 最终补批共 121 张卡复审，全部新卡覆盖，无需 round3。08:20 前触发的班次：**请勿再生成任何 QA/挖矿任务**（防止灌水），直接退出即可；08:20 后的班次按提示词第 0 节进入收班晨报模式。
- [fire-now] [claim|P2] library/3D_Occupancy/SparseOcc.md → 提炼 2–4 张 asserted 卡（全稀疏占用；勿与 NJU-SparseOcc 混）
- [fire-now] [claim|P2] library/Quantization/QD-BEV.md → 提炼 2–4 张 asserted 卡（BEV 量化感知训练 + 渐进量化）
- [fire-now] [claim|P2] library/3D_Occupancy/SurroundOcc.md → 提炼 2–4 张 asserted 卡（多相机稠密占用方向）

## 待办

- [draft|P2] P2 挖矿池：剩余无卡笔记（SparseOcc、SurroundOcc、CenterNet×2、CornerNet、Fast R-CNN、PointNet&PointPillars、MQBench、RepQ-ViT、PD-Quant、QD-BEV 等）。注：TODO 用名 "BRCEQ" 经查证为 BRECQ 笔误，已按 BRECQ 产出
- [claim|P2] （已派出）OmniQuant note-mismatch 卡

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
- [fire-now|05:19✅] [claim|P2] OmniQuant → **4 张 asserted 卡**（3.0M token，互链 + 链 QwT 卡）：w2a16g128-beats-gptq-awq / w4a4-zeroshot-5265 / let-lwc-ablation / w4a16g128-913toks。数字与 arXiv v3 + v1 PDF 逐格交叉核对；**发现笔记实验表 1 混列**（13B 表头下实为 7B 列）与 FP16 基线行不符 → note-mismatch 卡已排队 + QUESTIONS。校准集口径（QwT 教训）写入各卡 scope
- [fire-now|05:26✅] [claim|P2] CaDDN → **4 张消融卡**（0.59M token，互链）：深度监督主导增益 +10.4% / LID 优于 UD / Soft 分布优于 Argmax / 联合训练优于冻结。14 条 quote 逐字验证，validate OK(65)。遗留：笔记消融未标数据集与 AP 版本，四卡 scope 如实注明"需对照原论文补齐"；两处设计主张无消融未立卡（不硬凑）
- [fire-now|05:31✅] [claim|P2] CenterNet-Points → **4 张卡**（0.34M token，互链）：heatmap-peaks-replace-nms / regression-replaces-grouping / fps-gain-over-cornernet / center-collision-rare（自报口径不同已注明不可直接对比）。12 条 quote 逐字验证，validate OK(69)。遗留：FPS 数字无硬件/分辨率口径 → 待人工
- [fire-now|05:33✅] [claim|P2] OmniQuant note-mismatch 卡 → `claims/claim-omniquant-note-table-mismatch.md`（0.57M token）：18 条 evidence 双源成立（笔记+LOG 逐字 + 实抓 arXiv v3/v1 PDF pdftotext 逐格，URL+日期齐全）。validate OK(70)。遗留：笔记修复需主人处理（改法建议在卡内待验证节）
- [fire-now|05:38✅] [claim|P2] PointNet&PointPillars → **4 张设计窄卡**（0.51M token，互链）：置换不变性 / maxpool 骨架抗噪 / Pillar 化避 3D 卷积 / Sine-Error 方向分支。16 条 quote 逐字验证，本任务卡零报错。遗留：笔记无三行头部与编号章节（L1 约定不符，建议留用户）；全库 validate exit 1 系并行 CornerNet 在写 related 悬空，待其完工自愈
- [fire-now|05:38✅] [claim|P2] CornerNet → **4 张设计窄卡**（0.39M token，互链 + 挂 CenterNet/FCOS）：paired-keypoints / corner-pooling / associative-embedding / single-scale-no-fpn。12 条 quote 逐字验证，related 悬空自愈，validate OK(78)。遗留：笔记无实验章节→零精度/速度主张，补实验后可加消融卡
- [fire-now|05:42✅] [claim|P2] SurroundOcc → **4 张卡**（0.44M token，互链）：dense-gt 监督 11.96→31.49 / 对比表同表更高（窄口径）/ 3D voxel query 垂直结构（仅定性）/ Poisson 重建 GT 管线（构造性）。ICCV 2023 + arXiv 号经抓取核实。validate OK(82)。遗留：消融数字单源待回原文；nuScenes 划分/协议未注明已写 scope
- [fire-now|05:46✅] [claim|P2] RepQ-ViT → **4 张卡**（1.0M token，互链，回链 QwT/OmniQuant 已合规执行）：w4a4-leads-baselines / layernorm-reparam（33.17→69.03）/ softmax-log2-lossless / 32图-1.3min 校准成本窄卡。14 条 quote 逐字验证，validate OK(86)。遗留：§3.3 效率表未注明模型与校准 split；消融表两处同值读表限定请主人复核
- [fire-now|05:50✅] [claim|P2] PD-Quant → **4 张卡**（0.40M token，QwT 卡回链）：pd-metric-beats-mse-cosine / **pd-loss-alone-overfits-calibration（70.51% vs 验证 1.07%，QwT 教训的正面应用）** / dc-bn-stats 窄卡 / beats-brecq-qdrop（自报 +1.21~3.99pp）。validate OK(90)。遗留：Table 1/3 数据集与口径未注明需对照原文
- [fire-now|05:52✅] [claim|P2] QD-BEV → **4 张卡**（0.88M token，互链量化主线）：encoder 敏感度 / PTQ<8bit 崩塌 / 渐进式 QAT 优于标准 W4A6 / Tiny 8x 压缩反超 FP32。ar5iv 逐项核对 + 规避假 arXiv id（2309.05217→2308.10515）。validate OK(94)。遗留：Table 4 分辨率口径、Tiny/Small 增益限定已写入卡内
- [fire-now|05:53✅] [claim|P2] MQBench → **4 张工具主张卡**（0.24M token，互链量化主线）：首个硬件对齐基准 / 三类硬件图约束 / SNPE Scale 绑定断崖掉点 / BN folding Zero Drop。7 条 quote 逐字验证，validate OK(98)。遗留：笔记未记论文完整标题与实验口径，scope 均收窄注明
- [fire-now|05:59✅] [claim|P2] Fast R-CNN → **4 张经典设计卡**（0.53M token，互链）：RoI Pooling 机制 / 多任务损失 / RPN 共享 58.7→59.9 / 两阶段 vs 单阶段 +4.8pp。14 条 quote 逐字验证，validate OK(102)🎉 破百。遗留：消融数字无数据集标注（疑 VOC）已如实写入 scope
- [fire-now|06:01✅] [claim|P2] SparseOcc → **3 张卡**（0.75M token，互链）：miou141 同表高于稠密基线 / FLOPs −74.9%（摘要口径）/ 分解核相对序窄卡。11 条 quote + arXiv:2404.09502 摘要双抓取佐证；同名论文消歧（VISION-SJTU CVPR 2024 vs NJU ECCV 2024）写入卡内。validate OK(105)。遗留：基准名、FLOPs 口径、消融绝对值不一致待回原文（均写入卡内）
- [fire-now|06:06✅] [claim|P2] CenterNet-Triplets → **4 张卡**（0.76M token，互链 + 与 Objects as Points/Cornernet 消歧）：CRE +2.3 AP 小物体 / CTP +0.9 AP 大物体 / CCP +0.5（协同归因限定）/ GT 中心 oracle 41.3→56.5（瓶颈定位）。12 条 quote 逐字验证，validate OK(109)。🎉 **P2 挖矿收官：18 篇笔记 75 张卡**。遗留：消融协议未注明已写 scope；自适应中心区域无消融未立卡
- [fire-now|06:07✅] [QA|round2] 批 1 BEV-Planner 5 卡 → `nightshift/qa/round2-bevplanner.md`。**PASS ×5 / FIXED 0 / MISMATCH 0**：14 条 quote 逐字节匹配、表格交叉验证无错位。你研究重点的卡片质量过关 ✅
- [fire-now|06:09✅] [claim|P2] QA dataset 评估 → LingoQA 值得立卡：**3 张窄卡**（0.52M token）：lingo-judge-spearman-0950 / 7b-baseline-matches-gpt4v / late-fusion-beats-early-mid。quote 逐字验证，validate OK(112)。遗留：§3.2 笔记自行推断未立卡（正确）；多行表格拆行引用建议人工对 Table 4/5 再核
- [fire-now|06:12✅] [QA|round2] 批 2 RadarOcc+R4Det 8 卡 → `nightshift/qa/round2-radarocc-r4det.md`。**PASS ×6 / FIXED ×2 / MISMATCH ×0**：16/16 quote 命中；FIXED ①radarocc-cfar 补第二 evidence 支撑标题后半句 ②r4det-depth 卡把"（如 Metric3D）"的推断改回如实转述
- [fire-now|06:17✅] [QA|round2] 批 3 HGSFusion+NJU 8 卡 → `nightshift/qa/round2-hgsfusion-nju.md`。**PASS ×6 / FIXED ×2 / MISMATCH ×0**：25/25 quote 命中（含 arXiv 摘要 3 条实抓复核）；FIXED ①NJU FPS"差一个量级"→精确 3.3 倍 ②HGSFusion 悬空引用 §6.6→6.5。遗留：HGSFusion 笔记 LXL 行重复与 +11.41% 单位写法需回原文裁定（卡内口径警告已覆盖）
- [fire-now|06:22✅] [QA|round2] 批 4 Sparse/Surround/CenterNet 11 卡 → `nightshift/qa/round2-sparseocc-surroundocc-centernet.md`。**PASS ×9 / FIXED ×2 / ISSUED ×2**：31 条本地 quote + 6 条网络证据实抓；FIXED ①sparseocc README 措辞改实抓原句 ②surroundocc"接近翻两番"→"约 2.6 倍"；ISSUED ①CenterNet 笔记残留引用编号 17/18181818/20 → 新卡 claim-centernetpoints-note-citation-artifacts ②SparseOcc 笔记对话式残留 → claim-sparseocc-note-conversational-residue
- [fire-now|06:27✅] [QA|round2] 批 6 经典检测 16 卡 → `nightshift/qa/round2-classical.md`。**PASS ×15 / FIXED ×1 / ISSUED ×0**：43 条 quote 逐字命中（含 LaTeX 转义/内空格/"方向 10"残留）；FIXED ①cornernet-single-scale FPS 交叉引用补"未注明硬件/分辨率" caveat。数字抽查全对（CaDDN 增量、CornerNet Δ=1、PointPillars 9 维）
- [fire-now|06:37✅] [QA|round2] 批 7（最后一批）Ali+MQ+LingoQA 11 卡 → `nightshift/qa/round2-ali-mq-lingoqa.md`。**PASS ×11 / FIXED ×0 / ISSUED ×0**：33 条 quote 逐字命中含全角标点与表内空格。附赠：外部核实 Ali-BEVFusion=arXiv:2205.13790、MQBench=arXiv:2111.03759，8 卡"论文全名笔记未载"可回填（留主人定夺）。**QA round2 七批收官：81 卡 PASS 76 / FIXED 4 / ISSUED 2（批 5 在跑）**
- [fire-now|06:48✅] [QA|round2] 批 5 量化+融合 16 卡 → `nightshift/qa/round2-quant-fusion.md`（**9.5M token，138 次工具调用**）。**PASS ×4 / FIXED ×12 / ISSUED ×0**：重抓 arXiv v1/v3/README 后新增修订 37 条 evidence；更正上一轮误判——"AFD 的教学"非笔误（论文式(9)–(10) 确由 AFD 损失承担），cma 卡标题/归属已更正；RCBEVDet 消融数字实为 CVPR v1 Table 5/7 已含；VQ-Map arXiv=2411.01618 确认、"时间"列系训练时长已注明。🎉 **QA round2 全部收官：97 卡 PASS 80 / FIXED 16 / ISSUED 2**。遗留：VQ-Map 笔记失效图片路径(D:\)与乱码、RCBEVDet 坐标噪声数字待人工
- [fire-now|06:52✅] [report] BEV-Planner 精读报告 → `nightshift/reports/bevplanner-deep-read.md`（336 行，69 条 quote 逐字验证附录）。核心：injection/velocity 证据最强（★★★）、straight-driving-imbalance 最弱（★，背景假设）；egomlp-parity 为枢纽卡（4 卡 related 连坐）；两笔记无"开环 vs 闭环"争论——真争论在开环内部三口径；UniAD 存在四套不可混用数字。遗留 4 条 → QUESTIONS
- [fire-now|06:55✅] [suggest|P4] AI-Infra 评估 → `nightshift/suggestions/ai-infra-claim-assessment.md`（230 行，36 条 quote 逐字验证）：liger-pr1423 适合 2 卡 / liger-pr1424 适合 2+1 卡（单发显存测量假阳性方法主张全批复用价值最高）/ pr1501 建议留 L1。TODO 疑虑获印证但应按内容类型区分。5 草案 id/主张/scope/falsifiers 齐全待主人定夺
- [fire-now|07:05✅] [suggest|P4] library 修复清单 → `nightshift/suggestions/library-fix-list.md`（**17 篇笔记 29 条问题**，行号全部实测）：P1 数字正确性 ×6（EMC2/OmniQuant/HGSFusion/EchoFusion）/ P2 引用出处 ×10 / P3 排版 ×13。新发现：Ali 残留实为 23 处、P&P 缺头部、VQ-Map 无 arXiv 号（可回填 2411.01618）。含"核实后无需修改"5 条防重复劳动
- [fire-now|07:09✅] [QA|round2|补批] 最终 24 卡（PD-Quant/QD-BEV/RepQ-ViT/CenterNet-Triplets/Fast R-CNN/SGDet3D）→ `nightshift/qa/round2-final-batch.md`。**PASS ×24 / FIXED ×0 / ISSUED ×0**：90/90 quote 逐字命中，数字重算全自洽。🎉 **QA round2 总账：121 卡复审，PASS 104 / FIXED 16 / ISSUED 2，全部新卡覆盖**

## 扩队提示

各班按提示词第 4 节 R2–R5 持续扩队：P1 待写 L1 约 20 篇、P2 全库还没有 claim 的笔记（每篇一条 [claim]）、P3 全部现有 claim 的审计。扩队工作可以交给一个子代理代做。
