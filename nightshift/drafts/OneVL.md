# Xiaomi OneVL: One-Step Latent Reasoning and Planning with Vision-Language Explanation

**出处会议：** 无会议/期刊标注（arXiv Technical Report）。arXiv abs 页 Comments 原文 "Technical Report; 49 pages, 22 figures, 10 tables; Project Page at this https URL GitHub at this https URL"；Subjects 原文 "Computer Vision and Pattern Recognition (cs.CV) ; Computation and Language (cs.CL); Robotics (cs.RO)"（primary cs.CV）。版本：v1 2026-04-20，v2 2026-05-04，v3 2026-05-08（当前版本，本笔记基于 v3）。作者栏署名（HTML 正文标题下）原文 "Xiaomi Embodied Intelligence Team"，共 50 位作者（§7：22 位 Core Contributors + 28 位 Contributors，"† Corresponding author." 标注在 Long Chen 名下）。
**是否开源：** 是。推理代码 GitHub https://github.com/xiaomi-research/onevl （本次经 GitHub API 确认存在，返回 full_name "xiaomi-research/onevl"、default_branch "main"，仓库含 infer_onevl.py / eval_results.py / visual_tokenizer / vq_decoder 等；README 原文 badge "[![License](https://img.shields.io/badge/License-Apache%202.0-green?style=flat-square)](LICENSE)" 与 "## License" 节 "This project is released under the [Apache 2.0 License](LICENSE)."——但仓库根目录未见 LICENSE 文件：GitHub license API 返回 "Not Found"，raw LICENSE/LICENSE.md/LICENSE.txt 均 404，Apache-2.0 未经 GitHub 侧确认，见 TODO）；训练代码另仓 https://github.com/GeorgeLuImmortal/OneVL_training （GitHub API 确认存在，license spdx "Apache-2.0"，README 称 2026-05-11 发布）；项目页 https://xiaomi-embodied-intelligence.github.io/OneVL/ （本次抓取确认，页面 title 原文 "OneVL: One-Step Latent Reasoning and Planning with Vision-Language Explanation"）；README 称模型权重发布于 HuggingFace collection（本环境 HF 抓取失败，未直接核验，见 TODO）。Abstract 原句 "Code has been open-sourced to the community."
**关键词：** latent Chain-of-Thought（潜空间思维链）、VLA + World Model 统一框架（推理期丢弃世界模型）、双辅助解码器（语言 CoT 重建 + 视觉未来帧预测）、Qwen3-VL-4B-Instruct 主干、视觉 latent token（C_v=4，以 35 个原词表 token 实现）+ 语言 latent token（C_t=2，以 20 个实现）、Emu3.5/IBQ 视觉 tokenizer（131,072 码本、词表扩 131,072、512x512 输入）、Prefill Inference（latent token 全部并行 prefill、仅轨迹自回归解码）、三阶段训练（Stage 0 主模型 warmup → Stage 1 冻结主模型训练辅助解码器 → Stage 2 联合端到端微调）+ 前置视觉解码器自监督预训练、NAVSIM PDM-score 88.84（SFT setting SOTA）、四 benchmark（NAVSIM / ROADWork / Impromptu / Alpamayo-R1）、MLP 回归头部署变体 0.24s（约 4.16 Hz）

> 来源与核验（抓取日期 2026-11-02）：
> - 检索与歧义检查：arXiv API 检索 all:"OneVL"（https://export.arxiv.org/api/query?search_query=all:%22OneVL%22&max_results=30 ，本次抓取，totalResults=1）与 ti:"OneVL"（同参数，本次抓取）各仅命中 1 条，即本文 arXiv:2604.18486，无同名异文。
> - 主题核对：arXiv abs 页 https://arxiv.org/abs/2604.18486 ，标题 "Xiaomi OneVL: One-Step Latent Reasoning and Planning with Vision-Language Explanation"，摘要主题为 VLA 自动驾驶轨迹预测的 latent CoT 推理，属「VLM / VLA」方向，与任务给定组别（TODO.md「VLM / VLA」组：LLaVA、Qwen3-VL、OpenVLA、OpenDriveVLA、OneVL 等同列）吻合，允许使用。
> - 全文 arXiv 官方 HTML v3 https://arxiv.org/html/2604.18486v3 （LaTeXML 渲染，页面自标 "arXiv:2604.18486v3 [cs.CV] 08 May 2026"，License: CC BY-NC-SA 4.0，本次抓取）。以下 locator（§x / Table x / Fig. x / Eq. x）均指该 v3 的章节、表格与公式编号；10 张编号表格在 HTML 中全部存在，已逐行照抄。
> - 摘要引文核对对象为 abs 页 abstract；正文引文核对对象为上述 HTML 全文的规范化提取文本（脚本已生成）。规范化约定（两侧同规则，见文末「表格与引文核验」）：①数学元素以 ⟨MATH:alttext⟩ 标出，alttext 为 HTML 属性原文；②LaTeXML 引文空格 "[ 78 ]" 规范化为 "[78]"；③多重空白（含换行）折叠为单空格；引文号/括号/标点周边的 LaTeXML 空格（"[ 78 ] ."、"( Section 4.2 )"、"Framework : We" 等）按提取文本逐字符保留并两侧同规则比对。abs 页与 HTML 的摘要有一处排版差异：HTML 中 OneVL 全称展开带缩放标记（原文 "OneVL ( One -step latent reasoning and planning with V ision- L anguage explanations)"），abs 页为连写，摘要引文以 abs 页为准。
> - 表格逐行照抄自 HTML 解析结果并经脚本逐单元格核验（见文末）；本笔记为草稿（nightshift/drafts/），未经用户核阅前所有结论均属「论文声称 / 尚未独立验证」。

------

## 1. 概述

- 领域定位（§1 原句）："Vision-Language Models (VLMs) [50, 4, 6, 5, 104, 67, 68, 1, 35, 37, 38, 97, 79, 15, 10, 100, 49] have rapidly become a foundational building block for autonomous driving, unifying holistic scene understanding, natural language reasoning, and end-to-end trajectory planning within a single model [45, 57, 89, 113, 103, 84, 65, 114, 43, 47]. When further extended to produce action outputs, such as trajectory waypoints or control signals, these models are known as Vision-Language-Action models (VLAs) [13, 80, 17, 63, 42, 30, 31, 48, 102]."
- 问题：显式 CoT 的延迟（§1 原句）："Yet deploying CoT in real driving systems exposes a sharp tension between interpretability and efficiency. Standard autoregressive (AR) CoT generation must emit every reasoning token before the trajectory can be produced. This yields inference latency proportional to the chain length, which is far above that of answer-only prediction. In safety-critical real-time settings, this gap is prohibitive."
- 论文核心主张（Abstract 原句）："We suggest that this is due to purely linguistic latent representations compressing a symbolic abstraction of the world, rather than the causal dynamics that actually govern driving." 及 "Thus, we present OneVL (One-step latent reasoning and planning with Vision-Language explanations), a unified VLA and World Model framework that routes reasoning through compact latent tokens supervised by dual auxiliary decoders."
- 既有 latent CoT 三方法的缺陷（§1 原句）："COCONUT, CODI, and SIM-CoT were designed for language-only reasoning and make no use of the rich visual structure that defines driving scenes. As a result, their purely linguistic latents prove insufficient for the multimodal reasoning demanded by trajectory prediction, and as Figure 1 shows, every existing latent CoT method underperforms explicit CoT across all benchmarks."
- 另一缺陷：latent 仍逐个自回归生成（§1 原句）："A further limitation is that in prior methods, latent hidden states are still produced autoregressively (one latent hidden state at a time), leaving inference sequential. We instead aim to generate all latent hidden states in a single step via prefill."
- 两个关键创新（§1）：
  1. Dual-modal auxiliary decoders——语言辅助解码器从语言 latent token 重建人类可读 CoT；视觉辅助解码器从视觉 latent 表征预测未来帧（"predicts anticipated future frames [19, 88, 71] from visual latent representations"，§1）。世界模型的作用（§1 原句）："By forcing the compressed latents to anticipate what the scene will look like at future time steps, it ensures that the bottleneck encodes genuinely causal scene dynamics, such as agent trajectories, road geometry evolution, and emerging hazards, rather than abstract symbolic summaries."
  2. Prefill Inference——"At inference time, the latent tokens (both visual and language) are prefilled into the model’s context as fixed prompt inputs, enabling single-pass generation of all latent tokens. This eliminates the iterative latent token generation overhead and achieves inference speed essentially identical to answer-only AR prediction."（§1）
