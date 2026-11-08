# 待主人拍板

（夜班把拿不准、需要主人决定的事项写在这里，不要替主人做决定）

## 2026-11-02 fire-now

1. **BEV-Planner 开源状态**：NVlabs/BEV-Planner 的 GitHub README 抓取超时（raw.githubusercontent.com 不可达），笔记三行头部的"是否开源"目前仅以 arXiv 摘要原句为据，未做二级确认。→ 请主人顺手确认后修正笔记头部。
2. **BEV-Planner 输入分辨率**：笔记 §3.1 按抓取页 alttext 记为 256×704，但 LaTeXML 渲染有 mphantom 缺字 bug，可能有误。→ 建议对照 PDF 确认。
3. **library/README.md 的 ADe2e 小节**：已给出建议表格行（`nightshift/suggestions/library-README-ADe2e.md`），篇数暂按 1 计（UniAD/AutoVLA 目录只有截图无笔记）。→ 等你同意后手动合并。
4. **EchoFusion 论文自身疑点**：正文称 RT+C 的 BEV AP "only 0.03 less than LiDAR"，但 Table 6 数字 84.92 vs 84.47 实差 0.45，疑似论文笔误。是否值得另立一张 claim 卡记录此矛盾（措辞会是"论文声称/数字不自洽"），由你决定。
5. **ShuffleNet 出处存疑**：arXiv abs 页无 Comments 字段，"CVPR 2018" 系任务给定；v2 正文自称 "This report"。建卡/引用前建议对照 CVF Open Access 版确认。
6. **MobileNet 系列 ar5iv 版本歧义**：V2/V3 的 ar5iv 摘要与 arXiv abs 页 v1–v5 摘要均不一致（V3 头条数字 20/6.6/34 vs 15/4.6/30）。笔记已双源分别标注，但引用 V2/V3 数字前建议以官方 PDF 对版。另 V3 内部 Table 3 vs 附录 Table 9 有 219/217、67.4/67.5 两处小出入。
7. **OpenDriveVLA 标题确认**：实际标题为 "OpenDriveVLA: Towards End-to-end Autonomous Driving with Large Vision Language **Action** Model"（arXiv:2503.23463，API ti 检索唯一命中，v1/v2 一致），与我下发任务里写的 "...Vision Language Models" 有出入。已按唯一命中采用，请你确认无误。
8. **TODO 笔误更正确认**：TODO「VLM / VLA」组里的 "Alpamago" 经 arXiv 全网检索不存在（totalResults=0），实为 NVIDIA 的 **Alpamayo-R1**（arXiv:2511.00088）；身份已由你预存的 `library/assets/Alpamago/` 表格截图与论文 HTML 逐值交叉确认。草稿按 Alpamayo-R1 写成，文件名暂用 Alpamago.md，正式入库时建议更名并修 TODO。
9. **TODO 笔误更正确认（二）**："BRCEQ" 实为 **BRECQ**（arXiv:2102.05426，ICLR 2021，PTQ；API 检索 BRCEQ 0 命中、BRECQ 恰 1 命中，且 `library/assets/BRCEQ/` 三张截图均为 BRECQ 内容）。草稿按 BRECQ 写成；TODO.md 是禁改文件，请你顺手改。BRECQ 的 ICLR 2021 出处仅依据官方 GitHub 自述，引用前建议核 OpenReview。
10. **COTR 配图表号错位**：本地 `library/assets/COTR/Table4.png` 的内容实为论文 HTML v2 的 Table 3，PDF 与 HTML 表号疑整体错位一位。回填配图前请对照官方 PDF 确认映射。另 COTR 原文内部有三处数字/表述不一致（§4.3 41.05 vs Table 2 的 41.39 等），笔记已注记。
11. **RadarOcc 消融表待查**：RadarOcc 笔记缺实验章节（止于损失函数小节），4 张新卡因此全部立为窄卡。若论文原文有 SSS/DBD/S2C 消融表，可补笔记后另立性能卡——补 library 笔记需你同意，是否要做？
12. **VQ-Map 笔记乱码**：`library/Quantization/VQ-Map.md` §4.1 分析行约 105 行处有乱码"细□度"（疑为"细粒度"），请人工修复。另 VQ-Map 四张新卡均基于笔记单源自报数字，笔记未给 arXiv 号，引用前建议对原文核对。
13. **OmniQuant 笔记表格混列（重要）**：对照 arXiv v3 camera-ready + v1 PDF 核实——笔记「实验 1」表头 LLaMA-13B W2A16 列下的数字（44.01 / 2.6e5 / 9.72）实为 LLaMA-1-7B W2A16g128 列；「实验 4」FP16 基线行（~26GB / ~40tok/s / >2×）与原表（24.3 / 27.1 / 52.5，实际加速 ~1.74×）不符。note-mismatch 卡已排队（agent 可合法创建）；library/ 修正请你处理。

