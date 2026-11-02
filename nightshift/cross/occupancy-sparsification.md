# [cross] 四篇 Occupancy 稀疏化笔记横向对比（SparseOcc / NJU-SparseOcc / SurroundOcc / RadarOcc）

- 日期：2026-11-03
- 性质：TODO 候选池对比素材。只记录方法路线、稀疏化对象、数据集与指标口径、结论之间的互相支持 / 矛盾 / 单源情况，**不下【谁更好】的评价性结论**。
- 引用规则：所有数字与结论均为各笔记所录论文声称，**尚未独立验证**。标记约定：「…」= 从笔记逐字复制的引文（Grep 已验证）；【…】= 笔记小节标题或本文概括标签（非引文）。
- 原文复核记录（本报告新增，均为 2026-11-03 实抓、pdftotext -layout 提取）：
  - SparseOcc（CVPR 2024，VISION-SJTU）：https://arxiv.org/pdf/2404.09502 —— **v1（2024-04-15，abs 页显示为唯一 arXiv 版本）**；CVF camera-ready 直链 404 未取得。
  - NJU-SparseOcc（ECCV 2024，MCG-NJU）：https://arxiv.org/pdf/2312.17118 —— **v5（2024-07-19）**；另抓 v3 HTML（https://arxiv.org/html/2312.17118v3）、v2 HTML、v1 PDF 用于版本对账；版本史（abs 页 2026-11-03 抓取）：v1 2023-12-28 / v2 2023-12-29 / v3 2024-04-08 / v4 2024-07-18 / v5 2024-07-19；ECVA openaccess 403/404 未取得。
  - SurroundOcc（ICCV 2023）：https://arxiv.org/pdf/2303.09551 —— **v2（2023-08-27）**。
  - RadarOcc（NeurIPS 2024）：本报告不重复实抓——其笔记 §3 实验章节与 claim-radarocc-sss-ablation-gain-10p2 已于 2026-11-03 以 arXiv:2405.14014 v4（PDF+HTML）双源核查（见该卡 evidence）。
- 来源笔记（均为本地文件，只读）与卡况（`ls claims/ | grep -i -E 'sparseocc|surroundocc|radarocc'`，17 张，status 全为 asserted）：
  - SparseOcc：`library/3D_Occupancy/SparseOcc.md`（CVPR 2024，开源）—— 4 张卡（3 方法卡 + 1 笔记质量卡 claim-sparseocc-note-conversational-residue）
  - NJU-SparseOcc：`library/3D_Occupancy/NJU-SparseOcc.md`（ECCV 2024，开源）—— 4 张卡
  - SurroundOcc：`library/3D_Occupancy/SurroundOcc.md`（ICCV 2023，开源）—— 4 张卡
  - RadarOcc：`library/3D_Occupancy/RadarOcc.md`（NeurIPS 2024，开源）—— 5 张卡（含 2026-11-03 消融核查新立的 claim-radarocc-sss-ablation-gain-10p2）

------

## 1. 四篇定位矩阵

| 笔记 | 稀疏化对象（算力省在哪） | 传感器 | 基准与协议（笔记记录，本次原文复核补充） | 指标 | 效率口径（笔记记录） |
| --- | --- | --- | --- | --- | --- |
| SparseOcc (CVPR) | 特征体素：稀疏潜变量（非空体素 COO 点集）+ 核分解 + 掩码集合预测头 | 相机 | nuScenes-Occupancy 验证集（原文自写 "nuScenes-Occupancy [33]"，[33]=OpenOccupancy，见 §3-M6） | IoU / mIoU（voxel 级） | FLOPs 455G、显存 13G（原文表题注明为**训练** GPU memory）、3D 延迟 0.19s |
| NJU-SparseOcc (ECCV) | 查询：稀疏体素查询（top-k 剪枝）+ Mask Transformer 查询侧稀疏采样（MGSS） | 相机 | Occ3D-nuScenes（v5 Table 1） | RayIoU（1/2/4m 三档均值，本次 v5 核实）+ voxel mIoU 列 | FPS 17.3（A100, fp32） |
| SurroundOcc (ICCV) | **模型不稀疏化**：密集体素查询 $Q \in \mathbb{R}^{C \times H \times W \times Z}$；本篇的"稀疏化相关贡献"在监督侧增密（泊松密集 GT）与 3D 体素查询对 BEV 压缩的对照 | 相机 | nuScenes validation set（自建密集 GT 协议；对比行中 TPVFormer* 为密集 GT 重训版，本次 v2 核实） | SC IoU / SSC mIoU（voxel 级） | Table 8：0.34s / 5.9G（单卡 RTX 3090，1600×900 六目） |
| RadarOcc (NeurIPS) | 输入张量：DBD 多普勒压缩（8/D）+ SSS 旁瓣感知逐距离 Top-$N_r$ | 4D 雷达 | K-Radar 自定义占据协议（LiDAR 叠加自生成 GT、0.4m 体素、前景/背景两类） | IoU / mIoU（**非 RayIoU**） | 3.30→7.46 fps（原文写 "Nvidia GTX 3090"，笔记 §3.5） |

