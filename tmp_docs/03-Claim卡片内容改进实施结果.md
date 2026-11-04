# Claim 卡片内容改进实施结果

执行：2026-11-05 00:35–06:40 夜间整理班（automation-4801da75，02 任务书实施）。基线 commit `ca81104`（2026-11-05 白天主人 overhaul web 后状态）→ 终态 `3409d85`。本报告按任务书第 6 节交付清单撰写。

**一句话总账**：191/191 asserted 卡全部审阅完毕；138 张改动、53 张原样保留、待决 7 组（卡内）+ QUESTIONS #48–95 共 48 条（全部待主人处置）；新建/拆分卡 0 张；全部卡保持 `status: asserted`，id/文件名/stance/review_due/signoff/library/ 零变更（程序全检对账）；validate OK(191)、selftest PASS、`git diff --check` 干净、index 已重建（派生物不入库）。**本班是表达与证据结构整理，不构成任何"验证"——没有任何卡被升级为 verified。**

## 1. 三张样板与表达规范

| 样板 | 类型 | 改写要点 |
|---|---|---|
| claim-gaussianfusion-val-2p6nds-over-bevfusion | 实验结果 | scope 移出对照行细节；falsifiers 分层（原文核查/同范围复现主张侧/对照侧/隐藏组件），配置不一致的对照复现降级为口径待决；新增"归因缺口"（+2.6 NDS 是整套框架总差、无阶梯对照）与阶梯对照下一步 |
| claim-bevplanner-ego-velocity-dominates-planning | 机制/行为观察 | "若成立"段从 nuScenes 开环模型约束回 VAD-Base 原配置；跨模型检查移"跨条件迁移"；行为观察（Table 2）/作者解释（感知弱化）/替代解释（条件输入敏感性，整理者提出并标注）三层分开；2×2 视觉×速度机制检查 |
| claim-qlora-nf4-info-theoretic-optimal-datatype | 理论主张 | 实抓原文 alttext 实锤 `2^k+1`/`2^{k−1}`/`2^{k−1}+1` 读法与 Eq.4 全式；实抓 bitsandbytes 官方实现——NF4 硬编码表与 Appendix E 逐字节一致、按实现公式复算命中 16 码点（max err 1.1e-7）；**发现 Eq.4 字面网格不命中（0.108 vs 0.0796）→ 待决 #48**；af4/arXiv:2306.06965 最优性争议线索登记 |

实际采用的表达规范固化为 `nightshift/reports/sample-notes.md`（frontmatter 规则 / 七节推荐正文 / 9 条每卡检查单 / 阶段 A.5 桌面检查记录），是 P1 十五批子代理的统一基准；templates/claim.md 与 web NEW_CARD_BODY 已按同一结构对齐（P2，commit 2055b51）。

**阶段 A.5 桌面检查（整理者设计的假想情境，非真实项目结果）**：三情境全部 PASS——①"100×100 BEV 下能否借这条路线"（→ 有据问题：Table 1 高分辨率对照是否同配置重训；检查：BEVFusion(M) 锚点复现 + 阶梯归因）；②"开环分数高但感知崩了怎么办"（→ 检查：视觉×速度 2×2 + BEV 激活对比）；③"4-bit 底座存权重用 NF4 还是 FP4"（→ 检查：读 2306.06965 攻击点定位 + 等填充推导复核）。三情境中读者能复述主张/范围/缺口并能提出能改变判断的检查；其中研究问题均来自卡内已载证据，检查设计属整理者提议。

## 2. 全库审阅数量与分批

