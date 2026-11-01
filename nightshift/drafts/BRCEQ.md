# BRECQ: Pushing the Limit of Post-Training Quantization by Block Reconstruction

**出处会议：** arXiv:2102.05426（v1 2021-02-10，v2 2021-07-25，cs.LG；cs.CV）；ICLR 2021。注：arXiv abs 页本次抓取**无 Comments 会议标注**，"ICLR 2021" 依据官方 GitHub 仓库自述（"Pytorch implementation of BRECQ, ICLR 2021"，本次实际抓取 https://github.com/yhhhli/BRECQ ）  
**是否开源：** 开源。https://github.com/yhhhli/BRECQ（官方 PyTorch 实现，README 提供全部预训练模型（torch.hub 加载）与 ImageNet 复现命令；论文摘要末句亦称 "Codes are available at this https URL"）  
**关键词：** 后训练量化（PTQ）、block reconstruction、二阶误差 / Gauss-Newton 矩阵 / FIM、平方梯度、AdaRound、learned step size、混合精度（mixed precision）、遗传算法、INT2、ImageNet / MS COCO

> **命名核对（必读）：** 本条在 `TODO.md` / `nightshift/QUEUE.md` 与本次任务里叫 **"BRCEQ"**，经 arXiv 检索核对为 **BRECQ** 的字母易位笔误：(1) 以 "BRCEQ" 查 arXiv API（`all:"BRCEQ"`）无任何论文命中；(2) 以 "BRECQ" 检索即命中本文（arXiv:2102.05426）；(3) 库内既有素材 `library/assets/BRCEQ/` 下三张截图分别对应 Algorithm 1 算法框、Theorem 3.1（Eq. 7）与 Eq. (10)，均为本文内容。论文实名 **"BRECQ: Pushing the Limit of Post-Training Quantization by Block Reconstruction"**（Li, Yuhang; Gong, Ruihao; Tan, Xu; Yang, Yang; Hu, Peng; Zhang, Qi; Yu, Fengwei; Wang, Wei; Gu, Shi）。主题为后训练量化，与 TODO「其他」组内 QLoRA（量化）同主题，归组成立。`TODO.md`/`QUEUE.md` 的用名错误本任务**未修改**（在禁改清单内），留调度班次处理。
>
> **正文名与大小写：** arXiv abs 页标题/摘要为 "BRECQ"；LaTeXML 生成的 arXiv HTML 正文把小型大写（small caps）渲染成 "Brecq"，因此下方 HTML 引文里出现 "Brecq" 属逐字照抄，非笔误。
>
> **Locator 约定：** 本笔记所有章节号（§1–§6、§A.1、§B.x）、表号（Table 1–6）、公式号（Eq. 1–18）均指 arXiv HTML（arxiv.org/html/2102.05426v2，LaTeXML 生成）的编号，与 PDF/ICLR 版一致（同一 LaTeX 源）。英文引号内文字为本次从该 HTML（或注明来自 abs 页/GitHub）抓取的逐字文本；引用句中的 "(Nagel et al., 2020)" 式括号为正文引用标记，照抄。含行内公式的句子引文在 "…" 处截断，避免转写公式引入误差。

---

## 一、概述

### 1.1 任务与动机

论文研究**后训练量化**（Post-Training Quantization, PTQ）：不做端到端重训、只用少量校准数据把已训练好的浮点模型压到低比特。§1 原句：

> "Therefore, there is more demand in industry for quantizing the neural networks without retraining, which is called Post-training Quantization. Although PTQ is fast and light, it suffers from severe accuracy degeneration when the quantization precision is low."（§1）

动机来自低比特下既有 PTQ 方法的崩塌实例（§1 原句）：

> "For example, DFQ (Nagel et al., 2019) can quantize ResNet-18 to 8-bit without accuracy loss (69.7% top-1 accuracy) but in 4-bit quantization, it can only achieve 39% top-1 accuracy."（§1）

> "The primary reason is the approximation in the parameter space is not equivalent to the approximation in model space thus we cannot assure the optimal minimization on the final task loss."（§1）

前作 AdaRound（Nagel et al., 2020）用 Taylor 展开的二阶项分析损失退化，但止步于 2-bit 权重（§1 原句）：

> "However, their work cannot further quantize the weights into INT2 because the cross-layer dependency in the Hessian matrix cannot be ignored when the perturbation on weight is not small enough."（§1）

BRECQ 的立场（§1 原句）：

> "In this work, we analyze the second-order error based on the Gauss-Newton matrix. We show that the second-order error can be transformed into network final outputs but suffer from bad generalization. To achieve the best tradeoff, we adopt an intermediate choice, block reconstruction."（§1）

摘要（abs 页，本次抓取）给出的两条定性结论：

> "In this work, we propose a novel PTQ framework, dubbed BRECQ, which pushes the limits of bitwidth in PTQ down to INT2 for the first time. BRECQ leverages the basic building blocks in neural networks and reconstructs them one-by-one."（Abstract，abs 页）

> "And for the first time we prove that, without bells and whistles, PTQ can attain 4-bit ResNet and MobileNetV2 comparable with QAT and enjoy 240 times faster production of quantized models."（Abstract，abs 页）

