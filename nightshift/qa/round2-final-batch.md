# QA round2 补批：6 篇 24 张未覆盖卡复审

日期：2026-11-02 · 复审人：nightshift 子代理（QA） · 结论：**24 PASS / 0 FIXED / 0 ISSUED**

方法：对 24 张卡的全部 90 条 evidence 逐条做逐字包含校验（Node 脚本按 YAML quote 原文、保留弯引号/全角字符与转义，对 source 文件做 `includes` 精确匹配；89 条库内 quote 全部 PASS，1 条 URL quote 对 arxiv.org/abs/2308.10515 摘要实时抓取核对逐字成立，含 "On the nuScenes datasets, the 4-bit weight and 6-bit activation quantized QD-BEV-Tiny model achieves 37.2% NDS with only 15.8 MB model size"）。locator 对照笔记实际章节标题核对；全部数字在笔记表格内重算换算（EMC2 错位检查项）；口径 caveat 逐条与 scope/正文对照。未发现需要改卡的小错，本轮零改动（未触碰任何 signoff / status）。

## PD-Quant（对照 library/Quantization/PD-Quant.md）

| 卡 | 结论 | 核验要点 |
| --- | --- | --- |
| claim-pdquant-beats-brecq-qdrop-lowbit | PASS | 3 quote 逐字 PASS（Table 3 行）；增益重算 +1.72/+1.21/+2.80/+3.99 与正文一致，"最高提升 4%"↔MNasNet +3.99 成立；scope 四个设置与表行一致；"校准配置未注明" caveat 保留 |
| claim-pdquant-dc-bn-stats-narrow-calibration-val-gap | PASS | §2.1 quote（含弯引号“真值”）+ Table 2 两行 PASS；52.74→53.14 = +0.40、差距 0.33→0.19 重算一致；"仅适用带 BN 的 CNN / 校准集未注明" caveat 保留 |
| claim-pdquant-pd-loss-alone-overfits-calibration | PASS | Table 2 三条 quote（Calibration/Validation 两列）PASS；70.51 vs 1.07、49.16、52.74、53.14 链路与笔记一致；"两列不可混用（QwT 教训）" caveat 保留；20,000 次迭代与 §3 一致 |
| claim-pdquant-pd-metric-beats-mse-cosine-2bit-activation | PASS | Table 1 三条 quote PASS；Min-Max 1.83/0.81、Cosine 23.36/15.68、PD 28.41/23.51 与表一致；"数据集与精度口径（校准 vs 验证）未注明" caveat 保留 |

## QD-BEV（对照 library/Quantization/QD-BEV.md）

| 卡 | 结论 | 核验要点 |
| --- | --- | --- |
| claim-qdbev-encoder-backbone-quantization-bottleneck | PASS | Table 1 全部 6 条 quote PASS；Encoder 最小降幅 0.058（Small 行）、Backbone 最小降幅 0.044（Tiny 行）重算成立；Neck/Decoder |Δ|≤0.002 逐格核对成立；"单模块口径 / W4A6 限定" caveat 保留 |
| claim-qdbev-progressive-qat-beats-standard-w4a6 | PASS | Table 3 两行 + §2 + 分析 quote PASS；0.485−0.224=0.261 重算一致；"差距主要体现在 Base、Tiny/Small 仅 0.022/0.046（据 ar5iv）"、"N_i 未注明" caveat 保留 |
| claim-qdbev-ptq-collapses-below-8bit | PASS | Table 2 五条 quote PASS；下降比 (0.517−0.487)/0.517≈5.8%、(0.517−0.226)/0.517≈56.3% 重算一致，无错位迹象；"朴素对称 PTQ 口径、校准方法未注明、跨域不可移植" caveat 保留 |
| claim-qdbev-tiny-w4a6-nds-surpasses-fp32 | PASS | Table 4 三条 quote + arXiv 摘要 quote 实时抓取逐字 PASS；126.8/15.9≈7.97、NDS +0.018、mAP +0.002、mASE 变差 0.294→0.321 一致；"15.8（摘要）vs 15.9（Table 4）差异""反超幅度小、单次自报""Table 4 分辨率未注明" caveat 保留 |

