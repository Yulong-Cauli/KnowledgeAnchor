# DrivePI: Spatial-aware 4D MLLM for Unified Autonomous Driving Understanding, Perception, Prediction and Planning

**出处会议：** CVPR 2026（依据 GitHub 仓库 README News 原文 “**2026.02.21**: [DrivePI](http://arxiv.org/abs/2512.12799) and [GenieDrive](https://github.com/Huster-YZY/GenieDrive) have been accepted by CVPR 2026!”；仓库 description 原文 “[CVPR 2026] DrivePI: Spatial-aware 4D MLLM for Unified Autonomous Driving Understanding,  Perception, Prediction and Planning”（GitHub API 本次抓取，Understanding 后双空格照抄）；arXiv abs 页无 Comments 会议标注，本次抓取确认 Comments 字段不存在，dateline 原文 “[Submitted on 14 Dec 2025]”）

**是否开源：** 部分开源。GitHub https://github.com/happinesslz/DrivePI （GitHub API 本次抓取确认存在：full_name happinesslz/DrivePI，default_branch main，created_at 2025-11-25，pushed_at 2026-03-21，stargazers_count 143，**license: None** 即仓库未附任何 license）；README News 原文 “**2026.03.21**: The training and evaluation code for [DrivePI](http://arxiv.org/abs/2512.12799) have been released! Data preparation guidelines, trained models and all associated benchmarks will be available within a week!”；README TODO List 勾选状态（本次抓取）：“[x] Release the paper.”、“[x] Release the code of DrivePI.” 已勾选，“[ ] Release checkpoints of DrivePI.”、“[ ] Release the dataset.”、“[ ] Support WAYMO E2E Dataset” 未勾选（checkpoints 与数据集尚未发布）；README 安装步骤注释行原文 “Install EMOVA” 与 “Reference: https://github.com/emova-ollm/EMOVA”，随后原文 “pip install -e .”（代码基于 EMOVA 框架安装），数据准备原文 “Use [UniLION](https://github.com/happinesslz/UniLION) to generate and save BEV features”（BEV 特征由 UniLION 生成，与论文 §3.1 所引视觉编码器 [36]=UniLION 一致）

**关键词：** 4D MLLM（3D occupancy + occupancy flow 时空输出）、VA 与 VLA 统一框架、LiDAR 点云 + 多视角相机 + 语言指令输入、latent BEV 特征 + 空间 projector（patchify + cross-attention pooling）、四个专用输出头（text head / 3D occupancy head / occupancy flow head / action diffusion head）、数据引擎（InternVL3-78B 生成 text-occupancy / text-flow / text-planning QA）、Qwen2.5-0.5B MLLM 底座、端到端多任务联合优化（损失权重全 1）、nuScenes / OpenOcc / Occ3D / nuScenes-QA、FlashOcc 式 occupancy 头 + DiffusionDrive 式 action diffusion 头

> 来源与核验（抓取日期 2026-11-02）：
> - **标题核对（重要）**：任务给定名称「DrivePI」与 arXiv 实际检索到的论文名逐字一致；确切全题为「DrivePI: Spatial-aware 4D MLLM for Unified Autonomous Driving Understanding, Perception, Prediction and Planning」（abs 页 title 与 HTML 正文标题逐字核对）。按任务条件二核对主题：arXiv 摘要主题为自动驾驶统一 VLA 框架（空间理解 + 3D occupancy 感知 + occupancy flow 预测 + 规划），与本库 TODO「VLM / VLA」组（端到端自动驾驶方向）吻合。arXiv API 标题检索 ti:“DrivePI”（本次抓取）仅 1 条命中 arXiv:2512.12799，all 字段检索 “DrivePI” 同样仅此 1 条，无同名异文。注：CVF Open Access / papers.cool 页面将该题截短为 “DrivePI: Spatial-aware 4D MLLM for Unified Autonomous Driving”（本次网络检索所见），以 arXiv 全题为准。
> - arXiv abs 页 v1（latest，v1 唯一版本）https://arxiv.org/abs/2512.12799 （submitted 14 Dec 2025，无 Comments 字段；作者 Zhe Liu, Runhui Huang, Rui Yang, Siming Yan, Zining Wang, Lu Hou, Di Lin, Xiang Bai, Hengshuang Zhao；分类 cs.CV）。
> - 全文 arXiv 官方 HTML v1 https://arxiv.org/html/2512.12799v1 （LaTeXML 渲染，页面自标 “arXiv:2512.12799v1 [cs.CV] 14 Dec 2025”，本次抓取）。以下 locator（§x / 表 x）均指该 v1 的章节与表格编号（正文 §1–§5，附录 §6–§9）。PDF（https://arxiv.org/pdf/2512.12799v1 ，本次抓取后 pdftotext 全文提取）亦含 Table 1–13，编号与 HTML 一致，**无「PDF 专属而 HTML 缺失」的表**；PDF 表格数值抽查（表 1 方法列与前两数值列、表 3 全部 8 行）与 HTML 逐格一致。PDF 正文抽查：本笔记 128 个引文单元中 99 个在 pdftotext 文本中逐字命中，其余 29 个经抽查均系数学标记/引用标记在 PDF 文本中的渲染差异或 pdftotext 分页伪影（如页码插入词中 「train3/able」、PDF 保留 “[45, 71]” 而引文单元按约定剥除引用标记），未见正文措辞差异；已确认的 PDF/HTML 实质差异仅为上述参考文献编号偏移。**注意：PDF 与 HTML 的参考文献编号存在局部偏移**（本次对照确认的例证：LLaVA1.5 PDF[34]/HTML[33]、Occ3D PDF[47]/HTML[48]、BEVDetOcc-SF PDF[15]/HTML[16]、RayIoU 指标 PDF[33]/HTML[32]；OpenDriveVLA 两版均 [71]），本笔记一律采用 HTML v1 编号，对照 PDF 时需按作者名而非编号。
> - 引文约定：引号内为本次实际抓取文本的逐字摘录，并经脚本对照抓取文本验证存在（见文末「表格核验与引文自查」）；「〔…〕」标记处为数学插入点（内容为该数学元素 alttext 属性原文）或引用编号插入点（纯数字，对应 HTML 中 [ n ] 式引用标记）；原文拼写错误照抄并注明（§4.1 “reuslts”、§4.3 小节标题 “3D Ocuupancy”、§3.2 “that arises”、§3.1 Note “point clouds contains”、§4.4 “we not use”、§1 特征句首词小写 “first”）。
> - 开源核对：GitHub API repo metadata 与 raw README（https://raw.githubusercontent.com/happinesslz/DrivePI/main/README.md ）均本次实际抓取；仓库无 license 字段（license: None），引用代码前需注意授权缺失。
> - 表格：HTML v1 含全部 13 张表；表 1–9 为数值表，本笔记逐行照抄解析结果并经脚本逐单元格核验（见文末）；表 10–13 为数据引擎 prompt 示例与定性可视化表（含图片与生成文本，其图片部分 HTML 中为空白图位），本笔记不逐行硬转抄、仅逐字摘录少量文字行并核验（EMC2 表格错位教训：只抄经核验的行，图位内容跳过）。
> - 本笔记为草稿（nightshift/drafts/），未经用户核阅前所有结论均属「论文声称 / 尚未独立验证」。

------

## 1. 概述

- 论文定位（Abstract 原句）：“we propose DrivePI, a novel spatial-aware 4D MLLM that serves as a unified Vision-Language-Action (VLA) framework that is also compatible with vision-action (VA) models.” 任务范围（Abstract 原句）：“Our method jointly performs spatial understanding, 3D perception ( i.e. , 3D occupancy), prediction ( i.e. , occupancy flow), and planning ( i.e. , action outputs) in parallel through end-to-end optimization.”
- 头条声称（Abstract 原句）：“Remarkably, with only a 0.5B Qwen2.5 model as MLLM backbone, DrivePI as a single unified model matches or exceeds both existing VLA models and specialized VA models.”（具体数字，Abstract 原句）：“Specifically, compared to VLA models, DrivePI outperforms OpenDriveVLA-7B by 2.5% mean accuracy on nuScenes-QA and reduces collision rate by 70% over ORION (from 0.37% to 0.11%) on nuScenes.” 与 “Against specialized VA models, DrivePI surpasses FB-OCC by 10.3 RayIoU for 3D occupancy on OpenOcc, reduces the mAVE from 0.591 to 0.509 for occupancy flow on OpenOcc, and achieves 32% lower L2 error than VAD (from 0.72m to 0.49m) for planning on nuScenes.”（数字与本文表 1–3 逐格对应，见 §3 实验）
- 问题动机（§1 原句，先 VA 后 VLA 两面批评）：VA 侧 “Although these methods achieve promising results through their accurate spatial perception capabilities and the modular designs, they are limited in language-based scene interaction, which reduces user-friendliness.”；VLA 侧 “However, these VLA-based approaches usually struggle to guarantee reliable outputs due to the absence of fine-grained intermediate 3D perception and prediction outputs compared to the modular-design of VA models, consequently compromising interpretability and safety assurances.” 中心问题（§1 原句）：“Therefore, a natural question arises: Can we develop a unified framework that combines the precise spatial perception of VA models with the natural language interaction of VLA-based approaches?”
- 「4D」命名（§1 原句）：“Here, we term it 4D MLLM as it outputs both 3D occupancy and flow, capturing fine-grained spatial-temporal dynamics.”
- 四个差异化特征（§1 原句列举，第一条句首小写 “first” 照原文）：“first, unlike mainstream VLA-based methods that rely solely on camera images as input, DrivePI introduces LiDAR as a complementary sensing modality, providing precise 3D geometric information that better elicits the spatial understanding capabilities of MLLMs.”；其二为输出中间细粒度表征（§1 原句片段）：“DrivePI generates intermediate fine-grained 3D perception ( e.g. , 3D occupancy) and prediction ( e.g. , occupancy flow) representations”；其三为数据引擎（§3.2）；其四为统一模型端到端联合优化（§1 原句）：“Fourth, DrivePI serves as a unified model, which employs end-to-end joint optimization across all tasks including 3D perception, prediction, planning, and scene understanding.”
- 四条贡献（§1 列表，逐条原句，节选其一与其三、其四）：“We propose DrivePI, the first unified spatial-aware 4D MLLM framework that seamlessly integrates coarse-grained linguistic spatial understanding with fine-grained 3D perception capabilities, bridging the gap between VA-based and VLA-based paradigms in autonomous driving while inheriting the complementary strengths of both approaches;”／“We develop three complementary spatial understanding benchmarks based on our data engine by constructing multiple question-answer (QA) pairs: 3D occupancy perception for static scene understanding, occupancy flow prediction for dynamic motion analysis, and trajectory planning for decision-making evaluation.”／“Despite utilizing only a compact 0.5B parameter MLLM backbone, DrivePI even outperforms existing VA models in 3D occupancy and occupancy flow while maintaining comparable interactive capabilities with existing VLA frameworks in autonomous driving.”
- 与本库 VLM / VLA 笔记的关系（有据）：论文 §2「Vision Language Action Model」小节以 OpenDriveVLA 为 VLA 实例（§2 原句）：“For example, OpenDriveVLA”〔71〕“employs a Bird’s-Eye-View (BEV) representation to generate distinct tokens corresponding to agents, static maps, and scene context.”，并在实验表 2（规划）与表 3（nuScenes-QA）中把 OpenDriveVLA-0.5B/3B/7B 作为主要对比基线——表 3 三行数值与库内 nightshift/drafts/OpenDriveVLA.md 的 TABLE II 对应列逐格一致，表 2 的 OpenDriveVLA-7B 行与库内 OpenDriveVLA.md TABLE I 的 UniAD 协议八列逐格一致（本次对照核验）；nuScenes-QA 基线还含 LLaVA1.5〔33〕（参考文献 [33] 原文 “Improved baselines with visual instruction tuning . In CVPR ,”，即 LLaVA-1.5），与库内 nightshift/drafts/LLaVA.md 同谱系可比。架构谱系上本文仍是「视觉特征 → projector → MLLM」的 LLaVA 式路线，但 projector 换成 patchify + cross-attention（§3.1）且在 MLLM 之外挂三个非自回归专用头（§3.1/§3.3）。全文无 「OpenVLA」 字样（本次抓取 HTML 全文 grep 0 命中），与库内 nightshift/drafts/OpenVLA.md 无可引的直接关联。

## 2. 方法

### 2.1 总体架构（§3、§3.1）

- 流程（§3.1 原句）：“Second, we employ an advanced multi-modal vision encoder”〔36〕“to process multi-view images and LiDAR point clouds, subsequently converting them into a compact latent BEV feature representation.” 与 “Next, a spatial projector is utilized to map the latent BEV features into the language space and obtain vision tokens.”（前句动机，§3.1 原句）：“First, to ensure that the inputs of MLLMs contain accurate geometric information, we incorporate LiDAR point clouds as additional inputs”（句中插入 Note 原文，拼写 “contains” 照抄）：“(Note: LiDAR point clouds contains temporal information on the nuScenes dataset.)”
- 四个输出头（§3.1 原句）：“Finally, we utilize four specialized heads: a text head to generate responses for scene understanding in an auto-regressive manner, a 3D occupancy head for accurate 3D perception, an occupancy flow head for fine-grained motion prediction, and an action diffusion head for trajectory planning.” 联合训练（§3.1 原句）：“Note that the MLLM is trainable, and all tasks are jointly optimized during training.”
- BEV 分辨率与维度（§3.1 原句，含数学）：“Given the latent BEV feature”〔F_{bev}\in\mathbb{R}^{H\times W\times C}〕“, where”〔H\times W〕“typically exceeds a resolution of”〔100\times 100〕“, directly inputting these features at the pixel level into the MLLM would incur prohibitive computational costs.”（其中 H×W 若逐像素进 MLLM 代价过高为动机）
- 空间 projector：patchify + cross-attention（§3.1 原句，含数学）：“To address this challenge, we first patchify”〔F_{bev}〕“into”〔N〕“patches of size”〔K\times K〕“, producing visual features”〔F_{patch}\in\mathbb{R}^{N\times K^{2}\times C}〕“, where”〔N=\frac{H}{K}\times\frac{W}{K}〕。池化基线与批评（§3.1 原句）：“A conventional approach involves applying pooling operations to aggregate the”〔K\times K〕“spatial features into a single representation, yielding pooled features”〔F_{pool}\in\mathbb{R}^{N\times 1\times C}〕“.”（句号在数学元素后，原文如此）紧接同段原句：“However, this approach typically results in the loss of fine-grained spatial information.”
- cross-attention 细节（§3.1 原句，含数学；句首 “following”〔17〕“for handling high-resolution image inputs in 2D MLLMs” 指 2D MLLM 处理高分辨率的做法）：“we adopt a cross-attention mechanism with”〔F_{pool}〕“, ”〔F_{patch}〕“, and”〔F_{patch}〕“serving as query, key, and value, respectively. This design preserves more detailed spatial information.” 输出（§3.1 原句）：“Finally, we employ a linear layer to transform the processed features to match the channel dimension”〔C_{l}〕“of the MLLM’s input hidden states, producing the final vision tokens”〔F_{v}\in\mathbb{R}^{N\times C_{l}}〕
- 视觉编码器 [36] 即 UniLION（参考文献 [36] 原文：“UniLION: towards unified autonomous driving model with linear group rnns . arXiv preprint arXiv:2511.01768 .”；GitHub README 亦写明 BEV 特征用 UniLION 生成）。

### 2.2 粗粒度空间理解与数据引擎（§3.2；附录 §7）

- 定义（§3.2 原句，语法 “that arises” 照原文）：“In this paper, we define coarse-grained spatial understanding as the text-based descriptions that arises from the highly compressed nature of language compared to rich visual information ( e.g. , images, LiDAR point clouds).”
- 三个 benchmark（§3.2 原句）：“Therefore, we develop three complementary spatial understanding benchmarks based on our data engine by constructing multiple question-answer (QA) pairs: 3D occupancy perception for static scene understanding, occupancy flow prediction for dynamic motion analysis, and trajectory planning for decision-making evaluation.”
- 数据引擎三阶段（§3.2 原句）：“In the first stage, we employ InternVL3-78B”〔72〕“to generate scene descriptions for the front and back views separately. This strategy prevents potential confusion that may arise when MLLMs struggle to distinguish between different viewpoints.”；第二阶段（§3.2 原句）：“Specifically, we leverage ground-truth occupancy and flow data to generate diverse text-occupancy and text-flow QA pairs. These QA pairs focus on key tasks such as determining whether given positions are occupied, identifying corresponding object categories, and predicting velocity information.”；第三阶段（§3.2 原句）：“In the final stage, we generate text-planning QA pairs to enhance planning interpretability based on future trajectory annotations of the ego-vehicle.”
- 附录 §7（原句）说明 prompt 覆盖四类任务：“we design instruction question-answering (QA) pairs covering four core tasks: 3D occupancy prediction, flow prediction, action prediction, and trajectory prediction.”；表 10 为数据引擎生成示例（Prompt 1–3 为前后视 caption 与改写，Prompt 4 为 3D occupancy/flow 问答模板，其中原句 “The height region is divided into 16 bins.”；Prompt 6 原文 “Predict the future 6-frame trajectory of the ego car in the last.”）。

### 2.3 细粒度空间学习与损失（§3.3、§3.4；附录 §8）

- 定义（§3.3 原句）：“In this paper, we define fine-grained spatial learning as the integration of explicit spatial capabilities, including 3D occupancy, occupancy flow, and trajectory planning.”
- 三个视觉头与特征变换（§3.3 原句，含数学）：“We adopt three fine-grained visual heads to enable precise spatial capabilities: a 3D occupancy head for volumetric scene understanding, an occupancy flow head for temporal dynamics modeling, and an action diffusion head for trajectory planning. Specifically, to implement these fine-grained heads, we first extract the corresponding vision tokens”〔F_{v}^{*}\in\mathbb{R}^{N\times C_{l}}〕“from the multi-modal representation. Subsequently, we employ a linear projection layer to transform”〔F_{v}^{*}〕“into”〔F_{v}^{out}\in\mathbb{R}^{N\times K^{2}C}〕“. We then reshape”〔F_{v}^{out}〕“into a spatial feature map”〔F_{out}\in\mathbb{R}^{H\times W\times C}〕
- 总损失（§3.4 原句，含数学）：“We define the total loss as a weighted summation of four components:”〔L_{llm}〕“for the text head,”〔L_{occ}〕“for the occupancy head,”〔L_{flow}〕“for the occupancy flow head, and”〔L_{action}〕“for the action diffusion head.” 权重含义（§3.4 原句，含数学）：“where”〔\lambda_{1},\lambda_{2},\lambda_{3},\lambda_{4}〕“are the balancing weights for text scene understanding, 3D occupancy perception, occupancy flow prediction, and trajectory planning, respectively. All tasks are optimized jointly in an end-to-end manner.” 式 (1)：〔L_{total}=\lambda_{1}L_{llm}+\lambda_{2}L_{occ}+\lambda_{3}L_{flow}+\lambda_{4}L_{action},〕
- 3D occupancy 头实现（附录 §8 原句）：“For the 3D occupancy head, we mainly follow the previous superior method FlashOcc”〔65〕（参考文献 [65] 为 FlashOcc, arXiv:2311.12058）；loss 沿用其 focal / geometric / semantic / Lovász 四项。
- occupancy flow 头（附录 §8 原句）：“We use an additional MLP to predict the velocity of 3D occupancy based on the occupancy head.” 与 “we assign a weight of 1.0 to each dynamic occupancy flow for computing the flow loss, while applying a smaller weight of 0.01 to static occupancy flow during training.”
- action diffusion 头（附录 §8 原句）：“In contrast, our approach directly generates trajectories without requiring SparseDrive for plan query initialization. For the loss of action diffusion head, we employ L1 loss for the action diffusion head during training.”（做法沿用前作 DiffusionDrive〔28〕与 Diffusion Policy〔8〕，§8 原句片段 “to implement a simple action diffusion head that predicts trajectories based on the denoising procedure”）
- 隐藏层加权（附录 §6 原句，含数学）：以加权组合替换「只用最后隐藏层」——〔h=\sum_{i=0}^{l}F_{i}^{h}\cdot w_{i}〕（〔F_{i}^{h}\in\mathbb{R}^{N\times C}〕 为第 i 层特征、〔w_{i}\in\mathbb{R}^{1\times 1}〕 为可学习权重）；规模（§6 原句）：“Here, the 0.5B (or 3B) MLLM contains 24 (or 36) transformer layers, and when including the input embeddings, we obtain a total of 25 (or 37) hidden states with corresponding learnable weights.” 趋势（§6 原句）：“we observe an overall trend where deeper layers tend to receive larger weights, indicating that higher-level features extracted by deeper transformer layers are more crucial for the effectiveness of our DrivePI.”

## 3. 实验

### 3.1 数据、指标与实现（§4.1、§4.2）

- 数据集（§4.1 原句）：“The dataset comprises 750 training scenes, 150 validation scenes, and 150 test scenes.” 与 “nuScenes provides synchronized multi-modal sensor data including LiDAR point clouds and multi-view images from 6 cameras.”（occupancy 评测用 OpenOcc〔49〕即 “Scene as occupancy”，Occ3D〔48〕做扩展对比——本句含原文拼写 “reuslts”：“Moreover, to make a comprehensive comparison with most 3D occupancy methods, we evaluate the reuslts on Occ3D”〔48〕；occupancy flow 用 OpenOcc 自带 flow 标注；规划为 nuScenes 开环协议；文本为 nuScenes-QA〔41〕）
- 训练数据规模（§4.1 原句）：“dataset containing 377k training question-answer (QA) pairs, and employ our proposed data generation pipeline to generate 84k training scene descriptions, 560k QA pairs for 4D spatial reasoning and 24k for planning reasoning, culminating in a comprehensive training dataset of over 1.0M QA pairs.”
- 指标（§4.1 原句片段）：“For 3D occupancy and occupancy flow, we use RayIoU”〔32〕“and the mean Average Velocity Error (mAVE)”〔5〕；“For planning, we follow previous methods”〔45, 71〕“and use L2 distance error and collision rate metrics.”；文本采用 nuScenes-QA 官方指标。
- 两阶段训练（§4.2 原句）：“To balance computational efficiency, we adopt Qwen2.5-0.5B”〔3〕“as our base model. The training of DrivePI comprises two stages. In the first stage, we freeze the vision encoder and the MLLM, then train the spatial projector to align visual representations with the language embedding space for 1 epoch using the generated captions of our data engine.” 与 “In the second stage, we jointly optimize the spatial projector, MLLM, and all task-specific heads ( i.e. , text head, 3D occupancy head, occupancy flow head, and action diffusion head) for 1 epoch while keeping only the vision encoder frozen.”
- 损失权重与硬件（§4.2 原句，含数学）：“For loss balancing, we adopt the balancing weights of”〔\lambda_{1}=\lambda_{2}=\lambda_{3}=\lambda_{4}=1〕“. All experiments are conducted on 8”〔\times〕“NVIDIA L40S GPUs.”（Qwen2.5 引文 [3] 在参考文献表中为 “Qwen2. 5-vl technical report”，原文照抄）

### 3.2 主结果（§4.3；表 1–4）

- 统一口径（§4.3 原句）：“Unless otherwise specified, all experiments are conducted using our unified 0.5B model architecture with shared parameter weights across all tasks.”
- OpenOcc 占据 + 流（表 1；小节标题原文拼写 “3D Ocuupancy and Occupancy Flow on OpenOcc.” 照抄）：（§4.3 原句）“DrivePI achieves superior performance across multiple metrics, with an OccScore of 49.3%, RayIoU of 49.3%, and mAVE of 0.509.”；对 FB-OCC〔26〕：“by 10.3 RayIoU for 3D occupancy and reduces flow mAVE from 0.591 to 0.509.”；对前 SOTA（§4.3 原句）：“by 6.3% in OccScore, 7.4% in RayIoU, and reduces mAVE by 0.047, establishing new state-of-the-art results with only a 0.5B MLLM backbone.”
- nuScenes 规划（表 2；caption 原句）：“Planning performance on the nuScenes validation set. Note that our unified model DrivePI does not incorporate ego status during training by default to avoid potential shortcut learning.” 读数（§4.3 原句）：“DrivePI achieves an L2 error of 0.40 and a collision rate of 0.11% with ego status, outperforming the end-to-end VA method VAD”〔20〕“and VLA method OpenDriveVLA-7B”〔71〕“by 0.03% and 0.14% in collision rate, respectively.” 与 “Notably, DrivePI reduces collision rate by 70% compared to the recent ORION”〔9〕“(from 0.37% to 0.11%). Without ego status, DrivePI achieves 32% lower L2 error than VAD (from 0.72m to 0.49m).”
- nuScenes-QA 文本理解（表 3；§4.3 原句）：“As shown in Table 3 , DrivePI with only a 0.5B model size achieves 60.7% accuracy, outperforming OpenDriveVLA-7B”〔71〕“by 2.5%.”（表 3 caption 原句：“Text Understanding performance on the nuScenes-QA validation set. Ext., Cnt., Obj., Sts., Cmp. and Acc. are short for exist, count, object, status, comparison, and the overall accuracy.”）
- Occ3D-nuScenes 占据（表 4；§4.3 原句）：“DrivePI achieves state-of-the-art performance with 46.0% RayIoU, surpassing the previous best method OPUS”〔52〕“by a significant margin of 4.8%.”（表 4 caption 原句：“* indicates that DrivePI is trained exclusively on the 3D occupancy task of Occ3D-nuScenes.”，即该行非统一模型而是单任务专用版）

- 表 1（§4.3，TABLE 1，OpenOcc 验证集；逐行照抄；“–” 为原文 en-dash；✓ 为数学元素 alttext `\checkmark`，↑/↓ 同理为 `\uparrow`/`\downarrow`；「RayIoU 1m/2m/4m」 在 HTML 源中数字与 RayIoU 间无空格）：

| Method | VLM-based | OccScore ↑ | RayIoU (3D Occ.) ↑ | mAVE (Occ. Flow) ↓ | RayIoU 1m | RayIoU 2m | RayIoU 4m |
| --- | --- | --- | --- | --- | --- | --- | --- |
| OccNeRF [66] |  | 28.5 | 31.7 | – | 16.6 | 29.3 | 49.2 |
| RenderOcc [40] |  | 33.0 | 36.7 | – | 20.3 | 32.7 | 49.9 |
| LetOccFlow [35] |  | 36.4 | 40.5 | – | 25.5 | 39.7 | 56.3 |
| OccNet [49] |  | 35.7 | 39.7 | – | 29.3 | 39.7 | 50.0 |
| BEVDetOcc-SF [16] |  | 33.0 | 36.7 | 1.420 | 31.6 | 37.3 | 41.1 |
| FB-Occ [26] |  | 39.2 | 39.0 | 0.591 | 32.7 | 39.9 | 44.4 |
| F-Occ [68] |  | 41.0 | 39.9 | 0.491 | 33.9 | 40.7 | 45.2 |
| CascadeFlow [29] |  | 40.9 | 39.6 | 0.470 | 33.5 | 40.3 | 45.0 |
| ALOcc-Flow-3D [6] |  | 43.0 | 41.9 | 0.556 | 35.6 | 42.8 | 47.4 |
| DrivePI (Ours) | ✓ | 49.3 | 49.3 | 0.509 | 45.0 | 50.0 | 52.9 |

- 表 2（§4.3，TABLE 2，nuScenes 验证集规划；逐行照抄；原表为两行表头：「L2 (m) ↓」 与 「Col. (%) ↓」 各跨 4 列；「VLM-based」「Ego Status」 为 ✓ 标记列；ST-P3 行引用编号在 HTML 中为空括号 「[]」，照抄）：

| Method | VLM-based | Ego Status | L2 (m) ↓ 1s | ↓ 2s | ↓ 3s | ↓ avg. | Col. (%) ↓ 1s | ↓ 2s | ↓ 3s | ↓ avg. |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ST-P3 [] |  |  | 1.33 | 2.11 | 2.90 | 2.11 | 0.23 | 0.62 | 1.27 | 0.71 |
| FF [13] |  |  | 0.55 | 1.20 | 2.54 | 1.43 | 0.06 | 0.17 | 1.07 | 0.43 |
| EO [21] |  |  | 0.67 | 1.36 | 2.78 | 1.60 | 0.04 | 0.09 | 0.88 | 0.33 |
| UniAD [14] |  |  | 0.48 | 0.96 | 1.65 | 1.03 | 0.05 | 0.17 | 0.71 | 0.31 |
| VAD [20] |  |  | 0.41 | 0.70 | 1.05 | 0.72 | 0.07 | 0.17 | 0.41 | 0.22 |
| VAD [20] |  | ✓ | 0.17 | 0.34 | 0.60 | 0.37 | 0.07 | 0.10 | 0.24 | 0.14 |
| OmniDrive [53] | ✓ | ✓ | 0.14 | 0.29 | 0.55 | 0.33 | 0.00 | 0.13 | 0.78 | 0.30 |
| ORION [9] | ✓ | ✓ | 0.17 | 0.31 | 0.55 | 0.34 | 0.05 | 0.25 | 0.80 | 0.37 |
| OpenDriveVLA-7B [71] | ✓ | ✓ | 0.20 | 0.58 | 1.21 | 0.66 | 0.00 | 0.22 | 0.55 | 0.25 |
| DrivePI (Ours) | ✓ |  | 0.24 | 0.46 | 0.78 | 0.49 | 0.38 | 0.27 | 0.48 | 0.38 |
| DrivePI (Ours) | ✓ | ✓ | 0.19 | 0.36 | 0.64 | 0.40 | 0.00 | 0.05 | 0.28 | 0.11 |

（注：上表表头为照顾 markdown 拼合而改写，原表头为两行结构——首行 「L2 (m) ↓」 跨 L2 四列、「Col. (%) ↓」 跨 Col. 四列（↓ 均为数学元素，alttext `\downarrow`），次行为 「1s | 2s | 3s | avg.」 两组；「Method | VLM-based | Ego Status」 位于次行。数值逐格照抄解析结果。）

- 表 3（§4.3，TABLE 3，nuScenes-QA 验证集；逐行照抄）：

| Method | Ext. ↑ | Cnt. ↑ | Obj. ↑ | Sts. ↑ | Cmp. ↑ | Acc. ↑ |
| --- | --- | --- | --- | --- | --- | --- |
| LLaMA-AdapV2 [11] | 19.3 | 2.7 | 7.6 | 10.8 | 1.6 | 9.6 |
| LLaVA1.5 [33] | 45.8 | 7.7 | 7.8 | 9.0 | 52.1 | 26.2 |
| LiDAR-LLM [63] | 74.5 | 15.0 | 37.8 | 45.9 | 57.8 | 48.6 |
| BEVDet+BUTD [41] | 83.7 | 20.9 | 48.8 | 52.0 | 67.7 | 57.0 |
| OpenDriveVLA-0.5B [71] | 83.9 | 22.0 | 50.2 | 57.0 | 68.4 | 58.4 |
| OpenDriveVLA-3B [71] | 84.0 | 22.3 | 50.3 | 56.9 | 68.5 | 58.5 |
| OpenDriveVLA-7B [71] | 84.2 | 22.7 | 49.6 | 54.5 | 68.8 | 58.2 |
| DrivePI (Ours) | 85.3 | 22.4 | 57.5 | 59.1 | 68.3 | 60.7 |

- 表 4（§4.3，TABLE 4，Occ3D-nuScenes 验证集；逐行照抄；“DrivePI* (Ours)” 星号含义见 caption 引句）：

| Method | VLM-based | RayIoU ↑ | RayIoU 1m | RayIoU 2m | RayIoU 4m |
| --- | --- | --- | --- | --- | --- |
| RenderOcc [40] |  | 19.5 | 13.4 | 19.6 | 25.5 |
| SimpleOcc [10] |  | 22.5 | 17.0 | 22.7 | 27.9 |
| BEVFormer [25] |  | 32.4 | 26.1 | 32.9 | 38.0 |
| BEVDet-Occ [15] |  | 32.6 | 26.6 | 33.1 | 38.2 |
| FB-Occ [26] |  | 33.5 | 26.7 | 34.1 | 39.7 |
| SparseOcc [32] |  | 36.1 | 30.2 | 36.8 | 41.2 |
| OPUS [52] |  | 41.2 | 34.7 | 42.1 | 46.7 |
| DrivePI* (Ours) | ✓ | 46.0 | 42.2 | 46.7 | 49.2 |

### 3.3 消融（§4.4；表 5–7；附录 §6 表 8–9）

- 文本头 / 视觉头消融（表 5）：（§4.4 原句，定义）“we refer to the combination of the fine-grained 3D occupancy head, occupancy flow head, and trajectory planning head as the vision head.”（§4.4 原句）“When only the text head is enabled ( I ), DrivePI achieves competitive performance with 61.2% accuracy on the text understanding task.”（§4.4 原句，“we not use” 拼写照原文）“When only the vision head ( i.e. , occupancy, flow, and planning) is enabled ( II ), DrivePI still delivers promising results: 47.5% RayIoU for 3D occupancy, 0.69 mAVE for occupancy flow, and 1.02 L2 error with 0.39 collision rate for trajectory planning (we not use ego-vehicle information during training process).”（§4.4 原句）“Compared to the vision-only setting ( II ), the unified model ( III ) increases RayIoU by 1.8%, reduces mAVE by 0.18, and decreases L2 error by 0.52. The main reason is that text understanding helps better align with the appropriate feature space for vision tasks.”
- 表 5（§4.4，TABLE 5；逐行照抄；原表 “Planning” 跨 L2/Col. 两列，两行表头；“–” 为原文 en-dash）：

| # | Text Head | Vision Head | 3D Occ. RayIoU ↑ | Occ. Flow mAVE ↓ | Planning L2 ↓ | Planning Col. ↓ | QA Acc. ↑ |
| --- | --- | --- | --- | --- | --- | --- | --- |
| I | ✓ | – | – | – | – | – | 61.2 |
| II | – | ✓ | 47.5 | 0.69 | 1.02 | 0.39 | – |
| III | ✓ | ✓ | 49.3 | 0.51 | 0.50 | 0.38 | 60.7 |

- 数据规模消融（表 6）：（§4.4 原句）“we mainly conduct the experiments on the Qwen-2.5 3B model using only the text head.”（§4.4 原句）“When trained with only 112K samples (84K captions + 28K occupancy QA pairs), DrivePI achieves only 73% accuracy in occupied status prediction and 14.3% accuracy in occupancy category prediction. When scaling the occupancy QA pairs from 28K to 560K, there is an obvious performance improvement with 14% accuracy on predicting occupancy status and 44.9% accuracy on predicting occupancy category.”（0.5B 统一模型对比，§4.4 原句）“We find that our 0.5B model even achieves better performance on action status prediction and L2 error despite having lower QA accuracy, demonstrating the effectiveness of DrivePI in unifying text understanding, 3D perception, prediction, and planning.”
- 表 6（§4.4，TABLE 6；逐行照抄；“Model Size” 首格 “3B” 原文跨 5 行（rowspan），续行首格为空，此处按解析结果展开为空格；“–” 为原文 en-dash；最后一格 63.0 为该行 QA Acc.）：

| Model Size | Caption | OCC. | Flow | Action | QA | Occ. Status Acc. ↑ | Occ. Class Acc. ↑ | Occ. Flow mAVE ↓ | Action Status Acc. ↑ | Planning L2 ↓ | Planning Col. ↓ | QA Acc. ↑ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0.5B | 84k | 420k | 140k | 24k | 377k | 86.0 | 50.4 | 0.91 | 83.8 | 0.79 | 0.63 | 60.7 |
| 3B | 84k | 28k | – | – | – | 73.0 | 14.3 | – | – | – | – |  |
| (3B) | 84k | 56k | – | – | – | 74.2 | 22.4 | – | – | – | – | – |
| (3B) | 84k | 280k | – | – | – | 86.8 | 54.7 | – | – | – | – | – |
| (3B) | 84k | 560k | – | – | – | 87.0 | 59.2 | – | – | – | – | – |
| (3B) | 84k | 420k | 140k | 24k | 377k | 88.6 | 59.8 | 0.69 | 83.3 | 0.86 | 0.62 | 63.0 |

（注：续行首格 「(3B)」 为本笔记为可读性加的标注，原文该格为空（rowspan 延续）；第 2 行末格原文为空（无 QA 训练时无 QA Acc. 读数），其余 “–” 均照抄原文。caption 原句说明列含义：“The columns of Occ. Status, Occ. Class, Occ. Flow, Action Status denote the occupancy status (i.e., “yes” or “no”), occupancy category, the occupancy flow, the action commands (i.e., “straight”, “right”, “left”, and “stop”), respectively.”）
- 平衡权重消融（附录 §6，表 7；§6 原句）“Through preliminary analysis, we observe that the 3D occupancy and occupancy flow losses dominate the total loss function, accounting for over 60% of the combined loss magnitude.”（§6 原句）“We find that higher occupancy and flow weights yield improved performance on 3D occupancy and occupancy flow, but result in slight degradation in planning accuracy (L2 error) and text understanding in the QA task.”（最终实现仍用 1.0，§6 原句）“Therefore, setting proper balancing weights in multi-task learning remains challenging. For simplicity, we adopt the default weight of 1.0 for both 3D occupancy and flow losses in our final implementation.”
- 表 7（附录 §6，TABLE 7；逐行照抄；原表 “Planning” 跨 L2/Col. 两列，两行表头）：

| # | Occ. Weight | Flow Weight | 3D Occ. RayIoU ↑ | Occ. Flow mAVE ↓ | Planning L2 ↓ | Planning Col. ↓ | QA Acc. ↑ |
| --- | --- | --- | --- | --- | --- | --- | --- |
| I | 0.2 | 0.2 | 48.1 | 0.57 | 0.46 | 0.19 | 61.1 |
| II | 0.5 | 0.5 | 49.3 | 0.54 | 0.49 | 0.40 | 60.9 |
| III | 1.0 | 1.0 | 49.3 | 0.51 | 0.50 | 0.38 | 60.7 |

- 隐藏层重要性权重（附录 §6，表 8–9）：Qwen2.5-0.5B 共 25 个隐藏状态（含输入 embedding，索引 0）、Qwen2.5-3B 共 37 个；两表为全量 Index/Weight 列表，本笔记逐格照抄解析结果（表 8 每行 3 对 Index|Weight，索引 14 之后第三对为空；表 9 每行 3 对且对间夹一空列，索引 12 之后与 35 之后有空位；空位均照抄）。要点（§6 原句）：深层权重更大趋势引句见 §2.3；最大值：0.5B 为 index 23 的 0.0477，3B 为 index 36 的 0.0331。

| Index | Weight | Index | Weight | Index | Weight |
| --- | --- | --- | --- | --- | --- |
| 0 | 0.0328 | 10 | 0.0375 | 20 | 0.0463 |
| 1 | 0.0332 | 11 | 0.0381 | 21 | 0.0466 |
| 2 | 0.0337 | 12 | 0.0388 | 22 | 0.0472 |
| 3 | 0.0341 | 13 | 0.0397 | 23 | 0.0477 |
| 4 | 0.0346 | 14 | 0.0409 | 24 | 0.0468 |
| 5 | 0.0350 | 15 | 0.0422 |  |  |
| 6 | 0.0355 | 16 | 0.0435 |  |  |
| 7 | 0.0360 | 17 | 0.0449 |  |  |
| 8 | 0.0365 | 18 | 0.0455 |  |  |
| 9 | 0.0370 | 19 | 0.0458 |  |  |

（表 8，附录 §6，TABLE 8，Qwen-2.5 0.5B；逐格照抄。）

| Index | Weight | (空列) | Index | Weight | (空列) | Index | Weight |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | 0.0254 |  | 13 | 0.0259 |  | 26 | 0.0277 |
| 1 | 0.0251 |  | 14 | 0.0260 |  | 27 | 0.0283 |
| 2 | 0.0251 |  | 15 | 0.0261 |  | 28 | 0.0287 |
| 3 | 0.0252 |  | 16 | 0.0262 |  | 29 | 0.0294 |
| 4 | 0.0253 |  | 17 | 0.0263 |  | 30 | 0.0297 |
| 5 | 0.0252 |  | 18 | 0.0264 |  | 31 | 0.0303 |
| 6 | 0.0253 |  | 19 | 0.0265 |  | 32 | 0.0304 |
| 7 | 0.0254 |  | 20 | 0.0266 |  | 33 | 0.0304 |
| 8 | 0.0255 |  | 21 | 0.0271 |  | 34 | 0.0302 |
| 9 | 0.0255 |  | 22 | 0.0265 |  | 35 | 0.0303 |
| 10 | 0.0256 |  | 23 | 0.0251 |  | 36 | 0.0331 |
| 11 | 0.0257 |  | 24 | 0.0258 |  |  |  |
| 12 | 0.0258 |  | 25 | 0.0267 |  |  |  |

（表 9，附录 §6，TABLE 9，Qwen-2.5 3B；逐格照抄；「（空列）」 为本笔记对原文空表头的标注，原文该列表头为空。）

### 3.4 可视化观察（§4.5；附录 §9）

- 两个观察（§4.5 原句）：“First, regarding scene descriptions, DrivePI demonstrates the ability to understand detailed appearance information (such as “the sky is partly cloudy” ), indicating that the vision encoder effectively preserves critical visual information even when transforming front-view images into Bird’s-Eye-View representation.”（§4.5 原句，含数学）：“Second, we observe strong alignment between coarse-grained and fine-grained predictions. For instance, the object category described linguistically at a coarse level corresponds to the fine-grained 3D occupancy prediction at the grid coordinate”〔(65,136,7)〕
- 附录 §9 为三个场景（剩余静止 / 直行 / 转弯，表 11–13）的定性输出（夜间转弯场景原句：“We also present a challenging nighttime turning scenario in Table 13 , which is typically difficult for VLA models.”），图片部分本笔记跳过。

## 4. 核心结论

- 统一框架结论（§5 原句）：“In this paper, we have presented a novel VLA framework, DrivePI, which achieves both coarse-grained spatial understanding in text formats and fine-grained spatial perception comparable to VA models, thereby inheriting the advantages of both existing VA models and VLA frameworks.”
- 小模型效率结论（§5 原句）：“Notably, our DrivePI employs only a 0.5B parameter LLM as its backbone, demonstrating remarkable efficiency.” 与 “Despite utilizing only a compact 0.5B parameter MLLM backbone, DrivePI with promising text understanding, even outperforms existing VA models in 3D occupancy and occupancy flow while maintaining comparable interactive capabilities with existing VLA-based frameworks in autonomous driving.”（注意此句语法欠通，“DrivePI with promising text understanding, even outperforms” 照原文）
- 作者自述两条局限（§5 Limitations 原句）：“First, we use a simple multi-task learning strategy to balance loss weights across tasks, which may not be optimal to obtain the best trade-off between competing objectives. Second, we do not incorporate reinforcement learning techniques that could enhance reasoning capabilities through trial-and-error learning, particularly for complex planning scenarios.”
- 读表注意（笔记作者提示，非论文原句）：表 4 的 46.0 RayIoU 来自「仅在 Occ3D 单任务上训练」的 DrivePI*（caption 星号明示），不能与统一模型混读；表 2 中 DrivePI 无 ego status 行的碰撞率 0.38% 明显差于有 ego status 行的 0.11%，而其 caption 声称默认不用 ego status 是为避免 shortcut learning——对比 OmniDrive/ORION/OpenDriveVLA-7B 均为 ego status ✓ 行，跨行比较需注意该设定差异。

------

## TODO

- 配图：未抓取/未转存（Figure 1–4 与表 11–13 的可视化图片均跳过）；如需配图应放 `assets/DrivePI/`（目录不存在，待用户决定）。
- 开源跟踪：README 承诺 “trained models and all associated benchmarks will be available within a week!”（2026-03-21 起），checkpoints 与数据集尚未发布（本次抓取 TODO 未勾选）；仓库无 license，复现前需关注。
- 未逐字核对 PDF 与 HTML 的正文差异（引文一律以 HTML v1 为准）；两者参考文献编号存在局部偏移（见核验块），后续引用文献编号时务必核对版本。
- CVPR 2026 camera-ready 版若增删内容（如 ORION/FB-OCC 数字或附录），本笔记需重对。

## 表格核验与引文自查（2026-11-02）

- 来源：arXiv abs 页 https://arxiv.org/abs/2512.12799 （title/dateline/无 Comments 逐字核对）；全文 HTML https://arxiv.org/html/2512.12799v1 （LaTeXML）；GitHub API https://api.github.com/repos/happinesslz/DrivePI 与 raw README https://raw.githubusercontent.com/happinesslz/DrivePI/main/README.md ；全部为本次实际抓取。
- 表格核验：本笔记表 1–9 转抄自 HTML 解析结果（`ltx_table` figure 块逐 `<tr>/<td>` 解析），已用脚本逐单元格比对通过：表 1（10 行×8 列）/表 2（11 行数据×11 列，含跨列表头）/表 3（8 行×7 列）/表 4（8 行×6 列）/表 5（3 行×8 列，Planning 跨列）/表 6（6 行×13 列，Model Size rowspan）/表 7（3 行×8 列）/表 8（10 行，25 个权重值）/表 9（13 行，37 个权重值）。表 10–13 为 prompt/定性可视化表，图片格在 HTML 中为空位，未逐行转抄，仅摘录并核验文字行（§2.2、§3.4 所引）。PDF 侧抽查（EMC2 教训执行方式）：pdftotext 提取后核对 Table 1–13 全部在 PDF 中、无 HTML 缺失的 PDF 专属表，表 1/表 3 数值与 HTML 逐格一致（见核验块）。
- 引文核验：本笔记所有引号内文本均经脚本与抓取 HTML 的去标签规范化文本做子串匹配验证存在（「〔…〕」处按数学元素 alttext 还原匹配，引号内层嵌的弯引号照抄）；原文拼写/语法异常点（“reuslts”、“3D Ocuupancy”、“that arises”、“point clouds contains”、“we not use”、“first,” 小写句首、“MLLM’s input hidden states” 弯引号、表 2 ST-P3 空引用 “[]”、§6 “DrivePI with promising text understanding, even outperforms”）均逐一在规范化文本中确认后照抄。
- 数字抽查：Abstract 头条数字（2.5% / 0.37%→0.11% / 10.3 RayIoU / 0.591→0.509 / 0.72m→0.49m）与表 1–3 对应格逐个对照一致；OpenDriveVLA-0.5B/3B/7B 行（表 3）与库内 nightshift/drafts/OpenDriveVLA.md TABLE II 对应列逐格一致；OpenDriveVLA-7B 规划行（表 2）与库内 OpenDriveVLA.md TABLE I 的 UniAD 协议八列（0.20/0.58/1.21/0.66 与 0.00/0.22/0.55/0.25）逐格一致（本次对照核验）。