## 2026-11-03 fire-0106（入库批 1–2）

14. **assets/QLoRA/Fig3.png 来源不明**：Speedup–Params 图（图例含 A40/RTX 4090 等），经核不在 QLoRA 论文 v1 HTML 内（正文图仅至 Figure 6，无该图与 "A40"/"Speedup" 字样），未嵌入正文、仅素材登记注明。是否删除/保留由你定。
15. **ShuffleNet 素材错位实锤**：库内唯一 ShuffleNet 素材 `Figure_ExperimentComparison.png` 图例为 "ShuffleNet v2 (Ours)"，属 V2 论文而非本文 Figure 1/2；笔记未引用（TODO 已注记）。是否补抓 V1 原图由你定。
16. **ADe2e 素材目录位置**：UniAD/AutoVLA 素材在 `library/ADe2e/<论文名>/` 而非 README 约定的 `assets/<论文名>/`；本次未迁移（不擅动主人素材）。要么迁移要么改约定——README 重建任务（P0 尾）等这条结论。
17. **COTR 表号映射（原 #10 跟进）**：入库版已把「Table4.png 内容=HTML v2 Table 3」caveat 落进笔记 Locator 注与 §3.3 配图注；PDF↔HTML 表号整体错位仍待对官方 PDF 定位（另三处原文数字不一致照录）。
18. **MobileNet V1/V2 MAdds 跨论文口径差**：V1 Table 6 569M vs V2 Table 4 575M（疑同规格），已记入 MobileNet 笔记遗留 8；两表数字不要跨论文混用。

## 2026-11-03 fire-0143（入库批 3 + fix P1 + EchoFusion 卡）

19. **EchoFusion 方向反转（#4 跟进）**：实抓 arXiv:2307.16532 v1/v2 后发现——正文 "only 0.03 less than LiDAR" 但 Table 6（v1 为 Table 5）RT+C 84.92 比 L 84.47 **高** 0.45，"less" 方向与表格相反。窄卡 `claim-echofusion-paper-table6-inconsistent-with-text` 已建（7 条 evidence 双源）。另 `assets/EchoFusion/Table6.png` 内容实为 Table S3（文件名不符）。
20. **HGSFusion §4.1 其余行与原文不符（重要，P1 之外新发现）**：PointPillars/BEVFusion 行 Ped↔mAP 两列互换、HGSFusion 行三列轮转、RadarPillarNet 行混入 FUTR3D 的 86.19/43.10。**按原文修正会使 claim-hgsfusion-cyclist-roi-ap-below-all-baselines 主张反转**（原文 Cyclist 87.49 > PointPillars 85.07），本次只加表后注未改数字——修不修、cyclist 卡是否降级，由你定。另 fix-list F7 的"全类 mAP (RoI) 62.61"实为走廊区 Pedestrian（走廊 mAP 是 79.46）。
21. **素材文件名错位批量清单**（各笔记 caption 已逐一注记，是否统一改名由主人定）：BEVDet Table2.png=论文Table 4、Format1.png=式(2)；PillarNet Figure_Loss.png=式(2)、Table4_EncoderAblation.png 为重复截图；LLaVA Figure1.png=Table 3、Table2.png=Table 1；Qwen3-VL Figure2.png=Figure 1；LSQ Equation2.png=式(3)；RCBEVDet++ `_page_*` 与论文图号无关。
22. **PillarNet 内容并存**：新入库 `library/BEV_Detection/PillarNet.md` 与 `Classical_Detection/PointNet & PointPillars.md` 内的 PillarNet 段并存，是否合并由你定。
23. **RCBEVDetPP §V-B1 "reduce the velocity error by 14.6%"** 无法由 Table I 行差推出（论文原句照抄未改、笔记已注）——引用/建卡勿取该句。

## 2026-11-03 fire-0238（fix P2 + RadarOcc 消融核查）

