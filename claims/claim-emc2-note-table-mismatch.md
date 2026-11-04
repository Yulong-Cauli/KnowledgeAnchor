---
id: claim-emc2-note-table-mismatch
title: "EMC2 笔记的 §5.1 对比表与 arXiv v1 原表不一致"
type: claim
status: asserted
scope: "library/Multimodal_Fusion/EMC2.md §5.1；对照 arXiv:2507.04123v1 Table 1；不评价笔记 §5.2（EMC2 自身行与 v1 一致）"
tags: [emc2, note-quality, evidence, jetson]
note: library/Multimodal_Fusion/EMC2.md#51-kitti-数据集性能对比-table-1
paper: "ICCV 2025, Towards Accurate and Efficient 3D Object Detection for Autonomous Driving: A Mixture of Experts Computing System on Edge (arXiv:2507.04123)"
stance: watch
evidence:
  - source: library/Multimodal_Fusion/EMC2.md
    locator: "§5.1 表头：Jetson 延迟 (ms) 单列（2026-11-03 修正前历史记录；现表已恢复 A4000/Jetson 两列，无此单列表头）"
    quote: "| **方法 (Method)** | **行人 3D AP (Hard)** | **汽车 3D AP (Hard)** | **骑行者 3D AP (Hard)** | **Jetson 延迟 (ms)** |"
    relation: supports
  - source: library/Multimodal_Fusion/EMC2.md
    locator: "§5.1 / PointPillar 行（2026-11-03 修正前历史记录；现行为两列延迟 41/972，无对应原文）"
    quote: "| PointPillar       | 46.87                 | 75.19                 | 58.97                   | 41                   |"
    relation: supports
  - source: library/Multimodal_Fusion/EMC2.md
    locator: "§5.1 / LoGoNet 行（2026-11-03 修正前历史记录；现行为两列延迟 100/N/A 且 Car Hard 84.31，无对应原文）"
    quote: "| LoGoNet           | 59.46                 | 82.92                 | 72.42                   | 965                  |"
    relation: supports
  - source: https://arxiv.org/abs/2507.04123
    locator: "Table 1（arXiv HTML v1，A4000 与 Jetson 两列延迟）；数字摘录说明（非逐字原文）；2026-11-05 本班实抓 arXiv HTML v1 二次复核全部数值命中"
    quote: "PointPillar：A4000 41 / Jetson 972；Second-IoU：A4000 58 / Jetson N/A；LoGoNet：A4000 100 / Jetson N/A；TED：A4000 162 / Jetson N/A；EMC2：A4000 160 / Jetson 372.5"
    relation: supports
  - source: https://arxiv.org/abs/2507.04123
    locator: "Table 1（arXiv HTML v1，Easy/Moderate/Hard）；数字摘录说明（非逐字原文）；2026-11-05 本班实抓 arXiv HTML v1 二次复核全部数值命中"
    quote: "LoGoNet Car 92.04/85.04/84.31；TED Car 92.25/88.94/86.73；Second-IoU Cyclist 90.73/71.23/66.26"
    relation: supports
falsifiers:
  - "找到笔记所依据的论文版本（ICCV camera-ready 或 arXiv 更新版本），其中 Table 1 的延迟列结构与数字与笔记一致"
  - "笔记的数字来自论文其他表格或其他论文，且笔记在上下文中正确标注了数据集、难度与硬件"
review_due: 2026-12-01
related: [claim-emc2-orin-sub400ms-leading-accuracy]
signoff: null
---

## 这条主张是什么意思

本卡是笔记质量记录（asserted，单点事实、可逐格证伪）：EMC2 笔记 §5.1 对比表曾有与 arXiv v1 Table 1 不一致的三类问题。本卡记录的是 2026-11-03 修正前的笔记状态；笔记已于 2026-11-03 修正。本卡不构成对 EMC2 方法本身的评价。

## 当前状态（2026-11-03 笔记已修正）

