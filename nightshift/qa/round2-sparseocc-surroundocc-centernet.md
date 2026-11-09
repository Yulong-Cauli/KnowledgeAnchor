# QA round2 复审报告：SparseOcc / SurroundOcc / CenterNet-Points

- 日期：2026-11-02
- 复审人：nightshift 子代理（QA|round2）
- 对象：任务清单所列 11 张 claim 卡（任务标题写 12 张，实列 3+4+4=11 张，按清单执行）
- 方法：每张卡的全部 evidence quote 用脚本做定长字符串匹配（含 YAML 转义还原、弯引号/全角字符逐字比对）+ `grep -Fn` 交叉复核；locator 对照笔记标题与锚点；数字重新推导比对；网络证据（arXiv 摘要 / 官方 GitHub README）本次实际抓取复核；口径 caveat 逐项检查。

**结果分布：PASS 9 / FIXED 2 / ISSUED-MISMATCH 2（另立 2 张笔记质量卡）。`node tools/ka.mjs validate` 通过（OK: 114 claim(s)）。**

---

## 一、SparseOcc（对照 library/3D_Occupancy/SparseOcc.md）

### 1. claim-sparseocc-miou141-beats-dense-baselines — FIXED

- Quote 验证：6 条 evidence 全部逐字命中（Table 1 四行 L146-149、§1 概述 L16 弯引号「“幻觉（Hallucinations）”」逐字、arXiv 摘要句 L~abstract）。无弯引号/全角字符偏差。
- 数字：IoU 21.8 / mIoU 14.1；C-CONet 20.1/12.8、OpenOccupancy 19.3/10.3、TPVFormer 15.3/7.8——与笔记 Table 1 逐项一致；「IoU 与 mIoU 两项均高于三条基线」成立。
- 网络复核（本次抓取）：arXiv:2404.09502 摘要含 "Interestingly, it also improves accuracy, from 12.8% to 14.1% mIOU" 逐字；摘要确实未点名基准（scope 表述属实）。官方 README 抓取发现措辞偏差：卡原文写「README 口径为 OpenOccupancy-nuScenes val」，README 实句为 **"Occupancy Prediction on OpenOccupancy validation set"**。
- 修复（2 处，prose/scope，status 仍 asserted，未碰 signoff）：scope 与「限定与注意 2」改为 README 原句 "OpenOccupancy validation set"，并补引原句。
- Caveat：延迟列/显存未注明硬件故不进主张（EMC2 前车之鉴）、基线口径不对等 falsifier、命名消歧（vs NJU-SparseOcc）均在——保留完好。

### 2. claim-sparseocc-flops-749pct-below-dense — PASS

- Quote 验证：5 条全逐字命中（§1 概述 L15、Table 1 两行、§4.1 结论 L151、arXiv 摘要 74.9% 句逐字）。
- 数字重推：1−455/1810=74.86%≈74.9% ✓；455/1810=25.1%≈1/4 ✓；卡内显存侧推算 1−13/19=31.6%、1−13/21=38.1%、40.9% 反推 ≈22G 基线（不在表内）均正确。
- Caveat：FLOPs 统计口径（是否含 2D 主干/深度网）未注明——scope、限定 #2、待验证三处如实保留；「74.9% 对应 C-CONet」明确标注为反推。延迟数字正确地未进主张。

### 3. claim-sparseocc-decomposed-kernel-beats-full-kernel — PASS

- Quote 验证：4 条全逐字命中（Table 3 三行 L157-159、分析句 L161）；其中「普通卷积」行为 YAML 单引号字符串，额外用 `grep -Fn` 单独复核逐字（L158）。
- 数字：36.5/13.1 vs 35.8/12.2 → +0.7/+0.9 ✓；无补全 35.5/12.1 ✓；「+0.7 约为 2% 相对提升」（0.7/35.8=1.96%）✓。
- Caveat：消融表绝对值（IoU 35.5-36.5）与主表（21.8/14.1）口径不一致→卡已立窄为「同表内相对序」，处理正确。

---

