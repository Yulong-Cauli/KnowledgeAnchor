# QA round2 — BEV-Planner 5 张 claim 卡复审

- 日期：2026-11-02
- 复审人：QA 子代理（nightshift round2）
- 来源笔记：`library/ADe2e/BEV-Planner.md`
- 方法：① 用脚本从卡文件原样抽取全部 `evidence.quote` 字节，对笔记做逐字 substring 匹配（防弯引号/全角转写误差，14/14 命中且各恰好 1 次）；② 逐条核对 locator 指向的论文章节/表号与笔记行号；③ 将卡内"我的理解/待验证"引用的每个数字与笔记 Table 1 / Table 2 / Table 6 / 正文行逐格比对；④ 检查 scope、falsifiers 可操作性、单主张性。
- 结论分布：**PASS ×5，FIXED ×0，ISSUED-MISMATCH ×0**。未修改任何 claim 卡，未签任何 signoff。

---

## 1. claim-bevplanner-egomlp-parity-l2-collision — PASS

- Quote 核验（2/2 逐字存在）：
  - "Without the perception module, Ego-MLP (ID-8), … collision rate metrics." → 笔记 L80（Table 1 caption 原句段）。locator "§4 / Table 1 caption" 正确。
  - "| 8 | Ego-MLP | - | ✓ | 0.15 | 0.32 | 0.59 | 0.35 | 0.00 | 0.27 | 0.85 | 0.37 | 0.27 | 2.52 | 6.60 | 2.93 | （原表为空） |" → 笔记 L71，与 Table 1 ID-8 行逐格一致（含末列笔记自注"（原表为空）"，source 为笔记，逐字引用成立）。locator "§4 / Table 1 ID-8 行" 正确。
- 数字复核：卡内 ID-8 L2-Avg 0.35 / Colli-Avg 0.37、CCR-Avg 2.93、UniAD 1.93（ID-1）、VAD 2.47（ID-6）均与笔记表格一致。
- scope：数据集/有效样本（5119/6019，Appendix B）、统一实现 0.1m 网格、Ego-MLP 输入、防泄露配置均写清。falsifiers 可操作（2 倍阈值、标签泄露检查）。单一主张（"持平"限定在 L2/碰撞率两旧指标，卡内显式声明不外推到 CCR）。
- `note:` 锚 `#33-主结果` 为前缀式锚，指向笔记 §3.3，符合库内惯例。

## 2. claim-bevplanner-egostatus-injection-closes-gap — PASS

- Quote 核验（3/3）：
  - "we argue that methods utilizing ego status are not directly comparable…" → 笔记 L109，位于笔记 §3.5（a）"Ego status plays a key role（§4.3）"，locator 正确。
  - "| 6 | VAD-Base | ✓ | ✓ | 0.17 | … | 2.47 | Official |" → 笔记 L69，ID-6 行逐格一致；locator 注"BEV+planner 注入"与 ✓/✓ 列含义一致。
  - "| 4 | VAD-Base | ✗ | ✗ | 0.69 | … | 3.82 | Reproduce |" → 笔记 L67，ID-4 行逐格一致；locator 注"无注入"正确。
- 数字复核：ID-3 0.46/0.37、ID-6 0.37/0.33、Ego-MLP 0.35/0.37、ID-1 1.03/0.77、ID-4 1.25/1.09 全部与 Table 1 一致；"仅 BEV 注入（ID-2/ID-5）介于两者之间"经核对 L2 排序 1.25>0.72>0.37、1.03>0.66>0.46 成立。
- scope/falsifiers：ckpt source 口径已声明（复现 vs 官方）；falsifier 覆盖"不注入也追平"与"提升来自评测实现差异"两条可证伪路径。卡内还显式提示 Table 1 UniAD 无后处理口径与 Table 6 不可混用，与笔记 §4 提示一致。
- 备注（非缺陷）：title 把"追平"与论文"不可直接比较"结论并列，后者以论文原句为证据、falsifiers 聚焦追平关系本身，仍属单一可证伪主张。

## 3. claim-bevplanner-ego-velocity-dominates-planning — PASS

- Quote 核验（3/3）：
  - "blanking all the camera input in VAD [16] … predicted trajectory." → 笔记 L20，§1 三个缺点之（3），locator 正确。
  - "In contrast to the minor impact of image corruption … planning results." → 笔记 L101（Table 2 caption 原句段），locator "§4 / Table 2 caption" 正确。
  - "| VAD-Base | - | v×0.0 | 3.81 | 6.19 | 8.48 | 6.16 | 1.00 | 6.76 | 16.18 | 7.98 | 0.19 | 0.41 | 3.10 | 1.23 | 45.5 | 47.0 |" → 笔记 L96，v×0.0 行逐格一致（× 字符为 U+00D7，卡与笔记一致）。
