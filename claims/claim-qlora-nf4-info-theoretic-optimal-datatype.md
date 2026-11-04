---
id: claim-qlora-nf4-info-theoretic-optimal-datatype
title: "QLoRA 声称：NF4 数据类型由零均值正态分布的 2^k+1 分位数构造（Eq.4 相邻均值；非对称化保证精确零点），对零均值正态权重'信息论最优'（每量化 bin 等期望填充）"
type: claim
status: asserted
scope: "4-bit NormalFloat（NF4）数据类型本身的设计/理论主张；前提假设：预训练神经网络权重零均值正态（σ 任意，absmax 缩放归一到 [-1,1]，论文 §3 + Appendix F）；'信息论最优' 指分位数量化的等期望填充性质（论文声称，非本库推导复核）；码点表：论文 Appendix E 16 值，官方 bitsandbytes 实现硬编码表与之逐字节一致（main 分支 2026-11-05 实抓；同作者实现，非独立验证）；公式读法 2^k+1 / 2^{k-1} / 2^{k-1}+1 经原文 HTML alttext 核对（2026-11-05 实抓）；实证优越性（PPL/精度）归 [NF4+DQ 恢复卡]；尚未独立验证"
tags: [quantization, llm, qlora, nf4, data-type, information-theory]
note: library/Quantization/QLoRA.md#22-4-bit-normalfloatnf43-之-4-bit-normalfloat-quantization-小节
paper: "NeurIPS 2023（arXiv:2305.14314）, QLoRA: Efficient Finetuning of Quantized LLMs（开源：https://github.com/artidoro/qlora 、https://github.com/TimDettmers/bitsandbytes）"
stance: watch
evidence:
  - source: library/Quantization/QLoRA.md
    locator: "§3 / NF4 命名与最优性句"
    quote: "We term the resulting data type that has equal expected number of values in each quantization bin k-bit NormalFloat (NFk), since the data type is information-theoretically optimal for zero-centered normally distributed data."
    relation: supports
  - source: library/Quantization/QLoRA.md
    locator: "§3 / 构造三步（(1)(2)(3)）"
    quote: "The information theoretically optimal data type for zero-mean normal distributions with arbitrary standard deviations σ in the range [−1,1] is computed as follows: (1) estimate the 2k+1 quantiles of a theoretical N(0,1) distribution to obtain a k-bit quantile quantization data type for normal distributions, (2) take this data type and normalize its values into the [−1,1] range, (3) quantize an input weight tensor by normalizing it into the [−1,1] range through absolute maximum rescaling."
    relation: supports
  - source: library/Quantization/QLoRA.md
    locator: "§3 / 非对称化精确零点"
    quote: "To ensure a discrete zeropoint of 0 and to use all 2k bits for a k-bit datatype, we create an asymmetric data type by estimating the quantiles qi of two ranges qi: 2k−1 for the negative part and 2k−1+1 for the positive part and then we unify these sets of qi and remove one of the two zeros that occurs in both sets."
    relation: supports
  - source: library/Quantization/QLoRA.md
    locator: "§3 / 正态假设依据"
    quote: "Since pretrained neural network weights usually have a zero-centered normal distribution with standard deviation σ (see Appendix F), we can transform all weights to a single fixed distribution by scaling σ such that the distribution fits exactly into the range of our data type."
    relation: supports
  - source: library/Quantization/QLoRA.md
    locator: "Appendix E（NF4 的 16 个精确码点，负 8 / 正 7 加 0）"
    quote: "[-1.0, -0.6961928009986877, -0.5250730514526367, -0.39491748809814453, -0.28444138169288635, -0.18477343022823334, -0.09105003625154495, 0.0, 0.07958029955625534, 0.16093020141124725, 0.24611230194568634, 0.33791524171829224, 0.44070982933044434, 0.5626170039176941, 0.7229568362236023, 1.0]"
    relation: supports
  - source: https://raw.githubusercontent.com/TimDettmers/bitsandbytes/main/bitsandbytes/functional.py
    locator: "nf4 分支硬编码表（抓取 2026-11-05；与 Appendix E 逐字节一致，同作者实现）"
    quote: "-1.0, -0.6961928009986877, -0.5250730514526367, -0.39491748809814453, -0.28444138169288635, -0.18477343022823334, -0.09105003625154495, 0.0, 0.07958029955625534, 0.16093020141124725, 0.24611230194568634, 0.33791524171829224, 0.44070982933044434, 0.5626170039176941, 0.7229568362236023, 1.0"
    relation: supports
