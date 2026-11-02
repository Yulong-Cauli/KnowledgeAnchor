# [cross] 六篇 VLA 线横向对比（UniAD / AutoVLA / OpenVLA / OpenDriveVLA / Alpamayo-R1 / DrivePI）

- 日期：2026-11-03
- 性质：TODO 候选池对比素材。只记录方法路线、模态/输出表示、数据规模、基准与指标口径、结论之间的互相支持 / 矛盾 / 单源情况，**不下【谁更好】的评价性结论**。
- 引用规则：所有数字与结论均为各笔记所录论文声称，**尚未独立验证**。标记约定：「…」= 从笔记逐字复制的引文（本次 `grep -cF` 固定字符串验证，见附录 A）；【…】= 笔记小节标题或本文概括标签（非引文）；R/S/C/M 编号 = 本报告自定条目号。
- 原文复核记录（本报告新增，均为 2026-11-03 抓取 arXiv 官方 HTML 并去标签后 `python3` 子串匹配，命中计数见各条）：
  - UniAD v2：https://arxiv.org/html/2212.10156v2 —— Table 7 UniAD 行（0.48/0.96/1.65/1.03 + 0.05/0.17/0.71/0.31）、ST-P3 行、"We adopt the same metrics as in ST-P3"、Table 13 行（125.0M/1709G/1.8）各 1 命中（§3-A1）
  - AutoVLA v3：https://arxiv.org/html/2506.13757v3 —— Table S2 的 OpenDriveVLA-3B 行与 AutoVLA (w/ CoT) 行、"We follow the UniAD protocol…" 句、Table 1 Post-RFT 行（89.11）、Table 3 Bench2Drive 行（78.84/57.73）各 1 命中（§3-A2）
  - OpenVLA v3：https://arxiv.org/html/2406.09246v3 —— Abstract 16.5% 句、Table 1 LoRA rank=32 行（68.2）、Table 2 int4 行（71.9）、970k 句、21,500 A100-hours 句各 1 命中（§3-A3）
  - OpenDriveVLA v2：https://arxiv.org/html/2503.23463v2 —— TABLE I 的 UniAD 行、Ego-MLP 行、OpenDriveVLA-0.5B/7B 行、"average L2 error of 0.66m" 句各 1 命中（§3-A4）
  - Alpamayo-R1 v2：https://arxiv.org/html/2511.00088v2 —— TABLE 9 SFT 行（2.12m/3.1/0.62/6.9）与全奖励行（1.94m/4.4/0.83/3.7）、TABLE 10 10B 行（0.849/4.0/16.0/0.72）、"12% improvement over the trajectory-only baseline (0.994m)" 句、700K CoC 句、§2.1 对 OpenDriveVLA/AutoVLA 的引用句各 1 命中（§3-A5）
  - DrivePI v1：https://arxiv.org/html/2512.12799v1 —— 表 2 的 OpenDriveVLA-7B 行（0.20/0.58/1.21/0.66 + 0.00/0.22/0.55/0.25）、OmniDrive 行、ORION 行、DrivePI 两行、表 3 的 DrivePI 行（60.7）与 OpenDriveVLA-7B QA 行（58.2）、"does not incorporate ego status during training by default to avoid potential shortcut learning" 句各 1 命中（§3-A6）
- 来源笔记（均为本地文件，只读）与卡况：
  - UniAD：`library/ADe2e/UniAD.md`（CVPR 2023 最佳论文，arXiv:2212.10156，开源）
  - AutoVLA：`library/ADe2e/AutoVLA.md`（NeurIPS 2025，arXiv:2506.13757，代码+ckpt 已发、推理数据 TBD）
  - OpenVLA：`library/VLM_VLA/OpenVLA.md`（CoRL 2024，arXiv:2406.09246，MIT 全开源；**通用机器人操作 VLA，非驾驶**，作范式上游收录）
  - OpenDriveVLA：`library/VLM_VLA/OpenDriveVLA.md`（AAAI 2026，arXiv:2503.23463，Apache-2.0，0.5B ckpt 已发、训练脚本未发）
  - Alpamayo-R1：`library/VLM_VLA/Alpamayo-R1.md`（arXiv:2511.00088 预印本，NVIDIA，代码 Apache-2.0、权重 gated）
  - DrivePI：`library/VLM_VLA/DrivePI.md`（CVPR 2026，arXiv:2512.12799，代码已发、无 license、ckpt/数据未发）
  - 卡况：六篇均**无专属 claim 卡**（`ls claims/` 逐名 grep 核实）；相关卡仅 BEV-Planner 5 张（`claim-bevplanner-*`，均 `status: asserted` / `stance: watch`，见 `nightshift/reports/bevplanner-deep-read.md` §2.1 frontmatter 逐卡核对）；全库 116 张卡 `status` 全为 asserted、0 verified（2026-11-03 `grep -c` 核实）。
- 对照报告：`nightshift/reports/bevplanner-deep-read.md`（nuScenes 开环口径纪律）、`nightshift/cross/4d-radar.md`、`nightshift/cross/quantization.md`（体例参照）。

------

## 1. 六篇定位矩阵

### 1.1 主矩阵（模态输入 / 输出表示 / 任务定位 / 训练数据规模 / 是否开源）