- 头条结论（Abstract 原句）："Across four benchmarks, OneVL becomes the first latent CoT method to surpass explicit CoT, delivering superior accuracy at answer-only latency. These results show that with world model supervision, latent CoT produces more generalizable representations than verbose token-by-token reasoning."
- 贡献列表（§1 Contributions，逐条要点）：
  1. "OneVL Framework : We introduce a latent CoT framework built on the principle that compression drives generalization, and identify a critical gap in prior latent CoT work, that is, purely linguistic latent representations are too abstract to satisfy this principle for planning tasks."（含三阶段训练流水线）
  2. "Superior performance across Four Benchmarks : OneVL achieves superior performance across many benchmarks. Notably, OneVL is the only latent CoT method that outperforms explicit autoregressive CoT, directly supporting our hypothesis that tighter compression encourages more generalizable reasoning."
  3. "Prefill Inference : At inference time, the auxiliary decoders are discarded, and all latent tokens are prefilled into the prompt, enabling single-pass latent CoT reasoning with no iterative overhead."（延迟数字见 3.2/3.5 节）
  4. "Interpretable Explanations : The language auxiliary decoder recovers high-quality CoT text from compressed latents, while the visual auxiliary decoder generates spatially coherent future-frame previews, providing both linguistic and visual interpretability."
- 部署侧数字（§1 原句）："For example, on NAVSIM, the latency matches AR answer-only prediction and is ⟨MATH:1.5\times⟩ faster than explicit autoregressive CoT. On ROADWork, prefill latency is identical to answer-only and ⟨MATH:2.3\times⟩ faster than its explicit counterpart. For real-world deployment, appending an MLP head for producing trajectory further reduces latency to ⟨MATH:0.24⟩s ⟨MATH:(4.16⟩ Hz), just ⟨MATH:5.4\%⟩ of the AR model’s latency, offering a practical deployment option."
- 与本库 VLM / VLA 组草稿的关系（有据，此条为笔记作者定位非论文原话）：OneVL 全文（含参考文献）未提及 LLaVA 与 OpenVLA（本次全文检索无命中），三者无直接引用关系；可对照之处是路线差异——OpenVLA 把机械臂动作离散成 token 输出，OneVL 面向自动驾驶轨迹 waypoint 且推理只需轨迹自回归（另有 MLP 回归头变体）；OneVL 的主干即 Qwen3-VL-4B-Instruct（§3.1 原句，见 2.1 节），对应本库 nightshift/drafts/Qwen3VL.md 所记基座；论文的第四个 benchmark Alpamayo-R1 [105] 与本库 TODO.md「VLM / VLA」组待写项「Alpamago」（疑指 Alpamayo）同名，OneVL 复用其公开 checkpoint 生成 CoT 标签（§5.1，见 3.1 节）。

## 2. 方法

### 2.1 主干与 latent token 设计（§3.1–3.2）

- 主干（§3.1 原句）："The backbone of OneVL is Qwen3-VL-4B-Instruct [5], a VLM that processes interleaved image and text inputs. The model consists of three standard components: Vision Encoder (ViT), Visual Projector (MLP Aligner), and Large Language Model (LLM). All three components are initialized from the Qwen3-VL-4B-Instruct checkpoint and remain fully trainable in Stages 0 ( Section 4.2 ) and 2 ( Section 4.4 )."
- 主损失（§3.1 原句）："The backbone is primarily optimized via a standard next-token prediction objective, applying a cross-entropy loss (⟨MATH:\mathcal{L}_{c}⟩) to both the trajectory answers and the latent reasoning tokens introduced below."
- 两类 latent token（§3.2 原句）：
  - "Language Latent Tokens (⟨MATH:\langle|⟩ latent⟨MATH:|\rangle⟩ ): A fixed-length sequence of ⟨MATH:\mathcal{C}_{t}=2⟩ language latent tokens, framed by start and end delimiters (⟨MATH:\langle|⟩ start-latent⟨MATH:|\rangle⟩ and ⟨MATH:\langle|⟩ end-latent⟨MATH:|\rangle⟩ ). These tokens are placed in the assistant response before the trajectory answer, occupying the position where explicit CoT reasoning would appear in standard AR models."
  - "Visual Latent Tokens (⟨MATH:\langle|⟩ latent-vis⟨MATH:|\rangle⟩ ): A fixed-length sequence of ⟨MATH:\mathcal{C}_{v}=4⟩ visual latent tokens, similarly delimited ( i.e . , ⟨MATH:\langle|⟩ start-latent-vis⟨MATH:|\rangle⟩ and ⟨MATH:\langle|⟩ end-latent-vis⟨MATH:|\rangle⟩ ), placed before the language latent tokens in the response. These tokens are designed to encode spatial and temporal visual reasoning about the future scene state."
- 不加特殊 token 的实现细节（§3.2 原句）："Note that during implementation, we found that adding dedicated special tokens ( e.g . , <|latent-vis|> ) to the VLM vocabulary causes performance degradation. Instead, we represent latent tokens using the original vocabulary. Concretely, the ⟨MATH:\mathcal{C}_{v}⟩ visual latent tokens are realized as 35 tokens, and the ⟨MATH:\mathcal{C}_{t}⟩ language latent tokens are realized as 20 tokens."（⚠ 逻辑位 4/2 个、底层实现 35/20 个 token；§8.1 的示例又画了 5 个 <|latent-vis|>，见 4 节 ⚠⑥）

### 2.2 双辅助解码器（§3.3–3.4）

