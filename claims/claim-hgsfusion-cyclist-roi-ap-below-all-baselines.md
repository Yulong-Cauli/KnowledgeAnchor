---
id: claim-hgsfusion-cyclist-roi-ap-below-all-baselines
title: "HGSFusion 自报：VoD 上 Car/Pedestrian (RoI) 为同表最高（88.28 / 87.49），但 Cyclist (RoI) 79.46 低于同表全部四个对比方法（含纯雷达基线）"
type: claim
status: asserted
scope: "VoD 数据集（笔记未记录验证集划分与评测协议）；4D 毫米波雷达-相机 3D 目标检测；指标为 RoI AP，笔记未定义 RoI 口径（cross 文档 M1）；HGSFusion 自报数字（AAAI 2025），据库内笔记 §4.1 转录；对比行为笔记转录，其中 LXL 行 Pedestrian (RoI) 与 mAP (RoI) 同为 72.93、疑有转录错位（cross 文档 §6.3），本卡将其与另三行一并只用于「Cyclist 低于全部对比方法」的同表排序"
tags: [4d-radar, radar-camera-fusion, hgsfusion, vod, roi-ap, cyclist, failure-mode]
note: library/Multimodal_Fusion/HGSFusion.md#41-vod-数据集-sota-对比-table-1
paper: "AAAI 2025 · HGSFusion（带混合生成与同步的雷达-相机融合 3D 目标检测；笔记未记录英文原题与 arXiv 号；开源：https://github.com/garfield-cpp/HGSFusion）"
stance: watch
evidence:
  - source: library/Multimodal_Fusion/HGSFusion.md
    locator: "§4.1 / Table 1（2026-11-03 全表修正前历史记录；现笔记该行为 Car 88.28 / Pedestrian 62.61 / Cyclist 87.49 / mAP 79.46，无对应原文）"
    quote: "| **HGSFusion (Ours)** | **R+C**  | **88.28**     | **87.49**            | **79.46**         | **62.61**"
    relation: supports
  - source: library/Multimodal_Fusion/HGSFusion.md
    locator: "§4.1 / Table 1（2026-11-03 全表修正前历史记录；PointPillars 行 Pedestrian↔mAP 两列已互换改正，无对应原文）"
    quote: "| PointPillars         | R        | 70.15         | 67.48                | 85.07             | 47.22"
    relation: supports
  - source: library/Multimodal_Fusion/HGSFusion.md
    locator: "§4.1 / Table 1（2026-11-03 全表修正前历史记录；RadarPillarNet 行原混入 FUTR3D 的 86.19/43.10，现行为 42.80/83.14/65.86，无对应原文）"
    quote: "| RadarPillarNet       | R        | 71.65         | 65.86                | 86.19             | 43.10"
    relation: supports
  - source: library/Multimodal_Fusion/HGSFusion.md
    locator: "§4.1 / Table 1（2026-11-03 全表修正前历史记录；BEVFusion 行 Pedestrian↔mAP 两列已互换改正，无对应原文）"
    quote: "| BEVFusion            | R+C      | 70.21         | 68.52                | 89.48             | 45.86"
    relation: supports
  - source: library/Multimodal_Fusion/HGSFusion.md
    locator: "§4.1 / Table 1（现引文：fire-0143 修正 LXL 行 Pedestrian 58.30 后的转录，2026-11-05 复核逐字命中）"
    quote: "| LXL                  | R+C      | 72.18         | 58.30                | 88.31             | 72.93"
    relation: supports
  - source: library/Multimodal_Fusion/HGSFusion.md
    locator: "§4.1 / Table 1 分析（2026-11-03 全表修正前历史记录；该分析句已随全表重建改写为「87.49，低于 BEVFusion 89.48 与 LXL 88.31」版本，无对应原文）"
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

## 当前状态与待决（读卡先读本节）

**2026-11-03 笔记 §4.1 全表已按原文修正，本卡「Cyclist 低于同表全部四个对比方法」的事实基础被推翻（语义反转），falsifier 2 已触发。本卡命题（title/id）、status、stance 均未动，处置待主人裁定（QUESTIONS #24 在案）。**

- 修正后同表格局（笔记 §4.1 表后注：按 arXiv:2412.11489v1 Table 1 走廊区逐格重建，与 AAAI 2025 camera-ready 逐格一致）：HGSFusion 行实为 Car 88.28 / Pedestrian 62.61 / Cyclist 87.49 / mAP 79.46（立卡转录把 Pedestrian / mAP / Cyclist 三列轮转错位）；Cyclist (RoI) 87.49 **高于**纯雷达 PointPillars 85.07 / RadarPillarNet 83.14，仍低于 BEVFusion 89.48 与 LXL 88.31。
- 原文各行 mAP = 三类均值，交叉核对通过；同批修正确认 LXL 行 Pedestrian 58.30 / mAP 72.93（立卡时疑有的 72.93 重复已解决）。
- **待主人裁定（登记，本班不代行）**：a) 按修正后表格改写命题（如「Cyclist 低于两个 R+C 基线、高于两个纯雷达基线」）并同步 title/scope/evidence；b) 拆卡；c) 降级/转 stale。
- 下文「历史记录」节为立卡时据修正前笔记的表述，仅作历史记录；其中「Cyclist (RoI) 79.46 低于同表其余全部四个方法」与修正后原文不符，**不得再作为论文内容引用**。

## 历史记录（立卡时命题表述，基于 2026-11-03 修正前笔记）

