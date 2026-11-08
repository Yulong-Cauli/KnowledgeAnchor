# K-coco-stats 中心点碰撞统计（ka-verify-coco-center-collision）

- 主卡：`claim-centernetpoints-center-collision-rare-on-coco`
- 任务书：`tmp_docs/05-夜间验证班任务书-四组验证池.md` §4 K-coco-stats 节；Kaggle CPU 会话；日期 2026-11-09。
- 数据：`awsaf49/coco-2017-dataset`（R1 实测含 `coco2017/annotations/instances_train2017.json` 469,785,474 B + `instances_val2017.json` 19,987,840 B，2026-11-09 `kaggle datasets files` 实测；只需标注不需图像）。

## 问题

复算 Objects as Points（arXiv 1904.07850v2）Appendix C 的中心点碰撞统计：COCO train2017 上同类物体中心点在输出步长 R=4 取整后落入同格的对数（论文自报 614 对 / 860,001 物体，<0.1%）。

## 预注册判定阈值（2026-11-09 落笔先于运行，不得回调）

- **主口径 = floor**（CenterNet 官方 decode 的取整即 int 截断；论文未明示取整方向，round 作敏感性对照分开报告）。
- 完整性门：图像数 = 118,287、物体数 = 860,001（±0.1%）——不符即停止判读、照实记录（防脏数据出数）。
- **支持**：floor 口径碰撞对数 ∈ **[491, 737]**（614±20%）且占物体数比例 <0.1% → 卡 falsifier 2 未触发。
- **取整方向敏感**：floor 出带而 round 入带 → 如实双报，不定性，留主人裁定（不构成支持也不构成命中）。
- **命中 falsifier 2 方向**：floor 口径偏离 614 超过 2×（或密集/小目标子集单独远高于 0.1%）。
- 中心定义假设（显式标注）：中心 = bbox 中心 ((x1+x2)/2, (y1+y2)/2)，R=4 下 col=floor(x/4)、row=floor(y/4)；同类对按 (class, col, row) 分组 C(n,2) 求和。
- 附加观察（不新增主张）：按 COCO 面积惯例（<32² / 32²–96² / >96²）分桶的碰撞对数与占比。
- 确定性断言：同配置重跑一遍逐位一致（纯标注计算，无随机性）。

## 结果回写流程

`results/metrics.json` + 分桶 CSV；RESULTS.md 四件套；卡「核查记录」追加一行（falsifier 命中如实登记，处置留主人）。卡 falsifier 1（原文核查）2026-11-05 已闭合，照录不重做。

## 关联 kernel 运行记录

- kernel：`cauliyulong/ka-verify-coco-center-collision`（push 后 STATE.md 回填）
