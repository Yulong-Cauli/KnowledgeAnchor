---
id: claim-llava-gpt4-judge-relative-851-coco
title: "LLaVA 论文声称：LLaVA-Bench (COCO) 上取得相对 text-only GPT-4 的 85.1% relative score（GPT-4 作 judge）——相对分而非绝对准确率"
type: claim
status: asserted
scope: "LLaVA 全量数据模型（13B）；LLaVA-Bench (COCO)：COCO-Val-2014 随机 30 图 × 3 类问题 = 90 问；judge 为 text-only GPT-4（1-10 打分，评 helpfulness/relevance/accuracy/detail）；分母/上界是『用 GT caption+bounding box 作视觉输入的 text-only GPT-4』；论文自报数字（NeurIPS 2023，arXiv:2304.08485v2）"
tags: [vlm, llava, gpt4-judge, relative-score, evaluation-methodology]
note: library/VLM_VLA/LLaVA.md#3-实验
paper: "NeurIPS 2023, Visual Instruction Tuning (LLaVA, arXiv:2304.08485)"
stance: watch
evidence:
  - source: library/VLM_VLA/LLaVA.md
    locator: "§3.2 / Table 4（Full data 行）"
    quote: "| Full data | 83.1 | 75.3 | 96.5 | 85.1 |"
    relation: supports
  - source: library/VLM_VLA/LLaVA.md
    locator: "§3.1 / §5.1 指标定义原句"
    quote: "We report relative scores w.r.t. the text-only GPT-4 model that uses the textural ground truth description as visual input."
    relation: supports
  - source: library/VLM_VLA/LLaVA.md
    locator: "§3.3 / Table 5（In-the-Wild LLaVA 行）"
    quote: "| LLaVA | 57.3 ± 1.9 | 52.5 ± 6.3 | 81.7 ± 1.8 | 67.3 ± 2.0 |"
    relation: supports
  - source: library/VLM_VLA/LLaVA.md
    locator: "§4 / ⚠ 措辞提示"
    quote: "85.1%（Table 4）是 GPT-4 作 judge 的 relative score（相对使用 GT caption+box 的 text-only GPT-4），不是绝对准确率"
    relation: supports
  - source: https://arxiv.org/abs/2304.08485
    locator: "Abstract（abs 页，2026-11-03 抓取）"
    quote: "yields a 85.1% relative score compared with GPT-4 on a synthetic multimodal instruction-following dataset"
    relation: supports
falsifiers:
  - "以绝对指标（人工评分或与 GT 答案的客观匹配）重评同批 90 问，LLaVA 达不到相对分所暗示的水平，或与 text-only GPT-4 上界的差距远大于 14.9%"
  - "GPT-4 judge 对被评模型不独立（如 prompt 中含可区分身份信息）或多次评测方差大（论文仅以脚注自证 GPT-4 gives a consistent evaluation），相对分框架本身不可靠"
  - "复现中 In-the-Wild overall 相对分显著高于 67.3（即论文报 COCO 85.1 有选择性报告之嫌），或 Table 4 数字与论文 PDF 不符"
review_due: 2026-12-03
related: [claim-llava-visual-instruction-tuning-first-gpt4-pipeline, claim-llava-158k-instructions-sufficient-multimodal-chat]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：在自建的 LLaVA-Bench (COCO)（30 图 90 问）上，LLaVA 拿到 85.1 的 overall 相对分——这是「相对使用 GT caption+box 的 text-only GPT-4」的百分比（GPT-4 作 judge 打 1-10 分后归一），不是绝对准确率；分项为 conversation 83.1 / detail 75.3 / complex reasoning 96.5。同框架下更难的 In-the-Wild 基准上 overall 只有 67.3（complex reasoning 81.7）。

引用时必须带的三点限定（笔记 ⚠ 原注）：
1. 85.1% 是相对分，不是「答对率」；
2. In-the-Wild 的 overall 只有 67.3%，COCO 90 问是论文自己数据 pipeline 生成的同分布问题；
3. 相对分评测依赖 GPT-4 judge 的稳定性，论文仅自证一致（Table 5 脚注），无第三方核验。

## 待验证

- 取 LLaVA-Bench (COCO) 90 问，用人工评分或确定性指标重评，对比 85.1 相对分的可信度。
- 重跑 GPT-4 judge 三次（论文做法）检验打分方差；更换 judge 模型（如 Claude/Gemini）看排序是否稳定。
- 核对 arXiv v2 PDF Table 4 与笔记转抄逐格一致（笔记已声明逐单元格核验过，2026-11-03 抓取 abs 页确认 Abstract 的 85.1% 表述）。

## 若成立 / 不成立意味着什么

成立：GPT-4 作 judge 的相对分框架可作为多模态对话能力的低成本评测口径，但引用本文数字时必须写「相对分」。
不成立：judge 框架有偏（分项 96.5 的 complex reasoning 最可疑），则该论文及后续沿用该评测的工作（含本库 VLA 组相关笔记中的 judge 类数字）都要降权处理。
