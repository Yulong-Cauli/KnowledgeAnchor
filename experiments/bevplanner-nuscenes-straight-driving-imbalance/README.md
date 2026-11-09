# 实验设计：nuScenes 直行场景占比能否复得 73.9%

> **历史实验，已由后续数据集普查替代（2026-11-08）。** 原设计及下文旧卡 id 只保留历史含义；结果中的“精准复现/强支持”解释已撤回。见 [审核说明](AUDIT-2026-11-08.md)；现行卡为 [nuScenes 六步低横向位移](../../claims/claim-nuscenes-three-second-ego-motion-distribution.md)（asserted / watch）。

- **原对应卡**：`claim-bevplanner-nuscenes-straight-driving-imbalance`（原 status: asserted；已移除，历史由 Git 保留）
- **复核问题**：论文 §1 自报 "73.9% of the nuScenes data involve scenarios of driving straightforwardly"（Fig. 2），对 nuScenes v1.0 trainval 全量 ego 未来轨迹按预注册判据族重算，73.9% 能否在合理阈值带内复得？附录 E 的评测样本口径（87%）能否同步复得？
- **文献核验基线**：卡「当前立场与下一步」预方案 + [nightshift/reports/bevplanner-deep-read.md](../../nightshift/reports/bevplanner-deep-read.md) L245（复算预案：先定口径再按两个分母复算，顺带核 87% 分母是否为 5119 有效样本）；deep-read 评级本卡为链内最弱 ★（唯一单来源、无脚本可复核）。
- **执行环境**：Kaggle CPU 会话（统计任务无需 GPU，不占 T4 周配额）；env 快照照记 CPU/RAM/pip freeze。
- **设计定稿**：2026-11-08（启动 HEAD c24715a）。**§2 判定阈值预注册，实验开始后不得回调。**
- **范围声明**：本实验只检验 falsifier 第 1 条（统计复算）；falsifier 第 2 条（因果隔离/重采样训练实验）不在范围。占比统计复算成立也不改变"占比→捷径"归因的推测性质。

---

## 0. 事实锚点（文献侧已核，实验侧据此对齐）

| 项 | 值 | 出处 |
| --- | --- | --- |
| 主张数字（数据口径） | 73.9% 直行 | 论文 §1 / Fig. 2；arXiv v2 实抓（2026-11-02 建卡 evidence） |
| 评测样本口径 | 87% 直行（evaluation samples） | 论文 Appendix E（卡 evidence 原句） |
| 有效样本 | val 6019 → 有效 5119（85%），按"无完整 GT 未来轨迹则不计入" | 笔记 L55（Appendix B "Valid Samples"） |
| 转弯占比（对照） | 转弯等复杂场景 ≈13% | 论文 §4.3 bullet（笔记 §3.5(c)） |
| falsifier 1 预设判据 | 重算直行占比显著低于 73.9%（如 <60%——预设判据，论文未给判定阈值） | 卡 falsifiers[0] |
| 数据锚点 | v1.0 trainval：850 场景 / 34,149 keyframe 样本 | **本次侦察实测命中**（2026-11-08，scene.json=850、sample.json=34,149） |
| 规划口径 | 开环规划 horizon 3s = 未来 6 个 keyframe（2Hz） | UniAD/VAD/BEV-Planner 统一实现（笔记 §3.2） |
| "直行"判定阈值 | 论文未载（deep-read 遗留 #1）——只能带内判读 | 卡 scope |

## 1. 口径与原理

- 论文未定义 "driving straightforwardly"，任何单一阈值都是猜测 → **预注册阈值族全量扫描**，以"73.9% 是否落入合理阈值带"作带内判读，而非拟合单一阈值。
- 主分母：**完整未来轨迹样本**（未来 ≥6 个 keyframe 的样本，对齐规划评测口径）；被场景截断的样本单列计数，不混入主分母。附录口径另按 6019 与 5119 两个分母各算一行。
- **全量普查，无抽样随机性**：确定性断言 = 同一场景重算两次结果逐位一致。
- 航向：ego_pose 四元数转 yaw 为主算；位移方向（相邻位姿差 >0.3m 的步）作交叉校验，两法累计航向变化差 >15° 的样本 >0.5% → 在 RESULTS 记差异。
- 世界系：nuScenes global（x 东 y 北 z 上）；yaw = atan2(2(wz+xy), 1−2(y²+z²))，差值 wrap 到 (−π, π]。

## 2. 预注册判定标准

判据族（对每个 split × 分母全表输出）：

| 族 | 定义 | 阈值网格 |
| --- | --- | --- |
| H | 累计 \|Δheading\|（未来 6 步逐点 yaw 差绝对值求和） | 3°, 5°, 10°, 15°, 20°, 30° |
| L | 横向偏移（末点相对首点航向线的垂直距离） | 0.5, 1, 2, 3 m |
| P | 逐点 \|Δheading\| 全部 <5° | 单一判据 |

