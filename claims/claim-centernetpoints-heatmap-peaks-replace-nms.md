---
id: claim-centernetpoints-heatmap-peaks-replace-nms
title: "CenterNet 论文声称：热力图 3×3 Max Pooling 峰值提取本身即起非极大值抑制作用，推理无需 NMS"
type: claim
status: asserted
scope: "2D 目标检测（Objects as Points，arXiv 1904.07850v2）；笔记方法/推理设定：输出步长 R=4，类别通道热力图做 3×3 max pooling 取峰值、每图取前 100 个峰值解码；热力图通道数为类别数（笔记举例 COCO 80 类）；成立前提：同类物体中心点在输出特征图上不落入同一格子（碰撞率 <0.1% 见 related 卡）；2026-11-05 已补核论文 §6.1.1 NMS 消融与官方 decode.py 解码路径（见 falsifier 1/2）；设计主张与「精度不受损」部分属论文/代码自报，本库未复跑同口径精度对比"
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
  - source: https://arxiv.org/pdf/1904.07850
    locator: "§6.1.1 NMS（pdftotext 提取，抓取 2026-11-05）"
    quote: "To verify that IoU based NMS is not needed for CenterNet, we ran it as a post-processing step on our predictions. For DLA-34 (flip-test), the AP improves from 39.2% to 39.7%. For Hourglass-104, the AP stays at 42.2%."
    relation: supports
  - source: https://arxiv.org/pdf/1904.07850
    locator: "§1 Introduction（pdftotext 提取，抓取 2026-11-05）"
    quote: "The peak keypoint extraction serves as a sufficient NMS alternative and can be implemented efficiently on device using a 3 × 3 max pooling operation."
    relation: supports
  - source: https://raw.githubusercontent.com/xingyizhou/CenterNet/master/src/lib/models/decode.py
    locator: "src/lib/models/decode.py L9（_nms 函数定义，抓取 2026-11-05）"
    quote: "def _nms(heat, kernel=3):"
    relation: supports
  - source: https://raw.githubusercontent.com/xingyizhou/CenterNet/master/src/lib/models/decode.py
    locator: "src/lib/models/decode.py L14（_nms 保留局部极大值的判据，抓取 2026-11-05）"
    quote: "keep = (hmax == heat).float()"
    relation: supports
falsifiers:
  - "原文/代码核查（部分完成，未触发，2026-11-05）：论文 §6.1.1 的 NMS 消融与官方 decode.py _nms 已实抓核对命中（3×3 max pooling 峰值保留、无 IoU-NMS）；若后续发现官方仓库其他文件（detectors/、post_process 等）存在额外 IoU/Soft-NMS 步骤，此分支重启"
  - "同范围复现：复现中仅靠 3×3 max pooling 峰值提取的精度显著低于加 IoU-NMS 的同模型版本——论文自报锚点为 DLA-34 flip-test 39.2→39.7（+0.5）、Hourglass-104 42.2 持平；若复现差异远大于此量级，说明峰值提取不能等效替代 NMS"
  - "同帧同类两物体中心点落入同一特征图格子的漏检率显著高于 <0.1%（密集/小目标场景尤甚；论文口径 614 对 / 860001 物体，COCO train2017）"
review_due: 2026-12-02
related: [claim-centernetpoints-regression-replaces-keypoint-grouping, claim-centernetpoints-coco-train2017-same-class-center-collision-rare]
signoff: null
---

## 主张

论文声称：CenterNet 将每个物体建模为单一中心点，推理时对每类热力图做 3×3 max pooling，取大于等于 8 邻域的局部峰值并解码前 100 个点为框；由于峰值提取已保证局部唯一性，该步骤本身起到 NMS 的作用，推理流程不需要非极大值抑制。

成立前提：笔记同段指出"只要两个物体的中心点不重合，它们就能被区分开"。中心点重合（center collision）的频率是另一张卡 [claim-centernetpoints-coco-train2017-same-class-center-collision-rare](claim-centernetpoints-coco-train2017-same-class-center-collision-rare.md) 的主张，本卡不覆盖。

2026-11-05 补核：论文自报的 NMS 后处理消融（39.2→39.7 / 42.2 持平）与官方 decode.py 的 `_nms` 实现均核对命中（见 falsifier 1/2）——"无 NMS 精度基本不受损"在论文层有实验支撑，但仍属作者自报；代码侧本次仅核查 decode.py 与 ctdet 解码路径，全仓库 NMS 存在性完整排查未做（falsifier 1 保留）。

## 待验证

- 已核对（2026-11-05，部分完成）：decode.py `_nms` 确认为 3×3 max pooling 式峰值筛选、无独立 IoU-NMS；剩余：对 detectors/ 前后处理全链路做一次 NMS 存在性完整排查。
- 在密集重叠场景（如 COCO 拥挤类目或 CrowdHuman）复现：比较峰值提取版与加 IoU-NMS 版的 AP/重复框数，对照论文自报锚点（39.2→39.7 / 42.2 持平）。
- 同帧同类中心点碰撞的标注侧统计已由 [claim-centernetpoints-coco-train2017-same-class-center-collision-rare](claim-centernetpoints-coco-train2017-same-class-center-collision-rare.md) 完成（本库复算 0.0823%，verified）；剩余：用检测输出统计碰撞导致的实际漏检率，密集/小目标场景优先（对应 falsifier 3）。

## 成立/不成立的含义

成立：无 NMS 后处理是 CenterNet 端到端、低延迟检测的关键设计，可作为低延迟检测选型的引用起点（进方案前仍需 verified）。
不成立：官方实现或复现中仍依赖 NMS，说明"无 NMS"是表述简化而非事实，本卡改为记录笔记与实现不符。

## 核查记录

- 2026-11-05（02 任务书 P1-B7a 整理班）：表达整理 + 原文/代码核查，数字未改写。三条笔记 quote Grep 逐字命中；新增 2 条 arXiv 1904.07850v2 原文 evidence（§6.1.1 NMS 消融句、§1 峰值提取句）与 2 条官方 decode.py 代码 evidence（L9 函数签名、L14 保留判据）；falsifier 1 改写为部分闭合的原文/代码核查分支（注明只查了 decode.py 与 ctdet 解码路径）；falsifier 2 补论文自报锚点；scope 补消融与代码补核结果。id/status/stance/review_due/signoff 未动。
