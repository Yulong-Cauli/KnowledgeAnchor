# Visual Instruction Tuning

**出处会议：** NeurIPS 2023 Oral（arXiv abs 页 Comments 原文 "NeurIPS 2023 Oral; project page: this https URL"；GitHub 仓库页面 title 原文含 "[NeurIPS'23 Oral]"）
**是否开源：** 是。GitHub https://github.com/haotian-liu/LLaVA （本次实际抓取确认存在，页面 title 原文 "GitHub - haotian-liu/LLaVA: [NeurIPS'23 Oral] Visual Instruction Tuning (LLaVA) built towards GPT-4V level capabilities and beyond. · GitHub"，license badge "License-Apache_2.0-green.svg"/spdxId Apache-2.0，README 注明 "This project utilizes certain datasets and checkpoints that are subject to their respective original licenses."）；项目页 https://llava-vl.github.io/ （abs 页 Comments 与正文作者栏均给出）；Abstract 原句 "We make GPT-4 generated visual instruction tuning data, our model, and code publicly available."（注意 arXiv v2 的 Appendix D 沿用了评审期匿名仓库的措辞 "Our source code, generated instruction-tuning data, proposed benchmark are uploaded to the anonymized GitHub repository: LLaVA-Annonymous/LLaVA."，且 checkpoint 一节写 "We’ll release the checkpoint to the public, or upon request with reviewers for this submission."，实际发布以 GitHub 仓库为准）
**关键词：** visual instruction tuning（视觉指令微调）、LLaVA: Large Language and Vision Assistant、GPT-4 仅用文本生成多模态指令数据（caption + bounding box 符号化）、LLaVA-Instruct-158K、CLIP ViT-L/14 + 线性投影 + Vicuna、两阶段训练（特征对齐预训练→端到端微调）、LLaVA-Bench（COCO / In-the-Wild）、GPT-4 作 judge 的相对分评测、ScienceQA 92.53%、GPT-4 模型集成

> 来源与核验（抓取日期 2026-11-02）：
> - arXiv abs 页 https://arxiv.org/abs/2304.08485 ，标题 "Visual Instruction Tuning"，作者 Haotian Liu, Chunyuan Li, Qingyang Wu, Yong Jae Lee（v1 2023-04-17，v2 2023-12-11），主题为多模态指令微调，与任务给定标题、作者（Liu 等）、机构（威斯康星-麦迪逊 & 微软）吻合，允许使用。v2 作者栏 affiliation 原文 "Affiliation: University of Wisconsin–Madison      Microsoft Research      Columbia University"（v2 已并列 Columbia University，任务给定机构与之相符）。
> - 歧义检查：arXiv API 检索标题 "Visual Instruction Tuning"（http://export.arxiv.org/api/query?search_query=ti:%22Visual%20Instruction%20Tuning%22&max_results=30 ，本次抓取）中精确同名仅 2304.08485v2 一篇，其余命中均为含 "Visual Instruction Tuning" 的变体标题（Comparison/Generative/Reconstructive/Personalized 等前缀，另如 "SVIT: Scaling up Visual Instruction Tuning"、"Improved Baselines with Visual Instruction Tuning"），无同名异文。
> - 全文 arXiv 官方 HTML v2 https://arxiv.org/html/2304.08485v2 （LaTeXML 渲染，页面自标 "arXiv:2304.08485v2 [cs.CV] 11 Dec 2023"，License: CC BY 4.0，本次抓取）。以下 locator（§x / Table x / Appendix x）均指该 v2 的章节与表格编号；引号为本次实际抓取文本的逐字摘录；数学记号（如 X_v、Z_v、φ、±）在 HTML 中为数学元素，摘录按其 alttext 还原并另行注明（〔…〕标记处即数学插入点；反引号内为 alttext 属性原文，属性内的换行/多空格折叠，均以脚本对照原始 HTML 验证），引文以片段 grep 验证存在。
> - 开源核对：GitHub 仓库 https://github.com/haotian-liu/LLaVA 本次实际抓取确认存在（title 见上），Apache-2.0 license badge 存在。
> - 表格逐行照抄自 HTML 解析结果并经脚本逐单元格核验（见文末「表格核验」）；本笔记为草稿（nightshift/drafts/），未经用户核阅前所有结论均属「论文声称 / 尚未独立验证」。

