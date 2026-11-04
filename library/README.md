# KnowledgeAnchor · library

本人的论文、基础知识与实验技巧笔记（仓库的 **L1 来源层**：从文献与个人项目经验整理的知识，统一表示「尚未由我独立验证」）。信任等级与 claim 体系见仓库根 [README](../README.md) 与 [AGENTS.md](../AGENTS.md)。

论文笔记统一以「出处会议（期刊）/ 是否开源 / 关键词」三行开头；教材与数学/通用笔记以「**类型：**」一行开头（见文末「笔记约定」）。正文以公式推导 + 直觉解释为主，关键数字与表格带章节 locator。

> 篇数统计截至 2026-11-04，共 **61** 篇笔记。

## 📂 目录结构

| 目录 | 内容 | 篇数 |
| --- | --- | --- |
| [`Classical_Detection/`](Classical_Detection) | 经典 2D 检测、点云 3D 检测、4D 雷达检测 | 9 |
| [`BEV_Detection/`](BEV_Detection) | 多相机 BEV 3D 目标检测框架 | 2 |
| [`Multimodal_Fusion/`](Multimodal_Fusion) | 多传感器 / 雷达-相机 / 相机-LiDAR 融合 | 9 |
| [`3D_Occupancy/`](3D_Occupancy) | 3D 语义占用预测 | 7 |
| [`ADe2e/`](ADe2e) | 端到端自动驾驶（UniAD 系与开环评测批判） | 3 |
| [`VLM_VLA/`](VLM_VLA) | 视觉语言模型（VLM）与视觉-语言-动作模型（VLA） | 7 |
| [`QA dataset/`](QA%20dataset) | 驾驶 VQA 评测基准 | 1 |
| [`Efficient_Backbone/`](Efficient_Backbone) | 轻量级 / 移动端骨干网络 | 3 |
| [`Quantization/`](Quantization) | 模型量化与压缩 | 13 |
| [`AI Infra/`](AI%20Infra) | Liger-Kernel PR 技术复盘（非论文笔记） | 3 |
| [`Math_and_Notes/`](Math_and_Notes) | 数学与通用笔记 | 3 |
| [`Experiment_Notes/`](Experiment_Notes) | 个人实验技巧、实验设计与项目诊断复盘 | 1 |
| [`assets/`](assets) | 论文插图与表格截图，按论文名分目录（53 个子目录） | — |

## 经典检测

经典 2D / 点云 3D 目标检测与检测框架的笔记。

