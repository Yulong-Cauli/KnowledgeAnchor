# OmniQuant W4A4 主卡深度精读报告（signoff 前置）

**日期：** 2026-11-03
**性质：** nightshift report 班次产出；只读素材，仅新增本文件；不 git 提交
**服务对象：** `nightshift/reports/claim-map.md` §2 Top5 第 1 项 [claim-omniquant-w4a4-llama7b-zeroshot-5265](../../claims/claim-omniquant-w4a4-llama7b-zeroshot-5265.md) 的 signoff 前置精读

## 0. 素材、纪律与措辞约定

素材：

| 素材 | 角色 |
| --- | --- |
| `library/Quantization/OmniQuant.md` | L1 笔记（实验 1 / 实验 4 两表已由 2026-11-03 夜班按原文修正），本报告分析主对象 |
| `claims/claim-omniquant-w4a4-llama7b-zeroshot-5265.md` | 主卡（asserted / watch，frontmatter 逐项核对） |
| `claims/claim-omniquant-w2a16g128-llama7b-ppl-beats-gptq-awq.md` | 关联卡 1（asserted / watch） |
| `claims/claim-omniquant-let-lwc-ablation-w4a4-best.md` | 关联卡 2（asserted / watch） |
| `claims/claim-omniquant-w4a16g128-llama13b-a100-913toks.md` | 关联卡 3（asserted / watch） |
| `claims/claim-omniquant-note-table-mismatch.md` | 笔记缺陷卡（asserted / watch，正文含「笔记已修正」附注） |
| `nightshift/qa/round2-quant-fusion.md` | QA 复审：OmniQuant 4×PASS（L13-L20） |
| arXiv:2308.13137v3 PDF（本次实抓） | 论文原文独立核验源 |

本次联网抓取记录（RULES #4 要求 URL + 日期）：

- `https://arxiv.org/pdf/2308.13137` → 实得 **arXiv:2308.13137v3 [cs.LG] 18 Mar 2024**（25 页，"Published as a conference paper at ICLR 2024"，PDF CreationDate 2024-03-19），2026-11-03 抓取，`pdftotext -layout` 与 `-raw` 双模式提取至工作区外临时目录（/tmp/ka-fetch-omniquant/，不入库）。
- `https://arxiv.org/abs/2308.13137`，2026-11-03 抓取，版本列表为 [v1] [v2] [v3]，确认 **v3 即当前最新版**。
- 注：任务书写「复核 52.65（5 数据集平均）」——论文 Table 2 caption 实为 6 任务（见 1.1），卡 title 亦写六任务；本报告一律按论文口径记录，5 数据集为任务书笔误，不构成任何卡的问题。

纪律与措辞约定（适用于全文）：

1. 本报告不判"论文对/错"，只评估证据结构与强度；论文层面结论一律写为"论文声称，尚未独立验证"（AGENTS.md 引用规则 2）。
2. 引文纪律（RULES #4）：全文引用一律 quote + locator，逐字复制；库内文件经 `grep -F` 固定字符串全文匹配逐一验证（附录 A），PDF 引文以本次抓取提取的文本文件为载体同样逐条 `grep -F` 验证。PDF 提取文本与 PDF 排版存在空白/连字符差异，引用时注明提取模式。
3. 证据强度分级（本报告自定义，仅用于组织评估，不构成对卡 status 的变更建议）：
   - **★★★**：受控对比（同表开关切换 / 同校准预算消融），双源核对一致，且本轮经原文 PDF 逐格复验；
   - **★★**：单表自报数字，但内部或跨表交叉一致（或已双源核对）；
   - **★**：单一统计量、机制性叙述或笔记中无可复核表格行。

## 1. 核心论证链：OmniQuant 用什么支撑"W4A4 可用"

### 1.1 环节一（主结果）：LLaMA-1-7B W4A4 六任务零样本平均 52.65 —— ★★★

论文声称（尚未独立验证）：W4A4（per-channel 4-bit 权重 + per-token 4-bit 激活）下，LLaMA-1-7B 六个零样本任务平均准确率 52.65%，高于 SmoothQuant 38.41 与 LLM-QAT 41.27，FP16 基准 64.09。

任务数与任务清单（locator：v3 PDF p.8，Table 2 caption 与表头；-layout 提取）：

> "This table reports the accu-racy of 6 zero-shot tasks."
> "LLaMA / Acc↑ #Bits Method     PIQA ARC-e Arc-c BoolQ HellaSwag Winogrande Avg."

（caption 经连字符还原为 "accuracy"；六任务 = PIQA / ARC-e / ARC-c / BoolQ / HellaSwag / Winogrande。§4.1 Evaluation 句 "racy is evaluated in zero-shot tasks including PIQA (Bisk et al., 2020), ARC (Clark et al., 2018), BoolQ (Clark et al., 2019), and HellaSwag (Clark et al., 2018)." 只点名 4 类任务、未点 Winogrande，且把 ARC 当一类——正文与表格的任务粒度不完全对齐，以表格为准。）

