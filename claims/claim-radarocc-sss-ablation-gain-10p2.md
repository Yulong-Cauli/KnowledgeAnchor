---
id: claim-radarocc-sss-ablation-gain-10p2
title: "RadarOcc 原文消融（Table 2）：SSS 换成 percentile-based 稀疏化后 mIoU@12.8m 由 34.3 降至 24.1（-10.2）"
type: claim
status: asserted
scope: "RadarOcc（NeurIPS 2024，arXiv:2405.14014 v4 camera-ready）原文 §5.3 Table 2 自报消融数字；数据集 K-Radar well-condition test split；单一变量为稀疏化策略——SSS（逐距离单元取多普勒均值功率 Top-Nr，Nr=250）vs percentile-based 全局稀疏化（K-Radar/Enhanced-K-Radar 做法，原文引 [42, 46]），其余 pipeline 相同；'w/o' 式消融（从完整模型替换，非从零累加）；指标为该文自定义协议 IoU/mIoU（前景/背景两类、LiDAR 叠加自生成 GT、0.4m 体素 RoI 128×128×14，非 RayIoU），与其他 benchmark 不可比"
tags: [4d-radar, radar-tensor, occupancy-prediction, sparsification, sidelobe, ablation, radarocc]
note: library/3D_Occupancy/RadarOcc.md#3-实验
paper: "NeurIPS 2024 · RadarOcc: Robust 3D Occupancy Prediction with 4D Imaging Radar · arXiv:2405.14014 · https://arxiv.org/abs/2405.14014"
stance: watch
evidence:
  - source: https://arxiv.org/pdf/2405.14014
    locator: "§5.3 Ablation study【Sidelobe-aware spatial sparsifying】段，p.8（pdftotext -layout 提取、换行合并）；URL+抓取日期 2026-11-03；HTML v4 https://arxiv.org/html/2405.14014v4 同日交叉核验，同段引用编号 [42, 46] 与 PDF 一致"
    quote: "We conduct this experiment (row (c) in Tab. 2) by changing our sidelobe-aware spatial sparsifying (c.f. Sec. 4.3) to the percentile-based spatial sparsifying used in [42, 46]. Our sidelobe-aware approach leads to a remarkable advancement in performance, especially in mIoU metrics."
    relation: supports
  - source: https://arxiv.org/pdf/2405.14014
    locator: "Table 2 row (a)（pdftotext -layout 文本层原样空格，p.8，列序 IoU/mIoU/BG IoU/FG IoU × 12.8/25.6/51.2m）；URL+抓取日期 2026-11-03"
    quote: "(a)   Ours               48.8    39.1     30.4     34.3     28.5       22.6      47.9       38.2      29.4     20.7     18.7    15.8"
    relation: supports
  - source: https://arxiv.org/pdf/2405.14014
    locator: "Table 2 row (c)（pdftotext -layout 文本层原样空格，p.8）；URL+抓取日期 2026-11-03"
    quote: "(c)   Ours w/o SSS       44.2    36.8     28.7     24.1     20.2       15.6      42.3       35.6      27.6      5.9      4.7     3.5"
    relation: supports
  - source: https://arxiv.org/pdf/2405.14014
    locator: "Table 2 表题（p.8，两行合并；⚠ 原文把 SSS 拼作 sparfiying，照抄）；URL+抓取日期 2026-11-03"
    quote: "Table 2: Ablation studies on key designs of RadarOcc. DBD, SSS, SFE refer to the Doppler bins descriptor, sidelobe-aware spatial sparfiying, and spherical-based feature encoding, respectively."
    relation: supports
  - source: library/3D_Occupancy/RadarOcc.md
    locator: "§3 实验【3.3 关键设计消融】Table 2 转录（2026-11-03 核查后补写；同日笔记小节重编号「3、」→「3.3」后同步）"
    quote: "| (c) | Ours w/o SSS（换成 percentile-based 稀疏化 [42, 46]） | 44.2 / 36.8 / 28.7 | 24.1 / 20.2 / 15.6 | 42.3 / 35.6 / 27.6 | 5.9 / 4.7 / 3.5 |"
    relation: supports
falsifiers:
  - "官方勘误或后续 arXiv 版本修改 Table 2 读数，使 row (a) vs row (c) 的 mIoU@12.8m 差距明显偏离 10.2（如小于 5 或方向反转）——本卡读数主张失效"
  - "独立复现（同配置同数据）中 percentile-based 与 range-wise Top-Nr 的 mIoU@12.8m 差距小于 1 点或方向反转——论文自报增益未被复现"
  - "同稀疏预算下随机筛选达到与 SSS 相同的下游增益，或发现两行存在未声明的其他变量（稀疏度档位/训练配置不同）——增益来自混杂因素而非 SSS 的旁瓣/弱信号机制"
  - "笔记转录与原文 Table 2 出现同位数字冲突（EMC2/OmniQuant 式表格错位）——以勘误后的原文为准重新核算"
