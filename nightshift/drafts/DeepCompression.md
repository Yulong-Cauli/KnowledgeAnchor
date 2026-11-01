# Deep Compression: Compressing Deep Neural Networks with Pruning, Trained Quantization and Huffman Coding

**出处会议：** ICLR 2016（arXiv abs 页 Comments: "Published as a conference paper at ICLR 2016 (oral)"；v5 PDF 首页页眉同为 "Published as a conference paper at ICLR 2016"）  
**是否开源：** arXiv abs 页未给出官方代码链接（本次抓取确认无任何代码 URL）；正文仅说明实现基于 Caffe："Training is performed with the Caffe framework (Jia et al. 2014)."（§5）  
**关键词：** 网络剪枝（pruning）、训练量化与权重共享（k-means 码本微调）、Huffman 编码、35×–49× 无损压缩、on-chip SRAM、稀疏相对索引

> 来源与核验（抓取日期 2026-11-02）：
> - arXiv abs 页 https://arxiv.org/abs/1510.00149 ，标题 "Deep Compression: Compressing Deep Neural Networks with Pruning, Trained Quantization and Huffman Coding"，与任务给定标题逐字一致，允许使用。作者：Song Han（Stanford）、Huizi Mao（Tsinghua）、William J. Dally（Stanford / NVIDIA）；Comments 字段 "Published as a conference paper at ICLR 2016 (oral)"；v1 2015-10-01，最新 v5 2016-02-15。
> - 全文 ar5iv https://ar5iv.labs.arxiv.org/html/1510.00149 （title 核对一致；页面未标注所渲染的具体 arXiv 版本号），并与 arXiv v5 PDF https://arxiv.org/pdf/1510.00149v5 （首页印有 "Published as a conference paper at ICLR 2016"）交叉核对：摘要核心数字与 Table 1/2/3/4/5/6/7 全部行逐项一致。以下 locator（§x / Eq.x / Table x / Figure x / Appendix A）指该论文 ICLR 2016 版章节与表格编号。
> - 引号内为本次实际抓取文本的逐字摘录（以 ar5iv 渲染为底本）。技术性转写约定（内容不变）：ar5iv 中数学对象以“可见符号 + LaTeX 源码注释”双重渲染且夹零宽空格，此处取可见渲染形式（如 35×、20%−30%、2a+n+1）；数学粗体数字字符（𝟑𝟓 等）按字面转写为普通数字；下标（如 conv1_1、W_ij、c_i）以下划线转写；论文内部弯引号 “ ” 与原文一致保留。以上转写均经脚本对两源文本归一化核验。
> - 本笔记为草稿（nightshift/drafts/），未经用户核阅前所有结论均属“论文声称 / 尚未独立验证”。

------

## 1. 概述

- 论文动机：神经网络算力与存储开销大，难以部署到嵌入式系统（Abstract）。能耗被访存主导（§1）："Under 45nm CMOS technology, a 32 bit floating point add consumes 0.9pJ, a 32bit SRAM cache access takes 5pJ, while a 32bit DRAM memory access takes 640pJ, which is 3 orders of magnitude of an add operation." 论文据此推算（§1）："Running a 1 billion connection neural network, for example, at 20fps would require (20Hz)(1G)(640pJ)=12.8W just for DRAM access - well beyond the power envelope of a typical mobile device."
- 方法核心（Abstract 原句）："we introduce “deep compression”, a three stage pipeline: pruning, trained quantization and Huffman coding, that work together to reduce the storage requirement of neural networks by 35× to 49× without affecting their accuracy." 三步之后（Abstract）："After the first two steps we retrain the network to fine tune the remaining connections and the quantized centroids."
- 分步压缩量（Abstract）："Pruning, reduces the number of connections by 9× to 13×; Quantization then reduces the number of bits that represent each connection from 32 to 5."
- 头条结果（Abstract）："our method reduced the storage required by AlexNet by 35×, from 240MB to 6.9MB, without loss of accuracy. Our method reduced the size of VGG-16 by 49× from 552MB to 11.3MB, again with no loss of accuracy. This allows fitting the model into on-chip SRAM cache rather than off-chip DRAM memory."
- 论文自称的洞察（§1）："Our main insight is that, pruning and trained quantization are able to compress the network without interfering each other, thus lead to surprisingly high compression rate." 并说明后续硬件工作（§1）："Based on “deep compression”, the EIE hardware accelerator Han et al. 2016 was later proposed that works on the compressed model, achieving significant speedup and energy efficiency improvement."
- 实验口径（§5 脚注 1）："Reference model is from Caffe model zoo, accuracy is measured without data augmentation"。

