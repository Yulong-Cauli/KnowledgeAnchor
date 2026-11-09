---
id: claim-sgdet3d-depth-orientation-pollution-without-gdc
title: "SGDet3D 自报：LACA 定向消融中无 GDC 增强的深度定向使 mAP_EAA 低于无定向基线（55.79 → 54.29），加 GDC 后反超至 58.19"
type: claim
status: asserted
scope: "VoD 数据集；SGDet3D 管线内 LACA 内部定向机制消融（论文 Table，据库内笔记 §5.2 转录）；主张仅限 mAP_EAA 口径——同表 mAP_DC 上该行 73.25 略高于基线 73.19，方向与 EAA 相反；mAP_EAA/DC 口径笔记未定义，与 HGSFusion 的 EAA AP / RoI AP 口径互不可比（nightshift/cross/4d-radar.md M1）；「劣质深度概率污染 / 注意力采样坍塌」为论文归因措辞，笔记未提供注意力统计或分类别证据；自报数字"
tags: [4d-radar, radar-camera-fusion, sgdet3d, vod, ablation, laca, depth-quality, failure-mode]
note: library/Classical_Detection/SGDet3D.md#52-laca-内部定向机制消融
paper: "RA-L 2025 · SGDet3D（面向 4D 雷达-相机融合的语义与几何融合 3D 目标检测；笔记未记录英文原题与 arXiv 号；开源：https://github.com/shawnnnkb/SGDet3D）"
stance: watch
evidence:
  - source: library/Classical_Detection/SGDet3D.md
    locator: "§5.2 / 定向机制消融表"
    quote: "| Baseline (无定向)               | 55.79                 | 73.19                |"
    relation: supports
  - source: library/Classical_Detection/SGDet3D.md
    locator: "§5.2 / 定向机制消融表"
    quote: "| Depth-Ort (无 GDC 增强)         | 54.29                 | 73.25                |"
    relation: supports
  - source: library/Classical_Detection/SGDet3D.md
    locator: "§5.2 / 定向机制消融表"
    quote: "| Depth-Ort + GDC                 | 58.19                 | 75.28                |"
    relation: supports
  - source: library/Classical_Detection/SGDet3D.md
    locator: "§5.2 分析"
    quote: "**分析**：在缺乏物理先验（无 GDC）时强行执行深度定向映射，劣质的深度概率会污染 3D Key/Value 特征空间，导致注意力采样坍塌。高质量的 GDC 是 3D 特征空间构建的必要前置条件。"
    relation: supports
falsifiers:
  - "复现消融：无 GDC 的 Depth-Ort 行 mAP_EAA ≥ 无定向基线（55.79），「污染导致劣化」现象不出现"
  - "复现：加 GDC 后未反超基线（mAP_EAA < 55.79），或显著低于自报 58.19——GDC 前置条件不成立"
  - "发现 EAA 侧现象跨种子不稳健，或原文口径下 EAA/DC 两指标方向实际一致（笔记 73.25 > 73.19 系转录误差），「污染」结论依赖单一指标"
review_due: 2026-12-02
related: [claim-sgdet3d-srp-gdc-laca-vod-monotonic, claim-sgdet3d-depth-supervision-density-gain, claim-hgsfusion-cyclist-roi-ap-below-all-baselines]
signoff: null
---

## 我的理解

论文声称（据笔记 §5.2 转录）：LACA 的深度定向（Depth-Ort）在没有 GDC 提供深度概率时，mAP_EAA 从无定向基线 55.79 降到 54.29（−1.50，低于基线）；同一 Depth-Ort 加上 GDC 后升至 58.19（+2.40，超基线）。论文把这归因为：劣质深度概率会污染 3D Key/Value 特征空间、导致注意力采样坍塌，因此高质量 GDC 是 3D 特征空间构建的必要前置条件。**归因是论文的解释**，笔记只有两行端点数字，没有注意力统计或分类别证据。

引用前必读的两个限定：
1. **指标方向不一致**：mAP_DC 口径下同一行是 73.25，略高于基线 73.19——「污染劣化」只在 mAP_EAA 出现，mAP_DC 下深度定向（无 GDC）并不劣于无定向基线。本卡主张仅限 mAP_EAA；不得笼统转述为「没有 GDC 深度定向就有害」。
2. 表中最优是 Pixel-Ort + Depth-Ort + GDC（58.35 / 75.57），但 Pixel-Ort 的隔离贡献本卡不主张（表中无 Pixel-Ort 单独行）。

该教训与 HGSFusion 生成点污染易混类别的失效模式同向（cross 文档 S3）：中间量（深度概率 / 生成点）质量必须被约束，否则污染下游注意力或特征。

## 待验证

- 回 SGDet3D 原文核对 §5.2 表四行数字，确认 EAA/DC 两口径的定义与各行配置（尤其 Depth-Ort（无 GDC）行除 GDC 外是否与基线完全一致）。
- 用开源实现复现四行：55.79 / 54.29 / 58.19 / 58.35 的排序是否跨种子稳定；「无 GDC 劣化」是否在 mAP_DC 上同样出现（笔记中不出现）。
- 检验归因：记录无 GDC 时的注意力采样分布或 3D Key/Value 特征统计，验证「坍塌」是否真实发生，还是仅端点数字的相关性叙事。

## 若成立 / 不成立意味着什么

成立：依赖深度中间量的 3D 注意力设计必须先保证深度概率质量（物理先验 / 高质量监督），「先补深度、再做定向注意力」是必要顺序；自研 LACA 类模块应把深度质量门槛作为前置模块而非可选项。
不成立：劣化是噪声或指标选择伪象，深度定向不依赖 GDC 也能工作，「GDC 必要前置」的叙事不成立，模块可独立选配。
