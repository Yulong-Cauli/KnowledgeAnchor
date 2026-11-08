---
id: claim-nuscenes-three-second-low-lateral-displacement-majority
title: "nuScenes v1.0 中，车辆约3秒后的横向位移小于2米的样本占多数"
type: claim
status: asserted
scope: "覆盖 nuScenes v1.0 全部驾驶记录。观察车辆随后约3秒的运动，记录末尾没有完整后续轨迹的时刻不计入统计。以车辆当前位置及航向确定纵向参考线，未来约3秒的终点位置至该参考线的垂直距离小于2米时，判定为低横向位移。"
tags: [nuscenes, dataset-property, ego-motion, low-lateral-displacement, open-loop]
stance: watch
evidence:
  - source: https://www.kaggle.com/code/cauliyulong/claim-nuscenes-all-census
    locator: "version 1，output results.json，populations.all_all.counts；n=34157，原件与哈希存 experiments/nuscenes-three-second-low-lateral-displacement-majority/all-splits/results/"
    quote: '"endpoint_lt_2m": 29783'
    relation: supports
review_due: 2026-12-08
related: [claim-bevplanner-egomlp-parity-l2-collision, claim-opendrivevla-autoregressive-waypoint-planning-nuscenes]
signoff: null
---

## 主张概述

本库普查观察（status: **asserted**，stance: **watch**，尚未独立验证）：在上述定义下，29783/34157 个样本满足约3秒后横向位移小于2米，占 **87.194426%**。三个集合分别统计也都超过一半。这里描述车辆的运动幅度，不代表“87%的场景简单”或“87%的场景不需要感知”。

## 实验定义

统计训练、验证和测试集的全部1000段驾驶记录，以每个采样时刻为起点，观察其后连续6个采样点（约3秒）的车辆运动；后续记录不足6个点的样本不计入。以车辆当前位置及航向确定纵向参考线，计算第6个后续采样点至该参考线的垂直距离。距离小于2米的样本计为“低横向位移”，再计算其占有效样本总数的比例。

## 证据

| 总体 | 横向位移小于2米的样本数 | 有效样本总数 | 占比 |
| --- | --- | --- | --- |
| 全部记录 | 29783 | 34157 | 87.194426% |
| 训练集 | 20908 | 23930 | 87.371500% |
| 验证集 | 4501 | 5119 | 87.927330% |
| 测试集 | 4374 | 5108 | 85.630384% |
| 全部记录，排除停止和低速（窗口路径总长 >1.5m） | 23963 | 28337 | 84.564350% |
| 全部记录，仅排除停止（路径总长 >0.3m） | 24837 | 29211 | 85.026189% |

- 停止（路径长 ≤0.3m）4946 个、低速（0.3–1.5m）874 个全部满足主判据。去掉它们后仍过半，因此这一特定多数观察不完全由停车/低速样本贡献。这是分层描述，不是因果实验。
- 在本总体、2m 阈值下，“整个六步窗口最大绝对横向位移 <2m”与末点判据分子均为 29783；末点小但中间 ≥2m 的样本为 0。其他阈值的差异见完整敏感性表，不能把本次相同推广为所有轨迹中两定义等价。
- 训练/验证输入四表与官方元数据包逐字节一致；测试集四表直接取自官方包。实际执行代码与本地一致；25个分组汇总、350行阈值表及1000个场景的计数已从逐样本表复核一致。
- 测试集比例比训练/验证合并值低约1.84个百分点，但仍以低横向位移为主。1000段记录各自的比例范围为8.82%–100%，中位数100%，按记录等权的平均值为87.183323%。不能说每一段记录均以低横向位移为主。

## 核查记录

- 2026-11-08：按用户要求补上150段测试记录，范围扩展为全部1000段；同一测量源码和全部阈值保持不变。测试集4374/5108，全量29783/34157；原trainval逐样本结果与15个原汇总完全保留，25个全量汇总、350行阈值表及1000个场景计数复核一致。限定条件改为日常语言，status/stance/signoff未改。

- 2026-11-08：用户同意将原论文点卡替换为 nuScenes 数据集性质卡；定义与完整流程在本次运行前固定。Kaggle CPU version 1 完成，主观察与分层数字如上；官方四文件 SHA256 一致，7 项科学计算边界检查通过，所有 15 个总体从逐样本表重新计数一致。status 保持 asserted，stance watch，signoff 未代填。
