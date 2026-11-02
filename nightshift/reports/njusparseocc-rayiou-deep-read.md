# NJU-SparseOcc RayIoU/FPS 主卡深度精读报告（signoff 前置）

**日期：** 2026-11-03
**性质：** nightshift report 班次产出；只读素材，仅新增本文件；不 git 提交
**服务对象：** `nightshift/reports/claim-map.md` §2 Top5 第 5 项 [claim-njusparseocc-rayiou34-fps17-beats-dense-baselines](../../claims/claim-njusparseocc-rayiou34-fps17-beats-dense-baselines.md) 的 signoff 前置精读，含卡 falsifier 2 的先决条件查证（BEVFormer/FB-Occ 基线行来源）

## 0. 素材、纪律与措辞约定

素材：

| 素材 | 角色 |
| --- | --- |
| `library/3D_Occupancy/NJU-SparseOcc.md` | L1 笔记，本报告分析主对象（标题为 SparseOcc，下文按论文口径称 SparseOcc） |
| `claims/claim-njusparseocc-rayiou34-fps17-beats-dense-baselines.md` | 主卡（asserted / watch，frontmatter 逐项核对） |
| `claims/claim-njusparseocc-decoder-pruning-complexity-onactive.md` | 关联卡 1（asserted / watch） |
| `claims/claim-njusparseocc-mgss-complexity-onquery-np.md` | 关联卡 2（asserted / watch） |
| `claims/claim-njusparseocc-rayiou-penalizes-thick-surface.md` | 关联卡 3（asserted / watch） |
| `nightshift/qa/round2-hgsfusion-nju.md` §B | QA 复审：主卡 FIXED（L40-L45），另 3 卡 PASS（L48-L62） |
| arXiv:2312.17118 v1–v5 PDF + Occ3D 论文 + 官方 README（本次实抓） | 论文原文独立核验源 |

本次联网抓取记录（RULES #4 要求 URL + 日期，全部 2026-11-03 抓取，pdftotext 提取至工作区外临时目录 /tmp/ka-fetch-sparseocc/、/tmp/ka-fetch-occ3d/，不入库）：

| URL | 实得内容 |
| --- | --- |
| `https://arxiv.org/pdf/2312.17118v5` | **arXiv:2312.17118v5 [cs.CV] 19 Jul 2024**，15 页（ECCV 2024 camera-ready，题 "Fully Sparse 3D Occupancy Prediction"），主核验源；`-layout`/`-raw` 双模式 |
| `https://arxiv.org/pdf/2312.17118v4` | v4 [cs.CV] 18 Jul 2024（Table 1 与 v5 同） |
| `https://arxiv.org/pdf/2312.17118v3` | v3 [cs.CV] 8 Apr 2024（Table 1 与 v5 同；本文 RayIoU 口径自此版起） |
| `https://arxiv.org/pdf/2312.17118v2` / `v1` | v2 [cs.CV] 29 Dec 2023 / v1 [cs.CV] 28 Dec 2023，均为旧题 "Fully Sparse 3D **Panoptic** Occupancy Prediction"，指标为体积 IoU/mIoU（FPS 在 V100 上测、无基线 FPS 表） |
| `https://arxiv.org/pdf/2304.14365v3` | Occ3D 数据集论文 v3 [cs.CV] 13 Dec 2023（验证其无 RayIoU 指标） |
| `https://raw.githubusercontent.com/MCG-NJU/SparseOcc/main/README.md` | 官方仓库 README 当前版（model zoo 仅 SparseOcc 自身 checkpoint，无基线行） |

纪律与措辞约定（同姊妹报告 OmniQuant）：不判论文对错，只评证据结构；论文结论一律"论文声称，尚未独立验证"；全部引文 quote + locator 逐字并经 `grep -F` 验证（附录 A）；证据强度 ★★★/★★/★ 为本报告自定义评估尺度，不构成对卡 status 的变更建议。PDF 提取规则：主用 `pdftotext -raw`，正文跨行引文按空格拼接还原（不加字、不改字），附录按所在行逐行 fragment 验证。

**先说明一个影响全文的口径**：论文摘要计"7 history frames"，Table 1 计"8f"（v1 Table 1 caption：“8f” means fusing temporal information from 7+1 frames）——同一配置的两种帧数口径（7 历史 + 当前 = 8 融合）。笔记表写"7帧"（摘要口径），本报告引用时注明口径，不判对错。

## 1. 核心论证链：全稀疏架构 → RayIoU 34.0 / 17.3 FPS 高于同表稠密基线

### 1.1 环节一（表征前提）：场景 >90% 体素为空，稀疏表示可行 —— ★★★（论文侧量化充分）

论文声称（尚未独立验证）：占据场景中 >90% 体素为空，稠密 3D 特征不必要。三处独立表述（locator：v5 PDF §3.1 p.4 / §1 p.1-2 / §5.2 p.8；-raw 提取，跨行拼接）：