| 维度 | UniAD | AutoVLA | OpenVLA | OpenDriveVLA | Alpamayo-R1 | DrivePI |
| --- | --- | --- | --- | --- | --- | --- |
| 模态输入 | 多相机环视 → BEVFormer BEV 特征（UniAD.md §2.1） | 三路前向前视相机 ×4 帧 @2 Hz + ego 状态（速度/加速度/历史动作）+ 导航指令（AutoVLA.md §2.1，L35） | **单图像** + 自然语言指令（OpenVLA.md §6 自述局限：仅支持单图，L213） | 多相机 → BEVFormer(200×200) + TrackQFormer/MapQFormer 3D token + 文本化 ego 状态 + 指令（OpenDriveVLA.md §2.1/TABLE VI） | 多相机多帧；默认单图 tokenizer，实验用前向双摄 120°/30° + egomotion + 路线（Alpamayo-R1.md §2.3/§3.1） | **LiDAR 点云 + 6 环视相机** → UniLION latent BEV 特征 + 语言指令（DrivePI.md §2.1，L34） |
| 输出表示 | 轨迹 waypoints + 全栈中间输出（跟踪/建图/运动/占用，query 接口） | 动作 token：K-disk codebook K=2048、0.5 s/token、5 s 共 10 token + CoT 文本（AutoVLA.md §2.2/§3.2） | 7-DoF 机器人动作 256-bin 离散 token（覆写 Llama tokenizer 末 256 token，OpenVLA.md §2.2） | 文本 token 化路点：3 s、0.5 s 间隔、6 waypoints + QA 文本（OpenDriveVLA.md §2.5，L74） | 128 离散轨迹 token（训练/RL）+ flow matching action-expert 连续解码（推理）+ CoC 推理文本（Alpamayo-R1.md §2.4/§2.6） | 四专用头：文本（自回归）+ 3D occupancy + occupancy flow + 动作扩散轨迹（DrivePI.md §2.1，L35） |
| 任务定位 | 端到端驾驶（planning-oriented 全栈，非 VLM） | 端到端驾驶 VLA（开环+闭环） | 通用机器人操作 VLA（非驾驶） | 端到端驾驶 VLA + 驾驶 VQA | 端到端驾驶 VLA（长尾推理，实车部署） | 统一 VA+VLA 驾驶框架（4D MLLM） |
| 训练数据规模（各自单位，**互不可比**，见 §5-M8） | nuScenes；两阶段 6+20 epochs（UniAD.md §2.6） | nuPlan 166.3k + nuScenes 19.0k + Waymo 23.8k + CARLA 274.5k 训练样本；CoT 标注 45.6k(nuPlan)+7.2k(Waymo)（AutoVLA.md §3.1，L89-92/L57） | Open X-Embodiment 970k 轨迹（70+ 数据集，混合权重沿用 Octo）（OpenVLA.md §2.3） | TOD3Cap 1.89M + nuScenes-QA 376K + nuCaption 348K + nuX 28K；四阶段样本 536k/566k/459k/28k（OpenDriveVLA.md §3.1，TABLE X/XI） | 内部 80,000 小时驾驶数据（2,500 城市/25 国）+ CoC 700K 视频段（Alpamayo-R1.md §3.1，L100/L73） | nuScenes 750 训练场景 + 数据引擎生成共超 1.0M QA 对（DrivePI.md §3.1，L62/L63） |
| 是否开源 | 是（github.com/OpenDriveLab/UniAD，"Code and models are public."） | 代码(2026/02)+ckpt(2026/05) 已发；推理数据 TBD；Academic Software License（AutoVLA.md L4） | 是，MIT；含 ckpt/微调 notebook/codebase（OpenVLA.md L4） | Apache-2.0；0.5B ckpt 已发（2025/11/14）；训练脚本未勾选发布（OpenDriveVLA.md L6） | 代码 Apache-2.0；10B 权重 HF gated；README 自述仓库仅有限维护（Alpamayo-R1.md L6/L243） | 部分开源：训练/评测代码已发（2026/03/21）；**仓库无 license**；checkpoints/数据集未发（DrivePI.md L5） |
| 出处 | CVPR 2023 最佳论文 | NeurIPS 2025 | CoRL 2024 | AAAI 2026 | arXiv 预印本（NVIDIA；CES 2026 后改名 Alpamayo 1） | CVPR 2026 |

### 1.2 规模与延迟速览（口径各异，不可并列比较，见 §5-M7）

| 论文 | LLM/VLM 底座 | 总参数 | 延迟口径（笔记所录） | 训练硬件（笔记所录） |
| --- | --- | --- | --- | --- |
| UniAD | 无 LLM（BEVFormer + transformer decoder 组） | 125.0M | A100 上 1.8 FPS（Table 13，UniAD.md §3.6） | 16×A100（UniAD.md §2.6） |
| AutoVLA | Qwen2.5-VL-3B | 3B | Fast 1.072 s / Slow 10.518 s（Table 2；笔记未记硬件） | 8×L40S（SFT，§4.1） |
| OpenVLA | Llama 2 7B（Prismatic-7B 基座） | 7B | bf16 约 6 Hz / 15 GB（RTX 4090）；int4 7.0 GB（§3.5/§3.4） | 64×A100×14 天（§3.5） |
| OpenDriveVLA | Qwen2.5-Instruct 0.5B/3B/7B | 0.5–7B | A100 bf16 每样本 1.36/1.85/1.74 s（TABLE IX） | 4×H100×约 2 天（§3.1） |
| Alpamayo-R1 | Cosmos-Reason（0.5B/3B/7B/10B 档） | 0.5B–10B（10B=VLM+2B 扩散解码器） | 端到端 99 ms（RTX 6000 Pro Blackwell，TABLE 14） | 未逐项记录（Cosmos-RL 基础设施，§2.6） |
| DrivePI | Qwen2.5-0.5B | 0.5B | 笔记无延迟表 | 8×L40S（§3.1） |

------

## 2. 技术路线谱系

### 2.1 六条路线与引用关系

