---
id: claim-echofusion-rt-vs-ra-noise
title: "在 RADIal 上，RT+C 与 RA+C 的总体 BEV AP 差异在误差范围内"
type: claim
status: asserted
scope: "RADIal test split；refined 3D 标注；BEV AP@0.7；RT+C vs RA+C（同一 EchoFusion 架构，同一论文 Table 6 内比较）；每组实验重复 3 次、模态消融报 mean 与 variance（论文 §5.1 所述设置，±值统计口径未进一步定义）；论文自报数字"
tags: [radar, sensor-fusion, echofusion, radial]
note: library/3D_Occupancy/EchoFusion.md#32-消融实验雷达数据格式与模态影响
paper: "NeurIPS 2023, Echoes Beyond Points: Unleashing the Power of Raw Radar Data in Multi-modality Fusion"
stance: watch
evidence:
  - source: https://arxiv.org/pdf/2307.16532v2
    locator: "§5.4 / Table 6 讨论段 / p.9（pdftotext -layout 提取、换行合并；HTML v2 同句含引用链接「[ 39 ]」，2026-11-05 本班双源实抓复核）；URL+抓取日期 2026-11-05"
    quote: "The performance gap between RT and RA with camera modality is within the error bar, indicating that it is not necessary to explicitly solve the azimuth, nor necessary to permute the Doppler-angle dimensions as FFTRadNet [39] does."
    relation: supports
  - source: https://arxiv.org/abs/2307.16532
    locator: "Table 6 / p.9（arXiv HTML v2，2026-11-05 本班实抓复核逐字命中）"
    quote: "Table 6: BEV detection performances of different modality combinations of our algorithm on RADIal Dataset test split. Refined 3D bounding box annotations are applied."
    relation: supports
  - source: https://arxiv.org/pdf/2307.16532v2
    locator: "Table 6 模态区第 6 数据行（第 1、2 个 ✓ 落在 C、RT 列 = C+RT；pdftotext -layout 文本层原样空格，p.9）；URL+抓取日期 2026-11-05"
    quote: " ✓    ✓                          84.92±0.98    87.56±1.58   91.06±1.18   88.86±0.62    92.81±1.37    94.81±0.52"
    relation: supports
  - source: https://arxiv.org/pdf/2307.16532v2
    locator: "Table 6 模态区第 7 数据行（第 1、3 个 ✓ 落在 C、RA 列 = C+RA；pdftotext -layout 文本层原样空格，p.9）；URL+抓取日期 2026-11-05"
    quote: " ✓           ✓                   84.77±0.65    87.93±0.60   91.48±0.28   89.54±0.54    93.83±0.56    94.87±0.58"
    relation: supports
falsifiers:
  - "多种子复现显示 RT+C 与 RA+C 的总体 BEV AP 差异稳定超出误差条"
  - "误差条的计算方式或训练配置不一致，导致“在误差范围内”的结论不成立"
review_due: 2026-11-30
related: [claim-echofusion-rt-vs-rp-radial, claim-echofusion-note-table-mismatch]
signoff: null
---

## 我的理解

论文明确说 RT+C 与 RA+C 的差距在误差条内；Table 6 的总体 BEV AP 是 **84.92**（RT+C，±0.98）对 **84.77**（RA+C，±0.65），LET-BEV-AP 则是 **88.86** 对 **89.54**。因此“RT 比 RA 更好”不是这篇论文支持的结论；它只支持“RT 与 RA 都优于点云，且不必显式解算方位角”。

证据边界：以上数字全部是论文自报，且「在误差条内」是作者对自己 3 次运行结果的表述——误差条的计算方式（方差/标准差/置信区间）论文未写明，本卡无法独立复核该统计判断，只能核对表列数字本身。笔记 `library/3D_Occupancy/EchoFusion.md` §3.2 的消融表与论文 Table 6 不一致（42.4/38.6/33.1 一组数字对不上原表），引用时以论文原表为准，见 [笔记偏差卡](claim-echofusion-note-table-mismatch.md)。

## 待验证

- 按论文设置多种子复跑，确认 84.92 与 84.77 的差异是否始终小于误差条。
- 检查 RT/RA 分支的预处理与容量是否对等；RA 分支多做了一次角度 FFT。
- 如果换成别的雷达或数据集，RT vs RA 的排序可能改变，需要单独验证。

## 若成立 / 不成立意味着什么

成立则工程上可以选更便宜的 RA 或 RT，取决于数据管线；不成立则说明 RT 的多普勒/时间信息确实带来稳定增益，不能把两者视为等价。

## 核查记录

- 建卡（日期未记录）：§5.4 句与 Table 6 表题自 arXiv abs 页摘录，当时未记录抓取日期；正文 Table 6 数字无 quote 支撑。
- 2026-11-05（02 任务书整理班）：实抓 arXiv v2 HTML + v2 PDF 双源复核；发现原 §5.4 引文缺引用标记「[39]」（原句实为「as FFTRadNet [39] does」），已按 PDF 文本层（换行合并）修正并改源为 PDF URL；补 Table 6 RT+C、RA+C 两行原文行作 evidence，正文数字（84.92±0.98 / 84.77±0.65 / 88.86±0.62 / 89.54±0.54）与行数字一致；scope 补「同一架构内比较」与「3 次运行 mean/variance（§5.1）」边界；正文补证据边界与笔记偏差链接。id/status/stance/review_due/signoff 未动。
