# SliderQuant: Accurate Post-Training Quantization for LLMs

**出处会议：** ICLR 2026（arXiv 摘要页 Comments 栏原文："This work is accepted to ICLR 2026"）  
**是否开源：** https://github.com/deep-optimization/SliderQuant（论文自报代码链接，仓库内容未抓取核对）  
**关键词：** LLM量化、训练后量化(PTQ)、逐层敏感性、滑动窗口量化、inter/intra-layer sliding、W4A4

> 注（2026-11-04 抓取）：本笔记抓取自 arXiv HTML 全文 https://arxiv.org/html/2603.25284v1 （arXiv:2603.25284v1 [cs.AI]，v1 提交于 2026-03-26，无更新版本；摘要页 https://arxiv.org/abs/2603.25284 同日抓取核对标题/录用信息）。抓取版本：v1（2026-11-04）。文中 locator 按论文自身编号（§4.1 Table 1、Appendix D Table E 等）。

---

## 1. 概述

SliderQuant 是一个 PTQ 框架，切入点是**序列量化框架对所有层一视同仁并不最优**。作者用三种代表性方法（layer-wise 的 SmoothQuant、block-wise 的 OmniQuant、multi-block-wise 的 CBQ）在 W4A4 下做了逐层量化实验（§1 Figure 1，附录 H Figure E 扩展到 Llama3-8B / Qwen2.5-7B / Qwen2.5-32B），观察到（§1，Abstract）：

1. 浅层/深层通常比中间层对量化更敏感；
2. 浅/深层中最敏感的是第一层/最后一层，量化误差显著大于其他层；
3. 随着逐层量化推进，误差逐步累积放大。

据此提出"自适应滑动量化"：层按敏感性分浅/中/深三段，用三种滑窗设计分别对待，配合窗口内的增量式量化。**滑窗重叠建立跨层的量化协同路径，首/末层作为锚层获得更多优化次数。**

方法分两个组件（§3.2 Figure 2）：

- **inter-layer sliding quantization（Inter-S，基础组件）**：浅层渐进扩张滑窗（PESW）+ 中间层固定滑窗（FSSW）+ 深层渐进收缩滑窗（PCSW），三段之间设 1 个重叠层形成"优化接力"。
- **intra-layer sliding quantization（Intra-S）**：把扩张式滑窗搬进每个窗口内部，沿权重/激活维度按比例 γ 增量地联合量化窗口内所有层。

可学习参数只有 channel-wise scaling（沿 OmniQuant 实现）+ 低秩 LoRA（r=4），推理时全部吸收进权重，不引入额外推理开销（§3.2，Appendix B.2/B.3）。SliderQuant+ 是加 rotation 变换的变体（对照有额外推理开销的方法，Appendix C）。

---

## 2. 方法

### 2.1 基础概念：固定尺寸滑动量化（§3.1）

把序列量化统一成滑窗形式：窗口 {s, i}，s 为窗口大小、i 为每步移动间隔，两窗口重叠 s−i。对窗口内 s 层的权重集合 W 与校准输入 X，优化目标（Eq. 1）：

$$\arg\min_{\hat{\mathbf{W}}}\ ||\mathcal{F}(\mathbf{W},\mathbf{X})-\mathcal{F}(\hat{\mathbf{W}},\mathbf{X})||_2^2$$

weight-activation 时把 X 换成已量化的 X̂（§3.1）。**层级/块级/多块级量化都是它的特例**（s 取 1 层/1 个 attention block/多个 block 且 i=s）。窗口越大显存开销越大但精度更好（§3.1，引 Table 1）。

### 2.2 组件一：Inter-layer Sliding Quantization（§3.2）

