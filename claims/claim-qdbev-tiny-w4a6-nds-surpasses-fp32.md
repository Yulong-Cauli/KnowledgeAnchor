---
id: claim-qdbev-tiny-w4a6-nds-surpasses-fp32
title: "QD-BEV 论文声称：W4A6 的 QD-BEV-T 以约 8 倍压缩（15.9 MB vs 126.8 MB）取得 NDS 0.372，反超 FP32 BEVFormer-T 的 0.354"
type: claim
status: asserted
scope: "nuScenes；完整 QD-BEV（渐进式 QAT + 视点引导蒸馏 VGD）W4A6 vs FP32 基线，BEVFormer-Tiny（笔记 §3.4 Table 4 口径；Base 行为补充：QD-BEV-B NDS 0.509 vs FP32 0.517，32.9 MB vs 262.9 MB）；模型大小为论文自报存储占用；数字为论文自报；尚未独立验证"
tags: [quantization, qat, distillation, bev, bevformer, nuscenes, qd-bev]
note: library/Quantization/QD-BEV.md#34-qd-bev-综合对比实验-table-4
paper: "ICCV 2023, QD-BEV: Quantization-aware View-guided Distillation for Multi-view 3D Object Detection (arXiv:2308.10515)"
stance: watch
evidence:
  - source: library/Quantization/QD-BEV.md
    locator: "§3.4 / Table 4"
    quote: "| BEVFormer-T (FP32)  | 126.8 MB     | 0.354     | 0.253     | 0.899     | 0.294     |"
    relation: supports
  - source: library/Quantization/QD-BEV.md
    locator: "§3.4 / Table 4"
    quote: "| **QD-BEV-T (W4A6)** | **15.9 MB**  | **0.372** | **0.255** | **0.882** | **0.321** |"
    relation: supports
  - source: library/Quantization/QD-BEV.md
    locator: "§3.4 分析"
    quote: "**分析**：QD-BEV 在模型**体积压缩 8 倍**的情况下，Tiny 版本的精度甚至**反超**了 FP32 Baseline，Base 版本的性能损失也控制在 1% 以内。"
    relation: supports
  - source: https://arxiv.org/abs/2308.10515
    locator: "Abstract（抓取 2026-11-02）"
    quote: "On the nuScenes datasets, the 4-bit weight and 6-bit activation quantized QD-BEV-Tiny model achieves 37.2% NDS with only 15.8 MB model size"
    relation: supports
falsifiers:
  - "官方开源实现（https://github.com/Niko-zyf/QD-BEV）复现中 QD-BEV-T W4A6 NDS ≤ 0.354，未反超 FP32 基线"
  - "W4A6 模型实际存储并非约 8 倍压缩（如打包后 >20 MB），或压缩口径与基线不一致（含/不含 EMA 权重、buffer、检测头）"
  - "反超幅度（NDS +0.018、mAP +0.002）在训练随机性范围内，多种子复现中排序翻转；或 FP32 基线数字与 BEVFormer 官方复现不符"
review_due: 2026-12-02
related: [claim-qdbev-progressive-qat-beats-standard-w4a6]
signoff: null
---

## 我的理解

论文声称（asserted，尚未独立验证）：完整 QD-BEV（渐进式 QAT + 视点引导蒸馏）在 W4A6 下，Tiny 版以 15.9 MB（相对 FP32 BEVFormer-T 的 126.8 MB 约 8 倍压缩）取得 NDS 0.372 > 0.354；Base 版 NDS 0.509 vs 0.517，损失 ≤1%。数字已与 arXiv 摘要（37.2% NDS、outperforming BevFormer-Tiny by 1.8%、8x compression）及 ar5iv HTML 版 Table 4 逐项核对一致（均抓取 2026-11-02）。

三个必须记住的限定：
1. **反超幅度很小**：NDS +0.018、mAP +0.002（0.255 vs 0.253），且 mASE 变差（0.294→0.321）。「反超」是单次自报结果，多种子下可能翻转；引用时表述为「论文声称反超」，不是已验证的结论。
2. **模型大小口径有两处数字**：arXiv 摘要写 15.8 MB，笔记 Table 4 与 ar5iv HTML 版 Table 4 均为 15.9 MB。引用时以 Table 4 为准并注明摘要差异。
3. Table 4 的输入分辨率/训练配置笔记未注明（ar5iv HTML 版将该表标为 450×800 输入，与笔记 §3.5 Table 6 的 900×1600 是否同口径待核，未对照 PDF）。

蒸馏各组件（VGD 图像/BEV 双域 KL + 外参门控）的独立消融在笔记中未单列，本卡只能支持「完整方法」层面的主张。原始笔记见 [QD-BEV](../library/Quantization/QD-BEV.md#34-qd-bev-综合对比实验-table-4)。

## 待验证

- 用官方仓库复现 Table 4：QD-BEV-T/B W4A6 的 NDS/mAP 与模型大小，FP32 基线对齐 BEVFormer 官方配置。
- 多种子训练（≥3）确认 Tiny 反超是否稳定。
- 确认 Table 4 的输入分辨率与训练配置，及其与 Table 6（流式 sAP 实验，900×1600）的口径关系。
- 统计 W4A6 权重实际打包大小，验证 8 倍压缩口径（126.8/15.9≈7.97）。

## 若成立 / 不成立意味着什么

成立：W4A6 + 渐进 QAT + 视点引导蒸馏可让 BEV 感知模型以约 8 倍存储压缩保持甚至小幅超过 FP32 精度，是 BEV 部署量化的候选路线（配合 [渐进式卡](claim-qdbev-progressive-qat-beats-standard-w4a6.md)评估训练成本）。
不成立：反超或 8 倍压缩依赖自报口径，量化收益退回「精度换体积」，选型需重算精度-压缩权衡。
