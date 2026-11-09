---
id: claim-onevl-latent-cot-surpasses-explicit-four-benchmarks
title: "OneVL 论文声称：首个也是唯一在四个 benchmark 上超越显式自回归 CoT 的 latent CoT 方法（统一 VLA+世界模型表征，answer-only 延迟）"
type: claim
status: asserted
scope: "OneVL（Qwen3-VL-4B-Instruct 主干 + 双辅助解码器：语言 CoT 重建 + 视觉未来帧预测；推理期 latent token 全部 prefill、辅助解码器丢弃）；四个 benchmark 为 NAVSIM / ROADWork / Impromptu / Alpamayo-R1；对比基线为作者自训的同底座（4B Qwen3-VL）AR Answer / AR CoT+Answer 与三个移植版 latent CoT；数字为论文自报（arXiv:2604.18486v3）"
tags: [vla, latent-cot, onevl, world-model, autonomous-driving]
note: library/VLM_VLA/OneVL.md#3-实验
paper: "arXiv 2026, Xiaomi OneVL: One-Step Latent Reasoning and Planning with Vision-Language Explanation (arXiv:2604.18486)"
stance: watch
evidence:
  - source: library/VLM_VLA/OneVL.md
    locator: "§1 / Abstract 原句"
    quote: "Across four benchmarks, OneVL becomes the first latent CoT method to surpass explicit CoT, delivering superior accuracy at answer-only latency."
    relation: supports
  - source: library/VLM_VLA/OneVL.md
    locator: "§3.2 / Table 1（NAVSIM OneVL 行）"
    quote: "| ⟨MATH:\\bullet⟩ OneVL | 4B | ⟨MATH:\\mathbf{88.84}⟩ | ⟨MATH:\\mathbf{4.46}⟩ | Vision + Language |"
    relation: supports
  - source: library/VLM_VLA/OneVL.md
    locator: "§3.2 / Table 1（AR CoT+Answer 行）"
    quote: "| ⟨MATH:\\circ⟩ AR CoT+Answer | 4B | ⟨MATH:88.29⟩ | ⟨MATH:6.58⟩ | Language |"
    relation: supports
  - source: library/VLM_VLA/OneVL.md
    locator: "§3.2 / Table 3（Impromptu OneVL 行，ADE/FDE m）"
    quote: "| ⟨MATH:\\bullet⟩ OneVL | 4B | ⟨MATH:\\mathbf{1.34}⟩ | ⟨MATH:\\mathbf{3.70}⟩ | ⟨MATH:\\mathbf{4.02}⟩ | Vision + Language |"
    relation: supports
  - source: https://arxiv.org/html/2604.18486v3
    locator: "§5.3（HTML v3，2026-11-03 抓取）"
    quote: "Specifically, OneVL achieves 88.84 PDM-score, surpassing the previous supervised finetuned SOTA AdaThinkDrive (86.20) and LaST-VLA (87.30) by +2.64 and +1.54, respectively."
    relation: supports
falsifiers:
  - "同范围复现（主张侧）：同底座（4B Qwen3-VL）复现中，AR CoT+Answer 在四个 benchmark 之一高于 OneVL（显式 CoT 反超），『唯一超越』不成立"
  - "同范围复现（对照侧，论文自认的混杂因素）：给移植版 latent CoT（COCONUT/CODI/SIM-CoT）配上 OneVL 的三阶段训练配方后反超 OneVL，即增益来自训练配方而非统一表征设计"
  - "同范围复现（对照侧）：Alpamayo-R1 复现中，除论文自认的 FDE 输给 Cosmos-Reason（7.53 vs 7.42）外，OneVL 对显式 CoT 基线（AR CoT+Answer：ADE 2.99 / FDE 8.54，Table 5）的优势也不复现——『四 benchmark 全部超越显式 CoT』的全面性不成立"
