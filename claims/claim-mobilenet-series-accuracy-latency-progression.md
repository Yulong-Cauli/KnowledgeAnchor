---
id: claim-mobilenet-series-accuracy-latency-progression
title: "MobileNet 系列论文自报同点演进：ImageNet top-1 70.6（V1，569M Mult-Adds）→ 72.0（V2，300M）→ 75.2（V3-Large，219M，Pixel-1 51ms）"
type: claim
status: asserted
scope: "MobileNetV1/V2/V3 各自论文表格自报数字（V1 Table 6、V2 Table 4、V3 Table 3，均 224 输入 / width 1.0）；V3 时延为 Pixel-1 大核单线程 TFLite 口径（P-1）；跨论文 MAdds 口径不一（同一 V1-224 在 V1 Table 6 记 569M、在 V2 Table 4 记 575M），本卡各数字均标注出处表号；不含 V3 的 SE/h-swish/NAS 设计主张（以笔记 §2.3 为准，未立卡）；论文声称口径，尚未独立验证"
tags: [mobilenet, mobilenetv2, mobilenetv3, imagenet, latency, efficient-backbone]
note: library/Efficient_Backbone/MobileNet.md#1-概述
paper: "MobileNetV1 (arXiv:1704.04861); MobileNetV2 (CVPR 2018, arXiv:1801.04381); MobileNetV3 (ICCV 2019, arXiv:1905.02244)"
stance: watch
evidence:
  - source: library/Efficient_Backbone/MobileNet.md
    locator: "§3.1 / V1 Table 6（1.0 MobileNet-224 行）"
    quote: "| 1.0 MobileNet-224 | 70.6% | 569 | 4.2 |"
    relation: supports
  - source: library/Efficient_Backbone/MobileNet.md
    locator: "§2.2.4 / V2 §4 正文"
    quote: "Our primary network (width multiplier $1$ , $224\times 224$ ), has a computational cost of 300 million multiply-adds and uses 3.4 million parameters."
    relation: supports
  - source: library/Efficient_Backbone/MobileNet.md
    locator: "§3.2 / V2 Table 4（MobileNetV1 行，注意此处 MAdds 为 575M）"
    quote: "| MobileNetV1 | 70.6 | 4.2M | 575M | 113ms |"
    relation: supports
  - source: library/Efficient_Backbone/MobileNet.md
    locator: "§3.2 / V2 Table 4（MobileNetV2 行）"
    quote: "| MobileNetV2 | 72.0 | 3.4M | 300M | 75ms |"
    relation: supports
  - source: library/Efficient_Backbone/MobileNet.md
    locator: "§3.3 / V3 Table 3（V3-Large 1.0 行，MAdds 219 出自 Table 3 而非附录 Table 9 的 217）"
    quote: "| V3-Large 1.0 | 75.2 | 219 | 5.4M | 51 | 61 | 44 |"
    relation: supports
  - source: library/Efficient_Backbone/MobileNet.md
    locator: "遗留问题 8（V1/V2 跨论文 MAdds 口径差）"
    quote: "MobileNetV1 1.0-224 的 MAdds 在 V1 Table 6 作 569M，在 V2 Table 4 作 575M（同模型同分辨率）；引用时注意出处口径。"
    relation: supports
  - source: library/Efficient_Backbone/MobileNet.md
    locator: "遗留问题 2 复核注记（2026-11-03 verify 班：V2/V3 摘要百分点的版本裁定）"
    quote: "**最终出版版采用渲染侧（ar5iv）数字**；abs 页的 15%/4.6%/5%/30% 是与 PDF 脱节的元数据旧文（2026-11-03 重抓核实），不应再按 abs 页引用 V2/V3 摘要百分点。"
    relation: supports
  - source: https://ar5iv.labs.arxiv.org/html/1905.02244
    locator: "V3 Table 3 行；ar5iv 渲染版（无版本标注），2026-11-03 抓取；引句为 HTML 去标签 + math alttext 还原的归一化文本"
    quote: "V3-Large 1.0 75.2 219 5.4M 51 61 44"
    relation: supports
  - source: https://ar5iv.labs.arxiv.org/html/1801.04381
    locator: "V2 Table 4 行（同上抓取方式，2026-11-03）"
    quote: "MobileNetV2 72.0 3.4M 300M 75ms"
    relation: supports
  - source: https://ar5iv.labs.arxiv.org/html/1905.02244
    locator: "V3 摘要（ar5iv 渲染侧，2026-11-03；与 arXiv v5 PDF / CVF camera-ready 一致，abs 页元数据为脱节旧摘要，见笔记遗留问题 1/2）"
    quote: "3.2% more accurate on ImageNet classification while reducing latency by 20% compared to MobileNetV2"
    relation: supports
