---
id: claim-sliderquant-32-sample-calibration-beats-omniquant-256
title: "SliderQuant 论文声称：W4A4 下 32 条校准样本的 SliderQuant（8.71/11.19）优于 256 条样本的 OmniQuant（11.41/14.90）；SliderQuant+ 32 条（5.83/7.85）优于 256 条的 DuQuant（6.23/7.88）"
type: claim
status: asserted
scope: "W4A4；Llama-7B（SliderQuant vs OmniQuant）与 Llama2-7B（SliderQuant+ vs DuQuant）；校准样本数 32 vs 256（其余校准设置同默认：2048 tokens/样本）；指标 WikiText2/C4 PPL（Appendix G.4 Table R）；数字为论文自报（arXiv HTML v1，2026-11-04 抓取）；尚未独立验证"
tags: [quantization, ptq, sliderquant, llm, calibration-efficiency, iclr2026]
note: library/Quantization/SliderQuant.md#3-实验
paper: "ICLR 2026, SliderQuant: Accurate Post-Training Quantization for LLMs (arXiv:2603.25284)"
stance: watch
evidence:
  - source: https://arxiv.org/html/2603.25284v1
    locator: "Appendix G.4（抓取 2026-11-04）"
    quote: "even with 32 calibration samples, our SliderQuant and SliderQuant+ show superior performance than OmniQuant and DuQuant with 256 calibration samples, respectively"
    relation: supports
  - source: library/Quantization/SliderQuant.md
    locator: "§3.7 / 校准数据效率（Table R 转录）"
    quote: "Llama-7B 上 SliderQuant 用 32 样本（8.71/11.19）优于 OmniQuant 用 256 样本（11.41/14.90）；Llama2-7B 上 SliderQuant+ 用 32 样本（5.83/7.85）优于 DuQuant 用 256 样本（6.23/7.88）。"
    relation: supports
falsifiers:
  - "同设置复现中 32 样本的 SliderQuant/SliderQuant+ 精度崩溃（PPL > 15）或不超过 256 样本的 OmniQuant/DuQuant"
  - "复现发现对比对象的 256 样本数字未按其官方最佳配置运行（如 epochs/学习率不同）导致对比失真"
review_due: 2027-02-02
related: [claim-sliderquant-llama2-7b-w4a4-ppl-8p34, claim-omniquant-w4a4-llama7b-zeroshot-5265]
signoff: null
---

## 我的理解

论文声称（asserted，尚未独立验证）：校准数据效率上 SliderQuant 有一个数量级级别的优势——32 条样本就超过对照方法用 256 条（8 倍样本）的结果。这直接冲击"校准集规模是 PTQ 主要成本"的假设，也和 [PD-Quant 的过拟合教训](claim-pdquant-pd-loss-alone-overfits-calibration.md)（校准集小时损失项选择敏感）形成有趣的对照：SliderQuant 用的是重建目标 + 逐层滑窗，不是分布匹配损失。

注意口径：Llama-7B 那组对照是 OmniQuant（无额外推理开销组），Llama2-7B 那组对照是 DuQuant（有额外推理开销组、SliderQuant 加了 rotation）；两组别混。

## 待验证

- 用官方仓库做 32/128/256 样本扫描，核对 8.71/11.19 与 11.41/14.90 两格。
- 换 C4 校准域重复该对比，确认不是 WikiText2 域特化。

## 若成立 / 不成立意味着什么

成立：PTQ 校准成本可以压到 32 条样本级别，私有数据/端侧场景的量化门槛显著降低。
不成立：32 样本优势是特定校准域或对照配置的产物，校准规模仍是主要敏感因子。
