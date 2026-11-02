# QUEUE（清仓班工作队列；由调度班次自维护、自扩队）

排序：P0 > P1 > P2 > QA。本队列由主人于 2026-11-03 00:50 重置（上一轮 22 草稿 + 75 卡挖矿 + 121 卡 QA round2 已收官并出晨报，历史见备份 `QUEUE-2026-11-02.md` 与 `LOG.md`）。

## 本班授权（主人 2026-11-03 00:50 批复）

- ✅ 直写 `library/`：草稿入库（✅ 22/22）、README 重建（✅）、fix-list 修正（✅ P1+P2 全清）、QUESTIONS 已授权修复。
- ✅ 建卡两项：EchoFusion 数字不自洽窄卡（✅）；RadarOcc 消融核查后视证据立性能卡（✅）。
- ⛔ 未授权：AI Infra 立卡（5 张草案留在 `suggestions/`）；改 TODO.md（笔误主人已修）；主人的 WIP（tools/ka*.mjs、selftest、serve、web/）。

## 进行中

（空）

## 待办

### P2 质量线


## 完成

- [fire-0106|01:25✅] [入库|ADe2e] UniAD.md、AutoVLA.md → `library/ADe2e/`（273/265 行；195 处引文自洽、31 项数字抽查吻合、⚠ 注记保留、7 处配图回填）。遗留：素材在 library/ADe2e/<论文名>/ 非 assets/ 约定处（留主人）；缺图清单在笔记 TODO
- [fire-0106|01:25✅] [入库|量化] BRCEQ → **更名 `library/Quantization/BRECQ.md`**（360 行，ICLR 2021 出处 caveat 头部如实标注）；QLoRA.md → `library/Quantization/`（309 行，215 处引文自洽、14 项数字抽查吻合，10 张素材图逐一核对内容后嵌入）。遗留：`assets/QLoRA/Fig3.png` 来源不明未嵌入（素材登记已注明）；3 张素材文件名与论文编号错位（caption 已标注）
- [fire-0106|01:44✅] [入库|骨干] DeepCompression.md、LSQ.md → `library/Quantization/`（233/268 行）；MobileNet.md、MobileOne.md、ShuffleNet.md → 新建 `library/Efficient_Backbone/`（635/537/282 行）。361 条引句全自洽 0 失败，16 张素材逐张核对回填 13 张。遗留：ShuffleNet 唯一素材图实为 V2 论文图（素材错位实锤，未引用已注记）；LSQ Equation2.png 实为式(3)；MobileNet V1/V2 MAdds 跨论文口径差记入笔记遗留
- [fire-0106|01:44✅] [入库|其他] COTR.md → `library/3D_Occupancy/`（300 行，64/64 引文对照实抓 HTML v2 逐字 PASS，表号错位 caveat 落位）；MSMDFusion.md → `library/Multimodal_Fusion/`（314 行，67/67 引文 PASS，Table7.png=Figure 6 caveat 落位）。遗留：COTR 三处原文不一致照录待对官方 PDF；Figure 6 数值系目视抄录

**fire-0106 小结：入库 11/22 篇（4113 行），validate OK(114)，index 重建。**
- [fire-0143|02:45✅] [入库|检测] BEVDet.md、PillarNet.md → 新建 `library/BEV_Detection/`（250/313 行）；MIT-BEVFusion.md、RCBEVDetPP.md → `library/Multimodal_Fusion/`（194/445 行；RCBEVDet.md 回链 +4，本班授权覆盖）。274 引句自洽、54 项数字验算、27 图逐张核对内容后嵌入
- [fire-0143|02:45✅] [入库|VLM/VLA] 新建 `library/VLM_VLA/`：LLaVA/Qwen3-VL/OpenVLA/OpenDriveVLA/OneVL/DrivePI + **Alpamayo-R1.md（更名入库）**，共 7 篇 1763 行。1092 条 quote 自洽 0 失败；QUESTIONS #7（OpenDriveVLA 实题含 Action）/ #8（Alpamago→Alpamayo-R1）caveat 已落笔记头部
- [fire-0143|02:45✅] [fix|P1] EMC2 §5.1 按 arXiv v1 重建（A4000/Jetson 两列，旧数字不属于任何版本）、OmniQuant 实验1表头改 7B W2A16g128 + 实验4基线行、HGSFusion LXL Ped 72.93→58.30 + 头部回填 arXiv 号——全部本次实抓核实。铁律3：3 卡 quote 同步修订、2 张 mismatch 卡加「笔记已修正」附注（status 未动）
- [fire-0143|02:45✅] [claim|P1] `claim-echofusion-paper-table6-inconsistent-with-text`（115 卡）：实抓 v1/v2 双源 7 条 evidence，**方向反转**——正文 "0.03 less" 但表格 RT+C 实高 0.45；重复建卡已自删去重

