---
id: claim-shufflenet-beats-mobilenet-table5-g3
title: "ShuffleNet 论文自报（Table 5，窄口径绑定 g=3 行与三个浮点档）：同量级复杂度下 g=3 配置的 ImageNet top-1 错误率均低于对应 MobileNet 档——2×(g=3) 26.3 vs 1.0 MobileNet-224 29.4（524 vs 569 MFLOPs）、1.5×(g=3) 28.5 vs 0.75 MobileNet-224 31.6（292 vs 325）、0.5×(shallow, g=3) 42.8 vs 0.25 MobileNet-224 49.4（40 vs 41）"
type: claim
status: asserted
scope: "ImageNet 2012 分类、top-1 分类错误率（越小越好；单 crop，256 输入取 224 中心 crop，§4）；ShuffleNet V1（arXiv:1707.01083 v2，CVPR 2018）自报对比；窄口径只绑 Table 5 中 g=3 的三行（524 / 292 / 40 MFLOPs 档），非 g=3 行（1×(g=8) 32.4、0.5×(g=4) 41.6）、COCO 检测（Table 7）与 ARM 实测（Table 8）不在本卡；错误率为浮点（fp32）口径，含量化后精度不在此卡；Table 5 的 MobileNet 数字来源（MobileNet 原论文报告 vs ShuffleNet 作者复现）表内未明示，对比存在训练配方差异风险；论文声称，尚未独立验证"
tags: [shufflenet, mobilenet, efficient-backbone, imagenet, group-convolution, comparison]
note: library/Efficient_Backbone/ShuffleNet.md#35-与-mobilenet-及其他框架对比
paper: "CVPR 2018, ShuffleNet: An Extremely Efficient Convolutional Neural Network for Mobile Devices (arXiv:1707.01083)"
stance: watch
evidence:
  - source: library/Efficient_Backbone/ShuffleNet.md
    locator: '§3.5 与 MobileNet 及其他框架对比 / Table 5（逐行照抄）'
    quote: '| 1.0 MobileNet-224 | 569 | 29.4 | - |'
    relation: supports
  - source: library/Efficient_Backbone/ShuffleNet.md
    locator: '§3.5 / Table 5（逐行照抄）'
    quote: '| ShuffleNet 2× (g=3) | 524 | 26.3 | 3.1 |'
    relation: supports
  - source: library/Efficient_Backbone/ShuffleNet.md
    locator: '§3.5 / Table 5（逐行照抄）'
    quote: '| 0.75 MobileNet-224 | 325 | 31.6 | - |'
    relation: supports
  - source: library/Efficient_Backbone/ShuffleNet.md
    locator: '§3.5 / Table 5（逐行照抄）'
    quote: '| ShuffleNet 1.5× (g=3) | 292 | 28.5 | 3.1 |'
    relation: supports
  - source: library/Efficient_Backbone/ShuffleNet.md
    locator: '§3.5 / Table 5（逐行照抄）'
    quote: '| 0.25 MobileNet-224 | 41 | 49.4 | - |'
    relation: supports
  - source: library/Efficient_Backbone/ShuffleNet.md
    locator: '§3.5 / Table 5（逐行照抄）'
    quote: '| ShuffleNet 0.5× (shallow, g=3) | 40 | 42.8 | 6.6 |'
    relation: supports
  - source: library/Efficient_Backbone/ShuffleNet.md
    locator: '§3.5 结论原句（§4.3）'
    quote: It is clear that our ShuffleNet models are superior to MobileNet for all the complexities.
    relation: supports
  - source: library/Efficient_Backbone/ShuffleNet.md
    locator: '§3.5 深度混淆控制（§4.3）'
    quote: the shallower model is still significantly better than the corresponding MobileNet, which implies that the effectiveness of ShuffleNet mainly results from its efficient structure, not the depth.
    relation: supports
  - source: https://ar5iv.labs.arxiv.org/html/1707.01083
    locator: '§4.3（ar5iv 全文 HTML，2026-11-03 抓取）'
    quote: It is clear that our ShuffleNet models are superior to MobileNet for all the complexities
    relation: supports
  - source: https://ar5iv.labs.arxiv.org/html/1707.01083
    locator: 'Table 5（ar5iv 全文 HTML 去标签文本，2026-11-03 抓取）'
    quote: 'MobileNet-224 569 29.4 - ShuffleNet 2 × \times ( g = 3 g=3 ) 524 26.3 3.1'
    relation: supports
