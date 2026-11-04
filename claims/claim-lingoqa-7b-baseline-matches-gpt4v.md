---
id: claim-lingoqa-7b-baseline-matches-gpt4v
title: "论文声称其微调 7B 基线（60.8）追平零样本 GPT-4V（59.6），两者仍远低于人类 5 帧水平（96.6）"
type: claim
status: asserted
scope: "LingoQA 评测集 1000 条，Lingo-Judge 打分；基线 = BLIP-2 式 VLM（CLIP ViT 224×224 squash + Q-Former + Vicuna-1.5-7B），4 秒 5 帧输入，late fusion，在 LingoQA Action+Scenery 训练集两阶段微调；GPT-4V 为零样本 5 帧输入；人类为 5 帧、标注员逐条打 [0,1] 取平均；数字为论文自报（Table 5）"
tags: [lingoqa, autonomous-driving, vqa, gpt-4v, fine-tuning, benchmark]
note: library/QA dataset/LingoQA.md#52-分数梯子按-lingo-judge-排序
paper: "ECCV 2024, LingoQA: Visual Question Answering for Autonomous Driving (arXiv:2312.14115)"
stance: watch
evidence:
  - source: library/QA dataset/LingoQA.md
    locator: "§5.2 / 分数梯子 Table 5 摘录·人类行"
    quote: "| **96.6** | **人类** | 5 帧 |"
    relation: supports
  - source: library/QA dataset/LingoQA.md
    locator: "§5.2 / 分数梯子 Table 5 摘录·基线行"
    quote: "| **60.8** | **LingoQA 基线** | 5 帧 |"
    relation: supports
  - source: library/QA dataset/LingoQA.md
    locator: "§5.2 / 分数梯子 Table 5 摘录·GPT-4V 行"
    quote: "| 59.6 | GPT-4V | 5 帧，零样本 |"
    relation: supports
  - source: library/QA dataset/LingoQA.md
    locator: "§5.2 / 结论第 1 条"
    quote: "1. **微调的 7B 开源模型 ≈ 零样本 GPT-4V**（60.8 vs 59.6）——在这个基准上，领域数据微调追平了 frontier 模型；"
    relation: supports
falsifiers:
  - "〔同范围复现（主张侧+对照侧）〕在同一评测集与同一裁判下复现，微调基线显著低于零样本 GPT-4V（差距超出 1.2 分的排序噪声，如 >5 分），'追平'不成立"
  - "〔机制辨别（裁判口径敏感性）〕换裁判口径（人工评分或第三方 judge）后排序反转：GPT-4V 高于微调基线，说明 60.8 vs 59.6 依赖 Lingo-Judge 这一把尺子"
  - "〔原文核查 / 同范围复现〕人类 5 帧分数显著低于 96.6 或模型分数显著追上人类（差距 <<35.8），推翻'远低于人类'的另一半"
review_due: 2026-12-02
related: [claim-lingoqa-lingo-judge-spearman-0950, claim-lingoqa-late-fusion-beats-early-mid]
signoff: null
---

## 我的理解

论文声称：在 LingoQA 基准（Lingo-Judge 尺子）上，作者用自家 419.9k QA 数据微调的 7B 基线得 60.8，略高于零样本 GPT-4V 的 59.6——即"领域数据微调的 7B 模型在这个基准上追平 frontier 模型"；同时两者都远低于人类 5 帧的 96.6（基线差 35.8 分），论文以此论证基准暴露的真实 gap。

必须记住的限定（尚未独立验证）：
1. "追平"的两分差（60.8 vs 59.6）小于裁判与人类评分的正常波动幅度，且打分尺子（Lingo-Judge）与基线训练目标同源——基线是按这个裁判的口径微调出来的，存在"考生适应考官"的循环性；换人工尺，GPT-4V 的人类分与裁判分是否仍贴近需看 Table 5 的 Human 列。
2. GPT-4V 是零样本（未见过该数据分布），基线是领域内微调，两者比较是"领域微调 vs 通用能力"的口径，不是同条件对抗。
3. 纯文本 Vicuna 下界 38.8：任何"视觉增量"的解读都要先减掉语言先验底数。

## 待验证

- 用开源基线权重在评测集上复测 Lingo-Judge 分数是否 ≈60.8。
- 用人工抽评（如 100 条）分别给基线与 GPT-4V 打分，检验 60.8 vs 59.6 在人工尺下是否保持。
- 检查 GPT-4V 的 Human 列与 Lingo-J 列差值（论文 5.4：BLEU 6.30 vs 微调组 15.00），确认 n-gram 口径下结论是否反转。

## 若成立 / 不成立意味着什么

成立：在驾驶 QA 这类垂直基准上，领域数据微调的中型开源模型可以替代昂贵的零样本 frontier 模型做评测与迭代；选型时垂直微调路线优先。
不成立：若 60.8 vs 59.6 依赖同源裁判，则"追平 frontier"是基准伪影，垂直微调的价值需在其他基准（DriveLM、NuScenesQA）上另行验证。

## 核查记录

- 2026-11-05（P1-B7b 零散组）：本卡 4 条 library 笔记引句经 grep -F 逐字验证全部命中（`library/QA dataset/LingoQA.md`：§5.2 分数梯子表人类/基线/GPT-4V 三行、结论第 1 条）；scope 中 1000 条（100 场景/500 题/每题 2 参考）、基线架构（CLIP 224 squash + Q-Former + Vicuna-1.5-7B，late fusion，两阶段微调）、BLEU 6.30 vs 15.00 等细节均与笔记 §3.5/§4.2/§4.4/§5.4 一致。内容审阅未发现问题：三条限定（裁判同源循环、零样本 vs 微调口径、纯文本下界 38.8）覆盖了主要替代解释，数字均锚定笔记表格；LingoQA 论文原文本轮未实抓，仅补 falsifiers 分层标注，论文数字未改写。