> "As in our statistics, we find that over 90% of the voxels in the scene are free."
> "We statistic the geometry sparsity and find that more than 90% of the voxels are empty. This manifests a large room in occupancy prediction acceleration by exploiting the sparsity."
> "In contrast, SparseOcc discards over 90% of voxels while still effectively modeling the geometry of the scene and capturing fine-grained details."

且消融给出了量化刻度（locator：v5 PDF §5.3 p.9 与 Fig. 8(a) 讨论段；-raw 提取，跨行拼接）：

> "Instead, our sparse voxel decoder produces sparse 3D features in the shape of K × C (where K = 32000 ≪ 200×200×16),"
> "Starting from a modest value of 16k, we observe that the optimal performance occurs when k is set to 32k ∼ 48k, which is only 5% ∼ 7.5% of the total number of dense voxels (200×200×16 = 640000)."

**证据强度 ★★★**：32000/640000 = 5% 保留（95% 剪除）是论文自给的算术，与 ">90%" 三处表述同向；k 的消融（16k–56k）是作者实测曲线。
**限定（关联卡 1 的口径修正点）**：笔记 L99 写"解码器在**低分辨率阶段**物理抹除了 >90% 的背景空间节点"——论文的 95% 数字对应的是**最终分辨率下**的 token 数（K=32000 对 200×200×16），"低分辨率阶段即抹除 90%"是笔记的推断性重排；且论文明确**实现用的是 top-k 而非阈值**："Here we have two approaches for pruning: one is based on a threshold (e.g., only keeps score > 0.5); the other is by top-k selection. In our implementation, we simply keep voxels with top-k occupancy scores for training efficiency."（v5 §3.1，-raw）。关联卡 1 scope 中"每层 MLP 占据得分二分类硬剪枝（仅保留 s>τ）"是论文的**设计选项之一**，非最终实现路径——卡内"τ 取值待回原文"的空位本轮有了答案（阈值示例 0.5，推理替代阈值 0.7，但正式实现是 top-k=32000），见 §3.2。

### 1.2 环节二（主结果）：Table 1 双数字复核 —— 核心数字成立，基线行与 camera-ready 不符（本报告核心发现）

**34.0 / 17.3 / 7 帧三个核心数字实抓复核（v5）**：

摘要逐字（locator：v5 PDF Abstract p.1；-raw 提取）：

> "SparseOcc demonstrates its effectiveness by achieving a RayIoU of 34.0, while maintaining a real-time inference speed of 17.3 FPS, with 7 history frames inputs."

§1 正文给硬件口径（locator：v5 PDF §1 p.2；-raw 提取）：

> "Thanks to the sparsity design, SparseOcc achieves 34.0 RayIoU on Occ3D-nuScenes [50], while maintaining a real-time inference speed of 17.3 FPS (Tesla A100, PyTorch fp32 backend), with 7 history frames inputs."

Table 1 行逐字（locator：v5 PDF p.8 Table 1；-raw 提取）：

> "BEVFormer (4f) [27] R101 1600×900 24 32.4 26.1 32.9 38.0 39.2 3.0"
> "FB-Occ (16f) [28] R50 704×256 90 33.5 26.7 34.1 39.7 39.1 10.3"
> "SparseOcc (8f) R50 704×256 24 34.0 28.0 34.7 39.4 30.1 17.3"
> "SparseOcc (16f) R50 704×256 24 35.1 29.1 35.8 40.3 30.6 12.5"

（Table 1 caption："3D occupancy prediction performance on Occ3D-nuScenes [50]. We use RayIoU to compare our SparseOcc with other methods." 与 "SparseOcc outperforms all existing methods under a weaker setting." 列序 Method / Backbone / Input Size / Epoch / RayIoU / RayIoU 1m,2m,4m / mIoU / FPS。§5.1："FPS is measured on a Tesla A100 GPU with the PyTorch fp32 backend."）

RayIoU 34.0（Table 1 "8f" 行）= 摘要 34.0（"7 history frames" 口径）——**双数字与帧数在摘要、正文、Table 1 三处自洽**，较 QA round2（仅摘要核对）前进一层。官方 README（2026-11-03 抓取）当前 v1.1 checkpoint 亦为 17.3 FPS、RayIoU 36.8（24 epochs，加了 BDA 与 Lovasz-Softmax；"Compared with [v1.0](https://github.com/MCG-NJU/SparseOcc/tree/v1.0) (35.0 RayIoU with 48 epochs), SparseOcc v1.1 can achieve 36.8 RayIoU with 24 epochs!"）——**论文 34.0 是 camera-ready 口径，仓库新 checkpoint 更高**；引用时应写明"论文口径 34.0"。

**基线行与 camera-ready 不符（逐格比对）**：