24. **hgsfusion-cyclist 卡语义反转坐实（#20 跟进）**：F7 修正后（§4.1 表按 arXiv:2412.11489v1 Table 1 走廊区逐格改正），Cyclist 87.49 实高于纯雷达基线 PointPillars 85.07——`claim-hgsfusion-cyclist-roi-ap-below-all-baselines` 主张不成立。卡按铁律 3 未动，降级/改写由你定。
25. **两张 note-artifact 卡 falsifier 已触发**：笔记残留（CenterNet 引用编号、SparseOcc 对话式残留）已随 fix P2 修复，`claim-centernetpoints-note-citation-artifacts` 与 `claim-sparseocc-note-conversational-residue` 的"已修复改写或删除"分支成立，卡内已加「笔记已修正」附注；status 处置（stale）只能由你手工定。
26. **RadarOcc 三条遗留**：① `claim-radarocc-dbd-compresses-doppler-to-8-descriptors` 的 falsifier 部分触发——DBD 消融增益 ≤0.7 且方向混杂（25.6m 四列 w/o DBD 反略高），是否降级由你定；② 笔记旧文"Focal Loss"与原文 §4.6 cross-entropy 不符（已加注未改）；③ 附录 Table 6：验证集 mIoU@12.8m 峰值在 Nr=450 而非选用的 250（SSS 增益对 Nr 敏感，已录入新卡与笔记）。新性能卡 `claim-radarocc-sss-ablation-gain-10p2`（SSS→percentile 掉 10.2 mIoU）已立，scope/falsifiers 齐全。
27. **零碎**：① FCOS 卡 title/scope 仍写"未注明出处"，可按新加的出处定位附注更新（留你）；② `library/Math_and_Notes/四元数.md` L189/L361 有同类句尾残留「10」「17」（fix-list 范围外，未动）；③ RadarOcc 笔记"恶劣天气优势"仅定性图无数值、"comparable to 16-beam LiDAR"系论文自评（mIoU@51.2m 实落后 5.6 点，已照录加注）。

## 2026-11-03 fire-0313（QA round3 + 量化 cross）

28. **PD-Quant 笔记三张表部分数字三版本均不存在（重要）**：cross 报告对照 v1/v3/CVF 三版本逐格复核——BRECQ 列、ResNet-50 行、Table 1 的 Min-Max/Cosine/W4A2 列、Table 2 的 +DC 行 53.33/53.14 与两个校准值在论文任何版本都找不到。三张 pdquant 卡（pd-metric-beats-mse-cosine / pd-loss-alone-overfits-calibration / beats-brecq-qdrop）数值主张受累。修正数字 cross 报告已给出（版本化），是否照修 + 是否立 note-mismatch 卡，待你确认（也排入了 QUEUE [fix|P2]）。
29. **QwT 笔记两处 + 一处出处未命中**：① ResNet-50 行是 arXiv v1 数字（v4 已改 62.3/68.5/72.5）；② Mask R-CNN 行把 Size 36.1MB 误读为 APbox（实际 42.6→43.1）；③ §5 "2.6%/存储 2-4%" 出处未命中。修法同 #28（cross 报告有正确数字）。
30. **BRECQ 建卡建议**：cross 报告发现 BRECQ 已入库但 0 张卡（量化主线唯一缺口）；如需要可在下班按 R2 补 2–3 张窄卡，是否要建由你定。

## 2026-11-03 fire-0421（verify 批：BEV-Planner + 出处三条）

31. **BEV-Planner 开源/分辨率（#1/#2 跟进，已结）**：本班独立复核两项均成立——① GitHub API（api.github.com/repos/NVlabs/BEV-Planner，2026-11-03）private=false、261 stars、创建 2023-12-05、根目录无 LICENSE 文件，README 标题与论文一致、含训练/评测指引；② arXiv PDF（arxiv.org/pdf/2312.03031）§4.1 原句 "The input resolution is 256×704, smaller than existing methods [13, 16]." 逐字命中。fire-0238 已写入笔记的头部与 §3.1 注记确认无误，本班仅追加「2026-11-03 复核」注记；5 张 bevplanner 卡 evidence 均不引用被改两行，无需同步。
32. **ShuffleNet 出处（#5 跟进，已结）**：CVF Open Access 确认 CVPR 2018 正式收录（"Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR), 2018"，pp. 6848-6856，bibtex Zhang_2018_CVPR）；camera-ready PDF §1 同句亦作 "This report"（非未出版信号），Table 1 "Image" 行各 g 列同为 3（非渲染错位）。`library/Efficient_Backbone/ShuffleNet.md` 头部出处注记、Locator、两条 TODO、抓取记录已更新。
33. **MobileNet V2/V3 摘要与 Table 3/9（#6 跟进，已结）**：arXiv v5 PDF + ICCV CVF camera-ready 摘要均为 3.2%/20%、6.6%、over 25%、34%——**ar5iv 渲染与官方 PDF 一致，abs 页元数据（15%/4.6%/5%/30%，2026-11-03 重抓 abs 页仍如此）系与 PDF 脱节的旧摘要，勿再引用**；V2 同理（PDF/camera-ready 作 "shortcut connections are between the thin bottleneck layers"，abs 页元数据为旧文）。V2 CVPR 2018（pp. 4510-4520）与 V3 ICCV 2019（pp. 1314-1324）均经 CVF 收录页确认。Table 3（219/67.4）vs 附录 Table 9（217/67.5、39.8）的出入在 arXiv v5 PDF 内部即存在，属论文自身不一致，笔记两表照抄维持，引用时注明出自哪张表。`library/Efficient_Backbone/MobileNet.md` 头部/版本警示/遗留问题 1-4/抓取记录已更新。pdquant 三卡中的 MobileNetV2 数字出自 PD-Quant 论文自身，与本次无关，未动。
34. **COTR 表号错位（#10/#17 跟进，已结，假设否定）**：arXiv PDF v2（含补充材料）与 CVF camera-ready（10 页正文）的表号与 arXiv HTML v2 **完全一致**（Table 3 = 语义分组消融、Table 4 = 逐类 IoU，Table 5–7 亦同）——PDF/HTML 不存在整体错位，`assets/COTR/Table4.png` 系截图文件名错位（画面无 caption，内容 = Table 3）。官方 PDF 亦印证正文 "41.05%"、"2.3%" 两处原文数字 PDF 内同样如此（照录无误）。`library/3D_Occupancy/COTR.md` Locator/§3.3 配图注/TODO/遗留观察 6 已更新；是否将 `Table4.png` 改名 Table3.png 由你定（本班未动素材文件名）。

