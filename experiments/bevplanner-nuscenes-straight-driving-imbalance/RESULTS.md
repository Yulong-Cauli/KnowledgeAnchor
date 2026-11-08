# RESULTS — claim-bevplanner-nuscenes-straight-driving-imbalance 统计复算

> **2026-11-08 审核更正：下文“精准复现”“强证据级支持”“三个独立数字全部对上”均撤回。** 数字保留作历史输出；本次只能作为自定义判据的探索统计。详见 [审核说明](AUDIT-2026-11-08.md)。现行主张和补充普查见 [新实验](../nuscenes-three-second-low-lateral-displacement-majority/README.md)。

**结论只表述为实验观察，不构成"已验证"；status 裁决权在主人。**（experiments/README.md 诚实规则）

- **实验日期**：2026-11-08（kernel 完成 11:14 本地；第 1 火 01:10 起，经 v2→v8 八个 kernel 版本迭代——失败全程留痕见 §4 与 nightshift/LOG.md）
- **kernel**：https://www.kaggle.com/code/cauliyulong/claim-bevplanner-straight-driving-imbalance （**version 8** 为本结果对应版本；v1=元数据探针，v2/v5/v6/v7=失败迭代，v3/v4=内容重复）
- **启动 HEAD**：c24715a（预注册 commit 6720267 先于任何运行）
- **环境快照**：Kaggle CPU 会话（无 GPU）——Intel Xeon 2.20GHz / 32.9GB RAM / Python 3.13.18 / Linux 6.18；pip freeze 见 results/pip-freeze.txt（sha256=358b7d29…）
- **结果文件 sha256 清单**：results/sha256-manifest.txt（signoff evidence_hash 原料）

## 1. 实验观察（对照预注册判定标准）

**主分母**：完整未来轨迹样本（未来 ≥6 keyframe @2Hz，horizon 3s）；trainval 29,049 / train 23,930 / val 5,119。

### falsifier 1（预设判据 <60%）：**未触发**
全部判据×阈值×split 的直行占比最低为 60.27%（train·H_3°），无一低于 60% 线。

### 带内复得（73.9±5pp = [68.9%, 78.9%]，trainval 样本级）：**复得，2 个预注册判据落带内**
| 判据 | 占比 |
| --- | --- |
| H_5°（累计航向变化 <5°） | 71.72% |
| L_1m（横向偏移 <1m） | 78.56% |

即：论文的 73.9% 可在"直行"判定的合理阈值带内复得（证据级支持）。附观察（不作判定）：场景级 H_10° 口径下直行场景占 74.35%，与 73.9% 数值接近，论文 "73.9% of the nuScenes data" 的实际口径可能更接近场景级——论文未载，仅记录。

### 附录口径复得（87±5pp = [82%, 92%]，val 评测样本）：**复得，多个判据精准落点 87%**
val 完整样本（n=5119）上：H_15°=87.69%、L_2m=87.93%、P（逐点 <5°）=87.93%——与论文 Appendix E "87% of evaluation samples" 高度吻合。

### 5119 旁证（预注册：val 完整未来轨迹数 / 6019 ≈ 85%±2pp）：**精确命中**
复算得 val 完整未来轨迹样本 = **5119/6019 = 85.05%**，与论文 Appendix B "最终有效样本 5119" 逐位一致——卡内"87% 的分母是否恰为 5119 有效样本"的疑问得到肯定回答。

### 数据质量核验
- 完整性锚点：850 场景 / 34,149 样本 / 2,631,083 sample_data 全中（>1% 偏差即中止的闸门未触发）；
- 航向双法交叉校验：四元数 yaw vs 位移方向，150,266 步中仅 42 步（0.028%）、20 样本（0.059%）多数冲突——远低于预注册的 0.5% 记录阈值；
- 确定性断言：scene-0001 重算两次逐位一致；
- splits 锚点：devkit master（sha b40adc4）train 700 / val 150 / overlap 0。

## 2. 预注册阈值扫描全表

见 results/straight_ratio.csv（4 population × 11 判据×阈值全表，防择优：含全部不利结果）与 results/results.json（含场景级 secondary 与 val_all6019 敏感性参考——后者含被截断样本，短 horizon 偏直行，不作判定）。

## 3. 文档化偏离（诚实规则：偏离即标注）

1. **本数据集 sample_data.json 无 `channel` 字段**（keyframe 条目实测 channel=None，probe kernel v3 实证 409,788=34,149×12）——传感器判定改用 filename 的 `__<CHANNEL>__` 段；34,149 条 LIDAR_TOP keyframe 与样本数精确吻合，判定可靠；
2. ego_pose.rotation 为 **[w,x,y,z] 列表**（官方 nuScenes 格式），非字典——初版代码按字典写，v7 暴露后改双兼容；
3. devkit splits.py（master b40adc4）已非纯字面量文件（`train=list(sorted(set(...)))` 且 import nuscenes 作类型标注）——采用 exec 载入 + sys.modules stub（仅满足标注 import；train/val 本体为纯字面量），700/150/overlap-0 锚点通过；
4. Kaggle 数据集挂载布局不固定（旧式 `/kaggle/input/<slug>/` 与新式 `/kaggle/input/datasets/<owner>/<slug>/` 均出现）——定位改为剪枝 walk；
5. 被场景截断的 5,100 样本（无完整 3s 未来）不入主分母——预注册口径；其敏感性参考单列（val_all6019）。

## 4. 失败运行留痕（全部 Kaggle 版本在案）

v1（无数据源探针）/ v2（literal_eval 挂 splits.py L102）/ v3、v4（exec 挂 nuscenes import）/ v5、v6（record=0：channel 字段缺失致 LIDAR 判定 0 命中 + 0/0 除零）/ v7（rotation 列表格式）/ **v8 成功**。过程日志：nightshift/LOG.md [catchup-*] 各条。

## 5. 对卡片的含义（主人裁决材料）

- falsifier 1 未触发 + 73.9% 带内复得 + 87% 与 5119 分母精准复现：占比统计这一层命题获得**强证据级支持**（两个口径、三个独立数字全部对上）；
- 卡内「当前立场与下一步」预设路径："复算吻合 → 占比统计升级为'已复算'，但捷径归因仍待检"——falsifier 2（因果隔离）不在本实验范围；
- status/stance/signoff 未动；是否按 verify 流程升级由主人手工裁决（本 RESULTS 的 sha256 清单即 evidence_hash 原料）。

## 关联

- 对应卡：`claims/claim-bevplanner-nuscenes-straight-driving-imbalance.md`（核查记录已链本目录）
- 文献基线：`nightshift/reports/bevplanner-deep-read.md` L245 复算预案
