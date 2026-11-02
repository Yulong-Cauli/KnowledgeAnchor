---
id: claim-echofusion-paper-table6-inconsistent-with-text
title: "EchoFusion 正文「0.03 less than LiDAR」句与其自身 Table 6 数字不自洽"
type: claim
status: asserted
scope: "arXiv:2307.16532 v2（NeurIPS 2023，Echoes Beyond Points）§5.4 正文一句 vs 同节 Table 6 的 BEV AP@0.7 Overall 列（RT+C 行 vs L 行）；仅记录论文自身数字不自洽，不评价方法优劣、不涉及统计显著性；v1 同句对应表号为 Table 5（数字相同）"
tags: [echofusion, paper-quality, evidence, radar]
note: library/3D_Occupancy/EchoFusion.md#3-实验结果
paper: "NeurIPS 2023, Echoes Beyond Points: Unleashing the Power of Raw Radar Data in Multi-modality Fusion (arXiv:2307.16532)"
stance: watch
evidence:
  - source: https://arxiv.org/html/2307.16532v2
    locator: "§5.4 Comparing multi-modality with single modality 段（HTML 锚 S5.SS4.p3.1）/ p.9；URL+抓取日期 2026-11-03"
    quote: "By combining image and range-time data, we obtain BEV AP that is only 0.03 less than that of LiDAR only method."
    relation: supports
  - source: https://arxiv.org/html/2307.16532v2
    locator: "Table 6 表题（定义 C/L/RD/RT/RA/RP 缩写，确认 L=LiDAR、RT=range-time）/ p.9；URL+抓取日期 2026-11-03"
    quote: "Table 6: BEV detection performances of different modality combinations of our algorithm on RADIal Dataset test split. Refined 3D bounding box annotations are applied. C, L, RD, RT, RA, RP respectively refer to the camera, LiDAR, range-Doppler spectrum, range-time data, range-azimuth map, and radar point cloud."
    relation: supports
  - source: https://arxiv.org/pdf/2307.16532v2
    locator: "Table 6 表头行（pdftotext -layout 文本层，p.9；模态列序 C|RT|RA|RP|L，指标列序 BEV AP@0.7 与 LET-BEV-AP 各 Overall/0-50m/50-100m）；URL+抓取日期 2026-11-03"
    quote: " C    RT     RA       RP     L   Overall       0 - 50m      50 - 100m    Overall       0 - 50m       50 - 100m"
    relation: supports
  - source: https://arxiv.org/pdf/2307.16532v2
    locator: "Table 6 第 6 数据行（仅第 5 个 ✓ 落在 L 列 = LiDAR only）/ p.9；URL+抓取日期 2026-11-03"
    quote: "                             ✓   84.47±0.15    86.92±0.61   91.91±0.13   86.07±0.44    88.55±0.79    93.17±0.10"
    relation: supports
  - source: https://arxiv.org/pdf/2307.16532v2
    locator: "Table 6 第 7 数据行（第 1、2 个 ✓ 落在 C、RT 列 = C+RT）/ p.9；URL+抓取日期 2026-11-03"
    quote: " ✓    ✓                          84.92±0.98    87.56±1.58   91.06±1.18   88.86±0.62    92.81±1.37    94.81±0.52"
    relation: supports
  - source: https://arxiv.org/html/2307.16532v1
    locator: "§5.4 同位置段（HTML 锚 S5.SS4.p3.1）；v1 中对应模态表表号为 Table 5，数字与 v2 Table 6 相同（L 84.47±0.15 / C+RT 84.92±0.98）；URL+抓取日期 2026-11-03"
    quote: "By combining image and range-time data, we obtain BEV AP that is only 0.03 less than that of LiDAR only method."
    relation: supports
  - source: nightshift/QUESTIONS.md
    locator: "「2026-11-02 fire-now」清单 #4（本卡的在案出处）"
    quote: '正文称 RT+C 的 BEV AP "only 0.03 less than LiDAR"，但 Table 6 数字 84.92 vs 84.47 实差 0.45，疑似论文笔误。'
    relation: supports
