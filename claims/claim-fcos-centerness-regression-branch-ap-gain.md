---
id: claim-fcos-centerness-regression-branch-ap-gain
title: "FCOS 笔记图注声称：将 center-ness 从分类分支移到回归分支后 AP 进一步提升"
type: claim
status: asserted
scope: "FCOS（ICCV 2019）center-ness 的挂载位置设计（分类分支 vs 回归分支）；依据仅为笔记 Figure2 处图注，笔记未载 AP 数字、未注明“后续实验”出处，证据强度为四张 FCOS 卡中最弱，尚未独立验证"
tags: [fcos, anchor-free, detection, centerness, ablation]
note: library/Classical_Detection/FCOS.md#architecture
paper: "ICCV 2019, FCOS: Fully Convolutional One-Stage Object Detection（开源：https://github.com/tianzhi0549/FCOS）"
stance: watch
evidence:
  - source: library/Classical_Detection/FCOS.md
    locator: "§Architecture（Figure2 图注）"
    quote: "注意：关于 Center-ness 的归属问题，后续实验证明，将其移到回归分支后，AP 进一步提升"
    relation: supports
falsifiers:
  - "复现中 center-ness 放在分类分支与回归分支 AP 相当或分类分支更高"
  - "该图注所指的“后续实验”无法在 FCOS 原文、扩展版或官方仓库中找到出处（图注可能为笔记作者的转述）"
review_due: 2026-12-02
related: [claim-fcos-centerness-suppresses-low-quality]
signoff: null
---

## 我的理解

笔记 Figure2 处图注记载：“后续实验证明，将其移到回归分支后，AP 进一步提升”——即 center-ness 挂在回归塔比挂在分类塔更优。本卡按笔记记载转述，尚未独立验证。

限定：图注未注明“后续实验”的具体出处（原论文正文、扩展版或第三方工作），笔记全文亦无 AP 数字；本卡只记录该设计方向，不主张任何数字。

> 附注（2026-11-03，出处已定位）：上述「待验证」第一项已部分完成——FCOS arXiv:1904.01355 **v5**（2019-08-20）§3.3 脚注 2 原文："it has been shown that the AP on MS-COCO can be improved if the center-ness is parallel with the regression branch instead of the classification branch."；§4.1.1 Table 3（COCO minival 消融）「+ ctr. on reg.」行 AP 37.1 → 37.4。即图注所述「移到回归分支 AP 提升」在原文有据（脚注引述 + 消融表），2026-11-03 实抓 arxiv.org/html/1904.01355 核实；笔记图注已补该 locator。本卡 scope/title 未改，数字是否补入 evidence 待主人定夺（evidence 仍以笔记 quote 为准）。

## 待验证

- 在 FCOS 原论文及官方仓库 / 后续版本中找到该结论的原始出处与具体数字，补进 evidence。
- 复现 center-ness 挂载位置（分类分支 vs 回归分支）的消融。

## 若成立 / 不成立意味着什么

成立：实现 FCOS 类检测器时应把 center-ness 放在回归分支——它本质上是回归质量的度量而非分类信号。
不成立：该图注属笔记作者转述偏差或结论不可复现，则在卡片内追加标注降级处理（不删除文件、不动 signoff）。