### 1.2 论文声明的三点贡献（§1，逐条照抄）

1. > "Based on the second-order analysis, we define a set of reconstruction units and show that block reconstruction is the best choice with the support from theoretical and empirical evidence. We also use Fisher Information Matrix to assign each pre-activation with an importance measure during reconstruction."
2. > "We incorporate genetic algorithm and the well-defined intra-block sensitivity measure to generate latency and size guaranteed mixed precision quantized neural networks, which fulfills a general improvement on both specialized hardware (FPGA) and general hardware (ARM CPU)."
3. > "We conduct extensive experiments to verify our proposed methods. We find that our method is applicable to a large variety of tasks and models. Moreover, we show that post-training quantization can quantize weights to INT2 without significant accuracy loss for the first time."

---

## 二、方法

### 2.1 预备：量化目标与 Taylor 展开（§2）

- 记号：对称均匀量化把浮点映射到网格 $\mathcal{Q}_{b}^{\text{u,sym}}$（步长 $s$、位宽 $b$），rounding-to-nearest 是 Eq. (2) 的平凡解；而真正的任务是损失最小化 $\min \mathbb{E}[L(\hat{\mathbf{w}})]$（Eq. (3)），两者并不等价。
- 对量化（权重扰动）做 Taylor 展开（Eq. (4)）：损失退化 ≈ 一阶梯度项 + $\frac{1}{2}\Delta\mathbf{w}^{\mathsf{T}}\bar{\mathbf{H}}^{(\mathbf{w})}\Delta\mathbf{w}$；模型收敛后一阶项近似为 0，只剩 Hessian 二阶项。关于全 Hessian 的规模（§2 原句）：

  > "However, optimizing with the large-scale full Hessian is memory-infeasible on many devices as the full Hessian requires terabytes of memory space."（§2）

- AdaRound 的两条假设（§2）：层间独立（layer-diagonal + Kronecker 分解）与 pre-activation 的 Hessian 为与输入无关的常数对角阵 $c\times\mathbf{I}$——由此把目标化为逐层 feature-map 重建。后续工作 Bit-Split、AdaQuant 也沿用逐层目标（§2 原句）：

  > "Recent works, like Bit-Split (Wang et al., 2020) and AdaQuant (Hubara et al., 2020), also take this layer-wise objective to improve the post-training quantization. However, they failed to quantize weights to INT2."（§2）

### 2.2 跨层依赖：把二阶误差转到网络输出（§3.1，Theorem 3.1）

模型收敛到局部极小 ⇒ Hessian 半正定，且 Eq. (5) 的第一项可忽略，Hessian 退化为 **Gauss-Newton (GN) 矩阵** $\mathbf{G}^{(\theta)}=\mathbf{J}^{\mathsf{T}}\mathbf{H}^{(\mathbf{z}^{(n)})}\mathbf{J}$（Eq. (6)）。核心定理（§3.1 原句 + Eq. (7)）：

> "Consider an n-layer feedforward neural network with ReLU activation function. Assuming all weights are quantized, the second-order error optimization can be transformed by:"（Theorem 3.1，§3.1）

$$\arg\min_{\hat{\theta}}\ \Delta\theta^{\mathsf{T}}\bar{\mathbf{H}}^{(\theta)}\Delta\theta\ \approx\ \arg\min_{\hat{\theta}}\ \mathbb{E}\left[\Delta\mathbf{z}^{(n),\mathsf{T}}\mathbf{H}^{(\mathbf{z}^{(n)})}\Delta\mathbf{z}^{(n)}\right].\qquad\text{(Eq. 7)}$$

即：权重空间的二阶误差优化 ≈ 在**网络最终输出**上加权（output Hessian）的输出差异最小化。Remark 3.1 指出同一变换对激活量化也成立。作者把它与知识蒸馏对齐，但强调算力/数据约束（§3.1 原句）：

> "However, we should emphasize that distillation requires the same computation and data resources as in normal training procedure, which is impractical for PTQ with limited data."（§3.1）

论文据此定义 4 种重建粒度（Figure 1 caption 原句）：

> "We define 4 kinds of reconstruction granularity, namely net-wise, stage-wise, block-wise and layer-wise optimization, each of them corresponds an essential component of CNN."（Figure 1，§3.1）

### 2.3 Block Reconstruction（§3.2）

网络级输出重建虽然对二阶误差估计最准，实践却不如逐层重建（§3.2 原句）：

> "Although the network output reconstruction has an accurate estimation of the second-order error, we find in practice it is worse than the layer-by-layer reconstruction in PTQ. The primary reason for this is optimizing the whole networks over 1024 calibration data samples leads to over-fitting easily."（§3.2）

> "We find layer-wise reconstruction acts like a regularizer which reduces the generalization error by matching each layer’s output distribution."（§3.2）

于是取中间粒度：**block-diagonal Hessian**——块内依赖保留、块间依赖忽略。四种粒度（§3.2）：Layer-wise（层对角，同 AdaRound/AdaQuant/Bit-Split）、Block-wise（Residual Bottleneck Block 等基本块）、Stage-wise（stage 内全部层联合）、Network-wise（整个网络，类蒸馏）。为何 block 最好（§3.2 原句，中间图注引用按 HTML 截断）：

