# QA round2 复审报告：Ali-BEVFusion / MQBench / LingoQA

- 日期：2026-11-02
- 复审人：nightshift 子代理（QA|round2）
- 对象：任务清单所列 11 张 claim 卡（Ali-BEVFusion 4 + MQBench 4 + LingoQA 3）
- 方法：每张卡的全部 evidence quote（共 33 条）用 `grep -F` 做逐字匹配（全角标点、行内空格、`$...$` LaTeX、表格竖线与加粗标记逐字比对；"library/QA dataset/LingoQA.md" 路径含空格、一条 quote 以 `-` 开头，两处 shell 陷阱已用引号与 `--` 规避后重验）；locator 对照笔记各节标题逐个核算；数字（96.6 / 60.8 / 59.6、48.40 / 59.20 / 60.80、0.993 / 0.950、10.5 s、1-2%、9 epochs、35.8 / 1.2 / 1.6 / 12 / 22 / 38.8 等）回源笔记复推；口径 caveat 逐项检查；Ali 卡对 `nightshift/drafts/MIT-BEVFusion.md` 的 4 处交叉引用逐条回草稿核对；另对两篇笔记头部"出处会议"做外部 arXiv 抽查（见"五、外部抽查"）。

**结果分布：PASS 11 / FIXED 0 / ISSUED-MISMATCH 0。未发现 quote 失真、locator 错位或数字不一致，未修改任何卡（11 张全部 status: asserted、signoff: null 原样未动），未另立 mismatch 卡。**

11 张卡 `note:` 路径全部可解析（含含空格的 "library/QA dataset/LingoQA.md"）；`related` 交叉引用全部存在（Ali 4 卡互链 + 指向 claim-ptqat-w8a8-tensorrt-accuracy-recovery；LingoQA 3 卡互链）；卡内引用的 EMC2 前车之鉴卡（claim-emc2-note-table-mismatch）存在。

---

## 一、Ali-BEVFusion（对照 library/Multimodal_Fusion/Ali-BEVFusion.md，15 条 quote 全部逐字命中）

### 1. claim-alibevfusion-camera-stream-lidar-independent-bev — PASS

- Quote 验证：4 条逐字命中（§1 独立 BEV 句——行尾"1111"抓取残留未入 quote、`CB-Swin-Tiny` 句含反引号、深度分类预测句、S2C 4D→3D 句）。
- locator：「§1 摄像头流 (Camera Stream)」对应 `### 1. 摄像头流 (Camera Stream)`；note 锚点 `#1-摄像头流-camera-stream` 与 GitHub 锚点规则一致。
- 数字/机制：FPN + ADP（自适应平均池化 + 1×1 卷积）、四层 3×3 卷积逐层降通道、伪体素 $V \in R^{X \times Y \times Z \times C}$ 与笔记 §1 各条目一致。
- Caveat：scope 如实保留「'独立'指融合前的信息流……不含第二阶段联合训练带来的耦合，也不外推相机故障/退化场景的鲁棒性」；falsifier #3 明示笔记为网页转贴（1111/+1 残留确在 §1）。MIT 版对照段引用 `nightshift/drafts/MIT-BEVFusion.md` §2.2（LSS 显式深度散射 + BEV pooling、预计算 + interval reduction）回草稿核实无误，并明确「勿跨文比较速度」。
- 外部旁证（不改变 asserted 状态）：arXiv:2205.13790 摘要（2026-11-02 抓取）明言 camera stream "does not depend on the input of LiDAR data"，与卡方向一致。

### 2. claim-alibevfusion-lidar-stream-backbone-compatible — PASS

