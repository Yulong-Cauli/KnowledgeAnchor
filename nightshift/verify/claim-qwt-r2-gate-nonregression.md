# Verify 报告：claim-qwt-r2-gate-nonregression

- **核验对象**：`claims/claim-qwt-r2-gate-nonregression.md`（status: asserted，本报告不改动该卡）
- **核验问题**：「R² 门控保证补偿后的模型不劣于原 PTQ」是否只在校准集意义下成立
- **核验日期**：2026-11-02
- **核验方式**：CVPR 2025 正式版（CVF Open Access，含补充材料 PDF 逐页读取 + pdftotext 提取后 Grep 验证引文）+ 官方开源代码逐行核对。所有引文均从实际抓取文本中逐字复制（PDF 上标在纯文本提取中渲染为 `R2`/`X Z`，本报告按 PDF 排版还原为 R²/X^Z，验证以提取文本为准）。

## 0. 论文一致性核对（先决条件）

- 论文标题 **"Quantization without Tears"**，作者 Minghao Fu, Hao Yu, Jie Shao, Junjie Zhou, Ke Zhu, Jianxin Wu（南京大学），CVPR 2025（CVF Open Access，页码 4462–4472），arXiv:2411.13918。
- 与卡片 `paper: "CVPR 2025, Quantization without Tears"` 及笔记头部一致。**标题核对通过，可以使用。**
- 代码仓库与笔记一致：https://github.com/wujx2001/QwT

来源：
- https://arxiv.org/abs/2411.13918 （抓取 2026-11-02）
- https://openaccess.thecvf.com/content/CVPR2025/papers/Fu_Quantization_without_Tears_CVPR_2025_paper.pdf （抓取 2026-11-02，下载全文 PDF）
- https://www.openaccess.thecvf.com/content/CVPR2025/supplemental/Fu_Quantization_without_Tears_CVPR_2025_supplemental.pdf （抓取 2026-11-02，下载补充材料 PDF）

## 1. 证据清单

### E1【支持·背景】R² 的输入全部来自校准集（512 张训练集图像）

- locator：论文 p.4465，§3.3（"To minimize the difference between y and ŷ^QwT" 段）
- quote（PDF 排版还原）："we select a small set of training examples (512 images) from the training set. Using these samples, QwT collects all inputs for the block i to form a matrix X^Z ∈ R^((d_in+1)×N). We feed X^Z into the quantized block l^Z to obtain Y^Z ∈ R^(d_out×N). Next, we feed X^Z into the non-quantized block l to obtain Y ∈ R^(d_out×N)."
- URL：https://openaccess.thecvf.com/content/CVPR2025/papers/Fu_Quantization_without_Tears_CVPR_2025_paper.pdf
- 抓取日期：2026-11-02
- 说明：W*（式 6）与残差 E=Y−Y^Z 全部由这 512 张图得到；R² 按笔记 §3 公式 R² = 1 − ‖Y−Y^QwT‖²/‖Y−Y^Z‖² 计算，其分子分母用的都是同一批校准张量。论文从未在测试集上计算 R²。

### E2【支持·背景】§4.1 与补充材料再次确认校准数据来源

- locator：论文 p.4465，§4.1 Settings；补充材料 p.1，§A Full Implementation Details
- quote（§4.1）："We randomly sampled 512 images from the training set to initialize the parameters of the QwT modules using Equation 6."
- quote（Supp §A）："Additionally, a separate set of 512 randomly selected images from the ImageNet training set was used to initialize the parameters of the QwT modules (excluding PTQ weights)."
- URL：同上（主文 + 补充材料 PDF）
- 抓取日期：2026-11-02

### E3【支持·关键】论文唯一的"理论保证"只覆盖 W=b=0 分支，不覆盖 R²>0 分支

