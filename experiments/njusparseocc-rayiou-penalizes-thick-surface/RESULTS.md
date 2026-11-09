# RESULTS — K-probe-2 机制探针·计数侧（ka-verify-probe-rayiou-nf4-flops）

- 运行日期：2026-11-09/10（v1→v2→v3→**v4 收割**；v1–v3 失败全留痕：bnb 包内导入/exec 命名空间/`__name__`）
- 结论表述：实验观察；falsifier 处置留主人。判定带=EXP/README 预注册（eafa8a0）+主人 2026-11-10 00:4x 授权的符号适配（**判定带与四项计算不动**，仅换取数入口）。

## 结果汇总

| 探针 | 预注册判定 | 实测 | 结论 |
| --- | --- | --- | --- |
| P1 RayIoU toy | mIoU 获利 >0.05 且 RayIoU Δ≤+0.01 → 支持；任一 τ 相对升 >1% → falsifier 1 | 加厚使 mIoU **0.171→0.773（+0.60）**，RayIoU **Δ=0.0**（三档各自也不动） | **SUPPORT**（合成算子证据级） |
| P2-① 官方公式↔码点 | max err <1e-6 → 支持 | `create_normal_map(offset=0.9677083, use_extra_value=True)` 产出码点与 `get_4bit_type('nf4')` **逐位一致（max_err=0.0）** | **SUPPORT** |
| P2-② Eq.4 字面网格 | 预期不命中（11-05：0.108 vs 0.0796） | 本班网格读法（(i+1)/17 相邻均值）首正 **0.1484 ≠ 0.0796** → 不命中确认 | **#48 材料固化**（网格读法歧义已在案：不同字面读法均不命中论文表） |
| P2-③ 等期望填充 | 记录统计量（无带） | NF4 bin 相对最大偏离 4.64 vs INT4 1.81——**口径局限：bin 检验未做 absmax 归一，±1 外溢出质量污染外 bin**，对非均匀码点更不利；照实记录供 #48 参考 | 记录（口径局限已标注） |
| P2-④ E\|X−Q(X)\| | NF4 应最低；非最低 → 如实记录 | **INT4-absmax 0.1896 < NF4 0.1934 < AF4 0.1988**（2M 采样，seed=7；码点域 [-1,1]，未做 block-absmax 缩放——与论文 Appendix F 用法有口径差，已标注） | **NF4 非最低（自算）——与 bnb 代码注释线索 arXiv:2306.06965 同向；照实记录，不据此改卡** |
| P3 FLOPs 论文侧 | 74.86%→74.9% 自洽 | 1−455/1810=74.862%（四舍五入 74.9 ✓）；455/1810=0.2514（"约 1/4" ✓） | **PAPER-SIDE CONSISTENT**（运行时 profile 缩范围留池） |
| P1b 官方实现核查 | 硬阈值/τ/聚合/首中四项 | head `af4d9df8`：**硬阈值 ✓（L151 l1_error<threshold）、τ=[1,2,4] ✓（L139/237）、按类 IoU 聚合 ✓（L169-170 TP/(gt+pred−TP)，与 toy 同式）**；首中语义段未被 grep 覆盖（partial，文件在案） | **三项闭合 → falsifier 2 未触发；首中项 partial** |

## 证据四件套

1. **git_commit**：预注册 `eafa8a0`；符号适配授权（主人 2026-11-10 00:4x）+布局修正记录于 EXP/STATE.md。
2. **kernel 版本 URL**：https://www.kaggle.com/code/cauliyulong/ka-verify-probe-rayiou-nf4-flops **v4**（成功）；v1–v3 留痕。
3. **环境快照**：`results/pip-freeze.txt`（v4 kernel 全量 freeze）✓。
4. **sha256 清单**：`results/sha256-manifest.txt`；bnb 源码 sha256 `520a9e9d3afba111…`（v3/v4 两次独立抓取一致）。

## 诚实记录

- v1–v3 失败链与修复授权（主人 2026-11-10 00:4x）在 EXP/STATE.md；配方 [:16] 位置假设与实测布局不符已修正留痕（公式与判定不变）。
- P2-④ 与论文"信息论最优"的关系：本检验为**未做 block-absmax 缩放的码点域直接比较**，不构成对论文主张的证伪级反例；方向与 arXiv:2306.06965 线索一致，材料归 #48/后续精读。
- P1 toy 为合成算子口径复现（非 SparseOcc 官方评测器复算）；官方 evaluator 三项已由代码核查闭合。