| 行 | 笔记表（L93/L94/L95） | v5 Table 1（本轮实抓） | 差异 |
| --- | --- | --- | --- |
| BEVFormer | 4帧 / 32.2 / 2.3 | (4f) R101 1600×900 24ep / **32.4** / **3.0** | RayIoU 差 0.2、FPS 差 0.7 |
| FB-Occ | 16帧 / 33.7 / 5.2 | (16f) R50 704×256 90ep / **33.5** / **10.3** | RayIoU 差 0.2（反向）、FPS 差一倍 |
| SparseOcc | 7帧 / 34.0 / 17.3 | (8f) R50 704×256 24ep / 34.0 / 17.3（帧数口径 8f=7+1） | 数字一致 |

v4（18 Jul 2024）与 v3（8 Apr 2024）的 Table 1 与 v5 逐格相同；v1/v2 为 panoptic 旧版，Table 1 是体积 IoU/mIoU 逐类表、**无基线 FPS 列**（v2 自身 FPS 在 V100 上测："FPS is measured on a V100 GPU with the PyTorch backend."）。即**笔记两条基线行与全部五个 arXiv 版本都不匹配**。

**证据强度**：核心数字（34.0 / 17.3）★★★；"高于同表稠密基线"的**方向**在 v5 下仍成立（34.0 > 33.5 > 32.4），但卡内引用的基线数字与倍数（RayIoU 只高 0.3–1.8；FPS 3.3×/7.5×）按 v5 应为 **RayIoU 高 0.5–1.6；FPS 对 FB-Occ 17.3/10.3 ≈ 1.68×、对 BEVFormer 17.3/3.0 ≈ 5.77×**——优势幅度比卡内表述缩水（FB-Occ 的 FPS 尤甚）。

### 1.3 环节三（先决条件答复）：BEVFormer / FB-Occ 两行出自论文哪张表、是否官方数据

这是本卡 falsifier 2 的先决条件（"两行的 RayIoU 与 FPS 系引用各自原文……并非同硬件同协议测得"），本轮查证结论分三层：

**第一层：两行数字出自论文 Table 1（v3/v4/v5，p.8），是论文自己的对比表，非笔记杜撰；但笔记抄写的数值与 camera-ready 原表不一致（§1.2）。**

**第二层：「引用各自原文」这一假设可被排除（结构性证据，不需要作者确认）**：

1. RayIoU 是 SparseOcc 本文提出的指标（"we propose a new evaluation metric: Ray-level mIoU (RayIoU for short)."，v5 §4.2 p.6）；BEVFormer（CVPR 2022）与 FB-Occ（CVPR 2023 占据挑战赛方案）原论文不可能报告一个当时尚不存在的指标。
2. 数据集论文 Occ3D（arXiv:2304.14365v3，2026-11-03 实抓全文提取）**无 RayIoU / ray-based IoU 指标定义**（grep -i "rayiou" 0 命中；其基准表 BEVFormer 行为体积 mIoU 口径）——基线 RayIoU 也不是引自数据集基准。
3. 故两行的 RayIoU **必然**是 SparseOcc 作者侧在自建评测器下产生的数字（复跑复现或重新评测）。作者侧确有训练 BEVFormer/FB-Occ 的直接证据："For instance, we train two variants of BEVFormer: one uses the visible mask during training, and the other does not."（v5 §5.4 p.10，-raw 提取；Table 4 即作者自训 BEVFormer/FB-Occ 的逐类 RayIoU）。
4. FPS 侧同理：BEVFormer/FB-Occ 原论文无此评测脚本下的 FPS；Table 1 的 FPS 列与 §5.1 的测量口径（A100 fp32）同表出现，读作统一口径的作者侧测量是唯一自洽解释——**但论文没有像 OmniQuant 复现 SmoothQuant 那样写一句"基线由我们复现/我们测量"的明文**，Table 1 也无"复现值"标记。论文内能确认的是"不是引用各自原文"，不能确认的是"复现细节（哪个 checkpoint、是否作者重训、fps 是否含数据加载）"。

**第三层：笔记数值 32.2/2.3、33.7/5.2 的出处**：已核查 v1–v5 全部 Table 1、Occ3D 论文、官方 README 当前版（model zoo 无基线行；README 的 FPS 口径句 "FPS is measured with Intel(R) Xeon(R) Platinum 8369B CPU and NVIDIA A100-SXM4-80GB GPU (PyTorch `fp32` backend, including data loading)."）——**均无此组数字，来源不明**。不排除出自论文某个中间稿或第三方转引，但本次公开渠道查不到，按 RULES #4 如实记"查不清"。