**fire-0143 小结：🎉 P0 入库流水线 22/22 全清（两班合计 22 篇 +1 回链），validate OK(115)，index 重建。README 重建任务解锁。**
- [fire-0238|03:12✅] [fix|P2] fix-list P2×10 + P3×13 全清（1 项核实跳过）+ VQ-Map 乱码 + 3 个 arXiv 号回填 + HGSFusion F7 走廊区表格逐格改正——15 笔记 + 11 卡铁律3同步。遗留：cyclist 卡反转（#24）、两张 note-artifact 卡 falsifier 触发（#25）
- [fire-0238|03:12✅] [verify|P1] RadarOcc 消融核查：三源实抓 v4，消融表找到（Table 2 + 附录 6/7/8）→ 笔记补实验章节 72 行 → 立性能卡 `claim-radarocc-sss-ablation-gain-10p2`（SSS→percentile 掉 10.2 mIoU，双源 evidence）。遗留：DBD 卡 falsifier 部分触发（#26）、Focal Loss 疑笔误、Nr=450 敏感性
- [fire-0313|03:45✅] [QA|round3] 🎉 116 卡第 3 轮（上限）终审：必审 36 张逐字深核 + 全库 351 条 quote 程序全检 + 两张新卡 arXiv 独立重抓复核。PASS 33 / FIXED 3（qwt EV1 quote、pointnetpillars 限定句、hgsfusion-cyclist round3 注记）/ 历史 MISMATCH 15 条全部有在案加注。报告 `nightshift/qa/round3-final.md`
- [fire-0313|03:45✅] [cross|P2] 量化主线横向对比 → `nightshift/cross/quantization.md`（8 篇 + 22 卡，7 论文原文重抓复核）：比特配置矩阵 / 互证关系 S1–S5 / 口径差异 M1–M11 / 可靠性分层。**新发现：PD-Quant 笔记三张表部分数字三版本均不存在（3 卡受累）；QwT 笔记 ResNet-50 行系 v1 数字、Mask R-CNN 行误读 Size 为 AP** → QUESTIONS #28/#29 + 新 [fix] 任务入队

