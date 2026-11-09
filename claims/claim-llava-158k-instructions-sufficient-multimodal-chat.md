---
id: claim-llava-158k-instructions-sufficient-multimodal-chat
title: "LLaVA 论文声称：仅 158K 条机器生成指令样本（80K 独立图像）微调即获得接近 multimodal GPT-4 的推理表现，指令微调本身贡献 50+ 相对分"
type: claim
status: asserted
scope: "LLaVA（CLIP ViT-L/14 + 线性投影 + Vicuna，13B）；LLaVA-Bench (In-the-Wild) 24 图像 60 问（GPT-4 作 judge 的相对分，相对 text-only GPT-4 + GT 标注上界）与 LLaVA-Bench (COCO) 30 图像 90 问消融；训练 8×A100（CC-595K 预训练 1 epoch + Instruct-158K 微调 3 epochs）；论文自报数字（NeurIPS 2023，arXiv:2304.08485v2）"
tags: [vlm, visual-instruction-tuning, llava, data-efficiency, gpt4-judge]
note: library/VLM_VLA/LLaVA.md#3-实验
paper: "NeurIPS 2023, Visual Instruction Tuning (LLaVA, arXiv:2304.08485)"
stance: watch
evidence:
  - source: library/VLM_VLA/LLaVA.md
    locator: "§3.3 / §5.1 原句"
    quote: "Surprisingly, although LLaVA is trained with a small multimodal instruction-following dataset (80K unique images), it demonstrates quite similar reasoning results with multimodal GPT-4 on these examples."
    relation: supports
  - source: library/VLM_VLA/LLaVA.md
    locator: "§3.3 / Table 5（In-the-Wild 相对分）"
    quote: "| LLaVA | 57.3 ± 1.9 | 52.5 ± 6.3 | 81.7 ± 1.8 | 67.3 ± 2.0 |"
    relation: supports
  - source: library/VLM_VLA/LLaVA.md
    locator: "§3.2 / Table 4（训练数据消融）"
    quote: "| No Instruction Tuning | 22.0 (-61.1) | 24.0 (-51.3) | 18.5 (-78.0) | 21.5 (-63.6) |"
    relation: supports
  - source: library/VLM_VLA/LLaVA.md
    locator: "§2.3 / §5 训练配置原句"
    quote: "We train all models with 8 A100s, following Vicuna’s hyperparameters [9]. We pre-train our model on the filtered CC-595K subset for 1 epoch with a learning rate of 2e-3 and a batch size of 128, and fine-tune on the proposed LLaVA-Instruct-158K dataset for 3 epochs, with a learning rate of 2e-5 and a batch size of 32."
    relation: supports
falsifiers:
  - "同范围复现（主张侧）：同架构（CLIP+线性投影+Vicuna 13B）在同等规模（约 158K 样本/80K 图像）生成数据上复现，In-the-Wild overall 相对分显著低于 67.3 或推理类问题分显著低于 81.7（论文自报三次运行 std 仅 overall ±2.0 / complex reasoning ±1.8；超出该量级的偏差先排查 judge 方差再下结论）"
  - "同范围复现（主张侧）：发现该表现依赖指令数据之外的成分（如未披露的人工标注、更大规模预训练数据或更长训练），『小数据足够』不成立"
  - "同范围复现（对照侧）：复现中不做指令微调的对照（直接用预训练对齐模型）得分远高于 21.5（Table 4 锚点），即指令微调并非主要增益来源"
review_due: 2026-12-03
related: [claim-llava-visual-instruction-tuning-first-gpt4-pipeline, claim-llava-gpt4-judge-relative-851-coco]
signoff: null
---

## 主张

论文声称：158K 条 GPT-4 生成的指令样本（对应 80K 独立图像）加 595K 图文对的轻量预训练，在 8×A100 上数小时内即可把 CLIP+Vicuna 调成具备多模态对话与推理能力的助手；在 In-the-Wild 24 图基准上 overall 相对分 67.3、complex reasoning 81.7（均为 GPT-4 作 judge、相对 text-only GPT-4 上界的相对分），论文据此称其推理表现与 multimodal GPT-4「相当接近」。Table 4 消融同时显示：同架构不做指令微调只有 21.5（-63.6），指令微调是主要增益来源。

「接近 GPT-4」的口径限定：只在这 24 张图的样例集合上、且以相对分衡量；这是论文自己的表述（"quite similar reasoning results ... on these examples"），不是普适结论。

## 待验证

当前 stance：watch；原卡未记录立场依据，按未记录处理。

- 同范围复现（主张侧）：复现两阶段训练（论文给出全部超参：lr 2e-3/2e-5、batch 128/32、3 epochs），在 LLaVA-Bench (In-the-Wild) 上重算 GPT-4-judge 相对分（判据见 falsifier 1）。
- 原文核查：抽检 LLaVA-Instruct-158K 数据质量（三类比例 58K/23K/77K 是否如论文）。
- 同范围复现（对照侧）：仅用 conversation 数据（Table 4 行 4：73.8）与全量数据（85.1，COCO 基准）的差距是否可复现；差距不复现则「指令数据配比」这一增益来源解释要重估。

## 成立/不成立的含义

成立：多模态指令微调的数据门槛是「十万级生成样本」量级，研究迭代可不必依赖大规模人工标注；复现/二次开发成本按 8×A100·单日估。
不成立：表现依赖未披露成分或 judge 偏置，则该数据效率结论不能作为新 VLM 项目的数据规划依据。

## 核查记录

- 2026-11-05（02 任务书整理班 P1-B3c）：表达整理，数字未改写。4 条 evidence 全部 Grep 逐字命中来源（含 Vicuna 弯撇号逐字节核对）；falsifiers 补分层标注，第 1 条补论文自报三次运行 std（overall ±2.0 / complex ±1.8）作为「显著」的既有锚点，第 3 条补 Table 4 锚点；scope 末补「尚未独立验证」；待验证补立场记录与检查分类。id/status/stance/review_due/signoff 未动。