review_due: 2026-12-03
related: [claim-onevl-navsim-pdm-8884-sft-setting, claim-alpamayo-r1-coc-reasoning-beats-trajonly-hard-set, claim-qwen3vl-235b-thinking-mmstar-787-highest]
signoff: null
---

## 我的理解

论文声称：把推理压进紧凑 latent token（视觉 4 逻辑位/35 vocab token + 语言 2 逻辑位/20 vocab token），用「未来帧预测」世界模型监督 + 语言 CoT 重建双辅助解码器约束 latent 内容，推理期全部 prefill——OneVL 在其四个 benchmark 上全部优于同底座的显式 AR CoT+Answer，且延迟等同 answer-only（NAVSIM 4.46s vs 4.49s）。此前 latent CoT（COCONUT/CODI/SIM-CoT 移植版）几乎全面低于 answer-only 基线——论文原句自带例外："All three adapted latent CoT methods perform substantially worse than answer-only AR prediction, except for the Alpamayo-R1 dataset"（§5.3；Table 5 中 CODI ADE 3.22 / FDE 9.25 优于 AR Answer 3.27/9.59）。

三个必须记住的限定（笔记 ⚠）：
1. "first/唯一"限于本文的四个 benchmark 与其自训基线设定（⚠⑧），且 latent 基线未用三阶段配方（论文自己承认这是混杂因素，§5.3）。
2. Alpamayo-R1 benchmark 的 CoT 标签用其公开 checkpoint 自行复现、测试集为作者自建（700 例抽样子集）——Table 5 数字建立在这套自制协议上；OneVL 的 FDE（7.53）其实输给 Cosmos-Reason（7.42）。
3. 解释质量上显式 AR CoT 仍三项指标全最高（Table 6），OneVL 只是缩小差距。

主干谱系：OneVL 主干即 Qwen3-VL-4B-Instruct（本库 Qwen3-VL 笔记所记家族的 4B 成员）；其第四个 benchmark 即 Alpamayo-R1（CoC 标签复用其 checkpoint，见 claim-alpamayo-r1-coc-reasoning-beats-trajonly-hard-set）。

## 待验证

当前 stance：watch；原卡未记录立场依据，按未记录处理。

- 同范围复现（主张侧）：官方推理仓库（xiaomi-research/onevl）复现 NAVSIM PDM 88.84 与 4.46s 延迟——固定论文评测协议，观察精度与延迟是否落在论文值附近；显著偏低则「精度 + answer-only 延迟」双主张同时存疑。
- 同范围复现（对照侧）：给 SIM-CoT/COCONUT 移植版补三阶段训练，检验「配方混杂因素」是否解释 latent 基线的失败；移植版反超则本卡的增益归因（统一表征 vs 训练配方）要改写。
- 跨条件迁移（不充当原范围反证）：换更大主干（如 8B）验证结论是否随规模保持。

## 若成立 / 不成立意味着什么

成立：驾驶 VLA 的推理不必在解码期逐 token 生成——latent + prefill 路线可同时拿到可解释性与 answer-only 延迟，对实时闭环部署有直接价值。
不成立：显式 CoT 仍不可替代，或增益来自训练配方，则该框架降级为普通多任务训练变体。

## 核查记录

- 2026-11-05（02 任务书整理班 P1-B3c）：表达整理，数字未改写。5 条 evidence 全部 Grep 逐字命中来源（4 条 library 笔记 + 1 条 arXiv HTML v3；后者另于 2026-11-05 实抓复核命中）；falsifiers 补分层标注，第 3 条由「FDE 复现不复现…之外的全面领先」改写为对显式 CoT 基线优势的可检验表述；正文「此前所有 latent CoT 均低于 answer-only」补论文自认的 Alpamayo-R1 例外（§5.3 原句，Table 5 中 CODI 优于 AR Answer）；scope 末补「尚未独立验证」；待验证补立场记录与检查分类。id/status/stance/review_due/signoff 未动。
