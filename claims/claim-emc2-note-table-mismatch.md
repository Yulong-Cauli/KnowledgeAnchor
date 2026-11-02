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
    locator: "§5.1 表头：Jetson 延迟 (ms) 单列"
    quote: "| **方法 (Method)** | **行人 3D AP (Hard)** | **汽车 3D AP (Hard)** | **骑行者 3D AP (Hard)** | **Jetson 延迟 (ms)** |"
    relation: supports
  - source: library/Multimodal_Fusion/EMC2.md
    locator: "§5.1 / PointPillar 行"
    quote: "| PointPillar       | 46.87                 | 75.19                 | 58.97                   | 41                   |"
    relation: supports
  - source: library/Multimodal_Fusion/EMC2.md
    locator: "§5.1 / LoGoNet 行"
    quote: "| LoGoNet           | 59.46                 | 82.92                 | 72.42                   | 965                  |"
    relation: supports
  - source: https://arxiv.org/abs/2507.04123
    locator: "Table 1（arXiv HTML v1，A4000 与 Jetson 两列延迟）"
    quote: "PointPillar：A4000 41 / Jetson 972；Second-IoU：A4000 58 / Jetson N/A；LoGoNet：A4000 100 / Jetson N/A；TED：A4000 162 / Jetson N/A；EMC2：A4000 160 / Jetson 372.5"
    relation: supports
  - source: https://arxiv.org/abs/2507.04123
    locator: "Table 1（arXiv HTML v1，Easy/Moderate/Hard）"
    quote: "LoGoNet Car 92.04/85.04/84.31；TED Car 92.25/88.94/86.73；Second-IoU Cyclist 90.73/71.23/66.26"
    relation: supports
falsifiers:
  - "找到笔记所依据的论文版本（ICCV camera-ready 或 arXiv 更新版本），其中 Table 1 的延迟列结构与数字与笔记一致"
  - "笔记的数字来自论文其他表格或其他论文，且笔记在上下文中正确标注了数据集、难度与硬件"
review_due: 2026-12-01
related: [claim-emc2-orin-sub400ms-leading-accuracy]
signoff: null
---

## 我的理解

笔记 §5.1 的表有三类与 arXiv v1 不一致的地方：

1. **延迟列结构**：笔记只有一列"Jetson 延迟"，但 v1 Table 1 分 A4000 / Jetson 两列。笔记里 PointPillar 的 41ms 在 v1 中是 **A4000** 延迟，其 Jetson 延迟是 **972ms**——方向完全相反（v1 中 PointPillar 在 Jetson 上比 EMC2 的 372.5ms 慢 2.6 倍，笔记却显示快 9 倍）。
2. **不存在的数字**：笔记 LoGoNet 行的 82.92（Car Hard）与 965ms 在 v1 行中都不存在（v1：Car Hard 84.31，A4000 100ms，Jetson N/A）。
3. **取错难度列**：笔记 TED Car Hard 88.94 实为 v1 的 Moderate 值（Hard 是 86.73）；笔记 Second-IoU Cyclist Hard 71.23 实为 Moderate 值（Hard 是 66.26）。

结论：凡引用笔记 §5.1 的基线对比（尤其延迟对比），一律回论文原表核对；EMC2 自身行（66.81 / 88.15 / 77.62 / 372.5）与 v1 一致，可继续使用。若后续找到与笔记一致的版本（camera-ready），此卡按 falsifier 改写或降级。

## 待验证

- 核对 ICCV 2025 camera-ready（CVF Open Access）版本的 Table 1，确认笔记依据的是哪个版本。
- 若 LoGoNet 965ms 出自论文正文另一处（如 A4000 不同输入配置），补注出处。

## 若成立 / 不成立意味着什么

成立：修复笔记 §5.1（经用户同意）或在表头注明"数字待核"；基线延迟对比类结论（如"LoGoNet 在 Jetson 上 965ms"）不得再引用笔记。
不成立：找到与笔记一致的版本，说明是 arXiv v1 与 camera-ready 的版本差异，在笔记中标注版本号即可。