W4A4 LLaMA-1-7B 行逐字（locator：v3 PDF p.8 Table 2；-layout 提取）：

> "W4A4 OmniQuant   66.15 45.20 31.14 63.51  56.44     53.43    52.65"
> "W4A4 SmoothQuant 49.80 30.40 25.80 49.10  27.40     48.00    38.41"
> "W4A4 LLM-QAT     51.50 27.90 23.90 61.30  31.10     51.90    41.27"
> "FP16 -           77.47 52.48 41.46 73.08  73.00     67.07    64.09"

校准与训练口径（locator：v3 PDF §4.1 Training，p.7；-layout 提取，跨行拼接/连字符还原）：

> "We employ a calibration dataset consisting of 128 randomly selected 2048-token segments from WikiText2 (Merity et al., 2016)."
> "The entire training process is facilitated on a single Nvidia A100 GPU, using a batch size of 1 over 20 epochs, except for W2A16 quantization that leverages 40 epochs."

（本句跨行拼接还原；前一句 "We employ a calibration dataset consisting of 128 randomly selected 2048-token segments from WikiText2 (Merity et al., 2016)." 为跨行连字符还原。PDF 提取规则：`pdftotext -layout` 且仅去行首空白、跨行空格拼接，表格行保留行内原间距——与库内各卡 evidence 的 PDF 引文规则一致；个别行 `-layout` 会粘连列（Table 3 FP 行 "5052.5"），该行改用 `-raw` 并注明。）

量化配置默认值（locator：v3 PDF §4.1 "Quantization" 段，pdftotext 输出序位于 Table 1 之后；-layout 提取）：

> "In weight-activation quantization, defaults are INT6/INT4 per-channel weight and per-token activation quantization (Dettmers et al., 2022)."

**证据强度 ★★★**：主表数字与卡 evidence 完全一致（本轮逐格复验，见 §2）；同时存在双数据集（PPL）与零样本（Acc）两个口径的同配置结果（Table A2 的 LET+LWC 行 Acc 52.65 与 Table 2 主行互证）；对比方法含 PTQ（SmoothQuant、OS+）与 QAT（LLM-QAT）两族。
**限定**：(a) 全部为论文自报，无第三方复现；(b) "+6.22 超越 QAT" 的正文表述与表格口径有出入（见 1.2）；(c) 零样本评测协议（lm-eval-harness 版本、prompt、任务 split）未完整给出；(d) 校准域敏感性只在 PPL 上验证（Table A10），未在零样本准确率上验证——卡 falsifier 3 已覆盖。

### 1.2 环节二（归因句的口径陷阱）："+6.22 超越 QAT" 实对应 LLM-QAT+SQ —— 记录在案

正文声称（locator：v3 PDF §4.3，p.8；-raw 提取）：

> "Remarkably, in the LLaMA-7B, OmniQuant even surpasses the recent QAT method, LLM-QAT (Liu et al., 2023b), by an impressive margin of +6.22%."

但按 Table 2：52.65 − 41.27 (LLM-QAT) = 11.38；52.65 − 46.43 (LLM-QAT+SQ) = 6.22。即 +6.22 实际对应 **LLM-QAT+SQ 变体**而非 LLM-QAT 本行——正文行名与数字组合不严格一致。卡「我的理解」限定 2 已如实记录该口径，QA round2（round2-quant-fusion L18）双向核实成立。这不是数字错误，而是引用该论文时必须携带的限定：引用"超越 QAT"须注明对比对象与幅度（对 LLM-QAT +11.38，对 LLM-QAT+SQ +6.22）。

### 1.3 环节三（消融）：LET+LWC 组合 12.87 优于任一单组件 —— ★★★

论文声称（尚未独立验证）：LLaMA-7B W4A4 下，LET+LWC 平均 PPL 12.87 < 仅 LET 16.97 / SmoothQuant+LWC 15.80（另有 LET+grid-searched WC 15.82），SmoothQuant 基准 28.78。

四行逐字（locator：v3 PDF p.14 Table A2；-layout 提取，仅去行首空白）：

> "SmoothQuant                      28.78              38.41"
> "LET                              16.97              48.83"
> "SmoothQuant + LWC                15.80              50.15"
> "LET + LWC                        12.87              52.65"

（笔记未收录的第五行："LET + grid-searched WC           15.82              49.59"。）

口径说明（locator：v3 PDF p.14 Table A2 caption；-layout 提取）：

> "We report the average perplexity of WikiText2 and C4, and the average accuracy on 6 zero-shot tasks like Table 2."

