---
id: claim-centernettriplets-gt-center-oracle-ap-565
title: "CenterNet（Keypoint Triplets）论文声称：推断时用 GT 中心点替换预测中心点过滤框，AP 41.3%→56.5%（+15.2），当前性能瓶颈在中心点检测精度"
type: claim
status: asserted
scope: "笔记 §错误分析所载 oracle 实验（笔记标注 Table 5）：在消融最终配置（CRE+CTP+CCP，AP 41.3%）的推断中，不用网络预测的中心点、改用 GT 中心点过滤角点框；56.5% 为论文自报上限值，非系统最终精度；数据集 MS-COCO validation，2026-11-05 已按 arXiv 1904.08189v3 §4.6 原文补核（见 falsifier 1）；论文另报 CenterNet511-104 同型 oracle 44.8→58.1（笔记未载，见 evidence）"
tags: [centernet, cornernet, keypoint-triplets, oracle, upper-bound, error-analysis]
note: library/Classical_Detection/CenterNet：Keypoint Triplets.md#错误分析-error-analysis
paper: "ICCV 2019, CenterNet: Keypoint Triplets for Object Detection（开源：https://github.com/Duankaiwen/CenterNet）"
stance: watch
evidence:
  - source: library/Classical_Detection/CenterNet：Keypoint Triplets.md
    locator: "§错误分析 (Error Analysis) / 实验设置"
    quote: "作者还做了一个非常有启发性的实验（Table 5）：**如果中心点检测是 100% 准确的，效果会怎样？**"
    relation: supports
  - source: library/Classical_Detection/CenterNet：Keypoint Triplets.md
    locator: "§错误分析 (Error Analysis) / 操作"
    quote: "- **操作：** 在推断时，不使用网络预测的中心点，而是直接使用**真实标签（Ground Truth）**的中心点来过滤框。"
    relation: supports
  - source: library/Classical_Detection/CenterNet：Keypoint Triplets.md
    locator: "§错误分析 (Error Analysis) / 结果"
    quote: "- **结果：** AP 直接从 41.3% 飙升到了 **56.5%** 。"
    relation: supports
  - source: library/Classical_Detection/CenterNet：Keypoint Triplets.md
    locator: "§错误分析 (Error Analysis) / 结论"
    quote: "- **结论：** 这说明 CenterNet 的上限非常高。目前的性能瓶颈主要在于**中心点检测还不够准**。只要能更准确地找到中心点，检测性能还能大幅提升 。"
    relation: supports
  - source: https://arxiv.org/pdf/1904.08189
    locator: "§4.6 Error Analysis（实验设置；arXiv PDF v3，pdftotext 提取，抓取 2026-11-05）"
    quote: "To understand the importance of center keypoints, we replace the predicted center keypoints with the ground-truth values and evaluate performance on the MS-COCO validation dataset."
    relation: supports
  - source: https://arxiv.org/pdf/1904.08189
    locator: "§4.6 Error Analysis（结果句；pdftotext 提取，跨行连字符已还原，抓取 2026-11-05）"
    quote: "Table 5 shows that using the ground-truth center keypoints improves the AP from 41.3% to 56.5% for CenterNet511-52 and from 44.8% to 58.1% for CenterNet511-104, respectively. APs for small, medium and large objects are improved by 15.5%, 16.5%, and 14.5% for CenterNet511-52 and 14.5%, 14.1%, and 13.3% for CenterNet511-104, respectively."
    relation: supports
  - source: https://arxiv.org/pdf/1904.08189
    locator: "Table 5 CenterNet511-52 w/ GT 行（列序 AP/AP50/AP75/AP_S/AP_M/AP_L；pdftotext -layout 提取，抓取 2026-11-05）"
    quote: "CenterNet511-52 w/ GT 56.5 78.3 61.4 39.1 60.3 70.3"
    relation: supports