> "We think this is because the main off-diagonal loss in the Hessian is concentrated in each block … while the inter-block loss is small and can be ignored in the optimization."（§3.2；HTML 把 Figure 1(b) 渲染成 "1(b)"，此处以 "…" 截去该图注片段）

命名与定位（§3.2 原句）：

> "We name our algorithm Brecq, because we choose block as our base reconstruction unit. It is necessary to point out that our analysis does not give the optimal configuration of the reconstruction granularity. The choice of block-wise optimization comes from our experiments and we find this choice has two merits. (1) No hyper-parameters included and (2) applicable for all models and all tasks we tested."（§3.2）

流程见 **Algorithm 1**（BRECQ optimization）：逐块收集块输入 $\mathbf{x}^{(i)}$、FP 输出 $\mathbf{z}^{(i)}$ 及其梯度 $\mathbf{g}^{(\mathbf{z}^{(i)})}$；每个块迭代 $T$ 次——计算量化输出差 $\Delta\mathbf{z}^{(i)}$、沿 Eq. (10) 下降并更新块内所有权重的 rounding（Eq. (16)）、若触发激活量化则更新激活步长（Eq. (18)）；块优化完后计算层内/层间 sensitivity（仅 2-bit 需要），返回量化模型 + 供混合精度用的 sensitivity 表（Algorithm 1；库内截图 `library/assets/BRCEQ/Algorithm.png` 即此算法框）。

### 2.4 用平方梯度（FIM 对角）替代 pre-activation Hessian（§3.3）

块重建目标 $\mathbb{E}[\Delta\mathbf{z}^{(\ell),\mathsf{T}}\mathbf{H}^{(\mathbf{z}^{(\ell)})}\Delta\mathbf{z}^{(\ell)}]$ 需要知道 pre-activation Hessian。若沿用 AdaRound 的 $c\times\mathbf{I}$ 假设就退化成 MSE（‖Δz‖²），论文认为 "lose too much information"（§3.3），改用 **FIM 对角近似**：

> "We use the diagonal Fisher Information Matrix (FIM) to replace the pre-activation Hessian."（§3.3）

FIM 定义见 Eq. (9)（负的对数似然 Hessian 期望）。关键性质（§3.3 原句）：

> "The diagonal of the pre-activation FIM is equal to the squared gradients of each elements, which is successfully used in Adam (Kingma & Ba, 2014) for the second momentum."（§3.3；"each elements" 为原文语法）

于是 Eq. (10) 把块目标写成以**每个输出元素的平方梯度** $(\partial L/\partial z_a^{(\ell)})^2$ 为对角权的加权重建（`library/assets/BRCEQ/Format2.png` 即该句与 Eq. (10) 的截图；`Format1.png` 是 Theorem 3.1 与 Eq. (7)）。直观效果（§3.3 原句）：

> "Compared with the MSE minimization, the above minimization incorporates the squared gradient information. If the output has higher absolute gradients, it will receive more attention when being reconstructed."（§3.3）

优化器选择（§3.3 原句）：

> "Note that Brecq is compatible with any optimization method, like STE (Hubara et al., 2017). Here we adopt adaptive rounding (Nagel et al., 2020) for weights and learned step size (Esser et al., 2020) for activation step size because we observe they generally perform better in PTQ, see details in Appendix B.4.1."（§3.3）

即：权重用 AdaRound 的可学习 rounding（Eq. (16)(17)，sigmoid 温度退火收敛到 0/1），激活用可学习步长（Eq. (18) 分段梯度）。代价（§3.3 原句）：

> "We should emphasize that we only need a small subset (1024 in our experiments) of the whole training dataset to calibrate the quantized model. And we can obtain a quantized ResNet-18 within 20 minutes on a single GTX 1080TI GPU."（§3.3）

### 2.5 混合精度（§3.4）

在 $\{2,4,8\}^n$ 的位宽组合里搜配置，约束为硬件指标（时延/体积，Eq. (11)）；遗传算法搜索（§3.4 原句）：

> "We choose 2, 4, 8-bit for mixed precision because they are most common in practical deployment."（§3.4）

> "Based on our preliminary experiments, we find that 4-bit and 8-bit quantization nearly do not drop the final accuracy. Hence we only take 2-bit permutations into consideration and drastically reduce the search space."（§3.4）

> "We use genetic algorithm (Guo et al., 2020) to search the optimal bitwidth configuration with hardware performance threshold, the algorithm is located in algorithm 2."（§3.4）

搜索开销（§B.4.4 原句）：

> "For genetic algorithm, we set the population size to 50 and evolve 100 iterations to obtain the best individual. The first population is initialized by Gaussian distribution and we round the samples to integers in [0, 1, 2], corresponding to bit-width [2, 4, 8]. The mutation probability is set to 0.1. The genetic algorithm usually completes the evolution in only about 3 seconds."（§B.4.4）

---

## 三、实验

### 3.1 消融：四种重建粒度（§4.1）

设置（§4.1 原句）："We conduct ImageNet experiments using MobileNetV2 and ResNet-18 with 2-bit weight quantization for all layers except for the first and the last layer."

