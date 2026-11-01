# AutoVLA: A Vision-Language-Action Model for End-to-End Autonomous Driving with Adaptive Reasoning and Reinforcement Fine-Tuning

**出处会议：** NeurIPS 2025（arXiv abs 页 Comments 原文 "NeurIPS 2025; Website link"；GitHub 仓库标题含 "[NeurIPS 2025]"；README News: "2025/09 : AutoVLA is accepted by NeurIPS 2025"）
**是否开源：** https://github.com/ucla-mobility/AutoVLA （本次实际抓取确认存在；README 原句 "This is the official implementation of the paper: AutoVLA: A Vision-Language-Action Model for End-to-End Autonomous Driving with Adaptive Reasoning and Reinforcement Fine-Tuning"；News 原句 "2026/05 : AutoVLA checkpoint is now released."、"2026/02 : AutoVLA codebase is now released."；Release Plan 中 "TBD : Reasoning data (Pending approval from the data provider)"；仓库含 LICENSE 文件，license badge 图片链接为 "License-Academic_Software_License-blue"（即 Academic Software License 徽章），GitHub license 识别 spdxId 为 NOASSERTION）
**关键词：** 端到端自动驾驶、vision-language-action (VLA)、自回归生成、物理动作 token 化（K-disk codebook, K=2048）、快/慢思考（fast/slow thinking）、CoT 推理数据自动标注、GRPO 强化微调（RFT）、NAVSIM/nuPlan、Waymo E2E、nuScenes、CARLA Bench2Drive

> 来源与核验（抓取日期 2026-11-02）：
> - arXiv abs 页 https://arxiv.org/abs/2506.13757 ，标题 "AutoVLA: A Vision-Language-Action Model for End-to-End Autonomous Driving with Adaptive Reasoning and Reinforcement Fine-Tuning"，主题为端到端自动驾驶 VLA，与任务给定名称与主题均吻合，允许使用。作者：Zewei Zhou, Tianhui Cai, Seth Z. Zhao, Yun Zhang, Zhiyu Huang, Bolei Zhou, Jiaqi Ma（v1 2025-06-16，v2 2025-10-26，v3 2025-11-05）。
> - 歧义检查：arXiv API 检索标题 "AutoVLA"（http://export.arxiv.org/api/query?search_query=ti:%22AutoVLA%22&max_results=20 ，本次抓取）仅命中此一篇（2506.13757v3），无同名异文。
> - 全文 arXiv 官方 HTML v3 https://arxiv.org/html/2506.13757v3 （LaTeXML 渲染，本次抓取）。以下 locator（§x / Table x / Fig. x / Appendix A-G / Eq. Sx）均指该 v3 的章节、表格与公式编号；引号为本次实际抓取文本的逐字摘录；HTML 内夹带的粗体/等宽 span（如 AutoVLA、trainval、nuX 等词被 span 包裹）在摘录句中按渲染文本还原，均以片段 grep 验证存在；LaTeX 数学数值按该渲染的 alttext 记录（如 λ_a=1、λ_cot=40、β=0.04、δ=0.05、γ=2×10⁻³、L_tol=400、λ_r=0.3、δ=2、κ=10）。方括号编号（如 [21]、[51]）为该版参考文献编号，照抄未改。
> - GitHub 仓库 https://github.com/ucla-mobility/AutoVLA 本次实际抓取确认存在（页面 title 原文 "GitHub - ucla-mobility/AutoVLA: [NeurIPS 2025] AutoVLA: A Vision-Language-Action Model for End-to-End Autonomous Driving with Adaptive Reasoning and Reinforcement Fine-Tuning · GitHub"）。
> - 本笔记为草稿（nightshift/drafts/），未经用户核阅前所有结论均属"论文声称 / 尚未独立验证"。

------

## 1. 概述

- 论文动机：当前 VLA 驾驶模型的三类问题（Abstract 原句）："However, current VLA models often struggle with physically infeasible action outputs, complex model structures, or unnecessarily long reasoning."
- 论文核心主张：单个自回归模型统一推理与动作生成（Abstract 原句；"AutoVLA" 一词在 HTML 中被粗体 span 包裹，引文按渲染文本）："we propose AutoVLA, a novel VLA model that unifies reasoning and action generation within a single autoregressive generation model for end-to-end autonomous driving." 输入输出（Abstract）："AutoVLA performs semantic reasoning and trajectory planning directly from raw visual inputs and language instructions."
- 两条技术路线（Abstract）："We tokenize continuous trajectories into discrete, feasible actions, enabling direct integration into the language model." 与 "For training, we employ supervised fine-tuning to equip the model with dual thinking modes: fast thinking (trajectory-only) and slow thinking (enhanced with chain-of-thought reasoning)."
- 现有 VLA 的两个具体限制（§1，Fig. 2 给出四范式对比）：
  1. "Physically-infeasible or complex structure for action generation"（§1 小标题原文）——直接用 VLM 生成文本动作/waypoint 会物理不可行且 mode collapse；引入 meta-action 或 latent token 又"either break the end-to-end optimization paradigm or increase model complexity and training overhead"（§1）。
  2. "Inflexible and inefficient reasoning across diverse scenarios"（§1 小标题原文）——多数模型推理策略固定；DriveVLM 虽为双过程，但 "it relies on separate modules (i.e., a VLM for slow reasoning and a conventional end-to-end model for fast responses)"（§1）。