## RepQ-ViT（对照 library/Quantization/RepQ-ViT.md）

| 卡 | 结论 | 核验要点 |
| --- | --- | --- |
| claim-repqvit-w4a4-imagenet-leads-ptq-baselines | PASS | 表 3 条 quote PASS；FP32 84.54/79.85/83.23、基线行 0.10/30.69…/41.41…、69.03−43.55=+25.48 全部一致；"校准 32 张 vs 测试口径""对比方法 No HP/No REC 设定不对齐" caveat 保留 |
| claim-repqvit-layernorm-reparam-recovers-layerwise | PASS | 消融 3 条 + §2.1 注 quote（含 `$\widetilde{W}$` LaTeX 转义）PASS；33.17/70.28/69.03 一致，70.28−69.03=1.25 成立；"69.03 即完整方法数字""极少量校准未注明" caveat 保留 |
| claim-repqvit-softmax-reparam-log2-lossless | PASS | 消融 3 条 quote PASS；67.71/69.03/69.03 一致，差 1.32 成立；"100% 数学等价是数学论证、无硬件 benchmark" caveat 保留 |
| claim-repqvit-calibration-32-images-1point3-min | PASS | 效率表 3 行 + 分析 quote PASS；32 张/1.3 分钟/1000 张 0.5 分钟/32 张 3.2 分钟一致；"1.3 分钟是校准+量化流程耗时非推理延迟、模型未注明" caveat 保留 |

## CenterNet-Triplets（对照 library/Classical_Detection/CenterNet：Keypoint Triplets.md）

| 卡 | 结论 | 核验要点 |
| --- | --- | --- |
| claim-centernettriplets-cre-ap-gain-small-objects | PASS | 5 条 quote（含 `$511\times511$` 转义）PASS；37.6→39.9（+2.3）、AP_S +4.6、AP_L 52.2→52.3 与消融第一步一致；"数据集/协议未注明（COCO 为惯例待核对）""CRE/CTP/CCP 同名不同作提醒" caveat 保留 |
| claim-centernettriplets-ctp-ap-gain-large-objects | PASS | 3 条 quote PASS；39.9→40.8（+0.9）、AP_L 52.3→53.6（+1.4）与第二步一致；"叠加增量不可与 +2.3 相加" caveat 保留 |
| claim-centernettriplets-ccp-ap-gain-large-objects | PASS | 3 条 quote（含弯引号“先看边，再看里”）PASS；40.8→41.3（+0.5）、AP_L 55.8 与第三步一致；"55.8 是与 CRE 协同后的全配置值、不能全归因 CCP" caveat 保留 |
| claim-centernettriplets-gt-center-oracle-ap-565 | PASS | 错误分析 4 条 quote PASS；41.3→56.5（+15.2）、Table 5 标注一致；"oracle 上限非系统精度""+15.2 归因是论文解释" caveat 保留 |

## Fast R-CNN / Faster R-CNN（对照 "library/Classical_Detection/Fast R-CNN 和 Faster R-CNN .md"）

| 卡 | 结论 | 核验要点 |
| --- | --- | --- |
| claim-fastrcnn-multitask-loss-beats-cls-only | PASS | 损失公式（含 `\lambda [u \ge 1]`）+ 2 条 quote PASS；Table 6 结论行逐字成立（笔记该行 bold 标记本身不闭合，quote 如实照抄，见下方笔记观察）；"笔记仅载结论未载数字、backbone/数据集未标注" caveat 保留，卡未主张幅度 |
| claim-fastrcnn-roipooling-arbitrary-to-fixed-feature | PASS | 3 条 quote PASS；7×7 / VGG16 步长 16 / 512 通道逐通道独立与笔记一致；机制主张未涉数字 |
| claim-fastrcnn-rpn-shared-features-raise-map | PASS | 4 条 quote PASS；58.7→59.9（+1.2）与笔记 Table 2 记载一致；"2 秒/张不当作可复现精确耗时""数据集未标注" caveat 保留 |
| claim-fastrcnn-two-stage-beats-one-stage | PASS | 4 条 quote PASS；58.7−53.9=4.8 与笔记一致；"不主张跨时代/跨数据集普适" caveat 保留 |

