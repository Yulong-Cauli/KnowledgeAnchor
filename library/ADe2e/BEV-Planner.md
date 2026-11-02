# BEV-Planner: Is Ego Status All You Need for Open-Loop End-to-End Autonomous Driving?

**出处会议：** CVPR 2024（arXiv:2312.03031，v2 2024-06-02）  
**是否开源：** 开源，https://github.com/NVlabs/BEV-Planner （摘要原文："Code and models are available at https://github.com/NVlabs/BEV-Planner."；2026-11-03 二级确认：GitHub 仓库实抓为公开仓库，含 README 与完整训练/评测代码，README 标题与论文一致；页面未见 license 字段，引用代码实现时注意授权待查）  
**关键词：** 端到端自动驾驶、开环评测（open-loop）、ego status、nuScenes、路沿碰撞率（CCR）、ego query

> 来源（抓取日期 2026-11-02）：
> - arXiv 摘要页：https://arxiv.org/abs/2312.03031
> - 全文 HTML（LaTeXML 渲染，v2）：https://arxiv.org/html/2312.03031v2
>
> 本笔记全部数字与表格行逐字摘自上述 HTML 全文，locator 标注论文章节 / 表号。原文个别拼写（如 "GoStright"、"in Planer"、"2,83"）照抄并加注。作者：Zhiqi Li, Zhiding Yu, Shiyi Lan, Jiahan Li, Jan Kautz, Tong Lu, Jose M. Alvarez（南京大学 & NVIDIA）。

## 1. 概述

- 论文研究开环（open-loop）端到端自动驾驶在 nuScenes 上的评测问题。起因是 AD-MLP 指出仅用 ego status 的简单 MLP 也能达到 SOTA 规划结果，论文由此提出核心问题（§1 原句，斜体）：*"Is ego status all you need for open-loop end-to-end autonomous driving?"*，并给出回答（§1 原句，原文加粗）：*"Our answer is **yes and no**, considering both the pros and cons of using ego status in current benchmarks"*。
- **Yes 的一面**（§1）：论文复现 AD-MLP 时修复其 issue（https://github.com/E2E-AD/AD-MLP/issues/4）、去掉历史轨迹 GT 以防止标签泄露，得到的 Ego-MLP 仅依赖 ego status，在现有 L2 距离与碰撞率指标上与 SOTA 持平（Table 1 ID-8）。
- **No 的一面 / 问题定位**（§1），论文归纳三个缺点：
  1. **数据分布失衡**：*"73.9% of the nuScenes data involve scenarios of driving straightforwardly"*（§1，Fig. 2），直行场景下维持当前速度/方向即可，ego status 成为拟合规划任务的捷径；其余 26.1% 才是更有挑战的场景（§1）。
  2. **现有指标不全面**：L2 距离与碰撞率无法惩罚"冲出路面"这类高风险轨迹，论文据此提出路沿碰撞率 CCR（Curb Collision Rate）（§1、§4.2）。
  3. **ego status 对驾驶逻辑的偏置**：§1 原句 *"blanking all the camera input in VAD [16] leads to complete failure of the perception module but minor degrade in planning, when ego status is present. However, altering the input ego velocity can significantly influence the final predicted trajectory."*
- 论文同时指出 ST-P3 在训练与评测中使用了部分错误的 GT 数据（§3 与 Appendix A；相关 issue：https://github.com/OpenDriveLab/ST-P3/issues/24），因此需要重新设计一个干净的基线，即 BEV-Planner。
- 结论方向（§1 末）：论文推测 nuScenes 上的 SOTA 分数很可能来自对 ego status 的过度依赖 + 简单直行场景主导，且现有指标无法全面评估轨迹质量——即"ego status 就够了"是一种误导性印象（论文声称，尚未独立验证）。

## 2. 方法

### 2.1 基线设计（§3）

- BEV-Planner 是一个刻意极简的基线：先生成 BEV 特征并与历史 BEV 特征拼接（主要跟随 ST-P3/BEVDet4D/BEVDepth [12,14,21]）；§3 原句强调 *"Please note while concatenating BEV features from different timesteps, we didn't perform feature alignment."*
- 拼接后的 BEV 特征与可学习的 ego query 做 cross-attention，ego query 经 MLP 直接预测轨迹。公式 (1)（§3）：

  $$\tau = \textbf{MLP}(\textbf{attn}(q=Q, k=B, v=B))$$

  其中 $Q$ 为 ego query，$B$ 为时序融合后的 BEV 特征，$\tau$ 为最终预测轨迹。
