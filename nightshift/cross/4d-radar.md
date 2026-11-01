# [cross] 四篇 4D 雷达笔记横向对比（RadarOcc / R4Det / SGDet3D / HGSFusion）

- 日期：2026-11-02
- 性质：TODO 候选池对比素材。只记录方法路线、数据集与指标口径、结论之间的互相支持 / 矛盾 / 口径差异，**不下【谁更好】的评价性结论**。
- 引用规则：所有数字与结论均为各笔记所录论文声称，**尚未独立验证**。标记约定：「…」= 从笔记逐字复制的引文（Grep 已验证）；【…】= 笔记小节标题或本文概括标签（非引文）。
- 来源笔记（均为本地文件，只读）：
  - RadarOcc：`library/3D_Occupancy/RadarOcc.md`（NeurIPS 2024，开源，3D 占据预测，纯雷达）
  - R4Det：`library/Classical_Detection/R4Det.md`（CVPR 2026，未开源，3D 检测，雷达-相机）
  - SGDet3D：`library/Classical_Detection/SGDet3D.md`（RA-L 2025，开源，3D 检测，雷达-相机）
  - HGSFusion：`library/Multimodal_Fusion/HGSFusion.md`（AAAI 2025，开源，3D 检测，雷达-相机）

------

## 1. 任务与输入定位速览

| 笔记 | 任务 | 雷达输入 | 融合模态 | 数据集（笔记记录） | 指标（笔记记录） |
| --- | --- | --- | --- | --- | --- |
| RadarOcc | 3D 占据预测 | 原始 4D 雷达张量（4DRT） | 无（纯雷达） | 笔记无实验章节，未记录 | 未记录（损失设计提及 mIoU） |
| R4Det | 3D 目标检测 | 稀疏雷达点云 | 雷达-相机 + 时序 | TJ4DRadSet、VoD | BEV mAP / 3D mAP；VoD 用 mAP_EAA |
| SGDet3D | 3D 目标检测 | 稀疏雷达点云 | 雷达-相机 | VoD、TJ4DRadSet | mAP_EAA / mAP_DC |
| HGSFusion | 3D 目标检测 | 稀疏雷达点云（+生成点） | 雷达-相机 | VoD、TJ4DRadSet | RoI AP / EAA AP / 3D mAP |

定位差异（口径前提）：四篇分属两个任务族（占据预测 vs 目标检测）、两种输入机制（原始张量 vs 点云），笔记之间不存在同任务同口径的横向 leaderboard。

------

## 2. 方法路线逐项对比

### 2.1 雷达输入表示：绕过 CFAR 处理原始张量 vs 点云增密

- **RadarOcc（绕过点云化）**：RadarOcc.md §1【概述】

  > 但传统方法将其处理为稀疏点云，导致 CFAR（恒虚警率）检测过程中丢失了大量低 RCS（雷达散射截面）物体的弱反射信号。

  > 该论文提出直接处理原始 **4D 雷达张量（4DRT）**

- **HGSFusion（点云化之后做生成补点）**：HGSFusion.md §2【雷达混合生成模块 (RHGM)】

  > RHGM 的设计逻辑是：雷达点稀疏是因为检测阈值限制，方位不准是因为 DOA 算法在噪声下产生的峰值偏移。

- **R4Det（点云化之后做深度监督补强）**：R4Det.md §1【概述】

  > 解决 4D 雷达-相机融合中深度估计不准、缺乏自车位姿（Ego-pose）时的时序融合失效，以及稀疏雷达点云下小目标检测能力差的问题。

- **SGDet3D（点云化之后做双向特征互补）**：SGDet3D.md §1【概述】

  > SGDet3D 旨在解决现有 4D 雷达与相机融合模型中单模态信息利用不充分以及缺乏深层跨模态交互的问题。

记录：四篇对雷达稀疏的诊断一致（RadarOcc 把病因追溯到 CFAR/阈值丢弱信号，其余三篇把稀疏当作既定输入条件做补偿），处方分成两条路线——RadarOcc 在信号层面绕过点云化，其余三篇在点云/特征层面做增密与互补。

### 2.2 噪声 / 旁瓣 / DOA 误差处理

