---
id: claim-omniquant-w2a16g128-llama7b-ppl-beats-gptq-awq
title: "OmniQuant 论文自报：LLaMA-1-7B W2A16g128 下 WikiText2 PPL 9.72，远低于失效级基线 GPTQ (44.01) 与 AWQ (2.6e5)"
type: claim
status: asserted
scope: "LLaMA-1-7B；W2A16g128（2-bit 权重、16-bit 激活、128 分组权重；激活 per-token，Softmax 输出保持 16-bit）；WikiText2 PPL（camera-ready Table 1 口径）；校准数据为取自 WikiText2 的 128 段 2048-token 文本（论文 §4.1，未明说训练/测试 split），与评测集同语料，存在同源乐观风险；数字为论文自报，并按 ICLR 2024 camera-ready（arXiv v3）归因——笔记表头误标为 LLaMA-13B W2A16；尚未独立验证"
tags: [quantization, ptq, omniquant, llm, w2a16, weight-only]
note: library/Quantization/OmniQuant.md#4-实验与分析-experiments
paper: "ICLR 2024, OmniQuant: Omnidirectionally Calibrated Quantization for Large Language Models (arXiv:2308.13137)"
stance: watch
evidence:
  - source: library/Quantization/OmniQuant.md
    locator: "§4 / 实验 1：W2A16（笔记表头已于 2026-11-03 修正为 LLaMA-1-7B W2A16g128；修正前标 LLaMA-13B）"
    quote: "| **GPTQ**      | 44.01               | **不可用**，精度损失巨大 |"
    relation: supports
  - source: library/Quantization/OmniQuant.md
    locator: "§4 / 实验 1：W2A16"
    quote: "| **AWQ**       | 2.6e5               | **失效**                 |"
    relation: supports
  - source: library/Quantization/OmniQuant.md
    locator: "§4 / 实验 1：W2A16"
    quote: "| **OmniQuant** | **9.72**            | **可用**，接近实用水平   |"
    relation: supports
  - source: https://arxiv.org/pdf/2308.13137v3
    locator: "Table 1, p.7（W2A16g128 块 GPTQ 行，LLaMA-1-7B 列；pdftotext 提取，抓取 2026-11-02）"
    quote: "W2A16  GPTQ                 44.01     15.60      10.92     9.51      36.77      28.14    NAN"
    relation: supports
  - source: https://arxiv.org/pdf/2308.13137v3
    locator: "Table 1, p.7（W2A16g128 块 AWQ 行，LLaMA-1-7B 列；pdftotext 提取，抓取 2026-11-02）"
    quote: "g128  AWQ                  2.6e5     2.8e5      2.4e5    7.4e4      2.2e5      1.2e5       -"
    relation: supports
  - source: https://arxiv.org/pdf/2308.13137v3
    locator: "Table 1, p.7（W2A16g128 块 OmniQuant 行，LLaMA-1-7B 列；pdftotext 提取，抓取 2026-11-02）"
    quote: "OmniQuant            9.72       7.93       7.12     5.95     11.06       8.26      6.55"
    relation: supports
falsifiers:
  - "同范围复现（主张侧）：官方开源实现同校准设置（128 段 WikiText2、40 epochs）复现中，LLaMA-1-7B W2A16g128 的 OmniQuant WikiText2 PPL 显著高于 9.72，或与 GPTQ (44.01) 的差距消失/反转"
  - "同范围复现（对照侧）：复现中 GPTQ 或 AWQ 在 W2A16g128 下达到可用精度（预设阈值如 PPL < 15，无原文锚点，待定），推翻基线失效的对比前提"
  - "跨条件迁移（不充当原范围反证）：笔记表头所指场景（LLaMA-1-13B 逐通道 W2A16，camera-ready Table 1 为 OmniQuant 13.21 vs GPTQ 5.5e3）复现中 OmniQuant 不再显著优于 GPTQ，则 2-bit 极限场景可用的强解读不成立，但不直接证伪本卡 LLaMA-1-7B W2A16g128 范围内的主张"
  - "口径检查（同范围）：证实校准集与评测集（WikiText2）同语料带来的乐观偏差大到改变方法排序"
review_due: 2026-12-02
related: [claim-omniquant-w4a4-llama7b-zeroshot-5265, claim-qwt-r2-gate-nonregression]
signoff: null
---

