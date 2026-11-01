# [QA|round2] 量化 / 融合 16 卡复审报告

- **日期**：2026-11-02
- **范围**：OmniQuant ×4、RadarDistill ×4、RCBEVDet ×4、VQ-Map ×4（`claims/`），对照各自来源笔记；另对本轮可得的 arXiv 原文做了抽查核验。
- **方法**：
  1. 每条 evidence quote 用 `grep -F` 对笔记文件逐字验证（含弯引号 / 全角字符）；
  2. 本次实际抓取 arXiv PDF（OmniQuant v1+v3、RadarDistill v3、RCBEVDet v1、VQ-Map）与 GitHub raw README，`pdftotext -layout` 提取后对卡上 PDF/README 引文逐条复验（新增/修订引文 37 条全部 OK，0 MISS；跨行引文按片段逐段验证）；
  3. locator、数字与笔记逐格比对；口径 caveat 逐条核对是否如实保留。
- **结论**：16/16 通过复审。**PASS 4（OmniQuant 全部）／FIXED 12（RadarDistill、RCBEVDet、VQ-Map 各 4）／ISSUED-MISMATCH 0**。所有修改仅触及 `status: asserted` 卡，未动任何 signoff，未改 id。

---

## OmniQuant（对照 library/Quantization/OmniQuant.md）— 4 × PASS

| 卡 | 判定 | 核验要点 |
| --- | --- | --- |
| claim-omniquant-w2a16g128-llama7b-ppl-beats-gptq-awq | PASS | 笔记 3 条引文逐字命中（L170–172）；arXiv v3 Table 1 三行（GPTQ 44.01 / AWQ 2.6e5 / OmniQuant 9.72，1-7B W2A16g128 列）本次重下 v3 复验命中；v1 同位 10.53 与 mismatch 卡一致；「笔记表头误标 LLaMA-13B」的归因修正与校准集同源 caveat 均如实保留 |
| claim-omniquant-w4a4-llama7b-zeroshot-5265 | PASS | 笔记 4 条引文逐字命中（L187–190）；v3 Table 2 三行 + §4.1 校准句（128×2048-token，跨行连字符已还原口径属实）复验命中；「+6.22 实际对应 LLM-QAT+SQ(46.43) 而非 LLM-QAT(41.27)」经 v3 正文 L547 与 Table 2 L493–497 双向核实成立（52.65−41.27=11.38，52.65−46.43=6.22）；20 epochs / 单卡 A100 口径与 §4.1 一致（W2A16 为 40 epochs，与本卡无关） |
| claim-omniquant-let-lwc-ablation-w4a4-best | PASS | 笔记 4 条引文逐字命中（L204–207）；v3 Table A2 四行复验命中（28.78/16.97/15.80/12.87），且 L898 证实原表确有笔记未收录的 LET+grid-searched WC 15.82；「PPL 为 WikiText2+C4 平均」与 Table A2 说明、Table A10（W4A4 WikiText2 单项 11.23）一致 |
| claim-omniquant-w4a16g128-llama13b-a100-913toks | PASS | 笔记 2 条引文逐字命中（L221–222）；v3 Table 3 W4A16g128 行与 v1 FP 行复验命中；「笔记 FP16 基线 ~26GB/~40tok/s/>2倍 与原表不符（实际 24.3/27.1/52.5，加速 ≈1.74×）」复核成立（91.3/52.5=1.739） |

- 笔记本身的两处表格错误（实验 1 表头混列、实验 4 FP16 基线行）已有 `claims/claim-omniquant-note-table-mismatch.md` 完整覆盖，其证据（v1 10.53 行、逐通道 W2A16 三行、Table 1 表头、LOG.md 05:19 行）本次全部逐条复验命中，**未重复立卡**。

## RadarDistill（对照 library/Multimodal_Fusion/RadarDistill.md）— 4 × FIXED

