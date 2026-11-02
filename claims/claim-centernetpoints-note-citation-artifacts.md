---
id: claim-centernetpoints-note-citation-artifacts
title: "CenterNet（Objects as Points）笔记正文残留三处孤立的网页引用编号（17 / 18181818 / 20）"
type: claim
status: asserted
scope: "笔记质量记录，仅针对 library/Classical_Detection/CenterNet：Objects as Points.md 三处句尾孤立数字；不涉及论文内容主张；三处残留均不在任何已立 claim 卡的 evidence quote 内（相关卡引用止于残留字符之前）；QA round2 复审（2026-11-02）发现"
tags: [centernet, note-quality, evidence]
note: library/Classical_Detection/CenterNet：Objects as Points.md#对比分析centernet-vs-cornernet
paper: "arXiv 2019, CenterNet: Objects as Points（开源：https://github.com/xingyizhou/CenterNet）"
stance: watch
evidence:
  - source: library/Classical_Detection/CenterNet：Objects as Points.md
    locator: "§对比分析：CenterNet vs. CornerNet / C 后处理的极简主义 / CornerNet 条目"
    quote: "仍可能产生重叠的检测结果，通常需要 Soft-NMS 来进一步清理 17。"
    relation: supports
  - source: library/Classical_Detection/CenterNet：Objects as Points.md
    locator: "§对比分析：CenterNet vs. CornerNet / C 后处理的极简主义 / CenterNet 条目"
    quote: "这使得 CenterNet 成为真正的 **End-to-End（端到端）** 检测器，无需后处理 18181818。"
    relation: supports
  - source: library/Classical_Detection/CenterNet：Objects as Points.md
    locator: "§潜在局限性 Center Collision / 实际影响"
    quote: "因此，这个理论缺陷在实际应用中几乎可以忽略不计 20。"
    relation: supports
falsifiers:
  - "这些编号在笔记语境中确有指代（有意保留的参考文献编号且正文标明 [17]/[18]/[20] 的指向），并非复制残留"
  - "笔记经用户同意修复后三处孤立数字消失（届时本卡按已修复改写或删除）"
review_due: 2026-12-02
related: [claim-centernetpoints-heatmap-peaks-replace-nms, claim-centernetpoints-center-collision-rare-on-coco]
signoff: null
---

## 我的理解

> 笔记已修正（2026-11-03，本班获 library/ 直写授权后执行）：三处孤立引用编号（17 / 18181818 / 20）已按 fix-list F23 删除，正文文字未改；本卡 evidence quote 所指的残留字符已不存在，quote 保留作为历史记录（修复前行文）。本卡 status 不动（铁律 3），是否按 falsifier「已修复改写或删除」由主人处置。

QA round2 逐字复核 evidence quote 时发现，笔记正文有三处网页复制残留的引用编号：

1. "通常需要 Soft-NMS 来进一步清理 17。"——句尾 "17" 是脚注编号残留（语义止于"清理"）。
2. "无需后处理 18181818。"——"18181818" 是同一脚注编号（[18]）重复四次的残留。
3. "几乎可以忽略不计 20。"——句尾 "20" 是脚注编号残留。

三处均为孤立数字，不影响笔记中任何数字与结论的数值内容；也不在任何已立 claim 的 evidence quote 内（[claim-centernetpoints-heatmap-peaks-replace-nms](claim-centernetpoints-heatmap-peaks-replace-nms.md) 的 quote 止于"作用。"，[claim-centernetpoints-center-collision-rare-on-coco](claim-centernetpoints-center-collision-rare-on-coco.md) 的 quote 止于"（约 20%）。"）。Agent 不得修改 library/，故立本卡记录，待用户修复笔记后按 falsifier 处理。CenterNet 笔记其余部分经本次复审未发现数字类转抄错误。

## 待验证

- 无需外部验证（残留字符直接读笔记即可确认）；修复动作需用户同意（涉及 library/）。

## 若成立 / 不成立意味着什么

成立：用户修复笔记时删除三处残留；在此之前引用该笔记时忽略句尾孤立编号，不做任何解读。
不成立：编号系有意保留的引用标记，则笔记需补注 [17]/[18]/[20] 的出处列表，本卡改写为记录该引用约定。
