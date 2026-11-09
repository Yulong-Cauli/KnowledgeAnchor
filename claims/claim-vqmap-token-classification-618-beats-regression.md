---
id: claim-vqmap-token-classification-618-beats-regression
title: "论文声称：同一 Token Decoder 下，预测离散 Token 索引（Focal Loss，61.8 mIoU）优于回归连续/量化向量（MSE，60.3/60.1）"
type: claim
status: asserted
scope: "nuScenes val 环视 BEV 地图分割；消融实验：同一 Token Decoder 架构、仅更换监督信号——回归连续向量 z_c（MSE，60.3）、回归量化向量 z_q（MSE，60.1）、预测离散 Token 索引（Focal Loss，61.8）；数字已对照 arXiv:2411.01618 Table 4 核实与笔记一致（对应表中 (d)(e)(f) 三列的 Mean 行，2026-11-02 抓取）；2026-11-05 复抓：Table 4 原注确认 (d)(e)(f) 同架构（稀疏特征 + 码本嵌入）仅监督不同，消融统一用 6 层 / 512 维 token decoder（主表默认 8 层）；均为论文自报"
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
  - source: https://arxiv.org/pdf/2411.01618
    locator: "§4.3 Token Decoder Parameters 段末（消融统一用 6 层/512 维的原文表述，解释消融数字低于主表 62.2 的配置差异；pdftotext -layout 提取，抓取 2026-11-05）"
    quote: "Note that the following ablation studies all employ 6 layers and 512 dimension."
    relation: supports
falsifiers:
  - "〔同范围复现（主张侧+对照侧）〕同架构复现中，Focal Loss 离散 Token 分类的 mIoU 低于连续回归（MSE）的 60.3"
  - "〔同范围复现（效应量）〕两种监督的差距消失（如复现差距 <0.1 mIoU），或分类路线需额外调参（码本大小、Focal gamma）才能反超"
  - "〔原文核查 / 同范围复现（对照条件）〕消融实际同时改动了其它变量（如 Patch 大小、解码器结构、训练时长），差距并非来自监督信号本身——Table 4 原注已确认 (d)(e)(f) 同为稀疏特征 + 码本嵌入架构、仅监督不同（2026-11-05 抓取在案），此条降为复现级核查"
review_due: 2026-12-02
related: [claim-vqmap-nuscenes-map-miou-622-leads-table]
signoff: null
---

## 我的理解

论文声称：VQ-Map 的核心增益来自"把连续回归问题改成离散分类问题"——同一 Token Decoder，仅把监督信号从 MSE 回归（连续向量 60.3 / 量化向量 60.1）换成 Focal Loss 的 Token 索引多分类，mIoU 升到 61.8（+1.5 ~ +1.7）。论文的解释是分类把受遮挡噪声污染的 3D 回归变成抗噪的明确类别判定。差距只有 1.5~1.7 mIoU 量级，属于"消融撑得起但不算强"的窄主张。

必须记住的限定（2026-11-05 复抓后更新）：三种监督对应的 61.8/60.3/60.1 都低于主表 62.2（§4.1）——配置差异来源已查明：论文明确消融实验统一用 6 层 / 512 维 token decoder，而主表默认 8 层（见 evidence）；61.8→62.2 的 +0.4 与论文"6→8 层提升边际"的描述量级相符（本班整理者对读，非论文原话）。"抗噪性极强"是论文叙述（笔记转述为"降维打击"），不是被隔离验证的机制。

**复审更新（2026-11-02）**：数字已对照 arXiv:2411.01618 Table 4 核实——该消融是表中 (d)(e)(f) 三列（(d) 未离散化隐变量 / (e) 码本离散化隐变量 / (f) 码本索引，即笔记的三行），Mean 行 60.3/60.1/61.8 与笔记一致；论文表中另有 (a)(b)(c)(g) 列与逐类数字，笔记只抄了 Mean。

**复审更新（2026-11-05）**：实抓 Table 4 原注核实两点——① (d)(e)(f) 为同架构（稀疏特征 + 码本嵌入）仅监督不同（"comparing different supervisions during the PV-BEV alignment training"，与 11-02 读法一致）；② 消融低于主表 62.2 的配置差异来源为 token decoder 层数（消融统一 6 层 vs 主表默认 8 层，见新增 evidence）。

## 待验证

- 已核对（2026-11-02 + 2026-11-05 复抓）：arXiv:2411.01618 Table 4 (d)(e)(f) 列 Mean 60.3/60.1/61.8 与笔记一致（见 evidence）；(d)(e)(f) 同架构仅监督不同、消融统一 6 层 vs 主表 8 层（表原注与实现细节在案）。
- 用开源仓库复现该消融：固定架构与超参（6 层 / 512 维），仅切换监督信号，确认 61.8 vs 60.3/60.1 的方向与量级。
- 附加实验：把 Focal Loss 换成 CE，验证增益来自"分类形式"还是"Focal 的样本加权"。

## 若成立 / 不成立意味着什么

成立：BEV 稠密预测任务中"码本 + Token 分类"比直接回归连续特征更抗遮挡噪声，可作为同类任务（BEV 分割 / 占用）设计的默认消融项。
不成立：增益来自未控制的其它变量或随机波动，"分类优于回归"的机制叙事不成立，引用 VQ-Map 时只能说它的整体 pipeline 有效，不能归因到离散化。

## 核查记录

- 2026-11-05（P1-B7b 零散组）：本卡 3 条 library 笔记引句经 grep -F 逐字验证全部命中（library/Quantization/VQ-Map.md §4.3 消融表三行）；11-02 的 2 条 arXiv 引句（Table 4 caption 跨行还原句 + Mean 行）经 11-05 复抓逐字一致（caption 跨行按空格还原后与卡内 quote 一致）。同日实抓补充两点：① Table 4 原注确认 (d)(e)(f) 为同架构不同监督（与 11-02 读法一致），falsifier 3 的"同时改动其它变量"疑虑在原文层面降级为复现级核查；② 消融数字低于主表的配置差异来源已查明——论文 §4.3 明确消融统一用 6 层 / 512 维 token decoder（主表默认 8 层），新增该句为 evidence（抓取 2026-11-05），卡内"笔记未解释"缺口关闭。scope、falsifiers 分层标注、正文限定与复审段、待验证已同步更新。论文数字未改写，status/stance/related 不变。