falsifiers:
  - "原文核查（已完成，未触发，2026-11-05）：原论文无此实验（Table 5），或数字与笔记所载 41.3→56.5 不一致——已实抓 arXiv 1904.08189v3，§4.6 prose 与 Table 5 均命中（41.3→56.5，w/ GT 行 AP_S/AP_M/AP_L = 39.1/60.3/70.3），数据集为 MS-COCO validation，此分支闭合"
  - "同范围复现：复现 oracle 实验，GT 中心点过滤后 AP 提升明显小于 41.3→56.5（如最终 AP <48）"
  - "机制辨别：归因不成立——不改进中心点、仅改进角点定位/框质量或后处理即可接近 56.5，说明瓶颈不在中心点检测；论文自报的分尺寸增量（AP_S +15.5 / AP_M +16.5 / AP_L +14.5，量级均匀）可作为旁证，若复现的 oracle 增益高度集中于某一尺寸档而其他档接近 0，则「中心点检测是统一瓶颈」的读法需要收窄"
review_due: 2026-12-02
related: [claim-centernettriplets-cre-ap-gain-small-objects, claim-centernettriplets-ctp-ap-gain-large-objects, claim-centernettriplets-ccp-ap-gain-large-objects]
signoff: null
---

## 主张

论文声称：在最终配置（CRE+CTP+CCP，AP 41.3%）上做 oracle 实验——推断时保留网络产出的角点框，只把"中心区域是否含同类中心点"的过滤信号换成 GT 中心点，AP 升到 56.5%（+15.2）。由此推断：三元组框架本身判别力足够，瓶颈集中在中心点热图检测精度，改进杠杆应放在中心点检测上。

三个限定：
1. 56.5% 是上限估计，不是系统最终精度；oracle 只替换了过滤信号，框仍来自网络角点（原文设置句已核：replace the predicted center keypoints with the ground-truth values）。
2. "+15.2 全部归于中心点检测"是论文的归因解释；GT 中心点同时隐含了 GT 位置的几何信息，与预测中心点的差距也可能部分来自标注几何而非热图判别力（后半句为本卡整理者推断，尚未验证）。
3. 本卡只主张 oracle 数字与"瓶颈在中心点检测"这一方向性结论，不主张任何具体改进手段（换骨干、改监督等）的有效性。

## 待验证

- 已核对（2026-11-05）：Table 5 存在、41.3→56.5 命中、设置（替换预测中心点为 GT 值、MS-COCO validation）已核，见 evidence；论文另报 CenterNet511-104 oracle 44.8→58.1 与分尺寸增量（+15.5/+16.5/+14.5），笔记未载，已补入 evidence 供引用。剩余：oracle 是否同时移除预测中心点的其他干扰、匹配阈值细节原文未展开。
- 官方实现上复现该 oracle；加一组随机中心点过滤对照，隔离"过滤信号质量"贡献的方差范围（机制辨别）。
- 若用于自家场景：先测中心点热图的 center AP，估计该上限逻辑在本数据的可迁移性（跨条件迁移）。

## 成立/不成立的含义

成立：评估与改进该类三元组检测器时，中心点热图质量是第一优先监控与投入指标；选型上"上限高但当前欠准"的框架适合作为可改进基线跟踪。
不成立：上限主要由角点定位或框质量决定，改进重心应回到角点/框回归侧，本卡降级为"记录了一次 oracle 实验"。

## 核查记录

- 2026-11-05（02 任务书 P1-B7a 整理班）：表达整理 + 原文核查，数字未改写。四条笔记 quote Grep 逐字命中；新增 3 条 arXiv 1904.08189v3 原文 evidence（§4.6 设置句、结果句、Table 5 w/ GT 行）；「待人工核对原文」falsifier 闭合；补论文另报的 CenterNet511-104 oracle（44.8→58.1）与分尺寸增量（笔记未载）；限定 2 后半句补标「整理者推断，尚未验证」。id/status/stance/review_due/signoff 未动。