- 训练分两阶段（§3 总述）：1) SFT——GT 轨迹数据 + 从大 VLM 蒸馏的推理数据；2) RFT——任务特定奖励函数优化规划性能，同时"improving the running efficiency by minimizing unnecessary reasoning"（§3）。
- RFT 定位（§1）："We propose an RL-based post-training method using GRPO to enable adaptive reasoning and further enhance the model's performance on end-to-end driving tasks."（贡献 2 原句）
- 评测覆盖（Abstract）："Extensive experiments across real-world and simulated datasets and benchmarks, including nuPlan, nuScenes, Waymo, and CARLA, demonstrate the competitive performance of AutoVLA in both open-loop and closed-loop settings."
- 相关工作定位（§2）：RFT 在端到端 VLM/VLA 驾驶中的应用尚早（§2 原句）："However, the application of RFT in end-to-end VLM/VLA-based autonomous driving remains nascent." 此前方法（如 AlphaDrive）"are still limited to simplified settings involving only high-level meta-actions"（§2）；本文与之相对："In our work, we integrate a physical action codebook for vehicle motion into a pretrained VLM to effectively bridge the semantic reasoning and physical action space."（§2）
- ⚠ 措辞提示：§1 声称 "Experimental results demonstrate that AutoVLA achieves superior performance across various end-to-end autonomous driving benchmarks under both open-loop and closed-loop tests."，但正文对 NAVSIM 的总结是 "Overall, AutoVLA achieves competitive results while demonstrating scalability across diverse datasets."（§4.2）；且 Table 1 中 Post-RFT PDMS（89.11）低于 TrajHF（93.95）、Centaur（92.10）、Hydra-MDP（91.26），Table S2 nuScenes 上低于 EMMA 与 OpenDriveVLA-3B 的多项指标（见 3.4/3.6 节逐字行）。引用本文结果时建议用"competitive / 部分基准第一"而非笼统"SOTA"。

## 2. 方法

### 2.1 总体框架与输入输出（§3.1）

- 框架两组件（§3）：1) VLM Backbone（统一自回归 Transformer decoder，输出推理与动作 token）；2) Physical Action Token Generation（扩展语言模型 decoder 输出物理动作 token，"These tokens are designed to comply with physical constraints and can be reliably translated into physically feasible planning trajectories."，§3）。
- 输入（§3.1）：三路 RGB 相机（"we utilize three RGB cameras positioned at the front, front-left, and front-right sides of the vehicle"，§3.1），每路 4 帧 @2 Hz（"captures four sequential frames at a frequency of 2 Hz"，含当前帧与前 3 帧）；高层导航指令（如 Turn Left / Go Straight）；ego 状态 "encompasses current velocity, acceleration, and historical actions"（§3.1）。
- 骨干（§3.1）："We adopt Qwen2.5-VL-3B [21] as the vision-language backbone of AutoVLA." 选 3B 的理由："The 3B variant offers a good trade-off between efficiency and performance, making it suitable for deployment in onboard devices."（§3.1）

### 2.2 动作 token 化（§3.1，Appendix A）

- 连续轨迹 P∈R^{τ×d} 离散为 token 序列，每个 token 为短时程空间位移+朝向变化 (Δx, Δy, Δθ)（§3.1："each token is represented by short-term spatial position and heading movement"）。意义（§3.1 原句）："This transforms the planning task into a next-token prediction problem, which can be conducted within the language model."
- codebook 构建（§3.1）：原句 "We build our action codebook … using a K-disk clustering method [88, 89, 90], which covers the majority of vehicle movement patterns."（省略号处为原文公式 𝒜={a₁,…,a_K}），K=2048（alttext "K=2048"）；action token 作为附加 token 加入 VLM 词表（§3.1："these action tokens are incorporated into the VLM as additional tokens (i.e., <action_0>, <action_1>, …)"），推理时输出 token 序列再用 codebook 解码成轨迹。
- codebook 数据来源（Appendix A.1）："These tokens are derived from clustering vehicle motion patterns in the Waymo Open Motion Dataset (WOMD) [103], which contains extensive real-world vehicle trajectories."（Appendix A.1）该 codebook "is used across experiments involving multiple real-world datasets, including nuPlan, nuScenes, and Waymo."（Appendix A.1）；仿真另建："we construct a separate action codebook using the same clustering procedure on the CARLA-Garage dataset [55]. This produces another set of 2048 action tokens for simulation testing"（Appendix A.1）。
- K-disk 细节（Appendix A.1）：对 0.5 s 运动段做 K-Disk 聚类，原句 "such that no two segments are within a distance threshold"（其后公式 alttext 为 δ=0.05 m）"measured using average contour distance"。
- 编解码（Appendix A.2）："During training, continuous trajectories are discretized by mapping each 0.5-second segment to its nearest action token in the codebook"；推理时逐 token 取回对应运动段并从当前 ego 位姿顺序拼接，"Therefore, the model reconstructs a continuous trajectory in the ego-centric coordinate frame by composing these local displacements and rotations."（Appendix A.2）

### 2.3 快/慢思考的统一（§3.1）

