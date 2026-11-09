---
id: claim-mqbench-three-hardware-graph-settings
title: "MQBench 声称其量化计算图约束覆盖学术设定、TensorRT 式推理引擎与 SNPE 式低功耗 DSP 三类硬件设定"
type: claim
status: asserted
scope: "PyTorch 伪量化 QAT/PTQ 计算图；以残差结构（Conv+Add 拓扑）为例；三类设定：Academic / TensorRT 式（Add 前移到 Conv 输入端，高精度累加）/ SNPE(DSP) 式（Conv+ReLU 物理融合、Add 双分支 INT8 且 Scale 绑定一致）；笔记未记录其余算子类型是否覆盖"
tags: [quantization, benchmark, mqbench, qat, ptq, tensorrt, snpe, deployment]
note: library/Quantization/MQBench.md#23-架构对齐硬件计算图约束
paper: "NeurIPS 2021, MQBench（笔记未记录完整论文标题；代码 https://github.com/ModelTC/MQBench）"
stance: watch
evidence:
  - source: library/Quantization/MQBench.md
    locator: "§2.3 / 残差拓扑三图解析"
    quote: "要求节点前移到 Conv 输入端。允许 Add 节点以 INT32/FP32 的高精度累加，加完再统一量化。部署相对友好，掉点少。"
    relation: supports
  - source: library/Quantization/MQBench.md
    locator: "§2.3 / 残差拓扑三图解析"
    quote: "还强制要求 Add 节点的左右两个分支在相加前必须都是 INT8，且 **Scale（缩放因子）必须强行绑定为一致**，从而通过极简汇编指令完成同构相加。"
    relation: supports
falsifiers:
  - "MQBench 开源仓库中找不到上述三类图约束设定的实现或配置开关，实际只支持其中一种或两种"
  - "论文对三类设定的定义与笔记转述不符（例如 SNPE 并未要求 Add 前双分支 INT8 且 Scale 绑定一致）"
  - "实验部分并未对三类设定分别给出结果（'支持'停留在图示，未进入评测协议）"
review_due: 2026-12-02
related: [claim-mqbench-first-hardware-aligned-quant-benchmark, claim-mqbench-snpe-tied-scale-accuracy-collapse]
signoff: null
---

## 我的理解

论文声称 MQBench 把"硬件编译器对节点拓扑的苛刻约束"纳入评测：学术设定（算子后随意插 FakeQuant）、TensorRT 式张量推理引擎（量化节点前移、Add 高精度累加后统一量化）、SNPE 式极低功耗 DSP（Conv+ReLU 强制融合、Add 双分支必须 INT8 且 Scale 绑定一致）。这是工具覆盖范围类主张：MQBench 支持在至少这三种图约束下评测同一算法。

笔记仅以残差结构为例展示三类设定，未记录其他结构（如 concat、多分支）的覆盖情况，故主张限定为"以残差拓扑为例的三类设定"。

## 待验证

- 在 MQBench GitHub 仓库中定位三类图约束的配置/实现（backend 或 hardware setting 相关代码），确认与笔记描述一致。
- 对照论文原文确认三类设定的正规定义与命名（笔记为中文转述，原始术语待核）。
- 确认除残差结构外还有哪些算子/结构被纳入图约束覆盖。

## 若成立 / 不成立意味着什么

成立：评估 QAT/PTQ 算法"可部署性"时可直接用 MQBench 的三档图约束做分级测试，特别是 SNPE 档作为最严门槛。
不成立：MQBench 的硬件覆盖弱于声称，三档设定可能只有图示无实现，部署前仍需自建目标硬件的图约束检查。
