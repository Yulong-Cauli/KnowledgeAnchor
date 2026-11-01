# library/ 笔记修复清单（2026-11-02 夜班汇总，供主人逐项处理）

- **用途**：把本次值班（挖矿 + QA round2 + verify）发现的所有 `library/` 笔记问题汇总成一份清单。Agent 不得修改 `library/`（nightshift/RULES.md 铁律 2），故全部条目在此等主人手工处理。
- **素材**：`nightshift/QUESTIONS.md`、`nightshift/qa/round2-*.md` 七份报告、`nightshift/verify/claim-qwt-r2-gate-nonregression.md`、四张 mismatch/质量卡（emc2 / omniquant / centernetpoints / sparseocc）。
- **行号说明**：每条的行号均已由本清单起草时对笔记文件逐条重新核实（grep/sed 实测），非凭 QA 报告转抄；QA 报告与卡作为来源一并注明。
- **编号**：F1–F29，按笔记排列；每条标注优先级 **P1**（影响数字正确性）／**P2**（影响引用与出处）／**P3**（排版与残留）。末尾附优先级总排序与「核实后无需修改」清单（防重复劳动）。
- **修复后同步动作**：F1/F2/F3、F23/F24 对应的四张卡，其 falsifier 均约定「笔记经用户同意修复后按已修复改写或删除」——修完笔记后请告知调度班次处理对应卡（Agent 不得删文件，处置方式由主人定）。

---

## 一、按笔记列出的问题

### 1. `library/Multimodal_Fusion/EMC2.md`

**F1（P1）§5.1 KITTI 对比表与 arXiv v1 原表不一致**
- 位置：`## 5.1 KITTI 数据集性能对比 (Table 1)` 表头 L134、PointPillar 行 L136、Second-IoU 行 L137、LoGoNet 行 L138、TED 行 L139、分析句 L142。
- 问题：三处不一致（对照 arXiv:2507.04123v1 Table 1）——①延迟列结构：笔记只有「Jetson 延迟 (ms)」单列，v1 分 A4000/Jetson 两列；PointPillar 的 41ms 实为 v1 的 **A4000** 延迟，其 Jetson 延迟是 **972ms**，快慢方向完全相反；②不存在数字：LoGoNet 行的 82.92（Car Hard）与 965ms 在 v1 中均不存在（v1：Car Hard 84.31、A4000 100ms、Jetson N/A）；③取错难度列：Second-IoU Cyclist Hard 71.23 实为 v1 的 Moderate 值（Hard 66.26），TED Car Hard 88.94 实为 Moderate 值（Hard 86.73）。分析句 L142 还把 965ms 复述为「LoGoNet 在 Jetson 上延迟高达 965ms」。
- 建议改法：先核对 ICCV 2025 camera-ready（CVF Open Access）确认笔记依据的版本；若确以 v1 为准，按 v1 重建表格（恢复 A4000/Jetson 两列）并改写 L142 分析句；修复前可在表头加「数字待核」注记。EMC2 自身行（L140：66.81 / 88.15 / 77.62 / 372.5）与 v1 一致，可保留。
- 来源：`claims/claim-emc2-note-table-mismatch.md`（quote 与本行号已核）；nightshift/RULES.md 质量标准引为先例。

### 2. `library/Quantization/OmniQuant.md`

**F2（P1）§4 实验 1 表头-数据列错配**
- 位置：表头行 L165「**表格：LLaMA-13B W2A16 PPL 对比**」；数据行 L169（RTN 6.8e4）、L170（GPTQ 44.01）、L171（AWQ 2.6e5）、L172（OmniQuant 9.72）。
- 问题：四个数字来自两个不同的列——RTN 6.8e4 是 LLaMA-**1-13B 逐通道 W2A16** 的值（v3 Table 1 逐通道块），而 GPTQ 44.01 / AWQ 2.6e5 / OmniQuant 9.72 是 **LLaMA-1-7B W2A16g128** 列的值。表头所指场景（13B 逐通道 W2A16）的论文值应为 RTN 6.8e4 / GPTQ 5.5e3 / OmniQuant 13.21，只有 RTN 抄对。另注意 9.72 是 v3 camera-ready 更新值（v1 同位 10.53）。
- 建议改法：表头改为「LLaMA-1-7B W2A16g128」并补该列 RTN 值 1.9e3；或整列换用 13B 逐通道原值 6.8e4 / 5.5e3 / 13.21。
- 来源：`claims/claim-omniquant-note-table-mismatch.md`（v1+v3 逐格核对，抓取 2026-11-02）；`nightshift/qa/round2-quant-fusion.md` OmniQuant 节。

