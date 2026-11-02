---
id: claim-alpamayo-r1-rl-consistency-reward-gains
title: "Alpamayo-R1 论文声称：RL 后训练（TABLE 9）reasoning+consistency 双奖励使 ADE −9.4%、推理分 +45%、一致性 +37%；仅 reasoning 奖励反而劣化动作"
type: claim
status: asserted
scope: "Alpamayo-R1 0.5B（CoC SFT 后的模型做 RL 后训练，GRPO，Cosmos-RL 基础设施）；奖励组合消融为 TABLE 9（SFT / +r_reason / +r_reason+r_consistency / +r_reason+r_consistency+r_safety 四行）；指标为 ADE（m）、Reasoning Grading（LRM critic 评分）、Reasoning–Action Consistency Score、Close Encounter Rate（%）；数据与评测为 NVIDIA 内部（非公开基准）；数字为论文自报（arXiv:2511.00088v2）"
tags: [end-to-end-driving, vla, alpamayo-r1, reinforcement-learning, grpo]
note: library/VLM_VLA/Alpamayo-R1.md#3-实验
paper: "arXiv 2025, Alpamayo-R1: Bridging Reasoning and Action Prediction for Generalizable Autonomous Driving in the Long Tail (arXiv:2511.00088)"
stance: watch
evidence:
  - source: library/VLM_VLA/Alpamayo-R1.md
    locator: "§3.4 / TABLE 9（SFT 行）"
    quote: "| SFT | 2.12m | 3.1 | 0.62 | 6.9 |"
    relation: supports
  - source: library/VLM_VLA/Alpamayo-R1.md
    locator: "§3.4 / TABLE 9（仅 reasoning 奖励行）"
    quote: "| SFT + RL («r_{\\text{reason}}») | 2.19m | 4.5 | 0.53 | 5.8 |"
    relation: supports
  - source: library/VLM_VLA/Alpamayo-R1.md
    locator: "§3.4 / TABLE 9（双奖励行）"
    quote: "| SFT + RL («r_{\\text{reason}}» + «r_{\\text{consistency}}») | 1.92m | 4.5 | 0.85 | 6.2 |"
    relation: supports
  - source: library/VLM_VLA/Alpamayo-R1.md
    locator: "§3.4 / §6.3 读数原句"
    quote: "when jointly optimizing both the reasoning and consistency rewards, the post-trained model achieves a 9.4% reduction in most-likely mode ADE (2.12m«\\rightarrow»1.92m), a 45% improvement in the reasoning score (3.1«\\rightarrow»4.5), and a 37% increase in reasoning–action consistency (0.62«\\rightarrow»0.85)."
    relation: supports
  - source: https://arxiv.org/html/2511.00088v2
    locator: "§6.3（HTML v2，2026-11-03 抓取，TABLE 9 线性化文本）"
    quote: "SFT 2.12m 3.1 0.62 6.9"
    relation: supports
falsifiers:
  - "复现 RL 后训练中，仅 reasoning 奖励不再劣化 ADE 与一致性（TABLE 9 行 2 的反例不成立），或双奖励的 ADE/一致性增益不显著"
  - "发现 Reasoning Grading 与 Consistency Score 由 LRM critic 评出，critic 换型/换 prompt 后 +45%/+37% 不复现（评测依赖 critic 主观分）"
  - "加入 safety 奖励后 Close Encounter Rate 不降到 3.7 或推理分明显回落（论文称不损害推理质量）"
review_due: 2026-12-03
related: [claim-alpamayo-r1-coc-reasoning-beats-trajonly-hard-set, claim-alpamayo-r1-10b-physicalai-av-public-snapshot]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：RL 后训练的奖励构成决定成败——0.5B AR1 上，只优化推理质量（r_reason）时推理分确实升到 4.5，但 ADE 反而从 2.12m 恶化到 2.19m、推理-动作一致性从 0.62 降到 0.53；reasoning+consistency 双奖励联合才同时拿到 ADE 2.12→1.92m（−9.4%）、推理分 3.1→4.5（+45%）、一致性 0.62→0.85（+37%）；再加 safety 奖励把 close encounter rate 压到全表最低 3.7% 且不损推理分。核心信息：「让推理与动作对齐」本身要作为优化目标，单奖励会顾此失彼。

三条必须记住的限定：
1. RL 读数全部基于 0.5B 模型（§6.3 自述），10B 发布模型的对应数字另见表 10。
2. Reasoning Grading / Consistency Score 由 LRM critic（DeepSeek-R1、Cosmos-Reason 等）评定——是模型评模型的相对指标，非人工或客观指标。
3. 评测在内部数据与内部仿真上，公开不可复现；Abstract 的 45%/37% 即出自本表。

## 待验证

- alpamayo-recipes 已发布 SFT/RL 微调脚本（2026-04 起）：复现四行奖励组合消融（需 gated 权重与内部数据替代集）。
- 换 critic（如 GPT-5 或人工评分）重算 Reasoning Grading，检验 +45% 的稳健性。
- 检验 close encounter rate 的评测器一致性（AlpaSim 事件判定规则）。

## 若成立 / 不成立意味着什么

成立：驾驶 VLA 的 RL 后训练必须包含推理-动作一致性奖励项，可作为通用 recipe。
不成立：增益依赖特定 critic 与内部数据，奖励设计需逐团队自行调参验证。
