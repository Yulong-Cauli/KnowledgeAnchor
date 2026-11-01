# BEV-Planner 深度精读报告

**日期：** 2026-11-02
**性质：** nightshift report 班次产出；只读素材，仅新增本文件；不 git 提交
**服务对象：** 主人的端到端自动驾驶研究（`library/ADe2e/` 线）

## 0. 素材、纪律与措辞约定

素材（全部本地，未联网）：

| 素材 | 角色 |
| --- | --- |
| `library/ADe2e/BEV-Planner.md` | L1 笔记，本报告分析主对象 |
| `claims/claim-bevplanner-*.md`（5 张） | L2/L3 claim 卡，全部 `status: asserted`、`stance: watch`（frontmatter 逐卡核对） |
| `nightshift/qa/round2-bevplanner.md` | QA 复审：**PASS ×5，FIXED ×0，ISSUED-MISMATCH ×0**（L7），14/14 条 evidence quote 逐字命中且各恰好 1 次（L6） |
| `nightshift/drafts/UniAD.md` | 前作草稿（未经用户核阅），作对照系 |

纪律与措辞约定（适用于全文）：

1. 本报告**不判"论文对/错"**，只评估每个论证环节的证据结构与强度；论文层面的结论一律写为"论文声称，尚未独立验证"（AGENTS.md 引用规则 2）。
2. 引文纪律（RULES #3）：全文引用一律 quote + locator（文件 + 章节 + 行号），逐字复制，并经 `grep -F` 固定字符串全文匹配逐一验证——共 69 条，全部恰好命中 1 次（完整核验输出见附录 A）。引文的直接载体是本库笔记；笔记自称逐字转录论文 HTML 全文（BEV-Planner.md L11），QA round2 已做笔记级逐格复核，但对论文原文的独立核验**尚未发生**。
3. 证据强度分级（本报告自定义，仅用于组织评估，不构成对卡 status 的变更建议）：
   - **★★★**：受控对比或干预实验，且多行交叉一致（同表开关切换 / 同 ckpt 扰动）；
   - **★★**：单表自报数字，但有内部交叉验证（与他表同口径行吻合）；
   - **★**：单一统计量或定性观察，笔记中无可复核表格行或脚本。

## 1. 核心论证链：ego status 在现有开环评测里扮演什么角色

### 1.0 先把任务句式精确化

任务句式"ego status 并非开环端到端性能的必需输入"需要先与论文实际结构对齐，否则会读反。论文标题问题与回答（笔记转录的论文原句，locator：笔记 §1，L15）：

> "Is ego status all you need for open-loop end-to-end autonomous driving?" … "Our answer is **yes and no**, considering both the pros and cons of using ego status in current benchmarks"

即论文不是单方向论证"必需/非必需"，而是拆成两个方向：

- **命题 A（充分性，Yes 面）**：仅 ego status、无任何感知的模型就能在现有 L2/碰撞率指标上拿到 SOTA 级分数——对"刷现有指标"而言，感知输入不是必需的。
- **命题 B（支配性，No 面）**：一旦 ego status 进入模型，最终轨迹由它支配、感知贡献被边缘化；加上数据失衡与新指标反转，论文真正论证的是"**现有开环评测无法区分感知贡献**"，而非"感知无用"。

反向限定（论文自己给出）：无 ego status 时视觉重新变得重要（Appendix E，见 1.4 环节末）。以下按论文论证顺序走链。

### 1.1 环节一（起点）：AD-MLP 挑战与"干净的"Ego-MLP —— ★★

论文声称（尚未独立验证）：AD-MLP 曾指出仅 ego status 的 MLP 即达 SOTA 规划结果；作者复现时修复其 issue #4、去掉历史轨迹 GT 以防标签泄露，得到仅依赖 ego status 的 Ego-MLP（Table 1 ID-8）（笔记 §1，L16）。笔记 §4 / Table 1 caption（L80）：

> "Without the perception module, Ego-MLP (ID-8), utilizing solely ego velocity, acceleration, yaw angle, and driving command, achieves performance on par with current state-of-the-art models on previous L2 distance and collision rate metrics."

行证据（locator：§4 / Table 1 ID-8 行，L71）：

> "| 8 | Ego-MLP | - | ✓ | 0.15 | 0.32 | 0.59 | 0.35 | 0.00 | 0.27 | 0.85 | 0.37 | 0.27 | 2.52 | 6.60 | 2.93 | （原表为空） |"

（末列"（原表为空）"是笔记自注：原表该单元格为空；QA 观察 3 确认"为笔记表格行原文……逐字引用成立，不判错"，round2 L62。）

**证据强度 ★★**：单表自报数字；"on par"是论文对全表的定性判断，无统计检验；Ego-MLP 的防泄露配置只有论文自述，独立复核需复现。
**限定**：只覆盖 L2/碰撞率两个旧指标——按 CCR，Ego-MLP（2.93）并不优于 UniAD（1.93）/VAD（2.47）（Table 1 CCR 列，L64/L69/L71）；评测口径为论文统一实现 + 0.1m 网格（"we adopt a finer default grid size of 0.1m"，L53）+ 有效样本"最终有效样本 5119（占全部样本的 85%）"（L55）。