- 定义（§3.1 原句）："In fast thinking mode, AutoVLA directly predicts physical action tokens without generating long CoT reasoning, enabling rapid responses in straightforward scenarios." 与 "In contrast, slow thinking mode involves structured CoT reasoning, where the model first analyzes the environment, identifies critical elements, and reasons through potential outcomes before deciding on the final driving action."
- 双模式来源（§3.1）："To enable this dual thinking capability, AutoVLA is trained with a mixture of direct action supervision and reasoning-augmented data."（系统提示词与回复格式两种模式各一套）

### 2.4 推理数据自动标注（§3.2，Appendix B）

- 现有驾驶推理数据的三个问题（§3.2 原句）："1) limited scenario diversity and repetitive examples, 2) inadequate representation of critical perceptual cues, such as traffic signs and vehicle indicator signals, 3) low-quality reasoning process, such as repeatedly stopping at a stop sign without justification."
- 方案（§3.2）："we propose an automated reasoning annotation pipeline using the advanced Qwen2.5-VL-72B model [21]." 该 pipeline "enables automatic generation of high-accuracy reasoning annotations and supports knowledge distillation from a large capable model to a more compact target model"（§3.2）。
- 结构化四要素（§3.2）："The pipeline generates structured reasoning annotations across four key components: detailed scene descriptions, identification of crucial objects, prediction of surrounding agents' intentions, and determination of appropriate driving actions."（Appendix B.1 的四步表述为 "1) scene description and analysis, 2) critical object identification and description, 3) intention reasoning of the surrounding objects, and 4) decision-making and meta-action"，两处口径略有差异，均为原文）
- 防幻觉手段（§3.2）："our approach incorporates ground-truth driving actions as hints, guiding the model to produce causal explanations that explicitly link driving decisions to scene context."（Appendix B.1 补充：生成推理文本 token 上限 700）
- 规模（§3.2 原句）："we compile a comprehensive reasoning dataset comprising approximately 45.6k CoT reasoning annotations for the nuPlan dataset and 7.2k annotations for the Waymo end-to-end driving dataset." 另重排整合 DriveLM [96]（nuScenes/CARLA 的 VQA 数据）。
- 人工质检（Appendix B.1）："Human annotators assessed 3,000 randomly selected samples, yielding an overall accuracy of 88.8%, which demonstrates the high reliability of our proposed annotation pipeline."（二元打分：关键对象识别、因果推理、动作决策任一有错即 0 分；错误样本修正或丢弃）
- 标注质量的一个示例性说明（Appendix B.2）："our annotation pipeline can deal with situations where a vehicle already stopped at a stop sign can proceed, rather than remaining stopped indefinitely."

### 2.5 监督微调 SFT（§3.3，Appendix C）

- 输出序列 = 语言 token（推理）+ action token（轨迹）；SFT 数据两种：仅动作 token（快思考，l 为"固定、短的模板"）与 CoT+动作（慢思考）（§3.3）。
- 损失（Eq. 1/2，公式逐字见原文 LaTeX）：L_i^SFT = w_i·(L_LM,i + λ_a·L_action,i)，其中 w_i = λ_cot（GT 含 CoT 时）否则 1。超参（§4.1，alttext）：λ_a=1、λ_cot=40。
- 训练工程（Appendix C）：FSDP、BFloat16 混精度、gradient checkpointing、lr warm-up 500 步、每 2,000 步衰减 2%、5 epochs、梯度裁剪 1.0；输入图像原句 "Images in the video stream are resized to maintain original aspect ratios but reduced to"（其后公式 alttext 为 28×28×128）"pixels"（三路相机 ×4 帧）。

### 2.6 强化微调 RFT / GRPO（§3.4，Appendix D）

- 算法选择（§3.4）："We employ the GRPO algorithm [49], which stabilizes training and improves convergence efficiency." 论证（§3.4）："the inherent multi-modality of planning, characterized by multiple feasible trajectories in the same scenario, naturally aligns with the group-based optimization framework of GRPO"。
- 目标函数 Eq. 3/4（GRPO clip 目标 + KL 正则；组相对优势 A_i=(r_i−mean)/std）；KL 用无偏估计器 Eq. S1；训练流程见 Algorithm 1（对每个场景采样 G 个输出，解码轨迹算奖励，组内标准化后更新）。
- 奖励（§3.4）：原句 "The final reward function is defined as"（其后为公式，Eq. S2：r = r_Driving − λ_r·r_CoT），λ_r 为平衡权重。驾驶奖励按基准切换（§3.4）："For the nuPlan dataset, we employ the Predictive Driver Model Score (PDMS) [51] as the driving reward, which captures aspects such as safety, comfort, travel efficiency, and other driving quality metrics."；Waymo 侧（§3.4）："due to the limited availability of Rater Feedback Score (RFS) annotations [52], we use the Average Displacement Error (ADE) as the driving reward."
- PDMS 构成（Eq. S3）：r_Driving = PDMS = NC × DAC × (5·TTC + 2·C + 5·EP)/12，"where the components include No at-fault Collision (NC), Drivable Area Compliance (DAC), Ego Progress (EP), Comfort (C), and Time-to-Collision (TTC)"（Appendix D.2）；规划器输出失败的场景记 0 分。
- Waymo 奖励（Eq. S4）：r_Driving = (δ−ADE)/κ（δ 为最大位移误差、κ 为缩放因子）。
- CoT 长度惩罚（Eq. S5）：§3.4 原句 "To discourage unnecessary long reasoning chains, we incorporate a CoT length penalty"（其后公式符号为 r_CoT）"into the reward function."，r_CoT 为 sigmoid 函数（Appendix D.2，由推理长度 L、容忍阈值 L_tol、斜率 γ 决定）。
- RFT 实现（§4.1）："For RFT, we employ the LoRA adapter [98] for parameter-efficient training." lr=3×10⁻⁵（alttext）、KL 权重 β=0.04（alttext）；"We perform a single policy update at each step, allowing the use of a simplified objective without the need for clipping or tracking the old policy."（§4.1）；§4.1 原句 "The model is fine-tuned for"（其后公式 alttext 为 6,000）"steps, and the best-performing checkpoint is selected for evaluation."
- RFT 细节（Appendix D.3）："We use the navtrain split of the nuPlan dataset for RFT for the NAVSIM benchmark and the validation split of the Waymo end-to-end driving dataset for the Waymo benchmark."（navtrain/validation 在 HTML 中为等宽 span）；"The vision encoder of pretrained AutoVLA is frozen"；LoRA rank 与 alpha 均为 8、dropout 0.1；γ=2×10⁻³、L_tol=400、λ_r=0.3（"To ensure that the driving reward signal is dominant, the regularization weight is set to a relatively small value"）；Waymo 侧 δ=2、κ=10；GRPO 采样生成参数 temperature 1.0、top-p 1.0、top-k 0.0（alttext）。