定位差异（口径前提）：四篇分属两个传感器族（相机 ×3 / 雷达 ×1）、三套 nuScenes 系不同协议加一套 K-Radar 自定义协议、两族指标（voxel 级 IoU/mIoU vs 射线级 RayIoU）。**库内不存在同基准同指标的四方法横向 leaderboard**；任何跨行数值比较都属口径错配（§3）。

命名消歧：CVPR 2024 与 ECCV 2024 两篇的方法**都叫 SparseOcc**（NJU v5 摘要原句 "we introduce a novel fully sparse occupancy network, termed SparseOcc"，本次核实；卡 claim-sparseocc-miou141-beats-dense-baselines 限定 1 已先记录此撞名）。本报告用「SparseOcc (CVPR)」「NJU-SparseOcc」区分。

------

## 2. 稀疏化路线谱系

### 2.1 特征体素稀疏化 + 掩码集合预测（SparseOcc CVPR）

- **路线自述**：SparseOcc.md §1：

  > 在 nuScenes-Occupancy 验证集上，mIoU 从 12.8% 提升至 14.1%，有效避免了空体素上的“幻觉（Hallucinations）”。

  其稀疏化对象是 LSS 投影后的 3D 特征体素（SparseOcc.md §2.1）：

  > 利用 Lift-Splat-Shoot (LSS) 将 2D 特征映射到 3D 空间后，由于射线投射的特性，约 80% 的体素是空的。

  ⚠ 本次复核发现该「约 80%」与原文不符：v1 原文写 "approximately **67%** of the considered 3D space is empty"，且脚注注明统计口径是 SemanticKITTI 前 10 序列的 GT 占据标签（本次 pdftotext 提取）；"80%" 在 v1 全文未检得（见 §3-M7、§4-C2、§6-3）。

- **保持稀疏度的两类算子**：一是核分解（SparseOcc.md §2.2）：

  > 复杂度从 $\mathcal{O}(k^3)$ 降至 $\mathcal{O}(3k^2)$ 或 $\mathcal{O}(4k^2)$。

  二是掩码集合预测头——笔记概括为（SparseOcc.md §2.4 总结段）：

  > 这本质上是一个“由面及点”的过程，所有算子都在 $N_l$ 这个点集上运行。

- **术语注记**：任务描述中该路线的标签「掩码分解/SMAE」——SMAE 一词在 arXiv:2404.09502 v1（唯一版本）摘要与正文中均未检得（grep 无命中，也无 MAE/autoencoder 类词）；本报告按笔记术语「掩码注意力 + 掩码集合预测 + 核分解」描述，SMAE 出处待主人指认（§6-2）。

### 2.2 查询稀疏化（NJU-SparseOcc）

- **路线自述**：NJU-SparseOcc.md §1：

  > 彻底摒弃稠密的张量表示，整个网络的数据流从头到尾仅维护一个**稀疏的非空 3D 坐标点集 (Sparse Token List)**。

- **两级稀疏化**：① 解码器侧粗到细剪枝（NJU-SparseOcc.md §2.1）：

  > **二分类剪枝 (Pruning)**：通过 MLP 预测当前尺度下 $N_{active}$ 个体素的占据得分 $s \in [0, 1]$。执行硬过滤，仅在内存中保留得分 $s > \tau$ 的 Token。

  ⚠ 本次复核：v5 原文写明**实现取 top-k** 而非阈值——"In our implementation, we simply keep voxels with top-k occupancy scores for training efficiency"（threshold 为论文列出的另一选项，并有 "Thresholding achieves similar performance to top-k" 句）；笔记的「阈值硬过滤」描述与论文实现口径不一致（§3-M7、§6-5）。剪枝的空间依据在 v5 正文有直接表述："we find that over 90% of the voxels in the scene are free"（本次核实；卡 claim-njusparseocc-decoder-pruning-complexity-onactive 原标注「待回原文」的 >90% 主张就此补上正文依据，但注意原文说的是**场景体素免费占比的统计**，笔记转写为「解码器低分辨率阶段物理抹除 >90% 背景节点」，两者表述强度不同）：

  > 解码器在低分辨率阶段物理抹除了 $>90\%$ 的背景空间节点，后续所有算子（自注意力、投影、MLP）的矩阵维度仅取决于 $N_{active}$。

  ② Mask Transformer 侧 MGSS（NJU-SparseOcc.md §2.2）：

  > 在 3D 物理空间中**随机采样**固定数量的 $N_p$ 个点（如 96 个点）。

  ⚠ v5 原文 MGSS 段（本次核实）只写 "We first randomly select a set of 3D points within the mask predicted by the previous (l−1)-th Transformer decoder layer"，**未给 N_p 数值**；「96 个点」疑出自官方代码，笔记未注明来源。