### 1.2 环节二：无感知基线的两个对照与"非部署声明"

GoStright 恒速直行策略（ID-7）在 L2/碰撞率上同样好、但 CCR 全表最差（locator：Table 1，L70）：

> "| 7 | GoStright | - | ✓ | 0.38 | 0.79 | 1.33 | 0.83 | 0.15 | 0.60 | 2.50 | 1.08 | 2.07 | 8.09 | 15.7 | 8.62 | - |"

（CCR-Avg 8.62 为 Table 1 CCR 列最大值——这是 1.5 环节"新指标反转"的伏笔。）

论文同时为基线定位划红线（locator：§3，L38）：

> "We wish to underscore that our proposed baseline method is not intended for real-world deployment, owing to its deficiencies in providing adequate constraints and interoperability."

强度注记：GoStright 行为 ★（单行自报）；"非部署声明"不是证据而是论文自我定位，但选型时它是硬边界。

### 1.3 环节三（主链）：注入位置系统对比 —— ★★★（链内横向最广）

论文声称（尚未独立验证）：UniAD/VAD 只有在 planner 注入 ego status 后才追平无感知 Ego-MLP；仅 BEV 注入介于中间；论文据此主张含 ego status 的方法之间不可直接比较。结论句（locator：§4.3(a)，笔记 §3.5(a)，L109）：

> "we argue that methods utilizing ego status are not directly comparable and conclusions should not be drawn from such comparisons."

结构证据：同一张 Table 1 内、两架构 × 三档注入的剂量-反应（L2-Avg）：

- UniAD：ID-1 无注入 1.03 → ID-2 仅 BEV 0.66 → ID-3 BEV+planner 0.46（L64/L65/L66）；
- VAD-Base：ID-4 无注入 1.25 → ID-5 仅 BEV 0.72 → ID-6 BEV+planner 0.37（L67/L68/L69）；
- 参照系 Ego-MLP 0.35（L71）；BEV-Planner 自身同构：ID-9/10 无注入 0.57/0.55 → ID-11 仅 BEV 0.46 → ID-12 双注入 0.35（L72-L75）。

两组端点行逐字（locator：§4 / Table 1 ID-6 行，L69；ID-4 行，L67）：

> "| 6 | VAD-Base | ✓ | ✓ | 0.17 | 0.34 | 0.60 | 0.37 | 0.04 | 0.27 | 0.67 | 0.33 | 0.21 | 2.13 | 5.06 | 2.47 | Official |"
> "| 4 | VAD-Base | ✗ | ✗ | 0.69 | 1.22 | 1.83 | 1.25 | 0.06 | 0.68 | 2.52 | 1.09 | 1.02 | 3.44 | 7.00 | 3.82 | Reproduce |"

**证据强度 ★★★**：同表、同架构下只切换注入位置的受控对比，同方向排序在两个架构上重复；QA 已逐格核对（round2 L26）。
**限定（薄弱点）**：ckpt source 混杂——UniAD 的 ID-1↔ID-3 端点同为 Reproduce（干净），但中间档 ID-2 为 Official；VAD 的 ID-4（Reproduce）↔ID-6（Official）跨源，注入效应与权重来源未完全解耦（对应卡 falsifier 2："注入 ego status 带来的指标提升主要来自评测实现差异"，卡 L26）。此外"追平"无显著性检验（ID-3 0.46 vs Ego-MLP 0.35 的差距无方差报告）。

### 1.4 环节四（因果）：图像退化 vs 速度扰动 —— ★★★（链内唯一干预证据）

论文声称（尚未独立验证）：ego status 在场时，感知输入对最终轨迹的贡献被边缘化。Table 2 caption（locator：§4 / Table 2，L101）：

> "We can observe that introducing corruption to images markedly affects the perception results, especially in the case of using blank images; nonetheless, this does not markedly disrupt the ultimate planning results. In contrast to the minor impact of image corruption on planning, modifications to the ego vehicle's velocity have a significant effect on the planning results."

干预证据（同一官方 VAD-Base ckpt，planner 注入 ego status；Table 2，L90/L95/L96/L97/L99）：

- 基线：L2-Avg 0.37（L90，与 Table 1 ID-6 同数）；
- Blank 相机：感知 NDS/mAP 崩至 0.0/0.0，L2-Avg 仅 0.37→0.46（L95）；
- 速度 ×0.0：L2-Avg 0.37→6.16（L96）；×0.5 →3.19（L97，行内含原文照抄的 "2,83" 拼写）；=100 m/s →208（L99）；速度扰动全程 NDS/mAP 不变 45.5/47.0；
- 极端例句（§4.3，L102）："Setting the ego car's speed to 100 m/s results in the model generating wildly impractical planning trajectories."

v×0.0 行逐字（locator：§4 / Table 2 v×0.0 行，L96）：

> "| VAD-Base | - | v×0.0 | 3.81 | 6.19 | 8.48 | 6.16 | 1.00 | 6.76 | 16.18 | 7.98 | 0.19 | 0.41 | 3.10 | 1.23 | 45.5 | 47.0 |"

