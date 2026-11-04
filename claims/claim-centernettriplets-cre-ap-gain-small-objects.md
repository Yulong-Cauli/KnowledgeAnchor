---
id: claim-centernettriplets-cre-ap-gain-small-objects
title: "CenterNet（Keypoint Triplets）论文声称：仅在 CornerNet511-52 上增加中心点热图分支（CRE）AP 37.6%→39.9%（+2.3），增益集中于小物体（AP_S +4.6，AP_L 几乎不变）"
type: claim
status: asserted
scope: "笔记 §消融实验组件叠加消融的第一步：CornerNet511-52 基线（输入分辨率 511×511，骨干 Hourglass-52）上仅增加中心点热图分支（中心点检测用普通卷积，未加特殊池化）；AP / AP_S / AP_L 为论文自报，数据集已按原文补核：MS-COCO validation（arXiv 1904.08189v3 §4.5 Table 4 caption，2026-11-05 实抓命中），37.6→39.9 / AP_S +4.6 / AP_L 52.2→52.3 均在原文命中；尚未独立验证"
tags: [centernet, cornernet, keypoint-triplets, central-region-verification, ablation, small-objects]
note: library/Classical_Detection/CenterNet：Keypoint Triplets.md#消融实验
paper: "ICCV 2019, CenterNet: Keypoint Triplets for Object Detection（开源：https://github.com/Duankaiwen/CenterNet）"
stance: watch
evidence:
  - source: library/Classical_Detection/CenterNet：Keypoint Triplets.md
    locator: "§消融实验 / 基线模型"
    quote: "**基线模型：** CornerNet511-52（输入分辨率 $511\times511$ ，骨干网络 Hourglass-52）。"
    relation: supports
  - source: library/Classical_Detection/CenterNet：Keypoint Triplets.md
    locator: "§消融实验 / 第一步：引入中心区域探索 (CRE) / 操作"
    quote: "- **操作：** 在 CornerNet 基础上增加一个中心点热图分支。此时中心点检测仅使用普通卷积，未加特殊池化 。"
    relation: supports
  - source: library/Classical_Detection/CenterNet：Keypoint Triplets.md
    locator: "§消融实验 / 第一步：引入中心区域探索 (CRE) / 结果"
    quote: "- **结果：** AP 从 37.6% 提升到 **39.9%** (+2.3%) 。"
    relation: supports
  - source: library/Classical_Detection/CenterNet：Keypoint Triplets.md
    locator: "§消融实验 / 第一步：引入中心区域探索 (CRE) / 关键发现（小物体）"
    quote: "- **小物体 (Small Objects) 受益最大：** $AP_S$ 提升了 4.6% 。"
    relation: supports
  - source: library/Classical_Detection/CenterNet：Keypoint Triplets.md
    locator: "§消融实验 / 第一步：引入中心区域探索 (CRE) / 关键发现（大物体）"
    quote: "- **大物体 (Large Objects) 几乎没变：** $AP_L$ 仅从 52.2% 变到 52.3%。"
    relation: supports
  - source: https://arxiv.org/pdf/1904.08189
    locator: "§4.5 Ablation Study（arXiv PDF v3，pdftotext 提取，抓取 2026-11-05）"
    quote: "we improve the AP by 2.3% (from 37.6% to 39.9%). However, we find that the improvement for the small objects (that is 4.6%) is more significant than that for other object scales. The improvement for large objects is almost negligible (from 52.2% to 52.3%)."
    relation: supports
  - source: https://arxiv.org/pdf/1904.08189
    locator: "§4.5 Ablation Study 开篇（基线与叠加方式；pdftotext 提取，抓取 2026-11-05）"
    quote: "The baseline is CornerNet511-52 [20]. We add the three components to the baseline one by one and follow the default parameter setting detailed in Section 4.1. The results are given in Table 4."
    relation: supports
  - source: https://arxiv.org/pdf/1904.08189
    locator: "Table 4 caption（数据集口径；pdftotext 提取，抓取 2026-11-05）"
    quote: "Table 4: Ablation study on the major components of CenterNet511-52 on the MS-COCO validation dataset. The CRE denotes central region exploration, the CTP denotes center pooling, and the CCP denotes cascade corner pooling."
    relation: supports
