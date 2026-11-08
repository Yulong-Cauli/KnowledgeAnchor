# RESULTS — K-probe-1 机制探针·结构侧（ka-verify-probe-pointnet-mobilenet）

- 运行日期：2026-11-09（fire-0020 push v1 error 留痕 → fire-0220 修复重推 v2 → fire-0420 收割）
- 结论表述：以下全部为**实验观察**，不写"已验证/证伪"；falsifier 处置（拆卡/降级/维持）由主人裁定。

## 结果汇总（判定带见 README 预注册节，未回调）

| 探针 | 预注册判定 | 实测 | 结论 |
| --- | --- | --- | --- |
| P1 置换不变性 | 全部 max\|Δlogit\|∞ <1e-6 → 支持；>1e-3 → falsifier 1 方向 | **max_abs_logit_diff = 0.0**（200 样本 × 20 置换逐位一致，determinism_ok=true），n>1e-6 = 0，n>1e-3 = 0 | **SUPPORT**（falsifier 1 未触发） |
| P2 骨架鲁棒性（max） | rel L2 中位 <5% 且翻转率 ≤5% → 支持（预设判据） | noise 中位 **1.28%**、delete 中位 **0.0%**、翻转率 0/0% | **SUPPORT**（带内；预设判据非卡面锚点） |
| P2 对照（mean/sum） | max 敏感度不应高于二者 | mean: noise 0.63%/delete 2.64%（带内）；**sum: delete 中位 10.02% 出带**；max_not_more_sensitive_than_others = true | max 的"骨架"鲁棒性**不逊于** mean/sum；sum 在删除扰动下出预设带（观察记录） |
| P3 官方实现核查 | 权重共享 + 对称聚合与卡表述一致 → 支持 | clone 成功（head `2618f72bc1a0fd21b074096e748016960d44ef55`）但 **classify.py 不存在**（repo 布局与预期不同），grep 无命中 | **未闭合**（部分完成）：repo head 已固定，实现核查留人工按 head 复核（缺口如实登记，不算命中） |
| P4 MobileNet 算术 | 比值 [8.0,9.0]；Table 4 重建 <2% | **578.9M（+1.74%）/ 4867.3M（+0.03%）/ 比值 8.408**；N≥72 网格全落 [8,9] | **SUPPORT**（计算量侧；top-1 精度侧按预注册缩范围不做） |

训练门：三聚合 val_acc 均达 1.0（合成任务可学），gate 全过，无 gate 截断。

## 证据四件套

1. **git_commit**：预注册 `b555f02`（先于 v1/v2 push）；收割时仓库 HEAD 见 `nightshift/LOG.md` fire-0420 条目。
2. **kernel 版本 URL**：https://www.kaggle.com/code/cauliyulong/ka-verify-probe-pointnet-mobilenet **version 2**（成功）；v1（error）同 URL version 1 留痕。
3. **环境快照**：⚠ 缺口如实记录——v2 notebook 未落盘 pip freeze（模板缺陷，后续 kernel 首格已补此步）。已知：Kaggle CPU 会话、papermill 执行器 python 3.13（kernel log 固定）、torch/timm 版本未捕获。**env 证据强度降级为"版本未锁定"**，结论均为纯算术/CPU 确定性计算，对该缺口不敏感；置换逐位一致与 torch 版本无关的论证见下"诚实记录"。
4. **sha256 清单**：`results/sha256-manifest.txt`（experiment-summary / pointnet-perm / pointnet-skel / mobilenet-dsc 五文件）。

## 诚实记录（失败与修复留痕）

- **v1 kernel error（留痕）**：P2 将池化前逐点特征（256×N）误当全局向量（256 维）→ 删除分支形状崩（N=231≠256）；P4 循环漏 `total += m` 且 dw 项 `h*w` 的 `w` 未随 stride-2 更新（虚低至 11.86M）。修复于 v2（重推预算 1/2）；v1 数字不入判读，仅留 Kaggle version 1。
- **P1 对 torch 版本缺口的稳健性**：maxpool+共享 MLP 置换不变性为交换律层面的浮点确定性行为，实测逐位一致（diff=0.0）；若换 torch 版本出现非逐位一致，属实现层数值噪声，须按 README 的 1e-6/1e-3 带重新判读——本记录只在"本次 kernel 版本"范围内成立。
- P3 缺口：charlesq34/pointnet 布局变化，两卡 falsifier 中"官方实现"分支未按预注册闭合，repo head 已固定待人工复核。
- 全部运行（v1 error、v2 成功）Kaggle 版本历史在案，无删除。