**证据强度 ★★★**：干预性实验（同一权重、只动输入），因果方向清晰，量化反差 10 倍以上。
**限定**：单模型（Table 2 仅 VAD-Base 一车）；前提"ego status is present"必须随结论携带——Appendix E 显示对**不含** ego status 的 VAD-Base 屏蔽相机输入时 L2-Avg 恶化到 4.33、Colli-Avg 到 7.63（L155），即无 ego status 时视觉重要，本环节结论不可外推；速度置零时 CCR 反而最优（1.23，L96），论文自注这是 CCR 对静止轨迹的盲区（L102）。另注：§1 的引文（L20，"blanking all the camera input in VAD [16] … predicted trajectory."）是本实验的预告版表述，两处互证。

### 1.5 环节五：新指标 CCR 让结论反转 —— ★★

论文声称（尚未独立验证）：L2/碰撞率不足以评判开环方法，换指标结论会变。论点句（locator：§4.3(d)，L139）：

> "This suggests that relying on past metrics to judge the superiority of different open-loop methods is biased."

反转实例一（UniAD 后处理，Table 6，locator：§4.3，L144/L145）：

> "| UniAD | ✓ | 0.77 | 0.51 | 7.83 |"
> "| UniAD | ✗ | 0.66 | 0.62 | 1.72 |"

即后处理开→关：Col 0.62→0.51、CCR 1.72→7.83。论文判读（L147）：

> "Our new metrics, the CCR reveal that UniAD's post-processing substantially increases the risk of the ego vehicle running off the road."

反转实例二/三：GoStright 的 CCR-Avg 8.62 全表最差（L70）；Ego-MLP 在 CCR 口径不再占优（L71）。

**证据强度 ★★**：Table 6 仅两行、CCR 是论文自定义指标（0.1m 路沿栅格化 L52；碰撞率定义修正 Eq.2→Eq.3 + 自车 yaw 修正 L54）；但 Table 6 P.P.✗ 行与 Table 1 ID-2（0.66/0.62/1.72，L65）完全吻合，内部交叉一致——QA 确认"笔记内部无错位（EMC2 式表格错位未复现）"（round2 L53）。
**限定**：CCR 的可信度绑定在其实现细节上（栅格化分辨率、yaw 估计修正）；且 CCR 对静止轨迹有盲区（1.4 环节）、论文 Limitation 自认指标间存在 trade-off、基线 CCR 并不突出（L167）——新指标同样不完善，论文自己也示范了"换指标换结论"的双向性。

### 1.6 环节六：数据失衡与机制解释（背景层） —— ★

- **数据失衡**：核心统计量（locator：§1 / Fig. 2，L18）："73.9% of the nuScenes data involve scenarios of driving straightforwardly"；评测样本口径另有一处（Appendix E，L156）："in straight-driving scenarios (87% of all evaluation samples), removing the camera input leads the model to adopt a relatively conservative straight-driving strategy"。**强度 ★**：73.9% 在笔记中无表格行可复核（源自 Fig. 2），论文未给"直行"判定阈值；且 73.9%（数据整体）与 87%（评测样本）分母不同，易混用。
- **机制观察**：BEV 阶段的隐式注入对感知本身影响极小——BEVFormer 带/不带 ego status 的 mAP 41.6/41.3、NDS 51.7/51.5（Appendix C，locator：笔记 §3.5(b)，L118/L119）；但在端到端管线里去掉 BEV 阶段注入会使 UniAD（ID-2→ID-1）、VAD（ID-5→ID-4）规划明显下滑（L121）。BEV-Planner++ 注入后 BEV 特征激活集中在自车周边，论文以"推测"措辞下机制判断（L151）："Hence, the BEV-Planner++ method has almost not learned any effective information."。**强度 ★**：附录小表 + 定性可视化 + 论文自用"推测"。

### 1.7 收束：论文结论与自认局限（全部为论文声称，尚未独立验证）

§5 三条结论（L161-L165）：ego status（速度/加速度/yaw）高度支配现有开环模型的规划表现；现有指标不足以刻画真实性能；构建更合适的数据集与指标比继续刷 nuScenes SOTA 更紧迫。总体方向（§1 末，L22）："论文推测 nuScenes 上的 SOTA 分数很可能来自对 ego status 的过度依赖 + 简单直行场景主导"。
自认 Limitation（L167）：BEV-Planner 基线因不使用感知标注（如 HD map），CCR 并不突出。
对本库的口径提示（§4，L168）——Table 1 的 UniAD 各行默认无后处理，Table 6 P.P.✓ 才是带后处理，两套不可混用：

> "In this paper, we report the results of UniAD without its post-processing by default."

**论证链总览**（箭头为论文的论证方向，星为本报告强度评估）：