## 2. 方法

### 2.1 剪枝（§2 Network Pruning）

- 三步流程（§2 原句）："we start by learning the connectivity via normal network training. Next, we prune the small-weight connections: all connections with weights below a threshold are removed from the network. Finally, we retrain the network to learn the final weights for the remaining sparse connections." 论文声称剪枝量（§2）："Pruning reduced the number of parameters by 9× and 13× for AlexNet and VGG-16 model."
- 稀疏结构存储（§2）："We store the sparse structure that results from pruning using compressed sparse row (CSR) or compressed sparse column (CSC) format, which requires 2a+n+1 numbers, where a is the number of non-zero elements and n is the number of rows or columns."
- 进一步压缩索引（§2）："we store the index difference instead of the absolute position, and encode this difference in 8 bits for conv layer and 5 bits for fc layer." 溢出处理（§2）："in case when the difference exceeds 8, the largest 3-bit (as an example) unsigned number, we add a filler zero"（即 Figure 2 的 zero padding 方案）。

### 2.2 训练量化与权重共享（§3 Trained Quantization and Weight Sharing）

- 思路（§3）："Network quantization and weight sharing further compresses the pruned network by reducing the number of bits required to represent each weight. We limit the number of effective weights we need to store by having multiple connections share the same weight, and then fine-tune those shared weights."
- 4×4 权重示例（§3）：权重被量化到 4 个 bin（4 种颜色），同 bin 权重共享同一值，只需存码本 + 小索引；更新时"all the gradients are grouped by the color and summed together, multiplied by the learning rate and subtracted from the shared centroids from last iteration"（§3）。论文声称（§3）："For pruned AlexNet, we are able to quantize to 8-bits (256 shared weights) for each CONV layers, and 5-bits (32 shared weights) for each FC layer without any loss of accuracy."
- 压缩率公式（Eq.1，§3）：给定 k 个聚类、n 个连接、每连接 b bit，压缩率 r = nb/(n log₂(k)+kb)。原文（§3）："constraining the connections to have only k shared weights will result in a compression rate of:"。文内算例（§3）：4×4=16 个 32bit 权重共享为 4 个质心 + 16 个 2bit 索引，压缩率 16∗32/(4∗32+2∗16)=3.2（∗ 为原文乘号字符）。
- k-means 求解（§3.1 Weight Sharing）："We use k-means clustering to identify the shared weights for each layer of a trained network, so that all the weights that fall into the same cluster will share the same weight. Weights are not shared across layers." 目标函数为最小化簇内平方和（§3.1 原文："so as to minimize the within-cluster sum of squares (WCSS)"，Eq.2）：argmin_C Σ_{i=1..k} Σ_{w∈c_i} |w−c_i|²。
- 与 HashNet 的区别（§3.1）："Different from HashNet (Chen et al. 2015) where weight sharing is determined by a hash function before the networks sees any training data, our method determines weight sharing after a network is fully trained, so that the shared weights approximate the original network."

### 2.3 共享权重（质心）初始化（§3.2 Initialization of Shared Weights）

- 三种初始化（§3.2）："We examine three initialization methods: Forgy(random), density-based, and linear initialization." 剪枝后权重呈双峰分布（§3.2："The weights forms a bimodal distribution after network pruning."）。
- 大权重问题（§3.2）："Larger weights play a more important role than smaller weights (Han et al. 2015), but there are fewer of these large weights. Thus for both Forgy initialization and density-based initialization, very few centroids have large absolute value which results in poor representation of these few large weights. Linear initialization does not suffer from this problem."
- 结论（§3.2）："The experiment section compares the accuracy of different initialization methods after clustering and fine-tuning, showing that linear initialization works best."

### 2.4 前向与反传（§3.3 Feed-forward and Back-propagation）