**Table 1：Ablation study**（表题 "Ablation study."，§4.1；逐行照抄）：

| Model | Layer | Block | Stage | Net |
|---|---|---|---|---|
| ResNet-18 | 65.19 | **66.39** | 66.01 | 54.15 |
| MobileNetV2 | 52.13 | **59.67** | 54.23 | 40.76 |

（加粗为原文粗体——Block 列在两个模型上都是最优。）

正文结论（§4.1 原句）：

> "It can be seen from Table 1 that Block-wise optimization outperforms other methods. This result implies that the generalization error in net-wise and stage-wise optimization outweighs their off-diagonal loss."（§4.1）

ResNet-18 上差异较小被归因于模型浅、块/stage 小（§4.1）："In ResNet-18, we find the difference is not significant, this can be potentially attributed to that ResNet-18 only has 19 layers in the body and the block size, as well as the stage size, is small, therefore leading to indistinct results."

### 3.2 ImageNet：weight-only 量化（§4.2，Table 2）

模型覆盖 ResNet、MobileNetV2、RegNet（普通/depthwise/group 卷积）与 NAS 模型 MnasNet。设置（§4.2 原句）：

> "Note that the first and the last layer are kept with 8-bit. While most of the existing methods have good performances in 4-bit quantization, they cannot successfully quantize the model into 2-bit. Our method consistently achieves the lowest accuracy degradation for ResNets (within 5%) and other compact models."（§4.2）

**Table 2：weight-only（激活全精度）**（表题 "Accuracy comparison on weight-only quantized post-training models. Activations here are un-quantized and kept full precision. We also conduct variance study for our experiments. Bold values indicates best results. * indicates our implementation based on open-source codes."，§4.2；逐行照抄，Brecq 行粗体值此处不加粗、以 ± 方差形式照抄）：

| Methods | Bits (W/A) | ResNet-18 | ResNet-50 | MobileNetV2 | RegNet-600MF | RegNet-3.2GF | MnasNet-2.0 |
|---|---|---|---|---|---|---|---|
| Full Prec. | 32/32 | 71.08 | 77.00 | 72.49 | 73.71 | 78.36 | 76.68 |
| Bias Correction* | 4/32 | 50.43 | 64.64 | 62.82 | 67.09 | 71.73 | 72.31 |
| OMSE (Choukroun et al., 2019) | 4/32 | 67.12 | 74.67 | - | - | - | - |
| AdaRound (Nagel et al., 2020) | 4/32 | 68.71 | 75.23 | 69.78 | 71.97* | 77.12* | 74.87* |
| AdaQuant (Hubara et al., 2020) | 4/32 | 68.82 | 75.22 | 44.78 | - | - | - |
| Bit-Split (Wang et al., 2020) | 4/32 | 69.11 | 75.58 | - | - | - | - |
| Brecq (Ours) | 4/32 | 70.70±0.07 | 76.29±0.04 | 71.66±0.04 | 73.02±0.09 | 78.04±0.04 | 76.00±0.02 |
| Bias Correction* | 3/32 | 12.85 | 7.97 | 10.89 | 28.82 | 17.95 | 40.72 |
| AdaRound (Nagel et al., 2020)* | 3/32 | 68.07 | 73.42 | 64.33 | 67.71 | 72.31 | 69.33 |
| AdaQuant (Hubara et al., 2020)* | 3/32 | 58.12 | 67.61 | 12.56 | - | - | - |
| Bit-Split (Wang et al., 2020) | 3/32 | 66.75 | 73.24 | - | - | - | |
| Brecq (Ours) | 3/32 | 69.81±0.05 | 75.61±0.09 | 69.50±0.12 | 71.48±0.07 | 77.22±0.04 | 74.58±0.08 |
| Bias Correction* | 2/32 | 0.13 | 0.12 | 0.14 | 0.18 | 0.11 | 0.11 |
| AdaRound (Nagel et al., 2020)* | 2/32 | 55.96 | 47.95 | 32.54 | 25.66 | 24.70 | 30.60 |
| AdaQuant (Hubara et al., 2020)* | 2/32 | 0.30 | 0.49 | 0.11 | - | - | - |
| Brecq (Ours) | 2/32 | 66.30±0.12 | 72.40±0.12 | 59.67±0.13 | 65.83±0.13 | 73.88±0.14 | 67.13±0.13 |

（注意 Bit-Split 3/32 行的 MnasNet 单元格在 HTML 源里就是空单元格（其他方法同行是 "-"），本笔记照原样留空。）

### 3.3 ImageNet：全量化 W4A4 / W2A4（§4.2，Table 3）

激活也压到 4-bit 后（§4.2 原句）：

> "We further quantize activations into 4-bit to make the quantized model run on integer-arithmetic hardware platforms. We find that 4-bit activation quantization can have a huge impact on RegNet and MobileNet. Nonetheless, our methods produce higher performance than other state-of-the-arts. To be noted, Brecq is the first to promote the 2W4A accuracy of PTQ to a usable level while all other existing methods crashed."（§4.2）

**Table 3：fully quantized（激活 4-bit）**（表题 "Accuracy comparison on fully quantized post-training models. Activations here are quantized to 4-bit. Notations follows the upper table."，§4.2；逐行照抄）：

