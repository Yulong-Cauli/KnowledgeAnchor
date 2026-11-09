---
id: claim-openvla-int4-quantization-matches-bf16
title: "OpenVLA 论文声称：int4 量化推理不损下游成功率（71.9 vs bfloat16 71.3），显存 7.0 GB 不到一半；int8 掉点纯因推理变慢"
type: claim
status: asserted
scope: "OpenVLA（§5.4 为 bf16 默认加载的 7B 模型）；评测为 8 个代表性 BridgeData V2 任务 × 80 rollouts（A5000 GPU，5Hz non-blocking 控制）；int8 的对照补充实验为 blocking control（§D.4）；论文自报数字（CoRL 2024，arXiv:2406.09246v3）"
tags: [vla, openvla, quantization, int4, deployment]
note: library/VLM_VLA/OpenVLA.md#3-实验
paper: "CoRL 2024, OpenVLA: An Open-Source Vision-Language-Action Model (arXiv:2406.09246)"
stance: watch
evidence:
  - source: library/VLM_VLA/OpenVLA.md
    locator: "§3.4 / Table 2（bfloat16 行）"
    quote: "| bfloat16 | 71.3 ⟨MATH:\\pm⟩ 4.8% | 16.8 GB |"
    relation: supports
  - source: library/VLM_VLA/OpenVLA.md
    locator: "§3.4 / Table 2（int8 行）"
    quote: "| int8 | 58.1 ⟨MATH:\\pm⟩ 5.1% | 10.2 GB |"
    relation: supports
  - source: library/VLM_VLA/OpenVLA.md
    locator: "§3.4 / Table 2（int4 行）"
    quote: "| int4 | 71.9 ⟨MATH:\\pm⟩ 4.7% | 7.0 GB |"
    relation: supports
  - source: library/VLM_VLA/OpenVLA.md
    locator: "§3.4 / §5.4 int4 结论原句"
    quote: "Notably, 4-bit quantization results in similar performance as bfloat16 half-precision inference despite requiring less than half the amount of GPU memory. 4-bit quantized models can run at 3Hz on the A5000, thus more closely matching the system dynamics during data collection."
    relation: supports
  - source: library/VLM_VLA/OpenVLA.md
    locator: "§3.4 / §D.4 对照实验原句"
    quote: "here we observe that 8-bit quantization performs comparably to bfloat16 precision and 4-bit quantization given that we evaluate with blocking control to remove the influence of varying inference speeds on task performance."
    relation: supports
falsifiers:
  - "同 8 任务/80 rollouts 协议复现中 int4 成功率显著低于 bfloat16（差值超出 StdErr），『无成功率损失』不成立"
  - "在线速度受控（blocking control 或更快 GPU）条件下 int8 仍显著掉点，说明掉点并非（仅）推理速度的系统动力学效应"
  - "int4 量化在其它本体（Franka/DROID）或高频控制场景（>5Hz）下不复现无损失"
review_due: 2026-12-03
related: [claim-openvla-7b-outperforms-rt2x-55b-16p5, claim-openvla-lora-rank32-matches-full-finetune]
signoff: null
---

## 我的理解

论文声称：OpenVLA 可用 int4 量化部署——8 个代表性 BridgeData V2 任务（80 rollouts）上 int4 成功率 71.9±4.7% 与 bfloat16 的 71.3±4.8% 持平，显存从 16.8 GB 降到 7.0 GB（A5000 上 3Hz）。反直觉的 int8 掉点（58.1±5.1%）论文归因于推理速度：A5000 上 int8 只能跑 1.2Hz，改变了 5Hz non-blocking 控制的系统动力学；§D.4 用 blocking control 去掉速度影响后 int8 与 bfloat16/int4 相当，支持该解释。离线 token accuracy 三种精度相当（脚注 5）。

限定：结论限于 5Hz 控制的 WidowX 任务与 A5000 硬件；"±" 为 StdErr（80 rollouts）；对 50Hz 级高频控制（如 ALOHA）论文自认推理吞吐仍是瓶颈（§6）。

## 待验证

- 在 A5000/4090 上按论文协议复测三档精度的成功率与实际控制频率。
- 在 15Hz Franka-DROID 设置上验证 int4（该设置对延迟更敏感）。
- 核对量化实现（代码库支持的 quantized inference 路径）与论文所用 bit 精度方案一致。

## 若成立 / 不成立意味着什么

成立：7B VLA 可下放到 8GB 级消费 GPU 做实时操作控制，边缘部署路线可行。
不成立：量化成功率损失与任务/控制频率强耦合，部署前必须逐场景实测。
