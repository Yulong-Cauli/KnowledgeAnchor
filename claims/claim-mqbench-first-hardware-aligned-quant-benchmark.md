---
id: claim-mqbench-first-hardware-aligned-quant-benchmark
title: "MQBench 声称自己是首个面向工业落地、确保训练与部署完全一致的模型量化基准框架"
type: claim
status: asserted
scope: "MQBench（NeurIPS 2021，PyTorch QAT/PTQ 评测框架，开源 https://github.com/ModelTC/MQBench）；对比对象为学术界不拉齐硬件约束的量化评测惯例；笔记未记录论文实验的具体数据集/模型清单"
tags: [quantization, benchmark, mqbench, qat, ptq, deployment]
note: library/Quantization/MQBench.md#1-概述
paper: "NeurIPS 2021, MQBench（笔记未记录完整论文标题；代码 https://github.com/ModelTC/MQBench）"
stance: watch
evidence:
  - source: library/Quantization/MQBench.md
    locator: "§1 / 概述"
    quote: "是**首个真正面向工业级落地、确保训练与部署完全一致的模型量化基准测试框架**。"
    relation: supports
  - source: library/Quantization/MQBench.md
    locator: "§1 / 概述"
    quote: "在软件层面拉齐了评价标准（统一数据增强、超参搜索）；在硬件层面强制对齐真实算子和计算图约束。"
    relation: supports
falsifiers:
  - "找到早于 MQBench（NeurIPS 2021）公开发布、且同样在评测中强制对齐部署硬件计算图约束的模型量化基准框架"
  - "MQBench 开源仓库中不存在对齐真实算子/计算图约束的实现（仅有软件侧统一协议），'硬件层面强制对齐'不成立"
  - "论文正文没有给出'训练与部署一致'的可检验机制（如训练图与部署图逐节点等价性说明），仅停留在口号"
review_due: 2026-12-02
related: [claim-mqbench-three-hardware-graph-settings, claim-ptqat-w8a8-tensorrt-accuracy-recovery]
signoff: null
---

## 我的理解

论文声称 MQBench 在两个层面拉齐量化评测：软件层面统一数据增强与超参搜索，硬件层面强制对齐真实算子与计算图约束，并自称是"首个"做到训练-部署完全一致的量化基准。这是优先权（priority）+ 工具覆盖范围类主张，范围来自论文描述。

笔记只记录了结论性表述，未记录论文如何操作化"训练与部署完全一致"（如是否逐算子核对伪量化与真量化数学等价）；笔记 §2.1/§2.2/§2.3 展示的三类对齐机制可作为该主张的具体化证据，但均为笔记转述。

## 待验证

- 查 MQBench 论文原文（NeurIPS 2021）与 GitHub 仓库：确认是否实现硬件算子/计算图约束对齐，以及对比了哪些此前的量化 benchmark。
- 检索 2021 年前是否已有强制对齐部署图的量化评测工作（若存在则"首个"被推翻）。
- 核对笔记转述的"首个"是否为论文原文措辞还是笔记作者的概括。

## 若成立 / 不成立意味着什么

成立：做量化选型/评测时应以 MQBench 式"硬件图约束对齐"协议为准，学术设定下领先的算法不能直接采信。
不成立："首个"只是宣传性措辞，或硬件对齐并未真正落地到框架实现，引用时降级为"论文自称为首个"，评测协议需另行核实。