```
AD-MLP 挑战（复现修复）──→ 环节一 Ego-MLP/GoStright 持平 ★★（单表）
                               │
        ┌──────────────────────┼───────────────────────────┐
        ↓                      ↓                           ↓
  环节三 注入位置剂量-反应   环节四 图像/速度双干预        环节六 73.9%/87% 直行主导 ★
  ★★★（跨架构受控）        ★★★（干预，单模型）                │
        │                      │                           ↓
        └──────────┬───────────┴────────── 环节五 CCR 反转 ★★（自定义指标）
                   ↓
     结论（§5，论文声称）：现有开环评测无法区分感知贡献 → 指标/数据集优先
                   ↓
     反向限定：无 ego status 时视觉重要（Appendix E，L155）
```

## 2. 五张 claim 卡：关系、强度与选型限定

### 2.1 清单与引用关系（frontmatter 原文核对）

| 卡 id 后缀 | status / stance | note 锚 | related 指向（卡内原文） |
| --- | --- | --- | --- |
| `claim-bevplanner-egomlp-parity-l2-collision` | asserted / watch | `#33-主结果` | injection、unidad-pp（L24） |
| `claim-bevplanner-egostatus-injection-closes-gap` | asserted / watch | `#35-讨论` | egomlp-parity、velocity（L28） |
| `claim-bevplanner-ego-velocity-dominates-planning` | asserted / watch | `#34-图像退化-vs-ego-status-扰动` | injection、egomlp-parity（L28） |
| `claim-bevplanner-nuscenes-straight-driving-imbalance` | asserted / watch | `#1-概述` | egomlp-parity（L24） |
| `claim-bevplanner-unidad-postprocessing-raises-ccr` | asserted / watch | `#4-核心结论` | egomlp-parity、injection（L33） |

全部 `review_due: 2026-12-02`、`signoff: null`。引用结构：`egomlp-parity` 是枢纽（被其余 4 卡 related），`injection` 次之（被 3 卡 related），`imbalance` 是叶（只指出、无人回指）。语义分层：parity 说"现象"（旧指标无区分度），injection / velocity 说"机制"（注入位置 / 输入支配），imbalance 说"成因"（数据分布），unidad-pp 说"指标后果"（换指标换结论）。**依存风险**：若 parity 卡被推翻（复现中 Ego-MLP 显著落后——其卡内"不成立"分支也写明这一点），其余四卡全部需要重审。

### 2.2 证据强度排序（报告层评估，非 QA 结论）

**第一梯队（★★★）**

- `claim-bevplanner-egostatus-injection-closes-gap`——链内横向最广：两架构 × 三档注入、6 行剂量-反应，QA 逐格核对通过（round2 §2）。薄弱点：ckpt source 混杂（VAD 组 ID-4 Reproduce vs ID-6 Official；UniAD 组中间档 ID-2 Official），卡 falsifier 2 已覆盖该路径；"追平"无显著性检验。
- `claim-bevplanner-ego-velocity-dominates-planning`——链内唯一干预性证据：同 ckpt 无权重混杂、量化反差大（Blank 0.46 vs v×0.5 3.19 vs v=100 208）。薄弱点：单模型（VAD-Base）、无方差报告；卡内限定一"前提是"ego status is present""（卡 L37）与限定二（CCR 静止盲区）必须随卡携带；卡 falsifier 1（"图像置空（Blank）使规划指标恶化到与速度扰动同量级"，卡 L25）给出明确复现判据。

**第二梯队（★★）**

- `claim-bevplanner-unidad-postprocessing-raises-ccr`——依赖单表（Table 6 仅 2 行），但有两重内部交叉（与 Table 1 ID-2 吻合；与 GoStright 同向佐证），QA 确认笔记内部无错位。薄弱点：CCR 为论文自定义指标，7.83 的可信度绑定在 0.1m 栅格化与 yaw 修正实现上（卡 falsifier 2/3）；仅官方权重单点。
- `claim-bevplanner-egomlp-parity-l2-collision`——**最典型的"依赖单表数字"**：主证据是 Table 1 ID-8 一行 + caption 一句定性 "on par"。另两个技术性注意：quote 2 含笔记自注"（原表为空）"（QA 观察 3）；Ego-MLP 防泄露配置只有论文自述（卡 falsifier 2 要求检查标签泄露）。

**第三梯队（★）**

- `claim-bevplanner-nuscenes-straight-driving-imbalance`——链内最弱：核心统计量 73.9% 来自 Fig. 2（笔记无表格行、无脚本、无"直行"判定阈值），87% 只有附录一句话；且"占比→捷径"的因果论文未做隔离实验——卡 falsifier 2（"在直行占比被刻意压低（<40%）的自建/重采样评测集上……"，卡 L22）才是检验该因果的手段，目前无人做过。它更像**背景假设**而非已被证明的前提。

### 2.3 选型（写进方案/对比表）时最关键的限定条件

按"引用数字前必须检查"的优先级：

