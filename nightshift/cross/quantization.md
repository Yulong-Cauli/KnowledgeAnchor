# [cross] 八篇量化笔记横向对比（QwT / OmniQuant / RepQ-ViT / PD-Quant / QD-BEV / BRECQ / PTQAT / EMC2）

- 日期：2026-11-03
- 性质：TODO 候选池对比素材。只记录方法路线、比特配置、校准协议、数据集与指标口径、结论之间的互相支持 / 矛盾 / 单源情况，**不下【谁更好】的评价性结论**。EMC2 不做量化，作为「非量化效率路线」对照收录（见 §2.1 / §4-C7）。
- 引用规则：所有数字与结论均为各笔记所录论文声称，**尚未独立验证**。标记约定：「…」= 从笔记逐字复制的引文（Grep 已验证）；【…】= 笔记小节标题或本文概括标签（非引文）。
- 原文复核记录（本报告新增，均为 2026-11-03 抓取、pdftotext -layout 提取）：
  - RepQ-ViT：https://arxiv.org/pdf/2212.08254v2 —— 笔记全部表格数字核对一致（§6-A1）
  - PD-Quant：https://arxiv.org/pdf/2212.07048v3、https://arxiv.org/pdf/2212.07048v1、CVF camera-ready https://openaccess.thecvf.com/content/CVPR2023/papers/Liu_PD-Quant_Post-Training_Quantization_Based_on_Prediction_Difference_Metric_CVPR_2023_paper.pdf —— 三版本表格一致，**笔记三张表部分数字在三个版本中均不存在**（§6-C1）
  - QwT：https://arxiv.org/pdf/2411.13918v4 与 v1 —— ResNet-50 ImageNet 行为**版本差异**（§6-C2）
  - QD-BEV：https://arxiv.org/pdf/2308.10515（arXiv 最新版，API updated 2026-11-02）—— 笔记全部五张表数字核对一致（§6-A2）
  - BRECQ：https://arxiv.org/html/2102.05426v2（抽查 Table 1/3/4 关键数字存在）
  - QDrop（反查用）：https://arxiv.org/pdf/2203.05740v2（ICLR 2022）—— PD-Quant 笔记表中数字亦不在其中
- 来源笔记（均为本地文件，只读）与卡况：
  - QwT：`library/Quantization/QwT.md`（CVPR 2025，开源）—— 1 张卡
  - OmniQuant：`library/Quantization/OmniQuant.md`（ICLR 2024，开源）—— 5 张卡（4 方法卡 + 1 mismatch 卡）
  - RepQ-ViT：`library/Quantization/RepQ-ViT.md`（ICCV 2023，开源）—— 4 张卡
  - PD-Quant：`library/Quantization/PD-Quant.md`（CVPR 2023，开源）—— 4 张卡
  - QD-BEV：`library/Quantization/QD-BEV.md`（ICCV 2023，开源）—— 4 张卡
  - BRECQ：`library/Quantization/BRECQ.md`（arXiv:2102.05426 / GitHub 自述 ICLR 2021，开源）—— **0 张卡**
  - PTQAT：`library/Quantization/PTQAT.md`（ICCV 2025，暂无开源）—— 2 张卡
  - EMC2：`library/Multimodal_Fusion/EMC2.md`（ICCV 2025，未完全开源）—— 2 张卡
  - 全库 116 张卡 status 均为 asserted，0 verified（本次 `grep -c` 核实）。

------

## 1. 任务与定位速览

| 笔记 | 范式 | 目标域 | 校准 / 训练数据（笔记记录） | 硬件 / 部署实测（笔记记录） |
| --- | --- | --- | --- | --- |
| BRECQ | PTQ（block 重建 + 混合精度） | CNN 分类 + COCO 检测 | ImageNet 1024 张 / COCO 256 张 | 单卡 GTX 1080TI 20 分钟出 ResNet-18（§3.3） |
| PD-Quant | PTQ（全局预测度量 + 分布修正） | CNN 分类 | 「如 1024 张图」（笔记 §2.1；论文 Table 2 caption 明确 1024 张，本次核实） | RTX A6000（论文，本次核实） |
| RepQ-ViT | PTQ（量化-推理解耦 / 尺度重参数化） | ViT 分类 | 32 张图（来源 split 笔记未注明；1.3 分钟对应 DeiT-S，本次核实） | 单卡 RTX 3090 校准 1.3 分钟（§3.3） |
| OmniQuant | PTQ（可学习量化参数 LWC/LET） | LLM | WikiText2 的 128 段 2048-token 文本（论文 §4.1，见卡 claim-omniquant-w4a4-llama7b-zeroshot-5265） | A100-80G + MLC-LLM 吞吐实测（§4 实验 4） |
| QwT | PTQ 后补偿插件（闭式解） | CNN/ViT 分类 + COCO + CLIP/LLM/DiT | 512 张图转 token（QwT.md §2） | 推理延迟 +3%（QwT.md §5） |
| QD-BEV | QAT（渐进量化 + 视点引导蒸馏） | 多视角 3D 检测（BEVFormer） | nuScenes（QAT 全量训练） | 模型体积与 sAP（§3.4/§3.5），无延迟实测 |
| PTQAT | 混合 PTQ+QAT（选层微调） | 3D 感知（检测/分割/占据） | nuScenes val（据 arXiv:2508.10557，卡 claim-ptqat-w4-outperforms-full-qat-fewer-params） | TensorRT 引擎 FPS/显存实测（§3.3，GPU 型号笔记未注明） |
| EMC2 | **非量化**：MoE 动态激活 + 系统优化 | 多模态 3D 检测（边缘） | KITTI / nuScenes 训练集 | Jetson AGX Orin 372.5ms / 229.3ms（EMC2.md §5.1/§5.2） |

