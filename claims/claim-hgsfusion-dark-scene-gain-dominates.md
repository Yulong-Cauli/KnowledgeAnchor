---
id: claim-hgsfusion-dark-scene-gain-dominates
title: "HGSFusion 自报：暗光（Dark）场景相对 Base-R+C 的 3D mAP 增益 +11.41 个百分点（4.27 → 15.68），远大于正常/强光场景的 +2.32 / +2.91"
type: claim
status: asserted
scope: "光照条件分组测试（论文 Table 5，据库内笔记 §4.4 转录）；笔记未标注数据集（§4 上下文推定 VoD，需回原文核对）、光照分组划分标准与类别覆盖；对照列为笔记所称 Base-R+C（构成未定义）；指标 3D mAP；自报数字，尚未独立验证；本卡只主张增益排序（Dark ≫ Shiny ≈ Normal），不主张「暗光下可用」"
tags: [4d-radar, radar-camera-fusion, hgsfusion, low-light, robustness, modality-sync]
note: library/Multimodal_Fusion/HGSFusion.md#44-光照条件鲁棒性测试-table-5
paper: "AAAI 2025 · HGSFusion（带混合生成与同步的雷达-相机融合 3D 目标检测；笔记未记录英文原题与 arXiv 号；开源：https://github.com/garfield-cpp/HGSFusion）"
stance: watch
evidence:
  - source: library/Multimodal_Fusion/HGSFusion.md
    locator: "§4.4 / Table 5"
    quote: "| **Dark (暗光)** | 4.27                  | **15.68**              | **+11.41%**"
    relation: supports
  - source: library/Multimodal_Fusion/HGSFusion.md
    locator: "§4.4 / Table 5"
    quote: "| Normal (正常)   | 33.50                 | 35.82                  | +2.32%"
    relation: supports
  - source: library/Multimodal_Fusion/HGSFusion.md
    locator: "§4.4 / Table 5"
    quote: "| Shiny (强光)    | 22.37                 | 25.28                  | +2.91%"
    relation: supports
  - source: library/Multimodal_Fusion/HGSFusion.md
    locator: "§4.4 / Table 5 分析"
    quote: "**分析**：在最极端黑暗场景下，HGSFusion 实现了 11.41% 的跨越式提升。这强有力地支持了 DSM 模块中模态同步的理论：在视觉失效时，模型能成功切换到以雷达为主的感知模式。"
    relation: supports
falsifiers:
  - "复现同一光照分组测试：Dark 场景增益 ≤ Normal 或 Shiny 场景增益，排序反转"
  - "Dark 基线远高于 4.27（更换对照模型或评测协议后），「极端黑暗下视觉失效」前提不成立，增益排序失去意义"
  - "归因失效：去掉 DSM 模态同步（或单用 RHGM）后 Dark 增益不变，说明 +11.41 与光照自适应加权无关"
review_due: 2026-12-02
related: [claim-hgsfusion-rhgm-dsm-superadditive-roi-gain]
signoff: null
---

## 我的理解

论文声称（据笔记 §4.4 转录，尚未独立验证）：相对 Base-R+C 的 3D mAP 增益按光照分组为——Dark +11.41（4.27 → 15.68）、Normal +2.32（33.50 → 35.82）、Shiny +2.91（22.37 → 25.28），Dark 增益约为另两组的 4–5 倍。笔记把这解读为 DSM 模态同步的证据：视觉失效时模型切换到雷达主导的感知模式。

两个口径注意：
1. 笔记表内写「+11.41%」，按表内数字 15.68 − 4.27 = 11.41，实为**百分点**而非相对百分比（相对增幅约 2.7 倍）。引用时应写「+11.41 个百分点」。
2. Dark 下 15.68 的绝对水平仍远低于 Normal 的 33.50——这是**增益排序**主张，不是「暗光性能好」主张；暗光下模型仍然显著变差。

限定：Base-R+C 的具体构成、光照分组的划分标准（亮度阈值/来源）、类别覆盖与数据集均未在笔记中记录；「模态同步切换到雷达主导」是论文解释，笔记未给出按光照分组的模态权重可视化或对应消融。

## 待验证

- 回原文核对 Table 5：数据集、光照划分标准、Base-R+C 定义、类别覆盖与 3D mAP 协议。
- 复现：在原文所用数据集上按光照分组评测，看 4.27 → 15.68 与「Dark ≫ Shiny ≈ Normal」排序是否复现。
- 归因消融：去掉模态同步分支（保留空间同步）再测 Dark 增益，确认增益确实来自光照自适应加权。

## 若成立 / 不成立意味着什么

成立：模态权重随光照自适应是有价值的机制，夜间/隧道场景的雷达-相机融合方案值得引入显式光照感知加权；融合模型的评估应按光照分组报告，聚合 mAP 会掩盖该收益。
不成立：Dark 增益是对照选择或口径的伪象，光照自适应叙事不成立，DSM 的价值退回 Table 3 的整体 +1.18 RoI AP。