**F3（P1）§4 实验 4 FP16 基线行与论文原表不符**
- 位置：`**模型**：LLaMA-13B` L215、表头 L217、显存行 L221「~26 GB / 7.0 GB / 节省 ~73%」、速度行 L222「~40 tokens/s / 91.3 tokens/s / 加速 > 2倍」。
- 问题：论文 Table 3（p.9）FP 行 13B 列为 WM 24.3 GB / RM 27.1 GB / 52.5 tokens/s（v1 与 v3 一致）。笔记 ~26 GB 介于 WM 与 RM 之间属含糊取整；~40 tokens/s 与「加速 > 2倍」为笔记自算误差——同口径实际加速 91.3/52.5 ≈ 1.74×，显存节省按 WM 口径约 71%。量化侧 7.0 GB / 91.3 tokens/s 与原表一致，问题只在基线行。
- 建议改法：基线行改为 WM 24.3 GB / RM 27.1 GB / 52.5 tokens/s，加速改「约 1.74×」，节省改「约 71%（WM 口径）」。
- 来源：同 F2 卡；`nightshift/qa/round2-quant-fusion.md`（91.3/52.5=1.739 复验）。

**F4（P3）两处乱码（U+FFFD 替换字符）**
- 位置：L321「……权重矩阵里都有离群\uFFFD\uFFFD。」；L365「……（Calibration Data），\uFFFD\uFFFD如 100-200 个场景……」。
- 问题：乱码字符（QA 报告记作「离群??」「??如」）。
- 建议改法：疑为「离群值」「例如」，请主人按上下文定稿。
- 来源：`nightshift/qa/round2-quant-fusion.md` 遗留问题 1（行号已核实）。

### 3. `library/Multimodal_Fusion/HGSFusion.md`

**F5（P1）§4.1 Table 1 LXL 行 Pedestrian 与 mAP 同值**
- 位置：L122 `| LXL | R+C | 72.18 | 72.93 | 88.31 | 72.93 |`。
- 问题：Pedestrian (RoI) 与 mAP (RoI) 两列同为 72.93，无法在不回原文的情况下裁定是笔记转录错位还是论文原表如此（同表其他行无此现象）。
- 建议改法：回 HGSFusion 论文原表（论文 arXiv 号笔记未载，需先定位原文）核对后修正；核对前建议在该行加注「待核，暂不采信」。另注：笔记头部亦缺论文英文原题与 arXiv 号，可一并回填。
- 来源：`nightshift/qa/round2-hgsfusion-nju.md` 六.1；`nightshift/cross/4d-radar.md` §6.3。

**F6（P1）§4.4 Table 5「+11.41%」实为百分点**
- 位置：Dark 行 L154 `**+11.41%**`；分析句 L158「11.41% 的跨越式提升」。
- 问题：按表内数字 15.68−4.27=11.41，该值是百分点（percentage point）而非相对百分比。QA 判断此写法疑系论文原表自身的标注习惯（笔记按原文转录，未引入新错误），故不改数字、只加注。
- 建议改法：表后加注「表内‘+11.41%’按数字实为 +11.41 个百分点」。
- 来源：同报告六.2；claim-hgsfusion-dark-scene-gain-dominates 卡「注意 1」。

**F7（P2）§1 头条 88.28% 未注明是 Car 类**
- 位置：L15「在 VoD 数据集上 RoI AP 达到 88.28%」。
- 问题：88.28% 是 Car 类 RoI AP；全类 mAP (RoI) 为 62.61（L123），直接引用易误读为全类 mAP。
- 建议改法：L15 补「（Car 类）」。
- 来源：同报告六.3；`nightshift/cross/4d-radar.md` M3。

### 4. `library/3D_Occupancy/EchoFusion.md`