falsifiers:
  - "原文核查（已完成，未触发，2026-11-05）：原论文消融表无此步骤，或数字与笔记所载 37.6 / 39.9 / +4.6 / 52.2→52.3 不一致——已实抓 arXiv 1904.08189v3，§4.5 prose（2.3% / 4.6% / 52.2→52.3）与 Table 4 第三行（AP_S 18.5→23.1、AP_L 52.2→52.3）均命中，此分支闭合"
  - "同范围复现：在 CornerNet511-52 上仅加中心点热图分支（无特殊池化）AP 增益明显低于 +2.3 或为负（COCO validation 口径）"
  - "同范围复现（尺寸分解）：AP_S 提升远小于 4.6，或大物体 AP_L 变动明显（如 ≥±1.0）而非 52.2→52.3"
review_due: 2026-12-02
related: [claim-centernettriplets-ctp-ap-gain-large-objects, claim-centernettriplets-ccp-ap-gain-large-objects, claim-centernettriplets-gt-center-oracle-ap-565, claim-centernetpoints-regression-replaces-keypoint-grouping]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：在 CornerNet511-52 基线上只加一个中心点热图分支，用"正确框的中心区域应能检测到同类中心点"这一验证逻辑过滤角点配对出的框，AP 就从 37.6% 升到 39.9%（+2.3）；分解上小物体受益最大（AP_S +4.6），大物体几乎不动（AP_L 52.2→52.3）。笔记归因：小物体位置稍偏中心点就落到框外，中心验证能高效过滤小物体的"空框"误检；大物体容错率高，普通卷积也能蒙对。

两个限定：
1. 这是组件叠加消融的第一步，+2.3 是相对纯 CornerNet 基线的增量，不含后续 CTP/CCP 的贡献。
2. 中心区域随物体尺度自适应（小物体 n=3 / 大物体 n=5）是笔记 §方法的设计描述，消融未单独验证该取值，本卡不主张其独立有效性。

同名不同作提醒：本篇是 Duan 等的 Keypoint Triplets（角点+中心点三元组，中心点用于事后验证 corner 框），与 Zhou 等的 Objects as Points（中心点直接回归框，见 [claim-centernetpoints-regression-replaces-keypoint-grouping](claim-centernetpoints-regression-replaces-keypoint-grouping.md)）不是同一篇，两者对 "center" 的用法完全不同，引用时勿混。

## 待验证

- 已核对（2026-11-05）：37.6 / 39.9 / +2.3 / AP_S +4.6 / AP_L 52.2→52.3 与数据集（MS-COCO validation，Table 4 caption）均在 arXiv 1904.08189v3 原文命中，见 evidence。注意：论文对该分解的自报解释是"从概率角度看小物体的中心关键点更容易定位"（跨页句），与笔记的"小物体中心点易落到偏移框外、中心验证过滤空框"归因是两种不同表述，引用时勿混同。
- 用 Duankaiwen/CenterNet 官方实现复现 CRE-only 配置，验证 +2.3 与尺寸分解是否成立（同范围复现）。
- 统计被中心验证过滤掉的框中小物体"空框"占比，验证"过滤小物体误检"的归因（机制辨别）。

## 若成立 / 不成立意味着什么

成立：给角点系检测器加中心验证分支是低代价、对小目标误检抑制明显的组件，小目标密集场景选型可引用（进方案前需 verified）。
不成立：增益依赖笔记转述或与后续组件耦合，本卡收窄为定性主张或标记笔记数字存疑。

## 核查记录

- 2026-11-05（02 任务书 P1-B7a 整理班）：表达整理 + 原文核查，数字未改写。五条笔记 quote Grep 逐字命中；新增 3 条 arXiv 1904.08189v3 原文 evidence（§4.5 CRE 增量句、基线叠加方式句、Table 4 caption 数据集口径）；「待人工核对原文」falsifier 闭合（Table 4 第三行 AP_S 18.5→23.1、AP_L 52.2→52.3 均命中）；记录论文自报解释句与笔记归因是两种表述。id/status/stance/review_due/signoff 未动。
