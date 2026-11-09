---
id: claim-lsq-3bit-distillation-matches-full-precision
title: "LSQ 自报：3-bit 全量化网络加同架构知识蒸馏首次（作者所知）达到全精度基线精度（ResNet-18 70.6 vs 70.5、ResNet-34 74.3 vs 74.1、ResNet-50 76.9 vs 76.9）"
type: claim
status: asserted
scope: "ImageNet；pre-activation ResNet-18/34/50；权重与激活 3-bit（首末层 8-bit）；教师 = 同架构冻结权重的全精度模型（Hinton 蒸馏 loss、温度 1、标准 loss 与蒸馏 loss 等权）；对照基线为 Table 1 的全精度 top-1（70.5/74.1/76.9）；'首次' 为论文自报（"for the first time that we are aware of"）；论文自报"
tags: [quantization, qat, lsq, knowledge-distillation, 3bit]
note: library/Quantization/LSQ.md#36-知识蒸馏增益37-table-4
paper: "ICLR 2020（arXiv:1902.08153）, Learned Step Size Quantization（IBM Research；论文未给官方代码链接）"
stance: watch
evidence:
  - source: library/Quantization/LSQ.md
    locator: "§1（论文自报的 first 声明，笔记转引）"
    quote: "for the first time that we are aware of, demonstrate the milestone of 3-bit quantized networks reaching full precision network accuracy"
    relation: supports
  - source: library/Quantization/LSQ.md
    locator: "§3.7 / Table 4（ResNet-18 行；Top-1 32bit 列 70.5 = 全精度基线）"
    quote: "| ResNet-18 | 67.9 | 70.6 | 71.2 | 71.1 | 70.5 | 88.1 | 89.7 | 90.1 | 90.1 | 89.6 |"
    relation: supports
  - source: library/Quantization/LSQ.md
    locator: "§3.7 / Table 4（ResNet-34 行）"
    quote: "| ResNet-34 | 72.4 | 74.3 | 74.8 | 74.1 | 74.1 | 90.8 | 91.8 | 92.1 | 91.7 | 91.8 |"
    relation: supports
  - source: library/Quantization/LSQ.md
    locator: "§3.7 / Table 4（ResNet-50 行）"
    quote: "| ResNet-50 | 74.6 | 76.9 | 77.6 | 76.8 | 76.9 | 92.1 | 93.4 | 93.7 | 93.3 | 93.4 |"
    relation: supports
  - source: library/Quantization/LSQ.md
    locator: "§3.7 结果句（笔记数字对账）"
    quote: "结果（§3.7）：蒸馏使 top-1 最多提升 1.1（3-bit ResNet-50），且 3-bit 网络达到全精度基线精度（对比 Table 1：ResNet-18 70.6 vs 70.5，ResNet-34 74.3 vs 74.1，ResNet-50 76.9 vs 76.9）。"
    relation: supports
falsifiers:
  - "复现任一架构（ResNet-18/34/50）3-bit+蒸馏 top-1 低于其全精度基线（70.5/74.1/76.9）超正常方差"
  - "消融显示增益不来自蒸馏（如蒸馏 Δ≤0 或全精度学生对照同样 '无增益' 的前提不成立）"
  - "发现更早的 3-bit（权重+激活同 bit）量化网络达到全精度精度的工作，推翻论文自报 first"
review_due: 2026-12-03
related: [claim-lsq-top1-beats-previous-2-3-4bit]
signoff: null
---

## 我的理解

论文声称（asserted）：LSQ 3-bit 网络 + 同架构全精度教师的知识蒸馏（温度 1、等权 loss）后，top-1 达到或略超全精度基线——ResNet-18 70.6 vs 70.5、ResNet-34 74.3 vs 74.1、ResNet-50 76.9 vs 76.9（Table 4 的 32bit 列与 Table 1 的 Full precision 行互为印证，两处数字一致）；蒸馏本身带来最多 +1.1（3-bit ResNet-50，76.9 vs Table 1 无蒸馏 75.8）。

必须记住的口径限定：

1. **"达到全精度" 是 0.1–0.2 点量级的擦线**：三个架构分别是 +0.1 / +0.2 / +0.0，落在单次训练方差边缘；复现时要用多 seed 平均判定，不能凭单次 ±0.1 就证真/证伪。
2. **蒸馏的对照面窄**：论文的对照实验只验证了"全精度教师蒸馏到全精度（未训练）学生无增益"，没有报告无蒸馏 3-bit 在完全相同 schedule 下的多 seed 对照（Table 1 与 Table 4 的 schedule 是否逐项一致笔记未注明）——+1.1 里有多少纯归蒸馏需复现拆分。
3. **first 是作者所知范围的自报**，且"3-bit 网络"指权重+激活同 3-bit、首末层 8-bit 的 LSQ 配置。
4. 2-bit 不在此列：论文明确 2-bit 尚不能追平全精度（67.9 vs 70.5，差 2.6）；本卡主张不含 2-bit。

原文复核：ar5iv（https://ar5iv.labs.arxiv.org/html/1902.08153 ）2026-11-03 实抓，Table 4 三行 top-1（67.9/70.6/71.2/71.1/70.5 等）与 §1 "milestone" 句逐字核对一致。

## 待验证

- 复现 3-bit ResNet-18 + 蒸馏，多 seed 平均对照 70.5（判定擦线成立与否）。
- 同 schedule 跑无蒸馏 3-bit 对照，拆分蒸馏净增益（对照 +1.1）。
- 检索 2020 年前文献核实 first 声明（如 3-bit 权重+激活、ImageNet、追平 FP 的工作）。

## 若成立 / 不成立意味着什么

成立：3-bit 全量化 + 蒸馏可作为"逼近 FP 精度"的参考点，量化选型在 3-bit 档有无损路线（代价是 90 epochs QAT + 蒸馏设施）。
不成立：擦线成立依赖单次运行的方差或 schedule 差异，"3-bit 达 FP"降级为近似达标，量化预算规划需保守按 4-bit。
