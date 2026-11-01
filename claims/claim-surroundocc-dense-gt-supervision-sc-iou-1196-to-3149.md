---
id: claim-surroundocc-dense-gt-supervision-sc-iou-1196-to-3149
title: "SurroundOcc 声称：nuScenes 消融中把监督信号从稀疏点云换成密集真值后，SC IoU 从 11.96% 升至 31.49%"
type: claim
status: asserted
scope: "nuScenes 上 SurroundOcc 自身消融（单一变量：稀疏点云监督 → 密集真值监督）；论文自报数字，据库内笔记 §5.2 转述，尚未独立验证；笔记未注明数据集划分、评测协议版本、消融两侧的具体训练配置（输入帧数 / 迭代数 / 监督层级数）"
tags: [occupancy-prediction, dense-gt, nuscenes, surroundocc, ablation]
note: library/3D_Occupancy/SurroundOcc.md#52-关键消融实验结论
paper: "ICCV 2023 · SurroundOcc: Multi-Camera 3D Occupancy Prediction for Autonomous Driving · arXiv:2303.09551 · https://github.com/weiyithu/SurroundOcc"
stance: watch
evidence:
  - source: library/3D_Occupancy/SurroundOcc.md
    locator: "§5.2 关键消融实验结论"
    quote: "SC IoU 从 **11.96% 飙升至 31.49%**"
    relation: supports
  - source: library/3D_Occupancy/SurroundOcc.md
    locator: "§3 密集占用真值生成"
    quote: "**泊松曲面重建 (Poisson Reconstruction)**：通过求解泊松方程将离散点转换为连续曲面网格 $\\mathcal{M}$，填补物理孔洞。"
    relation: supports
falsifiers:
  - "同设置复现该消融：密集真值监督侧 SC IoU 明显低于 31.49，或相对稀疏点云监督侧的提升远小于 11.96 → 31.49 的幅度"
  - "对照 arXiv:2303.09551 原文消融表核对，发现 11.96 / 31.49 两数并非来自该单一变量替换（如混入了输入帧数、网络结构等其他变量，或笔记转抄错误）"
  - "复现中密集真值本身质量不合格（泊松重建孔洞 / 语义传播错误），导致其监督效果不优于多帧拼接的稀疏点云监督"
review_due: 2026-12-02
related: [claim-surroundocc-poisson-reconstruction-dense-gt-pipeline, claim-surroundocc-nuscenes-iou-3149-miou-2030-table-lead]
signoff: null
---

## 我的理解

论文声称（据笔记 §5.2 转述，尚未独立验证）：在 nuScenes 上，其余配置不变、仅把监督信号从原始稀疏点云替换为离线生成的密集占用真值，SC IoU（几何）从 11.96% 升至 31.49%，接近翻两番。这是本篇笔记里幅度最大的一处消融，也是笔记总结「数据是王道」的依据。密集真值本身由 §3 的离线 pipeline 生成，见 [pipeline 卡](claim-surroundocc-poisson-reconstruction-dense-gt-pipeline.md)。

限定与注意：
1. 11.96% 是「稀疏点云监督下的 SurroundOcc」的绝对值，不能当作任何其他方法或设置的基线读数。
2. 笔记未给出该消融的表格行，只有一句结论；11.96 / 31.49 两个数字目前仅笔记单源，arXiv 摘要无数字可核对，须回原文消融表。
3. 笔记另称 31.49 与 §5.1 对比表中 SurroundOcc 整型行 SC IoU 一致，即该消融「密集真值侧」≈ 完整模型，见 [对比表卡](claim-surroundocc-nuscenes-iou-3149-miou-2030-table-lead.md)。

## 待验证

- 回 arXiv:2303.09551（v2）消融表核对 11.96 / 31.49 两个数字及其变量定义。
- 用官方实现（github.com/weiyithu/SurroundOcc）复现稀疏点云监督 vs 密集真值监督两侧训练，核对 SC IoU 差距。
- 检查密集真值生成质量：泊松重建的孔洞率、语义传播的标签错误率。

## 若成立 / 不成立意味着什么

成立：占据预测的瓶颈首先在监督信号密度而非网络结构，自研占据方案应优先投入密集真值生产（多帧拼接 + 曲面重建）这条数据管线。
不成立：性能提升主要来自其他因素（结构 / 训练技巧 / 配置差异），「密集真值决定论」不成立，选型时数据管线投入降级。
