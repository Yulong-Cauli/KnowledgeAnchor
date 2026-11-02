---
id: claim-pdquant-note-table-mismatch
title: "PD-Quant 笔记三张表部分数字在论文 v1/v3/CVF 三个版本中均不存在（BRECQ 列、ResNet-50 2/2 行、Table 1 的 Min-Max/Cosine/W4A2 四值、Table 2 两个校准值与整行 +DC）"
type: claim
status: asserted
scope: "library/Quantization/PD-Quant.md §4.1 / §4.2 / §4.3 三张表（2026-11-03 修正前状态）；对照 arXiv:2212.07048 v1 与 v3、CVPR 2023 CVF camera-ready 三个版本逐格核对（2026-11-03 抓取，pdftotext -layout 提取）；不评价笔记 §1-§3 与 §5，不构成对 PD-Quant 方法本身的评价"
tags: [pdquant, note-quality, evidence, quantization]
note: library/Quantization/PD-Quant.md
paper: "CVPR 2023, PD-Quant: Post-Training Quantization based on Prediction Difference Metric (arXiv:2212.07048)"
stance: watch
evidence:
  - source: library/Quantization/PD-Quant.md
    locator: "§4.3 / 2026-11-03 数字修正注记"
    quote: "- **2026-11-03 数字修正**：原表 BRECQ 列（46.58/55.33/15.11/20.33）在论文 v1/v3/CVF 三个版本中均不存在——论文 Table 3 没有 BRECQ 基线，这些数在 QDrop 论文（arXiv:2203.05740v2）与 BRECQ 论文中也未命中，**「PD-Quant 均高于 BRECQ」的对比在论文中不存在**；ResNet-50 行原 61.94/63.15 同样三版本均不存在，论文该位宽行为 QDrop 55.45 / PD-Quant 57.16±0.15。依据同 §4.1 修正注记（同批三版本实抓核对）。"
    relation: supports
  - source: library/Quantization/PD-Quant.md
    locator: "§4.2 / 2026-11-03 数字修正注记"
    quote: "- **2026-11-03 数字修正**：原表 +Reg 校准 51.56%、+Drop 校准 53.07% 在论文 v1/v3/CVF 三个版本中均不存在（论文 Acc(cali) 为 71.09/68.26，且原表列序与论文相反——论文 val 在前）；原表整行「PD + Reg + Drop + DC 53.33%/53.14%」论文不存在。53.14 是论文 Table 3 完整方法 ResNet-18 2/2 的值，不是 Table 2 的 DC 行。依据同 §4.1 修正注记（同批三版本实抓核对）。"
    relation: supports
  - source: library/Quantization/PD-Quant.md
    locator: "§4.1 / 2026-11-03 数字修正注记"
    quote: "- **2026-11-03 数字修正**：原表 Min-Max 1.83/0.81、Cosine 23.36/15.68、MSE W4A2 17.55、PD W4A2 23.51 在论文 v1/v3/CVF 三个版本中均不存在——Min-Max 行原文即为「-」（无数字），Cosine 论文值 11.09/4.15，W4A2 列论文值 MSE 10.31 / PD 12.27；现按论文原表逐格重建（并补齐 ResNet-50 与 RegNet-600M 两组列）。依据：https://arxiv.org/pdf/2212.07048v3 、https://arxiv.org/pdf/2212.07048v1 、https://openaccess.thecvf.com/content/CVPR2023/papers/Liu_PD-Quant_Post-Training_Quantization_Based_on_Prediction_Difference_Metric_CVPR_2023_paper.pdf （2026-11-03 抓取，pdftotext -layout 提取，三版本表格一致；与 nightshift/cross/quantization.md §6-C1 交叉一致）。"
    relation: supports
  - source: https://arxiv.org/pdf/2212.07048v3
    locator: "Table 3（2/2 块 QDrop* 行，ResNet-18/ResNet-50 列为 51.42/55.45；pdftotext -layout 提取，仅去行首空白，抓取 2026-11-03）"
    quote: "QDrop*                          51.42         55.45            10.28             39.01              54.38            23.59"
    relation: supports
  - source: https://arxiv.org/pdf/2212.07048v3
    locator: "Table 3（2/2 块 PD-Quant 行，ResNet-50 列为 57.16±0.15，非笔记原 63.15；pdftotext -layout 提取，仅去行首空白，抓取 2026-11-03）"
    quote: "PD-Quant                      53.14±0.14    57.16±0.15       13.76±0.40        40.67±0.26         55.06±0.23       27.58±0.60"
    relation: supports
  - source: https://arxiv.org/pdf/2212.07048v3
    locator: "Table 2（2/2 块 PD+Reg+Drop 行，Acc(val)=52.74 / Acc(cali)=68.26，列序 val 在前且无 DC 行；pdftotext -layout 提取，仅去行首空白，抓取 2026-11-03）"
    quote: "PD+Reg+Drop                                                               52.74                      68.26"
    relation: supports
  - source: https://arxiv.org/pdf/2212.07048v3
    locator: "Table 1（Min-Max 行，ResNet-18/ResNet-50/RegNet-600M 六格原文均为「-」；pdftotext -layout 提取，仅去行首空白，抓取 2026-11-03）"
    quote: "Min-Max                                              -                          -                         -                                                -                         -                       -"
    relation: supports
  - source: https://arxiv.org/pdf/2212.07048v1
    locator: "Table 1-3（v1 与 v3 同表同值：Min-Max 行「-」、MSE 23.15/10.31、Cosine 11.09/4.15、PD 28.41/12.27；Table 2 校准 71.09/68.26；Table 3 QDrop 51.42/55.45；抓取 2026-11-03，pdftotext 提取）"
    quote: "Min-Maxl                                           -                           -                         -                                                -                         -                       -"
    relation: supports
  - source: https://openaccess.thecvf.com/content/CVPR2023/papers/Liu_PD-Quant_Post-Training_Quantization_Based_on_Prediction_Difference_Metric_CVPR_2023_paper.pdf
    locator: "Table 1-3（CVF camera-ready 与 arXiv v3 表格一致：2/2 块 QDrop 51.42/55.45、PD-Quant 53.14±0.14/57.16±0.15；Table 2 校准 71.09/68.26；抓取 2026-11-03，pdftotext 提取）"
    quote: "PD-Quant                      53.14±0.14    57.16±0.15       13.76±0.40        40.67±0.26         55.06±0.23       27.58±0.60"
    relation: supports
  - source: nightshift/cross/quantization.md
    locator: "§6-C1"
    quote: "- **C1 PD-Quant 笔记三张表部分数字在论文 v1/v3/CVF 三个版本中均不存在**（2026-11-03 抓取核对）："
    relation: supports
