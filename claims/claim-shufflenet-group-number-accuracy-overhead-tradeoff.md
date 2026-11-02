---
id: claim-shufflenet-group-number-accuracy-overhead-tradeoff
title: "ShuffleNet 论文声称组数 g 的非单调权衡：g>1 一致优于 g=1、越小模型收益越大（最多 4.4 点），但 g 过大精度饱和回落且实测加速远低于理论（每 4× 理论缩减约 2.6×）"
type: claim
status: asserted
scope: "ShuffleNet V1（arXiv:1707.01083 v2，CVPR 2018）§4.1.1 Table 2（g=1–8 × ShuffleNet 1×/0.5×/0.25×）+ §3.3 机制论述 + §4.5 Table 8（Snapdragon 820 单线程实测）；精度为 ImageNet top-1 错误率（单 crop，错误率越低越好）；「收益」指同复杂度约束下错误率变化；论文声称口径，尚未独立验证"
tags: [shufflenet, group-convolution, latency, efficient-backbone]
note: library/Efficient_Backbone/ShuffleNet.md#32-pointwise-组卷积消融411-table-2
paper: "CVPR 2018, ShuffleNet: An Extremely Efficient Convolutional Neural Network for Mobile Devices (arXiv:1707.01083)"
stance: watch
evidence:
  - source: library/Efficient_Backbone/ShuffleNet.md
    locator: "§3.2 / §4.1.1 结论一"
    quote: "models with group convolutions (g>1) consistently perform better than the counterparts without pointwise group convolutions (g=1)"
    relation: supports
  - source: library/Efficient_Backbone/ShuffleNet.md
    locator: "§3.2 / §4.1.1 结论二"
    quote: "Smaller models tend to benefit more from groups."
    relation: supports
  - source: library/Efficient_Backbone/ShuffleNet.md
    locator: "§3.2 / Table 2（ShuffleNet 1× 行：最优 g=8 32.4，比 g=1 好 1.2）"
    quote: "| ShuffleNet 1× | 140 | 33.6 | 32.7 | 32.6 | 32.8 | 32.4 |"
    relation: supports
  - source: library/Efficient_Backbone/ShuffleNet.md
    locator: "§3.2 / Table 2（ShuffleNet 0.5× 行：g=8 42.3 反而劣于 g=4 41.6——非单调实锚）"
    quote: "| ShuffleNet 0.5× | 38 | 45.1 | 44.4 | 43.2 | 41.6 | 42.3 |"
    relation: supports
  - source: library/Efficient_Backbone/ShuffleNet.md
    locator: "§3.2 / Table 2（ShuffleNet 0.25× 行：g=8 52.7 最优，57.1−52.7=4.4）"
    quote: "| ShuffleNet 0.25× | 13 | 57.1 | 56.8 | 55.0 | 54.2 | 52.7 |"
    relation: supports
  - source: library/Efficient_Backbone/ShuffleNet.md
    locator: "§2.4 / §3.3（g 增大换更多输出通道的机制与代价自述）"
    quote: "larger group numbers result in more output channels (thus more convolutional filters) for a given complexity constraint, which helps to encode more information, though it might also lead to degradation for an individual convolutional filter due to limited corresponding input channels"
    relation: supports
  - source: library/Efficient_Backbone/ShuffleNet.md
    locator: "§2.3 / §3.2（同预算换更宽特征图的解释）"
    quote: "In other words, given a computational budget, ShuffleNet can use wider feature maps. We find this is critical for small networks, as tiny networks usually have an insufficient number of channels to process the information."
    relation: supports
  - source: library/Efficient_Backbone/ShuffleNet.md
    locator: "§3.7 / §4.5（理论缩减与实测加速的经验规律）"
    quote: "Due to memory access and other overheads, we find every 4× theoretical complexity reduction usually results in ∼2.6× actual speedup in our implementation."
    relation: supports
  - source: library/Efficient_Backbone/ShuffleNet.md
    locator: "§3.7 / §4.5（g=3 为经验折中）"
    quote: "Empirically g=3 usually has a proper trade-off between accuracy and actual inference time."
    relation: supports
  - source: https://ar5iv.labs.arxiv.org/html/1707.01083
    locator: "Table 2 ShuffleNet 0.5× 行；ar5iv 渲染版（对应 arXiv v2，笔记抓取约定），2026-11-03 抓取；引句为 HTML 去标签 + math alttext 还原的归一化文本（× 为 alttext \\times）"
    quote: "ShuffleNet 0.5 \\times 38 45.1 44.4 43.2 41.6 42.3"
    relation: supports
  - source: https://ar5iv.labs.arxiv.org/html/1707.01083
    locator: "Table 2 ShuffleNet 0.25× 行（同上抓取方式，2026-11-03）"
    quote: "ShuffleNet 0.25 \\times 13 57.1 56.8 55.0 54.2 52.7"
    relation: supports
  - source: https://ar5iv.labs.arxiv.org/html/1707.01083
    locator: "§4.1.1 结论句（同上抓取方式，2026-11-03；g>1/g=1 为 math alttext）"
    quote: "models with group convolutions ( g>1 ) consistently perform better than the counterparts without pointwise group convolutions ( g=1 )"
    relation: supports
