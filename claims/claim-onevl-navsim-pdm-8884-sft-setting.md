---
id: claim-onevl-navsim-pdm-8884-sft-setting
title: "OneVL 论文声称：NAVSIM SFT 设定 PDM-score 88.84，超前 SOTA AdaThinkDrive 86.20 / LaST-VLA 87.30（两者数值转引自原论文），延迟 4.46s≈answer-only"
type: claim
status: asserted
scope: "NAVSIM benchmark，supervised fine-tuning setting（§5.2 限定），PDM-score（综合轨迹安全/舒适/进度的复合指标）；OneVL 4B（Qwen3-VL-4B-Instruct 主干，推理期仅计主 VLM 参数）；对比值 AdaThinkDrive 86.20（8B）/ LaST-VLA 87.30（8B）在原表带 ∗，为『derived from the corresponding paper』的转引值；数字为论文自报（arXiv:2604.18486v3 Table 1）"
tags: [vla, onevl, navsim, pdm-score, benchmark-snapshot]
note: library/VLM_VLA/OneVL.md#3-实验
paper: "arXiv 2026, Xiaomi OneVL: One-Step Latent Reasoning and Planning with Vision-Language Explanation (arXiv:2604.18486)"
stance: watch
evidence:
  - source: library/VLM_VLA/OneVL.md
    locator: "§3.2 / §5.3 读数一原句"
    quote: "Specifically, OneVL achieves 88.84 PDM-score, surpassing the previous supervised finetuned SOTA AdaThinkDrive (86.20) and LaST-VLA (87.30) by +2.64 and +1.54, respectively."
    relation: supports
  - source: library/VLM_VLA/OneVL.md
    locator: "§3.2 / Table 1（OneVL 行）"
    quote: "| ⟨MATH:\\bullet⟩ OneVL | 4B | ⟨MATH:\\mathbf{88.84}⟩ | ⟨MATH:\\mathbf{4.46}⟩ | Vision + Language |"
    relation: supports
  - source: library/VLM_VLA/OneVL.md
    locator: "§3.2 / Table 1（AR Answer 行，延迟下界参照）"
    quote: "| ⟨MATH:\\circ⟩ AR Answer | 4B | ⟨MATH:87.47⟩ | ⟨MATH:4.49⟩ | – |"
    relation: supports
  - source: library/VLM_VLA/OneVL.md
    locator: "§3.1 / §5.2 指标定义原句"
    quote: "On NAVSIM , all methods are evaluated using the Predictive Driver Model (PDM) score, a composite metric that jointly assesses trajectory safety, comfort, and progress."
    relation: supports
  - source: library/VLM_VLA/OneVL.md
    locator: "§3.2 / 读数五原句与笔记核对注（口径差警示）"
    quote: "笔记作者入库核对：按 Table 1 数字 88.29−87.47=0.82，论文原句 \"+0.80\" 与自家表格有 0.02 口径差，引句照抄未改动。"
    relation: supports
falsifiers:
  - "同范围复现（主张侧）：在 NAVSIM SFT 同设定复现中 OneVL PDM-score 低于 87.30（即不超过 LaST-VLA 的转引值）"
  - "同范围复现（对照侧）：AdaThinkDrive/LaST-VLA 按其原论文设定复现高于 88.84（转引值低估了对手）；复现配置若与其原论文不符，属对照口径问题，先登记待决，不直接判伪"
  - "同范围复现（主张侧，延迟）：同硬件同批大小复测中，OneVL 相对 AR Answer（4.49s）的延迟优势消失或反转，『answer-only 延迟』不成立；延迟的硬件/批大小论文未说明（笔记 TODO），跨硬件的绝对值差异属口径问题，不判伪"
review_due: 2026-12-03
related: [claim-onevl-latent-cot-surpasses-explicit-four-benchmarks]
signoff: null
---

## 我的理解

论文声称：NAVSIM 的 supervised fine-tuning 设定下，OneVL 拿到 88.84 PDM-score，比前 SOTA AdaThinkDrive（86.20）高 +2.64、比 LaST-VLA（87.30）高 +1.54；推理延迟 4.46s 与 answer-only 基线（4.49s）基本相同，即「CoT 的精度、answer-only 的延迟」。

引用时必须带的三点限定：
1. 两个前 SOTA 数值在 Table 1 带 ∗——caption 声明 "the result is derived from the corresponding paper"，来源与训练/评测口径与作者自训基线不同（⚠①），+2.64/+1.54 是跨口径比较。
2. 论文正文的显式 CoT 增益句写 "+0.80 PDM-score"（88.29−87.47），但按 Table 1 数字是 0.82——笔记已注「+0.80 与表差 0.02 口径差」，引用该句时注明（本卡 evidence 第 5 条）。
3. NAVSIM 对比限定 "supervised fine-tuning setting"（§5.2），不覆盖其它训练范式；延迟测量的硬件/批大小在 HTML 正文中未见说明（笔记 TODO），跨论文延迟不可直接比。
4. 口径迁移提醒：NAVSIM PDM-score 是 nuPlan 衍生仿真评测口径，与本库 nuScenes 开环 L2/碰撞率（BEV-Planner / OpenDriveVLA / DrivePI 系卡）及 nuScenes-QA 文本准确率口径不可互换；跨口径引用只作条件差异对照，不构成互证。

## 待验证

当前 stance：watch；原卡未记录立场依据，按未记录处理。

- 同范围复现（主张侧）：用官方权重/推理仓库在 NAVSIM 官方 eval server 复测 PDM-score；低于 87.30 即触发 falsifier 1。
- 原文核查：向 AdaThinkDrive、LaST-VLA 原文核对其 NAVSIM 数字与评测协议，确认 ∗ 转引值的可比性。
- 原文核查 + 同范围复测：查明 4.46s 延迟的硬件环境（GPU 型号/批大小），同硬件下复测与 AR Answer 4.49s / AR CoT+Answer 6.58s 的相对关系。

## 若成立 / 不成立意味着什么

成立：4B 模型以 SFT 设定刷新 NAVSIM 且延迟达 answer-only 水平，可作为 NAVSIM 排行的新参照点。
不成立：领先依赖跨口径转引，则需同口径重赛后再引用。

## 核查记录

- 2026-11-05（02 任务书整理班 P1-B3c）：表达整理，数字未改写。5 条 evidence 全部 Grep 逐字命中来源（全部为 library 笔记内 quote；其中读数一原句另于 2026-11-05 实抓 arXiv HTML v3 复核命中）；falsifiers 补分层标注，第 3 条改为「相对 AR Answer 的延迟优势」判据（延迟硬件论文未载，绝对值跨硬件比较按口径问题处理）；正文补第 4 条口径迁移提醒（NAVSIM PDMS 与本库 nuScenes 开环/VQA 口径不可互换）；scope 末补「尚未独立验证」；待验证补立场记录与检查分类。id/status/stance/review_due/signoff 未动。
