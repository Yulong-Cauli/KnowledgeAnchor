---
id: claim-mobilenetv2-inverted-residual-linear-bottleneck
title: "MobileNetV2 论文声称倒残差+线性瓶颈块（shortcut 接窄 bottleneck、bottleneck 处去非线性、扩张率 t=6）优于经典残差连接方式"
type: claim
status: asserted
scope: "MobileNetV2（arXiv:1801.04381，CVPR 2018）§3.2/§3.3 设计主张 + §6.4 消融自报（数值曲线在其 Figure 6，ar5iv 未给数值表）；ImageNet 分类、224 输入主网络；块计算量按 hw·d′·t(d′+k²+d″) 理论口径；论文声称口径，尚未独立验证"
tags: [mobilenetv2, inverted-residual, linear-bottleneck, efficient-backbone]
note: library/Efficient_Backbone/MobileNet.md#223-inverted-residualsv2-33
paper: "CVPR 2018, MobileNetV2: Inverted Residuals and Linear Bottlenecks (arXiv:1801.04381)"
stance: watch
evidence:
  - source: library/Efficient_Backbone/MobileNet.md
    locator: "§2.2.3 / V2 §3.3"
    quote: "we use shortcuts directly between the bottlenecks."
    relation: supports
  - source: library/Efficient_Backbone/MobileNet.md
    locator: "§2.2.2 / V2 §3.2"
    quote: "we can capture this by inserting linear bottleneck layers into the convolutional blocks."
    relation: supports
  - source: library/Efficient_Backbone/MobileNet.md
    locator: "§2.2.3 / V2 §3.3"
    quote: "However, the inverted design is considerably more memory efficient (see Section 4 for details), as well as works slightly better in our experiments."
    relation: supports
  - source: library/Efficient_Backbone/MobileNet.md
    locator: "§2.2.4 / V2 §4"
    quote: "For all our main experiments we use expansion factor of $6$ applied to the size of the input tensor."
    relation: supports
  - source: library/Efficient_Backbone/MobileNet.md
    locator: "§3.2 / V2 §6.4 消融（shortcut 接 bottleneck vs 接扩张层）"
    quote: "The new result reported in this paper is that the shortcut connecting bottleneck perform better than shortcuts connecting the expanded layers (see Figure 6(b) for comparison)."
    relation: supports
  - source: library/Efficient_Backbone/MobileNet.md
    locator: "§3.2 / V2 §6.4 消融（linear bottleneck）"
    quote: "linear bottlenecks improve performance, providing support that non-linearity destroys information in low-dimensional space."
    relation: supports
  - source: https://ar5iv.labs.arxiv.org/html/1801.04381
    locator: "V2 §3.3；ar5iv 渲染版（无版本标注），2026-11-03 抓取；引句为 HTML 去标签 + math alttext 还原的归一化文本"
    quote: "we use shortcuts directly between the bottlenecks"
    relation: supports
  - source: https://ar5iv.labs.arxiv.org/html/1801.04381
    locator: "V2 §6.4 消融句（同上抓取方式，2026-11-03）"
    quote: "The new result reported in this paper is that the shortcut connecting bottleneck perform better than shortcuts connecting the expanded layers"
    relation: supports
falsifiers:
  - "同预算同训练配方复现中，shortcut 接扩张层（经典残差式）反超 shortcut 接 bottleneck 的精度"
  - "bottleneck 处保留 ReLU 等非线性不掉点甚至涨点，或去掉线性瓶颈精度不变（与「低维非线性破坏信息」相悖）"
  - "按 V2 Table 2 结构复现的单块 MAdds 与公式 hw·d′·t(d′+k²+d″) 明显不符（如扩张段计算被忽略）"
review_due: 2026-12-03
related: [claim-mobilenet-dsc-8to9x-compute-reduction, claim-mobilenet-series-accuracy-latency-progression]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：V2 的块设计与经典残差「两头宽中间窄」相反——shortcut 直接接在两个窄 bottleneck 之间，块内先 1×1 扩张（主实验固定 t=6）、3×3 depthwise、再 linear 1×1 投影；linear（bottleneck 处去非线性）来自「ReLU 在低维会不可逆丢信息」的论证（§3.2）。两个设计各自的消融自报在 §6.4：shortcut 接 bottleneck 优于接扩张层；linear bottleneck 提升性能。注意该消融的数值只在其 Figure 6 曲线上（ar5iv 未给数值表），本卡不引用具体消融数字。

块的收益另一面是内存：倒残差使推理期只需物化 bottleneck 端张量（V2 §5.1：分块累加时中间表示只需驻留 n/t 通道），见笔记 §2.2.5（Table 3：V2 峰值 400K 通道 vs V1 1600K）。

边界：本卡只主张「块设计与消融方向」，不主张 V2 整体精度-延迟数字（另有专卡）；t 的取值消融（§4：5–10 内曲线接近）也不在本卡范围。

## 待验证

- 按论文设置复训 §6.4 两个消融（shortcut 位置 × bottleneck 是否线性），核对方向是否与 Figure 6 一致。
- 核算单块 MAdds 与 hw·d′·t(d′+k²+d″) 是否一致。
- 在低维 bottleneck 处加 ReLU 的对照实验（验证「低维非线性破坏信息」）。

## 若成立 / 不成立意味着什么

成立：倒残差+线性瓶颈可作为移动端/端侧块设计的默认起点；后续 V3、EfficientNet 等继承该块。
不成立：V2 相对 V1 的提升要归因到别的因素（如缩放策略或训练配方），块设计主张降级。
