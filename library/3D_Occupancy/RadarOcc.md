# RadarOcc: Robust 3D Occupancy Prediction with 4D Imaging Radar

**出处会议：** NeurIPS 2024
**是否开源：** https://github.com/Toytiny/RadarOcc
**关键词：** 4D 成像雷达、3D 占据预测、4D 雷达张量 (4DRT)、旁瓣感知、球坐标编码

------

## 1. 概述

现有的 3D 占据预测方法多依赖于 LiDAR 或摄像头，而雷达虽具备全天候工作能力，但传统方法将其处理为稀疏点云，导致 CFAR（恒虚警率）检测过程中丢失了大量低 RCS（雷达散射截面）物体的弱反射信号。

该论文提出直接处理原始 **4D 雷达张量（4DRT）** $V \in \mathbb{R}^{R \times A \times E \times D}$。通过数据减量技术降低计算开销，并在球坐标系下进行特征提取，最后通过可学习的聚合机制转换到笛卡尔空间完成占据预测。

------

## 2. 方法

### 2.1 数据减量 (Data Volume Reduction)

该模块旨在解决 4D 成像雷达张量（4DRT）计算开销巨大与信号噪声干扰（尤其是旁瓣干扰）的核心矛盾。该模块分为两个具体步骤：**多普勒箱描述符（Doppler Bins Descriptor, DBD）**和**旁瓣感知空间稀疏化（Sidelobe-aware Spatial Sparsifying, SSS）**。

#### 多普勒箱描述符 (Doppler Bins Descriptor, DBD)

原始 4D 雷达张量 $V$ 的维度为 $R \times A \times E \times D$（距离、方位角、俯仰角、多普勒）。其中多普勒轴 $D$ 包含了物体的径向速度信息。直接下采样会丢失速度特征，而全量保留则会导致数据量超负荷。

DBD 的处理逻辑是对每个距离-角度单元 $(r, a, e)$ 沿多普勒维度提取 **8 个统计描述符**，将 $D$ 维向量映射为 $\mathbb{R}^8$：

- **能量极值（Top-3 Power Values）**：提取该单元内多普勒频谱中功率最大的前三个值，代表该空间位置最显著的反射强度。
- **速度索引（Top-3 Doppler Indices）**：记录上述三个极值对应的多普勒索引，这为模型提供了目标的径向速度线索，有助于区分动态行人与静态背景。
- **分布统计量（Mean & Standard Deviation）**：计算该多普勒轴的功率均值和标准差。均值代表背景噪声水平，标准差反映了能量分布的集中度（通常点目标反射集中，噪声分布分散）。

通过此操作，数据量压缩至原来的 $8/D$，同时保留了关键的运动学特征。

#### 旁瓣感知空间稀疏化 (Sidelobe-aware Spatial Sparsifying, SSS)

雷达传感器由于天线阵列的局限，强反射目标（如大型货车、金属指示牌）会产生严重的**旁瓣（Sidelobes）**，在张量中表现为围绕主瓣的高能噪声区域。如果采用全局百分比（Global Percentile）进行稀疏化，会导致两个问题：

1. **弱信号丢失**：远距离目标或低 RCS 目标（如行人、自行车）的信号功率远低于近处强目标的旁瓣，从而被直接过滤。
2. **噪声冗余**：强目标周围的旁瓣会被误认为有效特征大量保留。

**SSS 的具体实现方案：**

- **按距离采样（Range-wise Selection）**：不再进行全局功率排序，而是在每一个距离单元（Range bin）内独立进行筛选。
- **局部 Top-$N_r$ 策略**：对于每个特定的距离 $r_i$，在所有的方位角 $A$ 和俯仰角 $E$ 组合中，只选取功率最大的前 $N_r$ 个元素。
- **技术优势**：
  - **保证召回率**：由于筛选是在各个距离层级内部完成的，远处的行人（即使绝对功率低）只要在其所在的距离层级内相对显著，就会被保留。
  - **抑制旁瓣**：在同一距离层级内，主瓣功率必然高于其旁瓣，Top-$N_r$ 能够优先选择主瓣中心，从而自然地过滤掉同一距离轴上的扩散噪声。

#### 减量后的结果