- 语言辅助解码器 D_l（§3.3）：输入为语言 latent 隐状态 H_l（⟨MATH:\mathcal{H}_{l}\in\mathbb{R}^{\mathcal{C}_{t}\times d}⟩，d 为 LLM 隐维）加当前帧 ViT patch 嵌入 V（⟨MATH:\mathcal{V}\in\mathbb{R}^{N_{v}\times d}⟩）；"An MLP layer maps both branches into the auxiliary decoder’s embedding space; we then form the multimodal input by concatenation:"（§3.3 原句），Eq. (1) alttext 逐字：`\mathcal{Z}_{l}=\Big[\text{W}_{l}(\mathcal{V}),\;\text{W}_{l}(\mathcal{H}_{l})\Big],`（渲染即 Z_l = [W_l(V), W_l(H_l)]）。目标（§3.3 原句）："The language auxiliary decoder is trained to predict the ground-truth CoT reasoning text ⟨MATH:\mathcal{T}_{{y}_{{}_{t}}}⟩ given ⟨MATH:\mathcal{Z}_{l}⟩"，Eq. (2) 为交叉熵（alttext 逐字：`\mathcal{L}_{l}=-\sum_{i=1}^{|\mathcal{T}_{{y}_{{}_{t}}}|}\log P_{\mathcal{D}_{l}}\left(\mathcal{T}_{{y}_{{}_{t}},i}\mid\mathcal{Z}_{l},\mathcal{T}_{{y}_{{}_{t}},<i}\right)\penalty\ .`）。
- 视觉辅助解码器 D_v（§3.4）：动机（§3.4 原句）："Autonomous driving is inherently a spatial-temporal prediction task. Future frame visual tokens, which represent what the driving scene will look like at near-term horizons, are a natural target for learning the visual latent representations. This visual prediction objective serves as a world model auxiliary, supplementing language-only latent CoT." 输入同为当前帧 ViT 嵌入 + 视觉 latent 隐状态拼接，Eq. (3) alttext 逐字：`\mathcal{Z}_{v}=\Big[\text{W}_{v}(\mathcal{V}),\;\text{W}_{v}(\mathcal{H}_{v})\Big]\penalty\ .`；Eq. (4) 为视觉交叉熵（alttext 逐字：`\mathcal{L}_{v}=-\sum_{t=1}^{|\mathcal{T}_{y_{v}}|}\log P_{\mathcal{D}_{v}}\!\left(\mathcal{T}_{y_{v},t}\mid\mathcal{Z}_{v},\mathcal{T}_{y_{v},<t}\right)\penalty\ .`）。
- 视觉 tokenizer（§3.4 原句）："To represent images as discrete token sequences, we adopt the IBQ (Index Backpropagation Quantization) visual tokenizer [88]. We use the Emu3.5 tokenizer [19, 88] with a codebook of 131,072 discrete visual codes. The images are resized to a maximum resolution of 512x512 pixels."
- 词表扩充（§3.4 原句）："To integrate this visual vocabulary into OneVL, the Qwen3-VL-4B base vocabulary is extended by 131,072 additional visual token IDs. The visual token sequences for training are constructed offline by running the IBQ tokenizer over the ground-truth future frames from the dataset, requiring no additional forward passes during training."
- 预测目标（§3.4）：未来帧取 +0.5s 与 +1.0s 两个时刻（Fig. 3 caption 原句 "the Visual Aux. Decoder (left) directly predicts future-frame visual tokens at ⟨MATH:0.5\mathrm{s}⟩ and ⟨MATH:1.0\mathrm{s}⟩ (⟨MATH:\mathcal{L}_{v}⟩)"；§3.4 原句 "Let ⟨MATH:\mathcal{T}_{y_{v}}=\left[\mathcal{T}_{y_{v},1},\,\mathcal{T}_{y_{v},2}\right]⟩ be the concatenated discrete visual token sequence for the future frames at time steps ⟨MATH:\mathcal{T}_{y_{v},1}⟩ (⟨MATH:+0.5\text{s}⟩) and ⟨MATH:\mathcal{T}_{y_{v},2}⟩ (⟨MATH:+1.0\text{s}⟩)"）。

### 2.3 联合训练目标（§3.5）

- 总损失 Eq. (5) alttext 逐字：`\mathcal{L}=\mathcal{L}_{c}+\lambda_{l}\mathcal{L}_{l}+\lambda_{v}\mathcal{L}_{v}\penalty\ ,`（渲染即 L = L_c + λ_l·L_l + λ_v·L_v）。
- 权重与理由（§3.5 原句）："where ⟨MATH:\mathcal{L}_{c}⟩ is the main model’s cross-entropy loss, ⟨MATH:\lambda_{l}=1.0⟩ is the language explanation loss weight, and ⟨MATH:\lambda_{v}=0.1⟩ is the visual explanation loss weight. The lower weight on ⟨MATH:\mathcal{L}_{v}⟩ reflects that visual token reconstruction is a harder task, and a smaller weight prevents it from dominating the training signal."

### 2.4 Prefill 推理（§3.6）

- 机制（§3.6 原句）："At inference time, the auxiliary decoders are discarded. The key efficiency insight is that the latent tokens, both visual and language, can be prefilled into the prompt context as fixed token sequences, because their specific vocabulary identities have been seen by the model during training."
- 推理 prompt 结构：Eq.（alttext 逐字）：`[\text{System},\,\text{User query},\,\langle|\texttt{start-latent-vis}|\rangle,\,\underbrace{\langle|\texttt{latent-vis}|\rangle\cdots}_{\mathcal{C}_{v}},\,\langle|\texttt{end-latent-vis}|\rangle,\,\langle|\texttt{start-latent}|\rangle,\,\underbrace{\langle|\texttt{latent}|\rangle\cdots}_{\mathcal{C}_{t}},\,\langle|\texttt{end-latent}|\rangle]`（即 System + 用户 query + 视觉 latent 段 + 语言 latent 段）。
- 并行化论证（§3.6 原句）："All latent tokens are included in the prefill phase rather than the decode phase. Since modern transformers [99] process the entire prefill in parallel, these additional tokens add negligible overhead compared to sequential autoregressive generation. The model then generates only the trajectory tokens autoregressively."
- 三个输出位（§3.6 bullet）：轨迹预测（主输出）；语言解释（可选，经 aux decoder）；视觉解释（可选，future frame visual tokens）。"Items 2 and 3 are available during post-hoc explanation generation ( e.g . , for human-in-the-loop [72] debugging, safety auditing, or human-robot interaction), while item 1 is always generated during inference."（§3.6）

### 2.5 三阶段训练流水线（§4，配置汇总在 Table 9，见 3.6 节）

- 前置：视觉辅助解码器自监督预训练（§4.1）。动机（§4.1 原句）："Asking the decoder to immediately predict future frames conditioned on latent tokens that carry no information yet (early in training) is an ill-posed task that impedes learning. Instead, we first train the decoder with a strong unconditional prior—given the current-frame ViT embeddings, predict what the scene will look like at the next two timestamps—before introducing the latent conditioning signal." 训练目标 Eq.（alttext 逐字：`\mathcal{L}_{p}=-\sum_{t=1}^{|\mathcal{T}_{y_{v}}|}\log P_{\mathcal{D}_{v}}\!\left(\mathcal{T}_{y_{v},t}\mid\mathcal{V},\,\mathcal{T}_{y_{v},<t}\right)\penalty\ .`，输入只有 ViT 嵌入、无 latent 条件）。
- 从无条件到动作条件（§4.1 小标题 "From Unconditioned to Action-Conditioned Generation World Model"，原句）："Since these latent tokens encode the driving agent’s planned action—derived from the main model’s reasoning—the decoder effectively transitions from unconditioned next-frame generation to action-conditioned rollouts of the world model."
- Stage 0: Main Model Warmup（§4.2，小标题原文）：端到端训练主 VLM 做轨迹预测、latent token 嵌在 assistant response 中（§4.2 原句 "Stage 0 addresses this by training the main VLM end-to-end on the trajectory prediction task, with latent tokens embedded in each training sample’s assistant response."）；两个目的（§4.2 bullet）："Predict accurate trajectories" 与 "Develop meaningful latent representations"——"the attention mechanism allows trajectory tokens to attend to latent token positions, establishing the information routing pathways that the auxiliary decoders will later exploit."（§4.2）
- Stage 1: Auxiliary Decoder Warmup（§4.3，小标题原文）：只训两个辅助解码器（§4.3 原句）："Crucially, we freeze the main model during this stage, ensuring that the auxiliary decoders optimize against a consistent semantic distribution."（Table 9 的 Frozen 行亦标 "Main VLM"，见 3.6 节）
- Stage 2: Joint End-to-End Fine-tuning（§4.4，小标题原文）：三组件以总损失 L 联合微调（§4.4 原句 "Finally, Stage 2 jointly fine-tunes all three model components with the combined loss ⟨MATH:\mathcal{L}⟩ (Eq. 5 )."）；梯度回传形成 "virtuous cycle"（§4.4 原句）："The richer latent representations enable the main model to make better trajectory predictions (as the latent tokens carry more useful intermediate representations)." 与 "The auxiliary decoders adapt to the updated latent representations, improving their explanation quality."
- 消融佐证（§4.4 原句）："Ablation studies (see Section 5.5 ) confirm that skipping three-stage training leads to degraded performance."（实验见 3.4 节：掉 21.71 分）

## 3. 实验

### 3.1 数据与评测协议（§5.1–5.2）

