---
id: claim-alpamayo-r1-10b-physicalai-av-public-snapshot
title: "Alpamayo-R1 论文声称（公开基准快照）：PhysicalAI-AV 644 例上 10B minADE6 0.849m 优于 0.5B 0.913m；AlpaSim 公开 920 场景 AlpaSim Score 0.72 vs 0.35"
type: claim
status: asserted
scope: "Alpamayo-R1-10B（Cosmos-Reason 底座 + 2B diffusion 轨迹解码器）与 Alpamayo-R1-0.5B；公开评测：PhysicalAI-AV 数据集 644 个 held-out 开环样例（minADE6@6.4s）与 AlpaSim 公开场景集 920 个挑战场景闭环（Close Encounter Rate / Off-Road Rate / AlpaSim Score）；数字为论文自报（arXiv:2511.00088v2 TABLE 10）"
tags: [end-to-end-driving, vla, alpamayo-r1, physicalai-av, alpasim, benchmark-snapshot]
note: library/VLM_VLA/Alpamayo-R1.md#3-实验
paper: "arXiv 2025, Alpamayo-R1: Bridging Reasoning and Action Prediction for Generalizable Autonomous Driving in the Long Tail (arXiv:2511.00088)"
stance: watch
evidence:
  - source: library/VLM_VLA/Alpamayo-R1.md
    locator: "§3.5 / TABLE 10（0.5B 行）"
    quote: "| Alpamayo-R1-0.5B | 0.913 | 9.0«\\pm»1.0 | 19.0«\\pm»0.0 | 0.35«\\pm»0.01 |"
    relation: supports
  - source: library/VLM_VLA/Alpamayo-R1.md
    locator: "§3.5 / TABLE 10（10B 行）"
    quote: "| Alpamayo-R1-10B | 0.849 | 4.0«\\pm»0.0 | 16.0«\\pm»1.0 | 0.72«\\pm»0.02 |"
    relation: supports
  - source: library/VLM_VLA/Alpamayo-R1.md
    locator: "§3.5 / §6.4 开环读数原句"
    quote: "Alpamayo-R1-10B achieves a minADE6 of 0.849m at 6.4s, a 7.0% improvement over Alpamayo-R1-0.5B (0.913m), demonstrating the benefits of scaling the VLM backbone."
    relation: supports
  - source: library/VLM_VLA/Alpamayo-R1.md
    locator: "§3.5 / §6.4 闭环读数原句（场景数）"
    quote: "We further evaluate both models on the AlpaSim public scenario set comprising 920 challenging driving scenarios."
    relation: supports
  - source: https://arxiv.org/html/2511.00088v2
    locator: "TABLE 10（HTML v2，2026-11-03 抓取，线性化文本）"
    quote: "Alpamayo-R1-10B 0.849 4.0"
    relation: supports
falsifiers:
  - "用公开权重（nvidia/Alpamayo-R1-10B，gated）在 PhysicalAI-AV 官方 644 例上复测 minADE6 高于 0.913（即不优于 0.5B）或与 0.849 显著不符"
  - "AlpaSim 公开 920 场景重跑中 10B 的 AlpaSim Score 显著低于 0.72，或 close encounter rate 显著高于 4%"
  - "发现 PhysicalAI-AV 评测样例与训练数据分布重叠（geo-fence 失效），公开基准数字被污染"
review_due: 2026-12-03
related: [claim-alpamayo-r1-coc-reasoning-beats-trajonly-hard-set, claim-alpamayo-r1-rl-consistency-reward-gains]
signoff: null
---

## 主张

论文声称：两个发布规格在两个公开评测上的成绩——开环 PhysicalAI-AV（644 held-out 例）上 10B minADE6@6.4s 0.849m，比 0.5B 的 0.913m 好 7.0%；闭环 AlpaSim 公开集（920 场景）上 10B 的 close encounter rate 4% vs 9%（−55%）、off-road 16% vs 19%、AlpaSim Score 0.72 vs 0.35（2 倍多）。

三条限定：
1. 与 Abstract 的 12%/35% 不同，本卡数字均出自**公开**数据集/场景集，是全套数字中复现门槛最低的部分（仍需 gated 权重：README 声明模型需申请访问）。
2. 闭环三项里 10B 的 off-road rate（16%）只比 0.5B（19%）好 3 个点，且论文自报 ±1.0；「10B 全面占优」的表述要带此精度。
3. 型号/名称注意：产品线已改名（GitHub README：CES 2026 后 Alpamayo-R1 更名 Alpamayo 1；论文/权重名仍为 Alpamayo-R1）；底座为 Cosmos-Reason（Physical AI VLM），10B = Cosmos-Reason + 2B diffusion decoder。

## 待验证

- 申请 gated 权重后在 PhysicalAI-AV 官方评测协议下复测 644 例开环 minADE6。
- 用公开 AlpaSim 场景集与官方推理代码复测闭环三项（± 值为论文自报，重跑核对方差）。
- 跟踪 Alpamayo 1 / 1.5 后续版本的公开评测是否延续本表口径。

## 成立/不成立的含义

成立：10B 规格可作为驾驶 VLA 闭塟能力的公开参照点（score 0.72 / CER 4%），后续闭环工作可直接对表。
不成立：公开基准与内部成绩脱节（内部 12% 增益在公开集不复现），则引用其能力时以公开数字为准。
