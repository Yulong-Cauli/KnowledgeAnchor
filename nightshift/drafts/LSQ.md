# LSQ: Learned Step Size Quantization

**出处会议：** ICLR 2020（arXiv:1902.08153，Esser, McKinstry, Bablani, Appuswamy, Modha，IBM Research）  
**是否开源：** 官方未开源（本次抓取的 arXiv abs 页与 ar5iv 全文经检索均无代码仓库链接；论文仅声明 "We implemented and tested LSQ in PyTorch"，§2.3）  
**关键词：** 量化感知训练 (QAT)、可学习量化步长 (Learned Step Size)、均匀量化 (Uniform Quantizer)、步长梯度尺度 (Step Size Gradient Scale)、低比特 (2/3/4-bit)、ImageNet

> **Locator 约定：** 本笔记章节号（§1–§4，Appendix A/B）、公式号（式 (1)–(11)）、表号（Table 1–4）均指 arXiv:1902.08153 的 ar5iv HTML 版（https://ar5iv.labs.arxiv.org/html/1902.08153 ，抓取日期 2026-11-02）的编号，与 ICLR 2020 正式版一致（该文正文即 4 节 + 2 个附录）。英文引号内文字为本次实际抓取的逐字原文；所有数字均为论文声称，未经独立验证。公式按 LaTeX 转写（原文 `\nicefrac` 渲染为分数、编号取自 ar5iv 的 `S2.E*` / `A1.E*` / `A2.E*` 标签），语义与原文一致；表格除粗体标注与"—"（原文空格，未报告）外逐行照抄，并经脚本对抓取文本逐行核验。

---

## 1. 概述

LSQ 要解决的问题：低精度（2/3/4-bit）量化网络训练中，**量化器本身的配置（步长 step size）如何学**。此前工作要么用固定/统计方法配置量化器，要么用近似梯度学习量化参数，但都忽略了量化状态切换点（transition point）附近的梯度信息。

论文的两个关键贡献（§1）：

1. **对步长的梯度近似**：给出一个对量化状态切换敏感（sensitive to quantized state transitions）的步长梯度——离切换点越近，$\partial\hat{v}/\partial s$ 越大，从而对步长做更细粒度的优化（§2.1）。
2. **步长梯度尺度启发式**：用一个简单的比例因子把步长更新幅度与权重更新幅度配平，作者声称该操作改善收敛（§2.2）。

论文摘要自述（Abstract）：

> "Specifically, we introduce a novel means to estimate and scale the task loss gradient at each weight and activation layer’s quantizer step size, such that it can be learned in conjunction with other network parameters."

论文声称的结果量级（§1，Table 1 / Table 4）：

- 在 ImageNet 上，对所测各架构（pre-activation ResNet、VGG-16bn、SqueezeNext-23-2x），2/3/4-bit 下 top-1 精度高于此前所有已报告方法（§3.2）；
- 论文声称 "for the first time that we are aware of, demonstrate the milestone of 3-bit quantized networks reaching full precision network accuracy"（§1）——3-bit 网络首次达到全精度基线精度（配合知识蒸馏，§3.7）；
- 方法只需每层（权重/激活）多一个参数，"requires only a simple modification of existing training code"（Abstract）。

---

## 2. 方法

### 2.1 量化器定义（§2 开头，式 (1)(2)）

给定待量化数据 $v$、步长 $s$、正/负量化级数 $Q_P, Q_N$：

$$\bar{v}=\lfloor \mathrm{clip}(v/s,\,-Q_N,\,Q_P)\rceil \qquad\text{（原文式 (1)）}$$

$$\hat{v}=\bar{v}\times s \qquad\text{（原文式 (2)）}$$

其中 $\mathrm{clip}(z,r_1,r_2)$ 把低于 $r_1$ 的值置为 $r_1$、高于 $r_2$ 的置为 $r_2$，$\lfloor z\rceil$ 为四舍五入到最近整数。比特数 $b$ 下：无符号数据（激活）$Q_N=0,\ Q_P=2^b-1$；有符号数据（权重）$Q_N=2^{b-1},\ Q_P=2^{b-1}-1$（§2）。