falsifiers:
  - "构造核对：以官方实现公式（offset=0.9677083 等距概率格 ppf 直接取值 + absmax 归一化）或论文 Eq.4 原意（网格端点待 PDF 澄清）独立重算 NF4 码点，与 Appendix E 16 值系统性不符（2026-11-05 首次复算：实现公式命中 max|err|≈1.1e-7；Eq.4 字面网格 i/(2^k+1) 不命中——见待决）"
  - "假设核对：实际 LLM 权重分布显著偏离零均值正态（重尾/不对称，超出 Appendix F 论证范围），等期望填充前提失效"
  - "最优性核对：信息论角度复核发现等期望填充对该场景并非最优（如考虑 absmax 缩放误差或块内 σ 波动）；或后续文献论证被独立确认（bnb 代码注释线索：arXiv:2306.06965 'NF4 Isn't Information Theoretically Optimal'，本班未读该文）"
review_due: 2026-12-03
related: [claim-qlora-nf4-dq-recovers-16bit-lora-mmlu, claim-qlora-65b-finetune-single-48gb]
signoff: null
---

## 这条主张是什么意思

QLoRA 冻结 4-bit 底座做微调，其权重存储类型 NF4 是专门设计的：利用"预训练权重近似零均值正态"的假设（Appendix F），把分位数量化中昂贵的在线分位数估计换成固定分布的离线构造；并通过负侧 2^{k−1} / 正侧 2^{k−1}+1 的非对称分位设计保证 0 是精确码点（零值元素零误差）。论文由此声称 NF4 对零均值正态权重"信息论最优"——每个量化 bin 等期望填充。这是**类型设计层面的主张**；"NF4 实测优于 FP4/Int4"是另一类证据（Table 2/Figure 3，归 [NF4+DQ 恢复卡](claim-qlora-nf4-dq-recovers-16bit-lora-mmlu.md)），两者可分开证伪。本卡主张均为论文声称，尚未独立验证。

## 假设与推导

- 前提假设：(a) 权重零均值正态、σ 任意（论文引 Appendix F）；(b) absmax 逐张量缩放把任意 σ 归一到 [-1,1] 且不改变分布形状。
- 命题可拆三层：**构造描述**（2^k+1 分位数、Eq.4 相邻均值、非对称修正）、**最优性声称**（等期望填充 ⇒ 对正态输入最优，分位数量化的标准论证）、**码点表**（Appendix E 的 16 个值，机械可验证）。
- 符号读法核对（本班实抓原文 HTML alttext，2026-11-05）：散文中 "2k+1" 实为 **2^k+1**（不是 2^(k+1)，也不是字面 2k+1）；"2k−1 / 2k−1+1" 实为 **2^{k−1} / 2^{k−1}+1**；Eq.4 原式为 q_i = ½(Q_X(i/(2^k+1)) + Q_X((i+1)/(2^k+1)))。笔记引文按 LaTeXML 可见形式平写（笔记头部约定在案），quote 逐字仍有效，语义读法以本条为准。
- 构造描述与实现的对应（本班核对，见核查记录）：官方实现按 offset=0.9677083 的两条等距概率格**直接取 ppf 值**再归一化，复算命中 16 码点（max|err|≈1.1e-7）；而按 Eq.4 字面网格（i/(2^k+1)，相邻均值）复算**不命中**（首位正值 0.108 vs 0.0796），且网格端点 p=0/1 处构造退化（±∞）。即：论文散文式构造描述不能当作可执行公式照抄，端点/offset 细节论文文本未给出——这是"定义是什么"与"实现怎么算"的区分，判论文描述算不算"错"需要读 PDF 原文排版，本班不裁定（待决）。
- "信息论最优"的成立半径：等期望填充 ⇒ 最优，依赖假设 (a)(b)。权重重尾、块间 σ 差异大时最优性声明失效，但数据类型定义本身不受影响。后续线索：bitsandbytes 代码含 `af4` 分支，注释注明 "Taken from: NF4 Isn't Information Theoretically Optimal (and that's Good)"（arXiv:2306.06965，抓取 2026-11-05）——最优性主张在后续工作中有争议；本班未读该论文，仅登记线索，不据此改写最优性表述。

