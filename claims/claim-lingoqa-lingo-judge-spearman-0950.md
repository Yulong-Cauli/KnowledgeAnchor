---
id: claim-lingoqa-lingo-judge-spearman-0950
title: "论文声称 Lingo-Judge 与人工判断的相关性为所测指标中最高（Pearson 0.993 / Spearman 0.950），且 A100 上 10.5 秒评完 1000 条"
type: claim
status: asserted
scope: "LingoQA 评测集 1000 条（100 场景 / 500 题 / 每题 2 条人工参考答案）；15 个模型（Model A~O）在同一评测集上的推理输出；人类分 = 标注员对每条输出打 [0,1] 后按模型取平均；Lingo-Judge = DeBERTa-V3 + LoRA 二分类器（对每题 2 条参考取 max）；单张 A100；数字为论文自报（ECCV 2024 LingoQA）"
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
  - "在 LingoQA 评测集上复现时，Lingo-Judge 与人类模型级分数的 Spearman 相关显著低于 0.950（如 <0.90），或被 GPT-4 裁判（论文自报 0.941/0.932）等其他指标反超"
  - "相关性实验口径不成立：模型数不足 15 个、人类打分非 [0,1] 样本级取均值、或参考答案不止 2 条/题，导致 0.950 不可比"
  - "同硬件（A100）同 1000 条的评测耗时显著高于 10.5 秒（如数量级差距），'可嵌入训练循环'的速度前提失效"
review_due: 2026-12-02
related: [claim-lingoqa-7b-baseline-matches-gpt4v, claim-lingoqa-late-fusion-beats-early-mid]
signoff: null
---

## 我的理解

论文声称：在 LingoQA 自建评测集（1000 条，每题 2 条人工参考）上，用 15 个模型的输出做指标-人类对齐实验，Lingo-Judge（DeBERTa-V3 + LoRA，对 2 条参考取 max 概率）取得 Pearson 0.993 / Spearman 0.950，均为所测指标（n-gram 族、GPT-4 裁判带/不带 CoT）中最高，且 Fisher 变换 95% 置信区间最紧；速度上 A100 单卡 10.5 秒评完 1000 条。核心前提是"裁判只需核对预测与参考的一致性，不需自己懂驾驶"——世界知识来自参考答案，任务本质是 NLI 式比对。

必须记住的限定（尚未独立验证）：
1. 0.950 是**模型级排序**相关（15 个点），不是样本级准确率；样本级 held-out 二分类准确率论文自报 95%。
2. 裁判的训练数据与参考答案出自同一套人工标注流程，存在分布内自证的隐患（论文自己的局限节也承认风格敏感：FUYU 长篇错误回答被判 45.4，人类只给 17.69）。
3. 相关性实验只在该基准的 1000 条评测集上做，换数据集/题型不能假设可用。

## 待验证

- 用开源仓库 [wayveai/LingoQA](https://github.com/wayveai/LingoQA) 复现：在评测集上跑 Lingo-Judge，核对 1000 条耗时是否 ≈10.5s（A100）。
- 复算 Spearman/Pearson：需要 15 个模型的人类分与裁判分，或至少用论文附带的打分文件重算相关系数。
- 对照实验：把 GPT-4 裁判（不带 CoT）在同一 15 模型集合上重跑，确认其 Spearman ≤ Lingo-Judge。

## 若成立 / 不成立意味着什么

成立：自动驾驶自由文本 QA 的自动评测可以放弃 n-gram 与昂贵的大模型裁判，改用蒸馏的小判别器嵌入训练循环高频打分——这是所有依赖 LingoQA 分数的后续结论（基线 60.8 等）的度量衡基础。
不成立：0.950 若主要来自分布内自证（裁判与标注同源），则该基准上的一切自动分数都要打折扣，选型时需要回归人工评测或换第三方裁判。
