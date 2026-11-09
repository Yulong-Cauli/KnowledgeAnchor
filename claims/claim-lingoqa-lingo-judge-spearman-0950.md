---
id: claim-lingoqa-lingo-judge-spearman-0950
title: "论文声称 Lingo-Judge 与人工判断的相关性为所测指标中最高（Pearson 0.993 / Spearman 0.950），且 A100 上 10.5 秒评完 1000 条"
type: claim
status: asserted
scope: "LingoQA 评测集（100 片段 / 500 题 / 每题 2 条人工参考答案，共 1000 条参考）；附录 D 列出 15 个模型（A–O）和两组人工答题参照，Figure 9 画入两组参照；人工评分为逐条 [0,1] 评分的平均值；Lingo-Judge = DeBERTa-V3 + LoRA 二分类器（对每题 2 条参考取最大值）；计时硬件为单张 A100；标题数字为 ECCV 2024 论文报告"
tags: [lingoqa, autonomous-driving, vqa, evaluation-metric, llm-judge, distillation]
note: library/QA dataset/LingoQA.md#24-lingo-judge
paper: "ECCV 2024, LingoQA: Visual Question Answering for Autonomous Driving (arXiv:2312.14115)"
stance: watch
evidence:
  - source: library/QA dataset/LingoQA.md
    locator: "§2.4 / 相关性实验设计第 4 条"
    quote: "4. **结果**：Lingo-Judge 0.993 / 0.950 均为最高，且 Fisher 变换的 95% 置信区间**最紧**（图 10）——不只是均值高，是稳定地高。"
    relation: supports
  - source: library/QA dataset/LingoQA.md
    locator: "§2.4 / 架构·输出"
    quote: "- **输出**：预测正确的概率 ∈ [0, 1]。A100 上 **10.5 秒**跑完 1000 条 → 可嵌入训练循环，每个 checkpoint 都能看分。"
    relation: supports
  - source: library/QA dataset/LingoQA.md
    locator: "§2.4 / 合理性检查"
    quote: "合理性检查：把**人类自己写的参考答案**喂给 Lingo-Judge，得 96.6 / 91.2（两组标注员）——裁判认可人类答案，没跑偏。"
    relation: supports
falsifiers:
  - "〔同范围复现（主张侧+对照侧）〕在 LingoQA 评测集上复现时，Lingo-Judge 与人类模型级分数的 Spearman 相关显著低于 0.950（如 <0.90），或被 GPT-4 裁判（论文自报 0.941/0.932）等其他指标反超"
  - "〔原文核查〕相关性实验口径不成立：模型数不足 15 个、人类打分非 [0,1] 样本级取均值、或参考答案不止 2 条/题，导致 0.950 不可比"
  - "〔同范围复现（开销）〕同硬件（A100）同 1000 条的评测耗时显著高于 10.5 秒（如数量级差距），'可嵌入训练循环'的速度前提失效"
review_due: 2026-12-02
related: [claim-lingoqa-7b-baseline-matches-gpt4v, claim-lingoqa-late-fusion-beats-early-mid]
signoff: null
---

## 主张

论文在 LingoQA 评测集上报告，Lingo-Judge 的 Pearson 0.993 / Spearman 0.950 是 Table 1 所列方法中的最高点估计，Figure 10 给出的 Fisher 变换 95% 置信区间也最窄。附录 D 的相关性研究列出 15 个模型与两组人工答题参照，Figure 9 的散点图纳入了这两组参照。论文另报告单张 A100 评完整套数据用时 10.5 秒。Lingo-Judge 用题目与参考答案判断候选回答，无视频输入。

限定：
1. 0.950 是按答题者汇总分计算的排序相关。论文另报留出集逐条二分类准确率 95%。本库仅用 Table 9 的 15 个模型行复算得到 0.9320，加入两组人工参照得到 0.9534，详见[实验记录](../experiments/lingoqa-lingo-judge-spearman-0950/RESULTS.md)。
2. 裁判的训练数据与参考答案出自同一套人工标注流程，存在分布内自证的隐患（论文自己的局限节也承认风格敏感：FUYU 长篇错误回答被判 45.4，人类只给 17.69）。
3. 相关性实验只在该基准的 1000 条评测集上做，换数据集/题型不能假设可用。

## 待验证

- 用开源仓库 [wayveai/LingoQA](https://github.com/wayveai/LingoQA) 复现：在评测集上跑 Lingo-Judge，核对 1000 条耗时是否 ≈10.5s（A100）。
- 独立复算 Spearman/Pearson：取得原 15 个模型的逐题回答，用公开权重重新评分，并与确切对应的人工均分比较；复现含人工参照的口径时另需两组人工答题记录。公开 Table 9 汇总分的算术已复核。
- 对照实验：把 GPT-4 裁判（不带 CoT）在同一 15 模型集合上重跑，确认其 Spearman ≤ Lingo-Judge。

## 成立/不成立的含义

成立：自动驾驶自由文本 QA 的自动评测可以放弃 n-gram 与昂贵的大模型裁判，改用蒸馏的小判别器嵌入训练循环高频打分——这是所有依赖 LingoQA 分数的后续结论（基线 60.8 等）的度量衡基础。
不成立：0.950 若主要来自分布内自证（裁判与标注同源），则该基准上的一切自动分数都要打折扣，选型时需要回归人工评测或换第三方裁判。

## 核查记录

- 2026-11-09：归档 [Kaggle v1 公开资产预检和 Table 9 复算](../experiments/lingoqa-lingo-judge-spearman-0950/RESULTS.md)。8 题评分试跑完成，其中一条固定无关回答获判通过。v1 表格输入有误。按 ECCV Table 9 更正后，仅 15 个模型的 Pearson / Spearman 为 0.973911 / 0.932023，加入 Figure 9 可见的两组人工参照后为 0.993094 / 0.953375。均为公开汇总分算术，未完成逐题独立复现。

- 2026-11-05（P1-B7b 零散组）：本卡 3 条 library 笔记引句经 grep -F 逐字验证全部命中（`library/QA dataset/LingoQA.md`：§2.4 相关性实验设计第 4 条、架构·输出句、合理性检查句）；scope 中 1000 条（100 场景/500 题/2 参考）、15 模型（Model A~O）、人类打分口径、DeBERTa-V3+LoRA 取 max、GPT-4 裁判 0.941/0.932（笔记 §2.3 Table 1）、FUYU 45.4 vs 17.69（笔记 §2.4 局限 2 / §5.4）均与笔记一致。内容审阅未发现问题：模型级排序相关与样本级 95% 准确率已分层、分布内自证隐患与论文自认局限已分开；LingoQA 论文原文本轮未实抓，仅补 falsifiers 分层标注，论文数字未改写。
