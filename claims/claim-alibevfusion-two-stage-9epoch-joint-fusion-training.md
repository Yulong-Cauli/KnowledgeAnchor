---
id: claim-alibevfusion-two-stage-9epoch-joint-fusion-training
title: "阿里版 BEVFusion 声称两阶段训练：两流独立预训练后再联合训练融合 9 epochs（含 BEV 空间增强）"
type: claim
status: asserted
scope: "阿里版 BEVFusion（NeurIPS 2022，ADLab-AutoDrive）训练协议描述；口径为笔记 §4 的方法转述，笔记无实验数字，本卡只主张训练流程本身（两阶段划分、9 epochs、BEV 空间增强），不主张该协议带来的性能增益；'9 epochs' 仅指笔记所记第二阶段联合融合训练时长，第一阶段 epoch 数笔记未载"
tags: [bevfusion-ali, lidar-camera-fusion, training-protocol, two-stage-training]
note: library/Multimodal_Fusion/Ali-BEVFusion.md#4-检测头与训练策略-detection-head-training
paper: "NeurIPS 2022 阿里版 BEVFusion（开源地址见笔记头部；论文全名笔记未载，待人工补核）"
stance: watch
evidence:
  - source: library/Multimodal_Fusion/Ali-BEVFusion.md
    locator: "§4 检测头与训练策略 (Detection Head & Training)"
    quote: "分别独立训练激光雷达流和摄像头流"
    relation: supports
  - source: library/Multimodal_Fusion/Ali-BEVFusion.md
    locator: "§4 检测头与训练策略 (Detection Head & Training)"
    quote: "继承两个预训练流的权重，再进行 9 个 epoch 的联合融合训练"
    relation: supports
  - source: library/Multimodal_Fusion/Ali-BEVFusion.md
    locator: "§4 检测头与训练策略 (Detection Head & Training)"
    quote: "该阶段还会加入 BEV 空间的增强技术"
    relation: supports
falsifiers:
  - "官方仓库训练配置/脚本与该描述不符：第二阶段联合训练 epochs 不是 9、无两阶段流程、第二阶段未加载两流预训练权重、或第二阶段实际重训两流而非以预训练权重为起点"
  - "论文原文实验设置给出的训练流程或 epoch 数与笔记不符（'9 个 epoch' 为网页转贴数字，存在转写误差可能——EMC2 笔记表格错位即前车之鉴，见 claim-emc2-note-table-mismatch）"
review_due: 2026-12-02
related: [claim-alibevfusion-dynamic-fusion-se-channel-attention, claim-alibevfusion-camera-stream-lidar-independent-bev, claim-alibevfusion-lidar-stream-backbone-compatible]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：训练分两阶段——第一阶段分别独立训练 LiDAR 流与相机流；第二阶段继承两个预训练流的权重，进行 9 个 epoch 的联合融合训练，并加入 BEV 空间的增强技术。该协议与架构强耦合：正因为两流独立（见[相机流独立卡](claim-alibevfusion-camera-stream-lidar-independent-bev.md)），才能各自预训练，融合阶段才需要联合调——调的对象主要是动态融合模块（见[动态融合卡](claim-alibevfusion-dynamic-fusion-se-channel-attention.md)）。

笔记 §4 没有任何实验数字（9 epochs 无对照、无消融），本卡只描述协议本身。

## 待验证

- 读官方仓库训练配置：两阶段脚本是否存在；第二阶段 epochs 是否为 9；预训练权重的加载与冻结方式；BEV 空间增强具体指什么（笔记未展开）。
- 找论文原文实验设置核对 epoch 数与两阶段流程——网页转贴的数字必须对原文（前车之鉴：EMC2 笔记表格错位，见 claim-emc2-note-table-mismatch）。

## 若成立 / 不成立意味着什么

成立：复用该框架时可沿用"两流各自预训练 + 短程（9 epochs）联合微调"的配方，联合训练成本可控，也便于把现成单模态模型接入融合。不成立（epochs 数或两阶段描述与仓库/原文不符）：训练协议以仓库为准重写，笔记 §4 的转写可靠性整体降级，本笔记阿里版其余章节的数字与表述也需加严核对。