| 批次 | 卡数 | 改动 | 保留 | 要点 |
|---|---|---|---|---|
| P0 样板（调度班亲核） | 3 | 3 | 0 | 上表三张 |
| B1 mismatch/历史事件 | 12 | 11 | 1 | 历史引文分层（旧引文标注"修正前历史记录"只标记不删）；falsifier 触发如实登记；status 决策全部留主人 |
| B2a 量化经典 | 17 | 6 | 11 | PTQAT×2 evidence source/locator 错位修复 + 恢复率算术勘误（67% 非 77%）；qdbev-encoder 表题口径修正；brecq-w2a4 区间勘误 |
| B2b 量化现代 | 18 | 14 | 4 | pdquant-pd-metric 实质修正（标题混入论文中不存在的 Min-Max 数字→去除并降级历史记录）；falsifier 分层×9 |
| B3a 机制系 | 9 | 7 | 2 | egomlp-parity 枢纽卡补"on par 无显著性检验"未排除因素 + 依存关系保留；injection 卡 ckpt 跨源混杂；kradar×2 SHA 锚定原样保留 |
| B3b VLA 组一 | 11 | 7 | 4 | opendrivevla 碰撞锚点口径更正（0.30%/0.25% vs ST-P3 0.10%）；alpamayo-rl Consistency Score 事实修正；alpamayo-coc scope 删无据谱系 |
| B3c VLA 组二 | 9 | 9 | 0 | onevl latent-CoT 补论文自认反例（Alpamayo-R1）；qwen3vl §5.9 采样机制如实化；llava abs/HTML 摘要前缀分歧实锤 |
| B4a 检测融合一 | 13 | 8 | 5 | ali-camera-stream 获摘要原句直接印证；msmdfusion-multiscale 增益区间勘误 1.96→1.94 |
| B4b 检测融合二 | 17 | 9 | 8 | **rcbevdet-dmsa 公式勘误**（Eq.2 漏 D_ij² 平方项，alttext 级证据）；rcbevdetpp-vitl falsifier 锚点补 SparseBEV 70.2；echofusion-3d locator p.9→p.10 |
| B4c 检测融合三 | 14 | 14 | 0 | **hgsfusion-dark-scene 数据集归属修正**（推定 VoD → TJ4DRadSet test set，caption 级证据）；echofusion-rt-vs-ra 补引用标记；radarocc×4 历史分层 |
| B4d 雷达 | 8 | 5 | 3 | **r4det-tj4dradset「正交叠加」降级为笔记解读**（原文明言 "chained"，全文无 orthogonal）；plugplay EAA 口径闭合；dgtf 帧距消融补补充材料 Table 9 |
| B4e 补批 PillarNet | 3 | 3 | 0 | **od-diou 命题边界收紧**（Table 4 OD-IoU 行 −0.06 与原 scope 自相矛盾，改只主张 OD-DIoU +0.24） |
| B5 Occupancy | 20 | 3 | 17 | njusparseocc 剪枝/mgss 两卡按 v5 原文实抓改写（笔记"阈值硬过滤"实为 top-k=32000）；drocc-90pct falsifier 跨口径迁移分层 |
| B6 骨干 | 9 | 9 | 0 | **mobilenet-dsc 数学前提修正**（N≥9→N≥72，由 1/N+1/9≤1/8 推导，整理班推导已标注）；shufflenet-table5 对照侧溯源对版（QUESTIONS #42 部分收窄：对照行确系 MobileNet V1 自报值） |
| B7a 经典检测 | 16 | 16 | 0 | 四篇论文原文实抓 + 105 条 evidence 全量回验；oracle 卡补 511-104 与分尺寸；fcos 中心采样系投稿后改进行 |
| B7b 零散 | 12 | 11 | 1 | **vqmap-argoverse 修正 11-02 误读**（73.4 系 Argoverse Drivable 单类而非四类平均）；vqmap-nuscenes 对比行数 7→9 笔误 + camera-only 原注闭合模态疑虑 |
| **合计** | **191** | **138** | **53** | git diff 对账精确守恒；审阅≠改写，53 张信息完整卡原样保留 |

## 3. 每张改动卡

