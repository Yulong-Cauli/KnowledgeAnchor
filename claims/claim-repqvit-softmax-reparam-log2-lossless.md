---
id: claim-repqvit-softmax-reparam-log2-lossless
title: "RepQ-ViT 论文声称：Softmax 尺度重参数化使硬件友好的 log_2 量化精度无损追平 log_√2 量化（DeiT-S W4A4 均 69.03%）"
type: claim
status: asserted
scope: "DeiT-S（ImageNet 分类）；W4A4 PTQ；§3.2 消融仅改变 Softmax 激活的对数量化器（log_2 / log_√2 / scale 重参数化三选一），其余部分为完整方法（LayerNorm 侧已是 scale 重参数化）；log_√2 69.03% 为『完美量化』精度参考；数字为论文自报测试准确率；笔记未给硬件 benchmark，等价性论证针对反量化公式的奇偶拆解与常数吸收；尚未独立验证"
tags: [quantization, ptq, repqvit, vit, w4a4, softmax, log-quantization]
note: library/Quantization/RepQ-ViT.md#32-消融实验
paper: "ICCV 2023, RepQ-ViT: Scale Reparameterization for Post-Training Quantization of Vision Transformers（代码：https://github.com/zkkli/RepQ-ViT）"
stance: watch
evidence:
  - source: library/Quantization/RepQ-ViT.md
    locator: "§3.2 / Softmax 激活量化消融"
    quote: "*   普通的 $\\log_2$ 量化：67.71%"
    relation: supports
  - source: library/Quantization/RepQ-ViT.md
    locator: "§3.2 / Softmax 激活量化消融"
    quote: "*   完美的 $\\log_{\\sqrt{2}}$ 量化：69.03%"
    relation: supports
  - source: library/Quantization/RepQ-ViT.md
    locator: "§3.2 / Softmax 激活量化消融"
    quote: "*   **Scale Reparam (Ours)**：**69.03%**（100% 数学等价，精度无损转移到硬件位移运算）"
    relation: supports
falsifiers:
  - "复现中重参数化后的 log_2 量化与 log_√2 量化出现可测量精度差（『100% 数学等价』不成立）"
  - "log_2 + 移位实现在目标硬件上相对 log_√2 软件实现无可测加速，『无损转移』没有部署收益"
  - "奇偶修正项（$\\mathbb{1}(A^{(\\mathbb{Z})})$ 相关常数）在部署中仍需逐元素乘法而非纯移位+加法，抵消硬件友好性"
review_due: 2026-12-02
related: [claim-repqvit-w4a4-imagenet-leads-ptq-baselines, claim-repqvit-layernorm-reparam-recovers-layerwise]
signoff: null
---

## 我的理解

论文声称（asserted，尚未独立验证）：Attention 概率呈幂律分布，硬件友好的 log_2 量化分辨率不足（67.71%），底数 √2 的量化器精度高（69.03%）但不支持移位加速。RepQ-ViT 在量化阶段用 log_√2（等价于 -2·log_2），反量化时按 $A^{(\mathbb{Z})}$ 的奇偶拆解指数：偶数部分走纯移位 $2^{\lfloor \cdot \rfloor}$，奇数修正常数吸收进新比例尺 $\tilde{s}$，从而把 log_√2 的精度"无损"转到 log_2 形态（消融中两者同为 69.03%，比普通 log_2 高 1.32 点）。

两个必须记住的限定：

1. 消融表的 69.03% 同时是完整方法数字（另一组件 LayerNorm 已固定为最终设定），见 [LayerNorm 消融卡](claim-repqvit-layernorm-reparam-recovers-layerwise.md) 的读表注意。
2. "100% 数学等价"是对反量化公式的数学论证，笔记没有给硬件 benchmark；且奇偶修正项按笔记公式是随 $A^{(\mathbb{Z})}$ 逐元素变化的常数，部署时是否真等价于"纯移位"需看内核实现——这直接关系该主张的部署价值。原始笔记见 [RepQ-ViT](../library/Quantization/RepQ-ViT.md#32-消融实验)。

## 待验证

- 用官方仓库在 DeiT-S W4A4 下复现三档消融：log_2 67.71 / log_√2 69.03 / 重参数化 69.03。
- 阅读官方实现的反量化内核，确认奇偶修正是否实现为纯整数移位 + 常数修正，有无逐元素浮点乘法。
- 在目标硬件上测 log_2 移位版相对 log_√2 版的实际时延差。

## 若成立 / 不成立意味着什么

成立：DeiT-S W4A4 下，RepQ-ViT 的 softmax 尺度重参数化使硬件友好的 log_2 形态无损追平 log_√2 精度——"对数域激活量化落硬件移位运算"路线在该场景可行，可作为 Attention 概率低比特部署的模板候选（其他结构/位宽是跨条件迁移检查，不能由本卡直接外推）。
不成立：等价性只在数学上成立、实现层有额外开销，该场景 Attention 概率低比特量化仍需定制硬件指令或保持 8-bit。

## 核查记录

- 2026-11-05（02 任务书整理班 P1-B2b）：3 条笔记 quote Grep 逐字命中笔记当前版。本轮为表达整理：成立/不成立段约束回 DeiT-S W4A4 并把模板推广标为迁移检查（falsifiers 三条均为同范围检查，未动）；数字未改写。
