# QA round3 终审报告（121→116 卡 · 第 3 轮 · 规则上限）

日期：2026-11-03 · 复审人：nightshift 子代理（QA round3） · 对象：本夜班 fire-0143 / fire-0238 之后的全部 116 张卡
结论：**必审层 36 张：PASS 33 / FIXED 3 / MISMATCH(历史引文,在案) 5 卡内 15 条；抽查层 30 张全 PASS；`node tools/ka.mjs validate` OK: 116。未动任何 status / signoff / id，未 git 提交。**

---

## 0. 方法

- **逐字核验自动化**：`/tmp/qa3/verify-quotes.mjs`（临时脚本，未入仓库）解析全部 116 张卡 frontmatter，对 351 条本地 `library/` evidence quote 逐条做精确子串匹配（含 YAML 反转义、空白归一化兜底），另校验 status / scope / falsifiers / note 锚文件 / related 悬空 / 正文 `](claim-*.md)` 链接悬空；450 条 quote 中其余 99 条为 arXiv/README 等远程 source，沿用 round2 抓取记录，本轮仅对两张新卡的远程证据做了独立重抓复核（见 §1.4）。
- **必审层名单**：round2 各批报告 FIXED 19 + ISSUED 2（任务书口径 FIXED×16，按报告实数 19 全覆盖）＋ `git show 007992f / df02109` 涉及的全部卡（含新卡 2、指针注记卡 4、注记修订卡 6，去重后合计 **36 张**）。
- **抽查层**：其余 80 张按固定种子抽样 30 张（清单见 §2）；三项轻量检查（quote 逐字 / 结构完整 / related 无悬空）实际已由自动化覆盖全部 116 张，其中 4 张另用裸 `grep -F` 独立复核通过（脚本交叉验证）。

## 1. 必审层逐卡结论（36 张）

### 1.1 round2 FIXED 卡（19 张）——全部 PASS（round2 修复均在位、quote 现仍逐字命中）

| 卡 | 结论 | 复核要点 |
| --- | --- | --- |
| claim-hgsfusion-2d-spatial-mode-beats-3d | PASS | round2 修复（cross §6.5 引用）在位；3/3 quote 命中 |
| claim-njusparseocc-rayiou34-fps17-beats-dense-baselines | PASS | 「FPS 差 3.3 倍（17.3 vs 5.2；对 BEVFormer 约 7.5 倍）」修复在位 |
| claim-cornernet-single-scale-no-fpn | PASS | quote 1 已随 fire-0238 去尾随空格同步，逐字命中；修订注记准确 |
| claim-radardistill-lidar-teacher-boosts-radar-only-detection | PASS | nuScenes testset 口径 + PillarNet* 脚注 + Overall architecture locator 修复均在位 |
| claim-radardistill-pfd-lambda-5to1-loss-gamma5-delta25 | PASS | 8/8 本地 quote 命中；σ/λ/γ/δ 数字与 round2 记录一致 |
| claim-radardistill-afd-ar-ir-adaptive-weighting | PASS | AR/IR/ρ 定义引文在位 |
| claim-radardistill-cma-densify-deep-supervision | PASS | 标题「监督由 AFD 损失承担」更正保留 |
| claim-rcbevdet-camf-alignment-then-fusion-robust | PASS | Table 7 鲁棒性行引文在位 |
| claim-rcbevdet-dualstream-injection-extraction-interactive | PASS | 逐层交互 + Table 5 引文在位 |
| claim-rcbevdet-rcs-aware-scattering-dense-bev | PASS | 半径公式/Sum Pooling 引文在位 |
| claim-rcbevdet-dmsa-gaussian-mask-early-convergence | PASS | log G 进 logits、σ 可学习引文在位 |
| claim-vqmap-nuscenes-map-miou-622-leads-table | PASS | Table 1 全表口径补充在位 |
| claim-vqmap-argoverse-zero-shot-iou-734 | PASS | TaDe 68.3 归因在位 |
| claim-vqmap-tiny-868g-macs-matches-ddp | PASS | 「训练时长 GPU hours ≠ 推理延迟」口径注 ×3 在位 |
| claim-vqmap-token-classification-618-beats-regression | PASS | Table 4 Mean 行引文在位 |
| claim-radarocc-cfar-pointcloud-loses-lowrcs | PASS | round2 补的第 2 条 evidence 在位；fire-0238 指针行指向新卡（目标存在） |
| claim-r4det-pdf-depth-supervision-monotonic-gain | PASS | note 锚已同步重编号 #211-…；Metric3D 已核实并注记（round2 的「未明确记录」句已自标过时） |
| claim-sparseocc-miou141-beats-dense-baselines | PASS | README 原句 "Occupancy Prediction on OpenOccupancy validation set" 修复在位 |
| claim-surroundocc-dense-gt-supervision-sc-iou-1196-to-3149 | PASS | 「约 2.6 倍」修复在位 |

### 1.2 ISSUED / note-mismatch 卡（2 张）——PASS（附注与 evidence 自洽）