falsifiers:
  - "用官方 ShuffleNet-Series 仓库按论文设置复训，任一 g=3 档（2×/1.5×/0.5×shallow）的 ImageNet top-1 错误率不低于对应 MobileNet 档（29.4/31.6/49.4）"
  - "把 MobileNet 用 ShuffleNet 同款训练日程（weight decay 4e-5、linear-decay LR、保守缩放增强）重训后，同档错误率反超 ShuffleNet g=3（即优势来自训练配方而非结构）"
  - "查得 arXiv v2 / CVPR 2018 camera-ready 的 Table 5 数字与笔记转写不一致"
review_due: 2026-12-03
related: [claim-shufflenet-pointwise-group-conv-channel-shuffle, claim-shufflenet-group-number-accuracy-overhead-tradeoff]
signoff: null
---

## 我的理解

这是 ShuffleNet vs MobileNet 对比卡，按任务要求做成窄口径：只绑 Table 5 里 g=3 的三对同档对比（ShuffleNet 侧 524 / 292 / 40 MFLOPs 对 MobileNet 侧 569 / 325 / 41 MFLOPs），错误率 26.3<29.4、28.5<31.6、42.8<49.4。论文的总括句 "superior to MobileNet for all the complexities" 比本卡口径更宽（还含 g=8/g=4 行），本卡不替它背书那部分。

两个必须记住的限定：

1. **对照组数字来源未明示**：Table 5 的 MobileNet 行大概率取自 MobileNet 原论文报告值，而 ShuffleNet 行是作者自己训练的（训练设置还做了两处修改：weight decay 4e-5、linear-decay LR，§4）；两侧训练配方不同，"优于"的因果归因（结构 vs 配方）要靠 falsifier 第 2 条检验。论文自己意识到了深度混淆（ShuffleNet 50 层 vs MobileNet 28 层），补了 26 层 shallow 对照——42.8 vs 49.4 那一对用的就是 shallow 版本。
2. **g 的口径**：Table 5 里 ShuffleNet 2×/1.5×/0.5×(shallow) 均为 g=3；论文在 §4.1.1 消融中显示最优 g 随模型大小变化（1× 最优是 g=8、0.5× 是 g=4），所以"最优 ShuffleNet vs MobileNet"和"g=3 ShuffleNet vs MobileNet"是两个口径，引用时不要混。

TableRow 逐格比对：2026-11-03 实抓 ar5iv 全文 HTML（https://ar5iv.labs.arxiv.org/html/1707.01083 ），Table 5 去标签文本与笔记逐行数字一致（569/29.4、524/26.3、325/31.6、292/28.5、41/49.4、40/42.8 等），总括句与 shallow 解释句逐字命中。

## 待验证

- 用官方仓库（github.com/megvii-model/ShuffleNet-Series，含预训练模型）核对 g=3 三档的 top-1 错误率是否与 Table 5 一致。
- 按 §4 训练设置重训 0.75 MobileNet-224，检验 31.6 是否为训练配方差异所致的保守数字。
- 复核 MobileNet 原论文（arXiv:1704.04861 Table 6/7）的 29.4/31.6/49.4 是否确为其报告值（本卡按库内 MobileNet 笔记 Table 6 的 70.6% top-1 = 29.4% 错误率口径旁证成立，未逐项对版）。

## 若成立 / 不成立意味着什么

成立：在 ~40–524 MFLOPs 的移动端预算带内，"pointwise 组卷积 + channel shuffle"路线同档精度优于 depthwise separable 路线（MobileNet V1），可作为轻量骨干选型的历史锚点（注意后来 MobileNetV2/V3 与 ShuffleNetV2 已各自迭代，跨代对比不适用本卡）。
不成立：同档反超或优势归因于训练配方，则"组卷积路线优于深度可分离路线"的早期证据链需降权，选型应直接以 V2/V3 时代的受控对比为准。