- **R1 规划导向全栈端到端（非 VLM）—— UniAD**：五任务（跟踪/建图/运动/占用/规划）共享 query 接口：「Tasks are communicated with unified query interfaces to facilitate each other toward planning.」（UniAD.md §1，L18）；主张「we argue that a favorable framework should be devised and optimized in pursuit of the ultimate goal, i.e., planning of the self-driving car.」（UniAD.md §1，L17）。两阶段训练「UniAD is trained in two stages.」（UniAD.md §2.6，L75）。
- **R2 通用 VLM 动作 token 化（机器人操作）—— OpenVLA**：Prismatic-7B 基座「The Prismatic VLM is fine-tuned on top of these components using the LLaVA 1.5 data mixture [43]」（OpenVLA.md §3.1，L37，即与本库 `library/VLM_VLA/LLaVA.md` 同谱系）；970k 轨迹：「we curated a much larger training dataset for OpenVLA with 970k trajectories (vs. 350k for RT-2-X)」（OpenVLA.md §5.1，L55）。本文确立「动作当 token 直接微调 VLM」范式，是 R3–R5 的方法上游（OpenDriveVLA 引其为 [18]，见 R4）。
- **R3 驾驶 VLA·2D VLM 微调 + 物理动作 token + RL—— AutoVLA**：单自回归模型「we propose AutoVLA, a novel VLA model that unifies reasoning and action generation within a single autoregressive generation model for end-to-end autonomous driving.」（AutoVLA.md Abstract，L19）；Qwen2.5-VL-3B 底座（AutoVLA.md §3.1，L36）；K-disk 2048 codebook 把轨迹变 next-token prediction；SFT 双模式（快/慢思考）+ GRPO 强化微调（CoT 长度惩罚）。
- **R4 驾驶 VLA·3D 空间感知 token + 层级对齐—— OpenDriveVLA**：自我定位第四范式「(d) 3D spatial-aware driving VLA (ours).」（OpenDriveVLA.md §II-C，L30）；视觉编码器直接沿用 UniAD：「We adopt the perception training stage introduced in UniAD [10, 57] to produce a robust visual encoder for the traffic environment.」（OpenDriveVLA.md 附录 §VI-A1，L41）——R1 在本文中以"感知预训练源"身份进入 VLA 谱系；对机器人 VLA 的批评：「Yet, these methods are mostly limited to static setups and lack driving-specific 3D spatial design.」（OpenDriveVLA.md §II-B，L32）。
- **R5 驾驶 VLA·结构化推理 + 扩散动作专家 + RL 对齐—— Alpamayo-R1**：「We introduce Alpamayo-R1 (AR1), a vision-language-action model (VLA) that integrates Chain of Causation reasoning with trajectory planning for complex driving scenarios.」（Alpamayo-R1.md Abstract，L23）；双表征（离散 token 训练/RL、flow matching 推理）+ GRPO 三奖励（推理质量/推理-动作一致性/轨迹质量）；对 R3/R4 的引用与批评：「OpenDriveVLA (Zhou et al., 2025a) autoregressively produces trajectory waypoints from structured vision-language tokens. AutoVLA (Zhou et al., 2025b) unifies reasoning and action with adaptive “think vs. act” control.」→「However, these approaches largely operate reactively without explicit reasoning, struggling to generalize beyond training distributions in ambiguous or long-horizon scenarios requiring counterfactual reasoning.」（Alpamayo-R1.md §1，L33；本次 arXiv v2 复核命中）。
- **R6 统一 VA+VLA·MLLM 外挂非自回归专用头—— DrivePI**：「Here, we term it 4D MLLM as it outputs both 3D occupancy and flow, capturing fine-grained spatial-temporal dynamics.」（DrivePI.md §1，L25）；差异化第一点是模态：「first, unlike mainstream VLA-based methods that rely solely on camera images as input, DrivePI introduces LiDAR as a complementary sensing modality」（DrivePI.md §1，L26）；四个输出头联合训练：「Note that the MLLM is trainable, and all tasks are jointly optimized during training.」（DrivePI.md §3.1，L35）——与 R3/R4/R5 的纯自回归轨迹生成相对，规划头是扩散式（DiffusionDrive 式），不经 LLM 解码。

**引用关系小结**（据各笔记记载，方向为"引用方 → 被引方"）：OpenDriveVLA → OpenVLA（[18]，机器人 VLA 相关工作）与 UniAD（感知预训练 + 规划基线）；Alpamayo-R1 → OpenDriveVLA / AutoVLA（§2.1 定性批评，未在公开基准比数字）；AutoVLA → OpenDriveVLA（Table S2 转引其 nuScenes 行，与 OpenDriveVLA.md TABLE I 逐格一致，OpenDriveVLA.md L32 自记核验）；DrivePI → OpenDriveVLA（表 2/表 3 主要 VLA 基线，数字逐格一致，DrivePI.md 表格核验块自记）。**没有任何两篇做过同口径复测对比**——所有跨论文数字都是转引（见 §5-M6）。

### 2.2 世界模型路线：六篇中缺位

如实记录：六篇中**没有一篇以世界模型方法实现**。UniAD 的 OccFormer 是多步未来占用预测（UniAD.md §2.4，"预测多步未来占用"），属预测头而非世界模型训练目标；DrivePI 的 occupancy flow 同为预测头。Alpamayo-R1 把世界模型明确列为未来工作：「incorporating learned world models could enable forward simulation and counterfactual reasoning, improving robustness in dynamic scenarios.」（Alpamayo-R1.md §7，L230）。若主人研究路线涉及世界模型，本组素材只能提供"占用/流预测作为中间表示"的相邻证据，无直接对照。

------

## 3. 性能口径差异清单（凡标「不可直接对比」处，引用数字前必须先定口径）

### 3.1 nuScenes 开环规划的指标族分裂（核心口径问题）

nuScenes 开环规划在组内出现**三个互不兼容的口径层**：

1. **"ST-P3 metrics" vs "UniAD metrics" 两族并存**：OpenDriveVLA TABLE I 同表并列两族、AutoVLA Table S2 同表并列两族；UniAD 行两族数字为 ST-P3 口径 0.69/0.12 vs UniAD 口径 1.03/0.31（OpenDriveVLA.md L144，TABLE I；本次 arXiv v2 复核命中）——同一方法同一数据集，L2 相差 33%、碰撞率相差 1.6 倍。AutoVLA 明确其口径：「We follow the UniAD protocol, reporting both metrics at 1, 2, and 3 seconds in the future, instead of averaging over the horizons.」（AutoVLA.md 附录 E.2，L84）。UniAD 原文的口径自述是「We adopt the same metrics as in ST-P3 [38], i.e., L2 error and collision rate at various timestamps.」（UniAD.md 附录 F.2，L259）——即指标名同源、实现已分裂。
2. **BEV-Planner 修正口径**（第三族）：统一实现 + 0.1m 网格 + 碰撞率定义修正（Eq.3 + yaw 修正）+ 有效样本 5119/6019 + 新指标 CCR（见 bevplanner-deep-read.md §2.3 第 6 条）。UniAD 四套数字不可混用的完整结论见 bevplanner-deep-read.md §3.2（原文 Table 7 / 复现无注入 / 官方 ckpt BEV 注入 / 官方+后处理，四套并存）。
3. **实现差异实例**：同是「VAD-Base 无 ego 注入」，VAD 原文/DrivePI 表 2 记 L2-Avg 0.72（DrivePI.md L101），BEV-Planner 复现记 1.25（bevplanner-deep-read.md §1.3，BEV-Planner.md L67 转录）——「不可直接对比」。

另：OpenDriveVLA TABLE I 中 UniAD 行的 ST-P3 口径数字（0.69/0.12）的**原始出处**未在库内笔记记载（疑转引自 VAD 论文，见 §7-遗留 1）。

### 3.2 ego status 设定差异（跨行比较碰撞率前的强制检查项）