## 二、SurroundOcc（对照 library/3D_Occupancy/SurroundOcc.md）

### 4. claim-surroundocc-dense-gt-supervision-sc-iou-1196-to-3149 — FIXED

- Quote 验证：2 条逐字命中（L95 消融结论、L63 泊松重建句，`$\mathcal{M}$` 转义还原正确）。
- 数字：11.96% → 31.49% 与笔记一致。
- 修复（1 处 prose）：「我的理解」原写「接近翻两番」——31.49/11.96≈2.63 倍，而翻两番=×4，表述失实；改为「约 2.6 倍」。status 仍 asserted，未碰 signoff。
- 网络复核：arXiv:2303.09551 摘要（本次抓取）含 "we fuse multi-frame LiDAR scans..." 与 "we adopt Poisson Reconstruction to fill the holes and voxelize the mesh..."，印证卡内 prose 转述。
- Caveat：单变量消融前提、笔记无表格行仅单源、须回原文消融表——保留完好。

### 5. claim-surroundocc-nuscenes-iou-3149-miou-2030-table-lead — PASS

- Quote 验证：3 条表行逐字命中（L89-91）。
- 数字：31.49/20.30 vs BEVFormer 30.50/16.75、TPVFormer 30.86/17.10 ✓；卡内差距结构算术（mIoU +3.20/+3.55、SC IoU +0.63/+0.99）✓。
- 网络复核：arXiv 摘要（本次抓取）确含 nuScenes 与 SemanticKITTI（"Extensive experiments on nuScenes and SemanticKITTI datasets..."），卡「论文实验另含 SemanticKITTI」prose 属实。
- Caveat：val/test 划分未注明、基线行来源未注明、自报对比表限定、只主张「同表更高」不主张 SOTA——保留完好。

### 6. claim-surroundocc-3d-voxel-query-vertical-structure-advantage — PASS

- Quote 验证：1 条逐字命中（L96）。
- 卡为窄卡（仅主张「论文声称存在该优势」），scope 明确笔记无定量数字、无指标与场景切片口径——处理正确。locator/锚点正确。

### 7. claim-surroundocc-poisson-reconstruction-dense-gt-pipeline — PASS

- Quote 验证：4 条步骤句逐字命中（L62-65）。
- 四步构成与笔记 §3 顺序一致；「步骤 3-4」locator 宽于「体素化」实际所在步骤 3，可接受（不误导）。
- Caveat：构造性主张、不涉效果评价（效果另见消融卡）、实现细节未记录须回原文/官方代码——保留完好。

---

## 三、CenterNet-Points（对照 library/Classical_Detection/CenterNet：Objects as Points.md）

### 8. claim-centernetpoints-heatmap-peaks-replace-nms — PASS

- Quote 验证：3 条逐字命中（L18、L115、L161——L161 引用止于「作用。」，避开了该行尾部的残留字符"18181818"，见 ISSUED-MISMATCH #12）。
- 数字/设定：R=4、3×3 max pooling、≥8 邻域、前 100 峰值、COCO 80 类通道——与笔记一致。
- Caveat：成立前提（中心点不重合）划归碰撞卡、不越界——保留完好。

### 9. claim-centernetpoints-regression-replaces-keypoint-grouping — PASS

- Quote 验证：3 条逐字命中（L11、L67、L151，弯引号「“配对”」「“顺便”」逐字）。
- 卡正确地不主张精度（笔记该节无逐项精度数字），速度归口 FPS 卡——边界清晰。

### 10. claim-centernetpoints-inference-fps-gain-over-cornernet — PASS

- Quote 验证：4 条逐字命中（L143、L144 两处、L151）。
- 数字：4.1 / 7.8 / 52 FPS 与笔记对比表一致；7.8/4.1≈1.9，「约两倍」表述成立。
- Caveat：**无硬件口径**这一关键 caveat 在 scope、我的理解 #2、待验证三处如实保留（测量硬件/分辨率/数据集/增强均未注明，数字间可能不同口径）——正是本轮重点核查项，合格。