推理时 $\bar{w},\bar{x}$ 直接进低精度整数矩阵乘法单元，输出用低开销高精度标量-张量乘法按步长缩放，该步可与 batch norm 等代数合并（§2，Figure 1）。

### 2.2 步长梯度（§2.1，式 (3)）

LSQ 通过 straight through estimator（Bengio et al. 2013）近似 round 的梯度为直通、对其余运算正常求导，得到步长的梯度：

$$\frac{\partial\hat{v}}{\partial s}=\begin{cases}-v/s+\lfloor v/s\rceil & \text{if } -Q_N < v/s < Q_P\\ -Q_N & \text{if } v/s \le -Q_N\\ Q_P & \text{if } v/s \ge Q_P\end{cases}\qquad\text{（原文式 (3)）}$$

推导自述（§2.1）：

> "This gradient is derived by using the straight through estimator (Bengio et al. 2013) to approximate the gradient through the round function as a pass through operation (though leaving the round itself in place for the purposes of differentiating down stream operations), and differentiating all other operations in Equations 1 and 2 normally."

与 QIL、PACT 的区别（§2.1，Figure 2）：在区间内（未到 clip 点），QIL 的梯度为 0、PACT 在 clip 点以下梯度处处为 0，而 LSQ 的梯度 $-v/s+\lfloor v/s\rceil$ 随 $v$ 靠近任一量化切换点而增大。作者的解释：$v$ 离切换点越近，步长的微小更新越可能使其跳到相邻量化 bin、造成 $\hat{v}$ 的大跳变，因此梯度理应越大（§2.1）。

**步长参数化与初始化**（§2.1 末段）：每层权重、每层激活各有一个独立步长，fp32 表示；初始化为 $s_0 = 2\langle|v|\rangle/\sqrt{Q_P}$（原文无编号，内联公式），分别按初始权重值或第一批激活计算。

### 2.3 步长梯度尺度（§2.2，式 (4)）

依据 You et al. 2017 的结论——各权重层"平均更新幅度/平均参数幅度"比值近似一致时收敛好——作者要求步长的该比值也应与权重相当，定义：

$$R=\left.\frac{\nabla_s L}{s}\middle/\frac{\lVert\nabla_w L\rVert}{\lVert w\rVert}\right. \qquad\text{（原文式 (4)）}$$

期望 $R$ 平均接近 1。但步长随精度提高而变小（量化更细）、其梯度又随被量化元素数增多而变大，故将步长 loss 乘以梯度尺度 $g$（§2.2，内联公式，原文无编号）：

- 权重步长：$g = 1/\sqrt{N_W Q_P}$，$N_W$ 为该层权重数；
- 激活步长：$g = 1/\sqrt{N_F Q_P}$，$N_F$ 为该层特征数。

**Appendix A 推导要点**（式 (6)–(10)，三层近似）：(a) $l_2$ 范数期望随元素数的平方根增长，且 $Q_P=1$ 时步长约等于平均权重幅值、$Q_P$ 更大时步长 $\propto 1/\sqrt{Q_P}$，得

$$\lVert w\rVert/s \approx \sqrt{N_W Q_P} \qquad\text{（原文式 (6)）}$$

(b) 由链式法则 $\nabla_s L=\sum_{i=1}^{N_W}\frac{\partial L}{\partial\hat{w}_i}\frac{\partial\hat{w}_i}{\partial s}$（原文式 (7)），假设 $\partial\hat{w}_i/\partial s$ 接近 1、各 $\partial L/\partial\hat{w}_i$ 为不相关零均值随机变量，得 $\mathrm{E}[\nabla_s L^2]\approx N_W\times\mathrm{E}[(\partial L/\partial\hat{w})^2]$（原文式 (8)）；再由大多数权重 $\partial\hat{w}/\partial w=1$，得 $\mathrm{E}[\lVert\nabla_w L\rVert^2]\approx N_W\times\mathrm{E}[(\partial L/\partial\hat{w})^2]$（原文式 (9)）。两者同阶，故

$$R\approx\sqrt{N_W Q_P} \qquad\text{（原文式 (10)）}$$

取其逆即得权重步长的 $g$。激活侧：多数激活层前置 batch norm，用同样思路可得步长更新与激活变化的失衡随 $N_F$ 与 $Q_P$ 增长，故 $g=1/\sqrt{N_F Q_P}$（Appendix A 末段，原文无编号）。消融见 §3.4。

