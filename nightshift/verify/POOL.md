# POOL — 四组验证池跨夜进度真源

> 任务书（唯一规格）：`tmp_docs/05-夜间验证班任务书-四组验证池.md`。
> 调度班次每动作后必须更新本文件并 commit；`mode` 与槽序是调度器唯一输入，**主人可直接改本文件调槽序**。
> QUESTIONS 自 #100 起（#96–99 为 04 班保留）。git 提交 flock `nightshift/.git-commit.lock`，前缀 `nightshift: verify ...`。

- mode: **active**  （active = 正常执行；polling = 全部 done/blocked 后转入，不收摊、不自动停机；⛔ = 主人专用紧急停机）
- automation: `automation-2b53c801-b509-4234-bbc2-fe54d8dc3f39`（2026-11-09 建，active，首火 2026-11-09 00:20）
- cron: `20 0,2,4,6,8 * * *`（recurring=true，5 火/天统一执行器=00:20/02:20/04:20/06:20/08:20；2026-11-09 00:1x 主人批示首火由 01:10 提前至 00:20；00:2x 主人批示 12:20/18:20 取消——夜间 token 约 09:00 过期，五火全在额度窗口内）
- 建池时间：2026-11-09；建池 commit：见 git log「nightshift: verify pool init」

## 槽序与状态

状态集：pending / init / running / harvest / done / blocked / retired。kernel slug 前缀 `ka-verify-`。

| 槽 | kernel | 类型 | EXP 目录 | 状态 | kernel URL | 依赖/备注 |
| --- | --- | --- | --- | --- | --- | --- |
| — | K-env `ka-verify-env-probe-mmlab` | CPU | nightshift/verify/recon-mmlab-env/ | done | kaggle.com/code/cauliyulong/ka-verify-env-probe-mmlab (v1) | v1 结论：默认 py3.13 环境全家装不上（无 cp313 轮+无 nvcc）；PlanB 骨架已成；详见 nightshift/verify/recon/recon-2026-11.md |
| — | K-env-v2 `ka-verify-env-probe2-conda` | CPU | nightshift/verify/recon-mmlab-env/ | running | …(v4) | v3 COMPLETE：conda 双路线底座全装成（torch2.0.1cu118+mmcv-full1.7.2 轮+mmdet2.28 ✓），import 败于 pkg_resources 缺失→v4 钉 setuptools<70（**侦察跟进迭代**非 error 修复，再不开即停手转请示）；Route B mmdet3d CPU 编不出属预期留 T4 |
| — | K-coco-stats `ka-verify-coco-center-collision` | CPU | experiments/centernetpoints-coco-train2017-same-class-center-collision-rare/ | done | …(v2) | **SUPPORT：708 对 / 0.082% 带内（论文 614）；完整性门逐位过**；v1 falsifier 判定作废留痕；核查记录已加 |
| — | K-probe-1 `ka-verify-probe-pointnet-mobilenet` | CPU | experiments/pointnetpillars-pointnet-permutation-invariance-symmetric-function/ | done | …(v2) | **P1 逐位一致 / P2 max 带内（sum 出带观察）/ P4 双 SUPPORT**；P3 未闭合留人工；三卡核查记录已加；RESULTS 四件套齐（env 快照缺口登记） |
| — | K-probe-2 `ka-verify-probe-rayiou-nf4-flops` | CPU | experiments/njusparseocc-rayiou-penalizes-thick-surface/ | running | …(v3) | 修复 2/2 尽（v2 败于 exec 命名空间缺 __name__，v3 已修）；P1 toy SUPPORT+P3 CONSISTENT 稳定复现；今晚 00:20 火收割 P2 |
| — | K-lingo `ka-verify-lingoqa-judge` | CPU | experiments/lingoqa-lingo-judge-spearman-0950/ | running | kaggle.com/code/cauliyulong/ka-verify-lingoqa-judge (v1) | 仅公开参考数据与权重预检，加论文 Table 9 算术；正式相关性仍待逐题模型输出与人工分 |
| 0 | 班 B `claim-qwt-r2-gate-nonregression`（既有） | T4 | experiments/qwt-r2-gate-nonregression/ | **blocked(预算尽)** | …(v5 error 留痕) | v5 败于 create_loader 缺 re_prob kwarg（shim+数据管线已实测全通，v6 只差一行）；**BLOCKED+QUESTIONS #100 三选一待主人**；不再重推 |
| 1 | K-bevdet `ka-verify-bevdet-scale-nms` | T4 | experiments/bevdet-scale-nms-small-object-ap-gain/ | pending | — | 依赖 K-env；关联卡：bevdet-tiny-fcos3d |
| 2 | K-triplets `ka-verify-centernettriplets-oracle` | T4 | experiments/centernettriplets-gt-center-oracle-ap-565/ | pending | — | 依赖 R1/R5 |
| 3 | K-bevplanner `ka-verify-bevplanner-egostatus-injection` | T4 | experiments/bevplanner-egostatus-injection-closes-gap/ | pending | — | 依赖 K-env + R2/R6；关联卡：ego-velocity、egomlp-parity；1–2 会话 STATE 断点 |
| 4 | K-pdquant `ka-verify-pdquant-pd-loss` | T4 | experiments/pdquant-pd-loss-alone-overfits-calibration/ | pending | — | 规则门（同班 B） |
| 5 | K-repqvit `ka-verify-repqvit-w4a4` | T4 | experiments/repqvit-layernorm-reparam-recovers-layerwise/ | pending | — | 规则门；关联卡：repqvit-softmax |
| 6 | K-brecq-a `ka-verify-brecq-w4a4-1024` | T4 | experiments/brecq-w4a4-comparable-qat-1024-images/ | pending | — | 规则门 |
| 7 | K-points-nms `ka-verify-centernetpoints-nms` | T4 | experiments/centernetpoints-heatmap-peaks-replace-nms/ | pending | — | 依赖 K-env（DCNv2）+ R1 |
| 8 | K-fcos `ka-verify-fcos-centerness` | T4 | experiments/fcos-centerness-suppresses-low-quality/ | running | kaggle.com/code/cauliyulong/ka-verify-fcos-centerness (v1) | 同权重配对；先跑新栈补 torchvision 后的 CUDA NMS、权重、COCO val2017 和官方输出一致性门 |
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
- 2026-11-09 00:1x 主人批示首火提前：cron `10 1,3,8,12,18` → `20 0,3,8,12,18`（CronUpdate 已生效，nextRunAt=00:20），任务书/POOL 同步。
- 2026-11-09 00:2x 主人批示 12:20/18:20 两火取消（夜间 token 约 09:00 过期，日间无额度）：cron `20 0,3,8,12,18` → `20 0,2,4,6,8`（CronUpdate 已生效，nextRunAt=02:20），任务书/POOL 同步。
