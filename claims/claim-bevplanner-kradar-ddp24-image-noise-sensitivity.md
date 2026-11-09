---
id: claim-bevplanner-kradar-ddp24-image-noise-sensitivity
title: "项目记录声称：batch24终点权重在指定50帧噪声替换实验中的轨迹点平均位移约2.053m"
type: claim
status: asserted
scope: "BEV-Planner K-Radar；训练run bevplanner_ddp24fit_1103_2121的raw iter_1000.pth，SHA256 82e9de09046465aca5d2fe517b7609cfaa90092bf851c646b221e5e9aca66c28；诊断run bevplanner_ddpnoise50_1103_2302，GPU1单卡batch1、eval/no_grad，SyncBN为eval行为；冻结radarocc train seq13前50中心帧、每臂400有效步、8目输入；odom-v2、8×0.5s=4s、当前radar原点、x前y左；每时刻一张固定256×704 RGB均匀随机噪声图复用8目；真实/噪声两臂独立清空BEV/head状态并重建2s历史，标定/时间戳/几何配对；以50×8个xy欧氏位移取算术平均，单位m；仅为输入敏感性诊断"
tags: [bev-planner, kradar, end-to-end-driving, training-diagnostics, input-sensitivity, image-corruption]
note: library/Experiment_Notes/拟合诊断中的Batch与归一化.md
paper: "项目实验记录，非论文结论：bevplanner_ddpnoise50_1103_2302"
stance: watch
evidence:
  - source: library/Experiment_Notes/拟合诊断中的Batch与归一化.md
    locator: "§5.1 表格：batch24 终点的配对噪声诊断"
    quote: "| batch24 终点的配对噪声诊断 | raw iter_1000；同 50 中心帧、400 有效步；真实/噪声 ADE 1.999824/3.278027 m；轨迹点平均移动 2.053306 m；两臂独立清空并重建历史 | 此权重对图像内容有明显敏感性；不能再外推旧权重“换图几乎不动”的结论 |"
    relation: supports
falsifiers:
  - "严格使用记录中的权重、固定噪声、配对输入和独立历史复位流程，从原始预测或重放结果复算后，400个xy欧氏位移的均值不能在记录精度下重现约2.053306m。"
  - "输入及状态核查发现两臂除像素外还改变了应保持一致的标定、时间戳、几何或其他条件，或参数/buffer发生更新，或噪声臂混入真实图像历史，使记录值不能作为本卡限定的图像内容干预结果。"
related: [claim-bevplanner-kradar-seq13-ddp24-recipe-lowers-fit-ade]
signoff: null
---

## 主张

项目记录声称，尚未由用户独立验证或签署：batch24 终点权重（bevplanner_ddp24fit_1103_2121 的 raw iter_1000）在冻结的 50 个中心帧上，把当前与历史图像内容替换为固定噪声后，50×8 个轨迹点位移的算术平均为 2.053306 m（诊断 run bevplanner_ddpnoise50_1103_2302）。记录结论：该权重对所测图像干预有明显响应，不能再外推旧权重“换图几乎不动”的结论。

训练时的 global batch24 与本次推理的 batch1 是不同概念。本次推理为 eval/no_grad，BN 沿用评测统计，不是在 batch1 下重新训练。

记录同时报告真实/噪声两臂 ADE 为 1.999824 / 3.278027 m，但本卡的原子主张是配对轨迹位移，不把“视觉净收益”“速度信息已学会”或“未见序列泛化”合并为同一结论。噪声是分布外输入，且噪声组输出仍随序列显著变化；视觉、历史和其他时序因素的贡献尚未分离。

计算定义：两臂各 50 次中心帧前向，训练更新 0；每臂 50 帧的 8 步均有效。位移为

$$
\frac{1}{50\times8}
\sum_{i=1}^{50}\sum_{k=1}^{8}
\left\|P^{\mathrm{noise}}_{i,k}-P^{\mathrm{real}}_{i,k}\right\|_2.
$$

50 帧诊断和 227 中心帧训练切片评测的分母不同，不能直接比较绝对 ADE。相邻 50 帧也不能视作 50 次独立随机实验。

## 待验证

1. 核对 checkpoint、冻结配置、infos 和固定噪声清单的完整 SHA；核对两臂清空并独立重建 BEV/head 历史的实际执行记录。
2. 从 predictions.npz 独立重算上述 400 点均值，并核对参数/buffer 前后状态身份、100 次前向及真实退出记录。
3. 如需结论扩展至正常图像变化的收益、未见序列泛化或视觉/时序贡献，须另外设计对应实验；本卡不提供这些证明。

原始来源：[run.json](D:/Research/Replication/Kradar_benchmark/methods/BEV-Planner/results/bevplanner_ddpnoise50_1103_2302/run.json)、[summary.json](D:/Research/Replication/Kradar_benchmark/methods/BEV-Planner/results/bevplanner_ddpnoise50_1103_2302/summary.json)。本次起草读取了本地记录，没有重新运行推理或重算原始预测，也没有重新核验服务器当前资产。

## 成立/不成立的含义

成立：旧失败权重“换图几乎不动”的判断不能外推到这个 checkpoint；拟合质量和输入敏感性应分别核查。

不成立：撤回此 checkpoint 的该项敏感性证据，先检查输入配对、缓存和权重身份；不据此自动推翻其他 checkpoint 的诊断。