**F8（P1·决策项）论文自身数字不自洽（正文 0.03 vs Table 6 实差 0.45）**
- 位置：笔记本身无可改行——已 grep 全文，0.03 / 84.92 / 84.47 均不在笔记中（§3 实验表 L76-L96 只收录 RADIal 主对比与 mAP/NDS 消融）。
- 问题：论文正文称 RT+C 的 BEV AP "only 0.03 less than LiDAR"，但 Table 6 数字 84.92 vs 84.47 实差 0.45，疑似论文笔误。
- 建议改法：由主人拍板是否另立一张「论文声称/数字不自洽」的 claim 卡（QUESTIONS #4 的原案）；若后续笔记补录该对比，需把两处数字并列并注明矛盾。
- 来源：`nightshift/QUESTIONS.md` #4；`nightshift/LOG.md` L12（01:21 EchoFusion 审计行）。

### 5. `library/Classical_Detection/FCOS.md`

**F9（P2）Figure2 图注「后续实验」无出处**
- 位置：L22-24 图注 div（文字行 L23）「注意：关于 Center-ness 的归属问题，后续实验证明，将其移到回归分支后，AP 进一步提升」。
- 问题：该结论在笔记中无出处（原论文/扩展版/第三方未注明），系笔记作者转述（橙色注释 div）。相关 claim 卡已因此降级为四张 FCOS 卡中证据最弱。
- 建议改法：回原论文核对该结论原始出处（章节/表号）后补 locator；核对不到则加注「转述，出处待核」。
- 来源：`nightshift/qa/round2-classical.md` 遗留问题 1；claim-fcos-centerness-regression-branch-ap-gain 的 scope 降级处理。

### 6. `library/3D_Occupancy/RadarOcc.md`

**F10（P2）缺实验章节**
- 位置：全篇顶层只有 `## 1. 概述`（L9）与 `## 2. 方法`（L17），方法止于 L155「3D 占据解码与损失函数」小节；无实验/结论章节。
- 问题：4 张 RadarOcc 卡因此全部立为窄卡（无性能主张）；若论文有 SSS/DBD/S2C 消融表，补章节后可另立性能卡。
- 建议改法：经主人同意后按论文补「§3 实验」章节（数字带章节 locator，表格逐格对抄）。
- 来源：`nightshift/QUESTIONS.md` #11；`nightshift/qa/round2-radarocc-r4det.md`（cross M5「笔记止于损失函数小节」属实）。

**F11（P3）小节编号混乱（两种风格 + 嵌套重号）**
- 位置：§2 下四个方法小节用「1、2、3、4、」风格（L19 / L54 / L98 / L155）；S2C（L98）内部又用「1.–6.」重新起号（L102 / L109 / L116 / L128 / L145 / L151），与顶层章节号冲突。
- 建议改法：统一为「### 2.1 …」至「### 2.4 …」，S2C 内部改「#### 2.3.1 …」式；改动会影响既有卡 `note:` 锚（如 `#2-方法-数据减量` 类），改后需同步核对 4 张 RadarOcc 卡的锚点。
- 来源：`nightshift/qa/round2-radarocc-r4det.md`（locator 核对过程可见层级）；行号本次核实。

### 7. `library/Quantization/VQ-Map.md`

**F12（P2）头部缺 arXiv 号**
- 位置：三行头部 L3-L5（出处会议 NeurIPS 2024 / 开源链接 / 关键词），全文无 arXiv 号（grep 0 命中）。
- 问题：QA 本轮已经仓库 README 确认 arXiv id 为 **2411.01618**，四张 VQ-Map 卡已补入该 id 与论文证据，但笔记头部仍缺。
- 建议改法：头部「出处会议」行补「arXiv:2411.01618」。
- 来源：`nightshift/qa/round2-quant-fusion.md` VQ-Map 节；`nightshift/QUESTIONS.md` #12。