| Methods | Bits (W/A) | ResNet-18 | ResNet-50 | MobileNetV2 | RegNet-600MF | RegNet-3.2GF | MNasNet-2.0 |
|---|---|---|---|---|---|---|---|
| Full Prec. | 32/32 | 71.08 | 77.00 | 72.49 | 73.71 | 78.36 | 76.68 |
| ACIQ-Mix (Banner et al., 2019) | 4/4 | 67.0 | 73.8 | - | - | - | - |
| ZeroQ (Cai et al., 2020)* | 4/4 | 21.71 | 2.94 | 26.24 | 28.54 | 12.24 | 3.89 |
| LAPQ (Nahshan et al., 2019) | 4/4 | 60.3 | 70.0 | 49.7 | 57.71* | 55.89* | 65.32* |
| AdaQuant (Hubara et al., 2020) | 4/4 | 67.5 | 73.7 | 34.95* | - | - | - |
| Bit-Split (Wang et al., 2020) | 4/4 | 67.56 | 73.71 | - | - | - | |
| Brecq (Ours) | 4/4 | 69.60±0.04 | 75.05±0.09 | 66.57±0.67 | 68.33±0.28 | 74.21±0.19 | 73.56±0.24 |
| ZeroQ (Cai et al., 2020)* | 2/4 | 0.08 | 0.08 | 0.10 | 0.10 | 0.05 | 0.12 |
| LAPQ (Nahshan et al., 2019)* | 2/4 | 0.18 | 0.14 | 0.13 | 0.17 | 0.12 | 0.18 |
| AdaQuant (Hubara et al., 2020)* | 2/4 | 0.21 | 0.12 | 0.10 | - | - | |
| Brecq (Ours) | 2/4 | 64.80±0.08 | 70.29±0.23 | 53.34±0.15 | 59.31±0.49 | 67.15±0.11 | 63.01±0.35 |

（同上：Bit-Split 4/4、AdaQuant 2/4 两行的 MnasNet 单元格在 HTML 里为空，照抄。另注意表头拼写与 Table 2 不同：Table 2 为 "MnasNet-2.0"、Table 3 为 "MNasNet-2.0"，均照原文。）

### 3.4 与 QAT 的成本-精度对比（§4.3，Table 4）

**Table 4：与 quantization-aware training 对比**（表题 "Performance as well as training cost comparison with quantization-aware training (QAT)."，§4.3；逐行照抄。Models 列为竖向合并单元格："ResNet-18 FP: 71.08" 跨前 6 行、"MobileNetV2 FP: 72.49" 跨后 5 行，续行首列在 HTML 中即为空，本笔记照原样留空）：

| Models | Methods | Precision | Accuracy | Model Size | Training Data | GPU hours |
|---|---|---|---|---|---|---|
| ResNet-18 FP: 71.08 | ZeroQ (Cai et al., 2020)) | 4/4 | 21.20 | 5.81 MB | 0 | 0.008 |
| | Brecq (Ours) | 4/4 | 69.60 | 5.81 MB | 1024 | 0.4 |
| | Brecq (w/ Distilled Data) | 4/4 | 69.32 | 5.81 MB | 0 | 0.4 |
| | PACT (Choi et al., 2018) | 4/4 | 69.2 | 5.81 MB | 1.2 M | 100 |
| | DSQ (Gong et al., 2019) | 4/4 | 69.56 | 5.81 MB | 1.2 M | 100 |
| | LSQ (Esser et al., 2020) | 4/4 | 71.1 | 5.81 MB | 1.2 M | 100 |
| MobileNetV2 FP: 72.49 | Brecq (Ours) | 4/4 | 66.57 | 2.26 MB | 1024 | 0.8 |
| | PACT (Choi et al., 2018) | 4/4 | 61.40 | 2.26 MB | 1.2 M | 192 |
| | DSQ (Gong et al., 2019) | 4/4 | 64.80 | 2.26 MB | 1.2 M | 192 |
| | Brecq (Ours) | Mixed/8 | 70.74 | 1.38 MB | 1024 | 3.2 |
| | HAQ (Wang et al., 2019) | Mixed/8 | 70.90 | 1.38 MB | 1.2 M | 384 |

（第一行 "ZeroQ (Cai et al., 2020))" 末尾双右括号为原文笔误，照抄。）

正文结论（§4.3 原句）：

> "Table 4 shows that although Brecq is a PTQ method with limited available data, it can achieve comparable accuracy results with existing quantization-aware training models. In addition, our method can surpass them in 4-bit MobileNetV2 while using less than one training GPU hours."（§4.3）

> "Our method also has comparable accuracy with HAQ, which is a training-based mixed precision method."（§4.3）

GPU hours 的口径（§4.3 原句）：

> "Note that our GPU hours include 3 unified precision training (2-, 4-, 8-bit respectively) and further mixed-precision training only needs to check the lookup table. Instead, HAQ would end-to-end search for each hardware performance threshold from scratch."（§4.3）

### 3.5 MS COCO 目标检测（§4.4，Table 5）

