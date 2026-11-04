---
id: claim-radardistill-lidar-teacher-boosts-radar-only-detection
title: "RadarDistill 声称 LiDAR 特征蒸馏大幅提升 radar-only 3D 检测（nuScenes 自报 mAP 20.5 / NDS 43.7，基线 8.6 / 34.7）"
type: claim
status: asserted
scope: "nuScenes testset（论文 Table 1 口径，2026-11-02 复审抓取核对；笔记本身未记录数据集与任何实验数字）；radar-only 学生为 PillarNet (Radar)，LiDAR 教师分支仅训练期使用、推理不需要；mAP 20.5 / NDS 43.7 与基线 8.6 / 34.7 在 README Model Zoo 与论文 Table 1 一致，数字为论文/README 自报（抓取于 2026-11-02）；基线 PillarNet* 为作者复现且无 test-time augmentation（Table 1 脚注 *）；不覆盖 camera-radar fusion 提升设置；尚未独立验证"
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
    locator: "README / Abstract 后的 Overall architecture 段（README 无独立 Methods 节；抓取 2026-11-02）"
    quote: "Note that the LiDAR branch is solely utilized during the training phase to enhance the radar pipeline and is not required during inference."
    relation: supports
  - source: https://github.com/geonhobang/RadarDistill
    locator: "README / Model Zoo / Radar Models 表（raw README 逐字；抓取 2026-11-02）"
    quote: "| **PillarNet (Radar, student)**  | 8.6  | 34.7  | [Download](https://github.com/geonhobang/RadarDistill/releases/download/v0.0.1/pillarnet_fullset_radar.pth)         |"
    relation: supports
  - source: https://arxiv.org/pdf/2403.05061v3
    locator: "Table 1（nuScenes testset，radar-only 块 RadarDistill 行；pdftotext -layout 提取，抓取 2026-11-02）"
    quote: "RadarDistill                  R      ✓       20.5      43.7      0.461       0.263       0.525       0.336       0.072"
    relation: supports
  - source: https://arxiv.org/pdf/2403.05061v3
    locator: "Table 1（nuScenes testset，radar-only 块 PillarNet* 基线行；pdftotext -layout 提取，抓取 2026-11-02）"
    quote: "PillarNet* [23] (Our baseline)        R       -       8.6      34.7      0.532       0.283       0.615       0.438       0.092"
    relation: supports
  - source: https://arxiv.org/pdf/2403.05061v3
    locator: "Table 1 caption（跨行已按空格还原；pdftotext -layout 提取，抓取 2026-11-02）"
    quote: "Table 1. Performance evaluation on nuScenes testset. The best performed metrics in the radar-only model are marked in bold. “*” denotes models we have reproduced without applying test time augmentation."
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
1. 本笔记 `library/Multimodal_Fusion/RadarDistill.md` 只有方法梳理（CMA/AFD/PFD/损失函数），**没有实验章节、没有任何指标数字**。2026-11-02 复审已对照 arXiv:2403.05061v3：本卡数字为 **nuScenes testset** 口径（Table 1），README Model Zoo 与论文 Table 1 逐格一致（8.6/34.7、20.5/43.7）；但基线 PillarNet* 带脚注「*」——是作者自己复现、且**未用 test-time augmentation**，与论文中其他已发表方法的口径可能不完全对等。
2. README 摘要同时声称「significantly improves the performance of the camera-radar fusion model」，该设置不在本卡范围内，如需引用应另立卡。

## 待验证

- 用官方仓库（OpenPCDet 底座，`cfgs/radar_distill/radar_distill_train.yaml` / `radar_distill_val.yaml`）在 nuScenes 复现 20.5 / 43.7（注意论文口径是 testset，第三方一般报 val，两者不可直接混比）。
- 已核对（2026-11-02）：README Model Zoo 与 arXiv v3 Table 1（testset）一致；剩余待核：教师骨干配置、评测脚本与 * 无 TTA 口径对第三方复现的影响。
- 已核对（2026-11-05，B4d 整理班复核）：本卡全部 evidence quote 重验通过——笔记 1 条、README Abstract/架构说明/Model Zoo 行、arXiv v3 Table 1 两行与 caption 重抓逐字命中，无内容改动。
- 检查推理配置确认不含 LiDAR 分支输入。

## 若成立 / 不成立意味着什么

成立：雷达-only 检测经 LiDAR 蒸馏可作为低成本低功耗场景（车规雷达等）的可行路线纳入选型参考，三个蒸馏组件（CMA/AFD/PFD）值得进一步拆卡验证。
不成立：自报数字依赖特定协议或不可复现，则 radar-only 路线回到 CRN 一类基线水平，「大幅提升」退为论文口径下的表述，依赖它的方案设计需重审。
