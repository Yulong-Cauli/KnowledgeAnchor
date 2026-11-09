---
id: claim-qwen3vl-235b-thinking-mmstar-787-highest
title: "Qwen3-VL 论文声称：Qwen3-VL-235B-A22B-Thinking 以 78.7 取得 MMStar 最高分（多模态 SOTA 快照，绑定模型规格与 arXiv v2）"
type: claim
status: asserted
scope: "Qwen3-VL-235B-A22B-Thinking（MoE：235B 总参 / 22B 激活，SigLIP2-SO-400M 视觉编码器 + Qwen3 骨干）；基准 MMStar（单图 VQA，评测采样 temperature 0.6 / top-p 0.95 / top-k 20）；数字来源为 arXiv:2511.21631v2（2025-11-27）§5.1 prose；『最高』为论文声称，未含第三方榜单核验"
tags: [vlm, qwen3-vl, mmstar, benchmark-snapshot, sota-claim]
note: library/VLM_VLA/Qwen3-VL.md#3-实验
paper: "arXiv 2025, Qwen3-VL Technical Report (arXiv:2511.21631)"
stance: watch
evidence:
  - source: library/VLM_VLA/Qwen3-VL.md
    locator: "§3.4 / §5.1 原句"
    quote: "Qwen3-VL-235B-A22B-Thinking achieves the highest score of 78.7 on MMStar."
    relation: supports
  - source: library/VLM_VLA/Qwen3-VL.md
    locator: "§2.1 / §2 原句（模型规格）"
    quote: "The flagship model, Qwen3-VL-235B-A22B, has 235B total parameters with 22B activated per token."
    relation: supports
  - source: library/VLM_VLA/Qwen3-VL.md
    locator: "§1 / ⚠ 措辞提示（MMMU 并非同场最高）"
    quote: "PDF Table 2 抽查显示 MMMU thinking 列为 80.6、GPT-5(high) 列为 84.2*（* 表示分数取自原技术报告），即与全部推理模型同场时并非全面第一。"
    relation: supports
  - source: https://arxiv.org/html/2511.21631v2
    locator: "§5.1（HTML v2，2026-11-03 抓取）"
    quote: "achieves the highest score of 78.7 on MMStar"
    relation: supports
falsifiers:
  - "同范围复现（主张侧）：MMStar 官方评测或第三方同版本复现中，Qwen3-VL-235B-A22B-Thinking 低于 78.7，或同场对比模型（如 GPT-5/Gemini-2.5-Pro）在 MMStar 上高于 78.7"
  - "原文核查：发现该 prose 的『最高』限定在 PDF 大表中被反驳（同列存在更高分），或 v1/v3 版本改动该数字"
  - "同范围复现（主张侧，开源权重复测）：官方权重开源后在默认推理配置（temperature 0.6 / top-p 0.95 / top-k 20）下复现不出 78.7"
review_due: 2026-12-03
related: [claim-qwen3vl-length-adaptive-sampling-pretraining]
signoff: null
---

## 主张

论文声称：Qwen3-VL-235B-A22B-Thinking 在 MMStar 上取得 78.7 的最高分（§5.1 prose）。该声称只绑定「该模型规格 + MMStar + arXiv v2」这一个点，不外推到其它基准。

两个限定：
1. 同报告的 MMMU 上 Qwen3-VL-Thinking 是 80.6，而 GPT-5(high) 是 84.2*——即在 MMMU 上它并非第一；SOTA 声明是分基准的，MMStar 78.7 这一格不能代表「全面 SOTA」。
2. 多模态结果大表未随 arXiv HTML v2 提供（§5.1–5.10 有 10 处空交叉引用），MMStar 78.7 目前只有 prose 一个来源；独立核对需查 PDF Table 2（笔记做过抽查，MMStar 78.7 与 prose 一致，但未逐格重建整表）。

## 待验证

当前 stance：watch；原卡未记录立场依据，按未记录处理。

- 原文核查（优先，成本最低）：从 arXiv PDF（https://arxiv.org/pdf/2511.21631v2）Table 2 定位 MMStar 行，逐格核对 78.7 与同列竞品分数——大表被反驳即『最高』不成立。
- 原文核查（第三方榜单）：MMStar 官方 leaderboard（若可用）对照该版本下各模型分数。
- 同范围复现（主张侧）：用开源权重（Apache-2.0，GitHub QwenLM/Qwen3-VL）复测 MMStar。

## 成立/不成立的含义

成立：选型时 Qwen3-VL-235B-A22B-Thinking 可作为多模态感知/推理底座的首批候选（但按 AGENTS.md 高风险决策仍需 verified）。
不成立：SOTA 快照依赖自报口径，选型回到对多个基准的自行复测。

## 核查记录

- 2026-11-05（02 任务书整理班 P1-B3c）：表达整理，数字未改写。4 条 evidence 全部逐字命中来源（3 条 library 笔记 Grep 命中；1 条 arXiv HTML v2 MMStar 句于 2026-11-05 实抓复核命中）；falsifiers 补分层标注；scope 末补「尚未独立验证」；待验证补立场记录、检查分类与优先级。id/status/stance/review_due/signoff 未动。