- 四个 benchmark（§5.1 原句）："We evaluate OneVL on four complementary benchmarks: NAVSIM [20], ROADWork [34], Impromptu [17], and Alpamayo-R1. These datasets are chosen because they have been shown to be effective in settings where CoT reasoning is employed, or because they provide sufficient labels to construct explicit reasoning traces [78, 80, 17]."（各条 bullet：NAVSIM 源自 nuPlan 的非反应式仿真规划评测；ROADWork 面向道路施工区导航；Impromptu 由八个开放驾驶数据集蒸馏、聚焦四类非结构化 corner-case；Alpamayo-R1 提供 Chain of Causation (CoC) 标注）
- CoT 标注来源（§5.1 原句）："On NAVSIM, we leverage the CoT annotations released by AdaThinkDrive [78], the previous state-of-the-art method."；"On ROADWork, we construct CoT annotations using a similar in-house pipeline."；"On Impromptu, we build CoT annotations from the original dataset’s Q&A pairs, augmenting the data with explicit decision and root-cause labels for corner-case trajectory prediction."；"On Alpamayo-R1, we use the released checkpoint to predict the CoC labels for all training examples."（Alpamayo-R1 CoT 标签未公开、自行复现的细节见 §8.3，见 ⚠⑤）
- 指标（§5.2 原句）："On NAVSIM , all methods are evaluated using the Predictive Driver Model (PDM) score, a composite metric that jointly assesses trajectory safety, comfort, and progress. On ROADWork , we report ADE (Average Displacement Error) and FDE (Final Displacement Error) to measure waypoint accuracy. On Impromptu , in addition to ADE and FDE, we also report the trajectory prediction L2 error over the first four seconds, following the protocol of the original paper. On Alpamayo-R1 , we report ADE and FDE as well. Across all methods, we additionally report the average inference latency ."
- 基线（§5.2 原句）："We compare OneVL against two categories of baselines, all built on Qwen3-VL-4B-Instruct [5], together with previous state-of-the-art methods as stronger reference points."——AR-based：AR Answer（"This is the fastest baseline and defines the latency lower bound."）、AR CoT+Answer（"This represents the performance upper bound for explicit reasoning, at the cost of substantially higher latency."）；Latent CoT：COCONUT / CODI / SIM-CoT（三者均为 "Adapted for VLA-based autonomous driving" 的移植版，SIM-CoT 原句 "A CODI variant that adds a separate text-decoding auxiliary decoder for language interpretability."）。
- 对比的前 SOTA（§5.2 原句）："On NAVSIM ( supervised fine-tuning setting ), these methods are:"（bullet 列表）"AdaThinkDrive [78] : An 8B-parameter model with adaptive CoT reasoning for autonomous driving." "LaST-VLA [80] : An 8B-parameter vision-language-action model for autonomous driving."；"On ROADWork, we compare against YNet [34] and on Impromptu, we compare against the Impromptu VLA [17]. For Impromptu VLA, we report the result from our own replication. We also include a result obtained using the provided model checkpoint, which is shown in Table 10. On Alpamayo-R1, we compare against the Cosmos-Reason , a flow-matching-based VLA model."
- 基线训练配方（§5.2 原句）："AR-based baselines are trained for 2 epochs with a learning rate of ⟨MATH:4\times 10^{-5}⟩ and batch size 64. Latent CoT baselines are trained for 6 epochs with a learning rate of ⟨MATH:4\times 10^{-5}⟩ and batch size 64. The results of previous state-of-the-art methods, where not explicitly stated otherwise, are taken directly from the literature."

### 3.2 四个 benchmark 主结果（§5.3，Tables 1–5）

- Table 1（NAVSIM；caption 原文 "Performance comparisons on the NAVSIM benchmark. PDM-score (higher is better) and average inference latency (lower is better) for all methods. Symbol ∗ indicates the result is derived from the corresponding paper. For OneVL, we only count the parameters of the main VLM, as the auxiliary decoders are discarded during inference. The same applies to all subsequent models."）逐行照抄（"Previous State-of-the-Art"/"AR-based Baselines (4B, Qwen3-VL)"/"Latent CoT Baselines (4B, Qwen3-VL)" 三行为原表跨全列的分组行，其余格在原表不存在，此处以空串占位；「∗」为原文符号）：

| Method | Model Size | PDM-score ⟨MATH:\uparrow⟩ | Latency (s) ⟨MATH:\downarrow⟩ | Interpretability |
| --- | --- | --- | --- | --- |
| Previous State-of-the-Art | | | | |
| ⟨MATH:\circ⟩ AdaThinkDrive [78] | 8B | ⟨MATH:86.20⟩ ∗ | – | Language |
| ⟨MATH:\circ⟩ LaST-VLA [80] | 8B | ⟨MATH:87.30⟩ ∗ | – | – |
| AR-based Baselines (4B, Qwen3-VL) | | | | |
| ⟨MATH:\circ⟩ AR Answer | 4B | ⟨MATH:87.47⟩ | ⟨MATH:4.49⟩ | – |
| ⟨MATH:\circ⟩ AR CoT+Answer | 4B | ⟨MATH:88.29⟩ | ⟨MATH:6.58⟩ | Language |
| Latent CoT Baselines (4B, Qwen3-VL) | | | | |
| ⟨MATH:\circ⟩ COCONUT [41] | 4B | ⟨MATH:84.84⟩ | ⟨MATH:5.93⟩ | – |
| ⟨MATH:\circ⟩ CODI [87] | 4B | ⟨MATH:83.92⟩ | ⟨MATH:8.62⟩ | – |
| ⟨MATH:\circ⟩ SIM-CoT [106] | 4B | ⟨MATH:84.21⟩ | ⟨MATH:10.86⟩ | Language |
| ⟨MATH:\bullet⟩ OneVL | 4B | ⟨MATH:\mathbf{88.84}⟩ | ⟨MATH:\mathbf{4.46}⟩ | Vision + Language |

- Table 2（ROADWork；caption 原文 "Performance comparisons on the ROADWork benchmark. ADE and FDE (pixels; lower is better), latency (lower is better). Symbol ∗ indicates the result is derived from the corresponding paper."）逐行照抄（分组行约定同 Table 1）：

| Method | ADE(pixel) ⟨MATH:\downarrow⟩ | FDE(pixel) ⟨MATH:\downarrow⟩ | Latency (s) ⟨MATH:\downarrow⟩ | Interpretability |
| --- | --- | --- | --- | --- |
| Previous State-of-the-Art | | | | |
| ⟨MATH:\circ⟩ YNet [34] | ⟨MATH:22.68⟩ ∗ | ⟨MATH:80.78⟩ ∗ | – | – |
| AR-based Baselines (4B, Qwen3-VL) | | | | |
| ⟨MATH:\circ⟩ AR Answer | ⟨MATH:15.98⟩ | ⟨MATH:40.29⟩ | ⟨MATH:4.74⟩ | – |
| ⟨MATH:\circ⟩ AR CoT+Answer | ⟨MATH:13.18⟩ | ⟨MATH:29.98⟩ | ⟨MATH:10.74⟩ | Language |
| Latent CoT Baselines (4B, Qwen3-VL) | | | | |
| ⟨MATH:\circ⟩ COCONUT [41] | ⟨MATH:15.44⟩ | ⟨MATH:38.60⟩ | ⟨MATH:6.06⟩ | – |
| ⟨MATH:\circ⟩ CODI [87] | ⟨MATH:16.45⟩ | ⟨MATH:44.28⟩ | ⟨MATH:6.73⟩ | – |
| ⟨MATH:\circ⟩ SIM-CoT [106] | ⟨MATH:16.49⟩ | ⟨MATH:44.32⟩ | ⟨MATH:6.19⟩ | Language |
| ⟨MATH:\bullet⟩ OneVL | ⟨MATH:\mathbf{12.49}⟩ | ⟨MATH:\mathbf{28.80}⟩ | ⟨MATH:\mathbf{4.71}⟩ | Vision + Language |

- Table 3（Impromptu，ADE/FDE；caption 原文 "Performance comparisons on the Impromptu benchmark. ADE and FDE (meters; lower is better), latency (lower is better)."）逐行照抄（分组行约定同 Table 1）：