**fire-0313 小结：QA 线三轮收官（round1→round2→round3），量化 cross 落地，validate OK(116)，index 重建。**
- [fire-0345|04:35✅] [fix|P2] PD-Quant/QwT 笔记数字修正：PD-Quant 三表按 v3+CVF 重建（Table 1 补 R50/RegNet 列、Table 2 列序与校准值 71.09/68.26、Table 3 去 BRECQ 列）；QwT R50 行改 v4 数字、Mask R-CNN 行 Size/AP 分清、§5 补 locator（"2.6%" 原句 v1/v4 均命中——cross 报告漏检，已修正；"存储 2-4%" 仍待查）。铁律3：4 张 pdquant 卡 quote 同步 + beats-brecq/dc-bn 加「待主人裁定」。新卡 `claim-pdquant-note-table-mismatch`（117 卡）。**附赠发现：PD-Quant 附录 Table 11 存在真实 DC 消融（+0.34@1024），DC 卡有真实锚点可改写**
- [fire-0345|04:35✅] [cross|P2] VLA 线横向对比 → `nightshift/cross/vla.md`（6 篇 + 附录 A 70 条 quote 全验）：定位矩阵 / 六条技术路线谱系 / nuScenes 三族口径分裂 / 互证 S1–S6 与单源 C1–C7。遗留 4 条 → 报告 §6
- [fire-0345|04:35✅] [README] `library/README.md` 整体重建：11 目录 57 篇盘点（AI Infra 3、ADe2e 3、BEV_Detection 2、Efficient_Backbone 3、VLM_VLA 7 等全部补齐），71 条相对链接校验可达；「笔记约定」同步根 README「**类型：**」来源头约定；QUESTIONS #16 素材两处并存现状如实记录
- [fire-0345|04:35✅] [verify|P2] 六项出处核查全定案（实抓）：BEV-Planner **确认开源**（GitHub API，无 LICENSE 待查）+ 分辨率 256×704 PDF 原句逐字命中；ShuffleNet **CVPR 2018 CVF 正式收录确认**（pp.6848-6856）；MobileNet **ar5iv 与官方 PDF 一致、abs 页元数据系脱节旧文**（Table 3 vs 9 系论文自身不一致，照抄维持）；COTR **表号错位假设否定**（PDF 与 HTML v2 完全一致，错的只是 Table4.png 文件名）。结论回写 QUESTIONS #31–34

**fire-0345 小结：P0 全清（README ✓）+ PD-Quant/QwT 修正 + VLA cross + 六项出处定案，validate OK(117)，index 重建。剩：cross occupancy、精读×1、tool、R2 扩队。**
- [fire-0423|05:09✅] [cross|P2] Occupancy 稀疏化对比 → `nightshift/cross/occupancy-sparsification.md`（4 篇 17 卡，NJU 五版本+SparseOcc CVF+SurroundOcc v2 实抓）：定位矩阵 / 四路线谱系 / 口径 M1–M7。**新发现：NJU 笔记基线行与全部版本不符（32.2/2.3、33.7/5.2 → 实为 32.4/3.0、33.5/10.3，主卡 falsifier 触发）；SparseOcc「80% 空」实为 67%；NJU 剪枝系 top-k 非阈值** → 新 [fix] 任务入队
- [fire-0423|05:09✅] [report|P2] 精读×2（signoff 前置）：`omniquant-w4a4-deep-read.md`（52.65=六任务平均确认双口径互证，主卡 **★★★**，笔记修正后 4 表与 v3 逐格零差异）+ `njusparseocc-rayiou-deep-read.md`（34.0/17.3 三处自洽 ★★★，但卡现状 ★★——基线行来源不明坐实、倍数缩水 3.3×→1.68×；RayIoU 系本文提出，"引用各自原文"falsifier 结构性排除）

**fire-0423 小结：cross 3/3 全清、精读×2 落地（signoff 前置材料齐），validate OK(117)，index 重建。R2 扩队五批入队（21 篇待补卡）。**
- [fire-0510|05:50✅] [fix|P2] NJU 基线行修正（32.4/3.0、33.5/10.3 + Fig.4 混入溯源注记，v5 Table 1 实抓逐格确认）+ 主卡铁律3 同步（title 阈值 33.5、倍数 1.68×/5.77×、falsifier 改写，status 未动）+ OmniQuant w2a16g128 过期括注更新。**⚠ 拒绝盲改：SparseOcc 80% 与 67% 在 v1 系两个口径并存（§3.1 LSS 特征体 / §1 GT 口径），cross 报告"80% 未检得"系提取遗漏——保留 80% 补双口径注记**（→ QUESTIONS #38）
- [fire-0510|05:50✅] [R2|扩队-a/b/c] 新入库 11 篇补卡 **29 张**（117→146）：量化组 12（BRECQ 3/DeepCompression 3/LSQ 2/QLoRA 4）+ 骨干组 7（MobileNet 3/MobileOne 2/ShuffleNet 2）+ 检测组 10（BEVDet 3/PillarNet 2/MIT-BEVFusion 3/RCBEVDetPP 2）。60+48+78 条 evidence quote 逐字 Grep 验证，关键表格实抓逐行复核。**子代理两处主动否决无据候选**（BEVDet 稀疏查询/PillarNet SAN-GEV 笔记无对应，按铁律 4 不建）——纪律在线