### 1.1 比特配置矩阵（WxAx × 模型规模；均为笔记所录论文声称）

| 方法 | 低比特主打 | 覆盖位宽 | 模型规模跨度 |
| --- | --- | --- | --- |
| BRECQ | W2A32（weight-only INT2 首创）/ W4A4 | 4/32、3/32、2/32；4/4、2/4；COCO 4/8、2/8；混合 {2,4,8} | ResNet-18/50、MobileNetV2、RegNet-600MF/3.2GF、MnasNet（FP top-1 71.08–78.36）；COCO Faster RCNN/RetinaNet |
| PD-Quant | W2A2 / W2A4 | 4/4、2/4、4/2、2/2（论文 Table 3，本次核实）；度量对比用 W8A2/W4A2 | 同 BRECQ 赛道：ResNet-18/50、MobileNetV2、RegNetX、MNasNet |
| RepQ-ViT | W4A4 | 4/4（主表）、6/6（论文同表含 6/4 块，本次核实） | ViT-B、DeiT-S、Swin-S 为笔记所录三档（论文表覆盖 7 列）；FP 84.54 / 79.85 / 83.23 |
| OmniQuant | W4A4 / W2A16g128 | W2A16g128、W3A16、W4A4、W4A16g128（部署）、W4A8/W8A4（附录）、W6A6 | LLaMA-1/2 7B–70B、Falcon-180B |
| QwT | W4A4（叠加在既有 PTQ 上） | 分类 4/4、6/6；COCO 6/6、8/8、4/4；CLIP 6/6、8/8；LLaMA3 4-bit（GPTQ 之上）；DiT W4A8 | ResNet-50（102.2MB）→ ViT-B（346.3MB）→ LLaMA3-8B → DiT-XL/2 |
| QD-BEV | W4A6 | PTQ 曲线 W8A8/W6A6/W4A6/W4A4；最终模型 W4A6 | BEVFormer-Tiny/Small/Base（FP32 126.8 / — / 262.9 MB） |
| PTQAT | W4（权重） | W4（主实验）；W8A8（TensorRT 部署） | SparseBEV（44.6M 可训练参数）、BEVFormer（69.0M）、BEVDepth4D |
| EMC2 | —（非量化） | — | 87M（动态平均激活参数，EMC2.md §5.2）vs BEVFusion 156M |

定位差异（口径前提）：八篇横跨四个任务域（CNN 分类 / ViT 分类 / LLM / 3D 感知）加一条非量化路线，**库内不存在同任务同口径同位宽的横向 leaderboard**；任何跨行数值比较都属口径错配（§5）。

------

## 2. 方法路线逐项对比

### 2.1 范式谱系：PTQ 主线四代 + QAT 两家 + 非量化对照

- **BRECQ（2021，谱系源头）**：以二阶误差（Gauss-Newton / FIM 对角 = 平方梯度）分析 PTQ，结论是重建粒度取 block 最优。BRECQ.md §3.2：「We think this is because the main off-diagonal loss in the Hessian is concentrated in each block … while the inter-block loss is small and can be ignored in the optimization.」消融 Table 1（ResNet-18 W2：Layer 65.19 / **Block 66.39** / Stage 66.01 / Net 54.15；MobileNetV2 W2：52.13 / **59.67** / 54.23 / 40.76）。
- **RepQ-ViT（2023，ViT 分支）**：不修权重，改量化器形态——「在量化阶段使用**复杂的量化器**（保精度），在推理阶段通过**尺度重参数化（Scale Reparameterization）**将其无缝转换为**简单的量化器**（保速度）」（RepQ-ViT.md §1）。两处重参数化全部针对激活（LayerNorm 后逐通道→逐层、Softmax 后 log_√2→log_2）。
- **PD-Quant（2023，度规分支）**：诊断与 BRECQ §1 同构——「局部重建误差最小化 ≠ 全局任务损失最小化。」（PD-Quant.md §1）；处方是把量化误差传播到最终输出算 KL（PD 损失）+ 用 BN running stats 修正校准分布（DC）。
- **OmniQuant（2024，LLM 分支）**：「OmniQuant 冻结原始模型参数，引入少量**可学习的量化参数 (Learnable Quantization Parameters)**，通过梯度下降在少量数据上优化这些参数」（OmniQuant.md §1）——LWC 学裁剪阈值（权重侧）、LET 学等价变换（激活侧），推理零成本融合。
- **QwT（2025，补偿分支）**：允许结构修改，「在量化后的每一个网络块（Block）后面并联一个极其轻量级的线性补偿层」（QwT.md §1），闭式解线性回归 + R² 门控。QwT 直接以 RepQ-ViT / Percentile / GPTQ / Q-DiT 为基座（QwT.md §4.1–4.3 各表）。
- **QD-BEV（2023，QAT 路线）**：「作者将量化过程分为四个阶段，按敏感度排序逐步引入」（QD-BEV.md §2，顺序 Backbone→Neck→Encoder→Decoder）+ 外参门控的视点引导蒸馏。
- **PTQAT（2025，混合路线）**：先跑一遍 PTQ 预检查各层输出 MSE，只微调「误差小」的层、冻结其余（近 50%）。
- **EMC2（2025，非量化对照）**：「通过动态激活异构专家模型，在边缘端实现了精度与效率的平衡」（EMC2.md §1）——效率来自按场景路由到 2D CNN / 3D 稀疏卷积 / 多模态三类专家 + 算子与系统优化，笔记全文无任何量化内容。