## 2026-11-03 fire-0423（cross occupancy + 精读×2）

35. **NJU-SparseOcc 主卡 falsifier 触发（重要）**：精读实抓 v1–v5 全版本——笔记基线行 BEVFormer 32.2/2.3、FB-Occ 33.7/5.2 与全部版本不符（camera-ready Table 1 实为 32.4/3.0、33.5/10.3，32.2 疑混入 Fig.4 单场景面板）；该组数字在 Occ3D 论文/官方 README 均查不到（来源不明坐实）。RayIoU 34.0 仍高于两基线（方向不反转）但 FPS 倍数缩水（3.3×→1.68×、7.5×→5.77×）。修正方案已排 QUEUE [fix]；主卡 title 阈值 33.7→33.5、倍数措辞需你过目。
36. **SparseOcc 笔记「约 80% 体素为空」实为 67%**（SemanticKITTI GT 口径）；「SMAE」任务标签在 arXiv 唯一版本中未检得（出处请指认）；NJU 剪枝实现系 top-k=32000 非阈值、复杂度 big-O 系笔记形式化（原文无 complexity 字样）——引用 mgss/decoder-pruning 卡时勿把"笔记无消融"读成"论文无"（论文 Table 3 有）。
37. **OmniQuant 52.65 系六任务平均**（PIQA/ARC-e/ARC-c/BoolQ/HellaSwag/Winogrande），cross 报告曾写"5 数据集"系笔误；主卡精读评级 ★★★（Table 2/A2 双口径互证，笔记修正后零差异）。signoff 材料已齐：`nightshift/reports/omniquant-w4a4-deep-read.md`。

## 2026-11-03 fire-0510（NJU fix + R2 扩队 a/b/c）

38. **SparseOcc「80%」勘误（#36 部分撤回）**：fix 班实抓发现 v1 同时存在 80%（§3.1，LSS 特征体素口径，与笔记句逐字对应）与 67%（§1 脚注，SemanticKITTI 前 10 序列 GT 口径）——cross 报告 §3-M7「80% 未检得」系提取遗漏，笔记句保留并补双口径注记。引用时注意分清口径。
39. **NJU 笔记 L99/L100 遗留**：「低分辨率阶段抹除>90%」与「15帧」两处口径注仍未修（本轮授权仅 L93/L94）；Table 1 基线行产生方式（复训 or 重评测）论文无明文，建议向官方仓库提 issue 后回填主卡。

## 2026-11-03 fire-0547（R2-d/e + tool 脚本）

40. **check-materials 首跑结果**（`node tools/check-materials.mjs`）：53 素材目录/57 笔记/282 图，其中仅 118 图被笔记引用。①素材无笔记 ×3（CameraParams/KITTI/Misc——TODO 本就标注"不一定是论文，按需整理"）；②笔记无素材 ×11（数学×3/liger×3 天然无图、ADe2e×3 系素材位置特例 #16、LingoQA、PTQAT）；③未引用图 ×164（大量已截素材未嵌入正文）。是否清理/豁免"无图笔记"（影响 exit 码策略）由你定。
41. **Qwen3-VL 术语勘误**：论文 v2 §3.2.7 实际术语为 **Length-Adaptive Sampling**（任务书写作 "Length-adaptive Visual Resolution"，笔记无直接引文）——建卡以实抓 arXiv 引文为据并注明；引用该机制时用 v2 术语。

## 2026-11-03 fire-0619（R2 二轮 + 总账摘要）

42. **两处待人工核**：① AutoVLA Table S3 两行同名 DriveTraj 是否同一方法两次提交（建卡时已避开该两行）；② ShuffleNet Table 5 对照的 MobileNet 数字来源（原论文 vs 作者复现）表内未明示——对比卡已把归因风险写进 falsifier，引用前建议回原文脚注确认。

## 2026-11-04 夜班（主人指派：TODO 修复 + 图谱 v0.1 + 新论文）