### 2.4 训练（§2.3，式 (5)）

训练采用常见的量化网络训练方式（Courbariaux et al. 2015）：存储并更新全精度权重，前向/反向用量化后的权重和激活；round 的梯度用 straight through estimator：

$$\frac{\partial\hat{v}}{\partial v}=\begin{cases}1 & \text{if } -Q_N < v/s < Q_P\\ 0 & \text{otherwise}\end{cases}\qquad\text{（原文式 (5)）}$$

训练细节（§2.3）：

- 除第一层和最后一层恒为 8-bit 外，所有矩阵乘层的输入激活与权重设为 2/3/4/8-bit（§2.3）；
- 实现上只需两个非标准梯度函数：gradscale（前向返回原值、反向按 scale 缩放梯度）与 roundpass（前向 round、反向直通），均用 $y=\mathrm{detach}(x_1-x_2)+x_2$ 的 detach 技巧实现（原文式 (11)，Appendix B Function 1–3 含 quantize 伪代码：激活 $Q_n=0, Q_p=2^p-1$、权重 $Q_n=-2^{p-1}, Q_p=2^{p-1}-1$，梯度尺度因子 $1/\sqrt{nfeatures(v)\times Q_p}$ 或 $1/\sqrt{nweights(v)\times Q_p}$）；
- 量化网络从同架构全精度模型权重初始化后在量化空间微调（§2.3）；
- momentum 0.9，softmax cross-entropy loss，cosine 学习率衰减无重启；8-bit 网络训 1 epoch，其余 90 epochs；初始学习率：全精度 0.1，2/3/4-bit 0.01，8-bit 0.001（§2.3）；
- 数据集 ImageNet；架构为 pre-activation ResNet（He et al. 2016）、带 BN 的 VGG（Simonyan & Zisserman 2014）、SqueezeNext（Gholami et al. 2018）；VGG-16bn 全精度基线用 PyTorch model zoo 预训练版；图像 resize 到 256×256 后取 224×224 crop 训练（半数水平镜像），测试取 224×224 中心 crop；PyTorch 实现（§2.3）。

---

## 3. 实验

### 3.1 与其他方法对比（§3.2，Table 1）

对比条件（§3.2）：只比较已发表的、把所有卷积/全连接层权重与输入激活量化到指定精度的模型（首末层允许更高精度，LSQ 模型亦如此）。Table 1 逐行照抄如下（"—" 为原文空格，表示该方法未报告该精度；行序按原文）：

**Table 1: Comparison of low precision networks on ImageNet.**（top-1 / top-5 accuracy @ 精度）

