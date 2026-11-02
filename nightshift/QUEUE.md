# QUEUE（清仓班工作队列；由调度班次自维护、自扩队）

排序：P0 > P1 > P2 > QA。本队列由主人于 2026-11-03 00:50 重置（上一轮 22 草稿 + 75 卡挖矿 + 121 卡 QA round2 已收官并出晨报，历史见备份 `QUEUE-2026-11-02.md` 与 `LOG.md`）。

## 本班授权（主人 2026-11-03 00:50 批复）

- ✅ 直写 `library/`：草稿入库、README 重建、fix-list 修正、QUESTIONS 已授权修复（边界见 RULES.md 顶部注记）。
- ✅ 建卡两项：EchoFusion 数字不自洽窄卡（✅ 已建）；RadarOcc 消融核查后视证据立性能卡（进行中）。
- ⛔ 未授权：AI Infra 立卡（5 张草案留在 `suggestions/`）；改 TODO.md（笔误主人已修）；主人的 WIP（tools/ka*.mjs、selftest、serve、web/）。

## 进行中

（空）

## 待办

### P0 入库流水线（每条 = 入库前逐字 QA（quote/数字/出处）→ 直写 library/ 对应目录 → validate；index 由调度班统一重建）

- [ ] [README|依赖入库完成] 重建 `library/README.md`（AI Infra 3 篇 + ADe2e + 本班新入库篇目 + Efficient_Backbone/ 新目录，篇数核准）+ 根 README「**类型：**」来源头约定同步进「笔记约定」
- [ ] [fix|P2] PD-Quant / QwT 笔记数字修正（cross/quantization.md §8 新发现 → QUESTIONS #28/#29）：PD-Quant 三张表按论文版本化正确数字重建（BRECQ 列、ResNet-50 行、Table 1/2 部分列），QwT ResNet-50 行改 arXiv v4 数字（62.3/68.5/72.5）、Mask R-CNN 行 Size 36.1MB 与 APbox 42.6→43.1 分清；**只有 cross 报告给出双源正确数字才改，改完 Grep 受影响卡铁律 3 同步；pdquant 三卡数值主张受累是否立 mismatch 卡随修正判定**；QwT §5 "2.6%/存储 2-4%" 出处未命中——查证或加注

### P1 建卡与核查（已授权）

- [ ] [verify|P2] BEV-Planner：开源状态（QUESTIONS #1）+ 输入分辨率 256×704 对照 PDF 复核（#2）；证据足够则直改笔记三行头部并注记〔fire-0238 认领未开跑，回收重排〕
- [ ] [verify|P2] QUESTIONS #5 ShuffleNet CVF 出处 / #6 MobileNet V2/V3 PDF 对版 / #10 COTR 表号映射：核完直改笔记注记，结论回写 QUESTIONS〔fire-0238 认领未开跑，回收重排〕

### P2 质量线

- [ ] [cross|P2] Occupancy 稀疏化：SparseOcc/NJU-SparseOcc/SurroundOcc/RadarOcc → 与 `cross/4d-radar.md` 互链
- [ ] [cross|P2] VLA 线：UniAD/AutoVLA/OpenVLA/OpenDriveVLA/Alpamayo-R1/DrivePI
- [ ] [report|P2] 精读：claim-map Top5 中未覆盖的 `claim-omniquant-w4a4-llama7b-zeroshot-5265`、`claim-njusparseocc-rayiou34-fps17-beats-dense-baselines`（signoff 前置）
- [ ] [tool|P3] 新增 `tools/check-materials.mjs`：`assets/` 有素材无笔记自动检查（只新增，勿动主人 WIP）

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
