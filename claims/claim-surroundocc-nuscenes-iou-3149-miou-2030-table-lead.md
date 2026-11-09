---
id: claim-surroundocc-nuscenes-iou-3149-miou-2030-table-lead
title: "SurroundOcc 声称：nuScenes 3D 占用预测对比表中，纯相机输入达 SC IoU 31.49 / SSC mIoU 20.30，高于 BEVFormer（30.50 / 16.75）与 TPVFormer（30.86 / 17.10）"
type: claim
status: asserted
scope: "nuScenes 3D 占用预测（笔记未注明 val/test 划分与是否 Occ3D-nuScenes 协议）；三方法均为纯相机（Camera）输入；论文自报对比表数字，据库内笔记 §5.1 转述；笔记未说明基线两行是同硬件复现还是引用各自原文"
tags: [occupancy-prediction, nuscenes, surroundocc, bevformer, tpvformer, multi-camera]
note: library/3D_Occupancy/SurroundOcc.md#51-nuscenes-性能对比
paper: "ICCV 2023 · SurroundOcc: Multi-Camera 3D Occupancy Prediction for Autonomous Driving · arXiv:2303.09551 · https://github.com/weiyithu/SurroundOcc"
stance: watch
evidence:
  - source: library/3D_Occupancy/SurroundOcc.md
    locator: "§5.1 nuScenes 性能对比 / 对比表"
    quote: "| **SurroundOcc** | **Camera** | **31.49**         | **20.30**           |"
    relation: supports
  - source: library/3D_Occupancy/SurroundOcc.md
    locator: "§5.1 nuScenes 性能对比 / 对比表"
    quote: "| BEVFormer       | Camera     | 30.50             | 16.75               |"
    relation: supports
  - source: library/3D_Occupancy/SurroundOcc.md
    locator: "§5.1 nuScenes 性能对比 / 对比表"
    quote: "| TPVFormer       | Camera     | 30.86             | 17.10               |"
    relation: supports
falsifiers:
  - "同协议复现中 SurroundOcc 的 SC IoU 低于 30.86 或 SSC mIoU 低于 17.10（即不再高于同表两条基线）"
  - "对照 arXiv:2303.09551 原文表格核对，发现笔记三行数字或行列对应关系转抄错误"
  - "基线口径不对等：BEVFormer / TPVFormer 两行系引用各自原文（不同真值密集化处理、输入分辨率、训练时长），『同表更高』失去可比性"
review_due: 2026-12-02
related: [claim-surroundocc-dense-gt-supervision-sc-iou-1196-to-3149, claim-surroundocc-3d-voxel-query-vertical-structure-advantage]
signoff: null
---

## 我的理解

论文声称（据笔记 §5.1 转述）：在 nuScenes 3D 占用预测上，纯相机输入的 SurroundOcc 取得 SC IoU 31.49 / SSC mIoU 20.30，同表高于 BEVFormer（30.50 / 16.75）与 TPVFormer（30.86 / 17.10）。注意差距的结构：语义侧（SSC mIoU +3.2 以上）明显大于几何侧（SC IoU 仅 +0.63 ~ +0.99），本卡主张是「同表更高」，不是「大幅领先」或 SOTA——笔记只列了这两条早期基线，不含与同期更强的占用方法的对比。

限定与注意：
1. 笔记未注明数据集划分（val / test）与评测协议版本，也未说明基线数字来源；跨论文对比口径常不可比（[EMC2 卡](claim-emc2-orin-sub400ms-leading-accuracy.md)的前车之鉴），故 scope 写明「自报对比表」。
2. 三个 SurroundOcc 数字（31.49 / 20.30）已逐字复制自笔记并用 Grep 验证；arXiv 摘要无数字，表行须回原文核对。
3. 论文实验另含 SemanticKITTI（arXiv 摘要提及，抓取于 2026-11-02），笔记 §5 未覆盖，不在本卡口径内。

## 待验证

- 回 arXiv:2303.09551 原文表格核对三行数字，确认数据集划分与基线数字来源（复现 or 引用）。
- 用官方实现在 Occ3D-nuScenes（以原文为准的协议）上复测 SC IoU / SSC mIoU。
- 与更新的相机占据方法（如 SparseOcc 系）同表对比，确认 31.49 / 20.30 在 2026 年视角下的实际水位。

## 若成立 / 不成立意味着什么

成立：纯相机路线在 2023 年时间点可同时拿到可用几何与语义占据，2D-3D 空间注意力 + 3D U-Net 可作为多相机占据基线保留。
不成立：数字优势依赖口径不对等或转抄错误，选型回到 BEV 压缩 + 语义后处理，或直接跳到更新架构。
