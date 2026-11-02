---
id: claim-qlora-nf4-info-theoretic-optimal-datatype
title: "QLoRA 声称：NF4 由零均值正态分布的 2k+1 分位数离线构造、非对称化保证精确零点，对零均值正态权重'信息论最优'（每个量化 bin 等期望填充；附录 E 给出 16 个码点）"
type: claim
status: asserted
scope: "4-bit NormalFloat（NF4）数据类型本身的设计/理论主张；前提假设：预训练神经网络权重零均值正态（σ 任意，absmax 缩放归一到 [-1,1]，§3 + Appendix F）；'信息论最优' 指分位数量化的等期望填充性质（论文声称，非本库推导复核）；实证优越性（PPL/精度）归 [NF4+DQ 恢复卡]；尚未独立验证"
tags: [quantization, llm, qlora, nf4, data-type, information-theory]
note: library/Quantization/QLoRA.md#22-4-bit-normalfloatnf43-之-4-bit-normalfloat-quantization-小节
paper: "NeurIPS 2023（arXiv:2305.14314）, QLoRA: Efficient Finetuning of Quantized LLMs（开源：https://github.com/artidoro/qlora 、https://github.com/TimDettmers/bitsandbytes）"
stance: watch
evidence:
  - source: library/Quantization/QLoRA.md
    locator: "§3 / NF4 命名与最优性句"
    quote: "We term the resulting data type that has equal expected number of values in each quantization bin k-bit NormalFloat (NFk), since the data type is information-theoretically optimal for zero-centered normally distributed data."
    relation: supports
  - source: library/Quantization/QLoRA.md
    locator: "§3 / 构造三步（(1)(2)(3)）"
    quote: "The information theoretically optimal data type for zero-mean normal distributions with arbitrary standard deviations σ in the range [−1,1] is computed as follows: (1) estimate the 2k+1 quantiles of a theoretical N(0,1) distribution to obtain a k-bit quantile quantization data type for normal distributions, (2) take this data type and normalize its values into the [−1,1] range, (3) quantize an input weight tensor by normalizing it into the [−1,1] range through absolute maximum rescaling."
    relation: supports
  - source: library/Quantization/QLoRA.md
    locator: "§3 / 非对称化精确零点"
    quote: "To ensure a discrete zeropoint of 0 and to use all 2k bits for a k-bit datatype, we create an asymmetric data type by estimating the quantiles qi of two ranges qi: 2k−1 for the negative part and 2k−1+1 for the positive part and then we unify these sets of qi and remove one of the two zeros that occurs in both sets."
    relation: supports
  - source: library/Quantization/QLoRA.md
    locator: "§3 / 正态假设依据"
    quote: "Since pretrained neural network weights usually have a zero-centered normal distribution with standard deviation σ (see Appendix F), we can transform all weights to a single fixed distribution by scaling σ such that the distribution fits exactly into the range of our data type."
    relation: supports
  - source: library/Quantization/QLoRA.md
    locator: "Appendix E（NF4 的 16 个精确码点，负 8 / 正 7 加 0）"
    quote: "[-1.0, -0.6961928009986877, -0.5250730514526367, -0.39491748809814453, -0.28444138169288635, -0.18477343022823334, -0.09105003625154495, 0.0, 0.07958029955625534, 0.16093020141124725, 0.24611230194568634, 0.33791524171829224, 0.44070982933044434, 0.5626170039176941, 0.7229568362236023, 1.0]"
    relation: supports
falsifiers:
  - "按构造三步独立重算 N(0,1) 分位数并归一化，所得 4-bit 码点与 Appendix E 的 16 值不一致（或 0 不是精确码点、码点数 ≠16）"
  - "实际 LLM 权重分布显著偏离零均值正态（重尾/不对称，见附录 F 之外的实测），等期望填充前提失效"
  - "从信息论角度复核发现等期望填充对该场景并非最优（如考虑 absmax 缩放误差或块内 σ 波动后分位数量化的最优性论证不成立）"
review_due: 2026-12-03
related: [claim-qlora-nf4-dq-recovers-16bit-lora-mmlu, claim-qlora-65b-finetune-single-48gb]
signoff: null
---

## 我的理解

论文声称（asserted，尚未独立验证）：NF4 的构造是把"分位数量化需要在线估计分位数"的昂贵步骤换成"固定分布离线查表"——假设权重零均值正态（Appendix F），对 N(0,1) 取 2k+1 个分位数、归一化到 [-1,1]，再对输入按 absmax 缩放；由于对称 k-bit 没有精确零点，用负侧 2k−1 / 正侧 2k−1+1 的非对称分位并去掉重复零，保证 0 是精确码点（padding/零值元素零误差）且用满 2k 个码点。由此每个 bin 等期望填充，论文称对零均值正态数据"信息论最优"。附录 E 列出 NF4 全部 16 个码点（负侧 8 个含 -1.0、正侧 7 个加 0——负多正少正是非对称设计）。

必须记住的口径限定：

1. **本卡是数据类型层面的主张**，不包含"NF4 实测优于 FP4/Int4"（那是 Table 2/Figure 3 的实证，见 [NF4+DQ 恢复卡](claim-qlora-nf4-dq-recovers-16bit-lora-mmlu.md)）；理论与实证可分开证伪。
2. **"信息论最优" 的成立半径**：等期望填充 ⇒ 对正态分布输入最优，是分位数量化的标准论证；它依赖 (a) 权重确实近正态、(b) absmax 逐张量缩放不破坏分布形状。两条件不满足时（重尾、块间 σ 差异大）最优性声明失效，但数据类型定义本身不受影响。
3. 码点表可机械验证：16 个值、0 在列、区间 [-1,1]、负侧分位比正侧密——这是最便宜的第一道复现检查。
4. 笔记配图 `assets/QLoRA/NF4.png` 是助记示意图（非论文原图），不作为证据引用。

## 待验证

- 用 Python 按 (1)(2)(3) 重算 NF4 码点，逐一对照 Appendix E 的 16 值（容差 ~1e-6）。
- 对 LLaMA 各层权重做正态性检验（偏度/峰度、QQ 图），确认零均值正态假设的实际成立程度。
- 查 bitsandbytes 实现中的 NF4 常量表与本表是否一致（开源核对，成本低）。

## 若成立 / 不成立意味着什么

成立：NF4 是"正态权重 + 4-bit"场景的默认存储类型，后续 4-bit 微调/推理栈沿用其码点表有理论依据。
不成立：构造或最优性论证有误（码点表对不上、或等填充前提对真实权重失效），NF4 退化为经验性数据类型，选型回到 Int4/FP4 或实测说话。
