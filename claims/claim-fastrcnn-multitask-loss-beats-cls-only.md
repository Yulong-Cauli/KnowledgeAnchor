---
id: claim-fastrcnn-multitask-loss-beats-cls-only
title: "Fast R-CNN 声称单一多任务损失（分类 + 回归联合）在 S、M、L 三个模型上的 mAP 均高于仅用分类损失训练"
type: claim
status: asserted
scope: "Fast R-CNN 消融实验（笔记 §消融实验-实验一，对应论文 Table 6）；S、M、L 三个模型；笔记未标注 backbone 具体型号、数据集与评测划分，且该消融仅载结论、未载具体 mAP 数字；尚未独立验证"
tags: [detection, fast-rcnn, multi-task-loss, smooth-l1, joint-training]
note: "library/Classical_Detection/Fast R-CNN 和 Faster R-CNN .md#消融实验"
paper: "ICCV 2015, Fast R-CNN"
stance: watch
evidence:
  - source: "library/Classical_Detection/Fast R-CNN 和 Faster R-CNN .md"
    locator: "§Fast R-CNN / 损失函数"
    quote: "L(p, u, t^u, v) = L_{cls}(p, u) + \lambda [u \ge 1] L_{loc}(t^u, v)"
    relation: supports
  - source: "library/Classical_Detection/Fast R-CNN 和 Faster R-CNN .md"
    locator: "§Fast R-CNN / 损失函数"
    quote: "多任务损失函数使得 Fast R-CNN 能够通过一次反向传播，同时更新分类器和边界框回归器的参数，实现了真正的**单阶段训练 (Single-stage training)**。"
    relation: supports
  - source: "library/Classical_Detection/Fast R-CNN 和 Faster R-CNN .md"
    locator: "§Fast R-CNN / 消融实验 / 实验一：多任务训练真的有效吗？"
    quote: "对于 S, M, L 三个模型，**多任务训练**都比**仅训练分类要好。"
    relation: supports
falsifiers:
  - "〔原文核查 / 同范围复现（主张侧+对照侧）〕论文 Table 6（或同设置复现）中任一 S/M/L 模型的多任务训练 mAP ≤ 仅分类损失训练"
  - "〔机制辨别（不构成本卡原命题反证，仅削弱「联合」的必要性解读）〕同设置复现中 stage-wise（先练分类、固定参数后再练回归）系统性优于多任务联合训练——这推翻的是「联合训练本身带来收益」的强解读，不推翻「多任务 > 仅分类」的消融结论"
review_due: 2026-12-02
related: [claim-fastrcnn-roipooling-arbitrary-to-fixed-feature]
signoff: null
---

## 我的理解

笔记声称（尚未独立验证）：Fast R-CNN 用单一多任务损失 L = L_cls + λ·[u≥1]·L_loc（分类为 log loss，回归为 smooth L1，背景 RoI 不计回归项），一次反向传播同时更新分类器与边界框回归器，实现单阶段训练；消融（Table 6）在 S、M、L 三个模型上比较了仅分类损失、多任务联合、stage-wise 三种设置，结论是多任务训练在三个模型上都优于仅分类损失。

限定：笔记此消融只给结论、未给具体 mAP 数字，也未标注数据集与 S/M/L 对应的 backbone 型号，故本卡只主张方向性结论（多任务 > 仅分类，三模型一致），不主张任何涨点幅度。

## 待验证

- 查论文 Table 6 原表，核对 S/M/L 三组数字并补入本卡（含数据集与划分）。
- 同设置复现三种训练方式（cls-only / multi-task / stage-wise），比较 mAP。
- 核对 smooth L1 定义（|x|<1 时 0.5x²，否则 |x|-0.5）与“L2 易梯度爆炸、L1 尖角难收敛”的动机描述。

## 若成立 / 不成立意味着什么

成立：分类与框回归可共享表征联合优化，无需分阶段训练或独立 SVM 分类器，这是检测头“一个损失、两个分支”设计的依据。
不成立：联合训练仅在某类 backbone 或某些数据集上占优，则选型时需按模型规模分开评估；笔记结论需按论文 Table 6 修订。

## 核查记录

- 2026-11-05（P1-B7b 零散组）：本卡 3 条 library 笔记引句经 grep -F 逐字验证全部命中（`library/Classical_Detection/Fast R-CNN 和 Faster R-CNN .md`：损失函数公式、单阶段训练句、消融实验一 Table 6 结论句）；论文原文（Table 6）本轮未实抓，S/M/L 数字仍按笔记转述口径（笔记仅载结论、未载具体数字，卡内已声明）。内容审阅未发现命题、scope 或推断归属问题；falsifiers 补分层标注，原第 2 条 stage-wise 对照显式标为机制辨别性质（stage-wise 优于多任务并不构成「多任务 > 仅分类」的反证），未删内容、论文数字未改写。