- **浅层 L_s 层 → PESW（渐进扩张滑窗）**：从第 1 层单独量化开始，以第 1 层为锚层，窗口每步 +1，直到覆盖全部浅层。首层参与每一次扩张窗口，形成"局部到全局"的密集协同。
- **深层 L_d 层 → PCSW（渐进收缩滑窗）**：从量化全部深层开始，以最后一层为锚层，窗口每步 −1，直到只包含最后一层。
- **中间层 L_i 层 → FSSW {s=2, i=1}**：固定滑窗，层间均匀的优化频率；浅/中、中/深交界处各设 1 个重叠层（s>2 时按 s 调整重叠层数，如 s=3 时 2 个重叠层）。
- 默认 **L_s = L_d = 4**（消融 Table 9 的精度-开销折衷；§4.2）。

### 2.3 组件二：Intra-layer Sliding Quantization（§3.2）

把 PESW 的思想搬进窗口内部：窗口内 s 层沿权重/激活维度按比例 γ 并行做渐进扩张滑窗，共 N=1/γ 个滑窗阶段完成联合量化。默认 **γ=0.5, N=2**（§3.2；消融见 §4.2 Table 10：N=2 最优，N 增大收益回落）。

### 2.4 可学习参数与量化器（§3.2，Appendix B）

每层量化流程（Eq. 2）：X̃ᵢ = Xᵢ ⊘ αᵢ（激活除 scaling），W̃ᵢ = Wᵢ ⊙ αᵢ + AᵢBᵢ（权重乘 scaling 加 LoRA），下一层输入 = quantizer(X̃ᵢ)·quantizer(W̃ᵢ)。αᵢ∈Rⁿ 为可学习 channel-wise scaling 向量；Aᵢ∈Rⁿˣʳ、Bᵢ∈Rʳˣᵐ 为低秩矩阵，**r=4**。校准样本 c=128。

- 量化器：uniform，权重 per-channel、激活 per-token，WikiText2 校准（Appendix B.1）。MoE（Table 4）与 DeepSeek-R1 蒸馏模型（Table 5）改用 group size=128 的 group-wise 量化、C4 校准（Appendix B.1 原文："we employ group-wise quantization with a group size of 128 to preserve performance"）。
- 超参（Appendix B.4 Table A）：128 样本 × 2048 tokens；AdamW；epochs：W2A16 用 60、其他 20；scaling lr 0.001、LoRA lr 0.0001、线性衰减到 0。
- CS 沿用 OmniQuant 实现（Q/K/V/O/Up/Down proj 可学习 scaling，Llama3/Qwen2.5 因 GQA 复制 scaling 对齐维度），量化后吸收进相邻权重，无额外推理开销（Appendix B.2/B.3）。

### 2.5 SliderQuant+（Appendix C）

对照"有额外推理开销"方法时，SliderQuant 接入 rotation 变换：non-absorbable Hadamard 加在 attention 的 Q_proj/K_proj 之后与 O_proj 之前、FFN 的 Down_proj 之前，实现基于 QuaRot 代码库（Appendix C，Figure A）。

---

## 3. 实验

评测（§4 Evaluations）：生成任务 WikiText2/C4 PPL；零样本常识推理 PIQA/ARC-e/ARC-c/HS/WG/BoolQ/MMLU；DeepSeek-R1 蒸馏模型用 MATH-500/AIME-2024/GSM8K/HumanEval+/MBPP+。对照分两组：无额外推理开销（RTN/GPTQ/AWQ/QuIP；RTN/SmoothQuant/OmniQuant/AffineQuant/CBQ）与有额外开销（QLLM/Atom/DuQuant/QuaRot/SpinQuant/FlatQuant）。对比结果部分取自原论文、部分官方 checkpoint、部分自行复现（Appendix F 开头有交代；CBQ 用与 SliderQuant 中间层相同的滑窗设置实现）。

### 3.1 主结果：无额外推理开销（§4.1 Table 1，PPL）