falsifiers:
  - "同一训练配方复现：V2（224/1.0）相对 V1 未能同时提升 top-1（72.0 vs 70.6）并降低 MAdds（300M vs 569M 口径）"
  - "V3-Large 复现 top-1 显著低于 75.2，或其 MAdds 既非 Table 3 的 219M 也非附录 Table 9 的 217M（差距远超舍入）；V3 论文内部 Table 3 vs Table 9 另有 67.4/67.5、39/39.8 两处出入（笔记遗留问题 3）"
  - "权威版本核对推翻 verify 班 2026-11-03 裁定：V2/V3 出版版摘要实为 abs 页口径（15%/4.6%），则本卡按 PDF 口径引用的 3.2%/20%、6.6% 失效"
review_due: 2026-12-03
related: [claim-mobilenet-dsc-8to9x-compute-reduction, claim-mobilenetv2-inverted-residual-linear-bottleneck, claim-mobileone-efficient-arch-sota-accuracy-latency]
signoff: null
---

## 我的理解

论文各自声称（尚未独立验证）：在 224 输入、width 1.0 的同点上，ImageNet top-1 / Mult-Adds 沿 V1→V2→V3 为 70.6%/569M → 72.0%/300M → 75.2%/219M（P-1 时延 64→51ms，按 V2/V3 各自 Table 口径）。V3 摘要百分点采用 PDF 口径：V3-Large 比 V2 +3.2 点、时延 −20%；V3-Small 对可比延迟 V2 +6.6%（arXiv v5 PDF 与 CVF camera-ready 一致；arXiv abs 页的 15%/4.6% 是脱节元数据，verify 班 2026-11-03 已裁定，见笔记遗留问题 1/2）。

三条引用纪律（本卡已按此执行）：
1. **MAdds 跨论文口径差**：同一 V1-224 模型在 V1 Table 6 记 569M、在 V2 Table 4 记 575M——引用任一数字必须带表号，不得混用得出「V2 虚报」或「V3 口径漂移」类结论。
2. **V3 内部两套数字**：Table 3 的 V3-Large MAdds 219 / V3-Small top-1 67.4 对附录 Table 9 的 217 / 67.5（官方 PDF 内部即不一致），本卡一律取 Table 3 并注明。
3. **时延口径**：V1/V2 为 TF-Lite Pixel-1 单大核，V3 另有 TFLite h-swish 原子算子优化——三代时延不能直接混比，绝对值仅在同代内可比。

## 待验证

- 用同一工具（如 fvcore/TorchVision 复现）重算三代 1.0-224 的 MAdds，给出第三方口径的 569/575 与 300、219 的对照。
- 用相同训练配方复训三点，看 70.6→72.0→75.2 的演进方向与幅度能否复现。
- 跟踪 arXiv 页面/勘误，确认摘要版本裁定未被推翻。

## 若成立 / 不成立意味着什么

成立：三代演进可作为「同预算下精度-开销逐年改善」的引用锚点；MobileOne 等后续工作 Table 9 转录的同套数字（V2 72.0/300M/0.98ms、V3-L 75.2/219/1.09ms）与之相容。
不成立：演进叙事要按复现口径重写，引用 V3 时优先附录 Table 9 或第三方复测数字。
