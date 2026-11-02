---
id: claim-sgdet3d-srp-gdc-laca-vod-monotonic
title: "SGDet3D 自报：VoD 组件消融中 SRP → GDC → LACA 逐级叠加，mAP_EAA 单调增长 50.44 → 56.11 → 58.27 → 59.49"
type: claim
status: asserted
scope: "VoD 数据集；SGDet3D 管线内组件消融（论文 Table，据库内笔记 §5.1 转录）；指标为 mAP_EAA / mAP_DC——口径笔记未定义，且与 HGSFusion 的 EAA AP / RoI AP 口径互不可比（nightshift/cross/4d-radar.md M1/M2），59.49/77.11 不得与 HGSFusion 的 58.96 / 62.61 横向比较；叠加顺序固定为 Baseline → +SRP → +SRP+GDC → 完整模型（GDC 未单测、LACA 未单测）；SGDet3D 自报数字（RA-L 2025），尚未独立验证"
tags: [4d-radar, radar-camera-fusion, sgdet3d, vod, ablation, srp, gdc, laca]
note: library/Classical_Detection/SGDet3D.md#51-核心组件消融-vod-数据集
paper: "RA-L 2025 · SGDet3D（面向 4D 雷达-相机融合的语义与几何融合 3D 目标检测；笔记未记录英文原题与 arXiv 号；开源：https://github.com/shawnnnkb/SGDet3D）"
stance: watch
evidence:
  - source: library/Classical_Detection/SGDet3D.md
    locator: "§5.1 / 消融表"
    quote: "| Baseline |         |         |          | 50.44                 | 69.76                |"
    relation: supports
  - source: library/Classical_Detection/SGDet3D.md
    locator: "§5.1 / 消融表"
    quote: "| + SRP    | ✓       |         |          | 56.11                 | 73.06                |"
    relation: supports
  - source: library/Classical_Detection/SGDet3D.md
    locator: "§5.1 / 消融表"
    quote: "| + GDC    | ✓       | ✓       |          | 58.27                 | 75.80                |"
    relation: supports
  - source: library/Classical_Detection/SGDet3D.md
    locator: "§5.1 / 消融表"
    quote: "| 完整模型 | ✓       | ✓       | ✓        | **59.49**             | **77.11**            |"
    relation: supports
  - source: library/Classical_Detection/SGDet3D.md
    locator: "§5.1 分析"
    quote: "**分析**：特征解耦的 SRP 和 GDC 显著提升了检测基线，LACA 模块的深层交互进一步利用了双分支提供的优质 Token 空间，实现了性能最大化。"
    relation: supports
falsifiers:
  - "复现消融：任一叠加步骤后 mAP_EAA 或 mAP_DC 不升反降，或终值显著低于自报 59.49 / 77.11（单调序列被打破）"
  - "复现 SRP 单组件增益与自报显著不符（+5.67 mAP_EAA 复现为零或负）——图像语义改写雷达特征的路线在该数据集不带来增益"
  - "改变叠加顺序（如先 GDC 后 SRP）或发现各行训练配置 / 评测口径不一致，导致四档数字不可比"
review_due: 2026-12-02
related: [claim-sgdet3d-depth-orientation-pollution-without-gdc, claim-sgdet3d-depth-supervision-density-gain, claim-sgdet3d-sota-eaa-dc-caliber, claim-r4det-plugplay-vod-eaa-gain]
signoff: null
---

## 我的理解

论文声称（据笔记 §5.1 转录，尚未独立验证）：VoD 组件消融中按 SRP（语义雷达 PillarNet，图像语义→雷达特征）→ GDC（几何深度补全，雷达深度→图像特征）→ LACA（定位感知交叉注意力）顺序逐级叠加，mAP_EAA 50.44 → 56.11 → 58.27 → 59.49，mAP_DC 69.76 → 73.06 → 75.80 → 77.11，两指标全序列单调。SRP 的 +5.67 mAP_EAA 是全表最大单步增益，也是唯一的单组件隔离增益（GDC 只在 +SRP 之上出现、LACA 只在 +SRP+GDC 之上出现，两者单独的增益表中未测）。

自洽交叉核对：完整模型行 59.49 / 77.11 与 §5.3 LiDAR 监督行完全相同，两表一致；这也说明完整模型默认用 LiDAR 真值做深度监督（见 [监督源卡](claim-sgdet3d-depth-supervision-density-gain.md)）。

必须记住的限定：「单调增长」是**固定叠加顺序下的观察**（与 [R4Det 三重监督卡](claim-r4det-pdf-depth-supervision-monotonic-gain.md) 同款限定），换叠加顺序是否仍单调，笔记未记录；mAP_EAA / mAP_DC 口径笔记未定义，引用任何数字不得脱离口径。

> 附注（2026-11-03，笔记修正同步）：scope 中「不得与 HGSFusion 的 58.96 / 62.61 横向比较」里的 62.61，经笔记修正核实实为 HGSFusion 走廊区 **Pedestrian (RoI)**；HGSFusion 走廊区 mAP (RoI) 为 79.46（EAA AP 58.96 为消融表全量值，不变）。「59.49 / 77.11 不得与 HGSFusion 数字横向比较」的限定本身不变。依据：arXiv:2412.11489v1 HTML Table 1（arxiv.org/html/2412.11489v1，2026-11-03 抓取），见 HGSFusion 笔记 §4.1 表后注。

## 待验证

- 回 SGDet3D 原文核对消融表四行数字与「+ SRP / + GDC / 完整模型」各行的模块组合精确定义，确认 mAP_EAA / mAP_DC 口径。
- 用开源实现（https://github.com/shawnnnkb/SGDet3D）在 VoD 上复现四档消融（同 schedule、多种子），检验 50.44 → 56.11 → 58.27 → 59.49 排序是否稳定。
- 补测换序消融（GDC-only、GDC→SRP、SRP→LACA 等），确认单调性是设计性质还是顺序巧合。

## 若成立 / 不成立意味着什么

成立：双向特征互补（语义→雷达 + 深度→相机）是雷达-相机融合中可逐级叠加的正交设计点，且语义改写雷达特征（SRP）单独贡献最大；自研融合管线可按此顺序逐个引入并逐级验证。
不成立：增益依赖特定叠加顺序、特定训练配置或口径，组件需重新拆解归因，「SRP 贡献最大」不可作为选型依据。
