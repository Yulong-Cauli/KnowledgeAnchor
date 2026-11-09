---
id: claim-rcbevdetpp-vitl-nuscenes-test-727nds-sota
title: "RCBEVDet++ 自报 nuScenes test（ViT-L 骨干、无 TTA/ensemble）72.7 NDS / 67.3 mAP，超过表内全部 camera-only 与 radar-camera 对比方法（摘要口径 72.73/67.34）"
type: claim
status: asserted
scope: "RCBEVDet++（arXiv:2409.04979 v1 2024-09-08，RCBEVDet CVPR 2024 的期刊扩展版）的基准快照声明（论文自报）；窄卡绑定：nuScenes test set、ViT-L 图像骨干、雷达+相机输入、无测试时增强/无模型集成（Table II：72.7 NDS / 67.3 mAP / mAOE 0.241 / mAVE 0.147；摘要与 §VI 作 72.73/67.34，表内为四舍五入）；对比对象为同表快照——camera-only：SparseBEV†（ViT-L）70.2 NDS（mAP 表内未报，表内最强 camera-only NDS 对照）、Far3D（ViT-L）68.7/63.5、StreamPETR（ViT-L）67.6/62.0、SparseBEV（V2-99）63.6/55.6、SparseBEV† 带未来帧（V2-99）67.5/60.3；radar-camera：CRN（ConvNeXt-B）62.4/57.5；V2-99 变体 68.7/62.6 比 SparseBEV 基线 +5.1 NDS/+7.0 mAP 并超过其 offline 版；快照截至 v1（2024-09-08），非当前榜单状态；SOTA 措辞按论文自述（'new state-of-the-art radar-camera 3D object detection results on nuScenes'）；⚠ §V-B1 'reduce the velocity error by 14.6%' 一句无法由表推出（笔记 QUESTIONS #23），本卡不引该句、不主张速度误差百分比"
tags: [rcbevdetpp, radar-camera-fusion, sota-snapshot, nuscenes, vit-l]
note: library/Multimodal_Fusion/RCBEVDetPP.md#32-3d-目标检测与-sota-对比v-b1
paper: "arXiv:2409.04979 (v1), RCBEVDet++: Toward High-accuracy Radar-Camera Fusion 3D Perception Network（RCBEVDet 的期刊扩展）"
stance: watch
evidence:
  - source: library/Multimodal_Fusion/RCBEVDetPP.md
    locator: "§1.1（Abstract 原句）"
    quote: "Notably, with ViT-L as the image backbone, RCBEVDet++ achieves 72.73 NDS and 67.34 mAP in 3D object detection without test-time augmentation or model ensembling."
    relation: supports
  - source: library/Multimodal_Fusion/RCBEVDetPP.md
    locator: "§3.2（§V-B1 原句，ViT-L SOTA 表述）"
    quote: "Moreover, RCBEVDet++ with the larger ViT-L backbone achieves 72.7 NDS and 67.3 mAP without test-time data augmentation, setting new state-of-the-art radar-camera 3D object detection results on nuScenes."
    relation: supports
  - source: library/Multimodal_Fusion/RCBEVDetPP.md
    locator: "§3.2（§V-B1 原句，V2-99 对 SparseBEV 增量）"
    quote: "On test sets, with the V2-99 backbone, RCBEVDet++ improves the SparseBEV baseline by 5.1 NDS and 7.0 mAP and surpasses its offline version with future frames."
    relation: supports
  - source: library/Multimodal_Fusion/RCBEVDetPP.md
    locator: "§3.2 Table II RCBEVDet++ (Ours) V2-99 行（nuScenes test）"
    quote: "| RCBEVDet++ (Ours) | C+R | V2-99 | 68.7 | 62.6 | 0.437 | 0.252 | 0.181 | 0.203 | 0.191 |"
    relation: supports
  - source: library/Multimodal_Fusion/RCBEVDetPP.md
    locator: "§3.2 Table II RCBEVDet++† (Ours) ViT-L 行（nuScenes test，无 TTA/ensemble 提交口径见表题）"
    quote: "| RCBEVDet++† (Ours) | C+R | ViT-L | 72.7 | 67.3 | 0.341 | 0.234 | 0.241 | 0.147 | 0.130 |"
    relation: supports
  - source: library/Multimodal_Fusion/RCBEVDetPP.md
    locator: "§3.2 Table II SparseBEV 行（V2-99 基线，+5.1/+7.0 的对照）"
    quote: "| SparseBEV [33] | C | V2-99 | 63.6 | 55.6 | 0.485 | 0.244 | 0.332 | 0.246 | 0.117 |"
    relation: supports
  - source: library/Multimodal_Fusion/RCBEVDetPP.md
    locator: "§3.2 Table II SparseBEV† 行（ViT-L，表内最强 camera-only NDS；该行引用编号 [34] 系原文疑误，见笔记 §3.2 作者注）"
    quote: "| SparseBEV† [34] | C | ViT-L | 70.2 | - | - | - | - | - | - |"
    relation: supports
  - source: library/Multimodal_Fusion/RCBEVDetPP.md
    locator: "§3.2 Table II SparseBEV† 行（带未来帧的 offline 版）"
    quote: "| SparseBEV† [33] | C | V2-99 | 67.5 | 60.3 | 0.425 | 0.239 | 0.311 | 0.172 | 0.116 |"
    relation: supports
  - source: https://arxiv.org/html/2409.04979v1
    locator: "Table II 末行（arXiv HTML v1 渲染文本拉平，抓取 2026-11-03，与笔记行逐值一致）"
    quote: "RCBEVDet++ † (Ours) C+R ViT-L 72.7 67.3 0.341 0.234 0.241 0.147 0.130"
    relation: supports
  - source: https://arxiv.org/abs/2409.04979
    locator: "Abstract（抓取 2026-11-03，与笔记引句逐字一致）"
    quote: "Notably, with ViT-L as the image backbone, RCBEVDet++ achieves 72.73 NDS and 67.34 mAP in 3D object detection without test-time augmentation or model ensembling."
    relation: supports
