---
id: claim-qlora-nf4-dq-recovers-16bit-lora-mmlu
title: "QLoRA 自报：NF4+双量化的 4-bit 底座微调完全恢复 16-bit LoRA 的 MMLU 性能（Mean 53.1 vs 53.0；65B FLAN v2 63.9 vs 62.5），FP4 落后约 1 点"
type: claim
status: asserted
scope: "LLaMA 7B/13B/33B/65B；微调数据 Alpaca 与 FLAN v2；评测 5-shot MMLU（平均）；QLoRA 配置：NF4 存储 + FP8 量化常数（DQ，blocksize 64/256）+ LoRA 挂全部线性层（r 不敏感，Appendix A）；对照是 16-bit（BF16）LoRA 微调——不是全量微调：论文 §8 自述 33B/65B 未建全量 16-bit 微调基线，全量微调对照只在 ≤3B（Table 3，GLUE/ Super-NaturalInstructions）；论文自报，尚未独立验证"
tags: [quantization, llm, qlora, nf4, double-quantization, mmlu, lora]
note: library/Quantization/QLoRA.md#34-k-bit-qlora-匹配-16-bit-全量微调与-16-bit-lora4-table-3table-4
paper: "NeurIPS 2023（arXiv:2305.14314）, QLoRA: Efficient Finetuning of Quantized LLMs（开源：https://github.com/artidoro/qlora 、https://github.com/TimDettmers/bitsandbytes）"
stance: watch
evidence:
  - source: library/Quantization/QLoRA.md
    locator: "§4 正文结论"
    quote: "Results are shown in Table 4 where we see that NF4 with double quantization fully recovers the 16-bit LoRA MMLU performance. In addition, we also note that QLoRA with FP4 lags behind the 16-bit brain float LoRA baseline by about 1 percentage point."
    relation: supports
  - source: library/Quantization/QLoRA.md
    locator: "§4 / Table 4（BFloat16 行，Mean 53.0）"
    quote: "| BFloat16 | 38.4 | 45.6 | 47.2 | 50.6 | 57.7 | 60.5 | 61.8 | 62.5 | 53.0 |"
    relation: supports
  - source: library/Quantization/QLoRA.md
    locator: "§4 / Table 4（NFloat4 + DQ 行，Mean 53.1；65B FLAN v2 63.9）"
    quote: "| NFloat4 + DQ | 39.0 | 44.5 | 47.5 | 50.7 | 57.3 | 59.2 | 61.8 | 63.9 | 53.1 |"
    relation: supports
  - source: library/Quantization/QLoRA.md
    locator: "§8 Limitations（全量微调对照的边界自述）"
    quote: "Despite this evidence, we did not establish that QLoRA can match full 16-bit finetuning performance at 33B and 65B scales."
    relation: supports
falsifiers:
  - "同配置复现（QLoRA 官方码、LLaMA 同规模）NF4+DQ 的 MMLU 平均低于 BF16 LoRA 超出正常方差（如 53.1 vs 53.0 的擦线反转且差距 >0.5）"
  - "FP4 与 16-bit 的差距明显不是约 1 点（如 ≥2 点或无差距），位宽-数据类型结论失真"
  - "补做 33B/65B 全量 16-bit 微调基线后发现 QLoRA 明显低于全量微调（论文自认未建该基线，此为留白处的直接证伪路径）"
review_due: 2026-12-03
related: [claim-qlora-nf4-info-theoretic-optimal-datatype, claim-qlora-65b-finetune-single-48gb, claim-qlora-guanaco-99p3-of-chatgpt-vicuna]
signoff: null
---

## 我的理解

论文声称（asserted，尚未独立验证）：4-bit（NF4+DQ）底座 + LoRA 微调能"完全恢复"16-bit LoRA 微调的 MMLU 性能——Table 4 平均 53.1 vs 53.0（NF4+DQ 甚至高 0.1），单点上 65B/FLAN v2 63.9 vs 62.5（+1.4）、7B/Alpaca 39.0 vs 38.4；而 FP4 平均 52.2，落后 16-bit 约 1 点——数据类型（NF4 vs FP4）是 4-bit 能否无损的关键变量。

必须记住的口径限定：

1. **"恢复"的对照是 16-bit LoRA，不是全量微调**：论文 §8 自述 33B/65B 没有全量 16-bit 微调基线（资源原因）；"QLoRA 匹配 16-bit 全量微调"的直接证据只在 ≤3B（Table 3：GLUE/Super-NaturalInstructions 上 BF16/BF16 replication/LoRA/QLoRA 各档互相咬合）。引用时必须带这个限定，不能写成"4-bit 微调 = 16-bit 微调"。
2. **擦线数字**：Mean 53.1 vs 53.0 是 0.1 点量级，单次运行不具决定性；可靠的判据是 8 个（规模×数据集）格子里 NF4+DQ 对 BF16 的方向分布（4 升 4 降内含 ±），而不是 Mean 一格。
3. **LoRA 超参前提**：无损恢复依赖"LoRA 挂全部线性层"（默认 q/v 配置无法复现全量性能，§4）；r 不敏感（8–256）。复现失败先查挂载层配置。
4. MMLU 63.9 的出处：Table 4 的 65B/FLAN v2/NFloat4+DQ 格（笔记转录 2026-11-03 已对 arXiv v1 HTML 实抓逐格核对 BFloat16 与 NFloat4+DQ 两行一致；Table 9–12 未转录，本卡不引用其内容）。

## 待验证

- 用官方 bitsandbytes+qlora 复现 Table 4 的 7B/Alpaca（39.0 vs 38.4）与 65B/FLAN v2（63.9 vs 62.5）两格（多 seed）。
- 补 33B/65B 全量 16-bit 微调基线，填 §8 留白。
- 复核 DQ 本身不掉点的口径（Figure 3 caption：DQ 只带来 minor gains，价值在把 33B/65B 塞进 24/48GB）。

## 若成立 / 不成立意味着什么

成立：4-bit NF4+DQ 底座 + 全线性层 LoRA 是 LLM 微调的默认省钱配置（同预算下优先加参数、降精度，§4 Summary 的资源分配取向）。
不成立：无损恢复依赖论文自报的擦线均值或未建基线的对照，微调显存预算按 16-bit LoRA 或量化后全量微调重估。