**F13（P3）L62 配图为失效本地路径**
- 位置：L62 `![Figure4](D:\Research\Notes\assets\VQ-Map\Figure4.png)`。
- 问题：Windows 本地绝对路径（`D:\`），库内不可达，违反「配图放 `assets/<论文名>/`」约定。
- 建议改法：`library/assets/VQ-Map/Figure4.png` 已存在，直接改为 `../assets/VQ-Map/Figure4.png`（或仓库 raw URL，与 FCOS/CornerNet 等笔记同式）。
- 来源：`nightshift/qa/round2-quant-fusion.md` 遗留问题 1（行号已核实；assets 目录已确认存在同名文件）。

**F14（P3）L105 乱码「细\uFFFD\uFFFD度」**
- 位置：L105 §4.1 分析行「VQ-Map 在复杂、细\uFFFD\uFFFD度的类别……」（实测为两个 U+FFFD 替换字符）。
- 建议改法：疑为「细粒度」，请主人定稿。
- 来源：同 F4 报告遗留问题 1；`nightshift/QUESTIONS.md` #12。

### 8. `library/ADe2e/BEV-Planner.md`

**F15（P2）三行头部「是否开源」未做二级确认**
- 位置：L3「**是否开源：** 开源，https://github.com/NVlabs/BEV-Planner （摘要原文……）」。
- 问题：GitHub README 抓取超时（raw.githubusercontent.com 不可达），目前仅以 arXiv 摘要原句为据。
- 建议改法：主人访问该仓库确认后，把依据改为「已确认」或补 README 引文。
- 来源：`nightshift/QUESTIONS.md` #1。

**F16（P2）§3.1 输入分辨率 256×704 待对 PDF**
- 位置：L48「输入分辨率 256×704（原文 LaTeX 注记 `256\!\times\!704`……HTML 渲染版此处有 mphantom 缺字 bug，以 alttext 为准）」。
- 问题：LaTeXML 渲染有 mphantom 缺字 bug，按 alttext 记录的 256×704 可能有误。
- 建议改法：对照官方 PDF 确认后，视结果保留或修正，并去掉「待确认」性质注记。
- 来源：`nightshift/QUESTIONS.md` #2。
- （另：L157 Appendix B 轨迹平滑度表与 Table 1 的 L2 出入，笔记已自注「照抄附录原表」，属论文自身两表差异，**无需修改**——见 round2-bevplanner.md 其他观察 2。）

### 9. `library/Classical_Detection/CaDDN.md`

**F17（P2）§4 消融全节无数据集 / AP 口径标注**
- 位置：`## 4. 消融实验` L178 起；Table 3 行 L186-L190（+1.5% / +10.4% / +0.6~1% / +3.17%），Table 4 行 L202-L204（+2.97% / +2.96%），结论列表 L206-L209。
- 问题：全节无数据集名称与 AP 指标版本标注，全部数字只能作为「论文自报相对增量（Δ AP）」引用。
- 建议改法：回原文补注数据集与指标口径（建议加在 §4 首行或各表 caption）。
- 来源：`nightshift/qa/round2-classical.md` 卡 5-8 的 caveat 记录（「经查笔记 §4 确实全文无数据集/AP 口径标注」）。

### 10. `library/Classical_Detection/R4Det.md`

**F18（P2）密集伪标签源记录含糊（「如 Metric3D」）**
- 位置：L52「与视觉基础模型（如 Metric3D）生成的密集伪真值深度 $d_{g}^{dense}$ 之间的偏差」。
- 问题：「如」表明 Metric3D 只是示例，实际实验所用基础模型笔记未记录；相关卡已把原「监督源是 Metric3D 伪标签」的事实性表述改为如实转述。
- 建议改法：回原文确认后补记实际所用基础模型。
- 来源：`nightshift/qa/round2-radarocc-r4det.md` 卡 5（FIXED）与遗留问题。

**F19（P3）§2.1 下属小节与顶层章节号重号**
- 位置：L71 `### 1. 三重监督的实验支撑`、L79 `### 2. $\mathcal{L}_{prob}$ 与 $\mathcal{L}_{found}$ 的非重复性推导`（均位于 §2.1，L23 之下）。
- 问题：「### 1. / ### 2.」与顶层 §1/§2 重号，locator 书写易混。QA 判定为结构瑕疵、不判错（现有卡的 locator 写「§2.1【…】」无歧义）。
- 建议改法：改为「#### 2.1.1 / #### 2.1.2」式；改后同步核对 claim-r4det-pdf 卡的 `note:` 锚 `#1-三重监督的实验支撑`。
- 来源：同报告「其他观察」2；行号本次核实。

