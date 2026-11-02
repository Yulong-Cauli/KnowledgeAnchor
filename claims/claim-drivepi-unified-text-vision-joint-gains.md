---
id: claim-drivepi-unified-text-vision-joint-gains
title: "DrivePI 论文声称：文本头与视觉头端到端联合训练提升感知/预测/规划——较 vision-only RayIoU +1.8、mAVE −0.18、规划 L2 −0.52"
type: claim
status: asserted
scope: "DrivePI 0.5B 统一模型（Qwen2.5-0.5B MLLM 底座 + 四个输出头：text / 3D occupancy / occupancy flow / action diffusion，损失权重全 1.0）；消融为表 5（OpenOcc 3D 占据与流 + nuScenes 规划；vision head = occupancy+flow+planning 三头组合，text head = QA 文本）；数字为论文自报（CVPR 2026，arXiv:2512.12799v1）"
tags: [end-to-end-driving, mllm, drivepi, multi-task-learning, occupancy]
note: library/VLM_VLA/DrivePI.md#3-实验
paper: "CVPR 2026, DrivePI: Spatial-aware 4D MLLM for Unified Autonomous Driving Understanding, Perception, Prediction and Planning (arXiv:2512.12799)"
stance: watch
evidence:
  - source: library/VLM_VLA/DrivePI.md
    locator: "§3.3 / 表 5（II 仅视觉头行）"
    quote: "| II | – | ✓ | 47.5 | 0.69 | 1.02 | 0.39 | – |"
    relation: supports
  - source: library/VLM_VLA/DrivePI.md
    locator: "§3.3 / 表 5（III 统一模型行）"
    quote: "| III | ✓ | ✓ | 49.3 | 0.51 | 0.50 | 0.38 | 60.7 |"
    relation: supports
  - source: library/VLM_VLA/DrivePI.md
    locator: "§3.3 / §4.4 读数原句"
    quote: "Compared to the vision-only setting ( II ), the unified model ( III ) increases RayIoU by 1.8%, reduces mAVE by 0.18, and decreases L2 error by 0.52. The main reason is that text understanding helps better align with the appropriate feature space for vision tasks."
    relation: supports
  - source: library/VLM_VLA/DrivePI.md
    locator: "§2.1 / §3.1 四个输出头原句"
    quote: "Finally, we utilize four specialized heads: a text head to generate responses for scene understanding in an auto-regressive manner, a 3D occupancy head for accurate 3D perception, an occupancy flow head for fine-grained motion prediction, and an action diffusion head for trajectory planning."
    relation: supports
  - source: https://arxiv.org/html/2512.12799v1
    locator: "§4.4（HTML v1，2026-11-03 抓取）"
    quote: "the unified model ( III ) increases RayIoU by 1.8%, reduces mAVE by 0.18, and decreases L2 error by 0.52"
    relation: supports
falsifiers:
  - "同配置复现中统一模型（text+vision 头）不优于 vision-only（RayIoU/mAVE/L2 三项均无显著改进）"
  - "给 vision-only 配置补齐训练量（epochs/数据）后差距消失，即增益来自训练量而非跨任务知识注入"
  - "反向实验（去掉 QA 文本数据、只加文本头占位）同样涨点，说明增益与语言监督无关"
review_due: 2026-12-03
related: [claim-drivepi-05b-nuscenes-qa-60p7-snapshot, claim-opendrivevla-autoregressive-waypoint-planning-nuscenes]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：在 0.5B MLLM 上把「语言空间理解」与「3D 占据 + 占据流 + 轨迹规划」三个视觉头端到端联合优化（损失权重全 1.0），相比只用视觉头的配置：3D 占据 RayIoU 47.5→49.3（+1.8）、占据流 mAVE 0.69→0.51（−0.18）、规划 L2 1.02→0.50（−0.52）；作者归因是「文本理解帮助视觉任务对齐到更合适的特征空间」。这是「感知-预测-规划知识注入」主张的直接证据——语言监督改善了空间任务。

注意一个反向数据点：仅文本头时 QA acc 61.2，加入视觉头联合训练后 QA acc 降到 60.7（表 5 行 III）——知识注入在文本侧是微损的，增益集中在视觉侧；引用时应双向呈现。

## 待验证

- 复现表 5 的 I/II/III 三配置（训练/评测代码已开源，README 2026-03-21 声明；checkpoints 与数据集截至 2026-11-02 未发布，需按论文数据引擎自建）。
- 补训练量对照：vision-only 延长训练至收敛，看 +1.8 RayIoU 是否仍在。
- 检查规划 L2 1.02→0.50 的评测设定（无 ego status，表 2 caption 声明默认不用 ego status 以避免 shortcut learning）。

## 若成立 / 不成立意味着什么

成立：单一 MLLM 统一「理解+感知+预测+规划」在 0.5B 量级可行，多任务语言监督对空间任务有净收益。
不成立：增益是训练量假象，则统一框架的价值只剩接口统一，性能上不如专用 VA 模型堆叠。
