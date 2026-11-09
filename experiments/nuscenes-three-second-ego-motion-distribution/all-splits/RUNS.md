# 全量范围扩展运行记录

## 2026-11-08 · version 1

- 用户授权：补上测试集继续实验；定义和阈值保持不变。
- 预先冻结设计见README；启动HEAD与执行源码/设计/splits哈希见launch-provenance.json。本次代码未提交，HEAD不冒充实际源码版本。
- 原测量函数SHA256仍为 `ce4dda3c13b64fe511f109366796edbf6795385f747a979deb08ee48089e27d7`。
- 7项原测量边界检查通过；新增合并选择检查覆盖all/trainval/test/non_stopped及跨split重复token拒绝。
- 新kernel <https://www.kaggle.com/code/cauliyulong/claim-nuscenes-all-census> version 1，CPU，运行预算2400秒，旧kernel version 1不覆盖。
- 状态：**COMPLETE**，首次全量运行成功。日志UTC 2026-11-08 14:27:20–14:27:38（上海时间22:27:20–22:27:38），约18.6秒。测试集4374/5108，全量29783/34157；结果如实写入，不因接近87%而称论文原统计复现。
- 收割核验：实际三个code cells与本地一致；旧trainval每一行指标和15个旧汇总均未改变；25个总体、350行阈值表、1000个场景计数全部从逐样本归档复算一致。
- API version=1，来源与环境见sources/kernel-version.json及sources/executed-kernel-metadata.json。API last_run_time再次与执行日志日期不同，原值保留，不以该字段证明设计先后。
