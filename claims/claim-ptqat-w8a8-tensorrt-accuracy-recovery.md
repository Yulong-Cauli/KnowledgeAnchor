---
id: claim-ptqat-w8a8-tensorrt-accuracy-recovery
title: "BEVDepth4D W8A8 下，PTQAT 引擎在 TensorRT 上以接近官方 PTQ 的速度与更低显存恢复大部分精度"
type: claim
status: asserted
scope: "BEVDepth4D；nuScenes val；W8A8；NVIDIA TensorRT 引擎部署；PTQAT vs NVIDIA 官方 PTQ vs FP16"
tags: [quantization, ptqat, tensorrt, deployment, bev]
note: library/Quantization/PTQAT.md#33-真实硬件落地加速-table-5
paper: "ICCV 2025, PTQAT: A Hybrid Parameter-Efficient Quantization Algorithm for 3D Perception Tasks (arXiv:2508.10557)"
stance: watch
evidence:
  - source: library/Quantization/PTQAT.md
    locator: "§3.3 / Table 5"
    quote: "| FP16 (原版)           | 40.8     | 52.2     | 18      | 860M         |"
    relation: supports
  - source: library/Quantization/PTQAT.md
    locator: "§3.3 / Table 5"
    quote: "| NVIDIA PTQ (官方默认) | 32.4     | 44.1     | **35**  | 607M         |"
    relation: supports
  - source: library/Quantization/PTQAT.md
    locator: "§3.3 / Table 5"
    quote: "| **PTQAT (W8A8)**      | **38.0** | **50.3** | 31      | **503M**     |"
    relation: supports
  - source: https://arxiv.org/html/2508.10557v1
    locator: "§4.3 正文结果句片段（2026-11-05 实抓核对；Table 5 数字另于同日对 HTML v1/v2 复抓对账一致，见正文核查记录）"
    quote: "nearly twice that of its FP16 counterpart while reducing GPU memory usage by over 40%."
    relation: supports
falsifiers:
  - "复现中 PTQAT 引擎的 FPS 显著低于 NVIDIA 官方 PTQ 引擎，或显存高于官方 PTQ"
  - "mAP/NDS 相对官方 PTQ 的恢复幅度大幅缩水，接近官方 PTQ 的精度水平（如 mAP 差距 < 1 点）"
  - "部署需要论文未提及的自定义算子/插件，无法直接编译为标准 TensorRT 引擎"
review_due: 2026-12-01
related: [claim-ptqat-w4-outperforms-full-qat-fewer-params]
signoff: null
---

## 我的理解

W8A8 下相对 FP16 基线（40.8 / 52.2 / 18 FPS / 860M）：NVIDIA 官方 PTQ 拿到 35 FPS / 607M 但精度崩到 32.4 / 44.1；PTQAT 引擎为 38.0 / 50.3 / 31 FPS / 503M——速度约为 FP16 的 1.7 倍、显存省约 42%，精度恢复到官方 PTQ 与 FP16 差距的约 67%（mAP：(38.0−32.4)/(40.8−32.4)=5.6/8.4）与约 77%（NDS：(50.3−44.1)/(52.2−44.1)=6.2/8.1）。该主张的前提是笔记 §2.3 所述"只用均匀对称量化、不用自定义算子"，这也是"可无缝编译"的根据。

注意：此表模型是 BEVDepth4D（消融基座），不是 Table 1 的 SparseBEV/BEVFormer；FPS 数字依赖具体 TensorRT/GPU 环境，笔记未注明测试硬件。Table 5 数字已于 2026-11-05 对 arXiv HTML v1/v2 复抓对账，两版互为一致且与笔记一致。

## 核查记录

- 2026-11-05（P1-B2a 量化主线经典组）：evidence 三条笔记 quote 逐字机械核对命中。原第 4 条 evidence 的 source（abs 页）经实抓证实不含 Table 5，且 quote 为中文数字摘录——已改为 HTML v1 §4.3 正文原句片段（当日实抓核对）。另改正正文恢复率算术：mAP 应为约 67%（原写 77%）、NDS 约 77%（原写 82%）；主张、Table 5 数字与 falsifiers 未改。

## 待验证

- 按论文导出 W8A8 引擎，在自有 GPU 上复测 FPS / 显存 / mAP / NDS 四个数，确认相对官方 PTQ 的恢复幅度。
- 确认导出路径确实不需要自定义插件（ONNX 算子全覆盖）。
- 在 SparseBEV 或 BEVFormer 上重走一遍 W8A8 部署，确认结论不限于 BEVDepth4D。

## 若成立 / 不成立意味着什么

成立：车端/工控机部署可走 PTQAT W8A8 引擎路线，不必在"官方一键 PTQ 不可用"与"全参数 QAT 高成本"间二选一。
不成立：精度恢复依赖未公开的训练细节或特定环境，部署仍需按模型逐个评估，claim 降级为"仅 BEVDepth4D 论文自报"。
