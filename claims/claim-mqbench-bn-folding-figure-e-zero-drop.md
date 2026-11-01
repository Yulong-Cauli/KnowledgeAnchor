---
id: claim-mqbench-bn-folding-figure-e-zero-drop
title: "MQBench 声称：只有'先折叠 BN 再伪量化'的图(e) 方案实现训练态与部署态零掉点，图(c)(d) 与真实部署间存在 1-2% 精度差、图(b) 无法收敛"
type: claim
status: asserted
scope: "QAT 中 Conv+BN 折叠的四种策略对比（图3-b/c/d/e）；部署态为物理折叠算子（如 TensorRT 先折叠后量化的等效权重）；笔记未记录论文实验的数据集、模型与比特宽度；'1-2%' 与 'Zero Drop' 为笔记转述数字"
tags: [quantization, qat, mqbench, bn-folding, deployment]
note: library/Quantization/MQBench.md#22-模块对齐bn-层折叠
paper: "NeurIPS 2021, MQBench（笔记未记录完整论文标题；代码 https://github.com/ModelTC/MQBench）"
stance: watch
evidence:
  - source: library/Quantization/MQBench.md
    locator: "§2.2 / 正确做法"
    quote: "必须先把 $W$ 和 BN 参数乘起来得到 $W_{fold}$，然后再对 $W_{fold}$ 做伪量化。"
    relation: supports
  - source: library/Quantization/MQBench.md
    locator: "§实验部分 / 5.3"
    quote: "图(b)无法收敛，图(c)(d)与真实部署间存在 1-2% 的精度差。只有采用了**图(e) 策略**的模型，实现了训练态与部署态的 **Zero Drop（零掉点）**。"
    relation: supports
falsifiers:
  - "采用图(e)（乘法路径折叠+伪量化、加法路径更新 BN 统计量）的 QAT 模型导出真实硬件后，相对训练/模拟精度出现可复测掉点，Zero Drop 不成立"
  - "图(b) 朴素折叠在标准训练设置下可以稳定收敛，或图(c)(d) 与真实部署的精度差明显偏离 1-2%"
  - "对比未控制变量（各策略训练轮数/超参不同），Zero Drop 是调参产物而非方案本身性质"
review_due: 2026-12-02
related: [claim-mqbench-three-hardware-graph-settings, claim-mqbench-first-hardware-aligned-quant-benchmark, claim-ptqat-w8a8-tensorrt-accuracy-recovery]
signoff: null
---

## 我的理解

论文声称 QAT 的 BN 折叠必须按部署态数学形式模拟：先把 W 与 BN 缩放系数 γ/σ 相乘得 W_fold、再对 W_fold 做伪量化（图3-e，乘法路径承担真实量化误差、加法路径经逆缩放接入正常 BN 以稳定梯度）。笔记转述的实验结论是：图(b) 不收敛、图(c)(d) 与部署有 1-2% 精度差、只有图(e) 实现 Zero Drop。尚未独立验证。

Zero Drop 的含义是"训练/模拟精度与部署精度之差为零"，不是"相对 FP32 无损"；1-2% 与 Zero Drop 均为笔记转述，未附表格数字，引用时需注明。

## 待验证

- 在 MQBench 仓库/论文中找到 5.3 对应实验表，核对图(b)(c)(d)(e) 各策略的具体精度与掉点数字。
- 自选一个 Conv+BN 模型，分别按图(e) 与图(c)/(d) 做 QAT 并导出 TensorRT，复测部署精度差是否为 0 / 1-2%。
- 确认 Zero Drop 的测量口径：训练末段精度 vs 部署引擎精度，允许的数值容差是多少。

## 若成立 / 不成立意味着什么

成立：自研或选用 QAT 框架时，BN 折叠必须采用"先折叠后量化 + 影像 BN 统计量"的图(e) 形态，否则端侧部署必然额外掉点（约 1-2% 起步）。
不成立：Zero Drop 依赖特定实验条件，或旧式"先量化再过 BN"方案的部署差距被夸大，BN 折叠策略不再是 QAT 框架的硬性筛选条件。