- 前向经码本一次间接寻址（§3.3）："There is one level of indirection during feed forward phase and back-propagation phase looking up the weight table."
- 质心梯度（Eq.3，§3.3）：记损失 L、权重 W_ij、W_ij 的质心索引 I_ij、第 k 个质心 C_k，原文（§3.3）："By using the indicator function 𝟙(.), the gradient of the centroids is calculated as:" 即 ∂L/∂C_k = Σ_{i,j} ∂L/∂W_ij · 𝟙(I_ij=k)（𝟙(.) 为原文指示函数符号）。

### 2.5 Huffman 编码（§4 Huffman coding）

- 依据（§4）：量化后权重与稀疏索引分布均偏斜——"most of the quantized weights are distributed around the two peaks; the sparse matrix index difference are rarely above 20"（以 AlexNet 最后一个 FC 层为例，Figure 5）。
- 收益（§4）："Experiments show that Huffman coding these non-uniformly distributed values saves 20%−30% of network storage." Huffman 编码无需训练（§5）："Huffman coding doesn't require training and is implemented offline after all the fine-tuning is finished."

## 3. 实验

### 3.1 总体结果（§5 Experiments, Table 1）

四个网络：MNIST 上两个（LeNet-300-100、LeNet-5）、ImageNet 上两个（AlexNet、VGG-16）。训练框架 Caffe（§5）；剪枝用 mask 屏蔽被剪连接的更新，量化用 codebook 结构 + 按 group-by-index 累加梯度更新共享权重（§5）。

Table 1（§5，逐行照抄；列：Network / Top-1 Error / Top-5 Error / Parameters / Compress Rate）：

| Network | Top-1 Error | Top-5 Error | Parameters | Compress Rate |
| --- | --- | --- | --- | --- |
| LeNet-300-100 Ref | 1.64% | - | 1070 KB |  |
| LeNet-300-100 Compressed | 1.58% | - | 27 KB | 40× |
| LeNet-5 Ref | 0.80% | - | 1720 KB |  |
| LeNet-5 Compressed | 0.74% | - | 44 KB | 39× |
| AlexNet Ref | 42.78% | 19.73% | 240 MB |  |
| AlexNet Compressed | 42.78% | 19.70% | 6.9 MB | 35× |
| VGG-16 Ref | 31.50% | 11.32% | 552 MB |  |
| VGG-16 Compressed | 31.17% | 10.91% | 11.3 MB | 49× |

Table 1 caption："The compression pipeline can save 35× to 49× parameter storage with no loss of accuracy." 正文（§5）："The total size of AlexNet decreased from 240MB to 6.9MB, which is small enough to be put into on-chip SRAM, eliminating the need to store the model in energy-consuming DRAM memory."

### 3.2 LeNet-300-100 与 LeNet-5（§5.1，Table 2 / Table 3）

Table 2（§5.1，LeNet-300-100 逐层统计，逐行照抄；列：Layer / #Weights / Weights% (P) / Weight bits (P+Q) / Weight bits (P+Q+H) / Index bits (P+Q) / Index bits (P+Q+H) / Compress rate (P+Q) / Compress rate (P+Q+H)；P: pruning, Q: quantization, H: Huffman coding）：

| Layer | #Weights | Weights% (P) | Weight bits (P+Q) | Weight bits (P+Q+H) | Index bits (P+Q) | Index bits (P+Q+H) | Compress rate (P+Q) | Compress rate (P+Q+H) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ip1 | 235K | 8% | 6 | 4.4 | 5 | 3.7 | 3.1% | 2.32% |
| ip2 | 30K | 9% | 6 | 4.4 | 5 | 4.3 | 3.8% | 3.04% |
| ip3 | 1K | 26% | 6 | 4.3 | 5 | 3.2 | 15.7% | 12.70% |
| Total | 266K | 8%(12×) | 6 | 5.1 | 5 | 3.7 | 3.1% (32×) | 2.49% (40×) |

Table 3（§5.1，LeNet-5，列同 Table 2）：

| Layer | #Weights | Weights% (P) | Weight bits (P+Q) | Weight bits (P+Q+H) | Index bits (P+Q) | Index bits (P+Q+H) | Compress rate (P+Q) | Compress rate (P+Q+H) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| conv1 | 0.5K | 66% | 8 | 7.2 | 5 | 1.5 | 78.5% | 67.45% |
| conv2 | 25K | 12% | 8 | 7.2 | 5 | 3.9 | 6.0% | 5.28% |
| ip1 | 400K | 8% | 5 | 4.5 | 5 | 4.5 | 2.7% | 2.45% |
| ip2 | 5K | 19% | 5 | 5.2 | 5 | 3.7 | 6.9% | 6.13% |
| Total | 431K | 8%(12×) | 5.3 | 4.1 | 5 | 4.4 | 3.05% (33×) | 2.55% (39×) |

