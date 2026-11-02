# nightshift 规则（所有调度班次与子代理必读）

> **2026-11-03 班前主人授权更新**：本班开放 `library/` 直写与两项指定建卡；AI Infra 立卡**仍未授权**。

## 你可以

- 创建/修改 `status: asserted` 的 claim 卡（`claims/`，文件名与 id 一致，kebab-case；格式参照 `templates/claim.md` 与 `claims/claim-emc2-orin-sub400ms-leading-accuracy.md`）。
- 在 `nightshift/` 下写报告、草稿、对比、建议、verify。
- **直写 `library/`（2026-11-03 主人授权）**，仅限：
  1. `nightshift/drafts/` 的 22 篇草稿经入库前 QA 后写入对应目录（Alpamago→`Alpamayo-R1.md`、BRCEQ→`BRECQ.md` 更名入库）；
  2. `library/README.md` 重建与根 README「笔记约定」同步；
  3. 按 `nightshift/suggestions/library-fix-list.md` 修正笔记（含 VQ-Map 乱码、OmniQuant 表格混列），并回填已查证的 arXiv 号；
  4. RadarOcc 补实验章节（先核查原文消融表）、BEV-Planner 头部复核修正、QUESTIONS 中已确认事项的笔记修正。
- 新建卡（本班仅授权两项）：EchoFusion「正文 0.03 vs Table 6 实差 0.45」数字不自洽窄卡；RadarOcc 消融核查后视证据立性能卡。
- 新增 `tools/check-materials.mjs`（有素材无笔记自动检查）。**只允许新增文件**，不得改 `tools/ka.mjs`、`ka-lib.mjs`、`selftest.mjs`、`serve.mjs` 与 `web/`——主人有未提交 WIP。

## 铁律

1. 绝不触碰 `verified / refuted / stale` 卡与任何 `signoff`；绝不把 `asserted` 改成 `verified`；已提交的 claim id 一律不改名。
2. 不修改：`TODO.md`（主人已修正笔误）、`AGENTS.md`、根 `README.md`、`schema/`、`templates/`、`index/`（index 只能由 `node tools/ka.mjs index` 重建）、主人的未提交 WIP（`tools/ka.mjs`、`tools/ka-lib.mjs`、`tools/selftest.mjs`、`tools/serve.mjs`、`web/` 全部）。`library/` 仅限上列四种授权改动。
3. 修正笔记时，凡被 claim 卡 evidence 引用的行被改动：Grep 全库受影响 quote，同步更新卡内引用或在卡内加注；结论会语义反转的先写 QUESTIONS 不动卡。`*-note-table-mismatch` 类卡在笔记修复后加「笔记已修正」附注，status 不动。
4. 不编造 source / locator / quote：quote 必须从文件逐字复制并用 Grep 验证存在；网络内容必须是本次实际抓取到的，记录 URL 与抓取日期；抓取失败 → 降级为 asserted + falsifiers + 「待人工核对」，或放弃该任务并在摘要注明。
5. 每张卡必有 `scope` 与 `falsifiers`，一卡只写一个可证伪主张；措辞遵守 AGENTS.md 引用规则（「论文声称 / 尚未独立验证」，不写成事实）。
6. 子代理不 git commit / push（由调度班次统一提交）；任何人不得 rebase、reset、checkout 丢弃、删除既有文件、安装依赖。
7. 拿不准的写进返回摘要「遗留问题」，由调度班次转 `nightshift/QUESTIONS.md`，不要替主人做决定。

## 质量标准

- 额度是拿来换质量的：没有原文依据的 claim 一张都不许建，宁可去做精读/对比报告；绝不为了消耗额度往 `claims/` 灌水。
- 一张引文扎实的卡好过五张含糊的卡。
- 数字、表格行抄写后必须与原文再对一遍——EMC2/OmniQuant 笔记表格错位就是前车之鉴。
- L1 笔记遵守库内约定：三行头部（出处会议/是否开源/关键词）+ 编号章节（概述→方法→实验→核心结论）+ 数字带章节 locator；配图放 `assets/<论文名>/`，目录不存在就文末留 TODO。
- 草稿入库前必须逐字核验 quote 与数字（草稿未经 round2 QA，按新笔记标准验收）；入库后 `node tools/ka.mjs validate` + `index` 必须全绿。
- 建卡前先确认同 id 不存在（`ls claims/` 或 Grep），已存在则改为审计/补充该卡。