- ego status 有两种融入位置（对齐现有方法，§3）：
  - 融入 **BEV 模块**：跟随 BEVFormer/UniAD/VAD [22,13,16] 的做法；
  - 融入 **planner**：将 ego query 与包含 ego status 的向量直接拼接。
- 监督：只用一条轨迹 L1 损失；不需要任何人工标注（bounding box、tracking ID、HD map 等）（§3）。
- §3 原句（定位声明）：*"We wish to underscore that our proposed baseline method is not intended for real-world deployment, owing to its deficiencies in providing adequate constraints and interoperability."*

### 2.2 变体命名（Table 1 caption，§4）

- **BEV-Planner\***（ID-9）：不使用历史时序信息；**BEV-Planner**（ID-10）：使用过去 4 帧时序线索；**BEV-Planner+**（ID-11）：在 BEV 中注入 ego status；**BEV-Planner++**（ID-12）：BEV 与 planner 中都注入 ego status。

## 3. 实验

### 3.1 实现细节（§4.1）

- R50 backbone [10]；输入分辨率 256×704（2026-11-03 已对官方 PDF 核实：文本层原句 "The input resolution is 256×704, smaller than existing methods [13, 16]."，下载自 arxiv.org/pdf/2312.03031；HTML 渲染版此处 mphantom 缺字 bug 不再采信），小于现有方法 [13, 16]（原文引用序）；BEV 分辨率 128×128，感知范围约 50 米；历史 BEV 取过去 4 个时间步沿通道维拼接、不对齐；再用 [14]（BEVDepth）的 BEV encoder 把通道压到 256。训练 12 epochs，8×V100，batch size 32，学习率 1e-4。

### 3.2 评测指标（§4.2 + Appendix B）

- **CCR（Curb Collision Rate）**：计算预测轨迹与路沿（道路边界）的碰撞率，用于衡量是否保持在可行驶区域内；将路沿以 0.1 米分辨率栅格化（§4.2 原句：*"we rasterize the road boundary using a resolution of 0.1 meters"*）。
- **统一实现（Union Implementation）**（§4.2）：用各方法官方开源仓库产出预测轨迹，再用同一套指标实现评测；针对 AD-MLP 提出的 0.5 m 粗网格假碰撞问题，默认采用更细的 0.1 m 网格（§4.2：*"we adopt a finer default grid size of 0.1m"*）。
- **碰撞率定义修正**（Appendix B）：旧定义 $CR(t)=\sum_{i=0}^{N}\mathbb{I}_i/N,\ N=t/0.5$（Eq. 2）假设各时刻碰撞互相独立；论文改为 $CR(t)=(\sum_{i=0}^{N}\mathbb{I}_i)>0,\ N=t/0.5$（Eq. 3），并从轨迹变化估计自车 yaw 角以修正转弯场景的误检（Appendix B Fig. 1）。
- **有效样本**（Appendix B "Valid Samples"）：nuScenes val 共 6019 个样本，按"无完整 GT 未来轨迹则不计入"策略，最终有效样本 5119（占全部样本的 85%）。

### 3.3 主结果（Table 1，§4；locator：Table 1）

原表头为 `Ego Status: in BEV / in Planer`（"Planer" 为原文拼写）、`L2 (m) ↓ / Collision (%) ↓ / CCR (%) ↓` 各含 1s/2s/3s/Avg、`ckpt. source`；下表逐字照抄（† 见表注）：

