# PD-Quant: 基于预测差异度量的后训练量化

**出处会议：** CVPR 2023  
**是否开源：** https://github.com/hustvl/PD-Quant  
**关键词：** 训练后量化(PTQ)、预测差异度量、分布修正、全局感知

---

## 1. 概述

局部重建误差最小化 ≠ 全局任务损失最小化。

PD-Quant 提出从“局部特征相似”转向“全局预测一致”，通过引入预测差异度量和分布修正技术，显著提升了低比特量化的精度。

------

## 2. 方法

### 2.1 分布修正 (Distribution Correction, DC)

针对校准集样本（如 1024 张图）无法代表全局分布的问题，PD-Quant 利用预训练模型 BN 层中存储的全局统计量（Running Mean 和 Running Variance）作为“真值”，对输入特征图进行精修。

**优化目标：**

在量化当前块之前，保持权重固定，通过梯度下降优化该块的输入特征图 $A_{l-1}$ ：

$$
\min_{A_{l-1}^{DC}} \lambda_c \underbrace{\sum (||\hat{\mu}_{i,l} - \mu_{i,l}||_2^2 + ||\hat{\sigma}_{i,l} - \sigma_{i,l}||_2^2)}_{\text{第一项：分布对齐}} + \underbrace{||A_{l-1}^{DC} - A_{l-1}^{FP}||_2^2}_{\text{第二项：语义保持}}
$$

- **$\mu_{i,l}, \sigma_{i,l}$**：全精度模型 BN 层在海量训练集上积累的全局均值和方差。
- **$\hat{\mu}_{i,l}, \hat{\sigma}_{i,l}$**：当前校准批次经过该层后的实际统计量。
- **第一项（分布对齐）**：强制校准数据的分布向全局分布对齐。
- **第二项（语义保持）**：确保修正后的特征 $A_{l-1}^{DC}$ 依然保留原始图像的语义信息。

**结论**：DC 制造了一组更具代表性的“虚拟特征图”，为后续量化参数搜索提供了更准确的基准。

### 2.2 预测差异损失 (Prediction Difference Loss, PD)

为了让量化参数感知到对最终预测的影响，PD-Quant 将量化误差传播到最后一层。

**计算逻辑：**

1. 将修正后的特征 $A_{l-1}^{DC}$ 输入量化块。
2. 将该块的量化输出送入后续所有的**全精度层**。
3. 计算最终输出与原始全精度模型输出的 KL 散度。

**公式：**

$$
\mathcal{L}_{PD} = \sum KL(\text{Softmax}(O_{fp}) || \text{Softmax}(O_{pd}))
$$

这种方式不仅考虑了当前层的重建，还模拟了量化噪声对最终任务决策的影响。

### 2.3 带正则化的总损失函数

为了防止在极小校准集上产生过拟合，PD-Quant 引入了 MSE 正则化项，并结合权重舍入优化。

**总优化目标：**

$$
\arg \min_{\theta, S_a} \mathcal{L}_{PD}(O_{fp}, f_{l+1}(\overline{A}_l)) + \lambda_r ||A_l - \overline{A}_l||_2^2
$$

- **$\theta$**：权重的舍入参数（Rounding）。
- **$S_a$**：激活缩放因子（Scaling Factor）。
- **正则化项**：强制量化后的输出 $\overline{A}_l$ 在局部上也要接近全精度输出 $A_l$ 。

------

## 3. 算法执行流程 

1. **准备阶段**：加载预训练 FP32 模型，提取各 BN 层的全局统计量。
2. **分布修正阶段**：对于每一个 Block，通过梯度下降迭代优化输入激活值，得到 $A_{l-1}^{DC}$ 。
3. **参数初始化阶段**：利用 $A_{l-1}^{DC}$ ，通过 Min-Max 方案初步确定激活缩放因子 $S_a$ 。
4. **参数搜索阶段**：
   - 固定模型其他部分，仅针对当前块的 $\theta$ 和 $S_a$ 进行优化。
   - 计算总损失 $\mathcal{L}_{total} = \mathcal{L}_{PD} + \lambda_r \mathcal{L}_{reg}$ 。
   - 执行 20,000 次迭代更新参数。
