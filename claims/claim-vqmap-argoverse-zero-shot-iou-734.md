---
id: claim-vqmap-argoverse-zero-shot-iou-734
title: "论文声称：nuScenes 训练的阶段一 Codebook+Decoder 零样本迁移到 Argoverse 单目地图估计，IoU 73.4，高于前 SOTA 68.3（+5.1）"
type: claim
status: asserted
scope: "Argoverse 数据集、单目（Monocular）BEV 地图估计；零样本跨数据集设定：阶段一离散表示学习产物（Codebook 与生成解码器）直接沿用 nuScenes 训练权重，不在 Argoverse 上重训；IoU 73.4 与前 SOTA 68.3 已对照 arXiv:2411.01618 核实与笔记一致（2026-11-02 抓取；「前 SOTA」为同表 TaDe [16]，IoU 为 Drivable/Crossing/Walkway/Carpark 四类平均）；数字为论文自报；笔记未注明 Argoverse 验证集规模与零样本严格性（阶段二是否只在 Argoverse 训）"
tags: [bev, map-segmentation, vqvae, zero-shot-transfer, argoverse, nuscenes, vq-map]
note: library/Quantization/VQ-Map.md#42-零样本跨数据集泛化-argoverse-monocular
paper: "NeurIPS 2024, VQ-Map (arXiv:2411.01618)（代码：https://github.com/Z1zyw/VQ-Map）"
stance: watch
evidence:
  - source: library/Quantization/VQ-Map.md
    locator: "§4.2 / 设定"
    quote: "*   **设定**：作者在 Argoverse 数据集做单目地图估计测试时，**直接使用了在 nuScenes 上训练好的第一阶段 Codebook 和 Decoder**。"
    relation: supports
  - source: library/Quantization/VQ-Map.md
    locator: "§4.2 / 结果"
    quote: "*   **结果**：取得了 **73.4** 的 IoU（前SOTA为 68.3，提升 +5.1）。"
    relation: supports
  - source: https://arxiv.org/pdf/2411.01618
    locator: "Argoverse monocular 对比表（TaDe 行，即笔记所称「前SOTA」；pdftotext -layout 提取，抓取 2026-11-02）"
    quote: "TaDe [16]            65.9            40.9        42.3         30.7     45.0              68.3"
    relation: supports
  - source: https://arxiv.org/pdf/2411.01618
    locator: "Argoverse monocular 对比表（VQ-Map 行；pdftotext -layout 提取，抓取 2026-11-02）"
    quote: "VQ-Map               70.0            43.9        43.8         32.7     47.6              73.4"
    relation: supports
falsifiers:
  - "复现中沿用 nuScenes 的 Codebook+Decoder 在 Argoverse 单目上 IoU 显著低于 73.4，或不高于前 SOTA 68.3"
  - "发现迁移前 Codebook / Decoder 实际在 Argoverse 上做过微调或挑选（并非严格零样本），或前 SOTA 68.3 的方法与口径（输入模态、IoU 定义）与 VQ-Map 不对等"
review_due: 2026-12-02
related: [claim-vqmap-nuscenes-map-miou-622-leads-table]
signoff: null
---

## 我的理解

论文声称：VQ-Map 阶段一学到的离散码本不是对 nuScenes 相机视角的过拟合——把在 nuScenes 上训练好的第一阶段 Codebook 与 Decoder 原封不动搬到 Argoverse 单目地图估计（只重训阶段二的 PV-BEV 对齐），拿到 IoU 73.4，比前 SOTA 68.3 高 5.1。即码本捕获的是跨数据集通用的道路拓扑结构。该主张尚未独立验证。

必须记住的限定：笔记只写了"直接使用 Codebook 和 Decoder"，未说明阶段二是否完全在 Argoverse 上重训、以及 73.4 的 IoU 覆盖哪些地图类别；"前 SOTA 68.3"对应哪篇方法、什么输入模态也无从在笔记中核对。零样本的严格性（无任何目标域数据参与）目前只有笔记一面之词。

**复审更新（2026-11-02）**：数字已对照 arXiv:2411.01618 核实——73.4 与 68.3 均在论文 Argoverse monocular 表中，**「前 SOTA」为同表 TaDe [16]**（65.9/40.9/42.3/30.7 → 68.3），VQ-Map 行 70.0/43.9/43.8/32.7 → 73.4，即 Drivable/Crossing/Walkway/Carpark 四类平均；零样本设定（冻结阶段一、仅训阶段二）的原文表述仍需查正文与附录。

## 待验证

- 已核对（2026-11-02）：论文表中「前 SOTA 68.3」为 TaDe [16]，IoU 口径为 Drivable/Crossing/Walkway/Carpark 四类平均（见 evidence）。
- 待补：TaDe 的输入模态与论文正文对零样本迁移设定的完整表述。
- 用开源仓库在 Argoverse 上复现：冻结 nuScenes Codebook+Decoder，仅重训阶段二，验证 IoU 是否达到 73.4。
- 检查代码/附录确认阶段一权重没有任何 Argoverse 数据参与（含早停、码本挑选等隐性泄漏）。

## 若成立 / 不成立意味着什么

成立：离散地图先验具备跨数据集泛化能力，新场景 / 新数据集的 BEV 地图任务可以直接复用现成码本做迁移，降低标注与重训成本。
不成立：码本仍是数据集特定的，跨域使用需要重训阶段一，"通用道路常识字典"的叙事不成立，迁移场景下的选型参考价值大打折扣。
