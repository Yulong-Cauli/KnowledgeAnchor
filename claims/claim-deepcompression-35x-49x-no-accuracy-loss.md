---
id: claim-deepcompression-35x-49x-no-accuracy-loss
title: "Deep Compression 自报：三阶段管线把 AlexNet 压缩 35×（240MB→6.9MB）、VGG-16 压缩 49×（552MB→11.3MB）且精度不降（top-1 error 42.78%→42.78%、31.50%→31.17%）"
type: claim
status: asserted
scope: "ImageNet ILSVRC-2012（1.2M train / 50k val）；AlexNet 与 VGG-16（Caffe model zoo 参考模型，精度测量无数据增强，§5 脚注）；压缩率含码本与稀疏索引开销（§5.1）；三阶段 = 剪枝（9×/13×）+ 训练量化（CONV 8-bit / FC 5-bit）+ Huffman；MNIST 上 LeNet-300-100/LeNet-5 同管线 40×/39× 不在本卡主张内；存储压缩主张，不含推理加速；论文自报"
tags: [compression, pruning, quantization, huffman, deepcompression, alexnet, vgg16]
note: library/Quantization/DeepCompression.md#31-总体结果5-experiments-table-1
paper: "ICLR 2016 (oral)（arXiv:1510.00149）, Deep Compression: Compressing Deep Neural Networks with Pruning, Trained Quantization and Huffman Coding（Song Han, Huizi Mao, William J. Dally）"
stance: watch
evidence:
  - source: library/Quantization/DeepCompression.md
    locator: "Abstract（arXiv abs 页抓取引文）"
    quote: "our method reduced the storage required by AlexNet by 35×, from 240MB to 6.9MB, without loss of accuracy. Our method reduced the size of VGG-16 by 49× from 552MB to 11.3MB, again with no loss of accuracy."
    relation: supports
  - source: library/Quantization/DeepCompression.md
    locator: "§5 / Table 1（AlexNet Compressed 行）"
    quote: "| AlexNet Compressed | 42.78% | 19.70% | 6.9 MB | 35× |"
    relation: supports
  - source: library/Quantization/DeepCompression.md
    locator: "§5 / Table 1（VGG-16 Compressed 行）"
    quote: "| VGG-16 Compressed | 31.17% | 10.91% | 11.3 MB | 49× |"
    relation: supports
  - source: library/Quantization/DeepCompression.md
    locator: "§2 Network Pruning（剪枝阶段贡献量）"
    quote: "Pruning reduced the number of parameters by 9× and 13× for AlexNet and VGG-16 model."
    relation: supports
  - source: library/Quantization/DeepCompression.md
    locator: "§5 / Table 1 caption"
    quote: "The compression pipeline can save 35× to 49× parameter storage with no loss of accuracy."
    relation: supports
falsifiers:
  - "复现压缩后精度显著下降：AlexNet top-1 error 明显高于 42.78%、VGG-16 明显高于 31.50%（'without loss of accuracy' 不成立）"
  - "复现总压缩率明显低于 35×/49×（需先排除是否未计码本/索引开销的口径差）"
  - "对照 arXiv v5 PDF / ar5iv 发现 Table 1 数字与笔记不一致（2026-11-03 已对 ar5iv 实抓核对 Table 1 两个 Compressed 行一致，若后续发现其他版本出入则触发）"
review_due: 2026-12-03
related: [claim-deepcompression-conv8-fc5-quantization-no-loss, claim-deepcompression-batch1-pruning-speedup-energy]
signoff: null
---

## 我的理解

论文声称（asserted）：剪枝 + 训练量化（k-means 码本 + 码本参与反传微调）+ Huffman 编码三阶段叠加，把 AlexNet 从 240MB 压到 6.9MB（35×）、VGG-16 从 552MB 压到 11.3MB（49×），且 top-1/top-5 error 不升（VGG-16 甚至略降：31.50%→31.17%、11.32%→10.91%）。分阶段贡献：剪枝 9×/13×（Table 4/5 Total 行记为 11%(9×)、7.5%(13×)），量化到 P+Q 27×/31×，Huffman 再省 20%–30% 到 35×/49×。

必须记住的口径限定：

1. **"without loss of accuracy" 的判定粒度是 error 不升**（AlexNet top-1 error 精确相等 42.78%→42.78%，top-5 19.73%→19.70%），不是逐样本一致；且参考精度是 Caffe model zoo 模型、无数据增强的口径（§5 脚注），与后来文献常用的增强口径不可直接比。
2. **只量化权重**：激活保持 32-bit（Eq.1 口径），压缩率是存储/参数量意义上的；推理速度与能耗是另一条主张（见 [batch=1 卡](claim-deepcompression-batch1-pruning-speedup-energy.md)），且当时 BLAS 无法运行量化+稀疏模型（§8）。
3. **存储口径含开销**：压缩率计入码本与相对索引（§5.1 "The compression rate includes the overhead of the codebook and sparse indexes."），复现对账时不能只算权重字节。
4. 这是 2016 年的 35×/49×：对象是超大 FC 层占 90%+ 参数的 AlexNet/VGG-16 时代模型，不能直接外推到现代骨干（FC 占比低、BN/残差结构不同）。

原文复核：ar5iv（https://ar5iv.labs.arxiv.org/html/1510.00149 ）2026-11-03 实抓，Table 1 两个 Compressed 行、Table 6 两行与 §6.3 两句逐字核对一致；笔记另与 arXiv v5 PDF 交叉核对过 Table 1–7 全部行（见笔记抓取记录）。

## 待验证

- 用 Caffe AlexNet/VGG-16 参考模型复跑三阶段管线，对账 Table 1 的 error 与压缩率（注意计入码本/索引开销）。
- 验证剪枝阶段 9×/13× 的阈值-再训练流程（Table 4/5 的 Weights% 列逐层对账）。
- 在现代骨干（如 ResNet/ConvNeXt）上重估同管线的可达压缩率，确认外推边界。

## 若成立 / 不成立意味着什么

成立：存储受限（on-chip SRAM、模型下发）场景下三阶段压缩是无损基线；剪枝与训练量化可叠加的结论支撑后续压缩选型。
不成立：无损依赖 2016 年模型结构与无增强评测口径，现代模型上管线需重新验证，35×/49× 只作历史锚点。