5. **循环往复**：完成当前块量化，锁定参数，进入下一个 Block。

------

## 4. 实验结果与深度分析

### 4.1 激活缩放因子度量对比 (Table 1)

验证 PD 指标在寻找最优缩放因子时是否比传统指标更有效。论文 Table 1 caption 原文："Metric test (top-1 accuracy(%) on validation set for activation scaling factors"——即验证集 top-1 精度（%）；l/g 分别表示只用局部信息 / 用全局信息计算度量。

| **Metric**       | **ResNet-18 W8A2** | **ResNet-18 W4A2** | **ResNet-50 W8A2** | **ResNet-50 W4A2** | **RegNet-600M W8A2** | **RegNet-600M W4A2** |
| ---------------- | ------------------ | ------------------ | ------------------ | ------------------ | -------------------- | -------------------- |
| Min-Max          | -                  | -                  | -                  | -                  | -                    | -                    |
| Cosine (l)       | 11.09              | 4.15               | 2.19               | 1.14               | 0.96                 | 0.65                 |
| MSE (l)          | 23.15              | 10.31              | 9.23               | 4.85               | 3.71                 | 1.88                 |
| **PD (g, Ours)** | **28.41**          | **12.27**          | **11.31**          | **6.01**           | **7.47**             | **3.17**             |

- **分析**：在 2-bit 激活量化下，传统的局部度量（MSE/Cosine）几乎失效，而 PD 指标能准确捕获对精度贡献最大的激活范围。
- **2026-11-03 数字修正**：原表 Min-Max 1.83/0.81、Cosine 23.36/15.68、MSE W4A2 17.55、PD W4A2 23.51 在论文 v1/v3/CVF 三个版本中均不存在——Min-Max 行原文即为「-」（无数字），Cosine 论文值 11.09/4.15，W4A2 列论文值 MSE 10.31 / PD 12.27；现按论文原表逐格重建（并补齐 ResNet-50 与 RegNet-600M 两组列）。依据：https://arxiv.org/pdf/2212.07048v3 、https://arxiv.org/pdf/2212.07048v1 、https://openaccess.thecvf.com/content/CVPR2023/papers/Liu_PD-Quant_Post-Training_Quantization_Based_on_Prediction_Difference_Metric_CVPR_2023_paper.pdf （2026-11-03 抓取，pdftotext -layout 提取，三版本表格一致；与 nightshift/cross/quantization.md §6-C1 交叉一致）。

### 4.2 消融实验：过拟合与正则化 (Table 2)

在 ResNet-18 极端设置下验证各模块贡献。论文 Table 2 caption 原文："PTQ accuracy on ImageNet at ResNet18 with 1024 cali-bration images. Reg means regularization. Acc(val)/Acc(cali) de-notes the top-1 accuracy (%) on validation/calibration set."——即 ImageNet、1024 张校准图，列序为 Acc(val)（验证集）在前、Acc(cali)（校准集）在后。

| **Method**      | **Bits (W/A)** | **Acc(val)** | **Acc(cali)** |
| --------------- | -------------- | ------------ | ------------- |
| FP              | 32/32          | 71.01        | 70.90         |
| PD-only         | 2/2            | 1.07         | 70.51         |
| PD + Reg        | 2/2            | 49.16        | 71.09         |
| PD + Reg + Drop | 2/2            | 52.74        | 68.26         |
| PD-only         | 4/2            | 51.32        | 70.41         |
| PD + Reg        | 4/2            | 56.20        | 70.41         |
| PD + Reg + Drop | 4/2            | 58.17        | 68.36         |

