---
id: claim-caddn-soft-depth-distribution-beats-hard-argmax
title: "CaDDN 消融自报：联合训练下用完整深度概率分布（Soft）替代 Argmax 硬选择带来 +2.96% AP"
type: claim
status: asserted
scope: "CaDDN（CVPR 2021）深度估计策略消融，笔记 §4 Table 4 Exp 4 vs Exp 5；两组均为端到端联合训练、同一结构，仅生成视锥特征时用完整概率分布（Soft，G = D ⊗ F）vs 取 Argmax 单 Bin（Hard）；单目 3D 检测；口径：KITTI val set（3,712/3,769 划分）Car 类 3D 检测 AP|R40（IoU 0.7）、Easy/Moderate/Hard 三档（笔记 §4 口径注载明，2026-11-05 实抓原论文 Table 4 表题/表体二次核对）；+2.96% 为 Easy 档差值（Mod/Hard 分别 +2.60/+1.88），数字为论文自报相对增量"
tags: [caddn, monocular-3d, depth-distribution, uncertainty, frustum, ablation]
note: library/Classical_Detection/CaDDN.md#4-消融实验
paper: "CVPR 2021, CaDDN: Categorical Depth Distribution Network for Monocular 3D Object Detection"
stance: watch
evidence:
  - source: library/Classical_Detection/CaDDN.md
    locator: "§4 / Table 4 Exp 5"
    quote: "对比 Exp 5 vs 4，性能显著提升 (+2.96% AP)。 **结论**：证明保留深度的**不确定性（Uncertainty）**至关重要。"
    relation: supports
  - source: library/Classical_Detection/CaDDN.md
    locator: "§4 / 结论要点"
    quote: "保留概率分布（Soft）比直接选一个深度值（Hard）有更高的容错率，是单目 3D 检测的关键 (Table 4 Exp 5 vs 4)。"
    relation: supports
  - source: library/Classical_Detection/CaDDN.md
    locator: "§2 / 视锥特征网络"
    quote: "不回归单一深度值，而是预测分布以保留**不确定性（Uncertainty）**。"
    relation: supports
  - source: library/Classical_Detection/CaDDN.md
    locator: "§4 消融实验 / 口径注（2026-11-03 补）"
    quote: "本节 Table 3 / Table 4 的数字均为论文在 **KITTI val set**（官方 3,712 train / 3,769 val 划分，消融仅在 train 上训练、在 val 上评测）上的 **Car 类 3D 检测 AP|R40**（Car IoU 阈值 0.7），按 Easy / Moderate / Hard 三档报告。"
    relation: supports
  - source: https://arxiv.org/pdf/2103.01100v2
    locator: "§4.2 Table 4 Exp 4 行（联合训练 + Argmax 硬选择；pdftotext -layout 提取，列间空格为排版对齐，抓取 2026-11-05）"
    quote: "4        CaDDN           Joint          20.61 13.71 11.96"
    relation: supports
  - source: https://arxiv.org/pdf/2103.01100v2
    locator: "§4.2 Table 4 Exp 5 行（联合训练 + Soft 完整分布；pdftotext -layout 提取，列间空格为排版对齐，抓取 2026-11-05）"
    quote: "5        CaDDN           Joint    X 23.57 16.31 13.84"
    relation: supports
falsifiers:
  - "复现 Table 4 Exp 4 vs Exp 5：Hard（Argmax）不劣于甚至优于 Soft 完整分布，或增量显著偏离 +2.96% AP"
  - "Soft 的优势只在特定 Bin 数 / 深度范围设置下出现，更换设置后消失或反向"
  - "笔记转载数字与原论文 Table 4 不符"
review_due: 2026-12-02
related: [claim-caddn-depth-supervision-dominant-ablation-gain, claim-caddn-joint-training-beats-frozen-depth-branch, claim-caddn-lid-discretization-beats-uniform]
signoff: null
---

## 我的理解

论文声称：Table 4 中 Exp 4 与 Exp 5 均为端到端联合训练、同一结构，唯一差别是生成视锥特征时 Exp 4 只取概率最大的深度 Bin（Argmax，Hard），Exp 5 用完整概率分布做外积（Soft）；Soft 比 Hard 高 +2.96% AP。论文的解读是保留深度不确定性至关重要：网络拿不准时把特征分散到多个 Bin，比武断选一个（可能选错）容错率更高。笔记 §2 的设计主张（深度分支不回归单一深度值、预测分类分布）即由该消融支撑。

口径：KITTI val Car AP|R40 三档（笔记 §4 口径注载明，本班 2026-11-05 实抓原论文 arXiv:2103.01100v2 Table 4 表题与表体二次核对）；+2.96% 为 Easy 档差值（20.61→23.57），Mod/Hard 档分别 +2.60/+1.88，三档方向一致。数字为论文自报。注意 Exp 5 vs 4 的对比建立在两组都已联合训练的前提上，与联合训练本身的增益（Exp 4 vs 3，见姊妹卡）是两件事。

## 待验证

- 用 OpenPCDet 复现 Exp 4 vs Exp 5，核对三档增量（Easy +2.96 / Mod +2.60 / Hard +1.88）与绝对 AP（20.61/13.71/11.96 → 23.57/16.31/13.84）。
- 已核对（2026-11-05）：原论文 Table 4 表题（KITTI val / AP|R40）与 Exp 4/5 行绝对值逐值核对（见 evidence），+2.96% 为 Easy 档差值。
- 变化 Bin 数 D 与深度范围，确认 Soft 优势是否稳健。
- 检查 Hard 实现细节（Argmax 是否含梯度近似 / 直通估计），排除实现差异造成的差距。

## 若成立 / 不成立意味着什么

成立：单目 3D 检测中深度表示应保留分布而非退化为点估计；下游做视锥特征生成时默认用 Soft 加权。
不成立：Hard 选择即可，"分布保留不确定性"的设计主张失效，可省掉按分布加权的计算。
