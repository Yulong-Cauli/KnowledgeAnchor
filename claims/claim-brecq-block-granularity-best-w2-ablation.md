---
id: claim-brecq-block-granularity-best-w2-ablation
title: "BRECQ 消融自报：2-bit 权重量化下 block 粒度重建在 ResNet-18 与 MobileNetV2 上均最优（66.39 / 59.67），net-wise 崩至 54.15 / 40.76"
type: claim
status: asserted
scope: "ImageNet top-1；ResNet-18 与 MobileNetV2 两个 CNN；2-bit 权重量化、激活不量化、首末层保持 8-bit；BRECQ 论文 Table 1 自报消融（实现细节：每块 2×10⁴ 次迭代、batch 32、fold BN，§B.4.4）；『block 最优』仅限本消融覆盖的 2 个模型 × 1 种位宽配置，不含 ViT / 检测 / W4；论文声称，尚未独立验证"
tags: [quantization, ptq, brecq, block-reconstruction, ablation]
note: library/Quantization/BRECQ.md#31-消融四种重建粒度41
paper: "ICLR 2021（arXiv:2102.05426）, BRECQ: Pushing the Limit of Post-Training Quantization by Block Reconstruction（开源：https://github.com/yhhhli/BRECQ）"
stance: watch
evidence:
  - source: library/Quantization/BRECQ.md
    locator: "§4.1 / Table 1（ResNet-18 行，加粗为原文）"
    quote: "| ResNet-18 | 65.19 | **66.39** | 66.01 | 54.15 |"
    relation: supports
  - source: library/Quantization/BRECQ.md
    locator: "§4.1 / Table 1（MobileNetV2 行，加粗为原文）"
    quote: "| MobileNetV2 | 52.13 | **59.67** | 54.23 | 40.76 |"
    relation: supports
  - source: library/Quantization/BRECQ.md
    locator: "§4.1 正文结论"
    quote: "It can be seen from Table 1 that Block-wise optimization outperforms other methods. This result implies that the generalization error in net-wise and stage-wise optimization outweighs their off-diagonal loss."
    relation: supports
  - source: library/Quantization/BRECQ.md
    locator: "§3.2 正文（block 对角 Hessian 的机理解释；'…' 为笔记对 HTML 图注渲染片段的截断标记）"
    quote: "We think this is because the main off-diagonal loss in the Hessian is concentrated in each block … while the inter-block loss is small and can be ignored in the optimization."
    relation: supports
falsifiers:
  - "同设置（W2、激活不量化、首末层 8-bit、ImageNet）复现中 block 粒度不再最优：layer-wise ≥ block-wise，或 net-wise 不崩（明显 >54.15 / 40.76）"
  - "对照 arXiv HTML（arxiv.org/html/2102.05426v2，2026-11-03 已抓取核对 Table 4，2026-11-05 复抓逐格核对 Table 1 两行与表题 'Ablation study.' 一致）发现 Table 1 数字与笔记不一致"
  - "外推到本消融未覆盖的配置（ViT、检测、W4 等）时 block 粒度处处劣于 layer-wise，削弱『重建粒度是 PTQ 核心超参』的方法学含义（不推翻本卡限定的 Table 1 主张）"
review_due: 2026-12-03
related: [claim-brecq-w4a4-comparable-qat-1024-images, claim-brecq-w2a4-first-usable-level, claim-pdquant-beats-brecq-qdrop-lowbit]
signoff: null
---

## 我的理解

论文声称（asserted，尚未独立验证）：把二阶误差（Gauss-Newton 矩阵）展开后，重建粒度有 layer / block / stage / net 四档；BRECQ 的核心立场是取中间的 block 粒度——块内跨层依赖保留、块间依赖忽略。Table 1 的 W2 消融支持这一点：block 列在 ResNet-18（66.39）与 MobileNetV2（59.67）上都是最优，且净差主要来自两端——net-wise 过拟合崩到 54.15 / 40.76，layer-wise 则丢掉块内依赖（65.19 / 52.13）。

必须记住的口径限定：

1. **只有 2 个模型 × 1 种配置**：ResNet-18 上 block 66.39 vs stage 66.01 只差 0.38，论文自己归因于「模型浅、block/stage 小」（§4.1），故『block 显著优于 stage』在浅模型上并不显著；显著差的是 block vs layer（MobileNetV2 +7.54）与 block vs net（+5.5～+18.9）。
2. 这是 W2 权重量化的消融（Table 1 表题 "Ablation study."，激活不量化、首末层 8-bit）；与 [W4A4-QAT 对比卡](claim-brecq-w4a4-comparable-qat-1024-images.md)、[W2A4 卡](claim-brecq-w2a4-first-usable-level.md) 的全量化设置不同口径。
3. 机理解释（off-diagonal loss 集中在块内）是作者推断（"We think"），不是被证明的定理；被证明的是 Theorem 3.1 的二阶误差输出空间变换。
4. 本卡是 BRECQ 建模谱系（QDrop、PD-Quant 等 block 重建后继）的立论基础：见 [PD-Quant 对比卡](claim-pdquant-beats-brecq-qdrop-lowbit.md)——那张卡比较的是低比特 PTQ 方法精度，本卡只锚 BRECQ 自己 Table 1 的粒度消融，主张不同、数字不重叠。

原文复核：arXiv HTML（https://arxiv.org/html/2102.05426v2 ）2026-11-03 实抓，Table 4 各行与 §4.3 结论句逐字核对一致（Table 1 已于 2026-11-05 复抓逐格核对一致，falsifier 2 兜底条款保留）。

## 核查记录

- 2026-11-05（P1-B2a 量化主线经典组）：evidence 四条 quote 对笔记逐字机械核对命中；复抓 arXiv HTML v2 逐格核对 Table 1 两行（ResNet-18 65.19/66.39/66.01/54.15，MobileNetV2 52.13/59.67/54.23/40.76）与表题 "Ablation study." 一致，原 falsifier 2 的"Table 1 待核对"待办关闭。命题与数字未改。

## 待验证

- 用官方仓库（torch.hub 预训练模型 + README 复现命令）跑 W2 消融，对照 Table 1 四列数字。
- 在 MobileNetV2 上确认 layer 52.13 → block 59.67 的 +7.54 增益方向可复现（这是本消融里最大的单点差）。
- 把粒度消融扩到 ViT / W4 配置，检验 block 最优是否外推。

## 若成立 / 不成立意味着什么

成立：做低比特 PTQ 时重建粒度应选 block（或至少避免 net-wise），QDrop/PD-Quant 一系 block 重建路线有依据；工程上「块对角 Hessian + 平方梯度加权」是可复用组件。
不成立：block 最优依赖论文自报的特定实现（迭代数、校准集），粒度选择退化为逐模型调参，BRECQ 相对 AdaRound/Bit-Split 的方法论优势被削弱。