------

## 1. 概述

- 论文动机（Abstract 原句）："Instruction tuning large language models (LLMs) using machine-generated instruction-following data has been shown to improve zero-shot capabilities on new tasks, but the idea is less explored in the multimodal field."
- 论文核心主张（Abstract 原句）："We present the first attempt to use language-only GPT-4 to generate multimodal language-image instruction-following data." 模型定义（Abstract）："By instruction tuning on such generated data, we introduce LLaVA: Large Language and Vision Assistant, an end-to-end trained large multimodal model that connects a vision encoder and an LLM for general-purpose visual and language understanding."
- §1 的方法论定位（§1 原句）："In this paper, we present visual instruction-tuning, the first attempt to extend instruction-tuning to the language-image multimodal space, to pave the way towards building a general-purpose visual assistant."
- 四条贡献（§1 列表，逐条要点）：
  1. Multimodal instruction-following data——"We present a data reformation perspective and pipeline to convert image-text pairs into an appropriate instruction-following format, using ChatGPT/GPT-4."（§1）
  2. Large multimodal models——"We develop a large multimodal model (LMM), by connecting the open-set visual encoder of CLIP [40] with the language decoder Vicuna [9], and fine-tuning end-to-end on our generated instructional vision-language data."（§1）"When ensembled with GPT-4, our approach achieves SoTA on the Science QA [34] multimodal reasoning dataset."（§1）
  3. Multimodal instruction-following benchmark——"We present LLaVA-Bench with two challenging benchmarks, with a diverse selection of paired images, instructions and detailed annotations."（§1）
  4. Open-source——"We release the following assets to the public: the generated multimodal instruction data, the codebase, the model checkpoints, and a visual chat demo."（§1）
- 头条数字（Abstract 原句）："Our experiments show that LLaVA demonstrates impressive multimodal chat abilities, sometimes exhibiting the behaviors of multimodal GPT-4 on unseen images/instructions, and yields a 85.1% relative score compared with GPT-4 on a synthetic multimodal instruction-following dataset."（该合成数据集即 LLaVA-Bench (COCO)，见 §5.1/Table 4）；"When fine-tuned on Science QA, the synergy of LLaVA and GPT-4 achieves a new state-of-the-art accuracy of 92.53%."
- 相关工作定位（§2）：此前 LMM（Flamingo、BLIP-2、FROMAGe、KOSMOS-1）"are not explicitly tuned with vision-language instruction data"（§2 原句）："While these models present promising task transfer generalization performance, they are not explicitly tuned with vision-language instruction data, and their performance in multimodal tasks usually falls short compared to language-only tasks." 对 Flamingo 的评价（§2）："Flamingo [2] can be viewed as the GPT-3 moment in the multimodal domain, due to its strong performance on zero-shot task transfer and in-context-learning."
- 概念区分（§2 原句）："Finally, note that visual instruction tuning is different from visual prompt tuning [23]: the former aims to improve the model’s instruction-following abilities, while the latter aims to improve the parameter-efficiency in model adaptation."
- 与本库 VLA 笔记的关系（有据一句）：本库 TODO.md 将 LLaVA 与 OpenVLA、OpenDriveVLA 等同列于「VLM / VLA」待写清单；论文 §2 已把具身 LMM 纳入相关工作图景，原文仅一句 "PaLM-E [13] is an LMM for embodied AI."——LLaVA 本身不做动作输出，是后续 VLA/多模态驾驶模型所用 VLM 底座的范式源头之一（此句为笔记作者定位，非论文原话）。

## 2. 方法

### 2.1 GPT 辅助的视觉指令数据生成（§3）