| Method | Model Size | ADE(m) ⟨MATH:\downarrow⟩ | FDE(m) ⟨MATH:\downarrow⟩ | Latency (s) ⟨MATH:\downarrow⟩ | Interpretability |
| --- | --- | --- | --- | --- | --- |
| Previous State-of-the-Art | | | | | |
| ⟨MATH:\circ⟩ Impromptu VLA [17] | 3B | ⟨MATH:1.60⟩ | ⟨MATH:4.28⟩ | ⟨MATH:6.10⟩ | – |
| AR-based Baselines (4B, Qwen3-VL) | | | | | |
| ⟨MATH:\circ⟩ AR Answer | 4B | ⟨MATH:1.46⟩ | ⟨MATH:4.03⟩ | ⟨MATH:4.24⟩ | – |
| ⟨MATH:\circ⟩ AR CoT+Answer | 4B | ⟨MATH:1.42⟩ | ⟨MATH:3.96⟩ | ⟨MATH:6.84⟩ | Language |
| Latent CoT Baselines (4B, Qwen3-VL) | | | | | |
| ⟨MATH:\circ⟩ COCONUT [41] | 4B | ⟨MATH:1.49⟩ | ⟨MATH:4.07⟩ | ⟨MATH:5.27⟩ | – |
| ⟨MATH:\circ⟩ CODI [87] | 4B | ⟨MATH:1.86⟩ | ⟨MATH:5.18⟩ | ⟨MATH:5.24⟩ | – |
| ⟨MATH:\circ⟩ SIM-CoT [106] | 4B | ⟨MATH:2.43⟩ | ⟨MATH:6.10⟩ | ⟨MATH:5.09⟩ | Language |
| ⟨MATH:\bullet⟩ OneVL | 4B | ⟨MATH:\mathbf{1.34}⟩ | ⟨MATH:\mathbf{3.70}⟩ | ⟨MATH:\mathbf{4.02}⟩ | Vision + Language |

- Table 4（Impromptu，轨迹 L2 误差；caption 原文 "Performance comparisons on the Impromptu benchmark. We report trajectory prediction L2 error following the benchmark setting (meters; lower is better)."）逐行照抄（原表头为两行：首行 "Traj. Pred. L2 Error (m)" 跨全列，次行为列名；笔记表头系合并改写，数据行逐字照抄；分组行约定同 Table 1）：

| Method | 1s ⟨MATH:\downarrow⟩ | 2s ⟨MATH:\downarrow⟩ | 3s ⟨MATH:\downarrow⟩ | 4s ⟨MATH:\downarrow⟩ | Avg. ⟨MATH:\downarrow⟩ |
| --- | --- | --- | --- | --- | --- |
| Previous State-of-the-Art | | | | | |
| ⟨MATH:\circ⟩ Impromptu VLA [17] | ⟨MATH:0.14⟩ | ⟨MATH:0.60⟩ | ⟨MATH:1.45⟩ | ⟨MATH:2.67⟩ | ⟨MATH:1.22⟩ |
| AR-based Baselines (4B, Qwen3-VL) | | | | | |
| ⟨MATH:\circ⟩ AR Answer | ⟨MATH:0.13⟩ | ⟨MATH:0.51⟩ | ⟨MATH:1.29⟩ | ⟨MATH:2.46⟩ | ⟨MATH:1.11⟩ |
| ⟨MATH:\circ⟩ AR CoT+Answer | ⟨MATH:0.13⟩ | ⟨MATH:0.51⟩ | ⟨MATH:1.27⟩ | ⟨MATH:2.44⟩ | ⟨MATH:1.09⟩ |
| Latent CoT Baselines (4B, Qwen3-VL) | | | | | |
| ⟨MATH:\circ⟩ COCONUT [41] | ⟨MATH:0.15⟩ | ⟨MATH:0.54⟩ | ⟨MATH:1.32⟩ | ⟨MATH:2.50⟩ | ⟨MATH:1.13⟩ |
| ⟨MATH:\circ⟩ CODI [87] | ⟨MATH:0.17⟩ | ⟨MATH:0.63⟩ | ⟨MATH:1.61⟩ | ⟨MATH:3.13⟩ | ⟨MATH:1.39⟩ |
| ⟨MATH:\circ⟩ SIM-CoT [106] | ⟨MATH:0.41⟩ | ⟨MATH:1.10⟩ | ⟨MATH:2.25⟩ | ⟨MATH:3.94⟩ | ⟨MATH:1.93⟩ |
| ⟨MATH:\bullet⟩ OneVL | ⟨MATH:\mathbf{0.13}⟩ | ⟨MATH:\mathbf{0.48}⟩ | ⟨MATH:\mathbf{1.18}⟩ | ⟨MATH:\mathbf{2.25}⟩ | ⟨MATH:\mathbf{1.01}⟩ |

- Table 5（Alpamayo-R1；caption 原文 "Performance comparisons on the Alpamayo-R1 benchmark. ADE and FDE (meters; lower is better), latency (lower is better)."）逐行照抄（分组行约定同 Table 1；FDE 一列 Cosmos-Reason 的 7.42 与 Latency 一列 AR Answer 的 3.06 为原表加粗，此表 OneVL 仅 ADE 加粗）：

| Method | Model Size | ADE(m) ⟨MATH:\downarrow⟩ | FDE(m) ⟨MATH:\downarrow⟩ | Latency (s) ⟨MATH:\downarrow⟩ | Interpretability |
| --- | --- | --- | --- | --- | --- |
| Previous State-of-the-Art | | | | | |
| ⟨MATH:\circ⟩ Cosmos-Reason | 10B | ⟨MATH:2.86⟩ | ⟨MATH:\mathbf{7.42}⟩ | – | Language |
| AR-based Baselines (4B, Qwen3-VL) | | | | | |
| ⟨MATH:\circ⟩ AR Answer | 4B | ⟨MATH:3.27⟩ | ⟨MATH:9.59⟩ | ⟨MATH:\mathbf{3.06}⟩ | – |
| ⟨MATH:\circ⟩ AR CoT+Answer | 4B | ⟨MATH:2.99⟩ | ⟨MATH:8.54⟩ | ⟨MATH:3.51⟩ | Language |
| Latent CoT Baselines (4B, Qwen3-VL) | | | | | |
| ⟨MATH:\circ⟩ COCONUT [41] | 4B | ⟨MATH:3.29⟩ | ⟨MATH:9.48⟩ | ⟨MATH:3.76⟩ | – |
| ⟨MATH:\circ⟩ CODI [87] | 4B | ⟨MATH:3.22⟩ | ⟨MATH:9.25⟩ | ⟨MATH:3.85⟩ | – |
| ⟨MATH:\circ⟩ SIM-CoT [106] | 4B | ⟨MATH:3.40⟩ | ⟨MATH:9.85⟩ | ⟨MATH:3.78⟩ | Language |
| ⟨MATH:\bullet⟩ OneVL | 4B | ⟨MATH:\mathbf{2.62}⟩ | ⟨MATH:7.53⟩ | ⟨MATH:3.23⟩ | Vision + Language |