1. **注入位置声明**（injection 卡；笔记 L34-36、L109）：任何 UniAD/VAD 开环数字必须先问 "in BEV? in planner?"——论文的"追平"只对 planner 注入成立，"仅 BEV 注入（ID-2/ID-5）介于两者之间"（卡 L36）；笔记另提示 UniAD 经 `use_can_bus` 开关在 BEV 阶段注入（L113）。
2. **后处理口径**（unidad-pp 卡；笔记 L168）：引用任何 UniAD 碰撞率/CCR 前先固定口径——"Table 1 中 UniAD 各行是无后处理结果"（卡 L41），Table 6 P.P.✓ 才是带后处理（0.77/0.51/7.83）。
3. **"持平"的指标范围**（parity 卡；卡 L33）："持平"只覆盖 L2 与碰撞率两个旧指标，不外推到 CCR（2.93 vs 1.93/2.47），更不外推为"整体能力相当"。
4. **前提条件**（velocity 卡；卡 L37）：ego status 在场；对无 ego status 模型要引 Appendix E 反例（4.33/7.63）。
5. **分母口径**（imbalance 卡；卡 L32）："73.9% 是对 nuScenes 数据整体的统计"，87% 是评测样本口径，不可混用。
6. **评测实现**（五卡共享，来自笔记 §3.2，L52-L55）：0.1m 网格（vs AD-MLP 0.5m 假碰撞）、碰撞率定义修正（Eq.3 + yaw 修正）、有效样本 5119/6019。跨论文比较碰撞率前这三个变量先对齐。

## 3. 与 UniAD 的关系（只依据两份笔记）

### 3.0 边界声明

UniAD 笔记是 nightshift 草稿，其自述"未经用户核阅前所有结论均属'论文声称 / 尚未独立验证'"（UniAD.md L10）；且成文明确不引用 BEV-Planner："与 BEV-Planner 的关系需单独建卡核对（本笔记不引用任何未抓取的 BEV-Planner 内容）"（UniAD.md L265；L255 亦声明"经检索未出现 BEV-Planner 等后续工作的任何引用或讨论"）。因此本节是**报告层的跨笔记综合**，不是任一论文原文内的比较。

### 3.1 后处理：同一个模块，两套指标体系给出相反的安全评价

UniAD 侧（笔记记载）：planner 有一个**仅在推理期运行**的避撞优化——"推理期避撞优化：仅推理时用牛顿法（Newton's method）优化 τ̂（Eq.(9)-(11)）"（UniAD.md L70）；另有一个**训练期** NLO 与之不同——"This target trajectory optimization is only conducted in training and does not affect inference."（UniAD.md L58）。Planner 消融显示该推理期优化以 L2 换碰撞率（Table 10：ID-3→ID-4，Col.Rate 3s 1.39→1.05、L2 3s 1.76→1.81，UniAD.md L210/L211），论文立场："a lower collision rate is preferred for safety over naive trajectory mimicking (L2 metric), and is reduced with all parts applied in UniAD."（UniAD.md L213）。

BEV-Planner 侧（笔记记载）：把同一模块记为"轨迹后处理（非线性优化避开 occupancy grid）"（BEV-Planner.md L140），实测 Col 0.62→0.51、CCR 1.72→7.83（Table 6，L144/L145），判读见 1.5 环节引文（L147）。

**争论点（两份笔记文本可见，不对错判断）**：同一开关，UniAD 以碰撞率下降论证"安全优先于轨迹模仿"，BEV-Planner 以 CCR 暴涨论证"旧指标有偏"。碰撞率与 CCR 在这个模块上方向相反——这正是"换指标换结论"的实例，而两套指标谁更接近真实安全，无法由这两份笔记裁决。口径纪律：BEV-Planner 默认报告 UniAD 无后处理结果（L168），并注明两套口径不可混用。

### 3.2 四套 UniAD 数字并存（全部为两份笔记的可观察事实）

| 口径 | 出处（locator） | L2-Avg / Col-Avg / CCR-Avg |
| --- | --- | --- |
| UniAD 原文 Table 7 | nightshift/drafts/UniAD.md L171 | 1.03 / 0.31 / — |
| BEV-Planner 复现，无注入（ID-1） | library/ADe2e/BEV-Planner.md L64 | 1.03 / 0.77 / 1.93 |
| BEV-Planner 官方 ckpt，BEV 注入（ID-2） | library/ADe2e/BEV-Planner.md L65 | 0.66 / 0.62 / 1.72 |
| 官方 ckpt + 后处理（Table 6 P.P.✓） | library/ADe2e/BEV-Planner.md L144 | 0.77 / 0.51 / 7.83 |

可观察事实：(a) L2 在"原文 vs BEV-Planner 复现无注入"两处吻合（1.03 = 1.03）；(b) 碰撞率相差一倍多（0.31 vs 0.77）；(c) BEV-Planner 表注称官方开源模型超过原文报告结果、且官方 ckpt 在 BEV 用了 ego status（L79："The official UniAD (ID-2) utilized ego status in its BEV module. It is of particular note that the performance of the officially open-sourced model exceeds the results reported in the original paper [13]."）。

笔记能提供的口径变量（不下结论哪个造成差异）：UniAD 原文"我们采用与 ST-P3 相同的指标"——"We adopt the same metrics as in ST-P3 [38], i.e., L2 error and collision rate at various timestamps."（UniAD.md L251）；BEV-Planner 用统一实现 + 0.1m 网格（L53）+ 碰撞率定义修正与 yaw 修正（L54）+ 有效样本 5119/6019（L55）。**引用 UniAD 规划数字前，必须先从这四套里选定一套并在引用处注明。**

