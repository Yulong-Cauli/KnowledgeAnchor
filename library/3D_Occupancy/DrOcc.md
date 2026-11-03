# Dr.Occ: Depth- and Region-Guided 3D Occupancy from Surround-View Cameras for Autonomous Driving

**出处会议：** CVPR 2026 
**是否开源：** 未开源/未查得（arXiv 摘要页与全文 HTML 均无代码/项目主页链接） 
**关键词：** 3D 语义占用预测、深度引导视图变换（D2-VFormer）、区域引导专家 Transformer（R-EFormer / R2-EFormer）、MoE / MoR、Occ3D-nuScenes、纯视觉感知

> 抓取来源：https://arxiv.org/abs/2603.01007 （摘要页：标题/版本/录用信息）+ https://arxiv.org/html/2603.01007v3 （全文 LaTeXML HTML）；抓取日期 2026-11-04；抓取版本 v3（arXiv 摘要页显示 Submitted on 1 Mar 2026, last revised 5 Mar 2026；Comments: "10 pages, 6 figures. Accepted at CVPR 2026"；作者单位含武汉大学与 Horizon Robotics，第一作者 Xubo Zhu，脚注注明工作完成于 Horizon Robotics 实习期间）。以下所有引文与数字均逐字取自本次抓取的 v3 HTML。

------

## 1. 概述

3D 语义占用预测（3D semantic occupancy prediction）要求从环视相机图像生成稠密、度量精确的体素级语义占据图。论文指出纯视觉 OCC 方法面临两大挑战（§1；Abstract）：

- **几何错位（geometric misalignment）**：现有多数 2D-to-3D 视图变换方法（前向投影 LSS/BEVDepth/BEVStereo、后向投影 BEVFormer、双投影 FBOCC/COTR）"primarily rely on low-resolution, noisy depth estimates for 2D-to-3D feature transformation"（§1），缺少像素级精确深度。
- **空间类不平衡（spatial class imbalance）**：语义类别在 3D 空间中呈强各向异性分布（行人集中在路缘、车辆聚在路中、建筑植被在高处，§1），模型容量却均匀分配。

**Dr.Occ**（depth- and region-guided）给出两个对应组件（§1、§3.2）：

1. **D2-VFormer**（Depth-guided 2D-to-3D View Transformer）：利用 MoGe-2 的高质量稠密深度线索构造 geometry-aware occupancy mask，聚焦非空体素，实现精确几何对齐。
2. **R-EFormer / R2-EFormer**（Region-guided Expert Transformer 及其递归变体）：借鉴 MoE（§2.3 引 Shazeer et al. 等）/ MoR 思想，按距离与高度划分空间区域并自适应分配区域专家，缓解空间语义变化。

**自报主要结果（Abstract）**："Dr.Occ improves the strong baseline BEVDet4D by 7.43% mIoU and 3.09% IoU under the full vision-only setting."（Occ3D-nuScenes 基准，纯视觉设置）。此外论文声称把模块插入 SOTA 方法 COTR 可再提升 1.0% mIoU（§1："when our modules are integrated into the SOTA method COTR [21], they further boost the overall mIoU by 1.0%"）。

------

## 2. 方法

### 2.1 两个关键观察

**（a）占据网格约 90% 体素为空（§3.4.1）。** 原文："We make a critical observation: approximately 90% of voxels in the occupancy grid are empty, suggesting that directly fitting all voxels is inefficient." 论文据此不用深度做直接投影，而是用 MoGe 深度经相机投影生成伪点云并体素化，构造二值 geometry-aware occupancy mask $M(\mathbf{v})$（Eq. 1–3：$\mathbf{x}_{cam} = d \cdot \mathbf{K}_i^{-1}[u,v,1]^T$，再经外参变换到车体坐标，$M(\mathbf{v})=1$ 当且仅当 $\mathbf{v} \in \text{Voxelize}(\mathcal{P}, r)$），引导模型聚焦非空体素。

  论文明确反对两种"朴素深度用法"（§3.4.1）：RGBD 式拼接与 LiDAR 式伪点云直接前向投影——"directly using MoGe depth for forward projection paradoxically degrades performance, as this leads to image features lacking implicit constraints from depth information, thereby generating low-quality voxel features."（注：支持该结论的消融在补充材料，主文未给数字。）