- 读数一：超 prior SOTA（§5.3 原句）："Specifically, OneVL achieves 88.84 PDM-score, surpassing the previous supervised finetuned SOTA AdaThinkDrive (86.20) and LaST-VLA (87.30) by +2.64 and +1.54, respectively. On ROADWork, OneVL also achieves 12.49 ADE and 28.80 FDE, significantly surpassing the previous SOTA YNet (22.68/80.78), respectively. The same pattern is observed on the Impromptu and Alpamayo-R1 datasets. Besides, OneVL outperforms all AR-based, latent CoT, and notably, explicit CoT baselines."
- 读数二：唯一承认的反例（§5.3 原句）："On the Alpamayo-R1 dataset, OneVL underperforms in FDE with a slight margin (7.53 vs. 7.42). This is expected, as Cosmos-Reason uses RL to further enhance its capabilities."
- 读数三：延迟（§5.3 原句）："On NAVSIM, OneVL with prefill inference achieves 4.46 latency, essentially identical to AR answer-only prediction (4.49s). This validates the core efficiency claim of our approach." 及 "On ROADWork, Impromptu, and Alpamayo-R1, we observe a similar speed-up effect, where OneVL achieves 4.71s, 4.02s, and 3.23s latency respectively, which are comparable to or even lower than those of answer-only prediction. In all cases, OneVL inference is much faster than the AR CoT+Answer baseline."
- 读数四：latent CoT 移植版整体失败（§5.3 原句）："All three adapted latent CoT methods perform substantially worse than answer-only AR prediction, except for the Alpamayo-R1 dataset. This is a critical finding that purely linguistic latent CoT approaches that were designed for text-only reasoning tasks do not transfer effectively to the multimodal spatial-temporal domain of autonomous driving trajectory prediction."（论文自己补的一条公允注记，§5.3 原句："A further likely factor is that these baselines are not trained with OneVL’s staged recipe ( Section 4 ), so their latent streams may remain poorly aligned with trajectory and multimodal supervision when optimization starts fully coupled."）
- 读数五：显式 CoT 有效（§5.3 原句）："Comparing AR CoT+Answer (88.29) to AR Answer (87.47) on NAVSIM confirms that explicit reasoning supervision provides meaningful trajectory improvements (+0.80 PDM-score). We can observe similar patterns on ROADWork, Impromptu, and Alpamayo-R1."

### 3.3 文本 CoT 解释质量（§5.4，Table 6）

- 评测集与对照（§5.4 原句）："We evaluate the language explanations produced by the language auxiliary decoder against the ground-truth CoT annotations on the 500 NAVSIM test set. We compare against the AR CoT+Answer baseline (which generates explicit CoT autoregressively) and SIM-CoT (the only prior latent CoT method with language interpretability)."
- 三个指标（§5.4 bullet，要点）：Meta Action Accuracy——对 CoT 结尾的 driving decision 做 "exact string match accuracy"（§5.4）；STS Score——用 "a cross-encoder reranker (BGE-reranker-v2-m3 [11])" 计算语义相似度，"We apply global min-max normalization across all methods and examples to obtain scores in ⟨MATH:[0,1]⟩."（§5.4）；LLM-as-Judge Score——"we also employ a state-of-the-art proprietary VLM, gemini-3.1-flash-lite-preview, as an automated evaluator."（§5.4，judge 模型按感知/运动状态/自车决策/语言流畅性四条标准打 0-100 分后归一化；完整 prompt 在 §8.4，temperature 0.1）
- Table 6（Text CoT quality on the NAVSIM test set；caption 原文 "Meta Action Acc. measures exact match of the predicted driving decision against the ground-truth meta action. STS score reports the mean semantic similarity score (global min-max normalized). LLM Judge reports the mean VLM evaluation score (normalized to ⟨MATH:[0,1]⟩; see Appendix 8.4 for the full prompt). Higher is better for all metrics."）逐行照抄：

| Method | Meta Action Acc. ⟨MATH:\uparrow⟩ | STS ⟨MATH:\uparrow⟩ | LLM Judge ⟨MATH:\uparrow⟩ | Avg. ⟨MATH:\uparrow⟩ |
| --- | --- | --- | --- | --- |
| ⟨MATH:\circ⟩ AR CoT+Answer | 73.20 | 79.75 | 81.86 | 78.27 |
| ⟨MATH:\circ⟩ SIM-CoT | 67.20 | 76.25 | 78.73 | 74.06 |
| ⟨MATH:\bullet⟩ OneVL (lang. aux.) | 71.00 | 78.26 | 79.13 | 76.13 |

- 读数（§5.4 原句）："Specifically, OneVL achieves a Meta Action Accuracy of 71.00, a significant 3.8 improvement over SIM-CoT (67.20). This indicates that our latent representation more effectively captures and decodes the critical high-level driving intents. In terms of semantic alignment, OneVL reaches an STS score of 78.26 and an LLM Judge score of 79.13, narrowing the gap to the autoregressive baseline (AR CoT+Answer). While the AR model maintains the highest scores across all metrics, it requires explicit sequential text generation."（即解释质量仍是 AR 显式 CoT 最强，OneVL 次之、SIM-CoT 最弱）

### 3.4 消融：组件与三阶段训练（§5.5，Table 7）

- Table 7（Ablation study on each component in OneVL .；caption 原文即此一句）逐行照抄（✓/– 照原文；"OneVL w/o lang.e dec." 的 "lang.e" 系原文笔误，照抄）：

| Model Variant | Lang. Aux. Dec. | Vis. Aux. Dec. | Staged Train | PDM-score ⟨MATH:\uparrow⟩ |
| --- | --- | --- | --- | --- |
| ⟨MATH:\circ⟩ OneVL w/o vis. dec. | ✓ | – | ✓ | 87.97 |
| ⟨MATH:\circ⟩ OneVL w/o lang.e dec. | – | ✓ | ✓ | 88.53 |
| ⟨MATH:\circ⟩ OneVL w/o staged train | ✓ | ✓ | – | 67.13 |
| ⟨MATH:\bullet⟩ OneVL (full configuration) | ✓ | ✓ | ✓ | 88.84 |

- 设置（§5.5 原句）："For OneVL w/o language decoder, and OneVL w/o visual decoder, we follow the same training recipe as OneVL, but without the language or visual auxiliary decoders. For OneVL w/o staged train, we use the same architecture as OneVL, but directly optimize the model with the end-to-end joint learning with the same training setting as stage 3."
- 组件贡献（§5.5 原句）："Comparing OneVL w/o visual decoder (87.97) to the full OneVL model (88.84), we find that the visual auxiliary decoder contributes +0.87 score."；"A comparison between OneVL without its language decoder (88.53) and the full OneVL model (88.84) validates the contribution of the language auxiliary decoder and language latent tokens, yielding a modest performance gain of +0.31. While the absolute improvement is small, it demonstrates that encoding language-based reasoning into compact latent tokens can enhance trajectory prediction performance."（§5.7 重复了这对数字并断言 "The visual auxiliary decoder contributes +0.87 PDM-score compared to +0.31 for the language auxiliary decoder."）
- 三阶段不可省（§5.5 原句）："Direct end-to-end joint fine-tuning fails catastrophically, causing the PDM-Score to drop by 21.71 points (from 88.84 to 67.13). This drastic performance gap underscores the necessity of the staged approach."
- 失败机理（§5.5 原句）："First, the direct approach suffers from severe “gradient shock” at initialization, with an exploding gradient norm of 378.22 that destabilizes the pre-trained backbone. In contrast, the three-stage strategy maintains a stable gradient norm of 0.28 by properly warming up the latent tokens. Second, the end-to-end method causes catastrophic task interference. The backbone struggles to optimize conflicting objectives simultaneously, resulting in a much higher final trajectory prediction loss (0.186 vs. 0.136), showing that the model converges into a local minimum and consequently has poor driving performance."
- 定性佐证（§5.5 原句）："Under the full OneVL recipe (a), the visual auxiliary decoder produces spatially coherent previews for ⟨MATH:t+1⟩ and ⟨MATH:t+2⟩ that match plausible ego motion and scene layout, demonstrating a consistent and reasonable visual chain-of-thought. In contrast, for the ablated training setup (b), the decoded frames are totally irrelevant to the input, which introduces noise."（Fig. 8；"the visual auxiliary decoder overfits, taking shortcuts and memorizing data instead of learning to generalize"，§5.5）

### 3.5 部署变体：MLP 回归头（§5.6，Table 8）

- 动机与做法（§5.6 原句）："Closed-loop on-vehicle testing favors extremely low-latency trajectory prediction. However, autoregressive decoding waypoints still dominate the budget even when latent reasoning is prefilled. To explore a deployment-oriented variant, we append a compact MLP head on top of the same Qwen3-VL-4B-Instruct backbone (using the hidden state of the last latent token as the input)."
- Table 8（Accuracy-latency trade-off for real-time deployment on NAVSIM.；caption 原文即此一句）逐行照抄：