## 适用范围与迁移限制

- 码点表与构造主张绑定 4-bit（NF4）；NFk 是一般 k-bit 构造，其他 k 的码点未在本卡核对。
- 迁移到其他量化场景（更大 blocksize、非 absmax 缩放、激活量化）前需检查假设 (a)(b) 是否仍成立。
- 不覆盖：NF4 与 FP4/Int4 的实测对比、DQ、65B 训练可行性（各归相关卡）。

## 对研究问题的启发

以下为尚未验证的研究假设：

- 本卡是"类型设计 vs 实测效果"分离检验的范例：码点表机械可验证（最便宜），最优性论证可推导复核，实证优越性需跑基准——三类检查信息增益不同，混为一谈会把"实现一致"误读成"理论成立"。
- AF4 线索引出的候选问题：若等期望填充不是 4-bit 权重量化的最优选择，更好的类型设计空间在哪里（absmax 缩放误差、离群值、块结构如何进入构造）？需先读 arXiv:2306.06965 再立题。

## 当前立场与下一步

- 当前 stance：watch。原卡未记录立场依据，按未记录处理，不代拟理由。
- 优先执行的最小检查：
  1. **实现核对**（已完成，2026-11-05）：bitsandbytes 硬编码表 == Appendix E（逐字节）；按实现公式数值复算命中（1.1e-7）。结果含义：码点表与实现一致这一点成立；它支持"实现忠实于论文附录"，不等于最优性论证成立。
  2. **原文核查**：读 arXiv v1 PDF 中 Eq.4 与散文段的排版（上下标、区间端点），确认论文构造描述的准确意图——这是"Eq.4 字面复算不命中"能否升级为"论文描述有误"的前提。判不了就保持待决。
  3. **推导核对**：从"等期望填充 ⇒ MSE 最小"的标准论证出发，检查 absmax 缩放与块结构是否被论证隐含忽略（对应 falsifier 3，纯推导，无需训练）。
  4. **文献对照**：读 arXiv:2306.06965 的反驳论证，判断它攻击的是等期望填充前提、正态假设还是 absmax 缩放——不同攻击点对应不同 falsifier。
- 各检查完成后按"支持/削弱/待区分"分别记录，不把实现一致当作理论成立的证据。

## 核查记录

- 2026-11-02（建卡）：5 条 quote 自笔记实抓；数学平写歧义当时已知、未解。
- 2026-11-05（02 任务书样板整理班）：
  - 5 条 evidence quote Grep 逐字命中笔记（未改写）。
  - 实抓 arXiv HTML v1（https://arxiv.org/html/2305.14314v1，2026-11-05）：alttext 证实 2^{k}+1 / 2^{k} / 2^{k-1} / 2^{k-1}+1 与 Eq.4 全式（q_i = ½(Q_X(i/(2^k+1))+Q_X((i+1)/(2^k+1)))）。
  - 实抓 bitsandbytes main 分支 functional.py（2026-11-05）：nf4 硬编码表与 Appendix E 16 值逐字节一致；构造代码为 offset=0.9677083 等距概率格 ppf 直接取值（正 8 点/负 7 点，弃 0.5 端点补 0）+ absmax 归一化。
  - 数值复算（python3，statistics.NormalDist）：实现公式命中 16 值 max|err|≈1.083e-7；Eq.4 字面网格（i/(2^k+1) 避开端点、相邻均值）不命中（首位正值 0.1079 vs 0.0796）。
  - title/scope 更新（指数读法修正、实现核对注记）；falsifier 结构化为"构造核对/假设核对/最优性核对"并标注首次复算结果；新增 af4 线索。id/status/stance/review_due/signoff 未动。
  - 待决：论文 Eq.4/散文构造与官方实现的对应关系（端点意图待 PDF 澄清）——转 nightshift/QUESTIONS.md #48。