记录：PTQ 五篇对同一问题（低比特精度崩塌）给出四种互不排斥的处方（改重建粒度 / 改量化器形态 / 改优化度量 / 学量化参数 / 事后补偿）；QwT 与 RepQ-ViT 是**叠加关系**而非竞争关系（QwT.md §4.1 直接以 RepQ-ViT 为基座）。EMC2 与量化正交：它压缩的是"激活的参数量"而非"位宽"，库内无人验证两者可组合。

### 2.2 误差处理哲学：修哪里（三张互相制衡的处方单）

- **修传播路径（PTQAT）**：「**核心反直觉发现**：应该去微调那些**"量化前后输出误差小"**的层（阻断误差传播），而不是去微调"误差大"的层（试图修复误差源头）。」（PTQAT.md §1）机理：「误差小的层之所以误差小，是因为它们吃的是"完美的 FP32 输入"」（PTQAT.md §2.2）；其消融 Table 6 中 MSE-Opposite「表现垫底」（PTQAT.md §3.2）。
- **不修、兜底（QwT）**：R² 门控在拟合失败时放弃补偿——「说明线性拟合失败，强制令 $W=0, b=0$」（QwT.md §3）。与 PTQAT 同属"不硬修源头"，但 QwT 的兜底有明确边界（见 §3-S2）。
- **按敏感度排序渐进引入（QD-BEV）**：以「Backbone 和 Encoder 是核心瓶颈」的模块敏感度表（QD-BEV.md §3.1）为序，逐模块开量化。
- **修量化器/量化参数本身（RepQ-ViT / OmniQuant）**：两者都在"让误差不再产生"而非"修复已产生误差"：RepQ-ViT 换量化器形态，OmniQuant 用 LET 把激活离群压力「转移痛苦」给权重（OmniQuant.md §3.1）再以 LWC 压制。

记录：PTQAT 的"选层"与 QD-BEV 的"排序"都在做**层粒度的资源分配**，但对象相反（选谁微调 vs 选谁先量化），且评价口径不同（Table 6 消融 vs Table 1 敏感度），笔记层面无法仲裁孰优；两者与 BRECQ 的 block 粒度选择（§2.1）共同指向「误差处理需要亚网络粒度策略」这一层共识。

### 2.3 激活难点共识（激活比权重难，四家同向）

- OmniQuant 附录：「**W4A8 的效果远好于 W8A4**……激活值比权重更难量化」（OmniQuant.md §6.4 (2)）。
- QD-BEV PTQ 曲线：Base 同权重 4-bit 下，激活 6→4-bit 使 NDS 0.226→0.023、mAP 0.076→0.000（QD-BEV.md §3.2 Table 2，本次与 arXiv 原表核对一致）。
- RepQ-ViT 两个重参数化全部针对激活；BRECQ §4.2（BRECQ.md §3.3）录有「To be noted, Brecq is the first to promote the 2W4A accuracy of PTQ to a usable level while all other existing methods crashed」——其 W2A4 可用而 weight-only INT2 更早可用，也是激活侧更难的旁证。
- Softmax / 长尾激活的专门处理两家呼应：OmniQuant「**4-bit Softmax 会导致精度严重下降**」（OmniQuant.md §6.4 (3)）；RepQ-ViT 为 Softmax 后幂律分布专门设计 log 量化器重参数化（RepQ-ViT.md §2.2）。

------

## 3. 结论之间的互相支持

- **S1 朴素 PTQ 在 ≤4-bit 崩塌，五域同向**：QD-BEV.md §3.2「当位宽低于 8-bit 后，PTQ 性能崩塌。**4-bit 下模型近乎失效**」（NDS 0.023 / mAP 0.000）；BRECQ.md §1.1 转引 DFQ 4-bit 只剩 39% top-1；PTQAT.md §3.1 纯 PTQ 使 SparseBEV mAP 45.4→30.5、BEVFormer 41.6→23.2；RepQ-ViT.md §3.1 此前方法 FQ-ViT W4A4 全线 0.10；OmniQuant.md §4 实验 2 SmoothQuant W4A4 38.41%。**注意边界**：每域都有专门方法把精度救回（RepQ-ViT 69.03 / OmniQuant 52.65 / QD-BEV-QAT 0.485 / PTQAT 55.2 NDS），所以崩塌结论必须绑定「朴素/常规 PTQ 方法」，不能推出「低比特不可行」——claim-qdbev-ptq-collapses-below-8bit 的限定 1 已明确此点。
- **S2 校准集口径主线：五家同题不同解（本报告核心线，QwT 教训为轴）**：
  - **QwT（教训本体）**：R² 门控在校准集上计算（「采样点 $N$ 为 512 张图像转换后的 token 数」，QwT.md §2）；R²≤0 分支才有"不劣于"保证，R²>0 分支仅校准集意义下成立、测试集无理论保证，论文补充材料含 BoolQ −0.03 / HellaSwag −0.51 逐数据集退化实例（QwT.md §3 的 2026-11-03 限定注，依据 nightshift/verify/claim-qwt-r2-gate-nonregression.md；卡 claim-qwt-r2-gate-nonregression：「**不保证测试集上一定不退化**」）。
  - **BRECQ（最早的过拟合动机）**：网络级重建失败的原因被论文归为「optimizing the whole networks over 1024 calibration data samples leads to over-fitting easily」（BRECQ.md §3.2）——用"缩小重建粒度"来治校准过拟合。
  - **PD-Quant（最极端的实证）**：PD 损失单独使用时校准 70.51% vs 验证 1.07%（PD-Quant.md §4.2 Table 2，本次与论文核对一致），卡 claim-pdquant-pd-loss-alone-overfits-calibration 与 claim-qwt-r2-gate-nonregression 互为 related，同属「校准集结论 ≠ 测试集结论」主线。
  - **OmniQuant（同源校准风险）**：校准为「128 randomly selected 2048-token segments from WikiText2」（claim-omniquant-w4a4-llama7b-zeroshot-5265 evidence，论文 §4.1）；其 W2A16g128 头条数字恰是 WikiText2 PPL（9.72），校准与评测同语料，卡 claim-omniquant-w2a16g128-llama7b-ppl-beats-gptq-awq 明确标注「同源乐观风险」。
  - **RepQ-ViT（口径未注明）**：校准仅 32 张图（claim-repqvit-calibration-32-images-1point3-min），来源 split 笔记未注明；主卡 claim-repqvit-w4a4-imagenet-leads-ptq-baselines 限定 1 要求复现前先确认校准/测试不重叠。
  - 记录：五家共享同一条纪律——**任何 PTQ 数字引用前先问校准集大小、来源 split、与评测集的关系**；这是库内唯一贯穿全部八篇的方法论共识，且全部 22 张卡均以不同形式记录了该限定。