### 11. `library/Quantization/QwT.md`

**F20（P2）L101「保证不劣于 PTQ」表述强于论文原文**
- 位置：L101「**意义**：这一机制确保了 QwT 在最坏情况下也不会比原始 PTQ 模型差，提供了“无痛”的技术保障。」
- 问题：verify 核对结论——这是笔记作者的概括（gloss），论文原文（CVPR 2025 p.4465）的「理论上不会更差」只覆盖「W=b=0 置零」分支；R²>0 分支的「不劣于」仅在校准集意义下有定义，论文补充材料 Table 4（LLaMA3）自带逐数据集小幅退化实例（BoolQ −0.03、HellaSwag −0.51）。
- 建议改法：在 L101 加限定，如「该保证在 R²≤0 置零分支上无条件成立；R²>0 分支的不退化仅在校准集意义下成立，测试集为经验观察（详见 verify 报告）」，或标注此句为笔记概括而非论文原话。
- 来源：`nightshift/verify/claim-qwt-r2-gate-nonregression.md` §1 E9、§2 分析、§4 建议 1/3。

### 12. `library/Multimodal_Fusion/Ali-BEVFusion.md`

**F21（P3）H1 标题笔误「AIi-BEVFusion」**
- 位置：L1 `# AIi-BEVFusion`（第二字符为大写 I）。
- 问题：与文件名 `Ali-BEVFusion.md` 及库内全部引用不一致。
- 建议改法：改为 `# Ali-BEVFusion`。
- 来源：`nightshift/qa/round2-ali-mq-lingoqa.md` 遗留问题 1。

**F22（P3）23 处网页抓取残留（19 行句尾数字 + 4 行裸「+1」）**
- 位置与内容（本次全文扫描清单，行号实测）：
  - 句尾孤立数字：L11（1111）、L21（2222）、L29（3）、L37（4444444）、L43（5）、L53（6）、L59（7）、L67（8）、L73（9999）、L81（10）、L89（11111111）、L97（12）、L105（13131313）、L113（14141414）、L119（15151515）、L127（16）、L137（17171717）、L147（18）、L155（19 与 20 两个）。
  - 裸「+1」独立行：L13、L23、L75、L91。
- 问题：均为网页转贴的引用编号/列表残留，无语义；不影响数字内容（QA 确认 4 张 Ali 卡 quote 均已避开）。
- 建议改法：删除全部 23 处。
- 来源：`nightshift/qa/round2-ali-mq-lingoqa.md` 卡 1-2（falsifier 提及 1111/9999/+1）＋本次补全扫描。

### 13. `library/Classical_Detection/CenterNet：Objects as Points.md`

**F23（P3）三处孤立引用编号残留**
- 位置：L160「……通常需要 Soft-NMS 来进一步清理 17。」；L161「……无需后处理 18181818。」（[18]×4）；L171「……几乎可以忽略不计 20。」。
- 问题：网页复制残留（QA 正则扫描确认恰三处；L50「位置为 1」为正常内容，勿动）。
- 建议改法：删除三处句尾编号。修复后按 falsifier 改写/处理 `claims/claim-centernetpoints-note-citation-artifacts.md`。
- 来源：该卡；`nightshift/qa/round2-sparseocc-surroundocc-centernet.md` §四.12。

### 14. `library/3D_Occupancy/SparseOcc.md`

**F24（P3）L123 残留对话式问句**
- 位置：L123（`### 总结：公式如何体现"Sparse"？` 小节末行，L114 起）「**你会发现这本质上是一个“由面及点”的过程……关于损失函数中如何利用匈牙利匹配（Hungarian Matching）来训练这套流程，需要细讲吗？**」
- 问题：AI 对话残留，非笔记正文内容；不含数字，不影响三张 SparseOcc 卡 evidence。
- 建议改法：删除该行或改写为陈述句。修复后按 falsifier 处理 `claims/claim-sparseocc-note-conversational-residue.md`。
- 来源：该卡；同报告 §四.13。

