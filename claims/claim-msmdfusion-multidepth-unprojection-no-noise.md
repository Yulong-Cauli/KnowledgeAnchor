---
id: claim-msmdfusion-multidepth-unprojection-no-noise
title: "MSMDFusion 论文声称：MDU 每种子多深度 K=1→6 提升真实点召回而不显著增加深度误差，K=10 才引入噪声（Table 6 mAP 65.86→66.93→66.61）"
type: claim
status: asserted
scope: "nuScenes 训练集随机 1/4 子集（§4.3 消融口径，Following UVTR）；MSMDFusion arXiv v3（arXiv:2209.03102，html/2209.03102v3）；TransFusion-L 基线 + 多尺度融合；K=每 seed 检索的 K 近邻参考点深度数，N 固定 50 seeds/实例；recall 与 mean distance error 来自 §4.3.3 量化实验（将保留参考点当 seeds、从其余参考点取真值深度生成虚拟点，邻域=最小体素对角线 0.23m，Fig 6）；mAP/NDS 为检测指标（Table 6，nuScenes val）；论文自报数字"
tags: [lidar-camera-fusion, 3d-detection, virtual-points, depth-estimation, ablation, nuscenes, msmdfusion]
note: library/Multimodal_Fusion/MSMDFusion.md#37-mdu-讨论多深度会不会引入噪声
paper: "CVPR 2023, MSMDFusion: Fusing LiDAR and Camera at Multiple Scales with Multi-Depth Seeds for 3D Object Detection (arXiv:2209.03102)"
stance: watch
evidence:
  - source: library/Multimodal_Fusion/MSMDFusion.md
    locator: "§3.7（§4.3.3 Fig 6 结论原句）"
    quote: "As shown in Fig.6, when the number of K increases from 1 to 6, the recall rate of real points improves dramatically, meanwhile, the mean distance error does not increase significantly. But a too large value of K (e.g., 10) can inevitably introduce noise."
    relation: supports
  - source: library/Multimodal_Fusion/MSMDFusion.md
    locator: "§3.7 / Table 6（K=1 行，基线单深度）"
    quote: "| 1 | 50 | 2.6K | 65.86 | 68.24 |"
    relation: supports
  - source: library/Multimodal_Fusion/MSMDFusion.md
    locator: "§3.7 / Table 6（K=6 行，最优）"
    quote: "| 6 | 50 | 16.0K | 66.93 | 68.93 |"
    relation: supports
  - source: library/Multimodal_Fusion/MSMDFusion.md
    locator: "§3.7 / Table 6（K=10 行，回落）"
    quote: "| 10 | 50 | 26.6K | 66.61 | 68.85 |"
    relation: supports
  - source: library/Multimodal_Fusion/MSMDFusion.md
    locator: "§3.7（§4.3.3 K=10 下降归因原句）"
    quote: "However, when K increases to 10, the model’s performance drops because the extra noise diminishes the benefits of correctly generated virtual points."
    relation: supports
falsifiers:
  - "复现 §4.3.3 量化实验：K=1→6 期间 mean distance error 相对增幅 >10%，或真实点 recall 提升不足 10 个百分点——'召回大升而误差不显著升'不成立（两阈值系本卡预设的复现判定线，无原文/基线锚点，待定）"
  - "复现 Table 6：K=6 的 mAP/NDS 不高于 K=1（65.86/68.24），或 K=10 稳定不低于 K=6（噪声回落结论不成立）"
  - "固定算力（NVPF 对齐 16K）把 K=1 的 seeds 加到与 K=6 同虚拟点量级仍不敌 K=6——增益来自点数而非多深度"
review_due: 2026-12-03
related: [claim-msmdfusion-nuscenes-test-sota-single-model, claim-msmdfusion-multiscale-fusion-gain]
signoff: null
---

## 主张

论文声称：虚拟点范式里“每个 seed 取多个深度”（MDU，K 近邻参考点深度 + 深度感知语义调制）是“提质不引噪”的——K=1→6 时真实点召回大幅上升而平均距离误差不显著上升；K 过大（10）才引入噪声，检测 mAP 从 K=6 的 66.93 回落到 66.61（NDS 68.93→68.85）（Table 6，1/4 训练子集消融，arXiv v3）。论文据此声称 MDU 的深度质量比虚拟点数量更关键。

配套对照（Table 6 其余行，同一卡内佐证）：K=3/N=50（8.0K 虚拟点）66.49/68.88 优于 K=1/N=200（10.6K 虚拟点）65.59/68.00——多深度优于多种子；K=1→6 的 NVPF 2.6K→16.0K。另有 K=10/N=50 26.6K 66.61/68.85。

口径与边界：
1. Fig 6 的逐 K recall/mean error 数值（recall 49.93/66.27/75.96/90.14/94.26，mean error 2.46/2.53/2.52/2.45/2.74）系笔记入库时目视抄录、无原文数值表可对版——本卡核心数字不依赖它们，只引用 Fig 6 的定性结论原句与 Table 6 行内数字；引用图内数值时以图为凭。
2. 消融在 nuScenes 1/4 训练子集（§4.3 口径）上做，非全量训练；Table 1 的 71.5/74.0（姊妹卡）不可与本卡 66.93/68.93 直接比较（数据规模不同）。
3. 同值锚点（防误读）：本卡 Table 6 的 K=6 行（66.93/68.93）与多尺度卡（claim-msmdfusion-multiscale-fusion-gain）Table 5 的 #8 行是同一完整配置（全尺度交互 + K=6）的同一结果——本卡"K=1→6 的增益（+1.07 mAP）"与该卡"多尺度相对最佳单尺度的增益（+1.42 mAP）"是同一配置对两个不同对照（K=1 单深度行 / #2 仅 C2 行）的两个分解，不可相加成"总增益"，也不能互证。

## 待验证

- 按 §4.3.3 设置复现 recall/mean error 曲线（固定参考点划分与 0.23m 邻域口径，只变 K）：mean error 相对增幅 >10% 或 recall 提升不足 10 个百分点，按 falsifier 1 记“提质不引噪”不成立（两阈值为本卡预设、待定）。
- 复现 Table 6 的 K∈{1,6,10} 三行（1/4 子集，同 seed）：K=6 不高于 K=1（65.86/68.24），或 K=10 稳定不低于 K=6，按 falsifier 2 处理。

## 成立/不成立的含义

成立（目前只是论文声称）：LiDAR-相机融合的虚拟点生成应把预算花在“每 seed 多深度”而非“多种子”上；为 MVP/BEVFusion 系的 seeds 策略调参给出明确方向。
不成立：多深度的召回收益伴随误差增长（或检测增益来自点数），“深度质量>数量”的叙事被削弱，MDU 相对 MVP 的改进需重新归因于深度感知语义调制部分。

## 核查记录

- 2026-11-05（02 任务书整理班 P1-B4a）：本卡 5 条 evidence quote 逐字 Grep 验证命中笔记现状文本；falsifier 1 的 >10%/10pp 阈值补"预设待定"标注（sample-notes §1：无锚点阈值标待定）；related 补 claim-msmdfusion-multiscale-fusion-gain（与该卡 related 已含本卡，此前单向，现双向）；正文补同值锚点防误读注（K=6 行 = Table 5 #8 行，两卡增益不可相加）。表达整理，数字未改写。