- BEV-Planner 五卡（asserted）的核心结论即「注入 ego status 后旧指标失去区分度」；卡 `claim-bevplanner-egostatus-injection-closes-gap` 记录注入位置两档：「仅 BEV 注入（ID-2/ID-5）介于两者之间」（卡 L36）。
- 组内各篇设定不同：**OpenDriveVLA** 把 ego state 编码为文本输入（OpenDriveVLA.md §2.5，L74），且消融显示「Notably, ego-state features play a critical role in nuScenes open-loop benchmark, consistent with prior findings [53].」（OpenDriveVLA.md §IV-E，L214；[53] 是否即 BEV-Planner 未核，见 §7-遗留 2）；**AutoVLA** 的输入三路之一就是 ego 状态（AutoVLA.md §3.1，L35）；**DrivePI** 默认不用：「Note that our unified model DrivePI does not incorporate ego status during training by default to avoid potential shortcut learning.」（DrivePI.md 表 2 caption，L93；本次 arXiv 复核命中），代价直接可见：无 ego 行碰撞率 0.38 vs 有 ego 行 0.11（DrivePI.md L106/L107）。DrivePI 笔记作者提示（非论文原句）：对比对象 OmniDrive/ORION/OpenDriveVLA-7B 均为 ego ✓ 行，「跨行比较需注意该设定差异」（DrivePI.md §4，L221）。
- **推论（口径纪律，非新结论）**：BEV-Planner 卡 + OpenDriveVLA 消融 + DrivePI 设计选择三方同向（详见 §4-S1）；凡引用组内 nuScenes 碰撞率，先查该行 ego status 列。

### 3.3 时域与指标定义差异

- 预测时域：UniAD/OpenDriveVLA 3 s（后者「Both tasks predict 3-second future trajectories, sampled at 0.5-second intervals, resulting in 6 waypoints per trajectory.」，OpenDriveVLA.md §2.5，L74）；AutoVLA 5 s：「Each action token corresponds to 0.5 seconds of movement, and the planning horizon is set to 5 seconds.」（AutoVLA.md §4.1，L98）；Alpamayo-R1 6.4 s（64 waypoints @10 Hz，Alpamayo-R1.md §2.1）。**"L2 Avg" 的分母不同，不可直接对比。**
- minADE6 vs 单轨迹 L2：Alpamayo 用「minADE is computed over 6 samples」（Alpamayo-R1.md §6.1，L101）的 6 选 1 最优误差；其余各篇为单轨迹 L2。**两类数字不可同表。**
- 碰撞率实现分裂（0.1m 网格 / Eq.3 修正 / CCR 自定义指标）见 §3.1 第 2 条与 bevplanner-deep-read.md §2.3 第 6 条。

### 3.4 benchmark 覆盖矩阵（哪组数字同口径可直接对表）

| benchmark | UniAD | AutoVLA | OpenVLA | OpenDriveVLA | Alpamayo-R1 | DrivePI | 同口径可比性 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| nuScenes 开环 L2/碰撞 | 原文 Table 7 | Table S2（双口径） | —（非驾驶） | TABLE I（双口径） | —（minADE6） | 表 2（单口径） | **不可直接对比**（§3.1 三族分裂 + §3.2 ego 差异 + §3.3 时域不同） |
| nuScenes-QA | — | — | — | TABLE II（Acc 58.4/58.5/58.2） | — | 表 3（Acc 60.7） | **组内唯一可直接对表的族**：DrivePI 表 3 的 OpenDriveVLA 三行与 OpenDriveVLA.md TABLE II 逐格一致（转引而非复测，见 §4-C3） |
| NAVSIM PDMS（nuPlan） | — | Table 1（Post-RFT 89.11） | — | — | — | — | 仅 AutoVLA 一家 |
| Waymo E2E RFS | — | Table S3（7.5566） | — | — | — | — | 仅 AutoVLA 一家 |
| CARLA Bench2Drive 闭环 | —（被 AutoVLA 列为基线 45.81） | Table 3（DS 78.84） | — | — | — | — | 仅 AutoVLA 一家实测 |
| AlpaSim 闭环 | — | — | — | — | TABLE 8/10（75 场景 + 公开 920 场景） | — | 仅 Alpamayo 一家 |
| OpenOcc / Occ3D RayIoU+mAVE | — | — | — | — | — | 表 1/表 4（49.3 / 46.0*） | 仅 DrivePI 一家（* 为单任务专用版 DrivePI*，DrivePI.md L74/L221） |
| LingoQA | — | — | — | — | TABLE 11（66.2，底座数字） | — | 仅 Alpamayo 一家 |
| WidowX/Google Robot/LIBERO | — | — | Fig.3/4、Table 12 | — | — | — | 仅 OpenVLA（机器人域） |

结论：六篇之间**不存在第二个同口径数字族**；任何跨论文性能排序都必须先声明口径族、ego status 设定与时域，否则属口径错配。

### 3.5 头条数字的自报边界

- AutoVLA：§1 自称 "superior performance"，但其笔记 ⚠ 记录 Post-RFT PDMS 89.11 低于 TrajHF 93.95 / Centaur 92.10 / Hydra-MDP 91.26（AutoVLA.md L28/L116）；best-of-N 92.12 依赖 oracle：「In best-of-N planning, we use an oracle scorer to select the optimal trajectory from six generated candidates.」（AutoVLA.md §4.2，L119）；论文自己的总结是「Overall, AutoVLA achieves competitive results while demonstrating scalability across diverse datasets.」（AutoVLA.md §4.2，L120）。
- Alpamayo-R1：头条 12%/35%/45%/37%/99ms 的对照基线是**自家 trajectory-only 变体**而非外部 SOTA，且评测集以内部数据为主（Alpamayo-R1.md ⚠ 措辞提示，L237；12% 句本次 arXiv 复核命中）。
- DrivePI：「with only a 0.5B Qwen2.5 model as MLLM backbone, DrivePI as a single unified model matches or exceeds both existing VLA models and specialized VA models.」（DrivePI.md Abstract，L23）——对比基线全部为转引数字（见 §4-C3）。
- OpenDriveVLA：Abstract 限定「Extensive experiments on the nuScenes dataset demonstrate that OpenDriveVLA achieves state-of-the-art results across open-loop trajectory planning and driving-related question-answering tasks.」（OpenDriveVLA.md Abstract，L23）——仅 nuScenes 开环 + VQA，其局限自述「Finally, our current planning evaluation is limited to an open-loop setting.」（OpenDriveVLA.md §VIII-D2，L233）。
- OpenVLA：16.5% 为 29 任务绝对成功率汇总（OpenVLA.md Abstract，L22；本次复核命中），且 RT-2-X 的 Bridge 评测依赖「取次优动作」workaround（OpenVLA.md 附录 C，L116）。

### 3.6 数据规模与延迟单位不可排序

- 数据规模六篇六种单位：epochs（UniAD）/ 训练样本数（AutoVLA）/ 轨迹数（OpenVLA）/ 标注样本数（OpenDriveVLA）/ 小时数（Alpamayo）/ QA 对数（DrivePI）——**量纲不同，不可排序**（对照 quantization.md §5-M5 同型结论）。
- 延迟口径：FPS（UniAD）/ s 每样本（OpenDriveVLA）/ s 每次推理分快慢（AutoVLA）/ Hz + 显存（OpenVLA）/ 端到端 ms（Alpamayo）/ 无（DrivePI）——**硬件、单位、含义均不同，不可并列成表**（§1.2 仅为速览）。

