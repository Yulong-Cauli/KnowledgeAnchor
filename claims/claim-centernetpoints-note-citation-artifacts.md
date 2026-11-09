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
    locator: "§对比分析：CenterNet vs. CornerNet / C 后处理的极简主义 / CornerNet 条目（2026-11-03 F23 修正前历史记录；现笔记同位置句尾已无「17」）"
    quote: "仍可能产生重叠的检测结果，通常需要 Soft-NMS 来进一步清理 17。"
    relation: supports
  - source: library/Classical_Detection/CenterNet：Objects as Points.md
    locator: "§对比分析：CenterNet vs. CornerNet / C 后处理的极简主义 / CenterNet 条目（2026-11-03 F23 修正前历史记录；现笔记同位置句尾已无「18181818」）"
    quote: "这使得 CenterNet 成为真正的 **End-to-End（端到端）** 检测器，无需后处理 18181818。"
    relation: supports
  - source: library/Classical_Detection/CenterNet：Objects as Points.md
    locator: "§潜在局限性 Center Collision / 实际影响（2026-11-03 F23 修正前历史记录；现笔记同位置句尾已无「20」）"
    quote: "因此，这个理论缺陷在实际应用中几乎可以忽略不计 20。"
    relation: supports
falsifiers:
  - "这些编号在笔记语境中确有指代（有意保留的参考文献编号且正文标明 [17]/[18]/[20] 的指向），并非复制残留"
  - "笔记经用户同意修复后三处孤立数字消失（届时本卡按已修复改写或删除）"
review_due: 2026-12-02
related: [claim-centernetpoints-heatmap-peaks-replace-nms, claim-centernetpoints-coco-train2017-same-class-center-collision-rare]
signoff: null
---

## 这条主张是什么意思

本卡是笔记质量记录（asserted，未经用户复核处置）：CenterNet 笔记正文曾有三处网页复制残留的孤立引用编号（17 / 18181818 / 20），QA round2 逐字复核 evidence quote 时（2026-11-02）发现。三处均为孤立数字，不影响笔记中任何数字与结论的数值内容，也不在任何已立 claim 的 evidence quote 内。

## 当前状态与历史记录

**当前状态（2026-11-03 已修复）**：三处残留已按 fix-list F23 删除（当班获 library/ 直写授权后执行），正文文字未改；2026-11-05 本班 Grep 复核，「清理 17」「后处理 18」「忽略不计 20」在笔记中均 0 命中。修复不影响任何既有卡证据：[claim-centernetpoints-heatmap-peaks-replace-nms](claim-centernetpoints-heatmap-peaks-replace-nms.md) 的 quote 止于"作用。"、[claim-centernetpoints-coco-train2017-same-class-center-collision-rare](claim-centernetpoints-coco-train2017-same-class-center-collision-rare.md) 的 quote 止于"（约 20%）。"，两处锚点 2026-11-05 复核仍在笔记中。

**历史记录（修复前行文，即本卡 evidence 三条 quote 所指原文，现笔记已无此残留）**：

1. "通常需要 Soft-NMS 来进一步清理 17。"——句尾 "17" 是脚注编号残留（语义止于"清理"）。
2. "无需后处理 18181818。"——"18181818" 是同一脚注编号（[18]）重复四次的残留。
3. "几乎可以忽略不计 20。"——句尾 "20" 是脚注编号残留。

CenterNet 笔记其余部分经 round2 复审未发现数字类转抄错误。

## 证据支持到哪里

无需外部验证：残留字符直接读笔记即可确认（evidence 三条为修复前笔记逐字引文，locator 已标注历史记录）。修复动作已于 2026-11-03 由获授权班次执行，非本卡代行。

## 待决事项（登记）

- 本卡 status 不动（铁律 3）。falsifier 2 的触发条件（「笔记经用户同意修复后三处孤立数字消失」）已于 2026-11-03 满足——本卡按已修复改写、删除还是转 stale，由主人裁定。
- falsifier 1（编号系有意保留的引用标记）随残留删除已无事实载体；若主人认定库内笔记存在引用编号约定，另立记录。

## 核查记录

- 2026-11-02：QA round2 逐字复核时发现三处残留，立本卡。
- 2026-11-03：笔记修复（fix-list F23），残留删除、正文文字未改。
- 2026-11-05：本班表达整理与历史/当前分层（数字未改写）；Grep 复核三处残留 0 命中、两条关联卡 quote 锚点仍在。