## SGDet3D（对照 library/Classical_Detection/SGDet3D.md）

| 卡 | 结论 | 核验要点 |
| --- | --- | --- |
| claim-sgdet3d-srp-gdc-laca-vod-monotonic | PASS | §5.1 五条 quote PASS；50.44→56.11→58.27→59.49 与 69.76→73.06→75.80→77.11 双序列逐格一致；+5.67 = 56.11−50.44 成立；"GDC/LACA 未单测""EAA/DC 口径未定义、与 HGSFusion 不可比" caveat 保留 |
| claim-sgdet3d-depth-orientation-pollution-without-gdc | PASS | §5.2 四条 quote PASS；55.79/54.29/58.19/58.35 与 73.19/73.25/75.28/75.57 一致；"mAP_DC 上 73.25>73.19 方向相反、主张仅限 EAA" caveat 保留（关键防错点） |
| claim-sgdet3d-depth-supervision-density-gain | PASS | §5.3 四条 quote PASS；56.95/58.75/59.49 与 74.12/74.03/77.11 一致；"单调性仅 EAA 成立（DC 上 Radar 74.03<None 74.12）""推理期输入未明说、LiDAR 行=完整模型" caveat 保留 |
| claim-sgdet3d-sota-eaa-dc-caliber | PASS | §1 两条 + §5.1 完整模型行 quote PASS；59.49/77.11 两表自洽；"笔记无 SOTA 对比表、TJ4DRadSet 无数字、与 HGSFusion 口径互不可比" caveat 保留 |

## 笔记层面观察（不改笔记，仅记录；未影响上述卡片的 quote 事实性）

1. "Fast R-CNN 和 Faster R-CNN .md" 有多处脚注残留数字与格式瑕疵：`（含背景）4。`（输出层节）、`600 像素 8888`（实验二）、`0.8 个点 12`、`14`、`2`、`3`、`4`、`5`、`7`、`8` 等行尾孤立数字；Table 6 结果行 `**多任务训练**都比**仅训练分类要好` bold 不闭合。卡片引用处均逐字照抄原文，事实不受影响。
2. RepQ-ViT.md §3.3 之后附有一段口语化推导长文（"没问题！这绝对是……" 起），不符合库内 L1 编号章节约定，且其中"比如 197 张图像 Patch"表述不严谨（197 是 ViT 的 token 数，含 cls token，非"197 张图像"）。4 张 RepQ-ViT 卡均未引用该段，无事实影响。
3. CenterNet：Keypoint Triplets.md 未记载数据集与评测协议（消融与 oracle 均无）——4 张卡已如实以"待人工核对原文"入 scope/falsifiers，属笔记信息缺口而非错误。
4. SGDet3D.md 未记录英文原题与 arXiv 号、未记录 SOTA 对比表与 EAA/DC 指标定义——卡已如实标注。

## 遗留问题（转调度班次）

- 无新增。QD-BEV-T 模型大小 15.8（arXiv 摘要）vs 15.9（Table 4）的差异已在卡内限定第 2 条记录，无需另立卡。
- 库内跨论文遗留（SGDet3D vs HGSFusion 的 VoD 口径仲裁）维持原状，属 cross 文档 M1/M2 既有问题。

## 校验

- 90/90 evidence quote 逐字核验通过（89 库内脚本比对 + 1 URL 抓取比对）。
- `node tools/ka.mjs validate`：**OK: 114 claim(s) validated**（2026-11-02，本批 24 卡均 asserted，未触碰任何 signoff）。