- Quote 验证：3 条逐字命中（兼容三骨干句含反引号与顿号、转 BEV 句、参数化体素化 + 3D 稀疏卷积句；§2 行尾"9999"残留确在，falsifier 已声明）。
- locator：「§2 激光雷达流 (LiDAR Stream)」对应 `### 2. 激光雷达流 (LiDAR Stream)`；锚点正确。
- Caveat：scope 明确「笔记只有一句兼容性表述加两句流程描述，没有任何骨干维度的实验表……不主张'三种骨干均有实测数字/实测收益'」——与笔记实况一致；卡内对 §4 检测头通用性的转述（Anchor-based / Anchor-free / Transformer）与笔记 §4 一致；MIT 版骨干用法对照（Swin-T + VoxelNet）回草稿 §2.4 核实无误。

### 3. claim-alibevfusion-dynamic-fusion-se-channel-attention — PASS

- Quote 验证：5 条逐字命中（SE 启发句、拼接句、3×3 静态融合句——注意笔记原文 `（静态融合函数 $f_{static}$ ）` 顿号前有一个空格，quote 逐字保留未"纠正"，正确；GAP + 1×1 + Sigmoid 句；融合公式 LaTeX 逐字）。
- locator：「§3 动态融合模块 (Dynamic Fusion Module)」对应 `### 3. 动态融合模块 (Dynamic Fusion Module)`；锚点正确。
- Caveat：scope 首句即「与 MIT Han Lab 的 ICRA 2023 版同名不同作」，消歧如实保留；scope「本次均未能抓取核验」论文原文与仓库的诚实声明保留。卡内「MIT 版草稿已核对其抓取的 HTML v3 正文未引用阿里版」回草稿 §4 结论 5 核实一致；「MIT 版用卷积 BEV encoder 补偿局部错位、不设通道注意力」与草稿 §2.3 一致。

### 4. claim-alibevfusion-two-stage-9epoch-joint-fusion-training — PASS

- Quote 验证：3 条逐字命中（两流独立训练句、9 epoch 联合融合句、BEV 空间增强句）。
- locator：「§4 检测头与训练策略 (Detection Head & Training)」对应 `### 4. 检测头与训练策略 (Detection Head & Training)`；锚点正确。
- 数字：9 epochs 仅指第二阶段、第一阶段 epoch 数笔记未载——scope 已限定；falsifier #2 引 EMC2 表格错位先例且所引卡存在。
- Caveat：「笔记 §4 没有任何实验数字（9 epochs 无对照、无消融），本卡只描述协议本身」保留完好。

---

## 二、MQBench（对照 library/Quantization/MQBench.md，7 条 quote 全部逐字命中）

### 5. claim-mqbench-first-hardware-aligned-quant-benchmark — PASS

- Quote 验证：2 条逐字命中（「是**首个真正面向工业级落地……框架**。」整句含首尾加粗标记；软/硬件两层面拉齐句为笔记 L13 长句的逐字中段截取）。
- locator：「§1 / 概述」对应 `## 1. 概述`；锚点 `#1-概述` 正确。
- Caveat：scope「笔记未记录论文实验的具体数据集/模型清单」与笔记实况一致；卡内正确区分"论文声称 / 笔记转述"（待验证第 3 条直指『首个』可能为笔记作者概括而非论文原文措辞）。

### 6. claim-mqbench-three-hardware-graph-settings — PASS

- Quote 验证：2 条逐字命中（TensorRT 图句、SNPE 强绑定 Scale 句——含 `**Scale（缩放因子）必须强行绑定为一致**` 加粗标记逐字）。
- locator：「§2.3 / 残差拓扑三图解析」对应 §2.3 内加粗块「**3 张核心拓扑图解析（以残差结构为例）：**」——子标签为压缩转写而非逐字标题，但该块在 §2.3 内唯一、无歧义，判为定位正确。
- 数字/机制：三类设定（学术 / TensorRT 式 Add 高精度累加 / SNPE 式 Conv+ReLU 物理融合 + 双分支 INT8 + Scale 绑定一致）与笔记三图逐项一致；scope「笔记未记录其余算子类型是否覆盖」如实。
- Caveat：主张限定「以残差拓扑为例的三类设定」保留完好。

### 7. claim-mqbench-snpe-tied-scale-accuracy-collapse — PASS