经过这两个步骤，原始的稠密 4DRT 被转化为一个**稀疏张量**。每个保留的体素位置不仅包含原始的反射功率，还携带着由 DBD 提取的 8 维特征向量。这种处理方式将单帧数百 MB 的数据压缩到了深度学习模型可高效处理的量级，同时在输入端解决了由于雷达物理特性导致的低 RCS 目标消失问题。

### 2.2 基于球坐标的特征编码 (Spherical-based Feature Encoding)

基于球坐标的特征编码（Spherical-based Feature Encoding）是 RadarOcc 处理 4D 雷达数据的核心设计，其目的是解决雷达采样物理特性与标准笛卡尔坐标系建模之间的几何失配问题。

该模块对经过数据减量后的稀疏张量进行操作，主要包含三个核心组件：

#### 2.2.1 距离感知自注意力 (Range-wise Self-attention, RSA)

- **输入**：稀疏体素集合，每个点带有索引 $(r_i, a_i, e_i)$ 和 DBD 特征向量。

- **逻辑**：将同一距离 $r$ 下的所有稀疏点视为一个序列。由于同一距离下的旁瓣干扰和目标反射具有较强的角度相关性，RSA 沿方位角和俯仰角维度进行自注意力计算。

- **公式推导**：

  对于第 $r$ 个距离层级的特征集合 $X_r = \{x_{i} | \text{range}(x_i) = r\}$，计算：

  $$\text{Attn}(X_r) = \text{Softmax}\left(\frac{(X_r W_Q)(X_r W_K)^T}{\sqrt{d_k}}\right) (X_r W_V)$$

  该操作在不破坏距离结构的前提下，增强了同一距离面上物体特征的区分度。

#### 2.2.2 序列化 3D 稀疏卷积 (Sequential 3D Sparse Convolutions)

- **实现**：将球坐标索引 $(r, a, e)$ 直接视作 3D 空间的三个轴。
- **过程**：使用流形稀疏卷积（Submanifold Sparse Convolution）对特征进行下采样和拓扑提取。在这一步中，模型学习的是球坐标邻域内的局部几何模式。
- **优势**：相比稠密卷积，稀疏卷积大幅降低了内存占用，且能跳过无信号的空白区域。

#### 2.2.3 3D 可变形自注意力 (3D Deformable Self-attention, 3D-DSA)

- **物理考量**：雷达波束随距离增加而发散，这意味着球坐标下的一个固定大小的核，其对应的物理体积随 $r$ 增大。

- **机制**：对于球坐标空间中的查询点 $p = (r, a, e)$，模型预测 $K$ 个偏移量 $\Delta p_k$ 和权重 $w_k$。

- **实现逻辑**：

  $$Y(p) = \sum_{k=1}^{K} W_k \cdot X(p + \Delta p_k)$$

  其中 $X(p + \Delta p_k)$ 是通过在球坐标空间线性采样得到的特征。

- **作用**：偏移量 $\Delta p_k$ 允许模型在球坐标空间内灵活调整感受野，从而补偿由于距离变化带来的几何变形。

#### 2.2.4 特征表示

最终，该模块输出一系列多尺度的球坐标特征图（Spherical Feature Maps），这些特征图保持了雷达原始的分辨率优势，并作为后续 Spherical-to-Cartesian (S2C) 聚合模块的输入，用于填充 3D 占据网格。

### 2.3 球坐标到笛卡尔坐标的特征聚合 (S2C Aggregation)

**球坐标到笛卡尔坐标的特征聚合（Spherical-to-Cartesian Aggregation, S2C）** 是 RadarOcc 的关键步骤，负责将球坐标系下提取的高阶特征重构到用于占据预测的笛卡尔 3D 空间。

#### 2.3.1 核心动机

雷达的物理采样是球坐标（$r, \phi, \theta$），而 3D 占据预测的任务目标是在直角坐标系（$x, y, z$）中定义的体素。直接使用三线性插值等几何转换会导致：

- **采样非均匀性**：近处体素在球坐标中对应极多采样点，远处体素对应极少，插值会导致特征严重退化或走样。
- **信息损失**：硬性映射无法利用周围的空间上下文来补偿雷达射线的发散特性。

#### 2.3.2 Voxel Queries（体素查询）