| 卡 | 结论 | 复核要点 |
| --- | --- | --- |
| claim-emc2-note-table-mismatch | PASS | 笔记 §5.1 现表与附注描述逐格一致（A4000/Jetson 两列：41/972、58/N/A、100/N/A、162/N/A、160/372.5；Hard 66.26 / 84.31 / 86.73；965ms 归 Voxel-RCNN；TED 154=CAT-DET）；卡内 3 条笔记 quote 为修正前历史记录，附注已声明「既有 evidence 未动」，自洽 |
| claim-omniquant-note-table-mismatch | PASS | 现表与附注一致：实验 1 表头已改「LLaMA-1-7B W2A16g128」+ RTN 1.9e3（GPTQ 44.01 / AWQ 2.6e5 / OmniQuant 9.72 不变）；实验 4 FP16 基线已改 24.3/27.1/52.5、1.74×、~71%；4 条失配 quote 均为修正前历史记录，附注自洽 |

### 1.3 本夜班新卡 + 指针注记（6 张）——PASS

| 卡 | 结论 | 复核要点 |
| --- | --- | --- |
| claim-echofusion-paper-table6-inconsistent-with-text | PASS | **独立重抓 arXiv v2 HTML（2026-11-03）复核**：§5.4 句逐字、L 行 84.47±0.15、C+RT 行 84.92±0.98 全部证实（实差 +0.45 且方向为「高」，正文 0.03 不自洽）；笔记确无 Table 6/84.92/84.47（grep 0 命中，卡内「笔记无此内容」声明属实）；QUESTIONS #4 引文逐字 |
| claim-radarocc-sss-ablation-gain-10p2 | PASS | **独立重抓 arXiv v4 HTML（2026-11-03）复核**：Table 2 行 (a)/(b)/(c) 全部 12 列数字与卡及笔记转录逐格一致；SSS→percentile 句与 "the improvement is somehow marginal" 句逐字在位；差值 -10.2/-8.3/-7.0 与 FG 塌陷 -14.8/-14.0/-12.3 算术自洽；4 条指针卡的目标 id 均存在 |
| claim-radarocc-{dbd,s2c,sss-rangewise} + cfar 指针行 | PASS | 4 卡指针行「2026-11-03 消融核查：见 claim-radarocc-sss-ablation-gain-10p2」均指向存在的新卡；s2c 的 2 条 locator 已同步 2.3.x 重编号且 quote 命中 |

### 1.4 fire-0238/0143 注记修订卡（其余 9 张）——PASS 8 / FIXED 1

| 卡 | 结论 | 复核要点 |
| --- | --- | --- |
| claim-omniquant-w4a16g128-llama13b-a100-913toks | PASS | 两行笔记 quote 已同步修正后表格并逐字命中；修订注记与笔记注记一致 |
| claim-emc2-orin-sub400ms-leading-accuracy | PASS | §5.1 EMC2 行 quote 与重建表逐字命中；注记「自身行数字未变、仅新增 A4000 列」属实 |
| claim-fcos-centerness-regression-branch-ap-gain | PASS | 出处附注（arXiv v5 §3.3 脚注 + Table 3 37.1→37.4）记录 URL/日期齐全；title/scope 未动（QUESTIONS #27① 留主人） |
| claim-pointnetpillars-direction-classifier-sine-flip | **FIXED** | 注记说 quote 1 已去残留「10」，但正文「限定」句仍写「quote 末尾的"10"…逐字保留」，自相矛盾 → 限定句已更新为「已随 F27 从笔记与 quote 1 同步删除」（仅改这一句，claim/status 未动） |
| claim-sgdet3d-sota-eaa-dc-caliber | PASS | 62.61→79.46 口径更正注记与笔记表后注一致；核心结论（互不可比）不变 |
| claim-sgdet3d-srp-gdc-laca-vod-monotonic | PASS | 同上；59.49/58.96/EAA 限定不变 |
| claim-centernetpoints-note-citation-artifacts | PASS | 三处残留（17/18181818/20）确认已从笔记删除、正文文字未改，与附注一致；quote 为历史记录（QUESTIONS #25） |
| claim-sparseocc-note-conversational-residue | PASS | 问句已改陈述句（L123）+ 排版注（L125）；§2.4.1–2.4.4 重编号确认；与附注一致（QUESTIONS #25） |
| claim-qwt-r2-gate-nonregression | **FIXED** | 自动化发现 EV1「如果 R² ≤ 0：…」系笔记 L99 的去 LaTeX 转写、**从未逐字命中**（非本夜班笔记修正引起）→ quote 已同步为笔记原句逐字引文「**如果 $R^2 \le 0$**：…」，并在附注追加 round3 说明；EV2 不受笔记加限定影响（原句前缀未动） |

### 1.5 语义反转在案卡（1 张）——FIXED（仅加注）