### 3.3 "开环 vs 闭环"：两份笔记里并不存在这场争论

如实记录：**两份笔记均无闭环评测（closed-loop）的任何内容**。UniAD 明示其规划评测是开环 nuScenes（引文见 3.2，UniAD.md L251）；BEV-Planner 的问题定义就是开环（标题与 §1，L13-L15），其 §5 结论只指向"构建更合适的数据集与指标"（L165，转述）。UniAD 动机端也只有级联误差累积/MTL 负迁移（"However, they might suffer from accumulative errors or deficient task coordination."，UniAD.md L16）与 planning-oriented 主张（UniAD.md L17），未涉及评测范式之争。

因此，本仓库当前素材里真实的争论点不在"开环 vs 闭环"，而在**开环内部的三个口径问题**：①后处理算不算模型成绩（3.1）；②ego status 注入位置与 ckpt source（1.3）；③指标定义（L2/碰撞率 vs CCR，1.5）。若主人研究需要闭环对照，需另行抓取素材（本次任务不联网）。

### 3.4 ego 信息入口：两份笔记各记一处，未核对是否同源

- UniAD 笔记记载的是 planner/motion 侧的显式自车建模："we introduce one particular ego-vehicle query in the query set to explicitly model the self-driving vehicle itself, which is further used in planning."（UniAD.md L50）+ 三个 command embeddings（UniAD.md L69）。
- BEV-Planner 笔记记载的是 BEV 阶段的隐式注入："UniAD/VAD 的 BEV 生成模块 BEVFormer 在 BEV query 初始化时把 ego status 投影进特征（Appendix C Fig. 4；UniAD 通过 `use_can_bus` 开关控制，Appendix A "Ego Status Usage Details"）"（BEV-Planner.md L113）。

两处记载分层不同（query 侧 vs BEV/can_bus 侧），且 UniAD 笔记未载 `use_can_bus`——是否为同一机制的两个侧面，需对照 BEV-Planner Appendix A 原文确认。确认前，不要把"UniAD 有 ego-vehicle query（原文设计）"与"UniAD 官方 ckpt 在 BEV 注入 ego status（ID-2，BEV-Planner 复测口径）"混为同一件事。

## 4. 对主人研究的建议：最值得人工核验的两个点

**建议 1（零训练成本；直击最弱卡）：重算 nuScenes 直行占比，检验 `claim-bevplanner-nuscenes-straight-driving-imbalance`。**
做法：用 nuScenes devkit 遍历 ego 未来轨迹重算占比——第一步先回论文原文确认 "driving straightforwardly" 的判定定义（笔记未记载该定义，这本身是核验的第一步），然后按两个分母分别算：全量数据对照 73.9%、val 有效样本（5119，L55）对照 87%（L156）。为什么是它：该卡是五卡中唯一 ★ 级、且是论文"换数据集"紧迫性论证的地基；复算成立则卡可升为"已复算统计"，不成立则论文的虚高解释收窄到指标口径与注入问题（卡内已写明该后果）。顺带确认 87% 的分母是否恰为 5119 有效样本。

**建议 2（仅推理成本；直击最强卡之一）：在官方 VAD-Base ckpt 上复现 Table 2 两行关键数字，检验 `claim-bevplanner-ego-velocity-dominates-planning`。**
做法：官方权重 + 论文扰动设置，只跑推理——Blank 行（预期 L2-Avg ≈ 0.46、NDS/mAP ≈ 0.0/0.0，L95）与 v×0.5 行（预期 L2-Avg ≈ 3.19、NDS/mAP 不变 45.5/47.0，L97）。为什么是它：一次实验同时给出该卡两条量化 falsifier 的判定；且它检验的是整条论证链中唯一的因果级证据——若干预复现失败，链条降级为"相关性 + 自报数字"，1.3 环节的归因也要重估。顺带核对所用碰撞率实现是否 0.1m 网格 + Eq.3 修正（2.3 第 6 条）。

**零成本纪律（不做实验也立刻能做）**：凡引用 UniAD 数字，先从 3.2 四套口径中选定一套并注明；凡引用 UniAD/VAD 对比，先声明双方注入位置（2.3 第 1-2 条）。

## 5. 遗留问题（供调度班次转 QUESTIONS.md）

