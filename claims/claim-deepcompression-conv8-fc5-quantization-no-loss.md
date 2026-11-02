---
id: claim-deepcompression-conv8-fc5-quantization-no-loss
title: "Deep Compression 自报：剪枝后 AlexNet 权重量化到 CONV 8-bit / FC 5-bit 精度无损（Top-1 Error Increase 0.00%），CONV 低于 4-bit 才显著掉点（4/2 掉 1.99%/2.60%）"
type: claim
status: asserted
scope: "AlexNet on ImageNet ILSVRC-2012（Caffe 参考模型）；量化对象是剪枝后网络（60M→6.7M 权重）的权重；只量化权重、激活 32-bit；质心数 CONV 256（8-bit）/ FC 32（5-bit），k-means + 反传微调（'trained quantization'）；位宽敏感性边界只测了 AlexNet 的 CONV/FC 两类层；论文自报，尚未独立验证"
tags: [quantization, weight-sharing, kmeans, deepcompression, bitwidth]
note: library/Quantization/DeepCompression.md#35-讨论6-discussions
paper: "ICLR 2016 (oral)（arXiv:1510.00149）, Deep Compression: Compressing Deep Neural Networks with Pruning, Trained Quantization and Huffman Coding"
stance: watch
evidence:
  - source: library/Quantization/DeepCompression.md
    locator: "§3 Trained Quantization and Weight Sharing"
    quote: "For pruned AlexNet, we are able to quantize to 8-bits (256 shared weights) for each CONV layers, and 5-bits (32 shared weights) for each FC layer without any loss of accuracy."
    relation: supports
  - source: library/Quantization/DeepCompression.md
    locator: "§6.3 / Table 6（8/5 bits 行）"
    quote: "| 8 bits / 5 bits | 42.78% | 19.70% | 0.00% | -0.03% |"
    relation: supports
  - source: library/Quantization/DeepCompression.md
    locator: "§6.3 / Table 6（4/2 bits 行，最激进档）"
    quote: "| 4 bits / 2 bits | 44.77% | 22.33% | 1.99% | 2.60% |"
    relation: supports
  - source: library/Quantization/DeepCompression.md
    locator: "§6.1 讨论（位宽敏感性边界）"
    quote: "For CONV layers, accuracy drops significantly below 4 bits, while FC layer is more robust: not until 2 bits did the accuracy drop significantly."
    relation: supports
falsifiers:
  - "复现剪枝后 AlexNet 的 8/5 配置出现明显精度下降（Top-1 Error Increase ≫0.00%），或必须依赖论文未用的技巧才无损"
  - "复现 CONV 4-bit 已显著掉点（与『4-bit 以下才显著』边界不符），或 FC 2-bit 无损（边界另移）"
  - "发现无损依赖剪枝前置（在未剪枝网络上同位宽明显掉点且不可由微调恢复），即『量化在剪枝网络上更有效』的隐含前提被推翻"
review_due: 2026-12-03
related: [claim-deepcompression-35x-49x-no-accuracy-loss, claim-deepcompression-batch1-pruning-speedup-energy]
signoff: null
---

## 我的理解

论文声称（asserted，尚未独立验证）：对剪枝后的 AlexNet，k-means 质心 + 反传微调的"训练量化"可以把 CONV 层压到 8-bit（256 质心）、FC 层压到 5-bit（32 质心）而不损精度——Table 6 给出 8/5 bits 档 Top-1 Error Increase 0.00%（top-5 还降 0.03%）；更硬件友好的 8/4 档也只有 0.01%；最激进的 4/2 档掉 1.99%/2.60%。位宽敏感性分层：CONV 低于 4-bit 才显著掉点，FC 到 2-bit 才显著。

必须记住的口径限定：

1. **量化在剪枝之后**：论文解释是剪枝后待量化权重从 60M 降到 6.7M，同质心数下量化误差更小（§6.1）；本卡主张不含"未剪枝网络同位宽也无损"。
2. **只权重、不激活**：W8A32（CONV）/W5A32（FC）类配置；与库内 W4A4/激活量化路线（RepQ-ViT、OmniQuant 等）的比特预算不同口径，引用时不可横比压缩率。
3. **质心初始化有前提**：linear initialization 最优（§6.2，仅 3-bit 一档例外）；复现无损需同初始化方案。
4. Table 6 的 8/5 行与 Table 1 的 AlexNet Compressed 行是同一配置（42.78%/19.70%），两表自洽；2026-11-03 已对 ar5iv 实抓核对 Table 6 两行一致。

## 待验证

- 复现 8/5 与 8/4 两档（剪枝 AlexNet + k-means linear init + 微调），对账 Table 6 的 Increase 列。
- 扫 CONV 4/3/2-bit 与 FC 3/2-bit，确认敏感性边界（"below 4 bits" / "not until 2 bits"）。
- 在未剪枝 AlexNet 上跑同位宽量化对照，验证剪枝前置的必要性。

## 若成立 / 不成立意味着什么

成立：权重共享量化的实用位宽档是 CONV≥8 / FC≥5（激进档 4/2 代价 ~2%），为存储受限部署提供位宽选型基线；FC 层容忍更低比特。
不成立：无损依赖剪枝-量化-微调的特定顺序与 2016 年网络结构，位宽档位需按模型重扫，8/5 不再是安全默认。