| 卡 | 结论 | 复核要点 |
| --- | --- | --- |
| claim-hgsfusion-cyclist-roi-ap-below-all-baselines | **FIXED（加注）** | 卡内 2026-11-03 注记写「**若后续**按原文修这些行…结论会被推翻，故本卡暂不动」，但 fire-0238 已把笔记 §4.1 **全表**按原文重建，反转已坐实（修正后 Cyclist 87.49 > PointPillars 85.07，QUESTIONS #24）→ 追加 round3 注记写明「假设已落地、反转坐实、卡未动、待主人处置」。**主张正文 / status / evidence 数字均未动**（铁律 3：语义反转不替主人改卡）；EV1–EV4/EV6 为修正前历史记录（约 5 条），EV5（LXL 行）为 fire-0143 同步件仍命中 |

**必审层小结**：PASS 33 / FIXED 3（qwt quote 逐字化、pointnetpillars 限定句、hgsfusion-cyclist 加注）。5 张卡共 15 条 quote 与现行笔记不逐字对应，全部属于「笔记已修正 + 卡内加注 + quote 保留历史记录」的在案安排（铁律 3），无一例未解释的 MISMATCH。

## 2. 抽查层（30 张，全 PASS）

固定种子抽样自其余 80 张；quote 逐字 / status / scope / falsifiers / related 结构检查由自动化覆盖（含下列 30 张），另对加粗 4 张用裸 `grep -F` 独立复核通过：

claim-omniquant-let-lwc-ablation-w4a4-best、claim-njusparseocc-rayiou-penalizes-thick-surface、claim-omniquant-w4a4-llama7b-zeroshot-5265、claim-pointnetpillars-pillar-encoding-2dcnn-avoid-3dconv、claim-bevplanner-egomlp-parity-l2-collision、claim-pdquant-dc-bn-stats-narrow-calibration-val-gap、claim-pdquant-pd-loss-alone-overfits-calibration、**claim-bevplanner-ego-velocity-dominates-planning**、claim-pointnetpillars-pointnet-permutation-invariance-symmetric-function、claim-caddn-depth-supervision-dominant-ablation-gain、claim-centernettriplets-gt-center-oracle-ap-565、**claim-ptqat-w8a8-tensorrt-accuracy-recovery**、claim-ptqat-w4-outperforms-full-qat-fewer-params、claim-qdbev-progressive-qat-beats-standard-w4a6、claim-centernetpoints-heatmap-peaks-replace-nms、claim-repqvit-calibration-32-images-1point3-min、claim-qdbev-tiny-w4a6-nds-surpasses-fp32、claim-r4det-dgtf-t1-single-step-best、**claim-centernettriplets-cre-ap-gain-small-objects**、claim-r4det-plugplay-vod-eaa-gain、**claim-repqvit-softmax-reparam-log2-lossless**、claim-fastrcnn-multitask-loss-beats-cls-only、claim-cornernet-corner-pooling-directional-maxsum、claim-sgdet3d-depth-orientation-pollution-without-gdc、claim-repqvit-w4a4-imagenet-leads-ptq-baselines、claim-sparseocc-decomposed-kernel-beats-full-kernel、claim-echofusion-note-table-mismatch、claim-echofusion-radial-ap-ar-tradeoff、claim-cornernet-paired-keypoints-anchor-free、claim-fastrcnn-roipooling-arbitrary-to-fixed-feature

全库附加结构核验：116/116 status: asserted、scope/falsifiers 齐全、`note:` 锚文件全部存在、`related` 与正文 claim 链接 0 悬空。

## 3. 本轮修改清单（3 处，均不碰 status / signoff / id）

1. `claims/claim-qwt-r2-gate-nonregression.md`：EV1 quote 同步为笔记 L99 逐字原句（原为去 LaTeX 转写，从未逐字）；附注追加 round3 说明。
2. `claims/claim-pointnetpillars-direction-classifier-sine-flip.md`：正文「限定」句更新——「10」已随笔记 F27 修复从笔记与 quote 同步删除，消除与修订注记的自相矛盾。
3. `claims/claim-hgsfusion-cyclist-roi-ap-below-all-baselines.md`：追加 round3 终审注记（笔记全表已重建、语义反转坐实、卡未动、待主人处置），原注记保留。

## 4. 遗留（转调度班次 / 主人）

1. **hgsfusion-cyclist 卡降级/改写**：语义反转已坐实（QUESTIONS #24 在案），本轮只加注未动卡，处置权在主人。
2. **4 张「笔记已修正」卡的 status 处置**：centernetpoints-note-citation-artifacts、sparseocc-note-conversational-residue（falsifier「已修复」分支已触发）与 emc2/omniquant 两张 mismatch 卡是否转 stale，只能由主人手工定（QUESTIONS #25 在案）。
3. **历史 quote 的长期策略**：5 张卡共 15 条 evidence quote 为修正前历史记录（有意保留）。若主人希望 evidence quote 永远指向现行文本，需统一决策后批量处理，本轮不动。
4. **qwt 卡 verify §4 建议**（拆分主张/补论文原文 evidence）仍待主人定夺（既有遗留）。
5. **FCOS 卡 title/scope**「未注明出处」措辞可按新附注更新（QUESTIONS #27①，留主人）。
6. 远程（arXiv/README）quote 本轮未全量重抓（仅两张新卡独立复核）；如需全量复核建议单独立项。
