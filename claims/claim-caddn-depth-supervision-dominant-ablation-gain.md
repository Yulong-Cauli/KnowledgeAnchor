---
id: claim-caddn-depth-supervision-dominant-ablation-gain
title: "CaDDN 消融自报：显式 LiDAR 深度监督带来全表最大单项增益 +10.4% AP，无监督深度预测仅 +1.5% AP"
type: claim
status: asserted
scope: "CaDDN（CVPR 2021）内部模块消融，笔记 §4 Table 3（Exp 1–5 逐步加模块）；单目 3D 检测，深度监督标签由 LiDAR 点云投影生成 One-hot（笔记 §3 Loss Function）；口径：KITTI val set（官方 3,712 train / 3,769 val 划分，消融仅在 train 训练、val 评测）Car 类 3D 检测 AP|R40（IoU 0.7）、Easy/Moderate/Hard 三档（笔记 §4 口径注载明，2026-11-05 实抓原论文 Table 3 表题/表体二次核对）；+1.5% / +10.4% 为 Easy 档差值（Mod/Hard 档差值更小），数字为论文自报相对增量（Δ AP）"
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
  - source: library/Classical_Detection/CaDDN.md
    locator: "§4 消融实验 / 口径注（2026-11-03 补）"
    quote: "本节 Table 3 / Table 4 的数字均为论文在 **KITTI val set**（官方 3,712 train / 3,769 val 划分，消融仅在 train 上训练、在 val 上评测）上的 **Car 类 3D 检测 AP|R40**（Car IoU 阈值 0.7），按 Easy / Moderate / Hard 三档报告。"
    relation: supports
  - source: https://arxiv.org/pdf/2103.01100v2
    locator: "§4.2 Table 3 Exp 2 行（无监督深度预测；pdftotext -layout 提取，列间空格为排版对齐，抓取 2026-11-05）"
    quote: "2      X                               9.33     6.43     5.30"
    relation: supports
  - source: https://arxiv.org/pdf/2103.01100v2
    locator: "§4.2 Table 3 Exp 3 行（加 LiDAR One-hot 深度监督；pdftotext -layout 提取，列间空格为排版对齐，抓取 2026-11-05）"
    quote: "3      X       X                      19.73 14.03 11.84"
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

论文声称（CaDDN Table 3 内部模块消融，逐步加模块）：Exp 1 基线不预测深度、把图像特征沿视锥射线均匀复制，效果最差（特征拖影）；Exp 2 预测深度分布用来加权特征但不加 LiDAR 深度监督、仅靠检测损失，只涨 +1.5% AP；Exp 3 加入 $L_{depth}$（LiDAR one-hot 监督）后 +10.4% AP，为全表最大单项提升。本卡主张：在 CaDDN 式"图像→视锥→BEV"单目方案里，核心增益来源是显式深度监督，而不是深度预测分支本身。

消融口径：KITTI val（3,712/3,769 划分）Car 类 AP|R40（IoU 0.7）三档——笔记 §4 口径注已载明，本班 2026-11-05 实抓原论文（arXiv:2103.01100v2）Table 3 表题与表体二次核对；Exp 2→Exp 3 增量为 Easy +10.40（9.33→19.73）、Mod +7.60（6.43→14.03）、Hard +6.54（5.30→11.84），「全表最大单项提升」在三个难度档上均成立；Exp 1→Exp 2（深度分布分支本身，无监督）三档仅 +1.50/+0.77/+0.46。数字为论文自报。

## 待验证

- 用 OpenPCDet 复现 Table 3 Exp 2 vs Exp 3，核对三档增量（Easy +10.40 / Mod +7.60 / Hard +6.54）与绝对 AP（9.33/6.43/5.30 → 19.73/14.03/11.84）。
- 已核对（2026-11-05）：消融协议为 KITTI val / Car AP|R40（IoU 0.7）Easy/Mod/Hard 三档（笔记 §4 口径注 + 原论文 Table 3 表题，见 evidence），已补进 scope；Exp 2/3 两行绝对 AP 亦逐值核对。
- 检查深度监督标签构造（LiDAR 投影→稀疏深度图→补全→One-hot，见笔记 §3）中哪一环贡献最大：去掉"补全"后增益是否仍在。

## 若成立 / 不成立意味着什么

成立：任何投影式单目 3D 方案应优先投入深度监督信号（LiDAR 稀疏监督或等价来源），不要指望检测损失顺带学出几何；无监督深度预测分支价值有限。
不成立：深度分布预测 + 外积本身（不含显式监督）即可拿到大部分增益，"显式深度监督是核心"失效，架构可省掉深度监督管线。