检测器：two-stage Faster-RCNN + one-stage RetinaNet，骨干 ResNet-18/50、MobileNetV2；激活 8-bit。设置细节（§B.4.4）：检测校准只用 256 张 COCO 训练图；block reconstruction 只作用于 backbone（"Note that we only apply block reconstruction in the backbone because other parts of the architecture, such as Feature Pyramid Net, do not have the block structure. Therefore a naive layer reconstruction is applied to the rest of the network."，§B.4.4）。

正文结论（§4.4 原句；"is outperforms" 为原文语法笔误，照抄）：

> "Results in Table 5 demonstrate our method nearly does not drop the performance in 4-bit weight quantization and 8-bit activation. In particular, Brecq only decreases 0.21% mAP performance on 4-bit ResNet-18 backboned Faster RCNN. On 4-bit ResNet-50 backboned RetinaNet, our method is outperforms the mixed precision based ZeroQ model by 3% mAP. Even when the weight bit decreases to 2, the model still achieves near-to-original mAP."（§4.4）

**Table 5：MS COCO 检测（mAP）**（表题 "Objection detection task (MS COCO) comparison on fully quantized post-training models. Activations here are quantized to 8-bit. We report the bounding box mean Average Precision (mAP) metric."——"Objection" 为原文笔误，§4.4；原表为两级表头：第一级 Full Prec. / Bias Correction* / AdaRound* / ZeroQ / Brecq (Ours)，第二级为位宽。合并关系：Full Prec.=32/32 一列；Bias Correction* 跨 8/8、4/8 两列；AdaRound* 跨 4/8、2/8 两列；ZeroQ 仅 4MP/8 一列（4-bit mixed precision / 8-bit activation）；Brecq (Ours) 跨 8/8、4/8、2/8 三列。下表把两级表头拍平，Models 列合并单元格续行留空，数据逐格照抄）：

| Models | Backbone | Full Prec. 32/32 | Bias Correction* 8/8 | Bias Correction* 4/8 | AdaRound* 4/8 | AdaRound* 2/8 | ZeroQ 4MP/8 | Brecq (Ours) 8/8 | Brecq (Ours) 4/8 | Brecq (Ours) 2/8 |
|---|---|---|---|---|---|---|---|---|---|---|
| Faster RCNN (Ren et al., 2015) | ResNet-18 | 34.55 | 34.30 | 0.84 | 33.96 | 23.01 | - | 34.53 | 34.34 | 31.82 |
| | ResNet-50 | 38.55 | 38.25 | 0.25 | 37.58 | 19.63 | - | 38.54 | 38.29 | 34.23 |
| | MobileNetV2 | 33.44 | 33.24 | 18.39 | 32.77 | 16.35 | - | 33.40 | 33.18 | 27.54 |
| RetinaNet (Lin et al., 2017) | ResNet-18 | 33.20 | 33.00 | 0.04 | 32.59 | 19.93 | - | 33.14 | 33.01 | 31.42 |
| | ResNet-50 | 36.82 | 36.68 | 0.07 | 36.00 | 19.97 | 33.7 | 36.73 | 36.65 | 34.75 |
| | MobileNetV2 | 32.63 | 32.60 | 18.47 | 31.89 | 14.10 | - | 32.57 | 32.31 | 27.59 |

（正文数字与表对账：Faster RCNN R18 Brecq 4/8=34.34，34.55−34.34=0.21 ✓；RetinaNet R50 Brecq 4/8=36.65 vs ZeroQ 4MP/8=33.7，差 2.95≈3 ✓。ZeroQ 的 4MP/8 列仅 RetinaNet R50 有值 33.7，其余行为 "-"，照原表。）

### 3.6 混合精度（§4.5，Figure 2 为图，按任务要求跳过）

设置（§4.5 原句）：

> "We choose ResNet-18, MobileNetV2, and RegNetX-600MF to validate the efficacy of our algorithm. Note that in this section, we keep activation in 8-bit because we only compare the discrepancy between the unified and mixed precision in weights."（§4.5）

结论（§4.5 原句）：

> "From Fig. 2 we find that (1) mixed precision consistently outperforms unified precision, especially when using extremely low-bit, e.g., up to 10% accuracy increase with the same latency as the 2-bit model. (2) mixed precision can produce many bit configurations that can adapt to plenty of hardware requirements while unified precision can only have 2 fixed models."（§4.5）

### 3.7 附录 B 补充实验（§B）

**首末层影响（§B.1，Table 6）**。观察（§B.1 原句）：

> "In terms of accuracy, the 4-bit quantization is essentially good, both of these two layers won’t drop too much accuracy (with 0.2%). But in 2-bit quantization, the last fully connected layer is far more important than the first layer."（§B.1）

> "In terms of model size, the first layer merely has a minor impact because the input images only have 3 channels, while the last layer contains many weight parameters and greatly affects the memory footprint."（§B.1）

**Table 6：Impact of the first and the last layer**（表题 "Impact of the first and the last layer"，§B.1；原表两级表头：No Quantization 组含 First/Last 两个 ✓ 列（✓ = 该层不做量化、✗ = 量化），Precision 4/8 与 Precision 2/8 组各含 Accuracy / Model Size / Latency 三列；Models 列竖向合并跨 4 行，续行首列照原样留空；逐行照抄）：