- **RadarOcc：旁瓣感知稀疏化 + 距离向注意力**。RadarOcc.md §2.1【旁瓣感知空间稀疏化 (SSS)】明确反对全局阈值式筛选：

  > 如果采用全局百分比（Global Percentile）进行稀疏化，会导致两个问题：

  > 远距离目标或低 RCS 目标（如行人、自行车）的信号功率远低于近处强目标的旁瓣，从而被直接过滤。

  处方是逐距离单元 Top-$N_r$：

  > **按距离采样（Range-wise Selection）**：不再进行全局功率排序，而是在每一个距离单元（Range bin）内独立进行筛选。

  注意力同样按距离分层（RadarOcc.md §2.2【距离感知自注意力 (RSA)】）：

  > 由于同一距离下的旁瓣干扰和目标反射具有较强的角度相关性，RSA 沿方位角和俯仰角维度进行自注意力计算。

- **R4Det：局部窗口注意力抑制远距噪声**。R4Det.md §2.1【全景深度融合模块 (PDF)】：

  > 其pipeline依然是**邻域交叉注意力 (NCA)**：放弃全局注意力，在投影点周围的局部窗口内计算注意力，减少远距离噪声干扰。

- **SGDet3D：同名 NCA 算子用于深度扩散**。SGDet3D.md §2.1【几何深度补全 (GDC)】：

  > 利用邻域交叉注意力 (NCA) 算子，将稀疏雷达深度扩散至图像特征

- **HGSFusion：把 DOA 误差显式建模为高斯分布**。HGSFusion.md §2.2【混合概率密度函数 (Hybrid PDF)】在前景雷达点周围用高斯分布

  > 模拟 DOA 误差的分布特性

记录：RadarOcc 的距离向局部化（SSS + RSA）与 R4Det 的【放弃全局注意力、局部窗口】在哲学上同向（局部结构优先于全局排序）；R4Det 与 SGDet3D 笔记中出现同名算子 NCA（是否同一来源、谁引用谁，笔记未记载，见遗留问题）。旁瓣（sidelobe）一词只有 RadarOcc 笔记明确处理；HGSFusion 处理的是 DOA 峰值偏移，属同类物理噪声的不同侧面。

### 2.3 坐标系选择与高度维使用

- **RadarOcc：球坐标特征提取 + 可学习 S2C 回笛卡尔**。RadarOcc.md §2.2：

  > 基于球坐标的特征编码（Spherical-based Feature Encoding）是 RadarOcc 处理 4D 雷达数据的核心设计，其目的是解决雷达采样物理特性与标准笛卡尔坐标系建模之间的几何失配问题。

  对硬性几何变换的批评（RadarOcc.md §2.3 S2C 核心动机段）：

  > **采样非均匀性**：近处体素在球坐标中对应极多采样点，远处体素对应极少，插值会导致特征严重退化或走样。

  距离导致的几何变形（RadarOcc.md §2.2【3D 可变形自注意力 (3D-DSA)】）：

  > 雷达波束随距离增加而发散，这意味着球坐标下的一个固定大小的核，其对应的物理体积随 $r$ 增大。

- **R4Det / SGDet3D：统一到 BEV**。R4Det 的深度监督动机（R4Det.md §2.1）：

  > 此操作从数学上降低了深度分布的方差，确保在 LSS（Lift-Splat-Shoot）视锥转换时特征集中，消除几何散射（Geometric Scattering）。

  SGDet3D（SGDet3D.md §2【双分支融合模块】）：

  > 该模块分别处理异构数据的单向增强，最终将双分支特征在统一的 BEV 空间对齐并融合生成 RC-BEV。

- **HGSFusion：主张 2D（BEV）优于 3D 占据**。HGSFusion.md §4.5【空间模式类型与监督消融 (Table 7)】：

  > **分析**：2D 空间模式表现优于 3D。这是因为 4D 雷达高度角分辨率不足，3D 占据预测会引入噪声高度信息，而 2D 占据在 BEV 平面上更为精准。

记录（张力点，见 §4）：RadarOcc 整条 pipeline 建立在 4DRT 的俯仰维 $E$ 之上（球坐标三轴 $r,a,e$），并声称（RadarOcc.md §2.2 特征表示段）：

