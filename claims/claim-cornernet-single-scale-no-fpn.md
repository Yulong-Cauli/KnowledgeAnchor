---
id: claim-cornernet-single-scale-no-fpn
title: "CornerNet 论文声称：不使用特征金字塔，仅用骨干（两个堆叠、深 104 层的 Hourglass）最后一层输出做单尺度预测"
type: claim
status: asserted
scope: "设计层面主张：预测只取网络最后一层输出，无 FPN/多尺度融合；骨干为两个堆叠 Hourglass 模块、深度 104 层；依据笔记转述；笔记未载性能数字，尚未独立验证"
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
falsifiers:
  - "princeton-vl/CornerNet 实现显示预测头接在多个尺度上（存在 FPN 类结构或中间 Hourglass 输出也参与预测）"
  - "骨干结构不符：非两个堆叠 Hourglass，或总深度与 104 层明显不符"
  - "复现显示不加多尺度特征就无法按笔记所述流程检测不同大小的物体，说明'仅最后一层输出'的转述不完整"
review_due: 2026-12-02
related: [claim-cornernet-paired-keypoints-anchor-free, claim-cornernet-corner-pooling-directional-maxsum, claim-cornernet-associative-embedding-pull-push, claim-centernetpoints-inference-fps-gain-over-cornernet]
signoff: null
---

## 我的理解

> 修订注记（2026-11-03，笔记修正同步）：笔记「**Hourglass Network **」双星号内尾随空格已按 fix-list F28 删除，本卡 evidence quote 1 已逐字同步更新（仅去一个空格，语义不变）。

论文声称（笔记所载，尚未独立验证）：与许多依赖特征金字塔的检测器不同，CornerNet 不使用 FPN，只用骨干网络最后一层的输出预测不同大小的物体；骨干为两个堆叠的 Hourglass 模块（深度 104 层），通过重复下采样/上采样同时捕获全局信息（分类）与局部细节（定位）。

限定：笔记未载"有/无 FPN"的对比数字，也未载不同大小物体的分档精度，本卡只立结构主张，不立"单尺度相对 FPN 的优劣"。速度对比可参见 CenterNet 卡（同 Hourglass-104 骨干 7.8 vs 4.1 FPS，笔记未注明测量硬件、输入分辨率与测试增强口径，且该卡 scope 已声明此 caveat）。

## 待验证

- 读 princeton-vl/CornerNet 模型定义：核对 Hourglass 堆叠数（2）、总深度（104）、预测头仅接在最后一层输出上。
- 对照原论文网络配置，确认笔记转述一致；补记评测数据集版本（笔记未载）。

## 若成立 / 不成立意味着什么

成立："强单尺度骨干、不用 FPN"是无锚框关键点路线的一个明确设计选项，与 FPN 类检测器对比时有清晰的结构差异点。
不成立：笔记转述与实现不符，需修订笔记并复核本卡。