## 3. 实验

### 3.1 数据、基准与指标（§4.1，Appendix E）

- 数据集（§4.1 原句要点）：nuPlan (Open-Scene) "contains 120 hours of large-scale driving data with eight streams of camera data and object annotations"；Waymo E2E "comprises 4,021 20-second driving segments with eight streams of camera views and ego vehicle trajectories, especially focusing on challenging and long-tail scenarios, such as driving through construction areas or risky situations"；nuScenes "provides 1,000 urban driving scenes with six camera views"；CARLA-Garage "provides over 500,000 frames of simulation camera data"。推理数据另用 DriveLM（nuScenes/CARLA）重排。
- 基准（§4.1）："Open-loop performance is assessed on two public benchmarks: the NAVSIM benchmark [51] from the nuPlan dataset and the nuScenes benchmark [65]."（[65] 即 UniAD）NAVSIM 用 PDMS（"The NAVSIM benchmark employs PDMS to assess key aspects of driving behavior, such as collision and ego progress"，§4.1）；nuScenes 用 L2 距离与碰撞率（"The nuScenes benchmark uses L2 distance and collision rate as evaluation metrics"，§4.1）；Waymo 用 RFS；闭环在 CARLA 的 Bench2Drive [54]（"Bench2Drive contains 44 interactive, closed-loop scenarios under varying locations and weather conditions"，§4.1，指标为 Driving Score、Success Rate、Efficiency、Comfortness）。
- nuScenes 指标口径（Appendix E.2 原句）："We follow the UniAD protocol, reporting both metrics at 1, 2, and 3 seconds in the future, instead of averaging over the horizons."
- 训练/测试规模（Table S1 逐字行；列：Dataset / Train Samples / Reasoning Samples / Test Samples）：

| Dataset | Train Samples | Reasoning Samples | Test Samples |
| --- | --- | --- | --- |
| nuPlan (NAVSIM) [51] | 166.3k | 45.6k | 12.1k |
| nuScenes [53] | 19.0k | 2.9k | 5.6k |
| Waymo [52] | 23.8k | 7.2k | 1.5k |
| CARLA [96] | 274.5k | 53.2k | – |

- 数据划分补充（Appendix E.1）：nuPlan 从 trainval split 随机采样 45.6k 场景生成推理数据，其余仅轨迹监督；测试用 navtest split（"We randomly sample 45.6k scenarios from the nuPlan trainval split and generate reasoning data using our proposed automated annotation pipeline."，trainval 为等宽 span）。Waymo "provides 2037 training and 479 validation segments"（training/validation 为等宽 span），"The test set comprises 1505 samples."（test 为等宽 span）。

### 3.2 训练与推理配置（§4.1，Appendix E.3/E.4）

- 轨迹设置（§4.1 原句）："Each action token corresponds to 0.5 seconds of movement, and the planning horizon is set to 5 seconds. Consequently, the model outputs 10 action tokens, from which a 5-second trajectory can be decoded."
- SFT 配置（§4.1）：lr=1×10⁻⁵（alttext）、FSDP、"The model is trained for 5 epochs using 8 NVIDIA L40S GPUs. We use a per-GPU batch size of 1 and accumulate gradients over 4 steps, resulting in an effective batch size of 32."（§4.1）
- 主模型（Appendix E.3）："Our primary base model is trained on the mixed training set of the nuPlan and nuScenes datasets."；Waymo 测试用该 base 在 Waymo E2E 上继续微调（Waymo 模型的 ego 状态改用 "a 4-second history of vehicle positions and velocities"）；闭环另训单视角模型（"This model is trained with single-view inputs instead of the multi-view setup used in the primary model"，输入分辨率 28×28×384 pixels，alttext）。
- 推理采样（Appendix E.4）："We employ a stochastic generation strategy using top-p and top-k sampling to generate reasoning and planning outputs."；慢思考用高多样性采样（temperature=1.0、top-p=0.5、top-k=20，alttext）"supports slow thinking modes"；快思考用近确定性采样（temperature=0.1、top-p=0.01、top-k=1）"produce fast thinking, yielding consistent and direct responses"。

