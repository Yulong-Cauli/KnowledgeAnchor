# K-probe-2 v3 实验结果

2026-11-09 收回 Kaggle CPU 输出。Notebook 已执行结束，三个分项中两个有结果，NF4 分项跳过。预注册判定见 [README](README.md)。关联主张均为 `asserted / watch`。

| 分项与关联 claim | 实验观察 | 证据范围 |
| --- | --- | --- |
| RayIoU，`claim-njusparseocc-rayiou-penalizes-thick-surface` | 向内填充合成球体后，单类 voxel IoU 从 0.170669 升至 0.772727。RayIoU 两臂均为 0.989782，1 / 2 / 4 米三档分别为 0.969346 / 1 / 1，均无变化。8192 条射线中有 5011 条命中 GT。 | 这组配对落在预注册支持带内。合成对照用简化的单类射线步进。官方评测器只保留了固定提交的代码摘录，其中可见三档阈值、严格小于和 IoU 分母，首中与最终聚合仍待完整核对。 |
| NF4，`claim-qlora-nf4-info-theoretic-optimal-datatype` | 下载了 bitsandbytes 的 `functional.py`。执行时发生 `ImportError: attempted relative import with no known parent package`，未生成码点对比、Eq.4 网格、bin 概率或量化误差。 | 该错误被 notebook 捕获，Kaggle 因此仍显示 `COMPLETE`。本次输出给 #48 增加的是失败记录，数值材料待补。 |
| FLOPs，`claim-sparseocc-flops-749pct-below-dense` | 对论文所报数字复算，`1 − 455 / 1810 = 74.861878%`，按一位小数舍入为 74.9%。 | 本轮范围为论文数字的算术复核。运行时 FLOPs 和算子计入口径仍待测量。 |

## 运行记录

- 预注册提交 `eafa8a0`。当前仓库中对应 v3 notebook 随 `47bf358` 归档，文件 SHA256 为 `d346d0be713b28a9d51756d90c20eeae4f99e5588710eda1b11a0d1aca106063`。运行输出只记录预注册提交，未捕获推送瞬间的工作区 HEAD。
- Kaggle API 返回版本 3，kernel ID `143490476`，`enable_gpu=false`。[Kaggle v3](https://www.kaggle.com/code/cauliyulong/ka-verify-probe-rayiou-nf4-flops?scriptVersionId=3)
- 运行日志显示 Python 3.13，结果记录 NumPy 2.1.3，完整依赖见 [requirements-frozen.txt](requirements-frozen.txt)。CPU 型号未记录。
- 五份结果文件的 SHA256 前缀与 [Kaggle 输出日志](results/run-v3-log.txt) 一致。下载的 bitsandbytes 源文件 SHA256 与 [NF4 结果](results/nf4/metrics.json) 一致。[完整归档校验清单](results/sha256-manifest.txt)