**F25（P3）§2.4 下小节编号与顶层章节号重号**
- 位置：§2.4（L51）下的小节 L63 `### 2. Masked Attention（掩码注意力层）`、L79 `### 3. Self-Attention（自注意力层）`、L87 `### 4. FPN 与多尺度循环`、L94 `### 5. 最终预测`，与顶层 `## 3. 损失函数`（L127）、`## 4. 实验结果`（L140）重号。
- 问题：结构瑕疵，仅影响 locator 书写习惯；本次未影响任何卡的 locator。
- 建议改法：改为「#### 2.4.1–2.4.4」式；改后同步核对三张 SparseOcc 卡与相关卡的 `note:` 锚。
- 来源：同报告 §四.13「另记」；行号本次核实。

### 15. `library/Classical_Detection/PointNet & PointPillars.md`

**F26（P2）缺三行头部；标题层级不合约定**
- 位置：L1 `# PointNet` 直接进正文，全文无「出处会议 / 是否开源 / 关键词」三行（grep 0 命中）；PointPillars 半篇标题为 L92 `#  PointPillars`（井号后双空格），一文件两个 H1。
- 问题：违反库内 L1 笔记三行头部约定（nightshift/RULES.md 质量标准）；出处/开源信息缺失影响引用。
- 建议改法：文首补三行头部（PointNet：CVPR 2017 / 开源 https://github.com/charlesq34/pointnet / 关键词；PointPillars：CVPR 2019 / 开源 https://github.com/nutonomy/second.pytorch 等——具体以主人核对为准，勿凭记忆定稿）；`#  PointPillars` 双空格顺手修正，或降为 `##`。
- 来源：nightshift/RULES.md 质量标准 + 本次核实（七份 QA 报告未列此项，为起草时对照约定补查）。

**F27（P3）三处残留**
- 位置：L5「如果把点云数据重新排列），它代表的形状……」多余右括号；L233「……来学习离散化的方向 10。」句尾残留"10"；L252 代码注释「(x, y, z, w, l, h, theta) [cite: 230]」网页引用残留。
- 建议改法：删「）」、删句尾"10"、删 `[cite: 230]`。注意 L233 的"10"已按「逐字保留」原则进入 claim-pointnetpillars-direction-classifier-sine-flip 卡的 quote——改笔记后该卡 quote 需同步更新。
- 来源：`nightshift/qa/round2-classical.md` 遗留问题 3 与卡 13。

### 16. `library/Classical_Detection/CornerNet.md`

**F28（P3）L21 加粗标记内尾随空格**
- 位置：L21「使用 **Hourglass Network ** 作为骨干网络……」（双星号内有一个空格）。
- 问题：排版瑕疵；卡 quote 已逐字保留该空格，若修正笔记需同步更新 claim-cornernet-single-scale-no-fpn 卡的 quote。
- 来源：`nightshift/qa/round2-classical.md` 卡 12。

### 17. `library/Quantization/MQBench.md`

**F29（P3）§5.3 首句「3.2 节」指代易混**
- 位置：L198「**5.3 BN 融合的照妖镜**：验证了 3.2 节的各 BN Folding 策略。……」。
- 问题：「3.2 节」是论文原文节号；笔记自身对应小节为 §2.2，初读易误认为笔记内部引用。
- 建议改法：改为「论文 §3.2（对应本笔记 §2.2）」。
- 来源：`nightshift/qa/round2-ali-mq-lingoqa.md` 遗留问题 3。

---

## 二、范围外提示（非笔记正文，未计入 F 编号）

1. `library/assets/COTR/Table4.png` 内容实为论文 HTML v2 的 Table 3，PDF 与 HTML 表号疑整体错位一位——回填 COTR 配图前对照官方 PDF 确认映射（QUESTIONS #10）。
2. `library/README.md` 的 ADe2e 小节：建议表格行已备好（`nightshift/suggestions/library-README-ADe2e.md`），等主人同意后手动合并（QUESTIONS #3）。
3. 草稿/TODO 类笔误与版本歧义（ShuffleNet 出处、MobileNet V2/V3 ar5iv 歧义、OpenDriveVLA 标题、Alpamayo-R1 文件名、BRECQ）：见 QUESTIONS #5-#9，涉及 `nightshift/drafts/` 与 TODO.md，不在本清单范围。

## 三、核实后无需修改（防止重复劳动）