### 3.3 NAVSIM (nuPlan) 开环结果（Table 1，§4.2；Table 2；Fig. 5）

Table 1 逐字行（caption: "Testing Results on the NAVSIM (nuPlan) End-to-end Driving Benchmark"；列：Method / PDMS↑ / Collision↑ / Area↑ / Direction↑ / Progress↑ / TTC↑ / Comfort↑）：

| Method | PDMS | Collision | Area | Direction | Progress | TTC | Comfort |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Ego Status MLP | 66.40 | 93.09 | 78.26 | 90.45 | 63.20 | 84.02 | 99.97 |
| TransFuser [58] | 83.88 | 97.78 | 92.63 | 97.97 | 78.88 | 92.89 | 99.98 |
| DRAMA [56] | 86.87 | 98.19 | 95.18 | 98.03 | 81.33 | 94.17 | 100.00 |
| Hydra-MDP [57] | 91.26 | 99.07 | 98.29 | 95.79 | 85.20 | 96.56 | 100.00 |
| Centaur [59] | 92.10 | 99.23 | 98.72 | 96.77 | 85.96 | 97.17 | 99.97 |
| TrajHF [85] | 93.95 | 99.30 | 97.51 | 91.72 | 90.39 | 98.02 | 99.81 |
| AutoVLA (One-shot) | 80.54 | 96.89 | 92.42 | 94.43 | 75.82 | 88.06 | 99.94 |
| AutoVLA (Post-RFT) | 89.11 | 98.41 | 95.64 | 95.40 | 81.87 | 98.04 | 99.94 |
| AutoVLA (Best-of-N) | 92.12 | 99.14 | 97.08 | 95.51 | 87.55 | 97.12 | 99.98 |

- 评测方式（§4.2 原句）："In best-of-N planning, we use an oracle scorer to select the optimal trajectory from six generated candidates."（best-of-N 用 oracle 打分器，非纯在线能力）
- 正文总结（§4.2）："After RFT, AutoVLA demonstrates significantly improved performance, aligning more closely with the NAVSIM reward signal. The best-of-N strategy further enhances performance, achieving the highest PDMS. Overall, AutoVLA achieves competitive results while demonstrating scalability across diverse datasets."
- RFT 增益（§4.2 原句）："RFT yields a 10.6% improvement in PDMS (on the NAVSIM testing set) and a 66.8% reduction in runtime (average over 500 testing scenarios)."（RFT 作用于全量 CoT 数据的 SFT 模型）
- 快慢思考运行时（Table 2 逐字行，caption: "Runtime Analysis of Fast & Slow Thinking Modes in AutoVLA"；单位 s）：

| Thinking Mode | Min. (s) | Max. (s) | Avg. (s) |
| --- | --- | --- | --- |
| Fast Thinking | 0.997 | 1.116 | 1.072 |
| Slow Thinking | 7.607 | 13.706 | 10.518 |

- GRPO 组大小（§4.2）："Experiments with different GRPO group sample sizes indicate that larger groups lead to better performance by promoting broader exploration of training samples."（具体组大小取值在 Fig. 5(b) 中，本笔记未抄）
- SFT vs RFT 定性对比（§4.2）："A qualitative comparison shows that the SFT model produces suboptimal plans due to error accumulation in generation, whereas the RFT model (optimized via PDMS-based reward) generates better trajectories."

### 3.4 Waymo E2E 结果（Fig. 6；Table S3；Table S4，Appendix F.3）

- 训练设置（Appendix F.3）："To overcome the limited size of the Waymo end-to-end driving dataset, we augment the training data with samples from the nuPlan and nuScenes datasets. For convenience, we refer to this combined dataset as nuX."（nuX 为粗体 span）；RFT 奖励选择："Given the limited number of RFS-labeled samples (only 480 in the validation set), we adopt the average displacement error (ADE) as the primary reward signal."（Appendix F.3）
- 正文结论（§4.2 原句）："The results reveal that pretraining on a combination of nuPlan and nuScenes datasets significantly enhances performance, suggesting enhanced scene understanding through exposure to more diverse training data. Incorporating CoT reasoning in training further improves planning performance compared to action-only training. Post-training with RFT, using ADE as the reward function, achieves the best overall RFS metric."
- 排行榜（Table S3 逐字行，caption: "Waymo Vision-based End-to-End Driving Challenge Leaderboard"；正文限定 "As of May 22, 2025"；列：Method Name / RFS (Overall)↑ / ADE at 5s (Overall)↓ / ADE at 3s (Overall)↓ / RFS (Spotlight)↑；此处仅摘录前 5 行与 OpenEMMA 行，其余行略，见原文）：

| Method Name | RFS (Overall) | ADE at 5s (Overall) | ADE at 3s (Overall) | RFS (Spotlight) |
| --- | --- | --- | --- | --- |
| Poutine | 7.9860 | 2.7419 | 1.2055 | 6.8929 |
| HMVLM | 7.7367 | 3.0715 | 1.3269 | 6.7269 |
| UniPlan | 7.6925 | 2.9864 | 1.3083 | 6.6544 |
| DiffusionLTF | 7.5919 | 2.9768 | 1.3605 | 6.5688 |
| AutoVLA | 7.5566 | 2.9580 | 1.3507 | 6.9436 |
| …（中略） | | | | |
| LightEMMA | 6.5169 | 3.7395 | 1.7052 | 5.7103 |
| OpenEMMA | 5.1575 | 12.4755 | 6.6842 | 4.7131 |

