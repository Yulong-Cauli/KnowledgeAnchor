---
id: claim-bevplanner-kradar-seq13-ddp24-recipe-lowers-fit-ade
title: "项目记录声称：seq13 上 batch24/SyncBN/多流组合配方的终点拟合 ADE 低于所记录的 batch1 对照"
type: claim
status: asserted
scope: "BEV-Planner K-Radar 移植；冻结 radarocc train seq13 闭集切片，infos SHA256 3a017e4a0859cd01b25eeea7f56b1b67558aec4c1a50f4ffe872dea27c9d56c7；odom-v2、8×0.5s=4s、当前 radar 原点、x前y左；固定直行 Query MLN、单分支、224×128 BEV、2s 历史；GPU1 batch1/4000 更新的 raw iter_4000 对比 GPU1/2/3各8、global batch24/1000 更新的 raw iter_1000；eval-mode/test pipeline，全227中心帧、222有效帧、1636有效步；ADE为各帧有效步欧氏误差平均后再对有效帧平均，单位m；不是未见序列泛化或纯batch因果实验"
tags: [bev-planner, kradar, end-to-end-driving, training-diagnostics, batch-size, syncbn, closed-set-fit]
note: library/Experiment_Notes/拟合诊断中的Batch与归一化.md
paper: "项目实验记录，非论文结论：bevplanner_fixednavfit4k_1103_1925 与 bevplanner_ddp24fit_1103_2121"
stance: watch
evidence:
  - source: library/Experiment_Notes/拟合诊断中的Batch与归一化.md
    locator: "§5.1 表格：batch1 固定直行 MLN，4000 更新"
    quote: "| batch1 固定直行 MLN，4000 更新 | 终点 raw iter_4000 的 ADE 7.061858 m；227 中心帧、222 有效帧、1636 有效步；逐帧有效步平均后再帧平均 | 该训练配方在所测范围内拟合不足 |"
    relation: supports
  - source: library/Experiment_Notes/拟合诊断中的Batch与归一化.md
    locator: "§5.1 表格：三卡各 8，global batch24，1000 更新"
    quote: "| 三卡各 8，global batch24，1000 更新 | 终点 raw iter_1000 的 ADE 1.387194 m、FDE 2.167237 m；相同切片与聚合口径；FDE 为每帧最后有效步误差的帧平均 | batch、SyncBN、并行采样、暴露量共同改变后的配方明显改善拟合 |"
    relation: supports
falsifiers:
  - "按指定 raw checkpoint、各自冻结配置和同一冻结 seq13 评测口径重算后，batch24组合配方的终点 ADE 不低于 batch1 对照。"
  - "来源核查发现记录的权重、评测帧、有效mask、输入条件或聚合方式与本卡限定不符，使两项终点数值不构成本卡所述比较。"
related: [claim-bevplanner-kradar-ddp24-image-noise-sensitivity]
signoff: null
---

## 主张

项目记录声称，尚未由用户独立验证或签署：batch24/SyncBN/多流组合配方（bevplanner_ddp24fit_1103_2121）把该闭集训练切片的终点 ADE 从 7.061858 m（batch1 对照，bevplanner_fixednavfit4k_1103_1925）降至 1.387194 m，约下降 80.36%。本卡只保留这一对预定终点权重的比较。

对照使用：

- 旧 run：bevplanner_fixednavfit4k_1103_1925，raw iter_4000.pth，SHA256 873e34160004c90a8334b24b9ff54816f775c86be24d64cba51d41945db35c87。
- 新 run：bevplanner_ddp24fit_1103_2121，raw iter_1000.pth，SHA256 82e9de09046465aca5d2fe517b7609cfaa90092bf851c646b221e5e9aca66c28。
- 选择规则：两次运行各自预定终点的 raw 权重，不挑 best、不混入 EMA。新 run 的 step500 指标更低，但未保存该步 checkpoint，不作为本卡比较对象。

batch、SyncBN、单流变多流、更新次数与中心帧暴露量都变了：旧 4000 更新/4000 中心帧，新 1000 更新/24000 中心帧。不能据此确定 batch 是唯一原因，也不能外推为 batch 越大越好或保证泛化。图像敏感性是另一项独立观测，见关联卡 claim-bevplanner-kradar-ddp24-image-noise-sensitivity。

## 待验证

1. 在服务器原产位置核对两份 checkpoint、配置和 infos 的完整 SHA；精确身份见来源笔记 §5.3 和原 run.json。本次起草只读取了本地记录，没有重新检查服务器资产或运行模型。
2. 从各自 eval_points.jsonl 和原始预测重算预定终点 ADE；确认相同帧集、mask、坐标与帧内/帧间聚合方式。
3. 如需进一步主张“batch 单独造成改善”，须另设能区分 BN、采样和暴露量的对照；不把这种进一步实验当作本卡已完成的证据。

原始比较记录：[comparison_batch1.json](D:/Research/Replication/Kradar_benchmark/methods/BEV-Planner/runs/bevplanner_ddp24fit_1103_2121/comparison_batch1.json)。

## 成立/不成立的含义

成立：支持在解释这次拟合失败时把训练配方作为实质变量，不能由 batch1 单一配方的失败直接推断模型不具备拟合能力。关于具体成因仍须保留组合变化的限制。

不成立：撤回这对终点的改善比较，并核查权重、分母或记录来源；不自动改判数据质量或其他实验。