| 判定 | 条件 | 性质与处置 |
| --- | --- | --- |
| **触发 falsifier 1** | 全部判据×阈值×split 的直行占比均 <60% | 证伪级——卡片如实登记命中，拆卡/降级/维持由主人裁定 |
| **带内复得** | 存在预注册判据使 trainval 完整未来轨迹样本级占比 ∈ [68.9%, 78.9%]（73.9±5pp） | 证据级支持——观察表述"73.9% 可在阈值带内复得"，不写"已验证" |
| **附录口径复得** | val 样本级（6019 或 5119 分母）占比 ∈ [82%, 92%]（87±5pp） | 证据级支持；并核有效样本数：完整未来轨迹 val 样本数 / 6019 ≈ 85%±2pp（对 5119 的旁证） |
| 其余落点 | 不属上述任何一档 | 如实记录、不定性、留主人裁定 |

**防择优规则**：所有判据×阈值×split 结果全部进 results.json 与 CSV，含失败与不利结果；阈值网格不得事后增删；如需追加维度另立附录配置并标 `post-hoc`。
**口径警示**：73.9（数据整体）与 87（评测样本）分母不同，判读与引用不得混用；场景级统计只作背景，不参与判定。

## 3. 阶段设计

### Phase 0：数据源侦察（已完成，2026-11-08 01:1x 本地）

- [x] 首选数据集 `sahangunasekara92/nuscenes-v1-0-full-keyframes`（45.7GB，usability 1.0）实测含元数据：`v1.0-trainval/scene.json`（850 场景）与 `v1.0-trainval/sample.json`（34,149 样本）均已按路径实拉验证（probe 记录见 LOG）；
- [x] 备选 `diamond1234/nuscenestrainval` / `mitanshuchakrawarty/nuscenes` 实测**无** `v1.0-trainval/scene.json`（404）——排除；
- [x] `aadimator/nuscenes-mini` 作流水线 dry-run 备胎（kernel 内发现失败时人工切换）；
- [ ] kernel 内核验 ego_pose.json / sample_data.json / scene.json / sample.json 四件套计数（对 §0 锚点，>1% 偏差即中止判读）。

### Phase 1：全量计算（kernel 内，一次运行）

1. 载入四 JSON 建索引（sample / sample_data / ego_pose / scene）；
2. 从 devkit GitHub 拉 `splits.py`（记录解析到的 commit sha），得 train(700)/val(150) 场景名单；
3. 每样本沿 scene→sample.next 链取自身 + 未来 keyframe 的 LIDAR_TOP keyframe ego_pose（位置+yaw）；无 LIDAR keyframe 的样本剔除并计数；
4. 按判据族×阈值网格全量计算；确定性断言（scene-0001 重算逐位一致）；
5. 写 results.json + 长表 CSV + summary.txt，log 末尾三行结论摘要。

### Phase 2：判读与回写（本地收割火）

按 §2 表判读 → RESULTS.md（只写"实验观察"）→ 卡「核查记录」追加一行 → validate → flock commit。

## 4. 数据与环境（Kaggle）

- **挂载**：`sahangunasekara92/nuscenes-v1-0-full-keyframes`（只读元数据 `v1.0-trainval/*.json`，不解压传感器 blob；四 JSON 合计 ~3GB，样本/传感器文件不读）；
- **internet**：仅用于拉 devkit splits.py（`nutonomy/nuscenes-devkit` raw 文件 + API 解析 pinned commit sha）；
- **环境**：CPU 会话（python 3.x + numpy + 标准库 json/math/csv；不装 nuscenes-devkit 重依赖）；pip freeze 存档。
- **可复现性**：全量普查无随机性（§1）；数据版本锚点 = 数据集文件 creationDate + 官方计数锚点双验。

## 5. results/results.json 记录 schema

```json
{
  "claim_id": "claim-bevplanner-nuscenes-straight-driving-imbalance",
  "git_commit": "c24715a",
  "kaggle_notebook_version": "<收割时由调度班回填 kernel 版本 URL>",
  "env": {"cpu_model": "...", "ram_gb": 0, "python": "...", "pip_freeze_sha256": "..."},
  "data": {"dataset": "sahangunasekara92/nuscenes-v1-0-full-keyframes",
           "counts": {"scenes": 0, "samples": 0, "sample_data": 0, "ego_pose": 0, "excluded_no_lidar_keyframe": 0},
           "anchors_ok": true},
  "splits_sha": "<devkit splits.py 解析到的 commit>",
  "determinism_ok": true,
  "complete_future": {"trainval": 0, "train": 0, "val": 0, "val_ratio_vs_6019": 0.0},
  "results": {"<split>_<population>": {"H": {"3deg": 0.0, "...": 0.0}, "L": {"0.5m": 0.0}, "P": {"step_lt_5deg": 0.0}}},
  "scene_level": {"...": "..."},
  "notes": "<任何异常/偏离口径的说明>"
}
```

（收割时调度班把 results.json + CSV 合成 metrics.json 并补 kernel 版本 URL 与 sha256 清单——四件套在 RESULTS.md 齐备。）

## 6. 结果回写与状态边界

1. 跑完 → RESULTS.md 汇总（结论只写"实验观察"，不写"已验证/证伪"；触发与复得分档标注）；
2. 对应卡「核查记录」追加一行，链本目录；status 维持 `asserted`；
3. 若命中 falsifier 1：卡上如实登记，处置由主人裁定；
4. signoff 由主人手填；本实验产出的 sha256 清单即 evidence_hash 原料。

## 关联卡（共享口径）

- `claim-bevplanner-egomlp-parity-l2-collision`（Ego-MLP 恒速直行策略——直行占比是其成立土壤）。