- 数据缺口（§3 原句）："However, when it comes to multimodal instruction-following data, the available amount is limited, partially because the process for creating such data is time-consuming and less well-defined when human crowd-scouring is considered."
- 图像→文本符号化（§3 原句）："Specifically, in order to encode an image into its visual features to prompt a text-only GPT, we use two types of symbolic representations:" 两类为（§3 bullet）："Captions typically describe the visual scene from various perspectives;" 与 "Bounding boxes usually localize the objects in the scene, and each box encodes the object concept and its spatial location."
- 三类指令数据（§3 bullet，逐条原句）：
  1. Conversation——"We design a conversation between the assistant and a person asking questions about this photo. The answers are in a tone as if the assistant is seeing the image and answering the question." 问题覆盖 "the object types, counting the objects, object actions, object locations, relative positions between objects"，且 "Only questions that have definite answers are considered."
  2. Detailed description——"To include a rich and comprehensive description for an image, we create a list of questions with such an intent." 每张图 "we randomly sample one question from the list to ask GPT-4 to generate the detailed description."
  3. Complex reasoning——"The above two types focus on the visual content itself, based on which we further create in-depth reasoning questions. The answers typically require a step-by-step reasoning process by following rigorous logic."
- 人工标注仅限种子示例（§3 原句）："For each type, we first manually design a few examples. They are the only human annotations we have during data collection, and are used as seed examples in in-context-learning to query GPT-4."
- 规模（§3 原句）："We collect 158K unique language-image instruction-following samples in total, including 58K in conversations, 23K in detailed description, and 77k in complex reasoning, respectively."（注：原文 "77k" 小写 k，158K=58K+23K+77K）
- 教师模型选择（§3 原句）："We ablated the use of ChatGPT and GPT-4 in our early experiments, and found that GPT-4 consistently provides higher quality instruction-following data, such as spatial reasoning."

### 2.2 架构（§4.1）

- LLM 选择（§4.1 原句，句中 φ 为数学元素、按 alttext 还原后插入）：§4.1 原句 "We choose Vicuna [9] as our LLM parameterized by"〔φ〕，随后原句续 "as it has the best instruction following capabilities in language tasks among publicly available checkpoints [48, 9, 38]."（φ 的 alttext 为 `\boldsymbol{\phi}`）
- 视觉编码器（§4.1）："the pre-trained CLIP visual encoder ViT-L/14 [40]"；实验比较了 "The grid features before and after the last Transformer layer"（§4.1；消融见 3.6 节，before 为最优）。
- 视觉-语言接口（§4.1 原句）："We consider a simple linear layer to connect image features into the word embedding space." 公式 alttext 逐字：`{\bf H}_{\texttt{v}}={{\bf W}}\cdot{\bf Z}_{\texttt{v}},~\text{with}~~{\bf Z}_{\texttt{v}}=g({{\bf X}}_{\texttt{v}})`（W 为可训练投影矩阵，g 为 CLIP 视觉编码器；渲染即 H_v = W·Z_v, with Z_v = g(X_v)）。
- 轻量性的理由（§4.1 原句）："Note that our simple projection scheme is lightweight, which allows us to iterate data centric experiments quickly." 更复杂的连接方式（Flamingo 的 gated cross-attention、BLIP-2 的 Q-former）"We leave exploring possibly more effective and sophisticated architecture designs for LLaVA as future work."（§4.1）

### 2.3 训练（§4.2）