**对卡的影响**：falsifier 2 的前半（"系引用各自原文"）——**已排除**，卡签署时该风险可以降级为"复现细节论文未写明"；falsifier 2 的后半（"并非同硬件同协议测得，失去可比性"）——论文内证据不足以完全关闭，但表内逐行给了 Backbone / Input Size / Epoch，且 FPS 测量句在 §5.1 统一语境下，可比性风险为中低而非"来源不明"。**falsifier 3（对照 v5 原文表格核对发现笔记表格转抄错误）——本轮实锤了一半**：基线行数字确与 v5 不符；但方向性主张不反转（34.0 仍最高）。

### 1.4 环节四（机制支撑）：同表受控消融 —— ★★★（论文内最强的一环）

论文声称（尚未独立验证）：速度优势来自稀疏表示本身，有两张同配置受控消融：

- 解码器消融（locator：v5 PDF p.9 Table 2；-raw 提取）：

> "Dense coarse-to-fine 29.9 24.0 30.4 35.4 6.3"
> "Sparse coarse-to-fine 29.9 23.9 30.5 35.2 24.0"

（同精度 29.9 RayIoU 下 6.3 → 24.0 FPS，约 3.8×："Our sparse voxel decoder achieves nearly 4× faster inference speed than the dense counterparts."）

- 掩码交叉注意力消融（locator：v5 PDF p.9 Table 3；-raw 提取）：

> "Dense cross attention 28.7 22.9 29.3 33.8 16.2"
> "+ Mask-guided 29.2 23.4 29.8 34.5 24.0"

（掩码引导稀疏采样比稠密交叉注意力同表更高且更快：28.7@16.2 → 29.2@24.0。）

**证据强度 ★★★**：同框架内只换一个组件、精度与速度双指标同报——这是论文内最接近因果级证据的部分；也**回应了关联卡 2（MGSS 卡）scope 中"笔记无该模块消融数字"的空位**：笔记确实没有，但论文 Table 3 有（见 §3.2）。
**限定**：消融是单帧/低分辨率设置下的组件级对比，不能直接外推出 Table 1 的 17.3 FPS 终值；§5.4 的 visible-mask 研究（BEVFormer 自训两变体，mIoU +15 / RayIoU −1）支撑 RayIoU 的抗作弊动机，但属指标层而非速度层证据。

### 1.5 环节五（指标层）：RayIoU 定义与聚合 —— 论文口径与笔记/卡一致

TP 判定、阈值与聚合（locator：v5 PDF §4.2 p.6 与 §5 Experiments p.8；-raw 提取）：

> "A query ray is classified as a true positive (TP) if the class labels coincide and the L1 error between the ground-truth depth and the predicted depth is less than a certain threshold (e.g., 2m)."
> "The query rays originate from 8 LiDAR positions of the ego path. We calculate RayIoU under three distance thresholds: 1, 2 and 4 meters. The final ranking metric is averaged over these distance thresholds."

抗"加厚表面"原句（locator：v5 PDF §4.2 p.7；-raw 提取）：

> "Since the query ray calculates the distance to the first voxel it touches, the model cannot obtain a higher IoU by predicting a thicker surface."

这关闭了关联卡 3（RayIoU 卡）scope 的两个"笔记未记录"空位：三档阈值聚合方式 = **按类别算 F1 型 IoU（Eq.3）后对 1/2/4m 三档取平均**；射线源 = 自车轨迹 8 个 LiDAR 位置；无 GT 交点的射线被排除（"In case a ray does not intersect with any voxel present in the ground truth, it will be excluded from the evaluation process."，v5 §4.2，-raw 提取）。卡内"是否含软计分"亦可答：论文口径为硬阈值 TP 判定。

### 1.6 论证链总览

```
环节一 场景 >90% 空（§3.1/§5.3 统计+k 消融）★★★
        ↓
环节五 RayIoU 指标（§4.2 定义，1/2/4m 三档均值）——抗加厚作弊
        ↓
环节四 组件受控消融（Table 2 解码器 3.8×、Table 3 MGSS）★★★   ← 速度优势的机制证据
        ↓
环节二 主结果 Table 1：34.0 / 17.3 高于稠密基线                 ← 基线行数字须按 v5 修正
        ↓
   结论（论文声称）：全稀疏管线同时拿到 RayIoU 与实时性
```

（与 BEV-Planner 报告不同的结构点：这条链没有跨论文的干预实验，速度优势的因果证据全部在**论文自家的组件消融**里，主表只是终值展示——所以环节四反而比环节二更硬。）

## 2. 主卡逐项核对（卡 ↔ 笔记 ↔ v5 原文）