**（b）语义的空间各向异性（§3.5.1，Fig. 4 a–b）。** 原文观察（§3.5.1）："road surfaces concentrate at low heights and short ranges, vegetation and buildings occupy higher elevations and mid-ranges, while dynamic objects appear only in narrow spatial bands." 因此按语义分布划分区域可提高每区语义纯度、缓解长尾稀有类的相对失衡。

### 2.2 D2-VFormer：深度引导双投影视图变换器（§3.4.2，Fig. 3）

三段渐进精化：

- **Stage 1 前向投影 + 下采样**：按 BEVStereo 方式融合多帧特征做深度投影提升，"producing sparse representations with 30% occupancy"（§3.4.2 Stage 1；注意此 30% 是前向投影输出口径，与 §3.4.1 的"约 90% 空"不同口径，引用勿混用）。体素特征与几何掩码同步按因子 $\lambda$ 下采样，以获得计算效率并容忍像素级深度误差。
- **Stage 2 后向投影稠密化**：用可变形交叉注意力 DCA 融合多视图图像特征补全几何（Eq. 4：$\mathbf{F}_{dense}=\mathrm{DCA}(\mathbf{F}_{down}, \mathbf{F}^{(I)})$）；论文指出无几何依据的朴素稠密化会在缺乏几何证据区域引入不一致特征。
- **Stage 3 非空体素两步精化**（仅作用于 $\mathcal{M}_{down}$ 标记的非空区域）：
  - 几何精化（Eq. 5）：非空体素 $\mathbf{F}_{geo}=\mathrm{DCA}(\mathbf{F}_{dense}, \mathbf{F}^{(D)}; \mathcal{M}_{down})$，空体素用可学习嵌入 $\mathbf{e}_{empty}$；
  - 语义增强（Eq. 6）：$\mathbf{F}_{out}=\mathrm{DCA}(\mathbf{F}_{geo}, \mathbf{F}^{(I)}; \mathcal{M}_{down})$。

其中 $\mathbf{F}^{(D)}$ 为 MoGe-2 的深度特征，$\mathbf{F}^{(I)}$ 为当前帧图像特征（Image Encoder 保留当前帧特征作语义线索，§3.3）。

### 2.3 R-EFormer：区域引导专家 Transformer（§3.5.2，Fig. 4 c–d）

- 3D 空间沿**距离**（near/mid/far）与**高度**（low/mid/high）划成 3×3 区域网格，每个区域 $\mathcal{R}_m$ 配一个专属专家 $E_m$（Fig. 4 caption："assigning each region a dedicated expert"）。
- Router 对所有区域打分 $s_m=\mathrm{Router}(\mathbf{F}_{out})$（Eq. 7），TopK 选出 $K$ 个相关区域（Eq. 8）。
- 专家即受区域二值掩码 $\mathcal{M}_m$ 约束的 DCA 模块（Eq. 9），最终输出为被选专家按归一化权重 $w_m$ 的加权和（Eq. 10）。

区域划分实现（§4.1 Implementation Details）：高度区间 $\{-1.0\,\mathrm{m} \le h < 0.2\,\mathrm{m},\ 0.2\,\mathrm{m} \le h < 2.2\,\mathrm{m},\ 2.2\,\mathrm{m} \le h \le 5.4\,\mathrm{m}\}$，距离区间 $\{0\,\mathrm{m} \le d < 10\,\mathrm{m},\ 10\,\mathrm{m} \le d < 30\,\mathrm{m},\ d \ge 30\,\mathrm{m}\}$。

### 2.4 R2-EFormer：递归专家变体（§3.5.3，Fig. 4 e）