论文声称（据修正前笔记 §4.1 转录，尚未独立验证）：VoD 的 SOTA 对比表中，HGSFusion 的 Car (RoI) 88.28 与 Pedestrian (RoI) 87.49 为同表最高，但 Cyclist (RoI) 79.46 低于同表其余全部四个方法——不只低于雷达-相机的 BEVFusion（89.48）与 LXL（88.31），也低于纯雷达的 PointPillars（85.07）与 RadarPillarNet（86.19）。笔记当时把下滑归因于 VoD 中与骑行者外观极相似的自行车架/未使用自行车污染了 RHGM 生成的点（论文的解读，笔记未给出针对该归因的单独消融；修正后笔记分析段保留该归因但对象改为 87.49，低于 BEVFusion/LXL）。

当时由该失效模式引出的研究问题（与 RadarOcc「低 RCS 弱目标需在输入端特别保护」同向，cross 文档 S4）：生成/增密路线在易混弱目标上有自己的暴露面。**修正后此「同向」论据的事实基础已变（Cyclist 87.49 高于纯雷达基线），在主人裁定改写命题前，不应再以本卡作为该问题的证据来源。**

立卡时引用口径警告（历史；引用修正前转录时适用）：
1. 笔记 §1 概述头条「在 VoD 数据集上 RoI AP 达到 88.28%」按 Table 1 是 **Car 类 RoI AP**——此条修正后仍有效；全类 mAP (RoI) 修正后为 79.46（修正前转录误作 62.61）。**不得把 88.28 当 mAP 引用**，必须注明类别与指标（cross 文档 M3）。
2. （已解决）LXL 行 Pedestrian (RoI) 与 mAP (RoI) 同为 72.93 的疑点：2026-11-03 已按原文修正为 Pedestrian 58.30 / mAP 72.93（cross 文档 §6.3 遗留问题 3 闭合）。
3. 消融表（Table 3/4/7）全量模型的「RoI AP 79.46」与本表 mAP (RoI) 79.46 数值巧合相同（2026-11-05 复核笔记 L138/148/171 仍在），两者口径关系笔记未说明，跨表引用需谨慎。

## 证据支持到哪里

- evidence 6 条中仅 LXL 行 quote 为现引文（2026-11-03 fire-0143 修正后，2026-11-05 复核逐字命中）；其余 5 条（HGSFusion 行、PointPillars、RadarPillarNet、BEVFusion 行、修正前分析句）为修正前历史记录，现笔记无对应原文（locator 已标注）。
- 修正后笔记全表与 arXiv:2412.11489v1 HTML Table 1 逐格一致（2026-11-03 抓取，与 fire-0143 对 arXiv v1 + AAAI camera-ready 的逐格核对一致，见笔记 §4.1 表后注）；本班未另行实抓原文。
- scope 中「LXL 行 Pedestrian (RoI) 与 mAP (RoI) 同为 72.93、疑有转录错位」等表述描述的是立卡时（修正前）的笔记状态，保留作历史。

## 待验证（仍有效的独立检查）

- 回 AAAI 2025 camera-ready 复核 RoI AP / mAP (RoI) 的精确定义与协议（cross 文档 M1：RoI 口径笔记未定义）。
- 用开源实现（https://github.com/garfield-cpp/HGSFusion）在 VoD 上复测分类别 RoI AP（独立于笔记转录的第二证据源；主人的独立复核与本卡 status 无关，仍是 asserted）。
- 归因检验（若主人保留归因叙事再做）：限制 RHGM 生成点不落入自行车架相似掩码（或直接去掉生成点），看 Cyclist 是否回升。

## 若成立 / 不成立意味着什么（按立卡命题，其不成立分支已被 2026-11-03 核对坐实）

成立：图像语义引导的「生成补点」路线在易混弱目标（骑行者）上有系统性失效风险，选型或自研时必须看分类别指标而非只看聚合 mAP。
不成立（已坐实）：Cyclist 下滑是笔记转录的伪象——修正后 Cyclist 87.49 高于两个纯雷达基线；生成补点路线是否有易混弱目标失效模式，需按原文重估后再议（本卡不再支撑该论点）。

## 核查记录

- 立卡（据修正前笔记转录，日期未记录）。
- 2026-11-03 fire-0143（修订注记，原文保留）：笔记 §4.1 LXL 行 Pedestrian (RoI) 已按论文原表修正 72.93 → 58.30（mAP (RoI) 72.93 与原文一致，保留），本卡 evidence 中 LXL 行 quote 已同步更新。修正依据：arXiv:2412.11489v1 与 AAAI 2025 camera-ready PDF（ojs.aaai.org article 32328）Table 1，2026-11-03 抓取，两者逐格一致。LXL 行 Cyclist 88.31 未变，本卡「Cyclist 低于全部对比方法」的同表排序结论当时判断不受此修正影响；但同次逐格核对发现本表其余行的 Pedestrian/mAP 列指派与原文不符（原文 HGSFusion 行为 Car 88.28 / Pedestrian 62.61 / Cyclist 87.49 / mAP 79.46，见笔记 §4.1 表后注）——按原文修将推翻本卡结论，属语义反转，卡暂不动（铁律 3）。
- 2026-11-03 round3 终审（QA）/ fire-0238（commit 007992f）：上述假设当日落地——笔记 §4.1 全表已按 arXiv:2412.11489v1 Table 1 走廊区逐格重建（见笔记 §4.1 表后注），语义反转坐实：修正后 Cyclist (RoI) 87.49 高于 PointPillars 85.07 / RadarPillarNet 83.14，仍低于 BEVFusion 89.48 / LXL 88.31（QUESTIONS #24 在案）。本卡主张正文与 status 未动。
- 2026-11-05：本班表达整理与历史/当前分层（命题、status、stance、数字未改写）；Grep 复核 6 条 evidence quote（1 条现引文命中 + 5 条历史记录无对应原文）；复核笔记表后注、QUESTIONS #24 在案、消融表 79.46 巧合仍在。
