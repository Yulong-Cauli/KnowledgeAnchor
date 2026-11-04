---
id: claim-qlora-guanaco-99p3-of-chatgpt-vicuna
title: "QLoRA 自报：Guanaco 65B 在 GPT-4 评估的 Vicuna benchmark 上达 ChatGPT 的 99.3%（95% CI ±4.4），Elo 1022 vs ChatGPT 966，单卡 24 小时微调"
type: claim
status: asserted
scope: "Vicuna benchmark（80 prompts，zero-shot）；评估 = GPT-4 评分制（相对 ChatGPT 百分比，双序平均）与 GPT-4/人类成对比较 Elo 锦标赛（K=32、10,000 次重采样）；Guanaco 65B = LLaMA-65B + QLoRA（NF4+DQ+paged optimizers）+ OASST1 变体微调、无 RL；自报评估（GPT-4 为判官，存在顺序效应与自评偏高）；注意 99.3% 是相对 ChatGPT 而非 GPT-4（GPT-4 Elo 1348，对 Guanaco 65B 预期胜率约 70%）；尚未独立验证"
tags: [quantization, llm, qlora, guanaco, chatbot-eval, elo]
note: library/Quantization/QLoRA.md#35-聊天机器人研究5-table-1table-6table-7
paper: "NeurIPS 2023（arXiv:2305.14314）, QLoRA: Efficient Finetuning of Quantized LLMs（开源：https://github.com/artidoro/qlora 、https://github.com/TimDettmers/bitsandbytes）"
stance: watch
evidence:
  - source: library/Quantization/QLoRA.md
    locator: "Abstract（abs 页抓取引文）"
    quote: "Our best model family, which we name Guanaco, outperforms all previous openly released models on the Vicuna benchmark, reaching 99.3% of the performance level of ChatGPT while only requiring 24 hours of finetuning on a single GPU."
    relation: supports
  - source: library/Quantization/QLoRA.md
    locator: "§5.2 / Table 6（Guanaco 65B 行，99.3% 为原文加粗）"
    quote: "| Guanaco | 65B | 4-bit | 41 GB | 96.7% | 101.9% | 99.3% | 4.4% |"
    relation: supports
  - source: library/Quantization/QLoRA.md
    locator: "§1 / Table 1（Elo 竞赛，GPT-4 判胜，Guanaco 65B 行）"
    quote: "| Guanaco 65B | 41 GB | 1022 ± 1 |"
    relation: supports
  - source: library/Quantization/QLoRA.md
    locator: "§1 / Table 1（ChatGPT 行）"
    quote: "| ChatGPT | - | 966 ± 1 |"
    relation: supports
  - source: library/Quantization/QLoRA.md
    locator: "§5.3 读表（置信区间限定）"
    quote: "However, Table 6 also has very wide confidence intervals, with many models overlapping in performance."
    relation: supports
  - source: library/Quantization/QLoRA.md
    locator: "§5.3（对 GPT-4 的胜率，防止误读为 GPT-4 级）"
    quote: "When compared to GPT-4, Guanaco 65B and 33B have an expected win probability of 30%, based on Elo rating from human annotators system-level pairwise comparisons - the highest reported to date."
    relation: supports
falsifiers:
  - "跨条件迁移（换评估口径，不充当原范围反证）：独立评估（不同 judge、不同 prompt 集、或人工评注）中 Guanaco 65B 相对 ChatGPT 明显低于 99.3%（预设阈值如 <90%，待定）或不再高于其他开源模型——评估口径变化检验外部效度，不直接证伪本卡 GPT-4 judge 口径内的自报主张"
  - "同范围复现（统计稳定性）：复现 GPT-4 评估时 CI 重叠导致的排名不稳定被放大（99.3%±4.4 的区间内 ChatGPT/开源模型排序翻转频繁），'outperforms all previous openly released models' 不稳"
  - "同范围口径检查（论文自荐方法）：GPT-4 自评偏高与顺序偏差校正后（双序平均、人类评注口径）Guanaco 排名显著下滑"
review_due: 2026-12-03
related: [claim-qlora-nf4-dq-recovers-16bit-lora-mmlu, claim-qlora-65b-finetune-single-48gb]
signoff: null
---

## 我的理解

论文声称（asserted，尚未独立验证）：用 QLoRA 在单卡 24 小时内微调出的 Guanaco 65B（OASST1 变体），在 GPT-4 判分的 Vicuna benchmark 上达到 ChatGPT 性能的 99.3%（GPT-4 Elo 锦标赛 1022±1 vs ChatGPT 966±1），优于此前所有公开发布模型；这是"4-bit QLoRA 能产出接近 ChatGPT 的聊天模型"这一头衔主张。

必须记住的四个限定（缺一会误读）：

1. **是 ChatGPT 的 99.3%，不是 GPT-4 级**：GPT-4 自身 Elo 1348（Table 1）、对 Guanaco 65B/33B 的预期胜率 70%（论文口径：Guanaco 胜率 30%）；"复现 GPT-4 级 ChatBot"的说法不成立，成立的是"接近 ChatGPT"。
2. **评估是自报 + GPT-4 判官**：GPT-4 有显著顺序效应（先出现者得分高，§5.2/§6.2）与自评偏高（给自己的 Elo 1348 vs 人类判的 1176）；论文自己推荐双序平均与 Elo 法。
3. **CI 很宽、模型重叠**（±4.4%，§5.3 原句见 evidence）：99.3% 的点估计不足以区分 Guanaco 65B 与 ChatGPT，论文也只主张 "essentially closing the gap"。
4. **无 RL、开源数据**：Guanaco 是评估中唯一纯开源数据（OASST1）训练的头部模型（论文称次优开源模型 HH-RLHF 低 30 点）——数据质量>规模的规模化研究结论归笔记 §1/§B.4（Table 9–12 未转录，本卡不引用）。

## 待验证

- 用发布模型（HuggingFace Guanaco 权重）在 Vicuna 80 题上重跑 GPT-4 双序评估 + 人工评注，复算相对 ChatGPT 的百分比与 CI。
- 校验 GPT-4 judge 的顺序效应与自评偏差在本评估中的量级（对照 §6.2）。
- 用后来的 chatbot 榜单（如 Chatbot Arena 时期数据）回看 Guanaco 65B 的实际排位，检验自报口径的外部效度。

## 若成立 / 不成立意味着什么

成立：Guanaco 65B（LLaMA-65B + QLoRA + OASST1 变体）在 GPT-4 judge 的 Vicuna 口径下自报接近 ChatGPT，支持"单卡 24 小时、纯开源数据可产出接近 ChatGPT 的对话模型"这一候选路线；QLoRA 成为低成本 chatbot 微调默认管线的推断仍属研究启发（尚未验证，其他开源 LLM/数据组合是跨条件迁移检查）。
不成立：99.3% 依赖 GPT-4 自报评估的口径（顺序效应、宽 CI），Guanaco 实际排位低于声明，评估方法学（GPT-4 judge）需配人工评注与双序校正后才可信。

## 核查记录

- 2026-11-05（02 任务书整理班 P1-B2b）：6 条笔记 quote Grep 逐字命中笔记当前版。本轮为表达整理：falsifiers 补分层标注（阈值标注为预设待定）、成立段约束回 Guanaco 65B 具体 config 并把"默认管线"推断标为研究启发；数字未改写。
