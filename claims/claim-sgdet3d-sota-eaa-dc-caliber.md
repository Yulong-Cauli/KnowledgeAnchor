---
id: claim-sgdet3d-sota-eaa-dc-caliber
title: "SGDet3D 自报在 VoD（mAP_EAA 59.49 / mAP_DC 77.11 口径）与 TJ4DRadSet 上达到 SOTA；该口径与 HGSFusion 的 RoI AP 口径互不可比"
type: claim
status: asserted
scope: "VoD 与 TJ4DRadSet；SOTA 声称的 VoD 支撑数字为完整模型 mAP_EAA 59.49 / mAP_DC 77.11（笔记 §5.1）；库内笔记未记录 SOTA 对比表（对比方法、各自数字、评测口径均无），TJ4DRadSet 上更无任何数字记录；mAP_EAA/DC 口径笔记未定义，VoD 上与 HGSFusion 的 EAA AP / RoI AP 口径互不可比、与 R4Det 的即插即用 EAA 增量亦不可比（nightshift/cross/4d-radar.md M1/M2），各家各自声称 SOTA；论文自报（RA-L 2025）"
tags: [4d-radar, radar-camera-fusion, sgdet3d, vod, tj4dradset, sota-claim, metric-caliber]
note: library/Classical_Detection/SGDet3D.md#1-概述
paper: "RA-L 2025 · SGDet3D（面向 4D 雷达-相机融合的语义与几何融合 3D 目标检测；笔记未记录英文原题与 arXiv 号；开源：https://github.com/shawnnnkb/SGDet3D）"
stance: watch
evidence:
  - source: library/Classical_Detection/SGDet3D.md
    locator: "§1 概述 / 性能条目"
    quote: "- **性能**：在 VoD 和 TJ4DRadSet 数据集上达到 SOTA 水平。"
    relation: supports
  - source: library/Classical_Detection/SGDet3D.md
    locator: "§1 概述 / 双分支融合模块条目"
    quote: "- **双分支融合模块 (Dual-Branch Fusion Module)**：在早期特征提取阶段，通过几何深度补全 (GDC) 利用雷达物理先验修正相机深度，通过语义雷达 PillarNet (SRP) 利用图像语义丰富雷达特征，实现显式的模态间优劣势互补。"
    relation: supports
  - source: library/Classical_Detection/SGDet3D.md
    locator: "§5.1 / 消融表（SOTA 声称对应的 VoD 数字）"
    quote: "| 完整模型 | ✓       | ✓       | ✓        | **59.49**             | **77.11**            |"
    relation: supports
falsifiers:
  - "复现：VoD 上 mAP_EAA < 59.49 或 mAP_DC < 77.11，SOTA 数字本身站不住"
  - "发现同口径（mAP_EAA / mAP_DC）下已有已发表方法高于 59.49 / 77.11，或原文 SOTA 对比表中存在口径混用（对比方法用的不是同一指标定义），SOTA 声称被推翻或不可比"
  - "原文 TJ4DRadSet 对比表显示 SGDet3D 非最优，或对比协议与 VoD 侧不一致"
review_due: 2026-12-02
related: [claim-sgdet3d-srp-gdc-laca-vod-monotonic, claim-hgsfusion-cyclist-roi-ap-below-all-baselines, claim-hgsfusion-rhgm-dsm-superadditive-roi-gain, claim-r4det-plugplay-vod-eaa-gain]
signoff: null
---

## 我的理解

论文声称（据笔记 §1 转录）：SGDet3D 在 VoD 和 TJ4DRadSet 两个数据集上达到 SOTA 水平；其 VoD 支撑数字为完整模型 mAP_EAA 59.49 / mAP_DC 77.11（§5.1）。

引用前必读的口径警告（这是本卡存在的首要理由）：
1. **库内笔记没有 SOTA 对比表**：对比方法清单、各家数字、评测协议全部未记录，TJ4DRadSet 上连一个数字都没有。本卡只能锚定「声称 + VoD 自身数字」，SOTA 的真实性只能回原文核对或复现裁决。
2. **VoD 上各家的指标族互不可比**：SGDet3D 用 mAP_EAA / mAP_DC；HGSFusion 消融用 EAA AP / RoI AP、SOTA 表用 mAP (RoI) 62.61（头条 88.28 是 Car 类 RoI AP，见 [Cyclist 卡](claim-hgsfusion-cyclist-roi-ap-below-all-baselines.md) 口径警告）；R4Det 在 VoD 只报即插即用 mAP_EAA 增量。59.49 与 58.96（HGSFusion EAA）、62.61（HGSFusion RoI）**不可横向比较**，两篇各自声称 VoD SOTA，笔记层面无法仲裁（cross 文档 M1/M2）。
3. 因此任何「SGDet3D 与 HGSFusion 谁强」的表述都构成口径错误；要做横向比较，必须先回各自原文核对 EAA / DC / RoI 的定义并统一协议。

> 附注（2026-11-03，笔记修正同步）：HGSFusion 笔记 §4.1 SOTA 表已按论文原文全表修正——走廊区 mAP (RoI) 为 **79.46**，上文所引「mAP (RoI) 62.61」实为走廊区 Pedestrian (RoI)（原文行：Car 88.28 / Pedestrian 62.61 / Cyclist 87.49 / mAP 79.46）。口径警告 2 中的 62.61 请按修正后数字解读；「SGDet3D 与 HGSFusion 口径互不可比、不可横向比较」的结论不受影响。依据：arXiv:2412.11489v1 HTML Table 1（arxiv.org/html/2412.11489v1，2026-11-03 抓取），见笔记 §4.1 表后注。

## 待验证

- 回 SGDet3D 原文核对 SOTA 对比表：对比方法、mAP_EAA / mAP_DC 的精确定义、TJ4DRadSet 表数字。
- 核对 HGSFusion / R4Det 原文中 EAA、DC、RoI 的定义，仲裁 VoD 上各口径是否可比（此为 cross 文档遗留问题 2，裁决后本卡 scope 可更新）。
- 用开源实现（https://github.com/shawnnnkb/SGDet3D）复测 VoD：mAP_EAA / mAP_DC 是否达到 59.49 / 77.11。

## 若成立 / 不成立意味着什么

成立：语义引导 + 几何补全的双分支路线在 VoD（EAA/DC 口径）与 TJ4DRadSet 上自报领先，可作为该方向选型的候选强基线；但与 HGSFusion 的比较必须等口径统一后进行。
不成立：SOTA 依赖口径混用、对比表选择性引用或复现不达标，SGDet3D 降级为「消融自洽但外部领先未证实」，与 HGSFusion 的 RoI 口径声称一并进入待仲裁状态。