- 输入序列格式（§4.2）：多轮对话 (X_q^1, X_a^1, …, X_q^T, X_a^T) 组织为统一序列（Table 2）；第 t 轮指令 X_instruct^t 的构造，公式 alttext 逐字：`\displaystyle{{\bf X}}_{\texttt{instruct}}^{t}=\left\{\begin{matrix}&\text{Randomly choose}~~[{{\bf X}}_{\texttt{q}}^{1},{{\bf X}}_{\texttt{v}}]~~\text{or}~~[{{\bf X}}_{\texttt{v}},{{\bf X}}_{\texttt{q}}^{1}],~~~\text{the first turn}~t=1\\&{{\bf X}}_{\texttt{q}}^{t},\hskip 128.0374pt\text{the remaining turns}~t>1\end{matrix}\right.`（即首轮把图像随机置于问题前或后，其余轮次纯文本）。
- Table 2 细节（Table 2 caption 原句）："In our current implementation, we follow Vicuna-v0 [9] to set the system message and we set <STOP> = ###. The model is trained to predict the assistant answers and where to stop, and thus only green sequence/tokens are used to compute the loss in the auto-regressive model."
- 目标函数（Eq. (3)）公式 alttext 逐字：`p({{\bf X}}_{\texttt{a}}|{{\bf X}}_{\texttt{v}},{{\bf X}}_{\texttt{instruct}})=\prod_{i=1}^{L}p_{\boldsymbol{\theta}}({\color[rgb]{0.2344,0.707,0.293}\boldsymbol{x}_{i}}|{{\bf X}}_{\texttt{v}},{{\bf X}}_{\texttt{instruct},<i},{{\bf X}}_{\texttt{a},<i}),`（color 参数即绿色标记，x_i 为参与 loss 的 assistant 回答 token；§4.2 原句说明 X_v 在条件中显式出现，原句片段 "to emphasize the fact that the image is grounded for all answers"）
- Stage 1: Pre-training for Feature Alignment（§4.2，小标题原文）：
  - 数据（§4.2 原句）："To strike a balance between concept coverage and training efficiency, we filter CC3M to 595K image-text pairs." 过滤规则（Appendix E "CC3M." 节，两个数字在 HTML 中为数学元素、按 alttext 还原后插入）：用 Spacy 对全 CC3M caption 抽取 noun-phrase 并计频，原句 "We skip noun-phrases whose frequency is smaller than"〔3〕；频率更大的 "we randomly choose a subset of size"〔100〕"out of all its captions"；"This results in around 595K image-text pairs." 这些 pair 用 §3 的 naive expansion 转成单轮指令数据（§4.2）。
  - 训练对象（§4.2 原句）："In training, we keep both the visual encoder and LLM weights frozen, and maximize the likelihood of (3) with trainable parameters (the projection matrix) only." 定位（§4.2）："This stage can be understood as training a compatible visual tokenizer for the frozen LLM."
- Stage 2: Fine-tuning End-to-End（§4.2，小标题原文）（§4.2 原句）："We always keep the visual encoder weights frozen, and continue to update both the pre-trained weights of the projection layer and LLM in LLaVA"。两个用例（§4.2 bullet）：
  1. Multimodal Chatbot——"We develop a Chatbot by fine-tuning on the 158K language-image instruction-following data in Section 3. Among the three types of responses, conversation is multi-turn while the other two are single-turn. They are uniformly sampled in training."
  2. Science QA——在 ScienceQA [34] 上微调；"we organize the data as a single turn conversation"（问题+context 作指令，reasoning+answer 作回答，§4.2）。
- 训练配置（§5 原句）："We train all models with 8 A100s, following Vicuna’s hyperparameters [9]. We pre-train our model on the filtered CC-595K subset for 1 epoch with a learning rate of 2e-3 and a batch size of 128, and fine-tune on the proposed LLaVA-Instruct-158K dataset for 3 epochs, with a learning rate of 2e-5 and a batch size of 32."（数据集名 LLaVA-Instruct-158K 见 §5/Appendix D）
- 更多训练细节（Appendix C 原句）："Following Vicuna, we use the Adam optimizer with no weight decay and a cosine learning rate with a warmup ratio of 3%. During finetuning, FSDP (Full Shard Data Parallel) and gradient checkpointing is used to save GPU memory, and offloading is not used. BF16 and TF32 are enabled to achieve a balance between speed and precision." 训练时长（Appendix C）："Pretraining on CC-595K completes within 4 hours. Finetuning on Instruct-158K completes within 10 hours. Finetuning on ScienceQA completes within 4 hours."

## 3. 实验

### 3.1 评测协议（§5.1 Quantitative Evaluation）