| 网络 | 方法 | Top-1 2bit | Top-1 3bit | Top-1 4bit | Top-1 8bit | Top-5 2bit | Top-5 3bit | Top-5 4bit | Top-5 8bit |
| :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| ResNet-18 | Full precision | 70.5 | — | — | — | 89.6 | — | — | — |
| — | LSQ (Ours) | 67.6 | 70.2 | 71.1 | 71.1 | 87.6 | 89.4 | 90.0 | 90.1 |
| — | QIL | 65.7 | 69.2 | 70.1 | — | — | — | — | — |
| — | FAQ | — | — | 69.8 | 70.0 | — | — | 89.1 | 89.3 |
| — | LQ-Nets | 64.9 | 68.2 | 69.3 | — | — | 85.9 | 87.9 | 88.8 |
| — | PACT | 64.4 | 68.1 | 69.2 | — | — | 85.6 | 88.2 | 89.0 |
| — | NICE | — | 67.7 | 69.8 | — | — | — | 87.9 | 89.21 |
| — | Regularization | 61.7 | — | 67.3 | 68.1 | 84.4 | — | 87.9 | 88.2 |
| ResNet-34 | Full precision | 74.1 | — | — | — | 91.8 | — | — | — |
| — | LSQ (Ours) | 71.6 | 73.4 | 74.1 | 74.1 | 90.3 | 91.4 | 91.7 | 91.8 |
| — | QIL | 70.6 | 73.1 | 73.7 | — | — | — | — | — |
| — | LQ-Nets | 69.8 | 71.9 | — | — | — | 89.1 | 90.2 | — |
| — | NICE | — | 71.7 | 73.5 | — | — | — | 90.8 | 91.4 |
| — | FAQ | — | — | 73.3 | 73.7 | — | — | 91.3 | 91.6 |
| ResNet-50 | Full precision | 76.9 | — | — | — | 93.4 | — | — | — |
| — | LSQ (Ours) | 73.7 | 75.8 | 76.7 | 76.8 | 91.5 | 92.7 | 93.2 | 93.4 |
| — | PACT | 72.2 | 75.3 | 76.5 | — | — | 90.5 | 92.6 | 93.2 |
| — | NICE | — | 75.1 | 76.5 | — | — | — | 92.3 | 93.3 |
| — | FAQ | — | — | 76.3 | 76.5 | — | — | 92.9 | 93.1 |
| — | LQ-Nets | 71.5 | 74.2 | 75.1 | — | — | 90.3 | 91.6 | 92.4 |
| ResNet-101 | Full precision | 78.2 | — | — | — | 94.1 | — | — | — |
| — | LSQ (Ours) | 76.1 | 77.5 | 78.3 | 78.1 | 92.8 | 93.6 | 94.0 | 94.0 |
| ResNet-152 | Full precision | 78.9 | — | — | — | 94.3 | — | — | — |
| — | LSQ (Ours) | 76.9 | 78.2 | 78.5 | 78.5 | 93.2 | 93.9 | 94.1 | 94.2 |
| — | FAQ | — | — | 78.4 | 78.5 | — | — | 94.1 | 94.1 |
| VGG-16bn | Full precision | 73.4 | — | — | — | 91.5 | — | — | — |
| — | LSQ (Ours) | 71.4 | 73.4 | 74.0 | 73.5 | 90.4 | 91.5 | 92.0 | 91.6 |
| — | FAQ | — | — | 73.9 | 73.7 | — | — | 91.7 | 91.6 |
| SqueezeNext-23-2x | Full precision | 67.3 | — | — | — | 87.8 | — | — | — |
| — | LSQ (Ours) | 53.3 | 63.7 | 67.4 | 67.0 | 77.5 | 85.4 | 87.8 | 87.7 |

（Table 1 原文注：对比方法为 QIL (Jung et al. 2018)、FAQ (McKinstry et al. 2018)、LQ-Nets (Zhang et al. 2018)、PACT (Choi et al. 2018b)、Regularization (Choi et al. 2018c)、NICE (Baskin et al. 2018)。）

结论原句（§3.2）：

> "We found that LSQ achieved a higher top-1 accuracy than all previous reported approaches for 2-, 3- and 4- bit networks with the architectures considered here."

补充观察（§3.2）：

- "In most cases, we found no accuracy advantage to increasing precision from 4-bit to 8-bit."（Table 1：如 ResNet-18 LSQ 4-bit 71.1 vs 8-bit 71.1）；
- 次优方法 QIL 用渐进微调（全精度→5-bit→4-bit→…），训练时间与复杂度显著高于 LSQ 的直接微调（§3.2）；
- 全精度→2-bit 的 top-1 掉点：ResNet-18 仅 2.9，SqueezeNext-23-2x 达 14.0（§3.2）。

### 3.2 权重衰减（§3.1，Table 2）

在 ResNet-18 上对 weight decay 做扫参，发现精度越低所需正则越少。原文结论（§3.1）：

> "Performance was improved by reducing weight decay by half for the 3-bit network, and reducing it by a quarter for the 2-bit network."

**Table 2: ResNet-18 top-1 accuracy for various weight decay values.**（逐行照抄，粗体为原文所标）

| Weight Decay | 2-bit | 3-bit | 4-bit | 8-bit |
| :--- | ---: | ---: | ---: | ---: |
| $10^{-4}$ | $66.9$ | $70.1$ | **71.0** | **71.1** |
| $0.5\times 10^{-4}$ | $67.3$ | **70.2** | $70.9$ | $71.1$ |
| $0.25\times 10^{-4}$ | **67.6** | $70.0$ | $70.9$ | $71.0$ |
| $0.125\times 10^{-4}$ | $67.4$ | $66.9$ | $70.8$ | $71.0$ |

