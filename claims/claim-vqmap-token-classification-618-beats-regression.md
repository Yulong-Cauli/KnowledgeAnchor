---
id: claim-vqmap-token-classification-618-beats-regression
title: "论文声称：同一 Token Decoder 下，预测离散 Token 索引（Focal Loss，61.8 mIoU）优于回归连续/量化向量（MSE，60.3/60.1）"
type: claim
status: asserted
scope: "nuScenes val 环视 BEV 地图分割；消融实验：同一 Token Decoder 架构、仅更换监督信号——回归连续向量 z_c（MSE，60.3）、回归量化向量 z_q（MSE，60.1）、预测离散 Token 索引（Focal Loss，61.8）；数字已对照 arXiv:2411.01618 Table 4 核实与笔记一致（对应表中 (d)(e)(f) 三列的 Mean 行，2026-11-02 抓取）；均为论文自报；笔记未注明该消融是否固定了码本大小、Patch 大小与训练轮数等其它超参"
tags: [bev, map-segmentation, vqvae, ablation, classification-vs-regression, nuscenes, vq-map]
note: library/Quantization/VQ-Map.md#43-消融实验为什么用离散分类代替连续回归
paper: "NeurIPS 2024, VQ-Map (arXiv:2411.01618)（代码：https://github.com/Z1zyw/VQ-Map）"
stance: watch
evidence:
  - source: library/Quantization/VQ-Map.md
    locator: "§4.3 / 消融表"
    quote: "| **预测离散 Token 索引**     | **Focal Loss** | **61.8** | **将不确定的 3D 回归降维打击为有明确类别的多分类任务，抗噪性极强** |"
    relation: supports
  - source: library/Quantization/VQ-Map.md
    locator: "§4.3 / 消融表"
    quote: "| 回归连续向量 $\mathbf{z}_c$ | MSE            | 60.3     | 空间维度直接算 L2 距离，梯度极易受图像遮挡噪声影响           |"
    relation: supports
  - source: library/Quantization/VQ-Map.md
    locator: "§4.3 / 消融表"
    quote: "| 回归量化向量 $\mathbf{z}_q$ | MSE            | 60.1     | 同上                                                         |"
    relation: supports
  - source: https://arxiv.org/pdf/2411.01618
    locator: "Table 4 caption（(d)(e)(f) 三种监督的定义，跨行已按空格还原；pdftotext -layout 提取，抓取 2026-11-02）"
    quote: "The supervision signals shown in columns (d), (e) and (f) are the explored three kinds of intermediate results in Sec. 3.1."
    relation: supports
  - source: https://arxiv.org/pdf/2411.01618
    locator: "Table 4（Mean 行，(d)=60.3 (e)=60.1 (f)=61.8；pdftotext -layout 提取，抓取 2026-11-02）"
    quote: "Mean                              56.4     56.3          59.8      60.3        60.1        61.8        61.6"
    relation: supports
falsifiers:
  - "同架构复现中，Focal Loss 离散 Token 分类的 mIoU 低于连续回归（MSE）的 60.3"
  - "两种监督的差距消失（如复现差距 <0.1 mIoU），或分类路线需额外调参（码本大小、Focal gamma）才能反超"
  - "消融实际同时改动了其它变量（如 Patch 大小、解码器结构、训练时长），差距并非来自监督信号本身"
review_due: 2026-12-02
related: [claim-vqmap-nuscenes-map-miou-622-leads-table]
signoff: null
---

## 我的理解

论文声称：VQ-Map 的核心增益来自"把连续回归问题改成离散分类问题"——同一 Token Decoder，仅把监督信号从 MSE 回归（连续向量 60.3 / 量化向量 60.1）换成 Focal Loss 的 Token 索引多分类，mIoU 升到 61.8（+1.5 ~ +1.7）。论文的解释是分类把受遮挡噪声污染的 3D 回归变成抗噪的明确类别判定。该主张尚未独立验证，且差距只有 1.5~1.7 mIoU 量级，属于"消融撑得起但不算强"的窄主张。

必须记住的限定：三种监督对应的 61.8/60.3/60.1 都低于主表 62.2（§4.1），说明该消融配置与主表结果还有配置差异，笔记未解释；"抗噪性极强"是论文叙述，不是被隔离验证的机制。

**复审更新（2026-11-02）**：数字已对照 arXiv:2411.01618 Table 4 核实——该消融是表中 (d)(e)(f) 三列（(d) 未离散化隐变量 / (e) 码本离散化隐变量 / (f) 码本索引，即笔记的三行），Mean 行 60.3/60.1/61.8 与笔记一致；论文表中另有 (a)(b)(c)(g) 列与逐类数字，笔记只抄了 Mean。

## 待验证

- 已核对（2026-11-02）：arXiv:2411.01618 Table 4 (d)(e)(f) 列 Mean 60.3/60.1/61.8 与笔记一致（见 evidence）。
- 待补：确认消融配置与主表的差异来源（为何都低于 62.2）。
- 用开源仓库复现该消融：固定架构与超参，仅切换监督信号，确认 61.8 vs 60.3/60.1 的方向与量级。
- 附加实验：把 Focal Loss 换成 CE，验证增益来自"分类形式"还是"Focal 的样本加权"。

## 若成立 / 不成立意味着什么

成立：BEV 稠密预测任务中"码本 + Token 分类"比直接回归连续特征更抗遮挡噪声，可作为同类任务（BEV 分割 / 占用）设计的默认消融项。
不成立：增益来自未控制的其它变量或随机波动，"分类优于回归"的机制叙事不成立，引用 VQ-Map 时只能说它的整体 pipeline 有效，不能归因到离散化。
