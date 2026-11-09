---
id: claim-vqmap-nuscenes-map-miou-622-leads-table
title: "论文声称：VQ-Map 在 nuScenes val 环视 BEV 地图分割上 mean mIoU 62.2，高于同表全部对比方法（BEVFusion 56.6 / MapPrior 56.7 / DDP 59.4）"
type: claim
status: asserted
scope: "nuScenes 验证集、环视（Surround-View）BEV 语义地图分割（笔记抄 Drivable / Ped. Cross. / Walkway / Stopline 四类 + Mean；Mean 62.2 实为论文 6 类平均）；VQ-Map 自报数字与 BEVFusion、MapPrior、DDP 同表对比；数字已对照 arXiv:2411.01618 Table 1 核实与笔记一致（2026-11-02 抓取；论文原表为 6 类 + 9 个对比方法行——另有 Carpark/Divider 两类与 X-Align 58.0、MetaBEV 59.3 等，笔记只抄了 4 类与 3 行，全部方法行均低于 62.2；2026-11-05 复抓修正：对比方法行为 9 行（OFT/LSS/CVT/M2 BEV/BEVFusion/MapPrior/X-Align/MetaBEV/DDP），11-02 复审段曾误记为 7 行）；模态与阈值口径：Table 1 原注自称全表只评 camera-only 设定、VQ-Map 恒用 IoU 阈值 0.5 而其余方法按原文各自最优阈值（2026-11-05 抓取，属论文自报口径）；nuScenes val 为 150 场景 / 6019 样本（PON split）；camera-only 与划分的实际同口径性仍是论文一面之词"
tags: [bev, map-segmentation, vqvae, discrete-representation, nuscenes, vq-map]
note: library/Quantization/VQ-Map.md#41-核心指标对比-state-of-the-art-comparison
paper: "NeurIPS 2024, VQ-Map (arXiv:2411.01618)（代码：https://github.com/Z1zyw/VQ-Map）"
stance: watch
evidence:
  - source: library/Quantization/VQ-Map.md
    locator: "§4.1 / 核心指标对比表"
    quote: "| **VQ-Map (Ours)** | **83.8**     | **60.9**        | **64.2**    | **57.7**     | **62.2**        |"
    relation: supports
  - source: library/Quantization/VQ-Map.md
    locator: "§4.1 / 核心指标对比表"
    quote: "| BEVFusion (基线)  | 81.7         | 54.8            | 58.4        | 47.4         | 56.6            |"
    relation: supports
  - source: library/Quantization/VQ-Map.md
    locator: "§4.1 / 核心指标对比表"
    quote: "| MapPrior (VQ-GAN) | 81.7         | 54.6            | 58.3        | 46.7         | 56.7            |"
    relation: supports
  - source: library/Quantization/VQ-Map.md
    locator: "§4.1 / 核心指标对比表"
    quote: "| DDP (Diffusion)   | 83.6         | 58.3            | 61.6        | 52.4         | 59.4            |"
    relation: supports
  - source: library/Quantization/VQ-Map.md
    locator: "§4.1 / 表后分析"
    quote: "Stopline 停止线涨幅 +10.3、Walkway 人行道涨幅 +5.8"
    relation: supports
  - source: https://arxiv.org/pdf/2411.01618
    locator: "Table 1（nuScenes surround-view，VQ-Map 行；pdftotext -layout 提取，抓取 2026-11-02）"
    quote: "VQ-Map            83.8         60.9        64.2         57.7      55.7      50.8     62.2"
    relation: supports
  - source: https://arxiv.org/pdf/2411.01618
    locator: "Table 1（nuScenes surround-view，DDP 行；pdftotext -layout 提取，抓取 2026-11-02）"
    quote: "DDP [19]          83.6         58.3        61.6         52.4      51.4      49.2     59.4"
    relation: supports
  - source: https://arxiv.org/pdf/2411.01618
    locator: "Table 1 caption 后两句（阈值规则与 camera-only 设定；pdftotext -layout 提取，跨行按空格还原；抓取 2026-11-05）"
    quote: "In our method, we adopt a constant IoU threshold of 0.5 to ensure a fairer comparison across all existing approaches. We only evaluate different approaches in the camera-only setting."
    relation: supports
falsifiers:
  - "〔同范围复现（主张侧+对照侧）〕用开源仓库（Z1zyw/VQ-Map）在 nuScenes val 复现，mean mIoU 显著低于 62.2，或不高于 DDP 的 59.4"
  - "〔原文核查〕原文 Table 与笔记数字不一致（VQ-Map mean 并非 62.2，或任一对比方法行数字有出入）"
  - "〔口径核对（对照侧）〕对比口径实际不对等：论文原注自称全表 camera-only、VQ-Map 恒定阈值 0.5（2026-11-05 抓取在案），但若复现或官方配置核查发现某对比方法行并非 camera-only，或数据划分 / 后处理与 VQ-Map 不同，则领先在同口径下不成立"
