---
id: claim-fcos-fpn-scale-range-assignment
title: "FCOS 声称按回归距离范围（而非锚框尺寸）划分 FPN 层级，可使重叠物体的模糊样本比例大幅下降"
type: claim
status: asserted
scope: "2D 目标检测（FCOS，ICCV 2019）；FPN P3–P7 分层，距离范围 P3:[0,64] 到 P7:[512,∞]（笔记所载回归距离，未标单位与数据集版本）；2026-11-05 实抓 arXiv 1904.01355v5 补核：分层规则句与 m2…m7 = 0, 64, 128, 256, 512, ∞ 在原文命中；模糊样本占比论文有报（Table 2，消融口径 minival）：无 FPN 分层 23.16%（仅跨类 17.84%）→ 有 FPN 分层 7.14%（仅跨类 3.75%），笔记未载数字、本卡仍只主张分层规则与消歧方向；消融数字为论文自报"
tags: [fcos, anchor-free, detection, fpn, multi-scale]
note: library/Classical_Detection/FCOS.md#fpn-解决重叠
paper: "ICCV 2019, FCOS: Fully Convolutional One-Stage Object Detection（开源：https://github.com/tianzhi0549/FCOS）"
stance: watch
evidence:
  - source: library/Classical_Detection/FCOS.md
    locator: "§方法 / FPN 解决重叠"
    quote: "* **分层规则**：根据**回归距离的范围**（而不是锚框大小）进行限制。"
    relation: supports
  - source: library/Classical_Detection/FCOS.md
    locator: "§方法 / FPN 解决重叠"
    quote: "* **效果**：绝大多数重叠物体因尺寸不同被分到了不同层级，模糊样本比例大幅下降。若仍有重叠，则取面积最小的框。"
    relation: supports
  - source: https://arxiv.org/pdf/1904.01355
    locator: "§3.2（多层级分配规则句；arXiv PDF v5，pdftotext 提取，抓取 2026-11-05）"
    quote: "if a location satisfies max(l∗ , t∗ , r∗ , b∗ ) > mi or max(l∗ , t∗ , r∗ , b∗ ) < mi−1 , it is set as a negative sample and is thus not required to regress a bounding box anymore. Here mi is the maximum distance that feature level i needs to regress. In this work, m2 , m3 , m4 , m5 , m6 and m7 are set as 0, 64, 128, 256, 512 and ∞, respectively."
    relation: supports
  - source: https://arxiv.org/pdf/1904.01355
    locator: "§3.1（模糊样本与消歧规则；pdftotext 提取，抓取 2026-11-05）"
    quote: "If a location falls into multiple bounding boxes, it is considered as an ambiguous sample. We simply choose the bounding box with minimal area as its regression target."
    relation: supports
  - source: https://arxiv.org/pdf/1904.01355
    locator: "Table 2（两行数字：行1=无 FPN 分层、行2=有 FPN 分层；列=Amb. samples % / Amb. samples (diff.) %；pdftotext 提取，抓取 2026-11-05）"
    quote: "23.16 17.84 X 7.14 3.75"
    relation: supports
  - source: https://arxiv.org/pdf/1904.01355
    locator: "Table 2 caption 与结果句（pdftotext 提取，抓取 2026-11-05）"
    quote: "Table 2 – Amb. samples denotes the ratio of the ambiguous samples to all positive samples."
    relation: supports
  - source: https://arxiv.org/pdf/1904.01355
    locator: "§4.1（Table 2 结果讨论句；pdftotext 提取，抓取 2026-11-05）"
    quote: "We can see that with FPN, this percentage of ambiguous samples is small (3.75%)."
    relation: supports
falsifiers:
  - "原文核查（已完成，未触发，2026-11-05）：分层规则/范围数值与笔记不符——已实抓 arXiv 1904.01355v5，max(l,t,r,b) 负样本规则句与 m2…m7 = 0,64,128,256,512,∞ 均命中（笔记的 [0,64]…[512,∞] 为同一规则的笔记式记法），此分支闭合"
  - "同范围复现（论文自报锚点）：在官方实现上统计'一个位置落入多个 GT'的模糊样本占比，发现按距离范围分层相对不分层并未显著下降——论文自报锚点：无分层 23.16%（仅跨类 17.84%）→ 有分层 7.14%（仅跨类 3.75%），Table 2，minival 消融口径"
  - "机制辨别：改用其他层级分配规则（如按目标面积 / 按长宽比）在同等设置下精度不降甚至更高，说明按回归距离范围分层并非消歧的必要设计"
review_due: 2026-12-02
related: [claim-fcos-anchorfree-pixelwise-formulation, claim-fcos-centerness-suppresses-low-quality]
signoff: null
---

## 我的理解

笔记声称：逐像素预测会遇到一个位置落在多个重叠物体内的模糊问题；FCOS 不按锚框尺寸、而按回归距离范围给 FPN 各层划分预测职责（P3:[0,64] … P7:[512,∞]），使绝大多数尺寸不同的重叠物体被分到不同层级，模糊样本比例大幅下降；仍有重叠时取面积最小的框。

限定：笔记只给了规则与方向性效果（“大幅下降”），未载模糊样本占比的前后数字，故本卡不含任何数字结论，只主张“分层规则 + 消歧方向”。2026-11-05 原文补核：规则句与 m2…m7 数值逐字命中（笔记的 [0,64] 记法与原文 max(l,t,r,b) 阈值规则同义）；且论文 Table 2 实际自报了模糊样本占比（无分层 23.16% → 有分层 7.14%，仅跨类 17.84% → 3.75%，minival），“大幅下降”有论文数字支撑，但该数字仍是论文自报。

## 待验证

- 已核对（2026-11-05）：分层规则、m2…m7 数值、模糊样本定义与取面积最小框规则、Table 2 数字均在 arXiv v5 原文命中，见 evidence。
- 在官方实现中找到各层 scale range 配置，核对与笔记/原文一致（代码侧仍未查，作为复现前置）。
- 统计开启 / 关闭分层限制时的模糊样本占比，验证“大幅下降”是否成立，对照论文锚点 23.16%→7.14%（同范围复现）。
- 对照按目标面积分配层级的变体，确认消歧效果是否为距离范围规则特有（机制辨别）。

## 若成立 / 不成立意味着什么

成立：FPN 多尺度消歧靠“回归距离范围”而非锚框超参，是 anchor-free 设计中可迁移的分层原则，后续无锚框检测器可直接引用。
不成立：消歧主要来自其他机制（如 center-ness 或回归目标形式），分层规则的作用需降级，引用时不可把消歧归因于它。

## 核查记录

- 2026-11-05（02 任务书 P1-B7a 整理班）：表达整理 + 论文侧核查，数字未改写。两条笔记 quote Grep 逐字命中；新增 5 条 arXiv 1904.01355v5 原文 evidence（分层规则句、模糊样本定义句、Table 2 数字行与 caption、结果讨论句）；falsifier 1 闭合；falsifier 2 补论文自报锚点（23.16%→7.14%，minival）；笔记的 [0,64]…[512,∞] 记法与原文 max 阈值规则的对应关系已记录。id/status/stance/review_due/signoff 未动。
- 2026-11-05（P3 深核·批二独立复审）：修正本批引入的 4 处 ”…” 成对引号误排为 “…”；独立实抓 arXiv 1904.01355v5 二次复核：2 条笔记 quote 与 5 条 arXiv evidence 逐字命中（含 Table 2 数字行 23.16/17.84/7.14/3.75 与分层规则句）。id/status/stance/review_due/signoff 未动。