正文（§5.1）："The compression rate includes the overhead of the codebook and sparse indexes. Most of the saving comes from pruning and quantization (compressed 32×), while Huffman coding gives a marginal gain (compressed 40×)"

### 3.3 AlexNet on ImageNet（§5.2，Table 4）

- 设定（§5.2）："We further examine the performance of Deep Compression on the ImageNet ILSVRC-2012 dataset, which has 1.2M training examples and 50k validation examples. We use the AlexNet Caffe model as the reference model, which has 61 million parameters and achieved a top-1 accuracy of 57.2% and a top-5 accuracy of 80.3%."
- 量化配置（§5.2）："There are 256 shared weights in each CONV layer, which are encoded with 8 bits, and 32 shared weights in each FC layer, which are encoded with only 5 bits. The relative sparse index is encoded with 4 bits. Huffman coding compressed additional 22%, resulting in 35× compression in total."

Table 4（§5.2，AlexNet 逐层统计，逐行照抄；列同 Table 2）：

| Layer | #Weights | Weights% (P) | Weight bits (P+Q) | Weight bits (P+Q+H) | Index bits (P+Q) | Index bits (P+Q+H) | Compress rate (P+Q) | Compress rate (P+Q+H) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| conv1 | 35K | 84% | 8 | 6.3 | 4 | 1.2 | 32.6% | 20.53% |
| conv2 | 307K | 38% | 8 | 5.5 | 4 | 2.3 | 14.5% | 9.43% |
| conv3 | 885K | 35% | 8 | 5.1 | 4 | 2.6 | 13.1% | 8.44% |
| conv4 | 663K | 37% | 8 | 5.2 | 4 | 2.5 | 14.1% | 9.11% |
| conv5 | 442K | 37% | 8 | 5.6 | 4 | 2.5 | 14.0% | 9.43% |
| fc6 | 38M | 9% | 5 | 3.9 | 4 | 3.2 | 3.0% | 2.39% |
| fc7 | 17M | 9% | 5 | 3.6 | 4 | 3.7 | 3.0% | 2.46% |
| fc8 | 4M | 25% | 5 | 4 | 4 | 3.2 | 7.3% | 5.85% |
| Total | 61M | 11%(9×) | 5.4 | 4 | 4 | 3.2 | 3.7% (27×) | 2.88% (35×) |

正文（§5.2）："Table 4 shows that AlexNet can be compressed to 2.88% of its original size without impacting accuracy."

### 3.4 VGG-16 on ImageNet（§5.3，Table 5）

正文（§5.3）："The VGG16 network as a whole has been compressed by 49×. Weights in the CONV layers are represented with 8 bits, and FC layers use 5 bits, which does not impact the accuracy. The two largest fully-connected layers can each be pruned to less than 1.6% of their original size." 并指出这对实时处理关键（§5.3）："This reduction is critical for real time image processing, where there is little reuse of these layers across images (unlike batch processing). This is also critical for fast object detection algorithms where one CONV pass is used by many FC passes."

Table 5（§5.3，VGG-16 逐层统计，逐行照抄；列同 Table 2，conv 层名 conv1_1 等为原文下标的转写）：

