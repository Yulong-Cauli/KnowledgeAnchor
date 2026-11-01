---
id: claim-bevplanner-nuscenes-straight-driving-imbalance
title: "BEV-Planner 论文声称：nuScenes 73.9% 的数据是直行场景，ego status 因此成为开环规划的捷径"
type: claim
status: asserted
scope: "nuScenes 数据集（论文 §1 对数据分布的统计，配 Fig. 2 轨迹热力图；统计口径为场景运动模式是否直行）；归因对象为 nuScenes 上的开环端到端评测；论文自报统计数字"
tags: [end-to-end-driving, open-loop, nuscenes, bev-planner, data-distribution, benchmark]
note: library/ADe2e/BEV-Planner.md#1-概述
paper: "CVPR 2024, Is Ego Status All You Need for Open-Loop End-to-End Autonomous Driving? (BEV-Planner, arXiv:2312.03031)"
stance: watch
evidence:
  - source: library/ADe2e/BEV-Planner.md
    locator: "§1 / Fig. 2"
    quote: "73.9% of the nuScenes data involve scenarios of driving straightforwardly"
    relation: supports
  - source: library/ADe2e/BEV-Planner.md
    locator: "Appendix E（评测样本口径）"
    quote: "in straight-driving scenarios (87% of all evaluation samples), removing the camera input leads the model to adopt a relatively conservative straight-driving strategy"
    relation: supports
falsifiers:
  - "对 nuScenes 全量数据按轨迹曲率/航向变化重新统计，直行场景占比显著低于 73.9%（例如 <60%），或发现该统计只适用于特定子集（如某方向相机、某 split）"
  - "在直行占比被刻意压低（<40%）的自建/重采样评测集上，仅用 ego status 的模型仍达到与感知模型持平的开环指标，即直行主导不是 ego status 捷径成立的主要原因"
review_due: 2026-12-02
related: [claim-bevplanner-egomlp-parity-l2-collision]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：nuScenes 中 73.9% 的数据是直行（driving straightforwardly）场景（§1，Fig. 2），这类场景下维持当前速度/方向即可获得低 L2/低碰撞率，ego status 因此成为拟合规划任务的捷径，剩下 26.1% 才是有挑战的场景。论文以此为开环 SOTA 分数虚高的第一个解释（另两个是指标不全面与 ego status 偏置）。

一个必须记住的口径区分：73.9% 是对 nuScenes 数据整体的统计；Appendix E 另一处"87% of all evaluation samples"是评测样本（有效样本）中直行占比，两者分母不同，引用时不可混用。

## 待验证

- 用 nuScenes 官方 devkit 遍历 ego 未来轨迹，按曲率/航向变化阈值重算直行场景占比，对照 73.9%（数据整体）与 87%（评测样本）两个口径。
- 在重采样后的转弯富集评测集上跑 Ego-MLP 与感知基线，检验 ego status 捷径是否随直行占比下降而失效。

## 若成立 / 不成立意味着什么

成立（目前只是论文声称，尚未独立验证）：nuScenes 开环榜单的高分主要反映"直行 + ego status 捷径"，任何在 nuScenes 上宣称的开环规划能力都不能直接推广到复杂场景；自建评测需按场景类型分层报告。
不成立：若直行占比实际低得多或占比与捷径效应无关，则开环虚高的主因收窄为指标口径与 ego status 注入问题，"换数据集"的紧迫性论证减弱。
