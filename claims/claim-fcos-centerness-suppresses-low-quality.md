---
id: claim-fcos-centerness-suppresses-low-quality
title: "FCOS 声称 center-ness 分支以“分类置信度 × center-ness”打分，使低质量边缘框在 NMS 中被过滤"
type: claim
status: asserted
scope: "2D 目标检测（FCOS，ICCV 2019）；center-ness 取值 0~1（到四边距离的 sqrt(min/max) 比值连乘），推理时与分类置信度相乘后参与 NMS；笔记未载 AP 数字，只主张机制层面（打分方式 + NMS 过滤路径），不主张具体涨点幅度；2026-11-05 实抓 arXiv 1904.01355v5 补核：打分相乘句、NMS 过滤句、sqrt 公式说明均命中，且原文 Table 6（RPN 设置）有 w/o center-ness 消融（AR100 48.0 vs 52.8），Table 3 Improvements 有 '+ ctr. on reg.'（37.1→37.4，挂载位置归另一卡）；机制描述为论文陈述，复现侧尚未独立验证"
tags: [fcos, anchor-free, detection, centerness, nms]
note: library/Classical_Detection/FCOS.md#center-ness-分支
paper: "ICCV 2019, FCOS: Fully Convolutional One-Stage Object Detection（开源：https://github.com/tianzhi0549/FCOS）"
stance: watch
evidence:
  - source: library/Classical_Detection/FCOS.md
    locator: "§方法 / Center-ness 分支"
    quote: "**痛点**：由于所有“框内点”都被视为正样本，**远离中心的边缘位置**产生的预测框质量通常很差，拉低了检测精度。"
    relation: supports
  - source: library/Classical_Detection/FCOS.md
    locator: "§方法 / Center-ness 分支（推理公式）"
    quote: '\text{最终得分} = \text{分类置信度} \times \text{Center-ness}'
    relation: supports
  - source: library/Classical_Detection/FCOS.md
    locator: "§方法 / Center-ness 分支"
    quote: "这使得低质量的边缘框得分变低，从而在 NMS（非极大值抑制）过程中被过滤掉。"
    relation: supports
  - source: library/Classical_Detection/FCOS.md
    locator: "§方法 / Loss Function（中心度损失）"
    quote: "- **作用**：迫使网络学习区分“高质量中心点”和“低质量边缘点”。"
    relation: supports
  - source: https://arxiv.org/pdf/1904.01355
    locator: "§3.2 Center-ness（推理打分句；arXiv PDF v5，pdftotext 提取，抓取 2026-11-05）"
    quote: "When testing, the final score (used for ranking the detected bounding boxes) is computed by multiplying the predicted center-ness with the corresponding classification score."
    relation: supports
  - source: https://arxiv.org/pdf/1904.01355
    locator: "§3.2 Center-ness（NMS 过滤句；pdftotext 提取，跨行连字符已还原，抓取 2026-11-05）"
    quote: "As a result, with high probability, these low-quality bounding boxes might be filtered out by the final non-maximum suppression (NMS) process, improving the detection performance remarkably."
    relation: supports
  - source: https://arxiv.org/pdf/1904.01355
    locator: "§3.2 Center-ness（sqrt 公式说明；pdftotext 提取，跨行连字符已还原，抓取 2026-11-05）"
    quote: "We employ sqrt here to slow down the decay of the center-ness. The center-ness ranges from 0 to 1 and is thus trained with binary cross entropy (BCE) loss."
    relation: supports
  - source: https://arxiv.org/pdf/1904.01355
    locator: "§3.2 Center-ness（与中心采样替代方案的对比讨论；pdftotext 提取，抓取 2026-11-05）"
    quote: "An alternative of the center-ness is to make use of only the central portion of ground-truth bounding box as positive samples with the price of one extra hyper-parameter, as shown in works [12, 33]. After our submission, it has been shown in [1] that the combination of both methods can achieve a much better performance."
    relation: supports
  - source: https://arxiv.org/pdf/1904.01355
    locator: "Table 6 FCOS w/ GN w/o center-ness 行（RPN 设置，列序 #samples/AR100/AR1k；pdftotext 提取，抓取 2026-11-05）"
    quote: "∼66K 48.0 59.3"
    relation: supports
  - source: https://arxiv.org/pdf/1904.01355
    locator: "Table 6 FCOS w/ GN 行（RPN 设置，同列序；pdftotext 提取，抓取 2026-11-05）"
    quote: "FCOS w/ GN ∼66K 52.8 60.3"
    relation: supports