- RadarDistill「AFD 的教学」标签：论文公式 (9)-(10) 证实监督本就由 AFD 损失承担，**不是**笔误（round2-quant-fusion.md）。
- NJU-SparseOcc L99「FPS 实现量级跃升」：修辞表述（对 FB-Occ 3.3×、对 BEVFormer 7.5×），笔记按论文口径转述；卡 5 已改为精确倍数（round2-hgsfusion-nju.md 六.4）。
- BEV-Planner L157 Appendix B 表与 Table 1 的 L2 出入：笔记已自注「照抄附录原表」，论文自身两表差异（round2-bevplanner.md 其他观察 2）。
- CenterNet L50「位置为 1」：正常内容，非引用残留（round2-sparseocc-surroundocc-centernet.md §四.12）。
- RCBEVDet、RadarDistill、LingoQA、SurroundOcc、MQBench、CornerNet 的数字与 quote：本轮 QA 未发现事实错误。

## 四、优先级总排序（影响数字正确性 > 影响引用 > 排版）

**P1（6 项，先处理——引用这些数字前一律回论文原表核对）：**
| 序 | 条目 | 一句话 |
| --- | --- | --- |
| 1 | F1 | EMC2 §5.1 表格错位/反向延迟（L132-142） |
| 2 | F2 | OmniQuant 实验 1 表头混列（L165-172） |
| 3 | F3 | OmniQuant 实验 4 FP16 基线失实（L217-222） |
| 4 | F5 | HGSFusion LXL 行 72.93 重复（L122，待回原文） |
| 5 | F6 | HGSFusion +11.41% 实为百分点（L154/L158，加注） |
| 6 | F8 | EchoFusion 论文自身 0.03 vs 0.45（决策：是否立卡） |

**P2（10 项，影响引用与出处）：**
| 序 | 条目 | 一句话 |
| --- | --- | --- |
| 1 | F7 | HGSFusion §1 88.28% 未注 Car 类（L15） |
| 2 | F9 | FCOS 图注「后续实验」无出处（L23） |
| 3 | F10 | RadarOcc 缺实验章节（全篇） |
| 4 | F12 | VQ-Map 缺 arXiv 号（头部） |
| 5 | F15 | BEV-Planner 开源状态未二级确认（L3） |
| 6 | F16 | BEV-Planner 256×704 待对 PDF（L48） |
| 7 | F17 | CaDDN §4 无数据集/AP 口径（L178-209） |
| 8 | F18 | R4Det 伪标签源「如 Metric3D」（L52） |
| 9 | F20 | QwT L101 保证表述强于论文 |
| 10 | F26 | PointNet&PointPillars 缺三行头部（L1/L92） |

**P3（13 项，排版与残留，可批量处理）：**
| 序 | 条目 | 一句话 |
| --- | --- | --- |
| 1 | F4 | OmniQuant 乱码 ×2（L321/L365） |
| 2 | F11 | RadarOcc 小节编号混乱（L19-155） |
| 3 | F13 | VQ-Map 失效图片路径 D:\（L62） |
| 4 | F14 | VQ-Map 乱码「细??度」（L105） |
| 5 | F19 | R4Det §2.1 子节重号（L71/L79） |
| 6 | F21 | Ali-BEVFusion H1「AIi」笔误（L1） |
| 7 | F22 | Ali-BEVFusion 抓取残留 ×23（L11-L155） |
| 8 | F23 | CenterNet 残留编号 ×3（L160/L161/L171） |
| 9 | F24 | SparseOcc 对话式残留（L123） |
| 10 | F25 | SparseOcc §2.4 子节重号（L63-L94） |
| 11 | F27 | P&P 残留 ×3（L5/L233/L252） |
| 12 | F28 | CornerNet 双星内空格（L21） |
| 13 | F29 | MQBench「3.2 节」指代（L198） |

**合计**：17 篇笔记、29 条问题（P1×6、P2×10、P3×13）。涉及笔记修改后需同步卡片 quote/锚点的：F23、F24、F26、F27、F28（quote 或 note 锚直接含待改文本）与 F11、F19、F25（章节锚点）。所有修改完成后建议重建索引（`node tools/ka.mjs index` 由调度班次执行）。