| Models | First | Last | Precision 4/8 Accuracy | Precision 4/8 Model Size | Precision 4/8 Latency | Precision 2/8 Accuracy | Precision 2/8 Model Size | Precision 2/8 Latency |
|---|---|---|---|---|---|---|---|---|
| ResNet-18 FP: 71.08 | ✓ | ✓ | 70.76 | 5.81 MB | 70.72 ms | 66.30 | 3.15 MB | 59.84 ms |
| | ✗ | ✓ | 70.66 | 5.81 MB | 53.76 ms | 65.95 | 3.15 MB | 31.20 ms |
| | ✓ | ✗ | 70.64 | 5.57 MB | 70.08 ms | 64.87 | 2.79 MB | 58.72 ms |
| | ✗ | ✗ | 70.58 | 5.56 MB | 53.28 ms | 64.53 | 2.78 MB | 30.88 ms |
| MobileNetV2 FP: 72.49 | ✓ | ✓ | 71.80 | 2.26 MB | 32.80 ms | 59.59 | 1.74 MB | 30.40 ms |
| | ✗ | ✓ | 71.69 | 2.26 MB | 32.64 ms | 59.13 | 1.74 MB | 30.24 ms |
| | ✓ | ✗ | 71.42 | 1.65 MB | 31.52 ms | 56.29 | 0.83 MB | 28.48 ms |
| | ✗ | ✗ | 71.42 | 1.65 MB | 31.36 ms | 55.58 | 0.82 MB | 28.32 ms |
| RegNet-600MF FP: 73.71 | ✓ | ✓ | 72.98 | 3.19 MB | 31.84 ms | 65.66 | 1.84 MB | 23.20 ms |
| | ✗ | ✓ | 72.89 | 3.19 MB | 31.68 ms | 65.83 | 1.85 MB | 22.88 ms |
| | ✓ | ✗ | 72.69 | 2.94 MB | 31.20 ms | 62.93 | 1.47 MB | 22.40 ms |
| | ✗ | ✗ | 72.73 | 2.94 MB | 31.04 ms | 63.08 | 1.47 MB | 22.08 ms |

由此得出的反直觉工程结论（§B.1 原句）：

> "In conclusion, we find that keeping the first and the last layer 8-bit is unnecessary. Especially in ResNet-18, we find that setting all layers to 4-bit results in 53.3 ms latency and is faster than the 59.8 ms in 2-bit quantization (with first and last layer 8-bit), but the accuracy is even 4% higher. Such phenomenon indicates the potential power of the mixed precision."（§B.1）

**校准数据量与来源（§B.2）**：在 ResNet-18 上测试（§B.2 原句）：

> "We evaluated the influence of the size of calibration dataset and the source of the data on ResNet-18. We test different numbers of input data point and find that the improvement in 4-bit quantization is trivial. Yet in 2-bit quantization we can see that the accuracy increases 5% when #data points increase."（§B.2）

蒸馏数据（ZeroQ 式 BN 统计量生成）的效果（§B.2 原句）：

> "We find that distilled data performs good in 4-bit quantization but still has a large margin with the original ImageNet dataset in 2-bit quantization. We also find the final accuracy does not benefit much from the increase of number of distilled data, this might because the distilled data are minimized by a same objective and has low diversity."（§B.2）

**实现细节（§B.4.4）**：ImageNet 校准集为按标准预处理取的 1024 张 224×224 图；先fold BN 进卷积并冻结 BN 统计量（原句："We fold the batch normalization layer into convolution and freeze the BN statistics before post-training quantization."）；用 Adam 学 rounding 与激活 range；不属于任何 block 的层（首卷积、末全连接、MobileNetV2 末卷积）退回 naive layer reconstruction；每个 block 优化 2×10⁴ 次迭代（HTML 可见文本把上标拍平成 "2×104"）、batch size 32、rounding 学习率 10⁻³（HTML 作 "10−3"）、激活步长学习率 4e-5，且未实现 LSQ 原文的 gradient scale（§B.4.4）。

---

## 四、核心结论

1. **论文自述结论（§6 原句，逐字）**：

   > "In this paper, we propose Brecq, a post-training quantization framework by analyzing the second-order error. We show that the reconstruction of quantization at the block granularity arrives at a good balance of cross-layer dependency and first order approximation, especially in 2-bit weight quantization where no prior works succeed to quantize."
   >
   > "Brecq is compatible with mixed precision and can reduce the search cost. To our best knowledge, Brecq reaches the highest performance in post-training quantization and is the first to be on a par with quantization-aware training using 4-bit."（§6）