| 项 | 卡内表述 | 笔记 | v5 原文 | 判定 |
| --- | --- | --- | --- | --- |
| RayIoU 34.0 | 主张核心 | L95（34.0） | Table 1 SparseOcc (8f) 行 34.0；摘要同 | 一致，本轮升级为表格级核对 |
| FPS 17.3 | 主张核心 | L95（17.3） | Table 1 同行 17.3；摘要同；README checkpoint 亦 17.3 | 一致 |
| 帧数 7 | 主张核心（7 帧） | L95（7帧） | 摘要 "7 history frames"；Table 1 "8f"（=7+1，v1 caption） | 数字口径成立，须带"摘要口径"注 |
| BEVFormer 行 | 32.2 / 2.3（title、scope、evidence quote 2、falsifier 1） | L93（32.2 / 2.3） | **32.4 / 3.0** | **不一致**（笔记与卡同错） |
| FB-Occ 行 | 33.7 / 5.2（title、scope、evidence quote 3） | L94（33.7 / 5.2） | **33.5 / 10.3** | **不一致**（笔记与卡同错） |
| RayIoU 余量 | "只高 0.3–1.8"（我的理解） | — | v5 下应为 0.5–1.6 | 过期 |
| FPS 倍数 | "3.3 倍 / 约 7.5 倍"（我的理解，QA FIXED 后措辞） | L99 修辞"量级跃升" | v5 下应为 1.68× / 5.77× | 过期 |
| falsifier 1 阈值 | "RayIoU 低于 33.7（不及表中 FB-Occ）" | — | v5 FB-Occ = 33.5 | 阈值应改 33.5 |
| falsifier 2 | 基线"系引用各自原文" | — | 结构性排除（RayIoU 为本文提出） | 可降级改写 |
| 测试环境 | "Occ3D-nuScenes 数据集，Tesla A100 (fp32)" | L89 | §5.1 + §1（A100, PyTorch fp32） | 一致 |
| 15 帧 35.1 | 我的理解限定 2 | L100 | Table 1 (16f) 35.1；摘要同 | 一致（同为 15+1 口径） |

**结论**：主卡的核心主张（34.0 / 17.3 / 高于同表稠密基线）经 v5 原文成立；但卡 title、scope、两条 evidence quote 与"我的理解"中的基线数字/倍数已过期，**不改卡不能签**——而改卡前须先修笔记（基线行在笔记里），笔记属 `library/`，须用户同意（AGENTS.md）。方向不反转，属"数字与倍数过期"而非"结论错误"。

## 3. 四张卡关系、强度与风险

### 3.1 清单与引用关系（frontmatter 原文核对）

| 卡 id 后缀 | status / stance | review_due | related 指向（卡内原文） |
| --- | --- | --- | --- |
| `claim-njusparseocc-rayiou34-fps17-beats-dense-baselines` | asserted / watch | 2026-12-02 | decoder-pruning、mgss、rayiou-penalizes |
| `claim-njusparseocc-decoder-pruning-complexity-onactive` | asserted / watch | 2026-12-02 | rayiou34、mgss |
| `claim-njusparseocc-mgss-complexity-onquery-np` | asserted / watch | 2026-12-02 | decoder-pruning、rayiou34 |
| `claim-njusparseocc-rayiou-penalizes-thick-surface` | asserted / watch | 2026-12-02 | rayiou34 |

全部 `signoff: null`。结构上 rayiou34 是枢纽（被 3 卡回指），四卡呈"指标（rayiou-penalizes）→ 表征（decoder-pruning）→ 算子（mgss）→ 终值（rayiou34）"的层级；终值卡失效不必然波及机制卡（反过来，机制卡是终值卡的解释层）。

### 3.2 本轮原文核对给三张关联卡带来的增量（不改卡，只记录）

- **decoder-pruning 卡**：scope 中"笔记无逐层剪枝率、τ 取值"的空位部分可填——k=32000（5% 保留）、阈值示例 0.5 / 推理替代 0.7、正式实现 top-k；但**"低分辨率阶段"表述与论文"最终 token 数 5%"口径不同**，且"s>τ 硬过滤"并非论文实现路径。卡的三条 falsifiers 均仍可操作（FLOPs 缩放、剪枝率场景依赖、替代算子）。本轮不改卡；若日后修订，建议把"实现为 top-k"写进 scope，避免复现者按阈值实现去找 τ。
- **mgss 卡**：论文 Table 3 提供了笔记没有的模块消融（29.2@24.0 vs 28.7@16.2 与 25.8@24.0）；卡 scope 说"笔记无该模块的精度/速度消融数字"——对笔记为真、对论文不成立，引用该卡时不要把"笔记无"读成"论文无"。原文对 MGSS 的算子描述是 "We first randomly select a set of 3D points within the mask predicted by the previous (l − 1)-th Transformer decoder layer."（v5 §3.2，-raw），全文无 "96"、无 N_p 记号——卡的"笔记举例 96 个"与"O(N_query·N_p) 仍只出自笔记"两处限定经原文核实**仍然准确**。
- **rayiou-penalizes 卡**：TP 硬阈值、1/2/4m 三档、按档平均、射线源自 8 个 LiDAR 位置、无 GT 交点排除——卡 scope 的两个"未记录"空位（聚合方式、软计分）论文口径已查明，且"加厚无法获利"有原文逐字句支撑。三张卡中这张的"待回原文"清单清空得最干净。

