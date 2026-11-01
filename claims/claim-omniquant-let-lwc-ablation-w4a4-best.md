---
id: claim-omniquant-let-lwc-ablation-w4a4-best
title: "OmniQuant 论文自报消融：LLaMA-7B W4A4 下 LET+LWC 组合平均 PPL 12.87，低于任一单组件变体（仅 LET 16.97 / SmoothQuant+LWC 15.80）"
type: claim
status: asserted
scope: "LLaMA-7B（LLaMA-1）；W4A4；PPL 为 WikiText2 与 C4 困惑度的平均值（camera-ready Table A2 口径，笔记仅记 PPL）；SmoothQuant 基准 28.78；笔记的「仅加 LWC」对应原表 SmoothQuant+LWC 行（15.80），另有 LET+网格搜索 WC 变体（15.82）；校准数据为取自 WikiText2 的 128 段 2048-token 文本（§4.1）；数字为论文自报消融；尚未独立验证"
tags: [quantization, ptq, omniquant, llm, w4a4, ablation]
note: library/Quantization/OmniQuant.md#4-实验与分析-experiments
paper: "ICLR 2024, OmniQuant: Omnidirectionally Calibrated Quantization for Large Language Models (arXiv:2308.13137)"
stance: watch
evidence:
  - source: library/Quantization/OmniQuant.md
    locator: "§4 / 实验 3：消融实验"
    quote: "| **SmoothQuant (基准)**    | 28.78        | 效果差                              |"
    relation: supports
  - source: library/Quantization/OmniQuant.md
    locator: "§4 / 实验 3：消融实验"
    quote: "| **仅加 LET**              | 16.97        | **提升巨大**，说明 LET 对 W4A4 关键 |"
    relation: supports
  - source: library/Quantization/OmniQuant.md
    locator: "§4 / 实验 3：消融实验"
    quote: "| **仅加 LWC**              | 15.80        | 有提升                              |"
    relation: supports
  - source: library/Quantization/OmniQuant.md
    locator: "§4 / 实验 3：消融实验"
    quote: "| **OmniQuant (LET + LWC)** | **12.87**    | **1+1 > 2**，两者协同效果最好       |"
    relation: supports
  - source: https://arxiv.org/pdf/2308.13137v3
    locator: "Table A2, p.14（SmoothQuant 行；pdftotext 提取，抓取 2026-11-02）"
    quote: "SmoothQuant                      28.78              38.41"
    relation: supports
  - source: https://arxiv.org/pdf/2308.13137v3
    locator: "Table A2, p.14（LET 行；pdftotext 提取，抓取 2026-11-02）"
    quote: "LET                              16.97              48.83"
    relation: supports
  - source: https://arxiv.org/pdf/2308.13137v3
    locator: "Table A2, p.14（SmoothQuant + LWC 行；pdftotext 提取，抓取 2026-11-02）"
    quote: "SmoothQuant + LWC                15.80              50.15"
    relation: supports
  - source: https://arxiv.org/pdf/2308.13137v3
    locator: "Table A2, p.14（LET + LWC 行；pdftotext 提取，抓取 2026-11-02）"
    quote: "LET + LWC                        12.87              52.65"
    relation: supports
falsifiers:
  - "按官方实现复现四个变体（SmoothQuant / LET / SmoothQuant+LWC / LET+LWC）时，LET+LWC 的平均 PPL 高于 16.97 或 15.80 任一单组件变体，即组合无协同"
  - "改用 WikiText2 单项 PPL 或 C4 单项 PPL（非平均口径）复算后排序反转，即结论依赖平均口径"
  - "在非 LLaMA 模型（OPT / Falcon）或更小模型上 LET+LWC 组合不再优于单组件，即协同只在 LLaMA-7B 成立"
review_due: 2026-12-02
related: [claim-omniquant-w4a4-llama7b-zeroshot-5265]
signoff: null
---

## 我的理解

论文声称（asserted，尚未独立验证）：LLaMA-7B W4A4 消融中，LET+LWC 组合的平均 PPL 12.87 低于任何单一组件变体——仅 LET 16.97、SmoothQuant+LWC 15.80（另有 LET+网格搜索 WC 15.82），SmoothQuant 基准 28.78；组合的平均准确率 52.65% 与 [W4A4 主表卡](claim-omniquant-w4a4-llama7b-zeroshot-5265.md) 的数字互证。论文对机制的解释是 LET（激活到权重的难度迁移）与 LWC（压制变大后的权重）在可微框架内协同，非简单叠加。

三个必须记住的限定：

1. **PPL 是双数据集平均**：camera-ready Table A2 的 PPL 是 WikiText2 与 C4 困惑度的平均值；LLaMA-7B W4A4 的 WikiText2 单项约 11.23（Table A9/A10）。笔记只写「PPL」，引用时勿当成 WikiText2 单项。
2. **行名与笔记不完全对应**：笔记「仅加 LWC」对应原表「SmoothQuant + LWC」行（SmoothQuant 缩放初始化 + 可学习裁剪），「仅加 LET」对应原表「LET」行；原表还有笔记未收录的「LET + grid-searched WC」15.82。数字本身逐格核对一致。
3. 消融基线与变体共用同一校准数据（WikiText2 128 段，§4.1），结论是「同校准预算下的组件贡献排序」，不涉及校准集规模/域的鲁棒性（后者见 Table A10/A11，同样未独立验证）。

PDF 引文为 pdftotext -layout 提取（仅去行首空白）。原始笔记见 [OmniQuant](../library/Quantization/OmniQuant.md#4-实验与分析-experiments)。

## 待验证

- 用官方仓库跑 Table A2 的四个变体，核对平均 PPL 排序与 12.87 / 16.97 / 15.80 / 28.78。
- 分别用 WikiText2 单项与 C4 单项 PPL 复算排序，确认不依赖平均口径。
- 记录各变体训练曲线，检验「同时优化优于交替优化」（Table A8）是否可复现。

## 若成立 / 不成立意味着什么

成立：W4A4 场景下 LWC 与 LET 需同时启用才能拿到最优精度，落地配置不能只取其一（与 [W4A4 主表卡](claim-omniquant-w4a4-llama7b-zeroshot-5265.md) 联合构成选型依据）。
不成立：组合增益是特定初始化/超参的产物，可按模块单独启用以降低优化成本，LET+LWC 协同主张撤回。