falsifiers:
  - "在论文任一版本（v1/v3/CVF 或其他 arXiv 版本）中找到原笔记所列任一数字：Table 3 的 BRECQ 列 46.58/55.33/15.11/20.33 或 ResNet-50 2/2 的 61.94/63.15，或 Table 1 的 1.83/0.81/23.36/15.68/17.55/23.51，或 Table 2 的 51.56/53.07 校准值或 53.33/53.14 的 +DC 行——则本卡不成立"
  - "若逐格复核发现本卡 evidence 引文与论文原表不符，则本卡不成立"
review_due: 2026-12-02
related: [claim-pdquant-beats-brecq-qdrop-lowbit, claim-pdquant-pd-metric-beats-mse-cosine-2bit-activation, claim-pdquant-pd-loss-alone-overfits-calibration, claim-pdquant-dc-bn-stats-narrow-calibration-val-gap, claim-omniquant-note-table-mismatch]
signoff: null
---

## 我的理解

笔记 §4 三张表与 CVPR 2023 论文（arXiv v1、v3、CVF camera-ready 三版本，本次抓取逐格核对，三版本表格彼此一致）存在多处「数字在论文任何版本都不存在」的错配，均为单点事实、可逐格证伪（本卡记录的是 2026-11-03 修正前的笔记状态）：