### 3.3 主卡证据强度评级：核心数字 ★★★ / 卡现状 ★★（基线行修正前不具备 signoff 条件）

- **核心数字（34.0 / 17.3 / 7 帧）**：★★★。摘要 + §1 正文 + Table 1 三处自洽，本轮以 camera-ready 表格实抓复核；与官方 README checkpoint 的 17.3 FPS 跨源一致。
- **卡整体**：★★。卡内承载的基线数字（32.2/2.3、33.7/5.2）与全部公开版本不符且来源不明；虽然方向性主张不反转，但 signoff 卡的 title 与 evidence 不能带着已知过期的数字走签署流程。

### 3.4 剩余风险清单

1. **基线复现细节论文未写明**（中风险）：表内无"复现/引用"标记，BEVFormer 用 R101+1600×900+24ep、FB-Occ 用 R50+704×256+90ep，输入尺寸与时序帧数与 SparseOcc 不对齐（论文自辩口径是 Table 1 caption 的 "SparseOcc outperforms all existing methods under a weaker setting."，即 SparseOcc 用更弱配置仍占优——但基线是否作者复训、fps 是否含数据加载，论文未说；README 口径明确含 data loading，论文未写）。
2. **FPS 单卡单后端自报**（中风险）：A100 fp32 PyTorch；换 TensorRT/批处理/半精度后倍数会重排（EMC2 卡教训同款）。
3. **笔记数字过期**（已实锤）：L93/L94 两行待修（用户授权后改笔记，再同步卡）。
4. **RayIoU 本身是新指标**（低风险）：主卡是"同表"比较，指标公平性由 rayiou-penalizes 卡承担；跨论文引用 34.0 时必须带指标口径（1/2/4m 均值），不可与体积 mIoU 混排。
5. **仓库 checkpoint 数字（36.8）高于论文（34.0）**（低风险，引用纪律）：引用哪个口径要在引用处写死，避免"论文 34.0 / 仓库 36.8"混用。

## 4. 人工核验建议

1. **零成本（先决）**：用户按 §2 表逐格复核笔记 L93/L94 ↔ v5 Table 1；确认后授权修笔记两行 + 同步卡 title/scope/evidence/倍数与 falsifier 1 阈值（参照 OmniQuant mismatch 卡的"笔记已修正"附注句式），并决定是否给笔记补"8f=7+1 帧"口径注。
2. **低成本**：向官方仓库提 issue 询问 Table 1 基线行的产生方式（复现 or 重新评测、fps 是否含 data loading）——这是关闭 falsifier 2 残余的唯一低成本路径；同时确认笔记基线数字是否有可考的中间稿出处。
3. **中成本**：用官方 v1.1 checkpoint（r50_nuimg_704x256_8f，24ep，17.3 FPS 口径）复测 RayIoU 与 FPS，一次给主卡 falsifier 1（阈值 33.5）与 FPS 自报口径提供判定。
4. **引用纪律（不做实验也能立即执行）**：凡引用 34.0/17.3，注明"ECCV 2024 camera-ready（arXiv v5）Table 1、RayIoU=1/2/4m 三档均值、A100 fp32、8f（7 历史+当前）口径"；凡与体积 mIoU 数字同表出现，先换算口径。

## 5. 遗留问题（供调度班次转 QUESTIONS.md）

1. **笔记 L93/L94 基线行数字与 camera-ready 不符且公开渠道查不到出处**（32.2/2.3、33.7/5.2）：需用户授权修笔记 + 同步主卡（title/scope/evidence/我的理解/falsifier 1 阈值 33.7→33.5、倍数 3.3×/7.5×→1.68×/5.77×）。本班无 library/ 与 claims/ 写权限（任务书明确），未动任何文件。
2. **Table 1 基线行的产生方式论文无明文**：已排除"引用各自原文"，但"作者复训 or 复用公开 checkpoint 重评测"未定；建议 issue 问询（§4 建议 2）后把结论回填卡内。
3. **关联卡 scope 的两处"笔记无"表述**在论文侧已有对应消融/数字（mgss 的 Table 3、decoder 的 k=32000）：是否修订卡 scope（避免误读）由用户定。
4. **笔记 L99 "低分辨率阶段抹除>90%"与论文口径差异**（论文的 95% 是最终分辨率 token 数）及 L100 的帧数口径（15 帧输入 vs 论文 16f=15+1）：属表述精度问题，可与遗留 1 一并修笔记。
5. 主卡 signoff 与否由用户决定；本报告的核心数字 ★★★ / 卡现状 ★★ 是证据结构评估，不构成签署建议（AGENTS.md：只有用户本人能把 claim 标记为 verified）。

## 附录 A：引文核验记录