## 我的理解

> 修订注记（2026-11-03）：OmniQuant 笔记实验 1 表头已按 camera-ready 归因修正为「LLaMA-1-7B W2A16g128」并补 RTN 1.9e3（GPTQ 44.01 / AWQ 2.6e5 / OmniQuant 9.72 三值不变，本卡三条笔记 quote 逐字仍有效），本卡 evidence 第一条 locator 的过期括注（「笔记表头标 LLaMA-13B」）已同步更新。修正依据与过程见 [笔记表格错位卡](claim-omniquant-note-table-mismatch.md)；限定 1 中「笔记表格待修正」至此完成，其余描述按历史记录保留。本卡主张、scope 与 status 不变。

论文声称（asserted，尚未独立验证）：在 2-bit 权重、128 分组的 W2A16g128 设置下，OmniQuant 把 LLaMA-1-7B 的 WikiText2 PPL 做到 9.72，而 GPTQ (44.01) 与 AWQ (2.6e5) 均失效、RTN 完全乱码——即极低比特 weight-only 场景中，可学习裁剪阈值（LWC）相对手工规则有数量级优势。

两个必须记住的限定：

1. **笔记表头归因有误**：笔记表格写的是「LLaMA-13B W2A16 PPL 对比」，但与 ICLR 2024 camera-ready（arXiv v3 Table 1, p.7，本次抓取逐格核对）比对，44.01 / 2.6e5 / 9.72 三个数字实际属于 **LLaMA-1-7B W2A16g128** 列；LLaMA-1-13B 逐通道 W2A16 的论文数字是 RTN 6.8e4 / GPTQ 5.5e3 / OmniQuant 13.21（笔记只抄对了 RTN 6.8e4；论文引言 prose 里的 13.21 与 Table 1 一致）。本卡按 camera-ready 归因立卡；笔记表格待修正（属 `library/`，本卡不改）。v1 中该列 OmniQuant 为 10.53，9.72 是 camera-ready 更新值。
2. **校准与评测同语料**：校准数据是取自 WikiText2 的 128 段 2048-token 文本（§4.1），而本卡数字正是 WikiText2 PPL；论文未明说校准段是否取自训练 split。同源乐观风险的教训参照 [QwT R² 门控核验](claim-qwt-r2-gate-nonregression.md)（校准集 vs 测试集口径）。

PDF 引文为 pdftotext -layout 提取（仅去行首空白）。原始笔记见 [OmniQuant](../library/Quantization/OmniQuant.md#4-实验与分析-experiments)。

## 待验证

- 用官方仓库 https://github.com/OpenGVLab/OmniQuant 复现 LLaMA-1-7B W2A16g128（128 段校准、40 epochs），核对 WikiText2 PPL 约为 9.72，且 GPTQ/AWQ 基线复现值同量级。
- 复现 LLaMA-1-13B 逐通道 W2A16，确认 13.21 vs 5.5e3 的量级差距（笔记表头所指场景）。
- 换非 WikiText2 域校准数据（C4 / Pile / 中文语料），观察排序是否保持（论文 Table A10 只报告了校准域变化下 PPL 方差 0.0006–0.17，但均在 LLaMA-7B W3A16/W4A4，未覆盖 W2A16）。

## 若成立 / 不成立意味着什么

成立：LLaMA-1-7B W2A16g128、同校准设置下，可学习量化参数路线（OmniQuant）相对 GPTQ/AWQ 有数量级优势，该场景的极端压缩选型可参考（需先确认 scope 中同源校准风险不改变结论）。其他模型或其他 2-bit 设置是否同样占优，属跨条件迁移检查（见 falsifier 3），不能由本卡直接外推。
不成立：LLaMA-1-7B W2A16g128 的优势依赖论文自报口径或同源校准，该场景选型回退到 3/4-bit 分组量化 + GPTQ/AWQ 方案。

## 核查记录

- 2026-11-03：笔记实验 1 表头归因修正后本卡同步更新（见顶部修订注记）。
- 2026-11-05（02 任务书整理班 P1-B2b）：3 条笔记 quote Grep 逐字命中笔记当前版；PDF 引文抓取日期在案（2026-11-02）未重抓。本轮为表达整理：falsifiers 补分层标注（对照侧复现阈值标注为预设待定）、成立/不成立段约束回 scope 配置；数字未改写。
