# 拟合诊断中的 Batch、归一化与采样

**类型：** 综述

**笔记性质：** 个人实验技巧与项目复盘；保留机制解释、适用条件及原始证据。

**知识状态：** L1 来源笔记，尚未由用户独立验证。标准统计推导、解释机制的构造例子与项目观测分别标注；本文不构成用户签署的 verified claim。

**整理日期：** 2026-11-04（Asia/Shanghai）

**主题：** 实验设计 / Batch / 归一化 / 时序采样 / 拟合诊断

本文来自 BEV-Planner/K-Radar 拟合失败后的复盘，回答两个问题：为什么把 batch 从 1 改大可能显著改变训练；怎样在实验设计阶段检查这种风险，而不等长训失败后逐项猜测。

## 1. 先把三个不同的 batch 写清楚

设每卡真实 batch 为 b、设备数为 D、梯度累积次数为 A。在各卡和各微批大小相同、loss 正确缩放并同步梯度时，一次参数更新平均的样本数为：

$$
B_{\mathrm{grad}}=D\,b\,A.
$$

这个数字不等于所有 BN 实际使用的统计范围。

| 对象 | 决定什么 | 必须检查的条件 |
| --- | --- | --- |
| 梯度 batch | 一次更新平均哪些样本的梯度 | 每卡 b、设备 D、累积 A、loss 加权和归约 |
| BN 统计范围 | 一次前向用哪些激活计算均值与方差 | BN 所在层、训练/冻结状态、设备间同步组、空间维与多目展开方式 |
| 场景多样性 | 这些样本提供多少不同条件的信息 | 序列、时间位置、运动状态、相邻帧相关性、重复样本 |

例如，八目图像可能在图像侧展开成 B×8；合并成 BEV 后，场景维仍是 B。训练态 BN2d 对每个通道在批次与空间维一起统计，因此 B=1 不意味着“只有一个标量、方差必为零”。但同一场景内的空间位置和多目视角不能直接等同于多个独立场景。

**梯度累积不会扩大每次前向的 BN 统计范围。** 普通 BN 也不会因为使用 DDP 就自动跨设备统计；需要核对是否启用 SyncBN 及其进程组。[1]

## 2. 梯度平均为什么受益，又为什么不是越大越好

### 2.1 标准统计推导：独立采样时噪声按 1/B 缩小

以下是样本均值性质的推导，不是对本项目已经测得的梯度噪声结论。

在同一参数位置，设单样本梯度 g_i 的期望为 G，协方差为 Σ；并假设样本独立同分布、前向不依赖其他样本。则：

$$
g_B=\frac{1}{B}\sum_{i=1}^{B}g_i,
\qquad
\mathbb{E}[g_B]=G,
\qquad
\operatorname{Cov}(g_B)=\frac{\Sigma}{B}.
$$

由误差向量的二阶矩得到：

$$
\mathbb{E}\|g_B-G\|^2=\frac{\operatorname{tr}\Sigma}{B}.
$$

含义：增大 batch 不改变平均梯度，却能降低对该梯度的估计噪声。B=1→24 时，满足上述假设的梯度噪声均方根变为原来的 1/√24，约 20.4%；这个比例不是本项目的实测值。

训练态 BN 的前向依赖整个批次，因此不能把不同真实 batch 下的梯度机械代入上述“同一个单样本函数”的推导。若希望单独测量梯度平均的作用，应先固定归一化行为。

### 2.2 有相关性时，名义 batch 不代表独立信息量

仍在固定参数、固定计算方式下，样本相关时一般式为：

$$
\operatorname{Cov}(g_B)
=\frac{1}{B^2}\sum_{i=1}^{B}\sum_{j=1}^{B}
\operatorname{Cov}(g_i,g_j).
$$

这是对协方差的直接展开。若梯度之间存在较强的正相关，交叉项不会消失，降噪就达不到独立采样的 1/B。

对于时序训练，既要保留每条流内部的历史连续性，也要考虑同一次更新是否能覆盖不同时间位置或运动条件。“把相邻帧放在一起”和“增加不同条件的并行流”不是同一种组批方式。

### 2.3 为什么显存上限不是最优 batch 的定义

总样本暴露量 S 固定时，忽略尾批，更新次数为：

$$
U=S/B_{\mathrm{grad}}.
$$