- locator：论文 p.4465，§3.3（式 6 之后一段）
- quote："It is worth mentioning that theoretically QwT will not make the quantized network getting worse—by setting W and b to all zeros, QwT will not alter the quantized network."
- URL：https://openaccess.thecvf.com/content/CVPR2025/papers/Fu_Quantization_without_Tears_CVPR_2025_paper.pdf
- 抓取日期：2026-11-02
- 说明：论文原文的"理论上不会更差"明确只以「把 W、b 置零则网络与 PTQ 完全一致」为依据。这是数据集无关的逻辑保证，但**没有**说「校准集 R²>0 ⟹ 测试集不退化」。

### E4【支持·关键】门控的动机本身来自"补偿伤精度"的实测观察（<5% 模块）

- locator：论文 p.4465，§3.3（紧接式 6 讨论之后）
- quote："In our experiments, we observed that the coefficient of determination (R²) [43] for a small subset (<5%) of QwT modules was notably low, adversely hurting recognition accuracy. Consequently, we apply the initialization using Equation 6 only when R² > 0; Otherwise, the W and b of the QwT module are set to zero."
- URL：https://openaccess.thecvf.com/content/CVPR2025/papers/Fu_Quantization_without_Tears_CVPR_2025_paper.pdf
- 抓取日期：2026-11-02
- 说明：正面证据——低 R² 与测试集识别精度受损相关，门控据此设计；但论文只观察到"低 R² → 有害"的相关性，未证明逆命题"R²>0 → 无害"，且全文没有 with/without-gate 的消融实验来隔离门控本身的贡献。

### E5【支持·代码佐证】官方代码确认：R² 在校准张量上计算、阈值 0、否则置零

- locator：`QwT-cls-RepQ-ViT/qwt_vit_and_deit.py`，第 44 行、第 124–129 行、第 62–69 行
- quote（第 44 行）：`LINEAR_COMPENSATION_SAMPLES = 512`
- quote（第 127–129 行）：
  ```python
  ss_tot = torch.sum((Y - Y.mean(dim=0)).pow(2))
  ss_res = torch.sum((Y - Y_pred).pow(2))
  r2_score = 1 - ss_res / ss_tot
  ```
- quote（第 62–69 行）：
  ```python
  if linear_init and (r2_score > 0):
      self.lora_weight.data.copy_(W)
      self.lora_bias.data.copy_(b)
  else:
      nn.init.zeros_(self.lora_weight)
      nn.init.zeros_(self.lora_bias)
  ```
- 说明：`linear_regression(...)` 的 X、Y 来自 `generate_compensation_model(q_model, train_loader, ...)` 中截取的前 512 个训练集样本（第 140–180 行），与 E1/E2 一致。R² 与门控全部只接触校准数据。
- URL：https://raw.githubusercontent.com/wujx2001/QwT/main/QwT-cls-RepQ-ViT/qwt_vit_and_deit.py
- 抓取日期：2026-11-02

### E6【反对·部分】论文自己的补充材料里就有"逐数据集测试退化"实例（LLaMA3-8B，GPTQ vs GPTQ+QwT，4-bit）

- locator：补充材料 p.5，Table 4（"Detailed quantization results among the MMLU dataset and eight zero-shot commonsense QA datasets using LLaMA3-8B as the backbone."）
- quote（表格行数据）：GPTQ 行 `BoolQ 81.25  PIQA 81.39  SIQA 32.91  HLSW 78.28  WG 72.77 ... QA. Avg 64.90`；GPTQ + QwT 行 `BoolQ 81.22  PIQA 81.45  SIQA 32.91  HLSW 77.77  WG 73.40 ... QA. Avg 65.18`
- URL：https://www.openaccess.thecvf.com/content/CVPR2025/supplemental/Fu_Quantization_without_Tears_CVPR_2025_supplemental.pdf
- 抓取日期：2026-11-02
- 说明：补偿后的模型在 BoolQ（−0.03）与 HLSW/HellaSwag（−0.51）上**低于** GPTQ 基线，尽管 QA 均值（64.90→65.18）、WikiText2（6.65→6.63）、C4（9.44→9.38）均提升。QwT 若全部模块被门控置零则应与 GPTQ 完全一致，因此这些退化意味着部分 R²>0（校准集）的模块在个别测试集上产生了负向漂移——这是论文内部自带的、弱但真实的「校准集通过、测试集退化」实例（逐数据集粒度，非整模型 ImageNet 级）。保留一点注意：LLaMA3 校准用 C4 128 样本 × 2048 token（§4.5），论文未明说 LLM 实验是否逐模块执行了 R² 门控。