改动卡逐张的 id / status（全部仍 asserted）/ stance（全部未动）/ 改动类型 / 来源核对范围明细，见各批 commit 信息与返回摘要归档（`git log --oneline ca81104..HEAD -- claims/` 共 16 个批次提交，每条含批号与三计数）。代表性模式：

- **命题级修正（8 张，P3 深核批一全部独立复核成立）**：pdquant-pd-metric、vqmap-argoverse、hgsfusion-dark-scene、pillarnet-od-diou、njusparseocc-decoder-pruning、mobilenet-dsc、centernettriplets-ccp（AR100→AR_L）、ptqat×2（evidence 重建）。
- **公式/符号级修正（3 张）**：rcbevdet-dmsa（D_ij²）、qlora-nf4（2^k+1 读法）、mobilenet-dsc（N≥72）。
- **归因/口径闭合（~20 张）**：r4det「正交叠加」降级、echofusion-rt-vs-ra 补引用标记、opendrivevla 锚点、alpamayo-rl 指标性质、vqmap-nuscenes 行数+原注、qdbev-encoder 表题口径、msmdfusion-multiscale 区间、brecq-w2a4 区间、lingoqa-late-fusion 阈值锚点等。
- **结构统一（全部改动卡）**：falsifier 分层标注、核查记录节、scope 收敛、related 双向补齐。
- **新建拆分卡：0 张**——本班未触发"有准确来源的独立主张需拆出"的情形（shufflenet-group 卡的拆分裁量已登记 #89 待主人）。

## 4. 待决条目（QUESTIONS #48–95，48 条，全部待主人处置）

按处置类型分组（每条在 QUESTIONS.md 内均有：具体问题、已找到的证据、为什么不能直接完成）：

- **命题/状态处置（主人裁定）**：#48（QLoRA Eq.4 与官方实现不等价——论文描述算错还是简化待 PDF 裁定）；#55（四张 falsifier 已触发 mismatch 卡存废：centernetpoints/sparseocc/emc2/omniquant note 卡）；#24（hgsfusion-cyclist 反转，B1 已做分层前置）；#89（shufflenet-group 原子性裁量）；#77（RadarOcc 跨框架对比新卡授权）；#84（R4Det §4.4 疑似笔误是否求证）。
- **library 笔记修正请求（本班只读，需授权后按铁律 3 同步）**：#54 EchoFusion §3.2/3.3；#72 HGSFusion §4.4 数据集；#80–82 NJU-SparseOcc 三处（剪枝 top-k/综合表述/MGSS 细化+消融补录）；#91 VQ-Map 三处（Drivable 单类限定/表转录不全/训练时长注）；#95 经典检测四处；#88 ShuffleNet 指代；#67–68 Ali-BEVFusion 骨干名（需二次实抓）与轮数张力；#70 Ali 笔记补摘要鲁棒性。
- **出处/版本核实**：#49 BRECQ 会议出处（OpenReview）；#50 PTQAT ICCVW；#83 R4Det arXiv 2603.11566 回填。
- **口径/核查缺口（不阻塞使用）**：#58–60 Alpamayo TABLE 9/10 实抓与 0.5B 底座、AutoVLA DriveTraj 两行；#61–64 BEV-Planner 系（直行阈值、UniAD 中间行、P.P. 同一性、跨源混杂）；#69–70 BEVDet 消融配置；#73–76 HGSFusion/EchoFusion 口径；#78 cross/4d-radar 过时注记；#79 GaussianFusion PDF 交叉核对；#86 R4Det.pdf 是笔记导出非论文原文（处置）；#87 R4Det/SGDet3D 两源数字差；#90 ar5iv 重抽；#92 EMC2 引文日期；#93–94 CornerNet 斜体与代码侧核查；#51 MQBench paper 字段刷新；#42（B6/B3b 已部分收窄）。

## 5. 保留检查结果（程序全检，调度班亲跑）

