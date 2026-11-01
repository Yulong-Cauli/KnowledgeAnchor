---
id: claim-radarocc-s2c-deformable-avoids-interp-degradation
title: "RadarOcc 声称：硬性球转直坐标插值因采样非均匀导致特征退化，改用可学习可变形交叉注意力聚合避免"
type: claim
status: asserted
scope: "RadarOcc（NeurIPS 2024）论文自述设计动机，据库内笔记转述，尚未独立验证；对象为球坐标特征图到笛卡尔占据体素的 S2C 转换环节，比较对象为三线性插值等硬性几何变换 vs 可学习 Voxel Queries + 3D 可变形交叉注意力；笔记无实验章节（见 nightshift/cross/4d-radar.md M5），无与笛卡尔直接编码基线的任何对比数字"
tags: [4d-radar, occupancy-prediction, spherical-coordinates, deformable-attention, radarocc]
note: library/3D_Occupancy/RadarOcc.md#2-方法
paper: "NeurIPS 2024 · RadarOcc: Robust 3D Occupancy Prediction with 4D Imaging Radar · https://github.com/Toytiny/RadarOcc"
stance: watch
evidence:
  - source: library/3D_Occupancy/RadarOcc.md
    locator: "§2 方法 / S2C Aggregation【核心动机】"
    quote: "**采样非均匀性**：近处体素在球坐标中对应极多采样点，远处体素对应极少，插值会导致特征严重退化或走样。"
    relation: supports
  - source: library/3D_Occupancy/RadarOcc.md
    locator: "§2 方法 / S2C Aggregation【5. 跨维度对齐的优势】"
    quote: "**消除插值误差**：这种“基于查询”的聚合方式将坐标转换过程纳入了端到端的学习中，避免了传统插值带来的特征平滑问题。"
    relation: supports
  - source: library/3D_Occupancy/RadarOcc.md
    locator: "§2 方法 / 基于球坐标的特征编码"
    quote: "基于球坐标的特征编码（Spherical-based Feature Encoding）是 RadarOcc 处理 4D 雷达数据的核心设计，其目的是解决雷达采样物理特性与标准笛卡尔坐标系建模之间的几何失配问题。"
    relation: supports
falsifiers:
  - "在同一 RadarOcc 框架内把可变形交叉注意力 S2C 替换为三线性插值硬映射，下游占据精度持平或更高——『插值导致特征严重退化』不成立"
  - "原文实验部分（笔记未记录，需回原文核对）显示 S2C 聚合模块的消融增益可忽略或不稳定，则本主张失去支撑"
  - "直接在笛卡尔坐标系对 4DRT 编码（不经球坐标特征提取）即可达到同等精度，则『几何失配必须用球坐标编码 + 可学习聚合解决』的路线声称不成立"
review_due: 2026-12-02
related: [claim-radarocc-sss-rangewise-preserves-lowrcs, claim-radarocc-cfar-pointcloud-loses-lowrcs]
signoff: null
---

## 我的理解

论文声称（据笔记 §2 方法转述，尚未独立验证）：雷达物理采样在球坐标、占据任务定义在笛卡尔体素，直接用三线性插值等硬性几何变换会因采样非均匀（近处体素对应极多采样点、远处极少）导致特征退化或走样；RadarOcc 的对策是保持球坐标特征提取，并用可学习 Voxel Queries + 3D 可变形交叉注意力把坐标转换纳入端到端学习。

TODO 提示方向是「球坐标编码是否稳定优于笛卡尔基线」——笔记没有实验章节，没有任何「球坐标 vs 笛卡尔」的对比数字，故本卡**不立** stable-beats-Cartesian 类性能主张，只立「插值退化动机 + 可学习聚合对策」这条窄主张。是否成立须由消融（S2C 替换为插值）或同框架笛卡尔基线实验裁决。另注意 `nightshift/cross/4d-radar.md` C1：HGSFusion 笔记称 4D 雷达高度角分辨率不足、3D 占据引入噪声，与本篇倚重俯仰维的路线表态相反，两处口径（纯雷达张量占据 vs 融合检测中的空间模式）不同，横向引用时必须带各自的 scope。

## 待验证

- 回 RadarOcc 原文核对实验部分：是否有 S2C 消融（可变形交叉注意力 vs 三线性插值）以及球坐标 vs 笛卡尔编码对比表，抄录数字后另立性能卡。
- 复现：在开源实现（github.com/Toytiny/RadarOcc）中把 S2C 采样替换为三线性插值，同训练配置比较 mIoU。

## 若成立 / 不成立意味着什么

成立：非均匀采样传感器（雷达、深度相机）到任务空间的坐标转换应优先可学习聚合而非硬插值，可作为自研管线的设计默认。
不成立：硬插值在该分辨率/尺度下足够，S2C 模块属过度设计，路线选择回到简单几何变换 + 后端补偿。