review_due: 2026-12-02
related: [claim-vqmap-token-classification-618-beats-regression, claim-vqmap-tiny-868g-macs-matches-ddp, claim-vqmap-argoverse-zero-shot-iou-734]
signoff: null
---

## 我的理解

论文声称：在 nuScenes val 环视 BEV 地图分割上，VQ-Map 取得 mean mIoU 62.2，高于同表所列全部对比方法（BEVFusion 56.6、MapPrior 56.7、DDP 59.4），且提升集中在依赖结构先验的细粒度类别——相对 BEVFusion，Stopline +10.3（47.4 → 57.7）、Walkway +5.8（58.4 → 64.2）。数字均为论文自报。

必须记住的限定（2026-11-05 复抓后更新）：模态疑虑在论文自报口径下已解除——Table 1 原注明言"只评 camera-only 设定"（见 evidence），即 BEVFusion 行也是相机-only 配置，与 VQ-Map 同模态；但这仍是论文一面之词，BEVFusion 行的具体输入配置可按其官方 camera-only 复现配置独立复核。阈值口径：VQ-Map 恒用 0.5，其余方法按原文各自最优阈值（给对手留了最优阈值，对 VQ-Map 偏保守）。涨幅 +10.3 / +5.8 是相对 BEVFusion（基线行）的差值，不是相对最强基线 DDP。

**复审更新（2026-11-02；2026-11-05 补充并修正一处行数笔误）**：数字已对照 arXiv:2411.01618 Table 1 逐格核实与笔记一致；论文原表实为 6 类（另有 Carpark/Divider）+ 9 个对比方法行（OFT/LSS/CVT/M2 BEV/BEVFusion/MapPrior/X-Align/MetaBEV/DDP；11-02 复审段曾误写"7 个"），最高对手 DDP 59.4，「VQ-Map 62.2 高于同表全部对比方法」在论文全表口径下同样成立。11-05 复抓补充：Table 1 原注自称全表 camera-only、VQ-Map 恒用阈值 0.5（见 evidence）——11-02 遗留的模态口径问题在论文自报层面解决，独立复核仍待做。

## 待验证

- 已核对（2026-11-02 + 2026-11-05 复抓）：arXiv:2411.01618 Table 1 数字行与笔记一致（见 evidence）；对比方法 9 行；表原注自称全表 camera-only、VQ-Map 恒用阈值 0.5。
- 待补（独立复核）：BEVFusion 行等对比方法的 camera-only 具体配置——按 BEVFusion 官方 camera-only 复现配置独立确认，不依赖论文原注一面之词。
- 用 [Z1zyw/VQ-Map](https://github.com/Z1zyw/VQ-Map) 在 nuScenes val（150 场景 / 6019 样本，PON split）上复现 mean mIoU 与逐类指标。
- 确认评测口径：Patch 网格（8×8）、IoU 阈值与 mIoU 计算是否与对比方法一致（复现时对齐 Table 1 原注）。

## 若成立 / 不成立意味着什么

成立：纯相机 BEV 地图估计用"离散 Token 分类 + 生成式地图字典"可以在细粒度类别上压过多模态基线，值得在 BEV 感知选型中把 VQ-Map 列为相机-only 路线的候选基线。
不成立：领先依赖对比口径不对等或自报数字偏差，地图先验路线退回与 DDP / MapPrior 同档，选型时不应给 VQ-Map 额外权重。

## 核查记录

- 2026-11-05（P1-B7b 零散组）：本卡 6 条 library 笔记引句经 grep -F 逐字验证全部命中（library/Quantization/VQ-Map.md §4.1 表格 4 行 + 表后分析句）；11-02 的 2 条 arXiv 表格行引句经 11-05 复抓逐字一致（含行内空格）。同日实抓核正/补充三处：① 对比方法行数 7→9（11-02 复审段笔误，其枚举的 9 个方法名本就与论文 Table 1 一致）；② 模态口径：Table 1 原注自称「We only evaluate different approaches in the camera-only setting」，11-02 遗留的「BEVFusion 可能为多模态」疑虑在论文自报层面解除，新增该原注句为 evidence（抓取 2026-11-05）；③ 补阈值口径（VQ-Map 恒 0.5 vs 其余方法各自最优阈值，对 VQ-Map 偏保守）。scope、falsifier 3、正文限定与复审段、待验证、related（补 argoverse 卡双向关联）已同步更新。论文数字未改写，status/stance 不变。