- **受保护字段**：`git diff ca81104..HEAD -- claims/` 全量扫描，`status/stance/review_due/signoff/id/type/note/paper/tags` 行**零变更**（138 张改动卡全部只动 title/scope/evidence/falsifiers/正文/related）。
- **非 asserted 卡 / signoff**：本班开始时全库 191 卡即全部 asserted、signoff 全部 null 占位（P0 盘点在案）；班内无人做任何状态变更；**没有任何卡被表述为已验证**。
- **library/**：全程只读，`git diff` 对账零改动；发现的笔记问题全部转 #48–95 待决，未代改。
- **三计数守恒**：批次报改动 135 + B4d 三张"保留+核查记录一行"最小触达 = git diff 138 张，精确对账，无未解释变更；53 张原样保留卡全部不在 diff 中。
- **主人 WIP**：`tmp_docs/TODO.md` 未跟踪状态未变，未动未提交。
- **派生索引**：`ka.mjs index` 重建（191 条），按库约定不入库。

## 6. P3 检查批结果与覆盖范围（如实注明）

- **程序全检（覆盖率 100%，138/138 张改动卡）**：① 冻结字段 diff 为空 ✓；② 改动清单与 diff 文件清单对账 ✓；③ 662 条 quote（450 条 library 来源全部逐字命中——YAML `\\` 转义归一化后比对；212 条外部来源以当日/既往实抓记录为凭）——**真问题 0**；历史记录类未命中均已带「修正前历史记录」标记（红线 4 合规）。
- **子代理深核（覆盖率 32/138 ≈ 23%，风险抽样）**：批一（16 张最高风险：三样板 + 全部命题/公式级修正卡）**PASS 16 / FIXED 0 / ISSUED 0**——六处命题级修正独立复算验证成立（vqmap Drivable 复抓、hgsfusion Table 5 逐格、N≥72 重算、bnb 1.083e-7 复现、ptqat 算术、rcbevdet alttext）；批二（16 张：B7a 重 evidence + mismatch 历史卡 + 枢纽卡）**PASS 10 / FIXED 6 / ISSUED 0**（ccp AR100→AR_L 误标、YAML 严格引号×2、egomlp-parity related 双向；9 条历史 quote 验真——在修正前提交中逐字命中，无补造历史）。**因全量深核窗口（07:00 前）内 2 并发吞吐限制，深核为风险抽样而非全量**；未深核的 106 张已 100% 通过程序全检。
- **P3 修卡复核**：批二对批一结论无推翻；无跨轮 QA 冲突。

## 7. 校验结果与未完成范围

- **校验**：`node tools/ka.mjs validate` OK(191) 每批全绿；`node tools/selftest.mjs` PASS；`git diff --check` 干净；index 重建完成。全部 16 个批次提交 + P2/P3 提交（38232f3 → 3409d85，21 commits），未 push。
- **未完成范围（如实声明）**：① 深核为 23% 风险抽样（上述覆盖声明）；② 212 条外部 quote 未全部班内二次实抓（各 quote 均带抓取日期，按记录可信分层）；③ 代码侧核查（CenterNet/CornerNet/FCOS 官方仓库实现）未做（#94）；④ library 笔记修正全部待主人授权；⑤ 部分待决需读原文 PDF（如 #48、#93 斜体目检）；⑥ **本班全部产出均为 asserted 表达整理，未产生任何 verified 结论，未启动任何训练/复现实验**。

## 8. 附：质量抽查记录（晨报终检将复用）

- 抽验 quote 逐字：P0 三样板 10 条 + P3 程序全检 662 条 + 深核批一 106 条 + 批二 106 条（含 9 条历史 quote 在修正前提交中验真）。
- 抽验算术：ptqat-w8a8 恢复率 67%/77%、mobilenet-dsc N≥72、qlora-nf4 复算 1.083e-7、hgsfusion-dark-scene +2.32/+2.91/+11.41、msmdfusion-multiscale 1.94、r4det +6.34/+5.34——全部独立复算一致。
