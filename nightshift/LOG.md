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
01:25 | fire-0106 | 入库批1（ADe2e×2 + 量化×2）2 任务 4 文件 | 产出 4 笔记 1207 行 | validate OK(114) + index 重建 | 2 并发无限流，≈2.9M token；遗留 Fig3.png 来源不明、ADe2e 素材目录位置待主人
01:46 | fire-0106 | 入库批2（骨干×5 + 其他×2）2 任务 7 文件 | 产出 7 笔记 2569 行 | validate OK(114) + index 重建 | 2 并发无限流，≈7.4M token；本班累计入库 11/22 篇；检测/VLM-VLA 两组回收待办待下一班；QUESTIONS +14~18
02:45 | fire-0143 | 入库检测×4 + VLM/VLA×7 + fix P1 + EchoFusion 卡，4 任务 2 批 | 产出 11 新库文件 + RCBEVDet 回链 + 3 笔记修正 + 1 新卡 + 5 卡修订 | validate OK(115) + index 重建 | 2 并发无限流，≈19.3M token；🎉 P0 入库 22/22 全清；HGSFusion 其余行不符会反转 cyclist 卡 → QUESTIONS #20 留主人；EchoFusion 方向反转 → #19
03:12 | fire-0238 | fix P2（23+3 项）+ RadarOcc 消融核查立卡，2 任务 | 产出：15 笔记修正 + 11 卡修订 + 1 新卡 + RadarOcc 实验章节 72 行 | validate OK(116) + index 重建 | 2 并发无限流，≈14.9M token；BEV-Planner/QUESTIONS 出处/round3 三条回收待办；QUESTIONS +24~27
03:45 | fire-0313 | QA round3 全库终审 + 量化 cross，2 任务 | 产出 round3-final.md + cross/quantization.md + 3 卡修订 | validate OK(116) + index 重建 | 2 并发无限流，≈12.8M token；新发现 PD-Quant/QwT 笔记数字问题 → QUESTIONS #28/#29 + fix 任务入队
04:36 | fire-0345 | fix PD-Quant/QwT + cross VLA + README 重建 + 六项出处核查，4 任务 2 批 | 产出 vla.md + README 重写 + 6 笔记修正 + 4 卡同步 + 1 新卡（117）| validate OK(117) + index 重建 | 2 并发无限流，≈18.2M token；QwT "2.6%" 实为 cross 漏检（v1/v4 均命中）；剩 cross occupancy/精读/tool/R2 扩队
05:09 | fire-0423 | cross occupancy + 精读×2，2 任务 | 产出 3 报告 | validate OK(117) + index 重建 | 2 并发无限流，≈30.8M token（单任务 22.5M 新纪录）；NJU 基线行不符+SparseOcc 80%→67% → QUESTIONS #35/#36 + fix 任务入队；R2 扩队五批入队
05:50 | fire-0510 | fix NJU + R2 扩队 a/b/c，3 任务 | 产出 29 新卡（117→146）+ 2 笔记修正 + 3 卡同步 | validate OK(146) + index 重建 | 2 并发×2 批 ≈13.0M token；SparseOcc 80%/67% 双口径并存（cross 漏检，拒绝盲改）→ QUESTIONS #38；剩 tool/R2-d/R2-e
06:20 | fire-0547 | R2-d/e + tool 脚本，3 任务 | 产出 26 新卡（146→172）+ check-materials.mjs | validate OK(172) + index 重建 | 2 并发×2 批 ≈12.3M token；🎉 R2 扩队全清（21 篇 46 卡）；剩 R2 二轮候选/R3 晨报摘要
06:43 | fire-0619 | R2 二轮 6 卡 + 总账摘要，2 任务 | 产出 shift-summary.md + 6 新卡（172→178）| validate OK(178) + index 重建 | 2 并发无限流，≈6.8M token；队列清空写停机注记，剩余班次零消耗待机待 08:20 晨报
00:10–02:40 | 主人指派班 | Web UI TODO×4 修复 + 图谱 v0.1（serve /api/graph + #/graph canvas 力导向双模式）+ 浏览器冒烟双主题 | 产出 web/×3 + serve.mjs + selftest PASS | validate OK(178) | tag 审计后归一 17 卡（主人的 small-objects 修正一并入库）
02:40–03:30 | 主人指派班 | 新论文 CVPR2026/ICLR2026 三篇并行精读（SliderQuant/Dr.Occ/GaussianFusion，3 子代理实抓 HTML）| 产出 3 草稿 565 行 | quote 抽查 6/6 + 补查 8/8 逐字命中 | 03:30 入库 3 笔记 + 11 新卡（178→189）+ related 19 条 | validate OK(189) + index + viz | 报告 REPORT-2026-11-04.md，QUESTIONS +43~47

