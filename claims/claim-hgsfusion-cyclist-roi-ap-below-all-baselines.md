---
id: claim-hgsfusion-cyclist-roi-ap-below-all-baselines
title: "HGSFusion 自报：VoD 上 Car/Pedestrian (RoI) 为同表最高（88.28 / 87.49），但 Cyclist (RoI) 79.46 低于同表全部四个对比方法（含纯雷达基线）"
type: claim
status: asserted
scope: "VoD 数据集（笔记未记录验证集划分与评测协议）；4D 毫米波雷达-相机 3D 目标检测；指标为 RoI AP，笔记未定义 RoI 口径（cross 文档 M1）；HGSFusion 自报数字（AAAI 2025），据库内笔记 §4.1 转录，尚未独立验证；对比行为笔记转录，其中 LXL 行 Pedestrian (RoI) 与 mAP (RoI) 同为 72.93、疑有转录错位（cross 文档 §6.3），本卡将其与另三行一并只用于「Cyclist 低于全部对比方法」的同表排序"
tags: [4d-radar, radar-camera-fusion, hgsfusion, vod, roi-ap, cyclist, failure-mode]
note: library/Multimodal_Fusion/HGSFusion.md#41-vod-数据集-sota-对比-table-1
paper: "AAAI 2025 · HGSFusion（带混合生成与同步的雷达-相机融合 3D 目标检测；笔记未记录英文原题与 arXiv 号；开源：https://github.com/garfield-cpp/HGSFusion）"
stance: watch
evidence:
  - source: library/Multimodal_Fusion/HGSFusion.md
    locator: "§4.1 / Table 1"
    quote: "| **HGSFusion (Ours)** | **R+C**  | **88.28**     | **87.49**            | **79.46**         | **62.61**"
    relation: supports
  - source: library/Multimodal_Fusion/HGSFusion.md
    locator: "§4.1 / Table 1"
    quote: "| PointPillars         | R        | 70.15         | 67.48                | 85.07             | 47.22"
    relation: supports
  - source: library/Multimodal_Fusion/HGSFusion.md
    locator: "§4.1 / Table 1"
    quote: "| RadarPillarNet       | R        | 71.65         | 65.86                | 86.19             | 43.10"
    relation: supports
  - source: library/Multimodal_Fusion/HGSFusion.md
    locator: "§4.1 / Table 1"
    quote: "| BEVFusion            | R+C      | 70.21         | 68.52                | 89.48             | 45.86"
    relation: supports
  - source: library/Multimodal_Fusion/HGSFusion.md
    locator: "§4.1 / Table 1"
    quote: "| LXL                  | R+C      | 72.18         | 72.93                | 88.31             | 72.93"
    relation: supports
  - source: library/Multimodal_Fusion/HGSFusion.md
    locator: "§4.1 / Table 1 分析"
    quote: "但在骑行者（Cyclist）类别出现下滑，原因是 VoD 中存在大量与骑行者外观极度相似的“自行车架”和“未使用自行车”，导致 RHGM 生成了干扰特征。"
    relation: supports
falsifiers:
  - "同一 VoD 评测协议复现：HGSFusion Cyclist (RoI) ≥ 同表某对比方法，或 Car/Pedestrian 不再为同表最高"
  - "回论文原文核对 Table 1：对比行数字与笔记转录不符（重点：LXL 行 72.93 重复、纯雷达两行），同表排序格局改变"
  - "发现 Table 1 各行 RoI AP 口径不一致（不同 IoU 阈值 / 难度档 / EAA vs DC 定义），同表横向排序本身不成立"
review_due: 2026-12-02
related: [claim-hgsfusion-rhgm-dsm-superadditive-roi-gain, claim-radarocc-sss-rangewise-preserves-lowrcs]
signoff: null
---

## 我的理解

论文声称（据笔记 §4.1 转录，尚未独立验证）：VoD 的 SOTA 对比表中，HGSFusion 的 Car (RoI) 88.28 与 Pedestrian (RoI) 87.49 为同表最高，但 Cyclist (RoI) 79.46 低于同表其余全部四个方法——不只低于雷达-相机的 BEVFusion（89.48）与 LXL（88.31），也低于纯雷达的 PointPillars（85.07）与 RadarPillarNet（86.19）。笔记把下滑归因于 VoD 中与骑行者外观极相似的自行车架/未使用自行车污染了 RHGM 生成的点（这是论文的解读，笔记未给出针对该归因的单独消融）。该失效模式与 RadarOcc「低 RCS 弱目标需在输入端特别保护」的教训同向（cross 文档 S4）：生成/增密路线在易混弱目标上有自己的暴露面。

引用口径警告（引用本表任何数字前必读）：
1. 笔记 §1 概述头条「在 VoD 数据集上 RoI AP 达到 88.28%」按 Table 1 是 **Car 类 RoI AP**，全类 mAP (RoI) 为 62.61。**不得把 88.28 当 mAP 引用**，必须注明类别与指标（cross 文档 M3）。
2. 同表 LXL 行 Pedestrian (RoI) 与 mAP (RoI) 同为 72.93；若照录，LXL mAP (RoI) 72.93 会高于 HGSFusion 的 62.61、与表题「SOTA 对比」相悖，佐证该行疑有转录错位（cross 文档 §6.3 遗留问题 3）。
3. 消融表（Table 3/4/7）全量模型的「RoI AP 79.46」与本表 Cyclist 79.46 数值巧合相同，两者口径关系笔记未说明，跨表引用需谨慎。

## 待验证

- 回 HGSFusion 原文核对 Table 1 全部五行数字（重点：LXL 行 72.93 重复是否转录错位；RoI AP / mAP (RoI) 的精确定义与协议）。
- 用开源实现（https://github.com/garfield-cpp/HGSFusion）在 VoD 上复测分类别 RoI AP：Cyclist 是否确实低于纯雷达 PointPillars。
- 检验归因：限制 RHGM 生成点不落入自行车架相似掩码（或直接去掉生成点），看 Cyclist 是否回升。

## 若成立 / 不成立意味着什么

成立：图像语义引导的「生成补点」路线在易混弱目标（骑行者）上有系统性失效风险，选型或自研时必须看分类别指标而非只看聚合 mAP；与 RadarOcc 的输入端保护构成互补的两道防线。
不成立：Cyclist 下滑是笔记转录或评测协议的伪象，生成补点路线无此类失效模式，HGSFusion 在 VoD 的横向对比地位需按原文重估。
