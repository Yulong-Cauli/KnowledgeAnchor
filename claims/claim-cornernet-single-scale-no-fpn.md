---
id: claim-cornernet-single-scale-no-fpn
title: "CornerNet 论文声称：不使用特征金字塔，仅用骨干（两个堆叠、深 104 层的 Hourglass）最后一层输出做单尺度预测"
type: claim
status: asserted
scope: "设计层面主张：预测只取网络最后一层输出，无 FPN/多尺度融合；骨干为两个堆叠 Hourglass 模块、深度 104 层；依据笔记转述，2026-11-05 已按 arXiv 1808.01244v2 原文补核命中（见 falsifier 1）；笔记未载性能数字"
tags: [object-detection, hourglass, no-fpn, cornernet, eccv2018]
note: library/Classical_Detection/CornerNet.md#architecture
paper: "ECCV 2018, CornerNet: Detecting Objects as Paired Keypoints（代码 https://github.com/princeton-vl/CornerNet，笔记头部出处）"
stance: watch
evidence:
  - source: library/Classical_Detection/CornerNet.md
    locator: "§Architecture"
    quote: "使用 **Hourglass Network** 作为骨干网络，两个堆叠的 Hourglass 模块，深度为 104 层。这种结构通过重复的下采样和上采样，能够同时捕获**全局信息**（用于分类）和**局部细节**（用于精确定位）。"
    relation: supports
  - source: library/Classical_Detection/CornerNet.md
    locator: "§Architecture"
    quote: "**无多尺度特征**：与许多其他检测器不同，CornerNet 不使用特征金字塔（FPN）来检测不同大小的物体，而是仅使用网络最后一层的输出进行预测。"
    relation: supports
  - source: https://arxiv.org/pdf/1808.01244
    locator: "§3.5 Hourglass Network（深度 104 + 仅用最后一层特征；arXiv PDF v2，pdftotext 提取，跨行连字符已还原，抓取 2026-11-05）"
    quote: "The depth of the hourglass network is 104. Unlike many other state-of-the-art detectors, we only use the features from the last layer of the whole network to make predictions."
    relation: supports
  - source: https://arxiv.org/pdf/1808.01244
    locator: "§3.5 Hourglass Network（两个 Hourglass 模块级联；pdftotext 提取，抓取 2026-11-05）"
    quote: "We then merge them by element-wise addition followed by a ReLU and a residual block with 256 channels, which is then used as the input to the second hourglass module."
    relation: supports
falsifiers:
  - "原文核查（已完成，未触发，2026-11-05）：骨干结构或预测层级与笔记不符——已实抓 arXiv 1808.01244v2，深度 104、仅用最后一层特征做预测、第二个 hourglass 模块级联均命中，此分支闭合"
  - "代码核查：princeton-vl/CornerNet 实现显示预测头接在多个尺度上（存在 FPN 类结构或中间 Hourglass 输出也参与预测）"
  - "同范围复现：复现显示不加多尺度特征就无法按笔记所述流程检测不同大小的物体，说明'仅最后一层输出'的转述不完整"
review_due: 2026-12-02
related: [claim-cornernet-paired-keypoints-anchor-free, claim-cornernet-corner-pooling-directional-maxsum, claim-cornernet-associative-embedding-pull-push, claim-centernetpoints-inference-fps-gain-over-cornernet]
signoff: null
---

## 主张

> 修订注记（2026-11-03，笔记修正同步）：笔记「**Hourglass Network **」双星号内尾随空格已按 fix-list F28 删除，本卡 evidence quote 1 已逐字同步更新（仅去一个空格，语义不变）。

论文声称（笔记所载）：与许多依赖特征金字塔的检测器不同，CornerNet 不使用 FPN，只用骨干网络最后一层的输出预测不同大小的物体；骨干为两个堆叠的 Hourglass 模块（深度 104 层），通过重复下采样/上采样同时捕获全局信息（分类）与局部细节（定位）。

限定：笔记未载"有/无 FPN"的对比数字，也未载不同大小物体的分档精度，本卡只立结构主张，不立"单尺度相对 FPN 的优劣"。速度对比可参见 CenterNet 速度卡（claim-centernetpoints-inference-fps-gain-over-cornernet，同 Hourglass-104 骨干 7.8 vs 4.1 FPS；测量硬件与翻转口径已按原文补核——Titan Xp、7.8 为 flip-test 口径，仅 CornerNet 4.1 是否同机复测未确认）。

## 待验证

- 已核对（2026-11-05，论文侧）：深度 104、仅最后一层输出预测、两个 Hourglass 模块级联均与 arXiv v2 原文一致，见 evidence。
- 读 princeton-vl/CornerNet 模型定义：核对 Hourglass 堆叠数（2）、预测头仅接在最后一层输出上——代码侧仍未查，falsifier 2 保留。
- 补记评测数据集版本（笔记未载；论文主结果在 MS COCO test-dev，未在笔记展开，暂不立卡）。

## 成立/不成立的含义

成立："强单尺度骨干、不用 FPN"是无锚框关键点路线的一个明确设计选项，与 FPN 类检测器对比时有清晰的结构差异点。
不成立：笔记转述与实现不符，需修订笔记并复核本卡。

## 核查记录

- 2026-11-05（02 任务书 P1-B7a 整理班）：表达整理 + 论文侧核查，数字未改写。两条笔记 quote Grep 逐字命中；新增 2 条 arXiv 1808.01244v2 原文 evidence（§3.5 深度 104 + 仅最后一层预测句、第二 hourglass 模块级联句）；结构类 falsifier 拆为原文核查（已闭合）/ 代码核查（保留）；保留 2026-11-03 修订注记与 F28 同步记录。id/status/stance/review_due/signoff 未动。