falsifiers:
  - "复现中 g 增大时精度单调改善、无饱和/回落（如 ShuffleNet 0.5× 上 g=8 稳定反超 g=4 且差距随规模扩大）"
  - "g=1（无 pointwise 组卷积）复现优于任一 g>1 档（组卷积收益不成立）"
  - "实测延迟随理论 FLOPs 近似同比例变化（每 4× 理论缩减得到接近 4× 实测加速），或 g=3/g=4/g=8 在 ARM 上实测延迟无显著差——访存瓶颈论失效"
review_due: 2026-12-03
related: [claim-shufflenet-pointwise-group-conv-channel-shuffle]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：组数 g 是同复杂度下「通道宽度 ↔ 单个卷积连接稀疏度」的旋钮——g 越大，同 FLOPs 预算可换更多输出通道（更宽特征图），小模型因此受益；但单个卷积滤波器的输入连接变少，精度在大 g 段饱和甚至回落。Table 2 的形状：g=1→最优 g 的错误率降幅随模型变小而增大（1× 1.2、0.5× 3.5、0.25× 4.4 点），而 0.5× 上 g=8（42.3）劣于 g=4（41.6）——非单调的直接实锚；0.25× 上则 g=8 最优。

开销一侧（§4.5）：g=4/g=8 精度虽好但当时实现效率低，经验折中是 g=3；更一般的规律是「每 4× 理论复杂度缩减 ≈ 2.6× 实测加速」（内存访问与其它开销吃掉其余），Table 8 给出 Snapdragon 820 单线程实测（如 0.5×(g=3) 38M FLOPs → 15.2ms vs AlexNet 720M → 184.0ms）。

边界：本卡不主张「ShuffleNet 全面优于 MobileNet」（Table 5 对比属另一主张，未立卡）；实测数字仅覆盖论文自报的 Snapdragon 820 平台，不外推到其他硬件。

## 待验证

- 复跑 Table 2 的 g 扫描（至少 0.5× 一档，g∈{1,4,8}），核对非单调形状是否复现。
- 在现代 ARM（或论文同款 820）上实测 g=3/4/8 的时延，核对「每 4× 理论 → ~2.6× 实测」与 g=3 折中结论在现代实现下是否仍成立。
- 统计各 g 档的实际输出通道数（Table 1：Stage2 144/200/240/272/384），验证「g 换宽度」机制。

## 若成立 / 不成立意味着什么

成立：小模型选组卷积时 g 不宜盲取最大——按论文口径 g=3 附近是精度/实测时延折中；任何理论 FLOPs 对比都要打折换算实测。
不成立：若现代实现已消除访存瓶颈（理论≈实测），组数选择回归纯精度考量，论文的 g=3 经验值只在其历史实现内有效。
