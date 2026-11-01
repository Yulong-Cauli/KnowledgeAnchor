---
id: claim-hgsfusion-2d-spatial-mode-beats-3d
title: "HGSFusion 自报：其管线内空间模式预测用 2D（BEV）优于 3D（显式监督下 RoI AP 79.46 vs 75.58，EAA AP 58.96 vs 56.41）；笔记归因于 4D 雷达高度角分辨率不足，与 RadarOcc 立场相反，仅作记录不立卡"
type: claim
status: asserted
scope: "VoD（笔记 §4.5 未单独标注数据集，按 §4 上下文推定，需回原文核对）；HGSFusion 管线内 DSM 空间模式预测（S_R）模块的消融（论文 Table 7，据库内笔记转录）；2D/3D 指该模块输出占据图的形式（BEV 平面 vs 含高度）；指标 EAA AP / RoI AP，笔记未定义口径（cross 文档 M1）；只主张本管线内的消融排序，不主张「4D 雷达俯仰维普遍无用」；自报数字，尚未独立验证"
tags: [4d-radar, radar-camera-fusion, hgsfusion, vod, ablation, bev, elevation, radarocc]
note: library/Multimodal_Fusion/HGSFusion.md#45-空间模式类型与监督消融-table-7
paper: "AAAI 2025 · HGSFusion（带混合生成与同步的雷达-相机融合 3D 目标检测；笔记未记录英文原题与 arXiv 号；开源：https://github.com/garfield-cpp/HGSFusion）"
stance: watch
evidence:
  - source: library/Multimodal_Fusion/HGSFusion.md
    locator: "§4.5 / Table 7 分析"
    quote: "**分析**：2D 空间模式表现优于 3D。这是因为 4D 雷达高度角分辨率不足，3D 占据预测会引入噪声高度信息，而 2D 占据在 BEV 平面上更为精准。同时，显式监督比无监督提升了 0.69% 的 RoI AP。"
    relation: supports
  - source: library/Multimodal_Fusion/HGSFusion.md
    locator: "§4.5 / Table 7"
    quote: "| 3D           | √            | 56.41      | 75.58"
    relation: supports
  - source: library/Multimodal_Fusion/HGSFusion.md
    locator: "§4.5 / Table 7"
    quote: "| **2D**       | **√**        | **58.96**  | **79.46**"
    relation: supports
falsifiers:
  - "同一管线复现：3D 空间模式（带显式监督）RoI AP ≥ 2D 模式，或 +3.88 的差距在不同随机种子 / 训练配置下不成立"
  - "回论文原文核对 Table 7：数字或 2D/3D 行标签与笔记转录不符"
  - "发现 2D 行与 3D 行存在其他未标注配置差异（通道数 / 监督源 / 监督标签形式不同），排序不可归因于 2D vs 3D 本身"
review_due: 2026-12-02
related: [claim-radarocc-s2c-deformable-avoids-interp-degradation, claim-hgsfusion-rhgm-dsm-superadditive-roi-gain]
signoff: null
---

## 我的理解

论文声称（据笔记 §4.5 转录，尚未独立验证）：在 HGSFusion 自己的消融中，2D（BEV）空间模式预测优于 3D——带显式监督时 RoI AP 79.46 vs 75.58（+3.88），EAA AP 58.96 vs 56.41（+2.55）；无监督侧同向（2D 78.77 vs 3D 74.70）。同表显式监督在 2D 下 +0.69 RoI AP（79.46 vs 78.77），与 R4Det / SGDet3D 的「中间几何量显式监督有增益」同向（cross 文档 S5）。

口径张力（引用本卡时必须带上）：笔记把 2D 优势归因于「4D 雷达高度角分辨率不足，3D 占据预测会引入噪声高度信息」，这与 RadarOcc 的立场相反——RadarOcc 整条 pipeline 建立在 4D 雷达张量的俯仰维（球坐标 r/a/e）之上，并称其特征图「保持了雷达原始的分辨率优势」（cross 文档 C1）。两者任务不同（纯雷达 4DRT 占据预测 vs 融合检测管线内的空间模式预测），笔记层面无法仲裁。因此本卡只立「HGSFusion 管线内 2D > 3D 的消融排序」这条窄主张；「4D 雷达俯仰维信息价值低」**不立卡**——它需要同一硬件/数据集上的对照实验才能裁决（cross 文档 §6 遗留问题 6.5 方向）。库内 claim-radarocc-s2c-deformable-avoids-interp-degradation 卡正文已同步记录此张力。

另外：Table 7 的 2D 监督行（58.96 / 79.46）与 Table 3 全量行数值相同，即该消融的最优配置就是全量模型；「RoI AP」口径未定义，与 Table 1 各列关系不明（见 [Cyclist 卡](claim-hgsfusion-cyclist-roi-ap-below-all-baselines.md) 口径警告 3）。

## 待验证

- 回 HGSFusion 原文核对 Table 7 数字与「2D/3D 空间模式」的精确定义（输出维度、监督标签如何从 3D 框生成）。
- 复现：同管线把 S_R 从 BEV 占据换成含高度的 3D 占据（其余不变），多种子检验排序。
- 跨任务对照：在 RadarOcc 式 4DRT 占据任务上比较「压平俯仰维 vs 保留俯仰维」，检验俯仰维价值是否任务相关——这是裁决 C1 张力的唯一途径。

## 若成立 / 不成立意味着什么

成立：检测管线里用雷达做 BEV 占据先验比带高度的 3D 占据更稳，俯仰维的用法要按任务区分；为「4D 雷达俯仰维在检测 vs 占据任务中的边际价值」这一开放问题提供一个可复现数据点。
不成立：2D 优势是本消融配置或转录的伪象，3D 空间模式在同管线内不劣，RadarOcc 与 HGSFusion 的张力继续悬置，检测侧应重新评估带高度的空间先验。
