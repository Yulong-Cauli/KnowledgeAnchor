---
id: claim-omniquant-note-table-mismatch
title: "OmniQuant 笔记实验 1 表头-数据列错配、实验 4 FP16 基线行与论文原表不符"
type: claim
status: asserted
scope: "library/Quantization/OmniQuant.md §4 实验 1 与实验 4 两张表；对照 arXiv:2308.13137 v3（ICLR 2024 camera-ready）Table 1 p.7 与 Table 3 p.9，v1 用于版本差核对；不评价笔记其余章节与其余 4 张 OmniQuant 卡的数字归因"
tags: [omniquant, note-quality, evidence, quantization]
note: library/Quantization/OmniQuant.md#4-实验与分析-experiments
paper: "ICLR 2024, OmniQuant: Omnidirectionally Calibrated Quantization for Large Language Models (arXiv:2308.13137)"
stance: watch
evidence:
  - source: library/Quantization/OmniQuant.md
    locator: "§4 / 实验 1 表头（2026-11-03 修正前历史记录；现表头已改「LLaMA-1-7B W2A16g128 PPL 对比」）"
    quote: "**表格：LLaMA-13B W2A16 PPL 对比**"
    relation: supports
  - source: library/Quantization/OmniQuant.md
    locator: "§4 / 实验 1 / RTN 行（2026-11-03 修正前历史记录；现 RTN 行为 1.9e3 (1900+)，无对应原文）"
    quote: "| **RTN**       | 6.8e4 (68000+)      | **完全失效**，输出乱码   |"
    relation: supports
  - source: library/Quantization/OmniQuant.md
    locator: "§4 / 实验 1 / GPTQ 行（现引文：2026-11-03 修正后该行原样保留，2026-11-05 复核逐字命中）"
    quote: "| **GPTQ**      | 44.01               | **不可用**，精度损失巨大 |"
    relation: supports
  - source: library/Quantization/OmniQuant.md
    locator: "§4 / 实验 1 / AWQ 行（现引文：2026-11-03 修正后该行原样保留，2026-11-05 复核逐字命中）"
    quote: "| **AWQ**       | 2.6e5               | **失效**                 |"
    relation: supports
  - source: library/Quantization/OmniQuant.md
    locator: "§4 / 实验 1 / OmniQuant 行（现引文：2026-11-03 修正后该行原样保留，2026-11-05 复核逐字命中）"
    quote: "| **OmniQuant** | **9.72**            | **可用**，接近实用水平   |"
    relation: supports
  - source: https://arxiv.org/pdf/2308.13137v3
    locator: "Table 1, p.7 表头（列序 1-7B / 1-13B / 1-30B / 1-65B / 2-7B / 2-13B / 2-70B；pdftotext 提取，仅去行首空白，抓取 2026-11-02）"
    quote: "LLaMA1&2 / PPL↓             1-7B     1-13B      1-30B     1-65B      2-7B      2-13B     2-70B"
    relation: supports
  - source: https://arxiv.org/pdf/2308.13137v3
    locator: "Table 1, p.7（逐通道 W2A16 块 RTN 行，1-13B 列为 6.8e4——笔记 RTN 值的出处；pdftotext 提取，抓取 2026-11-02）"
    quote: "RTN                  1.1e5     6.8e4      2.4e4    2.2e4      3.8e4      5.6e4    2.0e4"
    relation: supports
  - source: https://arxiv.org/pdf/2308.13137v3
    locator: "Table 1, p.7（逐通道 W2A16 块 GPTQ 行，1-13B 列为 5.5e3，非笔记的 44.01；pdftotext 提取，抓取 2026-11-02）"
    quote: "W2A16  GPTQ                 2.1e3     5.5e3     499.75    55.91      7.7e3      2.1e3    77.95"
    relation: supports
  - source: https://arxiv.org/pdf/2308.13137v3
    locator: "Table 1, p.7（逐通道 W2A16 块 OmniQuant 行，1-13B 列为 13.21，非笔记的 9.72；pdftotext 提取，抓取 2026-11-02）"
    quote: "OmniQuant           15.47      13.21       8.71     7.58     37.37      17.21      7.81"
    relation: supports
  - source: https://arxiv.org/pdf/2308.13137v3
    locator: "Table 1, p.7（W2A16g128 块 GPTQ 行，1-7B 列为 44.01——笔记 GPTQ 值的出处；pdftotext 提取，抓取 2026-11-02）"
    quote: "W2A16  GPTQ                 44.01     15.60      10.92     9.51      36.77      28.14    NAN"
    relation: supports
  - source: https://arxiv.org/pdf/2308.13137v3
    locator: "Table 1, p.7（W2A16g128 块 AWQ 行，1-7B 列为 2.6e5——笔记 AWQ 值的出处；pdftotext 提取，抓取 2026-11-02）"
    quote: "g128  AWQ                  2.6e5     2.8e5      2.4e5    7.4e4      2.2e5      1.2e5       -"
    relation: supports
  - source: https://arxiv.org/pdf/2308.13137v3
    locator: "Table 1, p.7（W2A16g128 块 OmniQuant 行，1-7B 列为 9.72——笔记 OmniQuant 值的出处；pdftotext 提取，抓取 2026-11-02）"
    quote: "OmniQuant            9.72       7.93       7.12     5.95     11.06       8.26      6.55"
    relation: supports
  - source: https://arxiv.org/pdf/2308.13137v1
    locator: "Table 1, p.7（W2A16g128 块 OmniQuant 行，v1 同位为 10.53——9.72 是 v3 camera-ready 更新值；pdftotext 提取，抓取 2026-11-02）"
    quote: "OmniQuant           10.53       8.37       7.77     6.35     12.84       9.15      7.82"
    relation: supports
  - source: library/Quantization/OmniQuant.md
    locator: "§4 / 实验 4 表格 / 显存占用行（2026-11-03 修正前历史记录；现行为 24.3 GB (WM) / 27.1 GB (RM)、节省 ~71%（WM 口径），无对应原文）"
    quote: "| **显存占用** | ~26 GB       | **7.0 GB**        | **节省 ~73%**  |"
    relation: supports
  - source: library/Quantization/OmniQuant.md
    locator: "§4 / 实验 4 表格 / 推理速度行（2026-11-03 修正前历史记录；现行为 52.5 tokens/s、加速约 1.74×，无对应原文）"
    quote: "| **推理速度** | ~40 tokens/s | **91.3 tokens/s** | **加速 > 2倍** |"
    relation: supports
  - source: https://arxiv.org/pdf/2308.13137v3
    locator: "Table 3, p.9（FP 行，13B 列为 WM 24.3G / RM 27.1G / 52.5 token/s；v1 同行一致且排版更清晰；pdftotext -raw 提取，抓取 2026-11-02）"
    quote: "FP 12.6G 14.4G 69.2 24.3G 27.1G 52.5 60.6G 66.1G 23.9 OOM - -"
    relation: supports
  - source: https://arxiv.org/pdf/2308.13137v3
    locator: "Table 3, p.9（W4A16g128 行，13B 列为 7.0G / 10.0G / 91.3，与笔记量化侧数字一致；pdftotext 提取，抓取 2026-11-02）"
    quote: "W4A16g128 3.8G 5.7G 134.2 7.0G 10.0G 91.3 16.7G 21.7G 43.6 33.0G 41.0G 24.3"
    relation: supports
  - source: nightshift/LOG.md
    locator: "05:19 行（调度班次记录）"
    quote: "05:19 | fire-now | OmniQuant 挖矿完成（3.0M token，4 张卡）| 产出 4 | validate OK(57→61 含 FCOS 在写) + index 重建 | ⚠ 笔记实验表混列 + FP16 基线不符 → mismatch 卡排队 + QUESTIONS。补槽 CaDDN。累计 37 任务 ≈122.2M；claim 库 → 57+"
    relation: supports
