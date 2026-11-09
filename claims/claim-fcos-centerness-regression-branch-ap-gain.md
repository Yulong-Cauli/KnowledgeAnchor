---
id: claim-fcos-centerness-regression-branch-ap-gain
title: "FCOS 笔记图注声称：将 center-ness 从分类分支移到回归分支后 AP 进一步提升"
type: claim
status: asserted
scope: "FCOS（ICCV 2019）center-ness 的挂载位置设计（分类分支 vs 回归分支）；主张层级为笔记图注转述：笔记未载 AP 数字，本库未复测不同挂载位置的 AP；数字出处已在原文定位（见正文），evidence 仍以笔记 quote 为准"
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
  - "原文核查（已完成，未触发，2026-11-05）：图注所指出处无法找到——已闭合：FCOS arXiv v5 §3.3 脚注 2 明言 AP 可提升（2026-11-03 实抓），2026-11-05 复核 ICCV camera-ready PDF（arXiv 1904.01355v5）Table 3 同样命中 '+ ctr. on reg.' 行 37.1→37.4（minival、R-50-FPN，caption 定义 'ctr. on reg.': moving the center-ness branch to the regression branch）"
  - "同范围复现：复现中 center-ness 放在分类分支与回归分支 AP 相当或分类分支更高（对照论文自报锚点 37.1→37.4，minival、R-50-FPN）"
review_due: 2026-12-02
related: [claim-fcos-centerness-suppresses-low-quality]
signoff: null
---

## 主张

笔记 Figure2 处图注记载：“后续实验证明，将其移到回归分支后，AP 进一步提升”——即 center-ness 挂在回归塔比挂在分类塔更优。本卡按笔记记载转述。

限定：图注未注明“后续实验”的具体出处（原论文正文、扩展版或第三方工作），笔记全文亦无 AP 数字；本卡只记录该设计方向，不主张任何数字。

出处已定位（2026-11-03 实抓 arxiv.org/html/1904.01355，2026-11-05 复核 camera-ready PDF）：FCOS arXiv:1904.01355 **v5**（2019-08-20）§3.3 脚注 2 原文："it has been shown that the AP on MS-COCO can be improved if the center-ness is parallel with the regression branch instead of the classification branch."；§4.1.1 Table 3（COCO minival 消融）「+ ctr. on reg.」行 AP 37.1 → 37.4。图注所述「移到回归分支 AP 提升」在原文有据（脚注引述 + 消融表），笔记图注已补该 locator。数字是否补入 evidence 待主人定夺，本卡 evidence 仍以笔记 quote 为准（处理经过见核查记录与 falsifier 1）。

## 待验证

- 数字（Table 3 的 37.1→37.4）是否补入 evidence 待主人定夺；定夺前本卡 evidence 保持笔记 quote 原样。
- 复现 center-ness 挂载位置（分类分支 vs 回归分支）的消融，对齐 Table 3 的 minival、R-50-FPN 口径（同范围复现）。

## 成立/不成立的含义

成立：实现 FCOS 类检测器时应把 center-ness 放在回归分支——它本质上是回归质量的度量而非分类信号。
不成立：该图注属笔记作者转述偏差或结论不可复现，则在卡片内追加标注降级处理（不删除文件、不动 signoff）。

## 核查记录

- 2026-11-05（02 任务书 P1-B7a 整理班）：表达整理，数字未改写。笔记 quote Grep 逐字命中；evidence 按 2026-11-03 附注约定保持笔记 quote 原样（数字补入待主人定夺）；falsifier 1（出处核查）标记闭合并补 2026-11-05 camera-ready PDF Table 3 复核记录；falsifier 2 补锚点口径；scope 改为反映「出处已定位、数字补入待定」现状。id/status/stance/review_due/signoff 未动。