- **S3 等效变换的"免费硬件友好形态"家族**：RepQ-ViT 把逐通道/log_√2 重参数化进 LayerNorm 与移位运算（RepQ-ViT.md §2）；OmniQuant LET 融合进 LayerNorm 实现「零成本推理」（OmniQuant.md §3.3）；QwT 补偿层只加 ~3% 延迟（QwT.md §5「推理延迟仅增加约」）。三家同向：部署约束（逐层量化 / 移位 / 无额外算子）可以不靠重训、靠数学变换满足。
- **S4 误差集中在特定模块，跨架构互证**：BRECQ 的 off-diagonal Hessian 集中在 block 内（§2.1）；QD-BEV 的 Encoder/Backbone 瓶颈（claim-qdbev-encoder-backbone-quantization-bottleneck，单模块 W4A6 量化 Neck/Decoder NDS 变化 ≤0.002）；OmniQuant 发现「LayerNorm 之后的第一层 Linear (q_proj, k_proj, v_proj) 的离群值最严重」（OmniQuant.md §6.3 (1)）。三篇分别从二阶误差、模块消融、激活统计得出同形态结论。
- **S5 蒸馏 / 全局任务信号对齐优于纯局部重建**：PD-Quant 的 PD 损失（KL 到最终输出）与 QD-BEV 的 VGD（图像域 + BEV 域 KL 蒸馏）在"用任务级信号约束量化误差"上同向；BRECQ §3.1（Theorem 3.1）把二阶误差等价转到网络输出上也与之同构，但 BRECQ 明确蒸馏式全网络重建数据/算力不可行（BRECQ.md §2.2）。

------

## 4. 矛盾 / 张力 / 单源结论（均不构成【谁更好】判断）

- **C1（张力，域错配非真矛盾）**：同为 W4A4 PTQ，RepQ-ViT 在 ImageNet ViT 上 68.48–79.45「可用」，QD-BEV 的 BEVFormer-Base 在 nuScenes 上 mAP 0.000。两者不矛盾（任务域与激活分布不同），但正因如此**任何「W4A4 可行/不可行」的断言都必须绑定域**——claim-qdbev-ptq-collapses-below-8bit 与 claim-repqvit-w4a4-imagenet-leads-ptq-baselines 互为反例边界。
- **C2（单源）PTQAT「反超全参数 QAT」**：SparseBEV 44.6/55.2 vs 43.6/54.3、BEVFormer 38.6/49.1 vs 38.0/48.8（PTQAT.md §3.1 Table 1；卡 claim-ptqat-w4-outperforms-full-qat-fewer-params）。论文未开源（笔记头部「暂无」），无任何第三方交叉验证；Table 6 的反直觉消融（挑误差小的层）同样单源。
- **C3（单源）QD-BEV「渐进 QAT >> 标准 QAT」**：Base W4A6 NDS 0.485 vs 0.224（claim-qdbev-progressive-qat-beats-standard-w4a6）。据该卡限定 1（ar5iv HTML 版 Table 3，2026-11-02 抓取）：Tiny 差 0.022、Small 差 0.046，**差距随模型规模放大**，不能把 0.261 的 Base 差距套到所有规模。
- **C4（单源）BRECQ「首末层留 8-bit 非必需」**：W4 下全量化精度几乎无损（≤0.2%），ResNet-18 全 4-bit 比「2-bit + 首末层 8-bit」更快还更准（BRECQ.md §3.7 Table 6 及「Such phenomenon indicates the potential power of the mixed precision」）。反经验法则结论，无卡、无第三方复现。
- **C5（单源）BRECQ「追平 QAT 且快 240 倍」**：「PTQ can attain 4-bit ResNet and MobileNetV2 comparable with QAT and enjoy 240 times faster production of quantized models」（BRECQ.md §1.1，Abstract）。对比对象是 PACT/DSQ/LSQ（100 GPU hours vs 0.4），属 2021 年时点的 QAT 基线；PTQAT（2025）的「更少参数反超 QAT」是同一问题的新答案，两者口径不可比（§5-M9）。
- **C6（单源）EMC2 的 <400ms 是期望值不是上界**：claim-emc2-orin-sub400ms-leading-accuracy 限定 2：「APE 单专家在远场模糊场景要 526ms（笔记 §5.3 消融），<400ms 是全场景平均，**不是最坏情况延迟**」。量化路线（QD-BEV/PTQAT）的延迟是确定性的，MoE 动态路由的延迟是场景相关分布——这是两类效率路线的工程取舍点，笔记层面无任何一篇同时测过两者。
- **C7（记录）OmniQuant 笔记末尾的 BEVFusion 适配章节非论文内容**：OmniQuant.md「# BEVFusion网络可以用吗？」起（含「LWC 是通用的"万金油"，BEVFusion 肯定能用」）为笔记作者/对话生成的推演，无对应论文实验；本对比不将其计入 OmniQuant 的证据，仅记录其存在。RepQ-ViT 笔记 §3.3 后的「全生命周期流动过程」长文与 QwT 笔记 §5「建议方案」同类，均属非论文实验的推演内容，引用时须与论文结果区隔。

