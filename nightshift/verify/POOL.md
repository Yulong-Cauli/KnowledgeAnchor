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
| — | K-env-v2 `ka-verify-env-probe2-conda` | CPU | nightshift/verify/recon-mmlab-env/ | running | …(v4) | v3 COMPLETE：conda 双路线底座全装成（torch2.0.1cu118+mmcv-full1.7.2 轮+mmdet2.28 ✓），import 败于 pkg_resources 缺失→v4 钉 setuptools<70（**侦察跟进迭代**非 error 修复）；Route B mmdet3d CPU 编不出属预期留 T4；**v4 Kaggle 已 COMPLETE（11-09 实测），待 02:20 火收割定论** |
| — | K-coco-stats `ka-verify-coco-center-collision` | CPU | experiments/centernetpoints-coco-train2017-same-class-center-collision-rare/ | done | …(v2) | **SUPPORT：708 对 / 0.082% 带内（论文 614）；完整性门逐位过**；v1 falsifier 判定作废留痕；核查记录已加 |
| — | K-probe-1 `ka-verify-probe-pointnet-mobilenet` | CPU | experiments/pointnetpillars-pointnet-permutation-invariance-symmetric-function/ | done | …(v2) | **P1 逐位一致 / P2 max 带内（sum 出带观察）/ P4 双 SUPPORT**；P3 未闭合留人工；三卡核查记录已加；RESULTS 四件套齐（env 快照缺口登记） |
| — | K-probe-2 `ka-verify-probe-rayiou-nf4-flops` | CPU | experiments/njusparseocc-rayiou-penalizes-thick-surface/ | running | …(v4) | 主人授权修复 1 次执行完毕：配方双 bug（cextension stub+符号适配 get_4bit_type/create_normal_map）+布局修正 [0:8]+[248:256]（配方 [:16] 假设与实测不符已记录）；**本地真源码冒烟 max_err=0.0 逐位一致**；P1 toy SUPPORT+P3 CONSISTENT 已归档 |
| — | K-lingo `ka-verify-lingoqa-judge` | CPU | experiments/lingoqa-lingo-judge-spearman-0950/ | done | kaggle.com/code/cauliyulong/ka-verify-lingoqa-judge (v1) | v1 preflight COMPLETE 已归档（公开资产完整性 + 8 题裁判入口试跑 + Table 9 算术；录入误差已列更正复算）；正式 Spearman 需 15 模型逐题输出 + 人工分，**留主人安排，非班次可推进项** |
| 0 | 班 B `claim-qwt-r2-gate-nonregression`（既有） | T4 | experiments/qwt-r2-gate-nonregression/ | running | kaggle.com/code/cauliyulong/claim-qwt-r2-gate-nonregression (v6 QUEUED) | **#100 主人授权 ①，00:0x 主会话已推 v6（T4）**：re_prob=0.0 照官方 qwt_vit_and_deit.py 双臂口径补 **cell2 eval + cell3 train 两处**（v5 死于 cell2 故 cell3 同病未暴露；vendor 签名 re_prob 系无默认必填位置参数）；签名级冒烟过；02:20/04:20 火巡收，5.5h 自检点 |
| 1 | K-bevdet `ka-verify-bevdet-scale-nms` | T4 | experiments/bevdet-scale-nms-small-object-ap-gain/ | pending | — | 依赖 K-env；关联卡：bevdet-tiny-fcos3d |
| 2 | K-triplets `ka-verify-centernettriplets-oracle` | T4 | experiments/centernettriplets-gt-center-oracle-ap-565/ | pending | — | 依赖 R1/R5 |
| 3 | K-bevplanner `ka-verify-bevplanner-egostatus-injection` | T4 | experiments/bevplanner-egostatus-injection-closes-gap/ | pending | — | 依赖 K-env + R2/R6；关联卡：ego-velocity、egomlp-parity；1–2 会话 STATE 断点 |
| 4 | K-pdquant `ka-verify-pdquant-pd-loss` | T4 | experiments/pdquant-pd-loss-alone-overfits-calibration/ | pending | — | 规则门（同班 B） |
| 5 | K-repqvit `ka-verify-repqvit-w4a4` | T4 | experiments/repqvit-layernorm-reparam-recovers-layerwise/ | pending | — | 规则门；关联卡：repqvit-softmax |
| 6 | K-brecq-a `ka-verify-brecq-w4a4-1024` | T4 | experiments/brecq-w4a4-comparable-qat-1024-images/ | pending | — | 规则门 |
| 7 | K-points-nms `ka-verify-centernetpoints-nms` | T4 | experiments/centernetpoints-heatmap-peaks-replace-nms/ | pending | — | 依赖 K-env（DCNv2）+ R1 |
| 8 | K-fcos `ka-verify-fcos-centerness` | T4 | experiments/fcos-centerness-suppresses-low-quality/ | running | kaggle.com/code/cauliyulong/ka-verify-fcos-centerness (v1) | 同权重配对；先跑新栈补 torchvision 后的 CUDA NMS、权重、COCO val2017 和官方输出一致性门；**v1 ERROR（11-09 白天补班推，T4）——火次读 log 修复重推（单 kernel ≤2 预算），排 T4 队列班 B v6 之后** |
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
- 2026-11-10 00:1x 主会话值机中（主人 23:5x 双授权：#100 班 B v6 + probe-2 NF4 再修一次）：班 B v6 已推 T4（v6，re_prob=0.0 双臂照官方 qwt_vit_and_deit.py 补齐 cell2+cell3 两处，QUEUED）；probe-2 v4 **不另推**，修复配方已落 EXP/STATE.md『v4 修复配方』节交火次执行。**probe-2 v3 与 K-lingo v1 已于白天补班收割归档，POOL 表状态滞后勿重复收割**；K-env-v2 v4 COMPLETE 待收；K-fcos v1 ERROR 待修（T4 槽被班 B v6 占用，本夜顺序：B v6 → fcos v2）。本注记生效期间（mtime<40min）00:20 火按守门退出，02:20 火接管。
- 2026-11-10 00:4x 主人睡前批示（无人值守夜，全部已落档执行）：①**夜间任务正常开始**——本夜加项按 tmp_docs/05 §「2026-11-10 主人批示」节执行：R2/R3/R5/R6/R7/R8 侦察线批量（CPU 侦察不占 kernel 槽，产出 recon-2026-11.md；R3/R5/R6 结果直接解锁 K-triplets/K-bevplanner/K-lsq 判定）+ QUESTIONS 核查线 #58/#67/#79/#88（纯侦察不写 library，产出 nightshift/verify/）——目标把 3 亿夜额度有效用满；②**池清自动停机**（覆盖任务书 §4「不自动停机」）：POOL 全部 kernel done/blocked 且空槽无可填 → 当班写 ⛔ + 晨报显著注明「验证池已清自动停机」，此后每火零消耗退出，实例删除留主人；③另开 **prose 卡面文字整改班**并行（`*/15`，nightshift/prose/ 自治）——互不越界：POOL/REPORT-2026-11-10.md/QUESTIONS.md（#100+ 号段）归本池，nightshift/prose/ 与 PROSE-REPORT 归文字班，git flock 互斥；④三个旧班 automation（2d86e310/4801da75/d3e7ac6f，均已完成且 paused）已由主会话删除。