2. **对工程选型的含义（均为论文声称，尚未独立验证）**：
   - 重建粒度是 PTQ 的核心超参：block 粒度在 cross-layer dependency 与泛化误差之间取得最好折中（Table 1：ResNet-18 W2 65.19/66.39/66.01/54.15，MobileNetV2 W2 52.13/59.67/54.23/40.76；net-wise 崩到 54.15/40.76）。
   - 用输出元素平方梯度（FIM 对角）加权块输出重建，替代 AdaRound 的常数对角 Hessian 假设，是把 PTQ 推到 W2 的关键一步（§3.3，Eq. (10)）。
   - 成本极低：1024 张校准图、单卡 GTX 1080TI 20 分钟出 ResNet-18（§3.3）；W4A4 精度追平 QAT（Table 4：BRECQ 69.60/0.4 GPU hours vs PACT 69.2/100、DSQ 69.56/100、LSQ 71.1/100）。
   - 混合精度只需在 2-bit 位形上做遗传搜索（4/8-bit 几乎无损，§3.4），GA 50 个体 × 100 代约 3 秒（§B.4.4）；同 latency 下混合精度比 2-bit 统一精度最高 +10% 精度（§4.5）。
   - 「首末层必须留 8-bit」的经验法则并非普遍成立：W4 下全量化精度几乎无损（≤0.2%），且 ResNet-18 全 4-bit 比「2-bit+首末层 8-bit」更快还更准（§B.1，Table 6）。
   - 检测任务上 W4A8 几乎无损（Faster RCNN R18 只掉 0.21 mAP，§4.4），且 block reconstruction 只需作用于 backbone、FPN 等非块结构用逐层重建即可（§B.4.4）。

3. **本笔记与 claim 的边界**：以上均为论文声称（ImageNet top-1 / MS COCO mAP，模型与位宽见各表），本库未独立复现；官方仓库 README 的示例输出（W2A4 ResNet-18 "Full quantization (W2A4) accuracy: 65.21…"）与论文 64.80±0.08（Table 3）量级一致但为另一次运行，未做独立验证。若后续要建 claim 卡（如 「claim-brecq-block-reconstruction-w2-ptq」），需按 `templates/claim.md` 单独成卡并附 falsifiers。

---

## TODO

- [ ] **配图未嵌入**：按本次任务要求跳过配图。`library/assets/BRCEQ/` 已有 3 张截图：`Algorithm.png`（= Algorithm 1，BRECQ optimization）、`Format1.png`（= Theorem 3.1 与 Eq. (7)）、`Format2.png`（= §3.3 "The diagonal of the pre-activation FIM…" 句与 Eq. (10)）。如需入库请在用户确认后嵌入并核对图号。
- [ ] 本笔记为草稿（draft），尚未经用户审阅；引用规则遵循 AGENTS.md：论文结论均表述为「论文声称」，未做独立验证。
- [ ] **命名出入注记**：任务/QUEUE.md/TODO.md 用名 "BRCEQ"，论文实名 **BRECQ**（字母易位笔误）。arXiv API `all:"BRCEQ"` 无命中（本次核实）；笔记文件名按任务指定保留 `BRCEQ.md`，标题用论文实名。TODO.md / QUEUE.md 在禁改清单内，未修改，请调度班次决定是否更正用名。
- [ ] 抓取来源（本次实际抓取，日期 2026-11-02）：
  - arXiv abs 页：https://arxiv.org/abs/2102.05426 （核对标题 "BRECQ: Pushing the Limit of Post-Training Quantization by Block Reconstruction"、作者 Yuhang Li 等 9 人、v1 2021-02-10 / v2 2021-07-25、subjects cs.LG + cs.CV、**无 Comments 字段**；摘要引文出自此页）
  - arXiv HTML 全文（LaTeXML 生成）：https://arxiv.org/html/2102.05426v2 （全部正文引文、Table 1–6、公式号均来自此页；正文引文与表格已脚本核验为该页逐字文本）
  - 官方 GitHub 仓库：https://github.com/yhhhli/BRECQ （出处会议 "ICLR 2021" 与开源状态的依据："Pytorch implementation of BRECQ, ICLR 2021"；未核对 license 文件）
  - 本地素材（仅交叉确认，未作引文来源）：`library/assets/BRCEQ/Algorithm.png`、`Format1.png`、`Format2.png`
- [ ] 遗留观察（写笔记时发现，供调度班次参考）：
  1. 原文笔误三处，引用时均已照抄并括注：§4.3 Table 4 首行 "ZeroQ (Cai et al., 2020))"（双右括号）、§4.4 "our method is outperforms the mixed precision based ZeroQ model"（多 is）、Table 5 表题 "Objection detection task"（应为 Object detection）。
  2. HTML 渲染差异两处：正文名 small caps 渲染为 "Brecq"（引文照抄）；§3.2 一处图注引用被 LaTeXML 渲染成 "as 1(b) orange part illustrated"（应为 Figure 1(b)），对应引文用 "…" 截断处理。
  3. Table 2 的 Bit-Split 3/32 行、Table 3 的 Bit-Split 4/4 与 AdaQuant 2/4 行的 MnasNet 单元格在 HTML 源里为空单元格（同行其他方法用 "-"），笔记照原样留空。
  4. Table 2 表头作 "MnasNet-2.0"、Table 3 表头作 "MNasNet-2.0"，拼写不一致，均照原文。
  5. §B.4.4 的 2×10⁴ / 10⁻³ 在 HTML 可见文本中上标被拍平为 "2×104" / "10−3"，笔记正文已改写为规范记法并注明；未直接引用这两处片段。
  6. arXiv abs 页无 Comments 会议标注，"ICLR 2021" 仅依赖官方 GitHub 自述这一来源；如需更强出处可后续补 OpenReview 页面核对（本次未抓取）。