- 论文对排名的表述（Appendix F.3 原句）："The model ranks highly in both RFS Overall and ADE metrics and achieves the top score in the RFS Spotlight metric, which focuses on the most challenging scenarios."（事实核对：按上表，RFS Overall 7.5566 低于 Poutine/HMVLM/UniPlan/DiffusionLTF 四行，RFS Spotlight 6.9436 为所列 17 行中最高；"ranks highly" 为论文自述措辞）
- 训练设置消融（Table S4 逐字行，caption: "Ablation Study on the Waymo End-to-End Driving Test Set"；列：Camera / Pretraining / Output / RFS (Overall)↑ / ADE at 5s↓；末行 "Post-RFT" 在原表中跨前三列合并）：

| Camera | Pretraining | Output | RFS (Overall) | ADE at 5s |
| --- | --- | --- | --- | --- |
| Front | None | Action-only | 6.938 | 3.595 |
| Front | None | CoT-enhanced | 7.127 | 3.188 |
| Multi | None | Action-only | 7.239 | 3.243 |
| Multi | None | CoT-enhanced | 7.283 | 3.182 |
| Multi | nuX | Action-only | 7.406 | 3.116 |
| Multi | nuX | CoT-enhanced | 7.447 | 3.115 |
| Post-RFT（跨前三列合并） | | | 7.557 | 2.958 |

- 消融总结（Appendix F.3）："The results indicate that multi-camera input consistently enhances driving performance." 与 "RFT can significantly improve planning performance by mitigating error accumulation in generation and aligning with the task-specific rewards."

### 3.5 CARLA 闭环结果（Table 3，§4.2；Appendix F.4）

Table 3 逐字行（caption: "Testing Results on the Bench2Drive (CARLA) Closed-loop Driving Benchmark"；列：Method / Driving Score↑ / Success Rate (%)↑ / Efficiency↑ / Comfortness↑）：

| Method | Driving Score | Success Rate (%) | Efficiency | Comfortness |
| --- | --- | --- | --- | --- |
| AD-MLP [99] | 18.05 | 0.00 | 48.45 | 22.63 |
| UniAD-Base [65] | 45.81 | 16.36 | 129.21 | 43.58 |
| VAD [66] | 42.35 | 15.00 | 157.94 | 46.01 |
| TCP-traj [100] | 59.90 | 30.00 | 76.54 | 18.08 |
| DriveAdapter [101] | 64.22 | 33.08 | 70.22 | 16.01 |
| Orion [42] | 77.74 | 54.62 | 151.48 | 17.38 |
| AutoVLA | 78.84 | 57.73 | 146.93 | 39.33 |

- 正文结论（§4.2 原句）："The results, shown in Table 3, demonstrate that AutoVLA outperforms existing end-to-end driving models in terms of overall driving score and success rate in the closed-loop test."（事实核对：Driving Score 78.84 与 Success Rate 57.73 为表内最高；Efficiency 146.93 低于 VAD 157.94 与 Orion 151.48，Comfortness 39.33 低于 UniAD-Base 43.58 与 VAD 46.01）
- 闭环部署细节（Appendix F.4）："The replanning frequency is set to 2 Hz, meaning the AutoVLA model is queried every 0.5 seconds in simulation"（CARLA 模型单视角输入；"AutoVLA predicts a five-second trajectory, which is then used by a PID controller to compute the control actions (throttle, brake, and steering) that are applied to the vehicle."，Appendix F.4）

### 3.6 nuScenes 开环结果（Table S2，Appendix F.1）

Table S2 逐字行（caption: "Testing Results of AutoVLA on the nuScenes Planning Benchmark"；列序：ST-P3 metrics 的 L2 (m)↓ 1s/2s/3s/Avg. 与 Collision (%)↓ 1s/2s/3s/Avg.，再 UniAD metrics 同 8 列；"-" 为原文空缺）：

| Method | L2 1s | 2s | 3s | Avg. | Col. 1s | 2s | 3s | Avg. | L2 1s | 2s | 3s | Avg. | Col. 1s | 2s | 3s | Avg. |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| （口径） | ST-P3 metrics | | | | | | | | UniAD metrics | | | | | | | |
| ST-P3 [14] | 1.33 | 2.11 | 2.90 | 2.11 | 0.23 | 0.62 | 1.27 | 0.71 | - | - | - | - | - | - | - | - |
| VAD [66] | 0.17 | 0.34 | 0.60 | 0.37 | 0.07 | 0.10 | 0.24 | 0.14 | - | - | - | - | - | - | - | - |
| UniAD [65] | 0.44 | 0.67 | 0.96 | 0.69 | 0.04 | 0.08 | 0.23 | 0.12 | 0.48 | 0.96 | 1.65 | 1.03 | 0.05 | 0.17 | 0.71 | 0.31 |
| EMMA [37] | 0.14 | 0.29 | 0.54 | 0.32 | - | - | - | - | - | - | - | - | - | - | - | - |
| OpenEMMA [44] | 1.45 | 3.21 | 3.76 | 2.81 | - | - | - | - | - | - | - | - | - | - | - | - |
| OpenDriveVLA-3B [34] | 0.14 | 0.30 | 0.55 | 0.33 | 0.02 | 0.07 | 0.22 | 0.10 | 0.19 | 0.58 | 1.24 | 0.67 | 0.02 | 0.18 | 0.70 | 0.30 |
| AutoVLA (action only) | 0.22 | 0.39 | 0.61 | 0.41 | 0.10 | 0.17 | 0.28 | 0.18 | 0.29 | 0.67 | 1.17 | 0.71 | 0.15 | 0.34 | 0.56 | 0.35 |
| AutoVLA (w/ CoT) | 0.21 | 0.38 | 0.60 | 0.40 | 0.13 | 0.18 | 0.28 | 0.20 | 0.28 | 0.66 | 1.16 | 0.70 | 0.14 | 0.25 | 0.53 | 0.31 |

