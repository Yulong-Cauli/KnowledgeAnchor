# 待主人拍板

（夜班把拿不准、需要主人决定的事项写在这里，不要替主人做决定）

## 2026-11-02 fire-now

1. **BEV-Planner 开源状态**：NVlabs/BEV-Planner 的 GitHub README 抓取超时（raw.githubusercontent.com 不可达），笔记三行头部的"是否开源"目前仅以 arXiv 摘要原句为据，未做二级确认。→ 请主人顺手确认后修正笔记头部。
2. **BEV-Planner 输入分辨率**：笔记 §3.1 按抓取页 alttext 记为 256×704，但 LaTeXML 渲染有 mphantom 缺字 bug，可能有误。→ 建议对照 PDF 确认。
3. **library/README.md 的 ADe2e 小节**：已给出建议表格行（`nightshift/suggestions/library-README-ADe2e.md`），篇数暂按 1 计（UniAD/AutoVLA 目录只有截图无笔记）。→ 等你同意后手动合并。
4. **EchoFusion 论文自身疑点**：正文称 RT+C 的 BEV AP "only 0.03 less than LiDAR"，但 Table 6 数字 84.92 vs 84.47 实差 0.45，疑似论文笔误。是否值得另立一张 claim 卡记录此矛盾（措辞会是"论文声称/数字不自洽"），由你决定。
5. **ShuffleNet 出处存疑**：arXiv abs 页无 Comments 字段，"CVPR 2018" 系任务给定；v2 正文自称 "This report"。建卡/引用前建议对照 CVF Open Access 版确认。
6. **MobileNet 系列 ar5iv 版本歧义**：V2/V3 的 ar5iv 摘要与 arXiv abs 页 v1–v5 摘要均不一致（V3 头条数字 20/6.6/34 vs 15/4.6/30）。笔记已双源分别标注，但引用 V2/V3 数字前建议以官方 PDF 对版。另 V3 内部 Table 3 vs 附录 Table 9 有 219/217、67.4/67.5 两处小出入。
7. **OpenDriveVLA 标题确认**：实际标题为 "OpenDriveVLA: Towards End-to-end Autonomous Driving with Large Vision Language **Action** Model"（arXiv:2503.23463，API ti 检索唯一命中，v1/v2 一致），与我下发任务里写的 "...Vision Language Models" 有出入。已按唯一命中采用，请你确认无误。
8. **TODO 笔误更正确认**：TODO「VLM / VLA」组里的 "Alpamago" 经 arXiv 全网检索不存在（totalResults=0），实为 NVIDIA 的 **Alpamayo-R1**（arXiv:2511.00088）；身份已由你预存的 `library/assets/Alpamago/` 表格截图与论文 HTML 逐值交叉确认。草稿按 Alpamayo-R1 写成，文件名暂用 Alpamago.md，正式入库时建议更名并修 TODO。
9. **TODO 笔误更正确认（二）**："BRCEQ" 实为 **BRECQ**（arXiv:2102.05426，ICLR 2021，PTQ；API 检索 BRCEQ 0 命中、BRECQ 恰 1 命中，且 `library/assets/BRCEQ/` 三张截图均为 BRECQ 内容）。草稿按 BRECQ 写成；TODO.md 是禁改文件，请你顺手改。BRECQ 的 ICLR 2021 出处仅依据官方 GitHub 自述，引用前建议核 OpenReview。
10. **COTR 配图表号错位**：本地 `library/assets/COTR/Table4.png` 的内容实为论文 HTML v2 的 Table 3，PDF 与 HTML 表号疑整体错位一位。回填配图前请对照官方 PDF 确认映射。另 COTR 原文内部有三处数字/表述不一致（§4.3 41.05 vs Table 2 的 41.39 等），笔记已注记。
11. **RadarOcc 消融表待查**：RadarOcc 笔记缺实验章节（止于损失函数小节），4 张新卡因此全部立为窄卡。若论文原文有 SSS/DBD/S2C 消融表，可补笔记后另立性能卡——补 library 笔记需你同意，是否要做？
12. **VQ-Map 笔记乱码**：`library/Quantization/VQ-Map.md` §4.1 分析行约 105 行处有乱码"细□度"（疑为"细粒度"），请人工修复。另 VQ-Map 四张新卡均基于笔记单源自报数字，笔记未给 arXiv 号，引用前建议对原文核对。