### E7【支持·基准级正面证据】ImageNet 全部表格中 QwT 行均不低于 PTQ 基线

- locator：论文 p.4466 Table 1；补充材料 p.4 Tables 1–3
- quote（Table 1 选行）：DeiT-T 4/4 `RepQ-ViT [27] 4/4 3.3 58.2` / `RepQ-ViT + QwT 4/4 4.2 61.4`；ViT-B 4/4 `RepQ-ViT [27] 4/4 44.9 68.5` / `RepQ-ViT + QwT 4/4 59.1 76.3`；ResNet-50 4/4 `Percentile[23] 4/4 14.0 68.4` / `Percentile + QwT 4/4 16.0 74.5`
- 说明：主文与补充材料的全部 ImageNet 行（含 Swin-S 6/6 82.8→82.9、ResNet-101 6/6 77.1→77.2 等最小增益行）QwT ≥ 基线，无一行退化。整模型粒度、ImageNet 分类基准上无反例。
- URL：主文 + 补充材料 PDF（同上）
- 抓取日期：2026-11-02

### E8【背景】论文对 LLM 实验的表述是经验性陈述，且只对"均值/困惑度"严格成立

- locator：论文 p.4469，§4.5 Results
- quote："As the results show, our optimized models will not overfit the calibration dataset, and consistently outperform the original PTQ models."
- URL：https://openaccess.thecvf.com/content/CVPR2025/papers/Fu_Quantization_without_Tears_CVPR_2025_paper.pdf
- 抓取日期：2026-11-02
- 说明："consistently outperform" 与 E6 的逐数据集退化并存的解释：该句在论文语境下指聚合指标（QA 均值、困惑度）。这再次说明"不劣于"不是逐测试集的无条件保证。

### E9【背景·交叉核对】笔记与卡片的引文/数字核对结果

- 卡片 quote 2「这一机制确保了 QwT 在最坏情况下也不会比原始 PTQ 模型差」：逐字存在于 `library/Quantization/QwT.md:101`（Grep 验证通过）。**但它是笔记作者的概括（gloss），论文原文没有这句话**；论文对应表述是 E3，语气明显更弱（只覆盖置零分支）。
- 卡片 quote 1「如果 R² ≤ 0：说明线性拟合失败，强制令 W=0, b=0」：笔记 99 行原文为「**如果 $R^2 \le 0$**：说明线性拟合失败，强制令 $W=0, b=0$ 。」——卡片 quote 是去 LaTeX 的转写，**非逐字**（按 nightshift/RULES.md 第 3 条标准）。
- 笔记 §3 的 R² 公式与代码 E5 一致；笔记 §4 数字抽查全部与论文一致（ResNet-50 68.4→74.5、ViT-B 68.5→76.3、DETR 39.5→40.0、Mask R-CNN 36.1/40.0→43.1/40.4、CLIP 29.8→43.5、LLaMA3 6.65→6.63、DiT FID 优化 0.69），本次未发现新的表格错位。

## 2. 分析：校准集 vs 测试集

把卡片标题的主张拆成两个分支后，证据结构如下：

1. **R² ≤ 0 分支（门控触发）**：W=b=0，补偿层为恒等零映射，模型与原 PTQ **逐位相同**。这是无条件保证，与在什么数据上评估无关（E3、E5）。这一半主张成立。
2. **R² > 0 分支（补偿生效）**：R² 只由 512 张校准图像（LLM 为 C4 样本）计算（E1、E2、E5），R²>0 仅意味着**校准集上**补偿后残差平方和小于补偿前。论文没有给出任何关于测试集的理论论证、没有门控消融、没有 per-module 校准 R² 与测试贡献的对照分析（E4）。论文自身的证据是：
   - ImageNet 全部基准确提升（E7，支持）；
   - 论文自己观察到 <5% 模块补偿伤测试精度、才引入门控（E4，说明"补偿可以有害"是实测事实）；
   - LLaMA3 逐数据集存在小幅测试退化（E6，弱反例）。