即 Table A2 的 PPL 是 **WikiText2 与 C4 的平均值**，Acc 是六任务平均；LET+LWC 行的 52.65 与 Table 2 主结果同源互证。

**证据强度 ★★★**：同一校准预算（128 段 WikiText2，§4.1）下同表四变体开关切换，受控性干净；且 12.87 行的 Acc 52.65 与主表闭环。
**限定**：(a) 消融只在 LLaMA-7B W4A4 一档；(b) 笔记实验 3 表只写 "PPL" 未注双数据集平均——关联卡 scope 已修正归因，但引用笔记数字时仍须回卡；(c) 笔记未收录 "LET + grid-searched WC 15.82" 行（v3 原表确认存在，见附录 A），不影响卡主张但影响"任一单组件变体"的完备表述——该行是"网格搜索 WC"变体而非单组件，卡内已注明。

### 1.4 环节四（权重侧极限）：W2A16g128 9.72 vs GPTQ 44.01 / AWQ 2.6e5 —— ★★

论文声称（尚未独立验证）：LLaMA-1-7B W2A16g128（2-bit 权重 128 分组）下 OmniQuant WikiText2 PPL 9.72，GPTQ 44.01、AWQ 2.6e5 均失效级。

四行逐字（locator：v3 PDF p.7 Table 1 W2A16g128 块，1-7B 列；-layout 提取，仅去行首空白）：

> "RTN                  1.9e3    781.20      68.04    15.08      4.2e3     122.08    27.27"
> "W2A16  GPTQ                 44.01     15.60      10.92     9.51      36.77      28.14    NAN"
> "g128  AWQ                  2.6e5     2.8e5      2.4e5    7.4e4      2.2e5      1.2e5       -"
> "OmniQuant            9.72       7.93       7.12     5.95     11.06       8.26      6.55"

**证据强度 ★★**：单表单列自报；对比方法的失效值（44.01 / 2.6e5）本身在论文里无逐行复现说明；**版本敏感**——v1 同位为 10.53，9.72 是 v3 camera-ready 更新值（mismatch 卡 evidence 已双版本记录），引用必须带版本号。
**限定**：校准集（WikiText2 128 段）与评测集（WikiText2 PPL）同语料，同源乐观风险（关联卡 scope 限定 2）；W2A16 用 40 epochs（§4.1），与其他配置不同预算。

### 1.5 环节五（部署兑现）：A100 上 7.0 GB / 91.3 tokens/s —— ★★

论文声称（尚未独立验证）：LLaMA-13B W4A16g128 经 MLC-LLM 部署在 NVIDIA A100-80G：量化权重存储 WM 7.0 GB（RM 10.0 GB），生成 512 tokens 吞吐 91.3 tokens/s；FP16 同列为 WM 24.3G / RM 27.1G / 52.5 tokens/s。

两行逐字（locator：v3 PDF p.9 Table 3；-raw 提取）：

> "FP 12.6G 14.4G 69.2 24.3G 27.1G 52.5 60.6G 66.1G 23.9 OOM - -"
> "W4A16g128 3.8G 5.7G 134.2 7.0G 10.0G 91.3 16.7G 21.7G 43.6 33.0G 41.0G 24.3"

（-layout 模式下 FP 行 13B 列提取为粘连的 "5052.5"，系排版抽取伪影；-raw 模式确认 52.5，与 v1 一致。）

部署前提与边界（locator：v3 PDF §4.5，p.9；-raw 提取）：

> "W4A4 and W6A6 quantization methods lack out-of-the-box hardware support."

**证据强度 ★★**：单硬件（A100-80G）、单引擎（MLC-LLM）、单负载（512-token 生成）自报；FP16 基线行同表，加速比 91.3/52.5 ≈ 1.74× 可自洽验算。
**限定**：部署表只测 weight-only（W4A4 未部署，论文自认缺硬件支持）；无批大小 / 尾延迟 / 上下文长度变量；换引擎后加速比无数据——关联卡 falsifier 3 已覆盖。注意：**W4A4 主卡（52.65）与部署卡（1.74×）之间隔着"激活 4-bit 无硬件支持"这条论文自认的沟**，精度数字不能直接读成部署收益。

### 1.6 环节六（机制背景）：零成本推理与"转移痛苦" —— ★（笔记解读层）

笔记 §3.1-3.3 的"质量守恒/转移痛苦/零成本推理"是笔记作者的机制性复述与演绎（把 LET 吸收进 LayerNorm 的参数融合讲成"魔法"），论文侧对应 Eq.(4)(5) 与 §4.5 "One of OmniQuant’s strengths lies in its ability to avoid extra operations for quantized models, allowing MLC-LLM to seamlessly run models created with OmniQuant."（v3 PDF §4.5，-layout 提取，跨行拼接）。机制本身没有独立的算子级消融数字，其可观测后果就是环节五的部署表。**强度 ★**：引用机制解释时须注明是笔记复述；可证伪路径由部署卡 falsifier 2 承担（推理需额外算子即不成立）。