------

## 4. 结论互证与单源自报

### 4.1 互证（S）

- **S1 ego status 支配 nuScenes 开环成绩——三方同向（最强互证线）**：①BEV-Planner 五卡（asserted，干预实验 ★★★ 级为 velocity 卡）：同 ckpt 下速度置零 L2-Avg 0.37→6.16，图像置空仅 0.37→0.46（bevplanner-deep-read.md §1.4）；②OpenDriveVLA 输入消融：无 Visu 有 Ego/Hist/Cmd 行 Avg. Col. 0.29/0.10，无 Ego 行 0.77/0.24 与 1.14/0.49（OpenDriveVLA.md TABLE IV，L205-207）；③DrivePI 默认去 ego 并自述防 shortcut（§3.2 引文）。注：三方的任务设定与实现不同，是同向证据而非同位复现。
- **S2 nuScenes 开环基准的乐观性——三方同向**：BEV-Planner 卡 `claim-bevplanner-egomlp-parity-l2-collision`（Ego-MLP 持平 SOTA）；OpenDriveVLA 自述「Prior studies also show that nuscences open-loop benchmark may lead to overly optimistic conclusions[34].」（OpenDriveVLA.md §VIII-D3，L234；拼写 "nuscences" 照原文）；AutoVLA 解释推理无收益时称「many nuScenes scenarios are relatively straightforward, often not requiring complex reasoning」（AutoVLA.md 附录 F.1，L200）；DrivePI 表 2 caption 的 "avoid potential shortcut learning"（§3.2）。方向一致，但各自论据层不同（指标区分度 / 结论外推 / 场景简单性）。
- **S3 自回归文本式轨迹输出的代价——三比一同向 + 一反例**：AutoVLA 实测 text waypoint 劣于物理动作 token（Table 5：PDMS 71.31 vs 80.54、Runtime 7.65 vs 3.95 s，AutoVLA.md §3.8）；Alpamayo 弃原始路点空间改 unicycle 控制量（「susceptible to sensor noise」，Alpamayo-R1.md §3.2.2，L58）；OpenVLA 用 256-bin 数值离散化而非自由文本（OpenVLA.md §2.2）。反例：OpenDriveVLA 仍把路点 tokenizer 成文本 token 自回归生成（OpenDriveVLA.md §2.5，L71），其延迟 1.36–1.85 s/样本（TABLE IX）与上述三家的诊断兼容——但论文未做 text-vs-physical token 消融，不能算直接反证。
- **S4 推理/CoT 延迟是共同短板——四方独立同向**：AutoVLA 快慢思考差一个数量级（1.072 vs 10.518 s，Table 2）；OpenDriveVLA 干脆避免推理期 CoT：「This avoids costly chain-of-thought (CoT) reasoning at inference time and balances planning efficacy with runtime efficiency.」（OpenDriveVLA.md §III-C，L59）；Alpamayo 用 flow matching 解码把轨迹部分压到 8.75 ms、并把 "reasoning on demand" 列为未来工作（Alpamayo-R1.md §7，L230）；OpenVLA 把推理吞吐列为局限并指向 action chunking/speculative decoding（OpenVLA.md §6，L214）。
- **S5 "数据规模 > 模型规模"，条件化后一致**：OpenDriveVLA：「In summary, model size alone is not a robust indicator of performance in this domain-specific autonomous driving task with limited data sources.」（OpenDriveVLA.md §VIII-D1，L232）；OpenVLA：去掉 OpenX 预训练掉 30 个绝对点、去掉 DinoV2 只掉 5 个点（OpenVLA.md §D.1/§D.2，Table 9 76.3→45.6→40.6）；AutoVLA：<50k 样本时 CoT 不优于 action-only、全量反超（AutoVLA.md §4.2，L207）；Alpamayo：数据 100k→2M 段 1.111m→0.874m、0.5B→7B 提升 11%（Alpamayo-R1.md §6.5.2/§6.5.1）。**条件化读法**：Alpamayo/OpenVLA 的 scale 有效结论建立在大数据上，与 OpenDriveVLA 的"有限数据下 scale 不稳健"不矛盾——合并结论是"数据与规模是耦合变量"，单变量断言两边都不成立。
- **S6 训练推理数据/脚本的复现缺口——五篇同病，一篇例外**：AutoVLA 推理数据「TBD : Reasoning data (Pending approval from the data provider)」（AutoVLA.md L4/L264）；OpenDriveVLA 训练脚本未勾选发布（OpenDriveVLA.md L6）；Alpamayo 权重 gated（「The model requires access to gated resources. Request access here:」，Alpamayo-R1.md L243）且仓库「This repository is no longer under active development and will receive only limited maintenance updates.」（Alpamayo-R1.md L6）；DrivePI 无 license、checkpoints/数据集未发（DrivePI.md L5）；UniAD 代码+模型公开（UniAD.md L4）。例外是 OpenVLA（MIT，ckpt+notebook+codebase，OpenVLA.md L4）。**这直接决定"尚未独立验证"各条的实际核查成本排序。**

### 4.2 单源自报（C）