3. 因此，对核验问题的直接回答是：**「R² 门控保证不劣于原 PTQ」中真正构成"保证"的只有 R²≤0 → 置零分支；R²>0 分支的"不劣于"只在校准集意义下有定义，在测试集上只是论文报告基准上的经验观察，没有任何保证性质的支持。** 卡片标题把它读成一个统一保证，超出了论文原文（E3）的强度。

## 3. 结论倾向

**部分支持。**

- R²≤0 分支：支持（论文 + 代码双重确认，无条件成立）。
- R²>0 分支：仅校准集意义成立；测试集层面论文无理论、无消融，且其补充材料自带逐数据集小幅退化实例（BoolQ −0.03、HellaSwag −0.51）。"门控保证测试集不劣于 PTQ"这一读法不被论文支持。
- 未发现"校准集 R²>0 但整模型 ImageNet 精度低于 PTQ"的公开反例（论文表格全为正增益）；证伪该点需要自行复现。

## 4. 对 claim 卡的修改建议（仅建议，未改动卡片）

1. **拆分主张**：标题「QwT 的 R² 门控能保证补偿后的模型不劣于原 PTQ」建议改为单一可证伪主张，例如：「QwT 的 R² 门控在 R²≤0 时置零补偿层，使模型严格等于原 PTQ（无条件）；R²>0 时不退化仅在校准集意义下成立，测试集无保证」。或者维持单卡但把"保证"限定到置零分支。
2. **scope 补充**：建议写明「R² 由 512 张 ImageNet 训练集图像（LLM 为 C4 128×2048）在校准张量上计算（论文 p.4465 + supp p.1 + 官方代码 L44/L129）」；现 scope 已含"R² 在校准集上计算"，方向正确。
3. **证据替换/增补**：现 evidence 两条均引自笔记；其中 quote 2 是笔记 gloss 而非论文原话，建议增补论文原文为第一证据：p.4465 "It is worth mentioning that theoretically QwT will not make the quantized network getting worse—by setting W and b to all zeros, QwT will not alter the quantized network."（relation: supports，注意其只覆盖置零分支）与 p.4465 "<5% ... adversely hurting recognition accuracy ... only when R² > 0"（relation: supports，附注"动机性证据，非消融"）。
4. **quote 1 规范化**：建议改为笔记 99 行的逐字文本（含 `$R^2 \le 0$` LaTeX 原样），或在卡片注明"已去 LaTeX 转写"。
5. **falsifiers 增补**：第一条可加注"论文补充材料 Table 4（LLaMA3）已见逐数据集小幅退化（BoolQ −0.03、HellaSwag −0.51），但非整模型级反例"；第二条（检测/部署复现）保持。
6. **status/stance**：维持 asserted + watch；本文档不构成 verified 依据（无人签署），如需升级须走用户手工 signoff 流程。

## 5. 遗留问题

1. 论文没有 R² 门控的 with/without 消融，无法从论文判断门控实际拦截了多少有害模块、以及 R² 略大于 0 的"边缘模块"的测试表现分布——需复现实验或查 QwT-v2（后续版本）是否补充了该分析（本次未核）。
2. LLaMA3 实验是否逐模块执行了 R² 门控，论文未明说（正文门控描述均在视觉分类语境）；E6 的"校准集通过"是从"若全置零则应与 GPTQ 完全一致"反推的，属合理推断而非论文自述。
3. 若要完全证伪/证实第一条 falsifier（整模型级"校准 R²>0 但测试退化"），需要自行复现 QwT 并记录 per-module R² 与测试集逐类表现，超出本次文献核验范围。