§5.1 表已按 arXiv v1 Table 1 逐格重建（恢复 A4000/Jetson 两列延迟：PointPillar 41/972、Second-IoU 58/N/A、LoGoNet 100/N/A、TED 162/N/A、EMC2 160/372.5；Second-IoU 骑行者 Hard 66.26、LoGoNet 汽车 Hard 84.31、TED 汽车 Hard 86.73），分析句同步改写（965ms 改归多模态 Voxel-RCNN，EMC2 372.5ms 相对 965–1787ms 方法 2.5×–4.8× 加速为论文正文口径）。本次修正依据：https://arxiv.org/html/2507.04123v1（HTML，2026-11-03 抓取）与 ICCV 2025 camera-ready https://openaccess.thecvf.com/content/ICCV2025/papers/Liu_Towards_Accurate_and_Efficient_3D_Object_Detection_for_Autonomous_Driving_ICCV_2025_paper.pdf（CVF Open Access，2026-11-03 抓取）——两版本 Table 1 逐格一致，故笔记旧数字不属于任何已发表版本（原「待验证」第 1 条据此解决）。修正中另补获：笔记旧 TED 行 A4000「154」实为 CAT-DET 的 A4000 值（原表 TED 为 162），已在笔记注记说明。

2026-11-05 本班二次实抓 arXiv v1 HTML 逐值复核：本卡两条论文侧数字摘录全部命中（PointPillar 41/972、Voxel-RCNN 331/965、LoGoNet 84.31/100/N/A、TED 86.73/162、Second-IoU 66.26/58/N/A、EMC2 160/372.5、正文「2.5×–4.8× over 965–1787ms」）；另见 v1 中 VFF 行 Car Hard = 82.92（LoGoNet 相邻行），疑为旧笔记 LoGoNet「82.92」的实际来源（本班整理者推断，尚未验证，仅作线索）。

## 历史记录（修正前笔记状态，即本卡三条笔记 quote 所指原文，现笔记已无对应行）

1. **延迟列结构**：笔记只有一列"Jetson 延迟"，但 v1 Table 1 分 A4000 / Jetson 两列。笔记里 PointPillar 的 41ms 在 v1 中是 **A4000** 延迟，其 Jetson 延迟是 **972ms**——方向完全相反（v1 中 PointPillar 在 Jetson 上比 EMC2 的 372.5ms 慢 2.6 倍，笔记却显示快 9 倍）。
2. **不存在的数字**：笔记 LoGoNet 行的 82.92（Car Hard）与 965ms 在 v1 行中都不存在（v1：Car Hard 84.31，A4000 100ms，Jetson N/A）。
3. **取错难度列**：笔记 TED Car Hard 88.94 实为 v1 的 Moderate 值（Hard 是 86.73）；笔记 Second-IoU Cyclist Hard 71.23 实为 Moderate 值（Hard 是 66.26）。

当时的引用口径（针对修正前转录）：凡基线对比（尤其延迟对比，如"LoGoNet 在 Jetson 上 965ms"）一律回论文原表核对；EMC2 自身行（66.81 / 88.15 / 77.62 / 160 / 372.5）修正前后与 v1 一致。修正后笔记可直接引用，引用重要数字时仍建议对照原表复核。

## 证据支持到哪里

- 笔记侧三条 quote 为修正前历史记录（locator 已标注）；修正后笔记 §5.1 表与 arXiv v1/CVF 逐格一致（2026-11-03 抓取 + 2026-11-05 二次实抓复核）。
- 论文侧两条 evidence 为数字摘录说明（非逐字原文，locator 已标注），2026-11-05 二次实抓复核全部命中。

## 待决事项（登记）

- 本卡 status 处置由主人裁定：若后续在 camera-ready 或其他版本发现与修正前笔记一致的表格（当前 v1 与 CVF 两版本核对均不一致，可能性低），按 falsifier 改写或降级；否则保留为笔记质量历史记录。

## 核查记录

- 立卡（日期未记录）：对照 arXiv v1 Table 1 发现三类不一致。
- 2026-11-03：笔记 §5.1 按 v1 逐格重建（CVF camera-ready 同日交叉核对一致）；本卡 status 与既有 evidence 未动。
- 2026-11-05：本班表达整理与历史/当前分层（数字未改写）；Grep 复核三条笔记 quote 已成历史记录；实抓 arXiv v1 HTML 二次复核数字摘录全部命中，另获 VFF 82.92 线索（未写入 evidence）。
