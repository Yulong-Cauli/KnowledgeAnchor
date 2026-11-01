---
id: claim-njusparseocc-mgss-complexity-onquery-np
title: "SparseOcc 声称：掩码引导稀疏采样（MGSS）把实例查询的掩码交叉注意力从 O(N_query·M_voxel) 全局计算降为 O(N_query·N_p) 的固定点数采样"
type: claim
status: asserted
scope: "SparseOcc（ECCV 2024）论文自述 Mask Transformer 设计，据库内笔记转述，尚未独立验证；对象为语义 / 实例占据解码中 Object Query 与活跃体素的交叉注意力环节：以查询-体素点积生成的掩码分布 M 作离散概率密度，随机采样固定 N_p 个 3D 点（笔记举例 96 个）投影回 2D 取特征；O(N_query·N_p) 为论文理论复杂度口径，笔记无该模块的精度 / 速度消融数字，也未记录 N_p 的正式取值与随机性控制"
tags: [occupancy-prediction, sparse-3d, mask-transformer, sparse-sampling, sparseocc]
note: library/3D_Occupancy/NJU-SparseOcc.md#22-掩码-transformer-mask-transformer
paper: "ECCV 2024 · Fully Sparse 3D Occupancy Prediction (SparseOcc) · arXiv:2312.17118 · https://github.com/MCG-NJU/SparseOcc"
stance: watch
evidence:
  - source: library/3D_Occupancy/NJU-SparseOcc.md
    locator: "§2.2 掩码 Transformer / 传统方法痛点"
    quote: "标准 Mask2Former 的 Object Query 需要与所有 3D 体素进行全局交叉注意力计算，时间复杂度为 $O(N_{query} \cdot M_{voxel})$。在 3D 高分辨率下，体素基数过大导致算子无法执行。"
    relation: supports
  - source: library/3D_Occupancy/NJU-SparseOcc.md
    locator: "§2.2 掩码 Transformer / 坐标点采样"
    quote: "将 $M_i$ 作为离散概率密度函数，在 3D 物理空间中**随机采样**固定数量的 $N_p$ 个点（如 96 个点）。"
    relation: supports
  - source: library/3D_Occupancy/NJU-SparseOcc.md
    locator: "§2.2 掩码 Transformer / 本质差异"
    quote: '**本质差异**：将 Cross-Attention 的稠密矩阵乘法，降维成基于先验掩码分布的稀疏索引采样，复杂度被严格绑定为 $O(N_{query} \cdot N_p)$。'
    relation: supports
  - source: https://arxiv.org/abs/2312.17118
    locator: "§ Abstract"
    quote: "A mask-guided sparse sampling is designed to enable sparse queries to interact with 2D features in a fully sparse manner, thereby circumventing costly dense features or global attention."
    relation: supports
falsifiers:
  - "开源实现中该环节实际仍是与活跃体素数 M 相关的全局 / 稠密注意力，或采样点数 N_p 随场景规模增长而非固定常数——『严格绑定 O(N_query·N_p)』不成立"
  - "同配置消融中把 MGSS 换回普通交叉注意力（低分辨率下可行时）或同预算均匀采样，实例 / 语义占据精度持平或更高，且无速度优势——MGSS 的必要性不成立"
  - "笔记或原文对算子描述有误（如实现为 top-k 确定性选择而非按掩码分布随机采样），与『随机采样固定 N_p 点』的事实描述不符"
review_due: 2026-12-02
related: [claim-njusparseocc-decoder-pruning-complexity-onactive, claim-njusparseocc-rayiou34-fps17-beats-dense-baselines]
signoff: null
---

## 我的理解

论文声称（据笔记 §2.2 转述，尚未独立验证）：Mask2Former 式 Object Query 与全部 3D 体素做交叉注意力的复杂度为 O(N_query·M_voxel)，在 3D 高分辨率下因体素基数过大不可行；MGSS 改为先用查询-体素点积 + Softmax 生成实例掩码分布 M，把 M 当离散概率密度在 3D 空间随机采样固定 N_p 个点（笔记举例 96），投影回 2D 取特征更新查询，复杂度严格绑定为 O(N_query·N_p)。

限定：这是复杂度 / 算子形态的窄主张，不是精度主张——笔记没有 MGSS vs 全局注意力的任何消融数字；「随机采样」的方差控制（训练 / 推理是否同分布、N_p 正式取值）笔记未记录。arXiv:2312.17118 摘要（2026-11-02 抓取）证实 MGSS 的存在与「绕开稠密特征 / 全局注意力」的动机，但摘要不含复杂度表达式，O(N_query·N_p) 仍只出自笔记。

## 待验证

- 读开源实现（github.com/MCG-NJU/SparseOcc），确认注意力路径只触及 N_p 个采样点、N_p 正式取值、随机性来源（纯随机 vs top-k / 固定种子）。
- 消融：MGSS vs 同点预算均匀采样 vs 低分辨率下可行的全局注意力，比较实例 / 语义占据精度与耗时。

## 若成立 / 不成立意味着什么

成立：高分辨率 3D 分割 / 占据的 transformer 解码可按「掩码先验 + 固定点预算采样」设计，算力由查询数与点预算决定，与场景体素数解耦，可迁移到其他密集预测任务。
不成立：复杂度被低估（实现仍隐式依赖 M）或精度代价无法接受，实例占据解码回到稀疏卷积 / 局部窗口注意力路线。
