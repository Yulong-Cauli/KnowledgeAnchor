# 夜班流水

格式：时间 | fire-id | 任务数 | 产出文件数 | validate | 异常

00:36 | fire-now | 事故记录：首波 7 个子代理超账号并发上限（实测约 3），4 个被拒；BEV-Planner(P0) 于 00:35 被挤掉。规则修正：满载时不得恢复/新派任务，等通知腾槽；槽位分配优先级 P0 > P1 > P3。当前在跑：UniAD、QwT verify、4D radar(试探)。待补：BEV-Planner(P0)、AutoVLA、BEVDet、EchoFusion audit
00:48 | fire-now | QwT verify 完成（1 任务，消耗 1.25M token，用时 12.5 分钟）| 产出 1 文件 | 结论部分支持 | 已补发 BEV-Planner(P0)。实测单任务消耗 ~1.25M，按 3 并发折算烧速约 12–18M/h
00:52 | fire-now | 4D 雷达横向对比完成（0.97M token，33 引文程序验证，用时 14 分钟）| 产出 1 | validate OK | 补槽 BEVDet
00:55 | fire-now | UniAD 草稿完成（3.7M token，68 次工具调用，用时 21.5 分钟）| 产出 1（24.8KB）| validate OK | 发现原文 §3.4 与 Table 8 不自洽（已标注）。补槽 AutoVLA。累计完成 3 任务 ≈5.9M token
01:01 | fire-now | BEV-Planner L1 完成（0.95M token，172 行）| 产出 2：library/ADe2e/BEV-Planner.md（授权直写）+ suggestions/library-README-ADe2e.md | validate OK | 遗留：开源状态仅 arXiv 摘要为据（GitHub 抓取超时）、输入分辨率 256×704 待 PDF 复核 → 已写入 QUESTIONS 待主人定。补派 [claim|P0] 提炼
01:07 | fire-now | BEVDet 草稿完成（1.35M token，用时 13.8 分钟）| 产出 1（235 行）| validate OK（17 张卡 = 12 旧 + 5 张 BEV-Planner 新卡在写）| 原文 §4.3 vs Table 4 矛盾已标注。补槽 EchoFusion audit。累计 5 任务 ≈8.2M
01:13 | fire-now | BEV-Planner claim 提炼完成（0.33M token，5 张卡）| 产出 5 | validate OK(17) + index 重建 + 调度班抽查 quote 逐字命中 | 补槽 PillarNet 草稿。累计 6 任务 ≈8.6M
01:21 | fire-now | EchoFusion 两卡审计完成（0.56M token，用时 8.4 分钟）| 产出 2（小修 2 卡，status 仍 asserted）| validate OK(17) | 未新建卡（现有 mismatch 卡已覆盖）；论文自身 0.03 vs 0.45 疑笔误 → QUESTIONS。补槽 MIT-BEVFusion 草稿。累计 7 任务 ≈9.2M
01:29 | fire-now | AutoVLA 草稿完成（**5.9M token**，64 次工具调用，用时 20.4 分钟）| 产出 1（259 行）| validate OK | §1 自夸 vs 表格矛盾已 ⚠。补槽 RCBEVDet++。累计 8 任务 ≈15.1M（00:33 起折合约 16M/h）
01:17 | fire-now | 时钟校准：上两条「01:21 / 01:29」为估记，实际约 01:09 与 01:15；以系统时钟为准，累计烧速按 00:33–01:17 实测 ≈ **21M/h**（8 任务 15.1M / 44 分钟）。此后每班收割取实际 date
01:28 | fire-now | MIT-BEVFusion 草稿完成（2.4M token，51 次工具调用）| 产出 1（185 行）| validate OK | 正确避开同名异 arXiv 号。补槽 Deep Compression。累计 9 任务 ≈17.5M
01:29 | fire-now | RCBEVDet++ 草稿完成（3.6M token，58 次工具调用）| 产出 1（426 行）| validate OK | 补槽 LSQ。累计 10 任务 ≈21.1M（00:33–01:29 折合约 23M/h）
01:31 | fire-now | PillarNet 草稿完成（**6.0M token** 新高，70 次工具调用）| 产出 1（288 行，110 引句 + 表格逐格 0 错位）| validate OK | 验算出原文 "+0.34%" 与表差不符等多处疑点。补槽 MobileNet 三部曲。累计 11 任务 ≈27.1M（00:33–01:31 折合约 30M/h）
01:41 | fire-now | LSQ 草稿完成（1.7M token，33 次工具调用）| 产出 1（253 行）| validate OK | 补槽 MobileOne。累计 12 任务 ≈28.8M
01:55 | fire-now | Deep Compression 草稿完成（3.6M token，65 次工具调用）| 产出 1（218 行，528 项核验全过）| validate OK | 补槽 ShuffleNet。累计 13 任务 ≈32.4M（00:33–01:55 折合约 34M/h）
02:18 | fire-now | ShuffleNet 派发被限流拒绝 → 并发上限校准为 **2**（此前 3 的假设偏乐观）。已改：cron 班次批量 3→2；fire-now 也按 2 在跑执行。ShuffleNet 留队待槽。当前在跑：MobileNet 三部曲、MobileOne
02:19 | fire-now | MobileOne 草稿完成（3.8M token，用时 37 分钟）| 产出 1（526 行）| validate OK | 原文 Table 9 vs 14 自不一致已 ⚠。补槽 ShuffleNet（实为恢复：其 20 分钟前已被限流打断，带 23KB 进度续写，经查文件 mtime 确认）。累计 14 任务 ≈36.2M
02:20 | fire-now | ShuffleNet 确认完工（恢复后仅汇报，0.6M token）+ MobileNet 三部曲完工（**11.3M token** 历史新高，599 行，103 次工具调用）| 产出 2 | validate OK | ar5iv 版本歧义 → QUESTIONS。补槽 LLaVA + Qwen3-VL。累计 16 任务 ≈48M（00:33–02:20，折合约 29M/h；注：被限流打断时段的 token 消耗未计入，实际更高）
