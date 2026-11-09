---
id: claim-mobilenet-dsc-8to9x-compute-reduction
title: "MobileNetV1 论文声称 3×3 深度可分离卷积比标准卷积少 8–9 倍计算，并以 Table 4 全卷积对照（4866M→569M Mult-Adds、精度仅降 1.1 点）自证"
type: claim
status: asserted
scope: "MobileNetV1（arXiv:1704.04861 v1）§3.1 理论计算量主张 + §4.1 Table 4 自报对照；ImageNet 分类、224 输入；计算量为 Mult-Adds（乘加数）理论口径，非实测时延；论文声称口径"
tags: [mobilenet, depthwise-separable-conv, efficient-backbone, imagenet]
note: library/Efficient_Backbone/MobileNet.md#211-depthwise-separable-convolutionv1-31
paper: "arXiv 2017, MobileNets: Efficient Convolutional Neural Networks for Mobile Vision Applications (arXiv:1704.04861)"
stance: watch
evidence:
  - source: library/Efficient_Backbone/MobileNet.md
    locator: "§2.1.1 / V1 §3.1（8 to 9 times 句）"
    quote: "MobileNet uses $3\times 3$ depthwise separable convolutions which uses between 8 to 9 times less computation than standard convolutions"
    relation: supports
  - source: library/Efficient_Backbone/MobileNet.md
    locator: "§2.1.1 / V1 §3.1 式(5) 下方"
    quote: "By expressing convolution as a two step process of filtering and combining we get a reduction in computation of:"
    relation: supports
  - source: library/Efficient_Backbone/MobileNet.md
    locator: "§3.1 / V1 Table 4（Conv MobileNet 行）"
    quote: "| Conv MobileNet | 71.7% | 4866 | 29.3 |"
    relation: supports
  - source: library/Efficient_Backbone/MobileNet.md
    locator: "§3.1 / V1 Table 4（MobileNet 行）"
    quote: "| MobileNet | 70.6% | 569 | 4.2 |"
    relation: supports
  - source: library/Efficient_Backbone/MobileNet.md
    locator: "§3.1 / V1 §4.1 正文（was saving tremendously 原文如此）"
    quote: "In Table 4 we see that using depthwise separable convolutions compared to full convolutions only reduces accuracy by $1\%$ on ImageNet was saving tremendously on mult-adds and parameters."
    relation: supports
  - source: https://ar5iv.labs.arxiv.org/html/1704.04861
    locator: "V1 §3.1；ar5iv 渲染版（无版本标注），2026-11-03 抓取；引句为 HTML 去标签 + math alttext 还原的归一化文本"
    quote: "8 to 9 times less computation than standard convolutions"
    relation: supports
  - source: https://ar5iv.labs.arxiv.org/html/1704.04861
    locator: "V1 Table 4 两行（同上抓取方式，2026-11-03）；Conv MobileNet 行 + MobileNet 行"
    quote: "Conv MobileNet 71.7% 4866 29.3"
    relation: supports
  - source: https://ar5iv.labs.arxiv.org/html/1704.04861
    locator: "V1 Table 4 MobileNet 行（同上抓取方式，2026-11-03）"
    quote: "MobileNet 70.6% 569 4.2"
    relation: supports
falsifiers:
  - "〔机制核对（推导）〕对 3×3 核、N≥72 的典型层形状，按 V1 式(2)/(5) 推导或实测的 Mult-Adds 比值显著偏离 1/9–1/8（即约简比 1/N+1/D_K² 不成立）；N∈[9,72) 段比值本就高于 1/8（缩减不足 8 倍），属口径边界而非原范围反证"
  - "〔同范围复现（主张侧+对照侧）〕按论文设置复训 Table 4 对照：Conv MobileNet 与 MobileNet 的 top-1 差显著大于 1.1 点，或两者 Mult-Adds 比值远离 4866/569≈8.6×"
  - "〔原文核查〕arXiv 新版本或官方勘误更改 §3.1 的 8–9× 表述或 Table 4 数字"
