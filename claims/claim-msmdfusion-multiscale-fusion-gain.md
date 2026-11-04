---
id: claim-msmdfusion-multiscale-fusion-gain
title: "MSMDFusion 论文声称（Table 5 消融）：C2–C5 四尺度全部做 LiDAR-相机交互优于任何单尺度——比最佳单尺度（C2）高 1.42 mAP / 1.01 NDS（66.93/68.93 vs 65.51/67.92），论文将该增益口径写作 '~2% mAP / ~1% NDS'"
type: claim
status: asserted
scope: "nuScenes 训练集随机 1/4 子集（'Following UVTR' 的消融降规模口径，§4.3），TransFusion-L 为基线（#1 60.26/65.62），各行均含 MDU+GMA-Conv、仅交互发生的尺度不同（C2 空间分辨率最大、C5 最小，Table 5 表题）；'最佳单尺度'指 Table 5 中单尺度行（#2–#5）的最高 mAP 行即 #2（仅 C2，65.51/67.92）；增益按表内行差验算为 +1.42 mAP / +1.01 NDS，论文正文口径为 '~2% mAP / ~1% NDS'（约整表述，本卡两种口径并写）；nuScenes test SOTA 数字（71.5/74.0）与 MDU/GMA-Conv 组件消融另有专卡，不在此卡；论文自报数字，尚未独立验证"
tags: [msmdfusion, lidar-camera-fusion, multi-scale, ablation, nuscenes]
note: library/Multimodal_Fusion/MSMDFusion.md#36-多尺度交互的作用
paper: "CVPR 2023, MSMDFusion: Fusing LiDAR and Camera at Multiple Scales with Multi-Depth Seeds for 3D Object Detection (arXiv:2209.03102)"
stance: watch
evidence:
  - source: library/Multimodal_Fusion/MSMDFusion.md
    locator: '§3.6 / Table 5（逐行照抄）'
    quote: '| 2 | ✓ |  |  |  | 65.51 | 67.92 |'
    relation: supports
  - source: library/Multimodal_Fusion/MSMDFusion.md
    locator: '§3.6 / Table 5（逐行照抄）'
    quote: '| 8 | ✓ | ✓ | ✓ | ✓ | 66.93 | 68.93 |'
    relation: supports
  - source: library/Multimodal_Fusion/MSMDFusion.md
    locator: '§3.6 / Table 5 表题'
    quote: Effects of LiDAR-camera interaction at different scales, C2-C5 represent the scales where the spatial resolutions of the features decrease from C2 to C5.
    relation: supports
  - source: library/Multimodal_Fusion/MSMDFusion.md
    locator: '§3.6 正文原话（§4.3.2）'
    quote: The complete multi-scale interaction model achieves performance gains of $\sim$ 2% mAP and $\sim$ 1% NDS over the best single-scale model, which indicates that multi-scale interaction is beneficial for comprehensive multi-modal fusion.
    relation: supports
  - source: library/Multimodal_Fusion/MSMDFusion.md
    locator: '§3.6 正文原话（§4.3.2）'
    quote: for models with single-scale interaction (#2-#4), interacting at scales of larger spatial resolution generally leads to larger performance gains over the baseline (#1), which mainly benefits from more fine-grained image and LiDAR features
    relation: supports
  - source: library/Multimodal_Fusion/MSMDFusion.md
    locator: '§3.1 消融数据规模（§4.3）'
    quote: Following UVTR [9], we conduct the following ablation studies on a randomly sampled 1/4 split of nuScenes training set for efficiency.
    relation: supports
  - source: library/Multimodal_Fusion/MSMDFusion.md
    locator: '§3.5 / Table 4 表题基线设置'
    quote: We use TransFusion-L [1] as our baseline (#1), and perform multi-scale fusion across all experiments.
    relation: supports
  - source: https://arxiv.org/html/2209.03102v3
    locator: '§4.3.2（arXiv HTML v3，2026-11-03 抓取）'
    quote: achieves performance gains of ∼ \sim 2% mAP and ∼ \sim 1% NDS over the best single-scale model
    relation: supports
  - source: https://arxiv.org/html/2209.03102v3
    locator: '§4.3.2（arXiv HTML v3，2026-11-03 抓取）'
    quote: If the multi-modal interaction is performed at more scales (#6-#8), multi-granularity information can be integrated into our progressive interaction process to consistently achieve better performances than single-scale models.
    relation: supports
  - source: https://arxiv.org/html/2209.03102v3
    locator: 'Table 5（arXiv HTML v3 去标签文本，2026-11-03 抓取）'
    quote: '2 ✓ 65.51 67.92'
    relation: supports
  - source: https://arxiv.org/html/2209.03102v3
    locator: 'Table 5（arXiv HTML v3 去标签文本，2026-11-03 抓取）'
    quote: '8 ✓ ✓ ✓ ✓ 66.93 68.93'
    relation: supports
falsifiers:
  - "用官方代码（github.com/SxJyJay/MSMDFusion）在同口径（1/4 子集、TransFusion-L 基线、MDU+GMA-Conv 全开）复跑：任一单尺度配置（仅 C2/C3/C4/C5）mAP 达到或超过 66.93（多尺度无优势）"
  - "完整 nuScenes 训练集（非 1/4 子集）上多尺度相对最佳单尺度的增益消失或为负（口径外推失败）"
  - "查得 arXiv 其他版本 / CVPR 2023 camera-ready 中 Table 5 数字或该增益表述与 '~2% mAP / ~1% NDS' 不一致"
  - "发现论文在其他段落用不同数字描述同一对比（如把 +1.42 写成 +2 或反之），说明 '~2%' 口径不稳定，引用时只能按表内行差"
review_due: 2026-12-03
related: [claim-msmdfusion-nuscenes-test-sota-single-model, claim-msmdfusion-multidepth-unprojection-no-noise]
signoff: null
---

## 我的理解

这是 MSMDFusion 的多尺度融合消融卡，核心是把"+~2% mAP"这个论文口径写清楚：

- **表内事实**：Table 5 中仅 C2 交互的单尺度模型 65.51 mAP / 67.92 NDS（四行单尺度中最高），C2–C5 全开的完整模型 66.93 / 68.93——行差验算 +1.42 mAP / +1.01 NDS。
- **论文口径**：正文把这一增益写作 "~2% mAP and ~1% NDS over the best single-scale model"。即 "~2%" 是对 +1.42 的约整上浮（NDS 的 "~1%" 与行差 +1.01 吻合）。引用时建议两个口径都带：论文口径 "~2%/~1%"，表内行差 "+1.42/+1.01"。
- **结构信息**：单尺度内部，空间分辨率更高的浅层尺度收益更大（#2 仅 C2 = 65.51 最好，#5 仅 C5 = 64.52 最差），论文归因于更细粒度的图像/LiDAR 特征；多尺度组合（#6→#7→#8）单调上升，说明深层尺度仍有互补信息。

两个边界：① 这是 nuScenes 1/4 训练子集 + TransFusion-L 基线的消融口径，不能直接换算到 nuScenes test 的 71.5/74.0（那是 related SOTA 卡的口径）；② "多尺度有益"是相对本方法自身骨架的消融结论，不是对一切融合框架的普适定律。

TableRow 与两句正文已于 2026-11-03 实抓 arXiv HTML v3（https://arxiv.org/html/2209.03102v3 ）逐字复核命中（Table 5 的 #2/#8 行值与 "~2%/~1%" 句）。

## 待验证

- 用官方仓库复跑 Table 5 的 #2 与 #8 两行，核对 65.51/67.92 与 66.93/68.93（重点看 1/4 子集划分是否可复现）。
- 在完整训练集上补一组 #2 vs #8，检验 +1.42 mAP 的增益是否随数据规模保持。
- 把"最佳单尺度"换成 C3/C4/C5 重算增益区间（+1.94～+2.41 mAP：66.93−64.99=1.94、66.93−64.97=1.96、66.93−64.52=2.41；本卡原写"+1.96～+2.41"系把 #4 行差误作下限，2026-11-05 验算改正），确认论文选 C2 作"best single-scale"是因为它确实最强而非有利于叙事。

## 若成立 / 不成立意味着什么

成立：体素空间多尺度 LiDAR-相机交互值得付出（比最佳单尺度 +1.42 mAP），且浅层大分辨率尺度是收益主体——做融合检测器消融时应把"在哪些尺度交互"作为独立设计轴，并预期浅层尺度贡献最大。
不成立：单尺度（尤其仅 C2）即可追平多尺度，则 MSMDFusion 的"多尺度融合"卖点降级为实现细节，相关算力开销（多尺度 MDU+GMA-Conv）不划算，选型回到单尺度交互 + 加深 encoder 的路线。

## 核查记录

- 2026-11-05（02 任务书整理班 P1-B4a）：本卡 7 条 library 侧 evidence quote 逐字 Grep 验证命中笔记现状文本（另 4 条 arXiv HTML v3 外部 quote 保留 2026-11-03 抓取记录）；待验证第 3 条增益区间验算改正 +1.96→+1.94（原把 #4 行 64.97 的差值误作区间下限，#3 行 64.99 的差值 1.94 才是下限；改正仅涉本卡自算区间，不改任何论文/笔记数字）。其余原样：口径双写（"~2%/~1%" 与行差 +1.42/+1.01）、Table 6 K=6 行 = 本卡 #8 行的同值锚点已在 MDU 卡（claim-msmdfusion-multidepth-unprojection-no-noise）正文互注、related 已双向。
