---
id: claim-r4det-pdf-depth-supervision-monotonic-gain
title: "R4Det 声称：TJ4DRadSet 上 PDF 三重深度监督每引入一项 BEV mAP 单调增长（45.15 → 46.08 → 46.86）"
type: claim
status: asserted
scope: "TJ4DRadSet（validation set 口径，同论文 §4.4 消融节）；4D 雷达-相机 3D 检测，R4Det 管线内 PDF（全景深度融合）模块的深度监督消融（论文 Table 5，据库内笔记 §2.1 转录，2026-11-05 已实抓原文逐格核实）；基线为仅 L_prob + L_abs（Table 5 设置 A：λ1=0.1、λabs=0.01，BEV mAP 45.15），依次叠加 L_dense（λdense=0.03，46.08）与 L_relative（λ3=0.05，46.86）；Table 5 仅 A→B→C 一种逐级叠加顺序，无换序消融；指标为 BEV mAP；R4Det 自报数字；笔记未记录 VoD 上的对应消融"
tags: [4d-radar, radar-camera-fusion, r4det, depth-fusion, depth-supervision, tj4dradset, ablation]
note: library/Classical_Detection/R4Det.md#211-三重监督的实验支撑
paper: "CVPR 2026 · R4Det: 4D Radar-Camera Fusion for High-Performance 3D Object Detection（笔记标注未开源，未记录 arXiv 号）"
stance: watch
evidence:
  - source: library/Classical_Detection/R4Det.md
    locator: "§2.1【三重监督的实验支撑】/ Table 5"
    quote: "论文通过 Table 5 的消融实验验证了三重监督设计的正交性和必要性。每引入一种监督机制，BEV mAP 均呈现严格的单调增长："
    relation: supports
  - source: library/Classical_Detection/R4Det.md
    locator: "§2.1【三重监督的实验支撑】/ Table 5"
    quote: "BEV mAP 提升至 46.08%（增幅 +0.93%）"
    relation: supports
  - source: library/Classical_Detection/R4Det.md
    locator: "§2.1【三重监督的实验支撑】/ Table 5"
    quote: "进一步提升至 46.86%（增幅 +0.78%）"
    relation: supports
  - source: https://openaccess.thecvf.com/content/CVPR2026/papers/Xia_R4Det_4D_Radar-Camera_Fusion_for_High-Performance_3D_Object_Detection_CVPR_2026_paper.pdf
    locator: "§4.4 Ablation（Table 5 结果叙述句，跨行与公式下标空格已按排版还原；pdftotext -layout 提取，抓取 2026-11-05）"
    quote: "Adding the metric loss (λdense) improves mAP from 45.15 to 46.08 (+0.93), while the relative loss (λ3) further increases it to 46.86 (+0.78)."
    relation: supports
  - source: https://openaccess.thecvf.com/content/CVPR2026/papers/Xia_R4Det_4D_Radar-Camera_Fusion_for_High-Performance_3D_Object_Detection_CVPR_2026_paper.pdf
    locator: "§4.4 Ablation（四损失权重句，跨行已还原；pdftotext -layout 提取，抓取 2026-11-05）"
    quote: "The module uses four loss weights: λ1 (0.1), λabs (0.01), λdense (0.03), and λ3 (0.05)."
    relation: supports
  - source: https://openaccess.thecvf.com/content/CVPR2026/papers/Xia_R4Det_4D_Radar-Camera_Fusion_for_High-Performance_3D_Object_Detection_CVPR_2026_paper.pdf
    locator: "Table 5（Ablation of the Panoramic Depth Fusion module，设置 A 行＝仅 L_prob+L_abs；pdftotext -layout 提取，行内空格原样，右栏串扰已截去，抓取 2026-11-05）"
    quote: "A             0.1    0.01       –       –         45.15"
    relation: supports
  - source: https://openaccess.thecvf.com/content/CVPR2026/papers/Xia_R4Det_4D_Radar-Camera_Fusion_for_High-Performance_3D_Object_Detection_CVPR_2026_paper.pdf
    locator: "Table 5，设置 C 行＝全量三重监督（pdftotext -layout 提取，行内空格原样，右栏串扰已截去，抓取 2026-11-05）"
    quote: "C             0.1    0.01     0.03    0.05        46.86"
    relation: supports
