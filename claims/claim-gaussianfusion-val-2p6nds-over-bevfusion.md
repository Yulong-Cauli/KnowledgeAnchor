---
id: claim-gaussianfusion-val-2p6nds-over-bevfusion
title: "GaussianFusion 论文声称：nuScenes 3D 检测 val 74.0 NDS / 71.7 mAP，同配置下超 BEVFusion(M) +2.6 NDS / +3.2 mAP"
type: claim
status: asserted
scope: "nuScenes 3D 检测 val split（非 test）；GaussianFusion（C+L 多模态，Swin-T 相机 + VoxelNet LiDAR，follow BEVFusion(M)；输入 704×256、点云体素 0.075m、BEV 200×200、20 epochs、8×A800，§4.2）；比较基线为同表 BEVFusion(M) 行（704×256/Swin-T/VoxelNet，71.4/68.5）；指标 NDS/mAP（Table 2）；数字为论文自报（arXiv HTML v1，2026-11-04 抓取）"
tags: [lidar-camera-fusion, gaussianfusion, iclr2026, nuscenes, 3d-detection]
note: library/Multimodal_Fusion/GaussianFusion.md#3-实验
paper: "ICLR 2026, GaussianFusion: Unified 3D Gaussian Representation for Multi-Modal Fusion Perception (arXiv:2607.00746)"
stance: watch
evidence:
  - source: https://arxiv.org/html/2607.00746v1
    locator: "§4.3（抓取 2026-11-04）"
    quote: "Specifically, compared with BEVFusion (Liu et al., 2023b), our GaussianFusion achieves +2.6 NDS and +3.2 mAP on val split by exploring a more natural continuous Gaussian cross-modal complementary fusion."
    relation: supports
  - source: https://arxiv.org/html/2607.00746v1
    locator: "§4.3（抓取 2026-11-04）"
    quote: "As shown in Table 2, GaussianFusion achieves SOTA results compared to previous discrete BEV representation multimodal fusion methods(Liu et al., 2023b; Ge et al., 2023; Wang et al., 2023a; Hu et al., 2023b) on nuScenes dataset, achieving 74.0 NDS and 71.7 mAP on the val split."
    relation: supports
  - source: library/Multimodal_Fusion/GaussianFusion.md
    locator: "§3.2 Table 2 GaussianFusion(Ours) 行"
    quote: "| GaussianFusion(Ours) | C+L | 704×256 | Swin-T | VoxelNet | 74.0 | 71.7 | 74.9 | 72.4 |"
    relation: supports
  - source: library/Multimodal_Fusion/GaussianFusion.md
    locator: "§3.2 Table 2 BEVFusion(M) 行"
    quote: "| BEVFusion(M) (Liu et al., 2023b) | C+L | 704×256 | Swin-T | VoxelNet | 71.4 | 68.5 | 72.9 | 70.2 |"
    relation: supports
falsifiers:
  - "原文核查：重新抓取 arXiv（或对照 PDF/ar5iv）发现 §4.3 增量句或 Table 2 的 GaussianFusion/BEVFusion(M) 两行数字与本卡所引不符"
  - "同范围复现：按 §4.2 官方配置（Swin-T+VoxelNet、704×256、0.075m 体素、200×200 BEV、20 epochs）复现 GaussianFusion，val NDS ≤ 71.4（即不超过表列 BEVFusion(M) 基线）"
  - "同范围复现（对照侧）：与表列一致配置下复现 BEVFusion(M) 显著高于 71.4/68.5，使 +2.6/+3.2 同配置增量不成立；若复现配置与表列不同（更长训练、多尺度增强等），属对照口径问题，先登记待决，不直接判伪"
  - "复现发现 74.0 依赖论文未写明的额外组件（更长时序、更大 backbone、TTA 等）"
review_due: 2027-02-02
related: [claim-mitbevfusion-nuscenes-waymo-sota-snapshot, claim-msmdfusion-nuscenes-test-sota-single-model]
signoff: null
---

## 主张

论文声称：nuScenes 3D 检测 val 上，GaussianFusion 以 74.0 NDS / 71.7 mAP 超过配置列一致的 BEVFusion(M)（71.4/68.5）+2.6 NDS / +3.2 mAP（§4.3、Table 2）。方法背景：主流多模态融合把相机/LiDAR 特征统一到离散 BEV 网格再融合，该论文改用连续 3D 高斯集合做统一空间（前向投影初始化 + 共享高斯编码器 + GMM 聚合），最后才投影到 BEV 送任务头。如果成立，说明"融合统一空间"不必是 BEV 网格，离散化时机和表示形式本身是有收益的设计维度。本卡主张均为论文自报；笔记检索未见公开代码（2026-11-04）。

## 证据与边界

