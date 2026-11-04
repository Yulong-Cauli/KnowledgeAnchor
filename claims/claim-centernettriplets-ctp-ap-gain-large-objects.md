---
id: claim-centernettriplets-ctp-ap-gain-large-objects
title: "CenterNet（Keypoint Triplets）论文声称：中心点分支用 Center Pooling 替换普通卷积再 +0.9 AP（39.9%→40.8%），增益主要来自大物体（AP_L 52.3%→53.6%）"
type: claim
status: asserted
scope: "笔记 §消融实验组件叠加消融的第二步（累计含 CRE）：在已有中心点热图分支的模型上，用 Center Pooling（水平方向与垂直方向分别取最大值再相加）替换中心点分支的普通卷积；+0.9 AP 为该步增量（39.9→40.8）、论文自报；数据集已按原文补核：MS-COCO validation（arXiv 1904.08189v3 §4.5 Table 4 caption，2026-11-05 实抓命中），39.9→40.8 与 AP_L 52.2→53.6（正文口径）/ 52.3→53.6（Table 4 行读数）均在原文命中；尚未独立验证"
tags: [centernet, cornernet, keypoint-triplets, center-pooling, ablation, large-objects]
note: library/Classical_Detection/CenterNet：Keypoint Triplets.md#消融实验
paper: "ICCV 2019, CenterNet: Keypoint Triplets for Object Detection（开源：https://github.com/Duankaiwen/CenterNet）"
stance: watch
evidence:
  - source: library/Classical_Detection/CenterNet：Keypoint Triplets.md
    locator: "§消融实验 / 第二步：引入中心池化 (CTP) / 操作"
    quote: "- **操作：** 在中心点分支中，用 **Center Pooling** 模块替换普通卷积。"
    relation: supports
  - source: library/Classical_Detection/CenterNet：Keypoint Triplets.md
    locator: "§消融实验 / 第二步：引入中心池化 (CTP) / 结果"
    quote: "- **结果：** AP 从 39.9% 提升到 **40.8%** (+0.9%)。"
    relation: supports
  - source: library/Classical_Detection/CenterNet：Keypoint Triplets.md
    locator: "§消融实验 / 第二步：引入中心池化 (CTP) / 关键发现（大物体）"
    quote: "- **大物体 (Large Objects) 爆发：** $AP_L$ 显著提升了 1.4% (从 52.3% 到 53.6%)。"
    relation: supports
  - source: https://arxiv.org/pdf/1904.08189
    locator: "§4.5 Ablation Study（arXiv PDF v3，pdftotext 提取，抓取 2026-11-05）"
    quote: "center pooling improves the AP by 0.9% (from 39.9% to 40.8%). Notably, with the help of center pooling, we improve the AP for large objects by 1.4% (from 52.2% to 53.6%), which is much higher than the improvement using conventional convolutions (i.e., 1.4% vs. 0.1%)."
    relation: supports
  - source: https://arxiv.org/pdf/1904.08189
    locator: "Table 4 caption（数据集口径；pdftotext 提取，抓取 2026-11-05）"
    quote: "Table 4: Ablation study on the major components of CenterNet511-52 on the MS-COCO validation dataset. The CRE denotes central region exploration, the CTP denotes center pooling, and the CCP denotes cascade corner pooling."
    relation: supports
  - source: https://arxiv.org/pdf/1904.08189
    locator: "Table 4 第三行（+CRE，列序 AP/AP50/AP75/AP_S/AP_M/AP_L/AR1/AR10/AR100/AR_S/AR_M/AR_L；pdftotext -layout 提取，抓取 2026-11-05）"
    quote: "X 39.9 57.7 42.3 23.1 42.3 52.3 33.8 54.2 58.5 38.7 62.4 74.4"
    relation: supports
falsifiers:
  - "原文核查（已完成，未触发，2026-11-05）：原论文消融表数字与笔记所载 39.9→40.8 / 52.3→53.6 不一致——已实抓 arXiv 1904.08189v3，§4.5 prose 命中 39.9→40.8 与 +1.4（正文写 52.2→53.6，系相对基线行读数；Table 4 第三行 +CRE 的 AP_L 为 52.3，笔记取表格读数 52.3→53.6，两者均出自原文），此分支闭合"
  - "同范围复现：复现中 CTP 步增量 ≤0，或明显低于 +0.9"
  - "同范围复现（尺寸分解）：大物体 AP_L 无显著增益（提升明显小于 1.4），或整体增益主要来自非大物体尺寸档"
review_due: 2026-12-02
related: [claim-centernettriplets-cre-ap-gain-small-objects, claim-centernettriplets-ccp-ap-gain-large-objects, claim-centernettriplets-gt-center-oracle-ap-565, claim-cornernet-corner-pooling-directional-maxsum]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：CTP 针对的问题是物体几何中心往往没有显著视觉特征（笔记举例：甜甜圈中间是空的、人的中心在衣服上），普通卷积提不出中心特征；Center Pooling 让中心点从水平/垂直十字方向"借"最大值特征，使大物体中心变得可识别，表现为该步 AP_L 52.3→53.6（+1.4），而整卡增量 +0.9 AP 是在 CRE 之后的第二档。

两个限定：
1. 这是叠加在 CRE 之上的增量主张（第二步），不是 Center Pooling 从头独立训练的对比；+0.9 不能与 CRE 的 +2.3 直接相加后当作"池化总贡献"。（2026-11-05 补核：论文 §4.5 prose 对 AP_L 增量的写法是 52.2→53.6（相对基线行），Table 4 第三行 +CRE 的 AP_L 读数是 52.3；笔记取 52.3→53.6，+1.4 两处一致，引用时知道这两个起点读数皆出自原文即可。）
2. Center Pooling 与 CornerNet 的 Corner Pooling 同属方向性 max+sum 池化家族（见 [claim-cornernet-corner-pooling-directional-maxsum](claim-cornernet-corner-pooling-directional-maxsum.md)），区别在于作用位置（中心点分支）与方向组合（十字双向），本卡不主张两者的机制等同。

## 待验证

- 已核对（2026-11-05）：39.9→40.8、AP_L +1.4、数据集（MS-COCO validation，Table 4 caption）均在 arXiv 1904.08189v3 原文命中，见 evidence；52.2（正文）/52.3（表格第三行）两个起点读数的差别已记录。剩余：确认 CTP 是否只在中心点分支生效（正文按模块图描述，未逐字核对）。
- 官方实现上做 CRE-only vs CRE+CTP 对照复现，验证增量与尺寸分解（同范围复现）。
- 检验归因：把 Center Pooling 换成普通大感受野卷积（控制感受野），若大物体增益相当，则"方向性借特征"的解释不成立（机制辨别）。

## 若成立 / 不成立意味着什么

成立：中心特征弱的大物体（纹理居中不明显）场景，中心点分支配方向性池化是有效设计，可与 CRE 卡（小物体收益）互补引用。
不成立：+0.9 依赖笔记转述或来自感受野/参数量变化而非方向性池化机制，设计主张收窄为"更大容量中心分支有少量收益"。

## 核查记录

- 2026-11-05（02 任务书 P1-B7a 整理班）：表达整理 + 原文核查，数字未改写。三条笔记 quote Grep 逐字命中；新增 3 条 arXiv 1904.08189v3 原文 evidence（§4.5 CTP 增量句、Table 4 caption、Table 4 第三行 AP_L 52.3 读数锚点）；「待人工核对原文」falsifier 闭合；记录正文 52.2 与表格 52.3 两个起点读数差别（+1.4 一致）。id/status/stance/review_due/signoff 未动。