为消除 R-EFormer 手工定义区域的超参敏感性，按 MoR 原则改用**单个专家递归精化** $n$ 轮：第 $t$ 轮由 router 从权重图选 top-$k_t$ 体素生成掩码（Eq. 11，$t=1$ 时为全空间 $\Omega$），再用 DCA 在该掩码内精化（Eq. 12：$\mathbf{F}^{(t)}=\mathrm{DCA}(\mathbf{F}^{(t-1)}, \mathbf{F}^{(I)}; \mathcal{M}^{(t)})$），$k_1>k_2>\cdots>k_n$ 固定递减保证 $\mathcal{M}^{(t)} \subset \mathcal{M}^{(t-1)}$。实现上三轮 mask 激活率取 100% / 75% / 50%（§4.1）。论文归纳其三点优势（§3.5.3）：单专家省参数、免手工区域定义、逐轮聚焦高置信区域。

### 2.5 骨干与解码

图像编码用 ResNet-50（§3.3）；精化后的特征经三线性插值上采样到目标分辨率，再过简单 CNN 解码器输出体素语义占据（§3.6）。

------

## 3. 实验

### 3.1 设置（§4.1）

- **数据**：nuScenes 1,000 场景（700 train / 150 val / 150 test，约 40,000 帧）；Occ3D-nuScenes 剔除无 LiDAR 的 150 个 test 场景，剩 850 个标注场景。标注体积 80 m × 80 m × 6.4 m（X/Y 各 -40~40 m，Z -1~5.4 m），体素分辨率 0.4 m，18 类（16 已知物体类 + 1 空 + 1 基准扩展类）。指标：二值 IoU（几何）与全类平均 mIoU（语义，主指标）。
- **实现**：ResNet50 图像编码器 + moge-2-vits-normal 深度估计；体素通道 $C=32$，空间分辨率 200×200×16（对应 80×80×6.4 m、0.4 m 体素）；投影特征按 1/16 下采样得 [H/4, W/4, Z]；注意力 8 heads、$N_{ref}=4$ 参考点；AdamW、lr $1\times10^{-4}$、weight decay $1\times10^{-2}$、每 GPU batch 2、8 张 NVIDIA L20（总 batch 16），训 24 epochs。

### 3.2 Occ3D-nuScenes 对比（§4.2，Table 1）

Table 1 为逐类 mIoU (%) 对比（caption 注明：∗ = 使用相机掩码监督训练；‡ = 官方预训练权重不可得、本文重训）。主要行：

| 方法 | Backbone | 输入尺寸 | mIoU (%) |
| --- | --- | --- | --- |
| BEVFormer [16] | R101 | 1600×900 | 26.9 |
| CTF-Occ [25] | R101 | 1600×900 | 28.5 |
| TPVFormer [9] | R101 | 1600×900 | 27.8 |
| SparseOcc [20] | R50 | 704×256 | 30.9 |
| FlashOcc∗ [33] | R50 | 704×256 | 37.8 |
| FB-Occ∗ [17] | R50 | 704×256 | 39.1 |
| OSP∗ [24] | R101 | 1600×900 | 41.2 |
| ViewFormer∗ [12] | R50 | 704×256 | 41.9 |
| BEVDet4D∗ [8] | R50 | 704×256 | 36.0 |
| **BEVDet4D(+Dr.Occ)∗** | R50 | 704×256 | **43.4** |
| COTR∗‡ [21] | R50 | 704×256 | 43.1 |
| **COTR(+Dr.Occ)∗** | R50 | 704×256 | **44.1** |

- 论文叙述（§4.2）："Our Dr.Occ framework, built upon BEVDet4D [8] with depth-guided dual projection and region-guided expert transformer, achieves the highest overall mIoU with substantial gains of +7.43% mIoU and +3.09% IoU, surpassing all publicly available approaches."
- 插入 COTR：43.1 → 44.1（+1.0，Table 1），与 §1 的"boost the overall mIoU by 1.0%"一致。
- 注意：**Table 1 只有逐类 mIoU，无总体 IoU 列**；"+3.09% IoU" 的 IoU 对比不见于 Table 1（见 §4 数字口径注记与遗留问题）。

### 3.3 消融（§4.3，Table 2，BEVDet4D 基线）

| D2-VFormer | R-EFormer | R2-EFormer | IoU (%) ↑ | mIoU (%) ↑ |
| --- | --- | --- | --- | --- |
| — | — | — | 70.36 | 36.01 |
| ✓ | | | 71.29 | 41.45 |
| ✓ | ✓ | | 73.45 | 43.03 |
| ✓ | | ✓ | 72.87 | **43.43** |