1. "直行"判定阈值未记载于笔记：73.9%/87% 复算前需先回原文定口径（建议 1 的前置步骤）。
2. `use_can_bus`（BEV-Planner.md L113 转述其 Appendix A）与 UniAD 笔记的 ego-vehicle query（UniAD.md L50）是否同一注入机制的两处记载，未核对原文；UniAD 笔记定稿时建议补录 Appendix A "Ego Status Usage Details" 摘录。
3. UniAD 原文碰撞率 0.31 与 BEV-Planner 复现 0.77（L2 同为 1.03）的差异变量未定位（3.2 表）；需回两篇原文核对评测实现差异。
4. 两份笔记均无闭环评测素材；如需开环/闭环对照，需另行安排抓取班次（本次任务不联网）。
5. 论文自身两表微差（Appendix B 轨迹平滑度表 L2 0.85/0.56 vs Table 1 0.83/0.55，笔记 L157 已加注）：QA 判为"属论文自身两表差异而非转写错误"（round2 L61），无卡引用，暂不处理；后续若建平滑度相关卡需先回原文。
6. 本报告的证据强度分级是报告层评估，不构成对任何卡 status 的变更建议；卡的升级/降级须走人工核验与用户签核流程（AGENTS.md：只有用户本人能把 claim 标记为 verified）。

## 附录 A：引文核验记录

方法：对每条引文以其字节原样做 `grep -F` 固定字符串全文匹配，要求恰好命中 1 次（`grep -cF` 计数 = 1）。共 69 条，全部 OK。以下为核验脚本逐条输出（路径为库内相对路径，L 行号为命中行）：

