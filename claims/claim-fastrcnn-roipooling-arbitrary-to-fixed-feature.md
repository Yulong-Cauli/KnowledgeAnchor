---
id: claim-fastrcnn-roipooling-arbitrary-to-fixed-feature
title: "Fast R-CNN 声称 RoI Pooling 经“网格划分→子窗口最大池化”把特征图上任意尺寸 RoI 变为固定尺寸特征，配合整图共享卷积实现端到端训练"
type: claim
status: asserted
scope: "Fast R-CNN 架构机制主张（ICCV 2015）；笔记示例参数：输出 7×7、VGG16 步长 16、512 通道逐通道独立池化；机制层面主张，不涉及具体数据集与精度数字；尚未独立验证"
tags: [detection, fast-rcnn, roi-pooling, shared-convolution, two-stage]
note: "library/Classical_Detection/Fast R-CNN 和 Faster R-CNN .md#方法-整体架构"
paper: "ICCV 2015, Fast R-CNN；TPAMI 2017, Faster R-CNN（开源：https://github.com/ShaoqingRen/faster_rcnn）"
stance: watch
evidence:
  - source: "library/Classical_Detection/Fast R-CNN 和 Faster R-CNN .md"
    locator: "§Fast R-CNN / 方法 / 整体架构"
    quote: "整张图片只经过一次 CNN 前向传播生成特征图（Feature Map），不再像 R-CNN 那样对每个候选框单独计算卷积，极大地减少了计算量。"
    relation: supports
  - source: "library/Classical_Detection/Fast R-CNN 和 Faster R-CNN .md"
    locator: "§Fast R-CNN / 方法 / 整体架构"
    quote: "它将特征图上不同大小的候选区域（Region of Interest, RoI）映射并池化为固定大小的特征向量"
    relation: supports
  - source: "library/Classical_Detection/Fast R-CNN 和 Faster R-CNN .md"
    locator: "§Fast R-CNN / 方法（RoI Pooling 机制小结）"
    quote: "正是通过这种“**切分网格 -> 局部取最大**”的机制，RoI Pooling 成功地把任意尺寸的候选框都变成了固定大小的特征向量，从而实现了 Fast R-CNN 的端到端训练。"
    relation: supports
falsifiers:
  - "按“网格划分→子窗口最大池化→逐通道独立”实现 RoI Pooling，仍无法对任意 h×w 的 RoI 稳定输出固定 H×W（如 7×7）特征"
  - "整图单次前向 + RoI Pooling 的架构无法端到端单阶段训练，仍必须像 R-CNN 那样对每个候选框单独卷积或分阶段/SVM 训练"
  - "与论文原文对照发现机制描述有误（例如并非逐通道独立、并非子窗口内取最大值）"
review_due: 2026-12-02
related: [claim-fastrcnn-multitask-loss-beats-cls-only]
signoff: null
---

## 我的理解

笔记声称（尚未独立验证）：Fast R-CNN 的关键设计是（1）整图只做一次 CNN 前向得到共享特征图，取代 R-CNN 对每个候选框单独卷积；（2）RoI Pooling 把特征图上任意 h×w 的 RoI 先按 stride 映射到特征图坐标，再切成 H×W 网格、每个子窗口（约 h/H × w/W）内取最大值、逐通道独立进行，从而输出固定尺寸（如 7×7）特征供全连接头使用。笔记认为正是这一机制使固定尺寸的分类/回归头能挂在共享卷积特征上，实现端到端训练。

限定：本卡只主张机制路径（任意尺寸 RoI → 固定尺寸特征 + 共享卷积计算），不主张任何具体加速倍数或精度数字——笔记该节未载数字。

## 待验证

- 用开源实现（如 rbgirshick/fast-rcnn 或后续复现仓库）核对 RoI Pooling 的实现与笔记机制一致：坐标除以 stride 取整、子窗口边界划分方式（floor/ceil）、逐通道最大池化。
- 构造极端尺寸 RoI（如小于 H×W、极端长宽比），验证输出恒为 H×W 且前向可反传。
- 对照 R-CNN 流程，量测同一图片“整图一次前向 + RoI 池化”与“逐候选框裁剪后分别卷积”的计算量差异。

## 若成立 / 不成立意味着什么

成立：两阶段检测器“共享卷积 + 固定尺寸 RoI 特征头”的范式成立，是后续 Faster R-CNN、Mask R-CNN 等 RoIAlign 类设计的直接前提（见 [多任务损失卡](claim-fastrcnn-multitask-loss-beats-cls-only.md)）。
不成立：机制描述有误则笔记该节需要修订；若 RoI Pooling 不能稳定输出固定尺寸特征，则固定尺寸头的设计依赖其他机制，引用时需回查论文原文。
