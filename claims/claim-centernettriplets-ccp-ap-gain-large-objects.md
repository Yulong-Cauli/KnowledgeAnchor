---
id: claim-centernettriplets-ccp-ap-gain-large-objects
title: "CenterNet（Keypoint Triplets）论文声称：角点池化替换为级联角点池化（先看边界再看内部）再 +0.5 AP（40.8%→41.3%），全配置 AP_L 达 55.8%"
type: claim
status: asserted
scope: "笔记 §消融实验组件叠加消融的第三步（累计含 CRE+CTP）：将原 CornerNet 的角点池化替换为 Cascade Corner Pooling（先沿边界取最大值，再从该位置向物体内部取最大值，两者相加）；+0.5 AP 为该步增量（40.8→41.3）、AP_L 55.8% 为全配置值（相对 CRE+CTP 的 53.6 为 +2.2）；数据集已按原文补核：MS-COCO validation（Table 4 caption），基线 CornerNet511-52；2026-11-05 实抓 arXiv 1904.08189v3 补核：论文 Table 4 另有 CCP-only 行（不含 CRE/CTP）AP 38.3、AP_L 52.2 不变、AR_L（Table 4 ARL 列）74.0→75.8；数字均为论文自报，尚未独立验证"
tags: [centernet, cornernet, keypoint-triplets, cascade-corner-pooling, ablation, large-objects]
note: library/Classical_Detection/CenterNet：Keypoint Triplets.md#消融实验
paper: "ICCV 2019, CenterNet: Keypoint Triplets for Object Detection（开源：https://github.com/Duankaiwen/CenterNet）"
stance: watch
evidence:
  - source: library/Classical_Detection/CenterNet：Keypoint Triplets.md
    locator: "§消融实验 / 第三步：引入级联角点池化 (CCP) / 操作"
    quote: "- **操作：** 将原 CornerNet 的角点池化替换为 **Cascade Corner Pooling**（即“先看边，再看里”）。"
    relation: supports
  - source: library/Classical_Detection/CenterNet：Keypoint Triplets.md
    locator: "§消融实验 / 第三步：引入级联角点池化 (CCP) / 结果"
    quote: "- **结果：** AP 从 40.8% 提升到 **41.3%** (+0.5%)。"
    relation: supports
  - source: library/Classical_Detection/CenterNet：Keypoint Triplets.md
    locator: "§消融实验 / 第三步：引入级联角点池化 (CCP) / 关键发现"
    quote: "- **再次增强大物体：** 结合 CenterNet 使用时， $AP_L$ 进一步提升到了 55.8% 。"
    relation: supports
  - source: https://arxiv.org/pdf/1904.08189
    locator: "§4.5 Ablation Study（arXiv PDF v3，pdftotext 提取，跨行连字符已还原，抓取 2026-11-05）"
    quote: "cascade corner pooling improves the AP by 0.7% (from 37.6% to 38.3%). The last row shows the results that we test on the basis of CenterNet511-52, which improves the AP by 0.5% (from 40.8% to 41.3%). The results of the second row show there is almost no change in the AP for large objects (i.e., 52.2% vs. 52.2%), but the AR is improved by 1.8% (from 74.0% to 75.8%)."
    relation: supports
  - source: https://arxiv.org/pdf/1904.08189
    locator: "§4.5 Ablation Study（CCP 与中心验证协同句，句首跨栏被 pdftotext 截去「…ing boxes are effectively suppressed」，pdftotext 提取，抓取 2026-11-05）"
    quote: "which improves the AP for large objects by 2.2% (from 53.6% to 55.8%)."
    relation: supports
  - source: https://arxiv.org/pdf/1904.08189
    locator: "Table 4 caption（数据集口径；pdftotext 提取，抓取 2026-11-05）"
    quote: "Table 4: Ablation study on the major components of CenterNet511-52 on the MS-COCO validation dataset. The CRE denotes central region exploration, the CTP denotes center pooling, and the CCP denotes cascade corner pooling."
    relation: supports