```
OK   x1  library/ADe2e/BEV-Planner.md:L15   Our answer is **yes and no**, considering bo
OK   x1  library/ADe2e/BEV-Planner.md:L18   73.9% of the nuScenes data involve scenarios
OK   x1  library/ADe2e/BEV-Planner.md:L20   blanking all the camera input in VAD [16] le
OK   x1  library/ADe2e/BEV-Planner.md:L80   Without the perception module, Ego-MLP (ID-8
OK   x1  library/ADe2e/BEV-Planner.md:L109  we argue that methods utilizing ego status a
OK   x1  library/ADe2e/BEV-Planner.md:L101  We can observe that introducing corruption t
OK   x1  library/ADe2e/BEV-Planner.md:L147  Our new metrics, the CCR reveal that UniAD's
OK   x1  library/ADe2e/BEV-Planner.md:L168  In this paper, we report the results of UniA
OK   x1  library/ADe2e/BEV-Planner.md:L139  This suggests that relying on past metrics t
OK   x1  library/ADe2e/BEV-Planner.md:L151  Hence, the BEV-Planner++ method has almost n
OK   x1  library/ADe2e/BEV-Planner.md:L156  in straight-driving scenarios (87% of all ev
OK   x1  library/ADe2e/BEV-Planner.md:L79   The official UniAD (ID-2) utilized ego statu
OK   x1  library/ADe2e/BEV-Planner.md:L102  Setting the ego car's speed to 100 m/s resul
OK   x1  library/ADe2e/BEV-Planner.md:L71   | 8 | Ego-MLP | - | ✓ | 0.15 | 0.32 | 0.59 |
OK   x1  library/ADe2e/BEV-Planner.md:L69   | 6 | VAD-Base | ✓ | ✓ | 0.17 | 0.34 | 0.60
OK   x1  library/ADe2e/BEV-Planner.md:L67   | 4 | VAD-Base | ✗ | ✗ | 0.69 | 1.22 | 1.83
OK   x1  library/ADe2e/BEV-Planner.md:L66   | 3 | UniAD | ✓ | ✓ | 0.20 | 0.42 | 0.75 | 0
OK   x1  library/ADe2e/BEV-Planner.md:L96   | VAD-Base | - | v×0.0 | 3.81 | 6.19 | 8.48
OK   x1  library/ADe2e/BEV-Planner.md:L144  | UniAD | ✓ | 0.77 | 0.51 | 7.83 |
OK   x1  library/ADe2e/BEV-Planner.md:L145  | UniAD | ✗ | 0.66 | 0.62 | 1.72 |
OK   x1  library/ADe2e/BEV-Planner.md:L38   We wish to underscore that our proposed base
OK   x1  library/ADe2e/BEV-Planner.md:L53   we adopt a finer default grid size of 0.1m
OK   x1  library/ADe2e/BEV-Planner.md:L55   最终有效样本 5119（占全部样本的 85%）
OK   x1  library/ADe2e/BEV-Planner.md:L113  UniAD/VAD 的 BEV 生成模块 BEVFormer 在 BEV qu
OK   x1  library/ADe2e/BEV-Planner.md:L22   论文推测 nuScenes 上的 SOTA 分数很可能来自对 e
OK   x1  library/ADe2e/BEV-Planner.md:L64   | 1 | UniAD | ✗ | ✗ | 0.59 | 1.01 | 1.48 | 1
OK   x1  library/ADe2e/BEV-Planner.md:L65   | 2 | UniAD | ✓ | ✗ | 0.35 | 0.63 | 0.99 | 0
OK   x1  library/ADe2e/BEV-Planner.md:L68   | 5 | VAD-Base | ✓ | ✗ | 0.41 | 0.70 | 1.06
OK   x1  library/ADe2e/BEV-Planner.md:L72   | 9 | BEV-Planner* | ✗ | ✗ | 0.27 | 0.54 |
OK   x1  library/ADe2e/BEV-Planner.md:L73   | 10 | BEV-Planner | ✗ | ✗ | 0.30 | 0.52 |
OK   x1  library/ADe2e/BEV-Planner.md:L74   | 11 | BEV-Planner+ | ✓ | ✗ | 0.28 | 0.42 |
OK   x1  library/ADe2e/BEV-Planner.md:L75   | 12 | BEV-Planner++ | ✓ | ✓ | 0.16 | 0.32
OK   x1  library/ADe2e/BEV-Planner.md:L70   | 7 | GoStright | - | ✓ | 0.38 | 0.79 | 1.33
OK   x1  library/ADe2e/BEV-Planner.md:L118  | BEVFormer | ✓ | 41.6 | 51.7 |
OK   x1  library/ADe2e/BEV-Planner.md:L119  | BEVFormer | ✗ | 41.3 | 51.5 |
OK   x1  library/ADe2e/BEV-Planner.md:L97   | VAD-Base | - | v×0.5 | 1.95 | 3.20 | 4.41
OK   x1  library/ADe2e/BEV-Planner.md:L99   | VAD-Base | - | v=100 m/s | 113 | 206 | 306
OK   x1  library/ADe2e/BEV-Planner.md:L95   | VAD-Base | Blank | - | 0.19 | 0.41 | 0.77
OK   x1  library/ADe2e/BEV-Planner.md:L90   | VAD-Base | - | - | 0.17 | 0.34 | 0.60 | 0
OK   x1  nightshift/drafts/UniAD.md:L251    We adopt the same metrics as in ST-P3 [38],
OK   x1  nightshift/drafts/UniAD.md:L58     This target trajectory optimization is only
OK   x1  nightshift/drafts/UniAD.md:L70     推理期避撞优化：仅推理时用牛顿法（Newton's me
OK   x1  nightshift/drafts/UniAD.md:L175    UniAD reduces planning L2 error and collisio
OK   x1  nightshift/drafts/UniAD.md:L171    | UniAD | 0.48 | 0.96 | 1.65 | 1.03 | 0.05 |
OK   x1  nightshift/drafts/UniAD.md:L213    a lower collision rate is preferred for safe
OK   x1  nightshift/drafts/UniAD.md:L50     we introduce one particular ego-vehicle quer
OK   x1  nightshift/drafts/UniAD.md:L265    与 BEV-Planner 的关系需单独建卡核对（本笔记不
OK   x1  nightshift/drafts/UniAD.md:L100    showing the superiority of our planning-orie
OK   x1  nightshift/drafts/UniAD.md:L255    经检索未出现 BEV-Planner 等后续工作的任何引用
OK   x1  nightshift/drafts/UniAD.md:L16     However, they might suffer from accumulative
OK   x1  nightshift/drafts/UniAD.md:L17     we argue that a favorable framework should b
OK   x1  nightshift/drafts/UniAD.md:L92     | 1.154 | 0.941 |
OK   x1  nightshift/drafts/UniAD.md:L93     | 1.004 | 0.430 |
OK   x1  nightshift/drafts/UniAD.md:L94     | 1.131 | 0.773 |
OK   x1  claims/claim-bevplanner-egomlp-parity-l2-collision.md:L33        只覆盖 L2 与碰撞率两个旧指标
OK   x1  claims/claim-bevplanner-egomlp-parity-l2-collision.md:L21        例如高出 2 倍以上
OK   x1  claims/claim-bevplanner-egostatus-injection-closes-gap.md:L36    仅 BEV 注入（ID-2/ID-5）介于两者之间
OK   x1  claims/claim-bevplanner-egostatus-injection-closes-gap.md:L26    注入 ego status 带来的指标提升主要来自评测实
OK   x1  claims/claim-bevplanner-ego-velocity-dominates-planning.md:L37   前提是"ego status is present"
OK   x1  claims/claim-bevplanner-ego-velocity-dominates-planning.md:L37   L2-Avg 恶化到 4.33、Colli-Avg 到 7.63
OK   x1  claims/claim-bevplanner-ego-velocity-dominates-planning.md:L25   图像置空（Blank）使规划指标恶化到与速度扰动同
OK   x1  claims/claim-bevplanner-nuscenes-straight-driving-imbalance.md:L32   73.9% 是对 nuScenes 数据整体的统计
OK   x1  claims/claim-bevplanner-nuscenes-straight-driving-imbalance.md:L22   在直行占比被刻意压低（<40%）的自建/重采样评
OK   x1  claims/claim-bevplanner-unidad-postprocessing-raises-ccr.md:L41  Table 1 中 UniAD 各行是无后处理结果
OK   x1  nightshift/qa/round2-bevplanner.md:L7    PASS ×5，FIXED ×0，ISSUED-MISMATCH ×0
OK   x1  nightshift/qa/round2-bevplanner.md:L53   笔记内部无错位（EMC2 式表格错位未复现）
OK   x1  nightshift/qa/round2-bevplanner.md:L61   属论文自身两表差异而非转写错误
OK   x1  nightshift/qa/round2-bevplanner.md:L62   逐字引用成立，不判错
```

（上表每行末截断仅为本报告排版，匹配用串为全文逐字。验证脚本模式清单：/tmp/ka_quote_checks.tsv，工作区外临时文件，不入库。）