- GPT-4 作 judge（§5.1 原句）："Inspired by [9], we leverage GPT-4 to measure the quality of generated responses." 候选模型基于问题+图像作答；参照上界用 "the text-only GPT-4" 基于 "the ground-truth textual descriptions" 生成参考答案；然后 "we feed the question, visual information (in the format of textual descriptions), and the generated responses from both assistants, to the judge (i.e., text-only GPT-4)."（§5.1）
- 打分维度（§5.1 原句）："It evaluates the helpfulness, relevance, accuracy, and level of detail of the responses from the assistants, and gives an overall score on a scale of 1 to 10, where a higher score indicates better overall performance."
- 指标定义（§5.1 原句）："We report relative scores w.r.t. the text-only GPT-4 model that uses the textural ground truth description as visual input."（即相对分，不是绝对准确率）
- 定性对比设置（§5.1）："We first use the examples in the original GPT-4 paper [36], shown in Table 3 (more examples in Appendix), that require in-depth image understanding. For comparisons, we quote the prompt and response of the multimodal GPT-4 from their paper, and query BLIP-2 and OpenFlamingo model checkpoints to get their response."（Table 3 caption 声称 "Compared to BLIP-2 [28] and OpenFlamingo [5], LLaVA accurately follows the user’s instructions, instead of simply describing the scene. LLaVA offers a more comprehensive response than GPT-4."）

### 3.2 LLaVA-Bench (COCO)（§5.1，Table 4）

- 构成（§5.1 原句）："We randomly select 30 images from COCO-Val-2014, and for each image, we generate three types of questions (conversation, detailed description, complex reasoning) using the proposed data generation pipeline in Sec. 3, totaling 90 questions."
- Table 4（Ablation on LLaVA-Bench (COCO) with different training data；caption 原文 "We report relative scores w.r.t. a text-only GPT-4 model that uses ground truth image captions and bounding boxes as visual input."）逐行照抄（括号内为与全量数据的差，照原文）：

| 训练数据 | Conversation | Detail description | Complex reasoning | All |
| --- | --- | --- | --- | --- |
| Full data | 83.1 | 75.3 | 96.5 | 85.1 |
| Detail + Complex | 81.5 (-1.6) | 73.3 (-2.0) | 90.8 (-5.7) | 81.9 (-3.2) |
| Conv + 5% Detail + 10% Complex | 81.0 (-2.1) | 68.4 (-7.1) | 91.5 (-5.0) | 80.5 (-4.4) |
| Conversation | 76.5 (-6.6) | 59.8 (-16.2) | 84.9 (-12.4) | 73.8 (-11.3) |
| No Instruction Tuning | 22.0 (-61.1) | 24.0 (-51.3) | 18.5 (-78.0) | 21.5 (-63.6) |

- 读数（§5.1 原句）："First, with instruction tuning, the model’s ability of following user instructions improves significantly by over 50 points. Second, adding a small amount of detailed description and complex reasoning questions contributes to a considerable improvement of the model’s overall capability by 7 points. Furthermore, it also improves the model’s performance on conversational questions, suggesting that improvements in reasoning capabilities complement conversational abilities. Finally, we show that having all three types of data yields the best performance at 85.1%."

### 3.3 LLaVA-Bench (In-the-Wild)（§5.1，Table 5）

- 构成（§5.1 原句）："we collect a diverse set of 24 images with 60 questions in total, including indoor and outdoor scenes, memes, paintings, sketches, etc., and associate each image with a highly-detailed and manually-curated description and a proper selection of questions."
- Table 5（Instruction-following capability comparison using relative scores on LLaVA-Bench (In-the-Wild)）逐行照抄。注：单元格中 "±" 在 HTML 中为数学元素（alttext "\pm"），caption 原文 "The results are reported in the format of mean"〔±，\pm〕"std. For the first three rows, we report three inference runs."（前三行为三次推理），脚注 "† For a given set of LLaVA decoding sequences, we evaluate by querying GPT-4 three times; GPT-4 gives a consistent evaluation."

| 方法 | Conversation | Detail description | Complex reasoning | All |
| --- | --- | --- | --- | --- |
| OpenFlamingo [5] | 19.3 ± 0.5 | 19.0 ± 0.5 | 19.1 ± 0.7 | 19.1 ± 0.4 |
| BLIP-2 [28] | 54.6 ± 1.4 | 29.1 ± 1.2 | 32.9 ± 0.7 | 38.1 ± 1.0 |
| LLaVA | 57.3 ± 1.9 | 52.5 ± 6.3 | 81.7 ± 1.8 | 67.3 ± 2.0 |
| LLaVA† | 58.8 ± 0.6 | 49.2 ± 0.8 | 81.4 ± 0.3 | 66.7 ± 0.3 |

