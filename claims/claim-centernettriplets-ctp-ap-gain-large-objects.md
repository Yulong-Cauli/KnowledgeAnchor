---
id: claim-centernettriplets-ctp-ap-gain-large-objects
title: "CenterNet（Keypoint Triplets）论文声称：中心点分支用 Center Pooling 替换普通卷积再 +0.9 AP（39.9%→40.8%），增益主要来自大物体（AP_L 52.3%→53.6%）"
type: claim
status: asserted
scope: "笔记 §消融实验组件叠加消融的第二步（累计含 CRE）：在已有中心点热图分支的模型上，用 Center Pooling（水平方向与垂直方向分别取最大值再相加）替换中心点分支的普通卷积；+0.9 AP 为该步增量、论文自报；笔记未注明数据集与评测协议（待人工核对原文）；尚未独立验证"
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
falsifiers:
  - "复现中 CTP 步增量 ≤0，或明显低于 +0.9"
  - "尺寸分解不符：大物体 AP_L 无显著增益（提升明显小于 1.4），或整体增益主要来自非大物体尺寸档"
  - "原论文消融表数字与笔记所载 39.9→40.8 / 52.3→53.6 不一致（待人工核对原文）"
review_due: 2026-12-02
related: [claim-centernettriplets-cre-ap-gain-small-objects, claim-centernettriplets-ccp-ap-gain-large-objects, claim-centernettriplets-gt-center-oracle-ap-565, claim-cornernet-corner-pooling-directional-maxsum]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：CTP 针对的问题是物体几何中心往往没有显著视觉特征（笔记举例：甜甜圈中间是空的、人的中心在衣服上），普通卷积提不出中心特征；Center Pooling 让中心点从水平/垂直十字方向"借"最大值特征，使大物体中心变得可识别，表现为该步 AP_L 52.3→53.6（+1.4），而整卡增量 +0.9 AP 是在 CRE 之后的第二档。

两个限定：
1. 这是叠加在 CRE 之上的增量主张（第二步），不是 Center Pooling 从头独立训练的对比；+0.9 不能与 CRE 的 +2.3 直接相加后当作"池化总贡献"。
2. Center Pooling 与 CornerNet 的 Corner Pooling 同属方向性 max+sum 池化家族（见 [claim-cornernet-corner-pooling-directional-maxsum](claim-cornernet-corner-pooling-directional-maxsum.md)），区别在于作用位置（中心点分支）与方向组合（十字双向），本卡不主张两者的机制等同。

## 待验证

- 查原文消融表：核对 39.9→40.8 与 AP_L 52.3→53.6，确认 CTP 是否只在中心点分支生效、数据集与评测协议。
- 官方实现上做 CRE-only vs CRE+CTP 对照复现，验证增量与尺寸分解。
- 检验归因：把 Center Pooling 换成普通大感受野卷积（控制感受野），若大物体增益相当，则"方向性借特征"的解释不成立。

## 若成立 / 不成立意味着什么

成立：中心特征弱的大物体（纹理居中不明显）场景，中心点分支配方向性池化是有效设计，可与 CRE 卡（小物体收益）互补引用。
不成立：+0.9 依赖笔记转述或来自感受野/参数量变化而非方向性池化机制，设计主张收窄为"更大容量中心分支有少量收益"。
