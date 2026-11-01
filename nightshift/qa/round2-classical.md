# QA round2 复审报告：经典检测方向（FCOS / CaDDN / CornerNet / PointNet&PointPillars）

- 日期：2026-11-02
- 复审人：nightshift 子代理（QA|round2）
- 对象：任务清单所列 16 张 claim 卡（FCOS 4 + CaDDN 4 + CornerNet 4 + PointNet&PointPillars 4）
- 方法：每张卡的全部 evidence quote（共 43 条）用 Python 做定长字符串匹配（弯引号/全角字符、YAML 内 LaTeX 反斜杠、行内空格逐字比对），另用 `grep -F` 对 5 条最易错 quote（尾注"10"残留、`**Hourglass Network **` 双星内空格、POINT_CLOUD_RANGE 三空格注释等）单独复核；locator 对照笔记标题与 GitHub 锚点逐个核算；数字（消融增量、层级距离范围、9 维特征、Δ=1、权重 0.1/0.1、104 层等）重新推导比对；口径 caveat 逐项检查；卡片间交叉引用数字回源卡核对；status/signoff/related/note 路径批量校验。

**结果分布：PASS 15 / FIXED 1 / ISSUED-MISMATCH 0。未发现笔记本身错误，未另立 mismatch 卡。`node tools/ka.mjs validate` 通过。**

16 张卡全部 status: asserted、signoff: null（复核后原样未动）；`note:` 路径 16/16 可解析；`related` 链接（含指向 CenterNet/FCOS 卡的跨组引用）全部存在。

---

## 一、FCOS（对照 library/Classical_Detection/FCOS.md，11 条 quote 全部逐字命中）

### 1. claim-fcos-anchorfree-pixelwise-formulation — PASS

- Quote 验证：4 条逐字命中（L9 核心思想含弯引号「“Anchor-based”」、L47 FCOS 解法、L49 定义样本、L50 回归目标 `$t=(l,t,r,b)$`）。
- locator：「§文首核心思想」对应 L9（文首无标题段落，描述准确）；「§方法 / Anchor-free 的逐像素回归」对应 `## 方法` → `### Anchor-free 的逐像素回归`；note 锚点 `#anchor-free-的逐像素回归` 正确。
- Caveat：scope 如实保留「笔记未载任何数据集性能数字（仅以 COCO 80 类说明正负样本悬殊的动机）」，卡内正确不立精度主张；falsifier 覆盖中心采样修正风险——保留完好。

### 2. claim-fcos-centerness-regression-branch-ap-gain — PASS

- Quote 验证：1 条逐字命中（L23 图注）。
- locator：「§Architecture（Figure2 图注）」对应 `## Architecture` 内 Figure2_a.png 下方的图注 div（L22-24），准确；note 锚点 `#architecture` 正确。
- Caveat：scope 明确标注「依据仅为笔记 Figure2 处图注，笔记未载 AP 数字、未注明『后续实验』出处，证据强度为四张 FCOS 卡中最弱」——该图注确为笔记作者转述（L22-24 为橙色注释 div），卡的降级处理如实。falsifier #2 直指「图注可能为笔记作者的转述」，处理正确。

### 3. claim-fcos-centerness-suppresses-low-quality — PASS

- Quote 验证：4 条逐字命中（L71 痛点含弯引号「“框内点”」、L86 推理公式 LaTeX 逐字、L89 NMS 过滤句、L150 Loss Function 作用句含弯引号）。
- 数字/机制：sqrt(min/max) 比值连乘与笔记 L80/L142 公式一致；「BCE 训练」与 L131 一致；0~1 与 L75 一致。
- locator：三条 §方法 / Center-ness 分支 与「§方法 / Loss Function（中心度损失）」均对得上（L150 位于 `### Loss Function` 的中心度损失小节）。
- Caveat：scope 如实保留「笔记未载 AP 数字与有无 center-ness 的消融表，只主张机制层面，不主张具体涨点幅度」——保留完好。

