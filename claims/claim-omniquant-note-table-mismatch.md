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
    locator: "§4 / 实验 1 表头"
    quote: "**表格：LLaMA-13B W2A16 PPL 对比**"
    relation: supports
  - source: library/Quantization/OmniQuant.md
    locator: "§4 / 实验 1 / RTN 行"
    quote: "| **RTN**       | 6.8e4 (68000+)      | **完全失效**，输出乱码   |"
    relation: supports
  - source: library/Quantization/OmniQuant.md
    locator: "§4 / 实验 1 / GPTQ 行"
    quote: "| **GPTQ**      | 44.01               | **不可用**，精度损失巨大 |"
    relation: supports
  - source: library/Quantization/OmniQuant.md
    locator: "§4 / 实验 1 / AWQ 行"
    quote: "| **AWQ**       | 2.6e5               | **失效**                 |"
    relation: supports
  - source: library/Quantization/OmniQuant.md
    locator: "§4 / 实验 1 / OmniQuant 行"
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
    locator: "§4 / 实验 4 表格 / 显存占用行"
    quote: "| **显存占用** | ~26 GB       | **7.0 GB**        | **节省 ~73%**  |"
    relation: supports
  - source: library/Quantization/OmniQuant.md
    locator: "§4 / 实验 4 表格 / 推理速度行"
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

## 我的理解

笔记 §4 有两处表格与 ICLR 2024 camera-ready（arXiv v3，本次抓取逐格核对，v1 用于版本差核对）不一致，均为单点事实、可逐格证伪：

1. **实验 1 表头-数据列错配**：表头写「LLaMA-13B W2A16 PPL 对比」，但四个数字来自两个不同的列：RTN 6.8e4 是 **LLaMA-1-13B 逐通道 W2A16** 的值（Table 1 逐通道块 1-13B 列），而 GPTQ 44.01 / AWQ 2.6e5 / OmniQuant 9.72 是 **LLaMA-1-7B W2A16g128** 列的值——一张表混了两列。表头所指场景（13B 逐通道 W2A16）的论文值是 RTN 6.8e4 / GPTQ 5.5e3 / OmniQuant 13.21，只有 RTN 抄对了。另注意 9.72 是 v3 camera-ready 更新值，v1 同位为 10.53。此归因与既有卡 [W2A16g128 主卡](claim-omniquant-w2a16g128-llama7b-ppl-beats-gptq-awq.md) 一致。
2. **实验 4 FP16 基线行与原表不符**：笔记 FP16 基线「~26 GB / ~40 tokens/s / 加速 > 2倍」，论文 Table 3 FP 行 13B 列为 WM 24.3 GB / RM 27.1 GB / 52.5 tokens/s（v1 与 v3 同表）：~26 GB 介于 WM 与 RM 之间属含糊取整；~40 tokens/s 与「>2 倍」为笔记自算误差——同口径实际加速 91.3/52.5 ≈ 1.74×，显存节省按 WM 口径约 71%（(24.3−7.0)/24.3）。量化侧 7.0 GB / 91.3 tokens/s 与原表一致，问题只在基线行。此结论与既有卡 [部署卡](claim-omniquant-w4a16g128-llama13b-a100-913toks.md) 一致。

结论：引用笔记实验 1 / 实验 4 的任何基线数字前，一律回论文原表核对（与 EMC2 mismatch 卡同款教训）。修复笔记属 `library/`，须用户同意后进行，本卡不改。nightshift/LOG.md 05:19 的调度班次记录（「笔记实验表混列 + FP16 基线不符」）与本判断一致。

## 待验证

- 用户逐格复核笔记实验 1 / 实验 4 与 arXiv v3 Table 1 / Table 3（人工复核是本卡的最终裁决，见 falsifiers）。
- 确认笔记写作时依据的论文版本：若存在某版本其表格与笔记完全一致，则属版本差异，按 falsifier 改判并在笔记标注版本号。
- 修复方案（经用户同意）：实验 1 表头改为「LLaMA-1-7B W2A16g128」并补 RTN 1.9e3（或换用 13B 逐通道列原值 6.8e4 / 5.5e3 / 13.21）；实验 4 FP16 基线改为 WM 24.3 GB / RM 27.1 GB / 52.5 tokens/s、加速约 1.74×、WM 口径节省约 71%。
- **2026-11-03 笔记已修正**（本次修正依据：https://arxiv.org/pdf/2308.13137v3 Table 1 p.7 / Table 3 p.9，pdftotext 提取，2026-11-03 抓取逐格核对，与本卡 evidence 引文一致）：实验 1 表头改为「LLaMA-1-7B W2A16g128」并补 RTN 1.9e3（GPTQ 44.01 / AWQ 2.6e5 / OmniQuant 9.72 三值不变，表后注记 13B 逐通道列原值与 v1/v3 差异）；实验 4 FP16 基线改为 WM 24.3 GB / RM 27.1 GB / 52.5 tokens/s、加速约 1.74×、WM 口径节省 ~71%（量化侧 7.0 GB / 91.3 tokens/s 不变）。关联卡 claim-omniquant-w4a16g128-llama13b-a100-913toks 的笔记 quote 已同步更新。本卡 status 与既有 evidence 未动（其中笔记 quote 为修正前历史记录）。

## 若成立 / 不成立意味着什么

成立：笔记这两处表格的基线数字不可直接引用，引用须回论文原表；4 张 OmniQuant 卡不受影响（w2a16g128 与 w4a16g128 卡已在各自 scope/正文注明归因修正，且数字以论文原表为准）。
不成立：逐格复核确认笔记与 v3 一致，说明本卡核对有误或另有版本差异，改判/撤卡并在笔记标注版本号。