| ID | 方法 | in BEV | in Planer | L2-1s | L2-2s | L2-3s | L2-Avg | Colli-1s | Colli-2s | Colli-3s | Colli-Avg | CCR-1s | CCR-2s | CCR-3s | CCR-Avg | ckpt. source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | ST-P3 | ✗ | ✗ | 1.59† | 2.64† | 3.73† | 2.65† | 0.69† | 3.62† | 8.39† | 4.23† | 2.53† | 8.17† | 14.4† | 8.37† | Official |
| 1 | UniAD | ✗ | ✗ | 0.59 | 1.01 | 1.48 | 1.03 | 0.16 | 0.51 | 1.64 | 0.77 | 0.35 | 1.46 | 3.99 | 1.93 | Reproduce |
| 2 | UniAD | ✓ | ✗ | 0.35 | 0.63 | 0.99 | 0.66 | 0.16 | 0.43 | 1.27 | 0.62 | 0.21 | 1.32 | 3.63 | 1.72 | Official |
| 3 | UniAD | ✓ | ✓ | 0.20 | 0.42 | 0.75 | 0.46 | 0.02 | 0.25 | 0.84 | 0.37 | 0.20 | 1.33 | 3.24 | 1.59 | Reproduce |
| 4 | VAD-Base | ✗ | ✗ | 0.69 | 1.22 | 1.83 | 1.25 | 0.06 | 0.68 | 2.52 | 1.09 | 1.02 | 3.44 | 7.00 | 3.82 | Reproduce |
| 5 | VAD-Base | ✓ | ✗ | 0.41 | 0.70 | 1.06 | 0.72 | 0.04 | 0.43 | 1.15 | 0.54 | 0.60 | 2.38 | 5.18 | 2.72 | Official |
| 6 | VAD-Base | ✓ | ✓ | 0.17 | 0.34 | 0.60 | 0.37 | 0.04 | 0.27 | 0.67 | 0.33 | 0.21 | 2.13 | 5.06 | 2.47 | Official |
| 7 | GoStright | - | ✓ | 0.38 | 0.79 | 1.33 | 0.83 | 0.15 | 0.60 | 2.50 | 1.08 | 2.07 | 8.09 | 15.7 | 8.62 | - |
| 8 | Ego-MLP | - | ✓ | 0.15 | 0.32 | 0.59 | 0.35 | 0.00 | 0.27 | 0.85 | 0.37 | 0.27 | 2.52 | 6.60 | 2.93 | （原表为空） |
| 9 | BEV-Planner* | ✗ | ✗ | 0.27 | 0.54 | 0.90 | 0.57 | 0.04 | 0.35 | 1.80 | 0.73 | 0.63 | 3.38 | 7.93 | 3.98 | - |
| 10 | BEV-Planner | ✗ | ✗ | 0.30 | 0.52 | 0.83 | 0.55 | 0.10 | 0.37 | 1.30 | 0.59 | 0.78 | 3.79 | 8.22 | 4.26 | - |
| 11 | BEV-Planner+ | ✓ | ✗ | 0.28 | 0.42 | 0.68 | 0.46 | 0.04 | 0.37 | 1.07 | 0.49 | 0.70 | 3.77 | 8.15 | 4.21 | - |
| 12 | BEV-Planner++ | ✓ | ✓ | 0.16 | 0.32 | 0.57 | 0.35 | 0.00 | 0.29 | 0.73 | 0.34 | 0.35 | 2.62 | 6.51 | 3.16 | - |

表注要点（Table 1 caption 原句摘录，locator：Table 1）：

- *"†: The official implementation of ST-P3 (ID-0) utilized partial erroneous ground truth trajectories"*；*"The official UniAD (ID-2) utilized ego status in its BEV module. It is of particular note that the performance of the officially open-sourced model exceeds the results reported in the original paper [13]."*
- *"A naive strategy (ID-7) of proceeding at the current speed also yields satisfactory results. Without the perception module, Ego-MLP (ID-8), utilizing solely ego velocity, acceleration, yaw angle, and driving command, achieves performance on par with current state-of-the-art models on previous L2 distance and collision rate metrics."*
- ID-7 行方法名原文拼作 "GoStright"（照抄）。

### 3.4 图像退化 vs ego status 扰动（Table 2，§4；locator：Table 2）

以官方 VAD-Base checkpoint（planner 注入 ego status）为基础，分别对图像与 ego status 加扰。原表逐字照抄（Det./Map 列为感知 NDS/mAP；*: planner 不用 ego status 的 VAD-Base；†: 自车可能已驶出局部 BEV 区域，碰撞率不精确；"2,83" 照抄原文）：

