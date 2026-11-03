# GaussianFusion: Unified 3D Gaussian Representation for Multi-Modal Fusion Perception

**出处会议：** ICLR 2026（arXiv abs 页 Comments 字段逐字为 "ICLR 2026"，本次抓取核验；abs 页无 journal-ref）
**是否开源：** 未查得（arXiv abs/HTML v1 均无代码链接；2026-11-04 网络检索未见本论文公开仓库。注意：同名不同论文 arXiv:2506.00034（本文 References 排印标题 "GaussianFusion: gaussian-based multi-sensor fusion for end-to-end autonomous driving"）的仓库 github.com/Say2L/GaussianFusion **不是**本文代码，且该同名论文被本文参考文献收录为 Liu et al., 2025，见头部区分注记）
**关键词：** 多模态融合、3D 高斯表示、3D Gaussian Splatting、连续融合空间、前向投影初始化、共享跨模态高斯编码器、高斯混合模型（GMM）、3D 目标检测、3D 语义占用预测、nuScenes

> **与库内/常见同名论文的区分**：本笔记是腾讯自动驾驶实验室（Tencent, Autonomous Driving Lab, Beijing）的 ICLR 2026 论文（作者 Xiao Zhao、Chang Liu 为共同一作，其余：Mingxu Zhu、Zheyuan Zhang、Linna Song、Qingliang Luo、Chufan Guo、Kuifeng Su）。本文自己的 References 里引用了另一篇同名论文 "GaussianFusion: gaussian-based multi-sensor fusion for end-to-end autonomous driving"（Liu et al., 2025, arXiv:2506.00034，端到端自动驾驶方向），引用时勿混；本笔记所有 locator 指 ICLR 2026 这篇（arXiv:2607.00746）。