### 1.7 论证链总览

```
环节三 W2A16g128 权重极限（Table 1）──┐
环节一 W4A4 主结果 52.65（Table 2）★★★ │
环节二 消融归因 12.87（Table A2）★★★ ──┴→ 论点：可学习量化参数让 PTQ 兼得
环节四 部署兑现 1.74×（Table 3）★★          低比特精度与部署效率（论文声称）
环节六 机制：参数融合零成本推理 ★            │
                                            ↓
                     边界（论文自认）：W4A4/W6A6 缺开箱即用硬件支持（§4.5）
```

（箭头为论文论证方向；环节一↔环节二有同数字互证，环节四独立于环节一——部署表只覆盖 weight-only。）

## 2. 卡内数字与笔记表格逐格复核（笔记修正后 ↔ arXiv v3）

笔记实验 1 / 实验 4 两表已于 2026-11-03 夜班修正（笔记内两处"注（2026-11-03 修正）"），mismatch 卡正文有「2026-11-03 笔记已修正」附注。本轮将修正后的笔记四张表与 v3 PDF 逐格比对：

| 笔记表（修正后） | 笔记值 | v3 原文值（本轮 -raw/-layout 逐格提取） | 判定 |
| --- | --- | --- | --- |
| 实验 1 表头 | LLaMA-1-7B W2A16g128 | Table 1 p.7 表头列 1-7B + "W2A16 g128" 块 | 一致 |
| 实验 1 RTN | 1.9e3 | 1.9e3（g128 块 1-7B 列） | 一致 |
| 实验 1 GPTQ | 44.01 | 44.01 | 一致 |
| 实验 1 AWQ | 2.6e5 | 2.6e5 | 一致 |
| 实验 1 OmniQuant | 9.72 | 9.72（v1 同位 10.53，已注） | 一致 |
| 实验 2 FP16 | 64.09% | 64.09（Table 2 FP16 行 Avg 列） | 一致 |
| 实验 2 SmoothQuant | 38.41% | 38.41 | 一致 |
| 实验 2 LLM-QAT | 41.27% | 41.27 | 一致 |
| 实验 2 OmniQuant | 52.65% | 52.65（六分项 66.15/45.20/31.14/63.51/56.44/53.43 亦与卡内待验证清单一致） | 一致 |
| 实验 3 SmoothQuant | 28.78 | 28.78（Table A2） | 一致 |
| 实验 3 仅加 LET | 16.97 | 16.97（LET 行） | 一致 |
| 实验 3 仅加 LWC | 15.80 | 15.80（SmoothQuant + LWC 行；行名对应关系见关联卡 scope） | 一致 |
| 实验 3 LET+LWC | 12.87 | 12.87 | 一致 |
| 实验 4 FP16 基线 | WM 24.3 GB / RM 27.1 GB / 52.5 tokens/s | 24.3G / 27.1G / 52.5（Table 3 FP 行 13B 列，-raw 确认） | 一致 |
| 实验 4 量化侧 | 7.0 GB / 91.3 tokens/s | 7.0G / 10.0G / 91.3（Table 3 W4A16g128 行 13B 列） | 一致 |
| 实验 4 推导值 | 加速约 1.74×、WM 口径节省 ~71% | 91.3/52.5 = 1.739；(24.3−7.0)/24.3 = 71.2% | 验算成立 |

**结论**：笔记修正后，四张实验表与 arXiv v3 camera-ready **逐格一致，零差异**；卡内全部数字（w4a4 六分项 + 平均、w2a16g128 三值、let-lwc 四值、w4a16g128 三值）与论文原表一一对应。EMC2 式表格错位在本笔记的修正版中不存在。

两个残余注意点（非数字错误）：

1. **w2a16g128 卡的笔记侧 locator 已过期**：卡 evidence locator 写 "§4 / 实验 1：W2A16（笔记表头标 LLaMA-13B）"，笔记表头修正后该括注描述的是修正前状态；其三条笔记 quote 本身（GPTQ/AWQ/OmniQuant 行）修正后仍逐字存在（附录 A 复验）。卡内不必改数字，但 locator 括注与 `claims/claim-omniquant-note-table-mismatch.md` 的「笔记已修正」附注宜在下次授权改卡时同步（见 §6 遗留 1）。
2. **mismatch 卡 evidence 的笔记 quote 是修正前历史记录**：其中实验 4 两条（~26 GB / ~40 tokens/s 行）在修正后的笔记中已不存在——这是规则预期的状态（RULES #3：卡内加注、status 不动），mismatch 卡待验证清单已声明"本卡 status 与既有 evidence 未动（其中笔记 quote 为修正前历史记录）"。人工核验时不要拿现在的笔记去逐字核 mismatch 卡的这两条 quote。

