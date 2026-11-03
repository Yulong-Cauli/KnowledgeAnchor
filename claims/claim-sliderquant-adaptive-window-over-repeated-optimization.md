---
id: claim-sliderquant-adaptive-window-over-repeated-optimization
title: "SliderQuant 论文声称：增益主要来自按层敏感性的自适应滑窗而非重复优化——固定滑窗每窗重复量化至多 4 次的增益不足 1 PPL，自适应默认相对全部固定滑窗及重复变体降低 1.54–3.60 PPL"
type: claim
status: asserted
scope: "Llama2-7B / Qwen2.5-14B，W4A4；消融口径：固定滑窗每窗重复量化 1–4 次（Appendix G.2 Table P：s=2 12.73→12.11、s=4 11.13→10.67）；自适应默认相对全部固定滑窗及其重复变体降低 1.54–3.60（Llama2-7B）/ 1.23–4.42（Qwen2.5-14B）WikiText2 PPL（Appendix G.2）；数字为论文自报（arXiv HTML v1，2026-11-04 抓取）；尚未独立验证"
tags: [quantization, ptq, sliderquant, llm, ablation, iclr2026]
note: library/Quantization/SliderQuant.md#3-实验
paper: "ICLR 2026, SliderQuant: Accurate Post-Training Quantization for LLMs (arXiv:2603.25284)"
stance: watch
evidence:
  - source: https://arxiv.org/html/2603.25284v1
    locator: "Appendix G.2（抓取 2026-11-04）"
    quote: "achieves significant perplexity reductions (1.54 to 3.60 for Llama2-7B and 1.23 to 4.42 for Qwen2.5-14B on Wikitext2, with similar reductions observed on C4) over all fixed-sized sliding quantization baselines and its repeated variants"
    relation: supports
  - source: https://arxiv.org/html/2603.25284v1
    locator: "Appendix G.2（重复优化消融的结论句，抓取 2026-11-04）"
    quote: "the gain against its corresponding single time baseline is marginal"
    relation: supports
falsifiers:
  - "同计算预算下把固定滑窗重复优化次数加到与 SliderQuant 相当，Llama2-7B W4A4 差距缩小到 < 0.5 PPL 或追平"
  - "第三方复现中重复优化的增益达到与自适应滑窗同量级（≥ 1.5 PPL），归因反转"
review_due: 2027-02-02
related: [claim-sliderquant-llama2-7b-w4a4-ppl-8p34, claim-sliderquant-first-last-layer-most-sensitive]
signoff: null
---

## 我的理解

论文声称（asserted，尚未独立验证）：SliderQuant 相对固定滑窗的收益不能解释为"首末层被多优化了几次"。作者做了重复优化对照：把固定滑窗每窗重复量化至多 4 次，s=2 只从 12.73 降到 12.11、s=4 从 11.13 降到 10.67（W4A4 WikiText2），而自适应滑窗（PESW/FSSW/PCSW 三段 + 窗内 Intra-S）对全部固定滑窗及重复变体降低 1.54–3.60 PPL——量级差一个数量级。

两个必须记住的限定：

1. "至多 4 次"是论文选择的重复上限；如果重复次数与算力预算挂钩的其他设计（如更大窗口 + 更多 epoch）更优，该结论不涵盖。
2. 附录 G.3 的 "up to 6.42× speedup vs OmniQuant" 无法从表格复算（笔记遗留问题 6），本卡不引用该数字。

## 待验证

- 按附录 G.2 设置复现 Table P（s=2/s=4 × 重复 1–4 次）与自适应默认，核对两组数字。
- 用官方仓库做等时间预算对比：SliderQuant 20 epochs vs 固定滑窗重复 4 次 × 相同时长。

## 若成立 / 不成立意味着什么

成立：滑窗的"按敏感性分配优化预算"是本质增益来源，序列量化框架设计应转向结构先验而非单纯加算力。
不成立：收益主要是重复优化的算力效应，自适应设计溢价 <1 PPL，SliderQuant 相对 CBQ 类方法无本质优势。