------

## 5. 数据集与指标口径差异（标注「不可直接对比」处）

- **M1 任务域割裂**：ImageNet top-1（BRECQ / PD-Quant / RepQ-ViT / QwT 分类表）、WikiText2 PPL + 六任务零样本（OmniQuant / QwT LLaMA3 表）、nuScenes NDS/mAP/sAP（QD-BEV / PTQAT）、KITTI R40 Hard AP（EMC2）、COCO AP（QwT / BRECQ 检测表）。**五族数字之间不存在任何换算关系，不可直接对比。**
- **M2 同位宽不同语义**：同为「W4A4」，RepQ-ViT 指 ImageNet top-1、OmniQuant 指六任务零样本平均准确率、QD-BEV 指 nuScenes 检测（且在其 PTQ 曲线中作崩塌参照）。三处 W4A4 数值并列无意义。
- **M3 PPL 口径分裂**：OmniQuant 消融的 12.87 是 WikiText2 与 C4 的**平均值**（卡 claim-omniquant-let-lwc-ablation-w4a4-best 限定 1，WikiText2 单项约 11.23）；QwT LLaMA3-8B 的 6.65→6.63 是 WikiText2 单项（QwT.md §4.3）。两条 PPL 不可同表引用。
- **M4 硬件各表各算**：A100-80G（OmniQuant 部署、PTQAT 训练）、RTX 3090（RepQ-ViT 校准）、GTX 1080TI（BRECQ 校准）、RTX A6000（PD-Quant，本次核实）、Jetson AGX Orin + RTX A4000（EMC2 及其基线）、TensorRT（PTQAT 部署，笔记未注明 GPU 型号）。RepQ-ViT 的 1.3 分钟是**校准耗时**不是推理延迟（claim-repqvit-calibration-32-images-1point3-min 口径限定）；OmniQuant 的 91.3 tokens/s 是 512-token 生成平均吞吐、无批大小与尾延迟（claim-omniquant-w4a16g128-llama13b-a100-913toks 限定）。
- **M5 校准数据量纲不一**：512 张图转 token（QwT）/ 128×2048-token 文本段（OmniQuant）/ 32 张图（RepQ-ViT）/ 1024 张图（PD-Quant、BRECQ-ImageNet）/ 256 张图（BRECQ-COCO）。这些数字之间不可排序——域不同、且「张」与「token 段」不是同一单位。
- **M6 基线来源混杂**：PD-Quant 论文 Table 3 的 QDrop 行是作者自行实现（表注「* denotes our implementation using open-source codes. Other results listed are all from [47]」，本次核实）；RepQ-ViT 主表的 FQ-ViT/PTQ4ViT/APQ-ViT 为转引且 No HP/No REC 设定不对齐（claim-repqvit-w4a4-imagenet-leads-ptq-baselines 限定 2）；BRECQ Table 4 的 PACT/DSQ/LSQ/HAQ 为转引。**跨论文引用基线行数字时必须回到该基线的原始论文核对口径。**
- **M7 nuScenes 指标族内部差异**：QD-BEV Table 6 的 sAP 是流式指标（0.136→0.337 的「提升近 1.5 倍」来自量化降低延迟、减少流式过期，QD-BEV.md §3.5），与 Table 4 的 NDS/mAP 语义不同；PTQAT Table 1/5 用 mAP/NDS。同在 nuScenes val 但 sAP 与 NDS 不可互比。
- **M8 压缩倍数口径不一**：QD-BEV「体积压缩 8 倍」= 126.8/15.9 MB（FP32 存储比，W4A6）；OmniQuant 部署「节省 ~71%（WM 口径）」= (24.3−7.0)/24.3（W4A16g128）。位宽、分子分母、是否含运行显存均不同，不能并列为「压缩率」。
- **M9 时代差**：BRECQ（2021）的「PTQ 追平 QAT」以 PACT/DSQ/LSQ 为 QAT 基线；PTQAT（2025）的「混合量化反超 QAT」在 nuScenes 上。五年间 QAT 基线本身在演进，两处「对比 QAT」的结论不可串接。
- **M10 模型大小口径不一**：EMC2 的 87M 是**动态平均激活参数**（EMC2.md §5.2），QD-BEV 的 15.9 MB 是**打包存储**，PTQAT 的 44.6M/18.7M 是**可训练参数**。三个「规模」数字互不可比。
- **M11 QD-BEV Table 4 分辨率块**：本次核实 arXiv 原表，Tiny 块标注 450×800、Base 块标注 900×1600（部分行带分辨率前缀）；Table 6 为 900×1600。claim-qdbev-tiny-w4a6-nds-surpasses-fp32 限定 3 的悬问（Table 4 与 Table 6 是否同口径）就此部分解决：Base 行同口径，Tiny 行不同。

