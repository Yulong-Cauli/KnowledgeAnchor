---
id: claim-hgsfusion-dark-scene-gain-dominates
title: "HGSFusion 自报：暗光（Dark）场景相对 Base-R+C 的 3D mAP 增益 +11.41 个百分点（4.27 → 15.68），远大于正常/强光场景的 +2.32 / +2.91"
type: claim
status: asserted
scope: "TJ4DRadSet test set 的光照条件分组测试（2026-11-05 实抓 arXiv:2412.11489v1 核对：Table 5 caption「Performances under different lighting conditions on the test set of TJ4DRadSet dataset」——推翻原卡按笔记 §4 上下文所作的 VoD 推定，笔记未标数据集）；光照分组为论文按序列划分的 dark/normal/shiny 三子集；对照列为原文定义的 Base-R+C（不含 RHGM/DSM 的基线，输入为原始雷达点云+图像；表内另有 Base-R 雷达单模态行，笔记未转录）；指标 3D mAP（原文 Table 5 另有 BEV mAP 列，笔记未转录）；Table 5 数值 2026-11-05 与 arXiv v1 逐格一致；自报数字；本卡只主张增益排序（Dark ≫ Shiny ≈ Normal），不主张「暗光下可用」"
tags: [4d-radar, radar-camera-fusion, hgsfusion, low-light, robustness, modality-sync]
note: library/Multimodal_Fusion/HGSFusion.md#44-光照条件鲁棒性测试-table-5
paper: "AAAI 2025 · HGSFusion（带混合生成与同步的雷达-相机融合 3D 目标检测；笔记未记录英文原题与 arXiv 号；开源：https://github.com/garfield-cpp/HGSFusion）"
stance: watch
evidence:
  - source: library/Multimodal_Fusion/HGSFusion.md
    locator: "§4.4 / Table 5"
    quote: "| **Dark (暗光)** | 4.27                  | **15.68**              | **+11.41%**"
    relation: supports
  - source: library/Multimodal_Fusion/HGSFusion.md
    locator: "§4.4 / Table 5"
    quote: "| Normal (正常)   | 33.50                 | 35.82                  | +2.32%"
    relation: supports
  - source: library/Multimodal_Fusion/HGSFusion.md
    locator: "§4.4 / Table 5"
    quote: "| Shiny (强光)    | 22.37                 | 25.28                  | +2.91%"
    relation: supports
  - source: library/Multimodal_Fusion/HGSFusion.md
    locator: "§4.4 / Table 5 分析"
    quote: "**分析**：在最极端黑暗场景下，HGSFusion 实现了 11.41% 的跨越式提升。这强有力地支持了 DSM 模块中模态同步的理论：在视觉失效时，模型能成功切换到以雷达为主的感知模式。"
    relation: supports
  - source: https://arxiv.org/html/2412.11489v1
    locator: "§5 正文 Table 5 讨论段（空白归一化后核对）；URL+抓取日期 2026-11-05"
    quote: "Then, we evaluate our proposed HGSFusion on the subsets, as well as two baseline networks, Base-R and Base-R+C (excluding RHGM and DSM). Base-R uses only raw radar point clouds as input, while Base-R+C uses both raw radar point clouds and the image."
    relation: supports
falsifiers:
  - "复现同一光照分组测试：Dark 场景增益 ≤ Normal 或 Shiny 场景增益，排序反转"
  - "Dark 基线远高于 4.27（更换对照模型或评测协议后），「极端黑暗下视觉失效」前提不成立，增益排序失去意义"
  - "归因失效：去掉 DSM 模态同步（或单用 RHGM）后 Dark 增益不变，说明 +11.41 与光照自适应加权无关"
review_due: 2026-12-02
related: [claim-hgsfusion-rhgm-dsm-superadditive-roi-gain]
signoff: null
---

## 我的理解

论文声称（据笔记 §4.4 转录 + 2026-11-05 arXiv v1 核对）：在 TJ4DRadSet test set 上，相对 Base-R+C 的 3D mAP 增益按光照分组为——Dark +11.41（4.27 → 15.68）、Normal +2.32（33.50 → 35.82）、Shiny +2.91（22.37 → 25.28），Dark 增益约为另两组的 4–5 倍。论文自己的解释是：暗光下相机信息有限甚至含错（Base-R 13.19 → Base-R+C 4.27，加相机反而掉 8.9 点，同表未转录行），HGSFusion「能利用雷达特征增强图像特征」而获得 11.41% 提升；笔记进一步把这解读为 DSM 模态同步的证据（「视觉失效时切换到雷达主导」）——这一步是笔记的引申，论文该段未使用「模态同步切换」表述，也未给按光照分组的模态权重可视化或对应消融。

两个口径注意：
1. 笔记表内写「+11.41%」，按表内数字 15.68 − 4.27 = 11.41，实为**百分点**而非相对百分比（相对增幅约 2.7 倍）。论文正文亦沿用「11.41%」的百分比写法。引用时应写「+11.41 个百分点」。
2. Dark 下 15.68 的绝对水平仍远低于 Normal 的 33.50——这是**增益排序**主张，不是「暗光性能好」主张；暗光下模型仍然显著变差。

限定：数据集与分组（TJ4DRadSet test，按序列分 dark/normal/shiny）与 Base-R+C 定义（不含 RHGM/DSM 的基线，雷达点云+图像）已由原文核对（见 scope 与 evidence）；光照子集的具体划分标准（亮度阈值/来源）与 3D mAP 的类别覆盖原文未见说明；增益为单次自报，无种子方差信息。

## 待验证

- 回原文核对 Table 5：数据集、光照划分标准、Base-R+C 定义、类别覆盖与 3D mAP 协议。——2026-11-05 部分完成：数据集（TJ4DRadSet test）、分组方式（按序列三分）、Base-R+C 定义、3D mAP/BEV mAP 列均已核对；剩余：光照子集划分的具体标准与 mAP 类别覆盖原文未查得，标待核。
- 复现：在 TJ4DRadSet test 上按光照分组评测，看 4.27 → 15.68 与「Dark ≫ Shiny ≈ Normal」排序是否复现。
- 归因消融：去掉 DSM 模态同步分支（保留空间同步）再测 Dark 增益，检验增益是否来自光照自适应加权（区别论文「雷达特征增强图像特征」的一般表述与笔记「模态同步切换」的具体机制归因）。

## 若成立 / 不成立意味着什么

成立：模态权重随光照自适应是有价值的机制，夜间/隧道场景的雷达-相机融合方案值得引入显式光照感知加权；融合模型的评估应按光照分组报告，聚合 mAP 会掩盖该收益。
不成立：Dark 增益是对照选择或口径的伪象，光照自适应叙事不成立，DSM 的价值退回 Table 3 的整体 +1.18 RoI AP。

## 核查记录

- 建卡（日期未记录）：数字据笔记转录；数据集为「推定 VoD」（笔记 §4.4 未标注），Base-R+C 构成未定义。
- 2026-11-05（02 任务书整理班）：实抓 https://arxiv.org/html/2412.11489v1 ——发现并修正一处口径错误：Table 5 实为 **TJ4DRadSet test set**（caption 逐字核对），原卡「推定 VoD」不成立，scope/正文/待验证已相应改写；Table 5 三行 3D mAP 数值与笔记转录逐格一致（笔记未转录 Base-R 行与 BEV mAP 列，已在新 scope 注明）；补入 Base-R+C 定义的原文句作 evidence；笔记「切换到雷达主导」明确标注为笔记引申、非论文原文表述。id/status/stance/review_due/signoff 未动。