| Layer | #Weights | Weights% (P) | Weight bits (P+Q) | Weight bits (P+Q+H) | Index bits (P+Q) | Index bits (P+Q+H) | Compress rate (P+Q) | Compress rate (P+Q+H) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| conv1_1 | 2K | 58% | 8 | 6.8 | 5 | 1.7 | 40.0% | 29.97% |
| conv1_2 | 37K | 22% | 8 | 6.5 | 5 | 2.6 | 9.8% | 6.99% |
| conv2_1 | 74K | 34% | 8 | 5.6 | 5 | 2.4 | 14.3% | 8.91% |
| conv2_2 | 148K | 36% | 8 | 5.9 | 5 | 2.3 | 14.7% | 9.31% |
| conv3_1 | 295K | 53% | 8 | 4.8 | 5 | 1.8 | 21.7% | 11.15% |
| conv3_2 | 590K | 24% | 8 | 4.6 | 5 | 2.9 | 9.7% | 5.67% |
| conv3_3 | 590K | 42% | 8 | 4.6 | 5 | 2.2 | 17.0% | 8.96% |
| conv4_1 | 1M | 32% | 8 | 4.6 | 5 | 2.6 | 13.1% | 7.29% |
| conv4_2 | 2M | 27% | 8 | 4.2 | 5 | 2.9 | 10.9% | 5.93% |
| conv4_3 | 2M | 34% | 8 | 4.4 | 5 | 2.5 | 14.0% | 7.47% |
| conv5_1 | 2M | 35% | 8 | 4.7 | 5 | 2.5 | 14.3% | 8.00% |
| conv5_2 | 2M | 29% | 8 | 4.6 | 5 | 2.7 | 11.7% | 6.52% |
| conv5_3 | 2M | 36% | 8 | 4.6 | 5 | 2.3 | 14.8% | 7.79% |
| fc6 | 103M | 4% | 5 | 3.6 | 5 | 3.5 | 1.6% | 1.10% |
| fc7 | 17M | 4% | 5 | 4 | 5 | 4.3 | 1.5% | 1.25% |
| fc8 | 4M | 23% | 5 | 4 | 5 | 3.4 | 7.1% | 5.24% |
| Total | 138M | 7.5%(13×) | 6.4 | 4.1 | 5 | 3.1 | 3.2% (31×) | 2.05% (49×) |

### 3.5 讨论（§6 Discussions）

**剪枝与量化协同（§6.1）**：单独使用时两者都在压缩到原尺寸 8% 以下才开始显著掉精度；组合后（§6.1）："But when combined, as shown in the red line, the network can be compressed to 3% of original size with no loss of accuracy." 量化在剪枝网络上效果更好的解释（§6.1）："unpruned AlexNet has 60 million weights to quantize, while pruned AlexNet has only 6.7 million weights to quantize. Given the same amount of centroids, the latter has less error." 位宽敏感性（§6.1）："For CONV layers, accuracy drops significantly below 4 bits, while FC layer is more robust: not until 2 bits did the accuracy drop significantly."

Table 6（版面位于 §6.3 内、PDF 第 9 页；AlexNet 不同量化激进度的精度，逐行照抄；列：#CONV bits / #FC bits / Top-1 Error / Top-5 Error / Top-1 Error Increase / Top-5 Error Increase）：

| #CONV bits / #FC bits | Top-1 Error | Top-5 Error | Top-1 Error Increase | Top-5 Error Increase |
| --- | --- | --- | --- | --- |
| 32bits / 32bits | 42.78% | 19.73% | - | - |
| 8 bits / 5 bits | 42.78% | 19.70% | 0.00% | -0.03% |
| 8 bits / 4 bits | 42.79% | 19.73% | 0.01% | 0.00% |
| 4 bits / 2 bits | 44.77% | 22.33% | 1.99% | 2.60% |

Table 6 caption 要点："8/5 bit quantization has no loss of accuracy; 8/4 bit quantization, which is more hardware friendly, has negligible loss of accuracy of 0.01%; To be really aggressive, 4/2 bit quantization resulted in 1.99% and 2.60% loss of accuracy."

**质心初始化（§6.2）**："Linear initialization outperforms the density initialization and random initialization in all cases except at 3 bits."（2∼8 bit 扫描，top-1/top-5，Figure 8）。