review_due: 2026-12-03
related: [claim-radarocc-sss-rangewise-preserves-lowrcs, claim-radarocc-cfar-pointcloud-loses-lowrcs, claim-radarocc-s2c-deformable-avoids-interp-degradation, claim-radarocc-dbd-compresses-doppler-to-8-descriptors]
signoff: null
---

## 主张

论文原文（§5.3 + Table 2，NeurIPS 2024 camera-ready v4，2026-11-03 实抓）自报：在 K-Radar well-condition test split 上，把完整 RadarOcc 的旁瓣感知空间稀疏化（SSS，逐距离单元取多普勒均值功率 Top-$N_r$，Nr=250）替换为 K-Radar / Enhanced-K-Radar 的 percentile-based 全局稀疏化、其余 pipeline 不变，mIoU@12.8m 从 34.3 降至 24.1（-10.2 点），mIoU@25.6m/51.2m 同降 8.3/7.0 点；其中 FG IoU 三个距离从 20.7/18.7/15.8 跌至 5.9/4.7/3.5（-14.8/-14.0/-12.3），即低 RCS 前景在全局百分比稀疏化下几乎全部丢失。方向与 §2 方法「percentile 筛选把保留元素集中在少数强反射距离并混入旁瓣」的机制叙述一致。

四条限定：

1. 单一变量是稀疏化策略，但这是 **w/o 式消融**（从完整模型替换）：10.2 是「替换后掉多少」，不是从零累加的组件贡献。
2. 本卡只立 **SSS 单组件**的消融增益。**不立** DBD 有效性——Table 2 行 (b) 的 w/o DBD 差距 ≤0.7 且方向混杂（25.6m 四列 w/o DBD 反而略高），论文自认 "the improvement is somehow marginal"；**不立**球坐标编码/S2C 的拆分归因——行 (d) 同时改「转笛卡尔编码」与「省略 S2C 聚合」两处，只能得出合并增益 mIoU +1.5~+3.9。
3. 附录 Table 6（validation set）显示 mIoU@12.8m 最高点在 Nr=450（36.8）而非选用的 250（34.0），论文取 250 的理由是「一半指标最优 + 推理更快」——SSS 增益对 Nr 超参敏感且非单调。
4. 指标为 K-Radar 自定义协议（IoU/mIoU、LiDAR 叠加自生成 GT），与 nuScenes/SemanticKITTI 系（RayIoU 等）不可比；adverse-weather 场景连 GT 都未生成，本卡数字全部来自正常天气 split。

## 待验证

- 复现：开源实现（github.com/Toytiny/RadarOcc，Apache-2.0）中把 SSS 换回 percentile-based 稀疏化重训，看 mIoU@12.8m 是否复现约 10 点差距、FG IoU 是否同样塌到个位数。
- 跟踪官方 repo / NeurIPS 页面有无勘误修改 Table 2 读数。
- 机制对照：同稀疏预算下「随机筛选 vs range-wise Top-Nr vs 全局 percentile」三组对比，检验「旁瓣/弱信号保留」解释是否必要（排除纯稀疏度效应）。

## 成立/不成立的含义

成立：对 4D 雷达张量管线，输入端稀疏化策略（逐距离分层 vs 全局百分比）是被低估的最大单点收益；自研 4DRT 管线应默认 range-wise Top-$N_r$，并把全局 percentile 路线视为已知次优。
不成立：增益主要来自稀疏度/容量差异或实现细节而非旁瓣机制，稀疏化按算力预算选参数即可；`claim-radarocc-sss-rangewise-preserves-lowrcs` 的动机叙事需相应降级。

---

本卡即 2026-11-03 消融核查的产出；Table 2 全表及 DBD/SFE/RWA 补充消融已转录至笔记 §3 实验。

## 核查记录

- 2026-11-03（建卡时）：arXiv v4 PDF（pdftotext -layout）+ HTML v4 双源实抓，§5.3 句与 Table 2 行逐字核对，正文四条限定的引文当时完成；笔记 §3.3 转录行同日入库。
- 2026-11-05（02 任务书整理班）：复核性重抓 https://arxiv.org/html/2405.14014v4 ——§5.3「We conduct this experiment (row (c) in Tab. 2)…」句逐字命中（句内括号处空格为 LaTeXML 链接边界渲染伪迹，与 PDF 文本层同句一致）；正文限定 3「论文取 250 的理由是一半指标最优 + 推理更快」在附录 C.1 原文核实（"achieves the best results in half of all metrics…Additionally, the inference speed at Nr = 250 is relatively higher compared to configurations with larger values"——「推理更快」系相对更大 Nr 而言）；1 条笔记 quote Grep 逐字命中。数字与命题未动。id/status/stance/review_due/signoff 未动。
