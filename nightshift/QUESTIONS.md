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