### 4. claim-fcos-fpn-scale-range-assignment — PASS

- Quote 验证：2 条逐字命中（L61 分层规则、L65 效果句）。
- 数字：P3:[0,64]、P7:[512,∞] 与笔记 L62/L64 一致；scope 如实标注「笔记所载回归距离，未标单位与数据集版本」；「取面积最小的框」与 L65 一致。
- locator：§方法 / FPN 解决重叠 对应 `### FPN 解决重叠`；note 锚点 `#fpn-解决重叠` 正确。
- Caveat：「未载模糊样本占比的具体数字，只主张分层规则与消歧方向」——保留完好。

---

## 二、CaDDN（对照 library/Classical_Detection/CaDDN.md，13 条 quote 全部逐字命中）

### 5. claim-caddn-depth-supervision-dominant-ablation-gain — PASS

- Quote 验证：4 条逐字命中（L188 Exp 3 行 +10.4%、L187 Exp 2 行 +1.5%、L186 Exp 1 行、L206 结论要点 1）。
- 数字：+10.4%「全表最大的提升」与 L188 原句一致；+1.5% 与 L187 一致；「全表最大单项增益」重推全表增量（1.5 / 10.4 / 0.6~1 / 3.17）成立；LiDAR→One-hot 标签构造与 §3 L164 一致。
- locator：「§4 / Table 3 Exp 1/2/3」逐行对应；「§4 / 结论要点」对应表后编号结论列表（L206-209）；note 锚点 `#4-消融实验` 正确。
- Caveat：「笔记未标注消融所用数据集与 AP 指标版本，数字为论文自报相对增量（Δ AP）」——经查笔记 §4 确实全文无数据集/AP 口径标注，如实保留；EMC2 表格错位先例已写入 falsifier #3。

### 6. claim-caddn-joint-training-beats-frozen-depth-branch — PASS

- Quote 验证：3 条逐字命中（L203 Exp 4 行内「对比 Exp 4 vs 3：…(+2.97% AP)…」、L202 Exp 3 行、L207 结论要点 2）。
- 数字/结构：Exp 3（CaDDN/分步/Hard）vs Exp 4（CaDDN/联合/Hard）——「同结构、Hard 选择」与 Table 4 L202-203 逐列一致；+2.97% 一致；卡内注明「笔记对该对比（Exp 4 vs 1/2）只给定性结论，未给具体数字」与笔记一致（L200-201 两基准行确无数字）。
- Caveat：「笔记未标注数据集与 AP 指标版本，数字为论文自报相对增量」——保留完好。与姊妹卡的 +2.96%（Exp 5 vs 4）区分清楚，未混淆。

### 7. claim-caddn-lid-discretization-beats-uniform — PASS

- Quote 验证：3 条逐字命中（L190 Exp 5 行、L71 LID 优势句、L209 结论要点 4，含 `$\alpha_{fg}$` 转义）。
- 数字：+3.17% 与 L190 一致；卡内「仅次于深度监督（+10.4%）的单项增量」重推全表（0.6~1 < 3.17 < 10.4）成立；「仅切换 UD/LID」与 Table 3 Exp 4（全开+UD）→ Exp 5（全开+LID）行一致。
- locator：「§2 / 视锥到体素转换」对应 `## 2. 方法` → `### 视锥到体素转换`（L55/L67）。
- Caveat：数据集/AP 口径未标注——保留完好；LID 公式出处（L67）与 §2 引用一致。

### 8. claim-caddn-soft-depth-distribution-beats-hard-argmax — PASS

- Quote 验证：3 条逐字命中（L204 Exp 5 行 +2.96%、L208 结论要点 3、L47 §2 核心理念句）。
- 数字/结构：Exp 4（联合/Hard/Argmax）vs Exp 5（联合/Soft，G = D ⊗ F）——「两组均为端到端联合训练、同一结构，仅 Soft/Hard 之差」与 Table 4 L203-204 逐列一致；+2.96% 一致。
- Caveat：数据集/AP 口径未标注——保留完好；卡内明确「Exp 5 vs 4 建立在两组都已联合训练的前提上，与联合训练本身的增益是两件事」，口径切割正确。

