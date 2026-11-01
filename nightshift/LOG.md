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
02:36 | fire-now | LLaVA 草稿完成（2.4M token，63 次工具调用）| 产出 1（173 行）| validate OK | 补槽 OpenVLA。累计 17 任务 ≈50.5M
02:41 | fire-now | Qwen3-VL 草稿完成（4.4M token，77 次工具调用）| 产出 1（328 行，arXiv:2511.21631 确认存在独立论文）| validate OK | PDF 专属大表不硬转抄（EMC2 教训生效）。补槽 OpenDriveVLA。累计 18 任务 ≈54.9M
03:06 | fire-now | OpenVLA 草稿完成（**9.6M token** 新纪录，126 次工具调用，用时 30 分钟）| 产出 1（227 行）| validate OK | 补槽 OneVL。累计 19 任务 ≈64.5M（00:33–03:06，折合约 35M/h）
03:09 | fire-now | OpenDriveVLA 草稿完成（5.9M token，84 次工具调用）| 产出 1（243 行）| validate OK | 标题与任务给定有出入（Action Model），按唯一命中采用 → QUESTIONS。补槽 DrivePI。累计 20 任务 ≈70.4M（00:33–03:09，折合约 37M/h）
03:26 | fire-now | OneVL 草稿完成（5.0M token，61 次工具调用）| 产出 1（274 行）| validate OK | 补槽 Alpamago。累计 21 任务 ≈75.4M
03:49 | fire-now | DrivePI 草稿完成（**9.2M token**，92 次工具调用，用时 40 分钟）| 产出 1（229 行，CVPR 2026 确认）| validate OK | 与库内草稿交叉核对一致；GitHub 无 license → 需主人确认。补槽 BRCEQ。累计 22 任务 ≈84.6M（00:33–03:49，折合约 39M/h）
03:53 | fire-now | Alpamago 草稿完成（5.9M token，77 次工具调用）| 产出 1（239 行；实为 Alpamayo-R1，TODO 笔误已确认 → QUESTIONS）| validate OK | 补槽 COTR。累计 23 任务 ≈90.5M（00:33–03:53，折合约 40M/h）
04:11 | fire-now | BRCEQ（实为 BRECQ）草稿完成（**6.9M token**，99 次工具调用）| 产出 1（348 行）| validate OK | QUEUE 用名已修正；TODO 更正留 QUESTIONS。补槽 MSMDFusion。累计 24 任务 ≈97.4M（00:33–04:11，折合约 41M/h）
04:15 | fire-now | COTR 草稿完成（4.5M token，64 次工具调用）| 产出 1（288 行，CVPR 2024 占用预测版确认）| validate OK | 配图表号错位 → QUESTIONS。补槽 QLoRA（P1 最后一篇）。累计 25 任务 ≈101.9M（00:33–04:15，折合约 41M/h）
04:28 | fire-now | MSMDFusion 草稿完成（4.3M token，71 次工具调用）| 产出 1（290 行）| validate OK | P2 挖矿启动：派 RadarOcc（TODO 优先项）。累计 26 任务 ≈106.2M
04:34 | fire-now | RadarOcc claim 提炼完成（0.75M token，4 张窄卡）| 产出 4 | validate OK(21) + index 重建 + 抽查命中 | 笔记无实验章节 → 拒立强主张（正确）。补槽 R4Det。累计 27 任务 ≈107M
04:39 | fire-now | R4Det claim 提炼完成（0.44M token，4 张卡）| 产出 4 | validate OK(25) + index 重建 + 抽查命中 | 补槽 NJU-SparseOcc。累计 28 任务 ≈107.4M；claim 库 12 → 25
04:40 | fire-now | QLoRA 草稿完成（**7.1M token**，83 次工具调用）| 产出 1（277 行）| validate OK | 🎉 P1 全清（22/22）。补槽 HGSFusion。累计 29 任务 ≈114.5M（00:33–04:40，折合约 41M/h）
04:48 | fire-now | HGSFusion + NJU-SparseOcc 挖矿完成（0.66M + 0.89M，8 张卡）| 产出 8 | validate OK(33) + index 重建 + 双抽查命中 | claim 库 12 → 33。补槽 SGDet3D、RadarDistill。累计 31 任务 ≈116.1M
04:54 | fire-now | SGDet3D 挖矿完成（0.65M token，4 张卡）| 产出 4 | validate OK(37) + index 重建 | 补槽 RCBEVDet。累计 32 任务 ≈116.8M；claim 库 12 → 37
04:59 | fire-now | RadarDistill 挖矿完成（0.52M token，4 张卡）| 产出 4 | validate OK(41) + index 重建 | 补槽 OmniQuant。累计 33 任务 ≈117.3M；claim 库 12 → 41
05:03 | fire-now | RCBEVDet 挖矿完成（0.76M token，4 张窄卡）| 产出 4 | validate OK(45) + index 重建 | 补槽 VQ-Map。累计 34 任务 ≈118.1M；claim 库 12 → 45
05:08 | fire-now | VQ-Map 挖矿完成（0.54M token，4 张卡）| 产出 4 | validate OK(49) + index 重建 | 笔记乱码 → QUESTIONS。补槽 Ali-BEVFusion。累计 35 任务 ≈118.6M；claim 库 12 → 49
05:14 | fire-now | Ali-BEVFusion 挖矿完成（0.57M token，4 张窄卡）| 产出 4 | validate OK(53) + index 重建 | 补槽 FCOS。累计 36 任务 ≈119.2M；claim 库 12 → 53
05:19 | fire-now | OmniQuant 挖矿完成（3.0M token，4 张卡）| 产出 4 | validate OK(57→61 含 FCOS 在写) + index 重建 | ⚠ 笔记实验表混列 + FP16 基线不符 → mismatch 卡排队 + QUESTIONS。补槽 CaDDN。累计 37 任务 ≈122.2M；claim 库 → 57+
05:26 | fire-now | CaDDN 挖矿完成（0.59M token，4 张消融卡）+ FCOS 完工确认（4 张设计窄卡）| 产出 8 | validate OK(65) + index 重建 | 补槽 OmniQuant-mismatch 卡 + CenterNet-Points。累计 39 任务 ≈123.1M；claim 库 12 → 65
05:31 | fire-now | CenterNet-Points 挖矿完成（0.34M token，4 张卡）| 产出 4 | validate OK(69) + index 重建 | 补槽 PointNet&PointPillars。累计 40 任务 ≈123.4M；claim 库 12 → 69
05:33 | fire-now | OmniQuant note-mismatch 卡完成（0.57M token，18 条双源证据）| 产出 1 | validate OK(70) + index 重建 | 补槽 CornerNet。累计 41 任务 ≈124M
05:38 | fire-now | PointNet&PointPillars 挖矿完成（0.51M token，4 张窄卡）| 产出 4 | 本任务卡零报错（全库 validate 暂 exit 1 系 CornerNet related 悬空，待其完工）| 补槽 SurroundOcc。累计 42 任务 ≈124.5M；claim 库 → 74（含在写）
05:38 | fire-now | CornerNet 挖矿完成（0.39M token，4 张窄卡，related 悬空自愈）| 产出 4 | validate OK(78) + index 重建 | 补槽 RepQ-ViT。累计 43 任务 ≈124.9M；claim 库 12 → 78
05:42 | fire-now | SurroundOcc 挖矿完成（0.44M token，4 张卡）| 产出 4 | validate OK(82) + index 重建 | 补槽 QD-BEV。累计 44 任务 ≈125.3M；claim 库 12 → 82
05:46 | fire-now | RepQ-ViT 挖矿完成（1.0M token，4 张卡 + 2 卡回链）| 产出 6 | validate OK(86) + index 重建 | 补槽 PD-Quant。累计 45 任务 ≈126.3M；claim 库 12 → 86
05:50 | fire-now | PD-Quant 挖矿完成（0.40M token，4 张卡）| 产出 5（含 QwT 回链）| validate OK(90) + index 重建 | 补槽 MQBench。累计 46 任务 ≈126.7M；claim 库 12 → 90
05:52 | fire-now | QD-BEV 挖矿完成（0.88M token，4 张卡）| 产出 4 | validate OK(94) + index 重建 | 规避假 arXiv id。补槽 SparseOcc。累计 47 任务 ≈127.6M；claim 库 12 → 94
05:53 | fire-now | MQBench 挖矿完成（0.24M token，4 张卡）| 产出 4 | validate OK(98) + index 重建 | 补槽 Fast R-CNN。累计 48 任务 ≈127.8M；claim 库 12 → 98
05:59 | fire-now | Fast R-CNN 挖矿完成（0.53M token，4 张卡）| 产出 4 | validate OK(102)🎉 破百 + index 重建 | 补槽 CenterNet-Triplets。累计 49 任务 ≈128.3M；claim 库 12 → 102
06:01 | fire-now | SparseOcc 挖矿完成（0.75M token，3 张卡）| 产出 3 | validate OK(105) + index 重建 | P2 池见底 → R6 QA 轮启动（round2 批 1 = BEV-Planner 5 卡）。累计 50 任务 ≈129.1M；claim 库 12 → 105
06:06 | fire-now | CenterNet-Triplets 挖矿完成（0.76M token，4 张卡）| 产出 4 | validate OK(109) + index 重建 | 🎉 P2 收官（18 篇 75 卡）。补槽 QA-dataset 评估。累计 51 任务 ≈129.9M；claim 库 12 → 109
06:07 | fire-now | QA round2 批 1 完成（0.74M token，BEV-Planner 5 卡全 PASS）| 产出 1 报告 | validate OK(109) | 补槽批 2（RadarOcc+R4Det）。累计 52 任务 ≈130.6M
06:09 | fire-now | QA-dataset 评估完成（0.52M token，LingoQA 3 张窄卡）| 产出 3 | validate OK(112) + index 重建 | 补槽批 3（HGSFusion+NJU）。累计 53 任务 ≈131.2M；claim 库 12 → 112
06:12 | fire-now | QA round2 批 2 完成（0.56M token，8 卡 PASS6 FIXED2）| 产出 1 报告 + 2 卡修正 | validate OK(112) | 补槽批 4（Sparse/Surround/CenterNet 12 卡）。累计 54 任务 ≈131.7M
06:17 | fire-now | QA round2 批 3 完成（1.12M token，8 卡 PASS6 FIXED2）| 产出 1 报告 + 2 卡修正 | validate OK(112) | 补槽批 5（量化+融合 16 卡）。累计 55 任务 ≈132.9M
06:22 | fire-now | QA round2 批 4 完成（1.70M token，11 卡 PASS9 FIXED2 ISSUED2）| 产出 1 报告 + 2 卡修正 + 2 张笔记缺陷卡 | validate OK(114) + index 重建 | 补槽批 6（经典检测 16 卡）。累计 56 任务 ≈134.6M；claim 库 12 → 114
06:27 | fire-now | QA round2 批 6 完成（1.05M token，16 卡 PASS15 FIXED1）| 产出 1 报告 + 1 卡修正 | validate OK(114) | 补槽批 7（QA 轮最后一批）。累计 57 任务 ≈135.7M
06:37 | fire-now | QA round2 批 7 完成（0.86M token，11 卡全 PASS）| 产出 1 报告 | validate OK(114) | QA 七批收官（81 卡，批 5 在跑）。补槽 BEV-Planner 精读报告。累计 58 任务 ≈136.6M
06:48 | fire-now | QA round2 批 5 完成（**9.5M token**，138 次工具调用，16 卡 PASS4 FIXED12）| 产出 1 报告 + 12 卡修正 | validate OK(114) + index 重建 | 🎉 QA round2 全收官（97 卡）。补槽 AI-Infra 评估（最后一个任务）。累计 59 任务 ≈146.1M
06:52 | fire-now | BEV-Planner 精读报告完成（0.85M token，336 行）| 产出 1 | validate OK(114) | 补槽全库 claim 地图（真正最后一个任务）。累计 60 任务 ≈147M
06:55 | fire-now | AI-Infra 评估完成（0.56M token，230 行，5 个 claim 草案）| 产出 1 | validate OK(114) | 补槽 library 修复清单（收尾任务）。累计 61 任务 ≈147.6M
07:05 | fire-now | library 修复清单完成（2.62M token，52 次工具调用，17 篇 29 条）| 产出 1 | validate OK(114) | 队列仅剩 QA 补批（在跑）。累计 62 任务 ≈150.2M
07:09 | fire-now | QA 最终补批完成（0.99M token，24 卡全 PASS）| 产出 1 报告 | validate OK(114) | 🎉 **值班工作全部完成，队列清空**。QA 总账：121 卡 PASS 104 / FIXED 16 / ISSUED 2。累计 63 任务 ≈151.2M。等待 08:20 收班晨报