> 这些特征图保持了雷达原始的分辨率优势

HGSFusion 的消融分析则称 4D 雷达高度角分辨率不足、3D 占据引入噪声。两处针对的任务与实现不同（张量原生俯仰 bin 的占据预测 vs 检测管线里的 3D 空间模式预测），但就对 4D 雷达俯仰信息可用性的判断方向相反。

### 2.4 融合拓扑（三篇融合笔记互比；RadarOcc 纯雷达不参与）

- **雷达几何 → 图像深度**（三篇都有）：
  - SGDet3D：GDC「利用雷达物理先验修正相机深度」（SGDet3D.md §1）。
  - HGSFusion：「通过“空间同步”用雷达几何信息补足图像深度」（HGSFusion.md §1【DSM 模块】）。
  - R4Det：稀疏雷达锚定深度损失 $\mathcal{L}_{abs}$ 限定在「存在雷达点云投影的稀疏像素掩码集合 $\mathcal{M}_{sparse}$」（R4Det.md §2.1）。
- **图像语义 → 雷达**（两篇有）：
  - SGDet3D：SRP「利用图像语义丰富雷达特征」（SGDet3D.md §1）。
  - HGSFusion：RHGM「利用图像语义引导，通过混合概率分布（高斯+均匀）生成密集的雷达点」（HGSFusion.md §1【RHGM 模块】）；生成点用 Separate Encoding 防止「在 Pillar 化过程中互相干扰」（HGSFusion.md §2.3，原句为「为了防止不同属性的点（带语义特征与不带语义特征）在 Pillar 化过程中互相干扰」）。
  - R4Det 笔记中的图像语义仅出现在末端精炼（IGDR 用「2D 实例语义构建无几何投影误差的特征先验」，R4Det.md §2.3），没有图像语义改写雷达特征的模块。
- **注入层级不同**：HGSFusion 在输入层改写点云（生成新点反向投影回 3D）；SGDet3D / R4Det 在特征层注入。R4Det 提供了注入后通道注意力冲突的反例（R4Det.md §3.2）：

  > 在 DGTF 中叠加 SE 通道注意力会使 BEV mAP 从 50.41 降至 49.12。

- **时序融合只有 R4Det 一家做**（单源结论）：R4Det.md §2.2【DGTF】：

  > 在无自车位姿先验的情况下，将时序融合解耦为空间对齐与状态更新两个独立操作。

### 2.5 深度 / 几何中间量的监督来源（三篇融合笔记互比）

- **R4Det：三重深度监督（雷达稀疏 + 基础模型密集伪标签 + 相对排序）**。R4Det.md §2.1：

  > 它利用视觉大模型在全图像素集合 $\mathcal{M}_{all}$ 上提供密集的平滑约束。

  其消融（R4Det.md §2.1【三重监督的实验支撑】，Table 5）称每加一种监督 BEV mAP 单调增长：45.15 → 46.08（+$\mathcal{L}_{dense}$）→ 46.86（+$\mathcal{L}_{relative}$）。
- **SGDet3D：监督标签来源消融**。SGDet3D.md §5.3【深度监督源分析】：

  > 仅使用稀疏的雷达点云监督即可达到 58.75 的 mAP，验证了该几何感知范式的可行性。引入高密度 LiDAR 真值监督可进一步解锁深度估计算子的性能上限。

- **HGSFusion：空间模式显式监督**。HGSFusion.md §4.5（Table 7）：

  > 同时，显式监督比无监督提升了 0.69% 的 RoI AP。

记录：三篇互相支持中间几何量（深度/占据）显式监督优于无监督这一结论，但监督源口径不同——R4Det 引入视觉基础模型伪标签（Metric3D），SGDet3D 消融显示雷达监督可行、LiDAR 更优，HGSFusion 用 3D/2D 框生成的占据图监督（且 Table 7 显示 2D 模式监督优于 3D 模式监督）。

------

## 3. 结论之间的互相支持