| 配置 | 模型 | RTN | 最强对照 | SliderQuant |
| :--- | :--- | :--- | :--- | :--- |
| W4A16 | Llama2-7B | 6.11/7.71 | CBQ 5.67/7.23 | **5.61/7.19** |
| W4A16 | Llama3-8B | 8.29/11.85 | CBQ 6.93/10.27 | **6.79/9.94** |
| W2A16 | Llama2-7B | 3.8e4/4.8e4 | CBQ 12.10/18.91（QuIP 55.00 仅 Wiki） | **9.59/13.83** |
| W2A16 | Llama3-8B | 2.4e6/2.5e6 | CBQ 91.83/404.31 | **27.59/56.98** |
| W4A4 | Llama2-7B | 5.3e2/5.4e2 | CBQ 12.73/14.45（AffineQuant 12.69/15.76、OmniQuant 14.26/18.02） | **8.34/11.10** |
| W4A4 | Llama2-70B | 8.9e4/9.9e4 | CBQ 7.56/11.04 | **6.87/9.67** |
| W4A4 | Qwen2.5-14B | 4.0e3/3.0e3 | CBQ 18.20/27.96 | **11.00/16.60** |

注：数字格式为 WikiText2/C4。Table 1 覆盖 Llama2-7B/13B/70B、Llama3-8B、Qwen2.5-7B/14B 六个模型 × W4A16/W2A16/W4A4 三种配置（18 组 Wiki/C4），SliderQuant 全部同表最优。

零样本常识推理（§4.1 Table 2，W4A4，7 项平均）：

| 模型 | W16A16 | SmoothQuant | OmniQuant | CBQ | SliderQuant |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Llama2-13B | 70.26 | 43.54 | 52.71 | 54.67 | **56.77** |
| Qwen2.5-14B | 77.42 | 40.35 | 48.55 | 53.50 | **58.96** |

注：W4A4 下 MMLU 掉得最狠（Llama2-13B：FP 52.77 → SliderQuant 27.04；Qwen2.5-14B：77.58 → 43.50），改进主要来自其余任务。

### 3.2 主结果：有额外推理开销（§4.1 Table 3，W4A4，SliderQuant+）

| 模型 | FlatQuant（此前最强） | SliderQuant+ |
| :--- | :--- | :--- |
| Llama2-7B | 5.79/7.79，avg 67.15 | **5.71/7.68，avg 67.58** |
| Llama2-13B | 5.12/7.09，avg 70.38 | **5.07/7.04，avg 71.22** |
| Llama2-70B | 3.55/5.91，avg 76.02 | **3.50/5.87，avg 76.32** |
| Llama3-8B | 6.98/11.13，avg 70.89 | **6.87/11.04，avg 71.50** |
| Qwen2.5-7B-Instruct | 8.46/13.94，avg 70.86 | **8.00/13.38，avg 71.88** |

注：格式为 Wiki/C4 PPL + 6 任务（PIQA/ARC-e/ARC-c/HS/WG）平均准确率。五个模型上 SliderQuant+ 全部优于 FlatQuant。

### 3.3 扩展一：MoE（§4.1 Table 4，Qwen3-30B-A3B，group-wise g128，C4 校准）

| 配置 | 方法 | Wiki/C4 | 7 任务 avg |
| :--- | :--- | :--- | :--- |
| W4A16 | OmniQuant | 9.25/12.54 | 74.08 |
| W4A16 | SliderQuant | **9.04/12.47** | **75.00** |
| W2A16 | OmniQuant | 33.25/27.12 | 53.31 |
| W2A16 | SliderQuant | **23.84/21.60** | **61.15** |
| W4A4 | OmniQuant | 52.43/41.98 | 50.11 |
| W4A4 | SliderQuant | **15.49/17.77** | **66.86** |

### 3.4 扩展二：DeepSeek-R1 蒸馏模型（§4.1 Table 5，group-wise g128，C4 校准，pass@1）

