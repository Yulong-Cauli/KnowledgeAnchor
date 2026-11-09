---
id: claim-mobilenetv3-nas-se-hswish-design
title: "MobileNetV3 论文声称的结构构成：platform-aware NAS + NetAdapt 两级搜索得到骨架（Large 直接复用 MnasNet-A1 作种子、Small 档改奖励权重 w=-0.15 重搜），再叠加 SE 瓶颈固定 1/4、h-swish 仅模型后半段两项手工改造"
type: claim
status: asserted
scope: "MobileNetV3（ICCV 2019，arXiv:1905.02244 v5，笔记按 ar5iv 渲染转写并经官方 PDF 复核一致）；本卡是对论文 §4–§5 方法构成的设计描述主张，不是精度/速度主张（精度-开销数字见 related 卡 claim-mobilenet-series-accuracy-latency-progression）；主张对象：platform-aware NAS + NetAdapt 两级搜索的骨架构成，SE 瓶颈固定为扩张层通道数的 1/4、h-swish 仅用于模型后半段两项手工改造；'no discernible accuracy difference / 量化模式消除近似 sigmoid 精度损失 / TFLite 原子算子'为论文自报的部署收益；论文声称"
tags: [mobilenetv3, nas, netadapt, squeeze-excitation, h-swish, efficient-backbone]
note: library/Efficient_Backbone/MobileNet.md#23-mobilenetv3
paper: "ICCV 2019, Searching for MobileNetV3 (arXiv:1905.02244)"
stance: watch
evidence:
  - source: library/Efficient_Backbone/MobileNet.md
    locator: '§2.3.2 两级搜索（V3 §4）'
    quote: For MobileNetV3 we use platform-aware NAS to search for the global network structures by optimizing each network block. We then use the NetAdapt algorithm to search per layer for the number of filters.
    relation: supports
  - source: library/Efficient_Backbone/MobileNet.md
    locator: '§2.3.1 块级搜索（V3 §4.1）'
    quote: Therefore, we simply reuse the same MnasNet-A1 [ 43 ] as our initial Large mobile model, and then apply NetAdapt [ 48 ] and other optimizations on top of it.
    relation: supports
  - source: library/Efficient_Backbone/MobileNet.md
    locator: '§2.3.1 块级搜索（V3 §4.1）'
    quote: 'we need a smaller weight factor $w=-0.15$ (vs the original $w=-0.07$ in [ 43 ]) to compensate for the larger accuracy change for different latencies'
    relation: supports
  - source: library/Efficient_Backbone/MobileNet.md
    locator: '§2.3.5 Large squeeze-and-excite（V3 §5.3）'
    quote: Instead, we replace them all to fixed to be 1/4 of the number of channels in expansion layer.
    relation: supports
  - source: library/Efficient_Backbone/MobileNet.md
    locator: '§2.3.5 Large squeeze-and-excite（V3 §5.3）'
    quote: We find that doing so increases the accuracy, at the modest increase of number of parameters, and no discernible latency cost.
    relation: supports
  - source: library/Efficient_Backbone/MobileNet.md
    locator: '§2.3.4 h-swish（V3 §5.2）'
    quote: 'Thus in our architectures we only use $\operatorname{h-swish}$ at the second half of the model.'
    relation: supports
  - source: library/Efficient_Backbone/MobileNet.md
    locator: '§2.3.4 h-swish（V3 §5.2）'
    quote: we found hard-version of all these functions to have no discernible difference in accuracy, but multiple advantages from a deployment perspective
    relation: supports
  - source: library/Efficient_Backbone/MobileNet.md
    locator: '§2.3.4 h-swish（V3 §5.2）'
    quote: in quantized mode, it eliminates potential numerical precision loss caused by different implementations of the approximate sigmoid.
    relation: supports
  - source: https://ar5iv.labs.arxiv.org/html/1905.02244
    locator: '§5.3 Large squeeze-and-excite（ar5iv 全文 HTML，2026-11-03 抓取）'
    quote: Instead, we replace them all to fixed to be 1/4 of the number of channels in expansion layer. We find that doing so increases the accuracy, at the modest increase of number of parameters, and no discernible latency cost.
    relation: supports
  - source: https://ar5iv.labs.arxiv.org/html/1905.02244
    locator: '§5.2 h-swish（ar5iv 全文 HTML，2026-11-03 抓取）'
    quote: we found hard-version of all these functions to have no discernible difference in accuracy, but multiple advantages from a deployment perspective
    relation: supports
  - source: https://ar5iv.labs.arxiv.org/html/1905.02244
    locator: '§4.1 Platform-aware NAS（ar5iv 全文 HTML，2026-11-03 抓取）'
    quote: Therefore, we simply reuse the same MnasNet-A1 [ 43 ] as our initial Large mobile model, and then apply NetAdapt [ 48 ] and other optimizations on top of it
    relation: supports
