---
id: claim-centernetpoints-inference-fps-gain-over-cornernet
title: "CenterNet 论文声称：同骨干下推理速度约为 CornerNet 两倍（Hourglass-104 7.8 vs 4.1 FPS），DLA-34 达 52 FPS"
type: claim
status: asserted
scope: "笔记 §对比分析表所载推理速度对比（COCO）：CornerNet Hourglass-104 4.1 FPS vs CenterNet Hourglass-104 7.8 FPS（flip-test 口径）、CenterNet DLA-34 52 FPS（无翻转单尺度口径）；测量硬件 Titan Xp，训练输入 512×512、测试按 CornerNet 惯例保持原图分辨率；数字为笔记/论文自报，本库未复测推理速度；2026-11-05 已按 arXiv 1904.07850v2 原文补核（口径明细与「CornerNet 4.1 是否同机测量」残留见 falsifier 1）"
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
  - source: https://arxiv.org/pdf/1904.07850
    locator: "§6.1 速度/精度讨论（pdftotext 提取，抓取 2026-11-05）"
    quote: "Hourglass-104 achieves the best accuracy at a relatively good speed, with a 42.2% AP in 7.8 FPS. On this backbone, CenterNet outperforms CornerNet [30] (40.6% AP in 4.1 FPS) and ExtremeNet [61](40.3% AP in 3.1 FPS) in both speed and accuracy."
    relation: supports
  - source: https://arxiv.org/pdf/1904.07850
    locator: "§6.1 测量硬件说明（pdftotext 提取，抓取 2026-11-05）"
    quote: "The running time is tested on our local machine, with Intel Core i7-8086K CPU, Titan Xp GPU, Pytorch 0.4.1, CUDA 9.0, and CUDNN 7.1."
    relation: supports
  - source: https://arxiv.org/pdf/1904.07850
    locator: "Table 1 Hourglass-104 行（列序：AP/AP50/AP75 × N.A./F/MS，Time(ms)，FPS × N.A./F/MS；pdftotext -layout 提取，抓取 2026-11-05）"
    quote: "Hourglass-104 40.3 42.2 45.1 59.1 61.1 63.5 44.0 46.0 49.3 71 129 672 14 7.8 1.4"
    relation: supports
  - source: https://arxiv.org/pdf/1904.07850
    locator: "Table 1 DLA-34 行（列序同上；pdftotext -layout 提取，抓取 2026-11-05）"
    quote: "DLA-34 37.4 39.2 41.7 55.1 57.0 60.1 40.8 42.7 44.9 19 36 248 52 28 4"
    relation: supports
falsifiers:
  - "原文核查（已完成，未触发，2026-11-05）：原论文 COCO 基准的 FPS 数字与笔记所载 4.1 / 7.8 / 52 不一致——已实抓 arXiv v2，三数字均在原文命中（§6.1 正文与 Table 1），口径已补（7.8=flip-test、52=无翻转单尺度、Titan Xp），此分支闭合；残留子项：CornerNet 4.1 是否同机测量（斜体信息在纯文本中丢失）仍不能确认"
  - "同范围复现：同硬件同口径复现中 CenterNet Hourglass-104 FPS ≤ CornerNet 的 4.1 FPS，或 DLA-34 远低于 52 FPS"
  - "机制辨别：提速主要来自骨干/分辨率差异而非移除配对与 NMS（控制变量后速度优势消失）——注意论文自报的归因是「fewer output heads and a simpler box decoding scheme」（§6.1），与本卡笔记的归因（配对消失 + 峰值提取替代 NMS）一致但同属作者解释"
review_due: 2026-12-02
related: [claim-centernetpoints-regression-replaces-keypoint-grouping, claim-centernetpoints-heatmap-peaks-replace-nms]
signoff: null
---

## 主张

笔记所载（论文声称）：CenterNet 移除了 CornerNet 的 embedding 配对与后处理清理，推理速度显著提升——同为 Hourglass-104 骨干时 4.1 FPS 提升到 7.8 FPS，DLA-34 骨干达 52 FPS。提速来源按笔记归因于：配对消失（纯前向传播）与峰值提取替代 NMS。

两个限定：
1. 该对比表只给了 FPS，没有同表给出两侧的精度数字；本卡只主张速度差，不主张"更快且更准"。（2026-11-05 补核：论文 §6.1 正文实际同时主张了同骨干下"both speed and accuracy"——CornerNet 40.6% AP in 4.1 FPS vs CenterNet 42.2% AP in 7.8 FPS，但该精度主张不在本卡命题内。）
2. 测量口径已于 2026-11-05 按原文补核（明细见 falsifier 1）：7.8 FPS 是 Hourglass-104 flip-test 口径、52 FPS 是 DLA-34 无翻转单尺度口径，两侧口径不同但均出自同一论文自报体系；唯一残留是 CornerNet 4.1 FPS 是否同机复测无法从纯文本确认，引用时注明。

## 待验证

- 已核对（2026-11-05）：4.1 / 7.8 / 52 FPS 均在 arXiv v2 原文命中，硬件（Titan Xp）与 flip/单尺度口径已补，见 evidence。
- 用官方实现在同一 GPU 上复测 Hourglass-104 与 DLA-34 的 FPS，与 CornerNet 官方实现对齐口径对比（同范围复现）。
- 拆分提速来源：关闭/打开 NMS 与配对模块分别计时，验证"fewer output heads + simpler decoding"归因（机制辨别）。

## 成立/不成立的含义

成立：无配对 + 无 NMS 的单点检测范式在推理速度上有实质收益，边缘实时检测选型可引用（口径残留见 falsifier 1，进方案前仍需 verified）。
不成立：速度差异依赖未注明的测量口径或骨干差异，本卡收窄为定性主张或改为记录笔记数字存疑。

## 核查记录

- 2026-11-05（02 任务书 P1-B7a 整理班）：表达整理 + 原文核查，数字未改写。四条笔记 quote Grep 逐字命中；新增 4 条 arXiv 1904.07850v2 原文 evidence（§6.1 速度句、硬件句、Table 1 两行）；「待人工核对原文」falsifier 闭合并补口径（7.8=flip-test、52=无翻转单尺度、Titan Xp、512×512 训练输入）；遗留：CornerNet 4.1 FPS 同机与否无法从纯文本确认（斜体信息丢失），已写入 scope 与 falsifier 残留子项。id/status/stance/review_due/signoff 未动。