- Quote 验证：1 条逐字命中（5.2 整句，含"断崖式暴跌"与"证明了脱离硬件谈量化毫无意义"）。
- locator：「§实验部分 / 5.2」对应实验部分加粗条目「**5.2 硬件图约束的残酷审判**」；锚点 `#实验部分` 正确。
- Caveat：scope「笔记未记录具体数据集、模型清单与比特宽度（笔记另记 4-bit 测试见 §5.4，与本条分开）」——5.4 确在且为 4-bit 测试，切割正确；卡内明确"大部分算法""断崖式"是笔记转述的定性表述、只能作方向性结论。

### 8. claim-mqbench-bn-folding-figure-e-zero-drop — PASS

- Quote 验证：2 条逐字命中（§2.2 正确做法句；5.3 整句含 `**图(e) 策略**`（双星号内有一空格，逐字保留）与 `**Zero Drop（零掉点）**`）。
- locator：「§2.2 / 正确做法」对应「**正确的做法（MQBench 及工业界标准，图3-e）：**」；「§实验部分 / 5.3」对应「**5.3 BN 融合的照妖镜**」。
- 数字/机制：图3-e 乘法路径（折叠后伪量化、承担真实量化误差）/ 加法路径（逆缩放接入正常 BN、保留稳定梯度）与笔记 §2.2 图(e) 解析一致；图(b) 不收敛、图(c)(d) 1-2% 精度差与 5.3 一致；scope 如实声明「笔记未记录论文实验的数据集、模型与比特宽度；'1-2%' 与 'Zero Drop' 为笔记转述数字」。
- Caveat：Zero Drop 的含义界定（训练/模拟 vs 部署之差为零，非相对 FP32 无损）保留完好。

---

## 三、LingoQA（对照 "library/QA dataset/LingoQA.md"，11 条 quote 全部逐字命中；表格拆行引用行归属逐条核对）

### 9. claim-lingoqa-7b-baseline-matches-gpt4v — PASS

- Quote 验证：4 条逐字命中（§5.2 分数梯子表的人类 / 基线 / GPT-4V 三行——竖线、加粗、全角逗号逐字；§5.2 结论第 1 条含"≈"与分号结尾）。
- 行归属（重点 3）：三条行 quote 分别取自 96.6 / 60.8 / 59.6 行，locator 标注「·人类行 / ·基线行 / ·GPT-4V 行」全部正确，未与同表易混行 81.8（人类单帧）、57.0（基线单帧）混淆。
- 数字：60.8 vs 59.6（差 1.2，falsifier 内一致）、96.6（差 35.8）、纯文本 Vicuna 下界 38.8（视觉增量 22 分复推一致）、BLEU 6.30 vs 微调组 15.00（§5.4）均与笔记一致。
- Caveat：scope 完整（评测集 1000 条、5 帧口径、两阶段微调、Table 5 论文自报）；卡内三条限定（同源裁判"考生适应考官"循环性、零样本 vs 领域微调口径、语言先验底数）保留完好。

### 10. claim-lingoqa-late-fusion-beats-early-mid — PASS

- Quote 验证：4 条逐字命中（§4.3 Table 4 摘录 early / mid / late 三行 + 解读句——加粗标记与全角括号逐字）。
- 行归属（重点 3）：early 行 48.40、mid 行 59.20、late 行 **60.80** 与 locator「·early 行 / ·mid 行 / ·late 行」一一对应，无错位。
- 数字：late−mid = 1.6、late−early = 12.4（笔记作"**12 分差距**"，卡沿笔记以 12 分引用）复推一致。
- Caveat：卡内明确「late 与 mid 只差 1.6 分，接近噪声量级——说服力弱于 early 崩溃」「论文未报告方差/多种子重复」「结论绑定 5 帧 @1Hz 与 Q-Former 架构」——限定保留完好；scope 的三种融合定义与笔记表逐项一致。

