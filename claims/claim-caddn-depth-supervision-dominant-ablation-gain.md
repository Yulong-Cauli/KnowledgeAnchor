---
id: claim-caddn-depth-supervision-dominant-ablation-gain
title: "CaDDN 消融自报：显式 LiDAR 深度监督带来全表最大单项增益 +10.4% AP，无监督深度预测仅 +1.5% AP"
type: claim
status: asserted
scope: "CaDDN（CVPR 2021）内部模块消融，笔记 §4 Table 3（Exp 1–5 逐步加模块）；单目 3D 检测，深度监督标签由 LiDAR 点云投影生成 One-hot（笔记 §3 Loss Function）；笔记未标注消融所用数据集与 AP 指标版本，数字为论文自报相对增量（Δ AP）"
tags: [caddn, monocular-3d, depth-distribution, depth-supervision, frustum, ablation]
note: library/Classical_Detection/CaDDN.md#4-消融实验
paper: "CVPR 2021, CaDDN: Categorical Depth Distribution Network for Monocular 3D Object Detection"
stance: watch
evidence:
  - source: library/Classical_Detection/CaDDN.md
    locator: "§4 / Table 3 Exp 3"
    quote: "**性能暴涨 (+10.4% AP)**。这是全表最大的提升，证明了**显式的深度监督是核心**，它让特征能聚焦在正确的位置。"
    relation: supports
  - source: library/Classical_Detection/CaDDN.md
    locator: "§4 / Table 3 Exp 2"
    quote: "**结果**：提升微乎其微 (+1.5% AP)。证明仅靠检测损失无法让网络学到准确的几何深度。"
    relation: supports
  - source: library/Classical_Detection/CaDDN.md
    locator: "§4 / Table 3 Exp 1"
    quote: "**结果**：效果最差，证明盲目投影不可行。"
    relation: supports
  - source: library/Classical_Detection/CaDDN.md
    locator: "§4 / 结论要点"
    quote: "**深度必须监督**：不要指望网络在做检测任务时顺便学会深度，必须用 LiDAR 真值手把手教 (Table 3 Exp 3)。"
    relation: supports
falsifiers:
  - "在开源实现（笔记标注 OpenPCDet 包含 CaDDN）复现 Table 3：加入 LiDAR One-hot 深度监督相对无监督深度预测的增益显著低于 +10.4% AP"
  - "复现中无监督深度预测（Exp 2）反超有监督（Exp 3），或不预测深度的均匀复制基线（Exp 1）并非最差"
  - "笔记转载数字与原论文 Table 3 不符（增量或行序抄错，参考 EMC2 笔记表格错位先例）"
review_due: 2026-12-02
related: [claim-caddn-soft-depth-distribution-beats-hard-argmax, claim-caddn-joint-training-beats-frozen-depth-branch, claim-caddn-lid-discretization-beats-uniform]
signoff: null
---

## 我的理解

论文声称（CaDDN Table 3 内部模块消融，逐步加模块，尚未独立验证）：Exp 1 基线不预测深度、把图像特征沿视锥射线均匀复制，效果最差（特征拖影）；Exp 2 预测深度分布用来加权特征但不加 LiDAR 深度监督、仅靠检测损失，只涨 +1.5% AP；Exp 3 加入 $L_{depth}$（LiDAR one-hot 监督）后 +10.4% AP，为全表最大单项提升。本卡主张：在 CaDDN 式"图像→视锥→BEV"单目方案里，核心增益来源是显式深度监督，而不是深度预测分支本身。

笔记未标注消融数据集与 AP 口径，全部数字为论文自报相对增量；用于选型前需对照原论文补齐评测协议。

## 待验证

- 用 OpenPCDet 复现 Table 3 Exp 2 vs Exp 3，核对 +1.5% / +10.4% 增量及各组绝对 AP。
- 确认消融评测协议（数据集、验证/测试划分、AP 口径），补进本卡 scope。
- 检查深度监督标签构造（LiDAR 投影→稀疏深度图→补全→One-hot，见笔记 §3）中哪一环贡献最大：去掉"补全"后增益是否仍在。

## 若成立 / 不成立意味着什么

成立：任何投影式单目 3D 方案应优先投入深度监督信号（LiDAR 稀疏监督或等价来源），不要指望检测损失顺带学出几何；无监督深度预测分支价值有限。
不成立：深度分布预测 + 外积本身（不含显式监督）即可拿到大部分增益，"显式深度监督是核心"失效，架构可省掉深度监督管线。