---

## 三、CornerNet（对照 library/Classical_Detection/CornerNet.md，12 条 quote 全部逐字命中）

### 9. claim-cornernet-associative-embedding-pull-push — PASS

- Quote 验证：4 条逐字命中（L68 目的句含弯引号、L70 原理句、L74 Pull Loss、L80 Push Loss 含 `$\Delta=1$`）。
- 数字：1 维嵌入（L70）、Δ=1（L80/L83）、pull/push 权重 α=β=0.1、检测损失权重 1 与 L111「检测损失权重：1，为主导项。α：0.1、β：0.1、γ：1」逐项一致。
- locator：「§Embeddings —— 预测配对」对应 `### Embeddings —— 预测配对`；note 锚点 `#embeddings--预测配对`（双破折号→双连字符）核算正确。
- Caveat：「笔记未载消融与性能数字，尚未独立验证」——笔记确无任何性能数字，如实保留。

### 10. claim-cornernet-corner-pooling-directional-maxsum — PASS

- Quote 验证：3 条逐字命中（L40 圆球例、L42 思路句含弯引号与方向加粗、L44 实现句）。
- 结构：右→左、下→上两条 max-pooling 路径相加与 L44 一致；「用作预测模块中改进残差块的第一部分」与 L33「第一个 3×3 卷积替换为 Corner Pooling Module」一致。
- locator/note 锚点 `#corner-pooling-角点池化`（去括号）核算正确。
- Caveat：「笔记未载消融与性能数字」——保留完好；卡内正确不立精度主张。

### 11. claim-cornernet-paired-keypoints-anchor-free — PASS

- Quote 验证：3 条逐字命中（L11 弃锚框句含弯引号「“锚框（Anchor Box）”」、L13 成对关键点句、L15 优势句）。
- locator：§方法 对应 `## 方法`（L9-15）；note 锚点 `#方法` 正确。
- Caveat：「笔记未载实验数据集与性能数字」——保留完好；卡内明确「『避免正负样本不平衡』只是论文动机陈述，不主张『角点法优于锚框法』」，措辞符合引用规则。

### 12. claim-cornernet-single-scale-no-fpn — FIXED

- Quote 验证：2 条逐字命中（L21 Hourglass 句——注意原文 `**Hourglass Network **` 双星号内有一空格，卡 quote 逐字保留未"纠正"，正确；L23 无多尺度句）。104 层、两个堆叠 Hourglass 与 L21 一致。
- locator/note 锚点 `#architecture` 正确。
- 修复（1 处 prose，status 仍 asserted，未碰 signoff）：「我的理解」限定段引用 CenterNet 卡速度对比「7.8 vs 4.1 FPS」处，原句未带测量口径 caveat；按本次 QA 重点 3 补注「笔记未注明测量硬件、输入分辨率与测试增强口径，且该卡 scope 已声明此 caveat」。数字本身经回源 claim-centernetpoints-inference-fps-gain-over-cornernet.md 核对（4.1 / 7.8 / 52）无误。
- Caveat：「笔记未载『有/无 FPN』的对比数字」——保留完好。

---

## 四、PointNet & PointPillars（对照 "library/Classical_Detection/PointNet & PointPillars.md"，16 条 quote 全部逐字命中）

### 13. claim-pointnetpillars-direction-classifier-sine-flip — PASS