| Variant | PDM-score ⟨MATH:\uparrow⟩ | latency (s) ⟨MATH:\downarrow⟩ |
| --- | --- | --- |
| ⟨MATH:\circ⟩ OneVL (regression) | 86.83 | 0.24 |
| ⟨MATH:\bullet⟩ OneVL (AR) | 88.84 | 4.46 |

- 读数（§5.6 原句）："The MLP head reaches 86.83 PDM-score with 0.24s inference latency, whereas full OneVL keeps 88.84 with 4.46s inference latency, achieving a 5.4% of the AR model’s latency. At ⟨MATH:1/0.2405\approx 4.16⟩ Hz end-to-end, the MLP variant meets a typical on-vehicle few-Hz budget while remaining in a competitive performance relative to strong prior models ( e.g . , LaST-VLA)."

### 3.6 训练配置（§8.2，Table 9）与 Impromptu 复现（§8.5，Table 10）

- 预训练阶段（§8.2 原句）："This phase uses ⟨MATH:13\,040⟩ optimizer steps and a global batch size of ⟨MATH:256⟩, rather than a fixed epoch count."
- Table 9（Training hyperparameters for OneVL.；caption 原文即此一句）逐行照抄（⟨MATH:13\,040⟩ 即 13,040 的 LaTeX 千分位写法；"Zero-2" 照原文）：

| Hyperparameter | Pre-training | Stage 0 | Stage 1 | Stage 2 |
| --- | --- | --- | --- | --- |
| Steps | ⟨MATH:13\,040⟩ | – | – | – |
| Epochs | – | 2 | 1 | 5 |
| Batch (global) | ⟨MATH:256⟩ | 64 | 64 | 64 |
| Learning rate | ⟨MATH:1{\times}10^{-4}⟩ | ⟨MATH:4{\times}10^{-5}⟩ | ⟨MATH:1{\times}10^{-4}⟩ | ⟨MATH:1{\times}10^{-4}⟩ |
| LR schedule | Cosine | Cosine | Cosine | Cosine |
| Optimizer | AdamW | AdamW | AdamW | AdamW |
| Precision | BF16 | BF16 | BF16 | BF16 |
| Parallelism | Zero-2 | Zero-2 | Zero-2 | Zero-2 |
| Trainable | Vis aux decoder | ViT, LLM, aligner | Lang. & vis aux dec | All |
| Frozen | – | – | Main VLM | – |
| ⟨MATH:\lambda_{l}⟩ | – | – | 1.0 | 1.0 |
| ⟨MATH:\lambda_{v}⟩ | 1.0 | – | 0.1 | 0.1 |

- Table 10（Impromptu 复现对照，Appendix；caption 原文 "Performance comparisons on the Impromptu benchmark [17]. We report trajectory prediction L2 error following the benchmark setting (meters; lower is better)."）逐行照抄（原表头为两行：首行 "Traj. Pred. L2 Error (m)" 跨全列；此表数字在 HTML 中为纯文本、非数学元素；与正文 Table 4 的差别是多一行带 ∗ 的 checkpoint 行）：

| Method | 1s ⟨MATH:\downarrow⟩ | 2s ⟨MATH:\downarrow⟩ | 3s ⟨MATH:\downarrow⟩ | 4s ⟨MATH:\downarrow⟩ | Avg. ⟨MATH:\downarrow⟩ |
| --- | --- | --- | --- | --- | --- |
| ⟨MATH:\circ⟩ Impromptu VLA [17] * | 0.90 | 2.80 | 3.75 | 5.89 | 3.16 |
| ⟨MATH:\circ⟩ Impromptu VLA [17] | 0.14 | 0.60 | 1.45 | 2.67 | 1.22 |
| ⟨MATH:\bullet⟩ OneVL | 0.13 | 0.48 | 1.18 | 2.25 | 1.01 |

- 复现声明（§8.5 原句）："Concretely, the first row marked with an asterisk (*) reports the results evaluated on the author-provided checkpoint"（脚注 3 给出 checkpoint 地址 https://huggingface.co/aaaaaap/ImpromptuVLAModel/tree/main/7B_AD），"and the second row shows the outcomes of the model trained from scratch via the official training script. As neither of these results matches the performance claimed in the original paper, we adopt the better-performing one as the representative result of Impromptu for comparative analysis in the main experiments."（⚠ 作者自认两次复现都未对上 Impromptu 原论文声称值，取两者较优者当 baseline，见 4 节 ⚠②）

### 3.7 深入分析：收益从何而来（§5.7）

- 为什么隐式推理能赢显式 token（§5.7 原句）："A natural question is why OneVL’s implicit latent reasoning achieves better performance than explicit AR CoT+Answer (88.84 vs. 88.29), despite using fewer tokens to express the reasoning." 两个机制：①"the compression benefit : compact latent tokens force the model to distill the most trajectory-relevant reasoning into a small representational bottleneck, filtering out irrelevant or redundant content. This is precisely the mechanism predicted by the information bottleneck principle [96]."；②"the world model grounding benefit : the visual auxiliary decoder objective explicitly requires the visual latent tokens to encode spatial-temporal scene dynamics (future frame content), which is directly relevant to trajectory prediction."
- 视觉监督强于语言监督的原因（§5.7 原句）："Autonomous driving trajectory prediction is fundamentally a spatial prediction task, and visual token reconstruction, i.e . , predicting what the scene looks like 0.5–1.0 seconds later, provides a supervision signal that is inherently aligned with the geometric nature of trajectory prediction." 及 "The world model decoder thus provides a harder, more causally direct compression target that language supervision alone cannot supply, which is precisely why it contributes a larger performance gain."
- Prefill 提速的量化解释（§5.7 原句）："With several additional latent tokens in the prefill phase, the overhead is negligible compared to the much longer image patch sequence already in the prefill context."（NAVSIM 上 prefill 模式 4.46s 与 AR Answer 4.49s "essentially indistinguishable"）
- 先前 latent CoT 为何失败（§5.7 bullet）：①"Lack of visual world model supervision : Without the visual auxiliary decoder forcing the latent tokens to encode spatial-temporal scene content, the latent representations collapse to encoding only language-level abstractions, losing the geometric precision needed for trajectory prediction."；②"Absence of staged training : Prior methods are typically optimized without OneVL’s three-stage pipeline ( Section 4 ), leaving language latents, visual latents, and trajectory prediction poorly aligned at the start of optimization."（并引用自家消融：staged training 但无视觉解码器 87.97 ≫ 无 staged training 67.13，"demonstrating that the curriculum alone provides substantial gains independent of the visual decoder"）

## 4. 核心结论

