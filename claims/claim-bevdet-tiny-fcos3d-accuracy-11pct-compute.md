---
id: claim-bevdet-tiny-fcos3d-accuracy-11pct-compute
title: "BEVDet 声称 BEVDet-Tiny 在 nuScenes val 以 215.3 GFLOPs（FCOS3D 的 11%）与 15.6 FPS（快 9.2 倍）达到与 FCOS3D 相当的精度"
type: claim
status: asserted
scope: "BEVDet（arXiv:2112.11790，笔记按 ar5iv 渲染版转写，对应 v3 2022-06-16）的精度-效率权衡声明（论文摘要口径）；窄卡绑定：nuScenes val set、BEVDet-Tiny（704×256 输入，SwinTransformer-Tiny）31.2% mAP / 39.2% NDS，对比 FCOS3D（1600×900）29.5% / 37.2%（Table 2 无 TTA/ensemble 行）；计算量/速度口径为论文自述：基于 MMDetection3D、无数据增强下测得、单目方法（FCOS3D）推理速度已除以相机数 6，论文注明该口径可能不是单目方法的最优 batch 方式；『相当（comparable）』为论文摘要措辞（两指标实际略高于 FCOS3D），本卡不扩展为『更优』或推广到 test set / 其他对手"
tags: [bevdet, accuracy-efficiency, real-time, nuscenes, fcos3d]
note: library/BEV_Detection/BEVDet.md#32-benchmark-结果
paper: "arXiv:2112.11790, BEVDet: High-Performance Multi-Camera 3D Object Detection in Bird-Eye-View（v3 2022-06-16）"
stance: watch
evidence:
  - source: library/BEV_Detection/BEVDet.md
    locator: "§1.3（Abstract 原句）"
    quote: "requires just 11% computational budget of 215.3 GFLOPs and runs 9.2 times faster at 15.6 FPS"
    relation: supports
  - source: library/BEV_Detection/BEVDet.md
    locator: "§3.2 Table 2 BEVDet-Tiny 行（nuScenes val）"
    quote: "| BEVDet-Tiny | 704×256 | 53.7M | 215.3 | Camera | 0.312 | 0.691 | 0.272 | 0.523 | 0.909 | 0.247 | 0.392 | 15.6 |"
    relation: supports
  - source: library/BEV_Detection/BEVDet.md
    locator: "§3.2 Table 2 FCOS3D 行（nuScenes val）"
    quote: "| FCOS3D [49] | 1600×900 | 52.5M | 2,008.2 | Camera | 0.295 | 0.806 | 0.268 | 0.511 | 1.315 | 0.170 | 0.372 | 1.7 |"
    relation: supports
  - source: library/BEV_Detection/BEVDet.md
    locator: "§3.1 速度口径（§4.1 Inference Speed，论文自述）"
    quote: "基于 MMDetection3D；所有速度与计算量均在无数据增强下测得；单目方法（FCOS3D、PGD）的推理速度除以 6（每样本图像数），并注明该口径可能不是单目方法的最优 batch 方式"
    relation: supports
  - source: https://arxiv.org/abs/2112.11790
    locator: "Abstract（抓取 2026-11-03，与笔记引句逐字一致）"
    quote: "BEVDet-Tiny scores 31.2% mAP and 39.2% NDS on the nuScenes val set. It is comparable with FCOS3D, but requires just 11% computational budget of 215.3 GFLOPs and runs 9.2 times faster at 15.6 FPS."
    relation: supports
falsifiers:
  - "官方仓库在 nuScenes val、704×256、无 TTA 下复现 BEVDet-Tiny：mAP 明显低于 FCOS3D（29.5）或远低于自报 31.2，或 215.3 GFLOPs / 15.6 FPS 复测显著不符"
  - "FCOS3D 以其最优 batch 口径（速度不除以 6）重测后，计算量比不再是约 11%、速度比不再是约 9.2 倍（即论文自述口径对结论有实质影响且方向反转）"
  - "论文正式发表版对 Table 2 两行数字或摘要 11%/9.2× 表述有实质修改"
review_due: 2026-12-03
related: [claim-bevdet-bda-decouple-imageview-bev-augmentation, claim-bevdet-scale-nms-small-object-ap-gain]
signoff: null
---

## 主张

论文声称：BEVDet-Tiny（SwinTransformer-Tiny，704×256 输入）在 nuScenes val 上取得 31.2% mAP / 39.2% NDS，与当时 image-view 领先方法 FCOS3D（1600×900，29.5% / 37.2%）相当，但计算量仅 215.3 GFLOPs——约为 FCOS3D 2,008.2 GFLOPs 的 11%——且 15.6 FPS 对 1.7 FPS 快约 9.2 倍。这是论文摘要主打的 trade-off 卖点。口径边界：速度/计算量按论文自述基于 MMDetection3D、无增强、单目速度已除以 6；"comparable" 是论文措辞，两个指标其实都略高于 FCOS3D，但本卡只主张"相当精度 + 11% 计算量、9.2 倍速度"这一可证伪命题。

## 待验证

- 官方仓库复现 BEVDet-Tiny（704×256，无 TTA）在 nuScenes val 的 mAP/NDS 与 latency，核对 31.2/39.2 与 215.3 GFLOPs / 15.6 FPS 量级。
- 已核对（2026-11-03）：arXiv abs 页摘要含 "31.2% mAP and 39.2% NDS … just 11% computational budget of 215.3 GFLOPs … 9.2 times faster at 15.6 FPS"，与笔记引句逐字一致（URL 见 evidence）。
- 用统一口径（同 GPU、同精度模式）重测 FCOS3D 与 BEVDet-Tiny 的 latency，检验 9.2× 是否依赖"单目速度÷6"的口径。

## 成立/不成立的含义

成立：BEV 范式在车载算力约束下有真实效率优势，多相机 3D 检测选型时 BEV 路线可作为低算力档默认候选。
不成立：效率差主要来自评测口径（速度÷6）而非范式本身，或精度复现不到 31.2/39.2，则该 trade-off 主张降级，选型依据回退到统一口径实测。
