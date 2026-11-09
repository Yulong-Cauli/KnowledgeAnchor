---
id: claim-omniquant-w4a4-llama7b-zeroshot-5265
title: "OmniQuant 论文自报：LLaMA-1-7B W4A4 六任务零样本平均准确率 52.65%，高于 SmoothQuant (38.41%) 与 LLM-QAT (41.27%)"
type: claim
status: asserted
scope: "LLaMA-1-7B；W4A4（逐通道 4-bit 权重 + 逐 token 4-bit 激活，Softmax 输出保持 16-bit）；六任务零样本平均准确率（PIQA / ARC-e / ARC-c / BoolQ / HellaSwag / Winogrande，lm-eval-harness，camera-ready Table 2）；FP16 基准 64.09%；OmniQuant 为 PTQ，优化仅用取自 WikiText2 的 128 段 2048-token 校准文本（§4.1，单卡 A100、20 epochs，论文未明说训练/测试 split），评测在 held-out 零样本任务；数字为论文自报"
tags: [quantization, ptq, omniquant, llm, w4a4, zero-shot]
note: library/Quantization/OmniQuant.md#4-实验与分析-experiments
paper: "ICLR 2024, OmniQuant: Omnidirectionally Calibrated Quantization for Large Language Models (arXiv:2308.13137)"
stance: watch
evidence:
  - source: library/Quantization/OmniQuant.md
    locator: "§4 / 实验 2：W4A4"
    quote: "| **FP16 (基准)** | 64.09%               | 原始模型                     |"
    relation: supports
  - source: library/Quantization/OmniQuant.md
    locator: "§4 / 实验 2：W4A4"
    quote: "| **SmoothQuant** | 38.41%               | **崩塌**，激活离群值未处理好 |"
    relation: supports
  - source: library/Quantization/OmniQuant.md
    locator: "§4 / 实验 2：W4A4"
    quote: "| **LLM-QAT**     | 41.27%               | 昂贵的训练也未能救回         |"
    relation: supports
  - source: library/Quantization/OmniQuant.md
    locator: "§4 / 实验 2：W4A4"
    quote: "| **OmniQuant**   | **52.65%**           | **显著提升** (+14%)          |"
    relation: supports
  - source: https://arxiv.org/pdf/2308.13137v3
    locator: "Table 2, p.8（LLaMA-1-7B W4A4 SmoothQuant 行；pdftotext 提取，抓取 2026-11-02）"
    quote: "W4A4 SmoothQuant 49.80 30.40 25.80 49.10  27.40     48.00    38.41"
    relation: supports
  - source: https://arxiv.org/pdf/2308.13137v3
    locator: "Table 2, p.8（LLaMA-1-7B W4A4 LLM-QAT 行；pdftotext 提取，抓取 2026-11-02）"
    quote: "W4A4 LLM-QAT     51.50 27.90 23.90 61.30  31.10     51.90    41.27"
    relation: supports
  - source: https://arxiv.org/pdf/2308.13137v3
    locator: "Table 2, p.8（LLaMA-1-7B W4A4 OmniQuant 行；pdftotext 提取，抓取 2026-11-02）"
    quote: "W4A4 OmniQuant   66.15 45.20 31.14 63.51  56.44     53.43    52.65"
    relation: supports
  - source: https://arxiv.org/pdf/2308.13137v3
    locator: "§4.1 Training, p.7（校准数据口径；pdftotext 提取，跨行连字符已还原，抓取 2026-11-02）"
    quote: "We employ a calibration dataset consisting of 128 randomly selected 2048-token segments from WikiText2 (Merity et al., 2016)."
    relation: supports
falsifiers:
  - "同范围复现（主张侧）：官方开源实现同校准设置复现中，LLaMA-1-7B W4A4 六任务零样本平均准确率显著低于 52.65%（预设阈值如差距 > 2 个点，无原文锚点，待定）"
  - "同范围复现（对照侧）：同设置复现中 SmoothQuant (38.41%)、LLM-QAT (41.27)、LLM-QAT+SQ (46.43) 或 OS+ (48.43) 追平（预设阈值如差距 < 1 个点，待定）或反超 OmniQuant"
  - "口径与校准域敏感性（scope 条件变化，迁移性检查，不充当原文数字核对）：评测任务清单或 lm-eval-harness 版本不同导致排序变化；或换用非 WikiText2 域校准数据后平均准确率大幅下降（论文 Table A10 仅验证校准域变化下 PPL 方差 0.0006–0.17，未报告零样本准确率的校准域方差）"
  - "部署前提检查（不充当精度主张反证）：W4A4 的 per-token 激活量化在目标推理引擎上无可行实现，导致该精度数字无法转化为部署收益"