falsifiers:
  - "〔原文核查〕论文正式版 / 其他 arXiv 版本中 SE 瓶颈比例不是'固定为扩张层通道数的 1/4'（如沿用 MnasNet 的相对比例），或 Table 1/Table 2 的 SE 列与该表述矛盾"
  - "〔原文核查〕V3-Large / V3-Small 的规格表（Table 1/2 NL 列）显示 h-swish 在模型前半段也被启用，与 §5.2 'only use at the second half' 矛盾"
  - "〔原文核查〕查得 V3-Large 结构并非来自 MnasNet-A1 种子 + NetAdapt（如全部重新搜索），或 Small 档未修改奖励权重 w（仍为 -0.07）"
review_due: 2026-12-03
related: [claim-mobilenet-series-accuracy-latency-progression]
signoff: null
---

## 主张

论文声称：V3 骨架由两级搜索得到——块级用 platform-aware NAS（MnasNet 同款 RNN controller + 分层搜索空间），层级用 NetAdapt（按 ΔAcc/|Δlatency| 斜率选剪层方案）。关键细节是两档的种子不同：Large 直接复用 MnasNet-A1（论文原话 "simply reuse"），Small 才以修改后的奖励 w=-0.15（MnasNet 原为 -0.07）从头重搜——即 V3-Large 相对 MnasNet-A1 的增量其实来自 NetAdapt + 手工改造，而非新搜索。

手工改造两项：

1. **SE 瓶颈**：沿用 MnasNet 的摆放（expansion 层内 depthwise 之后），比例从"相对 bottleneck 大小"改为固定 1/4 扩张通道；论文自报精度升、参数略增、时延无可辨成本。
2. **h-swish（x·ReLU6(x+3)/6）**：只放在模型后半段，理由是深层激活内存小、收益大，且硬版本"无精度差 + 部署友好 + 量化模式消除近似 sigmoid 的数值精度损失"。

两个使用注意：(a) "无精度差 / 无时延成本"都是论文自报的定性结论，未给出逐层消融表；(b) 引 V3 精度/时延数字时用 related 演进卡，且注意 V3 论文 Table 3 与附录 Table 9 存在 219/217、67.4/67.5、39/39.8 的内部不一致（笔记遗留问题 3，官方 PDF 内部即如此）——本卡不引任何这些数字。

## 待验证

- 对照官方开源实现（torchvision / tensorflow 的 MobileNetV3 权重定义）逐层核对：SE 是否恰为 expansion 通道的 1/4、h-swish 是否只在后半段（以 Table 1/2 的 NL 列为金标准逐块比对）。
- 实测 h-swish 换回 ReLU/swish 的精度差与时延差，检验 "no discernible difference" 的定性说法（V3 §6.2.1 Table 5 有论文自己的消融：ReLU -0.7%、h-swish@16 +0.2%）。
- 在量化训练（如 LSQ/PACT 路线）下验证 h-swish 的"消除近似 sigmoid 数值精度损失"是否真实成立。

## 成立/不成立的含义

成立：V3 的方法论 = "复用/微调 NAS 种子 + 少量部署导向手工改造"，后续做移动端骨干可以按此拆解借鉴——NAS 只负责宏观骨架，SE 比例、激活函数摆放这类局部决策用手工规则即可；引用 V3 结构时须区分"搜出来的"与"改出来的"。
不成立：V3 结构构成与论文表述不符（如 SE 比例或激活摆放记错），则依赖该结构复现 V3 的工作全部需重查，本库相关演进叙事需修正。

## 核查记录

- 2026-11-05（P1-B6 表达整理班）：本卡 8 条 library 笔记引句经 grep -F 逐字验证全部命中（MobileNet.md §2.3 各节）；3 条 ar5iv 句为卡内已注 2026-11-03 抓取记录，本轮未重抓。内容审阅未发现问题：搜出来的（NAS/NetAdapt + Large 复用 MnasNet-A1、Small 改 w=-0.15）与改出来的（SE 1/4、h-swish 后半段）分开，「无精度差/无时延成本」标为论文自报定性结论；scope 已声明这是设计描述主张而非精度/速度主张，故 falsifiers 三条均属原文核查层。仅补分层标注，论文数字未改写。
