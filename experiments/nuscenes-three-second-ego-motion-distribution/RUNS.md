# 运行记录

## 2026-11-08 · Kaggle version 1

- 启动 HEAD：`d50d40679a4a904a3faf92e0b2e76208c0b94502`。代码尚未提交，以 `launch-provenance.json` 的源码/设计/splits 哈希和已提交 notebook 绑定实际执行内容；不能用 HEAD 冒充本次代码版本。
- 本地计算边界检查：7 项通过（旋转不变、严格 2m 边界、端点掩盖中途偏移、停止/低速分组、累计航向反例、±π wrap、时间戳/四元数校验）。
- Kaggle CPU，无 GPU，无模型训练；最大运行预算 2400 秒。
- 提交成功：version 1，实际地址 <https://www.kaggle.com/code/cauliyulong/claim-nuscenes-low-lateral-census>。API 确认 current_version_number=1，记录见 `sources/kernel-version.json`；API 未提供全局 scriptVersionId，不编造版本深链。
- 提交元数据最初请求 slug `nuscenes-low-lateral-census`；Kaggle 根据 title 实际创建 `claim-nuscenes-low-lateral-census` 并返回此地址。已纠正本地 kernel id 供后续状态/输出查询。首次已执行 notebook 的 provenance 中 `kaggle_kernel` 保留原始请求值，实际绑定以 `harvest.json` 为准，不改写执行来源。
- 状态：**COMPLETE**。执行日志 UTC 2026-11-08 13:32:39–13:33:57，约78秒；上海时间为当日21:32:39–21:33:57。官方四文件 SHA256 全部一致；主结果25409/29049；移动组20159/23799。详见 RESULTS.md。API last_run_time 存在日期不一致，原值保留，不作为设计先后证明。
- 输出收割后：7 项边界检查通过；执行 code cells 与本地一致；15 个总体从逐样本表重新计数一致；CSV 无损压缩归档，所有归档结果单文件 <5MB。平台内部 `__notebook__.ipynb` 未随 output API 返回，其哈希不可核验，已单列，不冒称全部平台文件收齐。

## 旧实验回收

已用 Kaggle API 取回 `cauliyulong/claim-bevplanner-straight-driving-imbalance` 的结果和运行日志。四项数值/环境输出与原清单逐字节相同；回收日志 SHA256 为 `12e62e3cab5d6f547a21bbfd37306653c9929d1aacb5cd68af12fd9b08aaa22a`，与原缺失日志清单中的 `b02e8ed6…` 不同，不能称为恢复了同一字节文件。作为 `recovered-kaggle-log-20261108.txt` 另存原实验目录，附 recovery-20261108.json 记录差异；旧数值结果及清单未覆盖。
