# QA round2 — HGSFusion 4 张 + NJU-SparseOcc 4 张 claim 卡复审

- 日期：2026-11-02
- 复审人：QA 子代理（nightshift round2）
- 来源笔记：`library/Multimodal_Fusion/HGSFusion.md`、`library/3D_Occupancy/NJU-SparseOcc.md`
- 方法：① 用 `grep -F` 固定串把每条 `evidence.quote` 对来源做逐字 substring 匹配（覆盖弯引号 `“”`、全角括号/冒号、表格行空格、LaTeX 记号；YAML 单引号串内 `\tau`/`\%`/`\in` 按字面取值核对，与笔记字节一致）；② 逐条 locator 对照笔记标题层级与 grep 命中行号；③ 卡内数字与笔记逐格比对，并对全部增量/倍数做算术验算；④ 3 条 arXiv 摘要引文于 2026-11-02 实抓 `https://arxiv.org/abs/2312.17118`（当前版本 v5）后对规范化摘要文本逐字 grep；⑤ 对照 `nightshift/cross/4d-radar.md` 核对 HGSFusion 卡引用的 M1/M3/S4/S5/C1/§6.3。
- 结论分布：**PASS ×6，FIXED ×2，ISSUED-MISMATCH ×0**。修改 2 张卡（均保持 `status: asserted`、`signoff: null` 未动），未另立 mismatch 卡（未发现可裁定的笔记本身错误，两处存疑见「六、笔记侧存疑点」）。

---

## A. HGSFusion（对照 library/Multimodal_Fusion/HGSFusion.md）

## 1. claim-hgsfusion-cyclist-roi-ap-below-all-baselines — PASS

- Quote 核验（6/6 逐字存在）：Table 1 五行整行（HGSFusion L123 / PointPillars L119 / RadarPillarNet L120 / BEVFusion L121 / LXL L122，表格行空格逐字一致）+ 分析句 L125（含弯引号 `“自行车架”`、`“未使用自行车”`，grep -F 命中）。locator "§4.1 / Table 1" 与 "§4.1 / Table 1 分析" 正确。
- 数字复核：Cyclist 79.46 < 85.07 / 86.19 / 89.48 / 88.31，确低于同表全部四个对比方法；Car 88.28、Ped 87.49 为同列最高（次高 72.18 / 72.93）。与笔记 Table 1 逐格一致，无 EMC2 式错位。
- 专项核对：**88.28% 口径警告完整保留**（口径警告 1：§1 头条 88.28% 是 Car 类 RoI AP、全类 mAP (RoI) 为 62.61、不得当 mAP 引用，与 cross M3 一致）；口径警告 2（LXL 行 72.93 重复，对应 cross §6.3，已核实 cross 文档 §6 第 3 条原文相符）；口径警告 3（Table 3/4/7 全量行 79.46 数值巧合，L136/L146/L167 三处核实均为 79.46）。PASS。

## 2. claim-hgsfusion-rhgm-dsm-superadditive-roi-gain — PASS

- Quote 核验（3/3 逐字存在）：L133（基线行）、L136（全量行）、L138（分析句全文）。locator "§4.2 / Table 3" 正确，`note:` 锚 `#42-模块消融实验-table-3` 与标题 `### 4.2 模块消融实验 (Table 3)` 对应。
- 算术验算（全部自洽）：RoI AP 74.83−73.27=1.56、74.45−73.27=1.18、79.46−73.27=6.19，1.56+1.18=2.74 < 6.19；EAA 侧 58.96−54.82=4.14 > (57.23−54.82)+(55.99−54.82)=2.41+1.17=3.58。
- 表述核对：卡如实声明「大于单独增益之和」是卡内算术比较、笔记原文只说「两者结合实现了最大的增益」（L138 确无「超可加」措辞），未把解读写成笔记原文；单模块组合方式推断、口径未定义、无种子方差等限定均保留。PASS。

## 3. claim-hgsfusion-dark-scene-gain-dominates — PASS

- Quote 核验（4/4 逐字存在）：L154（Dark 行，`**+11.41%**` 截取位置与笔记一致）、L155（Normal 行）、L156（Shiny 行）、L158（分析句全文）。locator "§4.4 / Table 5" 与 "§4.4 / Table 5 分析" 正确。
- 算术验算：15.68−4.27=11.41、35.82−33.50=2.32、25.28−22.37=2.91；相对增幅 15.68/4.27≈3.67（即 +267%，卡写「约 2.7 倍」成立）；「Dark 增益约为另两组的 4–5 倍」= 11.41/2.32≈4.9、11.41/2.91≈3.9，带「约」可接受。
- 专项核对：**「百分点 vs %」表述完整保留**——title 用「+11.41 个百分点」，我的理解 注意 1 明确「笔记表内写 +11.41%，按表内数字实为百分点而非相对百分比，引用时应写 +11.41 个百分点」；注意 2 保留「增益排序 ≠ 暗光性能好」（Dark 15.68 仍远低于 Normal 33.50）。scope 对数据集/分组标准/Base-R+C 构成未记录的限定均在。PASS。

