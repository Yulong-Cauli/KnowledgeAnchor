# QUEUE（02 任务书整理班工作队列；由调度班次自维护）

重置于 2026-11-05 00:35（fire-0035）。本班任务：执行 `tmp_docs/02-Claim卡片内容改进实施任务.md`——全库 191 张 asserted 卡内容质量整理（样板先行 → 分主题审阅 → 检查复审 → 收尾报告）。授权与红线见 automation-4801da75 主提示词 + RULES.md 顶部 2026-11-05 注记。旧队列备份：`QUEUE-2026-11-03.md`。

## 本班授权（覆盖 RULES.md 2026-11-03 条款）

- library/ 本班**只读**；发现笔记问题 → 待决清单，不改笔记。
- templates/claim.md、web/app.js NEW_CARD_BODY：P0 样板定稿后授权修改（web 改前 Read 现状，ca81104 刚 overhaul）。
- 允许实抓外部原文核对（记录 URL+抓取日期）；「未检得」须班内二次实抓复核才能作为改写依据。
- 拆卡仅限有准确来源、能独立成立的主张；新卡 asserted + related 双向关联；旧卡 id/命题/文件名不动。
- status 一律保持 asserted；id/文件名/stance/review_due/signoff 一律不动。

## 基线（P3 复审输入，本节不得修改）

- 起始 commit：`ca8110482be471227d8df0f79bcfbd439b02e1e8`（ca81104）
- 工作区状态：仅 `tmp_docs/TODO.md` 未跟踪（主人 WIP，禁动禁提交）
- claim 库：191 张，全部 `status: asserted`、`stance: watch`；signoff 全部 null 占位
- review_due 分布：103×2026-12-02、63×2026-12-03、11×2027-02-02、7×2026-11-30、4×2026-12-01、1×2026-11-15；2 张无 review_due

## 进行中

（空）

## 待办

### P0 样板批（调度班亲自深核，不派子代理）

- [x] 盘点 + 基线 commit 记录（见上节；191 卡 signoff null 抽查 gaussianfusion 确认）
- [ ] 样板1 `claim-gaussianfusion-val-2p6nds-over-bevfusion`（实验结果；外部数字需实抓核查才可改写）
- [ ] 样板2 `claim-bevplanner-ego-velocity-dominates-planning`（机制/行为观察；结论约束回原配置）
- [ ] 样板3 `claim-qlora-nf4-info-theoretic-optimal-datatype`（理论主张；公式符号须对照原文）
- [ ] 三样板通过任务书阶段 A.5 桌面检查 → `nightshift/reports/sample-notes.md` → QUEUE 写「P1 解锁」

### P1 主题批（每批 8–16 卡，2 并发子代理；样板定调后解锁）

- [ ] 批1 mismatch/历史事件卡（*-note-table-mismatch + 带「待主人裁定/笔记已修正」附注卡；红线 4 历史引文规则适用）
- [ ] 批2 量化主线（BRECQ/QLoRA/LSQ/OmniQuant/PD-Quant/QwT/RepQ-ViT/DeepCompression/MQBench…）
- [ ] 批3 bevplanner 机制系 + VLA（VLM_VLA 7 篇）
- [ ] 批4 检测/融合（BEV_Detection/Multimodal_Fusion/RadarDistill…）
- [ ] 批5 Occupancy（3D_Occupancy）
- [ ] 批6 骨干网络（Efficient_Backbone）
- [ ] 批7 经典检测与零散（Classical_Detection/QA dataset/其他）
- 分组由调度班按实际卡面核对后微调；无对应主题的卡归入相邻批，不得遗漏；收班前 `ls claims/ | wc -l` 与三计数总和核对全覆盖。

### P2 对齐批（样板定稿后）

- [ ] templates/claim.md 正文提示与样板同步（保持必填证据规则与签署占位约定）
- [ ] web/app.js NEW_CARD_BODY（约 841 行）+ 阶段 C 字段显示说明（改前 Read ca81104 后现状）

### P3 检查批（P1+P2 全清后；全量深核不晚于 07:00 开始，否则程序全检+抽样并如实注明覆盖范围）

- [ ] 程序全检（调度班亲跑）：① frontmatter 受保护行 diff 为空 ② 改动卡清单与 diff 文件清单对账 ③ quote Grep library/ 全检
- [ ] 子代理深核（新代理）：PASS/FIXED/ISSUED；命题漂移/scope 扩大/推断归作者/历史引文/falsifier 越界/下一步空洞化重点抓

### P4 收尾批

- [ ] `ka.mjs validate` → `selftest.mjs` → `git diff --check` → `ka.mjs index`
- [ ] `tmp_docs/03-Claim卡片内容改进实施结果.md`（任务书第 6 节交付清单，含 P3 QA 计数与覆盖范围）→ commit

## 完成

（本班记录追加于此，格式：[fire-XXXX|HH:MM✅] [批号] 内容 + 三计数）