- **C1（单源）AutoVLA 动作 token 化优于 text waypoint**：Table 4/5/6 全部出自 AutoVLA 一家（K-disk vs RT-1/FAST、physical vs text）；无第三方在驾驶域复测过该对比。
- **C2（单源）Alpamayo 结构化 CoC 的全部增益数字**：132.8% 因果分提升、挑战集 12%、闭环 35% close encounter 下降——训练/评测数据均为内部 80,000 小时（geo-fenced），对照基线是自家 trajectory-only 变体；公开可复核的只有 PhysicalAI-AV（644 例）、AlpaSim 公开（920 场景）与 LingoQA 三处，且 LingoQA 66.2 是底座（Cosmos-Reason-7B）而非完整 AR1（Alpamayo-R1.md §3.5 注）。
- **C3（单源）DrivePI 的"0.5B 统一模型匹配或超越"**：其全部 VLA/VA 基线数字为转引（OpenDriveVLA 三档 QA 行与其原论文逐格一致；UniAD/VAD 行沿用文献数字），非同环境复测；occupancy/flow 头条（OpenOcc RayIoU 49.3、mAVE 0.509；Occ3D 46.0）无第二家 VLA 做过同表对比。表 4 的 46.0 来自「仅在 Occ3D 单任务上训练」的 DrivePI*（DrivePI.md L221 笔记提示），不能与统一模型混读。
- **C4（单源）OpenVLA vs RT-2-X 的 16.5%**：对比口径由 OpenVLA 作者执行，RT-2-X 依赖 workaround（OpenVLA.md 附录 C）；且其 §5.3/§5.4 消融用的是「小混合预训练 + SigLIP-only」简化版（OpenVLA.md ⚠ ⑤，L223），与最终发布模型不同配置。
- **C5（单源）OpenDriveVLA 四段式训练逐阶段增益**：TABLE V（0.37→0.32→0.26 碰撞率）与输入消融 TABLE IV 均为该论文自报；训练脚本未发布，无法第三方复算。
- **C6（单源）UniAD 任务协作增益与其后续质疑的关系**：Table 2（Exp.12 vs Exp.0，-0.15m avg.L2）是 UniAD 自报；BEV-Planner 五卡随后质疑的是**指标区分度**（Ego-MLP 持平、注入效应），不是 Table 2 数字本身——两者是"论文声称 vs 后续口径质疑"关系，互证仅限"协作增益在无区分度指标上测出"这一元层面。
- **C7（记录）跨论文数字全部为转引**：AutoVLA Table S2 的 OpenDriveVLA 行、DrivePI 表 2/表 3 的 OpenDriveVLA 行、OpenDriveVLA TABLE I 的 UniAD/VAD 行，均为论文间转抄；本报告 §3-A2/A4/A6 的 arXiv 复核确认了**转抄链一致**（三篇笔记 + arXiv 原文四点吻合），但不构成任何一方对另一方的独立复测。

------

## 5. 研究启示（主人用；全库 116 卡 0 verified，以下一律为「论文声称 / 尚未独立验证」，不得写成事实）

1. **nuScenes 数字引用纪律（最可迁移产出）**：引用组内任何 nuScenes 规划数字，先过三道检查——①口径族（ST-P3 / UniAD / BEV-Planner 修正，§3.1）；②该行 ego status 设定（§3.2）；③时域与平均方式（§3.3）。bevplanner-deep-read.md §3.2 的裁决句依然适用：「引用 UniAD 规划数字前，必须先从这四套里选定一套并在引用处注明」（bevplanner-deep-read.md §3.2，L227）。
2. **可直接对表的数字族只有一个**：nuScenes-QA（OpenDriveVLA TABLE II vs DrivePI 表 3，58.4/58.5/58.2 vs 60.7）。即便如此，DrivePI 行是其自家统一模型数字、OpenDriveVLA 行是转引——"同表"不等于"同环境复测"。
3. **开环/闭环两侧各有独占 benchmark**：闭环只有 AutoVLA（Bench2Drive）与 Alpamayo（AlpaSim）各自的结果，互不可比；若主人研究需要跨方法闭环对照，现有六篇素材不足，需另行抓取共同 benchmark（如同期 NAVSIM leaderboard 上的其他 VLA）。
4. **ego status 是组内的隐含实验变量**：DrivePI 的"默认不用"设计（0.38 vs 0.11 碰撞率）可作为检验 `claim-bevplanner-egostatus-injection-closes-gap`（asserted）的第三方旁证素材，但需先确认其评测实现与 BEV-Planner 口径的关系（见 §7-遗留 2/3）。
5. **推理延迟是六篇共同瓶颈且无统一口径**：若做部署选型，需在目标硬件上自测，不能引用论文间数字互比（§3.6）；Alpamayo 的 99 ms 是 flow matching + 40-token 推理的配置（TABLE 14），不是纯自回归基线（312 ms）。
6. **复现成本分级**（S6）：OpenVLA（MIT 全开）< UniAD < OpenDriveVLA（0.5B ckpt）< AutoVLA（CoT 数据 TBD）< Alpamayo（gated + 停止维护）< DrivePI（无 license）。凡涉及复算 claim，优先选低成本侧。
7. **若立新卡（仅列候选方向，本任务未立卡，需主人决定）**：候选窄卡如「AutoVLA Table 5：physical action token 优于 text waypoint（PDMS 80.54 vs 71.31，NAVSIM，论文声称）」或「DrivePI 表 2 caption：默认不用 ego status 防 shortcut（碰撞率 0.11 vs 0.38，论文声称）」——均可证伪、有单表数字锚点；但均属单源自报，卡内须带 §4-C1/C3 的限定。

------

## 6. 遗留问题（转调度班次 / QUESTIONS.md，不替主人决定）

1. OpenDriveVLA TABLE I 与 AutoVLA Table S2 中 UniAD 行的 **ST-P3 口径数字（0.69/0.12）原始出处**未在库内笔记记载（疑转引自 VAD 论文对 UniAD 的重评），需回 VAD 原文核对后才能确定该行的口径归属。
2. OpenDriveVLA §IV-E「consistent with prior findings [53]」的 **[53] 是否即 BEV-Planner** 未核对；若成立，可为 `claim-bevplanner-egostatus-injection-closes-gap` 等卡补一条外部互证 evidence（需主人同意后改卡）。
3. DrivePI 规划指标「we follow previous methods〔45, 71〕」中 **[45] 指向哪篇**未核对（[71]=OpenDriveVLA 已确认）；其与 BEV-Planner 修正口径（0.1m 网格/Eq.3）是否同源未知。
4. AutoVLA Fig.4/Fig.5 的具体数值（数据 scaling 各点、GRPO 组大小）在图中，笔记未抄录（AutoVLA.md TODO L261）；本报告 §4-S5 只引用其定性趋势句。
5. Alpamayo-R1 与其余五篇**无任何同口径数字**（minADE6@6.4s + 内部数据 + AlpaSim）；若需把它纳入定量对比，须先共同选定公开 benchmark 并明确定义（本报告未做任何跨其数字的比较）。
6. DrivePI 表 2 的 VAD 无 ego 行（0.72）与 BEV-Planner 复现无注入行（1.25）数字不同（§3.1 第 3 条），差异变量（评测实现/数据划分/有效样本）未定位，需回两篇原文。
7. 本报告为对比素材，**未立任何新卡、未改任何既有文件**；六篇如需建卡，按 RULES 走逐字核验流程（本报告引文已全部 Grep 验证，可直接复用附录 A 的锚点）。

------

## 附录 A：引文核验记录

方法：对每条引文以其字节原样做 `grep -cF` 固定字符串匹配，目标恰好 1 次（x2 者已注明两处位置）。核验日期 2026-11-03，工作区外临时脚本，路径 /tmp/vla_fetch（含 6 篇 arXiv HTML 原始抓取文件，未入库）。