| 卡 | 判定 | 修改与证据 |
| --- | --- | --- |
| claim-radardistill-lidar-teacher-boosts-radar-only-detection | FIXED | ① Model Zoo 行引文非逐字（`__`/`**` 混用、空格压缩、`Download` 链接文本被简化）→ 改为 raw README 逐字行；② locator「README / Methods」有误——README 无 Methods 节，该句在 Abstract 后的 Overall architecture 段 → 已改；③ 新增 arXiv v3 Table 1 证据：20.5/43.7 与基线 8.6/34.7 为 **nuScenes testset** 口径，README Model Zoo 与 Table 1 逐格一致，且基线 PillarNet* 带脚注「作者复现、无 test-time augmentation」——已写入 scope 与正文（原「val 还是 test」疑问就此关闭） |
| claim-radardistill-pfd-lambda-5to1-loss-gamma5-delta25 | FIXED | 笔记 5 条引文逐字命中；新增 v3 正文 3 条引文证实 σ=0.1、λ1=5/λ2=1（式 14）、γ=5/δ=25（式 18）与笔记一致；scope 由「未对照原文核实」收窄为「正文已核、开源 cfg 与复现未核」；status 仍 asserted |
| claim-radardistill-afd-ar-ir-adaptive-weighting | FIXED | 笔记 3 条引文逐字命中、README Abstract 引文逐字命中；新增 v3 公式 (5)(7) 与 ρ 解释引文：掩码阈值即 0（作用在沿通道求和的激活上），AR/IR 定义与 ρ=N_AR/N_IR 均与笔记一致；原「README 阈值口径与笔记可能不一致」的疑问关闭（阈值=0，README 表述与原文一致） |
| claim-radardistill-cma-densify-deep-supervision | FIXED | 笔记 3 条引文逐字命中、README 引文逐字命中。**更正初版卡的一个误判**：卡曾把笔记 CMA 小Trick 段的类比标签「AFD 的教学」判为「疑为笔记笔误」——对照 v3 公式 (9)–(10)，对 CMA 生成的 l1/l2 两级特征做蒸馏监督的正是 AFD 损失（L_AFD = ½Σ L_low^(n)），笔记标签与论文一致，系初版误读；已更正标题（监督由 AFD 损失承担）、删除错误注记，并新增 v3 结构证据（CMA 三件套、Down=DCN+ConvNeXt V2、两级特征进入 AFD）。「README 的 multiple layers of dilation operations」经查为论文摘要原话，与结构描述不矛盾 |

## RCBEVDet（对照 library/Multimodal_Fusion/RCBEVDet.md）— 4 × FIXED

**关键发现**：四张卡原先把消融/鲁棒性数字全部归于「扩展版论文（RCBEVDet++，经 nightshift/drafts/RCBEVDetPP.md 转录，待人工核对）」，但 CVPR 原文（arXiv:2403.16440，**仅有 v1**）本身就含这些数字——本轮已核入 evidence：

| 卡 | 判定 | 修改与证据 |
| --- | --- | --- |
| claim-rcbevdet-camf-alignment-then-fusion-robust | FIXED | 笔记 3 条引文逐字命中；新增 v1 §4.4/Table 7 证据：雷达失效（丢 1/3/全部视角雷达输入，Car class mAP）CRN 降 4.5/11.8/25.0、RCBEVDet 仅降 0.9/6.4/10.4——与草稿转录一致；scope/待验证更新（「CVPR 原版是否含鲁棒性表格」疑问关闭）；雷达坐标噪声数字仍只在扩展版（保持「待人工核对」） |
| claim-rcbevdet-dualstream-injection-extraction-interactive | FIXED | 笔记 4 条引文逐字命中；新增 v1 证据：『Injection and Extraction module is applied at each block of the two backbones』（逐层）、Table 5 行「+ Transformer Backbone 55.8 ↑0.1 44.8 ↑0.3」「+ Injection and Extraction module 56.4 ↑0.6 45.6 ↑0.8」——扩展版草稿的 +0.1 NDS / +0.6 NDS / +0.8 mAP 与 CVPR v1 Table 5 一致 |
| claim-rcbevdet-rcs-aware-scattering-dense-bev | FIXED | 笔记 4 条引文逐字命中（含半径公式行）；新增 v1 证据：散射阈值含 (cx²+cy²)×v_RCS 距离项（pdftotext 上标拉平已注明）、重叠像素 summation pooling 聚合、Table 5「+ RCS-aware BEV encoder 55.7 ↑1.4 44.5 ↑1.9」——笔记公式与 Sum Pooling 表述均与原文一致 |
| claim-rcbevdet-dmsa-gaussian-mask-early-convergence | FIXED | 笔记 2 条引文逐字命中；新增 v1 证据：DMSA 动机原句（early training iteration）、高斯掩码方向性（near high / far low）；掩码形式核实为 G_ij=exp(−D_ij/σ²)、以 **log G 加进注意力 logits**（Softmax(QKᵀ/√d + log G)V）、σ 可学习（重参数化为 β，β=0 退化为标准注意力）——原「是否以 log 形式加进 logits」疑问关闭；收敛增益本身仍未独立复现 |

## VQ-Map（对照 library/Quantization/VQ-Map.md）— 4 × FIXED（轻量）

笔记 13 条引文全部逐字命中；经仓库 README 确认 NeurIPS 2024 与 arXiv id（2411.01618），下载原文后**笔记全部数字与论文逐格一致**。四张卡补入 arXiv id 与论文证据（9 条新引文全部验证通过）：

