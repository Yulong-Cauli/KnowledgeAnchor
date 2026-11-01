---
id: claim-fastrcnn-two-stage-beats-one-stage
title: "Faster R-CNN 声称两阶段（RPN 提议 + Fast R-CNN 检测）比移除提议步骤的单阶段密集预测（模拟 OverFeat）mAP 高 4.8 个百分点（笔记载 58.7% vs 53.9%）"
type: claim
status: asserted
scope: "Faster R-CNN 消融实验（笔记 §消融实验-实验五，对应论文 Table 10）；Two-Stage = RPN 提议 + Fast R-CNN 检测，One-Stage = 移除 Proposal 步骤、在特征图上密集滑动窗口直接分类回归（模拟 OverFeat）；笔记未标注数据集与评测划分；数字为笔记所载 mAP：两阶段 58.7% vs 单阶段 53.9%；尚未独立验证"
tags: [detection, faster-rcnn, rpn, two-stage, one-stage, cascade]
note: "library/Classical_Detection/Fast R-CNN 和 Faster R-CNN .md#消融实验-1"
paper: "TPAMI 2017, Faster R-CNN（开源：https://github.com/ShaoqingRen/faster_rcnn）"
stance: watch
evidence:
  - source: "library/Classical_Detection/Fast R-CNN 和 Faster R-CNN .md"
    locator: "§Faster R-CNN / 消融实验 / 实验五：单阶段检测 vs 两阶段检测"
    quote: "移除了 Proposal 步骤，直接在特征图上使用密集的滑动窗口进行分类和回归。"
    relation: supports
  - source: "library/Classical_Detection/Fast R-CNN 和 Faster R-CNN .md"
    locator: "§Faster R-CNN / 消融实验 / 实验五：单阶段检测 vs 两阶段检测"
    quote: "**Two-Stage:** mAP 58.7%。"
    relation: supports
  - source: "library/Classical_Detection/Fast R-CNN 和 Faster R-CNN .md"
    locator: "§Faster R-CNN / 消融实验 / 实验五：单阶段检测 vs 两阶段检测"
    quote: "**One-Stage:** mAP 53.9%。"
    relation: supports
  - source: "library/Classical_Detection/Fast R-CNN 和 Faster R-CNN .md"
    locator: "§Faster R-CNN / 消融实验 / 实验五：单阶段检测 vs 两阶段检测"
    quote: "两阶段方法比单阶段高出 **4.8%**。"
    relation: supports
falsifiers:
  - "同设置复现中，移除 proposal 步骤的单阶段密集预测 mAP ≥ 两阶段 Faster R-CNN（笔记载 53.9% vs 58.7%）"
  - "复现中两阶段优势显著小于 4.8 个百分点，或论文 Table 10 数字与笔记不符"
review_due: 2026-12-02
related: [claim-fastrcnn-rpn-shared-features-raise-map]
signoff: null
---

## 我的理解

笔记声称（尚未独立验证）：Faster R-CNN 的消融（Table 10）为回应“是否一定要先生成框再检测”（OverFeat 类单阶段做法）的质疑，移除 RPN 提议步骤、在特征图上用密集滑动窗口直接分类与回归来模拟单阶段方案；结果两阶段（RPN 提议 + Fast R-CNN）58.7% 对单阶段 53.9%，高出 4.8 个百分点。笔记将其归因于“区域建议起级联过滤作用”：proposal 先剔除大量简单背景负样本，让检测器专注更难的目标。

限定：笔记未标注该消融的数据集与评测划分，mAP 数字按笔记所载写入 scope；本卡只主张这一组同 backbone/同设置下的消融对比，不主张“两阶段在任何时代、任何数据集上都优于单阶段”（后续一阶段方法的发展不在本卡范围内）。

## 待验证

- 查论文原文核对 Table 10 的数据集/划分与 58.7 / 53.9 / 4.8 三个数字。
- 在现代复现框架中做同主干对比：完整 RPN + 检测头 vs 去掉 RPN 的密集预测头，对照 mAP。
- 检查单阶段模拟设置是否公平（特征容量、训练轮数、正负样本配比是否与两阶段对齐）。

## 若成立 / 不成立意味着什么

成立：在同等特征与训练条件下，“先提议再检测”的级联结构本身（而非算力）带来精度收益，评估单阶段方案时需控制这一混杂因素（见 [RPN 共享特征卡](claim-fastrcnn-rpn-shared-features-raise-map.md)）。
不成立：精度差距主要来自训练配置差异而非提议步骤本身，则“级联过滤”归因存疑，两阶段选型理由应回到计算效率而非精度。