增大 batch 降低单次梯度估计噪声，但减少可进行的更新次数。连续进行多次小 batch 更新，与在同一参数位置合并这些样本后进行一次更新并不等价：前者的参数及后续梯度每一步都在变化，Adam 的状态和按步执行的调度也随之变化。

当梯度噪声已远小于平均梯度，继续增大 batch 的降噪收益会递减。McCandlish 等研究使用梯度噪声尺度描述这种转折；它是具有假设和近似的解释与估计工具，不是跨任务固定的 batch 阈值，也不能直接保证 Adam 的收敛或泛化。[2]

因此，选择 batch 至少要同时考虑梯度质量、单步耗时、更新预算和归一化行为。显存容量给出可行上限，不能单独确定最优值。

## 3. BN 为什么可能改变信息，而不只是增加统计误差

### 3.1 构造例子：单场景归一化能消除场景间偏移

下面是依据 BN 定义构造的解释例子，不是论文提供的本项目模型，也没有证据证明本项目恰好以此方式失败。

考虑一个通道，场景 i、空间位置 p 的激活为：

$$
x_{i,p}=b_i+s_p.
$$

b_i 表示不同场景的整体偏移，s_p 表示共同的空间结构。设各场景的空间位置数相同。

训练态 BN 在 B=1 时，对该场景的空间位置统计均值：

$$
\mu_i=b_i+\bar s,
\qquad
\hat x_{i,p}=
\frac{s_p-\bar s}{\sqrt{\operatorname{Var}_p(s_p)+\epsilon}}.
$$

场景差异 b_i 被精确消除。后续共享的 affine 参数 γ、β 不能从这一条通路恢复每个场景原来的 b_i。

在 B>1、同批次包含不同 b_i 时：

$$
\mu_B=\bar b+\bar s,
\qquad
\hat x_{i,p}=
\frac{(b_i-\bar b)+(s_p-\bar s)}
{\sqrt{\operatorname{Var}_i(b_i)+\operatorname{Var}_p(s_p)+\epsilon}}.
$$

场景相对于当前批次的偏移仍被保留。这说明真实 batch 可以改变网络能直接利用的表达，而不只是改变优化噪声。[1]

限制：真实网络可能把有效信息编码在空间结构或其他通路中，以上例子不证明 B=1 必然丢掉速度信息，也不证明 B>1 必然解决任务。冻结 BN 不使用上述当前批统计，机制不同；LayerNorm/GroupNorm 的归一化范围也不同，不能套用同一个“增大 batch 即恢复信息”的结论。

### 3.2 时序相关性与 train/eval 差异是独立检查项

连续单流中的相邻场景相似，BN 的当前批统计可能长期反映局部运动片段；eval 通常改用累计 running statistics。训练时和评测时的变换因而不同。

Batch Renormalization 原论文明确讨论了小批次和非独立样本下的 BN 问题。[3] 这提供提前检查的理论与文献依据，但不能把“存在风险”直接写成“已经找到本项目的唯一根因”。

## 4. 在训练前落实成设计约束

| 开跑前的问题 | 要写下或核对的内容 | 避免的错误解释 |
| --- | --- | --- |
| 每层到底看到多少场景？ | 各阶段 BN 类型、是否训练、统计维、是否同步；列出图像展开与 BEV 合并的位置 | 用 global batch 代替实际 BN 统计范围 |
| 一次更新覆盖哪些条件？ | 流的数量、起点、序列/运动条件分布、切流和缓存复位规则 | 把重复或高度相关样本视作独立信息 |
| 与参考方法改变了什么？ | batch、BN、采样、学习率/调度分别列为变量 | 把资源调试配置直接用于裁定模型能力 |
| 实验预算是什么？ | 同时记录更新次数、实际中心帧暴露量、有效监督量和耗时 | 只用“相同步数”或“相同 epoch”宣称公平 |
| 改 batch 后的机制能否解释？ | 尽可能保持其余因素；无法保持时，把变化作为组合配方报告 | 将组合实验收益全归因于 batch |
| 失败时准备观察什么？ | 固定训练切片指标、逐帧输出离散度、配对输入干预；提前区分训练拟合与未见序列验证 | 只看 loss/ADE，把近常数先验误当场景学习 |

这张表是依据机制提出的实验设计建议，不是已验证能够保证任意模型训练成功的算法。