| 卡 | 判定 | 修改与证据 |
| --- | --- | --- |
| claim-vqmap-nuscenes-map-miou-622-leads-table | FIXED | 新增 Table 1 VQ-Map 行（83.8/60.9/64.2/57.7/…/62.2）与 DDP 行（…59.4）；注明论文原表为 6 类 + 7 个对比方法行（另有 X-Align 58.0、MetaBEV 59.3 等，笔记只抄 4 类 3 行），「高于同表全部对比方法」在论文全表口径下同样成立；输入模态标注表内未给出，caveat 保留 |
| claim-vqmap-argoverse-zero-shot-iou-734 | FIXED | 新增论文 Argoverse monocular 表两行：**「前 SOTA 68.3」= TaDe [16]**，VQ-Map 73.4（Drivable/Crossing/Walkway/Carpark 四类平均）；原「68.3 对应哪篇方法无从核对」疑问关闭；零样本严格性 caveat 保留 |
| claim-vqmap-tiny-868g-macs-matches-ddp | FIXED | 新增 Table 5 三行（DDP 614.1G / tiny 86.8G / 62.2 版 231.6G，同表同列）；**重要口径补充**：论文该表「时间」列是训练时长（GPU hours，如 tiny 30+74=104h）而非推理延迟——笔记将其用作「前向推理极其高效」佐证时未做区分，已在卡上注明；「无实测延迟」caveat 保留 |
| claim-vqmap-token-classification-618-beats-regression | FIXED | 新增 Table 4 caption（(d)(e)(f) 三种监督定义）与 Mean 行（60.3/60.1/61.8 与笔记一致）；「消融配置与主表差异」caveat 保留 |

---

## ISSUED-MISMATCH：无

- OmniQuant 笔记两处表格错误已有 `claim-omniquant-note-table-mismatch.md` 覆盖（本轮逐条复验其证据全部命中，勿重复立卡）。
- RadarDistill 笔记疑似「AFD 的教学」笔误经论文核实**不是错误**（监督本就由 AFD 损失承担），故不立卡，只更正了 cma 卡的误判。
- RCBEVDet、VQ-Map 笔记数字/公式/结构与论文逐格一致，未发现需立卡的笔记错误。

## 修改的文件（本轮全部改动）

- `claims/claim-radardistill-lidar-teacher-boosts-radar-only-detection.md`（quote 修正、locator 修正、paper 证据、scope/正文/待验证更新）
- `claims/claim-radardistill-pfd-lambda-5to1-loss-gamma5-delta25.md`
- `claims/claim-radardistill-afd-ar-ir-adaptive-weighting.md`
- `claims/claim-radardistill-cma-densify-deep-supervision.md`（含标题更正与误判更正）
- `claims/claim-rcbevdet-camf-alignment-then-fusion-robust.md`
- `claims/claim-rcbevdet-dualstream-injection-extraction-interactive.md`
- `claims/claim-rcbevdet-rcs-aware-scattering-dense-bev.md`
- `claims/claim-rcbevdet-dmsa-gaussian-mask-early-convergence.md`
- `claims/claim-vqmap-nuscenes-map-miou-622-leads-table.md`
- `claims/claim-vqmap-argoverse-zero-shot-iou-734.md`
- `claims/claim-vqmap-tiny-868g-macs-matches-ddp.md`
- `claims/claim-vqmap-token-classification-618-beats-regression.md`
- 本报告：`nightshift/qa/round2-quant-fusion.md`

未触碰：任何 signoff、任何 verified/refuted/stale 卡、`library/`、`index/`、`tools/`、`nightshift/QUEUE.md`、`LOCK`、`RULES.md`、`AGENTS.md`、`TODO.md`；未 git 提交。

## validate

`node tools/ka.mjs validate` → **OK: 114 claim(s) validated**（全部修改完成后运行）。

## 遗留问题（建议转 QUESTIONS.md / 待用户处理）

1. **library/ 笔记瑕疵（须用户同意才能改）**：
   - `library/Quantization/VQ-Map.md` L62 图片为失效本地路径 `D:\Research\Notes\assets\VQ-Map\Figure4.png`，违反「配图放 assets/<论文名>/」约定；
   - 乱码字符：`library/Quantization/VQ-Map.md` L105「细??度」、`library/Quantization/OmniQuant.md` L321「离群??」、L365「??如」。
2. **RCBEVDet 雷达坐标噪声数字**（−1.3/−2.3 NDS 等）仍只由扩展版论文草稿 `nightshift/drafts/RCBEVDetPP.md` 转录支撑（2403.16440 仅有 v1，扩展版 arXiv id 待确认），待人工核对原文。
3. **VQ-Map**：各对比方法输入模态标注（尤其 BEVFusion 行配置）与 MACs 统计工具/输入分辨率原文未在表内给出，需读正文确认；推理实测延迟证据仍缺。
4. **RadarDistill**：开源 cfg 的 loss 权重默认值、AFD 的 α/β 取值未核；论文口径为 nuScenes testset 且基线无 TTA，第三方 val 复现对比时需换算说明。
