---
id: claim-vqmap-argoverse-zero-shot-iou-734
title: "论文声称：nuScenes 训练的阶段一 Codebook+Decoder 零样本迁移到 Argoverse 单目地图估计，Drivable 类 IoU 73.4（Argoverse 仅评此一类），高于前 SOTA 68.3（+5.1）"
type: claim
status: asserted
scope: "Argoverse 数据集、单目（Monocular）BEV 地图估计；零样本跨数据集设定：阶段一离散表示学习产物（Codebook 与生成解码器）直接沿用 nuScenes 训练权重（论文正文称 off-the-shelf），阶段二（PV-BEV 对齐，backbone 换 ResNet50）在 Argoverse 训练；IoU 73.4 与前 SOTA 68.3 已对照 arXiv:2411.01618 核实与笔记一致（2026-11-02 抓取；「前 SOTA」为同表 TaDe [16]；2026-11-05 复抓澄清：73.4/68.3 为 Argoverse **Drivable 单类** IoU——论文 §4 明言 Argoverse 侧仅评 drivable area 一类，同表的 Drivable/Crossing/Walkway/Carpark 四类平均列属 nuScenes 单目部分、VQ-Map 该列为 47.6，11-02 曾误记为四类平均）；Argoverse val 为 24 序列（65 训练序列，Miami+Pittsburgh）；评测协议：VQ-Map 恒用 IoU 阈值 0.5、对比方法按原文各自最优阈值，LiDAR 不可达网格忽略（Table 2 原注）；数字为论文自报，尚未独立验证"
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
  - source: https://arxiv.org/pdf/2411.01618
    locator: "§4 Experiments 数据集段（Argoverse 仅评 drivable 一类的原文表述；pdftotext -layout 提取，跨行按空格还原，「evalutate」系原文拼写原样；抓取 2026-11-05）"
    quote: "We evalutate the IoU scores for drivable area, pedestrian crossing, walkway and car-parking area on nuScenes while only the drivable area on Argoverse."
    relation: supports
  - source: https://arxiv.org/pdf/2411.01618
    locator: "§4.2 单目对比段（阶段一直接沿用 nuScenes 权重的原文表述；pdftotext -layout 提取，跨行按空格还原；抓取 2026-11-05）"
    quote: "It is noteworthy that our experiments on the Argoverse [10] dataset directly exploit the off-the-shelf codebook embedding and BEV map generation decoder trained on nuScenes, indicating good transferability of our discrete representation learning."
    relation: supports
falsifiers:
  - "〔同范围复现（主张侧+对照侧）〕复现中沿用 nuScenes 的 Codebook+Decoder 在 Argoverse 单目上 Drivable IoU 显著低于 73.4，或不高于前 SOTA 68.3"
  - "〔原文核查（零样本严格性，代码/附录级）〕代码或附录核查发现阶段一权重/码本并非严格 off-the-shelf：迁移前在 Argoverse 上做过微调、早停挑选或码本筛选（正文 off-the-shelf 表述 2026-11-05 抓取在案，隐性泄漏只能靠代码级核查排除）"
  - "〔原文核查（版本/协议）〕arXiv 新版本或 camera-ready 更改 Table 2 数字、Argoverse 仅评 Drivable 的口径或零样本表述；或复现发现评测协议与 Table 2 原注不符（阈值规则、LiDAR 不可达网格处理）"
review_due: 2026-12-02
related: [claim-vqmap-nuscenes-map-miou-622-leads-table]
signoff: null
---

## 我的理解

论文声称：VQ-Map 阶段一学到的离散码本不是对 nuScenes 相机视角的过拟合——把在 nuScenes 上训练好的第一阶段 Codebook 与 Decoder 原封不动搬到 Argoverse 单目地图估计（只重训阶段二的 PV-BEV 对齐），拿到 IoU 73.4，比前 SOTA 68.3 高 5.1。即码本捕获的是跨数据集通用的道路拓扑结构。该主张尚未独立验证。

