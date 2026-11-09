---
id: claim-bevplanner-ego-velocity-dominates-planning
title: "BEV-Planner 论文声称：ego status 在场（VAD-Base，planner 注入）时，相机 corruption 显著降感知但仅小幅影响规划，扰动 ego 速度才显著改变规划轨迹"
type: claim
status: asserted
scope: "nuScenes val；官方 VAD-Base checkpoint（planner 注入 ego status）；Table 2 扰动实验：图像退化（Snow/Fog/Glare/Rain/Blank）vs ego 速度扰动（v×0.0 / v×0.5 / v×1.5 / v=100 m/s）；指标为 L2 距离(m)、碰撞率(%)、CCR(%) 及感知 NDS/mAP；论文自报数字"
tags: [end-to-end-driving, open-loop, ego-status, nuscenes, bev-planner, robustness]
note: library/ADe2e/BEV-Planner.md#34-图像退化-vs-ego-status-扰动
paper: "CVPR 2024, Is Ego Status All You Need for Open-Loop End-to-End Autonomous Driving? (BEV-Planner, arXiv:2312.03031)"
stance: watch
evidence:
  - source: library/ADe2e/BEV-Planner.md
    locator: "§1 三个缺点之（3）"
    quote: "blanking all the camera input in VAD [16] leads to complete failure of the perception module but minor degrade in planning, when ego status is present. However, altering the input ego velocity can significantly influence the final predicted trajectory."
    relation: supports
  - source: library/ADe2e/BEV-Planner.md
    locator: "§4 / Table 2 caption"
    quote: "In contrast to the minor impact of image corruption on planning, modifications to the ego vehicle's velocity have a significant effect on the planning results."
    relation: supports
  - source: library/ADe2e/BEV-Planner.md
    locator: "§4 / Table 2 v×0.0 行"
    quote: "| VAD-Base | - | v×0.0 | 3.81 | 6.19 | 8.48 | 6.16 | 1.00 | 6.76 | 16.18 | 7.98 | 0.19 | 0.41 | 3.10 | 1.23 | 45.5 | 47.0 |"
    relation: supports
falsifiers:
  - "同配置复现：官方 VAD-Base（planner 注入 ego status）、nuScenes val、论文扰动协议下，图像置空（Blank）使规划指标恶化到与速度扰动同量级（例如 L2-Avg 从约 0.37 升到 2 以上），而非论文所述的小幅退化"
  - "同配置复现：对 ego 速度施加 v×0.5 / v×1.5 级别扰动时，预测轨迹几乎不变（L2-Avg 变化在 0.1 以内），与 Table 2 的 3.19 / 3.20 相差甚远"
  - "原文核查：重新抓取 arXiv HTML/PDF 发现 Table 2 行值或 caption 结论句与本卡所引不符"
review_due: 2026-12-02
related: [claim-bevplanner-egostatus-injection-closes-gap, claim-bevplanner-egomlp-parity-l2-collision]
signoff: null
---

## 这条主张是什么意思

开环端到端规划模型的评测里，L2/碰撞率这类指标区分度存疑——AD-MLP 表明只用 ego status 的 MLP 就能打平 SOTA。这篇论文用一组扰动实验给出更直接的证据：在 planner 注入 ego status 的官方 VAD-Base 上，把相机输入置黑（感知 NDS/mAP 崩到 0.0/0.0），L2-Avg 只从 0.37 变到 0.46；而把 ego 速度乘 0.5 或设为 100 m/s，L2-Avg 恶化到 3.19 / 208，感知 NDS/mAP（45.5/47.0）完全不变（Table 2）。也就是说：在这个配置下，最终轨迹主要由速度输入决定，视觉输入对规划的贡献被压得很低。这是论文报告的行为观察；"为什么"（见下节）与"是否跨模型"（见迁移限制）要分开看。

## 证据支持到哪里

- 三条 evidence 直接支撑：§1 缺点（3）的概括句、Table 2 caption 的结论句、Table 2 的 v×0.0 行（含速度扰动下感知 45.5/47.0 不变的关键列）。正文其余数字（Blank 行 0.37→0.46、v×0.5 → 3.19、v=100 → 208、附录 E 的 4.33/7.63）均转录自笔记 §3.4/§3.5(f)，本班 Grep 逐字命中。
- 证据边界：全部是**论文报告**，本库无独立复现。笔记数字来自 arXiv HTML v2 实抓（2026-11-02），分辨率 256×704 一处已对官方 PDF 核实（笔记 §3.1 注记）；论文开源（github.com/NVlabs/BEV-Planner，无 LICENSE 文件，2026-11-03 GitHub API 核实在案），复现路径可行但本班未执行。读到原文 ≠ 效果复现，由 falsifier 分别检验。

