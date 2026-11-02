# TODO

> 只记未完成事项。完成一项就勾掉或删除；不确定要不要做的放进「候选池」。

## 优先

- [ ] 核对 [claim-qwt-r2-gate-nonregression](claims/claim-qwt-r2-gate-nonregression.md)：读 QwT §3 原文，找“校准集 R² > 0 但测试集退化”的反例；在 2026-11-15 前决定保留、改写还是降级。
- [ ] 重建 [library/README.md](library/README.md)：补 `AI Infra/`（已有 3 篇）和 `ADe2e/`（目前只有素材），修正篇数。
- [ ] 给 `ADe2e/UniAD`、`ADe2e/AutoVLA` 写 L1：现在 [library/ADe2e](library/ADe2e) 下只有表格图，没有笔记。

## 待读 / 待写 L1

以下候选都已有部分素材（图或 PDF），但索引里没有独立笔记；不必全写，按当前项目需要挑。

- [ ] 端到端 / VLA：UniAD、AutoVLA。
- [ ] BEV / 3D 检测：BEVDet、PillarNet、MIT-BEVFusion、RCBEVDet++。
- [ ] 高效骨干 / 压缩：Deep Compression、LSQ、MobileNet / V2 / V3、MobileOne、ShuffleNet。
- [ ] VLM / VLA：LLaVA、Qwen3-VL、OpenVLA、OpenDriveVLA、OneVL、DrivePI、Alpamago。
- [ ] 其他：BRCEQ、COTR、MSMDFusion、QLoRA。
- [ ] 零散素材：CameraParams、KITTI、Misc（不一定是论文，按需整理）。

## 待提炼 / 待核对 L2

一条 claim 只写一个可证伪主张；下列“结论”都要先核对原文，再定 `scope` 和 `falsifiers`。

- [ ] **QwT**：已有 [claim 卡](claims/claim-qwt-r2-gate-nonregression.md)，当前 `asserted`；核对“R² 门控保证不劣于原 PTQ”是否只在校准集意义下成立。
- [x] **PTQAT**：已起草 [claim-ptqat-w4-outperforms-full-qat-fewer-params](claims/claim-ptqat-w4-outperforms-full-qat-fewer-params.md) 与 [claim-ptqat-w8a8-tensorrt-accuracy-recovery](claims/claim-ptqat-w8a8-tensorrt-accuracy-recovery.md)；数字已对照 arXiv:2508.10557 v1（Table 1/5，val split）核对一致。
- [x] **EMC2**：已起草 [claim-emc2-orin-sub400ms-leading-accuracy](claims/claim-emc2-orin-sub400ms-leading-accuracy.md)；核对发现笔记 §5.1 对比表与 arXiv v1 不一致（延迟列混淆 A4000/Jetson、个别 AP 取错难度列），另立 [claim-emc2-note-table-mismatch](claims/claim-emc2-note-table-mismatch.md)。
- [ ] **RadarOcc**（可选）：从 [笔记](library/3D_Occupancy/RadarOcc.md) 提炼：旁瓣感知稀疏化 + 球坐标编码是否稳定优于笛卡尔基线；先读实验部分，再决定是否值得立 claim。

## 待验证 / 待签署 L3

- [ ] 目前还没有 `verified` claim。QwT 是第一条候选：完成独立复核后，由你手工填 `signoff`（`by` / `at` / `method` / `evidence_hash`）；Agent 不代填。
- [ ] 若想先跑通流程，选一条低风险、可复现的 claim 作为第一个 `verified` 样例，而不是从争议最大的 QwT 开始。

## 维护

- [x] 首次提交脚手架：`README.md`、`AGENTS.md`、`claims/`、`schema/`、`templates/`、`tools/`、`TODO.md`。已在 `274f361` 等提交完成。
- [ ] 把根 README 的 `**类型：**` 来源头约定同步到 [library/README.md](library/README.md) 的「笔记约定」。
- [ ] 旧仓库 `D:\Research\Notes` 仍有未提交改动（`README.md`、`.zcodeignore`、`AI Infra/`、`QA dataset/`）；等新库稳定后再决定归档，不要直接删。
- [ ] 定期跑 `node tools/ka.mjs validate`、`index`、`review`；claim 状态与 TODO 不一致时，以 claim 卡为准。

## 候选池

- [ ] 把 4D 雷达相关笔记（RadarOcc、R4Det、SGDet3D、HGSFusion）做一次横向对比：哪些结论互相支持，哪些只是单篇论文声称。
- [ ] 检查 [AI Infra](library/AI%20Infra) 三篇 PR 笔记是否适合提炼 claim；版本依赖强、复现成本高的内容可能更适合留在 L1。
- [ ] 为 `library/` 建立“有素材无笔记”的自动检查，避免每次手工盘点。