### 11. claim-lingoqa-lingo-judge-spearman-0950 — PASS

- Quote 验证：3 条逐字命中（相关性实验设计第 4 条含"0.993 / 0.950""Fisher 变换""最紧"；架构·输出条目含"∈ [0, 1]"与"→"；合理性检查句）。
- locator：「§2.4 / 相关性实验设计第 4 条」「§2.4 / 架构·输出」「§2.4 / 合理性检查」均对应 §2.4 内相应加粗块与列表项。
- 数字：Pearson 0.993 / Spearman 0.950、GPT-4 裁判 0.941/0.932（§2.3 表）、1000 条 = 100 场景 / 500 题 / 每题 2 参（§3.5）、15 个模型（Model A~O）、FUYU 45.4 vs 人类 17.69、held-out 二分类 95% 均与笔记一致。
- Caveat：scope 完整（模型级排序相关、DeBERTa-V3 + LoRA、对 2 条参考取 max、单张 A100）；卡内三条限定（0.950 为 15 点模型级相关而非样本级、裁判与标注同源的分布内自证隐患、仅该基准 1000 条上成立）保留完好。

---

## 四、结论与卡片完整性

- 11/11 卡 status: asserted、signoff: null，本次未做任何修改——quote / locator / 数字 / caveat 四项检查均无需修卡。
- 全部 33 条 evidence quote `grep -F` 逐字命中，未发现弯引号 / 全角字符 / 空格层面的失真；Ali 卡对笔记行尾抓取残留（1111 / +1 / 9999 等）一律避开未纳入 quote，与各卡 falsifier 的声明一致。
- LingoQA 表格拆行引用的行归属全部正确（含与同表易混行 81.8 / 57.0 的区分）。
- 口径 caveat 三项重点（Ali-MIT 同名不同作消歧 / MQBench"笔记未记录完整标题与实验口径"限定 / LingoQA 行归属）全部如实保留。
- 未发现需要另立 mismatch 卡的笔记事实错误。

## 五、外部抽查（非卡片证据，仅校验两篇笔记头部"出处会议"）

- arXiv:2205.13790（2026-11-02 抓取 https://arxiv.org/abs/2205.13790 ）：BEVFusion: A Simple and Robust LiDAR-Camera Fusion Framework，Tingting Liang 等，comments 注明 "Accepted at NeurIPS 2022"——与 Ali 笔记头部及 4 张卡的 NeurIPS 2022 一致；摘要明言相机流不依赖 LiDAR 输入。
- arXiv:2111.03759（2026-11-02 抓取 https://arxiv.org/abs/2111.03759 ）：MQBench: Towards Reproducible and Deployable Model Quantization Benchmark，Yuhang Li 等，NeurIPS 2021 Datasets and Benchmarks track——与 MQBench 笔记头部及 4 张卡的 NeurIPS 2021 一致。

## 六、遗留问题（不阻塞，转调度班次酌情入 QUESTIONS.md）

1. Ali 笔记 H1 标题拼写为「AIi-BEVFusion」（第二字符为大写 I），与文件名 Ali-BEVFusion.md 及库内全部引用不一致，应为笔误；因不得修改 `library/`，未处理。按 round2-classical 先例（排版残留/笔误入遗留问题、不另立卡），未为此发 mismatch 卡。
2. 据第五节外部抽查，两篇论文全名与 arXiv 号已确定：Ali 4 张卡 paper 字段「论文全名笔记未载，待人工补核」与 MQBench 4 张卡「笔记未记录完整论文标题」现均可回填（arXiv:2205.13790 / arXiv:2111.03759 及全名）。因属内容增补而非纠错，是否回填留待调度班次/用户定夺。
3. MQBench 笔记实验部分 5.3 首句「验证了 3.2 节的各 BN Folding 策略」中的"3.2 节"应指论文原文节号（笔记自身对应小节为 2.2），初读易混；不影响任何卡片引用，仅提示后续人工核对原文时留意。