## 3. 五张卡：关系、强度与剩余风险

### 3.1 清单与引用关系（frontmatter 原文核对）

| 卡 id 后缀 | status / stance | review_due | related 指向（卡内原文） |
| --- | --- | --- | --- |
| `claim-omniquant-w4a4-llama7b-zeroshot-5265` | asserted / watch | 2026-12-02 | let-lwc、w2a16g128、qwt-r2-gate、repqvit-w4a4 |
| `claim-omniquant-w2a16g128-llama7b-ppl-beats-gptq-awq` | asserted / watch | 2026-12-02 | w4a4、qwt-r2-gate |
| `claim-omniquant-let-lwc-ablation-w4a4-best` | asserted / watch | 2026-12-02 | w4a4 |
| `claim-omniquant-w4a16g128-llama13b-a100-913toks` | asserted / watch | 2026-12-02 | w4a4、qwt-r2-gate |
| `claim-omniquant-note-table-mismatch` | asserted / watch | 2026-12-02 | 上述四卡 |

全部 `signoff: null`。结构上 **w4a4 是枢纽**（被 3 张卡回指），let-lwc 是叶（只指向 w4a4），mismatch 是元卡（覆盖四张卡共用的笔记载体）。语义分层：w4a4 说"激活量化可用"（主结果），let-lwc 说"为什么可用"（组件归因），w2a16g128 说"权重侧极限"（同框架外推），w4a16g128 说"工程兑现"（部署），mismatch 说"载体曾不可信"（已修复）。**依存风险**：w4a4 卡若被推翻（复现显著低于 52.65），let-lwc 的"协同"叙事仍可独立成立（PPL 消融），但 w2a16g128/w4a16g128 的选型说服力同源受损；反之 w4a4 不依赖部署卡（W4A4 无硬件支持，两卡数字本就不可相乘）。

### 3.2 主卡证据强度评级：★★★（signoff 候选中证据链最完整的一张）

评级依据（本报告层评估，不构成 status 变更建议）：

1. **双源逐格一致**：笔记 4 条 evidence quote（实验 2 表四行）+ arXiv v3 Table 2 三行 + §4.1 校准句，本轮全部在"笔记修正版 + 本次实抓 PDF"上重新逐字命中（附录 A）；round2-quant-fusion L18 已 PASS。
2. **受控对比结构**：同表内 W4A4 五方法（SQ / LLM-QAT / LLM-QAT+SQ / OS+ / OmniQuant）同评测协议；正文自述基线复现口径统一（"that we reproduce SmoothQuant and Outlier Suppression+ with per-channel weight quantization and per-token activation quantization for fair comparisons."，v3 §4.1 末，-layout 提取）。
3. **跨口径互证**：Table A2 消融的 LET+LWC Acc 列与主表 52.65 同数——主结果不是孤立统计量。
4. **卡内自我限定完备**：三条限定（校准口径 / +6.22 归因 / OS+ 与 LLM-QAT+SQ 两个中间基线）+ 四条 falsifiers 均具体可操作，且与本轮原文核对结果一致。

### 3.3 主卡剩余风险清单（signoff 前逐条知情）

1. **自报未复现（结构性）**：52.65 无任何第三方复现；signoff 签的是"该数字被论文 Table 2 如实记载且库内记录与原文一致"，不是"数字为真"。若追求后者，须走卡内待验证第 1 条（官方仓库复现）。
2. **评测协议不完全透明**：论文未给 lm-eval-harness 版本与 prompt 配置；§4.1 Evaluation 句与表格的任务清单粒度不完全对齐（1.1）。复现排序可能受协议细节影响（falsifier 3 前半）。
3. **校准域敏感性未在 Acc 上验证**：Table A10 只给 PPL 方差 0.0006–0.17（LLaMA-7B W3A16/W4A4）；零样本准确率的校准域方差论文未报告。W4A4 主卡用的是六任务零样本（与 WikiText2 不同域），同源风险低于 w2a16g128 卡的 WikiText2 PPL，但"换校准域 Acc 掉多少"无人知道。
4. **W4A4 的部署沟**：论文自认 W4A4/W6A6 缺开箱即用硬件支持（§4.5）；52.65 不能与部署卡的 1.74× 相乘成"W4A4 又准又快"。选型表述必须拆开。
5. **版本敏感性**（对整组卡而非仅主卡）：9.72 是 v3 值（v1 10.53）；引用 W2A16g128 数字必须带版本号。w4a4 主卡数字经核对 v3 与 v1 同位（Table 2 为 v3 新增口径表，v1 结构不同）——引用时以 camera-ready 为准即可，但库内引用句式建议统一带 "arXiv v3 (ICLR 2024 camera-ready)"。

