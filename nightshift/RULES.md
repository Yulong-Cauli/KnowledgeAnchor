# nightshift 规则（所有调度班次与子代理必读）

## 你可以

- 创建/修改 `status: asserted` 的 claim 卡（`claims/`，文件名与 id 一致，kebab-case；格式参照 `templates/claim.md` 与 `claims/claim-emc2-orin-sub400ms-leading-accuracy.md`）。
- 在 `nightshift/` 下写报告、草稿、对比、建议（`reports/`、`drafts/`、`cross/`、`suggestions/`、`verify/`）。
- 唯一直写 `library/` 的例外：`library/ADe2e/BEV-Planner.md`（用户点名的整理任务，已授权）。

## 铁律

1. 绝不触碰 `verified / refuted / stale` 卡与任何 `signoff`；绝不把 `asserted` 改成 `verified`；已提交的 claim id 一律不改名。
2. 不修改 `library/`（除上述唯一例外）、`TODO.md`、`AGENTS.md`、`README.md`、`tools/`、`schema/`、`templates/`、`index/`（index 只能由 `node tools/ka.mjs index` 重建）。
3. 不编造 source / locator / quote：quote 必须从文件逐字复制并用 Grep 验证存在；网络内容必须是本次实际抓取到的，记录 URL 与抓取日期；抓取失败 → 降级为 asserted + falsifiers + 「待人工核对」，或放弃该任务并在摘要注明。
4. 每张卡必有 `scope` 与 `falsifiers`，一卡只写一个可证伪主张；措辞遵守 AGENTS.md 引用规则（「论文声称 / 尚未独立验证」，不写成事实）。
5. 子代理不 git commit / push（由调度班次统一提交）；任何人不得 rebase、reset、checkout 丢弃、删除既有文件、安装依赖。
6. 拿不准的写进返回摘要「遗留问题」，由调度班次转 `nightshift/QUESTIONS.md`，不要替主人做决定。

## 质量标准

- 一张引文扎实的卡好过五张含糊的卡。
- 数字、表格行抄写后必须与原文再对一遍——EMC2 笔记表格错位（claim-emc2-note-table-mismatch）就是前车之鉴。
- L1 笔记遵守库内约定：三行头部（出处会议/是否开源/关键词）+ 编号章节（概述→方法→实验→核心结论）+ 数字带章节 locator；配图放 `assets/<论文名>/`，目录不存在就文末留 TODO。
- 建卡前先确认同 id 不存在（`ls claims/` 或 Grep），已存在则改为审计/补充该卡。