- **复杂度表述全部为笔记形式化**：NJU-SparseOcc.md §2.2：

  > **本质差异**：将 Cross-Attention 的稠密矩阵乘法，降维成基于先验掩码分布的稀疏索引采样，复杂度被严格绑定为 $O(N_{query} \cdot N_p)$。

  ⚠ 本次对 v5 全文 grep：「complexity」0 次、「O(」0 次——$O(L^3)$、$O(N_{active})$、$O(N_{query} \cdot N_p)$ 等 big-O 表达式均无原文逐字依据（v1/v2 连 RayIoU 都还没有，见 §3-M5）；引用这些复杂度主张时只能表述为「笔记对论文设计的转述/形式化」（卡 claim-njusparseocc-mgss-complexity-onquery-np、claim-njusparseocc-decoder-pruning-complexity-onactive 的 scope 已按此窄化，本次复核支持其窄化处理）。
- **时序侧的稀疏红利**（NJU-SparseOcc.md §3）：

  > 通过坐标系变换矩阵 $\mathbf{T}_{curr \to prev}$ 将当前 3D 坐标直接映射到历史多帧图像上提取特征，系统能以极低代价处理 15 帧输入（RayIoU 达 35.1）

### 2.3 密集监督 + 体素查询（SurroundOcc）——稀疏化浪潮的对照族

- **定位**：SurroundOcc 全程使用密集体素查询（SurroundOcc.md §2）：

  > **Query (Q)**：预定义的 3D 空间体素网格特征 $Q \in \mathbb{R}^{C \times H \times W \times Z}$。

  它不省算力——效率表甚至是四篇中唯一「比 BEVFormer 更慢更费」的（原文 §5.5 Table 8，本次 v2 核实：BEVFormer 0.31s/4.5G vs Ours 0.34s/5.9G，单卡 RTX 3090；笔记只概括为「RTX 3090 上实现了可接受的推理速度」，SurroundOcc.md §5）。收录本篇的意义在于它与两篇 SparseOcc 构成「密集表示 ↔ 稀疏表示」的对照轴，且其 3D 体素查询 vs BEV 的消融是「高度压缩损失信息」的直接证据（§2.3 末）。
- **监督侧增密（本篇核心路线）**：离线 GT 管线四步（SurroundOcc.md §3，卡 claim-surroundocc-poisson-reconstruction-dense-gt-pipeline）：

  > **多帧点云拼接**：利用位姿信息将多帧点云对齐。动态物体根据 Bounding Box 进行运动补偿，从而获得极其密集的点云。

  > **泊松曲面重建 (Poisson Reconstruction)**：通过求解泊松方程将离散点转换为连续曲面网格 $\mathcal{M}$，填补物理孔洞。

  消融三行结构（原文 Table 7，本次 v2 核实，笔记只录了首尾）：sparse LiDAR points 11.96/12.17 → **sparse occupancy labels 30.58/18.83** → dense occupancy labels 31.49/20.30（SC IoU/SSC mIoU）。即笔记的（SurroundOcc.md §5.2）：

  > 将监督信号从“稀疏点云”替换为“密集真值”后，SC IoU 从 **11.96% 飙升至 31.49%**。

  跨表读法（论文自报数字，尚未独立验证）：**11.96→31.49 的大头（11.96→30.58）来自多帧拼接占据标签，泊松重建 + NN 传播只再加 +0.91 IoU / +1.47 mIoU**——笔记总结「数据是王道」（SurroundOcc.md §5）时未区分这两级，引用时须注意。
- **3D 体素查询 vs BEV 的定量依据**：原文 Table 5（本次 v2 核实）：BEV-based attention 30.45/18.94 < Ours（3D-based）31.49/20.30（SC IoU/SSC mIoU）；正文只说 "preserve 3D space information"。笔记的（SurroundOcc.md §5.2）：

  > 显式的 3D 体素查询比将高度压缩的 BEV 查询在捕捉立交桥、电线杆等垂直结构上具有明显优势

  其中「立交桥、电线杆」具体例证在 v2 正文未检得（疑出自 Fig.3 示意图内容或笔记概括）；卡 claim-surroundocc-3d-voxel-query-vertical-structure-advantage 的窄卡处理（只主张「论文声称存在该优势」）与本报告复核结果一致，且现在有了 Table 5 的数字级依据。

### 2.4 旁瓣感知雷达输入稀疏化（RadarOcc；详见 `nightshift/cross/4d-radar.md`，不重复展开）

- **路线**：对原始 4D 雷达张量（4DRT）做两级数据减量——DBD（多普勒轴压成 8 统计描述符，RadarOcc.md §2.1，卡 claim-radarocc-dbd-compresses-doppler-to-8-descriptors）+ SSS（旁瓣感知稀疏化，RadarOcc.md §2.1）：

  > 如果采用全局百分比（Global Percentile）进行稀疏化，会导致两个问题：

  > 远距离目标或低 RCS 目标（如行人、自行车）的信号功率远低于近处强目标的旁瓣，从而被直接过滤。

  处方是逐距离单元 Top-$N_r$（RadarOcc.md §2.1；`cross/4d-radar.md` §2.1 已录同一组引文并给出「局部结构优先于全局排序」的路线定位，本报告互链不重复）。
- **实验侧结论（引卡不展开）**：SSS 换成 percentile-based 稀疏化后 mIoU@12.8m 34.3→24.1（-10.2）、FG IoU 20.7→5.9（K-Radar 自定义协议，w/o 式消融）——数字已于 2026-11-03 双源核查（claim-radarocc-sss-ablation-gain-10p2）；`cross/4d-radar.md` M5「RadarOcc 笔记无实验章节」已**过时**（该笔记 2026-11-03 补写了 §3 实验章节 72 行，本报告 RadarOcc 实验侧均引笔记 §3 与该卡）。
- **与相机三篇的本质差别**：RadarOcc 稀疏化的对象是**物理信号**（多普勒维 + 功率维），动机是雷达噪声结构（旁瓣/低 RCS），不是节省算力本身——「这种处理方式将单帧数百 MB 的数据压缩到了深度学习模型可高效处理的量级」（RadarOcc.md §2.1）只是附带收益。这与 `cross/4d-radar.md` S1（四方稀疏性诊断）同源：相机侧稀疏化的对手是稠密张量计算，雷达侧的对手是信号处理链路的信息丢失。

------

## 3. 数据集与指标口径差异（标注「不可直接对比」处）

- **M1 任务同族但传感器与协议四分**：三篇相机占据（SparseOcc-CVPR 在 OpenOccupancy 系协议、NJU-SparseOcc 在 Occ3D-nuScenes、SurroundOcc 在 nuScenes + 自建密集 GT）+ 一篇 4D 雷达占据（K-Radar 自定义，claim-radarocc-sss-ablation-gain-10p2 scope 明确「与其他 benchmark 不可比」）。四篇笔记内部没有任何一篇引用另一篇的数字。
- **M2 指标族分裂：voxel IoU/mIoU vs RayIoU**：SurroundOcc / SparseOcc-CVPR / RadarOcc 全部为 voxel 级 IoU/mIoU；NJU-SparseOcc 提出 RayIoU 并给出对 voxel mIoU 的机制性批评（v5 原文，本次核实）：

  > However, we found that solely calculating mIoU on the observed voxel positions remains vulnerable and can be hacked by predicting a thicker surface.

  原文同段给出的量级："its performance exhibits an unreasonably inflated improvement (+5∼15 mIoU) under the current evaluation protocol"（BEVFormer w/ visible mask 实例）。**跨表警示（asserted，论文声称 / 尚未独立验证）**：凡是只报 voxel mIoU 的对比行（含 SparseOcc-CVPR 的 14.1、SurroundOcc 的 20.30）按 NJU 论文的批评都存在被厚表面预测高估的空间——但这不构成对那两篇的否定（协议不同，是否可见性掩码下的评测需回各原文确认）。
  **同表排序翻转实例（NJU v5 Table 1，本次逐格核实）**：voxel mIoU 列 BEVFormer 39.2 / FB-Occ 39.1 / SparseOcc 30.1（稠密方法领先）；RayIoU 列 32.4 / 33.5 / **34.0**（SparseOcc 领先）。同一组模型、同一数据集，换指标即换排名——这是 M2 的库内最硬例证。RayIoU 聚合口径本次一并落实（v5 原文）："We calculate RayIoU under three distance thresholds: 1, 2 and 4 meters. The final ranking metric is averaged over these distance thresholds."（claim-njusparseocc-rayiou-penalizes-thick-surface 的「聚合方式待验证」项就此关闭）。
- **M3 FLOPs / 显存 / 延迟各表各算**：SparseOcc-CVPR 报 FLOPs（455G vs 1810G/1132G）+ 训练显存（13G，**表题原文 "training GPU memory"**，笔记列头只写「显存」）+ 3D/overall 双延迟（0.19/0.25s，笔记取 3D 侧 0.19s，列头「3D 延迟」准确）；NJU 报 FPS（17.3，A100 fp32）；SurroundOcc 报延迟/显存（0.34s/5.9G，RTX 3090）；RadarOcc 报 fps（3.30→7.46，优化后含 FP16 量化解码）。四个「效率」数字单位、硬件、口径全部不同，不可同表引用。
- **M4 时序帧数口径**：NJU 笔记写「7帧/15帧」，与摘要口径一致（"with 7 history frames inputs"）；但 v5 Table 1 行标为 **(8f)/(16f)**（含当前帧）。引用帧数时须注明按哪种口径（claim-njusparseocc-rayiou34-fps17-beats-dense-baselines 的「7 帧时序输入」表述建议后续注明「7 历史帧 = 8f」）。
- **M5 版本口径（NJU-SparseOcc）**：**RayIoU 指标为 v3（2024-04-08）起新增**——v1/v2 已在 Occ3D-nuScenes 上评测（v1 Table 1 caption："3D occupancy prediction performance on the Occ3D-nuScenes [45] dataset. '8f' means fusing temporal information from 7+1"，本次核实），但用的是 voxel 级 mIoU（v1 BEVFormer 行 mIoU 26.9），且 v1/v2 全文无任何 RayIoU 字样（本次 grep 0 命中）。即：数据集没换，换的是指标。引用 NJU 数字前先确认版本；笔记三条卡 evidence 所引摘要句与 v5 一致，不受影响。v1 caption 的 "7+1" 亦印证 M4 的帧数口径。
- **M6 本次复核对既有 caveat 的对账（本报告核心增量）**：
  1. **SparseOcc 消融绝对值不一致 → 已解**：claim-sparseocc-decomposed-kernel-beats-full-kernel 限定 2 的悬问（消融表 IoU 35.5–36.5 与主表 21.8 不同口径）由 v1 原文表题定案——Table 3 caption "Ablation on different designs of Sparse Completion Block **on SemanticKITTI val set**"，消融在 SemanticKITTI、主表在 nuScenes-Occupancy；笔记 §4.2 三行数字（35.5/12.1、35.8/12.2、36.5/13.1）与 v1 逐格一致。
  2. **SparseOcc 基准名 → 部分解**：原文自写 "In the nuScenes-Occupancy benchmark [33]"、Table 1 caption "results on nuScenes-Occupancy [33] validation set"，[33]=OpenOccupancy；即笔记「nuScenes-Occupancy」与官方 README「OpenOccupancy validation set」确指同一基准（claim-sparseocc-miou141-beats-dense-baselines 限定 2 的悬问收窄为措辞问题）。
  3. **SparseOcc FLOPs 基线对象 → 已定**：v1 原文句 "it reduces the FLOPs of existing approaches using dense or TPV representations by **59.8% to 74.9%**, and memory usage by **31.6% to 40.9%**"（本次核实），与表内算术对账：1−455/1810=74.9%（C-CONet，稠密端）、1−455/1132=59.8%（TPVFormer，TPV 端）；claim-sparseocc-flops-749pct-below-dense 限定 1 的「74.9% 对应 C-CONet」推断成立。**残留**：显存区间上限 40.9% 反推约 22G 的基线未出现在 Table 1（表内最大 21G），且 FLOPs 统计范围（是否含 2D 主干/LSS 深度网）v1 未注明（§6-4）。
  4. **NJU BEVFormer/FB-Occ 基线行来源不明 → 升级为「与现行原文不符」**：claim-njusparseocc-rayiou34-fps17-beats-dense-baselines 限定 1 的悬问由 v3+v5 双版本定案——原文 Table 1 为 **BEVFormer (4f) 32.4 / 3.0 FPS**、**FB-Occ (16f) 33.5 / 10.3 FPS**（两版本一致，本次逐格核实），而笔记 §3 表为 BEVFormer 32.2/2.3、FB-Occ 33.7/5.2。溯源线索：笔记的 **32.2 与 v5 Fig.4 单场景可视化面板数一致**（"BEVFormer wo/ mask … mIoU: 23.2 RayIoU: 32.2"，Fig.4 为单场景示意、非基准表）；33.7/5.2 在 v1–v5 任何表中均未检得。该卡 falsifier 2（「对照 arXiv v5 原文表格核对发现笔记表格转抄错误」）**已被触发**，笔记 §3 表两条基线行须修（§6-1）。注意：笔记主行 SparseOcc 34.0/17.3 与原文一致，本卡主张「高于同表稠密基线」在 v5 原表下**方向不变**（34.0 > 33.5 > 32.4；17.3 > 10.3 > 3.0），受累的只是两条基线行的具体读数。
  5. **RadarOcc Nr=450 敏感性 → 原样引用**：SSS 增益对 $N_r$ 超参敏感且非单调（附录 Table 6 mIoU@12.8m 最高点 Nr=450=36.8 高于选用的 Nr=250=34.0），见 claim-radarocc-sss-ablation-gain-10p2 限定 3 与 RadarOcc.md §3.4，本报告不重展开。
- **M7 笔记转述与原文的其他偏差（本次新发现，均不影响卡的方向性主张）**：
  1. SparseOcc.md §2.1「约 80% 的体素是空的」vs v1 原文 "approximately **67%** of the considered 3D space is empty"（SemanticKITTI 前 10 序列 GT 统计，原文脚注）；"80%" 未检得于 v1。
  2. NJU 笔记「阈值硬过滤 s>τ」vs v5 原文实现 top-k（§2.2 已引）；笔记未提 top-k 选项。
  3. NJU 笔记全部 big-O 表达式无原文逐字依据（v5 无 "complexity"/"O(" 字样）。
  4. SurroundOcc 笔记「立交桥、电线杆」例证措辞未检得于 v2 正文（§2.3 已述）。
  受累卡核对：三张 SparseOcc-CVPR 方法卡的 evidence 均不引「80%」句与消融口径段（claim-sparseocc-note-conversational-residue 已注明笔记其余数字经复审一致——该结论对 §2.1 的 80% 句**不成立**，本报告为其补充记录）；NJU 两张复杂度卡的 scope 本就以「论文自述、笔记转述」窄化；SurroundOcc 垂直结构卡为窄卡。

------

## 4. 按可靠性分层（所有数字均为论文声称；全库 0 verified）

### A. 双源核对过的数字（笔记 + 论文原文）

- **A1 SparseOcc (CVPR) 全部三张方法卡所指数字**（本次抓取 arXiv:2404.09502 v1 逐格核对一致）：Table 1 四行（TPVFormer 15.3/7.8/1132G/20G、OpenOccupancy 19.3/10.3/1716G/19G、C-CONet 20.1/12.8/1810G/21G、SparseOcc 21.8/14.1/455G/13G，延迟列原文为 3D/overall 双值）；Table 3 消融三行（35.5/12.1、35.8/12.2、36.5/13.1，SemanticKITTI val）；摘要/引言 74.9%、59.8%~74.9%、31.6%~40.9%、12.8%→14.1%。对应卡：claim-sparseocc-miou141-beats-dense-baselines、claim-sparseocc-flops-749pct-below-dense、claim-sparseocc-decomposed-kernel-beats-full-kernel（均 asserted；三卡原 evidence 只有摘要句/笔记行，本次补齐原文表格层）。
- **A2 NJU-SparseOcc 主行与机制句**（本次抓取 v5，v3 交叉）：摘要与 Table 1 的 34.0 / 17.3 FPS / 7 history frames（=8f）/ 16f 35.1；Table 1 全行含 mIoU 列与 FPS 列；"over 90% of the voxels in the scene are free"；RayIoU 三档阈值与平均聚合；MGSS 机制段；thick-surface 批评段（+5∼15 mIoU）。v3 与 v5 的 Table 1 基线行一致。对应卡：claim-njusparseocc-rayiou34-fps17-beats-dense-baselines（主行部分）、claim-njusparseocc-rayiou-penalizes-thick-surface（机制部分）、claim-njusparseocc-decoder-pruning-complexity-onactive（>90% 部分升级为正文双源；复杂度表达式仍在 B 层）。
- **A3 SurroundOcc 全部四张卡所指数字**（本次抓取 arXiv:2303.09551 v2 逐格核对一致）：Table 1 三行（BEVFormer 30.50/16.75、TPVFormer* 30.86/17.10、SurroundOcc 31.49/20.30；表题注明 TPVFormer* 为密集 GT 重训版——claim-surroundocc-nuscenes-iou-3149-miou-2030-table-lead 限定 1 的「基线数字来源」就此落实）；Table 7 三行（11.96/12.17、30.58/18.83、31.49/20.30——claim-surroundocc-dense-gt-supervision-sc-iou-1196-to-3149 升级双源，且新增中间行 30.58 为重要上下文）；Table 5（BEV-based attention 30.45/18.94——claim-surroundocc-3d-voxel-query-vertical-structure-advantage 补上数字级依据）；GT 四步管线与方法节一致（claim-surroundocc-poisson-reconstruction-dense-gt-pipeline）。
- **A4 RadarOcc SSS 消融**：2026-11-03 已由 claim-radarocc-sss-ablation-gain-10p2 以 arXiv:2405.14014 v4 PDF+HTML 双源核查（Table 2 row (a)/(c)），本报告直接引用。

### B. 单源 / 笔记转述（原文无逐字依据或未检得）

- NJU-SparseOcc 的全部 big-O 复杂度主张（$O(L^3)$、$O(N_{active})$、$O(N_{query} \cdot N_p)$）——笔记形式化，claim-njusparseocc-mgss-complexity-onquery-np、claim-njusparseocc-decoder-pruning-complexity-onactive 两卡的 scope 已按此窄化，维持 asserted。
- NJU MGSS 的 $N_p$=96（笔记「如 96 个点」；v5 正文无数值，疑出自官方代码）。
- SparseOcc.md §2.1「约 80% 的体素是空的」（v1 原文为 67% 且另有统计口径，见 M7）。
- SparseOcc 显存节省区间上限 40.9% 的对应基线（约 22G）不在 Table 1 中（原句本身已双源，归属对象单源）。
- SurroundOcc「立交桥、电线杆等垂直结构」例证措辞（Table 5 数字双源，措辞本身 v2 正文未检得）。
- RadarOcc 笔记 §3 之外无单源项；其 SSF/SFE/DBD 消融细目以笔记 §3.3/§3.4 所录原文为准（已在卡内双源或窄化）。

### C. 存疑（本次原文复核发现与论文不符，引用前必须回原文）

- **C1 NJU 笔记 §3 对比表两条基线行与 arXiv v3/v5 不符**（M6-4）：BEVFormer 32.2/2.3、FB-Occ 33.7/5.2 vs 原文 32.4/3.0、33.5/10.3。claim-njusparseocc-rayiou34-fps17-beats-dense-baselines 的 falsifier 2 被触发；「高于同表稠密基线」的方向性主张在原表下不变，受累的是基线读数与 FPS 差距倍数（笔记口径下「对 FB-Occ 3.3 倍」在原表下为 1.7 倍）。ECVA camera-ready 版未取得（403/404），不排除 camera-ready 与 arXiv v5 有别的可能，但 v3（2024-04）与 v5（2024-07-19）一致已覆盖 ECCV 录用前后。
- **C2 SparseOcc.md「约 80%」**（M7-1）：与 v1 的 67% 不符，且 v1 的统计是 SemanticKITTI GT 标签口径，与笔记叙述的「LSS 射线投射特性」语境亦有错位。

------

## 5. 对选型 / 研究的启示（主人用；全库 0 verified，以下一律为「论文声称 / 尚未独立验证」，不得写成事实）

- **读占据论文先看指标口径**：同一组模型在 voxel mIoU 与 RayIoU 下可以排名互换（NJU v5 Table 1 实例，§3-M2）。NJU 论文声称 voxel 级 mIoU 可被「加厚表面」策略 +5∼15 mIoU 地抬高（asserted）；凡自建 benchmark 或横向读表，优先 RayIoU 类射线级指标，或至少确认评测是否用可见性掩码。claim-njusparseocc-rayiou-penalizes-thick-surface 的待验证清单（阈值档位、聚合方式）本次已由原文关闭一半，TP 判定与软计分的实现核对仍需读官方评测代码。
- **稀疏化按「省在哪」选型，四条路线不互斥**：输入张量（RadarOcc，雷达信号物理决定）、特征体素（SparseOcc-CVPR，LSS 后）、查询（NJU-SparseOcc，解码器两级）——三者作用于管线不同位置，理论上可叠加，但库内无任何一篇验证过组合（如 SparseOcc-CVPR 的补全块核分解 + NJU 的 MGSS 同时使用的公开数字，笔记未录）。SurroundOcc 提示第四个正交轴：监督密度。其消融声称多帧拼接占据标签已拿走 11.96→30.58 的大头、泊松密集 GT 再加 +0.91 IoU / +1.47 mIoU（asserted，v2 Table 7）——评估任何「稀疏化方案」的绝对数值前，先把监督协议（GT 密度、可见性掩码）对齐。
- **效率数字不可跨表**：FLOPs（455G）、FPS（17.3）、延迟（0.19s / 0.34s）、fps（7.46）分属不同硬件（GPU 型号/精度/是否训练显存）与统计口径；跨方法引用一律回各卡 scope（claim-sparseocc-flops-749pct-below-dense、claim-njusparseocc-rayiou34-fps17-beats-dense-baselines、SurroundOcc Table 8、RadarOcc 笔记 §3.5）。
- **雷达侧结论以 `cross/4d-radar.md` 为准**：4D 雷达稀疏诊断四方一致（该报告 S1）、旁瓣/低 RCS 机制与 range-wise 设计（该报告 §2.1/§2.2）、RadarOcc 消融数字（claim-radarocc-sss-ablation-gain-10p2）。本报告唯一补充：RadarOcc 的稀疏化动机是信号保真而非算力，与相机侧三篇不构成同位竞争。
- **复现优先级（若做）**：① NJU 官方库复测 RayIoU/FPS 并修笔记基线行（C1）；② SparseOcc-CVPR 官方库复测 OpenOccupancy val 的 IoU/mIoU 与 FLOPs 口径（M6-3 残留）；③ 同协议下「top-k vs 阈值」剪枝与 MGSS 点预算消融（B 层两项）。三者的卡均已按「论文声称/尚未独立验证」措辞写好 falsifiers。

------

## 6. 遗留问题（转调度班次 / QUESTIONS.md，不替主人决定）

1. **NJU-SparseOcc 笔记 §3 两条基线行需修**（§4-C1）：BEVFormer 行 32.2/2.3 → v5 为 32.4/3.0；FB-Occ 行 33.7/5.2 → v5 为 33.5/10.3；笔记「7帧/15帧」建议标注「7 历史帧（=8f）」口径。涉及 claim-njusparseocc-rayiou34-fps17-beats-dense-baselines（falsifier 2 触发、evidence 两条基线行 quote 受累）：按 RULES 铁律 3，笔记修复后需同步卡内引用或加注——均需主人同意后进行（本任务无 claims//library/ 写权限）。
2. **「SMAE」术语无着落**：任务描述中路线标签「掩码分解/SMAE」的 SMAE 在 arXiv:2404.09502 v1（唯一版本）摘要与正文均未检得（也无 MAE/autoencoder 类词）；本报告按笔记术语描述该路线。请主人指认 SMAE 出处（他文？项目页？），或确认改称「掩码集合预测 + 核分解」。
3. **SparseOcc.md §2.1「约 80% 的体素是空的」与 v1 原文 67% 不符**（§4-C2，且原文统计口径为 SemanticKITTI 前 10 序列 GT 标签）；建议列入 library 修复清单（需主人同意），修复时核对无卡 evidence 引用该句（本次已核：三张方法卡均未引用）。
4. **SparseOcc-CVPR 两个残留口径**：显存节省区间上限 40.9% 对应基线（约 22G）不在 Table 1；FLOPs 统计范围（是否含 2D 主干/LSS 深度网）v1 未注明——claim-sparseocc-flops-749pct-below-dense 的「统计口径」待验证项保持开放。
5. **NJU 笔记方法节两处与 v5 实现口径不一致**：剪枝「阈值 s>τ」vs 原文实现 top-k；MGSS「N_p=96」原文无数值（疑代码口径）。建议修笔记时一并对齐（需主人同意）。
6. **SurroundOcc「立交桥、电线杆」例证**：v2 正文未检得该措辞（正文仅有 "preserve 3D space information" + Table 5 数字）；若原文来自 Fig.3 示意图，可在 claim-surroundocc-3d-voxel-query-vertical-structure-advantage 卡内加注「例证出自图示、正文无此句」（需主人同意）。
7. **四篇仍无同协议 leaderboard**：若日后要做相机占据横向对比，建议统一到 Occ3D-nuScenes + RayIoU（NJU 提供协议与开源评测）或 OpenOccupancy-nuScenes；K-Radar 雷达侧自成体系，与相机系数字永不可比。
8. **卡片升级建议（均需主人同意，本报告只在 nightshift 层记录）**：claim-surroundocc-dense-gt-supervision-sc-iou-1196-to-3149（Table 7 已双源）、claim-surroundocc-3d-voxel-query-vertical-structure-advantage（Table 5 数字已双源）、claim-sparseocc-decomposed-kernel-beats-full-kernel（消融口径已解）、claim-sparseocc-miou141-beats-dense-baselines（基准名已解）、claim-njusparseocc-rayiou-penalizes-thick-surface（聚合方式已解）——五张卡的对应「待验证」项已可关闭或收窄。
