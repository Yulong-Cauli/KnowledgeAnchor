---
id: claim-hgsfusion-rhgm-dsm-superadditive-roi-gain
title: "HGSFusion 自报：VoD 消融中 RHGM 与 DSM 同时启用的 RoI AP 增益（73.27 → 79.46，+6.19）大于两模块单独增益之和（+1.56 与 +1.18）"
type: claim
status: asserted
scope: "VoD validation set（2026-11-05 实抓 arXiv:2412.11489v1 核对：Table 3 caption「Ablation study results of proposed components on the validation set of VoD dataset」，原卡按笔记上下文的推定获原文确认）；HGSFusion 管线内模块消融（论文 Table 3，2026-11-05 实抓六行与笔记转录逐格一致）；基线为 R+C 无 RHGM/DSM 行（RoI AP 73.27）；指标 RoI AP，笔记未定义口径（cross 文档 M1）；自报数字；「大于单独增益之和」为笔记表格数字的直接算术比较，非笔记原文措辞"
tags: [4d-radar, radar-camera-fusion, hgsfusion, vod, ablation, roi-ap]
note: library/Multimodal_Fusion/HGSFusion.md#42-模块消融实验-table-3
paper: "AAAI 2025 · HGSFusion（带混合生成与同步的雷达-相机融合 3D 目标检测；笔记未记录英文原题与 arXiv 号；开源：https://github.com/garfield-cpp/HGSFusion）"
stance: watch
evidence:
  - source: library/Multimodal_Fusion/HGSFusion.md
    locator: "§4.2 / Table 3"
    quote: "| 3      | R+C      | -        | -       | 54.82      | 73.27"
    relation: supports
  - source: library/Multimodal_Fusion/HGSFusion.md
    locator: "§4.2 / Table 3"
    quote: "| **6**  | **R+C**  | **√**    | **√**   | **58.96**  | **79.46**"
    relation: supports
  - source: library/Multimodal_Fusion/HGSFusion.md
    locator: "§4.2 / Table 3 分析"
    quote: "**分析**：RHGM 对性能的提升（+1.56% RoI AP）证明了点云增广的有效性；DSM 的引入（+1.18% RoI AP）证明了同步机制的价值。两者结合实现了最大的增益（+6.19% RoI AP）。"
    relation: supports
  - source: https://arxiv.org/html/2412.11489v1
    locator: "Table 3 caption（数据集定位；空白归一化后核对）；URL+抓取日期 2026-11-05"
    quote: "Table 3: Ablation study results of proposed components on the validation set of VoD dataset."
    relation: supports
falsifiers:
  - "复现消融：RHGM+DSM 联合增益 ≈ 单独增益之和（+2.74 上下）或低于其中某单模块增益，无可加性协同"
  - "复现的单模块增益与自报显著不符（RHGM +1.56 / DSM +1.18 复现为零或负）"
  - "发现消融各行训练配置或评测口径不一致（训练轮数 / 数据增广 / 阈值不同），各行增益之间不可比"
review_due: 2026-12-02
related: [claim-hgsfusion-cyclist-roi-ap-below-all-baselines, claim-hgsfusion-2d-spatial-mode-beats-3d, claim-hgsfusion-dark-scene-gain-dominates]
signoff: null
---

## 我的理解

论文声称（据笔记 §4.2 转录）：R+C 基线（无 RHGM/DSM）RoI AP 73.27；单加 RHGM 74.83（+1.56），单加 DSM 74.45（+1.18），两者同开 79.46（+6.19）。「联合增益（6.19）> 单独增益之和（1.56 + 1.18 = 2.74）」由笔记表格数字直接算术得出；笔记原文只说「两者结合实现了最大的增益」，未使用「协同 / 超可加」一词，故本卡把超可加性作为主张立出、由复现裁决。EAA AP 侧同表同向：全量 58.96 − 基线 54.82 = +4.14，大于 RHGM 单独 +2.41 与 DSM 单独 +1.17 之和 +3.58。

若成立，说明两模块处理的瓶颈（点云稀疏 + DOA 峰值偏移 vs 图像深度失配 + 模态权重失衡）近似正交且互促：RHGM 生成的点要靠 DSM 的空间/模态同步才被有效利用。

必须记住的限定：消融表「RoI AP」口径笔记未定义，与 Table 1 各列的关系不明（数值巧合见 [Cyclist 卡](claim-hgsfusion-cyclist-roi-ap-below-all-baselines.md) 口径警告 3）；单模块行的组合方式（RHGM-only = R+C + RHGM）据表头推断，需回原文确认；增益为单次自报，无种子方差信息。

## 待验证

- 回 HGSFusion 原文核对 Table 3 六行数字与各行模块组合的精确定义。——2026-11-05 部分完成：六行数字与数据集（VoD validation set）已对照 arXiv v1 核对一致；单模块行的组合方式（RHGM-only = R+C + RHGM 等）由表头 ✓ 组合直接读出，公式级模块定义仍待代码/正文方法节确认。
- 复现：同基线分别训练 +RHGM、+DSM、+both（同 schedule、多种子），检验联合增益是否稳定大于单独增益之和。
- 确认消融各行除目标模块外配置完全一致（训练轮数、增广、NMS 阈值等）。

## 若成立 / 不成立意味着什么

成立：点云增密与模态同步应联合设计、联合评估；单模块消融的线性外推会低估联合收益，自研融合管线可把「生成点 + 同步加权」作为一个整体设计点。
不成立：增益主要由单一模块贡献或严格可加，「协同」叙事不成立，两模块可按需独立取舍，选型成本更低。

## 核查记录

- 建卡（日期未记录）：数字据笔记转录，数据集为推定，无原文核对记录。
- 2026-11-05（02 任务书整理班）：实抓 https://arxiv.org/html/2412.11489v1 ——Table 3 六行（EAA AP/RoI AP）与笔记转录逐格一致；caption 证实数据集为 VoD validation set（原推定升级为原文确认），caption 句补入 evidence；「待验证」第一条标记部分完成。数字未改写。id/status/stance/review_due/signoff 未动。