资源不足时，需要明确选择如何改变训练：真实 batch、归一化策略或梯度累积各自解决不同问题。不能把其中一个默认为另外两个的等价替代。学习率调整也应依据优化器和调度设计，不机械套用线性缩放。

## 5. 本项目能支持哪些结论

以下为 K-Radar 本地记录所报告的限定观测，尚未在 KnowledgeAnchor 中由用户签署；不视为 verified。服务器是实验资产状态的事实依据，本文未重新核验服务器上的当前资产和进程。

### 5.1 配方改变后，拟合与图像敏感性同时改善

共同任务口径：odom-v2、radarocc split 中训练序列 seq13 的闭集切片、8×0.5 s=4 s、当前 radar 原点、x 前 y 左；不是未见序列性能。

| 项目记录 | 观测与分母 | 可以支持什么 |
| --- | --- | --- |
| batch1 固定直行 MLN，4000 更新 | 终点 raw iter_4000 的 ADE 7.061858 m；227 中心帧、222 有效帧、1636 有效步；逐帧有效步平均后再帧平均 | 该训练配方在所测范围内拟合不足 |
| 三卡各 8，global batch24，1000 更新 | 终点 raw iter_1000 的 ADE 1.387194 m、FDE 2.167237 m；相同切片与聚合口径；FDE 为每帧最后有效步误差的帧平均 | batch、SyncBN、并行采样、暴露量共同改变后的配方明显改善拟合 |
| batch24 终点的配对噪声诊断 | raw iter_1000；同 50 中心帧、400 有效步；真实/噪声 ADE 1.999824/3.278027 m；轨迹点平均移动 2.053306 m；两臂独立清空并重建历史 | 此权重对图像内容有明显敏感性；不能再外推旧权重“换图几乎不动”的结论 |

上述两次训练的中心帧暴露量为 4000 与 24000，更新次数也不同，不能声称这是“只改变 batch”的因果对照。50 帧诊断与全切片评测的分母不同，不能用两者的绝对 ADE 直接表示同集合性能变化。

证据：训练 run.json、comparison_batch1.json，以及噪声诊断 run.json；精确 checkpoint SHA、冻结配置、实际命令和评测设置以主记录为准：

- [batch24 训练主记录](D:/Research/Replication/Kradar_benchmark/methods/BEV-Planner/runs/bevplanner_ddp24fit_1103_2121/run.json)
- [与 batch1 比较的口径](D:/Research/Replication/Kradar_benchmark/methods/BEV-Planner/runs/bevplanner_ddp24fit_1103_2121/comparison_batch1.json)
- [50 帧噪声诊断主记录](D:/Research/Replication/Kradar_benchmark/methods/BEV-Planner/results/bevplanner_ddpnoise50_1103_2302/run.json)

### 5.2 三条重要的推断边界

1. 既有权重在 eval 时重置或重校准非骨干 BN 没有解决常数输出，只削弱“最终 running statistics 异常导致失败”的解释；它没有检验 B=1 训练过程是否影响学习。
2. 图像和梯度通路接通，不保证模型学会了有效利用图像。逐层审计在失败权重上发现，图像差异到 BEV/attention 仍明显，主要测得的敏感度压缩发生在规划头内部；这是失效位置的观测，不是唯一成因证明。
3. 工程拟合门失败约束的是“这套实现、配方、数据与预算”的组合。在 batch/BN/采样尚未校准时，不能直接将失败提升为模型能力或数据不可学习性的结论。

证据：

- [BN 状态干预主记录](D:/Research/Replication/Kradar_benchmark/results/bev_planner/bevplanner_e2_bn_probe_1029_2008/run.json)
- [逐层图像链路审计主记录](D:/Research/Replication/Kradar_benchmark/results/bev_planner/bevplanner_featcheck_1103_1839/run.json)
- [当前归因结果与详细范围](D:/Research/Replication/Kradar_benchmark/docs/BEV-Planner/拟合失败归因/RESULT.md)

### 5.3 来源身份与复核入口

以下身份摘自本地镜像的原 run.json / completion_verification.json，不代表本次重新检查了服务器权重或配置原件。