falsifiers:
  - "原文核查（已完成，未触发，2026-11-05）：原论文消融表数字与笔记所载 40.8→41.3 / 55.8 不一致——已实抓 arXiv 1904.08189v3，40.8→41.3（+0.5）与全配置 AP_L 55.8 均在原文命中（§4.5 正文 + Table 4 第五行），数据集为 MS-COCO validation，此分支闭合"
  - "同范围复现：复现中 CCP 步增量 ≤0，或明显低于 +0.5；或全配置（CRE+CTP+CCP）AP_L 明显低于 55.8%（如 <54.5）"
  - "机制辨别（论文自报锚点）：在无中心点验证的纯 CornerNet 上单独加 CCP 仅 +0.7（37.6→38.3）且 AP_L 持平（52.2 vs 52.2）、AR_L +1.8（74.0→75.8）——若复现中 CCP-only 即大幅提升 AP_L，或加中心验证后无 AP_L 增益，则『CCP 引入内部噪声、由中心验证抑制』的协同解释不成立"
review_due: 2026-12-02
related: [claim-centernettriplets-cre-ap-gain-small-objects, claim-centernettriplets-ctp-ap-gain-large-objects, claim-centernettriplets-gt-center-oracle-ap-565, claim-cornernet-corner-pooling-directional-maxsum]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：传统 Corner Pooling 只沿边界取最大值，角点对边缘敏感但缺乏物体内部信息；Cascade Corner Pooling 在此基础上再从边界最大值位置向物体内部取最大值、两者相加，让角点"既看边、又看里"。该步整卡增量 +0.5 AP（40.8→41.3），大物体收益更明显——全配置下 AP_L 达 55.8。

关键限定：笔记明确说 AP_L 55.8 是"结合 CenterNet 使用时"的数值。2026-11-05 原文补核后该限定有了论文自己的分解：CCP-only（不加 CRE/CTP）仅 +0.7（37.6→38.3）且 AP_L 持平（52.2 vs 52.2），AR_L 反而 +1.8（74.0→75.8，"see more objects"但框不准；原文 prose 只写 the AR，数值按 Table 4 ARL 列）；叠在 CRE+CTP 上才是 +0.5（40.8→41.3），AP_L +2.2（53.6→55.8）且论文明确说有中心验证时错误框被抑制。所以 55.8 不能全部归因给 CCP 本身，它是 CCP 与 CRE（中心验证）协同后的全配置值；CCP 单独可独立主张的只有论文报出的两档：单独 +0.7 / 叠加步 +0.5。

## 待验证

- 已核对（2026-11-05）：40.8→41.3、全配置 AP_L 55.8、数据集（MS-COCO validation，Table 4 caption）、CCP-only 行（38.3 / AP_L 52.2 / AR +1.8）均在 arXiv v3 原文命中，见 evidence。剩余：CCP 是否同时替换左上/右下两处角点池化（正文按模块图描述为 top-left/bottom-right 各一套 cascade 池化，笔记未展开，未逐字核对，暂不立卡）。
- 官方实现上做三组对照：CCP-only（无中心验证）、CRE+CTP+CCP（全配置）、以及 CCP 池化内部项单独消融，验证"+0.5 与协同效应"是否成立。
- 观察 CCP 角点热图的误检分布，验证"内部噪声被中心验证抑制"的机制解释（机制辨别）。

## 若成立 / 不成立意味着什么

成立：角点特征补内部信息是可行方向，但收益依赖与中心验证配合使用；复用该组件时应整组采纳而非单独移植 CCP。
不成立：CCP 增益依赖笔记转述或协同假设不成立，本卡收窄为"全配置 41.3 / AP_L 55.8 的组合结果记录"。

## 核查记录

- 2026-11-05（02 任务书 P1-B7a 整理班）：表达整理 + 原文核查，数字未改写。三条笔记 quote Grep 逐字命中；新增 3 条 arXiv 1904.08189v3 原文 evidence（§4.5 CCP 两段 prose + Table 4 caption 数据集口径）；「待人工核对原文」falsifier 闭合；falsifier 3 由纯假设改写为带论文自报锚点（CCP-only +0.7、AP_L 持平、AR +1.8）的机制辨别检查；scope 补数据集与 CCP-only 行。id/status/stance/review_due/signoff 未动。
- 2026-11-05（P3 深核·批二独立复审）：修正本批 3 处「AR100」误标——原文 prose「the AR is improved by 1.8%（74.0→75.8）」按 Table 4 列对位实为 ARL（大物体 AR）列，AR100 为 56.7→57.9；已在 scope/falsifier 3/正文改为 AR_L 并注明对位依据；独立实抓 1904.08189v3 二次复核：3 条笔记 quote 与 3 条 arXiv evidence 逐字命中（含 Table 4 caption 与 CCP-only 行数字）。id/status/stance/review_due/signoff/evidence 未动。