review_due: 2026-12-03
related: [claim-mobilenetv2-inverted-residual-linear-bottleneck, claim-mobilenet-series-accuracy-latency-progression]
signoff: null
---

## 我的理解

论文声称：把标准卷积 $D_K\cdot D_K\cdot M\cdot N\cdot D_F\cdot D_F$（V1 式2）拆成 depthwise（逐通道滤波）+ 1×1 pointwise（线性组合）两层后，合计计算量为 $D_K\cdot D_K\cdot M\cdot D_F\cdot D_F + M\cdot N\cdot D_F\cdot D_F$（V1 式5），约简比为 $1/N + 1/D_K^2$；对 3×3 核即 8–9 倍更少计算。这是 Mult-Adds 理论口径，不是实测时延主张。

论文自己的实验锚点是 Table 4：全卷积版 Conv MobileNet（71.7% top-1 / 4866M Mult-Adds / 29.3M 参数）对比 depthwise separable 版 MobileNet（70.6% / 569M / 4.2M）——1.1 点精度换 8.5× 计算缩减、7× 参数缩减。MobileNetV2 §3.1 复述了同一 8–9× 口径（"8 to 9 times smaller"，见笔记 §2.2.1）。

前提依赖（2026-11-05 整理班推导复核）：约简比 $1/N+1/9$（3×3 核）要落入 1/9–1/8（即「8 to 9 times less」）需 $1/N \le 1/8 - 1/9 = 1/72$，即 $N\ge 72$；N∈[9,72) 时比值高于 1/8（缩减不足 8 倍：N=64 约 7.9 倍、N=9 仅 4.5 倍；MobileNet 主体 pointwise 层输出通道多为 64–1024，多数层近似落入该区间）；V1 首层（标准卷积）等少数层不满足该近似，"8–9×"是逐层近似下的全文口径而非逐层严格成立。

## 待验证

- 对若干典型层形状（$D_K=3$、$N\in\{64,128,256,512,1024\}$）核算式(2)/(5) 比值是否落在 1/9–1/8（按前提依赖推导，预期 N≥72 严格落入、N=64 约 7.9 倍略出界）。
- 用开源实现统计全模型 Mult-Adds，核对 569M（separable）与 4866M（全卷积）两个总量及其比值。
- 复训 Table 4 对照，验证 1.1 点精度差与 8.5× 计算差。

## 若成立 / 不成立意味着什么

成立：移动端选型可以把「depthwise separable 降本一个量级、精度掉约 1 点」作为基线事实引用（仍须注明为论文自报口径）。
不成立：V1 的核心降本主张要按实测口径重估，V2/V3 继承的「低成本骨架」前提随之动摇。

## 核查记录

- 2026-11-05（P1-B6 表达整理班）：本卡 5 条 library 笔记引句经 grep -F 逐字验证全部命中（library/Efficient_Backbone/MobileNet.md）；3 条 ar5iv 句为卡内已注 2026-11-03 抓取记录，本轮未重抓。修正本卡自加「前提依赖」中的数学条件：原写「N≥9 时落入 1/9–1/8 区间」有误——由 $1/N+1/9 \le 1/8$ 解得 $N\ge 72$（$1/8-1/9=1/72$），正文、待验证与 falsifier 1 已同步更正；论文数字与引文未改写。falsifiers 补分层标注（机制核对/同范围复现/原文核查）。
- 2026-11-09：K-probe-1 算术复算（experiments/pointnetpillars-pointnet-permutation-invariance-symmetric-function/RESULTS.md，kernel v2）——计算量侧带内：式(2)/(5) 约简比 N≥72 网格全落 [8.0×,9.0×]（N=72 恰 8.0×），Table 4 逐层重建 **578.9M（+1.74%）/4867.3M（+0.03%）**，比值 8.408×（论文 8.552×），预注册 <2% 带内，falsifier 1 计算量侧与 falsifier 2 计算量分支未触发；**精度侧（top-1 差 1.1 点复训）按预注册缩范围不做**。复算口径标注：dw 按输入分辨率、pw/标准卷积按输出分辨率（stride-2 块）。实验观察，status 未动。