| 方法 | Img Corruption | Ego Status | L2-1s | L2-2s | L2-3s | L2-Avg | Colli-1s | Colli-2s | Colli-3s | Colli-Avg | CCR-1s | CCR-2s | CCR-3s | CCR-Avg | Det.(NDS) | Map(mAP) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| VAD-Base* | - | - | 0.41 | 0.70 | 1.06 | 0.72 | 0.04 | 0.43 | 1.15 | 0.54 | 0.60 | 2.38 | 5.18 | 2.72 | 46.0 | 47.5 |
| VAD-Base | - | - | 0.17 | 0.34 | 0.60 | 0.37 | 0.04 | 0.27 | 0.67 | 0.33 | 0.21 | 2.13 | 5.06 | 2.47 | 45.5 | 47.0 |
| VAD-Base | Snow | - | 0.19 | 0.41 | 0.76 | 0.45 | 0.00 | 0.20 | 0.76 | 0.32 | 0.21 | 2.27 | 5.98 | 2.82 | 36.1 | 29.4 |
| VAD-Base | Fog | - | 0.19 | 0.40 | 0.75 | 0.45 | 0.02 | 0.20 | 0.68 | 0.30 | 0.23 | 2.21 | 5.90 | 2.78 | 34.3 | 29.4 |
| VAD-Base | Glare | - | 0.19 | 0.40 | 0.74 | 0.44 | 0.02 | 0.18 | 0.59 | 0.26 | 0.21 | 2.11 | 5.57 | 2.63 | 41.7 | 38.3 |
| VAD-Base | Rain | - | 0.19 | 0.41 | 0.75 | 0.45 | 0.02 | 0.18 | 0.66 | 0.29 | 0.31 | 2.38 | 5.98 | 2.89 | 29.1 | 13.0 |
| VAD-Base | Blank | - | 0.19 | 0.41 | 0.77 | 0.46 | 0.00 | 0.40 | 1.21 | 0.54 | 0.35 | 3.05 | 7.73 | 3.71 | 0.0 | 0.0 |
| VAD-Base | - | v×0.0 | 3.81 | 6.19 | 8.48 | 6.16 | 1.00 | 6.76 | 16.18 | 7.98 | 0.19 | 0.41 | 3.10 | 1.23 | 45.5 | 47.0 |
| VAD-Base | - | v×0.5 | 1.95 | 3.20 | 4.41 | 3.19 | 0.02 | 1.00 | 4.10 | 1.71 | 0.37 | 2.56 | 5.57 | 2,83 | 45.5 | 47.0 |
| VAD-Base | - | v×1.5 | 1.94 | 3.20 | 4.47 | 3.20 | 0.14 | 2.89 | 6.21 | 3.08 | 1.54 | 6.29 | 13.2 | 7.01 | 45.5 | 47.0 |
| VAD-Base | - | v=100 m/s | 113 | 206 | 306 | 208 | 8.00† | 9.66† | 10.49† | 9.38† | 24.8† | 27.5† | 28.8† | 27.0† | 45.5 | 47.0 |

- 结论（Table 2 caption 原句，locator：Table 2）：*"We can observe that introducing corruption to images markedly affects the perception results, especially in the case of using blank images; nonetheless, this does not markedly disrupt the ultimate planning results. In contrast to the minor impact of image corruption on planning, modifications to the ego vehicle's velocity have a significant effect on the planning results."*
- §4.3 原句：*"Setting the ego car's speed to 100 m/s results in the model generating wildly impractical planning trajectories."* 速度置零时模型输出近乎静止的轨迹，CCR 反而很好——论文自注这是 CCR 指标的一个局限（Table 2 caption）。

### 3.5 讨论（§4.3）

**（a）Ego status plays a key role（§4.3）**

- 恒速直行策略 GoStright（ID-7）在 L2/碰撞率上"surprisingly good"；Ego-MLP（无感知）与 UniAD/VAD 持平；现有方法只有把 ego status 注入 planner（ID-3、ID-6）才能追平 Ego-MLP，仅靠相机输入（ID-1、ID-4）显著更差（§4.3，依据 Table 1）。
- VAD（ID-6）与 BEV-Planner++（ID-12）在 L2 与碰撞率上基本相似（§4.3）。论文由此主张（§4.3 原句）：*"we argue that methods utilizing ego status are not directly comparable and conclusions should not be drawn from such comparisons."*

