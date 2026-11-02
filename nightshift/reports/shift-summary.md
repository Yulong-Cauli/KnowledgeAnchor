# 值班总账摘要：2026-11-03 凌晨班（fire-0106 → fire-0619）

- **日期**：2026-11-03 · **性质**：nightshift report（R3，晨报前）；只读盘点，仅新增本文件，未 git 提交。
- **数据来源**：`nightshift/LOG.md` 流水（fire-0106 01:25 起，记录至 fire-0547 06:20；fire-0619 为本摘要所属收尾批次，尚无流水条目）、`nightshift/QUESTIONS.md`、`nightshift/QUEUE.md`、`nightshift/qa/`、`nightshift/reports/`、`nightshift/verify/`、`ls claims/` 实数。全部数字逐条标注出处；本班结束时 `node tools/ka.mjs validate` → `OK: 172 claim(s) validated`。
- **token 消耗**：本班九条流水相加 ≈131.6M（LOG L68–L76：2.9+7.4+19.3+14.9+12.8+18.2+30.8+13.0+12.3）。

## 1. 产出计数

| 项 | 数 | 出处 |
| --- | --- | --- |
| 入库笔记 | **22 篇**（fire-0106 批1 ADe2e×2+量化×2、批2 骨干×5+其他×2；fire-0143 检测×4+VLM/VLA×7）+ 笔记回链 1（RCBEVDet） | LOG L68–L70 |
| claim 库 | **114 → 172**（`ls claims/ \| wc -l` 实数；任务书预估 ~180 偏高）。+58 = EchoFusion 窄卡 1 + RadarOcc-sss 性能卡 1 + pdquant mismatch 卡 1 + R2 扩队补卡 55 | LOG L70–L76；QUEUE L53/L56 |
| QA | **三轮**：①入库前逐篇草稿 QA（22/22，引文/数字抽查逐篇记录）②round2 存卡复审 8 批 121 卡 ③round3 全库终审 116 张 | LOG L56–L67；qa/round3-final.md |
| cross 对比 | **4 篇**：`cross/4d-radar.md`（00:52，33 引文程序验证）、`quantization.md`（fire-0313）、`vla.md`（fire-0345）、`occupancy-sparsification.md`（fire-0423） | LOG L7/L72–L74 |
| 深度精读 | **3 篇**：bevplanner（336 行）、omniquant-w4a4（314 行）、njusparseocc-rayiou（290 行）；另全库 claim 地图 claim-map.md（248 行，114 卡盘面） | reports/ 目录 wc -l |
| fix-list | **全清**：F1–F29（17 篇 29 条）——P1 fire-0143、P2 fire-0238（23+3 项）、追加 PD-Quant/QwT fire-0345；QUEUE 授权行标「✅ P1+P2 全清」 | suggestions/library-fix-list.md 头部；QUEUE L7 |
| README | `library/README.md` 重建（fire-0345，154 行改动） | git show 2b8b63d |
| 工具 | 新增 `tools/check-materials.mjs`（fire-0547，只增不改 ka.mjs）；首跑：53 素材目录 / 57 笔记 / 282 图，118 图被引用、164 未引用 | QUESTIONS #40 |
| 笔记修正 | **26 篇次**（LOG：fire-0143 3 + fire-0238 15 + fire-0345 6 + fire-0510 2）；另 RadarOcc 补实验章节 72 行（fire-0238） | LOG L70–L75 |

注：QUEUE fire-0547 小结行写「R2 扩队 21 篇 46 卡」，与逐条记录（fire-0510 29 + fire-0547 26 = 55 卡）不符，本摘要以逐条记录与 validate 计数（172）为准。

## 2. signoff 材料就绪清单（主人最关心）

四套材料齐备；**全部卡片仍为 `status: asserted` / `signoff: null`，签署只能由主人手工完成**。

| # | 卡（均 asserted） | 报告路径 | 强度 | 剩余人工动作 |
| --- | --- | --- | --- | --- |
| ① | claim-qwt-r2-gate-nonregression | `nightshift/verify/claim-qwt-r2-gate-nonregression.md`（2026-11-02，CVF 正式版+补充材料+官方代码） | **部分支持**：R²≤0 置零分支无条件成立；R²>0 分支仅校准集意义，测试集无保证（supp Table 4 自带逐数据集小退化 BoolQ −0.03 / HellaSwag −0.51） | 是否按报告 §4 拆分主张/替换 evidence（卡 quote 2 系笔记概括非论文原话）后由主人决定签署；报告本身不构成 verified 依据 |
| ② | claim-omniquant-w4a4-llama7b-zeroshot-5265 | `nightshift/reports/omniquant-w4a4-deep-read.md`（2026-11-03，arXiv v3 实抓） | **★★★**（Table 2/A2 双口径互证，笔记修正后零差异；52.65 系六任务平均，"5 数据集"系任务书笔误） | 主人读报告后手工 signoff（QUESTIONS #37 已定案口径） |
| ③ | claim-njusparseocc-rayiou34-fps17-beats-dense-baselines | `nightshift/reports/njusparseocc-rayiou-deep-read.md`（2026-11-03，v1–v5 全版本实抓） | 核心数字 34.0/17.3/7帧 **★★★**；**卡整体 ★★**——基线行 falsifier 已触发并修复（camera-ready 实为 BEVFormer 32.4/3.0、FB-Occ 33.5/10.3；笔记 L93/L94 已由 fire-0510 修正），FPS 倍数 3.3×/7.5× → 1.68×/5.77× | 卡 title 阈值 33.7→33.5 与倍数措辞需主人过目（#35）；基线行产生方式建议提 issue 后回填（#39）；**不更新卡不能签** |
| ④ | claim-bevplanner-egomlp-parity-l2-collision（枢纽：被其余 4 卡 related） | `nightshift/reports/bevplanner-deep-read.md`（2026-11-02，69 条引文 grep 验证） | 枢纽 parity 卡本身 **★★**（Table 1 ID-8 单表 + "on par" 定性句）；链内 ★★★ 为 injection-closes-gap 与 velocity-dominates 两卡（受控对比+干预实验）——任务书称"枢纽卡 ★★★"，按报告实评级为 ★★，特此如实标注 | 主人 signoff 决策；注意报告基于笔记转录，对论文原文的独立核验尚未发生；parity 若被推翻其余 4 卡需连带重审 |