43. **Web UI TODO 四项修复方式请验收**（tmp_docs/TODO.md）：① tag 混乱 → tag 面板加筛选框 + 按数量/名称排序 + 默认显示前 30 可展开（382 个 tag 全量常驻不再现实）；② 排序 → 队列与全部 Claim 各加排序下拉（id/标题/状态/到期日，localStorage 记忆；队列默认仍是 review_due 升序，与 ka.mjs review 一致）；③ claim 可视化 Markdown → 证据 quote/scope/falsifiers 改走 renderMarkdown（此前多行内容被压成一行）；④ 深色滑块 → 我把"滑块"理解为滚动条（tag 列表唯一的滑块状元素），已全局换成 8px 细滚动条、主题化颜色、`scrollbar-gutter` 防挤压——**如果你指的是别的控件请指出**。另 tag 机械变体已归一 17 卡（见 #47 报告），未动的近义 tag（如 snapshot 家族、zero-shot vs zero-shot-transfer）留你裁定。
44. **SliderQuant Table 12 疑与正文矛盾（引用前必对 PDF）**：CS/LoRA 消融表 HTML 有 4 行单元格缺失，按推断对齐得"Baseline 组合用 13.92/18.44 劣于仅 LoRA 12.73/14.45"，与正文 "using both CS and LoRA together consistently yields better results" 直接矛盾。另该论文还有 7 处数字/表号不一致，全部记录在 `library/Quantization/SliderQuant.md` 遗留与 TODO。
45. **Dr.Occ 两处口径缝隙**：① 自报 +7.43% mIoU 与表格舍入差（43.4−36.0=7.4）有 0.01 级缝隙，且 +3.09 IoU 只能对上 Table 2 消融行（Table 1 无总体 IoU 列）；② COTR 43.1 基线系作者重训（‡），非官方权重。未开源，复现成本高。
46. **GaussianFusion 三处原文不一致**：① §4.5 正文称初始化消融为 Table 9、表 caption 为 Table 8；② §4.4 称对 OccFusion +1.11 mIoU，表格差值 1.10；③ Waymo Table 6 未注明 val/test split。另注意同名论文 arXiv:2506.00034 与本文无关（笔记头部有区分注记）。
47. **图谱 v0.1 范围确认**：已上线 `#/graph`（论文归属图 + 关联网络双模式，canvas 力导向，点 claim 跳详情、点笔记节点可聚焦其 claim）。未做：tag 节点、按 tag/搜索结果过滤后重渲染（现在状态/搜索/tag 筛选已联动）、verified 签署引导、移动端。二期方向按设计文档 §10 备忘，等你排优先级。

## 2026-11-05 凌晨班（02 任务书样板整理）

