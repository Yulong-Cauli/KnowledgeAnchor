---
id: claim-njusparseocc-rayiou-penalizes-thick-surface
title: "SparseOcc 声称：RayIoU 按射线首次命中的类别与深度阈值（1m/2m/4m）判 TP，使加厚预测表面无法换取更高得分"
type: claim
status: asserted
scope: "RayIoU 评测指标（随 SparseOcc，ECCV 2024 提出）的论文自述算子口径，据库内笔记转述；TP 判定 = 射线首次命中非空体素的语义类别与真值相等，且首次命中深度 L1 误差 < τ，τ ∈ {1m, 2m, 4m}；对象为相机占据预测的射线级评测，替代体积重叠式 voxel mIoU；笔记无『加厚表面在 mIoU 下获利、在 RayIoU 下不获利』的对照数字，也未记录分数聚合方式与实现是否含软计分"
tags: [occupancy-prediction, rayiou, evaluation-metric, sparseocc]
note: library/3D_Occupancy/NJU-SparseOcc.md#23-射线评估指标-rayiou
paper: "ECCV 2024 · Fully Sparse 3D Occupancy Prediction (SparseOcc) · arXiv:2312.17118 · https://github.com/MCG-NJU/SparseOcc"
stance: watch
evidence:
  - source: library/3D_Occupancy/NJU-SparseOcc.md
    locator: "§2.3 射线评估指标 / 指标影响"
    quote: "**指标影响**：彻底封堵了模型通过“将表面预测得很厚”来提高体积重叠概率的作弊路径。只要表面首次接触点的深度位置错误，无论物体内部体积多大，该射线均判定为假正例 (FP)。"
    relation: supports
  - source: library/3D_Occupancy/NJU-SparseOcc.md
    locator: "§2.3 射线评估指标 / TP 判定算子·深度阈值"
    quote: '深度 L1 误差满足阈值：$|d_{pred} - d_{gt}| < \tau$（$\tau$ 设为 1m, 2m, 4m）。'
    relation: supports
  - source: library/3D_Occupancy/NJU-SparseOcc.md
    locator: "§2.3 射线评估指标 / 技术目标"
    quote: "**技术目标**：解决传统 mIoU 对深度轴惩罚不一致的问题。"
    relation: supports
  - source: https://arxiv.org/abs/2312.17118
    locator: "§ Abstract"
    quote: "Additionally, we design a thoughtful ray-based evaluation metric, namely RayIoU, to solve the inconsistency penalty along the depth axis raised in traditional voxel-level mIoU criteria."
    relation: supports
falsifiers:
  - "固定首次命中正确的条件下向表面内部增厚预测体素，RayIoU 相对未增厚版本仍显著上升——『加厚无法换分 / 封堵作弊路径』不成立"
  - "官方评测实现并非硬阈值 TP 判定（如按占用概率软加权计分、按深度分段给分或含其他修正项），本卡据笔记转述的算子口径与实现不符"
  - "同一批预测在 voxel mIoU 与 RayIoU 下的方法排序完全一致，且加厚行为在 mIoU 下同样无法获利——『解决 mIoU 深度轴惩罚不一致』缺乏可观测差异"
review_due: 2026-12-02
related: [claim-njusparseocc-rayiou34-fps17-beats-dense-baselines]
signoff: null
---

## 主张

论文声称（据笔记 §2.3 转述）：RayIoU 模拟传感器扫描，从相机中心向预测 / 真值空间投射高密度射线，每条射线只记录首次命中非空体素的类别与深度；类别相等且深度 L1 误差 < τ（τ 取 1m / 2m / 4m）才判 TP。由此机制，把表面预测得很厚不再能靠体积重叠换分——首次命中深度错了整条射线就是 FP——以此修复传统 voxel 级 mIoU 沿深度轴惩罚不一致的问题。

本库 2026-11-09 的 K-probe-2 toy 合成对照（[experiments/njusparseocc-rayiou-penalizes-thick-surface/RESULTS.md](../experiments/njusparseocc-rayiou-penalizes-thick-surface/RESULTS.md)）实测支持该机制：向内填充合成球体使单类 voxel IoU 从 0.170669 升至 0.772727，而 RayIoU 两臂均为 0.989782、1 / 2 / 4 米三档（0.969346 / 1 / 1）无变化——加厚在 toy 设置内换不到 RayIoU 得分，falsifier 1 未触发。toy 用简化的单类射线步进、配对落在预注册支持带内；官方评测器的首中判定与最终聚合仍待完整核对。

限定：三档阈值下分数如何聚合成最终 RayIoU（分档均值？）笔记未记录；「封堵作弊路径」是论文的机制性论断，笔记没有对照实验数字支撑（toy 合成对照仅覆盖加厚不换分这一方向）。arXiv:2312.17118 摘要（2026-11-02 抓取）证实 RayIoU 的动机表述（解决 voxel 级 mIoU 深度轴惩罚不一致），但「加厚无法获利」的算子细节仍只出自笔记。

## 待验证

- 读官方评测代码，核对 TP 判定与聚合方式：阈值档位（1/2/4 m 之外是否还有档）、最终 RayIoU 是否为各档均值、是否含软计分（K-probe-2 已见官方评测器固定提交的代码摘录：三档阈值、严格小于与 IoU 分母可见，首中与聚合待完整核对）。
- 构造对照实验：同一预测「加厚 1 层体素 vs 不加厚」，分别算 voxel mIoU 与 RayIoU，验证「加厚只在 mIoU 下获利」。

## 成立/不成立的含义

成立：占据模型评测应优先 RayIoU（或同样按首次命中深度计分的指标）；凡只报体积 mIoU 的对比都可能被厚表面预测高估，横向看论文数字时要先看指标口径。
不成立：若加厚仍能在 RayIoU 下获利或实现与描述不符，则其作主指标的公平性需重新评估，自建 benchmark 时另选或修正指标。
