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
- [x] 样板1 `claim-gaussianfusion-val-2p6nds-over-bevfusion`（实验结果）：scope 移对照行细节、falsifier 分层（原文核查/复现/对照口径）、新增归因缺口分析 + 阶梯对照下一步；10→4 条 evidence（新增 2 条笔记 Table 2 行），全部逐字命中
- [x] 样板2 `claim-bevplanner-ego-velocity-dominates-planning`（机制/行为）："若成立"段从 nuScenes 开环模型约束回 VAD-Base、跨模型移迁移任务；新增"输出敏感性 vs 感知弱化"两解释分层 + 2×2 机制检查；引用 11-02 精读报告为历史材料
- [x] 样板3 `claim-qlora-nf4-info-theoretic-optimal-datatype`（理论）：实抓原文 alttext 实锤 2^k+1/2^{k−1} 读法与 Eq.4 全式；实抓 bnb main 实现硬编码表逐字节一致 + 公式复算命中 1.1e-7；发现 Eq.4 字面网格不命中（0.108 vs 0.0796）→ 待决 #48；新增 af4/2306.06965 最优性争议线索
- [x] 三样板通过任务书阶段 A.5 桌面检查（记录见 sample-notes.md §4）→ `nightshift/reports/sample-notes.md` 已定稿
- **P1 解锁（01:10 fire-0035）**。P0 三计数：改动 3 / 保留 0 / 待决 1（#48）。validate OK(191)，commit 38232f3。

### P1 主题批（每批 8–16 卡，2 并发子代理；样板定调后解锁）

- [ ] 批1 mismatch/历史事件卡（*-note-table-mismatch + 带「待主人裁定/笔记已修正」附注卡；红线 4 历史引文规则适用）——B1 在跑
- [ ] 批2 量化主线 = B2a✅（改动6/保留11/待决0，commit 93879f5）+ B2b 在跑（omniquant/pdquant/qdbev/repqvit/sliderquant/qlora 18 卡）
- [ ] 批3 bevplanner 机制系 + VLA（VLM_VLA 7 篇）
- [ ] 批4 检测/融合（BEV_Detection/Multimodal_Fusion/RadarDistill…）
- [ ] 批5 Occupancy（3D_Occupancy）
- [ ] 批6 骨干网络（Efficient_Backbone）
- [ ] 批7 经典检测与零散（Classical_Detection/QA dataset/其他）
- 分组由调度班按实际卡面核对后微调；无对应主题的卡归入相邻批，不得遗漏；收班前 `ls claims/ | wc -l` 与三计数总和核对全覆盖。

### P2 对齐批（样板定稿后）

- [x] templates/claim.md 正文提示换七节样板结构（commit 2055b51）
- [x] web/app.js NEW_CARD_BODY 同步 + 阶段 C 字段显示说明（status/stance/scope/quote/falsifiers/related/signoff 加 hint，存储键不动）；selftest PASS

### P3 检查批（P1+P2 全清后；全量深核不晚于 07:00 开始，否则程序全检+抽样并如实注明覆盖范围）

- [ ] 程序全检（调度班亲跑）：① frontmatter 受保护行 diff 为空 ② 改动卡清单与 diff 文件清单对账 ③ quote Grep library/ 全检
- [ ] 子代理深核（新代理）：PASS/FIXED/ISSUED；命题漂移/scope 扩大/推断归作者/历史引文/falsifier 越界/下一步空洞化重点抓

### P4 收尾批

- [ ] `ka.mjs validate` → `selftest.mjs` → `git diff --check` → `ka.mjs index`
- [ ] `tmp_docs/03-Claim卡片内容改进实施结果.md`（任务书第 6 节交付清单，含 P3 QA 计数与覆盖范围）→ commit

## 完成

（本班记录追加于此，格式：[fire-XXXX|HH:MM✅] [批号] 内容 + 三计数）