### 11. claim-centernetpoints-coco-train2017-same-class-center-collision-rare — PASS

- Quote 验证：2 条逐字命中（L167 定义句含 `（Stride $R=4$ ）` 原样空格、L171 实际影响句——引用止于「（约 20%）。」，避开尾部残留"20"）。
- 数字：<0.1%、约 20% 与笔记一致。
- Caveat：**碰撞率 vs 匹配失败率不可比**这一口径 caveat 明确保留（「可比性依赖各自定义……不得当成同一指标的直接对比」）——本轮重点核查项，合格；scope 另标明 split/尺寸子集未注明。

---

## 四、ISSUED-MISMATCH：笔记本身缺陷（Agent 不得改 library/，另立卡记录）

### 12. claim-centernetpoints-note-citation-artifacts（新建，asserted）

CenterNet 笔记正文有三处网页复制残留的孤立引用编号，经正则扫描确认恰为三处（L50「位置为 1」为正常内容，非残留）：

| 位置 | 原文（已 grep 逐字验证） | 残留 |
| --- | --- | --- |
| L160（对比分析 C / CornerNet 条） | 「通常需要 Soft-NMS 来进一步清理 17。」 | 17 |
| L161（对比分析 C / CenterNet 条） | 「无需后处理 18181818。」 | 18181818（[18]×4） |
| L171（潜在局限性 / 实际影响） | 「几乎可以忽略不计 20。」 | 20 |

三处均无数字语义影响，且不在任何已立卡的 evidence quote 内；修复需用户同意（涉及 library/）。

### 13. claim-sparseocc-note-conversational-residue（新建，asserted）

SparseOcc 笔记「总结：公式如何体现"Sparse"？」末行（L123）残留 AI 对话式问句「……关于损失函数中如何利用匈牙利匹配（Hungarian Matching）来训练这套流程，需要细讲吗？」（已 grep 逐字验证）。不含数字，不影响三张 SparseOcc 卡的 evidence。另记（未立卡）：§2.4 下小节编号（### 2. Masked Attention 起）与顶层章节号重号，属结构瑕疵，未影响任何卡的 locator。

SurroundOcc 笔记经同口径扫描未发现残留或数字类错误。

---

## 五、修改文件清单

- `claims/claim-sparseocc-miou141-beats-dense-baselines.md`：scope 与限定 #2 的 README 措辞改为实抓原句（FIXED）。
- `claims/claim-surroundocc-dense-gt-supervision-sc-iou-1196-to-3149.md`：「接近翻两番」→「约 2.6 倍」（FIXED）。
- `claims/claim-centernetpoints-note-citation-artifacts.md`：新建 mismatch 卡。
- `claims/claim-sparseocc-note-conversational-residue.md`：新建 mismatch 卡。
- 本报告。

未触碰：QUEUE.md、LOCK、RULES.md、AGENTS.md、TODO.md、library/、index/、tools/、任何 signoff、任何 verified/refuted/stale 卡；无 git 提交。

## 六、validate 与索引

- `node tools/ka.mjs validate` → **OK: 114 claim(s) validated**（原 112 + 新增 2）。
- `index/claims.jsonl` 为派生索引，当前落后 2 张新卡；按规则由调度班次 `node tools/ka.mjs index` 重建即可。

## 七、遗留问题（转 QUESTIONS.md 备选）

1. 任务标题写「12 张」，实际清单为 11 张；已按清单执行，如另有第 12 张请调度班次补充指派。
2. miou 卡「同表三条相机稠密基线」沿笔记 §4.1 结论的原称呼；严格说 TPVFormer 属 TPV 投影表示而非稠密体素基线——卡的 falsifier 已覆盖口径不对等，是否改称「非稀疏基线」由用户定夺。
3. 两张 mismatch 卡对应的笔记修复（删残留编号、删对话问句、§2.4 编号）需用户本人操作 library/。
4. SparseOcc 基准命名（nuScenes-Occupancy vs OpenOccupancy val）与 Table 3 消融口径，均需回原文核对（卡内已标待验证）。