后续所有实验沿用：4/8-bit 用 $10^{-4}$，3-bit 减半，2-bit 减至四分之一（§3.1）。

### 3.3 步长梯度尺度消融（§3.4，Table 3）

以 2-bit ResNet-18 为对象，在首个训练 epoch 中段测 500 次迭代的平均 $R$（式 (4)）。原文发现（§3.4）：

- 无缩放时，"updates to step size were $2$ to $3$ orders of magnitude larger than updates to weights"，且精度越高失衡越大（8-bit 网络的失衡比 2-bit 大近一个量级，Figure 4 左）；
- 仅按层数缩放（$g=1/\sqrt{N_W}$）后失衡基本消除，但跨精度的失衡仍在（Figure 4 中）；
- 按层数与精度缩放（$g=1/\sqrt{N_W Q_P}$）后两者均基本消除（Figure 4 右）。

**Table 3: Top-1 accuracy for various gradient scale values and learning rates for 2-bit ResNet-18.**（逐行照抄，表中 $N$ 即正文 $N_W/N_F$）

| Gradient scale | Learning Rate | Accuracy |
| :--- | :--- | ---: |
| $\bf{\frac{1}{\sqrt{NQ_P}}}$ | 0.01 | **67.6** |
| $\bf{\frac{1}{\sqrt{N}}}$ | 0.01 | $67.3$ |
| $1$ | 0.01 | Did not converge |
| $1$ | 0.0001 | 64.2 |
| $\bf{\frac{10}{\sqrt{NQ_P}}}$ | 0.01 | $67.4$ |
| $\bf{\frac{1}{10\sqrt{NQ_P}}}$ | 0.01 | $67.3$ |

（原文表中 gradient scale 单元格为 \bf{\nicefrac{...}{...}} 形式，此处按 $\frac{}{}$ 转写，数值同原文。）

要点（§3.4）：只用全梯度尺度作基线；只调权重/特征数（$1/\sqrt N$）掉 0.3；完全不缩放时除非把初始学习率降到 0.0001 才能收敛，且最优也只有 64.2（比基线低 3.4）；把梯度尺度再放大/缩小十倍也都降点（67.4 / 67.3）。

### 3.4 余弦学习率衰减的影响（§3.5）

为与用 step decay 的已发表结果可比：2-bit ResNet-18 用 LSQ 训 90 epochs、初始 LR 0.01、每 20 epochs ×0.1，top-1 达 67.2——比同设定 cosine 衰减低 0.4，但仍比次优训练方法高 1.5（§3.5，对比 Table 1）。

### 3.5 量化误差分析（§3.6）

问题：LSQ 学到的步长是不是在最小化量化误差？做法（§3.6）：对每层，记 LSQ 最终步长为 $\hat{s}$，在 $S=\{0.01\hat{s},0.02\hat{s},...,20.00\hat{s}\}$ 中找一个 batch 测试数据上最小化 MAE / MSE / KL 散度的 $s$，与 $\hat{s}$ 比较。

2-bit ResNet-18 结果（§3.6）：

- 学到的步长：激活 $\hat{s}=0.949\pm0.206$，权重 $\hat{s}=0.025\pm0.019$（mean ± std）；
- $\hat{s}$ 与最小化量化误差的 $s$ 的平均绝对百分比差：激活层 MAE 50% / MSE 63% / KL 64%；权重层 MAE 47% / MSE 28% / KL 46%。

结论原句（§3.6）：

> "This indicates that LSQ learns a solution that does not in fact minimize quantization error."

作者据此提出：直接拟合数据分布的量化器未必对任务性能最优（§3.6）。

### 3.6 知识蒸馏增益（§3.7，Table 4）

设定（§3.7）：同架构知识蒸馏，Hinton et al. 2015 蒸馏 loss、温度 1、标准 loss 与蒸馏 loss 等权；教师为冻结权重的同架构全精度模型。对照实验：全精度教师蒸馏到全精度（未训练）学生无增益。

**Table 4: Accuracy for low precision networks trained with LSQ and knowledge distillation.**（逐行照抄）