- 论文自述（Appendix F.1）："As shown in Table S2, our model demonstrated competitive performance in the nuScenes planning benchmark."
- 推理在 nuScenes 上无量化收益的解释（Appendix F.1 原句）："However, it can be observed that many nuScenes scenarios are relatively straightforward, often not requiring complex reasoning. This may explain the lack of performance gain in quantitative metrics when reasoning is introduced."
- ⚠ 事实核对：ST-P3 口径下 AutoVLA (w/ CoT) 的 L2/碰撞（Avg. 0.40/0.20）优于 ST-P3、OpenEMMA，但劣于 VAD（0.37/0.14）与 EMMA（L2 0.32，无碰撞列）；UniAD 口径下（Avg. L2 0.70、Col. 0.31）与 UniAD（1.03/0.31）相比 L2 更好、碰撞持平，但劣于 OpenDriveVLA-3B（0.67/0.30）。上表逐字行为准，注意口径分组。

### 3.7 数据 scaling 与 CoT 的作用（Fig. 4，§4.2）

- 设置（§4.2 原句）："We train AutoVLA on a mixture of the nuPlan and nuScenes datasets with varying training set sizes (10k, 50k, 100k, and the full 185k samples), with action-only supervision or with additional CoT reasoning supervision."（具体数值在 Fig. 4 曲线图中，本笔记未抄数值）
- 总趋势（§4.2）："We observe that increasing the amount of training data consistently improves planning performance on both datasets."
- CoT 的条件性收益（§4.2 原句）："In the nuPlan dataset, when using fewer than 50k training samples, CoT reasoning does not outperform action-only in terms of PDMS and Collision Score. This is likely due to the increased difficulty of learning structured reasoning from limited data." 数据加大后（§4.2）："as the training set size increases, models trained with CoT reasoning surpass those with action-only supervision, highlighting the scalability advantages of reasoning-augmented learning." nuScenes 上 "A similar trend is observed"（L2 与碰撞率同趋势）。

### 3.8 动作 token 化消融（Table 4 / 5 / 6，§4.3）

Table 4 逐字行（caption: "Action Tokenization Accuracy with Different Codebook Sizes and Methods. (DCT: discrete cosine transform; MC: movement coverage; CU: codebook usage. Bold indicates best performance, underline the second-best, and tilde the third-best.)"；RT-1/FAST/K-disk 各给 ADE(m)↓、FDE(m)↓，另 MC↑、CU↑）：

| Codebook Size | RT-1 ADE | RT-1 FDE | FAST ADE | FAST FDE | K-disk ADE | K-disk FDE | MC | CU |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 256 | 0.1440 | 0.2942 | 0.1708 | 0.2137 | 0.0687 | 0.1034 | 86.47% | 100.0% |
| 1024 | 0.1052 | 0.1883 | 0.0522 | 0.0588 | 0.0253 | 0.0282 | 97.41% | 100.0% |
| 2048 | 0.1014 | 0.1775 | 0.0281 | 0.0309 | 0.0182 | 0.0203 | 99.42% | 100.0% |
| 4096 | 0.1001 | 0.1739 | 0.0149 | 0.0161 | 0.0141 | 0.0155 | 100.0% | 91.46% |

- 各方法要点（§4.3）："For RT-1, acceleration and steering rate are discretized using uniform action bins, and a kinematic model is employed to reconstruct the trajectory."（因只有轨迹级数据、控制量需间接推断，重建误差最高）；FAST 对 codebook 大小更敏感，仅在 K=4096 时精度可比；"our proposed method consistently attains the highest reconstruction accuracy across all codebook sizes"（§4.3）。
- K=2048 的选择依据（§4.3）：原句 "As the codebook size increases beyond …, the improvements in tokenization accuracy and movement coverage become marginal, while codebook usage decreases as many tokens remain redundant and unused." 与 "Considering this trade-off, we select … to balance reconstruction accuracy, movement coverage, and efficient codebook usage."（两处省略号处均为公式 K=2048，alttext）

Table 5 逐字行（caption: "Influence of Physical Action Tokenization"；同批 nuPlan+nuScenes 混合数据训练的开环对比）：

| Metric | Text Waypoint | Physical Action |
| --- | --- | --- |
| PDM Score↑ | 71.31 | 80.54 |
| Avg. L2 (m)↓ | 0.89 | 0.70 |
| Avg. Col. (%)↓ | 0.36 | 0.31 |
| Runtime (s)↓ | 7.65 | 3.95 |

