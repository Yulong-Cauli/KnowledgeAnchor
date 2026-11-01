---
id: claim-repqvit-layernorm-reparam-recovers-layerwise
title: "RepQ-ViT 论文声称：LayerNorm 尺度重参数化把 DeiT-S W4A4 逐层量化精度从 33.17% 恢复到 69.03%（距逐通道上限 1.25 点）"
type: claim
status: asserted
scope: "DeiT-S（ImageNet 分类）；W4A4 PTQ；§3.2 消融仅改变 LayerNorm 后激活的量化器（纯逐层 / 纯逐通道 / scale 重参数化三选一），其余部分为完整方法（Softmax 侧已是 log_√2 重参数化，对应同一 69.03%）；逐通道 70.28% 为硬件不支持的精度参考；重参数化后 QKV 权重需在极少量校准数据上重校准（笔记未注明校准集来源与 split，校准 vs 测试口径以此区分）；数字为论文自报测试准确率；尚未独立验证"
tags: [quantization, ptq, repqvit, vit, w4a4, layernorm, scale-reparameterization]
note: library/Quantization/RepQ-ViT.md#32-消融实验
paper: "ICCV 2023, RepQ-ViT: Scale Reparameterization for Post-Training Quantization of Vision Transformers（代码：https://github.com/zkkli/RepQ-ViT）"
stance: watch
evidence:
  - source: library/Quantization/RepQ-ViT.md
    locator: "§3.2 / LayerNorm 激活量化消融"
    quote: "*   纯逐层量化 (Layer-wise)：33.17%（崩塌）"
    relation: supports
  - source: library/Quantization/RepQ-ViT.md
    locator: "§3.2 / LayerNorm 激活量化消融"
    quote: "*   纯逐通道量化 (Channel-wise)：70.28%（精度高，但硬件不支持）"
    relation: supports
  - source: library/Quantization/RepQ-ViT.md
    locator: "§3.2 / LayerNorm 激活量化消融"
    quote: "*   **Scale Reparam (Ours)**：**69.03%**（硬件完美支持，精度仅因权重重新校准损失 1.25%）"
    relation: supports
  - source: library/Quantization/RepQ-ViT.md
    locator: "§2.1 / 结论 3 注"
    quote: "因此 $\\widetilde{W}$ 需要在极少量校准数据上重新校准一下量化参数，这会带来极微小的精度损失"
    relation: supports
falsifiers:
  - "复现中纯逐层量化在 DeiT-S W4A4 下未崩至 33.17%，或重参数化后无法恢复到 69.03% 附近（差距 > 2 点）"
  - "重参数化后的逐层量化与纯逐通道（70.28%）差距显著大于 1.25 点"
  - "权重重校准所需数据并非『极少量』（如需数百张以上校准图或梯度重建），1.25 点损失是在更大校准代价下取得的"
  - "换到 Swin 等窗口注意力结构时，逐层→逐通道的恢复结论不成立"
review_due: 2026-12-02
related: [claim-repqvit-w4a4-imagenet-leads-ptq-baselines, claim-qwt-r2-gate-nonregression]
signoff: null
---

## 我的理解

论文声称（asserted，尚未独立验证）：LayerNorm 后激活通道间波动剧烈，逐层量化在 DeiT-S W4A4 下崩至 33.17%，逐通道量化能到 70.28% 但硬件激活运算不支持。RepQ-ViT 用变异因子 $r_1 = s/\tilde{s}$、$r_2 = z - \tilde{z}$ 构造伪激活，把逐通道量化参数向前吸收进 LayerNorm 的 $\gamma, \beta$、向后补偿进 QKV 权重，从而在硬件支持的逐层量化下恢复到 69.03%，距逐通道上限仅 1.25 点（损失归因于 $r_1$ 改变权重分布后的重校准）。

读表注意：§3.2 两个消融表的 Scale Reparam 行同为 69.03%（即完整方法数字），说明每个消融是在另一组件固定为最终设定下做的；69.03% 不是"只动 LayerNorm、其余随机"的结果。

限定：70.28%（逐通道）是硬件不支持的精度上限参考，不是可部署基线；"极少量校准数据"笔记未给出具体张数与 split，复现时需区分校准/测试口径（QwT 教训）。原始笔记见 [RepQ-ViT](../library/Quantization/RepQ-ViT.md#32-消融实验)。

## 待验证

- 用官方仓库在 DeiT-S W4A4 下复现三档消融：纯逐层 33.17 / 纯逐通道 70.28 / 重参数化 69.03。
- 记录权重重校准实际使用的校准图数量与来源，确认"极少量"的具体口径。
- 在 Swin-S 上重复 LayerNorm 消融，检验结论是否跨结构。

## 若成立 / 不成立意味着什么

成立：ViT 激活逐通道→逐层的等价转换是低成本、近无损的，可推广到其他逐通道量化的硬件适配场景（与 QwT 的补偿思路互补：RepQ-ViT 改量化器形态，QwT 事后补偿残差）。
不成立：恢复幅度依赖特定结构或未写明的校准设定，逐层量化路线对 ViT 仍不可用，需逐通道硬件支持或换 W8A8。