必须记住的限定（2026-11-05 复抓后更新）：73.4 的 IoU 只覆盖 Argoverse 的 Drivable 一类（该数据集侧仅评此一类），不能读作全类平均；"前 SOTA 68.3"为同表 TaDe [16]（单目方法，同 Drivable 列）。零样本严格性在论文正文层面已确认（off-the-shelf Codebook+Decoder 来自 nuScenes，阶段二在 Argoverse 训练），但"无任何目标域数据参与"仍属论文一面之词——早停、码本挑选等隐性泄漏只能靠代码/附录核查排除。评测协议上对比方法按各自最优阈值、VQ-Map 恒用 0.5（对 VQ-Map 偏保守），且 LiDAR 不可达网格被忽略。

**复审更新（2026-11-02；2026-11-05 修正一处列位误读）**：数字已对照 arXiv:2411.01618 核实——73.4 与 68.3 均在论文 monocular 对比表（Table 2）中，「前 SOTA」为同表第二名 TaDe [16]。11-02 曾把行尾数字读成"Drivable/Crossing/Walkway/Carpark 四类平均"，11-05 pdftotext -layout 复抓澄清：该表列结构为「nuScenes 单目：Drivable/Crossing/Walkway/Carpark/Mean + Argoverse：Drivable」——**73.4/68.3 是 Argoverse Drivable 单类 IoU**（四类平均是 45.0/47.6，属 nuScenes 单目部分，见 evidence）。零样本设定的原文表述同日核实：正文明确直接沿用 nuScenes 训练的 off-the-shelf Codebook 与 BEV 生成 Decoder（见 evidence），阶段二在 Argoverse 训练（backbone 换 ResNet50）。

## 待验证

- 已核对（2026-11-02 + 2026-11-05 复抓）：「前 SOTA 68.3」为同表 TaDe [16]；IoU 口径为 Argoverse Drivable 单类（Argoverse 仅评此一类）；零样本设定（沿用 nuScenes Codebook+Decoder、仅训阶段二）有正文原句（见 evidence）。
- 待补：代码级核查阶段一权重无任何 Argoverse 数据参与（早停、码本挑选、验证集调参等隐性泄漏）——正文一面之词无法排除。
- 用开源仓库在 Argoverse 上复现：冻结 nuScenes Codebook+Decoder，仅重训阶段二（ResNet50 backbone），验证 Drivable IoU 是否达到 73.4。
- 复现时对齐 Table 2 原注口径：IoU 阈值规则、LiDAR 不可达网格忽略的处理。

## 若成立 / 不成立意味着什么

成立：离散地图先验具备跨数据集泛化能力，新场景 / 新数据集的 BEV 地图任务可以直接复用现成码本做迁移，降低标注与重训成本。
不成立：码本仍是数据集特定的，跨域使用需要重训阶段一，"通用道路常识字典"的叙事不成立，迁移场景下的选型参考价值大打折扣。

## 核查记录

- 2026-11-05（P1-B7b 零散组）：本卡 2 条 library 笔记引句经 grep -F 逐字验证全部命中（library/Quantization/VQ-Map.md §4.2）；同日实抓 arXiv:2411.01618v1（pdftotext -layout）核对 Table 2 与相关正文，修正本卡一处口径误读：11-02 复审曾把 73.4/68.3 读为"Drivable/Crossing/Walkway/Carpark 四类平均"，实为 **Argoverse Drivable 单类 IoU**（论文 §4 明言 Argoverse 侧仅评 drivable area，四类平均列属同表 nuScenes 单目部分）——title、scope、正文限定与复审段、待验证、falsifiers 已同步更正；新增 2 条 arXiv evidence（Argoverse 仅评 Drivable 原句、off-the-shelf 零样本原句，抓取 2026-11-05）。11-02 的两条表格行引句经 11-05 复抓同表数字逐字一致（含行内空格）。论文数字未改写，status/stance/related 不变。