falsifiers:
  - "原文核查（已完成，未触发，2026-11-05）：打分相乘、NMS 过滤路径与原文不符——已实抓 arXiv 1904.01355v5，打分句与过滤句逐字命中，此分支闭合"
  - "同范围复现：去掉 center-ness 分支（最终得分只用分类置信度）后 AP 不下降甚至上升，说明该分支对精度并非必要——论文自报锚点为 RPN 设置的 AR100 48.0（无）vs 52.8（有，Table 6）；AP 口径的有/无消融论文未报，复现需自行补"
  - "机制辨别：分类分数乘 center-ness 前后 NMS 保留框集合完全相同（排序不变），说明'经 NMS 过滤低质量框'的机制描述不成立"
review_due: 2026-12-02
related: [claim-fcos-centerness-regression-branch-ap-gain, claim-fcos-fpn-scale-range-assignment]
signoff: null
---

## 我的理解

笔记声称（尚未独立验证）：由于框内点全为正样本（见 [anchor-free formulation 卡](claim-fcos-anchorfree-pixelwise-formulation.md)），远离中心的边缘位置产生低质量预测框；FCOS 增加 center-ness 分支预测“位置离几何中心的程度”（0~1，sqrt(min/max) 公式，BCE 训练），推理时最终得分 = 分类置信度 × center-ness，使低质量边缘框得分变低、在 NMS 中被过滤，从而缓解精度损失。

限定：笔记未载 AP 数字与”有无 center-ness”消融表，故本卡只主张机制路径（低质量框 → 得分压低 → NMS 过滤），不主张任何具体涨点幅度。2026-11-05 原文补核：打分相乘与 NMS 过滤两句均逐字命中；论文 Table 6 在 RPN 设置下有 w/o center-ness 消融（AR100 48.0 vs 52.8，AR 口径非 AP）；§3.2 还明确把”只用中心部分当正样本”列为 center-ness 的替代方案，并自报两者结合（投稿后）效果更好——即 center-ness 与中心采样是互补关系，不是二选一。

## 待验证

- 已核对（2026-11-05）：打分相乘句、NMS 过滤句、sqrt/BCE 说明句均与 arXiv v5 原文一致，见 evidence；AP 口径的有/无 center-ness 消融论文未报。
- 复现去掉 center-ness 分支的消融（得分只用分类置信度），对照 AP 变化（同范围复现；RPN 侧已有论文锚点 AR100 48.0/52.8）。
- 对比得分乘法前后 NMS 保留框集合，验证过滤路径确实经由 NMS 排序变化实现（机制辨别）。
- center-ness 目标值公式（根号、min/max 比值连乘）笔记与原文 Eq. (3) 一致（本轮按 prose 句核对 sqrt/0~1/BCE，公式符号未逐字比对——PDF 公式提取有伪影，如需逐字核对按原 PDF 目检）。

## 若成立 / 不成立意味着什么

成立：逐像素“框内即正样本”引入的低质量框问题可用一个轻量 center-ness 分支缓解，这是该设计被后续检测器沿用的核心机制。
不成立：center-ness 非必要或过滤路径不成立，则引用时只能把它当辅助头，不能当关键设计。

## 核查记录

- 2026-11-05（02 任务书 P1-B7a 整理班）：表达整理 + 论文侧核查，数字未改写。四条笔记 quote Grep 逐字命中；新增 5 条 arXiv 1904.01355v5 原文 evidence（打分句、NMS 过滤句、sqrt/BCE 句、替代方案讨论句、Table 6 两行）；falsifier 1 闭合；falsifier 2 补 RPN AR100 锚点（48.0/52.8，AR 口径）；补 center-ness 与中心采样互补的原文线索。id/status/stance/review_due/signoff 未动。
