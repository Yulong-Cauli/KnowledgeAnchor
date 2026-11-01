---
id: claim-radardistill-lidar-teacher-boosts-radar-only-detection
title: "RadarDistill 声称 LiDAR 特征蒸馏大幅提升 radar-only 3D 检测（nuScenes 自报 mAP 20.5 / NDS 43.7，基线 8.6 / 34.7）"
type: claim
status: asserted
scope: "nuScenes（官方 README 声称实验在 nuScenes 上；笔记本身未记录数据集与任何实验数字）；radar-only 学生为 PillarNet (Radar)，LiDAR 教师分支仅训练期使用、推理不需要；数字为 GitHub README 自报（抓取于 2026-11-02）；不覆盖 README 同时声称的 camera-radar fusion 提升设置；尚未独立验证"
tags: [knowledge-distillation, cross-modal, radar, lidar, radar-only-detection, nuscenes, cvpr2024, radardistill]
note: "library/Multimodal_Fusion/RadarDistill.md#radardistill"
paper: "CVPR 2024, RadarDistill: Boosting Radar-based Object Detection Performance via Knowledge Distillation from LiDAR Features (arXiv:2403.05061)"
stance: watch
evidence:
  - source: library/Multimodal_Fusion/RadarDistill.md
    locator: "目标段（笔记开头，无编号章节）"
    quote: "目标：**利用 LiDAR（激光雷达）来教导 Radar（毫米波雷达），从而大幅提升 Radar 单独进行 3D 目标检测的性能。**"
    relation: supports
  - source: https://github.com/geonhobang/RadarDistill
    locator: "README / Abstract（抓取 2026-11-02）"
    quote: "Our comparative analyses conducted on the nuScenes datasets demonstrate that RadarDistill achieves state-of-the-art (SOTA) performance for radar-only object detection task, recording 20.5% in mAP and 43.7% in NDS."
    relation: supports
  - source: https://github.com/geonhobang/RadarDistill
    locator: "README / Methods（抓取 2026-11-02）"
    quote: "Note that the LiDAR branch is solely utilized during the training phase to enhance the radar pipeline and is not required during inference."
    relation: supports
  - source: https://github.com/geonhobang/RadarDistill
    locator: "README / Model Zoo / Radar Models 表（抓取 2026-11-02）"
    quote: "| __PillarNet (Radar, student)__ | 8.6 | 34.7 | Download |"
    relation: supports
falsifiers:
  - "在 nuScenes val 复现：radar-only 学生 + 完整蒸馏的 mAP/NDS 显著低于自报（如 mAP 远低于 20.5），或不优于 radar-only 基线（8.6 / 34.7 一档）"
  - "开源实现或原文表明推理阶段需要 LiDAR 输入（与「LiDAR 分支仅训练期使用」矛盾），或学生实际并非 radar-only 输入"
  - "README Model Zoo 数字与 arXiv:2403.05061 正文不一致，或与第三方复现明显不符"
review_due: 2026-12-02
related: [claim-radardistill-cma-densify-deep-supervision, claim-radardistill-afd-ar-ir-adaptive-weighting, claim-radardistill-pfd-lambda-5to1-loss-gamma5-delta25]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：以 LiDAR 检测器为教师、radar-only PillarNet 为学生做跨模态特征蒸馏，蒸馏后推理不再需要 LiDAR；官方 README 自报 nuScenes radar-only SOTA 为 mAP 20.5 / NDS 43.7，对比基线学生 8.6 / 34.7（约 +11.9 mAP）。

必须记住的口径限制：
1. 本笔记 `library/Multimodal_Fusion/RadarDistill.md` 只有方法梳理（CMA/AFD/PFD/损失函数），**没有实验章节、没有任何指标数字**；本卡的全部数字来自官方 README 抓取（2026-11-02），实验协议（val 还是 test、教师骨干、评测脚本）需对照 arXiv:2403.05061 原文确认。
2. README 摘要同时声称「significantly improves the performance of the camera-radar fusion model」，该设置不在本卡范围内，如需引用应另立卡。

## 待验证

- 用官方仓库（OpenPCDet 底座，`cfgs/radar_distill/radar_distill_train.yaml` / `radar_distill_val.yaml`）在 nuScenes val 复现 20.5 / 43.7。
- 对照 arXiv:2403.05061 正文与表格：评测集是 val 还是 test、教师骨干配置、README Model Zoo 与正文是否一致。
- 检查推理配置确认不含 LiDAR 分支输入。

## 若成立 / 不成立意味着什么

成立：雷达-only 检测经 LiDAR 蒸馏可作为低成本低功耗场景（车规雷达等）的可行路线纳入选型参考，三个蒸馏组件（CMA/AFD/PFD）值得进一步拆卡验证。
不成立：自报数字依赖特定协议或不可复现，则 radar-only 路线回到 CRN 一类基线水平，「大幅提升」退为论文口径下的表述，依赖它的方案设计需重审。
