# STATE — MAE decay CIFAR-100 minival

最后更新：2026-11-11 12:1x（北京时间）。本文件只记录运行事实，不改写任何 claim status。

## v1（2026-11-10 21:57，ERROR，留痕）

- 日志仅 8 行：`DATA NOT FOUND`，10 s 退出，无任何训练数值。
- 根因（v2 运行期诊断确认）：数据集实际挂载在 **`/kaggle/input/datasets/fedesoriano/cifar100/`**，
  文件为 `file.txt`(0 B)、`meta`(1473 B)、`test`(31,049,707 B)、`train`(155,249,918 B)。
  v1 的 `find_root()` 只查 `/kaggle/input/cifar100`、`/kaggle/input/cifar-100-python` 和单层
  `glob("/kaggle/input/*/train")`，三层布局一处都命中不了。服务端 `kernel-metadata.json` 的
  `dataset_sources: ["fedesoriano/cifar100"]` 本身是正确的。

## v2（2026-11-11 12:03:43 启动，RUNNING）

- `train.py` 最小改动：新增只读输入树打印 `describe_inputs()`；`find_root()` 改为精确路径 →
  递归 `glob("/kaggle/input/**/train", recursive=True)`，并要求 `train`/`test` 同为普通文件；
  `load_split()` 兼容 pickle 的 bytes / str 键并校验 shape。**训练超参、模型、预算、评估逻辑未改。**
- 本地冒烟（无 torch，只测数据链路）：精确路径 + bytes 键、两层嵌套 + str 键、空挂载三场景全 PASS，
  shape 均为 `(N, 3, 32, 32)`；整文件 AST 检查通过。
- Kaggle 推送返回 `versionNumber=2`，`kernelId=144200788`，状态 RUNNING。
- 运行期实时日志（`kernels_logs_stream`，2026-11-11 12:1x 取）：

```
[probe] ./ dirs=['datasets'] files=[]
[probe] datasets/ dirs=['fedesoriano'] files=[]
[probe] datasets/fedesoriano/ dirs=['cifar100'] files=[]
[probe] datasets/fedesoriano/cifar100/ ... [('file.txt',0),('meta',1473),('test',31049707),('train',155249918)]
data root /kaggle/input/datasets/fedesoriano/cifar100
train (50000, 3, 32, 32) test (10000, 3, 32, 32)
gpu Tesla T4
=== alpha_min = 1.0 ===
[calib] 24.9s/epoch -> total_epochs=192
ep 10/192 loss 0.5120 elapsed 4.2m
ep 20/192 loss 0.4714 elapsed 8.4m
```

- 结论：数据挂载层级问题已解决，两组对照中的第一组已进入稳定训练（loss 0.5120 → 0.4714）。
  按 24.9 s/epoch、每组 192 epoch 加 linear probe 估计，全会话约 3.0–3.4 h，
  预计 15:15–15:30 前后结束；`results.json` 在每组训练结束后才写入 `/kaggle/working`。
- Kaggle 在运行中不发布 `kernels_output` 日志包（`kernels_logs` 对运行中会话返回空串），
  实时日志须走 `kernels_logs_stream`；已结束会话可用 `kernels_logs('<ref>/<version>')` 取回。

## 收割（会话结束后）

1. `kaggle kernels output cauliyulong/mae-decay-cifar-100-minival -p <目录>` 取回
   `results.json` 与运行日志，核对 sha256 后入 `results/`。
2. 在 `RESULTS.md` 记录两组的 `lp_acc` / `eff_rank` / `epochs` / `train_sec`，
   如实标注这是方向性验证、不复现论文绝对值。