**加速与能耗（§6.3）**：
- 场景定位（§6.3）："Deep Compression is targeting extremely latency-focused applications running on mobile, which requires real-time inference, such as pedestrian detection on an embedded processor inside an autonomous vehicle. Waiting for a batch to assemble significantly adds latency. So when bench-marking the performance and energy efficiency, we consider the case when batch size = 1."
- 为什么只测 FC 层（§6.3）："Fully connected layer dominates the model size (more than 90%) and got compressed the most by Deep Compression (96% weights pruned in VGG-16). In state-of-the-art object detection algorithms such as fast R-CNN (Girshick 2015), upto 38% computation time is consumed on FC layers on uncompressed model."
- 未测量化模型的原因（§6.3）："Since current BLAS library on CPU and GPU doesn't support indirect look-up and relative indexing, we didn't benchmark the quantized model."
- 硬件与库（§6.3）：NVIDIA GeForce GTX Titan X、Intel Core i7 5930K（桌面）、NVIDIA Tegra K1（移动）；dense 用 cuBLAS/MKL GEMV，sparse 用 cuSPARSE CSRMV / MKL SPBLAS CSRMV。
- 速度结果（§6.3）："When batch size = 1, pruned network layer obtained 3× to 4× speedup over the dense network on average because it has smaller memory footprint and alleviates the data transferring overhead, especially for large matrices that are unable to fit into the caches."（Figure 9 caption："3× speedup on CPU, 3.5× on GPU and 4.2× on mobile GPU on average"）。
- 能耗结果（§6.3）："When batch size = 1, pruned network layer consumes 3× to 7× less energy over the dense network on average."（Figure 10 caption："7× less energy on CPU, 3.3× less on GPU and 4.2× less on mobile GPU on average"）。
- batching 下的反转（§6.3）："In those latency-tolerating applications , batching improves memory locality, where weights could be blocked and reused in matrix-matrix multiplication. In this scenario, pruned network no longer shows its advantage."（Appendix A Table 8 给出 batch=64 明细；其 caption："For batch size = 1, gemv is used; For batch size = 64, gemm is used."）。

**存储占比（§6.4 Ratio of Weights, Index and Codebook）**：剪枝需额外索引、量化需码本，两者都已计入实验数字（§6.4）："Since on average both the weights and the sparse indexes are encoded with 5 bits, their storage is roughly half and half. The overhead of codebook is very small and often negligible."（Figure 11）。

### 3.6 与其他压缩方法对比（§7 Related Work, Table 7）

Table 7（§7，AlexNet 上与其他压缩方法对比，逐行照抄；列：Network / Top-1 Error / Top-5 Error / Parameters / Compress Rate；引用标注按 ar5iv 渲染形式，v5 PDF 中为 "(Yang et al., 2014)" 等，仅标点差异）：

| Network | Top-1 Error | Top-5 Error | Parameters | Compress Rate |
| --- | --- | --- | --- | --- |
| Baseline Caffemodel (BVLC) | 42.78% | 19.73% | 240MB | 1× |
| Fastfood-32-AD (Yang et al. 2014) | 41.93% | - | 131MB | 2× |
| Fastfood-16-AD (Yang et al. 2014) | 42.90% | - | 64MB | 3.7× |
| Collins & Kohli (Collins & Kohli 2014) | 44.40% | - | 61MB | 4× |
| SVD (Denton et al. 2014) | 44.02% | 20.56% | 47.6MB | 5× |
| Pruning (Han et al. 2015) | 42.77% | 19.67% | 27MB | 9× |
| Pruning+Quantization | 42.78% | 19.70% | 8.9MB | 27× |
| Pruning+Quantization+Huffman | 42.78% | 19.70% | 6.9MB | 35× |

Related work 定位（§7，注意均为论文自述对比、尚未独立验证）：HashedNets（Chen et al. 2015）用哈希函数随机分组共享权重，但 binning 由哈希预先决定、非训练学得；Gong et al. 2014 用向量量化压缩 convnet、"resulted in 1% accuracy loss"；两者"studied only the fully connected layer, ignoring the convolutional layers"（§7）。更早的量化工作：Vanhoucke et al. 2011 的 8-bit 定点实现、Hwang & Sung 2014 的三值权重 + 3-bit 激活、Denton et al. 2014 的低秩近似（§7）。

## 4. 核心结论