falsifiers:
  - "若逐格复核笔记与 arXiv v3 表格发现上述对应无误，则本卡不成立"
review_due: 2026-12-02
related: [claim-omniquant-w2a16g128-llama7b-ppl-beats-gptq-awq, claim-omniquant-w4a16g128-llama13b-a100-913toks, claim-omniquant-w4a4-llama7b-zeroshot-5265, claim-omniquant-let-lwc-ablation-w4a4-best]
signoff: null
---

## 这条主张是什么意思

本卡是笔记质量记录（asserted，单点事实、可逐格证伪）：OmniQuant 笔记 §4 实验 1 表头-数据列错配、实验 4 FP16 基线行与 ICLR 2024 camera-ready（arXiv v3）原表不符。本卡记录的是 2026-11-03 修正前的笔记状态；笔记已于 2026-11-03 修正，status 处置待主人。

## 当前状态（2026-11-03 笔记已修正）

- 实验 1 表头改为「LLaMA-1-7B W2A16g128」并补 RTN 1.9e3（GPTQ 44.01 / AWQ 2.6e5 / OmniQuant 9.72 三值不变，表后注记 13B 逐通道列原值与 v1/v3 差异）。
- 实验 4 FP16 基线改为 WM 24.3 GB / RM 27.1 GB / 52.5 tokens/s、加速约 1.74×、WM 口径节省 ~71%（量化侧 7.0 GB / 91.3 tokens/s 不变）。
- 修正依据：https://arxiv.org/pdf/2308.13137v3 Table 1 p.7 / Table 3 p.9，pdftotext 提取，2026-11-03 抓取逐格核对，与本卡 evidence 的 arXiv 引文一致。关联卡 [claim-omniquant-w4a16g128-llama13b-a100-913toks](claim-omniquant-w4a16g128-llama13b-a100-913toks.md) 的笔记 quote 已同步更新。
- 2026-11-05 本班复核：evidence 中 GPTQ / AWQ / OmniQuant 三条行 quote 修正后原样保留、逐字命中（现引文）；表头、RTN 行与实验 4 显存/速度两行为修正前历史记录（现笔记无对应原文，locator 已标注）。