48. **QLoRA 论文构造描述与官方实现不等价（判"论文算错"还是"简化描述"需读 PDF）**：① 论文 §3 散文/Eq.4 描述的构造（2^k+1 分位数、格点 p=i/(2^k+1)、相邻均值 q_i=½(Q(i/(2^k+1))+Q((i+1)/(2^k+1)))）按字面复算**不产生** Appendix E 的 16 码点（首位正值 0.108 vs 0.0796），且网格端点 p=0/1 处构造退化（±∞）；② 官方 bitsandbytes 实现（main 分支 2026-11-05 实抓）实际用 offset=0.9677083 的两条等距概率格直接取 ppf 值再归一化，复算命中 16 值（max|err|≈1.1e-7），硬编码表与 Appendix E 逐字节一致；③ 符号读法已实锤（HTML alttext）：散文 "2k+1" 实为 2^k+1、"2k−1/2k−1+1" 实为 2^{k−1}/2^{k−1}+1。待你/后续核查：读 arXiv v1 PDF 的 Eq.4 排版确认构造意图，裁定"论文描述有误/只是简化、offset 是实现细节"，然后决定 claim-qlora-nf4 卡"假设与推导"节的表述是否再收紧。另 bnb 代码 af4 分支注释引 arXiv:2306.06965（"NF4 Isn't Information Theoretically Optimal"）——最优性争议线索已登记卡内，未读原文。
49. **BRECQ 会议出处仅 GitHub 自述**：ICLR 2021 的唯一依据是官方仓库自述；arXiv abs 页无 Comments 会议标注，OpenReview 未核对（2026-11-05 B2a 批实抓确认）。笔记头部 caveat 在案；建议补抓 OpenReview 或主人裁定。
50. **PTQAT 出处出入**：笔记与卡写 "ICCV 2025"，但 arXiv:2508.10557 abs 页 Comments 为 "8 pages, Accepted by ICCVW 2025"（Workshop，2026-11-05 实抓）。需核 CVF/OpenReview 归属；paper 字段冻结未改。
51. **MQBench paper 字段刷新授权**：4 张卡 paper 字段含"笔记未记录完整论文标题"，但笔记头部已于 2026-11-03 回填完整标题（arXiv:2111.03759）。是否允许后续班次刷新 paper 字段请主人裁定（不影响卡主张）。
52. **QD-BEV 笔记两处缺口**：① §3.1 Table 1 表头 ar5iv 渲染为 "Quantized Module" 无位宽标注（两次实抓确认），W4A6 归属需对 PDF 原表核实；② 笔记 Table 1 未转录四模块同时量化行（ar5iv：NDS 0.246/0.369/0.224、mAP 0.145/0.228/0.075）。卡内已标"待核/笔记未转录"。
53. **PD-Quant Table 1 数据集与校准张数未确认**：笔记 11-03 重建已给验证集 top-1 口径（caption 原文），但 Table 1 的数据集与校准张数论文 caption 未直接写明（Table 2 的 ImageNet/1024 张不能默认套用）。pdquant-pd-metric 卡 scope 已如实标缺口；完成需读论文 §4.1 实验设置原文（B2b 批未抓，避免超范围）。
54. **EchoFusion 笔记 §3.2/3.3 修正请求**：笔记与论文 Table 6/S4 逐格不一致（B1 批 2026-11-05 复抓 v2 HTML 交叉核对），至今未修正；所依据论文版本未查明。library 本班只读——请授权或指示修正方向。
55. **四张 falsifier 已触发卡存废**：centernetpoints-note-citation-artifacts / sparseocc-note-conversational-residue / emc2-note-table-mismatch / omniquant-note-table-mismatch——对应笔记修复均已执行、falsifier 触发条件已满足；改写/删除/转 stale 请逐卡处置（B1 已做历史分层，status 未动）。
56. **OmniQuant 实验 1 口径备选**：11-03 修正采用「统一 7B g128 + 补 RTN 1.9e3」方案；「换用 13B 逐通道列原值（6.8e4/5.5e3/13.21）」备选未采用——是否并列呈现待裁定。
57. **笔记小问题**：① HGSFusion 笔记 paper 字段缺英文原题与 arXiv 号（卡已注明）；② EMC2 旧 LoGoNet 82.92 疑源自笔记相邻 VFF 行（整理者线索，未验证，可选注记）。
58. **Alpamayo-R1 TABLE 9/10 二次实抓待办**：2026-11-05 B3b 重抓 arXiv 2511.00088v2 时工具在 §6.2 截断未达 TABLE 9/10；alpamayo-r1-coc 与 alpamayo-r1-rl 两卡的外部线性化行 quote 现依据=入库时逐格脚本核验+班内 Grep 对笔记命中。建议补抓一次并把结果记入两卡核查记录。
59. **Alpamayo-R1 0.5B 底座型号**：笔记仅记 "uses a smaller backbone"，全文未见 0.5B 具体底座（抓取截断在 §6.2）；卡 scope 已改"未载"。待后续完整抓取补核，不凭记忆回填。
60. **AutoVLA Table S3 DriveTraj 两行（#42 补充证据）**：B3b 实抓确认两行（7.4957/7.2787）存在且均低于 AutoVLA——即便两行合并也不改「Overall 第 5 / Spotlight 第一」结论。是否向作者/榜方求证由主人定。
65. **LLaVA arXiv 两界面摘要文本分歧**：abs 页元数据摘要含 "In this paper, " 前缀、论文 HTML v2 摘要不含（2026-11-05 两次独立实抓互斥确认）。笔记 quote 与 HTML v2 一致、本身无错；但今后按 abs 页核对会误报不匹配。建议 LLaVA 笔记头部核验块加注记——library 本班只读，需授权。
66. **DrivePI 表 1 基线输入模态构成未载**：FB-Occ/F-Occ/CascadeFlow/ALOcc-Flow-3D 等是否用 LiDAR 笔记未逐行记载；卡内已标「整理者推断、尚未验证」并列入 falsifier 核查对象，完成需逐篇查各基线原文。
67. **Ali-BEVFusion 骨干名出入（需二次实抓）**：笔记与 2 卡 quote 作 CB-Swin-Tiny；2026-11-05 单次实抓 ar5iv 2205.13790 三处作 "Dual-Swin-Tiny [liang2021cbnetv2]"，全文未检得 "CB-Swin-Tiny"。按规则未检得需班内二次实抓复核才能改——待二次实抓（ar5iv+PDF、v1/v2 版本史）后修笔记并按铁律 3 同步卡内引用。
68. **Ali 正文-附录融合轮数张力**：正文 §4.1 "another 9 epochs" vs 附录 B.1（PointPillars 12 epochs；CenterPoint/TransFusion 6 epochs 且冻结 LiDAR 流）。two-stage 卡已注张力；需二次实抓 + 官方仓库 configs 对照后才能并列两口径。
69. **BEVDet Table 5 消融配置未明示**：原文仅 "We adopt BEVDet-Tiny in Tab. 1"，无增强配置表述；bevdet-scale-nms 卡"与 Table 4 D 行同配置"已标整理者推断。需查官方仓库 NMS 消融 configs。
70. **library 建议（B4a，未动）**：① Ali-BEVFusion.md 可补摘要级鲁棒性结果一行（模拟 LiDAR 故障 +15.7%–28.9% mAP，abs 页 2026-11-05 实抓）+ 骨干名订正（见 #67）；② 4 张 Ali 卡 paper 字段"论文全名笔记未载"已过时（笔记头部 11-03 已回填），待解冻处理。
71. **RCBEVDet 系卡内 drafts 路径统一**：卡 5/7/8 内「待人工核对」引用的 nightshift/drafts/RCBEVDetPP.md 旧路径仍有效，且 library/Multimodal_Fusion/RCBEVDetPP.md 入库版已可对照（B4b 抽查 §3.5/§3.7 一致）——是否统一改指 library 版待裁定（表达统一，不影响证据）。
72. **HGSFusion 笔记 §4.4 未标数据集**：实为 TJ4DRadSet test set（B4c 对 arXiv:2412.11489v1 Table 5 caption 逐字核实，dark 卡已修正）；笔记需按 §4.1 既有注记格式补注——需授权。
73. **HGSFusion Table 7 数据集 caption 未标**（附录表）：推定 VoD（上下文推测），需查 AAAI camera-ready 或官方代码。
74. **HGSFusion 光照子集划分标准（亮度阈值）与 3D mAP 类别覆盖**：原文未查得，dark 卡已标待核。
75. **EchoFusion PAA 剩余面**：arXiv v2 正文+附录 12 张表已枚举无 PAA 专项消融；NeurIPS OpenReview 补充材料与官方仓库未查（paa 卡待验证第 1 条部分完成）。
76. **EchoFusion Table 6「±」统计口径**：论文只说 "mean and variance"，未定义具体形式；rt-vs-ra/rp 卡已注明。
77. **RadarOcc Table 1 跨框架对比是否另立独立性能卡**：涉及新建卡授权，B4c 未擅自增卡（cfar 卡已留待决标记）。
78. **nightshift/cross/4d-radar.md M5/§6.4 过时**：仍称"RadarOcc 笔记无实验章节"，但笔记 §3 已于 11-03 授权补写——建议加时点注记或更新。
79. **GaussianFusion 笔记 PDF/ar5iv 交叉核对待做**：笔记为 HTML v1 单源抓取；B4c 已重抓 HTML 复核全命中，PDF 交叉核对低成本待并入后续班次。
80. **NJU-SparseOcc 笔记 §2.1 剪枝条与原文实现不符（需授权修笔记+铁律3同步）**：笔记写"硬过滤仅保留 s>τ 的 Token"；arXiv v5 实抓（2026-11-05）原文为 "In our implementation, we simply keep voxels with top-k occupancy scores"（k=32000 最优，Fig.8(a)），阈值法仅是并列可替换方案（Fig.8(b)）；且原文顺序为"每层先 2×/轴上采样、再估分剪枝"。两张卡已加历史注记，笔记修正后可升级「笔记已修正」附注。
81. **NJU-SparseOcc 笔记 §3「底层逻辑支撑」系笔记综合**："解码器低分辨率阶段物理抹除 >90% 背景节点"与"O(L^3)→O(N_active)"原文均无对应句（原文仅 §1 数据集统计句 + Fig.7 "discards over 90%" 定性句）。建议笔记标注为整理者综合。
82. **NJU-SparseOcc 笔记 §2.2 MGSS 细化 + 消融未录**："96 个点"与"按掩码概率密度加权"为笔记添加（原文仅 randomly select within mask）；论文 Table 3 MT/交叉注意力消融四行（dense CA 28.7/16.2 vs +Mask-guided 29.2/24.0）笔记未录，建议补录。
83. **R4Det arXiv 号可回填（需授权）**：B4d 实抓确认 arXiv 2603.11566（v2，Table 1/4 与 CVF 一致；公式编号不同、页数差异，版本关系未深查）；代码仍无链接（"未开源"对代码成立）。建议笔记头部与 paper 字段刷新留后续班次。（勘误：本班派发背景曾称 PDF=Probability of Driving Freespace，经 B4d 对照 CVF 原文核实系错误背景——原文作 Panoramic Depth Fusion，卡/笔记现有表述正确。）
84. **R4Det §4.4 疑似笔误**：正文 "As shown in Table 1" 所指实为 Table 4（Table 1 首行是 PointPillars）；卡内已标整理者观察，是否向作者求证由主人定。
85. **R4Det 笔记两处注记建议（未动）**：① §3.2 帧距条目出自补充材料 Table 9（非主文）；② §3.1「正交叠加」句系笔记作者解读（原文明言 "chained ablation study"，全文无 orthogonal）。
86. **library/Classical_Detection/R4Det.pdf 非论文原文**：系笔记自身 Typora 导出 PDF（3 页含笔记头部），放论文旁易误当原文——处置（改名/移位/保留）待主人。
87. **R4Det/SGDet3D 两源数字差**：R4Det Table 2 中 SGDet3D 行 59.75/77.42 vs SGDet3D 笔记自报 59.49/77.11（差 0.26/0.31）——根因需核 SGDet3D 原文 split/IoU 口径，超本班范围（卡内已作比较警示）。
88. **ShuffleNet 笔记 §3.1 末句「所有模型设置完全一致（§4）」指代不明**：B6 核对（Table 5 MobileNet 行=V1 自报值 + Table 7 reported≠reimplemented）指向指"评测协议"而非"训练设置"；需实抓原文 §4 定措辞后修笔记。
89. **shufflenet-group 卡原子性裁量**：「g 权衡」与「每 4× 理论→2.6× 实测」证据不同源（Table 2 vs Table 8）可拆；B6 判断保留合一（2.6× 是"g=3 折中"的机制桥）。如裁定拆卡，证据已齐（§4.5 引句在案）。
90. **24 条 ar5iv 引句未班内重抓**（11-03 抓取日期在案、与笔记互证一致）：如需再验由后续班次安排。
91. **VQ-Map 笔记三处建议（需授权）**：① §4.2「73.4 IoU」应补「Argoverse 仅评 Drivable 单类」限定（论文 §4 原句 + Table 2 列结构实证，vqmap-argoverse 卡已按此修正）；② §4.1 表只抄 6 类中 4 类、9 行对比方法中 3 行，且 camera-only 原注与阈值口径未录；③ §4.4 宜加「Table 5 时间列为训练 GPU hours」注。
92. **EMC2 参照卡 2 条 arXiv evidence 无抓取日期**：locator 未带日期不合新规范；大概率 2026-11-03（卡内修订注记所述核对轮），留主人/后续班次定。
93. **CornerNet 4.1 FPS 同机与否不可判**：OAP Table 2 caption 用斜体标示"转引自原论文"的 FPS，pdftotext 丢失斜体信息（centernetpoints-fps 卡 scope/falsifier 已留残留子项）；闭合需目检 PDF。
94. **代码侧核查未做（4 卡 falsifier 保留）**：CenterNet 全仓库 NMS 存在性排查（只核了 decode.py）；CenterNet 三输出头无 embedding 仓库核对；princeton-vl/CornerNet pooling/AE 实现；tianzhi0549/FCOS 默认配置是否开中心采样。
95. **经典检测笔记四处建议（需授权）**：① Objects as Points §潜在局限性 20.0% 转述为"漏检率"，原文口径是 Faster-RCNN 15 anchors @0.5 IoU 的 anchor 放置不足漏检率；② FCOS §预测头 仍把 Center-ness 列在分类塔输出下（v5 已改，消歧只在图注补注）；③ Keypoint Triplets §消融未载 CCP-only 行（38.3）与 MS-COCO validation 口径；④ CornerNet.md 未载任何实验数字（含 Table 1 消融 36.5→38.4）。