| 模型 | 配置 | 方法 | MATH-500 | AIME-2024 | GSM8K | HumanEval+ | MBPP+ | Avg |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| R1-Distill-Qwen-14B | W16A16 | FP | 95.00 | 73.33 | 91.50 | 73.17 | 61.11 | 78.82 |
| 14B | W4A16 | OmniQuant | 91.60 | 50.00 | 90.29 | 70.12 | 55.03 | 71.41 |
| 14B | W4A16 | SliderQuant | **94.60** | **70.00** | **91.35** | **72.56** | **60.32** | **77.77** |
| 14B | W2A16 | OmniQuant | 0.00 | 0.00 | 2.20 | 0.00 | 0.00 | 0.44 |
| 14B | W2A16 | SliderQuant | **29.40** | **10.00** | **54.28** | **12.80** | **21.16** | **25.53** |
| R1-Distill-Qwen-32B | W16A16 | FP | 94.60 | 76.67 | 93.02 | 81.71 | 69.84 | 83.17 |
| 32B | W4A16 | OmniQuant | 93.00 | 56.66 | 92.64 | 75.00 | 65.61 | 76.58 |
| 32B | W4A16 | SliderQuant | **94.40** | **76.67** | **92.94** | **80.49** | **69.05** | **82.71** |
| 32B | W2A16 | OmniQuant | 13.40 | 0.00 | 26.83 | 0.00 | 0.00 | 8.05 |
| 32B | W2A16 | SliderQuant | **58.60** | **16.67** | **73.69** | **12.80** | **21.16** | **36.59** |

论文自报（§4.1）："Under the W4A16 setting, SliderQuant remains near-lossless relative to FP16 on both 14B and 32B models, while consistently outperforming OmniQuant."

### 3.5 与混合精度方法对比（§4.1 Table 6/7，Llama2-13B / Llama 家族）

- Table 6：SliderQuant 纯低比特版全面低于保留 0.5% FP16 离群值的 LLM-MQ 同比特档（如 W2A16：7.71 vs LLM-MQ 12.17；W4A16：5.00 vs 8.03）。SliderQuant 的 W2.1A16（首末层 4-bit 其余 2-bit）7.64 甚至低于 LLM-MQ 的 W2A16+0.5% FP16（12.17）。
- Table 7：Llama-7B/13B W3A16 上，SliderQuant（5.82、5.21 Wiki）优于 SpQR 的 W3.45A16（5.87、5.22），且常识推理 avg（65.44、69.02）明显高于 SpQR（60.96、64.37）。

### 3.6 消融（§4.2，Llama2-7B，基线为固定滑窗 {s=2, i=1}）

**总体设计（Table 8，Wiki/C4；该表勾选列为 PESW / PCSW / Intra-S 三列，"Inter-S" 表头横跨前两列）**：

| 配置 | W4A4 | W2A16 |
| :--- | :--- | :--- |
| 基线（仅固定滑窗 {s=2,i=1}） | 12.73/14.45 | 12.10/18.91 |
| 仅 Intra-S | 10.34/13.46 | 10.71/16.10 |
| 仅 PESW | 10.30/13.78 | 10.67/16.76 |
| 仅 PCSW | 9.84/13.31 | 10.92/17.31 |
| PESW+PCSW（Inter-S） | 9.13/11.78 | 10.53/15.15 |
| Inter-S+Intra-S（完整） | **8.34/11.10** | **9.59/13.83** |

注：论文正文此处写 "The results are shown in Table 9"，实为 Table 8 的内容——正文表号笔误（详见遗留问题 1）。

**L_s=L_d 取值（Table 9，W4A4 Wiki/C4）**：2→6 逐步变好（Wiki 10.23→8.94），默认取 4（Inter-S 9.13/11.78；加 Intra-S 后为 8.34/11.10；原文自述 "further scaling beyond this point tends to bring marginal performance improvements"，§4.2）。Qwen2.5-14B 上同趋势（Appendix G.1 Table M：12.99 @4 → 12.22 @6）。

**γ 取值（Table 10）**：γ=0.5/N=2 最优（10.34/13.46 W4A4），N=3、4 回落到 10.56、11.32。Qwen2.5-14B 上 N=3 略优（15.67 vs N=2 的 16.01，Appendix G.1 Table N），故默认 γ=0.5 并非逐模型最优（论文在 G.1 明确承认默认设置 "is not optimal even for Llama2-7B"）。

**固定滑窗加大 s（Table 11）**：基线 s=2→4 从 12.73 升到 11.13，但仍显著差于仅浅/深段用 s=4 的 Inter-S（9.13），说明均匀对待所有层是固定滑窗的本质局限。