## 可能的解释与未排除的因素

- 行为观察（Table 2 直接报告）：视觉退化下规划指标变化小、速度扰动下变化大。这是本卡标题的主张本身。
- 作者解释（论文立场，非本库复核）：ego status 在场时模型主要靠 ego status 拟合轨迹，感知信息利用被弱化；§4.3(e) 佐证是 BEV-Planner++ 的 BEV 特征激活集中在自车周边，论文推测"almost not learned any effective information"。
- 替代解释（本班整理者提出，尚未验证）：速度扰动下的轨迹跟随可能只是**条件输入敏感性**——把速度作为强条件输入本是一种合理设计，输出跟随输入不自动等于"视觉无效"或"捷径拟合"；Blank 实验才是更干净的"视觉是否被使用"证据。行为层面两解释都兼容，区分它们需要见下一步的机制检查，不能把 Table 2 直接读成因果机制结论。
- 未排除因素：CCR 在速度置零时反而很好（1.23），论文自注是 CCR 指标局限（静止轨迹不碰路沿）——CCR 在扰动实验中的盲区未完全排查；nuScenes 直行主导（论文 §1 称 73.9%）可能同时放大 L2 的小变化与速度的主导性。

## 适用范围与迁移限制

- 结论绑定：官方 VAD-Base + planner 注入 ego status + nuScenes val + 开环 L2/碰撞率/CCR 指标。不外推到：无 ego status 注入的模型（Appendix E 显示对不含 ego status 的 VAD-Base 屏蔽相机，L2-Avg 恶化到 4.33——视觉在无 ego status 时确实重要）；UniAD、BEV-Planner++ 等其他模型（Table 2 扰动仅测 VAD-Base）；闭环或实车场景。
- 论文 §4.3 的更大结论（"利用 ego status 的方法不可直接比较"）建立在 Table 1 全表上，超出本卡范围；需要时看[注入位置卡](claim-bevplanner-egostatus-injection-closes-gap.md)与 egomlp-parity 卡。

## 对研究问题的启发

以下为尚未验证的研究假设与可复用的检查思路：

- "模型实际用了哪些输入"可以用这种双扰动审计（退化感知输入 vs 扰动条件输入，观察输出敏感性与感知指标分离）作为通用检查范式；对 VLA/端到端系模型（见库内 VLM_VLA 卡）同样适用，但结论不可预支。
- 指标盲区问题：扰动实验暴露了 CCR 与 L2 各自的盲区（静止轨迹 CCR 失真、直行主导下 L2 区分度低），提示评测应成对报告"输入敏感性 + 感知有效性"。

## 当前立场与下一步

- 当前 stance：watch。原卡未记录立场依据，按未记录处理；历史材料：11-02 精读报告（nightshift/reports/bevplanner-deep-read.md）将本扰动线评为全链证据最强（★★★），属当年整理者评估记录，不构成立场变更依据。
- 优先执行的最小检查——**机制辨别**（复现成本低、直接区分上节两解释）：用官方 checkpoint 与扰动协议跑"视觉 × 速度"2×2 组合（视觉原样/置黑 × 速度原样/置零），固定数据、指标实现与 checkpoint，观察 L2/碰撞率/CCR 与轨迹形态。若"视觉置黑、速度原样"与基线几乎一致而"速度置零"轨迹崩溃，行为复现成立；进一步做 BEV 特征激活对比（仿 §4.3(e)）：激活集中自车周边 → 支持"感知被弱化"解释；激活仍含前向结构 → 条件输入设计解释占优。
- **同范围复现**：先复现 Table 2 的 Blank 行与 v×0.0 行两个锚点行即可（不必全表）；复现不出 0.46/6.16 量级 → 按 falsifier 登记。
- **跨条件迁移**（单独任务，不与上混）：对 UniAD 或 BEV-Planner++ 重复同款双扰动，检验"速度主导"是否跨模型；结果只改变迁移判断，不动本卡原命题。

## 核查记录

- 2026-11-02（建卡）：数字自 arXiv HTML v2 实抓；11-02 精读报告覆盖本卡（★★★）。
- 2026-11-05（02 任务书样板整理班）：表达整理，数字与 quote 未改写。3 条 evidence Grep 逐字命中笔记；正文数字（0.37→0.46、3.19/3.20/208、4.33/7.63、45.5/47.0）逐项与笔记 §3.4/§3.5 核对一致；"若成立"段原来外推到"nuScenes 开环模型"，已约束回 VAD-Base 原配置并把跨模型检查移入"跨条件迁移"任务；新增"输出敏感性 vs 感知弱化"两解释的区分与机制检查下一步。id/status/stance/review_due/signoff 未动。