该模块首先在笛卡尔空间初始化一组可学习的 **Voxel Queries**，记为 $Q \in \mathbb{R}^{H \times W \times L \times C}$。

- 每一个 Query 对应 3D 占据网格中的一个特定位置 $(x, y, z)$。
- 这些 Query 作为主动探测器，去球坐标特征图中寻找并聚合相关的特征信息。

#### 2.3.3 参考点投影（Reference Point Projection）

对于笛卡尔空间中的每一个 Query 位置 $P_{xyz} = (x, y, z)$，通过标准坐标转换公式计算其在球坐标系中的**参考点** $\hat{P}_{sph} = (\rho, \phi, \theta)$：

$$\rho = \sqrt{x^2 + y^2 + z^2}$$

$$\phi = \arctan2(y, x)$$

$$\theta = \arcsin(z/\rho)$$

这个参考点 $\hat{P}_{sph}$ 确定了该体素在球坐标特征图中的大致搜索中心。

#### 2.3.4 基于可变形交叉注意力（Deformable Cross-attention）的聚合

S2C 并没有直接取参考点位置的特征，而是采用 **3D 可变形交叉注意力机制**：

1. **偏移量预测**：Query 根据参考点附近的上下文，学习预测出 $K$ 个采样点的偏移量 $\{\Delta P_k\}_{k=1}^K$。这些偏移量是在球坐标空间（距离、方位角、俯仰角维度）中定义的。

2. **多尺度采样**：

   - **Value (V)**：来自“基于球坐标的特征编码”阶段输出的多尺度球坐标特征图。
   - **Sampling**：在球坐标空间中，以 $\hat{P}_{sph} + \Delta P_k$ 为坐标，从特征图中进行双线性插值采样。