| 网络 | Top-1 2bit | Top-1 3bit | Top-1 4bit | Top-1 8bit | Top-1 32bit | Top-5 2bit | Top-5 3bit | Top-5 4bit | Top-5 8bit | Top-5 32bit |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| ResNet-18 | 67.9 | 70.6 | 71.2 | 71.1 | 70.5 | 88.1 | 89.7 | 90.1 | 90.1 | 89.6 |
| ResNet-34 | 72.4 | 74.3 | 74.8 | 74.1 | 74.1 | 90.8 | 91.8 | 92.1 | 91.7 | 91.8 |
| ResNet-50 | 74.6 | 76.9 | 77.6 | 76.8 | 76.9 | 92.1 | 93.4 | 93.7 | 93.3 | 93.4 |

结果（§3.7）：蒸馏使 top-1 最多提升 1.1（3-bit ResNet-50），且 3-bit 网络达到全精度基线精度（对比 Table 1：ResNet-18 70.6 vs 70.5，ResNet-34 74.3 vs 74.1，ResNet-50 76.9 vs 76.9）。

### 3.7 精度 vs 模型大小（§3.3，Figure 3）

在给定模型大小限制下，"2-bit ResNet-34 and ResNet-50 networks offer an absolute advantage over using a smaller network, but with higher precision"（§3.3）；各精度下 VGG-16bn 均在前沿之下（§3.3）。结论节的例子（§4）：8MB 模型大小限制下，2-bit ResNet-50 优于 4-bit ResNet-34。

---

## 4. 核心结论

1. 在 ImageNet、多架构上，LSQ 超过此前所有量化方法（§4；Table 1）；最佳性能来自按层大小与精度缩放步长 loss 梯度（§4）。
2. 值得注意的负面发现：LSQ 学到的解并不最小化量化误差（MSE/MAE/KL 三种度量均如此，§3.6、§4）——任务 loss 驱动的步长学习 ≠ 误差最小化。
3. 方法极简："The approach itself is simple, requiring only a single additional parameter per weight or activation layer."（§4）——每层仅多一个可学习步长参数。
4. 2-bit 网络尚不能追平全精度（差数个百分点，§4），但在模型大小受限场景下已最有用（§4，Figure 3）。
5. 3-bit + 知识蒸馏首次（论文所知范围内）达到全精度基线精度（§1、§3.7、Table 4）。

## 5. 与库内笔记的关系

- LSQ 属 **QAT 路线**（训练中学习量化参数），与 `library/Quantization/RepQ-ViT.md`（PTQ，训练后尺度重参数化）互补：RepQ-ViT 免训练、LSQ 需 90 epoch 量级的微调但精度上限更高（对比两笔记中各自 Table 数据时注意数据集均为 ImageNet 分类）。
- `library/Quantization/OmniQuant.md` 附录 6.2 明确把 LSQ 与 PACT 列为"经典 QAT 方法，也会学习裁剪阈值"的对比对象（据库内 OmniQuant.md 附录 A6 转述）；LSQ 本文即以 PACT 为主要 baseline 之一（Table 1、Figure 2）。OmniQuant 的 LWC 学比例系数（而非 LSQ 的绝对步长）的动机，可回溯到对这类 QAT 步长学习的改进。

---

## TODO

- [ ] 配图未抓取：Figure 1（低精度层计算图）、Figure 2（LSQ vs QIL vs PACT 梯度对比）、Figure 3（精度 vs 模型大小）、Figure 4（梯度尺度影响）——若入库，按库约定放 `library/assets/LSQ/`，当前目录不存在，留 TODO。
- [ ] 本文为 arXiv/ar5iv HTML 版抓取，ICLR 2020 正式版（OpenReview）页码/排版未核对；如需页码级 locator 需补抓 OpenReview PDF。
- [ ] 第三方实现（如 NNI 等复现）未逐一核实，仅确认论文本身无官方代码链接。

## 抓取记录

- abs 页：https://arxiv.org/abs/1902.08153 （抓取日期 2026-11-02；标题 "Learned Step Size Quantization"，Comments 字段 "International Conference on Learning Representations (2020)"，已核对与任务给定标题一致）
- 全文：https://ar5iv.labs.arxiv.org/html/1902.08153 （抓取日期 2026-11-02，LaTeXML 渲染版；公式 (1)–(11)、Table 1–4 均出自该版并经脚本核验）