## #98（班 B qwt-r2-gate-nonregression，2026-11-08 01:5x，BLOCKED 待主人）
Kaggle 账号未接受 ImageNet 比赛规则（imagenet-object-localization-challenge），kernel push 挂数据源被 API 拒绝，班 B 今晚无法开跑。预检①探测手段错误已勘误（competitions files 端点不验证规则接受状态）。**主人动作**：浏览器接受 https://www.kaggle.com/c/imagenet-object-localization-challenge/rules 后，任何值班火次或手动 `kaggle kernels push -p experiments/qwt-r2-gate-nonregression` 即复活（notebook/metadata 已就绪，BLOCKED.md 有完整恢复指令）。备选 sautkin 镜像（分片哈希名、标签未验证）已评估并否决——不为赶进度引入未验证数据源。

## #100（班B qwt-r2-gate，fire-0620 06:2x，BLOCKED 待主人裁定）
v5 败于 QwT vendor `utils.utils.create_loader` 缺位置参数 `re_prob`（TypeError，cell 2 L71；eval loader 拟补 `re_prob=0.0`——eval 不做 random erasing，方法层含义待主人确认是否照补）。**已实测全通**：timm 兼容 shim 四件套、repo clone（pinned 8a927da）、CLS-LOC 探测、val XML 排序 50,000、train 1,281,167 载入——v6 只差一个 kwarg 即达 Phase 1 锚点复现（DeiT-T 58.2→61.4）。修复预算按任务书 ≤2 次已用尽（v3 val 路径；v4/v5 vendor shim 记一次），班次按 STATE 承诺停手。**主人三选一**：①授权 v6（预计一次直达 Phase 1）；②亲自修改；③维持 BLOCKED。若授权，任何火次/手动：改 notebook 一行 → `kaggle kernels push -p experiments/qwt-r2-gate-nonregression`。