- **S1 稀疏是 4D 雷达核心缺陷，四方一致**：RadarOcc.md §1（CFAR 丢低 RCS 弱反射）、R4Det.md §1（「稀疏雷达点云下小目标检测能力差」）、SGDet3D.md §1（「单模态信息利用不充分」）、HGSFusion.md §1（「**点云稀疏性**和**方向角（DOA）估计误差**」）。HGSFusion 把缺陷归到检测阈值，与 RadarOcc 对 CFAR 的指控同方向，互为佐证。
- **S2 局部注意力优于全局注意力，两处独立同向**：R4Det.md §2.1（「放弃全局注意力，在投影点周围的局部窗口内计算注意力，减少远距离噪声干扰」）与 RadarOcc.md §2.1/§2.2（全局百分比稀疏化丢失弱信号 + RSA 按距离分层）。注：两者作用层不同（投影深度交互 vs 雷达张量稀疏化），属同向而非同位。
- **S3 中间量质量必须被约束，否则污染下游，三处互证**：SGDet3D.md §5.2（「劣质的深度概率会污染 3D Key/Value 特征空间，导致注意力采样坍塌」）、HGSFusion.md §4.1（生成点在易混类别上「导致 RHGM 生成了干扰特征」）、R4Det.md §2.1（概率监督「消除几何散射（Geometric Scattering）」）。三篇分别从深度概率、生成点、深度分布三个中间量得出同一形态的教训。
- **S4 对易混弱目标（行人/骑行者）要特别保护，两处呼应**：RadarOcc.md §2.1（「远距离目标或低 RCS 目标（如行人、自行车）的信号功率远低于近处强目标的旁瓣，从而被直接过滤」）与 HGSFusion.md §4.1（「但在骑行者（Cyclist）类别出现下滑」）。RadarOcc 在输入端为此设计 range-wise 筛选，HGSFusion 在生成端暴露了同类目标被相似物污染的失效模式。
- **S5 中间几何量的显式监督带来增益，三处同向**：R4Det Table 5 单调增长、SGDet3D.md §5.3（无监督 56.95 < 雷达 58.75 < LiDAR 59.49，mAP_EAA）、HGSFusion.md §4.5（「显式监督比无监督提升了 0.69% 的 RoI AP」）。

------

## 4. 矛盾 / 张力（含单源结论，均不构成【谁更好】判断）

- **C1 俯仰维可用性方向相反**：RadarOcc 以 $R \times A \times E \times D$ 全张量为前提做 3D 占据（RadarOcc.md §1/§2.2），HGSFusion.md §4.5 称「4D 雷达高度角分辨率不足，3D 占据预测会引入噪声高度信息」。任务不同（纯雷达占据 vs 融合检测中的空间模式预测），但对俯仰信息价值的表态相反。候选 TODO：用同一数据集检验 4D 雷达俯仰维对占据/检测的边际贡献。
- **C2 生成/扩散类增密的失效模式只有 HGSFusion 一家暴露**：HGSFusion.md §4.1 记录 Cyclist 类下滑并归因于「自行车架」相似物；R4Det / SGDet3D 笔记未记录各自增密模块（PDF/GDC）在易混类别上的分类别失效分析。属于证据不对称，不是直接矛盾。
- **C3 全局池化通道注意力一贬一褒（不同模块位置，非同位矛盾）**：R4Det.md §3.2 称 SE 通道注意力在 DGTF 中使「BEV mAP 从 50.41 降至 49.12」（归因于「全局空间平均池化（Squeeze）抹除了 DCNv2 建立的细粒度空间局部响应」）；HGSFusion.md §3.2 模态同步则「利用全局平均池化感知全局光照和环境状态，生成通道权重」且 DSM 消融为正增益（HGSFusion.md §4.2：「DSM 的引入（+1.18% RoI AP）证明了同步机制的价值」）。两者一个在时序对齐模块、一个在模态加权模块，只能记录为同一部件在不同位置表现相反。
- **C4（单源）时序帧距结论**：R4Det.md §3.2「在 DGTF 模块中，单步长（$t-1$）融合表现最佳（BEV mAP 50.41）。跨帧融合（$t-2, t-3$）会引发轨迹错位与误差累积。」其余三篇笔记无时序模块，无法交叉验证。
- **C5（单源）即插即用增益**：R4Det.md §3.2「将 R4Det 模块附加于 BEVFusion 和 RCBEVDet 上，在 VoD 数据集上的 $\text{mAP}_{\text{EAA}}$ 分别提升了 +6.34% 和 +5.34%」。其余笔记无对应迁移实验。