1. **Table 3 无 BRECQ 列**：原笔记 BRECQ 列（ResNet-18 46.58 / ResNet-50 55.33 / MobileNetV2 15.11 / MNasNet 20.33）在论文中不存在——论文 Table 3 基线是 ACIQ-Mix / LAPQ / Bit-Split / AdaRound / QDrop，无 BRECQ；这些数在 QDrop 论文（arXiv:2203.05740v2）与 BRECQ 论文中也未命中。原笔记 ResNet-50 2/2 行的 QDrop 61.94 / PD-Quant 63.15 同样三版本均不存在，论文原值为 QDrop 55.45 / PD-Quant 57.16±0.15。**「PD-Quant 均高于 BRECQ」的对比在论文中不存在**，[beats-brecq-qdrop 卡](claim-pdquant-beats-brecq-qdrop-lowbit.md) 的 BRECQ 半边主张（asserted）失去论文依据，其 falsifier 2 被触发。
2. **Table 1 四值不存在**：原笔记 Min-Max 1.83/0.81、Cosine 23.36/15.68、MSE W4A2 17.55、PD W4A2 23.51；论文对应为 Min-Max「-」（原文即无数字）、Cosine 11.09/4.15、MSE 23.15/10.31、PD 28.41/12.27（W8A2 的 MSE 23.15 与 PD 28.41 原本就与论文一致）。方向（PD > MSE > Cosine，Min-Max 无数字）与论文一致，但四个错值使 [pd-metric-beats-mse-cosine 卡](claim-pdquant-pd-metric-beats-mse-cosine-2bit-activation.md) 的具体数值主张受累（修正后方向主张仍成立）。
3. **Table 2 校准侧两值与整行 +DC 不存在**：原笔记 +Reg 校准 51.56%、+Drop 校准 53.07%、整行「PD + Reg + Drop + DC 53.33%/53.14%」；论文 Table 2 无 DC 行，+Reg/+Drop 的 Acc(cali) 实为 71.09/68.26，且论文列序是 Acc(val) 在前（原笔记两列写反）。核心的 PD-only 70.51(cali)/1.07(val) 分离仍与论文一致，[pd-loss-alone-overfits-calibration 卡](claim-pdquant-pd-loss-alone-overfits-calibration.md) 主张不受影响；[dc-bn-stats 卡](claim-pdquant-dc-bn-stats-narrow-calibration-val-gap.md) 的「+0.40%（52.74→53.14）」数值锚点失去原出处（本次另查明论文附录 Table 11 有真实 DC 消融：1024 张时 52.74→53.08，+0.34）。

**2026-11-03 笔记已修正**（依据：https://arxiv.org/pdf/2212.07048v3 、https://arxiv.org/pdf/2212.07048v1 、CVF camera-ready，2026-11-03 抓取，pdftotext -layout 提取，三版本一致，与 nightshift/cross/quantization.md §6-C1 交叉一致；本卡立卡与笔记修正经调度班次 [fix|P2] 任务授权）：三张表均已按论文原表逐格重建，各表附「2026-11-03 数字修正」注记记录修正前错值；四张 pdquant 卡的 evidence quote 已同步并加注。本卡 status 不动，人工复核是最终裁决。

## 待验证

- 用户逐格复核笔记 §4.1-§4.3 与 arXiv v3（或 CVF）原表（人工复核是本卡的最终裁决，见 falsifiers）。
- 原笔记 BRECQ 列四数（46.58/55.33/15.11/20.33）与 ResNet-50 行两数（61.94/63.15）的真实出处待查：本卡仅核实其不在 PD-Quant v1/v3/CVF、QDrop ICLR 2022 v2 与 BRECQ 论文中，不排除来自某个无法回溯的第三方汇总。
- 主人裁定 beats-brecq-qdrop 卡（BRECQ 半边证伪）与 dc-bn-stats 卡（+0.40% 锚点失效）的后续处理：改写主张、拆卡或降级。

## 若成立 / 不成立意味着什么

成立：修正前笔记 §4 三张表的具体数字不可引用，引用须回论文原表（与 OmniQuant/EMC2 mismatch 卡同款教训）；修正后笔记数字以论文原表为准。受累四卡按各自卡内注记处理，status 均未动。
不成立：逐格复核确认原笔记与论文某版本一致，说明本卡核对有误，改判/撤卡并回滚笔记修正。