------

## 6. 按可靠性分层（所有数字均为论文声称；全库 0 verified，故无任何数字达到「可依据」层）

### A. 双源核对过的数字（笔记 + 论文原文）

- **A1 RepQ-ViT 全部四张卡所指数字**（本次抓取 arXiv:2212.08254v2 逐格核对一致）：W4A4 主表 68.48/69.03/79.45 与 FP 84.54/79.85/83.23、FQ-ViT 0.10、PTQ4ViT 30.69/34.08/76.09、APQ-ViT 41.41/43.55/77.15；LayerNorm 消融 33.17/70.28/69.03（Swin-S 另有 57.63/80.52/79.45，笔记未录）；Softmax 消融 log_2 67.71 / log_√2 69.03 / 重参数化 69.03（Swin-S 77.87/79.45/79.45，论文正文「1.58% improvement over simple log2」与 79.45−77.87 相符，佐证笔记行序解读正确）；效率表 32 张/1.3 分钟（FQ-ViT 1000/0.5、PTQ4ViT 32/3.2）。对应卡：claim-repqvit-w4a4-imagenet-leads-ptq-baselines、claim-repqvit-layernorm-reparam-recovers-layerwise、claim-repqvit-softmax-reparam-log2-lossless、claim-repqvit-calibration-32-images-1point3-min（均 asserted）。
- **A2 QD-BEV 全部五张表**（本次抓取 arXiv:2308.10515 最新版核对一致）：Table 1 模块敏感度（仅 Backbone 0.310/0.417/0.440、仅 Encoder 0.295/0.421/0.303、Neck/Decoder 变化 ≤0.002）；Table 2 PTQ 曲线（W8A8 0.487/5.8%、W6A6 0.402/22.2%、W4A6 0.226/56.3%、W4A4 0.023/95.6%/mAP 0.000）；Table 3（0.224 vs 0.485）；Table 4（126.8→15.9 MB、0.354→0.372、Base 262.9→32.9 MB、0.517→0.509）；Table 6（sAP 0.136→0.337）。对应卡：claim-qdbev-ptq-collapses-below-8bit（此卡原为单源，本次升级为双源）、claim-qdbev-encoder-backbone-quantization-bottleneck、claim-qdbev-progressive-qat-beats-standard-w4a6、claim-qdbev-tiny-w4a6-nds-surpasses-fp32（该卡 evidence 本已含 arXiv 摘要引文，均 asserted）。
- **A3 OmniQuant 四张方法卡**：卡内已附 arXiv:2308.13137v3/v1 pdftotext 引文（Table 1/2/3/A2，2026-11-02 抓取）——W2A16g128 9.72 vs GPTQ 44.01/AWQ 2.6e5；W4A4 零样本 52.65% vs SQ 38.41/LLM-QAT 41.27；W4A16g128 部署 7.0 GB/91.3 tokens/s vs FP16 24.3/27.1 GB/52.5；消融 12.87/16.97/15.80/28.78。对应卡均 asserted；笔记两处表格错位已于 2026-11-03 修正（claim-omniquant-note-table-mismatch）。
- **A4 PTQAT 两张卡**：卡内附 arXiv:2508.10557 Table 1/5 引文（W4 主线、W8A8 TensorRT）。均 asserted。
- **A5 EMC2 两张卡**：claim-emc2-note-table-mismatch 记录 2026-11-03 已按 arXiv:2507.04123v1 + CVF camera-ready 双版本逐格重建笔记 Table 1；claim-emc2-orin-sub400ms-leading-accuracy 的 372.5ms/229.3ms 与三类 Hard AP 有 arXiv 引文。均 asserted。
- **A6 BRECQ 笔记**：无卡；笔记自述 quote 95 条经脚本验证、表格与原文核对（BRECQ.md TODO），本次另抽查 arXiv HTML v2 中 69.60/66.39/66.30/54.15/40.76 等关键数字存在。BRECQ 数字目前处于「笔记自检 + 本次抽查」层。
- **A7 PD-Quant 部分数字**（本次抓取 v1/v3/CVF 三版本核对）：R18 2/2（QDrop 51.42/PD-Quant 53.14）、MobileNetV2 4/2（17.30/20.10）、MNasNet 2/2（23.59/27.58）；Table 2 PD-only 行（校准 70.51/验证 1.07）；Table 1 中 W8A2 MSE 23.15、PD 28.41；校准配置（ImageNet、1024 张、20000 次迭代、RTX A6000——补上了 PD-Quant 各卡「笔记未注明」的口径）。

### B. 单源自报、无交叉验证（笔记/论文自报，复现性未知）