## 4. claim-hgsfusion-2d-spatial-mode-beats-3d — FIXED（小幅）

- Quote 核验（3/3 逐字存在）：L169（分析句全文）、L165（3D+监督行）、L167（2D+监督行，`**2D**/**√**` 加粗记号逐字一致）。locator "§4.5 / Table 7" 与 "§4.5 / Table 7 分析" 正确。
- 数字复核：79.46−75.58=+3.88、58.96−56.41=+2.55、监督增益 79.46−78.77=0.69（L169「0.69% 的 RoI AP」）、无监督侧 2D 78.77 vs 3D 74.70（L166/L164）全部一致；与 RadarOcc 的 C1 张力保留（cross L162 核实存在）。
- **修复内容**：原卡写「（cross 文档 §6 遗留问题 6.5/6.6 方向）」，但 cross 文档 §6 只有 6.1–6.5 共 5 条，6.6 不存在；与「俯仰维需对照实验裁决」对应的正是 6.5（C1 俯仰维可用性）。已把引用改为「§6 遗留问题 6.5 方向」。status 仍为 asserted，signoff 未动。
- 其余核对：窄主张（只立本管线消融排序、不立「俯仰维普遍无用」）与 Table 7 全量行数值巧合警告（同 Cyclist 卡口径警告 3）均保留。

## B. NJU-SparseOcc（对照 library/3D_Occupancy/NJU-SparseOcc.md）

## 5. claim-njusparseocc-rayiou34-fps17-beats-dense-baselines — FIXED（小幅）

- Quote 核验：笔记侧 4/4 逐字存在（L95 SparseOcc 行、L93 BEVFormer 行、L94 FB-Occ 行、L89 测试环境行，表格行空格逐字一致）；arXiv 摘要引文 1 条于 2026-11-02 实抓 `https://arxiv.org/abs/2312.17118`（v5）逐字命中："SparseOcc demonstrates its effectiveness by achieving a RayIoU of 34.0, while maintaining a real-time inference speed of 17.3 FPS, with 7 history frames inputs."
- 专项核对：**arXiv 引文来源标注如实**（source 为 arXiv URL、locator "§ Abstract"，未冒充笔记）；卡内「35.1@15帧（arXiv 摘要亦证实）」经抓取页核实——摘要末句 "By incorporating more preceding frames to 15, SparseOcc continuously improves its performance to 35.1 RayIoU without bells and whistles." 属实；「34.0 / 17.3 / 7 帧已与摘要逐字核对」的记载复核成立。
- 数字复核：三行 RayIoU/FPS/帧数逐格一致；34.0−33.7=0.3、34.0−32.2=1.8，「只高 0.3–1.8」成立。
- **修复内容**：原卡「FPS 差一个量级（17.3 vs 5.2）」——17.3/5.2≈3.3，不足一个数量级（对 BEVFormer 2.3 约 7.5 倍），把笔记 L99 的修辞性「量级跃升」坐实到了具体对比上，属数字表述失准。已改为「FPS 差 3.3 倍（17.3 vs 5.2；对 BEVFormer 的 2.3 约 7.5 倍）」。status 仍为 asserted，signoff 未动。
- 其余核对：scope 写明「自报对比表、基线复现/引用未知」（FPS 跨论文口径风险，EMC2 前车之鉴）保留；falsifiers 三条（复现不及 FB-Occ、基线口径不对等、对 v5 原文表格核对）均可操作。

## 6. claim-njusparseocc-decoder-pruning-complexity-onactive — PASS

- Quote 核验（3/3 逐字存在）：L49（`$O(L^3)$ 降至 $O(N_{active})$` 记号逐字一致）、L45（二分类剪枝整句，YAML 单引号串内 `$s \in [0, 1]$`、`$s > \tau$` 按字面与笔记字节一致）、L99（`$>90\%$` 记号逐字一致）。locator 三处（递归执行 / 二分类剪枝 / §3 底层逻辑支撑）与笔记行号对应，`note:` 锚 `#21-…` 正确。
- 数字复核：L=3（L49「重复上述过程 $L=3$ 次」）、8 等分上采样（L47）、仅保留 s>τ（L45）均一致。
- 如实性核对：卡内「本卡三条证据全部来自笔记转述，arXiv 摘要不含 >90% 与 O(N_active) 表述」经 2026-11-02 抓取的摘要核实为真（摘要确无此二者），「论文声称、待回原文」状态标注诚实。PASS。

