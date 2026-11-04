---
id: claim-sliderquant-llama2-7b-w4a4-ppl-8p34
title: "SliderQuant 论文自报：Llama2-7B W4A4 下 WikiText2/C4 PPL 8.34/11.10，低于同表全部无额外推理开销对照（最强 CBQ 12.73/14.45、OmniQuant 14.26/18.02）"
type: claim
status: asserted
scope: "Llama2-7B；W4A4（权重 per-channel、激活 per-token，uniform 量化器，Softmax 保持高精度）；校准 WikiText2 128 样本 × 2048 tokens、20 epochs（AdamW，单卡 RTX A6000，量化耗时 6.14h）；指标 WikiText2/C4 困惑率（§4.1 Table 1）；对照组为同表无额外推理开销组（RTN / SmoothQuant / OmniQuant / AffineQuant / CBQ），对照数字部分取自原论文、部分自行复现（附录 F 自述，非统一重跑）；数字为论文自报（arXiv HTML v1，2026-11-04 抓取）；尚未独立验证"
tags: [quantization, ptq, sliderquant, llm, w4a4, iclr2026]
note: library/Quantization/SliderQuant.md#3-实验
paper: "ICLR 2026, SliderQuant: Accurate Post-Training Quantization for LLMs (arXiv:2603.25284)"
stance: watch
evidence:
  - source: library/Quantization/SliderQuant.md
    locator: "§3.1 / Table 1 转录行（W4A4 Llama2-7B）"
    quote: "| W4A4 | Llama2-7B | 5.3e2/5.4e2 | CBQ 12.73/14.45（AffineQuant 12.69/15.76、OmniQuant 14.26/18.02） | **8.34/11.10** |"
    relation: supports
  - source: https://arxiv.org/html/2603.25284v1
    locator: "Appendix E（默认 128 校准样本口径，抓取 2026-11-04）"
    quote: "As the number of samples increases, performance gradually improves, reaching the perplexity of 8.34|11.10 on Wikitext2|C4 with 128 samples"
    relation: supports
falsifiers:
  - "同范围复现（主张侧）：官方开源实现（https://github.com/deep-optimization/SliderQuant）同校准设置复现 Llama2-7B W4A4 WikiText2 PPL 明显高于 8.34（预设阈值如 > 9.5，待定）"
  - "同范围复现（对照侧）：同设置下 CBQ（12.73）或 OmniQuant（14.26）官方实现被复现到与 SliderQuant 差距 < 0.5 PPL（预设阈值，待定）或反超"
  - "同范围口径核查（主张侧）：复现发现 8.34 依赖正文未写明的额外技巧（如更高精度分组、更大校准集或更久训练）"
review_due: 2027-02-02
related: [claim-omniquant-w4a4-llama7b-zeroshot-5265, claim-omniquant-w2a16g128-llama7b-ppl-beats-gptq-awq]
signoff: null
---

## 我的理解

论文声称（asserted，尚未独立验证）：把序列量化统一为滑窗形式后，按逐层敏感性分三段用不同滑窗（浅层渐进扩张 PESW、中间层固定 {s=2,i=1}、深层渐进收缩 PCSW），窗口内再按 γ=0.5 增量量化，Llama2-7B W4A4 从固定滑窗基线 12.73/14.45 降到 8.34/11.10（Wiki/C4），同表全部无额外推理开销对照中最强的是 CBQ 12.73/14.45。可学习参数只有 channel scaling + LoRA(r=4)，推理零开销（论文自报）。

引用时注意的限定：

1. 对照组数字部分取自原论文/官方 checkpoint/自行复现（附录 F 自述），非统一重跑；CBQ 是作者按相同滑窗设置自己实现的（§4 Evaluations）。
2. 该卡只主张 W4A4 Llama2-7B 这一格的领先；W4A16 下优势小得多（5.61 vs CBQ 5.67，笔记 §3.1），不要把"全部配置大幅领先"读进这条。
3. 论文自身存在若干数字/表号不一致（笔记遗留问题 1–8），其中 Table 12 的 CS/LoRA 消融 HTML 行残缺且疑似与正文矛盾——引用 Table 12 前必须对照 PDF。

## 待验证

- 用官方仓库复现 Llama2-7B W4A4（WikiText2 128 样本、20 epochs）核对 8.34/11.10，并跑 CBQ 官方/作者设置确认 12.73/14.45 口径。
- 换校准域（C4/Pile）重跑，确认 PPL 排序不变。
- 核对 Table 12（CS/LoRA 消融）的 PDF 勾选结构，解决"合用反而劣于仅 LoRA"的疑似矛盾。

## 若成立 / 不成立意味着什么

成立：Llama2-7B W4A4 这一格上逐层敏感性驱动的滑窗设计自报大幅领先（PTQ 成本内该设置可用），量化选型时 SliderQuant 进入 trial 候选，与 [OmniQuant](claim-omniquant-w4a4-llama7b-zeroshot-5265.md) 同表对比（14.26 vs 8.34）；推广到"W4A4 全量化普遍可用"属研究启发（尚未验证，见限定 2 的 W4A16 反差）。
不成立：8.34 依赖自报协议或对照口径，滑窗自适应增益回落到 <1 PPL 量级，量化主线继续以 OmniQuant/PD-Quant 为基准。

## 核查记录

- 2026-11-05（02 任务书整理班 P1-B2b）：1 条笔记 quote Grep 逐字命中笔记当前版；1 条 arXiv HTML 引文抓取日期在案（2026-11-04）。Table 12 疑似矛盾（QUESTIONS #44 在案）按批内约定避开，卡内限定 3 已保留警示。本轮为表达整理：falsifiers 补分层标注（阈值标注为预设待定）、成立段约束回 Llama2-7B W4A4 并把普遍可用推论标为研究启发；数字未改写。
