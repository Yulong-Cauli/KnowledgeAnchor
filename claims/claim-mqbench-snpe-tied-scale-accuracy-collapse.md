---
id: claim-mqbench-snpe-tied-scale-accuracy-collapse
title: "MQBench 声称：统一评测协议下，SNPE(DSP) 强图约束（强制绑定 Scale）使大部分 QAT 算法精度断崖式暴跌，而学术图下各算法表现极好、TensorRT 仅轻微掉点"
type: claim
status: asserted
scope: "MQBench 统一评测协议（相同超参搜索与数据增强）下的 QAT 算法对比；三种计算图约束：Academic / TensorRT / SNPE(DSP)；笔记未记录具体数据集、模型清单与比特宽度（笔记另记 4-bit 测试见 §5.4，与本条分开）"
tags: [quantization, benchmark, mqbench, qat, tensorrt, snpe, deployment]
note: library/Quantization/MQBench.md#实验部分
paper: "NeurIPS 2021, MQBench（笔记未记录完整论文标题；代码 https://github.com/ModelTC/MQBench）"
stance: watch
evidence:
  - source: library/Quantization/MQBench.md
    locator: "§实验部分 / 5.2"
    quote: "在学术图（Academic）下各算法均表现极好，但在 TensorRT 中会有轻微掉点。而一旦切入 SNPE (DSP) 的强图约束（强制绑定 Scale），大部分算法精度发生断崖式暴跌。证明了脱离硬件谈量化毫无意义。"
    relation: supports
falsifiers:
  - "在统一协议下复现：SNPE 强图约束（Add 前双分支 INT8 且 Scale 绑定一致）中大部分算法掉点很小（如 <1%），并非断崖式暴跌"
  - "学术图下各算法之间差距依然巨大，'拉齐协议后差距缩小'不成立"
  - "论文实验并未在同一组算法/数据集上同时跑三种图约束，断崖结论来自不同实验的横向拼接"
review_due: 2026-12-02
related: [claim-mqbench-three-hardware-graph-settings, claim-mqbench-first-hardware-aligned-quant-benchmark]
signoff: null
---

## 我的理解

论文声称在其"绝对公平"（统一超参搜索、数据增强）赛场上得到分层结论：学术图下各算法都很好 → TensorRT 图约束轻微掉点 → SNPE(DSP) 强图约束下大部分算法断崖式暴跌，以此论证"脱离硬件谈量化毫无意义"。这是论文的实验性主张，尚未独立验证。

注意"大部分算法""断崖式"是笔记转述的定性表述，笔记未记录具体掉点数字与受影响算法名单；引用时只能作为方向性结论，不能当作量化数字。

## 待验证

- 从论文原文/仓库取 5.2 对应表格：记录每个算法在 Academic / TensorRT / SNPE 三档下的具体精度，确认"大部分算法断崖"的算法数占比与掉点幅度。
- 选 1-2 个开源算法按 SNPE 强图约束（Scale 绑定）复训，验证掉点量级。
- 确认实验是否同数据集、同比特宽度下三档可比（笔记未记录这些条件）。

## 若成立 / 不成立意味着什么

成立：任何只报学术设定精度的 QAT 论文对 DSP 类端侧目标无参考价值；选型必须先在目标硬件图约束下重测，SNPE 档可作为强过滤条件。
不成立：断崖主要由个别算法或协议不公造成，学术设定精度仍可作为端侧部署的粗筛指标，MQBench 的硬件约束强调被高估。