## 7. claim-njusparseocc-mgss-complexity-onquery-np — PASS

- Quote 核验：笔记侧 3/3 逐字存在（L55 痛点句含 `$O(N_{query} \cdot M_{voxel})$`、L61 采样句含 `**随机采样**`、L65 本质差异句含 `$O(N_{query} \cdot N_p)$`，LaTeX 记号逐字一致）；arXiv 摘要引文 1 条（"A mask-guided sparse sampling is designed to enable sparse queries to interact with 2D features in a fully sparse manner, thereby circumventing costly dense features or global attention."）于 2026-11-02 实抓 v5 页面逐字命中，source/locator（arXiv URL / § Abstract）标注如实。
- 如实性核对：卡内「摘要证实 MGSS 存在与动机，但摘要不含复杂度表达式，O(N_query·N_p) 仍只出自笔记」经抓取页核实为真；「笔记举例 96 个」（L61「如 96 个点」）、「N_p 正式取值与随机性控制未记录」限定均保留；本卡只立复杂度/算子形态窄主张、不立精度主张，与笔记无 MGSS 消融数字（核实 §2.2 确无）一致。PASS。

## 8. claim-njusparseocc-rayiou-penalizes-thick-surface — PASS

- Quote 核验：笔记侧 3/3 逐字存在（L83 指标影响句含弯引号 `“将表面预测得很厚”`、L81 深度阈值句含 `$|d_{pred} - d_{gt}| < \tau$（$\tau$ 设为 1m, 2m, 4m）`、L69 技术目标句）；arXiv 摘要引文 1 条（"Additionally, we design a thoughtful ray-based evaluation metric, namely RayIoU, to solve the inconsistency penalty along the depth axis raised in traditional voxel-level mIoU criteria."）于 2026-11-02 实抓 v5 页面逐字命中，source/locator 标注如实。
- 如实性核对：卡内「摘要只证实 RayIoU 动机表述，『加厚无法获利』的算子细节仍只出自笔记」经抓取页核实为真；scope 对聚合方式/软计分未记录、falsifiers 覆盖「实现非硬阈值判定」「加厚仍可获利」「两指标排序无差异」三条路径，均可操作。PASS。

---

## 六、笔记侧存疑点（均已有卡内/cross 覆盖，未另立 mismatch 卡，理由如下）

1. **HGSFusion.md Table 1 LXL 行 Pedestrian (RoI) 与 mAP (RoI) 同为 72.93**（L122）：无法在不回原文的情况下裁定是笔记转录错位还是论文原表如此（EMC2 案是「对照原文确认笔记错」后才立的 mismatch 卡）；本卡组已由 Cyclist 卡口径警告 2 + cross §6.3 记录为遗留问题并声明不采信该行。维持现状，待回原文。
2. **HGSFusion.md Table 5「提升幅度」列写 `+11.41%`**（L154）与分析句「11.41% 的跨越式提升」（L158）：按表内数字 15.68−4.27，该值实为百分点；此写法疑系论文原表自身的标注习惯（笔记按原文转录），单位澄清已由 Dark 卡 注意 1 完整承担，且笔记未引入超出原文的新错误。维持现状。
3. HGSFusion.md §1 头条「RoI AP 达到 88.28%」未注明是 Car 类：属歧义而非错误，已由 Cyclist 卡口径警告 1 + cross M3 覆盖。
4. NJU-SparseOcc.md L99「FPS 实现量级跃升」为修辞表述（对 BEVFormer 7.5 倍、对 FB-Occ 3.3 倍）：笔记本身按论文口径转述，不构成需修卡的错误；卡 5 已改为精确倍数。

## 七、抓取记录

- `https://arxiv.org/abs/2312.17118`（Fully Sparse 3D Occupancy Prediction），2026-11-02 抓取，页面当前版本 v5（arXiv:2312.17118v5），用于核对卡 5/7/8 的 3 条摘要引文与 35.1@15帧 佐证句，全部逐字命中。
- HGSFusion 卡 4 张的证据均只出自库内笔记（卡内 paper 字段如实标注「笔记未记录英文原题与 arXiv 号」），本次未抓取 HGSFusion 原文，回原文核对项维持卡片待验证清单。

## 八、修改文件清单

- `claims/claim-njusparseocc-rayiou34-fps17-beats-dense-baselines.md`（我的理解：量级 → 精确倍数）
- `claims/claim-hgsfusion-2d-spatial-mode-beats-3d.md`（我的理解：悬空引用 6.5/6.6 → 6.5）
- 本报告：`nightshift/qa/round2-hgsfusion-nju.md`
- 未触碰：library/、verified/refuted/stale 卡、任何 signoff、QUEUE.md、LOCK、RULES.md、AGENTS.md、TODO.md。
