# 夜班流水

格式：时间 | fire-id | 任务数 | 产出文件数 | validate | 异常

00:36 | fire-now | 事故记录：首波 7 个子代理超账号并发上限（实测约 3），4 个被拒；BEV-Planner(P0) 于 00:35 被挤掉。规则修正：满载时不得恢复/新派任务，等通知腾槽；槽位分配优先级 P0 > P1 > P3。当前在跑：UniAD、QwT verify、4D radar(试探)。待补：BEV-Planner(P0)、AutoVLA、BEVDet、EchoFusion audit
00:48 | fire-now | QwT verify 完成（1 任务，消耗 1.25M token，用时 12.5 分钟）| 产出 1 文件 | 结论部分支持 | 已补发 BEV-Planner(P0)。实测单任务消耗 ~1.25M，按 3 并发折算烧速约 12–18M/h
00:52 | fire-now | 4D 雷达横向对比完成（0.97M token，33 引文程序验证，用时 14 分钟）| 产出 1 | validate OK | 补槽 BEVDet
00:55 | fire-now | UniAD 草稿完成（3.7M token，68 次工具调用，用时 21.5 分钟）| 产出 1（24.8KB）| validate OK | 发现原文 §3.4 与 Table 8 不自洽（已标注）。补槽 AutoVLA。累计完成 3 任务 ≈5.9M token
01:01 | fire-now | BEV-Planner L1 完成（0.95M token，172 行）| 产出 2：library/ADe2e/BEV-Planner.md（授权直写）+ suggestions/library-README-ADe2e.md | validate OK | 遗留：开源状态仅 arXiv 摘要为据（GitHub 抓取超时）、输入分辨率 256×704 待 PDF 复核 → 已写入 QUESTIONS 待主人定。补派 [claim|P0] 提炼
01:07 | fire-now | BEVDet 草稿完成（1.35M token，用时 13.8 分钟）| 产出 1（235 行）| validate OK（17 张卡 = 12 旧 + 5 张 BEV-Planner 新卡在写）| 原文 §4.3 vs Table 4 矛盾已标注。补槽 EchoFusion audit。累计 5 任务 ≈8.2M