支撑材料：`nightshift/reports/claim-map.md`（Top5 与全库强度分级）；QA round2 五卡全 PASS（qa/round2-bevplanner.md）。

## 3. 待主人拍板 Top5（按影响排序）

1. **cyclist 卡反转**（QUESTIONS #24，影响最大）：HGSFusion §4.1 全表按 arXiv:2412.11489v1 修正后，Cyclist 87.49 > PointPillars 85.07——`claim-hgsfusion-cyclist-roi-ap-below-all-baselines` 主张不成立。卡按铁律 3 未动，降级/改写由主人定。
2. **BRECQ 列出处未命中**（#28）：PD-Quant 笔记中 BRECQ 列、ResNet-50 行、Min-Max/Cosine/W4A2 列、+DC 行 53.33/53.14 在 v1/v3/CVF 任何版本均不存在，三张 pdquant 数值卡受累。fire-0345 已按 cross 版本化数字修笔记并立 `claim-pdquant-note-table-mismatch`；剩余：主人追认修法。
3. **两张 note-artifact 卡转 stale**（#25）：`claim-centernetpoints-note-citation-artifacts`、`claim-sparseocc-note-conversational-residue` 的笔记残留已修复、falsifier「已修复」分支成立、卡内已加附注；status 处置（stale）只能主人手工。
4. **NJU 基线行产生方式 issue**（#35/#39）：Table 1 基线行系复训还是重评测，论文无明文（已排除"引用各自原文"）；建议向 MCG-NJU/SparseOcc 提 issue 后回填主卡；L99/L100 两处口径注仍未修（本轮授权仅 L93/L94）。
5. **素材清理策略**（#40）：check-materials 首跑 282 图仅 118 被引用（164 未引用）、素材无笔记×3、笔记无素材×11；是否清理/豁免"无图笔记"（影响脚本 exit 码策略）由主人定。

备选入榜：#26 RadarOcc DBD 卡是否降级（DBD 消融增益 ≤0.7 且方向混杂）；#30 BRECQ 建卡已由 R2 扩队完成 3 张窄卡，自动了结。

## 4. 数据质量线总结

- **笔记修正 26 篇次**（3+15+6+2，见 §1），全部对应 fix-list F1–F29 或 QUESTIONS 授权条目；无授权范围外改动。
- **笔记缺陷卡共 6 张**（`ls claims/ | grep` 实数）：note-table-mismatch ×4（**emc2、omniquant、echofusion、pdquant**）+ note-artifact ×2（**centernetpoints** 引用编号残留、**sparseocc** 对话式残留）；后两张已随 fix 修复并加注（#25）。
- **三轮 QA PASS 率演进**：round2 八批 121 卡——PASS 104（86%）/ FIXED 16 / ISSUED 2（LOG L67 总账），重灾区为批5「量化+融合」16 卡仅 PASS 4、FIXED 12；批6/批7/补批回升至 15+1、11/11、24/24 全绿（LOG L59–L63、L67）。round3 全库终审 116 张：351 条库内 quote 全量逐字校验，必审层 36 卡 PASS 33 / FIXED 3，抽查层 30 卡全 PASS；15 条历史引文 mismatch 全部「笔记已修正 + 卡内加注」在案，无一例未解释（qa/round3-final.md L4、L75）。R2 扩队新卡 55 张逐条 Grep 验证（60+48+78 与 122 条 quote 记录，QUEUE L53/L56）。

## 5. 引文与数字纪律

- **全部修改先实抓后落笔**：arXiv v1/v3/v5 PDF、CVF Open Access、GitHub API/README，URL 与抓取日期逐条记录——出处核查四条定案（#31 BEV-Planner GitHub API+PDF、#32 ShuffleNet CVF、#33 MobileNet CVF+arXiv v5、#34 COTR PDF/CVF，全部 2026-11-03）；三份 deep-read 报告均有「联网抓取记录」表；verify 报告 9 个来源全部带 URL+日期。
- **数字版本化**：PD-Quant/QwT 按三版本（v1/v3/CVF）对版修正（fire-0345）；NJU 基线行按 camera-ready v5 修正（fire-0510）；SparseOcc「80%/67%」双口径并存并加注（#36/#38，拒绝盲改）。
- **抓取失败即降级**：BEV-Planner GitHub 首抓超时改走 API 复核定案；无据候选两处被子代理主动否决不建卡（QUEUE L53）。
- 本摘要内每一条计数/结论均标注（LOG 行号 / QUESTIONS 编号 / 文件路径）；涉及 claim 的表述一律保持 `asserted`（"论文声称，尚未独立验证"），未动任何 status / signoff / id。
