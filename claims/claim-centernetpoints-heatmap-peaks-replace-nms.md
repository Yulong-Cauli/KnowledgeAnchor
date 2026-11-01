---
id: claim-centernetpoints-heatmap-peaks-replace-nms
title: "CenterNet 论文声称：热力图 3×3 Max Pooling 峰值提取本身即起非极大值抑制作用，推理无需 NMS"
type: claim
status: asserted
scope: "2D 目标检测（Objects as Points，arXiv 2019）；笔记方法/推理设定：输出步长 R=4，类别通道热力图做 3×3 max pooling 取峰值、每图取前 100 个峰值解码；热力图通道数为类别数（笔记举例 COCO 80 类）；成立前提：同类物体中心点在输出特征图上不落入同一格子；设计主张，尚未独立验证"
tags: [centernet, heatmap, no-nms, anchor-free, detection]
note: library/Classical_Detection/CenterNet：Objects as Points.md#inference-从点到框
paper: "arXiv 2019, CenterNet: Objects as Points（开源：https://github.com/xingyizhou/CenterNet）"
stance: watch
evidence:
  - source: library/Classical_Detection/CenterNet：Objects as Points.md
    locator: "§方法 / 优势"
    quote: "2. **无需 NMS**：每个目标只由一个中心点表示，通过热力图峰值提取即可自然分离目标，推理过程不需要非极大值抑制（NMS）。"
    relation: supports
  - source: library/Classical_Detection/CenterNet：Objects as Points.md
    locator: "§Inference (从点到框)"
    quote: "3. **无需 NMS**：因为热力图峰值提取已经保证了局部唯一性。"
    relation: supports
  - source: library/Classical_Detection/CenterNet：Objects as Points.md
    locator: "§对比分析：CenterNet vs. CornerNet / C 后处理的极简主义"
    quote: "通过在热力图上执行简单的 **$3 \\times 3$ Max Pooling** 来提取峰值，这一步本身就起到了非极大值抑制的作用。"
    relation: supports
falsifiers:
  - "官方实现（xingyizhou/CenterNet）推理流程实际包含 NMS/Soft-NMS 后处理，或峰值提取后仍需 NMS 才能消除重叠目标的重复框"
  - "复现中仅靠 3×3 max pooling 峰值提取的精度显著低于加 NMS 的同模型版本（说明峰值提取不能等效替代 NMS）"
  - "同帧同类两物体中心点落入同一特征图格子的漏检率显著高于笔记所称 <0.1%（密集/小目标场景尤甚）"
review_due: 2026-12-02
related: [claim-centernetpoints-regression-replaces-keypoint-grouping, claim-centernetpoints-center-collision-rare-on-coco]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：CenterNet 将每个物体建模为单一中心点，推理时对每类热力图做 3×3 max pooling，取大于等于 8 邻域的局部峰值并解码前 100 个点为框；由于峰值提取已保证局部唯一性，该步骤本身起到 NMS 的作用，推理流程不需要非极大值抑制。

注意成立前提：笔记同段指出"只要两个物体的中心点不重合，它们就能被区分开"。中心点重合（center collision）的频率是另一张卡 [claim-centernetpoints-center-collision-rare-on-coco](claim-centernetpoints-center-collision-rare-on-coco.md) 的主张，本卡不覆盖。

## 待验证

- 读官方仓库 xingyizhou/CenterNet 的推理代码（`det.py` / `centernet.py`）：确认 `_nms` 只是 3×3 max pooling 式的峰值筛选，无独立 IoU-NMS 后处理。
- 在密集重叠场景（如 COCO 拥挤类目或 CrowdHuman）复现：比较峰值提取版与加 IoU-NMS 版的 AP/重复框数。
- 统计同帧同类物体中心点映射到同一输出格子（stride=4）的帧内比例，对照笔记 <0.1% 的说法。

## 若成立 / 不成立意味着什么

成立：无 NMS 后处理是 CenterNet 端到端、低延迟检测的关键设计，可作为低延迟检测选型的引用起点（进方案前仍需 verified）。
不成立：官方实现或复现中仍依赖 NMS，说明"无 NMS"是表述简化而非事实，本卡改为记录笔记与实现不符。