- OmniQuant 的校准域鲁棒性主张（Table A10 仅 PPL 方差 0.0006–0.17，未覆盖 W2A16，见 claim-omniquant-w2a16g128-llama7b-ppl-beats-gptq-awq 待验证）；「128 样本即可收敛」（OmniQuant.md §6.3）。
- QwT 的 CLIP 29.8→43.5、LLaMA3 6.65→6.63、DiT FID −0.69（QwT.md §4.3）与「存储增加约 2%-4%」（QwT.md §5，论文本次抓取两版本均只查到「average 1.9 percentage points improvement」的精度句，未见 2-4% 存储句，见 §8-4）。
- BRECQ 的混合精度 +10%（§3.6）、GA 3 秒（§B.4.4）、「240 倍快于 QAT 生产」（§1.1）。
- PTQAT 的反直觉消融 Table 6（MSE-Opposite 垫底）与 TensorRT 环境未注明 GPU（claim-ptqat-w8a8-tensorrt-accuracy-recovery 限定）。
- EMC2 的 nuScenes mAP 0.7241/NDS 0.7316 表内领先（claim-emc2-orin-sub400ms-leading-accuracy 限定 1：同硬件延迟对比实际只在 EMC2 与 PointPillar 972ms 之间有直接数字）。
- 全部 22 张卡 status=asserted 本身即此层标记；stance 均为 watch。

### C. 存疑（本次原文复核发现与论文不符，引用前必须回原文）