3. **特征聚合**：

   $$S2C(q, \hat{P}_{sph}) = \sum_{m=1}^{M} W_m \left[ \sum_{k=1}^{K} A_{mk} \cdot W'_m F_{sph}(\hat{P}_{sph} + \Delta P_{mk}) \right]$$

   其中 $M$ 是注意力头数，$A_{mk}$ 是注意力权重，$F_{sph}$ 是球坐标特征图。

#### 2.3.5 跨维度对齐的优势

- **自适应感受野**：通过学习偏移量，模型可以根据目标在球坐标系中的分布特性（如远近导致的单元格物理体积差异）动态调整采样区域。
- **消除插值误差**：这种“基于查询”的聚合方式将坐标转换过程纳入了端到端的学习中，避免了传统插值带来的特征平滑问题。
- **多尺度对齐**：通过在不同分辨率的球坐标特征图上同时采样，确保了 Cartesian 体素能够聚合到不同层级的语义信息（如物体的精细边界与整体几何结构）。

#### 2.3.6 输出结果

该模块的输出是一个**稠密的 Cartesian 3D 特征卷** $F_{vox} \in \mathbb{R}^{H \times W \times L \times C}$。这个特征卷已经完成了从雷达原始采样空间到物理现实空间的映射，随后将输入到 3D 卷积解码器中进行最终的占用概率预测。

### 2.4 3D 占据解码与损失函数

- **解码器结构**：采用多尺度 3D 卷积与跳跃连接（Skip Connection）组成的 3D UNet 架构，输出体素类别的概率分布。

- **损失函数组合**：

  - **Focal Loss**：缓解空闲体素与占用体素之间的类别极度不平衡。

  - **Lovasz-softmax Loss**：直接优化交并比（mIoU）指标，增强边界预测准确度。

  - **Affinity Loss**：计算相邻体素间的相似性，约束局部几何结构的连贯性。

    $$\mathcal{L}_{total} = \lambda_{f} \mathcal{L}_{focal} + \lambda_{l} \mathcal{L}_{lovasz} + \lambda_{a} \mathcal{L}_{aff}$$

------

## 3. 实验

> **来源与抓取记录（2026-11-03 实抓）**：arXiv:2405.14014（NeurIPS 2024 camera-ready **v4**，2024-10-27 提交）。① PDF https://arxiv.org/pdf/2405.14014 （22 页 / 5 图 / 8 表，编译日期 2024-10-29，pdftotext -layout 提取）；② HTML v4 https://arxiv.org/html/2405.14014v4 。⚠ 注意：`arxiv.org/html/2405.14014`（无版本号）当前返回**旧版构建**（K-Radar 相关引用编号为 [40, 44]、其 Table 3 为模态对比表、作者署名 "Lawrence Zhu"）；本节 locator 与 quote 一律以 **v4** 为准——v4 中 K-Radar=[42]、Enhanced K-Radar=[46]、OpenOccupancy=[3]。

### 3.1 数据与评测协议（原文 §5.1）

- **数据集**：K-Radar [42]——论文称"to the best of our knowledge, the only autonomous driving dataset providing available 4DRT data"。占据 GT 由连续 LiDAR 扫描叠加 + 体素化生成；因 K-Radar 无细粒度点级语义，只标三类：foreground（sedan/truck/pedestrian 等）/ background / free。恶劣天气（雨夹雪/雨/雪）序列因 LiDAR GT 含噪声**只用于定性对比**，占据标签仅对 well-condition 序列生成并划分 train/val/test。
- **RoI 与分辨率**：front [0, 51.2m]、side [-25.6m, 25.6m]、height [-2.6m, 3m]；体素 0.4m → 128×128×14。
- **指标**：IoU（仅几何占用/空闲，不带语义）+ 前景/背景两类的 mIoU；按 12.8m / 25.6m / 51.2m 三个距离分别报告。quote（§5.1 Evaluation protocol）："we calculate the mean IoU (mIoU) across these two classes."
- 所有对比模型均在 K-Radar well-condition 训练集上训练（quote："we train all evaluated models on our K-Radar well-condition training set."）；附录 B：10 epochs、Adam、lr 3e-4、每 GPU batch size 1。
- ⚠ **口径限定**：该协议为本文自定义（K-Radar 无官方占据 benchmark），指标是 IoU/mIoU 而**非** RayIoU，GT 为 LiDAR 叠加自生成——与 nuScenes / SemanticKITTI / OpenOccupancy 系数字不可直接比。

### 3.2 与雷达输入基线对比（原文 §5.2，Table 1，p.8）

| Method | Input | IoU 12.8/25.6/51.2m | mIoU 12.8/25.6/51.2m | BG IoU 12.8/25.6/51.2m | FG IoU 12.8/25.6/51.2m |
| --- | --- | --- | --- | --- | --- |
| L-baseline [3] | RPC | 42.8 / 34.9 / 27.9 | 23.5 / 18.6 / 14.6 | 43.5 / 34.6 / 27.3 | 3.5 / 2.6 / 1.9 |
| L-CONet [3] | RPC | 46.1 / 36.0 / 25.0 | 24.6 / 20.3 / 14.4 | 43.3 / 35.4 / 25.6 | 5.8 / 5.2 / 3.1 |
| L-baseline [3] | 4DRT-XYZ | 47.4 / 38.1 / 28.5 | 29.9 / 24.3 / 17.5 | 46.4 / 37.5 / 27.9 | 13.4 / 11.1 / 7.2 |
| RadarOcc (Ours) | 4DRT | 48.8 / 39.1 / 30.4 | 34.3 / 28.5 / 22.6 | 47.9 / 38.2 / 29.4 | 20.7 / 18.7 / 15.8 |

- RPC = CFAR 雷达点云；4DRT-XYZ = 把 4DRT 转成 0.4m 笛卡尔体素后喂 LiDAR 框架（OpenOccupancy baseline）。RadarOcc 四组指标全列第一。
- 论文声称的相对提升（§5.2，与上表核验一致：34.3/24.6=+39.4%、28.5/20.3=+40.4%、22.6/14.4=+56.9%）：quote "the mIoU of L-CONet [3] is relatively improved by 39.4%, 40.4% and 56.9% for different volumes (12.8m, 25.6m, 51.2m)."
- 与「CFAR 点云丢弱反射」诊断对应：FG IoU 差距最大（51.2m：15.8 vs RPC 的 1.9~3.1）；4DRT-XYZ 居中且远距离 FG IoU 仍明显落后（7.2 vs 15.8），论文归因（⚠ 原文此句语法有误，照抄）：quote "We credit this to the interpolation errors led to small and far foreground objects when we converting 4DRT to Cartesian coordinates."

### 3.3 关键设计消融（原文 §5.3，Table 2，p.8，well-condition test split）

⚠ 表题原文把 SSS 拼作 "sparfiying"（照抄）："Table 2: Ablation studies on key designs of RadarOcc. DBD, SSS, SFE refer to the Doppler bins descriptor, sidelobe-aware spatial sparfiying, and spherical-based feature encoding, respectively."

⚠ 消融方式为「从完整 pipeline 单独替换/移除」的 w/o 式，不是从零累加：

| 行 | 配置 | IoU 12.8/25.6/51.2m | mIoU 12.8/25.6/51.2m | BG IoU 12.8/25.6/51.2m | FG IoU 12.8/25.6/51.2m |
| --- | --- | --- | --- | --- | --- |
| (a) | Ours | 48.8 / 39.1 / 30.4 | 34.3 / 28.5 / 22.6 | 47.9 / 38.2 / 29.4 | 20.7 / 18.7 / 15.8 |
| (b) | Ours w/o DBD（换成平均池化） | 48.1 / 39.4 / 30.0 | 33.6 / 28.9 / 22.6 | 47.2 / 38.7 / 29.2 | 20.0 / 19.1 / 16.0 |
| (c) | Ours w/o SSS（换成 percentile-based 稀疏化 [42, 46]） | 44.2 / 36.8 / 28.7 | 24.1 / 20.2 / 15.6 | 42.3 / 35.6 / 27.6 | 5.9 / 4.7 / 3.5 |
| (d) | Ours w/o SFE（转笛卡尔编码 + 省略 S2C 聚合） | 46.2 / 38.4 / 29.4 | 30.4 / 26.5 / 21.1 | 45.5 / 37.5 / 28.5 | 15.4 / 15.5 / 13.9 |

- **SSS（消融增益最大）**：(a)-(c) 差值——mIoU +10.2 / +8.3 / +7.0；FG IoU +14.8 / +14.0 / +12.3（20.7/18.7/15.8 → 5.9/4.7/3.5，低 RCS 前景在 percentile 稀疏化下几乎清零）；IoU/BG 同向变差。论文解释（⚠ 句尾 "prediciton" 拼写照抄）：quote "Our sidelobe-aware approach leads to a remarkable advancement in performance, especially in mIoU metrics. This is attributed to its ability to preserve more valid elements from diverse ranges and suppress sidelobes for sparse RTs, allowing for more accurate prediciton."
- **SFE = 球坐标编码 + S2C（正增益但中等）**：(a)-(d) 差值——mIoU +3.9 / +2.0 / +1.5；FG IoU +5.3 / +3.2 / +1.9。⚠ 行 (d) 是**两处同时改动**（原文："transform sparse RT to Cartesian coordinates before feature encoding ... and omit the spherical-to-Cartesian feature aggregation"），该行差距**不能拆分归因**给「球坐标编码」或「S2C 聚合」单独之一。quote "We can see that our spherical-based feature encoding gains the performance for each metric as our strategy preserves the original data distribution, avoiding incurring interpolation errors."
- **DBD（增益边际且方向混杂）**：12 列中 6 列 w/o DBD 更差、5 列反而更高（25.6m 全部四列 w/o DBD 略高，51.2m FG IoU 16.0 > 15.8）、1 列持平；差距均 ≤0.7。论文原话 "the performance of RadarOcc is degraded in most metrics" 且自认 quote "the improvement is somehow marginal due to the limited Doppler measurement range of the radar used in K-Radar [42], which wraps around the overflow values, causing ambiguity in Doppler velocity."；附录 C.2：多普勒量程 ±1.92 m/s，3.0 m/s 会被测成 -0.84 m/s（回绕），并明言 "the change in Nd does not significantly impact our results."（Table 7，Nd=1~5 的 mIoU@51.2m 在 18.7~19.4 间波动，无单调趋势）

### 3.4 补充消融（原文附录 C，Table 6 / 8；Table 7 见上）

- **Nr 扫描（Table 6，validation set）**：Nr=850 CUDA OOM；Nr=650/450/250/50 的 mIoU@12.8m 分别 34.4/36.8/34.0/32.6。⚠ 表内 mIoU@12.8m 最高点其实是 **Nr=450（36.8）**，论文取 Nr=250 的原话是 "RadarOcc achieves the best results in half of all metrics on our validation set when Nr = 250."（"一半指标"主要指三列 IoU），即 SSS 增益对 Nr 有敏感性、非单调。
- **Range-wise self-attention（Table 8，test split）**：w/o RWA 时 IoU 48.6/39.0/30.7（51.2m 反升 0.3）、mIoU 32.8/27.7/22.0、FG IoU 18.1/16.3/14.2；论文给的 FG IoU 相对增益 14.4%/14.7%/11.3% 与表核验一致。quote "We credit this to the ability of range-wise self-attention to further suppress the sidelobe noises appearing around the foreground objects."

### 3.5 模态对比与效率（原文 §5.5 Table 5，p.9；§5.4 Table 3/4）

- **Table 5（well-condition test split）**：L(64) mIoU 53.7/45.2/36.6 全列最强；L(16) mIoU 39.0/34.3/28.2；RadarOcc 34.3/28.5/22.6；mono C mIoU 36.1/23.9/14.7、stereo C(S) 40.8/25.4/16.2。论文口径 quote "RadarOcc still shows comparable performance to 16-beam LiDAR, and surpasses monocular and stereo camera-based method in most metrics."（⚠ "comparable" 系论文自评：mIoU@51.2m 仍落后 16 线 LiDAR 5.6 点，22.6 vs 28.2，且各距离列均低于 L(16)）
- 相对相机（论文数字，核验一致）：mIoU/IoU@51.2m 相对 stereo SurroundOcc +39.5%/+19.7%，相对 mono +53.7%/+26.1%。
- **恶劣天气只有定性结果（Fig. 3），全文无数值表**——"robust in adverse weather" 的定量证据本文未提供（adverse-weather split 连 GT 都未生成）。
- **效率（§5.4）**：单卡 GPU（原文写 "Nvidia GTX 3090"）3.30 fps → 计算优化（删冗余层 + 占据解码 FP32→FP16 量化）后 7.46 fps（+126.1%）；优化后 mIoU 35.5/27.6/20.9（12.8m 反升 1.2、51.2m 降 1.7），FG IoU 25.0/17.5/13.1（12.8m 大升、51.2m 降）。

### 3.6 原文与笔记既有内容不一致处（照抄加注，未改上文）

- 本笔记「2.4 3D 占据解码与损失函数」写主损失为 **Focal Loss**；原文 §4.6 实为 **cross-entropy（类频率倒数加权）**：quote "we use the cross-entropy loss as the primary loss to optimize the training and incorporate the lovasz-softmax loss [104] to handle the class imbalances."（lovasz-softmax 与 scene-/class-wise affinity loss 两条与笔记一致；主损失表述以原文为准，是否修笔记由主人定。）

------

## 4. 核心结论

1. **SSS 是 Table 2 消融中收益最大的组件**：换成 percentile-based 稀疏化后 mIoU 掉 7.0~10.2 点、FG IoU 掉 12.3~14.8 点（低 RCS 前景几乎清零）——论文「旁瓣感知稀疏化保护低 RCS 弱信号」的动机在原文实验上有直接数值支撑（数字为论文自报，K-Radar 单数据集；详见 claim-radarocc-sss-ablation-gain-10p2）。
2. 球坐标编码 + S2C 的**合并**消融为一致正增益但幅度中等（mIoU +1.5~+3.9），且消融行同时改了编码与聚合两处，不能拆分归因；「球坐标路线优于笛卡尔」在本文证据下是中等强度、单数据集的结论。
3. DBD 在 K-Radar 上收益边际（≤0.7、方向混杂），论文归因于该雷达多普勒量程小且回绕（±1.92 m/s）；换更大量程传感器是否改善，论文自己也只是猜测。
4. 模态排序（正常天气、K-Radar 自定义协议）：64 线 LiDAR >> RadarOcc ≈（落后于）16 线 LiDAR > 相机 SurroundOcc（多数列）；恶劣天气优势只有定性图，无数字。
5. 全部数字基于 K-Radar 自定义占据评测（IoU/mIoU、LiDAR 叠加自生成 GT、0.4m 体素），与其他数据集/协议不可直接比；引用任何上表数字必须带此 scope。