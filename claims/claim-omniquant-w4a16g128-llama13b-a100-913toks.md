---
id: claim-omniquant-w4a16g128-llama13b-a100-913toks
title: "OmniQuant 论文自报：LLaMA-13B W4A16g128 经 MLC-LLM 部署在 A100-80G 上，量化权重显存 7.0 GB、512-token 生成吞吐 91.3 tokens/s"
type: claim
status: asserted
scope: "LLaMA-13B（camera-ready Table 3 表头仅写 LLaMA，未细分 1/2 代）；W4A16g128（128 分组 weight-only，非逐通道）；NVIDIA A100-80G；MLC-LLM 部署；WM 为量化权重存储 7.0 GB、RM 为运行显存 10.0 GB；吞吐为生成 512 tokens 的平均速度 91.3 tokens/s，未报告批大小与 P99；FP16 基线（同表）WM 24.3 GB / RM 27.1 GB / 52.5 tokens/s——笔记记的基线 ~26 GB、~40 tokens/s、加速 >2 倍与原表不符（实际加速约 1.74 倍）；数字为论文自报"
tags: [quantization, ptq, omniquant, llm, w4a16, deployment, a100, mlc-llm]
note: library/Quantization/OmniQuant.md#4-实验与分析-experiments
paper: "ICLR 2024, OmniQuant: Omnidirectionally Calibrated Quantization for Large Language Models (arXiv:2308.13137)"
stance: watch
evidence:
  - source: library/Quantization/OmniQuant.md
    locator: "§4 / 实验 4：真实推理加速"
    quote: "| **显存占用** | 24.3 GB (WM) / 27.1 GB (RM) | **7.0 GB** | **节省 ~71%（WM 口径）** |"
    relation: supports
  - source: library/Quantization/OmniQuant.md
    locator: "§4 / 实验 4：真实推理加速"
    quote: "| **推理速度** | 52.5 tokens/s | **91.3 tokens/s** | **加速约 1.74×** |"
    relation: supports
  - source: https://arxiv.org/pdf/2308.13137v3
    locator: "Table 3, p.9（W4A16g128 行，13B 列为 WM 7.0G / RM 10.0G / 91.3；pdftotext 提取，抓取 2026-11-02）"
    quote: "W4A16g128 3.8G 5.7G 134.2 7.0G 10.0G 91.3 16.7G 21.7G 43.6 33.0G 41.0G 24.3"
    relation: supports
  - source: https://arxiv.org/pdf/2308.13137v1
    locator: "Table 3, p.9（FP 行，13B 列为 WM 24.3G / RM 27.1G / 52.5 token/s；v1 表与 v3 一致且排版更清晰；pdftotext 提取，抓取 2026-11-02）"
    quote: "FP    12.6G 14.4G 69.2 24.3G 27.1G 52.5 60.6G 66.1G 23.9 OOM -       -"
    relation: supports
falsifiers:
  - "同范围复现（主张侧）：复现中 LLaMA-13B W4A16g128 的量化权重显存显著高于 7.0 GB，或 512-token 生成吞吐显著低于 91.3 tokens/s"
  - "同范围复现（主张侧，部署前提）：推理需要额外算子或结构改动（LET/LWC 参数融合的零成本推理不成立），或量化权重无法被 MLC-LLM 直接加载"
  - "跨条件迁移（不充当原范围反证）：加速效果依赖特定 MLC-LLM 版本/内核，换用其他推理引擎（TensorRT-LLM / vLLM / llama.cpp）后相对 FP16 的加速比显著缩水（论文口径约 1.74 倍），但不直接证伪本卡 MLC-LLM/A100 范围内的主张"
review_due: 2026-12-02
related: [claim-omniquant-w4a4-llama7b-zeroshot-5265, claim-qwt-r2-gate-nonregression]
signoff: null
---

## 我的理解

