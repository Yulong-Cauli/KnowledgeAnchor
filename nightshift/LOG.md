# 夜班流水

格式：时间 | fire-id | 任务数 | 产出文件数 | validate | 异常

00:36 | fire-now | 事故记录：首波 7 个子代理超账号并发上限（实测约 3），4 个被拒；BEV-Planner(P0) 于 00:35 被挤掉。规则修正：满载时不得恢复/新派任务，等通知腾槽；槽位分配优先级 P0 > P1 > P3。当前在跑：UniAD、QwT verify、4D radar(试探)。待补：BEV-Planner(P0)、AutoVLA、BEVDet、EchoFusion audit
00:48 | fire-now | QwT verify 完成（1 任务，消耗 1.25M token，用时 12.5 分钟）| 产出 1 文件 | 结论部分支持 | 已补发 BEV-Planner(P0)。实测单任务消耗 ~1.25M，按 3 并发折算烧速约 12–18M/h
00:52 | fire-now | 4D 雷达横向对比完成（0.97M token，33 引文程序验证，用时 14 分钟）| 产出 1 | validate OK | 补槽 BEVDet
00:55 | fire-now | UniAD 草稿完成（3.7M token，68 次工具调用，用时 21.5 分钟）| 产出 1（24.8KB）| validate OK | 发现原文 §3.4 与 Table 8 不自洽（已标注）。补槽 AutoVLA。累计完成 3 任务 ≈5.9M token