| 对象 | 文件与完整 SHA256 |
| --- | --- |
| batch1 对照权重 | bevplanner_fixednavfit4k_1103_1925/iter_4000.pth；873e34160004c90a8334b24b9ff54816f775c86be24d64cba51d41945db35c87 |
| batch1 冻结配置 | 同 run 的 frozen_config.py；f81cb9eb8694355550269cd1b830dfa5e25c4d0a19d5259f1c8b037779585e3b |
| batch24 终点权重 | bevplanner_ddp24fit_1103_2121/iter_1000.pth，raw非EMA；82e9de09046465aca5d2fe517b7609cfaa90092bf851c646b221e5e9aca66c28 |
| batch24 冻结配置 | 同 run 的 frozen_config.py；12155f0bfb6bb7bf0a12e79c75bc4a7f941777849fdd0cf8dda1fc817eb68a89 |
| 共同冻结 infos | kradar_infos_train.pkl；3a017e4a0859cd01b25eeea7f56b1b67558aec4c1a50f4ffe872dea27c9d56c7 |
| 噪声实验配置 | 来源 run 的 merged_config.py；12155f0bfb6bb7bf0a12e79c75bc4a7f941777849fdd0cf8dda1fc817eb68a89 |
| 固定噪声清单 | noise_manifest.json；211da434a916a4e284b26b3c7287681e1803fc2906897482d482048d57e242a9 |
| 噪声实验原始预测 | predictions.npz；fd3d83fda36763b3f2e910c32b25da4980f6328eb04fa5fb852839995a9f84ba |

服务器项目根目录：/media/yellowstone/data2/CYL/Kradar_benchmark。训练文件位于其 methods/BEV-Planner/runs/ 下相应 run 目录；噪声结果位于 methods/BEV-Planner/results/bevplanner_ddpnoise50_1103_2302/。本地来源根目录：D:/Research/Replication/Kradar_benchmark。

- [batch1 对照主记录](D:/Research/Replication/Kradar_benchmark/methods/BEV-Planner/runs/bevplanner_fixednavfit4k_1103_1925/run.json)
- [batch1 完成核验记录](D:/Research/Replication/Kradar_benchmark/methods/BEV-Planner/runs/bevplanner_fixednavfit4k_1103_1925/completion_verification.json)
- [batch24 完成核验记录](D:/Research/Replication/Kradar_benchmark/methods/BEV-Planner/runs/bevplanner_ddp24fit_1103_2121/completion_verification.json)
- [噪声实验原始摘要](D:/Research/Replication/Kradar_benchmark/methods/BEV-Planner/results/bevplanner_ddpnoise50_1103_2302/summary.json)

## 6. 使用边界

公式、BN 的定义及构造例子留在 L1，保留假设和推导；项目实证只留在本笔记 §5，未建立对应的 claim 卡：

| 实证记录 | 适用范围 | 结论口径 |
| --- | --- | --- |
| §5.1 两次训练的终点 ADE 比较 | 冻结 seq13 闭集切片 | 指定 raw checkpoint 的 ADE/FDE |
| §5.1 batch24 终点的配对噪声诊断 | 固定 50 中心帧、400 有效步 | 50×8 个 xy 位移的算术平均 |

上述数字是项目实验记录，未经用户独立复核或签署，引用时按“作者报告”处理。

“batch 越大越好”“B=1 是本次唯一根因”“大 batch 保证泛化”都不是本笔记已经证实的结论。

## 参考来源

1. Ioffe & Szegedy, 2015, Batch Normalization，§3 与卷积层处理说明；以及 PyTorch BatchNorm2d、SyncBatchNorm 定义：
   - [Batch Normalization 原论文](https://proceedings.mlr.press/v37/ioffe15.html)
   - [PyTorch BatchNorm2d](https://docs.pytorch.org/docs/stable/generated/torch.nn.BatchNorm2d.html)
   - [PyTorch SyncBatchNorm](https://docs.pytorch.org/docs/stable/generated/torch.nn.SyncBatchNorm.html)
2. McCandlish et al., 2018, An Empirical Model of Large-Batch Training，梯度噪声尺度及计算/时间效率分析：
   - [An Empirical Model of Large-Batch Training](https://arxiv.org/abs/1812.06162)
3. Ioffe, 2017, Batch Renormalization: Towards Reducing Minibatch Dependence in Batch-Normalized Models，小批次、非独立样本与训练/推理差异：
   - [Batch Renormalization](https://arxiv.org/abs/1702.03275)

本项目链接指向外部研究工作区，本文没有复制原始权重或预测，也不把链接存在当作资产已核验。入库后应保留外部来源身份；若以后需要知识库内独立复核，再按实际需要保存最小证据摘录。
