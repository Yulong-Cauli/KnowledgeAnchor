# QA round2 — RadarOcc 4 张 + R4Det 4 张 claim 卡复审

- 日期：2026-11-02
- 复审人：QA 子代理（nightshift round2）
- 来源笔记：`library/3D_Occupancy/RadarOcc.md`、`library/Classical_Detection/R4Det.md`
- 方法：① 用 `grep -F` 固定串把每条 `evidence.quote` 对笔记做逐字 substring 匹配（覆盖弯引号 `“”`、全角括号/冒号、表格行空格；plugplay 卡 YAML 里的 `$\\text{mAP}_{\\text{EAA}}$` 按 YAML 双引号转义规则还原为 `$\text{mAP}_{\text{EAA}}$` 后核对）；② 逐条 locator 对照笔记标题层级与行号；③ 卡内数字与笔记逐格比对，并对全部增量做算术验算；④ 对照 `nightshift/cross/4d-radar.md` 核对各卡引用的 M1/M4/M5/S1/C1/C4/C5；⑤ 检查 scope/falsifiers 可操作性、单主张性与 caveat 保留。
- 结论分布：**PASS ×6，FIXED ×2，ISSUED-MISMATCH ×0**。修改 2 张卡（均保持 `status: asserted`、`signoff: null` 未动），未另立 mismatch 卡（未发现笔记本身错误）。

---

## A. RadarOcc（对照 library/3D_Occupancy/RadarOcc.md，笔记无实验章节——cross 文档 M5 属实）

## 1. claim-radarocc-sss-rangewise-preserves-lowrcs — PASS

- Quote 核验（3/3 逐字存在）：
  - "弱信号丢失…从而被直接过滤。" → 笔记 L39（SSS 小节问题 1），locator "§2 方法 / 数据减量【旁瓣感知空间稀疏化 (SSS)】" 正确。
  - "保证召回率…就会被保留。" → 笔记 L47（技术优势第 1 条）。
  - "抑制旁瓣…扩散噪声。" → 笔记 L48（技术优势第 2 条，含 `Top-$N_r$` 数学记号逐字一致）。
- 定位/表述核对：卡把 SSS 立为「设计动机」窄主张，与笔记"如果采用全局百分比…会导致两个问题"+「技术优势」的声称结构一致；scope 显式声明笔记无实验章节（cross M5 属实：RadarOcc.md 止于损失函数小节）、不立性能主张。falsifiers 三条均可操作（对照实验、旁瓣占比、随机筛选对照）。

## 2. claim-radarocc-dbd-compresses-doppler-to-8-descriptors — PASS

- Quote 核验（2/2）：
  - "通过此操作，数据量压缩至原来的 $8/D$…" → 笔记 L33。
  - "速度索引（Top-3 Doppler Indices）…动态行人与静态背景。" → 笔记 L30。locator "§2 方法 / 数据减量【多普勒箱描述符 (DBD)】" 正确（两行均在 L23–33 的 DBD 小节内）。
- 数字复核：8 = Top-3 功率值 + Top-3 多普勒索引 + 均值 + 标准差，与笔记 L27–31 一致；`$D$ 维向量映射为 $\mathbb{R}^8$`（L27）与卡 title/scope 的"8 维描述符、8/D"一致。卡内 8/D 之外不引任何数字，与"笔记无实验章节"限定自洽。falsifiers 覆盖描述符构成错误、消融持平、动态/静态不可分三条路径。

## 3. claim-radarocc-s2c-deformable-avoids-interp-degradation — PASS

- Quote 核验（3/3）：
  - "采样非均匀性…特征严重退化或走样。" → 笔记 L106（S2C【核心动机】）。
  - "消除插值误差…特征平滑问题。" → 笔记 L148（S2C【5. 跨维度对齐的优势】）；`“基于查询”` 为弯引号 U+201C/U+201D，卡与笔记字节一致，grep -F 命中。
  - "基于球坐标的特征编码（Spherical-based Feature Encoding）…几何失配问题。" → 笔记 L56，locator "§2 方法 / 基于球坐标的特征编码" 正确。