方法：库内文件每条引文以字节原样做 `grep -F` 固定字符串全文匹配，要求恰好命中 1 次（`grep -cF` = 1）；PDF 引文对本次抓取提取的文本文件验证（/tmp/ka-fetch-sparseocc/ 下 sparseocc-raw.txt 为 v5 -raw 提取、sparseocc-v1.txt / sparseocc-v2.txt 为对应版本 -layout 提取、README.md 为官方仓库 raw 抓取，均工作区外临时文件）。报告正文中跨行拼接的 PDF 引文（拼接规则见 §1.1 注）在附录按所在行逐行 fragment 验证。共 59 条，全部 OK（"x1" = 该文件内恰好命中 1 次）。

```
-- 库内与 QA（10 条）--
OK x1  library/3D_Occupancy/NJU-SparseOcc.md:L89   **测试环境**：Occ3D-nuScenes 数据集，Tesla A100 (fp32)。
OK x1  library/3D_Occupancy/NJU-SparseOcc.md:L93   | BEVFormer     | 稠密 (Dense Cost Volume)   | 4帧          | 32.2       | 2.3                |
OK x1  library/3D_Occupancy/NJU-SparseOcc.md:L94   | FB-Occ        | 稠密 (Dense Cost Volume)   | 16帧         | 33.7       | 5.2                |
OK x1  library/3D_Occupancy/NJU-SparseOcc.md:L95   | **SparseOcc** | **全稀疏 (Sparse Tokens)** | **7帧**      | **34.0**   | **17.3**           |
OK x1  library/3D_Occupancy/NJU-SparseOcc.md:L99   解码器在低分辨率阶段物理抹除了 $>90\%$ 的背景空间节点
OK x1  library/3D_Occupancy/NJU-SparseOcc.md:L100  系统能以极低代价处理 15 帧输入（RayIoU 达 35.1）
OK x1  claims/claim-njusparseocc-rayiou34-fps17-beats-dense-baselines.md:L43  同表两条稠密基线为 BEVFormer 4 帧 32.2 / 2.3 FPS、FB-Occ 16 帧 33.7 / 5.2 FPS
OK x1  claims/claim-njusparseocc-rayiou34-fps17-beats-dense-baselines.md:L33  同设置（Occ3D-nuScenes、A100 fp32）复现中 SparseOcc 的 RayIoU 低于 33.7
OK x1  claims/claim-njusparseocc-rayiou34-fps17-beats-dense-baselines.md:L34  基线口径不对等：BEVFormer / FB-Occ 两行的 RayIoU 与 FPS 系引用各自原文
OK x1  nightshift/qa/round2-hgsfusion-nju.md:L40  claim-njusparseocc-rayiou34-fps17-beats-dense-baselines — FIXED（小幅）
-- arXiv:2312.17118v5 -raw 提取（45 条）--
OK x1  sparseocc-raw.txt:L27   criteria. SparseOcc demonstrates
OK x1  sparseocc-raw.txt:L28   its effectiveness by achieving a RayIoU of 34.0, while maintaining a real-time
OK x1  sparseocc-raw.txt:L29   inference speed of 17.3 FPS, with 7 history frames inputs. By incorporating more
OK x1  sparseocc-raw.txt:L31   RayIoU without bells and whistles.
OK x1  sparseocc-raw.txt:L98   Thanks to the sparsity design, SparseOcc achieves 34.0 RayIoU on Occ3D-nuScenes [50], while
OK x1  sparseocc-raw.txt:L99   maintaining a real-time inference speed of 17.3 FPS (Tesla A100, PyTorch fp32 backend), with
OK x1  sparseocc-raw.txt:L100  7 history frames inputs. By incorporating more preceding frames to 15, SparseOcc continuously
OK x1  sparseocc-raw.txt:L392  SparseOcc outperforms all existing methods under a weaker setting.
OK x1  sparseocc-raw.txt:L394  BEVFormer (4f) [27] R101 1600×900 24 32.4 26.1 32.9 38.0 39.2 3.0
OK x1  sparseocc-raw.txt:L399  FB-Occ (16f) [28] R50 704×256 90 33.5 26.7 34.1 39.7 39.1 10.3
OK x1  sparseocc-raw.txt:L400  SparseOcc (8f) R50 704×256 24 34.0 28.0 34.7 39.4 30.1 17.3
OK x1  sparseocc-raw.txt:L401  SparseOcc (16f) R50 704×256 24 35.1 29.1 35.8 40.3 30.6 12.5
OK x1  sparseocc-raw.txt:L421  models for 24 epochs. FPS is measured on a Tesla A100 GPU with the PyTorch fp32 backend.
OK x1  sparseocc-raw.txt:L205  As in our statistics, we find that over 90% of the voxels in the
OK x1  sparseocc-raw.txt:L40   We statistic the geometry sparsity and find that more than
OK x1  sparseocc-raw.txt:L41   90% of the voxels are empty. This manifests a large room in occupancy prediction acceleration by
OK x1  sparseocc-raw.txt:L431  In contrast, SparseOcc discards over 90%
OK x1  sparseocc-raw.txt:L432  of voxels while still effectively modeling the geometry of the scene and capturing fine-grained details.
OK x1  sparseocc-raw.txt:L462  Instead, our sparse voxel
OK x1  sparseocc-raw.txt:L463  decoder produces sparse 3D features in the shape of K × C (where K = 32000 ≪ 200×200×16),
OK x1  sparseocc-raw.txt:L531  Starting from a modest value of 16k, we observe that the optimal
OK x1  sparseocc-raw.txt:L532  performance occurs when k is set to 32k ∼ 48k, which is only 5% ∼ 7.5% of the total number
OK x1  sparseocc-raw.txt:L533  of dense voxels (200×200×16 = 640000).
OK x1  sparseocc-raw.txt:L214  two approaches for pruning: one is based on a threshold (e.g., only keeps score > 0.5); the other is
OK x1  sparseocc-raw.txt:L215  by top-k selection. In our implementation, we simply keep voxels with top-k occupancy scores for
OK x1  sparseocc-raw.txt:L216  training efficiency. k is a dataset-related parameter
OK x1  sparseocc-raw.txt:L549  we train two variants of BEVFormer: one
OK x1  sparseocc-raw.txt:L550  uses the visible mask during training, and the other does not.
OK x1  sparseocc-raw.txt:L446  Table 2: Sparse voxel decoder vs. dense voxel decoder. Our sparse voxel decoder achieves nearly 4×
OK x1  sparseocc-raw.txt:L447  faster inference speed than the dense counterparts.
OK x1  sparseocc-raw.txt:L449  Dense coarse-to-fine 29.9 24.0 30.4 35.4 6.3
OK x1  sparseocc-raw.txt:L451  Sparse coarse-to-fine 29.9 23.9 30.5 35.2 24.0
OK x1  sparseocc-raw.txt:L477  Dense cross attention 28.7 22.9 29.3 33.8 16.2
OK x1  sparseocc-raw.txt:L481  + Mask-guided 29.2 23.4 29.8 34.5 24.0
OK x1  sparseocc-raw.txt:L375  A query ray is classified as a true positive (TP) if the class labels coincide and the L1 error between
OK x1  sparseocc-raw.txt:L376  the ground-truth depth and the predicted depth is less than a certain threshold (e.g., 2m).
OK x1  sparseocc-raw.txt:L331  To address the above issues, we propose a new evaluation metric: Ray-level mIoU (RayIoU for short).
OK x1  sparseocc-raw.txt:L410  originate from 8 LiDAR positions of the ego path. We calculate RayIoU under three distance
OK x1  sparseocc-raw.txt:L411  thresholds: 1, 2 and 4 meters. The final ranking metric is averaged over these distance thresholds.
OK x1  sparseocc-raw.txt:L382  Since the query ray calculates the distance to the first voxel it touches, the model cannot
OK x1  sparseocc-raw.txt:L383  obtain a higher IoU by predicting a thicker surface.
OK x1  sparseocc-raw.txt:L336  In case a ray does not intersect with any voxel present in the ground truth, it will be excluded
OK x1  sparseocc-raw.txt:L337  from the evaluation process.
OK x1  sparseocc-raw.txt:L258  We first randomly select a set of 3D points
OK x1  sparseocc-raw.txt:L259  within the mask predicted by the previous (l − 1)-th Transformer decoder layer.
-- 其他来源（4 条）--
OK x1  sparseocc-v1.txt:L415   “8f” means fusing temporal information from 7+1
OK x1  sparseocc-v2.txt:L164   FPS is measured on a V100 GPU with the PyTorch backend.
OK x1  README.md:L69           FPS is measured with Intel(R) Xeon(R) Platinum 8369B CPU and NVIDIA A100-SXM4-80GB GPU (PyTorch `fp32` backend, including data loading).
OK x1  README.md:L33           SparseOcc v1.1 can achieve 36.8 RayIoU with 24 epochs!
```

（报告排版对部分长行截断，匹配用串为全文逐字。验证脚本清单见 /tmp/verify_quotes2.sh，工作区外临时文件，不入库。两处否定性/旁证性核查未列引文：①Occ3D 论文无 RayIoU——对 /tmp/ka-fetch-occ3d/occ3d.txt（arXiv:2304.14365v3 全文提取，2026-11-03 抓取）`grep -i "rayiou"` 计 0 命中，其 BEVFormer 基准行为体积 mIoU 口径；②官方 README model zoo 无 BEVFormer/FB-Occ 基线行（全文 grep 基线方法名仅见于无关段落）。v3/v4 的 Table 1 与 v5 逐格同（本轮 -layout 提取比对），v1/v2 为 panoptic 旧版其 Table 1 无 FPS 列。）
