---
id: claim-radarocc-cfar-pointcloud-loses-lowrcs
title: "RadarOcc 声称：CFAR 点云化丢失低 RCS 弱反射，直接处理原始 4D 雷达张量可避免该丢失"
type: claim
status: asserted
scope: "RadarOcc（NeurIPS 2024）论文自述问题诊断，据库内笔记转述；对象为 4D 成像雷达的两种输入表示——CFAR 检测后的稀疏点云 vs 原始 4D 雷达张量（4DRT）；2026-11-03 前笔记无实验章节（nightshift/cross/4d-radar.md M5 为当时状况记录），2026-11-03 笔记 §3 实验章节授权补写后已有跨框架对比数字（Table 1：RPC 输入的 OpenOccupancy 基线 vs 4DRT 输入的 RadarOcc/4DRT-XYZ），但仍无同一模型两种输入的受控对照"
tags: [4d-radar, radar-tensor, cfar, rcs, occupancy-prediction, radarocc]
note: library/3D_Occupancy/RadarOcc.md#1-概述
paper: "NeurIPS 2024 · RadarOcc: Robust 3D Occupancy Prediction with 4D Imaging Radar · https://github.com/Toytiny/RadarOcc"
stance: watch
evidence:
  - source: library/3D_Occupancy/RadarOcc.md
    locator: "§1 概述"
    quote: "但传统方法将其处理为稀疏点云，导致 CFAR（恒虚警率）检测过程中丢失了大量低 RCS（雷达散射截面）物体的弱反射信号。"
    relation: supports
  - source: library/3D_Occupancy/RadarOcc.md
    locator: "§2 方法 / 数据减量【减量后的结果】"
    quote: "同时在输入端解决了由于雷达物理特性导致的低 RCS 目标消失问题。"
    relation: supports
  - source: library/3D_Occupancy/RadarOcc.md
    locator: "§3.2 / Table 1 转录行（L-CONet，RPC 输入；2026-11-03 补写）"
    quote: "| L-CONet [3] | RPC | 46.1 / 36.0 / 25.0 | 24.6 / 20.3 / 14.4 | 43.3 / 35.4 / 25.6 | 5.8 / 5.2 / 3.1 |"
    relation: supports
  - source: library/3D_Occupancy/RadarOcc.md
    locator: "§3.2 / Table 1 转录行（RadarOcc，4DRT 输入；2026-11-03 补写）"
    quote: "| RadarOcc (Ours) | 4DRT | 48.8 / 39.1 / 30.4 | 34.3 / 28.5 / 22.6 | 47.9 / 38.2 / 29.4 | 20.7 / 18.7 / 15.8 |"
    relation: supports
falsifiers:
  - "同一占据模型分别以 CFAR 稀疏点云与原始 4DRT 为输入，低 RCS 类别（行人/骑行者）指标点云不差或更好——『CFAR 丢失弱反射造成下游损失』不成立"
  - "原文或复现显示 4DRT 相对点云的增益在控制参数量/训练配置后消失，或主要来自模型容量差异而非弱信号保留"
  - "对所讨论的雷达传感器，其 CFAR 输出在论文涉及的距离/场景内几乎不丢低 RCS 目标（例如采用保留式/低阈值 CFAR 配置），前提性诊断不成立"
review_due: 2026-12-02
related: [claim-radarocc-sss-rangewise-preserves-lowrcs, claim-radarocc-s2c-deformable-avoids-interp-degradation, claim-radarocc-sss-ablation-gain-10p2]
signoff: null
---

## 主张

论文声称（据笔记 §1 概述转述）：现有方法把雷达处理为稀疏点云，CFAR 检测这一步本身就丢失大量低 RCS 物体的弱反射；因此 RadarOcc 绕过点云化、直接处理原始 4D 雷达张量，把问题在输入端解决。

主张边界：本卡只立这条前提性诊断——CFAR 点云化丢失弱反射、原始张量输入可避免该丢失；不立「直接处理张量在占据精度上优于点云方法」。该诊断与库内其他三篇 4D 雷达笔记（R4Det / SGDet3D / HGSFusion）的稀疏性叙述同向（见 `nightshift/cross/4d-radar.md` S1），但只有 RadarOcc 把病因追溯到 CFAR 环节并给出绕开方案。

## 证据与边界

原文 Table 1（2026-11-03 笔记 §3 补写后入库）提供了与该诊断同向的**跨框架**对比：RPC（CFAR 点云）输入的 L-baseline/L-CONet 前景 IoU 仅 1.9~5.8，4DRT 输入的 RadarOcc 达 15.8~20.7（三档距离），远距离差距最大。但这是不同架构间的比较，框架、容量、训练配方同时不同，增益不能单独归因于输入表示；同一模型「仅换输入表示」的受控对照原文没有，仍是本卡 falsifier 1 的开放检查。2026-11-03 消融核查（SSS vs percentile，mIoU@12.8m −10.2）：见 claim-radarocc-sss-ablation-gain-10p2。

是否把 Table 1 的跨框架对比另立独立性能卡：待主人裁定（已登记 nightshift/QUESTIONS.md #77），本班不擅自增卡。

## 待验证

- 原文核对（2026-11-03 部分完成）：Table 1 有 RPC vs 4DRT-XYZ vs RadarOcc 的跨框架对比，数字已转录笔记 §3.2（见上「证据与边界」）；「同模型仅换输入」的受控对照原文没有。
- 复现检查：同一占据头分别吃 CFAR 点云与原始 4DRT，控制参数量与训练配置，比较行人/骑行者类别指标——点云不差或更好即触发 falsifier 1。

## 成立/不成立的含义

成立：凡依赖低 RCS 弱目标（行人/骑行者）的雷达下游任务，点云化是主要信息瓶颈，应优先考虑张量级输入。
不成立：CFAR 点云在该传感器/场景下已保留足够信息，张量路线的高算力代价不划算，输入表示维持点云 + 特征层补偿即可。

## 核查记录

- 建卡（日期未记录）：诊断主张据笔记 §1/§2 转述；当时笔记无实验章节。
- 2026-11-05（02 任务书整理班）：scope 历史分层（M5「无实验章节」标注为 2026-11-03 前状况，补写后状态另述）；补 2 条笔记 Table 1 跨框架对比行作 evidence（Grep 逐字命中）；正文补「跨框架证据、受控对照仍缺」的证据边界；待验证第一条标记部分完成。主张命题未动。id/status/stance/review_due/signoff 未动。