**CS 与 LoRA（Table 12，W4A4）**：SliderQuant 组为仅 CS 9.18/12.21、仅 LoRA 12.95/17.27、合用 **8.34/11.10**（合用最优）；但 Baseline 组按 HTML 对齐为仅 CS 20.41/29.67、仅 LoRA 12.73/14.45、合用 13.92/18.44——**合用反而劣于仅 LoRA，与正文"using both CS and LoRA together consistently yields better results than using either one individually"（§4.2）矛盾**。该表 HTML 有 4 行单元格缺失，勾选对齐系推断，引用前必须对照 PDF（见遗留问题 4）。

### 3.7 效率与开销

**量化耗时（Appendix D Table E，Llama2-7B W4A4，单张 RTX A6000）**：10 epochs 3.24h → Wiki 8.92；20 epochs 6.14h → 8.34（默认）；30/40 epochs 9.22h/12.81h → 8.30/8.28（收益趋平）。正文补充：OmniQuant 4.75h 得 14.26/18.02（Wiki/C4），SliderQuant 在更少时间下更好。

**推理部署（Appendix B.5 + Table B/C/D，llama.cpp，batch=1，prompt 512，gen 128，无自定义内核）**：Llama2-7B 在 RTX A6000 上 FP16 12.55GB / 45.89 tokens/s → W2A16 1.73GB / 135.80 tokens/s（约 3.0× 加速、7.3× 压缩，笔记按同表两值自算）；Llama2-70B FP16 128.48GB 在 A6000 上 OOM，W4A16 36.55GB / 15.42 tokens/s 可跑。

**训练开销对比（Appendix G.3 Table Q，W4A4，20 epochs，128 样本，batch=1，A6000-48G）**：

| 模型 | 方法 | Wiki/C4 | 时间 (h) | 显存 (GB) |
| :--- | :--- | :--- | :--- | :--- |
| Llama2-7B | OmniQuant | 14.26/18.02 | 4.75 | 15.04 |
| Llama2-7B | CBQ (s=2) | 12.73/14.45 | 5.66 | 16.24 |
| Llama2-7B | SliderQuant | 8.34/11.10 | 6.14 | 29.80 |
| Llama2-7B | SliderQuant-Fast (10 ep) | 8.92/11.59 | 3.24 | 29.80 |
| Qwen2.5-14B | OmniQuant | 34.70/61.75 | 7.38 | 22.12 |
| Qwen2.5-14B | SliderQuant | 11.00/16.60 | 11.43 | 43.71 |

要点：SliderQuant 默认版比 OmniQuant / CBQ(s=2) 慢 1.08×–1.55×；但比 s=3/s=4 的固定滑窗快；SliderQuant-Fast（10 epochs）最快且仍大幅优于 OmniQuant 精度。显存约为 CBQ(s=2)/OmniQuant 的 2×（PESW/PCSW 大窗口所致）。

**校准数据效率（Appendix G.4 Table R，W4A4）**：Llama-7B 上 SliderQuant 用 32 样本（8.71/11.19）优于 OmniQuant 用 256 样本（11.41/14.90）；Llama2-7B 上 SliderQuant+ 用 32 样本（5.83/7.85）优于 DuQuant 用 256 样本（6.23/7.88）。附录 E Table F（Llama2-7B）：32→512 样本，Wiki 9.38→8.26，增益平缓。

---

## 4. 核心结论

