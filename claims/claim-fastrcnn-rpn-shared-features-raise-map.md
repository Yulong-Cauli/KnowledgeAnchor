---
id: claim-fastrcnn-rpn-shared-features-raise-map
title: "Faster R-CNN 声称 RPN 与检测器共享卷积特征（4 步交替训练）比独立训练两个网络 mAP 更高（笔记载 58.7%→59.9%）"
type: claim
status: asserted
scope: "Faster R-CNN 消融实验（笔记 §消融实验-实验一：共享特征的重要性，对应论文 Table 2）；RPN 为 3×3 滑窗 + 3 尺度×3 长宽比共 k=9 anchors；笔记未标注数据集与评测划分；数字为笔记所载 mAP：不共享 58.7% → 共享 59.9%；尚未独立验证"
tags: [detection, faster-rcnn, rpn, shared-features, alternating-training]
note: "library/Classical_Detection/Fast R-CNN 和 Faster R-CNN .md#消融实验-1"
paper: "TPAMI 2017, Faster R-CNN（开源：https://github.com/ShaoqingRen/faster_rcnn）"
stance: watch
evidence:
  - source: "library/Classical_Detection/Fast R-CNN 和 Faster R-CNN .md"
    locator: "§Faster R-CNN / 问题"
    quote: "Fast R-CNN 虽然快，但依赖 CPU 运行的 Selective Search 生成候选框，这步耗时约 2秒/张，成为推理速度的瓶颈。"
    relation: supports
  - source: "library/Classical_Detection/Fast R-CNN 和 Faster R-CNN .md"
    locator: "§Faster R-CNN / 消融实验 / 实验一：共享特征的重要性"
    quote: "**不共享：** mAP 为 58.7%。"
    relation: supports
  - source: "library/Classical_Detection/Fast R-CNN 和 Faster R-CNN .md"
    locator: "§Faster R-CNN / 消融实验 / 实验一：共享特征的重要性"
    quote: "**共享：** mAP 提升至 **59.9%**。"
    relation: supports
  - source: "library/Classical_Detection/Fast R-CNN 和 Faster R-CNN .md"
    locator: "§Faster R-CNN / 消融实验 / 实验一：共享特征的重要性"
    quote: "共享特征不仅实现了更高效的计算，不用算两次卷积；而且提升了精度。这是因为检测器微调后的特征反过来也优化了 RPN 生成 Proposal 的质量。"
    relation: supports
falsifiers:
  - "同数据集同评测口径复现：共享卷积特征（4 步交替训练）的 mAP ≤ 不共享、独立训练两个网络的设置（笔记载 58.7% → 59.9%）"
  - "论文 Table 2 对应数字与笔记不符（共享与不共享的差距方向相反或不存在）"
review_due: 2026-12-02
related: [claim-fastrcnn-two-stage-beats-one-stage]
signoff: null
---

## 我的理解

笔记声称（尚未独立验证）：Faster R-CNN 用 RPN（3×3 滑窗 + anchors 回归）在共享卷积特征图上生成候选框，替代约 2 秒/张的 Selective Search；消融（Table 2）比较“RPN 提框 + 独立训练 Fast R-CNN”（不共享，58.7%）与“4 步交替训练共享卷积层”（共享，59.9%），结论是共享特征既省去两次卷积计算，又提升精度，原因是检测器微调后的特征反过来优化了 RPN 的 proposal 质量。

限定：笔记未标注该消融的数据集与评测划分，mAP 数字按笔记所载写入 scope；本卡只主张“共享 ≥ 不共享”这一消融结论，不把 2 秒/张当作可复现的精确耗时（笔记未注明测量硬件）。

## 待验证

- 查论文原文核对 Table 2 的数据集/划分与 58.7 / 59.9 两个数字。
- 用 ShaoqingRen/faster_rcnn 或现代复现（如 Detectron 系）跑一遍 unshared（RPN 提框冻结 + 独立检测器）与 4 步交替训练，对照 mAP。
- 核对 4 步交替训练的步骤描述与笔记是否一致（RPN 训练 → 用其 proposal 训练检测器 → 固定检测器微调 RPN → 再微调检测器）。

## 若成立 / 不成立意味着什么

成立：候选框生成与检测应共享主干特征并交替/联合训练，这是后续一揽子两阶段检测器（FPN、Mask R-CNN 等）的默认训练方式。
不成立：共享仅省算力不涨点甚至掉点，则 proposal 质量与检测性能的耦合假设存疑，方案里应把 proposal 网络当作可独立调优的模块（见 [两阶段对比卡](claim-fastrcnn-two-stage-beats-one-stage.md)）。