> 来源与核验（抓取日期 2026-11-04）：
> - arXiv abs 页 https://arxiv.org/abs/2607.00746 ，标题 "GaussianFusion: Unified 3D Gaussian Representation for Multi-Modal Fusion Perception" 与任务给定标题逐字一致；Comments 字段 "ICLR 2026"；作者 8 人如上；v1 提交时间 Wed, 1 Jul 2026 10:28:15 UTC (3,370 KB)。
> - 全文 arXiv 官方 HTML v1 https://arxiv.org/html/2607.00746v1 （LaTeXML 0.7.6 生成，页面 title 核对一致，非空、含完整正文与 9 张表、4 张图），本笔记唯一全文来源，未与 ar5iv/PDF 交叉核对（见 TODO）。
> - HTML v1 未包含正文 3 处引用的 Appendix（§4.2、§4.5、§4.6 各一处），正文目录止于 §5 Conclusion + References。
> - 引句约定：引号内为本次抓取 HTML 的逐字摘录（空白归一化后核对）；`\mathcal{G}`、`\times` 等为 math alttext 形态（未做排版还原），alttext 替换可能引入多余空格；"(H et al., 2024)" 为论文自身参考文献键（GaussianFormer，其作者名在 References 中排印为 "Y. H"，疑为 BibTeX 解析瑕疵，照抄不改）；"–" 为原文 dash；原文错别字（GausianFormer、v.s、methods( 后缺空格等）照抄保留。
> - 本笔记为草稿（未入库），所有结论均属"论文声称 / 尚未独立验证"。

------

## 1. 概述

- 论文动机：BEV 是当前多传感器融合的主流统一空间，但其**离散网格表示**带来细节丢失，且常用拼接/加权求和式融合限制跨模态对齐与交互。§1 原句："BEV directly discretizes and quantizes data, leading to inevitable information loss. During feature extraction, perception data are projected onto a fixed-resolution BEV grid, which compresses spatial information."
- 分辨率代价的实验证据（Table 1，§1）：BEVFusion 从 100×100（网格 1.008m，显存 3228 M，NDS 70.5）提到 400×400（0.252m）时显存涨到 20560 M、NDS 72.7；而 GaussianFusion 在 100×100 下 NDS 73.1（显存 3576 M）、200×200 下 74.0。§1 原句："While increasing the BEV resolution will bring unacceptable computational overhead, as shown in Table 1."
- Table 1 逐字转录（原文 "100×100" 等为 Unicode ×，网格列 "1.008m" 等照抄；Method 列 BEVFusion/GaussianFusion 为跨行组头，下行组名留空系原表形态）：

| Method | BEV size | Grid size | Memory ↓ | NDS ↑ |
| --- | --- | --- | --- | --- |
| BEVFusion | 100×100 | 1.008m | 3228 M | 70.5 |
| | 200×200 | 0.504m | 5140 M | 71.4 |
| | 400×400 | 0.252m | 20560 M | 72.7 |
| GaussianFusion | 100×100 | 1.008m | 3576 M | 73.1 |
| | 200×200 | 0.504m | 5418 M | 74.0 |
| | 400×400 | 0.252m | 6151 M | 74.4 |

（↓/↑ 转写自原表头：Memory 列与 NDS 列各带 math alttext \downarrow / \uparrow；§1 正文未逐格解读该表）
- 核心主张：跳出 BEV 范式，用**连续 3D 高斯表示**作为统一多模态融合空间——先在高斯空间聚合信息、最后才投影到 BEV 网格，避免早期量化丢信息；协方差矩阵自适应建模不确定性。摘要原句："In this work, we break from the conventional BEV paradigm and propose a new universal framework for multi-modal fusion based on 3D Gaussian representation. This approach naturally unifies multi-modal features within a shared and continuous 3D Gaussian space, effectively preserving edge and fine texture details."
- 自我定位（§1 贡献 1）："We propose the first unified 3D Gaussian representation multi-modal fusion framework, where cross-view and cross-modal Gaussian representations are naturally aggregated through the Gaussian mixture model."
- 相关工作定位（§2.1）：现有融合分 object-centric（难以泛化到 BEV 分割、占用等稠密语义任务）与 dense BEV（BEVFusion/UniTR 用 CNN+特征拼接，MetaBEV 用 meta-BEV query 交叉注意力）。§2.2 指出已有 3DGS 感知方法（GaussianFormer、GaussianBeV 等）的共性缺陷："However, these methods rely on randomly initialized Gaussians. For example, GaussianFormer (H et al., 2024) randomly initializes and re-predicts Gaussian parameters in each iteration, making fine-tuning difficult and limiting accurate scene representation."
- 论文声称的摘要结果：nuScenes 3D 检测超 BEVFusion 2.6 NDS；占用任务变体超 GaussFormer 1.55 mIoU、只用 30% 高斯、450% speedup。摘要原句（注意 "GaussFormer" 为摘要原文拼写，正文 §4.4 作 "GaussianFormer"）："On the nuScenes dataset, it outperforms the 3D object detection baseline BEVFusion by 2.6 NDS. Its variant surpasses GaussFormer on 3D semantic occupancy with 1.55 mIoU improvement while using only 30% of the Gaussians and achieving a 450% speedup."

## 2. 方法

### 2.1 总体架构（§3.1）

- 三段式流程（Fig. 2）：分别初始化相机与 LiDAR 两套 3D 高斯集合 → **共享** Gaussian Encoder 迭代精化 → 在统一高斯空间融合（GMM）→ 投影为体素特征 B_F 送任务头。§3.1 原句："We first initialize separate 3D Gaussian representations for camera and Lidar, denoted as \mathcal{G}_{\text{c}}\sim Q_{\text{c}} and \mathcal{G}_{\text{L}}\sim Q_{\text{L}} , within a unified space."
- 高斯属性定义为 mean μ∈R³、scale s∈R³、rotation r∈R⁴（§3.2），协方差 Σ=R S Sᵀ Rᵀ（S=diag(s)，R=q2r(r)）。

### 2.2 高斯初始化（§3.2）

- **相机支路：前向投影初始化**（与 LSS/BEVDet/BEVFusion 一脉相承，§3.2）：每视角相机特征 F_{c,i} 过 LSS 得深度分布 D_i，"a Gaussian function is assigned to a depth point"——每个深度点放一个高斯，D_i 直接作为高斯中心 μ 的初值；scale s、rotation r 随机初始化。与 GaussianFormer 的随机初始化对照（§3.2，原文 "GausianFormer" 拼写照抄）："It is worth noting that this is completely different from GausianFormer (H et al., 2024), which randomly initializes a set of Gaussians in space, which makes model optimization more difficult."
- 相机 query 特征：F_{c,i} 过多层卷积 context network 得语义特征 F′，再与 D_i 做内积得到每个深度点的初始 query Q_c（§3.2）。
- 单个高斯的特征响应（Eq. 1）：g_c(p; μ, s, r) = exp(−½(p−μ)ᵀΣ⁻¹(p−μ)) q_c，即高斯权重乘 query 特征；LiDAR 支路形式完全相同（Eq. 2）。
- **LiDAR 支路**（§3.2）：BEV 体素中心天然作为高斯 μ，s/r 随机；BEV 特征 B_L 过 MLP 得 LiDAR query Q_L。直接从原始点云构造高斯被认为困难且昂贵："Since directly extracting information from the massive raw lidar point clouds to construct 3D Gaussian representations is both difficult and computationally intensive, grid-based representations offer an effective approach to alleviate these challenges."

### 2.3 共享高斯编码器（§3.3）

- **共享而非分模态**：两模态高斯合并到 batch 维，用同一编码器处理（§3.3）："Additionally, to better fuse multi-modal information, we employ a shared Gaussian encoder to simultaneously process the Gaussian distributions ... as the two modalities are ultimately intended to converge towards similar Gaussian distributions. Specifically, we merge \mathcal{G}_{\text{c}} and \mathcal{G}_{\text{L}} into the batch dimension."（引文省略处为 math alttext 记号 \mathcal{G}_{\text{c}}、\mathcal{G}_{\text{L}}）
- 查询更新第一步（Eq. 3）：Q̂_i = MLP(G) + Q_i，MLP 把高斯属性（D_g 维）编成位置编码 PE 加到 query 上（D_g→C 维）。
- **带高斯先验的可变形注意力**（Fig. 3）：vanilla deformable attention 在"方形/kernel 状"区域均匀布采样点再学 offset；本文把 3D 高斯投影到 BEV 特征图，由协方差矩阵算出一组 offsets Δμ，参考点 μ+Δμ 直接带形状先验（§3.3）："In other words, the initial sampling points are not uniformly spaced on a grid, but instead follow a Gaussian distribution aligned with the underlying object geometry—such as aspect ratio, orientation, and spatial uncertainty."；注意力更新为 Eq. 4：DeformAtt(q_i, B_i)=Σ_{k=1}^{K} A_k·W_k B_i(μ+Δμ)，B_i 为相机 BEV 特征 B_c 或 LiDAR BEV 特征 B_L（注意相机支路采样的也是 BEV 特征图，论文未展开相机 BEV 特征如何得到）。
- **Gaussian Updating（增量更新）**：不学 GaussianFormer 那样每层重新预测一整套高斯参数，而是 MLP 预测三个 offset（Δμ, Δs, Δr）做残差更新（Eq. 5）：Ĝ_i = MLP(Q̂) + G_i = (Δμ+μ, Δs+s, Δr+r)。§3.3 原句："Specifically, by predicting the offsets \Delta\bm{\mu} , \Delta\textbf{s} , and \Delta\textbf{r} for the Gaussian mean \bm{\mu} , scale s, and rotation r using an MLP, we refine the Gaussian distribution without having to predict a completely new set of properties."
- 编码器堆叠 4 次（§4.2："We set Gaussian Encoder blocks to 4, see the Appendix for experiments."——Appendix 实验未随 HTML v1 发布）。

### 2.4 多传感器融合与任务头（§3.4、§3.5）

- 精化后的 Ĝ_c、Ĝ_L 合并为统一集合 Ĝ，再**体素化**：把高斯空间划成 H×W 的 BEV 体素网格，非空体素内 M 个高斯用 MeanVFE（沿 VoxelNet）平均池化（Eq. 6）：ĝ = (1/M)[Σμ_m, Σs_m, Σr_m]，q̂ = (1/M)Σq̂_m。
- **GMM 聚合**（Eq. 7）：点 p 处特征 f(p) = Σ_{i=1}^{J} ĝ_i(p; μ, s, r) q̂_i，即覆盖该点的 J 个高斯的加权累加。§3.4 原句："Furthermore, the Gaussian mixture model (Kerbl et al., 2023) can naturally aggregate multiple Gaussian distributions into a finer-grained distribution, unifying multi-modal Gaussian representations and elegantly capturing the complexity of autonomous driving scenes."
- 邻域配对：按每个高斯的 scale 属性算邻域半径，把（高斯索引, 体素索引）组元组入表并按体素索引排序，决定每个体素关注哪些高斯；得到的融合特征 B_F 再过一个简单卷积网络（§3.4）。
- 任务头（§3.5）："We adopt the same Transformer-based detection head as BEVFusion (Bai et al., 2022; Liu et al., 2023b) and the occupancy head consistent with BEVDet (Huang and Huang, 2022a)."；并构造了只含相机支路的 GaussianFusion-C。

## 3. 实验

### 3.1 数据与实现（§4.1–§4.2）

- nuScenes（700/150/150 场景，32 线 LiDAR + 6 环视相机）；相机图下采样到 704×256；点云体素化 0.075m（检测）；检测感知范围 X/Y [−51.2m, 51.2m]、Z [−5m, 3m]；Occ 评测区域 ego 周围 [−50m,50m]×[−50m,50m]（§4.1）。
- backbone：LiDAR 用 VoxelNet、相机用 Swin-T（follow BEVFusion）；LiDAR 特征/图像特征/高斯 query 特征维度均为 128；图像深度 D_c=41；"Image feature F_{c,i} dimensions: 8 \times 22 \times 6"（§4.2 原文如此，按 §3.2 记号推断应为每视角 8×22、共 6 视角，笔记推断未经论文确认）；Gaussian Encoder 块数 4；BEV 尺寸 200×200（§4.2）。
- 训练：BEVFusion 对齐的多模态数据增强 + CBGS 类平衡采样；8× NVIDIA A800；AdamW（weight decay 0.01）；one-cycle 学习率（max 2e−4）；检测与占用均训 20 epochs（§4.2）。

### 3.2 nuScenes 3D 检测（Table 2，§4.3）

Table 2 caption 逐字："Table 2: Comparisons with state-of-the-art 3D object detection methods on nuScenes dataset. C denote Camera, L denote Lidar. All methods construct BEV-based feature maps instead of object-centric fusion based on proposals, which means these methods can also be naturally used for semantic tasks. UniTR uses a unified backbone for both the camera and Lidar."

Table 2 逐字转录（两级表头：第一行 Methods/Modality/Resolution/Backbone/validation set/test set，第二行 Backbone 下分 Camera、Lidar 两列，validation set 与 test set 各跨 NDS、mAP 两列；数值列序：val NDS / val mAP / test NDS / test mAP；列归属按 BEVFormer 行 val 51.7/41.6、test 56.9/48.1 校验一致。原文 `\times` 在此处转写为 ×）：

| Methods | Modality | Resolution | Backbone (Camera) | Backbone (Lidar) | NDS (val) | mAP (val) | NDS (test) | mAP (test) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BEVFormer (Li et al., 2022b) | C | 1600×900 | ResNet-101 | - | 51.7 | 41.6 | 56.9 | 48.1 |
| PETRv2 (Liu et al., 2023a) | C | 1600×640 | VoV-99 | - | - | - | 59.1 | 50.8 |
| FB-BEV (Li et al., 2023) | C | 1600×640 | VoV-99 | - | - | - | 62.4 | 53.7 |
| AutoAlignV2 (Chen et al., 2022) | C+L | 1600×640 | CSPNet | VoxelNet | 71.2 | 67.1 | 72.4 | 68.4 |
| BEVFusion(M) (Liu et al., 2023b) | C+L | 704×256 | Swin-T | VoxelNet | 71.4 | 68.5 | 72.9 | 70.2 |
| MetaBEV (Ge et al., 2023) | C+L | 704×256 | Swin-T | VoxelNet | 71.5 | 68.0 | - | - |
| MSMDFusion (Jiao et al., 2023) | C+L | 800×448 | ResNet-50 | VoxelNet | 72.1 | 69.3 | 74.0 | 71.5 |
| FusionFormer-S (Hu et al., 2023a) | C+L | 1600×640 | VoV-99 | VoxelNet | 73.2 | 70.0 | - | - |
| EA-LSS (Hu et al., 2023b) | C+L | 704×256 | Swin-T | VoxelNet | 73.1 | 71.2 | 74.4 | 72.2 |
| UniTR (Wang et al., 2023a) | C+L | 704×256 | - | - | 73.3 | 70.5 | 74.5 | 70.9 |
| GaussianFusion(Ours) | C+L | 704×256 | Swin-T | VoxelNet | 74.0 | 71.7 | 74.9 | 72.4 |

- 正文总结（§4.3，原文 "methods(" 后无空格，照抄）："As shown in Table 2, GaussianFusion achieves SOTA results compared to previous discrete BEV representation multimodal fusion methods(Liu et al., 2023b; Ge et al., 2023; Wang et al., 2023a; Hu et al., 2023b) on nuScenes dataset, achieving 74.0 NDS and 71.7 mAP on the val split."
- 对 BEVFusion（§4.3）："Specifically, compared with BEVFusion (Liu et al., 2023b), our GaussianFusion achieves +2.6 NDS and +3.2 mAP on val split by exploring a more natural continuous Gaussian cross-modal complementary fusion."（74.0−71.4=2.6、71.7−68.5=3.2，与 Table 2 一致）
- 对近期融合 SOTA（§4.3）："In addition, compared with recent SOTA fusion works, such as UniTR (Wang et al., 2023a), EA-LSS (Hu et al., 2023b), and FusionFormer-S (Hu et al., 2023a), GaussianFusion shows superior performance, outperforming them by 1.2, 0.5, and 1.7 respectively in mAP."（71.7−70.5/71.2/70.0，与 Table 2 一致）

### 3.3 延迟与显存（Table 3，§4.3）

| Method | Latency | Memory | NDS | mAP |
| --- | --- | --- | --- | --- |
| BEVFusion | 156 ms | 5140 M | 71.4 | 68.5 |
| GaussianFusion | 132 ms | 4271 M | 74.0 | 71.7 |

- §4.3 原句："Benefiting from the unified architecture, it achieves an excellent performance of 71.7 mAP while maintaining lower inference latency (132 ms) and memory consumption (4271 MB) compared to BEVFusion."（注意表内 "5140 M / 4271 M" 与正文 "4271 MB" 单位写法不同，照抄；BEVFusion 行 5140 M 与 Table 1 中 BEVFusion 200×200 行一致）

### 3.4 时序扩展 GaussianFusion-T（Table 4，§4.3）

- 做法（§4.3）："we design a simple temporal extension, termed GaussianFusion-T: historical Gaussian representations are warped to the current timestamp and then fused via Equations (5) and (6)."

| Method | NDS | mAP |
| --- | --- | --- |
| BEVFusion4D (Liu et al., 2023b) | 73.5 | 72.0 |
| FusionFormer (Hu et al., 2023a) | 74.1 | 71.4 |
| SparseLIF-T (Zhang et al., 2024a) | 77.5 | 74.7 |
| GaussianFusion-T | 77.6 | 75.0 |

- §4.3 原句："Moreover, even without sophisticated temporal modeling, GaussianFusion-T achieves competitive NDS against advanced temporal fusion methods such as SparseLIF-T (Zhang et al., 2024a)."（77.6 vs 77.5 NDS、75.0 vs 74.7 mAP，与 Table 4 一致）

### 3.5 语义场景补全 / 3D 占用（Table 5，§4.4）

Table 5 caption 逐字："Table 5: Semantic scene completion results on nuScenes (Wei et al., 2023; Caesar et al., 2020) val set. \dagger represents trained on nuScenes. For Camera-only and C+L, the top performance is indicated in bold black and bold blue, respectively."（\dagger 为 caption 中 math alttext 形态；该 caption 未解释 dagger 的确切含义，见 TODO）

Table 5 逐字转录（仅 IoU / mIoU 两列，16 个语义类逐类数值未转录，见 TODO；行序按原文）：

| Method | Modality | IoU | mIoU |
| --- | --- | --- | --- |
| BEVFormer (Li et al., 2022b) | C | 30.50 | 16.75 |
| TPVFormer (H et al., 2023) | C | 30.86 | 17.10 |
| FB-Occ(1f) (Li et al., 2023) | C | 31.55 | 20.17 |
| SurroundOcc (Wei et al., 2023) | C | 31.49 | 20.30 |
| GaussianFormer (H et al., 2024) | C | 29.83 | 19.10 |
| GaussianFusion-C | C | 32.48 | 20.65 |
| BEVFusion \dagger (Liu et al., 2023b) | C+L | 39.11 | 24.65 |
| M-CONet (Wang et al., 2023c) | C+L | 39.20 | 24.70 |
| CO-Occ (Pan et al., 2024) | C+L | 41.10 | 27.10 |
| OccFusion (Ming et al., 2024) | C+L | 43.53 | 27.55 |
| GaussianFusion | C+L | 44.75 | 28.65 |

- 正文（§4.4）："As shown in Table 5, our GaussianFusion achieves SOTA performance at 28.65 mIoU among all single-frame models. GaussianFusion outperforms the multi-modal SOTA method OccFusion (Ming et al., 2024), which is based on multi-scale voxel fusion, by +1.11 mIoU and significantly surpasses camera-only methods (H et al., 2023; Wei et al., 2023; Li et al., 2023)."（注意：按 Table 5 数值 28.65−27.55=**1.10**，正文写 +1.11，差 0.01，疑为尾数舍入口径，见遗留）
- 评测口径（§4.4）："We report the Intersection-over-Union (IoU) of occupied voxels as the evaluation metric of the class-agnostic scene completion task and the mIoU of all semantic classes for the Occ task following SurroundOcc (Wei et al., 2023)."

### 3.6 Waymo Open Dataset（Table 6，§4.3 末）

| Model | mAP-L1 | mAPH-L1 | mAP-L2 | mAPH-L2 |
| --- | --- | --- | --- | --- |
| BEVFusion (Liu et al., 2023b) | 82.72 | 81.35 | 77.65 | 76.33 |
| GaussianFusion(ours) | 86.23 | 84.65 | 81.47 | 80.75 |

- §4.3 末原句："We further conduct experiments on the Waymo Open Dataset (Sun et al., 2020) to evaluate the generalization capability of our approach. GaussianFusion adopts the same heatmap-based detection head as BEVFusion for a fair comparison. Table 6 shows that the Gaussian representation outperforms the BEV representation, achieving higher detection accuracy, which demonstrates its greater potential for 3D perception."
- 注意：Table 6 未说明是 Waymo val 还是 test，也未给 Waymo 训练配置（见遗留）。

### 3.7 与 GaussianFormer 的直接对比（Table 7，§4.4）

| Method | Num. Gaussians | mIoU | Latency |
| --- | --- | --- | --- |
| GaussianFormer | 140,000 | 19.10 | 475 ms |
| GaussianFusion-C | 43,296 | 20.65 | 105 ms |

- §4.4 原句："More importantly, benefiting from our proposed Gaussian initialization strategy and iterative update mechanism, GaussianFusion-C achieves a 1.55 mIoU improvement and nearly 4.5× computational efficiency compared to GaussianFormer, while using only 30% of the Gaussians, as shown in Table 7."（20.65−19.10=1.55 ✓；43,296/140,000≈30.9% ✓；475/105≈4.52× ✓，均与 Table 7 一致）

### 3.8 消融（Table 8、Table 9，§4.5）

- **结构说明（本 HTML 内部编号矛盾，先记录再引用）**：两消融表位于同一个 LaTeX float 内，HTML 渲染 caption 分别为 "Table 8: Ablation of Gaussian initialization strategy." 与 "Table 9: Ablation of the proposed Gaussian Encoder. DA.G means Deformable Attention with Gaussian."；但 §4.5 首句把初始化消融称为 Table 9（"Effect of Gaussian Initialization. Table 9 provides a detailed analysis of the performance impact of different Gaussian initialization strategies"），与 caption "Table 8" 冲突；§4.5 第二句 "In Table 9, we first compare the shared and separate Gaussian Encoders" 与 caption 一致。本笔记按 caption 编号引用（初始化=Table 8，编码器=Table 9）。
- Table 8 逐字转录：

| Gaussian Initialization | NDS | mAP |
| --- | --- | --- |
| Random Initialization | 71.2 | 68.3 |
| Backward Projection | 72.4 | 70.0 |
| Lidar Projection | 73.6 | 71.1 |
| Forward Projection | 74.0 | 71.7 |

- §4.5 原句（"v.s" 为原文错拼，照抄）："The forward projection and Lidar projection strategies show comparable performance (74.0 NDS v.s 73.6 NDS), both outperforming the backward projection method (72.4 NDS). Notably, the forward projection strategy brings a significant improvement of +2.8 NDS over random initialization."（74.0−71.2=2.8 ✓；backward projection 是 BEVFormer 式策略，引用键 (Li et al., 2023; Li et al., 2022b)，原文 "strategy(" 后无空格照抄）
- Table 9 逐字转录（✓ = 原表勾选符；Share/Separate 为编码器参数共享方式二选一，DA.G = Deformable Attention with Gaussian，PE = 高斯属性作位置编码，Offset = 增量预测高斯属性 offset）：

| Share | Separate | DA.G | PE | Offset | NDS | mAP |
| --- | --- | --- | --- | --- | --- | --- |
| ✓ | | ✓ | ✓ | ✓ | 74.0 | 71.7 |
| ✓ | | | ✓ | ✓ | 73.6 | 71.1 |
| | ✓ | ✓ | ✓ | ✓ | 73.4 | 71.0 |
| ✓ | | ✓ | | ✓ | 73.6 | 71.2 |
| ✓ | | ✓ | ✓ | | 73.2 | 70.8 |

- §4.5 解读（数字与上表逐一验算一致）："We find that the shared Gaussian Encoder provides a performance improvement of +0.7 mAP."（71.7−71.0）；"Results show that deformable attention with Gaussian priors outperforms the vanilla variant by +0.4 NDS"（74.0−73.6）；"encoding the Gaussian properties as PE into the query leads to a gain of +0.5 mAP"（71.7−71.2）；"For the Gaussian updating module, predicting the offsets of the properties, rather than the properties themselves, improves multimodal fusion perception by +0.9 mAP."（71.7−70.8）。

### 3.9 可视化与局限（§4.6–§4.7）

- §4.6："As shown in Fig. 4, in BEV object detection, compared to previous BEV-based SOTA methods like UniTR (Wang et al., 2023a) and BEVFusion(Liu et al., 2023b), GaussianFusion achieve higher accuracy for distant or small objects (white marks)."（"BEVFusion(" 后无空格、"achieve" 应为 achieves，均照抄）；占用方面 "GaussianFusion-C produces sharper object boundaries (red marks) and better class separation (yellow marks) compared to GaussianFormer."
- §4.7 自述局限（时序建模）："While our method naturally extends to multi-frame settings through simple temporal alignment and already achieves performance comparable to such multi-frame methods, this is likely suboptimal. A promising direction for future work is to explore motion-aware Gaussian updates, for instance by predicting velocity-guided offsets, enabling more coherent 4D scene modeling over time."
- §5 自我保留："Although it may slightly lag behind certain task-specialized approaches, our work represents a meaningful step toward generalizable and principled multi-modal fusion."

## 4. 核心结论

1. 论文声称：用连续 3D 高斯空间替代离散 BEV 网格做统一多模态融合，可在检测与占用两任务上同时拿到 task-agnostic 方法中的 SOTA——nuScenes 3D 检测 val 74.0 NDS / 71.7 mAP（test 74.9 / 72.4，Table 2）、3D 占用 28.65 mIoU（Table 5）；且比 BEVFusion 更快更省（132 ms vs 156 ms、4271 M vs 5140 M，Table 3）。均属论文自报、尚未独立验证。
2. 两个关键设计是**前向投影初始化**（+2.8 NDS over random，Table 8）与**共享编码器 + 增量 offset 更新**（+0.7 mAP 与 +0.9 mAP，Table 9）；LiDAR 投影初始化与之相当（73.6 NDS），backward projection 居中（72.4），随机初始化最差（71.2）——初始化方式本身就是可观的收益来源。
3. 连续表示对 BEV 分辨率的敏感性更低：100×100 高斯（73.1 NDS、3576 M）已超 BEVFusion 400×400（72.7 NDS、20560 M）（Table 1），支撑"避免早期量化损失"的主张；但该表未注明 BEVFusion 高分辨率项的重训细节，核验时应留意（见遗留）。
4. 泛化性自报：Waymo 上 GaussianFusion 86.23/84.65/81.47/80.75 对 BEVFusion 82.72/81.35/77.65/76.33（mAP-L1/mAPH-L1/mAP-L2/mAPH-L2，Table 6，split 未注明）；时序变体 GaussianFusion-T 77.6 NDS/75.0 mAP，与专用时序方法 SparseLIF-T（77.5/74.7）相当（Table 4）。
5. 与 GaussianFormer 的对照最能体现"高斯表示 + 好的初始化/更新"的卖点：同是相机高斯路线，GaussianFusion-C 以约 30% 的高斯数、约 4.5× 推理速度拿到 +1.55 mIoU（Table 7）。

------

## 遗留与 TODO

- **配图待补 assets/GaussianFusion/**：Fig. 1（BEV 离散 vs 连续高斯融合范式对比）、Fig. 2（框架总图）、Fig. 3（vanilla vs Gaussian deformable attention）、Fig. 4（定性对比）均未下载，入库时逐张人工核对后嵌入。
- **Appendix 缺失**：正文 §4.2（编码器深度实验）、§4.5（backward projection 与 Lidar projection 两种初始化的实现细节）、§4.6（更多可视化）三处引用 Appendix，但 arXiv HTML v1 未包含 Appendix；上述两种初始化策略的实现不可核。
- **Table 编号矛盾**：§4.5 首句称初始化消融为 "Table 9"，与该表 caption "Table 8" 冲突（本次 HTML 内部观察）；需对照 PDF 确认是论文自身笔误还是 LaTeXML 渲染问题。
- **+1.11 vs 1.10**：§4.4 称对 OccFusion +1.11 mIoU，Table 5 数值差 28.65−27.55=1.10；与 EchoFusion「正文 vs 表格数字不自洽」同类现象，立卡/入库前建议对照 PDF 原表小数位（表中仅 2 位小数，可能为更精度的舍入）。
- **Waymo 细节缺失**：Table 6 未注明 val/test split、训练轮数与输入配置；且未与 Waymo 上其他多模态方法（仅 BEVFusion 一行）对比，"generalization" 主张的支撑较薄。
- **Table 1 实验口径**：BEVFusion 各 BEV 尺寸的模型是否为同配置重训未注明；GaussianFusion 100×100 的 73.1 与 Table 2/3 的 74.0（200×200）不同格，引用时勿混。
- **Table 5 caption 的 \dagger**："represents trained on nuScenes" 语义不明（其他 C+L 方法同样在 nuScenes 训练），需对照 PDF/正文确认含义。
- **拼写/表述不一致（引用时照抄原文并注意）**：摘要 "GaussFormer" vs 正文 "GaussianFormer"；摘要 "450% speedup" vs §4.4 "nearly 4.5× computational efficiency"；§3.2 "GausianFormer"；§4.5 "v.s"；§4.3 "methods(" / §4.6 "BEVFusion(" 缺空格；§4.6 "achieve"（应为 achieves）。
- **参考文献排印异常**：GaussianFormer 在 References 中作者名为 "Y. H"（H et al., 2024），疑 BibTeX 姓/名解析颠倒，交叉引用时以论文名为准。
- 未与 ar5iv 或 PDF 交叉核对（单源抓取）；表格 16 类逐类数值（Table 5）未转录。
- 同名论文 arXiv:2506.00034（Liu et al., 2025，被本文引用）与本文无关，库内如建笔记需单独区分。

- 抓取 URL 与日期（均为 2026-11-04）：
  - https://arxiv.org/abs/2607.00746 （abs 页：标题/作者/Comments "ICLR 2026"/v1 提交时间）
  - https://arxiv.org/html/2607.00746v1 （官方 HTML 全文 v1，本笔记唯一全文来源，已存 /tmp/gaussianfusion.html）
  - Web 检索（开源状态确认）：本论文无公开仓库检索结果；同名论文 arXiv:2506.00034 仓库为 github.com/Say2L/GaussianFusion（非本文代码）