1. **层敏感性是 PTQ 被忽视的设计维度**：first/last 层量化误差显著更大，均匀对待所有层的序列量化框架（layer/block/multi-block-wise）在低比特下不是最优（§1 Figure 1，附录 H）。
2. **自适应滑窗 > 固定滑窗 > 层级量化**：三个滑窗设计（PESW/FSSW/PCSW）+ 窗口内增量量化把 Llama2-7B W4A4 从 12.73 拉到 8.34；收益主要来自自适应设计本身，而非首末层被重复优化（重复 4 次的增益 <1 PPL，Appendix G.2 Table P）。
3. **增益集中在低比特 weight-activation**：W4A16 上优势存在但幅度小（如 Llama2-7B 5.61 vs CBQ 5.67）；W2A16/W4A4 上优势放大（MoE W4A4：15.49 vs OmniQuant 52.43）。
4. **不引入推理开销的主张成立**（论文自报）：CS/LoRA/旋转以外的参数全部可吸收；SliderQuant（无旋转）推理成本与常规 per-channel/per-token 量化一致（§3.2，Appendix B）。
5. **效率画像**：默认设置量化比 OmniQuant / CBQ(s=2) 慢 1.08×–1.55×（论文自报区间，Appendix G.3）、显存约为其 2×（Table Q：7B 29.80 vs 15.04/16.24 GB），但 10 epochs 就能拿到大部分收益（Table E：3.24h 得 Wiki 8.92）；推理侧 llama.cpp 实测 W2A16 7B 达 135.80 tokens/s（A6000，FP16 为 45.89）。

---

## 遗留与 TODO

**遗留问题（数字/表号不一致，引用时注意）**：

1. **正文表号笔误 ×2（§4.2）**：Inter-S/Intra-S 总体消融的正文写 "The results are shown in Table 9"，实际内容在 Table 8；γ 消融正文写 "As shown in Table 11"，实际内容在 Table 10（HTML 内 href 也指向 S4.T9/S4.T11，即论文自身如此，非转换错误）。
2. **Table 1 与 Table 3 的 Llama2-13B W16A16 C4 基线不一致**：Table 1 为 6.46，Table 3 为 5.46（两表同一模型同一基线，逐格核对 HTML 原文）。
3. **Appendix E 正文 9.39 vs Table F 9.38**：32 样本 Wiki PPL 正文写 "the perplexity of 9.39|11.69"，Table F 同行是 9.38|11.69。
4. **Table 12（CS/LoRA 消融）HTML 行残缺且疑似与正文矛盾**：7 行中 4 行的 `<td>` 数量少于 6 列（无 colspan，LaTeXML 转换丢格）。按最自然对齐（行 2 六格完整：CS=✓ → 20.41/29.67；行 3 单勾 → 仅 LoRA 12.73/14.45；行 4 双勾 → CS+LoRA 13.92/18.44），Baseline 组"合用 13.92/18.44"劣于"仅 LoRA 12.73/14.45"，与 §4.2 正文"using both CS and LoRA together consistently yields better results than using either one individually"直接矛盾。**引用该表任何一格前需对照 PDF 核对勾选位置。**
5. **Appendix D 正文 "(9.5|12.29 on WikiText2|C4)"（<1h）与 Table E 对不上**：Table E 中 10 epochs（3.24h）已是 8.92/11.59，不存在 <1h 的行；9.5|12.29 疑出自 Figure D 曲线的某个未列表数据点。
6. **Appendix G.3 "up to 6.42× speedup compared to OmniQuant on Llama2-7B" 无法从表格复算**：Table Q 中 OmniQuant 4.75h vs SliderQuant-Fast 3.24h 仅 1.47×；6.42× 疑出自 Figure D 某等精度点，正文未给出推导。
7. G.1 正文 "Detailed results are summarized in the below Table M, Table M, Table O and Table O" 表号重复笔误；且其引用的四个表实际是 Table L/M/N/O。
8. 附录 F 明说对照方法数字部分取自原论文/官方 checkpoint/自行复现（非全部统一重跑），跨方法对比的公平性以论文自述为准。

**TODO**：

- 配图待补 assets/SliderQuant/（Figure 1 层敏感性曲线、Figure 2 框架图、Figure A 旋转位置、Figure D 时间-PPL 曲线均未下载）。
- Table 12 需对照 PDF 核对勾选结构（遗留问题 4）。
- GitHub 仓库 https://github.com/deep-optimization/SliderQuant 内容未抓取，开源完整性（是否含 W4A4/MoE 配置）待核对。
- claim 候选见任务返回摘要（未建卡）。