- 读数（§5.1 原句）："Thanks to visual instruction tuning, LLaVA achieves significantly better performance compared with BLIP-2 (+29%) and OpenFlamingo (+48%)." 及 "Compared to the text-only GPT-4 that has access to ground-truth labels, LLaVA achieves an impressive 81.7% performance on complex reasoning questions, with an overall score of 67.3%."
- 规模背景（§5.1 原句）："Surprisingly, although LLaVA is trained with a small multimodal instruction-following dataset (80K unique images), it demonstrates quite similar reasoning results with multimodal GPT-4 on these examples."（158K 样本对应 80K 独立图像）

### 3.4 Limitations（§5.1）

- 任务设计意图（§5.1 原句）："This LLaVA-Bench (In-the-Wild) is designed to be challenging and to reveal a model’s weaknesses."（Table 6 给出 ramen 与 fridge 两个例子，需高分辨率细节与知识覆盖）
- 失败模式（§5.1 原句）："We also observed an interesting failure of LLaVA, as it responds with yes when asked if strawberry-flavored yogurt is present, even though the fridge contains only yogurt and strawberries. This indicates that, at times, LLaVA perceives the image as a “bag of patches”, failing to grasp the complex semantics within the image."

### 3.5 ScienceQA（§5.2，Table 7）

- 数据构成（§5.2 原句）："ScienceQA [34] contains 21k multimodal multiple choice questions with rich domain diversity across 3 subjects, 26 topics, 127 categories, and 379 skills. The benchmark dataset is split into training, validation, and test splits with 12726, 4241, and 4241 examples, respectively."
- 设置（§5.2 原句）："For LLaVA, we use the visual features before the last layer, ask the model to first predict reasons and then the answer, and train it for 12 epochs." 基线：GPT-3.5（text-davinci-002）有/无 CoT、LLaMA-Adapter、MM-CoT（"which is the current SoTA method on this dataset"，§5.2）。
- Table 7（Accuracy (%) on Science QA dataset）逐行照抄（列名：NAT = natural science, SOC = social science, LAN = language science, TXT = text context, IMG = image context, NO = no context, G1-6 = grades 1-6, G7-12 = grades 7-12，见 caption 原文；脚注 "†Text-only GPT-4, our eval."；「MM-CoTBase/MM-CoTLarge」的 Base/Large 在原文为下标）：

| 方法 | NAT | SOC | LAN | TXT | IMG | NO | G1-6 | G7-12 | Average |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Human [34] | 90.23 | 84.97 | 87.48 | 89.60 | 87.50 | 88.10 | 91.59 | 82.42 | 88.40 |
| GPT-3.5 [34] | 74.64 | 69.74 | 76.00 | 74.44 | 67.28 | 77.42 | 76.80 | 68.89 | 73.97 |
| GPT-3.5 w/ CoT [34] | 75.44 | 70.87 | 78.09 | 74.68 | 67.43 | 79.93 | 78.23 | 69.68 | 75.17 |
| LLaMA-Adapter [59] | 84.37 | 88.30 | 84.36 | 83.72 | 80.32 | 86.90 | 85.83 | 84.05 | 85.19 |
| MM-CoTBase [61] | 87.52 | 77.17 | 85.82 | 87.88 | 82.90 | 86.83 | 84.65 | 85.37 | 84.91 |
| MM-CoTLarge [61] | 95.91 | 82.00 | 90.82 | 95.26 | 88.80 | 92.89 | 92.44 | 90.31 | 91.68 |
| GPT-4† | 84.06 | 73.45 | 87.36 | 81.87 | 70.75 | 90.73 | 84.69 | 79.10 | 82.69 |
| LLaVA | 90.36 | 95.95 | 88.00 | 89.49 | 88.00 | 90.66 | 90.93 | 90.90 | 90.92 |
| LLaVA+GPT-4† (complement) | 90.36 | 95.50 | 88.55 | 89.05 | 87.80 | 91.08 | 92.22 | 88.73 | 90.97 |
| LLaVA+GPT-4† (judge) | 91.56 | 96.74 | 91.09 | 90.62 | 88.99 | 93.52 | 92.73 | 92.16 | 92.53 |