- 数字复核：Blank 行 L2-Avg 0.46、基线 0.37、NDS/mAP 0.0/0.0；v×0.5 → 3.19；v=100 m/s → 208；速度扰动下 NDS/mAP 45.5/47.0 不变；v×0.0 时 CCR 1.23；Appendix E 无 ego status 时 L2-Avg 4.33 / Colli-Avg 7.63——全部与笔记一致。
- scope：模型/权重（官方 VAD-Base、planner 注入）、扰动集合、指标均写清；falsifiers 带量化阈值，可操作。卡内两条限定（ego status 在场前提、CCR 对静止轨迹的盲区）与笔记 §3.4/Appendix E 一致，防止外推。

## 4. claim-bevplanner-nuscenes-straight-driving-imbalance — PASS

- Quote 核验（2/2）：
  - "73.9% of the nuScenes data involve scenarios of driving straightforwardly" → 笔记 L18（§1，Fig. 2），locator 正确。
  - "in straight-driving scenarios (87% of all evaluation samples), … straight-driving strategy" → 笔记 L156（Appendix E Table 4 说明段），locator "Appendix E（评测样本口径）" 正确。
- 数字复核：26.1% 补数与笔记一致；卡内显式区分 73.9%（数据整体）与 87%（评测样本）两个分母，避免混用——这正是该卡最容易出错处，处理正确。
- scope：统计对象（nuScenes 数据分布，Fig. 2）与归因对象（开环评测）写清；falsifier 1（重算占比 <60%/子集问题）与 falsifier 2（压低直行占比后捷径是否消失）分别检验统计量与因果链，可操作。

## 5. claim-bevplanner-unidad-postprocessing-raises-ccr — PASS

- Quote 核验（4/4）：
  - "Our new metrics, the CCR reveal … running off the road." → 笔记 L147（笔记 §3.5(d)，对应论文 §4.3 "New metrics will bring new conclusions"），locator 正确。
  - "| UniAD | ✓ | 0.77 | 0.51 | 7.83 |" / "| UniAD | ✗ | 0.66 | 0.62 | 1.72 |" → 笔记 L144/L145，Table 6 两行逐格一致，P.P. ✓/✗ 定位正确。
  - "In this paper, we report the results of UniAD without its post-processing by default." → 笔记 L168（笔记标注为 §4.3 原句），locator "§4.3（默认报告口径）" 正确。
- 数字复核：0.62→0.51（碰撞率）、1.72→7.83（CCR）与 Table 6 一致；交叉验证 Table 1 ID-2（0.66/0.62/1.72）与 Table 6 P.P. ✗ 行吻合、Table 2 基线行与 Table 1 ID-5 吻合、Table 3 首行与 Table 1 ID-10 吻合——笔记内部无错位（EMC2 式表格错位未复现）。GoStright CCR-Avg 8.62 为 Table 1 CCR 列最大值，"全表最差"表述成立。
- scope：权重（官方开源）、开关配置、指标口径（Table 6 Avg 三列）写清；falsifiers 覆盖复现不成立、实现差异、CCR 定义误判三条路径。卡内口径警示与笔记 §4 提示一致。

---

## 其他观察（无需改卡）

1. **前缀式 note 锚**：卡 1–3 的 `note:` 锚（`#33-主结果`、`#35-讨论`、`#34-图像退化-vs-ego-status-扰动`）非完整 GitHub slug（标题含"（Table 2，§4；locator：Table 2）"后缀），但为库内既有惯例（如 `#3-实验结果` 同式），且均无歧义指向正确章节，不判错。
2. **笔记已自认的一处口径出入**：笔记 L157 记录 Appendix B 轨迹平滑度表内 L2（0.30/0.52/0.85/0.56）与 Table 1（0.83/0.55）略有出入，笔记已加注"照抄附录原表"，属论文自身两表差异而非转写错误，且无任何卡引用该表，不另立 mismatch 卡。
3. **卡 1 quote 2 含笔记自注"（原表为空）"**：为笔记表格行原文（笔记已声明原表该单元格为空），source 为 L1 笔记，逐字引用成立，不判错。

## 验证

- `node tools/ka.mjs validate` → 首跑 `OK: 105 claim(s)`，复审结束复跑 `OK: 109 claim(s) validated`（计数变化来自同班次并行新增的 PTQAT/EMC2 卡，与本轮复审无关；两次均通过）。
- 5 张卡均在 `index/claims.jsonl` 中，id 与文件名一致。
- 本轮只新增本报告（`nightshift/qa/round2-bevplanner.md`）；`git status` 中 TODO/LOG/QUEUE 等改动为并行班次所为，非本轮产生。
- 未触碰任何 `verified/refuted/stale` 卡与 signoff；未修改 QUEUE/LOCK/RULES/AGENTS/TODO/library；未 git 提交。