- 定位/表述核对：卡只立「插值退化动机 + 可学习聚合对策」窄主张，显式不立 stable-beats-Cartesian（笔记确无对比数字）；还如实保留了 cross C1（与 HGSFusion 俯仰维表态相反）的横向口径警示。三处 locator 与笔记标题层级逐一对应。

## 4. claim-radarocc-cfar-pointcloud-loses-lowrcs — FIXED（小幅）

- Quote 核验：
  - "但传统方法将其处理为稀疏点云，导致 CFAR…弱反射信号。" → 笔记 L11（§1 概述），逐字命中。
- **修复内容**：title 为两个并列半句（① CFAR 点云化丢失低 RCS 弱反射；② 直接处理原始 4DRT 可避免该丢失），原卡仅第 ① 半句有 quote 证据。补第二条 evidence：笔记 L52 "同时在输入端解决了由于雷达物理特性导致的低 RCS 目标消失问题。"（locator "§2 方法 / 数据减量【减量后的结果】"，grep -F 逐字命中），支撑第 ② 半句。status 仍为 asserted，signoff 未动。
- 其余核对：scope/falsifiers 与"不立精度优于点云"的限定（我的理解段）与 cross S1 引用（四方稀疏性叙述同向）均属实。

## B. R4Det（对照 library/Classical_Detection/R4Det.md）

## 5. claim-r4det-pdf-depth-supervision-monotonic-gain — FIXED（小幅）

- Quote 核验（3/3 逐字存在）：
  - "论文通过 Table 5 的消融实验验证了…严格的单调增长：" → 笔记 L73，locator "§2.1【三重监督的实验支撑】/ Table 5" 正确（该小节为 §2.1 下属小节 1，与笔记标题 `### 1. 三重监督的实验支撑` 对应，`note:` 锚 `#1-三重监督的实验支撑` 亦正确）。
  - "BEV mAP 提升至 46.08%（增幅 +0.93%）" → 笔记 L76。
  - "进一步提升至 46.86%（增幅 +0.78%）" → 笔记 L77。
- 数字复核：45.15（L75 基线）→ +0.93 → 46.08 → +0.78 → 46.86，算术自洽；卡内"§3.1 系统消融 Baseline 45.15 / +PDF 46.86 与 Table 5 首尾两档一致"经对照笔记 L132/L133 成立，两表自洽（无 EMC2 式错位）。
- **修复内容**：原卡把密集伪标签源写成事实"监督源是 Metric3D 伪标签 /（Metric3D 伪真值…）"，但笔记 L52 原文为"视觉基础模型**（如 Metric3D）**生成的密集伪真值深度"——"如"表明是示例，实际实验所用基础模型笔记未记录。已把「我的理解」两处改为如实转述（"笔记记为「视觉基础模型（如 Metric3D）」…实际实验所用基础模型笔记未明确记录"）。status/signoff 未动。
- 其余限定核对：「单调增长」限定为逐级叠加顺序下的观察、叠加顺序未记录、Table 5 需回原文核对——均已保留。

## 6. claim-r4det-tj4dradset-ablation-5407-bev-map — PASS

- Quote 核验（3/3 逐字存在，含表格行空格逐字一致）：
  - `| **Baseline**      | 45.15             | 39.86      |` → 笔记 L132。
  - `| **+ IGDR (Ours)** | **54.07** (+3.66) | **47.29**  |` → 笔记 L135。
  - "系统级消融实验证明各模块带来的性能提升是正交叠加的。" → 笔记 L128。locator "§3.1 模块正交增益 / 消融表" 正确。
- 数字复核：BEV 列 45.15 +1.71 → 46.86 +3.55 → 50.41 +3.66 → 54.07，算术全部验算通过；3D 列 39.86 / 41.41 / 44.86 / 47.29 逐格一致；中间两行（+PDF / +DGTF）也与笔记 L133/L134 一致。**无 EMC2 式表格错位。**
- caveat 核对（重点项）：「累计式消融解读」如实保留——卡"我的理解"第 1 点明确区分"累计式逐级叠加"与"正交叠加是论文解读、需全因子实验验证"，且把可证伪内容锚定在四行数字本身；「不立 SOTA 主张」限定保留；scope 引 cross M4（消融仅在 TJ4DRadSet，不可与 VoD 数字比较）属实。

