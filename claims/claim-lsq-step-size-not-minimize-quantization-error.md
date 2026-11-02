---
id: claim-lsq-step-size-not-minimize-quantization-error
title: "LSQ 论文自报的负面发现（§3.6）：学到的步长并不最小化量化误差——2-bit ResNet-18 上 ŝ 与误差最优 s 的平均绝对百分比差为激活 50/63/64%、权重 47/28/46%（MAE/MSE/KL），任务 loss 驱动的步长学习 ≠ 量化误差最小化"
type: claim
status: asserted
scope: "ImageNet；2-bit（W2A2）pre-activation ResNet-18 的 LSQ QAT 微调模型（90 epochs，从全精度权重初始化，首末层 8-bit）；§3.6 分析方法：对每层记 LSQ 最终步长 ŝ，在 S={0.01ŝ, 0.02ŝ, …, 20.00ŝ} 网格上按一个 batch 测试数据找最小化 MAE / MSE / KL 散度的 s，与 ŝ 比较；学到的步长本身为激活 ŝ=0.949±0.206、权重 ŝ=0.025±0.019（mean±std）；本卡只主张'学到的步长 ≠ 量化误差最优点'这一负面发现，不主张'拟合数据分布的量化器必然任务性能更差'（后者是论文的推测性解释，§3.6 末句）；论文声称，尚未独立验证；其他架构 / 其他比特数未做该分析"
tags: [lsq, quantization, qat, negative-finding, step-size, imagenet]
note: library/Quantization/LSQ.md#35-量化误差分析
paper: "ICLR 2020（arXiv:1902.08153）, Learned Step Size Quantization（IBM Research；论文未给官方代码链接）"
stance: watch
evidence:
  - source: library/Quantization/LSQ.md
    locator: '§3.5 量化误差分析（论文 §3.6）'
    quote: '问题：LSQ 学到的步长是不是在最小化量化误差？做法（§3.6）：对每层，记 LSQ 最终步长为 $\hat{s}$，在 $S=\{0.01\hat{s},0.02\hat{s},...,20.00\hat{s}\}$ 中找一个 batch 测试数据上最小化 MAE / MSE / KL 散度的 $s$，与 $\hat{s}$ 比较。'
    relation: supports
  - source: library/Quantization/LSQ.md
    locator: '§3.5 量化误差分析（论文 §3.6）'
    quote: '学到的步长：激活 $\hat{s}=0.949\pm0.206$，权重 $\hat{s}=0.025\pm0.019$（mean ± std）'
    relation: supports
  - source: library/Quantization/LSQ.md
    locator: '§3.5 量化误差分析（论文 §3.6）'
    quote: '$\hat{s}$ 与最小化量化误差的 $s$ 的平均绝对百分比差：激活层 MAE 50% / MSE 63% / KL 64%；权重层 MAE 47% / MSE 28% / KL 46%。'
    relation: supports
  - source: library/Quantization/LSQ.md
    locator: '§3.5 量化误差分析（论文 §3.6 结论原句）'
    quote: This indicates that LSQ learns a solution that does not in fact minimize quantization error.
    relation: supports
  - source: library/Quantization/LSQ.md
    locator: '§4 核心结论'
    quote: '值得注意的负面发现：LSQ 学到的解并不最小化量化误差（MSE/MAE/KL 三种度量均如此，§3.6、§4）——任务 loss 驱动的步长学习 ≠ 误差最小化。'
    relation: supports
  - source: https://ar5iv.labs.arxiv.org/html/1902.08153
    locator: '§3.6 Quantization error analysis（ar5iv 全文 HTML，2026-11-03 抓取）'
    quote: This indicates that LSQ learns a solution that does not in fact minimize quantization error.
    relation: supports
  - source: https://ar5iv.labs.arxiv.org/html/1902.08153
    locator: '§4 Conclusions（ar5iv 全文 HTML，2026-11-03 抓取）'
    quote: Interestingly, LSQ does not appear to minimize quantization error, whether measured using mean square error, mean absolute error, or Kullback-Leibler divergence.
    relation: supports
falsifiers:
  - "按论文 §3.6 协议复算（同 0.01ŝ–20.00ŝ 网格、同 batch 测试数据）：若 2-bit ResNet-18 各层 ŝ 与 MAE/MSE/KL 最优 s 的平均绝对百分比差普遍降到个位数（<10%），则'不最小化量化误差'不成立"
  - "官方或高保真第三方 LSQ 复现在其他架构（如 ResNet-50/VGG-16bn）或其他比特数上学到的步长系统性地落在量化误差最优点附近，说明该负面发现只是 2-bit ResNet-18 的特例而非方法性质"
  - "查得 arXiv 其他版本或 ICLR 2020 正式版中 §3.6 的数字/结论句与上述不同（说明笔记转写有误，需修卡）"
review_due: 2026-12-03
related: [claim-lsq-top1-beats-previous-2-3-4bit, claim-lsq-3bit-distillation-matches-full-precision]
signoff: null
---

## 我的理解

这是 LSQ 论文里少见的"作者自己拆自己方法机制"的诚实注记型负面发现：LSQ 用任务 loss 的梯度学步长，但 §3.6 的量化误差分析显示，学到的 ŝ 与"在同一 batch 数据上最小化 MAE/MSE/KL 的 s"平均差 28–64%（激活层 50/63/64%，权重层 47/28/46%），且结论句明确 "does not in fact minimize quantization error"，§4 结论又以 "Interestingly" 重申三种误差度量均如此。

依赖的前提：(a) 分析对象是 2-bit ResNet-18 这一个点，作者未对其他架构/比特数做同样分析；(b) "误差最优 s" 的定义依赖其网格（0.01ŝ–20.00ŝ）与单 batch 数据，不是全局最优；(c) 论文随后给的解释（直接拟合数据分布未必对任务最优）是推测，不是本卡主张。

这个发现与 related 两张卡的正面结果（LSQ top-1 超过此前所有方法、3-bit+蒸馏追平全精度）合起来读才有意义：LSQ 赢过那些"以最小化量化误差为目标的经典方法"（QIL/LQ-Nets/PACT 等，Table 1），恰恰说明任务 loss 驱动的步长不必也不该收敛到误差最小点。选型时若有人提议"先按 MSE/KL 网格搜索离线定步长、再 QAT"，本卡是直接反例锚点。

数字与两句结论原文已于 2026-11-03 实抓 ar5iv 全文 HTML（https://ar5iv.labs.arxiv.org/html/1902.08153 ）逐字复核命中（§3.6 与 §4 两处）。

## 待验证

- 用第三方 LSQ 实现（如 NNI 的 LSQ 量化器）复现 2-bit ResNet-18，按 §3.6 协议复算 ŝ 与误差最优 s 的偏差分布，看 28–64% 是否可复现。
- 把同一分析扩展到 3/4-bit 与 ResNet-50/VGG-16bn，检验"不最小化量化误差"是否跨设置成立。
- 检验解释性命题（不在本卡主张内）：在 LSQ 训练中显式加入量化误差正则，精度会变好还是变坏。

## 若成立 / 不成立意味着什么

成立：量化参数的"最优"定义应服从任务 loss 而非重构误差——做 PTQ/QAT 选型时不能默认"校准准则越接近分布拟合越好"；凡以 MSE/KL 最小化为核心卖点的量化方法，需要拿任务精度而非误差指标说话。
不成立：LSQ 的优势需另找解释（如梯度尺度启发式或训练日程），"任务驱动步长 ≠ 误差最小点"的机制叙事不成立，涉及量化器设计的方案论证应回到误差最小化基线。
