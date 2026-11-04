---
id: claim-radarocc-sss-rangewise-preserves-lowrcs
title: "RadarOcc 声称：逐距离单元 Top-Nr 稀疏化（SSS）相比全局百分比筛选可保留低 RCS 弱信号并抑制旁瓣"
type: claim
status: asserted
scope: "RadarOcc（NeurIPS 2024）论文自述设计动机，据库内笔记转述，尚未独立验证；对象为原始 4D 雷达张量（R×A×E×D）输入端的功率稀疏化，比较对象为全局百分比（Global Percentile）筛选 vs 每个距离单元内独立 Top-Nr 筛选；2026-11-03 前笔记无实验章节（nightshift/cross/4d-radar.md M5 为当时状况记录），2026-11-03 笔记 §3 补写后已有对应消融数字（K-Radar well-condition test、自定义 IoU/mIoU 协议：SSS 换 percentile 后 mIoU@12.8m −10.2、FG IoU −14.8，见 claim-radarocc-sss-ablation-gain-10p2）；本卡仍只立设计动机主张，性能主张归 sss-ablation 卡"
tags: [4d-radar, radar-tensor, occupancy-prediction, sidelobe, sparsification, radarocc]
note: library/3D_Occupancy/RadarOcc.md#2-方法
paper: "NeurIPS 2024 · RadarOcc: Robust 3D Occupancy Prediction with 4D Imaging Radar · https://github.com/Toytiny/RadarOcc"
stance: watch
evidence:
  - source: library/3D_Occupancy/RadarOcc.md
    locator: "§2 方法 / 数据减量【旁瓣感知空间稀疏化 (SSS)】"
    quote: "**弱信号丢失**：远距离目标或低 RCS 目标（如行人、自行车）的信号功率远低于近处强目标的旁瓣，从而被直接过滤。"
    relation: supports
  - source: library/3D_Occupancy/RadarOcc.md
    locator: "§2 方法 / 数据减量【旁瓣感知空间稀疏化 (SSS)】"
    quote: "**保证召回率**：由于筛选是在各个距离层级内部完成的，远处的行人（即使绝对功率低）只要在其所在的距离层级内相对显著，就会被保留。"
    relation: supports
  - source: library/3D_Occupancy/RadarOcc.md
    locator: "§2 方法 / 数据减量【旁瓣感知空间稀疏化 (SSS)】"
    quote: "**抑制旁瓣**：在同一距离层级内，主瓣功率必然高于其旁瓣，Top-$N_r$ 能够优先选择主瓣中心，从而自然地过滤掉同一距离轴上的扩散噪声。"
    relation: supports
  - source: library/3D_Occupancy/RadarOcc.md
    locator: "§3.3 / Table 2 转录行 (c)（2026-11-03 补写；动机主张的实验对应物，性能主张归 claim-radarocc-sss-ablation-gain-10p2）"
    quote: "| (c) | Ours w/o SSS（换成 percentile-based 稀疏化 [42, 46]） | 44.2 / 36.8 / 28.7 | 24.1 / 20.2 / 15.6 | 42.3 / 35.6 / 27.6 | 5.9 / 4.7 / 3.5 |"
    relation: supports
falsifiers:
  - "在同一 4DRT 占据模型上，全局百分比稀疏化与 range-wise Top-Nr 的下游 mIoU 或低 RCS 类别（行人/骑行者）召回相当，或全局筛选更好——论文的动机主张不成立"
  - "range-wise Top-Nr 保留元素中的旁瓣占比不低于全局百分比筛选，即『抑制旁瓣』没有实证差异"
  - "同稀疏度下随机筛选带来与 SSS 相同的下游增益，说明收益来自容量/算力下降而非弱信号保留"
review_due: 2026-12-02
related: [claim-radarocc-cfar-pointcloud-loses-lowrcs, claim-radarocc-s2c-deformable-avoids-interp-degradation, claim-radarocc-sss-ablation-gain-10p2]
signoff: null
---

## 我的理解

论文声称（据笔记 §2 方法转述，尚未独立验证）：对 4D 雷达张量做功率稀疏化时，全局百分比筛选会把远处/低 RCS 目标（行人、自行车）的弱反射连同旁瓣噪声一起错误处理——弱信号被过滤、旁瓣被保留；而 SSS 改为在每个距离单元（Range bin）内独立取 Top-$N_r$，由于同一距离层级内主瓣功率必然高于其旁瓣，可以同时「保证召回率」并「抑制旁瓣」。

必须记住的限定：本卡只立「设计动机」这一窄主张，「SSS 在实验上优于全局筛选」的性能主张由 [sss-ablation 卡](claim-radarocc-sss-ablation-gain-10p2.md) 单独立卡（2026-11-03 核查产出：Table 2 行 (c) 显示换成 percentile 后 FG IoU 从 20.7/18.7/15.8 塌到 5.9/4.7/3.5，与「全局百分比筛选丢低 RCS 弱信号」的机制叙述同向）。但注意：行 (c) 同时改变了稀疏分布与旁瓣保留，「旁瓣抑制」与「弱信号召回」两个子机制在该消融中未分离——同稀疏预算下随机筛选对照（待验证第 2 条）仍是区分机制的必要检查。

## 待验证

- 回 RadarOcc 原文（NeurIPS 2024 / [github.com/Toytiny/RadarOcc](https://github.com/Toytiny/RadarOcc)）核对实验部分是否存在全局百分比 vs range-wise 筛选的消融表，抄录数字后另立性能卡。——2026-11-03 完成：原文 §5.3 Table 2 行 (c) 即该消融，数字已转录笔记 §3.3 并立 sss-ablation 卡。
- 复现检查：同稀疏度下比较三种筛选（全局 percentile / range-wise Top-Nr / 随机）训练同一占据头，看 mIoU 与行人/骑行者类别召回是否按论文动机排序（range-wise > 全局 ≈ 随机）。

## 若成立 / 不成立意味着什么

成立：输入端稀疏化策略是雷达下游任务被低估的设计点，任何自研 4D 雷达管线应默认按距离分层筛选而非全局阈值。
不成立：动机叙事（旁瓣/低 RCS）与实际收益不符，稀疏化可以只按算力预算选参数，不必为弱信号保护支付结构复杂度。

2026-11-03 消融核查：见 claim-radarocc-sss-ablation-gain-10p2。

## 核查记录

- 建卡（日期未记录）：动机主张据笔记 §2 转述；当时笔记无实验章节、无任何数字。
- 2026-11-05（02 任务书整理班）：scope 历史分层（M5「无实验章节」标注为 2026-11-03 前状况，补写后数字归 sss-ablation 卡）；补 1 条笔记 Table 2 行 (c) 作 evidence（Grep 逐字命中）；正文补「机制未分离」限定；待验证第一条标记完成。主张命题未动。id/status/stance/review_due/signoff 未动。
