---
id: claim-centernetpoints-inference-fps-gain-over-cornernet
title: "CenterNet 论文声称：同骨干下推理速度约为 CornerNet 两倍（Hourglass-104 7.8 vs 4.1 FPS），DLA-34 达 52 FPS"
type: claim
status: asserted
scope: "笔记 §对比分析表所载推理速度对比：CornerNet Hourglass-104 4.1 FPS vs CenterNet Hourglass-104 7.8 FPS、CenterNet DLA-34 52 FPS；笔记未注明测量硬件、输入分辨率、数据集版本及是否含翻转/多尺度增强；数字为笔记/论文自报，尚未独立验证"
tags: [centernet, latency, cornernet, fps]
note: library/Classical_Detection/CenterNet：Objects as Points.md#对比分析centernet-vs-cornernet
paper: "arXiv 2019, CenterNet: Objects as Points（开源：https://github.com/xingyizhou/CenterNet）"
stance: watch
evidence:
  - source: library/Classical_Detection/CenterNet：Objects as Points.md
    locator: "§对比分析：CenterNet vs. CornerNet / 表 · 检测速度行（CornerNet 列）"
    quote: "相对较慢 (e.g., Hourglass-104: 4.1 FPS)"
    relation: supports
  - source: library/Classical_Detection/CenterNet：Objects as Points.md
    locator: "§对比分析：CenterNet vs. CornerNet / 表 · 检测速度行（CenterNet 列）"
    quote: "实时高效 (e.g., Hourglass-104: 7.8 FPS, DLA-34: 52 FPS)"
    relation: supports
  - source: library/Classical_Detection/CenterNet：Objects as Points.md
    locator: "§对比分析：CenterNet vs. CornerNet / 表 · 后处理行"
    quote: "**无 NMS**，直接提取峰值，速度极快"
    relation: supports
  - source: library/Classical_Detection/CenterNet：Objects as Points.md
    locator: "§对比分析：CenterNet vs. CornerNet / A 移除配对步骤"
    quote: "这使得 CenterNet 的推理变成了纯粹的前向传播，无需复杂的组合逻辑。"
    relation: supports
falsifiers:
  - "同硬件同口径复现中 CenterNet Hourglass-104 FPS ≤ CornerNet 的 4.1 FPS，或 DLA-34 远低于 52 FPS"
  - "原论文 COCO 基准的 FPS 数字与笔记所载 4.1 / 7.8 / 52 不一致（笔记未注明测量口径，待人工核对原文）"
  - "提速主要来自骨干/分辨率差异而非移除配对与 NMS（控制变量后速度优势消失）"
review_due: 2026-12-02
related: [claim-centernetpoints-regression-replaces-keypoint-grouping, claim-centernetpoints-heatmap-peaks-replace-nms]
signoff: null
---

## 我的理解

笔记所载（论文声称，尚未独立验证）：CenterNet 移除了 CornerNet 的 embedding 配对与后处理清理，推理速度显著提升——同为 Hourglass-104 骨干时 4.1 FPS 提升到 7.8 FPS，DLA-34 骨干达 52 FPS。提速来源按笔记归因于：配对消失（纯前向传播）与峰值提取替代 NMS。

两个限定：
1. 该对比表只给了 FPS，没有同表给出两侧的精度数字；本卡只主张速度差，不主张"更快且更准"。
2. 笔记未注明这些 FPS 的测量硬件、输入分辨率、数据集与增强设置，数字间可能不同口径，引用时必须注明出处为笔记转述。

## 待验证

- 查原论文推理速度表：确认 4.1 / 7.8 / 52 FPS 的原始口径（数据集、硬件、输入尺寸、是否 flip test）。
- 用官方实现在同一 GPU 上复测 Hourglass-104 与 DLA-34 的 FPS，与 CornerNet 官方实现对齐口径对比。
- 拆分提速来源：关闭/打开 NMS 与配对模块分别计时，验证归因。

## 若成立 / 不成立意味着什么

成立：无配对 + 无 NMS 的单点检测范式在推理速度上有实质收益，边缘实时检测选型可引用（需先补口径核对，进方案前仍需 verified）。
不成立：速度差异依赖未注明的测量口径或骨干差异，本卡收窄为定性主张或改为记录笔记数字存疑。