### 3.4 三张关联卡的强度与一句话风险

- `w2a16g128`：★★。数字本轮逐格复验一致；风险=校准/评测同语料（卡限定 2）+ 版本敏感（v1 10.53）+ **笔记侧 locator 括注过期**（§2 残余点 1）。
- `let-lwc`：★★★。同表四变体受控消融 + 12.87↔52.65 跨表闭环；风险=PPL 是双数据集平均（卡限定 1，笔记表格未标）、消融仅 7B W4A4 一档。
- `w4a16g128`：★★。FP16 基线行已按原表修正并复验（-raw 52.5）；风险=单引擎单负载、部署表不覆盖 W4A4、加速比 1.74× 依赖 MLC-LLM 内核（falsifier 3）。
- `note-table-mismatch`：★★★（作为缺陷记录卡）。其"笔记已修正"附注与本轮逐格复核互相印证；卡 status 不动（asserted），其最终裁决权在用户逐格复核（卡 falsifier）。

## 4. 与其他量化方法的对比定位（库内三线）

本节只依据库内笔记与既有卡（RepQ-ViT / PD-Quant / QwT），不做跨论文数字直接比较——四者评测域（ViT / CNN / LLM）不同，任何"谁高谁低"都不可比，只做机制与适用域定位：

| 线 | 论文/会议 | 机制一句话 | 与 OmniQuant 的关系 | 库内状态 |
| --- | --- | --- | --- | --- |
| RepQ-ViT | ICLR 2023（`library/Quantization/RepQ-ViT.md`） | 量化-推理解耦 + LayerNorm/Softmax 尺度重参数化，无超参无重建，面向 **ViT** W4A4（ViT-B 68.48 / DeiT-S 69.03 / Swin-S 79.45，笔记 §4 表） | 同为"W4A4 可用"叙事但域不同（视觉 vs LLM）；机制上 RepQ-ViT 靠**解析式重参数化**，OmniQuant 靠**梯度学习量化参数**——两条不相同的路线 | 4 卡全单源未复审（★），claim-map §3.2 暂缓名单内 |
| PD-Quant | AAAI 2024（`library/Quantization/PD-Quant.md`） | 预测差异度量 + 用 BN 全局统计量做分布修正（DC），面向 **CNN** 极低比特（ResNet-18 W2A2 等） | 同为 PTQ 精度修复，但靠**校准数据侧修正**而非量化参数学习；与 OmniQuant 无直接可比数字 | 4 卡单源未复审（★） |
| QwT | CVPR 2025（`library/Quantization/QwT.md`） | 量化后并联线性补偿层，闭式解 + R² 门控，**叠加在既有 PTQ 之上**（RepQ-ViT+QwT、GPTQ+QwT 等） | 正交互补：OmniQuant 优化量化参数本身，QwT 修复任意 PTQ 的输出残差；QwT 卡与 OmniQuant 三卡互相 related（口径教训线） | 1 卡有专项 verify（部分支持，claim-map §3.4），笔记已加 R² 门控限定 |

定位结论（引用时的句式约束）：

1. 四线不可跨域排座次；OmniQuant 的"W4A4 可用"只在 **LLM 文本域**有证据，不能顺推 ViT/CNN（反之 RepQ-ViT 的 ViT-B 68.48 也不能反推 LLM）。
2. 与 QwT 的连接是**口径教训线**而非方法比较线：三张 OmniQuant 卡 related 里挂 `claim-qwt-r2-gate-nonregression` 都是为了"校准集 vs 测试集口径"教训（w4a4 卡限定 1 明写）。
3. QwT 论文没有测过 OmniQuant 输出上加补偿层——"QwT 能再救 OmniQuant"是**无出处推演**，库内任何笔记都没这么写，也不要这么写。
4. 选型对话中的正确粒度：LLM 权重-激活全量化 → OmniQuant（w4a4 卡）；ViT W4A4 → RepQ-ViT（其 4 卡复核后）；CNN 极低比特 → PD-Quant/BRECQ 系；已量化模型的事后修复 → QwT（先读其 verify 报告）。

## 5. signoff 前置结论与人工核验建议

**结论**：`claim-omniquant-w4a4-llama7b-zeroshot-5265` 满足"引文扎实、双源一致、限定完备"的 signoff 前置条件——本轮在笔记修正版与本次实抓的 v3 PDF 上重新走完 quote 逐字 + 数字逐格，零差异；卡上没有未决的原文核对项（对比 NJU-SparseOcc 卡，见姊妹报告）。证据强度 ★★★。

**建议的人工核验顺序**（按性价比）：