（前 6 行 caption 原文标注 "Representative & SoTA methods with numbers reported in the literature"，后 4 行为 "Results with our own experiment runs"。）
- LLaVA 单模型（§5.2 原句）："It yields 90.92% accuracy, which is quite close to the SoTA 91.68%."
- GPT-4 直接推理（§5.2 原句）："we also prompt GPT-4 using 2-shot in-context-learning and achieve 82.69% accuracy, which is a 7.52% absolute gain compared with 75.17% from GPT-3.5." 失败原因（§5.2）："For a substantial number of questions, we note that GPT-4 fails simply because it reports that there is insufficient context such as images or plots."
- 两种集成方案（§5.2，GPT-4† = text-only GPT-4）：
  1. GPT-4 complement——"Whenever GPT-4 fails to provide answers, we use the prediction from our method. This schemes yields 90.97% accuracy, which is almost the same as applying our method alone."（原文 "schemes" 系笔误，照抄）
  2. GPT-4 as the judge——"Whenever GPT-4 and LLaVA produce different answers, we prompt GPT-4 again, asking it to provide its own final answer based on the question and two outcomes." 效果（§5.2）："Surprisingly, this scheme is able to provide consistent improvement over all question classes, and achieves a new SoTA accuracy of 92.53%." 论文对此的解释（§5.2）："This is because some of these questions do not actually require the image context for a correct answer. The GPT-4 judge can identify such cases and correct some of the errors that LLaVA makes."
- 论文的自定位（§5.2 原句）："To the best of our knowledge, this is the first time that GPT-4 is used for model ensembling."

### 3.6 设计选择消融（§5.2 Ablations，Table 8）

- Table 8（Design choice ablations (%)）逐行照抄（caption 原文 "The difference with the best variant is reported in red text."，即括号内差值原文为红字）：

| Visual features | Before | Last |
| --- | --- | --- |
| Best variant | 90.92 | 89.96 (-0.96) |
| Predict answer first | - | 89.77 (-1.15) |
| Training from scratch | 85.81 (-5.11) | - |
| 7B model size | 89.84 (-1.08) | - |

- 逐项读数（§5.2 原句，均以「Best variant：13B / before-last-layer features / reasoning-first」为基准）：
  - Visual features："We tried using the last layer feature from CLIP vision encoder, which yields 89.96% and is 0.96% lower than the feature before the last layer. We hypothesize that this is because CLIP’s last layer features may focus more on global and abstract image properties compared to the layer before it, which can focus more on localized properties that are useful for understanding specific image details."
  - Chain-of-thought（答案与推理的先后）："we run both variants and observe that answer-first reports the best number 89.77% accuracy in 12 epochs, while reasoning-first can quickly reach 89.77% accuracy in 6 epochs, but no further improvement with more training. Training the model for 24 epochs does not improve the performance. We conclude that CoT-like reasoning-first strategy can largely improve convergence, but contributes relatively little to the final performance."
  - Pre-training："We skip pre-training and directly train on Science QA from scratch – performance drops to 85.81% accuracy. The 5.11% absolute degradation indicates the importance of our pre-training stage, in aligning multimodal features while preserving the vast pre-trained knowledge."
  - Model size："We keep all configurations the same as our best 13B model, and train a 7B model. This yields 89.84% accuracy, which is 1.08% lower than 90.92%, demonstrating the importance of model scale."

## 4. 核心结论

