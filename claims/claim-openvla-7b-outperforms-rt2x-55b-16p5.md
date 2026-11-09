---
id: claim-openvla-7b-outperforms-rt2x-55b-16p5
title: "OpenVLA 论文自报：7B 开源 VLA 在 WidowX+Google Robot 29 任务 A/B 评测中绝对成功率超闭源 RT-2-X (55B) 16.5%"
type: claim
status: asserted
scope: "OpenVLA 7B（Prismatic-7B VLM：DinoSigLIP 双视觉编码器 + Llama 2 7B；OpenX 970k 轨迹预训练，27 epochs）；对比 RT-2-X 55B（闭源）；评测为 WidowX（BridgeData V2，17 任务×10 trials）+ Google Robot（12 任务×5 trials）共 29 任务的 A/B 同状态评测；数字为 OpenVLA 作者执行的自报结果（CoRL 2024，arXiv:2406.09246v3）"
tags: [vla, openvla, rt-2x, robot-manipulation, open-source]
note: library/VLM_VLA/OpenVLA.md#3-实验
paper: "CoRL 2024, OpenVLA: An Open-Source Vision-Language-Action Model (arXiv:2406.09246)"
stance: watch
evidence:
  - source: library/VLM_VLA/OpenVLA.md
    locator: "§1 / §1 原句"
    quote: "OpenVLA outperforms the 55B-parameter RT-2-X model [7, 1], the prior state-of-the-art VLA, by 16.5% absolute success rate across 29 evaluation tasks on the WidowX and Google Robot embodiments."
    relation: supports
  - source: library/VLM_VLA/OpenVLA.md
    locator: "§3.1 / §5.1 主结果原句"
    quote: "Notably, OpenVLA performs comparably to RT-2-X on Google robot evaluations and significantly outperforms RT-2-X on BridgeData V2 evaluations despite being an order of magnitude smaller (7B vs. 55B parameters)."
    relation: supports
  - source: library/VLM_VLA/OpenVLA.md
    locator: "§3.1 / Appendix C 原句（RT-2-X 评测 workaround）"
    quote: "we mitigated this issue by simply querying the second-most-likely action from the model, since the first-most-likely action was often all zeros while the second-most-likely action was not."
    relation: supports
  - source: https://arxiv.org/abs/2406.09246
    locator: "Abstract（abs 页，2026-11-03 抓取）"
    quote: "outperforming closed models such as RT-2-X (55B) by 16.5% in absolute task success rate across 29 tasks and multiple robot embodiments, with 7x fewer parameters"
    relation: supports
falsifiers:
  - "第三方在相同 29 任务/同 A/B 协议下复现，OpenVLA 与 RT-2-X 成功率差显著小于 16.5% 或反超"
  - "发现 16.5% 的汇总口径与明细表（arXiv v3 Table 4/6，逐任务成功率）不一致，或优势集中于依赖数据清洗（Bridge 去 all-zero 动作）的任务"
  - "RT-2-X 的『取次优动作』workaround 被证明对 RT-2-X 不利（如次优动作成功率低于首位动作），即对比口径系统性偏向 OpenVLA"
review_due: 2026-12-03
related: [claim-llava-visual-instruction-tuning-first-gpt4-pipeline, claim-openvla-lora-rank32-matches-full-finetune, claim-openvla-int4-quantization-matches-bf16]
signoff: null
---

## 主张

论文自报：7B 的开源 OpenVLA 在跨 29 个操作任务、两具机器人本体的 A/B 评测（同任务同初始状态）中，绝对任务成功率比闭源 SOTA RT-2-X（55B）高 16.5%，参数少 7 倍。归因（§5.1 自述）：更大训练集（970k vs 350k 轨迹）、更细数据清洗（去 all-zero 动作）、DinoSigLIP 融合编码器。

三条限定：
1. 这是自报对比：RT-2-X 闭源、由 OpenVLA 作者执行评测；其 Bridge 评测依赖「取次优动作」的 workaround（Appendix C，论文称与 OpenX 报告中 RT-2-X 开发者做法相同）。
2. 分平台看：Google Robot 上只是 "comparably"，16.5% 主要由 BridgeData V2 差距贡献（整理者推断，非论文原句——论文只给分平台定性结论；逐任务明细 Table 4/6 未逐行核对）。
3. RT-2-X 在语义泛化类任务上仍更强（§5.1 原文承认），「超越」不覆盖所有任务类别。

谱系：OpenVLA 的 Prismatic 基座用 LLaVA 1.5 数据混合微调（§3.1），与本库 LLaVA 卡同谱系。

## 待验证

- 用开源权重（github.com/openvla/openvla，MIT）在 BridgeData V2 WidowX 协议下复测，对照逐任务明细（Table 4，本笔记未逐行转抄）。
- 向 RT-2-X 数字来源（OpenX-Embodiment 报告）核对 16.5% 的差值口径是否为跨任务平均。
- 复算去掉 Bridge 数据清洗（去 all-zero 动作）后的双方成功率对比（论文 Appendix C 有讨论），看 16.5% 差距还剩多少。

## 成立/不成立的含义

成立：开源 7B VLA 可作为机器人操作研究的默认底座，闭源大规模 VLA 的必要性下降。
不成立：优势依赖评测执行方与数据清洗口径，选型时需自建 A/B 复测再定。

## 核查记录

- 2026-11-05 表达整理（P1-B3b 班）：正文第 2 条「16.5% 主要由 BridgeData V2 差距贡献」标注为整理者推断（依据：论文 §5.1 分平台定性句 comparably / significantly outperforms，明细表未转录）。数字未改写。