- 结论（§9 原句）："We have presented “Deep Compression” that compressed neural networks without affecting accuracy. Our method operates by pruning the unimportant connections, quantizing the network using weight sharing, and then applying Huffman coding."
- 量化数字口径（§9）："We highlight our experiments on AlexNet which reduced the weight storage by 35× without loss of accuracy. We show similar results for VGG-16 and LeNet networks compressed by 49× and 39× without loss of accuracy." 并重申能效逻辑（§9）："After Deep Compression the size of these networks fit into on-chip SRAM cache (5pJ/access) rather than requiring off-chip DRAM memory (640pJ/access)."
- 方法层面的关键结论（论文声称，尚未独立验证）：剪枝与训练量化互不干扰、可叠加（§1）；k-means 质心 + 反传微调的“训练量化”在不掉精度前提下把 CONV 压到 8bit、FC 压到 5bit（§3、§5.2、Table 6）；Huffman 再省 20%–30%（§4）；batch=1 实时场景下稀疏化带来 3×–4× 加速与 3×–7× 能效，但 batching 场景优势消失（§6.3）。
- 局限与后续（§8 Future Work）：量化+稀疏的完整收益未被现成库释放（§8）："While the pruned network has been benchmarked on various hardware, the quantized network with weight sharing has not, because off-the-shelf cuSPARSE or MKL SPBLAS library does not support indirect matrix entry lookup, nor is the relative index in CSC or CSR format supported." 出路是定制 GPU kernel 或 ASIC（§8）："A hardware solution is to build custom ASIC architecture specialized to traverse the sparse and quantized network structure, which also supports customized quantization bit width."（即后来的 EIE，§1）。

## 5. 与库内 Quantization/ 笔记的关系（笔记作者评述，非论文原文表述）

- Deep Compression 的"trained quantization"（k-means 码本 + 码本参与反传微调，§3.1/§3.3）是权重量化谱系中“量化参数可学习”思路的早期源头；库内 `library/Quantization/` 下 RepQ-ViT、OmniQuant 等 PTQ 笔记讨论的“量化参数重参数化/可学习化”与之一脉相承，且这些后续工作以更高比特效率（W4A4 等）与激活量化为主战场，而本文只量化权重、激活保持 32bit（Eq.1 的口径）。
- §7 Related Work 自认承接 8-bit 定点（Vanhoucke et al. 2011）、三值权重（Hwang & Sung 2014）、向量量化（Gong et al. 2014）等工作，说明本文自置于量化/压缩谱系之内；MQBench 等基准类工作所量化的“PTQ 部署友好性”问题（如 bit 宽与硬件算子支持）在本文 §8 的 BLAS 不支持 indirect lookup 的讨论中已有雏形。
- 以上两条为笔记建立的联系，论文本身未引用上述库内笔记涉及的任何后续工作（论文发表于 2016 年，早于这些工作），引用时请注意区分。

## TODO

- [ ] 配图未抓取（跳过）：Figure 1（三阶段 pipeline）、Figure 2（相对索引 + padding）、Figure 3（权重共享与质心微调）、Figure 4（三种初始化）、Figure 5（权重/索引分布）、Figure 6/7/8（精度-压缩率/位宽/初始化曲线）、Figure 9/10（加速/能耗）、Figure 11（存储占比）。如需入库，放 `library/assets/DeepCompression/`（该目录当前不存在，待用户建立后补）。
- [ ] Appendix A 的 Table 8/9（Titan X / i7-5930K / Tegra K1 上各 FC 层逐层 timing 与 power 明细，batch=1/64）未逐行转录，笔记仅记录 §6.3 与 Figure 9/10 caption 的汇总口径（3×–4× 加速、3×–7× 能效）。
- [ ] ar5iv 页面未标注所渲染的 arXiv 版本号；已与 v5 PDF 交叉核对摘要数字与 Table 1–7 全部行一致，但若用户需要逐字对齐某一版本（如 ICLR camera-ready 与 arXiv v5 的差异），需另行核对。
- [ ] “是否开源”仅核实到 abs 页无代码链接；如需确认官方代码仓库（如 Song Han 主页/Han Lab）需另行抓取验证，本次未做（songhan.github.io 返回 404）。

## 抓取记录

- 抓取日期：2026-11-02
- arXiv abs 页：https://arxiv.org/abs/1510.00149 （标题核对一致；Comments "Published as a conference paper at ICLR 2016 (oral)"）
- ar5iv 全文：https://ar5iv.labs.arxiv.org/html/1510.00149 （引文底本）
- arXiv v5 PDF：https://arxiv.org/pdf/1510.00149v5 （交叉核对：摘要数字 + Table 1/2/3/4/5/6/7 全部行）
- 核验方式：笔记内全部英文引文与表格单元格经脚本对两源文本归一化（数学粗体转 ASCII、去零宽空格、统一引号/连字符/空白）后逐项匹配通过。
