# K-coco-stats 中心点碰撞统计（ka-verify-coco-center-collision）

- 主卡：`claim-centernetpoints-coco-train2017-same-class-center-collision-rare`
- 任务书：`tmp_docs/05-夜间验证班任务书-四组验证池.md` §4 K-coco-stats 节；Kaggle CPU 会话；日期 2026-11-09。
- 数据：`awsaf49/coco-2017-dataset`（R1 实测含 `coco2017/annotations/instances_train2017.json` 469,785,474 B + `instances_val2017.json` 19,987,840 B，2026-11-09 `kaggle datasets files` 实测；只需标注不需图像）。

## 问题

复算 Objects as Points（arXiv 1904.07850v2）Appendix C 的中心点碰撞统计：COCO train2017 上同类物体中心点在输出步长 R=4 取整后落入同格的对数（论文自报 614 对 / 860,001 物体，<0.1%）。

## 预注册判定阈值（2026-11-09 落笔先于运行，不得回调）

- **主口径 = floor**（论文附录 C 明确使用向下取整；round 作敏感性对照分开报告）。原 Kaggle v2 用 `int()` 截断实现主口径，后续复算改用 `math.floor()`。
- 完整性门：图像数 = 118,287、物体数 = 860,001（±0.1%）——不符即停止判读、照实记录（防脏数据出数）。
- **支持**：floor 口径碰撞对数 ∈ **[491, 737]**（614±20%）且占物体数比例 <0.1% → 卡 falsifier 2 未触发。
- **取整方向敏感**：floor 出带而 round 入带 → 如实双报，不定性，留主人裁定（不构成支持也不构成命中）。
- **命中 falsifier 2 方向**：floor 口径偏离 614 超过 2×（或密集/小目标子集单独远高于 0.1%）。
- 中心定义：中心 = bbox 中心 ((x1+x2)/2, (y1+y2)/2)，R=4 下 col=floor(x/4)、row=floor(y/4)，按 (image_id, category_id, col, row) 分组并对每组的 C(n,2) 求和。
- 附加观察（不新增主张）：按 COCO 面积惯例（<32² / 32²–96² / >96²）分桶的碰撞对数与占比。
- 确定性断言：同配置重跑一遍逐位一致（纯标注计算，无随机性）。

## 结果回写流程

`results/metrics.json` + 分桶 CSV；RESULTS.md 四件套；卡「核查记录」追加一行（falsifier 命中如实登记，处置留主人）。卡 falsifier 1（原文核查）2026-11-05 已闭合，照录不重做。

## 关联 kernel 运行记录

- kernel：`cauliyulong/ka-verify-coco-center-collision`（push 后 STATE.md 回填）

## 偏差与修复记录（2026-11-09 fire-0420）

- v1 kernel 实现缺陷：碰撞分组漏 `image_id`（跨图物体落入同格被误计为碰撞），得 3,159,187 对——**数字留痕**（RESULTS.md v1 节），不作为判读依据；阈值（614±20% 带、<0.1%、完整性门）**不变**。
- v2 修复：分组键改为 (image_id, category_id, col, row)，重推（修复预算 1/2）。判定带仍以本 README 预注册节为准。
- 2026-11-09 本地复算：从原 Kaggle 镜像下载训练标注，按论文附录 C 改用 `math.floor()`。118,287 张图、860,001 条标注的中心坐标均为非负数，改用 `floor()` 后没有标注改变网格位置。向下取整仍为 708 对，就近取整仍为 660 对。[本地复算记录](results/metrics-floor.json)