falsifiers:
  - "复现 Table 5 消融：叠加 L_dense 或 L_relative 后 BEV mAP 不升反降，或三项监督同时存在时低于 46.86（单调增长被打破）"
  - "复现增幅与自报显著不符（如 +0.93 / +0.78 复现为零或负）"
  - "发现 45.15 基线实际还含其他监督项或评测口径不同，导致三档数字不可比"
review_due: 2026-12-02
related: [claim-r4det-tj4dradset-ablation-5407-bev-map]
signoff: null
---

## 我的理解

论文声称（据笔记 §2.1 转述）：PDF 模块的深度监督从「仅概率监督 + 雷达稀疏绝对深度」（$\mathcal{L}_{prob} + \mathcal{L}_{abs}$，BEV mAP 45.15）出发，每引入一项监督 BEV mAP 严格单调增长——加基础模型密集伪标签监督 $\mathcal{L}_{dense}$（笔记记为「视觉基础模型（如 Metric3D）」，作用在全图像素 $\mathcal{M}_{all}$）到 46.08（+0.93），再加结构化排序监督 $\mathcal{L}_{relative}$ 到 46.86（+0.78）。

一致性交叉核对：笔记 §3.1 系统消融表中 Baseline 45.15、+PDF 46.86，与 Table 5 的首尾两档一致（PDF 全量 = prob+abs+dense+relative），两表数字自洽。

必须记住的限定：这是 R4Det 自报的消融数字；「每引入一项单调增长」是**论文 Table 5 给出的唯一叠加顺序（A→B→C）下的观察**——2026-11-05 实抓核对：Table 5 只有 A/B/C 三档设置，无换序消融（补充材料 Table 8 为损失权重敏感性 C1–C5：微调任一权重降 0.2–0.7，C5 与主文设置 C 同值 46.86，不是顺序消融），换叠加顺序是否仍单调仍未验证。监督源：密集伪标签源为 Metric3D（2026-11-03 已按原文核实，见下方附注），「L_dense 收益与该基础模型深度质量绑定」的限定仍适用。
> 附注（2026-11-03，笔记修正同步）：①笔记 §2.1 下小节已重编号（「### 1. 三重监督的实验支撑」→「#### 2.1.1」），本卡 note 锚已由 #1-三重监督的实验支撑 同步为 #211-三重监督的实验支撑。②密集伪标签源已按原文核实——R4Det 原文 §3.2 原句 "we incorporate both sparse radar-anchored depth and dense pseudo-ground truth (Metric3D), denoted as d_g^dense, as supervision."，实际所用基础模型即 Metric3D；笔记已把「如 Metric3D」改为「Metric3D」（依据：CVPR 2026 CVF Open Access PDF，2026-11-03 下载核对）。上文「笔记未明确记录实际基础模型」一句就此过时；「收益与该基础模型深度质量绑定」的限定与 falsifier 仍适用。（2026-11-05 B4d 整理补记：上方限定段已改写，原「笔记未明确记录实际基础模型」句已由已核实表述收编，本附注保留作历史记录；同日实抓确认 Table 5 仅 A→B→C 一种叠加顺序，见 evidence。）

## 待验证

- 已核对（2026-11-05）：Table 5 仅 A→B→C 一种叠加顺序（设置 A=λ1+λabs、B=+λdense、C=+λ3），三档数字 45.15 / 46.08 / 46.86 与笔记一致；权重 λ1=0.1、λabs=0.01、λdense=0.03、λ3=0.05（原文 §4.4，见 evidence）。Table 5 属 §4.4 消融节（该节自述在 TJ4DRadSet validation set 上做 chained ablation）。
- 复现：在 TJ4DRadSet 上按同基线训练，逐项加入 $\mathcal{L}_{dense}$、$\mathcal{L}_{relative}$，看 BEV mAP 是否按 45.15 → 46.08 → 46.86 排序。
- 换叠加顺序（如先 L_relative 后 L_dense）看「单调增长」是否仍成立——原文未做，是本主张未排除的解释之一。
- 换用其他密集深度伪标签源（非 Metric3D）看 $\mathcal{L}_{dense}$ 增益是否仍在。

## 若成立 / 不成立意味着什么

成立：雷达-相机融合中「稀疏雷达锚定 + 基础模型密集伪标签 + 相对排序」三重深度监督是正交且可逐项叠加的设计点，自研深度融合头可按项选配。
不成立：增益来自特定叠加顺序、特定基础模型伪标签或评测口径，三重监督设计需重新拆解归因。
