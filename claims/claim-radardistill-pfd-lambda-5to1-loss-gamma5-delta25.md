---
id: claim-radardistill-pfd-lambda-5to1-loss-gamma5-delta25
title: "RadarDistill 声称 PFD 中 TP∪FN:FP 权重为 5:1（σ=0.1，按区域像素数归一化），总损失权重 γ=5、δ=25"
type: claim
status: asserted
scope: "超参配置主张（笔记 §PFD 与 §损失函数，对应论文公式 (11)–(15)、(18)）；σ=0.1、λ1=5、λ2=1、γ=5、δ=25 已对照 arXiv:2403.05061v3 正文核实与笔记一致（2026-11-02 抓取），开源 cfg 与复现仍未核实；笔记未记录超参敏感性分析；教师/学生骨干为 Pillar 编码 + SparseEnc/DenseEnc（README）；数字仍为论文自报，尚未独立验证"
tags: [knowledge-distillation, proposal-based, hyperparameters, radar, lidar, loss-design, cvpr2024, radardistill]
note: "library/Multimodal_Fusion/RadarDistill.md#pfd-基于建议框的特征蒸馏--针对考试结果查漏补缺"
paper: "CVPR 2024, RadarDistill: Boosting Radar-based Object Detection Performance via Knowledge Distillation from LiDAR Features (arXiv:2403.05061)"
stance: watch
evidence:
  - source: library/Multimodal_Fusion/RadarDistill.md
    locator: "§PFD / 三类过滤器（对应论文公式 (11)–(13)）"
    quote: "**$\\sigma$**：阈值（论文设为 0.1）。超过这个线就算“有”。"
    relation: supports
  - source: library/Multimodal_Fusion/RadarDistill.md
    locator: "§PFD / 权重（对应论文公式 (14)）"
    quote: "$\\lambda_1$ 对应真实物体区域（TP+FN）。论文设为 **5**。"
    relation: supports
  - source: library/Multimodal_Fusion/RadarDistill.md
    locator: "§PFD / 权重（对应论文公式 (14)）"
    quote: "$\\lambda_2$ 对应误报区域（FP）。论文设为 **1**。"
    relation: supports
  - source: library/Multimodal_Fusion/RadarDistill.md
    locator: "§损失函数 / 公式 (18)"
    quote: "**权重**：由参数 $\\gamma$ 控制，论文里设为 5。"
    relation: supports
  - source: library/Multimodal_Fusion/RadarDistill.md
    locator: "§损失函数 / 公式 (18)"
    quote: "**权重**：由参数 $\\delta$ 控制，论文里设为 25。注意这个权重很大！说明作者认为高层语义的模仿非常关键。"
    relation: supports
  - source: https://arxiv.org/pdf/2403.05061v3
    locator: "§3.4 Proposal-based Feature Distillation（σ 定义，跨行连字符已还原；pdftotext -layout 提取，抓取 2026-11-02）"
    quote: "where σ represents the threshold parameter set to 0.1 in our setup."
    relation: supports
  - source: https://arxiv.org/pdf/2403.05061v3
    locator: "§4.1 Implementation details（λ1/λ2 设置；pdftotext -layout 提取，抓取 2026-11-02）"
    quote: "λ1 and λ2 in (14) were set to 5 and 1, respectively."
    relation: supports
  - source: https://arxiv.org/pdf/2403.05061v3
    locator: "§4.1 Implementation details（γ/δ 设置；pdftotext -layout 提取，抓取 2026-11-02）"
    quote: "parameters γ and δ in (18) were set to 5 and 25, respectively."
    relation: supports
falsifiers:
  - "对照 arXiv:2403.05061 公式 (11)–(15)、(18) 或超参表：σ、λ1、λ2、γ、δ 任一与笔记记录不符"
  - "开源仓库 cfgs/radar_distill 中对应 loss 权重默认值与上述数值不一致（笔记转述有误或实现与论文脱节）"
  - "复现中按此配置训练不收敛或显著低于自报性能，需改配置才能对齐 20.5 / 43.7"
review_due: 2026-12-02
related: [claim-radardistill-lidar-teacher-boosts-radar-only-detection, claim-radardistill-afd-ar-ir-adaptive-weighting]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：PFD 以热图阈值 σ=0.1 把学生预测分为 TP（答对，逼近）、FP（瞎猜，抑制）、FN（漏检，唤醒）三类；权重按公式 (14)：TP∪FN 区域 λ1=5、FP 区域 λ2=1、背景 0，且除以区域像素数（N_TP+N_FN、N_FP）做平均化，防止大面积 FP 用数量优势淹没 TP 的 Loss；特征先沿 channel 维 softmax 归一（抹平两模态绝对数值差异）再做加权 L1。总损失 L_total = L_det + γ·L_AFD + δ·L_PFD，γ=5、δ=25。

必须记住的口径限制：
1. 数字本身已于 2026-11-02 复审时对照 arXiv:2403.05061v3 正文逐个核实（σ=0.1、λ1=5、λ2=1、γ=5、δ=25，与笔记转述一致）；但「开源 cfg 默认值是否与论文一致」「按此配置能否复现 20.5/43.7」仍未核——EMC2 笔记表格错位（claim-emc2-note-table-mismatch）的教训在这里同样适用，卡片维持 asserted。
2. 「δ=25 远大于 γ=5 说明高层语义模仿更关键」是笔记作者的解读，不是笔记给出的消融结论。

## 待验证

- 已核对（2026-11-02）：arXiv v3 正文 σ/λ1/λ2/γ/δ 五个数与笔记一致（见 evidence）。
- 查开源仓库 cfgs/radar_distill/*.yaml 中对应 loss 权重默认值是否与论文一致。
- 复现时按此配置训练一次，确认能对齐 README 自报的 20.5 / 43.7（关联主卡）。

## 若成立 / 不成立意味着什么

成立：这组超参可直接作为雷达蒸馏复现起点；δ≫γ 的配置提示 proposal 级蒸馏主导收益，后续蒸馏方案可优先调 proposal 级项。
不成立：任一数字与原文不符，需修订笔记并重估「高层蒸馏主导」的解读；复现起点改为以开源 cfg 为准。
