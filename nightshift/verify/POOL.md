# POOL — 四组验证池跨夜进度真源

> 任务书（唯一规格）：`tmp_docs/05-夜间验证班任务书-四组验证池.md`。
> 调度班次每动作后必须更新本文件并 commit；`mode` 与槽序是调度器唯一输入，**主人可直接改本文件调槽序**。
> QUESTIONS 自 #100 起（#96–99 为 04 班保留）。git 提交 flock `nightshift/.git-commit.lock`，前缀 `nightshift: verify ...`。

- mode: **active**  （active = 正常执行；polling = 全部 done/blocked 后转入，不收摊、不自动停机；⛔ = 主人专用紧急停机）
- automation: `automation-2b53c801-b509-4234-bbc2-fe54d8dc3f39`（2026-11-09 建，active，首火 2026-11-09 01:10）
- cron: `10 1,3,8,12,18 * * *`（recurring=true，5 火/天统一执行器）
- 建池时间：2026-11-09；建池 commit：见 git log「nightshift: verify pool init」

## 槽序与状态

状态集：pending / init / running / harvest / done / blocked / retired。kernel slug 前缀 `ka-verify-`。

| 槽 | kernel | 类型 | EXP 目录 | 状态 | kernel URL | 依赖/备注 |
| --- | --- | --- | --- | --- | --- | --- |
| — | K-env `ka-verify-env-probe-mmlab` | CPU | nightshift/verify/recon-mmlab-env/ | pending | — | 组 2/3 全部 openmmlab 系 kernel 的 push 前提 |
| — | K-coco-stats `ka-verify-coco-center-collision` | CPU | experiments/centernetpoints-center-collision-rare-on-coco/ | pending | — | 依赖 R1（COCO 标注镜像） |
| — | K-probe-1 `ka-verify-probe-pointnet-mobilenet` | CPU | experiments/pointnetpillars-pointnet-permutation-invariance-symmetric-function/ | pending | — | 关联卡：maxpool-skeleton、mobilenet-dsc |
| — | K-probe-2 `ka-verify-probe-rayiou-nf4-flops` | CPU | experiments/njusparseocc-rayiou-penalizes-thick-surface/ | pending | — | 关联卡：qlora-nf4（#48 材料）、sparseocc-flops |
| — | K-lingo `ka-verify-lingoqa-judge` | CPU | experiments/lingoqa-lingo-judge-spearman-0950/ | pending | — | 依赖 R7；CPU 过慢转 T4 |
| 0 | 班 B `claim-qwt-r2-gate-nonregression`（既有） | T4 | experiments/qwt-r2-gate-nonregression/ | blocked(规则) | — | 主人口头已接受规则（11-09，未验证）——首次 push 实测；解除即 T4 队首，照其 BLOCKED.md |
| 1 | K-bevdet `ka-verify-bevdet-scale-nms` | T4 | experiments/bevdet-scale-nms-small-object-ap-gain/ | pending | — | 依赖 K-env；关联卡：bevdet-tiny-fcos3d |
| 2 | K-triplets `ka-verify-centernettriplets-oracle` | T4 | experiments/centernettriplets-gt-center-oracle-ap-565/ | pending | — | 依赖 R1/R5 |
| 3 | K-bevplanner `ka-verify-bevplanner-egostatus-injection` | T4 | experiments/bevplanner-egostatus-injection-closes-gap/ | pending | — | 依赖 K-env + R2/R6；关联卡：ego-velocity、egomlp-parity；1–2 会话 STATE 断点 |
| 4 | K-pdquant `ka-verify-pdquant-pd-loss` | T4 | experiments/pdquant-pd-loss-alone-overfits-calibration/ | pending | — | 规则门（同班 B） |
| 5 | K-repqvit `ka-verify-repqvit-w4a4` | T4 | experiments/repqvit-layernorm-reparam-recovers-layerwise/ | pending | — | 规则门；关联卡：repqvit-softmax |
| 6 | K-brecq-a `ka-verify-brecq-w4a4-1024` | T4 | experiments/brecq-w4a4-comparable-qat-1024-images/ | pending | — | 规则门 |
| 7 | K-points-nms `ka-verify-centernetpoints-nms` | T4 | experiments/centernetpoints-heatmap-peaks-replace-nms/ | pending | — | 依赖 K-env（DCNv2）+ R1 |
| 8 | K-fcos `ka-verify-fcos-centerness` | T4 | experiments/fcos-centerness-suppresses-low-quality/ | pending | — | 依赖 K-env（mmdet 2.x）+ R1 |
| 9 | K-brecq-b `ka-verify-brecq-w2-granularity` | T4 | experiments/brecq-block-granularity-best-w2-ablation/ | pending | — | 规则门；关联卡：brecq-w2a4-first-usable-level；1–2 会话 |
| 10 | K-lsq `ka-verify-lsq-step-size` | T4 | experiments/lsq-step-size-not-minimize-quantization-error/ | pending | — | **ckpt 存在性门**：无官方 2-bit R18 ckpt → BLOCKED 请主人裁定，不短训 |
| 11 | K-unidad `ka-verify-unidad-postprocessing` | T4 | experiments/bevplanner-unidad-postprocessing-raises-ccr/ | pending | — | 显存+旧栈双风险门，垫底 |

## Recon 状态（R1–R8，见任务书 §5）

- R1 COCO 镜像：未做
- R2 nuScenes maps：未做
- R3 checkpoint/repo 可达性批量：未做
- R4 依赖归档：未做
- R5 Triplets 配置↔ckpt：未做
- R6 退化集来源：未做
- R7 LingoQA 资产：未做
- R8 SparseOcc config：未做
- 产出文件：`nightshift/verify/recon/recon-2026-11.md`（首火创建）

## 班次记录（append-only，时间戳取实际 date）

- 2026-11-09 主会话建池：24 卡四组 → 16 kernel（5 CPU + 10 T4 新 + 班 B）入池，mode=active；任务书 05 定稿（轮询模式版）。规则门主人口头确认已接受，待首火 push 实测。