falsifiers:
  - "官方勘误或 arXiv 新版本把该句改为与 Table 6 一致（改数字或改为 0.45 more），本卡按 falsifier 失效转 stale"
  - "找到论文任一版本（NeurIPS camera-ready / OpenReview / 其他 arXiv 版），其中该句与对应表的 RT+C vs L Overall BEV AP 恰差 0.03 且方向为 less"
  - "给出可信出处证明句中 0.03 指另一处合法比较（与 LiDAR only 之差恰为 0.03），而非 Table 6 的 RT+C 84.92 vs L 84.47"
review_due: 2026-12-03
related: [claim-echofusion-3d-ap-below-lidar, claim-echofusion-rt-vs-ra-noise, claim-echofusion-rt-vs-rp-radial, claim-echofusion-note-table-mismatch]
signoff: null
---

## 我的理解

论文声称（措辞按引用规则，尚未独立验证）：§5.4 说「By combining image and range-time data, we obtain BEV AP that is only 0.03 less than that of LiDAR only method.」，即 RT+C 的 BEV AP 只比 LiDAR only 方法低 0.03。但同一节 Table 6（本次实抓 arXiv v2 HTML 与 PDF，2026-11-03，两处逐字核对）给出：L（LiDAR only）行 Overall BEV AP@0.7 = **84.47±0.15**，C+RT 行 = **84.92±0.98**。实差 = 84.92 − 84.47 = **0.45**，且方向相反——RT+C 比 L **高** 0.45，不是低 0.03；量级差 15 倍。Table 6 的 BEV AP Overall 列中不存在与 L 差 0.03 的行（最近的是 RA+C 84.77，差 0.30）。同段后半句「LET-BEV-AP and long-range detection ability are even better」与 Table 6 一致，不自洽仅限 0.03 这一处。

三点边界说明：

1. **版本鲁棒**：该句在 v1（2023-07 首版，对应表为 Table 5）与 v2 逐字相同，数字也相同，即两个版本均不自洽、v2 未修。库内截图 `library/assets/EchoFusion/Table6.png` 的内容实为含 ADC/RD 行的扩展模态表（与 arXiv v2 Table S3 逐值一致），其中同样给出 L 84.47±0.15 与 C+RT 84.92±0.98——这组数字不是表号错位造成的。
2. **不夸大**：84.47±0.15 与 84.92±0.98 的误差区间重叠，本卡不主张两方法有统计显著差异，只记录「正文数字与自身表格数字不自洽」这一可证伪事实。
3. **库内笔记无此内容**：`library/3D_Occupancy/EchoFusion.md` 未收录该正文句与 Table 6（Grep「LiDAR / 0.03 / 84.92 / 84.47 / Table 6」0 命中，2026-11-03），故本卡无法引用笔记 quote，证据以本次实抓（HTML+PDF 两个独立来源）与 nightshift/QUESTIONS.md #4 的在案记录代替。

## 待验证

- 关注官方仓库 tusen-ai/EchoFusion 与 NeurIPS 2023 camera-ready / OpenReview 页面是否出现勘误或讨论；新版本发布后按 falsifier 处理。
- 按论文设置（3 seeds）复跑 Table 6，看 RT+C vs L 的 Overall BEV AP 差是否稳定在 +0.45 附近。
- 逆向排查 0.03 的可能来源（如早期草稿的某次实验），仅作解释，不影响本卡主张。

## 若成立 / 不成立意味着什么

成立：引用 EchoFusion 时不得转述「BEV AP 仅比 LiDAR 低 0.03」这句正文；对比 LiDAR 的数字一律回 Table 6 原行（RT+C 84.92 vs L 84.47，RT+C 实际略高 0.45），并提示该文正文数字需对表复核后再引用。相关既有卡（3d-ap-below-lidar、rt-vs-ra-noise、rt-vs-rp-radial、note-table-mismatch）均以 Table 6 原表数字为准，不受此句影响。
不成立：找到正文与表格一致的版本，说明该笔误已在某版本修正，本卡按 falsifier 转 stale 并注明版本。