- Quote 验证：3 条逐字命中（L233 方向分类句——quote 末尾的「方向 10」中"10"为笔记原文遗留标注痕迹，卡在「限定」明确声明「逐字保留」后如实保留，处理规范；L261 代码注释句；L263 `USE_DIRECTION_CLASSIFIER` 开关行）。
- 结构：conv_box code_size 7（L253）、NUM_DIR_BINS 通常为 2（L266）、三并行 1×1 卷积分支（L239-268）与 scope 一致。
- locator：「§Detection Head / 代码（AnchorHeadSingle）」对应 L237 起代码块，准确；note 锚点 `#pointpillars` 对应 `#  PointPillars` 标题，正确。
- Caveat：「笔记未载任何数据集性能数字与加/不加该分支的对比」——保留完好。

### 14. claim-pointnetpillars-pillar-encoding-2dcnn-avoid-3dconv — PASS

- Quote 验证：6 条逐字命中（L94 核心思想含弯引号「“散射”」及句末「平衡 。」空格、L102 Pillar 化、L107 POINT_CLOUD_RANGE 含三空格注释、L111 9 维特征、L141 全局特征行含反引号、L176 伪图像句）。
- 数字：POINT_CLOUD_RANGE [0,-39.68,-3,69.12,39.68,1]、VOXEL_SIZE [0.16,0.16,4]（Z 轴 4m 不切分，1-(-3)=4 核对无误）、9 维 (x,y,z,r,xc,yc,zc,xp,yp) 与 L107/L108/L111 逐项一致。
- Caveat：「笔记未标注数据集版本与任何性能/延迟数字……不涉及精度/速度定量结论」，且卡内明确「『速度与精度平衡』的量化论证笔记无数值支撑，不作为本卡主张」——处置正确，避免了无硬件口径的速度主张。

### 15. claim-pointnetpillars-pointnet-maxpool-skeleton-noise-robustness — PASS

- Quote 验证：3 条逐字命中（L29 取最大值句、L33 关键骨架句、L35 噪声扰动句）。
- locator：「§为什么是 Max Pooling？」对应 L31 加粗段首（笔记该处为加粗伪标题而非 `##` 标题，定位描述无歧义）；「§点云无序性 & 对称函数」对应 L3；note 锚点 `#pointnet` 对应 `# PointNet`，正确。
- Caveat：「笔记该节未载任何扰动/噪声实验数据，不涉及定量鲁棒性结论」，卡内进一步自评「比置换不变性卡更弱一层：属于论证而非实验结论」——证据强度分级如实。

### 16. claim-pointnetpillars-pointnet-permutation-invariance-symmetric-function — PASS

- Quote 验证：4 条逐字命中（L7 N! 排列句含句末「不变性 (Permutation Invariance) 。」空格、L18 权重共享句、L25 对称函数定义句、L27 Max Pooling 选择句含双空格排版）。
- 结构：f≈g(h(xᵢ))、共享权重逐点 MLP、N×3→N×1024 与 L9-L29 一致。
- Caveat：「笔记该节未载任何数据集性能数字与消融实验」——保留完好；与姊妹卡（maxpool 鲁棒性）的强弱分层明确。

---

## 五、遗留问题（不阻塞，转调度班次酌情入 QUESTIONS.md）

1. claim-fcos-centerness-regression-branch-ap-gain 的「后续实验」图注在笔记中无出处（原论文/扩展版/第三方未注明）——卡已如实降级并列入 falsifier，建议后续人工回原论文核对该结论原始出处。
2. claim-cornernet-associative-embedding-pull-push 的 scope 提到「检测损失为主导」，笔记原文为「检测损失权重：1，为主导项」，但同式 γ（offsets）权重也为 1——「主导项」是笔记的自评而非严格由权重唯一推出；卡措辞沿笔记原文，未视为错误，如需更严格可在验证阶段对照原论文权重设置。
3. PointPillars 笔记 Detection Head 代码注释含 `[cite: 230]` 残留、方向分类句末尾残留"10"，同笔记 Pillar 化一节 L5 有一处「重新排列）」多余右括号——均为笔记排版残留，不影响 claim 卡引用（卡已按逐字保留原则处理），未构成需要另立 mismatch 卡的事实错误。