- **分析**：仅使用 PD 损失会导致严重的过拟合（校准集高，验证集低），正则化 (Reg) 是恢复验证精度的关键，Random Drop 进一步提升。
- **DC 消融不在 Table 2**：论文 Table 2 无 DC 行。DC 的消融证据在附录 Table 11（"Effects on different calibration dataset sizes for PD-Quant"，W2A2）：校准 256/1024/4096 张时 ResNet-18 为 PD 46.76/52.74/55.30 → PD+DC 47.28/53.08/55.33（1024 张时 +0.34，论文明言「The effect of DC decreases as the size of calibration sets increases」）；MobileNetV2 为 PD 9.29/13.49/16.47 → PD+DC 9.48/14.17/16.55。
- **2026-11-03 数字修正**：原表 +Reg 校准 51.56%、+Drop 校准 53.07% 在论文 v1/v3/CVF 三个版本中均不存在（论文 Acc(cali) 为 71.09/68.26，且原表列序与论文相反——论文 val 在前）；原表整行「PD + Reg + Drop + DC 53.33%/53.14%」论文不存在。53.14 是论文 Table 3 完整方法 ResNet-18 2/2 的值，不是 Table 2 的 DC 行。依据同 §4.1 修正注记（同批三版本实抓核对）。

### 4.3 与 SOTA 方法对比 (Table 3)

在不同架构上对比当前顶尖的 PTQ 方法（ImageNet top-1 精度，%）。论文 Table 3 **无 BRECQ 列**（原表基线为 ACIQ-Mix / LAPQ / Bit-Split / AdaRound / QDrop，另含 4/4、2/4 位宽与 RegNetX-600MF / RegNetX-3.2GF 列，此处摘录 QDrop 对照列）；表注原文 "* denotes our implementation using open-source codes. Other results listed are all from [47]"——QDrop 行是作者用开源代码自行实现，其余基线行转引自 QDrop 论文；PD-Quant 结果为 10 次随机校准集运行的 mean±std。校准集大小 Table 3 caption 未直接写明，论文 §4.1 实验设置与附录 Table 11（QDrop 1024 张列同值 51.42）指向 1024 张（推断，非原文直接声明）。

| **Model**       | **Bit (W/A)** | **QDrop***  | **PD-Quant** |
| --------------- | ------------- | ----------- | ------------ |
| **ResNet-18**   | 2/2           | 51.42       | **53.14±0.14** |
| **ResNet-50**   | 2/2           | 55.45       | **57.16±0.15** |
| **MobileNetV2** | 4/2           | 17.30       | **20.10±0.37** |
| **MNasNet**     | 2/2           | 23.59       | **27.58±0.60** |

- **分析**：在笔记摘录的四个低比特设置下 PD-Quant 均高于 QDrop（+1.72 / +1.71 / +2.80 / +3.99 个百分点）。特别是在 MobileNet 和 MNasNet 等紧凑型网络上，由于其对分布更敏感，PD-Quant 带来的增益更加显著（最高接近 4 个百分点）。
- **2026-11-03 数字修正**：原表 BRECQ 列（46.58/55.33/15.11/20.33）在论文 v1/v3/CVF 三个版本中均不存在——论文 Table 3 没有 BRECQ 基线，这些数在 QDrop 论文（arXiv:2203.05740v2）与 BRECQ 论文中也未命中，**「PD-Quant 均高于 BRECQ」的对比在论文中不存在**；ResNet-50 行原 61.94/63.15 同样三版本均不存在，论文该位宽行为 QDrop 55.45 / PD-Quant 57.16±0.15。依据同 §4.1 修正注记（同批三版本实抓核对）。

------

## 5. 总结

PD-Quant 的核心逻辑推导：

1. **数据层面**：利用 BN 统计量通过 DC 修正校准集特征，提供更稳健的优化起点。
2. **指标层面**：利用 PD 损失将优化目标与最终任务表现挂钩，解决了局部 MSE 的偏差问题。
3. **优化层面**：通过正则化与 Random Drop 抑制小样本过拟合，保证了模型在 2-bit 极低比特下的泛化性能。