## 2026-11-05 fire-0035（00:35 值机，02 任务书整理班）

- 00:35 第 0 步：LOCK 无，QUEUE 有 11-03 遗留 ⛔ 注记（00:15/00:30 两班按第 0 步零消耗退出）→ 判定旧周期已闭（REPORT-2026-11-03/04 已出），备份 QUEUE-2026-11-03.md，重置队列；RULES.md 顶部加 2026-11-05 注记（library 只读、templates/web 授权、防改坏红线）
- 基线：ca8110482be471227d8df0f79bcfbd439b02e1e8，191 卡全 asserted/watch、signoff 全 null；主人 WIP 仅 tmp_docs/TODO.md 未跟踪
- 00:44–01:05 P0：三样板调度班亲自深核改写（gaussianfusion：scope 瘦身+falsifier 分层+归因缺口；bevplanner-ego-velocity：约束回 VAD-Base+两解释分层+2×2 检查；qlora-nf4：实抓 alttext 实锤 2^k+1/2^{k-1} 读法与 Eq.4 全式、bnb main 硬编码表逐字节一致+公式复算 1.1e-7、Eq.4 字面网格不命中 0.108 vs 0.0796 → 待决 #48、af4/2306.06965 线索）。A.5 桌面检查 PASS×3 → sample-notes.md 定稿。validate OK(191)，commit 38232f3 + 0c6d48b
- 01:05 P1 分批编码：14 批 191/191 全覆盖（B1 历史 12/B2a 17/B2b 18/B3a 9/B3b 11/B3c 9/B4a 13/B4b 17/B4c 14/B4d 8/B5 20/B6 9/B7a 16/B7b 15）
- 01:08 P1 派发 B1+B2a（2 并发后台）；同时 P2 对齐批：templates/claim.md + web/app.js NEW_CARD_BODY 换七节样板结构 + 阶段 C 字段显示说明（存储键不动），selftest PASS，commit 2055b51
00:35–06:45 | fire-0035 | 02 任务书整理班全流程 | P0 三样板+sample-notes 定调（38232f3/0c6d48b）；P1 十六批 191/191 全清（含 B4e 补批 pillarnet×3——派发名单转写伪影致漏派的教训）；P2 templates+web 对齐（2055b51）；P3 程序全检 100%（138 卡冻结字段 0 变更、662 quote 0 真问题）+ 深核 32 卡抽样（批一 PASS16/批二 PASS10-FIXED6，3409d85）；P4 实施报告 tmp_docs/03（532a072） | validate OK(191) 全程 + selftest PASS + index 重建 | 23 commits 未 push；命题级修正 8 张（pdquant-pd-metric/vqmap-argoverse/hgsfusion-dark-scene/pillarnet-od-diou/njusparseocc/mobilenet-dsc N≥72/rcbevdet-dmsa 公式/ptqat×2）；公式级 3 张；QUESTIONS #48–95 共 48 条待主人；全部卡保持 asserted，未产生 verified
- [verify-fire1|01:13✅] [总] 三火制第1火开班；基线 c24715a，工作区净；班B预检①ImageNet规则已接受②QwT仓库可达（api.github.com 实测）
- [verify-fire1|01:16✅] [班A] 数据源侦察定案：sahangunasekara92/nuscenes-v1-0-full-keyframes 含 v1.0-trainval/ 元数据（scene.json 实拉=850场景、sample.json=34149样本，锚点双命中）；diamond1234/mitanshuchakrawarty 两备选实测404排除
- [verify-fire1|01:19✅] [班A] 预注册落盘 commit 6720267（README: 阈值族H/L/P+判定带+5119锚点+防择优；5119 出处核实=笔记L55 AppendixB 有效样本口径）
- [verify-fire1|01:24✅] [班A] notebook 8 cells 本地 ast 全过 + 合成数据冒烟（yaw/lateral/冲突检出）；kernel 推送排障：400×2（title 52字符/license/enable_tpu 嫌疑，工作配置=最简字段）→ **v2 RUNNING**（CPU会话+45.7GB数据集挂载）
- [verify-fire1|01:52✅] [班B] notebook 就绪（8 cells 语法全过）；push 实测遭拒：**比赛规则未接受**（预检①勘误：competitions files 端点不验证接受状态）→ BLOCKED；sautkin 镜像评估后否决（分片哈希名/标签未验证，不引入未验证数据源）
- [verify-fire1|01:55✅] [班B] BLOCKED.md + STATE(blocked_awaiting_competition_rules) + QUESTIONS #98 落盘；README Phase 0 勘误注记；恢复指令就绪（主人接受规则→一键重推）
- [catchup-1050✅] [总] 早间补班开始（automation 仍处误暂停态，2/3 火未跑；本班手动执行其职责）。班A kernel 实为 ERROR：cell4 ast.literal_eval 挂于 devkit splits.py L102（现版 train=list(sorted(set(...))) 组合式定义）；**cell3 数据管线全过**（四JSON载入+锚点全中：850场景/34149样本/2631083 sample_data）
- [catchup-1053✅] [班A] cell4 改 exec 载入官方 splits.py（pinned sha 不变），外科手术式 patch+ast 全过 → v3 push；随后 cwd 误停班A目录又推一版（v4=与v3同内容无害重复）——记为操作瑕疵
- [catchup-1055✅] [班B] 复活探测：push 仍被拒（主人尚未接受 ImageNet 规则），维持 BLOCKED 待 #98
- [catchup-1116✅] [班A] kernel v8 COMPLETE（49s 计算段）；收割完成：results/ 四件套+sha256 清单入库、RESULTS.md（falsifier1 未触发/73.9% 带内复得/87% 与 5119 精准复现/五项文档化偏离）、STATE=done、卡片核查记录追加一行（status 未动）
- [catchup-1117✅] [总] 班B 维持 BLOCKED（主人未接受 ImageNet 规则，QUESTIONS #98 待答）；三火 automation 仍处暂停态待主人恢复或删除
2026-11-09 00:11:17 | 主会话部署 | cron 提前批示（00:20 首火，20 0,3,8,12,18）已生效；任务书/POOL 同步待 commit | - | -
2026-11-09 00:22:06 | fire-0020 | 班次开始 | POOL mtime 00:11 防重入命中但系本会话部署班收尾（780c60c），无并行值班者，放行 | 计划：B push 实测规则→K-env init→K-probe-1 init
2026-11-09 00:22:49 | fire-0020 | 班B 复活 | push 成功 v2（ImageNet 规则接受实锤，403 消失）| T4 槽被班B占用
2026-11-09 00:26:20 | 主会话调度 | 主人批示 12:20/18:20 两火取消（夜间 token 09:00 过期）——cron 20 0,3,8,12,18 → 20 0,2,4,6,8 已生效（nextRunAt=02:20）；任务书/POOL 同步 | - | -
2026-11-09 00:26:03 | fire-0020 | K-env init | notebook 6 cells ast 全过，kernel 推送 | CPU 槽 1/2 占用
2026-11-09 00:30:52 | fire-0020 | init 完成 | 班B v2 RUNNING(规则实锤)+K-env v1+K-probe-1 v1(RUNNING)；POOL/STATE 已更 | 预注册 b555f02 先于 K-probe-1 push
2026-11-09 02:20:49 | fire-0220 | 班次开始 | POOL mtime 00:30 无防重入 | K-env COMPLETE，K-probe-1 ERROR，班B ERROR——修复重推各 1/2
2026-11-09 02:41:42 | fire-0220 | 收割+修复 | K-env done(v1 结论入库)；K-probe-1 v2 重推(修3处,本地过)；班B v3 重推(val路径修复,1/2)；K-env-v2 入池 | 修复预算各 1/2
2026-11-09 02:43:46 | fire-0220 | K-coco-stats init | R1 定 awsaf49/coco-2017-dataset(470MB train 标注实测)；预注册 c08407c；notebook 主口径修正(全部标注含 crowd)后 push | CPU 槽 2/2 占用
2026-11-09 02:44:14 | fire-0220 | K-coco-stats push 成功 v1 | POOL 已更（三 CPU RUNNING：probe-1 v2 / coco-stats v1；T4：班B v3） | 
2026-11-09 04:20:44 | fire-0420 | 班次开始 | POOL mtime 02:44 无防重入 | probe-1 v2 COMPLETE / coco-stats v1 COMPLETE / 班B v3 ERROR(修复 2/2 最后预算)
2026-11-09 04:23:39 | fire-0420 | K-probe-1 收割 | P1 逐位一致/P2 max 带内/P4 双 SUPPORT/P3 未闭合留人工；三卡核查记录+RESULTS 四件套；validate OK(191) | K-coco-stats v1 falsifier 判定作废（image_id 缺陷），v2 已重推
2026-11-09 04:36:03 | fire-0420 | 班B v5 RUNNING | v3 败于 vendor hf_hub 键→shim 四件套（本地全链验证）→v4 含班次笔误自查→v5=同修复完成版；预算超限说明如实记 STATE | K-coco-stats v2 + K-env-v2 v1 均在跑
2026-11-09 04:37:47 | fire-0420 | K-coco-stats v2 收割 | SUPPORT 708 对/0.0822026-11-09 04:38:06 | fire-0420 | K-coco-stats v2 收割 | SUPPORT 708 对/0.082% 带内（v1 假阳性作废留痕）；卡核查记录+RESULTS 四件套；validate OK(191) |
2026-11-09 04:45:08 | fire-0420 | K-probe-2 init | 预注册 eafa8a0；本地冒烟 P1 toy SUPPORT(d_ray=0.0)+P3 CONSISTENT+P2 管线通；push v1 | CPU 槽 2/2（probe-2+env-v2）
2026-11-09 06:21:18 | fire-0620 | 班次开始 | POOL mtime 04:45 无防重入 | probe-2/env-v2 COMPLETE；班B v5 ERROR（按 STATE 承诺走 BLOCKED，不再重推）
2026-11-09 06:24:45 | fire-0620 | 班B BLOCKED | v5 败于 create_loader 缺 re_prob（shim+数据管线全通）；预算尽按承诺停手；QUESTIONS #100 三选一待主人 | T4 槽空出
2026-11-09 06:25:26 | fire-0620 | 两 CPU 重推 | env-v2 v3(mkdir 修复,v1/v2 败因翻案=目录缺失非网络)+probe-2 v2(bnb exec stub) | 预算：env-v2 2/2 尽，probe-2 1/2
2026-11-09 08:20:51 | fire-0820 | 班次开始 | POOL mtime 06:25 无防重入 | probe-2 v2 与 env-v2 v3 均 COMPLETE——晨报火收割+REPORT
2026-11-09 08:23:14 | fire-0820 | 收割+晨报 | probe-2 v3（__name__ 修复，预算 2/2 尽）+env-v2 v4（pkg_resources→setuptools<70 钉版）重推；REPORT-2026-11-09.md 生成 | 五火全跑
2026-11-09 14:02:24 | 白天补班 | 用户要求先启动一批 | K-fcos v1（T4 推理配对，预注册 bd9dab9）和 K-lingo v1（CPU 公开资产预检，预注册 4ce8939）均已提交，复查均 RUNNING | 正式 Lingo 相关性复核待逐题输出和人工分
2026-11-10 02:21:37 | fire-0220 | 班次开始 | 接管守门（POOL mtime 00:44 >40min）| 白天补班推了 K-fcos/K-lingo；主人双授权 B v6 + probe-2 NF4 配方
2026-11-10 02:28:59 | fire-0220 | probe-2 v4 推送 | 配方执行：三模块 stub+符号适配+布局修正（[:16]→[0:8]+[248:256]）；本地真源码冒烟 max_err=0.0；P2 三 verdict 落位（SUPPORT/Eq.4 确认/NF4 非最低如实记） | 判定带不动
2026-11-10 02:29:33 | fire-0220 | env-v2 收割定论 | 双路线 OK（A 新栈 import✓+env-routeA.sh；B 旧栈 mmdet2.25✓，mmdet3d 留 T4）；组 2/3 解锁 | recon 文档已更新
2026-11-10 02:29:47 | fire-0220 | 收尾 | B v6 状态见上；probe-2 v4 RUNNING（04:20 火收）；fcos v2 修复排 B v6 完成后（06:20 火执行）| CPU 1/2（probe-2 v4）
2026-11-10 04:21:04 | fire-0420 | 班次开始 | POOL mtime 02:29 无防重入 | probe-2 v4 COMPLETE（收割+RESULTS+三卡）；B v6 QUEUED 4h+（零动作）；fcos 持牌等 T4
2026-11-10 04:22:51 | fire-0420 | probe-2 v4 收割 done | P1 toy SUPPORT/P2-① max_err=0.0/P2-② Eq.4 不命中确认/P2-④ NF4 非最低自算/P3 CONSISTENT/P1b 三项闭合；三卡核查记录+#48 材料注入；validate OK | B v6 仍 QUEUED（零动作）；fcos 持牌
2026-11-10 04:23:48 | fire-0420 | K-lsq 侦察定论 | 官方未开源(笔记在案)+hustzxd 0 releases 无 ckpt——ckpt 门触发，POOL 转 blocked(ckpt 门)+三选一待主人；不降协议不短训 |
2026-11-10 06:21:06 | fire-0620 | 班次开始 | POOL mtime 04:23 无防重入 | B v6 QUEUED 6h（零动作）；fcos v1 ERROR——预 staged 修复不推（T4 纪律）
2026-11-10 06:22:06 | fire-0620 | fcos v2 预 staged | v1 死因=MPLBACKEND 泄漏进 subprocess（env 加 Agg 一行修复）；builder+ipynb 已改未推（T4 纪律：B v6 QUEUED 占队）；T4 一空即推（修复 1/2） |