- **C1 PD-Quant 笔记三张表部分数字在论文 v1/v3/CVF 三个版本中均不存在**（2026-11-03 抓取核对）：
  - §4.3 Table 3 的 **BRECQ 列**（46.58/55.33/15.11/20.33）：论文 Table 3 无 BRECQ 行列；笔记「| **ResNet-18**   | 2/2           | 46.58%    | 51.42%    | **53.14%**   |」的前半无出处。**「PD-Quant 均高于 BRECQ」的对比在论文中不存在**，claim-pdquant-beats-brecq-qdrop-lowbit 的 BRECQ 半边主张（asserted）失去论文依据，该卡 falsifier 2 被触发。
  - §4.3 Table 3 的 **ResNet-50 行**：「| **ResNet-50**   | 2/2           | 55.33%    | 61.94%    | **63.15%**   |」——论文该位宽行为 QDrop 55.45 / PD-Quant 57.16（v1=v3=CVF 一致）；笔记的 61.94/63.15 无出处。QDrop 论文（arXiv:2203.05740v2）与 BRECQ 论文中亦未找到这些数（QDrop ICLR 2022 版 R18 W2A2 自报 51.14，非 51.42）。
  - §4.1 Table 1 的 Min-Max（1.83/0.81）、Cosine（23.36/15.68）、MSE W4A2（17.55）、PD W4A2（23.51）：论文对应为 Min-Max「-/-」（原文即无数字）、Cosine 11.09/4.15、MSE 23.15/**10.31**、PD 28.41/**12.27**。方向（PD > MSE > Cosine，Min-Max 全失）与论文一致，**但四个数字三个错**，claim-pdquant-pd-metric-beats-mse-cosine-2bit-activation 的具体数值主张（asserted）按 falsifier 2 受累。
  - §4.2 Table 2 的 +Reg 校准值 51.56（论文 71.09）、+Drop 校准值 53.07（论文 68.26）、**整行「PD + Reg + Drop + DC 53.33%/53.14%」**（论文 Table 2 无 DC 行）。claim-pdquant-dc-bn-stats-narrow-calibration-val-gap 的「DC +0.40%」消融依据（52.74→53.14）在论文 Table 2 中不存在；DC 机制描述与 BN 统计真值部分与论文 §3.3 一致，但数值证据目前只能追溯到 Table 3 完整方法的 53.14±0.14。
  - 受累卡：claim-pdquant-beats-brecq-qdrop-lowbit、claim-pdquant-pd-metric-beats-mse-cosine-2bit-activation、claim-pdquant-dc-bn-stats-narrow-calibration-val-gap（数值半边）、claim-pdquant-pd-loss-alone-overfits-calibration（核心 70.51/1.07 与验证侧恢复 1.07→49.16 仍双源成立，仅校准侧 51.56/53.07 两值不符）。
- **C2 QwT 笔记两处**（2026-11-03 抓取 arXiv:2411.13918 v1+v4）：
  - **版本差异**：笔记 §4.1 ResNet-50 W4A4 行（Percentile 68.4 / +QwT 74.5 / +QwT* 75.8）与 **v1 一致**；现行 v4（camera-ready 同源）为 62.3 / 68.5 / 72.5。笔记据此算出的「提升高达 6.1%」在 v4 下为 +6.2（62.3→68.5），结论方向不变、数字须随版本换。ViT-B 行（68.5→76.3，+7.8）两版本一致。
  - **列错位**：笔记 §4.2 Mask R-CNN 行「RepQ-ViT (PTQ) 36.1 / +QwT 43.1」——论文 Table 5（v1=v4 相同）列序为 Size|APbox|APmask，RepQ-ViT 行 Size=36.1MB、**APbox=42.6**、APmask=40.0；+QwT 为 44.0MB/43.1/40.4。即 APbox 实际 42.6→43.1（+0.5），笔记把 Size 当 APbox 读，虚增了 PTQ 基线的损失。
  - 受累卡：claim-qwt-r2-gate-nonregression 的 evidence 不涉及这两个表，未直接受累；但引用 QwT.md §4.1/§4.2 数字的一切下游须先修笔记。
- **C3 笔记自报口径缺口（非错误，但引用前须回原文补口径）**：RepQ-ViT 32 张校准图的来源 split（claim-repqvit-calibration 限定）；QD-BEV PTQ 是否用校准集（claim-qdbev-ptq-collapses-below-8bit 限定 2）；PTQAT 各阶段 epoch 数 N_i（claim-qdbev-progressive 卡限定 2 属 QD-BEV；PTQAT 的 θ 阈值敏感性见 claim-ptqat-w4 卡待验证）。

------

## 7. 对选型 / 部署的启示（主人用；全库 0 verified，以下一律为「论文声称 / 尚未独立验证」，不得写成事实）

- **LLM 边缘/单卡部署**：论文声称 OmniQuant W4A16g128 在 A100-80G MLC-LLM 上 7.0 GB / 91.3 tokens/s、加速约 1.74×（claim-omniquant-w4a16g128-llama13b-a100-913toks，asserted）；W4A4 精度 52.65% 的「超越 QAT」按卡限定应表述为「高于 LLM-QAT 41.27%（+6.22% 实对应 LLM-QAT+SQ 46.43%）」（claim-omniquant-w4a4-llama7b-zeroshot-5265，asserted）。部署前先确认：目标引擎对 per-token 4-bit 激活的内核支持（该卡 falsifier 4）与校准同源风险（同语料 WikiText2）。
- **ViT 4-bit PTQ**：论文声称 RepQ-ViT 单独 68.48/69.03/79.45（asserted，本次双源核对）、再叠 QwT 补偿至 76.3（ViT-B，asserted）；校准成本声称 32 张图、DeiT-S 1.3 分钟（本次核实该数对应 DeiT-S；Swin-S 2.9 分钟）。两条均未独立验证；「重参数化 + 闭式补偿」组合的叠加增益只有论文自报一条链。
- **BEV 感知 sub-8-bit**：论文声称朴素 PTQ W4A6 崩塌（NDS 0.226）、必须走 QAT+蒸馏（QD-BEV-T 0.372 反超 FP32-T 0.354，asserted，反超幅度 +0.018 单次自报）或混合量化（PTQAT W8A8 TensorRT 恢复精度、31 FPS，asserted）。两条 QAT 路线的训练成本（4 倍轮次 / 数万秒）在卡内均未量化完，进方案前按 claim-qdbev-progressive-qat-beats-standard-w4a6 与 claim-ptqat-w8a8-tensorrt-accuracy-recovery 的待验证清单补测。
- **极低比特（≤2-bit）**：BRECQ（无卡）与 PD-Quant 的 2-bit 主张中，**PD-Quant 笔记表格当前不可引用**（§6-C1）；BRECQ 的 W2A4/W2A32 数字有笔记级双源支撑但未立卡。此场景选型依据暂为空，需先补 BRECQ 建卡 + PD-Quant 笔记修复。
- **边缘多模态效率**：EMC2 路线（MoE 动态激活）与量化正交，论文声称 372.5ms/229.3ms（asserted）；但该延迟是全场景平均、APE 单专家 526ms（claim-emc2-orin-sub400ms-leading-accuracy 限定 2），做安全分析不能当上界；且笔记标注「没有完全开源」，复现受限。
- **通用检查项（本对比最可迁移的产出）**：任何 PTQ 数字先问三件事——校准集多大、来自哪个 split、与评测集是否同源（S2 五家教训）；PD-only 校准 70.51% vs 验证 1.07% 是「校准数字好看 ≠ 测试可用」的极端教材（claim-pdquant-pd-loss-alone-overfits-calibration，asserted）；引用任何笔记表格基线行前回原表逐格核对（OmniQuant/EMC2/PD-Quant/QwT 四个先例都在本库）。

------

## 8. 遗留问题（转调度班次 / QUESTIONS.md，不替主人决定）

1. **PD-Quant 笔记三表与论文不符**（§6-C1，本次 v1/v3/CVF 三版本核对）：建议按 EMC2/OmniQuant mismatch 卡先例立 `claim-pdquant-note-table-mismatch` 类卡并修正笔记——需主人同意后进行（本任务无 claims//library/ 写权限）。QDrop/BRECQ 列数字的真实出处待查（QDrop ICLR 2022 v2 与 BRECQ 论文中均未命中）。
2. **QwT 笔记两处**（§6-C2）：Mask R-CNN 行 APbox 列错位（36.1 实为 Size MB）；ResNet-50 行为 v1 数字、v4 已改，笔记未标注版本。建议同批修正并标注「依据 arXiv 版本」；涉及行若被卡 evidence 引用，按 RULES 铁律 3 同步处理。
3. **BRECQ 无 claim 卡**：八篇中唯一零卡方法；其 block-reconstruction 主张（Table 1）与「PTQ 追平 QAT / 240 倍」主张（Abstract）均未立卡。若立卡建议拆窄（重建粒度消融一张、成本-精度一张）。
4. RepQ-ViT 效率卡悬问已解：1.3 分钟对应 **DeiT-S**（Swin-S 为 2.9 分钟，本次 arXiv Table 5 核实），可在 claim-repqvit-calibration-32-images-1point3-min 卡内补注（需主人同意）；同卡另获证据：Swin-S 块存在（校准 32 张口径跨模型成立）。
5. QwT.md §5「平均精度提升 2.6% 以上」「存储增加约 2%-4%」两句在 v1/v4 中均未命中对应原文（v1/v4 均只查到 "average 1.9 percentage points improvement"，pdftotext 提取），出处待查；「推理延迟仅增加约 3%」有原文支撑（"with an overhead of only 3%"，pdftotext 提取）。
6. EMC2 开源不完整（笔记头部「没有完全开源」），SAD 动态调度的复现与最坏情况延迟（P99）只能等完整开源或自测。
7. 本报告 §6-A2 使 claim-qdbev-ptq-collapses-below-8bit 升级为双源（原单源）；该卡与 claim-qdbev-encoder-backbone-quantization-bottleneck 的 evidence 引文仍只有笔记侧，如需补 arXiv 侧 evidence 行须主人同意后修改卡。