------

## 5. 数据集与指标口径差异

- **M1 同在 VoD，指标族不同**：SGDet3D 用 mAP_EAA / mAP_DC（SGDet3D.md §5.1，完整模型 59.49 / 77.11）；HGSFusion 消融用 EAA AP / RoI AP（HGSFusion.md Table 3，完整模型 58.96 / 79.46），SOTA 表又用 RoI AP（HGSFusion.md Table 1，mAP (RoI) 62.61）；R4Det 在 VoD 只报即插即用的 mAP_EAA 增量（R4Det.md §3.2）。三篇笔记都未定义 EAA / DC / RoI 的口径，数值（如 59.49 vs 58.96 vs 62.61）不可直接横向比较。
- **M2 各自声称 SOTA 但口径不同**：SGDet3D.md §1「在 VoD 和 TJ4DRadSet 数据集上达到 SOTA 水平」；HGSFusion.md §1「在 VoD 数据集上 RoI AP 达到 88.28%，在 TJ4DRadSet 上也达到了 SOTA 水平」。两篇基于不同指标族声称同一数据集 SOTA，笔记层面无法仲裁。
- **M3 HGSFusion 概述的头条数字是 Car 类 RoI AP 而非 mAP**：HGSFusion.md §1「在 VoD 数据集上 RoI AP 达到 88.28%」，对照其 Table 1 该数是 Car (RoI) 列，mAP (RoI) 为 62.61。引用该笔记数字时须注明类别与指标。
- **M4 消融基准数据集不同**：R4Det 模块消融在 TJ4DRadSet（R4Det.md §3.1，Baseline 45.15 → 完整 54.07 BEV mAP），SGDet3D 消融在 VoD（§5.1），HGSFusion 消融在 VoD（Table 3）。消融增益（如 +1.71 / +3.55 / +3.66 vs +1.56 / +1.18 / +6.19）分属不同数据集与指标，不可相加或比较。
- **M5 RadarOcc 笔记无实验章节**：RadarOcc.md 止于【3D 占据解码与损失函数】小节，未记录数据集、指标与对比表；其损失设计提及「**Lovasz-softmax Loss**：直接优化交并比（mIoU）指标」（§2.4）。因此本对比中 RadarOcc 只参与方法路线对比，不参与实验结论对比。
- **M6 缩写撞车**：R4Det.md §3.2 的 SE 指 Squeeze-Excitation 通道注意力；HGSFusion.md Table 4 的 S.E. 指 Separate Encoding（独立通道编码）。同名不同义，交叉阅读时勿混。
- **M7 数据集覆盖重合度高但任务不同**：R4Det / SGDet3D / HGSFusion 三篇均在 VoD + TJ4DRadSet 上实验（各自 §3/§5），RadarOcc 任务为占据预测且数据集未记录；四篇笔记内部没有任何一篇引用另一篇的数字。

------

## 6. 遗留问题（转调度班次 / QUESTIONS.md，不替主人决定）

1. R4Det 与 SGDet3D 笔记中的【邻域交叉注意力 (NCA)】是否同一算子/同一出处（R4Det.md 原文措辞是「其pipeline依然是**邻域交叉注意力 (NCA)**」，疑似沿用已有工作，但笔记未写引用对象），需回原文核对。
2. VoD 各家指标（mAP_EAA / mAP_DC / EAA AP / RoI AP）的精确定义与是否同口径，四篇笔记均未定义，需回原文核对后再做任何数值横向比较。
3. HGSFusion.md Table 1 中 LXL 行的 Pedestrian (RoI) 与 mAP (RoI) 同为 72.93（HGSFusion.md §4.1 表），疑似笔记表格转录错位（参照 claim-emc2-note-table-mismatch 的前车之鉴），需回原文核对；本对比未采信该行数字。
4. RadarOcc 笔记缺实验章节（数据集/指标/结果全无），若后续要做占据 vs 检测的路线对比，需先补记 RadarOcc 原文实验部分（建议走 library 补充流程，需用户同意）。
5. C1（俯仰维可用性）若要立 claim，需要同一硬件/数据集上的对照实验，现有四篇笔记均不足以支撑。