```
OK x1  library/ADe2e/UniAD.md:L17    we argue that a favorable framework should be devised and optimized in pursuit of the ultimate goal, i.e., planning of the self-driving car.
OK x1  library/ADe2e/UniAD.md:L18    Tasks are communicated with unified query interfaces to facilitate each other toward planning.
OK x1  library/ADe2e/UniAD.md:L75    UniAD is trained in two stages.
OK x1  library/ADe2e/UniAD.md:L173   | UniAD | 0.48 | 0.96 | 1.65 | 1.03 | 0.05 | 0.17 | 0.71 | 0.31 |
OK x1  library/ADe2e/UniAD.md:L245   | 6（完整 UniAD） | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 125.0M | 1709G | 1.8 |
OK x1  library/ADe2e/UniAD.md:L259   We adopt the same metrics as in ST-P3 [38], i.e., L2 error and collision rate at various timestamps.
OK x1  library/ADe2e/AutoVLA.md:L19    we propose AutoVLA, a novel VLA model that unifies reasoning and action generation within a single autoregressive generation model for end-to-end autonomous driving.
OK x1  library/ADe2e/AutoVLA.md:L26    Extensive experiments across real-world and simulated datasets and benchmarks, including nuPlan, nuScenes, Waymo, and CARLA, demonstrate the competitive performance of AutoVLA in both open-loop and closed-loop settings.
OK x1  library/ADe2e/AutoVLA.md:L36    We adopt Qwen2.5-VL-3B [21] as the vision-language backbone of AutoVLA.
OK x1  library/ADe2e/AutoVLA.md:L57    approximately 45.6k CoT reasoning annotations for the nuPlan dataset and 7.2k annotations for the Waymo end-to-end driving dataset
OK x1  library/ADe2e/AutoVLA.md:L84    We follow the UniAD protocol, reporting both metrics at 1, 2, and 3 seconds in the future, instead of averaging over the horizons.
OK x1  library/ADe2e/AutoVLA.md:L98    Each action token corresponds to 0.5 seconds of movement, and the planning horizon is set to 5 seconds.
OK x1  library/ADe2e/AutoVLA.md:L116   | AutoVLA (Post-RFT) | 89.11 | 98.41 | 95.64 | 95.40 | 81.87 | 98.04 | 99.94 |
OK x1  library/ADe2e/AutoVLA.md:L119   In best-of-N planning, we use an oracle scorer to select the optimal trajectory from six generated candidates.
OK x2  library/ADe2e/AutoVLA.md:L28/L120  Overall, AutoVLA achieves competitive results while demonstrating scalability across diverse datasets.
OK x1  library/ADe2e/AutoVLA.md:L178   | AutoVLA | 78.84 | 57.73 | 146.93 | 39.33 |
OK x1  library/ADe2e/AutoVLA.md:L197   | AutoVLA (w/ CoT) | 0.21 | 0.38 | 0.60 | 0.40 | 0.13 | 0.18 | 0.28 | 0.20 | 0.28 | 0.66 | 1.16 | 0.70 | 0.14 | 0.25 | 0.53 | 0.31 |
OK x1  library/ADe2e/AutoVLA.md:L200   many nuScenes scenarios are relatively straightforward, often not requiring complex reasoning
OK x1  library/ADe2e/AutoVLA.md:L207   In the nuPlan dataset, when using fewer than 50k training samples, CoT reasoning does not outperform action-only in terms of PDMS and Collision Score.
OK x1  library/ADe2e/AutoVLA.md:L253   Although our model with dual-process adaptation achieves near-real-time inference (1 Hz), it remains highly GPU-dependent, requiring significant memory and computing.
OK x2  library/ADe2e/AutoVLA.md:L4/L264  TBD : Reasoning data (Pending approval from the data provider)
OK x1  library/VLM_VLA/OpenVLA.md:L22    OpenVLA demonstrates strong results for generalist manipulation, outperforming closed models such as RT-2-X (55B) by 16.5% in absolute task success rate across 29 tasks and multiple robot embodiments, with 7x fewer parameters.
OK x2  library/VLM_VLA/OpenVLA.md:L27/L37  The Prismatic VLM is fine-tuned on top of these components using the LLaVA 1.5 data mixture [43]
OK x2  library/VLM_VLA/OpenVLA.md:L55/L114  we curated a much larger training dataset for OpenVLA with 970k trajectories (vs. 350k for RT-2-X)
OK x1  library/VLM_VLA/OpenVLA.md:L99    The final OpenVLA model is trained on a cluster of 64 A100 GPUs for 14 days, or a total of 21,500 A100-hours, using a batch size of 2048.
OK x1  library/VLM_VLA/OpenVLA.md:L100   requires 15GB of GPU memory when loaded in bfloat16 precision
OK x1  library/VLM_VLA/OpenVLA.md:L116   we mitigated this issue by simply querying the second-most-likely action from the model
OK x1  library/VLM_VLA/OpenDriveVLA.md:L6    2025/11/14 Released the OpenDriveVLA 0.5B checkpoint on Hugging Face.
OK x1  library/VLM_VLA/OpenDriveVLA.md:L23   Extensive experiments on the nuScenes dataset demonstrate that OpenDriveVLA achieves state-of-the-art results across open-loop trajectory planning and driving-related question-answering tasks.
OK x1  library/VLM_VLA/OpenDriveVLA.md:L30   (d) 3D spatial-aware driving VLA (ours).
OK x1  library/VLM_VLA/OpenDriveVLA.md:L32   Yet, these methods are mostly limited to static setups and lack driving-specific 3D spatial design.
OK x1  library/VLM_VLA/OpenDriveVLA.md:L41   We adopt the perception training stage introduced in UniAD [10, 57] to produce a robust visual encoder for the traffic environment.
OK x1  library/VLM_VLA/OpenDriveVLA.md:L59   This avoids costly chain-of-thought (CoT) reasoning at inference time and balances planning efficacy with runtime efficiency.
OK x1  library/VLM_VLA/OpenDriveVLA.md:L71   The waypoints are tokenized into a sequence of discrete textual tokens for autoregressive generation in the LLM
OK x1  library/VLM_VLA/OpenDriveVLA.md:L74   Both tasks predict 3-second future trajectories, sampled at 0.5-second intervals, resulting in 6 waypoints per trajectory.
OK x1  library/VLM_VLA/OpenDriveVLA.md:L104  | #Samples | 536k | 566k | 459k | 28k |
OK x1  library/VLM_VLA/OpenDriveVLA.md:L109  Training is performed on 4 NVIDIA H100 GPUs with a batch size of 1, completed in approximately two days.
OK x1  library/VLM_VLA/OpenDriveVLA.md:L144  | UniAD [10] | 0.44 | 0.67 | 0.96 | 0.69 | 0.04 | 0.08 | 0.23 | 0.12 | 0.48 | 0.96 | 1.65 | 1.03 | 0.05 | 0.17 | 0.71 | 0.31 | - | Visual |
OK x1  library/VLM_VLA/OpenDriveVLA.md:L157  | OpenDriveVLA-0.5B (Ours) | 0.15 | 0.32 | 0.57 | 0.35 | 0.01 | 0.06 | 0.20 | 0.09 | 0.21 | 0.60 | 1.22 | 0.68 | 0.00 | 0.15 | 0.63 | 0.26 | Qwen2.5-0.5B | Visual |
OK x1  library/VLM_VLA/OpenDriveVLA.md:L159  | OpenDriveVLA-7B (Ours) | 0.15 | 0.31 | 0.55 | 0.33 | 0.01 | 0.08 | 0.21 | 0.10 | 0.20 | 0.58 | 1.21 | 0.66 | 0.00 | 0.22 | 0.55 | 0.25 | Qwen2.5-7B | Visual |
OK x1  library/VLM_VLA/OpenDriveVLA.md:L214  Notably, ego-state features play a critical role in nuScenes open-loop benchmark, consistent with prior findings [53].
OK x1  library/VLM_VLA/OpenDriveVLA.md:L232  In summary, model size alone is not a robust indicator of performance in this domain-specific autonomous driving task with limited data sources.
OK x1  library/VLM_VLA/OpenDriveVLA.md:L233  Finally, our current planning evaluation is limited to an open-loop setting.
OK x1  library/VLM_VLA/OpenDriveVLA.md:L234  Prior studies also show that nuscences open-loop benchmark may lead to overly optimistic conclusions[34].
OK x1  library/VLM_VLA/Alpamayo-R1.md:L6    This repository is no longer under active development and will receive only limited maintenance updates.
OK x1  library/VLM_VLA/Alpamayo-R1.md:L23   We introduce Alpamayo-R1 (AR1), a vision-language-action model (VLA) that integrates Chain of Causation reasoning with trajectory planning for complex driving scenarios.
OK x1  library/VLM_VLA/Alpamayo-R1.md:L33   OpenDriveVLA (Zhou et al., 2025a) autoregressively produces trajectory waypoints from structured vision-language tokens. AutoVLA (Zhou et al., 2025b) unifies reasoning and action with adaptive “think vs. act” control.
OK x1  library/VLM_VLA/Alpamayo-R1.md:L33   However, these approaches largely operate reactively without explicit reasoning, struggling to generalize beyond training distributions in ambiguous or long-horizon scenarios requiring counterfactual reasoning.
OK x1  library/VLM_VLA/Alpamayo-R1.md:L58   susceptible to sensor noise
OK x1  library/VLM_VLA/Alpamayo-R1.md:L73   we construct the CoC dataset (Sec. 4) consisting of 700K video segments with structured CoC.
OK x1  library/VLM_VLA/Alpamayo-R1.md:L100  the full training and evaluation dataset comprises 80,000 hours of driving data collected from multiple ego-vehicles operating in more than 2,500 cities in 25 countries.
OK x1  library/VLM_VLA/Alpamayo-R1.md:L101  minADE is computed over 6 samples
OK x1  library/VLM_VLA/Alpamayo-R1.md:L102  We evaluate models in 75 challenging 20-second scenarios, selected for their dense ego–agent and agent–agent interactions.
OK x1  library/VLM_VLA/Alpamayo-R1.md:L134  In challenging scenarios, the improvements are even larger, with AR1 achieving 0.868m, a 12% improvement over the trajectory-only baseline (0.994m).
OK x1  library/VLM_VLA/Alpamayo-R1.md:L166  Alpamayo-R1-10B leverages Cosmos-Reason (NVIDIA et al., 2025a) as the VLM backbone with a 2B parameter diffusion-based trajectory decoder
OK x1  library/VLM_VLA/Alpamayo-R1.md:L230  incorporating learned world models could enable forward simulation and counterfactual reasoning, improving robustness in dynamic scenarios.
OK x1  library/VLM_VLA/Alpamayo-R1.md:L243  The model requires access to gated resources. Request access here:
OK x1  library/VLM_VLA/DrivePI.md:L5    have been released! Data preparation guidelines, trained models and all associated benchmarks will be available within a week!
OK x1  library/VLM_VLA/DrivePI.md:L23   with only a 0.5B Qwen2.5 model as MLLM backbone, DrivePI as a single unified model matches or exceeds both existing VLA models and specialized VA models.
OK x1  library/VLM_VLA/DrivePI.md:L25   Here, we term it 4D MLLM as it outputs both 3D occupancy and flow, capturing fine-grained spatial-temporal dynamics.
OK x1  library/VLM_VLA/DrivePI.md:L26   first, unlike mainstream VLA-based methods that rely solely on camera images as input, DrivePI introduces LiDAR as a complementary sensing modality
OK x1  library/VLM_VLA/DrivePI.md:L35   Note that the MLLM is trainable, and all tasks are jointly optimized during training.
OK x1  library/VLM_VLA/DrivePI.md:L63   culminating in a comprehensive training dataset of over 1.0M QA pairs.
OK x1  library/VLM_VLA/DrivePI.md:L93   Note that our unified model DrivePI does not incorporate ego status during training by default to avoid potential shortcut learning.
OK x1  library/VLM_VLA/DrivePI.md:L106  | DrivePI (Ours) | ✓ |  | 0.24 | 0.46 | 0.78 | 0.49 | 0.38 | 0.27 | 0.48 | 0.38 |
OK x1  library/VLM_VLA/DrivePI.md:L107  | DrivePI (Ours) | ✓ | ✓ | 0.19 | 0.36 | 0.64 | 0.40 | 0.00 | 0.05 | 0.28 | 0.11 |
OK x1  library/VLM_VLA/DrivePI.md:L124  | DrivePI (Ours) | 85.3 | 22.4 | 57.5 | 59.1 | 68.3 | 60.7 |
OK x1  library/VLM_VLA/DrivePI.md:L221  跨行比较需注意该设定差异
OK x1  nightshift/reports/bevplanner-deep-read.md:L227  引用 UniAD 规划数字前，必须先从这四套里选定一套并在引用处注明
OK x1  claims/claim-bevplanner-egostatus-injection-closes-gap.md:L36  仅 BEV 注入（ID-2/ID-5）介于两者之间
```

（各 quote 与正文出现处一一对应；OpenDriveVLA TABLE I 的 UniAD 全行 18 列较长，逐字含表尾 LLM 列 "-" 与 Input 列 "Visual"。）
