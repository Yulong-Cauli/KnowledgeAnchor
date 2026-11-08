# K-probe-1 机制探针·结构侧（ka-verify-probe-pointnet-mobilenet）

- 主卡：`claim-pointnetpillars-pointnet-permutation-invariance-symmetric-function`
- 关联卡（共用本 kernel，结果文件前缀区分）：
  - `claim-pointnetpillars-pointnet-maxpool-skeleton-noise-robustness`（P2）
  - `claim-mobilenet-dsc-8to9x-compute-reduction`（P4，纯算术）
- 任务书：`tmp_docs/05-夜间验证班任务书-四组验证池.md` §4 K-probe-1 节；kernel 类型 Kaggle CPU；会话日期 2026-11-09。

## 问题

PointNet（CVPR 2017）两条 formulation/机制层主张的独立复探 + MobileNetV1 计算量主张的纯算术复核。两卡均无定量实验锚点——本 README 的判定带为**本次预注册的预设判据（非卡面锚点）**，落笔（2026-11-09）先于任何运行，运行后不得回调。

## 预注册判定阈值

| 探针 | 判定 | 支持 | 存疑（如实记录） | 命中 falsifier 方向 |
| --- | --- | --- | --- | --- |
| P1 置换不变性 | 200 个验证样本 × 各 20 次随机置换，CPU float32，batch=1 前向 | 全部 max\|Δlogit\|∞ < 1e-6（实现层面逐位一致） | 任一落 1e-6–1e-3（记数值噪声分布） | 任一 > 1e-3（卡 falsifier 1：置换后输出显著变化） |
| P2 骨架鲁棒性 | 骨架点 = 池化前 256 维各维 argmax 点集合；扰动仅限非骨架点（≤10% 点数），高斯 σ = 5%·点云半径 与随机删除两口径 | 全局特征相对 L2 变化中位数 < 5% 且分类翻转率 ≤ 5% | 中间带照实记录分布 | 变化超带或翻转率 > 5%（卡 falsifier 1）；且 max 聚合敏感度 ≥ mean/sum（卡 falsifier 2 方向） |
| P3 实现核查 | clone charlesq34/pointnet（depth 1），只读核对 | 逐点 MLP 权重共享（1×1 Conv over points）+ 对称聚合（max pool）与卡表述一致 | — | 实现不符（卡 falsifier 2）——只记录代码事实 |
| P4 计算量算术 | ① 约简比 1/N + 1/D_K²（D_K=3），N ∈ {72,96,128,256,512,1024}；② 按 V1 架构逐层重建 Table 4 Mult-Adds | ① 全部落 [8.0×, 9.0×]；② 与 4866M/569M 各差 < 2% | ① 部分越带如实记录区间 | ② 差 > 5%（卡 falsifier 2 计算量侧方向；两个层表变体都报告，取口径差异如实标注） |

P4 范围限定：top-1 精度差 1.1 点属复训主张，本探针不做复训（卡 falsifier 2 精度侧不在范围，已标注缩范围）。

## 数据与环境

- P1/P2：合成点云分类——4 类几何形状（球/立方/环/平面，随机位姿+尺度+均匀噪声），每样本 N=256 点；train 3000 / val 200（P1 的 200 样本 = val 全量，全量普查无抽样）。
- 模型：PointNet-small（共享 MLP 3-64-128-256 → maxpool → FC 256-128-4），torch CPU，SEED=0，Adam 1e-3，≤25 epochs。
- **训练门**：val acc ≥ 95% 才允许该模型进入 P1/P2；两次 seed（0,1）仍不达 → 如实记录并跳过 P1/P2（部分结果照常入库）。
- 随机性记录：所有 seed 与扰动用的 RNG 流写进结果 JSON；确定性断言 = 同配置重跑 P1 一遍结果逐位一致。

## 结果回写流程

`results/pointnet-perm/`、`results/pointnet-skel/`、`results/mobilenet-dsc/` 各自 metrics.json + 汇总 CSV；RESULTS.md 四件套（git_commit / kernel 版本 URL / env 快照 / sha256 清单）跑完后填写；三张卡各追加「核查记录」一行（falsifier 命中如实登记，处置留主人）。

## 关联 kernel 运行记录

- kernel：`cauliyulong/ka-verify-probe-pointnet-mobilenet`（push 后回填版本 URL 于 STATE.md）
- 状态：见 STATE.md