- 正文（§4.3）："The results, shown in Table 5, indicate that our action tokenization and generation method significantly outperforms the text-based waypoint prediction approach." 数字解码开销（§4.3）：原句 "Additionally, due to the need to decode … numerical values, the text-based method incurs a substantially higher computational cost in generating the final trajectory."（省略号处为轨迹符号公式）"This shows the limitation of language models in handling precise numerical reasoning."

Table 6 逐字行（caption: "Performance Comparison across Different Tokenization Methods on NAVSIM"）：

| Tokenization | PDMS↑ | Collision↑ | Progress↑ |
| --- | --- | --- | --- |
| FAST (DCT) [91] | 67.63 | 92.74 | 64.09 |
| K-disk (Ours) | 80.54 | 96.89 | 75.82 |

- 正文（§4.3）："Our proposed method outperforms FAST." 原因（§4.3）："In FAST, the discrete cosine transform converts fixed-horizon planning trajectories into variable-length token sequences, complicating the selection of appropriate token lengths and making fixed-horizon planning difficult."

## 4. 核心结论

1. 论文声称：用单个自回归 VLA 模型（Qwen2.5-VL-3B + 2048 动作 codebook）统一场景推理与轨迹生成，配合"SFT 双模式数据 + GRPO 强化微调"可在真实与仿真、开环与闭环多基准上取得 competitive 表现（Abstract；§4；Table 1/3/S2/S3）。注意此为论文声称、尚未独立验证。
2. 快/慢思考的代价差约一个数量级：平均单次推理 Fast 1.072 s vs Slow 10.518 s（Table 2）；RFT 以 CoT 长度惩罚削减不必要推理，换来 PDMS +10.6%、运行时 −66.8%（500 测试场景平均；§4.2，Fig. 5(a)）。这是本文区别于固定 CoT 的 VLA（如 EMMA 类）与双模块双过程方案（如 DriveVLM）的核心卖点。
3. 物理动作 token 化优于文本 waypoint 输出：PDM Score 80.54 vs 71.31、Avg. L2 0.70 vs 0.89 m、Runtime 3.95 vs 7.65 s（Table 5）；token 化方案中 K-disk 优于 RT-1 动作分桶与 FAST DCT（Table 4/6）。论文归因见 §4.3 原句："This shows the limitation of language models in handling precise numerical reasoning."
4. CoT 推理数据的收益依赖数据规模：nuPlan 上 <50k 样本时 CoT 不优于 action-only，全量 185k 时反超（§4.2，Fig. 4）；Waymo 消融中 CoT-enhanced 一致优于 Action-only（Table S4，RFS 7.127 vs 6.938 等四组）；但 nuScenes 上 w/ CoT 的碰撞率（0.20）反而高于 action-only（0.18）（Table S2），论文解释是该基准场景偏简单（Appendix F.1）。
5. 局限（§5 原句）："Although our model with dual-process adaptation achieves near-real-time inference (1 Hz), it remains highly GPU-dependent, requiring significant memory and computing. Future work will focus on real-time applications, optimizing runtime efficiency, and reducing computation overhead (e.g., through model quantization) to enable real-time deployment." 另注意：best-of-N 结果依赖 oracle 打分器（§4.2）；推理数据（45.6k nuPlan + 7.2k Waymo CoT 标注）未随代码开源（GitHub README Release Plan: "TBD : Reasoning data (Pending approval from the data provider)"）。
6. 评价语境：各基准指标口径不同——NAVSIM PDMS（开环，含 NC/DAC/TTC/C/EP 子项，Eq. S3）、Waymo RFS（人评轨迹匹配 trust region，Appendix E.2）、nuScenes 开环 L2/碰撞率（ST-P3 与 UniAD 两种协议并存，Table S2）、Bench2Drive 闭环四指标。跨基准比较时注意口径。

------

## TODO

- 配图：按任务要求本次跳过，未建 `library/AutoVLA/assets/` 目录。定稿入库时需补 Fig.1（框架总览）、Fig.2（VLM 四范式）、Fig.3（训练流程）、Fig.4（数据 scaling 曲线）、Fig.5（RFT 前后对比与奖励曲线）、Fig.S1（codebook 可视化）、Fig.S2（标注 pipeline）截图，并确认 assets 路径约定。
- Fig.4 与 Fig.5(a)(b) 中的具体数值（scaling 各点 PDMS/L2、GRPO 组大小取值等）在图中，本笔记未抄录；如需引用须读图核对。
- Table S3（Waymo leaderboard）原文表中出现两行同名 "DriveTraj"（RFS Overall 7.4957 与 7.2787），本笔记照抄未做合并/解释，是否为同一方法两次提交未核实。
- 本笔记全部依据 arXiv v3（2025-11-05）；v1（2025-06-16）与 v2/v3 的差异未比对。
- GitHub README 所称 codebase（2026/02）与 checkpoint（2026/05）发布仅据 README News 原句，未抓取 release/assets 页面核实具体内容与许可条款（LICENSE 为 Academic Software License，GitHub 识别为 NOASSERTION，商用受限）。
- 正文 §1 的 "superior performance" 与各表中"非第一"的出入（见 1 节 ⚠ 与 3.4/3.6 节事实核对），如后续建 claim 卡建议只围绕单一可证伪数字（如 Table 1 Post-RFT PDMS 89.11）表述。