- 论文自述（§6 原句）："We presented OneVL, a framework for autonomous driving trajectory prediction built on a central hypothesis compression drives generalization ."（"compression drives generalization" 为论文反复强调的中心假设）及 "Empirically, OneVL achieves state-of-the-art results on NAVSIM, ROADWork, Impromptu, and Alpamayo-R1 while matching answer-only inference speed. Most notably, OneVL is the only latent CoT method to outperform explicit autoregressive CoT, providing direct evidence that tighter compression, when grounded in both linguistic and world-model supervision, yields more effective reasoning than verbose token-by-token generation. Finally, by appending a lightweight MLP regression head, OneVL retains competitive performance at only 5% of the original latency, pointing toward efficient real-world deployment."
- 三阶段的总结（§6 原句）："A three-stage training pipeline is essential for realizing this compression: Stage 0 establishes meaningful latent representations, Stage 1 aligns the decoders against a stable latent space, and Stage 2 tightens the bottleneck from both sides through bidirectional joint optimization. Ablations show that skipping this curriculum causes the compression to collapse into memorization, with a catastrophic performance drop."
- 论文自列局限（§6 Limitations 原句）："The current system requires roughly 3⟨MATH:\times⟩ memory during training, since three full 4B model instances must be held in memory. This is mitigated by DeepSpeed ZeRO-2 but still imposes nontrivial infrastructure requirements. In addition, the latent token count was chosen empirically. Thus, a systematic study of the trade-off between latent token count and representation capacity is left for future work."
- 论文自列未来方向（§6 Future Directions，要点）：轨迹 token 仍自回归解码，"Bridging this gap, for instance, through parallel or non-autoregressive trajectory decoding, is a key step toward true real-time deployment in safety-critical driving systems."；世界模型解码器扩到多相机（"would enable 360-degree future-scene prediction"）；双模态解释用于人机接口与 RL 训练信号。
- 可复用的方法论要点（均为论文声称）：
  1. latent CoT 想在 VLA 上奏效，压缩目标不能是「语言的再压缩」：纯语言 latent（COCONUT/CODI/SIM-CoT 移植版）全部低于 answer-only 基线，而加上「未来帧预测」这一世界模型监督后 latent 反超显式 CoT（Table 1：OneVL 88.84 vs AR CoT+Answer 88.29；latent 基线 83.92–84.84 vs AR Answer 87.47）。
  2. 推理期把 latent token 全部 prefill、丢弃辅助解码器，即可用 answer-only 的延迟拿到 CoT 的精度（Table 1：4.46s vs 4.49s/6.58s）；要再快就加 MLP 回归头，0.24s 换 -2.01 PDM（Table 8：86.83 vs 88.84）。
  3. 三阶段课程是多目标联合优化的前提：直接端到端联合训练从 88.84 崩到 67.13（-21.71），且梯度范数 378.22 vs 0.28、轨迹损失 0.186 vs 0.136（§5.5）；冻结主模型的 Stage 1 是为了 "optimize against a consistent semantic distribution"（§4.3）。
  4. 组件不对称：世界模型视觉监督 +0.87 > 语言监督 +0.31（Table 7/§5.5），与「轨迹预测本质是空间任务」的论证一致（§5.7）。
  5. latent token 用原词表 token 实现（4 个视觉位 → 35 个 vocab token、2 个语言位 → 20 个）而不引入新 special token——论文实测加 special token 会掉点（§3.2）。
- ⚠ 措辞提示：①Table 1/2 中 prior SOTA（AdaThinkDrive 86.20、LaST-VLA 87.30、YNet 22.68/80.78）带 ∗，caption 声明 "the result is derived from the corresponding paper"，来源与训练/评测口径与自训基线不同；且 NAVSIM 对比限定 "supervised fine-tuning setting"（§5.2）。②Impromptu 基线是作者自己的复现（非原论文数字），且 §8.5 明言 "neither of these results matches the performance claimed in the original paper"，取两次复现较优者入主表——引用 Impromptu 对比数字时注意这一层。③Alpamayo-R1 benchmark 的 CoT 标签是用其公开 checkpoint 自行复现的（§5.1："we use the released checkpoint to predict the CoC labels"），测试集也是自建的（§8.3 原句："as the original paper does not release the official test set, we subsample 700 examples from the available video clips to construct our test set."），Table 5 数字建立在这套自制协议上。④Alpamayo-R1 上 OneVL 的 FDE（7.53）其实输给 Cosmos-Reason（7.42，Table 5 原文加粗），论文解释为对方用了 RL（§5.3）。⑤解释质量上 AR 显式 CoT 三项指标全最高（Table 6），OneVL 只是「缩小差距」而非超过（§5.4 原句 "While the AR model maintains the highest scores across all metrics"）。⑥内部小不一致：§3.2 称视觉 latent 逻辑位 C_v=4，§8.1 的数据格式示例却画了 5 个 <|latent-vis|>（语言位 2 个一致）；且 §3.2 说实现上不用特殊 token（用 35/20 个原词表 token），示例中的 <|latent-vis|> 应为示意记号——以正文 §3.2 为准，存疑待 PDF 核对。⑦四个 benchmark 的延迟数字（如 4.46s/0.24s）未在本次抓取的 HTML 正文中见到测量硬件与批大小的说明，跨论文不可直接比较。⑧"first latent CoT method to surpass explicit CoT"（Abstract）限于本文的四个 benchmark 与其自训基线设定。引用本文时建议写「论文声称 / 尚未独立验证」。

## TODO

- 配图未收录：Figure 1（四 benchmark 精度-延迟对比）、Figure 2（三种 CoT 范式）、Figure 3（架构图）、Figure 4–7（四 benchmark 预测可视化）、Figure 8（三阶段 vs 过拟合的未来帧解码对比）及附录 Figure 9–22（NAVSIM/ROADWork/Impromptu/Alpamayo-R1 定性示例）未存「assets/OneVL/」，本地无素材，需用户补充或授权抓取。
- 未核对 v1（2026-04-20）/ v2（2026-05-04）与 v3（2026-05-08）正文的差异；本笔记仅基于 v3。
- 推理仓库 xiaomi-research/onevl 的 README 声称 Apache 2.0，但根目录未见 LICENSE 文件（raw LICENSE/LICENSE.md/LICENSE.txt 均 404、GitHub license API "Not Found"），license 待人工确认；HuggingFace 权重页（https://huggingface.co/collections/xiaomi-research/onevl-models ）本环境抓取失败（curl exit 000），权重托管未直接核验。
- 延迟测量的硬件环境（GPU 型号/批大小）在本次抓取的 HTML 正文中未找到，如需引用延迟绝对值建议查 PDF §5.2 或实验细节。
- §8.3 的四条 CoT 标注示例（NAVSIM/ROADWork/Impromptu/Alpamayo-R1 各一条）与 §8.4 的 LLM-as-Judge 完整 prompt 仅摘录要点未逐字全录；§8.6–8.9 定性示例未展开。
- 参考文献 [19][88]（Emu3.5/IBQ tokenizer）、[105]（Alpamayo-R1）、[78]（AdaThinkDrive）、[17]（Impromptu）等关联工作未核对原文。
- 抓取 URL 与日期：arXiv abs 页 https://arxiv.org/abs/2604.18486 （2026-11-02）；arXiv HTML 全文 v3 https://arxiv.org/html/2604.18486v3 （2026-11-02）；arXiv API 检索 all:"OneVL" 与 ti:"OneVL" https://export.arxiv.org/api/query?search_query=all:%22OneVL%22&max_results=30 、https://export.arxiv.org/api/query?search_query=ti:%22OneVL%22&max_results=30 （2026-11-02）；GitHub API https://api.github.com/repos/xiaomi-research/OneVL （2026-11-02，返回 full_name xiaomi-research/onevl）及 https://api.github.com/repos/GeorgeLuImmortal/OneVL_training （2026-11-02，license Apache-2.0）；README raw https://raw.githubusercontent.com/xiaomi-research/onevl/main/README.md （2026-11-02）；项目页 https://xiaomi-embodied-intelligence.github.io/OneVL/ （2026-11-02）。
- 表格核验：Table 1 / Table 2 / Table 3 / Table 4 / Table 5 / Table 6 / Table 7 / Table 8 / Table 9 / Table 10 已逐单元格对照 HTML 解析结果核验通过（分组行 "Previous State-of-the-Art"/"AR-based Baselines (4B, Qwen3-VL)"/"Latent CoT Baselines (4B, Qwen3-VL)" 在原表为跨全列单元格；Table 4/10 原表头为两行跨列结构，笔记表头系合并改写，数据行逐字照抄；Table 7 "OneVL w/o lang.e dec." 的 "lang.e" 与 Table 10 "Impromptu VLA [17] *" 的 " *" 均照原文；Table 1–5/9 的数字与箭头在 HTML 中为数学元素，alttext 已照录；Table 6/7 数字为纯文本）。引文核验：全部引文经脚本对照规范化提取文本（abs 页/HTML 全文/README 三个池）逐条验证存在，0 失败（见下方核验记录）。
- 关联待写项：本库 TODO.md「VLM / VLA」组其余条目（Qwen3-VL 已有 nightshift/drafts/Qwen3VL.md，为本文主干基座；OpenDriveVLA、DrivePI、Alpamago[疑即 Alpamayo-R1] 待写）与本文的关系待各自笔记展开。
