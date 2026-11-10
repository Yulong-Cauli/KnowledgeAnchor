# PROSE-REPORT-2026-11-10 —— 卡面文字整改班（prose 班）晨报

> automation-d6c0d81c（`*/15`），主人 2026-11-10 00:4x 睡前批示开班：按其签署定稿的两张 verified 卡的标准修全库 asserted 卡——意义不明/过度防御/自我窄化/不闭环全部改过来。当班执行 01:03–03:15（fire-0103 主值），03:17 起各火零消耗退出，08:34 本火终检收班。

## 一、统计总账（三计数）

| 项 | 数 |
| --- | --- |
| 处理卡 | **189/189 asserted 全覆盖**（机器对账：池外改动 0；总 191 卡 = 189 asserted + 2 verified 样板） |
| **改动** | **187** |
| **原样保留** | **2 整卡**（claim-hgsfusion-cyclist-roi-ap-below-all-baselines——falsifier 已触发待主人裁定；claim-pdquant-beats-brecq-qdrop-lowbit——改写已「待主人裁定」在案；另批内局部 KEEP 若干） |
| **登记** | **15 条**（`nightshift/prose/QUESTIONS-prose.md` R1–R15，只登记不擅断） |
| commit | 3d0ad93 → 52fab6f 共 16 笔（前缀 `nightshift: prose`） |
| 子代理消耗 | 20 个子代理合计 ≈31M token（2 并发滚动，18 批） |

## 二、标准摘要与判例（产出 `nightshift/prose/style-guide.md`）

样板 = 主人 11-09 签署的两张 verified 卡（center-collision / ego-motion）。提炼五特征：主张概述=结论+关键数字+分母；实验定义写到能复算；表格带原始计数；偏差直说；一句话闭环。**硬保留**：事实归属声明（论文声称/实测/复算/推导）与真实证据缺口——是引用规则不是防御废话。

四类病灶判例（各 ≥2，均取库内真卡原句→为什么病→怎么改），改写作业按"三问"（第一句给结论？定义能复算？下一步+推翻条件清楚吗？）执行。

## 三、病灶分类计数（按各批代理报告主病灶汇总，一卡可多计）

| 病灶 | 卡次（约） | 典型改动 |
| --- | ---: | --- |
| ①意义不明（节名病/元话语/班次语言混正文/账目混排） | ~119 | "我的理解"→"主张"等全库节名映射；"必须记住的三个限定"→"三个限定"；班次账目移核查记录或收敛为当前事实 |
| ②过度防御（scope 堆叠/三层括号 title/同层重复/空转 hedge） | ~66 | scope 回数据集-模型-条件三要素；title 拆直；修订注记 blockquote 压缩为指针；同一事实三处重复收一处 |
| ③自我窄化（分类学自述/窄得与证据不匹配） | ~30 | 删"这是 XX 系的卡"；归属缺位的 title 补归属（echofusion-rt-vs-ra）；「未载」等缺口保留不回填 |
| ④不闭环（空洞下一步/falsifier 与主张脱节/与已定案实验脱节） | ~30 | 待验证全部挂"固定/只改/观察/判据"；r4det 两卡 falsifier 对准链式主张；pointnetpillars 两卡织入 K-probe-1 结论 |
| 表述失真修正 | 2 | sliderquant「差一个数量级」→实际 2.5–8 倍；rt-vs-rp「中远距」→「50–100m」（0–50m 仅 +0.59） |

## 四、QA 结果（P2 自查轮）

- **全程冻结行检查（e77c623→HEAD，git diff 全量）**：id/status/stance/review_due/signoff/evidence（source/locator/quote/relation 逐字）/related/tags/核查记录/历史标记 = **0 变更**。
- **机器对账**：改动 187 + 整卡 KEEP 2 = 189 ✓；池外文件 0 ✓。
- **独立深核（两个全新代理，40 张重改卡，改前 `git show e77c623` 逐 diff 对照六项）**：**PASS 39 / FIXED 1 / ISSUED 0**。唯一 FIXED：msmdfusion-multidepth scope 收敛时把评测 split「nuScenes val」整个删丢——深核代理当场按笔记 §4.3/Table 4 caption 回填「（Table 6，nuScenes val）」。
- **08:34 终检**：validate OK(191) ✓；随机抽 3 卡（brecq-w4a4 / echofusion-rt-vs-ra / surroundocc-table-lead）evidence 块 vs 基线逐字一致 ✓；library quote Grep 命中 ✓；三计数守恒 ✓。
- 记账勘误：QUESTIONS-prose 曾重复追加 R11/R12 各一份，收班去重，现 15 条唯一。

## 五、未完成清单与建议

- **卡片层无未完成项**——189/189 全部经过改写或明确 KEEP 判定。
- **建议主人优先处置**：R14（B3c 批五卡核查记录声称「scope 末补『尚未独立验证』」但 scope 实文没有——账实不符，需裁定补回方式）与 R13（drocc-cotr「官方 43.1」疑笔误）。
- 其余 R 项为节序统一、无核查记录节的卡是否补建、related 反向补链、本地路径归档等小项，见下方分组。

## 六、QUESTIONS-prose 分组（R1–R15，全在 `nightshift/prose/QUESTIONS-prose.md`）

- **待主人定夺数值/表述**：R3（guanaco/nf4-dq 等预设阈值「待定」）、R13（drocc-cotr 43.1 疑笔误）。
- **账实不符（最高优先）**：R14（B3c 五卡核查记录 vs scope 实文不符）。
- **节序/结构统一类**（是否统一待裁定）：R1/R4（核查记录节位置不居末）、R8/R12/R15（四张卡无核查记录节是否补建；kradar 两卡原始来源指向 Windows 本地路径 D:/Research/… 库内无归档）。
- **evidence/quote 待补**（需另行走流程，prose 班冻结 evidence 行未动）：R6（centernetpoints 两卡细节无 quote 直撑）、R7（fcos Table 3 37.1→37.4 是否补 evidence；在跑实验是否加指针）。
- **related 补链**：R9（两张骨干卡缺反向关联）。
- **证据缺口登记**（需先补笔记/核论文）：R5（MQBench 四卡笔记未录实验表格）、R10（msmdfusion Table 6 评测集口径）。
- **其他**：R2（nf4-dq 账目指针联动）。

## 七、收班状态

- QUEUE.md 已写 ⛔（REPORT 生成前的所有班次直接退出，报告已存在则按提示词退出分支处理）；LOCK 已删；后续火次零消耗退出，待主人处置（如需再开按 QUEUE mode 字段恢复）。
- 验证池班（automation-2b53c801）独立运行：其 REPORT-2026-11-10.md 归池班，本班未触碰。
- 全部改动未 push 远端，共 16 commit 在本地 main。
