---
id: claim-r4det-pdf-depth-supervision-monotonic-gain
title: "R4Det 声称：TJ4DRadSet 上 PDF 三重深度监督每引入一项 BEV mAP 单调增长（45.15 → 46.08 → 46.86）"
type: claim
status: asserted
scope: "TJ4DRadSet；4D 雷达-相机 3D 检测，R4Det 管线内 PDF（全景深度融合）模块的深度监督消融（论文 Table 5，据库内笔记 §2.1 转录）；基线为仅 L_prob + L_abs（BEV mAP 45.15），依次叠加 L_dense（46.08）与 L_relative（46.86）；指标为 BEV mAP；R4Det 自报数字，尚未独立验证；笔记未记录 VoD 上的对应消融"
tags: [4d-radar, radar-camera-fusion, r4det, depth-fusion, depth-supervision, tj4dradset, ablation]
note: library/Classical_Detection/R4Det.md#1-三重监督的实验支撑
paper: "CVPR 2026 · R4Det: 4D Radar-Camera Fusion for High-Performance 3D Object Detection（笔记标注未开源，未记录 arXiv 号）"
stance: watch
evidence:
  - source: library/Classical_Detection/R4Det.md
    locator: "§2.1【三重监督的实验支撑】/ Table 5"
    quote: "论文通过 Table 5 的消融实验验证了三重监督设计的正交性和必要性。每引入一种监督机制，BEV mAP 均呈现严格的单调增长："
    relation: supports
  - source: library/Classical_Detection/R4Det.md
    locator: "§2.1【三重监督的实验支撑】/ Table 5"
    quote: "BEV mAP 提升至 46.08%（增幅 +0.93%）"
    relation: supports
  - source: library/Classical_Detection/R4Det.md
    locator: "§2.1【三重监督的实验支撑】/ Table 5"
    quote: "进一步提升至 46.86%（增幅 +0.78%）"
    relation: supports
falsifiers:
  - "复现 Table 5 消融：叠加 L_dense 或 L_relative 后 BEV mAP 不升反降，或三项监督同时存在时低于 46.86（单调增长被打破）"
  - "复现增幅与自报显著不符（如 +0.93 / +0.78 复现为零或负）"
  - "发现 45.15 基线实际还含其他监督项或评测口径不同，导致三档数字不可比"
review_due: 2026-12-02
related: [claim-r4det-tj4dradset-ablation-5407-bev-map]
signoff: null
---

## 我的理解

论文声称（据笔记 §2.1 转述，尚未独立验证）：PDF 模块的深度监督从「仅概率监督 + 雷达稀疏绝对深度」（$\mathcal{L}_{prob} + \mathcal{L}_{abs}$，BEV mAP 45.15）出发，每引入一项监督 BEV mAP 严格单调增长——加基础模型密集伪标签监督 $\mathcal{L}_{dense}$（笔记记为「视觉基础模型（如 Metric3D）」，作用在全图像素 $\mathcal{M}_{all}$）到 46.08（+0.93），再加结构化排序监督 $\mathcal{L}_{relative}$ 到 46.86（+0.78）。

一致性交叉核对：笔记 §3.1 系统消融表中 Baseline 45.15、+PDF 46.86，与 Table 5 的首尾两档一致（PDF 全量 = prob+abs+dense+relative），两表数字自洽。

必须记住的限定：这是 R4Det 自报的消融数字；「每引入一项单调增长」是**逐级叠加顺序下的观察**，改变叠加顺序是否仍单调，笔记未记录（Table 5 是否覆盖其他叠加顺序需回原文核对）。监督源方面，笔记 §2.1 只把密集伪标签记为「视觉基础模型（如 Metric3D）生成的密集伪真值深度」，实际实验所用基础模型笔记未明确记录，收益可能与该基础模型的深度质量绑定。

## 待验证

- 回 R4Det 原文核对 Table 5：确认三行数字与叠加顺序，以及是否只有这一种叠加顺序。
- 复现：在 TJ4DRadSet 上按同基线训练，逐项加入 $\mathcal{L}_{dense}$、$\mathcal{L}_{relative}$，看 BEV mAP 是否按 45.15 → 46.08 → 46.86 排序。
- 换用其他密集深度伪标签源（非 Metric3D）看 $\mathcal{L}_{dense}$ 增益是否仍在。

## 若成立 / 不成立意味着什么

成立：雷达-相机融合中「稀疏雷达锚定 + 基础模型密集伪标签 + 相对排序」三重深度监督是正交且可逐项叠加的设计点，自研深度融合头可按项选配。
不成立：增益来自特定叠加顺序、特定基础模型伪标签或评测口径，三重监督设计需重新拆解归因。