**fire-0510 小结：NJU falsifier 修复 + R2 扩队 29 卡（146 卡），validate OK(146)，index 重建。剩：tool、R2-d（VLM/VLA 7 篇）、R2-e（其余 4 篇）。**
- [fire-0547|06:20✅] [R2|扩队-d/e] 剩余 11 篇补卡 **26 张**（146→172）：VLM/VLA 17（LLaVA 3/Qwen3-VL 2/OpenVLA 3/OpenDriveVLA 2/OneVL 2/DrivePI 2/Alpamayo-R1 3）+ ADe2e/其他 9（UniAD 3/AutoVLA 2/COTR 2/MSMDFusion 2）。122 条 evidence quote 逐字验证 + 7+4 篇 arXiv 实抓复核；UniAD 卡全部绑定"四套数字"版本口径，bevplanner-unidad 卡 +2 related（纯增量）；Qwen3-VL "Length-adaptive" 术语勘误（v2 实为 Length-Adaptive Sampling）卡内注明
- [fire-0547|06:20✅] [tool] `tools/check-materials.mjs` 落地（纯 Node 内置模块，别名表覆盖 Alpamago/BRECQ/Qwen3VL/RCBEVDetPP 等本库已知映射）：53 素材目录/57 笔记/282 图盘点——①素材无笔记×3（CameraParams/KITTI/Misc）②笔记无素材×11（数学/liger 天然无图 + ADe2e 素材位置特例）③未引用图×164；exit=1 符合设计（豁免策略 → QUESTIONS #40）

**fire-0547 小结：🎉 R2 扩队全清（21 篇 46 卡），check-materials 落地，validate OK(172)，index 重建。剩：R2 二轮候选卡、R3 晨报摘要。**
- [fire-0619|06:43✅] [R2|二轮补卡] 6 张（172→178）：PillarNet test 快照（三行绑口径+TTA 例外注记）、LSQ 负面发现（"does not in fact minimize quantization error" 原句锚定）、MobileNetV3 NAS/SE/h-swish 设计、ShuffleNet Table 5 对比（g=3 窄口径，对照来源未明示风险入 falsifier）、AutoVLA 三表快照（competitive-not-first 措辞，避开 S3 两行待核行）、MSMDFusion 多尺度（+1.42 mAP 行差与论文 "~2%" 口径并写）。**UniAD"两预测任务"候选正确跳过**（笔记无 Table 2 中间行，不擅自补笔记）
- [fire-0619|06:43✅] [R3] 值班总账摘要 → `nightshift/reports/shift-summary.md`（实数核验：库 172→178、笔记修正 26 篇次、mismatch 卡 4+2、R2 实为 55 卡——纠偏 QUEUE 小结的 46）。**两处如实纠偏：egomlp-parity 实评 ★★（链内 ★★★ 是 injection/velocity）；本班数据截至 fire-0547+本班**

**fire-0619 小结：R2 二轮 6 卡 + 总账摘要，validate OK(178)，index 重建。**

## ⛔ 停机注记（06:43，fire-0619 调度器）

**值班工作全部完成，队列清空。** 2026-11-03 凌晨班 10 火累计：22 篇入库、claim 库 114→178、QA 三轮、cross×4、精读×3、fix-list 全清、README 重建、check-materials 落地。07:20 前触发的班次：**请勿再生成任何任务**（防灌水），直接退出即可；08:20 后的班次按提示词第 0 节进入收班晨报模式（REPORT-2026-11-03.md）。
