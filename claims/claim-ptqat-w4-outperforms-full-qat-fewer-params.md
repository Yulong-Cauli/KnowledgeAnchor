---
id: claim-ptqat-w4-outperforms-full-qat-fewer-params
title: "PTQAT 在 nuScenes W4 上以更少可训练参数达到不低于全参数 QAT 的 mAP/NDS"
type: claim
status: asserted
scope: "nuScenes val split（据 arXiv:2508.10557，笔记未注明 split）；W4 权重量化；训练单卡 A100；SparseBEV 与 BEVFormer；PTQAT vs 全参数 QAT"
tags: [quantization, ptq, qat, ptqat, bev, nuscenes]
note: library/Quantization/PTQAT.md#31-3d-目标检测主线对比-table-1
paper: "ICCV 2025, PTQAT: A Hybrid Parameter-Efficient Quantization Algorithm for 3D Perception Tasks (arXiv:2508.10557)"
stance: watch
evidence:
  - source: library/Quantization/PTQAT.md
    locator: "§3.1 / Table 1"
    quote: "|               | 全参数 QAT | 44.6M                  | 15658s          | 43.6     | 54.3     |"
    relation: supports
  - source: library/Quantization/PTQAT.md
    locator: "§3.1 / Table 1"
    quote: "|               | **PTQAT**  | **32.7M** (-26%)       | **13849s**      | **44.6** | **55.2** |"
    relation: supports
  - source: library/Quantization/PTQAT.md
    locator: "§3.1 / Table 1"
    quote: "|               | 全参数 QAT | 69.0M                  | 47268s          | 38.0     | 48.8     |"
    relation: supports
  - source: library/Quantization/PTQAT.md
    locator: "§3.1 / Table 1"
    quote: "|               | **PTQAT**  | **18.7M** (-73%)       | **44493s**      | **38.6** | **49.1** |"
    relation: supports
  - source: https://arxiv.org/abs/2508.10557
    locator: "Abstract（abs 页摘要原句，2026-11-05 实抓核对；Table 1 数字另于同日对 arXiv HTML v1/v2 复抓对账一致，见正文核查记录）"
    quote: "fine-tuning the layers with smaller output discrepancies before and after quantization, rather than those with larger discrepancies, actually leads to greater improvements"
    relation: supports
falsifiers:
  - "同配置复现（nuScenes val、W4、A100）中 PTQAT 的 mAP 或 NDS 低于同 bit 全参数 QAT"
  - "复现中 PTQAT 的可训练参数量超过全参数 QAT"
  - "发现对比训练预算/超参不对等（PTQAT 额外调参、QAT 基线未调优），增益不可归因于层选择方法本身"
review_due: 2026-12-01
related: [claim-ptqat-w8a8-tensorrt-accuracy-recovery]
signoff: null
---

## 主张

W4 下纯 PTQ 会雪崩（SparseBEV mAP 45.4 → 30.5，BEVFormer 41.6 → 23.2）。PTQAT 只解冻 PTQ 预检查中输出 MSE 小于阈值 θ 的层（"fine-tuning the layers with smaller output discrepancies before and after quantization, rather than those with larger discrepancies, actually leads to greater improvements"，arXiv abs 页摘要原句，2026-11-05 实抓核对），结果是双向占优：SparseBEV 训 32.7M（全 QAT 44.6M 的约 74%），mAP/NDS 44.6/55.2 高于全 QAT 的 43.6/54.3；BEVFormer 训 18.7M（约 27%），38.6/49.1 高于 38.0/48.8。

该主张只覆盖"参数更少且精度不低于"这一条，不含训练耗时对比（PTQAT 略省时但同量级），也不含 W8 与部署结论（见 [W8A8 部署卡](claim-ptqat-w8a8-tensorrt-accuracy-recovery.md)）。已对照 arXiv:2508.10557 Table 1：2026-11-05 复抓 HTML v1 与 v2，两版数字互为一致且与笔记一致；Table 1 表题含 "nuScences val set"（拼写照抄），确认评测 split 为 val（笔记未注明 split）。

## 核查记录

- 2026-11-05（P1-B2a 量化主线经典组）：evidence 四条笔记 quote 逐字机械核对命中。原第 5 条 evidence 以 abs 页为 source 却标 Table 1 locator（实抓证实 abs 页无任何表格数字），且 quote 为中文数字摘录——已改为 abs 页摘要原句（当日实抓核对），Table 1 数字对账移入正文记录（HTML v1/v2 复抓一致）。命题与数字未改。

## 待验证

- 笔记标注"暂无"开源实现：等代码放出后（或按论文复现）在 nuScenes val 上跑 SparseBEV / BEVFormer W4——PTQAT 低于同 bit 全参数 QAT 即触发 falsifier 1，可训练参数反超即触发 falsifier 2。
- 核对全参数 QAT 基线的训练配置是否对等（epoch、lr schedule、数据增广）——不对等则增益不可归因于层选择（falsifier 3）。
- 阈值 θ 敏感性：更换 θ 后"小误差层优先"的结论是否稳定，还是只在报告的 θ 下成立。

## 成立/不成立的含义

成立：3D 感知模型的 W4 量化选型可默认走 PTQAT 而非全参数 QAT，训练显存与时间省一档，可直接写进部署方案（需先验证 W8A8 部署卡）。
不成立：混合量化的收益只是训练技巧层面，选型时仍需保留全参数 QAT 基线；"挑小误差层"的机制主张需另立卡核对消融（Table 6）。