**（b）感知阶段被忽视的 ego status（§4.3 "Neglected Ego Status in Perception Stage" + Appendix C）**

- UniAD/VAD 的 BEV 生成模块 BEVFormer 在 BEV query 初始化时把 ego status 投影进特征（Appendix C Fig. 4；UniAD 通过 `use_can_bus` 开关控制，Appendix A "Ego Status Usage Details"）。
- 该技巧对感知本身影响很小：BEVFormer 带/不带 ego status 的 mAP 为 41.6 / 41.3，NDS 为 51.7 / 51.5（Appendix C Table 2，逐字照抄该表）：

| Methods | Ego Status | mAP | NDS |
| --- | --- | --- | --- |
| BEVFormer | ✓ | 41.6 | 51.7 |
| BEVFormer | ✗ | 41.3 | 51.5 |

- 但在端到端管线里，去掉 BEV 阶段的 ego status 会使 UniAD（ID-2→ID-1）与 VAD（ID-5→ID-4）规划性能明显下滑（Appendix C，依据 Table 1）。

**（c）BEV-Planner+Map：加地图任务的后果（§4.3，Table 3/4/5）**

| 方法 | in BEV | in Planer | L2-1s | L2-2s | L2-3s | L2-Avg | Colli-1s | Colli-2s | Colli-3s | Colli-Avg | CCR-1s | CCR-2s | CCR-3s | CCR-Avg |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BEV-Planner | ✗ | ✗ | 0.30 | 0.52 | 0.83 | 0.55 | 0.10 | 0.37 | 1.30 | 0.59 | 0.78 | 3.79 | 8.22 | 4.26 |
| BEV-Planner (init*) | ✗ | ✗ | 0.26 | 0.49 | 0.81 | 0.52 | 0.03 | 0.20 | 1.00 | 0.42 | 0.59 | 3.18 | 7.36 | 3.71 |
| BEV-Planner+Map | ✗ | ✗ | 0.53 | 0.94 | 1.40 | 0.96 | 0.12 | 0.37 | 2.19 | 0.89 | 0.68 | 2.38 | 4.73 | 2.60 |

（locator：Table 3；init* 指用预训练地图感知 checkpoint 初始化，照抄该表全部 3 行。）

- 引入地图感知任务后 L2 与碰撞率变差、CCR 变好；用地图预训练权重初始化（init*）本身能涨点，说明退化来自 MapFormer 多任务而非预训练权重（§4.3）。
- 按驾驶命令拆分（Table 4/5，§4.3）：直行命令下加入地图信息显著增大 L2 误差与碰撞率（Table 4：BEV-Planner vs BEV-Planner+Map 的 L2-ST Avg 为 0.48 vs 0.97；Table 5：Collision-ST Avg 为 0.40 vs 0.91）；转弯场景下地图信息有效降低碰撞率（Table 5：Collision-LR Avg 为 2.25 vs 0.78）。
- 论文的三条小结（§4.3 bullet，意译）：直行为主的简单场景里加感知信息不改善 L2/碰撞率，更复杂的多任务范式甚至降低整体效果；转弯等复杂场景（仅占现有评测集 13%）里感知有益，但平均后反而拉低指标；亟需更有代表性、更严格的评测数据集。

**（d）新指标带来新结论（§4.3 "New metrics will bring new conclusions"，Table 6）**

- 按 CCR 看：GoStright 频繁越过道路边界（Avg 8.62）；Ego-MLP 差于 UniAD 与 VAD；BEV-Planner 因完全不用地图信息在 CCR 上最差（Avg 4.26）（§4.3，依据 Table 1）。原句：*"This suggests that relying on past metrics to judge the superiority of different open-loop methods is biased."*
- UniAD 的轨迹后处理（非线性优化避开 occupancy grid）虽降碰撞率，却因缺地图先验显著增加冲出路面风险（§4.3）。Table 6 逐字照抄（P.P. = UniAD 后处理优化模块；用官方权重）：

| 方法 | P.P. | Avg. L2(m) | Avg. Colli.(%) | Avg. CCR(%) |
| --- | --- | --- | --- | --- |
| UniAD | ✓ | 0.77 | 0.51 | 7.83 |
| UniAD | ✗ | 0.66 | 0.62 | 1.72 |