1. **零成本**：用户按 §2 表逐格抽查笔记 ↔ arXiv v3（任何一行即可抽查本报告的可靠性）；确认 mismatch 卡"笔记已修正"附注与笔记现状一致。
2. **低成本（有 GPU 即可）**：官方仓库复现 LLaMA-1-7B W4A4 六任务平均（卡内待验证 1）。先复 OmniQuant 本尊一行（预期 ≈52.65），再复 SmoothQuant 基线一行（预期 ≈38.41）——两行齐了，主卡与消融卡的排序主张同时获得检验。
3. **中成本**：换校准域（C4/Pile）重跑六任务，补上论文没给的 Acc 校准域方差（falsifier 3 后半）。
4. **部署侧另案**：若要引用 1.74×，须在自用推理栈复测（部署卡 falsifier 3），且永远与 52.65 分开表述。

## 6. 遗留问题（供调度班次转 QUESTIONS.md）

1. **w2a16g128 卡 evidence locator 括注过期**（"笔记表头标 LLaMA-13B"）：笔记表头修正后，该括注与笔记现状不符；需授权改卡时更新括注或在卡内加"笔记已修正"附注（参照 w4a16g128 卡的修订注记句式）。本班无改卡权限，未动。
2. **笔记 §6.3 训练时间数字未入卡**：Table A12（weight-only 7B 1.1h / weight-activation 7B 1.6h；65B 8.9h / 14.4h）与笔记 §6.3 一致（本轮顺带核对），但库内无对应卡；若日后立"量化训练成本"卡，直接引 Table A12。
3. **笔记 BEVFusion 适配章节（L311-390）是笔记作者的个人推演**，非论文内容且无出处标注；与本报告 §4 的纪律同理，引用时不得当作论文声称。是否在笔记加免责行由用户定。
4. 主卡 signoff 与否、以及是否先跑复现实验，由用户决定；本报告的 ★★★ 是证据结构评估，不构成签署建议（AGENTS.md：只有用户本人能把 claim 标记为 verified）。

## 附录 A：引文核验记录

方法：库内文件每条引文以字节原样做 `grep -F` 固定字符串全文匹配，要求恰好命中 1 次（`grep -cF` = 1）；PDF 引文对本次抓取提取的文本文件（/tmp/ka-fetch-omniquant/omniquant.txt 为 -layout 提取、omniquant-raw.txt 为 -raw 提取，工作区外临时文件）同样逐条 `grep -cF` 验证。报告正文中跨行拼接的 PDF 引文（拼接规则见 §1.1 注）在附录按所在行逐行 fragment 验证。共 50 条，除页眉 1 条外全部恰好命中 1 次（"x1" = 该文件内恰好命中 1 次）。

