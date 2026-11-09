# 结果：nuScenes trainval 六步低横向位移普查

**实验观察，尚未独立验证；关联卡 status: asserted / stance: watch。** 主张 id：`claim-nuscenes-three-second-low-lateral-displacement-majority`。verified/signoff 由用户本人手工编辑。

## 1. 主结果与解释边界

在 nuScenes v1.0-trainval 的完整未来六步样本中，未来终点相对当前 ego 航向线的绝对横向位移严格 <2m 的样本为 **25409/29049 = 87.469448%**。合并总体占比严格 >50%，本次观察支持所固定的多数主张；不构成 BEV-Planner 原统计的精准复现，也不检验捷径因果。

| 总体 | 全部满足/分母 | 全部比例 | moving 满足/分母 | moving 比例 |
| --- | --- | --- | --- | --- |
| trainval | 25409/29049 | 87.469448% | 20159/23799 | 84.705240% |
| train | 20908/23930 | 87.371500% | 16459/19481 | 84.487449% |
| val | 4501/5119 | 87.927330% | 3700/4318 | 85.687818% |

移动状态按整个窗口 XY 路径总长分组：stopped ≤0.3m，low_speed (0.3,1.5]m，moving >1.5m。停止 4481 个、低速 769 个，主判据各为 100%；non_stopped 为 20928/24568 = 85.183979%。这些阈值不等于人工意图真值，不能把低速组解释为驾驶意图。

主总体中，最大绝对横向位移 <2m 的分子同为 25409；终点 <2m 但中间 ≥2m 的数量为 0。这是实际观察，不能因其为 0 而宣称末点定义对所有可能轨迹均可靠；合成反例测试明确覆盖了这种偏离。

完整敏感性输出见 `results/sensitivity.csv`，包括 3 splits ×5 运动分组 ×14 判据/阈值，共 210 行。判据不再择优对齐 73.9%/87%。

## 2. 场景与时间跨度

- 850 个场景，按场景等权的主比例均值 87.456718%；场景比例 min=14.705882%、p05=54.545455%、median=100%、p95=100%、max=100%。主张不包含“每个场景都以低横向位移为主”。
- 六步实际时间跨度 min=2.649800s、p05=2.898623s、median=2.999814s、p95=3.100403s、max=3.400703s；79 个样本在 3±0.25s 之外。
- keyframe 相邻间隔 min=0.394377s / max=0.750945s。统计按六个 keyframe 定义，不插值、不删除这 79 个窗口、不冒称全部恰好3秒。

## 3. 来源核验与计算检查

Kaggle 数据 `sahangunasekara92/nuscenes-v1-0-full-keyframes`，数据 version 1（API 快照 `sources/dataset-version.json`）。官方对照包为 `https://motional-nuscenes.s3.amazonaws.com/public/v1.0/v1.0-trainval_meta.tgz`；流式解包读取，不保存大型数据包。下列四文件 SHA256 **逐字节全部一致**：

| 文件 | SHA256 |
| --- | --- |
| scene.json | bdc3211bfbfda652d5e9dab73c45c7132925ca84f869bf45e8e14edeafb1d20b |
| sample.json | 6035ac58b6e971622be2bb1be15b917e7cb4e05ae984d6b339c27c1699c4ad9d |
| sample_data.json | 6dcad49f0b9bd7b1cef04e2a0ff2ac2879b46b938e8d48153f00693cebb4de21 |
| ego_pose.json | be12bd501f694b344628ba0680a37d6e1ec83e62b37f310c205c1dbe41cd09ff |

850 场景、34149 keyframe、2631083 sample_data、2631083 ego_pose。场景链、token 唯一性、prev/next、split 场景集合、LIDAR keyframe 一一对应、位姿时间戳和单位四元数检查通过。排除的无完整未来六步样本为 train 4200 / val 900；没有因位姿或 LIDAR 缺失而排除的样本。

航向累计变化诊断：22294 个窗口的每段位移均 >0.3m，符合诊断条件；6755 个窗口不参与此诊断。六段位移方向累计变化与对应中点插值 yaw 累计变化之差最大 6.716057°，>15° 的为 0/22294。该诊断不证明数据整体质量，也不延用旧实验“多数步夹角冲突”指标。

7 项计算边界检查通过；从逐样本 CSV 重算 **15 个 split/运动状态总体**，分子、分母、分组和比例均与输出 JSON 完全一致；敏感性表 **210 行**的整数分子、分母与比例亦逐行重新计数一致。Kaggle 拉回的实际执行 code cells 与本地提交 code cells 完全一致。

## 4. 执行证据与归档

- 用户侧实验日期：2026-11-08。执行日志 UTC 13:32:39–13:33:57（上海时间 21:32:39–21:33:57），计算/比对耗时约 78 秒。
- Kaggle：<https://www.kaggle.com/code/cauliyulong/claim-nuscenes-low-lateral-census>，**version 1**；API 的确切版本号与 kernel id 存 `sources/kernel-version.json`，不捏造全局 scriptVersionId。平台 API 的 last_run_time 与原始执行日志日期不一致，原值保留，不用它推断设计先后；先后依赖当前提交动作、固化源码/协议哈希与日志。
- 启动 HEAD：`d50d40679a4a904a3faf92e0b2e76208c0b94502`。本次代码尚未提交，HEAD 不代表执行代码；执行源码、设计、splits 哈希存 `launch-provenance.json`，由运行输出回传并经本地核对。
- CPU 会话，无 GPU；Python/CPU/平台见 `results/results.json`，pip freeze 已归档；容器不可变镜像 digest 见 `sources/executed-kernel-metadata.json`。
- 逐样本 CSV 原大小 7623039 字节，超过仓库单文件约5MB约定，归档为 `results/sample-metrics.csv.gz`，确定性 gzip、解压逐字节相同；原始 CSV SHA256 存 `results/harvest.json`。
- `results/kernel-output-sha256.txt` 原样保存执行时清单；其中平台内部 `__notebook__.ipynb` 未通过输出 API 返回，其哈希不可核验，不冒称全清单齐备。实际代码通过 kernels pull 的逐 code cell 比对核验，见 `results/harvest.json`。
- 本地归档全部结果文件的 SHA256 见 `results/sha256-manifest.txt`；数据、checkpoint、大型官方包均未入库。
- 首次提交时 Kaggle 按 title 规范化了 slug，启动 provenance 仍保留请求时原值；实际地址与 code-cell 比对在 `results/harvest.json` 绑定，详见 `RUNS.md`。首次运行成功，没有隐藏失败的全量运行。

## 5. 取代旧卡而非复现论文

定义在旧探索后确定，本次为描述性后续普查，不冒称旧预注册主假设的确认实验。不以接近论文 73.9% 或87%为目标，不把接近的百分比当成同一原统计定义。停止/低速分层、最大横向偏移和累计航向诊断提供解释边界，不包含感知是否必要、模型性能或 ego-status 捷径的因果判断。

旧卡正文由 Git 历史保留，不与本卡并存。旧实验原始结果、问题与撤回说明见 [审核记录](../bevplanner-nuscenes-straight-driving-imbalance/AUDIT-2026-11-08.md)。