## 7. claim-r4det-dgtf-t1-single-step-best — PASS

- Quote 核验（1/1）："在 DGTF 模块中，单步长（$t-1$）融合表现最佳（BEV mAP 50.41）。跨帧融合（$t-2, t-3$）会引发轨迹错位与误差累积。" → 笔记 L140，locator "§3.2【时序帧距敏感度】" 正确。
- 数字复核：50.41 与笔记 §3.1 消融表 +DGTF 行（L134）同值（卡内已自证此点）；DGTF 构成（DCNv2 空间对齐 + ConvGRU 门控、无自车位姿先验）与笔记 §2.2（L94–110）一致；卡内提及的 SE 冲突数字 50.41→49.12 与笔记 L141 一致，且卡明确声明该观察不立卡。
- caveat 核对：t-2/t-3 具体退化数字未记录（笔记确实只有定性叙述）已写进限定第 1 点与 falsifier 2；单源结论（cross C4，其余三篇笔记无时序模块）属实。

## 8. claim-r4det-plugplay-vod-eaa-gain — PASS

- Quote 核验（1/1）：卡内 YAML `quote` 为 `"$\\text{mAP}_{\\text{EAA}}$"`，按 YAML 双引号转义规则（`\\` → `\`）还原后与笔记 L139 逐字一致（"将 R4Det 模块附加于 BEVFusion 和 RCBEVDet 上，在 VoD 数据集上的 $\text{mAP}_{\text{EAA}}$ 分别提升了 +6.34% 和 +5.34%。"），grep -F 命中。locator "§3.2【即插即用性】" 正确。
- 数字复核：+6.34% / +5.34% 与笔记 L139 一致；笔记确实只给增量、无挂载前后绝对值（卡限定第 3 点属实）。
- caveat 核对（重点项）：「EAA 口径未定义」如实保留——scope 与"我的理解"第 1 点均声明 mAP_EAA 口径笔记与 cross M1 均未定义、不可与其他论文的 mAP_DC / EAA AP / RoI AP 横向比较（cross M1 属实）；「+6.34% 是点数还是相对百分比未注明」限定保留（笔记确未注明）；单源结论（cross C5）属实。

---

## 其他观察（无需改卡）

1. **DBD 卡"距离-角度单元"措辞**：笔记原文即写"对每个距离-角度单元 $(r,a,e)$"（自带俯仰角记号），卡如实沿用笔记措辞，属笔记转写风格而非卡转写错误，不判错。
2. **§2.1 locator 写法**："三重监督的实验支撑"在笔记中是 `### 1.` 层级（§2.1 之后的下属小节），卡 locator 写作 "§2.1【三重监督的实验支撑】"，指向无歧义，与 `note:` 锚一致，不判错。
3. **cross 引用全部核实**：S1/C1/C4/C5/M1/M4/M5 七处引用与 `nightshift/cross/4d-radar.md` L152/L162/L165/L166/L172/L175/L176 内容一一相符。
4. **review_due**：8 张卡均为 2026-12-02（今起 30 天），口径一致。

## 验证

- `node tools/ka.mjs validate` → `OK: 112 claim(s) validated`。
- 本轮修改的文件仅 2 张 claim 卡（`claims/claim-radarocc-cfar-pointcloud-loses-lowrcs.md`、`claims/claim-r4det-pdf-depth-supervision-monotonic-gain.md`）+ 本报告；`git status` 中 TODO/LOG/QUEUE/LOCK 及新增 EMC2/PTQAT 卡为并行班次所为，非本轮产生。
- 未触碰任何 `verified/refuted/stale` 卡与 signoff；未修改 QUEUE/LOCK/RULES/AGENTS/TODO/library；未 git 提交。

## 遗留问题

- 无阻断项。仅提示：R4Det 笔记把密集伪标签源记为"视觉基础模型（如 Metric3D）"，实际实验所用基础模型需回原文确认（已在 claim-r4det-pdf 卡内写入待验证限定，未立新卡）。