- 支撑本卡的直接证据是两条 §4.3 原句（总成绩句 + 对 BEVFusion 增量句）和笔记转录的 Table 2 两行（GaussianFusion/Ours、BEVFusion(M)，配置列完全一致）。表内算术自洽：74.0−71.4=2.6、71.7−68.5=3.2（笔记已验算）。
- 证据边界：以上全部是**论文报告**，不是独立复现。笔记为 arXiv HTML v1 单源抓取（2026-11-04），未与 PDF/ar5iv 交叉核对（笔记 TODO 在案）。Table 2 对照行数字部分转引自各自原文，作者是否在统一配置下复测过这些基线，论文未说明。读到原文 ≠ 效果复现，两者由不同 falsifier 分别检验。

## 解释与未排除因素

- 作者解释：连续高斯空间避免了 BEV 早期量化带来的信息损失（§1；Table 1 显示 100×100 高斯 73.1 NDS/3576M 已超 BEVFusion 400×400 的 72.7/20560M）。
- 论文自己的消融（Table 8/9，均在同一 GaussianFusion 框架内做）：前向投影初始化 +2.8 NDS（over random）、共享编码器 +0.7 mAP、高斯先验可变形注意力 +0.4 NDS、高斯属性作 PE +0.5 mAP、offset 式增量更新 +0.9 mAP。
- 归因缺口：+2.6 NDS 是整套框架相对 BEVFusion(M) 的**总差**。论文没有"从 BEVFusion(M) 出发逐组件替换"的阶梯对照，所以"连续表示本身贡献多少、初始化贡献多少、编码器贡献多少"无法从现有证据分开；Table 8 的 +2.8 只说明初始化在 GaussianFusion 框架内重要，不说明它解释了对 BEVFusion 的增量。（这里的归因缺口判断是本卡整理者基于笔记所载实验结构的分析，非论文自述。）
- 未排除因素：数据增强/CBGS 等训练配方差异（论文称 follow BEVFusion，但未逐项列齐）；Table 2 其余对照行分辨率与骨干不一（如 FusionFormer-S 1600×640/VoV-99），跨行比较不能当作同配置结论。

## 范围与迁移限制

- 本卡限定 val 口径；同表 test 行为 74.9/72.4。引用 [MIT BEVFusion test 快照卡](claim-mitbevfusion-nuscenes-waymo-sota-snapshot.md)（test 口径）时 val/test 不可混——Table 2 中 BEVFusion test 行 72.9/70.2 与该卡一致。
- 结论绑定 Swin-T+VoxelNet 这套 backbone 组合与 20 epochs 预算；换 backbone、训更久、用时序变体 GaussianFusion-T（77.6/75.0，另一口径）或 Waymo（Table 6 未注明 split）都超出本卡范围，需要单独的迁移检查。

## 研究启发

以下均为尚未验证的研究假设，不是本卡结论：

- Table 1 的分辨率-显存曲线与 Table 8 的初始化消融合起来提示：表示形式与初始化策略可能是被低估的设计自由度。可检验的问题——在固定计算预算下，"连续表示 + 好初始化"与"离散网格 + 更高分辨率"的 Pareto 关系如何（需控制 backbone/epochs）。
- 阶梯归因实验（见下一步）如果成立，可回答"融合收益主要来自表示还是来自组件叠加"这一更一般的问题。

## 下一步

- 当前 stance：watch。原卡未记录立场依据，按未记录处理，不代拟理由。
- 优先执行的最小检查（按成本排序）：
  1. **原文核查**：对照 arXiv PDF 或 ar5iv 复核 Table 2 两行与 §4.3 增量句——针对笔记单源 HTML 抓取的缺口，成本最低。不符 → 登记数字问题。
  2. **机制辨别**：若将来复现，跑阶梯对照（BEVFusion(M) → 仅换前向投影初始化 → 换共享编码器 → 全套 GaussianFusion），固定数据/epochs/backbone，观察每级 NDS/mAP。若逐级叠加能复原 +2.6，归因成立；若只换表示一步就拿到大部分增量，"连续表示本身"解释占优；若各组件单独都无明显增益、合起来才有，则存在交互效应，需再设计。
  3. **同范围复现**：官方代码未查得，先复现 BEVFusion(M) 71.4/68.5 锚点再谈 74.0。锚点显著高于 71.4 → 增量主张存疑（对照口径问题登记待决，不判伪）。
- 未涉及跨条件迁移（test 口径、时序、Waymo）实验安排；需要时另立迁移任务。

## 核查记录

- 2026-11-04（建卡时）：数字自 arXiv HTML v1 实抓，quote 与算术验算当时完成。
- 2026-11-05（02 任务书样板整理班）：表达整理，数字未改写。4 条 evidence 全部 Grep 逐字命中来源（2 条原 arXiv 句 + 2 条笔记 Table 2 行）；falsifiers 重组为"原文核查 / 同范围复现（主张侧）/ 同范围复现（对照侧）/ 隐藏组件"分层，并把"配置不一致的对照复现"从判伪条件降级为待决口径问题；scope 移除对照行细节（MSMDFusion/UniTR/EA-LSS 数字移出，跨行比较风险移入正文）；新增"归因缺口"分析与阶梯对照下一步。id/status/stance/review_due/signoff 未动。
