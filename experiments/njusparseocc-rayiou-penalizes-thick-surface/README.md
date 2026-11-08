# K-probe-2 机制探针·计数侧（ka-verify-probe-rayiou-nf4-flops）

- 主卡：`claim-njusparseocc-rayiou-penalizes-thick-surface`
- 关联卡（共用本 kernel，结果前缀区分）：
  - `claim-qlora-nf4-info-theoretic-optimal-datatype`（P2）
  - `claim-sparseocc-flops-749pct-below-dense`（P3）
- 任务书：`tmp_docs/05-夜间验证班任务书-四组验证池.md` §4 K-probe-2 节；Kaggle CPU 会话；日期 2026-11-09。
- 算子口径依据：`nightshift/reports/njusparseocc-rayiou-deep-read.md` §1.5（TP=首中类别一致且深度 L1<τ；τ∈{1,2,4}m 按类别 F1 型 IoU 后三档取平均；无 GT 交点的射线剔除；硬阈值）。

## 预注册判定阈值（2026-11-09 落笔先于运行，不得回调）

### P1 RayIoU toy（合成场景，参数预注册）

- 场景：64³ 体素、voxel=0.25m；GT=实心球（半径 3m，class 1）；射线 8192 条，源于 8 个 LiDAR 位点（半径 6m 圆周）；步进 0.125m。
- 预测三版：thin=表面带（|dist−3m|≤1 voxel）；thick_in=表面带+向内填充实心（falsifier a 指定的加厚方向）；首中深度由射线步进实测。
- **支持**：thick_in 的 voxel mIoU 相对 thin **上升 >0.05**（加厚在 mIoU 下获利）而 RayIoU（三档均值，per-class IoU）**不升**（Δ≤+0.01）→ 卡主张支持；任一 τ 下 RayIoU 相对上升 >1% → falsifier 1 命中登记。
- 全部判据只述落带，不写"已验证"；toy 为算子口径复现（合成场景），**证据级**，非 SparseOcc 官方评测器复算——官方实现核查走 P1b。

### P1b 官方实现核查（falsifier 2 分支）

clone MCG-NJU/SparseOcc（depth 1，head 固定），只读其 RayIoU evaluator：核对硬阈值 TP/首中/τ 集合/聚合方式四项与 deep-read §1.5 转述口径一致；不符 → falsifier 2 方向登记（代码事实照录）。

### P2 NF4（关联卡 qlora-nf4；数据源=kernel 内实抓 bnb main functional.py，记录 sha256+URL+日期）

- ① 官方公式复算 16 码点 vs bnb 硬编码表：max|err| 复现 1.1e-7 量级 → 支持"公式↔硬编码表一致"（Appendix E 一致性继承 11-05 已验证事实，卡片核查记录在案）。
- ② Eq.4 字面网格（i/(2^k+1) 相邻均值）复算：预期**不命中**（首位正值 0.108 vs 论文表 0.0796，11-05 记录）→ 复现则固化 **#48 实验材料**（QUESTIONS #48 追加材料行，不改待决性质）。
- ③ 等期望填充：N(0,1) 下各 bin 概率质量（bin 边界=相邻码点中点），记录 max 偏离均匀的相对量 + 对照 INT4-absmax 均匀格的 bin 质量（应显著不均）——数值记录，无带。
- ④ E|X−Q(X)|（10⁷ 采样，seed 固定）：NF4 vs INT4-absmax vs AF4（等距 16 点 [-1,1]）——NF4 应最低；**若 NF4 非最低 → 如实记录自算结果**（不引 arXiv:2306.06965 结论替代，该文献仍为线索）。

### P3 SparseOcc FLOPs（关联卡；本夜缩范围=论文侧算术，运行时 profile 留池）

- 论文侧算术自洽：1 − 455/1810 = 74.86% vs 摘要 74.9%（四舍五入自洽性）；455/1810 ≈ 0.251（"约 1/4"）；基线=C-CONet（笔记 Table 1 唯一稠密基线行）。
- **缩范围标注**：FLOPs 统计口径（含不含 2D 主干/深度网络）与 455G 实测复算需 mmdet3d 栈（K-env 结论未出前不可行）——falsifier a 的运行时复算**不在本夜范围**，留池；本夜只闭合论文侧算术自洽与转引结构。

## 结果回写流程

`results/{rayiou, nf4, flops}/` 各自 metrics.json；RESULTS.md 四件套；三卡核查记录各一行；#48 材料追加进 QUESTIONS #48 条目。

## 关联 kernel 运行记录

- kernel：`cauliyulong/ka-verify-probe-rayiou-nf4-flops`（push 后 STATE.md 回填）