```
-- 库内文件（14 条）--
OK x1  library/Quantization/OmniQuant.md:L165  **表格：LLaMA-1-7B W2A16g128 PPL 对比**
OK x1  library/Quantization/OmniQuant.md:L172  | **OmniQuant** | **9.72**            | **可用**，接近实用水平   |
OK x1  library/Quantization/OmniQuant.md:L174  注（2026-11-03 修正）：本表原先表头写「LLaMA-13B W2A16」
OK x1  library/Quantization/OmniQuant.md:L189  | **FP16 (基准)** | 64.09%               | 原始模型                     |
OK x1  library/Quantization/OmniQuant.md:L192  | **OmniQuant**   | **52.65%**           | **显著提升** (+14%)          |
OK x1  library/Quantization/OmniQuant.md:L209  | **OmniQuant (LET + LWC)** | **12.87**    | **1+1 > 2**，两者协同效果最好       |
OK x1  library/Quantization/OmniQuant.md:L224  | **推理速度** | 52.5 tokens/s | **91.3 tokens/s** | **加速约 1.74×** |
OK x1  claims/claim-omniquant-w4a4-llama7b-zeroshot-5265.md:L56  论文声称（asserted，尚未独立验证）：LLaMA-1-7B 在 W4A4 下六个零样本任务平均准确率 52.65%
OK x1  claims/claim-omniquant-w4a4-llama7b-zeroshot-5265.md:L61  +6.22 实际对应 LLM-QAT+SQ (46.43)
OK x1  claims/claim-omniquant-w2a16g128-llama7b-ppl-beats-gptq-awq.md:L52  笔记表格写的是「LLaMA-13B W2A16 PPL 对比」
OK x1  claims/claim-omniquant-let-lwc-ablation-w4a4-best.md:L59  camera-ready Table A2 的 PPL 是 WikiText2 与 C4 困惑度的平均值
OK x1  claims/claim-omniquant-w4a16g128-llama13b-a100-913toks.md:L39  修订注记 2026-11-03
OK x1  claims/claim-omniquant-note-table-mismatch.md:L105  **2026-11-03 笔记已修正**
OK x1  nightshift/qa/round2-quant-fusion.md:L18  claim-omniquant-w4a4-llama7b-zeroshot-5265 | PASS
-- PDF -layout 提取（omniquant.txt，仅去行首空白；34 条）--
OK x25 omniquant.txt:L1（各页页眉）  Published as a conference paper at ICLR 2024
OK x1  omniquant.txt:L14   arXiv:2308.13137v3 [cs.LG] 18 Mar 2024
OK x1  omniquant.txt:L422  RTN                  1.9e3    781.20      68.04    15.08      4.2e3     122.08    27.27
OK x1  omniquant.txt:L423  W2A16  GPTQ                 44.01     15.60      10.92     9.51      36.77      28.14    NAN
OK x1  omniquant.txt:L424  g128  AWQ                  2.6e5     2.8e5      2.4e5    7.4e4      2.2e5      1.2e5       -
OK x1  omniquant.txt:L425  OmniQuant            9.72       7.93       7.12     5.95     11.06       8.26      6.55
OK x1  omniquant.txt:L470  racy is evaluated in zero-shot tasks including PIQA (Bisk et al., 2020), ARC (Clark et al., 2018),
OK x1  omniquant.txt:L471  BoolQ (Clark et al., 2019), and HellaSwag (Clark et al., 2018).
OK x1  omniquant.txt:L486  Table 2: Weight-activation quantization results of LLaMA Models. This table reports the accu-
OK x1  omniquant.txt:L487  racy of 6 zero-shot tasks. Perplexity results can be found in Table A23 & A24 at Appendix.
OK x1  omniquant.txt:L488  LLaMA / Acc↑ #Bits Method     PIQA ARC-e Arc-c BoolQ HellaSwag Winogrande Avg.
OK x1  omniquant.txt:L489  FP16 -           77.47 52.48 41.46 73.08  73.00     67.07    64.09
OK x1  omniquant.txt:L493  W4A4 SmoothQuant 49.80 30.40 25.80 49.10  27.40     48.00    38.41
OK x1  omniquant.txt:L494  W4A4 LLM-QAT     51.50 27.90 23.90 61.30  31.10     51.90    41.27
OK x1  omniquant.txt:L497  W4A4 OmniQuant   66.15 45.20 31.14 63.51  56.44     53.43    52.65
OK x1  omniquant.txt:L456  We employ a calibration dataset consisting of 128 randomly selected 2048-token seg-
OK x1  omniquant.txt:L458  Nvidia A100 GPU, using a batch size of 1 over 20 epochs, except for W2A16 quantization that
OK x1  omniquant.txt:L459  leverages 40 epochs.
OK x1  omniquant.txt:L448  128-group size. In weight-activation quantization, defaults are INT6/INT4 per-channel weight and
OK x1  omniquant.txt:L521  that we reproduce SmoothQuant and Outlier Suppression+ with per-channel weight quantization
OK x1  omniquant.txt:L522  and per-token activation quantization for fair comparisons.
OK x1  omniquant.txt:L547  et al., 2023b), by an impressive margin of +6.22%.
OK x1  omniquant.txt:L603  W4A4 and W6A6 quantization methods lack out-of-the-box hardware support.
OK x1  omniquant.txt:L592  One of OmniQuant’s
OK x1  omniquant.txt:L593  strengths lies in its ability to avoid extra operations for quantized models, allowing MLC-LLM to
OK x1  omniquant.txt:L594  seamlessly run models created with OmniQuant.
OK x1  omniquant.txt:L892  Table A2: Effect of combination of equivalent transformation and weight clipping. We report
OK x1  omniquant.txt:L893  the average perplexity of WikiText2 and C4, and the average accuracy on 6 zero-shot tasks like Table
OK x1  omniquant.txt:L896  SmoothQuant                      28.78              38.41
OK x1  omniquant.txt:L897  LET                              16.97              48.83
OK x1  omniquant.txt:L898  LET + grid-searched WC           15.82              49.59
OK x1  omniquant.txt:L899  SmoothQuant + LWC                15.80              50.15
OK x1  omniquant.txt:L900  LET + LWC                        12.87              52.65
OK x1  omniquant.txt:L569  Table 3: Deployment of weight-only quantization through MLC-LLM. We report the memory size
-- PDF -raw 提取（omniquant-raw.txt；-layout 粘连列改用 -raw 的两行；2 条）--
OK x1  omniquant-raw.txt  FP 12.6G 14.4G 69.2 24.3G 27.1G 52.5 60.6G 66.1G 23.9 OOM - -
OK x1  omniquant-raw.txt  W4A16g128 3.8G 5.7G 134.2 7.0G 10.0G 91.3 16.7G 21.7G 43.6 33.0G 41.0G 24.3
```

（报告排版对部分长行截断，匹配用串为全文逐字。arXiv abs 页 [v1][v2][v3] 版本列表为 grep 结果非引文，未列入。验证脚本清单见 /tmp/verify_quotes.sh，工作区外临时文件，不入库。）