## 历史记录（修正前笔记状态）

1. **实验 1 表头-数据列错配**：表头写「LLaMA-13B W2A16 PPL 对比」，但四个数字来自两个不同的列：RTN 6.8e4 是 **LLaMA-1-13B 逐通道 W2A16** 的值（Table 1 逐通道块 1-13B 列），而 GPTQ 44.01 / AWQ 2.6e5 / OmniQuant 9.72 是 **LLaMA-1-7B W2A16g128** 列的值——一张表混了两列。表头所指场景（13B 逐通道 W2A16）的论文值是 RTN 6.8e4 / GPTQ 5.5e3 / OmniQuant 13.21，只有 RTN 抄对了。另注意 9.72 是 v3 camera-ready 更新值，v1 同位为 10.53。此归因与既有卡 [W2A16g128 主卡](claim-omniquant-w2a16g128-llama7b-ppl-beats-gptq-awq.md) 一致。
2. **实验 4 FP16 基线行与原表不符**：笔记 FP16 基线「~26 GB / ~40 tokens/s / 加速 > 2倍」，论文 Table 3 FP 行 13B 列为 WM 24.3 GB / RM 27.1 GB / 52.5 tokens/s（v1 与 v3 同表）：~26 GB 介于 WM 与 RM 之间属含糊取整；~40 tokens/s 与「>2 倍」为笔记自算误差——同口径实际加速 91.3/52.5 ≈ 1.74×，显存节省按 WM 口径约 71%（(24.3−7.0)/24.3）。量化侧 7.0 GB / 91.3 tokens/s 与原表一致，问题只在基线行。此结论与既有卡 [部署卡](claim-omniquant-w4a16g128-llama13b-a100-913toks.md) 一致。

nightshift/LOG.md 05:19 的调度班次记录（「笔记实验表混列 + FP16 基线不符」）与上述判断一致。当时结论「引用笔记实验 1 / 实验 4 的任何基线数字前一律回论文原表核对（与 EMC2 mismatch 卡同款教训）」针对修正前转录；修正后笔记可直接引用，重要数字仍建议对照原表。

## 证据支持到哪里

- 笔记侧 7 条 quote：4 条历史记录（表头 / RTN 行 / 显存行 / 速度行）、3 条现引文（GPTQ / AWQ / OmniQuant 行，2026-11-05 复核命中）。
- 论文侧 8 条 arXiv 引文（v3 Table 1 / Table 3 与 v1 版本差对照）locator 均带抓取日期 2026-11-02，本班未重复实抓；LOG 引文为调度班次在案记录（现引文，2026-11-05 复核命中）。

## 待决事项（登记）

- 人工复核是本卡的最终裁决（见 falsifiers）：用户逐格复核修正后笔记与 arXiv v3 Table 1 / Table 3；若存在某版本其表格与修正前笔记一致，则按 falsifier 改判并在笔记标注版本号（当前 v1/v3 双版本核对均不支持修正前笔记）。
- 修正时「实验 1 统一为 7B g128 口径并补 RTN 1.9e3」是两种可行方案之一（另一方案为换用 13B 逐通道列原值 6.8e4 / 5.5e3 / 13.21，未采用）；是否需要两种口径并列呈现，由主人决定。
- 本卡 status 处置（保留为笔记质量历史记录 / 转 stale）由主人裁定。

## 核查记录

- 立卡（论文侧抓取 2026-11-02；LOG 05:19「mismatch 卡排队」在案）：发现两处不一致，立卡。
- 2026-11-03：笔记两处修正；本卡 status 与既有 evidence 未动。
- 2026-11-05：本班表达整理与历史/当前分层（数字未改写）；Grep 复核笔记侧 7 条 quote（4 历史 + 3 现引文）与 LOG 引文（命中）。