- 基线 70.36 IoU / 36.01 mIoU（§4.3："The baseline model achieves 70.36% IoU and 36.01% mIoU."）；加 D2-VFormer 后 "yields clear gains of +0.93% IoU and +5.44% mIoU"（§4.3，即 71.29/41.45 行）。
- D2+R-EFormer："further raises performance to 73.45% IoU and 43.03% mIoU"（§4.3）。
- R2-EFormer 变体："slightly reduces IoU but achieves the highest mIoU (43.43%), owing to its stronger focus on rare and hard-to-recognize categories through adaptive recursive refinement"（§4.3）——IoU 72.87 比 R-EFormer 的 73.45 低 0.58，但 mIoU 最高。
- 定性结果：Fig. 5（D2-VFormer 补全可行驶区域与人行道等细节）、Fig. 6（R-EFormer 修正 GT 标注错误并锐化边界；R2-EFormer 夜景花坛/人行道等难拟合体素的自适应聚焦）。

------

## 4. 核心结论

1. **深度先验的正确打开方式是"几何掩码"而非"直接投影"**：论文声称直接把 MoGe 深度用于前向投影反而掉点，须将深度转为 geometry-aware occupancy mask 作归纳偏置、只对非空体素做两步精化（§3.4.1–3.4.2）。
2. **深度与区域专家互补**：D2-VFormer 管几何对齐（IoU/前背景），R-EFormer/R2-EFormer 管长尾语义（mIoU）；消融显示 D2-VFormer 单独贡献 mIoU +5.44，区域专家再加 ~1.6–2.0（Table 2，§4.3）。
3. **递归专家（R2）以小幅 IoU 换最高 mIoU**：72.87 IoU（−0.58）对 43.43 mIoU（+0.40）相对 R-EFormer（Table 2）。
4. **即插即用**：同一套模块在 BEVDet4D（+7.43 mIoU，自报）与 COTR（+1.0 mIoU，Table 1）上都有增益（§1、§4.2）。

**数字口径注记**：正文精确值 "+7.43% mIoU / +3.09% IoU"（Abstract、§4.2）与已发表表格的舍入值对不严丝合缝——mIoU：Table 2 最大差 43.43−36.01=7.42，Table 1 舍入差 43.4−36.0=7.4；IoU：+3.09 恰等于 Table 2 中 D2+R-EFormer 行 73.45−70.36=3.09。7.43 应来自更高精度的未公布数值，引用时建议写"论文自报 +7.43 mIoU（表格舍入值 ~7.4）"。

------

## 遗留与 TODO

- **配图待补 assets/DrOcc/**（Fig. 1 投影范式示意 / Fig. 2 总体架构 / Fig. 3 D2-VFormer / Fig. 4 区域划分与递归掩码 / Fig. 5–6 定性对比）。
- Table 1 无总体 IoU 列，"+3.09% IoU" 仅能由 Table 2 消融行（D2+R-EFormer 73.45 vs 70.36）对上；全量 SOTA 的 IoU 对比疑在补充材料，待查（v3 HTML 主文未含）。
- §3.4.1 提到"naive depth 整合方式的消融见补充材料"（"These findings are supported by ablation studies provided in the supplementary material."），主文无数字；如需立"naive MoGe 深度前向投影掉点"类 claim，需先拿到补充材料数字。
- 开源情况：本次抓取的摘要页与 v3 全文均无 GitHub/项目页链接，标注"未开源/未查得"；建议人工复核 CVPR 2026 open access 页面与 GitHub 搜索后再入库。
- 作者列表从 LaTeXML HTML 提取时邮箱与姓名对位略有错乱（渲染顺序疑有交叉），入库时如需作者信息请以 PDF 为准复核。
- 精确值 7.43/3.09 与表格舍入值的缝隙（见 §4 口径注记）如需写入 claim，建议以表格可复验的舍入值（36.0→43.4；70.36→73.45）为 falsifier 锚点。