> 修订注记 2026-11-03：笔记实验 4 的 FP16 基线行已按论文原表修正——修正前「~26 GB / ~40 tokens/s / 加速 > 2倍」，修正后「WM 24.3 GB / RM 27.1 GB / 52.5 tokens/s、加速约 1.74×、WM 口径节省 ~71%」，与本卡 scope 既有描述（同表 FP 行 24.3/27.1/52.5、实际加速约 1.74 倍）一致；本卡 evidence 中笔记两行 quote 已同步更新。修正依据：https://arxiv.org/pdf/2308.13137v3 Table 3 p.9（pdftotext 提取，2026-11-03 抓取核对，与本卡下方论文引文一致）。量化侧 7.0 GB / 91.3 tokens/s 未变，本卡主张与 status 不受影响。

论文声称（asserted）：LLaMA-13B 经 W4A16g128 量化并完成参数融合（LET 吸收进 LayerNorm、LWC 融合进权重，推理零额外算子）后，用 MLC-LLM 部署在 NVIDIA A100-80G 上：量化权重存储 (WM) 7.0 GB（运行显存 RM 10.0 GB），512-token 生成吞吐 91.3 tokens/s。

两个必须记住的限定：

1. **笔记的 FP16 基线与原表不符**：camera-ready Table 3（v1 与 v3 相同，本次均抓取核对）中 13B FP16 为 WM 24.3 GB / RM 27.1 GB / 52.5 tokens/s；笔记记的「~26 GB / ~40 tokens/s / 加速 > 2 倍」中，~26 GB 介于 WM 与 RM 之间属含糊取整，~40 tokens/s 与 >2 倍加速是笔记自算误差——同口径实际加速约 1.74 倍（91.3/52.5），显存节省约 71%（WM 口径）。本卡主张只取与原表一致的 7.0 GB 与 91.3 tokens/s。
2. **配置是 W4A16g128**（128 分组），部署表只测了 weight-only：论文 §4.5 明确 W4A4/W6A6 缺少开箱即用硬件支持，未部署。吞吐是生成 512 tokens 的平均速度，无批大小与尾延迟信息；引用时不能当作任何负载下的延迟上界（同 [EMC2 卡的平均延迟教训](claim-emc2-orin-sub400ms-leading-accuracy.md)）。校准数据口径同其他卡（WikiText2 128 段，见 [QwT 核验的口径教训](claim-qwt-r2-gate-nonregression.md)）。

PDF 引文为 pdftotext -layout 提取（仅去行首空白）。原始笔记见 [OmniQuant](../library/Quantization/OmniQuant.md#4-实验与分析-experiments)。

## 待验证

- 用官方仓库产出 W4A16g128 权重并以 MLC-LLM 在 A100-80G 复测 WM/RM 与吞吐，核对 7.0 GB / 91.3 tokens/s 及 FP16 基线 52.5 tokens/s。
- 换推理引擎（TensorRT-LLM / vLLM / llama.cpp）复测，确认加速不依赖 MLC-LLM 特定内核。
- 补测批大小 >1 与长上下文下的吞吐与显存，给出尾延迟。

## 若成立 / 不成立意味着什么

成立：LLaMA-13B W4A16g128 + MLC-LLM / A100-80G 场景下，参数融合式 PTQ 零开销兑现显存与吞吐收益，该配置的部署选型可引用（按约 1.74 倍而非 >2 倍报告收益；精度侧见 [W4A4 主表卡](claim-omniquant-w4a4-llama7b-zeroshot-5265.md)）。换推理引擎或批大小 >1、长上下文负载下的收益是跨条件迁移检查（见 falsifier 3），不能由本卡直接外推。
不成立：该场景加速依赖论文自报口径或 MLC-LLM 特定实现，部署收益需按实际栈重新实测后再进方案。

## 核查记录

- 2026-11-03：笔记实验 4 FP16 基线行修正后本卡同步更新（见顶部修订注记）。
- 2026-11-05（02 任务书整理班 P1-B2b）：2 条笔记 quote Grep 逐字命中笔记当前版；PDF 引文抓取日期在案（2026-11-02）未重抓。本轮为表达整理：falsifiers 补分层标注、成立/不成立段约束回 scope 配置；数字未改写。
