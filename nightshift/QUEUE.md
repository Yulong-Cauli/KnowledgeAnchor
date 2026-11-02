# QUEUE（清仓班工作队列；由调度班次自维护、自扩队）

排序：P0 > P1 > P2 > QA。本队列由主人于 2026-11-03 00:50 重置（上一轮 22 草稿 + 75 卡挖矿 + 121 卡 QA round2 已收官并出晨报，历史见备份 `QUEUE-2026-11-02.md` 与 `LOG.md`）。

## 本班授权（主人 2026-11-03 00:50 批复）

- ✅ 直写 `library/`：草稿入库、README 重建、fix-list 修正、QUESTIONS 已授权修复（边界见 RULES.md 顶部注记）。
- ✅ 建卡两项：EchoFusion 数字不自洽窄卡；RadarOcc 消融核查后视证据立性能卡。
- ⛔ 未授权：AI Infra 立卡（5 张草案留在 `suggestions/`）；改 TODO.md（笔误主人已修）；主人的 WIP（tools/ka*.mjs、selftest、serve、web/）。

## 待办

### P0 入库流水线（最先做；每条 = 入库前逐字 QA（quote/数字/出处）→ 直写 library/ 对应目录 → validate + index）

- [ ] [入库|ADe2e] `drafts/UniAD.md`、`drafts/AutoVLA.md` → `library/ADe2e/`（素材目录已存在，配图回填；UniAD 草稿内 ⚠ 自不一致照抄加注）
- [ ] [入库|检测] `drafts/BEVDet.md`、`PillarNet.md`、`MIT-BEVFusion.md`、`RCBEVDetPP.md` → 按内容归入现有分类或新建目录（RCBEVDetPP 与 `Multimodal_Fusion/RCBEVDet.md` 同区并互链；草稿内原文疑点均照抄加注）
- [ ] [入库|骨干] `drafts/DeepCompression.md`、`LSQ.md`、`MobileNet.md`、`MobileOne.md`、`ShuffleNet.md` → 高效骨干/压缩目录（可新建）
- [ ] [入库|量化] `drafts/BRCEQ.md` → **更名 `BRECQ.md`** 入库；`drafts/QLoRA.md` → 量化目录（Table 9–12 未转录的 TODO 保留）
- [ ] [入库|VLM/VLA] `drafts/LLaVA.md`、`Qwen3VL.md`、`OpenVLA.md`、`OpenDriveVLA.md`、`OneVL.md`、`DrivePI.md` → VLM/VLA 目录（可新建）；`drafts/Alpamago.md` → **更名 `Alpamayo-R1.md`** 入库（QUESTIONS #6/#7 的版本/标题 caveat 写进笔记头部）
- [ ] [入库|其他] `drafts/COTR.md`、`MSMDFusion.md`（COTR 表号错位见 QUESTIONS #10，注记即可）
- [ ] [fix|P1] `library-fix-list.md` 六处 P1 数字正确性（EMC2/OmniQuant/HGSFusion/EchoFusion）：修笔记 + Grep 全库受影响卡 quote 同步更新/加注；OmniQuant 表格混列修完在 `claim-omniquant-note-table-mismatch` 加「笔记已修正」附注（status 不动）
- [ ] [fix|P2] fix-list 其余 23 处 + QUESTIONS #12 VQ-Map 乱码「细□度」→「细粒度」+ 回填 arXiv 号（VQ-Map 2411.01618、Ali-BEVFusion 2205.13790、MQBench 2111.03759，写入笔记头部并注记来源）
- [ ] [README|依赖入库完成] 重建 `library/README.md`（AI Infra 3 篇 + ADe2e + 本班新入库篇目，篇数核准）+ 根 README「**类型：**」来源头约定同步进「笔记约定」

### P1 建卡与核查（已授权）

- [ ] [claim|P1] EchoFusion：正文「only 0.03 less than LiDAR」vs Table 6 实差 0.45 → 数字不自洽窄卡（QUESTIONS #4）
- [ ] [verify|P1] RadarOcc：原文 SSS/DBD/S2C 消融表核查 → 授权补笔记实验章节 → 视证据立性能卡（QUESTIONS #11；原 4 张窄卡 scope 相应放宽）
- [ ] [verify|P2] BEV-Planner：开源状态（QUESTIONS #1）+ 输入分辨率 256×704 对照 PDF 复核（#2）；证据足够则直改笔记三行头部并注记
- [ ] [verify|P2] QUESTIONS #5 ShuffleNet CVF 出处 / #6 MobileNet V2/V3 PDF 对版 / #10 COTR 表号映射：核完直改笔记注记，结论回写 QUESTIONS

### P2 质量线

- [ ] [QA|round3] 121 卡终审：先 FIXED ×16 + ISSUED ×2 + 两张 note-mismatch 卡，再全量抽查；同一产物第 3 轮（规则上限，之后停）
- [ ] [cross|P2] 量化主线横向对比：QwT/OmniQuant/RepQ-ViT/PD-Quant/QD-BEV/BRECQ/PTQAT/EMC2 → `nightshift/cross/quantization.md`（哪些互证、哪些单源自报、口径差异）
- [ ] [cross|P2] Occupancy 稀疏化：SparseOcc/NJU-SparseOcc/SurroundOcc/RadarOcc → 与 `cross/4d-radar.md` 互链
- [ ] [cross|P2] VLA 线：UniAD/AutoVLA/OpenVLA/OpenDriveVLA/Alpamayo-R1/DrivePI
- [ ] [report|P2] 精读：claim-map Top5 中未覆盖的 `claim-omniquant-w4a4-llama7b-zeroshot-5265`、`claim-njusparseocc-rayiou34-fps17-beats-dense-baselines`（signoff 前置）
- [ ] [tool|P3] 新增 `tools/check-materials.mjs`：`assets/` 有素材无笔记自动检查（只新增，勿动主人 WIP）

## 进行中

（空）

## 完成

（本班完成后移入并注产出路径）