- 论文自述（§6 原句）："This paper demonstrated the effectiveness of visual instruction tuning. We presented an automatic pipeline to create language-image instruction-following data, based on which we train LLaVA, a multimodal model to follow human intent to complete visual tasks. It achieves the new SoTA accuracy when fine-tuned on ScienceQA, and excellent visual chat capabilities when fine-tuned on multimodal chat data. Besides, we present the first benchmark to study multimodal instruction-following capability."
- 后续工作指引（§6 原句）："This paper is an initial step in visual instruction tuning, and mainly focuses on real-life tasks. For more quantitative results of LLaVA on academic benchmarks, please refer to the improved baselines with visual instruction tuning [32]."（[32] 即 LLaVA-1.5 一线，本笔记未展开）
- 可复用的方法论要点（均为论文声称）：
  1. 仅用语言版 GPT-4/ChatGPT + caption/bounding box 符号化即可批量造多模态指令数据，158K 样本（80K 图像）足够把 CLIP+Vicuna 调成多模态对话助手（§3、§5.1）。
  2. 视觉-语言接口用单层线性投影即够用，轻量是为了 "iterate data centric experiments quickly"（§4.1）；视觉侧取 CLIP 倒数第二层特征优于最后一层（Table 8，90.92 vs 89.96）。
  3. 两阶段训练中特征对齐预训练不可省（Table 8：跳过掉 5.11 个点），视觉编码器两阶段全程冻结（§4.2）。
  4. text-only GPT-4 当 judge 的模型集成在 ScienceQA 上把 90.92% 提到 92.53%（Table 7），且相对分评测（GPT-4 打分 1-10、相对 text-only GPT-4 上界）是本文提出的评测框架（§5.1）。
- 风险与局限（Appendix A Broader Impact 原句）："Similar to LLMs, LLaVA might generate outputs that aren’t grounded in facts or input data. This raises concerns about inferences made, especially in critical applications (e.g., medical)." 偏差来源（Appendix A）："Bias can be transferred from the base models to LLaVA, both from the vision encoder (CLIP) and the language decoder (LLaMA/Vicuna)." §5.1 的 “bag of patches” 失败模式见 3.4 节。
- ⚠ 措辞提示：①85.1%（Table 4）是 GPT-4 作 judge 的 relative score（相对使用 GT caption+box 的 text-only GPT-4），不是绝对准确率；In-the-Wild 的 overall 也只有 67.3%（Table 5）。②ScienceQA 的 92.53% 依赖 text-only GPT-4 作 judge 的集成，不是 LLaVA 单模型（单模型 90.92%，仍低于 MM-CoT Large 的 91.68%）。③相对分评测本身依赖 GPT-4 的稳定性，论文仅自证 "GPT-4 gives a consistent evaluation"（Table 5 脚注）。引用本文时建议写「论文声称 / 尚未独立验证」。

## TODO

- 配图未收录：Figure 1（"LLaVA network architecture"）、Figure 7（"Comparison of noun-phrase statistics before and after filtering CC3M"）及 Table 1/2/3/6/9/10 等定性示例图/表未存「assets/LLaVA/」，本地无素材，需用户补充或授权抓取。
- 未核对 v1（2023-04-17）与 v2（2023-12-11）正文的差异；本笔记仅基于 v2。
- 附录 E/F 的完整 prompt 模板（Table 11/12/15/16）仅概览未逐条抄录。
- 抓取 URL 与日期：arXiv abs 页 https://arxiv.org/abs/2304.08485 （2026-11-02）；arXiv HTML 全文 v2 https://arxiv.org/html/2304.08485v2 （2026-11-02）；arXiv API 检索 http://export.arxiv.org/api/query?search_query=ti:%22Visual%20Instruction%20Tuning%22&max_results=30 （2026-11-02）；GitHub https://github.com/haotian-liu/LLaVA （2026-11-02，license Apache-2.0）。
- 关联待写项（TODO.md「VLM / VLA」组）：LLaVA-1.5（Improved Baselines with Visual Instruction Tuning）、OpenVLA、OpenDriveVLA 等后续工作与本文的关系待各自笔记中展开。
- 表格核验：Table 4 / Table 5 / Table 7 / Table 8 已逐单元格对照 HTML 解析结果核验通过（± 原文为数学元素 \pm，「MM-CoTBase/MM-CoTLarge」的 Base/Large 为下标，弯引号/撇号按原文字符照抄）。