（locator：Table 6。）§4.3 原句：*"Our new metrics, the CCR reveal that UniAD's post-processing substantially increases the risk of the ego vehicle running off the road."* 论文默认报告 UniAD 不带后处理的结果（§4.3）。另见 Appendix D。

**（e）基线在 BEV 里学到了什么（§4.3 "What the baseline learned in its BEV?"）**

- 注入 ego status 后模型收敛极快（Fig. 5）；BEV-Planner++ 的 BEV 特征激活集中在自车周边、甚至常在车后，与 BEV-Planner（集中于前方）明显不同；论文推测是 ego status 让模型无需从 BEV 特征提取信息，原句：*"Hence, the BEV-Planner++ method has almost not learned any effective information."*（§4.3）

**（f）附录补充（Appendix E）**

- 对不含 ego status 的 VAD-Base 屏蔽相机输入（Blank）：L2 (1s/2s/3s/Avg) 为 2.59 / 4.32 / 6.09 / 4.33，Collision (1s/2s/3s/Avg) 为 2.29 / 7.89 / 12.7 / 7.63（Appendix E Table 3 "Blank" 行，逐字照抄；注：Appendix E Table 3 首行在 HTML 版缺 L2/Collision 的 Avg 两个单元格，故不抄该行，正常输入下的同配置以 Table 1 ID-4 为准：L2 Avg 1.25、Collision Avg 1.09）。说明无 ego status 时视觉信息确实重要。
- 但其与路沿交叠率不升反稳的原因（Appendix E Table 4）：直行场景占全部评测样本的 87%，无相机输入时模型在直行场景采取保守直行策略，反而更少触碰路沿（Intersection-ST 降低）；附录原句：*"in straight-driving scenarios (87% of all evaluation samples), removing the camera input leads the model to adopt a relatively conservative straight-driving strategy"*。
- 附录 B 还给出轨迹平滑度 σ_wd（Baseline：1s 0.03 / 2s 0.19 / 3s 0.70 / Avg 0.31；同表 L2 为 0.30 / 0.52 / 0.85 / 0.56，与主表 Table 1 的 0.83 / 0.55 略有出入，照抄附录原表）；论文认为该指标暂不比 L2 提供更多信息（Appendix B "Trajectory Smoothness"）。

## 4. 核心结论

论文在 §5 给出三条结论（以下为论文声称，尚未独立验证）：

1. *"The planning performance of existing open-loop autonomous driving models based on nuScenes is highly affected by ego status (velocity, acceleration, yaw angle)."* ego status 一旦进入模型，最终预测轨迹基本被其支配，感知信息利用被弱化（§5）。
2. *"Existing planning metrics fall short of fully capturing the true performance of models."* 换指标结论可能显著变化；论文倡导更多样、更全面的指标，避免模型在特定指标上局部最优而忽视其他安全隐患（§5）。
3. 相比在现有 nuScenes 上继续刷 SOTA，构建更合适的数据集与指标是更关键、更紧迫的挑战（§5）。

- **Limitation（§5）**：不同规划指标之间存在 trade-off；BEV-Planner 基线虽在 L2/碰撞率上表现好，但因不使用任何感知标注（如 HD map），CCR 并不突出。
- **对本库的提示**：引用本文任何数字时注意口径 —— Table 1 中 UniAD 各行默认为**无后处理**结果（§4.3 原句："In this paper, we report the results of UniAD without its post-processing by default."；ID-2 的 0.66 / 0.62 / 1.72 与 Table 6 中 P.P. ✗ 行一致），Table 6 中 P.P. ✓ 行（0.77 / 0.51 / 7.83）才是带后处理结果，两套口径不可混用。

## TODO（配图）

- TODO：本文笔记暂未配图。需补 `assets/BEV-Planner/`（Fig. 1 三种管线示意、Fig. 2 nuScenes 轨迹热力图、Fig. 3 图像退化下轨迹可视化、Fig. 4 速度扰动下轨迹可视化、Fig. 5 收敛曲线、Fig. 6 BEV 特征对比，以及附录各图）后回填引用。