| 论文 | 出处 | 关键词 | 代码 |
| --- | --- | --- | --- |
| [CaDDN](Classical_Detection/CaDDN.md) | CVPR 2021 | 视锥神经网络、三线性插值 | [OpenPCDet](https://github.com/open-mmlab/OpenPCDet) |
| [CornerNet](Classical_Detection/CornerNet.md) | ECCV 2018 | 关键点检测、角点池化、Associative Embedding、无锚框 | [princeton-vl/CornerNet](https://github.com/princeton-vl/CornerNet) |
| [CenterNet：Objects as Points](Classical_Detection/CenterNet%EF%BC%9AObjects%20as%20Points.md) | arXiv 2019 | 中心点检测、热力图、无锚框、无 NMS | [xingyizhou/CenterNet](https://github.com/xingyizhou/CenterNet) |
| [CenterNet：Keypoint Triplets](Classical_Detection/CenterNet%EF%BC%9AKeypoint%20Triplets.md) | ICCV 2019 | 关键点三元组、中心点验证、中心池化、级联角点池化 | [Duankaiwen/CenterNet](https://github.com/Duankaiwen/CenterNet) |
| [FCOS](Classical_Detection/FCOS.md) | ICCV 2019 | 无锚框检测、逐像素预测、Center-ness、FPN 多尺度 | [tianzhi0549/FCOS](https://github.com/tianzhi0549/FCOS) |
| [Fast R-CNN 和 Faster R-CNN](Classical_Detection/Fast%20R-CNN%20%E5%92%8C%20Faster%20R-CNN%20.md) | Fast R-CNN: ICCV 2015<br>Faster R-CNN: TPAMI 2017 | RoI Pooling、候选区域网络 (RPN)、锚框、多任务损失 | [ShaoqingRen/faster_rcnn](https://github.com/ShaoqingRen/faster_rcnn) |
| [PointNet & PointPillars](Classical_Detection/PointNet%20%26%20PointPillars.md) | CVPR 2017 / CVPR 2019 | 置换不变性、对称函数、Pillar 编码 | — |
| [R4Det](Classical_Detection/R4Det.md) | CVPR 2026 | 4D 雷达-相机融合、全景深度融合、可变形门控时序融合、动态精炼 | 未开源 |
| [SGDet3D](Classical_Detection/SGDet3D.md) | RA-L 2025 | 4D 毫米波雷达-相机融合、几何深度补全、语义雷达 PillarNet、面向对象的交叉注意力、特征解耦 | [shawnnnkb/SGDet3D](https://github.com/shawnnnkb/SGDet3D) |

## BEV 检测

以 BEV（鸟瞰图）表示为核心的多相机 3D 目标检测框架笔记。

| 论文 | 出处 | 关键词 | 代码 |
| --- | --- | --- | --- |
| [BEVDet](BEV_Detection/BEVDet.md) | arXiv preprint（2021，未见正式会议收录标注） | BEV 3D 目标检测、多相机、视图变换（Lift-Splat-Shoot）、数据增强（IDA+BDA）、Scale-NMS、nuScenes | [HuangJunJie2017/BEVDet](https://github.com/HuangJunJie2017/BEVDet) |
| [PillarNet](BEV_Detection/PillarNet.md) | ECCV 2022 | pillar-based 3D 检测、稀疏 2D 卷积 encoder、spatial-semantic 特征融合 neck、Orientation-Decoupled IoU、nuScenes / Waymo | [agent-sgs/PillarNet](https://github.com/agent-sgs/PillarNet) |

## 多模态融合

融合多个传感器数据（雷达-相机、相机-LiDAR）的笔记。

| 论文 | 出处 | 关键词 | 代码 |
| --- | --- | --- | --- |
| [BEVFusion（Ali）](Multimodal_Fusion/Ali-BEVFusion.md) | NeurIPS 2022 | 多模态融合、BEV 空间、动态融合模块、激光雷达-摄像头融合 | [ADLab-AutoDrive/BEVFusion](https://github.com/ADLab-AutoDrive/BEVFusion) |
| [BEVFusion（MIT）](Multimodal_Fusion/MIT-BEVFusion.md) | ICRA 2023 | 多任务多传感器融合、统一 BEV 表示、BEV pooling 加速、3D 检测 + BEV 地图分割 | [mit-han-lab/bevfusion](https://github.com/mit-han-lab/bevfusion) |
| [MSMDFusion](Multimodal_Fusion/MSMDFusion.md) | CVPR 2023 | LiDAR-相机融合、虚拟点、多深度种子（MDU）、门控模态感知卷积、nuScenes | [SxJyJay/MSMDFusion](https://github.com/SxJyJay/MSMDFusion) |
| [RCBEVDet](Multimodal_Fusion/RCBEVDet.md) | CVPR 2024 | 雷达-摄像头融合、BEV 特征提取、交叉注意力融合、RadarBEVNet | [VDIGPKU/RCBEVDet](https://github.com/VDIGPKU/RCBEVDet) |
| [RCBEVDet++](Multimodal_Fusion/RCBEVDetPP.md) | arXiv 2024（RCBEVDet 的期刊扩展版） | 雷达-摄像头融合、稀疏融合、query-based 相机感知、检测/分割/跟踪三任务 | [VDIGPKU/RCBEVDet](https://github.com/VDIGPKU/RCBEVDet) |
| [RadarDistill](Multimodal_Fusion/RadarDistill.md) | CVPR 2024 | 知识蒸馏、雷达 3D 检测、跨模态对齐、LiDAR-Radar | [geonhobang/RadarDistill](https://github.com/geonhobang/RadarDistill) |
| [HGSFusion](Multimodal_Fusion/HGSFusion.md) | AAAI 2025 | 4D 毫米波雷达-相机融合、点云生成、深度同步、混合概率分布 | [garfield-cpp/HGSFusion](https://github.com/garfield-cpp/HGSFusion) |
| [EMC2](Multimodal_Fusion/EMC2.md) | ICCV 2025 | 混合专家模型、多模态融合、自适应调度、Jetson Orin | [LinshenLiu622/EMC2](https://github.com/LinshenLiu622/EMC2) |

> `BEVFusion`（Ali, NeurIPS 2022, ADLab-AutoDrive）与 `BEVFusion`（MIT, ICRA 2023, mit-han-lab）是同名缩写的两篇不同论文，引用时注意区分（详见两篇笔记头部的互链说明）。

## 3D 占用预测

语义占用预测与雷达占用预测的笔记。

| 论文 | 出处 | 关键词 | 代码 |
| --- | --- | --- | --- |
| [SurroundOcc](3D_Occupancy/SurroundOcc.md) | ICCV 2023 | 3D 占用预测、空间注意力、密集真值生成 | [weiyithu/SurroundOcc](https://github.com/weiyithu/SurroundOcc) |
| [COTR](3D_Occupancy/COTR.md) | CVPR 2024 | 纯视觉 3D 占据预测、紧凑 OCC 表示、显式-隐式视角变换（EVT/IVT）、粗到细语义分组 | [NotACracker/COTR](https://github.com/NotACracker/COTR) |
| [EchoFusion](3D_Occupancy/EchoFusion.md) | NeurIPS 2023 | 原始雷达数据融合、极坐标 BEV、极坐标对齐注意力 (PAA)、3D 目标检测 | [tusen-ai/EchoFusion](https://github.com/tusen-ai/EchoFusion) |
| [SparseOcc](3D_Occupancy/SparseOcc.md) | CVPR 2024 | 语义占用预测、稀疏潜变量表示、稀疏卷积、场景补全 | [VISION-SJTU/SparseOcc](https://github.com/VISION-SJTU/SparseOcc) |
| [NJU-SparseOcc](3D_Occupancy/NJU-SparseOcc.md) | ECCV 2024 | 全稀疏架构、占据预测、掩码引导稀疏采样、RayIoU、时序建模 | [MCG-NJU/SparseOcc](https://github.com/MCG-NJU/SparseOcc) |
| [RadarOcc](3D_Occupancy/RadarOcc.md) | NeurIPS 2024 | 4D 成像雷达、3D 占据预测、4D 雷达张量 (4DRT)、旁瓣感知、球坐标编码 | [Toytiny/RadarOcc](https://github.com/Toytiny/RadarOcc) |

> `SparseOcc`（CVPR 2024, VISION-SJTU）与 `NJU-SparseOcc`（ECCV 2024, MCG-NJU）是同名但不同的工作，引用时注意区分。

## 端到端自动驾驶

端到端自动驾驶（UniAD 系）与开环评测批判的笔记。

| 论文 | 出处 | 关键词 | 代码 |
| --- | --- | --- | --- |
| [UniAD（Planning-oriented Autonomous Driving）](ADe2e/UniAD.md) | CVPR 2023 最佳论文 | 端到端自动驾驶、planning-oriented、query-based 接口、多任务联合（跟踪/建图/预测/占用/规划）、nuScenes | [OpenDriveLab/UniAD](https://github.com/OpenDriveLab/UniAD) |
| [BEV-Planner](ADe2e/BEV-Planner.md) | CVPR 2024 | 端到端自动驾驶、开环评测批判、ego status、路沿碰撞率（CCR）、ego query、nuScenes | [NVlabs/BEV-Planner](https://github.com/NVlabs/BEV-Planner) |
| [AutoVLA](ADe2e/AutoVLA.md) | NeurIPS 2025 | 端到端自动驾驶、vision-language-action、快/慢思考、物理动作 token 化、GRPO 强化微调、NAVSIM / nuPlan / Waymo E2E | [ucla-mobility/AutoVLA](https://github.com/ucla-mobility/AutoVLA) |

> **素材现状（QUESTIONS #16）**：UniAD、AutoVLA 的表格截图素材存放在 `ADe2e/UniAD/`、`ADe2e/AutoVLA/`（与笔记同目录，笔记内以相对路径如 `UniAD/Table2.png` 引用），**不在** `assets/<论文名>/` 下——与「配图统一放 assets」的一般约定两处并存。迁移与否待主人定。

## VLM 与 VLA

视觉语言模型（VLM）与视觉-语言-动作模型（VLA）的笔记，覆盖通用多模态与自动驾驶两类。

| 论文 | 出处 | 关键词 | 代码 |
| --- | --- | --- | --- |
| [LLaVA（Visual Instruction Tuning）](VLM_VLA/LLaVA.md) | NeurIPS 2023 Oral | 视觉指令微调、GPT-4 生成多模态指令数据、CLIP + Vicuna、两阶段训练、LLaVA-Bench | [haotian-liu/LLaVA](https://github.com/haotian-liu/LLaVA) |
| [Qwen3-VL Technical Report](VLM_VLA/Qwen3-VL.md) | arXiv 预印本（2025-11，暂无会议标注） | 多模态大模型、Interleaved MRoPE、DeepStack、原生 256K 上下文、dense/MoE 全家族、GUI agent | [QwenLM/Qwen3-VL](https://github.com/QwenLM/Qwen3-VL) |
| [OpenVLA](VLM_VLA/OpenVLA.md) | CoRL 2024 | vision-language-action、动作离散化为 token、Prismatic-7B 基座、Open X-Embodiment、LoRA 微调 | [openvla/openvla](https://github.com/openvla/openvla) |
| [Alpamayo-R1](VLM_VLA/Alpamayo-R1.md) | arXiv 预印本（NVIDIA，2025-10） | 长尾场景推理 VLA、Chain-of-Causation 推理、10B、Gated 权重 | [NVlabs/alpamayo](https://github.com/NVlabs/alpamayo) |
| [OpenDriveVLA](VLM_VLA/OpenDriveVLA.md) | AAAI 2026 | 端到端自动驾驶 VLA、大语言动作模型、0.5B checkpoint | [DriveVLA/OpenDriveVLA](https://github.com/DriveVLA/OpenDriveVLA) |
| [DrivePI](VLM_VLA/DrivePI.md) | CVPR 2026 | 空间感知 4D MLLM、感知/预测/规划统一、基于 EMOVA 框架 | [happinesslz/DrivePI](https://github.com/happinesslz/DrivePI)（部分开源，checkpoints 未发布） |
| [OneVL](VLM_VLA/OneVL.md) | arXiv Technical Report（小米，2026-04） | 潜空间思维链、VLA + 世界模型统一框架、视觉/语言 latent token、Qwen3-VL-4B 主干、NAVSIM | [xiaomi-research/onevl](https://github.com/xiaomi-research/onevl) |

## 驾驶 VQA

自动驾驶视觉问答（VQA）数据集与评测基准的笔记。

| 论文 | 出处 | 关键词 | 代码 |
| --- | --- | --- | --- |
| [LingoQA](QA%20dataset/LingoQA.md) | ECCV 2024 | 自动驾驶 VQA、评测基准、Lingo-Judge、视觉语言模型 (VLM) | [wayveai/LingoQA](https://github.com/wayveai/LingoQA) |

> 本目录是**评测基准类**笔记：记录的是评测协议、judge 模型与基准自身的性质，不是方法论文；引用其中数字时注意区分「评测工具的性质」与「被评方法的成绩」。

## 轻量级骨干网络

移动端 / 轻量级卷积骨干网络的笔记。

| 论文 | 出处 | 关键词 | 代码 |
| --- | --- | --- | --- |
| [MobileNet（V1→V2→V3 演进笔记）](Efficient_Backbone/MobileNet.md) | V1: arXiv 2017<br>V2: CVPR 2018<br>V3: ICCV 2019 | depthwise separable convolution、inverted residual、linear bottleneck、h-swish、hardware-aware NAS、NetAdapt | V1/V2: [TensorFlow-Slim](https://github.com/tensorflow/models/tree/master/research/slim/nets/mobilenet)；V3 未见官方代码 URL |
| [ShuffleNet](Efficient_Backbone/ShuffleNet.md) | CVPR 2018 | 轻量级 CNN、pointwise 组卷积、channel shuffle、ARM 实测加速 | [megvii-model/ShuffleNet-Series](https://github.com/megvii-model/ShuffleNet-Series) |
| [MobileOne](Efficient_Backbone/MobileOne.md) | CVPR 2023 | 移动端骨干、结构重参数化、平凡过参数化、iPhone12 真机延迟基准 | [apple/ml-mobileone](https://github.com/apple/ml-mobileone) |

## 量化

模型量化和压缩技术的笔记。

| 论文 | 出处 | 关键词 | 代码 |
| --- | --- | --- | --- |
| [Deep Compression](Quantization/DeepCompression.md) | ICLR 2016 (oral) | 网络剪枝、训练量化与权重共享、Huffman 编码、35×–49× 无损压缩 | 无官方代码链接 |
| [BRECQ](Quantization/BRECQ.md) | ICLR 2021 | 后训练量化 (PTQ)、block reconstruction、二阶误差 / FIM、混合精度、遗传算法 | [yhhhli/BRECQ](https://github.com/yhhhli/BRECQ) |
| [MQBench](Quantization/MQBench.md) | NeurIPS 2021 | Benchmark、QAT、PTQ、计算图 | [ModelTC/MQBench](https://github.com/ModelTC/MQBench) |
| [LSQ](Quantization/LSQ.md) | ICLR 2020 | 量化感知训练 (QAT)、可学习量化步长、均匀量化、低比特 (2/3/4-bit) | 官方未开源 |
| [RepQ-ViT](Quantization/RepQ-ViT.md) | ICCV 2023 | 视觉 Transformer (ViT)、训练后量化 (PTQ)、尺度重参数化、极低比特量化 (4-bit) | [zkkli/RepQ-ViT](https://github.com/zkkli/RepQ-ViT) |
| [PD-Quant](Quantization/PD-Quant.md) | CVPR 2023 | 训练后量化 (PTQ)、预测差异度量、分布修正、全局感知 | [hustvl/PD-Quant](https://github.com/hustvl/PD-Quant) |
| [QD-BEV](Quantization/QD-BEV.md) | ICCV 2023 | 量化感知训练、知识蒸馏、BEV 感知、渐进式量化 | [Niko-zyf/QD-BEV](https://github.com/Niko-zyf/QD-BEV) |
| [OmniQuant](Quantization/OmniQuant.md) | ICLR 2024 | LLM 量化、训练后量化 (PTQ)、可学习量化参数、LWC、LET | [OpenGVLab/OmniQuant](https://github.com/OpenGVLab/OmniQuant) |
| [QLoRA](Quantization/QLoRA.md) | NeurIPS 2023 | 4-bit NormalFloat (NF4)、Double Quantization、Paged Optimizers、冻结 4-bit 底座 + LoRA、Guanaco | [artidoro/qlora](https://github.com/artidoro/qlora) + [TimDettmers/bitsandbytes](https://github.com/TimDettmers/bitsandbytes) |
| [VQ-Map](Quantization/VQ-Map.md) | NeurIPS 2024 | BEV 感知、语义地图构建、离散表示 (VQ-VAE)、Deformable Attention、跨模态对齐 (PV-BEV) | [Z1zyw/VQ-Map](https://github.com/Z1zyw/VQ-Map) |
| [QwT](Quantization/QwT.md) | CVPR 2025 | 线性补偿层 | [wujx2001/QwT](https://github.com/wujx2001/QwT) |
| [PTQAT](Quantization/PTQAT.md) | ICCV 2025 | 3D 感知网络、混合量化、PTQ+QAT、误差传播、自动驾驶部署 | 未开源 |

> 命名核对：`BRECQ` 在 TODO/任务清单中曾被误写为 "BRCEQ"（字母易位笔误），笔记内已按 arXiv 检索核对实名（详见 [BRECQ](Quantization/BRECQ.md) 头部注记）。

## AI Infra（Liger-Kernel PR 复盘）

**非论文笔记**：本人向 [linkedin/Liger-Kernel](https://github.com/linkedin/Liger-Kernel) 提交并合入的 PR 的技术复盘（Triton kernel 与 monkey patch 学习笔记），无论文三行头，格式为 PR 复盘（对象 PR、验证环境、合入过程、复盘要点）。

| 笔记 | 对象 PR | 主题 |
| --- | --- | --- |
| [融合线性 KL 散度算子](AI%20Infra/liger-pr1423-1476-fused-kl.md) | PR [#1423](https://github.com/linkedin/Liger-Kernel/pull/1423) + [#1476](https://github.com/linkedin/Liger-Kernel/pull/1476) | FusedLinearKLDivLoss Triton 内核 + dispatcher 注册 |
| [DeepSeek-V3 支持](AI%20Infra/liger-pr1424-deepseek-v3.md) | PR [#1424](https://github.com/linkedin/Liger-Kernel/pull/1424) | 模型支持 PR（lce_forward + monkey patch、显存/吞吐基准、零评审合入） |
| [DeepSeek-V2 支持](AI%20Infra/liger-pr1501-deepseek-v2.md) | PR [#1501](https://github.com/linkedin/Liger-Kernel/pull/1501) | 模型支持 PR（无基准数据变体、`LigerExperts` 命名兼容链跨版本排障） |

## 实验技巧与项目复盘

本人项目中沉淀的实验设计、训练调试与诊断技巧。每篇保留机制解释、适用条件和原始证据，区分项目实测、理论推导与尚待验证的解释；可检验的项目主张由对应 claim 单独维护状态。

| 笔记 | 来源项目 | 主题 |
| --- | --- | --- |
| [拟合诊断中的 Batch、归一化与采样](Experiment_Notes/拟合诊断中的Batch与归一化.md) | BEV-Planner / K-Radar | 梯度 batch、BN 统计范围、时序采样、更新预算与拟合诊断 |

## 数学与通用笔记

教材 / 数学类笔记。**特殊性**：这类笔记是定义、公式查询与推导工具，默认停留在 L1，目前未从中提炼 claim 卡（口径同根 README「来源头」一节）。

| 笔记 | 类型 | 关键词 |
| --- | --- | --- |
| [刚体旋转表示法的深度解析](Math_and_Notes/%E5%9B%9B%E5%85%83%E6%95%B0.md) | 综述 | 旋转矩阵、李群 SO(3)、四元数算法 |
| [概率分布之间的距离与散度](Math_and_Notes/%E6%A6%82%E7%8E%87%E5%88%86%E5%B8%83%E4%B9%8B%E9%97%B4%E7%9A%84%E8%B7%9D%E7%A6%BB%E4%B8%8E%E6%95%A3%E5%BA%A6.md) | 通用基础 | 总变差距离 (TVD)、KL 散度、JS 散度、三者的对比与相互关系 |
| [损失函数](Math_and_Notes/%E6%8D%9F%E5%A4%B1%E5%87%BD%E6%95%B0.md) | 通用基础 | 二分类交叉熵 (CE)、Focal Loss、`nn.CrossEntropyLoss` 用法与数值稳定性 |

## 笔记约定

- **论文笔记头部三行**：`**出处会议：**`（期刊类用 `**出处期刊：**`；预印本 / 未见收录标注的如实写 arXiv 编号与核验依据）、`**是否开源：**`、`**关键词：**`，便于横向检索与 SOTA 对比表格引用。
- **教材 / 数学与通用笔记来源头**：在标题下加一行 `**类型：**`（通用基础 / 特定来源 / 综述），与根 README「来源头」一致——
  - **通用基础**：定义、标准定理、常见公式，不要求指定单一书目，不写 `来源`；
  - **特定来源**：某个方法、实验结论或非标准约定，必须写 `来源`（书名 + 版次 + 章节，或论文/URL）；混合笔记把来源放到对应小节；
  - **综述**：综合多份来源，参考文献列在文末。

  这类笔记默认停留在 L1：可用于定义、背景和公式查询。
- **编号章节**：正文用编号章节组织，惯例顺序「概述 → 方法 → 实验 → 核心结论」（实际笔记存在 `1.` 与 `一、` 两种编号风格）；关键数字、表格行与引句带章节 / 表号 locator（§、Table、Figure）；基于 arXiv/ar5iv 抓取的笔记在头部或文末「来源与抓取记录」注明版本与抓取日期。
- **层级**：单个一级标题 + 二级标题组织小节，便于生成目录与锚点跳转。
- **公式**：行内用 `$...$`，独立成行用 `$$...$$`（不要用 LaTeX 原生的 `\(...\)` / `\[...\]`，通用 Markdown 渲染器不识别）。
- **命名与配图**：一篇论文一个文件，文件名用论文原名；配图统一放 `assets/<论文名>/`，目录不存在就在文末留 TODO。
- **素材现状注记（QUESTIONS #16）**：`ADe2e/UniAD/`、`ADe2e/AutoVLA/` 的表格截图目前与笔记同目录存放（不在 `assets/` 下，笔记内用相对路径引用），与上一条 assets 约定两处并存；迁移与否待主人定。论文原文 PDF 目前也存放在部分主题目录内（如 `3D_Occupancy/*.pdf`、`Classical_Detection/R4Det.pdf`），`assets/` 只放图片截图与少量文献抓取记录。
