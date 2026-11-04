---
id: claim-njusparseocc-mgss-complexity-onquery-np
title: "SparseOcc 声称：掩码引导稀疏采样（MGSS）把实例查询的掩码交叉注意力从 O(N_query·M_voxel) 全局计算降为 O(N_query·N_p) 的固定点数采样"
type: claim
status: asserted
scope: "SparseOcc（ECCV 2024）论文自述 Mask Transformer 设计，据库内笔记转述 + 2026-11-05 arXiv v5 原文核查，尚未独立验证；对象为 Mask Transformer 的交叉注意力环节：原文口径为「在上一层预测的 mask 内随机选一组 3D 点，投影回多视图取特征」（未给点数、未写按掩码概率密度加权），笔记细化为「以查询-体素点积生成的掩码分布 M 作离散概率密度、随机采样固定 N_p 点（举例 96）」；O(N_query·N_p) 复杂度式 v5 全文未检得，仍只出自笔记；论文 Table 3 有 MT/交叉注意力消融（dense CA 28.7 RayIoU / 16.2 FPS vs +Mask-guided 29.2 / 24.0，2026-11-05 实抓核对），笔记未录该表；N_p 正式取值与随机性控制笔记与原文均未记录"
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
  - source: https://arxiv.org/html/2312.17118v5
    locator: "§3.2 Mask-guided sparse sampling 段（LaTeXML 渲染文本，数学以 alttext 为准；抓取 2026-11-05）"
    quote: "We first randomly select a set of 3D points within the mask predicted by the previous (l-1)-th Transformer decoder layer. Then, we project those 3D points to multi-view images and extract their features by bilinear interpolation."
    relation: supports
  - source: https://arxiv.org/html/2312.17118v5
    locator: "§5.3 Mask Transformer 段（同上抓取口径）"
    quote: "Therefore, to speed up the dense cross-attention pipeline, we adopt a sparse sampling mechanism which brings a 50% reduction in inference time."
    relation: supports
  - source: https://arxiv.org/html/2312.17118v5
    locator: "§5.3 Mask Transformer 段（同上抓取口径）"
    quote: "By further introducing the predicted masks to guide the generation of sampling points, we finally achieve 29.2 RayIoU with 24 FPS."
    relation: supports
  - source: https://arxiv.org/html/2312.17118v5
    locator: "Table 3 caption（同上抓取口径）"
    quote: "Ablation of mask transformer (MT) and the cross attention module in MT. Mask-guided sparse sampling is stronger and faster than the dense cross attention."
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

> **原文核查注记（2026-11-05，02 任务书 P1-B5 整理班）**：回 arXiv:2312.17118v5（https://arxiv.org/html/2312.17118v5 ，本次实抓）核对三点：① 原文算子口径为 "**randomly select a set of 3D points within the mask** predicted by the previous (l-1)-th Transformer decoder layer"——在上一层预测的 mask 内随机选点；笔记的「以掩码分布 M 作离散概率密度采样」「查询-体素点积 + Softmax 生成 M」是对原文的细化转述，原文未写概率密度加权与 M 的生成式，N_p 点数原文未给；② **论文 Table 3 有 MT/交叉注意力消融**（笔记未录），LaTeXML 渲染转录（2026-11-05 逐格核对，引用以现页为准）：无 MT（逐体素 MLP）27.0 RayIoU / 29.0 FPS；MT + Dense cross attention 28.7 / 16.2；MT + Sparse sampling（无 mask 引导）25.8 / 24.0；MT + **+ Mask-guided** 29.2 / 24.0——普通稀疏采样比 dense CA 掉 2.9 RayIoU，加 mask 引导后才反超，即论文自报消融中「mask 引导」本身必要；③ O(N_query·N_p) 复杂度表达式 v5 全文未检得（与卡内原限定一致，仍只出自笔记）。卡内笔记引文保留，原文句已补入 evidence；title 与命题不动，scope 已同步改写。

论文声称（据笔记 §2.2 转述 + 2026-11-05 v5 原文核查，尚未独立验证）：Mask2Former 式 Object Query 与全部 3D 体素做交叉注意力在 3D 高分辨率下因体素基数过大不可行；MGSS 改为在上一层预测的 mask 内随机采样一组 3D 点（笔记口径：按掩码分布 M 作离散概率密度采样固定 N_p 个点，举例 96），投影回 2D 取特征更新查询，把交叉注意力从全局稠密计算降为固定点数采样（O(N_query·N_p) 为笔记形式化）。论文自报消融：MGSS 相对 dense cross attention 同更准（29.2 vs 28.7 RayIoU）且更快（24.0 vs 16.2 FPS），稀疏采样环节带来 50% 推理时间缩减。

限定：这是复杂度 / 算子形态的窄主张，不是精度主张；「随机采样」的方差控制（训练 / 推理是否同分布、N_p 正式取值）笔记与原文均未记录，须查官方代码。arXiv:2312.17118 摘要（2026-11-02 抓取）证实 MGSS 的存在与「绕开稠密特征 / 全局注意力」的动机。

## 待验证

- 读开源实现（github.com/MCG-NJU/SparseOcc），确认注意力路径只触及 N_p 个采样点、N_p 正式取值、随机性来源（纯随机 vs top-k / 固定种子），并核对采样是「mask 内均匀随机」还是笔记所述「按掩码概率密度加权」。
- 消融：论文 Table 3 已给 MT/交叉注意力四行对照（见顶部注记）；复现重点改为核对 Table 3 数字与补「同点预算均匀采样（mask 内 vs 全空间）」对照，比较实例 / 语义占据精度与耗时。

## 若成立 / 不成立意味着什么

成立：高分辨率 3D 分割 / 占据的 transformer 解码可按「掩码先验 + 固定点预算采样」设计，算力由查询数与点预算决定，与场景体素数解耦，可迁移到其他密集预测任务。
不成立：复杂度被低估（实现仍隐式依赖 M）或精度代价无法接受，实例占据解码回到稀疏卷积 / 局部窗口注意力路线。

## 核查记录

- 2026-11-05（02 任务书 P1-B5 整理班）：表达整理 + 原文核查，数字未改写。卡内 3 条笔记 quote 经 Grep 逐字命中 `library/3D_Occupancy/NJU-SparseOcc.md`，摘要句经实抓 arXiv abs 页（2026-11-05）逐字命中；新增 4 条 v5 原文句（实抓 https://arxiv.org/html/2312.17118v5 ，LaTeXML 渲染文本、数学以 alttext 为准）。登记：原文算子口径为「mask 内随机选点」（未写概率密度加权与点数）、论文 Table 3 消融笔记未录、O(N_query·N_p) 无原文出处；笔记问题已写入返回摘要待决清单（library 本班只读）。id/status/stance/review_due/signoff 未动。
