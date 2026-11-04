---
id: claim-bevplanner-nuscenes-straight-driving-imbalance
title: "BEV-Planner 论文声称：nuScenes 73.9% 的数据是直行场景，ego status 因此成为开环规划的捷径"
type: claim
status: asserted
scope: "nuScenes 数据集（论文 §1 对数据分布的统计，配 Fig. 2 轨迹热力图；统计口径为场景运动模式是否直行——“直行”判定阈值未在笔记中记载）；归因对象为 nuScenes 上的开环端到端评测；论文自报统计数字，尚未独立验证"
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
  - "统计重算（原文核查/同范围复算）：对 nuScenes 全量数据按轨迹曲率/航向变化重新统计，直行场景占比显著低于 73.9%（例如 <60%——预设判据，论文未给判定阈值），或发现该统计只适用于特定子集（如某方向相机、某 split）"
  - "机制辨别（因果隔离）：在直行占比被刻意压低（<40%）的自建/重采样评测集上，仅用 ego status 的模型仍达到与感知模型持平的开环指标，即直行主导不是 ego status 捷径成立的主要原因"
review_due: 2026-12-02
related: [claim-bevplanner-egomlp-parity-l2-collision]
signoff: null
---

## 这条主张是什么意思

论文声称（尚未独立验证）：nuScenes 中 73.9% 的数据是直行（driving straightforwardly）场景（§1，Fig. 2），这类场景下维持当前速度/方向即可获得低 L2/低碰撞率，论文据此把 ego status 解释为拟合规划任务的捷径；其余 26.1% 才是更有挑战的场景（笔记 §1 转述）。论文以此为开环 SOTA 分数虚高的第一个解释（另两个是指标不全面与 ego status 偏置）。注意本卡内部实际有两层命题：占比统计（可重算）与"占比 → 捷径"的因果解释（论文推测、未隔离），证据强度不同。

## 证据支持到哪里

- 两条 evidence 支撑两个不同层次：73.9% 是对 nuScenes **数据整体**的统计（源自 Fig. 2 轨迹热力图——笔记无表格行、无脚本可复核）；87% 是**评测样本**口径（Appendix E），原句出自"无 ego status 的 VAD-Base 屏蔽相机后 CCR 不升反稳"的解释段，与主统计分母不同。
- 证据边界（deep-read §1.6 评为链内最弱 ★，报告层评估）：论文未给"直行"判定阈值；"占比→捷径"的因果论文未做隔离实验——本卡更接近"论文的背景假设"而非已被证明的前提，引用时按论文推测表述。

## 可能的解释与未排除的因素

- 统计观察（Fig. 2，可重算）：直行场景占比高。这是本卡中证据最"硬"的部分，但也只有单一来源。
- 作者解释（论文推测，未隔离）：直行主导使 ego status 成为捷径。这是论文对"为什么旧指标虚高"的归因叙事，本库无独立证据；占比与捷径效应的因果关系要靠 falsifier 2 的重采样实验检验。
- 口径区分（引用时最容易踩的坑）：73.9%（数据整体）与 87%（评测样本，与有效样本 5119 的关系未在笔记中说明）分母不同，不可混用。
- 并存解释：论文自身的另两条虚高解释（指标不全面、ego status 注入偏置）与直行主导并行，论文未分离三者各自的贡献——虚高是三条原因叠加的总量，不能归给单一条。

## 适用范围与迁移限制

- 统计绑定 nuScenes（split 与"直行"定义以论文口径为准；"直行"阈值未记载是复算的前置缺口——换个定义占比数字就变）。
- "捷径"解释绑定开环 L2/碰撞率评测：论文 §4.3 的分场景消融（Table 4/5）显示直行命令下加感知信息反而变差、转弯场景感知有益，与"直行主导稀释区分度"的叙事同向，但仍是论文自报（笔记 §3.5(c)）。
- 论文 §5 "换数据集更紧迫"的结论建立在占比与捷径假设之上：若 falsifier 2 不成立，该论证的紧迫性依据减弱。

## 对研究问题的启发

- 自建/迁移评测时按场景类型（直行/转弯）分层报告，防止直行主导稀释转弯场景的区分度（笔记 §3.5(c)：转弯场景仅占现有评测集约 13%）。
- "数据分布 → 指标区分度 → 模型捷径"这条因果链每环都要单独检验，不能由占比统计直接跳到机制结论（本班整理者整理，尚未验证）。

## 当前立场与下一步

- 当前 stance：watch。原卡未记录立场依据，按未记录处理。
- 优先执行的最小检查（零训练成本）——统计重算（原文核查/复算）：第一步先回论文原文定 "driving straightforwardly" 的判定口径（笔记未记载该定义，deep-read 遗留 #1）；然后用 nuScenes 官方 devkit 遍历 ego 未来轨迹，按两个分母分别复算：全量数据对照 73.9%、val 有效样本对照 87%（顺带确认 87% 的分母是否恰为 5119 有效样本）。复算显著偏离 → falsifier 1 登记；吻合 → 占比统计升级为"已复算"，但捷径归因仍待检。
- 机制辨别（单独任务，不与统计重算混）：在转弯富集的重采样评测集上跑 Ego-MLP 与感知基线，观察 ego status 捷径是否随直行占比下降而失效；结果只改变因果归因判断，不动 73.9%/87% 统计本身。

## 核查记录

- 2026-11-02（建卡，commit c3ecdd4）：数字自 arXiv HTML v2 实抓。
- 2026-11-05（02 任务书 P1-B3a 批）：表达整理，数字与 quote 未改写。2 条 evidence Grep 逐字命中笔记；73.9%/87% 分母区分保留；新增"直行判定阈值未记载"前置缺口（deep-read 遗留 #1）与"占比→捷径因果未隔离、三因叠加未分离"的证据边界；falsifier 加分层标注并标记预设判据。id/status/stance/review_due/signoff 未动。