falsifiers:
  - "nuScenes 官方评测复核：同配置（ViT-L、雷达+相机、无 TTA/ensemble）NDS 低于表内最强 camera-only 的 SparseBEV†（ViT-L）70.2、或 mAP 低于 camera-only 最强的 Far3D 63.5（SOTA 不成立），或远低于自报 72.7/67.3（自报数字不实）"
  - "发现该结果实际依赖测试时增强或模型集成（与摘要 'without test-time augmentation or model ensembling' 矛盾）"
  - "V2-99 变体对 SparseBEV 的 +5.1 NDS / +7.0 mAP 不能复现（68.7/62.6 vs 63.6/55.6 的增量不成立）"
review_due: 2026-12-03
related: [claim-rcbevdetpp-sparse-fusion-camf-query-based, claim-rcbevdet-camf-alignment-then-fusion-robust, claim-rcbevdet-rcs-aware-scattering-dense-bev, claim-rcbevdet-dualstream-injection-extraction-interactive, claim-rcbevdet-dmsa-gaussian-mask-early-convergence]
signoff: null
---

## 我的理解

论文声称：RCBEVDet++（雷达-相机融合，RadarBEVNet + 稀疏融合 CAMF）在 nuScenes test 上，ViT-L 图像骨干、不使用测试时增强与模型集成，取得 72.7 NDS / 67.3 mAP（摘要与 §VI 精确到 72.73/67.34），自述为雷达-相机 3D 检测新 SOTA；表内 camera-only 的最强 NDS 对照是带未来帧的 SparseBEV†（ViT-L）70.2（mAP 未报，72.7 仍高于它），mAP 对照最强为 Far3D（ViT-L）68.7/63.5，V2-99 档带未来帧的 SparseBEV† 为 67.5/60.3，radar-camera 对比 CRN 62.4/57.5。中等骨干 V2-99 版 68.7/62.6，比其相机基线 SparseBEV（63.6/55.6）+5.1 NDS / +7.0 mAP，且超过 SparseBEV 使用未来帧的 offline 版（67.5）——说明雷达通道带来的增益超过时间维信息。误差分解的亮点是方向/速度（mAOE 0.241、mAVE 0.147），与雷达测速直接相关的分量明显优于纯相机方法。

口径边界：论文自报、本库未独立复核；快照截至 v1（2024-09-08）。另注：§V-B1 有 "reduce the velocity error by 14.6%" 一句无法由 Table I/II 推出（笔记已标 QUESTIONS #23），本卡不引；速度优势只按 mAVE 绝对值表述。

## 待验证

- 已核对（2026-11-03）：arXiv abs 页摘要与 HTML v1 Table II 末行（ViT-L 72.7/67.3 及五项误差）与笔记逐值一致（URL 见 evidence）；V2-99 行 68.7/62.6、SparseBEV 行 63.6/55.6、SparseBEV† 行 67.5/60.3 亦一致。
- 已核对（2026-11-05）：本班二次实抓 arXiv HTML v1，Table II 的 SparseBEV†（ViT-L）70.2 行与 RCBEVDet++† 末行逐值命中；该 ViT-L 对照行此前在卡内遗漏，已补入 scope/evidence/falsifier。
- 向 nuScenes 官方榜单/评测存档核对 2024-09 时点该提交是否存在且口径为 no TTA/no ensemble。
- 复现 V2-99 版（SparseBEV + 稀疏融合 CAMF，12 epochs 两阶段）核对 +5.1 NDS / +7.0 mAP。

## 若成立 / 不成立意味着什么

成立：雷达通道可把 query-based 相机检测栈推过当时 camera-only SOTA（含用未来帧的方法），雷达-相机融合在强相机骨干下仍有真实增量，值得在量产感知栈保留雷达流。
不成立：复现不到自报数字或依赖了 TTA/ensemble，则 SOTA 主张降级为「接近 camera-only SOTA」，雷达流的成本收益需重新评估。