review_due: 2026-12-02
related: [claim-omniquant-let-lwc-ablation-w4a4-best, claim-omniquant-w2a16g128-llama7b-ppl-beats-gptq-awq, claim-qwt-r2-gate-nonregression, claim-repqvit-w4a4-imagenet-leads-ptq-baselines]
signoff: null
---

## 主张

论文声称（asserted）：LLaMA-1-7B 在 W4A4 下六个零样本任务平均准确率 52.65%，比 SmoothQuant (38.41%) 高约 14 个点，也高于 QAT 方法 LLM-QAT (41.27%)；FP16 基准 64.09%。W4A4 的瓶颈在激活离群值，论文将其归因于 LET 的可学习等价变换比 SmoothQuant 的人工缩放规则更有效地平抑离群值。

三个限定：

1. **校准集 vs 测试集口径**（参照 [QwT R² 门控核验](claim-qwt-r2-gate-nonregression.md) 同一教训）：OmniQuant 是 PTQ，优化只用来自 WikiText2 的 128 段 2048-token 校准文本（§4.1；笔记 §6.3 的「仅需 128 个样本即可收敛」与此一致），评测在 held-out 零样本任务上。52.65% 是校准后模型的自报测试值，不是免校准结论，也未被独立验证。
2. **「超越 QAT」的幅度要看对哪个变体**：论文正文称「在 LLaMA-7B 上超过 LLM-QAT +6.22%」，但按 Table 2 计算 52.65 − 41.27 (LLM-QAT) = 11.38，+6.22 实际对应 LLM-QAT+SQ (46.43)。引用「超越 QAT」时需注明对比对象。
3. 表中还有 OS+ (48.43%) 与 LLM-QAT+SQ (46.43%) 两个比 SmoothQuant 强的基线，「表中领先」是相对全部对比方法的，不只 SmoothQuant。评测协议（任务清单、lm-eval-harness 版本、prompt）论文未完整给出，复现排序可能受此影响。

PDF 引文为 pdftotext -layout 提取（仅去行首空白）。原始笔记见 [OmniQuant](../library/Quantization/OmniQuant.md#4-实验与分析-experiments)。

## 待验证

- 用官方仓库 https://github.com/OpenGVLab/OmniQuant 复现 LLaMA-1-7B W4A4 + 六任务评测，核对平均 52.65% 及各分项（PIQA 66.15 / ARC-e 45.20 / ARC-c 31.14 / BoolQ 63.51 / HellaSwag 56.44 / Winogrande 53.43）。
- 校准域敏感性：换 C4 / Pile 校准后重跑六任务，确认平均准确率是否仍约 52.65%。
- 确认 W4A4（per-token 激活）在目标推理引擎上是否有硬件/内核支持（论文 §4.5 承认 W4A4/W6A6 缺乏开箱即用支持，部署表只测了 weight-only）。

## 成立/不成立的含义

成立：LLaMA-1-7B W4A4、六任务零样本口径下，激活瓶颈可在 PTQ 成本内用 LET+LWC 解决且自报优于 QAT 基线，为该场景的激活量化路线提供选型参考（部署侧需先确认硬件支持，见 [部署卡](claim-omniquant-w4a16g128-llama13b-a100-913toks.md)）。其他模型规模/任务清单/校准域上的泛化属迁移性检查（见 falsifier 3），不能由本卡直接外推。
不成立：52.65% 依赖自报协议或特定校准域，该场景 W4A4 选型回退到 W4A16 + W8A8，或等待 4-bit 激活硬件支持成熟。

## 核查记录

- 2026-11-05（02 任务书整理班 P1-B2b）：4 条笔记 quote Grep 逐字命中笔记当前版（实验 2 表未被 11-03 修正触及）；PDF 引文抓取日期在案（2026-11-02）未重抓。本轮为表达整理：falsifiers 补分层标注（复现阈值标注为预设待定）、成立/不成立段约束回 scope 配置；数字未改写。
