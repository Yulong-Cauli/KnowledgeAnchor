---
id: claim-deepcompression-batch1-pruning-speedup-energy
title: "Deep Compression 自报：batch=1 实时场景下剪枝层平均 3×–4× 加速、3×–7× 省能，batching 场景优势消失；量化模型未测"
type: claim
status: asserted
scope: "FC 层为主（占模型大小 90%+、VGG-16 剪掉 96% 权重）；batch size = 1；硬件：NVIDIA GTX Titan X / Intel Core i7 5930K / NVIDIA Tegra K1；dense 用 cuBLAS/MKL GEMV、sparse 用 cuSPARSE/MKL SPBLAS CSRMV（§6.3）；只测剪枝稀疏模型，量化+权重共享模型未 benchmark（BLAS 不支持 indirect lookup）；加速/能耗是逐层平均口径；论文自报"
tags: [pruning, speedup, energy-efficiency, deepcompression, batch1, edge-deployment]
note: library/Quantization/DeepCompression.md#35-讨论6-discussions
paper: "ICLR 2016 (oral)（arXiv:1510.00149）, Deep Compression: Compressing Deep Neural Networks with Pruning, Trained Quantization and Huffman Coding"
stance: watch
evidence:
  - source: library/Quantization/DeepCompression.md
    locator: "§6.3 加速结果"
    quote: "When batch size = 1, pruned network layer obtained 3× to 4× speedup over the dense network on average because it has smaller memory footprint and alleviates the data transferring overhead, especially for large matrices that are unable to fit into the caches."
    relation: supports
  - source: library/Quantization/DeepCompression.md
    locator: "§6.3 / Figure 9 caption（引文内）"
    quote: "3× speedup on CPU, 3.5× on GPU and 4.2× on mobile GPU on average"
    relation: supports
  - source: library/Quantization/DeepCompression.md
    locator: "§6.3 / Figure 10 caption（引文内）"
    quote: "7× less energy on CPU, 3.3× less on GPU and 4.2× less on mobile GPU on average"
    relation: supports
  - source: library/Quantization/DeepCompression.md
    locator: "§6.3 batching 反转（'applications ,' 空格逗号为原文照抄）"
    quote: "In those latency-tolerating applications , batching improves memory locality, where weights could be blocked and reused in matrix-matrix multiplication. In this scenario, pruned network no longer shows its advantage."
    relation: supports
  - source: library/Quantization/DeepCompression.md
    locator: "§6.3 未测量化模型的原因"
    quote: "Since current BLAS library on CPU and GPU doesn't support indirect look-up and relative indexing, we didn't benchmark the quantized model."
    relation: supports
falsifiers:
  - "同硬件（或现代替代品）batch=1 复现中剪枝层平均加速 <2× 或能耗无显著优势（<1.5×）"
  - "batching（如 batch=64，Appendix A Table 8 口径）下剪枝仍显示明显优势，与『优势消失』反转不符"
  - "发现逐层平均掩盖了某些层的负加速（个别层变慢），3×–4× 是选择性口径"
review_due: 2026-12-03
related: [claim-deepcompression-35x-49x-no-accuracy-loss, claim-deepcompression-conv8-fc5-quantization-no-loss]
signoff: null
---

## 我的理解

论文声称（asserted）：在延迟敏感、batch=1 的实时场景（论文举的例子是车载嵌入式行人检测），剪枝稀疏网络层相对稠密层平均提速 3×–4×（CPU 3× / GPU 3.5× / mobile GPU 4.2×）、省能 3×–7×（CPU 7× / GPU 3.3× / mobile GPU 4.2×）；机理是访存减少（权重 fit 进 cache）。但一旦 batching（batch=64），GEMM 的权重复用使稀疏优势消失。

必须记住的口径限定：

1. **只测了剪枝（稀疏），没测量化**：量化+权重共享模型的端到端收益在 2016 年没有任何硬件证据（cuBLAS/MKL 不支持 indirect lookup），论文把出路指向定制 ASIC（后来的 EIE）。引用 DeepCompression 的"35× 压缩 + 3×–4× 加速"时必须拆开：前者是存储，后者只属剪枝。
2. **逐层平均、FC 为主**：速度/能耗数字是 FC 层平均（FC 占参数 90%+、剪枝最狠），CONV 层未给出同口径汇总；"3×–7× 能效" 的两端差在 CPU 与 GPU 之间，不是同一硬件的不确定度。
3. **2016 年硬件与库**：Titan X / Tegra K1 / MKL 时代的 GEMV vs CSRMV；现代 GPU tensor core、结构化稀疏、SpMM 库已改变权衡，falsifier 1 明确含"现代替代品"。
4. Figure 9/10 的 caption 片段是笔记从 §6.3 引文内逐字摘录（ar5iv 底本），2026-11-03 实抓核对两句正文一致；caption 片段与 Appendix Table 8 逐层明细（未转录，见笔记 TODO）未逐格对账。

## 待验证

- 在 batch=1 下复测 FC 层 GEMV vs CSRMV 的时延/能耗（Titan X 或现代 GPU + cuSPARSE），对账 3×–4× / 3×–7×。
- 复现 batch=64 反转（对照 Appendix A Table 8 的明细——需先补转录）。
- 用 EIE 论文或现代稀疏推理库核实"量化+稀疏端到端收益"是否被后续硬件工作兑现。

## 若成立 / 不成立意味着什么

成立：单样本实时推理（车载、边缘）里非结构化剪枝是有效的延迟/能耗手段，batch 服务场景则不值得；压缩收益要按"存储 vs 延迟"分账。
不成立：加速/能耗是特定 2016 年库与硬件的产物，现代硬件上需重测，剪枝选型回到结构化稀疏/蒸馏路线。
