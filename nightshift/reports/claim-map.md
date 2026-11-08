# [report] 全库 Claim 地图（服务人工核验与 signoff 决策）

> **2026-11-08 现行状态更正（本报告其余内容为历史快照）：** 原 `claim-bevplanner-nuscenes-straight-driving-imbalance` 已移除，由 [nuScenes 六步低横向位移数据属性卡](../../claims/claim-nuscenes-three-second-low-lateral-displacement-majority.md)（asserted / watch，尚未独立验证）替代。原“精准复现/强证据”解释已撤回，见 [审核说明](../../experiments/bevplanner-nuscenes-straight-driving-imbalance/AUDIT-2026-11-08.md)。旧 id 与旧评级仅保留历史语境，新卡不承接捷径因果。

- **日期**：2026-11-02
- **性质**：只读盘点。本报告不新增、不修改任何 claim 卡；所有 id / 数量 / 状态字段均与 `claims/` 下卡文件逐一核对（evidence quote 未重复验证，以各 QA 报告为准）。
- **素材（全部本地）**：`claims/` 全部 114 张卡；`library/` 笔记目录结构（29 篇笔记有卡）；`nightshift/qa/` 七份 round2 报告；`nightshift/verify/claim-qwt-r2-gate-nonregression.md`；`nightshift/cross/4d-radar.md`（归组参考）。
- **validate**：`node tools/ka.mjs validate` → `OK: 114 claim(s) validated`（本报告撰写后复跑通过）。

## 0. 总览

| 项 | 数 |
| --- | --- |
| claim 卡总数 | **114**（全部 `status: asserted`，`signoff: null`，无 verified / refuted / stale） |
| round2 QA 覆盖 | **75 张复审**（PASS 56 / FIXED 19 / ISSUED 0），另由 QA **新建 2 张**笔记缺陷卡（即 ISSUED 来源，见 §3.1） |
| 未入 round2 QA | **37 张**：centernettriplets ×4、echofusion ×7、emc2 ×2、fastrcnn ×4、pdquant ×4、qdbev ×4、repqvit ×4、ptqat ×2、sgdet3d ×4、qwt ×1（有专项 verify 报告）、omniquant-note-table-mismatch ×1（其证据在 round2-quant-fusion 中逐条复验命中，但未给正式判定） |
| 证据来源构成 | 笔记+外部双源（evidence 同时含笔记与 arXiv/README）**28 张**；论文直采（evidence 全为 arXiv，笔记挂 `note:` 字段，EchoFusion 6 张）**6 张**；仅笔记源 **80 张** |
| 笔记覆盖 | 29 篇笔记有卡：3D_Occupancy ×5、Classical_Detection ×9、Multimodal_Fusion ×5、Quantization ×8、ADe2e ×1、QA dataset ×1；`AI Infra/` ×3 与 `Math_and_Notes/` ×3 暂无 claim 卡 |

**证据强度自评口径**（依据 QA 判定 + evidence 条数/来源数）：

- **★★★**：笔记+外部双源，且 round2 逐字复核通过（含 FIXED 后复核）；数字经逐格比对或算术验算。
- **★★**：仅笔记单源，但 round2 全量 quote 逐字验证 + 数字回源复算通过；或双源/论文直采但未入 round2。
- **★**：单源且 round2 未覆盖；或证据为图注转述 / 机制性叙述级；或主张含未决口径问题。

**QA 列说明**：PASS / FIXED / ISSUED 来自七份 round2 报告；「未复审」= 不在该轮范围；QwT 卡另有专项 verify 报告（结论：部分支持）。

---

## 1. 分主题 Claim 地图

### 1.1 量化主线（27 张；Quantization/ 8 篇笔记）

QA：round2-quant-fusion（OmniQuant 4×PASS；RadarDistill/RCBEVDet/VQ-Map 12×FIXED）、round2-ali-mq-lingoqa（MQBench 4×PASS）。

| 卡 | 一句话主张 | 证据 | QA round2 | 强度 |
| --- | --- | --- | --- | --- |
| [claim-omniquant-w2a16g128-llama7b-ppl-beats-gptq-awq](../../claims/claim-omniquant-w2a16g128-llama7b-ppl-beats-gptq-awq.md) | OmniQuant 自报：LLaMA-1-7B W2A16g128 WikiText2 PPL 9.72，远低于 GPTQ（44.01）/ AWQ（2.6e5） | 笔记+双源 | PASS | ★★★ |
| [claim-omniquant-w4a4-llama7b-zeroshot-5265](../../claims/claim-omniquant-w4a4-llama7b-zeroshot-5265.md) | LLaMA-1-7B W4A4 六任务零样本均值 52.65%，高于 SmoothQuant（38.41）/ LLM-QAT（41.27） | 笔记+双源 | PASS | ★★★ |
| [claim-omniquant-let-lwc-ablation-w4a4-best](../../claims/claim-omniquant-let-lwc-ablation-w4a4-best.md) | 消融自报：W4A4 下 LET+LWC 组合平均 PPL 12.87 低于任一单组件变体（16.97 / 15.80） | 笔记+双源 | PASS | ★★★ |
| [claim-omniquant-w4a16g128-llama13b-a100-913toks](../../claims/claim-omniquant-w4a16g128-llama13b-a100-913toks.md) | LLaMA-13B W4A16g128 量化权重 7.0 GB、A100-80G 512-token 吞吐 91.3 tok/s | 笔记+双源 | PASS | ★★★ |
| [claim-mqbench-first-hardware-aligned-quant-benchmark](../../claims/claim-mqbench-first-hardware-aligned-quant-benchmark.md) | MQBench 声称是首个面向工业落地、训练与部署完全一致的量化基准框架 | 笔记单源 | PASS | ★★ |
| [claim-mqbench-three-hardware-graph-settings](../../claims/claim-mqbench-three-hardware-graph-settings.md) | 计算图约束覆盖学术 / TensorRT 式 / SNPE 式三类硬件设定 | 笔记单源 | PASS | ★★ |
| [claim-mqbench-snpe-tied-scale-accuracy-collapse](../../claims/claim-mqbench-snpe-tied-scale-accuracy-collapse.md) | SNPE 强图约束（Scale 绑定）使大部分 QAT 算法精度断崖式暴跌 | 笔记单源 | PASS | ★★ |
| [claim-mqbench-bn-folding-figure-e-zero-drop](../../claims/claim-mqbench-bn-folding-figure-e-zero-drop.md) | 只有「先折叠 BN 再伪量化」的图(e) 方案零掉点；图(c)(d) 差 1-2%、图(b) 不收敛 | 笔记单源 | PASS | ★★ |
| [claim-pdquant-beats-brecq-qdrop-lowbit](../../claims/claim-pdquant-beats-brecq-qdrop-lowbit.md) | PD-Quant 自报四个低比特设置下精度均高于 BRECQ 与 QDrop | 笔记单源 | 未复审 | ★ |
| [claim-pdquant-dc-bn-stats-narrow-calibration-val-gap](../../claims/claim-pdquant-dc-bn-stats-narrow-calibration-val-gap.md) | DC 以 BN 全局统计量为真值修正校准特征，ResNet-18 W2A2 验证精度再抬 0.40% | 笔记单源 | 未复审 | ★ |
| [claim-pdquant-pd-loss-alone-overfits-calibration](../../claims/claim-pdquant-pd-loss-alone-overfits-calibration.md) | PD 损失单独使用在小校准集上严重过拟合（校准 70.51% vs 验证 1.07%） | 笔记单源 | 未复审 | ★ |
| [claim-pdquant-pd-metric-beats-mse-cosine-2bit-activation](../../claims/claim-pdquant-pd-metric-beats-mse-cosine-2bit-activation.md) | 2-bit 激活量化下 PD 度量选出的缩放因子精度高于 MSE / Cosine / Min-Max | 笔记单源 | 未复审 | ★ |
| [claim-ptqat-w4-outperforms-full-qat-fewer-params](../../claims/claim-ptqat-w4-outperforms-full-qat-fewer-params.md) | PTQAT 在 nuScenes W4 上以更少可训练参数达到不低于全参数 QAT 的 mAP/NDS | 笔记+双源 | 未复审 | ★★ |
| [claim-ptqat-w8a8-tensorrt-accuracy-recovery](../../claims/claim-ptqat-w8a8-tensorrt-accuracy-recovery.md) | BEVDepth4D W8A8 下 TensorRT 以接近官方 PTQ 的速度与更低显存恢复大部分精度 | 笔记+双源 | 未复审 | ★★ |
| [claim-qdbev-encoder-backbone-quantization-bottleneck](../../claims/claim-qdbev-encoder-backbone-quantization-bottleneck.md) | BEVFormer 各模块单独 W4A6 量化时 Encoder/Backbone 是精度瓶颈，Neck/Decoder 几乎无损 | 笔记单源 | 未复审 | ★ |
| [claim-qdbev-progressive-qat-beats-standard-w4a6](../../claims/claim-qdbev-progressive-qat-beats-standard-w4a6.md) | W4A6 渐进式 QAT 达 NDS 0.485，比标准一次性 QAT（0.224）高 0.261 | 笔记单源 | 未复审 | ★ |
| [claim-qdbev-ptq-collapses-below-8bit](../../claims/claim-qdbev-ptq-collapses-below-8bit.md) | 直接 PTQ 低于 8-bit 后崩塌（W4A6 NDS 0.226，W4A4 近乎失效 mAP 0.000） | 笔记单源 | 未复审 | ★ |
| [claim-qdbev-tiny-w4a6-nds-surpasses-fp32](../../claims/claim-qdbev-tiny-w4a6-nds-surpasses-fp32.md) | W4A6 QD-BEV-T 以约 8 倍压缩（15.9 MB）取得 NDS 0.372，反超 FP32 的 0.354 | 笔记+双源 | 未复审 | ★★ |
| [claim-repqvit-calibration-32-images-1point3-min](../../claims/claim-repqvit-calibration-32-images-1point3-min.md) | RepQ-ViT 自报仅需 32 张校准图、RTX 3090 上 1.3 分钟完成整卡量化 | 笔记单源 | 未复审 | ★ |
| [claim-repqvit-layernorm-reparam-recovers-layerwise](../../claims/claim-repqvit-layernorm-reparam-recovers-layerwise.md) | LayerNorm 尺度重参数化把 DeiT-S W4A4 逐层量化精度从 33.17% 恢复到 69.03% | 笔记单源 | 未复审 | ★ |
| [claim-repqvit-softmax-reparam-log2-lossless](../../claims/claim-repqvit-softmax-reparam-log2-lossless.md) | Softmax 尺度重参数化使 log_2 量化精度无损追平 log_√2（均 69.03%） | 笔记单源 | 未复审 | ★ |
| [claim-repqvit-w4a4-imagenet-leads-ptq-baselines](../../claims/claim-repqvit-w4a4-imagenet-leads-ptq-baselines.md) | W4A4 下 ViT-B / DeiT-S / Swin-S 达 68.48 / 69.03 / 79.45，高于 PTQ4ViT 与 APQ-ViT | 笔记单源 | 未复审 | ★ |
| [claim-qwt-r2-gate-nonregression](../../claims/claim-qwt-r2-gate-nonregression.md) | QwT 的 R² 门控能保证补偿后的模型不劣于原 PTQ | 笔记单源（verify 报告以 CVPR 正式版+官方代码双源核对） | 未入 round2；专项 verify：**部分支持** | ★★ |
| [claim-vqmap-nuscenes-map-miou-622-leads-table](../../claims/claim-vqmap-nuscenes-map-miou-622-leads-table.md) | VQ-Map 在 nuScenes 环视 BEV 地图分割 mean mIoU 62.2，高于同表全部对比方法 | 笔记+双源 | FIXED | ★★★ |
| [claim-vqmap-argoverse-zero-shot-iou-734](../../claims/claim-vqmap-argoverse-zero-shot-iou-734.md) | nuScenes 训练的 Codebook+Decoder 零样本迁移 Argoverse，IoU 73.4 高于前 SOTA 68.3 | 笔记+双源 | FIXED | ★★★ |
| [claim-vqmap-tiny-868g-macs-matches-ddp](../../claims/claim-vqmap-tiny-868g-macs-matches-ddp.md) | Tiny 以 86.8G MACs 达 59.6 mIoU，约 1/7 算量追平 DDP（614.1G / 59.4） | 笔记+双源 | FIXED | ★★★ |
| [claim-vqmap-token-classification-618-beats-regression](../../claims/claim-vqmap-token-classification-618-beats-regression.md) | 同一 Token Decoder 下预测离散 Token 索引（61.8）优于回归连续/量化向量（60.3 / 60.1） | 笔记+双源 | FIXED | ★★★ |

### 1.2 4D 雷达与占用（29 张；3D_Occupancy/ 5 篇 + R4Det、SGDet3D 按 cross/4d-radar.md 主题归组）

QA：round2-radarocc-r4det（PASS 6 / FIXED 2）、round2-hgsfusion-nju（NJU-SparseOcc 部分）、round2-sparseocc-surroundocc-centernet（SparseOcc / SurroundOcc 部分）。

| 卡 | 一句话主张 | 证据 | QA round2 | 强度 |
| --- | --- | --- | --- | --- |
| [claim-radarocc-sss-rangewise-preserves-lowrcs](../../claims/claim-radarocc-sss-rangewise-preserves-lowrcs.md) | 逐距离单元 Top-Nr 稀疏化（SSS）相比全局百分比筛选保留低 RCS 弱信号并抑制旁瓣 | 笔记单源 | PASS | ★★ |
| [claim-radarocc-dbd-compresses-doppler-to-8-descriptors](../../claims/claim-radarocc-dbd-compresses-doppler-to-8-descriptors.md) | DBD 将每个距离-角度单元的多普勒轴压缩为 8 维统计描述符，数据量降至 8/D | 笔记单源 | PASS | ★★ |
| [claim-radarocc-s2c-deformable-avoids-interp-degradation](../../claims/claim-radarocc-s2c-deformable-avoids-interp-degradation.md) | 硬性球转直坐标插值因采样非均匀导致特征退化，改用可学习可变形交叉注意力聚合避免 | 笔记单源 | PASS | ★★ |
| [claim-radarocc-cfar-pointcloud-loses-lowrcs](../../claims/claim-radarocc-cfar-pointcloud-loses-lowrcs.md) | CFAR 点云化丢失低 RCS 弱反射，直接处理原始 4D 雷达张量可避免该丢失 | 笔记单源 | FIXED | ★★ |
| [claim-r4det-tj4dradset-ablation-5407-bev-map](../../claims/claim-r4det-tj4dradset-ablation-5407-bev-map.md) | TJ4DRadSet 上 PDF/DGTF/IGDR 逐级叠加使 BEV mAP 45.15→54.07、3D mAP 39.86→47.29 | 笔记单源 | PASS | ★★ |
| [claim-r4det-dgtf-t1-single-step-best](../../claims/claim-r4det-dgtf-t1-single-step-best.md) | DGTF 时序融合单步长（t-1）最佳（BEV mAP 50.41），跨帧引发轨迹错位与误差累积 | 笔记单源 | PASS | ★★ |
| [claim-r4det-plugplay-vod-eaa-gain](../../claims/claim-r4det-plugplay-vod-eaa-gain.md) | 模块即插即用挂到 BEVFusion / RCBEVDet，VoD 上 mAP_EAA 分别 +6.34% / +5.34% | 笔记单源 | PASS | ★★ |
| [claim-r4det-pdf-depth-supervision-monotonic-gain](../../claims/claim-r4det-pdf-depth-supervision-monotonic-gain.md) | PDF 三重深度监督每引入一项 BEV mAP 单调增长（45.15 → 46.08 → 46.86） | 笔记单源 | FIXED | ★★ |
| [claim-sgdet3d-sota-eaa-dc-caliber](../../claims/claim-sgdet3d-sota-eaa-dc-caliber.md) | SGDet3D 自报 VoD（mAP_EAA 59.49 / mAP_DC 77.11 口径）与 TJ4DRadSet 上 SOTA；与 HGSFusion 的 RoI AP 口径互不可比 | 笔记单源 | 未复审 | ★ |
| [claim-sgdet3d-srp-gdc-laca-vod-monotonic](../../claims/claim-sgdet3d-srp-gdc-laca-vod-monotonic.md) | VoD 组件消融 SRP → GDC → LACA 逐级叠加，mAP_EAA 单调增长 50.44→56.11→58.27→59.49 | 笔记单源 | 未复审 | ★ |
| [claim-sgdet3d-depth-supervision-density-gain](../../claims/claim-sgdet3d-depth-supervision-density-gain.md) | 深度监督密度消融：无监督 56.95 < 雷达点云 58.75 < LiDAR 真值 59.49 | 笔记单源 | 未复审 | ★ |
| [claim-sgdet3d-depth-orientation-pollution-without-gdc](../../claims/claim-sgdet3d-depth-orientation-pollution-without-gdc.md) | 无 GDC 增强的深度定向使 mAP_EAA 低于无定向基线（55.79→54.29），加 GDC 反超至 58.19 | 笔记单源 | 未复审 | ★ |
| [claim-echofusion-kradar-gain](../../claims/claim-echofusion-kradar-gain.md) | EchoFusion 在 KRadar-20 上显著优于 RTNH 点云基线（BEV AP@0.7 33.07 vs 10.47） | 论文直采（arXiv） | 未复审 | ★★ |
| [claim-echofusion-3d-ap-below-lidar](../../claims/claim-echofusion-3d-ap-below-lidar.md) | EchoFusion 在 RADIal 上的 3D AP 仍远低于 LiDAR | 论文直采（arXiv） | 未复审 | ★★ |
| [claim-echofusion-radial-ap-ar-tradeoff](../../claims/claim-echofusion-radial-ap-ar-tradeoff.md) | RADIal 原始协议下主要收益是 AR/F1，AP 仅与 FFTRadNet 持平 | 论文直采（arXiv） | 未复审 | ★★ |
| [claim-echofusion-rt-vs-rp-radial](../../claims/claim-echofusion-rt-vs-rp-radial.md) | RADIal 受控消融中 RT+C 的 BEV AP 高于 RP+C，优势主要在中远距 | 论文直采（arXiv） | 未复审 | ★★ |
| [claim-echofusion-rt-vs-ra-noise](../../claims/claim-echofusion-rt-vs-ra-noise.md) | RADIal 上 RT+C 与 RA+C 的总体 BEV AP 差异在误差范围内 | 论文直采（arXiv） | 未复审 | ★★ |
| [claim-echofusion-paa-not-isolated](../../claims/claim-echofusion-paa-not-isolated.md) | 论文的消融没有单独隔离 PAA 的贡献 | 论文直采（arXiv） | 未复审 | ★★ |
| [claim-njusparseocc-rayiou34-fps17-beats-dense-baselines](../../claims/claim-njusparseocc-rayiou34-fps17-beats-dense-baselines.md) | Occ3D-nuScenes + A100 上 7 帧达 RayIoU 34.0 / 17.3 FPS，高于 BEVFormer（32.2 / 2.3）与 FB-Occ（33.7 / 5.2） | 笔记+双源 | FIXED | ★★★ |
| [claim-njusparseocc-decoder-pruning-complexity-onactive](../../claims/claim-njusparseocc-decoder-pruning-complexity-onactive.md) | 稀疏体素解码器粗到细硬剪枝把复杂度从 O(L³) 降至 O(N_active)，低分辨率即抹除 >90% 背景节点 | 笔记单源（摘要不含关键式） | PASS | ★★ |
| [claim-njusparseocc-mgss-complexity-onquery-np](../../claims/claim-njusparseocc-mgss-complexity-onquery-np.md) | MGSS 把掩码交叉注意力从 O(N_query·M_voxel) 降为 O(N_query·N_p) 固定点数采样 | 笔记+双源 | PASS | ★★ |
| [claim-njusparseocc-rayiou-penalizes-thick-surface](../../claims/claim-njusparseocc-rayiou-penalizes-thick-surface.md) | RayIoU 按射线首次命中与深度阈值（1m/2m/4m）判 TP，加厚表面无法换取更高得分 | 笔记+双源 | PASS | ★★ |
| [claim-sparseocc-miou141-beats-dense-baselines](../../claims/claim-sparseocc-miou141-beats-dense-baselines.md) | 验证集上 IoU 21.8 / mIoU 14.1，高于三条非稀疏基线（C-CONet 20.1/12.8 等） | 笔记+双源 | FIXED | ★★★ |
| [claim-sparseocc-flops-749pct-below-dense](../../claims/claim-sparseocc-flops-749pct-below-dense.md) | 相对稠密基线 FLOPs 减少 74.9%（455G vs 1810G，约 1/4） | 笔记+双源 | PASS | ★★★（74.9% 对应 C-CONet 系反推，需回原文） |
| [claim-sparseocc-decomposed-kernel-beats-full-kernel](../../claims/claim-sparseocc-decomposed-kernel-beats-full-kernel.md) | 分解 3D 核比同数量 3×3×3 普通卷积高 IoU 0.7 / mIoU 0.9，且均高于无补全块 | 笔记单源 | PASS | ★★ |
| [claim-surroundocc-nuscenes-iou-3149-miou-2030-table-lead](../../claims/claim-surroundocc-nuscenes-iou-3149-miou-2030-table-lead.md) | 纯相机输入达 SC IoU 31.49 / SSC mIoU 20.30，高于 BEVFormer（30.50/16.75）与 TPVFormer（30.86/17.10） | 笔记单源（QA 摘要旁证） | PASS | ★★ |
| [claim-surroundocc-dense-gt-supervision-sc-iou-1196-to-3149](../../claims/claim-surroundocc-dense-gt-supervision-sc-iou-1196-to-3149.md) | 监督信号从稀疏点云换成密集真值后 SC IoU 11.96% → 31.49% | 笔记单源 | FIXED | ★★ |
| [claim-surroundocc-poisson-reconstruction-dense-gt-pipeline](../../claims/claim-surroundocc-poisson-reconstruction-dense-gt-pipeline.md) | 密集占用真值由「多帧拼接+运动补偿 → 泊松重建 → 体素化 → 语义传播」四步离线生成 | 笔记单源 | PASS | ★★ |
| [claim-surroundocc-3d-voxel-query-vertical-structure-advantage](../../claims/claim-surroundocc-3d-voxel-query-vertical-structure-advantage.md) | 显式 3D 体素查询在捕捉立交桥、电线杆等垂直结构上优于高度压缩的 BEV 查询 | 笔记单源（窄卡无数值） | PASS | ★★ |

### 1.3 多模态融合（17 张；Multimodal_Fusion/ 5 篇）

QA：round2-quant-fusion（RadarDistill 4×FIXED、RCBEVDet 4×FIXED）、round2-ali-mq-lingoqa（Ali 4×PASS）、round2-hgsfusion-nju（HGSFusion 3×PASS + 1×FIXED）。

| 卡 | 一句话主张 | 证据 | QA round2 | 强度 |
| --- | --- | --- | --- | --- |
| [claim-alibevfusion-camera-stream-lidar-independent-bev](../../claims/claim-alibevfusion-camera-stream-lidar-independent-bev.md) | 摄像头流不依赖点云、独立生成 BEV 特征，两流在融合模块前互不交互 | 笔记单源 | PASS | ★★ |
| [claim-alibevfusion-lidar-stream-backbone-compatible](../../claims/claim-alibevfusion-lidar-stream-backbone-compatible.md) | LiDAR 流骨干不可知，可兼容 PointPillars / CenterPoint / TransFusion | 笔记单源 | PASS | ★★ |
| [claim-alibevfusion-dynamic-fusion-se-channel-attention](../../claims/claim-alibevfusion-dynamic-fusion-se-channel-attention.md) | 动态融合模块为 SE 式通道注意力：先 3×3 静态融合、再逐通道自适应加权 | 笔记单源 | PASS | ★★ |
| [claim-alibevfusion-two-stage-9epoch-joint-fusion-training](../../claims/claim-alibevfusion-two-stage-9epoch-joint-fusion-training.md) | 两阶段训练：两流独立预训练后再联合训练融合 9 epochs（含 BEV 空间增强） | 笔记单源 | PASS | ★★ |
| [claim-rcbevdet-rcs-aware-scattering-dense-bev](../../claims/claim-rcbevdet-rcs-aware-scattering-dense-bev.md) | RCS-aware BEV 编码器以 RCS 为尺寸先验把稀疏雷达点散射为高斯圆斑得稠密 BEV 特征 | 笔记+双源 | FIXED | ★★★ |
| [claim-rcbevdet-dualstream-injection-extraction-interactive](../../claims/claim-rcbevdet-dualstream-injection-extraction-interactive.md) | RadarBEVNet 用 point/transformer 双流骨干并经 Injection & Extraction 逐层双向交互 | 笔记+双源 | FIXED | ★★★ |
| [claim-rcbevdet-camf-alignment-then-fusion-robust](../../claims/claim-rcbevdet-camf-alignment-then-fusion-robust.md) | alignment-then-fusion 的 CAMF 在雷达失效鲁棒性上稳于 fusion-then-alignment 的 CRN（降 0.9/6.4/10.4 vs 4.5/11.8/25.0） | 笔记+双源 | FIXED | ★★★（坐标噪声 falsifier 部分仍草稿转录待人工核对） |
| [claim-rcbevdet-dmsa-gaussian-mask-early-convergence](../../claims/claim-rcbevdet-dmsa-gaussian-mask-early-convergence.md) | DMSA 以距离越近权重越高的高斯掩码（log G 加进注意力 logits）聚合邻域、加速训练初期收敛 | 笔记+双源 | FIXED | ★★★ |
| [claim-radardistill-lidar-teacher-boosts-radar-only-detection](../../claims/claim-radardistill-lidar-teacher-boosts-radar-only-detection.md) | LiDAR 特征蒸馏大幅提升 radar-only 3D 检测（nuScenes testset 自报 mAP 20.5 / NDS 43.7，基线 8.6 / 34.7） | 笔记+双源 | FIXED | ★★★ |
| [claim-radardistill-pfd-lambda-5to1-loss-gamma5-delta25](../../claims/claim-radardistill-pfd-lambda-5to1-loss-gamma5-delta25.md) | PFD 中 TP∪FN:FP 权重 5:1（σ=0.1），总损失权重 γ=5、δ=25 | 笔记+双源 | FIXED | ★★★ |
| [claim-radardistill-afd-ar-ir-adaptive-weighting](../../claims/claim-radardistill-afd-ar-ir-adaptive-weighting.md) | AFD 按特征符号划分 AR/IR 区域并以 ρ=N_AR/N_IR 自适应降权 IR，抑制雷达噪声假阳性 | 笔记+双源 | FIXED | ★★★ |
| [claim-radardistill-cma-densify-deep-supervision](../../claims/claim-radardistill-cma-densify-deep-supervision.md) | CMA 用下采样-上采样-聚合结构稠密化稀疏雷达特征，l1/l2 两级特征均受蒸馏监督（由 AFD 损失承担） | 笔记+双源 | FIXED | ★★★ |
| [claim-hgsfusion-cyclist-roi-ap-below-all-baselines](../../claims/claim-hgsfusion-cyclist-roi-ap-below-all-baselines.md) | VoD 上 Car/Ped (RoI) 同表最高（88.28 / 87.49），但 Cyclist (RoI) 79.46 低于同表全部四个对比方法 | 笔记单源 | PASS | ★★ |
| [claim-hgsfusion-rhgm-dsm-superadditive-roi-gain](../../claims/claim-hgsfusion-rhgm-dsm-superadditive-roi-gain.md) | RHGM 与 DSM 同用的 RoI AP 增益（+6.19）大于两模块单独增益之和（+1.56 与 +1.18） | 笔记单源 | PASS | ★★ |
| [claim-hgsfusion-dark-scene-gain-dominates](../../claims/claim-hgsfusion-dark-scene-gain-dominates.md) | 暗光场景相对 Base-R+C 增益 +11.41 个百分点（4.27→15.68），远大于正常/强光（+2.32 / +2.91） | 笔记单源 | PASS | ★★ |
| [claim-hgsfusion-2d-spatial-mode-beats-3d](../../claims/claim-hgsfusion-2d-spatial-mode-beats-3d.md) | 管线内空间模式 2D（BEV）优于 3D（79.46 vs 75.58；58.96 vs 56.41）；与 RadarOcc 立场相反，仅作记录 | 笔记单源 | FIXED | ★★ |
| [claim-emc2-orin-sub400ms-leading-accuracy](../../claims/claim-emc2-orin-sub400ms-leading-accuracy.md) | EMC2 在 Jetson AGX Orin 以 <400ms 延迟保持 KITTI Hard / nuScenes 对比表中最高的自报精度 | 笔记+双源 | 未复审 | ★★ |

### 1.4 端到端与 VLA（5 张；ADe2e/BEV-Planner.md）

QA：round2-bevplanner（PASS ×5，14/14 quote 逐字、数字逐格比对）。库内尚无 VLA 主题 claim 卡（`nightshift/drafts/` 有 OpenVLA、AutoVLA 等草稿待成卡）。

| 卡 | 一句话主张 | 证据 | QA round2 | 强度 |
| --- | --- | --- | --- | --- |
| [claim-bevplanner-egomlp-parity-l2-collision](../../claims/claim-bevplanner-egomlp-parity-l2-collision.md) | 无感知的 Ego-MLP 仅靠 ego status 在 nuScenes 开环 L2/碰撞率上与 SOTA 持平 | 笔记单源 | PASS | ★★ |
| [claim-bevplanner-egostatus-injection-closes-gap](../../claims/claim-bevplanner-egostatus-injection-closes-gap.md) | UniAD/VAD 仅在 planner 注入 ego status 后才追平 Ego-MLP；含 ego status 的方法间不可直接比较 | 笔记单源 | PASS | ★★ |
| [claim-bevplanner-ego-velocity-dominates-planning](../../claims/claim-bevplanner-ego-velocity-dominates-planning.md) | ego status 在场时图像 corruption（含全黑）影响小，扰动 ego 速度才显著改变规划轨迹 | 笔记单源 | PASS | ★★ |
| `claim-bevplanner-nuscenes-straight-driving-imbalance`（原卡；现行替代见页首） | nuScenes 73.9% 的数据是直行场景（评测样本 87%），ego status 因此成为开环规划捷径 | 笔记单源 | PASS | ★★ |
| [claim-bevplanner-unidad-postprocessing-raises-ccr](../../claims/claim-bevplanner-unidad-postprocessing-raises-ccr.md) | UniAD 轨迹后处理降低碰撞率却显著推高 CCR（1.72→7.83），旧指标评判开环方法有偏 | 笔记单源 | PASS | ★★ |

### 1.5 经典检测（28 张；Classical_Detection/ 7 篇笔记）

QA：round2-classical（PASS 15 / FIXED 1）、round2-sparseocc-surroundocc-centernet（CenterNet-Points 4×PASS）。

| 卡 | 一句话主张 | 证据 | QA round2 | 强度 |
| --- | --- | --- | --- | --- |
| [claim-fcos-anchorfree-pixelwise-formulation](../../claims/claim-fcos-anchorfree-pixelwise-formulation.md) | 检测可重构为无锚框逐像素预测：GT 框内点全为正样本，直接回归到框四边距离 | 笔记单源 | PASS | ★★ |
| [claim-fcos-centerness-suppresses-low-quality](../../claims/claim-fcos-centerness-suppresses-low-quality.md) | center-ness 以「分类置信度 × center-ness」打分，使低质量边缘框在 NMS 中被过滤 | 笔记单源 | PASS | ★★ |
| [claim-fcos-fpn-scale-range-assignment](../../claims/claim-fcos-fpn-scale-range-assignment.md) | 按回归距离范围（而非锚框尺寸）划分 FPN 层级，可大幅降低重叠物体模糊样本比例 | 笔记单源 | PASS | ★★ |
| [claim-fcos-centerness-regression-branch-ap-gain](../../claims/claim-fcos-centerness-regression-branch-ap-gain.md) | 将 center-ness 从分类分支移到回归分支后 AP 进一步提升（笔记图注转述） | 笔记单源（1 条图注） | PASS | ★（QA 标注四张 FCOS 卡中最弱） |
| [claim-caddn-depth-supervision-dominant-ablation-gain](../../claims/claim-caddn-depth-supervision-dominant-ablation-gain.md) | 显式 LiDAR 深度监督带来全表最大单项增益 +10.4% AP，无监督深度预测仅 +1.5% | 笔记单源 | PASS | ★★ |
| [claim-caddn-joint-training-beats-frozen-depth-branch](../../claims/claim-caddn-joint-training-beats-frozen-depth-branch.md) | 端到端联合训练比分步训练后冻结高 +2.97% AP（同结构、Hard 选择） | 笔记单源 | PASS | ★★ |
| [claim-caddn-lid-discretization-beats-uniform](../../claims/claim-caddn-lid-discretization-beats-uniform.md) | 深度离散化从均匀 UD 改为线性递增 LID 带来 +3.17% AP | 笔记单源 | PASS | ★★ |
| [claim-caddn-soft-depth-distribution-beats-hard-argmax](../../claims/claim-caddn-soft-depth-distribution-beats-hard-argmax.md) | 联合训练下用完整深度分布（Soft）替代 Argmax 硬选择带来 +2.96% AP | 笔记单源 | PASS | ★★ |
| [claim-cornernet-paired-keypoints-anchor-free](../../claims/claim-cornernet-paired-keypoints-anchor-free.md) | 目标检测可重构为无锚框的角点对关键点检测与配对（左上+右下） | 笔记单源 | PASS | ★★ |
| [claim-cornernet-corner-pooling-directional-maxsum](../../claims/claim-cornernet-corner-pooling-directional-maxsum.md) | 角点池化用右→左与下→上两条方向性 max-pooling 路径相加，为角点聚合边缘证据 | 笔记单源 | PASS | ★★ |
| [claim-cornernet-associative-embedding-pull-push](../../claims/claim-cornernet-associative-embedding-pull-push.md) | 以 1 维 Associative Embedding 加 pull/push 损失（push 间隔 Δ=1）完成角点配对分组 | 笔记单源 | PASS | ★★ |
| [claim-cornernet-single-scale-no-fpn](../../claims/claim-cornernet-single-scale-no-fpn.md) | 不用特征金字塔，仅用 104 层双堆叠 Hourglass 最后一层做单尺度预测 | 笔记单源 | FIXED | ★★ |
| [claim-centernetpoints-heatmap-peaks-replace-nms](../../claims/claim-centernetpoints-heatmap-peaks-replace-nms.md) | 热力图 3×3 Max Pooling 峰值提取本身即起 NMS 作用，推理无需 NMS | 笔记单源 | PASS | ★★ |
| [claim-centernetpoints-regression-replaces-keypoint-grouping](../../claims/claim-centernetpoints-regression-replaces-keypoint-grouping.md) | 中心点直接回归宽高替代 CornerNet 的 Embedding 配对，推理成纯前向传播 | 笔记单源 | PASS | ★★ |
| [claim-centernetpoints-inference-fps-gain-over-cornernet](../../claims/claim-centernetpoints-inference-fps-gain-over-cornernet.md) | 同骨干下推理速度约为 CornerNet 两倍（7.8 vs 4.1 FPS），DLA-34 达 52 FPS（无硬件口径） | 笔记单源 | PASS | ★★ |
| [claim-centernetpoints-center-collision-rare-on-coco](../../claims/claim-centernetpoints-center-collision-rare-on-coco.md) | 同类中心点碰撞在 COCO 上 <0.1%，远低于 anchor 方法 IoU 匹配失败漏检率（约 20%） | 笔记单源 | PASS | ★★ |
| [claim-centernettriplets-cre-ap-gain-small-objects](../../claims/claim-centernettriplets-cre-ap-gain-small-objects.md) | 增加中心点热图分支（CRE）AP 37.6→39.9，增益集中于小物体（AP_S +4.6） | 笔记单源 | 未复审 | ★ |
| [claim-centernettriplets-ctp-ap-gain-large-objects](../../claims/claim-centernettriplets-ctp-ap-gain-large-objects.md) | 中心点分支用 Center Pooling 再 +0.9 AP（39.9→40.8），增益主要来自大物体 | 笔记单源 | 未复审 | ★ |
| [claim-centernettriplets-ccp-ap-gain-large-objects](../../claims/claim-centernettriplets-ccp-ap-gain-large-objects.md) | 级联角点池化（先边界后内部）再 +0.5 AP（40.8→41.3），全配置 AP_L 达 55.8% | 笔记单源 | 未复审 | ★ |
| [claim-centernettriplets-gt-center-oracle-ap-565](../../claims/claim-centernettriplets-gt-center-oracle-ap-565.md) | 用 GT 中心点替换预测中心点过滤框，AP 41.3→56.5（+15.2），瓶颈在中心点检测精度 | 笔记单源 | 未复审 | ★ |
| [claim-pointnetpillars-pointnet-permutation-invariance-symmetric-function](../../claims/claim-pointnetpillars-pointnet-permutation-invariance-symmetric-function.md) | 共享权重逐点 MLP + 对称函数（Max Pooling）聚合使网络对输入点 N! 种排列置换不变 | 笔记单源 | PASS | ★★ |
| [claim-pointnetpillars-pointnet-maxpool-skeleton-noise-robustness](../../claims/claim-pointnetpillars-pointnet-maxpool-skeleton-noise-robustness.md) | Max Pooling 只保留各维响应最大的点（关键骨架），非关键点/少量噪声扰动不影响全局特征 | 笔记单源 | PASS | ★★ |
| [claim-pointnetpillars-pillar-encoding-2dcnn-avoid-3dconv](../../claims/claim-pointnetpillars-pillar-encoding-2dcnn-avoid-3dconv.md) | Pillar 化（Z 轴不切分）+ PointNet 编码 + Scatter 伪图像使 3D 检测全程只需 2D CNN | 笔记单源 | PASS | ★★ |
| [claim-pointnetpillars-direction-classifier-sine-flip](../../claims/claim-pointnetpillars-direction-classifier-sine-flip.md) | 正弦回归损失无法区分车头朝前/朝后（0° 与 180°），检测头需增设独立 softmax 方向分支 | 笔记单源 | PASS | ★★ |
| [claim-fastrcnn-two-stage-beats-one-stage](../../claims/claim-fastrcnn-two-stage-beats-one-stage.md) | 两阶段（RPN+检测）比移除提议步骤的单阶段密集预测 mAP 高 4.8 个百分点（58.7% vs 53.9%） | 笔记单源 | 未复审 | ★ |
| [claim-fastrcnn-rpn-shared-features-raise-map](../../claims/claim-fastrcnn-rpn-shared-features-raise-map.md) | RPN 与检测器共享卷积特征（4 步交替训练）比独立训练 mAP 更高（笔记载 58.7%→59.9%） | 笔记单源 | 未复审 | ★ |
| [claim-fastrcnn-multitask-loss-beats-cls-only](../../claims/claim-fastrcnn-multitask-loss-beats-cls-only.md) | 单一多任务损失（分类+回归联合）在 S/M/L 三个模型上 mAP 均高于仅分类损失 | 笔记单源 | 未复审 | ★ |
| [claim-fastrcnn-roipooling-arbitrary-to-fixed-feature](../../claims/claim-fastrcnn-roipooling-arbitrary-to-fixed-feature.md) | RoI Pooling 经「网格划分→子窗口最大池化」把任意尺寸 RoI 变为固定尺寸特征 | 笔记单源 | 未复审 | ★ |

### 1.6 QA 与评测（3 张；QA dataset/LingoQA.md）

QA：round2-ali-mq-lingoqa（PASS ×3，11 条 quote 逐字命中、表格行归属全对）。

| 卡 | 一句话主张 | 证据 | QA round2 | 强度 |
| --- | --- | --- | --- | --- |
| [claim-lingoqa-7b-baseline-matches-gpt4v](../../claims/claim-lingoqa-7b-baseline-matches-gpt4v.md) | 微调 7B 基线（60.8）追平零样本 GPT-4V（59.6），两者仍远低于人类 5 帧（96.6） | 笔记单源 | PASS | ★★ |
| [claim-lingoqa-late-fusion-beats-early-mid](../../claims/claim-lingoqa-late-fusion-beats-early-mid.md) | late fusion（60.80）优于 mid（59.20）与 early（48.40）；late−mid 仅 1.6 分接近噪声量级 | 笔记单源 | PASS | ★★ |
| [claim-lingoqa-lingo-judge-spearman-0950](../../claims/claim-lingoqa-lingo-judge-spearman-0950.md) | Lingo-Judge 与人工判断相关性为所测指标中最高（Pearson 0.993 / Spearman 0.950），A100 上 10.5s 评完 1000 条 | 笔记单源 | PASS | ★★ |

### 1.7 笔记缺陷类（5 张）

记录 `library/` 笔记本身与原文的偏差或缺陷（Agent 不得改 library/，修复均需用户操作）。

| 卡 | 一句话主张 | 证据 | QA round2 | 强度 |
| --- | --- | --- | --- | --- |
| [claim-omniquant-note-table-mismatch](../../claims/claim-omniquant-note-table-mismatch.md) | OmniQuant 笔记实验 1 表头-数据列错配、实验 4 FP16 基线行与论文原表不符 | 笔记+双源（7 条笔记 + 11 条外部） | round2 复验其证据全部命中（未给正式判定） | ★★★ |
| [claim-emc2-note-table-mismatch](../../claims/claim-emc2-note-table-mismatch.md) | EMC2 笔记的 §5.1 对比表与 arXiv v1 原表不一致 | 笔记+双源 | 未复审 | ★★ |
| [claim-echofusion-note-table-mismatch](../../claims/claim-echofusion-note-table-mismatch.md) | EchoFusion 笔记的 §3.2/3.3 消融表与论文原表不一致 | 笔记+双源 | 未复审 | ★★ |
| [claim-centernetpoints-note-citation-artifacts](../../claims/claim-centernetpoints-note-citation-artifacts.md) | CenterNet 笔记正文残留三处孤立网页引用编号（17 / 18181818 / 20） | 笔记单源 | **ISSUED**（round2 新建） | ★ |
| [claim-sparseocc-note-conversational-residue](../../claims/claim-sparseocc-note-conversational-residue.md) | SparseOcc 笔记 §2.4 末尾残留一句 AI 对话式问句（「……需要细讲吗？」） | 笔记单源 | **ISSUED**（round2 新建） | ★ |

---

## 2. signoff 候选 Top5

综合证据强度（双源且 round2 复核通过）、卡间独立性（不依赖其他卡的未决 caveat）、以及单卡单主张的可核验性，推荐第一批人工核验：

1. **[claim-omniquant-w4a4-llama7b-zeroshot-5265](../../claims/claim-omniquant-w4a4-llama7b-zeroshot-5265.md)** — round2 PASS：笔记 4 条引文逐字命中，arXiv v3 Table 2 与 §4.1 校准句复验；「+6.22 实际对应 LLM-QAT+SQ(46.43) 而非 LLM-QAT(41.27)」经正文与表格双向核实，主张独立无未决原文项，是量化主线最扎实的一张。
2. **[claim-vqmap-nuscenes-map-miou-622-leads-table](../../claims/claim-vqmap-nuscenes-map-miou-622-leads-table.md)** — round2 FIXED 后笔记 13 条引文全部逐字命中且「笔记全部数字与论文逐格一致」（QA 实抓原文结论），Table 1 VQ-Map 行与 DDP 行双源核对，「高于同表全部对比方法」在论文全表口径下成立。
3. **[claim-rcbevdet-rcs-aware-scattering-dense-bev](../../claims/claim-rcbevdet-rcs-aware-scattering-dense-bev.md)** — round2 FIXED：机制与消融数字（+1.4 NDS / +1.9 mAP）已在 CVPR v1 §3.1 / Table 5 双源核入 evidence（7 条），公式与聚合方式与原文一致；卡上的「待人工核对」只涉及扩展版 RCBEVDet++ 草稿数字，不触及本卡核心主张。
4. **[claim-radardistill-afd-ar-ir-adaptive-weighting](../../claims/claim-radardistill-afd-ar-ir-adaptive-weighting.md)** — round2 FIXED：原「README 阈值口径与笔记可能不一致」疑问已由 arXiv v3 公式 (5)(7) 与 ρ 定义关闭（阈值=0），机制主张单一可证伪、双源 7 条 evidence，适合作为机制类首批签署样板。
5. **[claim-njusparseocc-rayiou34-fps17-beats-dense-baselines](../../claims/claim-njusparseocc-rayiou34-fps17-beats-dense-baselines.md)** — round2 FIXED（把修辞性「量级跃升」改为精确倍数 3.3×/7.5×）：arXiv v5 摘要逐字命中（34.0 / 17.3 FPS / 7 帧）+ 笔记表三行逐格一致，与同名 SparseOcc（arXiv:2404.09502）已做消歧，独立性强。

次优备选：[claim-surroundocc-nuscenes-iou-3149-miou-2030-table-lead](../../claims/claim-surroundocc-nuscenes-iou-3149-miou-2030-table-lead.md) 与 [claim-bevplanner-egostatus-injection-closes-gap](../../claims/claim-bevplanner-egostatus-injection-closes-gap.md)（QA 深核通过但 evidence 仍为笔记单源，建议第二批）。

---

## 3. 薄弱点清单（暂缓 signoff）

### 3.1 QA 判定 ISSUED 的 2 张（新建缺陷卡，先处理笔记再谈签署）

- [claim-centernetpoints-note-citation-artifacts](../../claims/claim-centernetpoints-note-citation-artifacts.md)：CenterNet 笔记三处引用残留（L160「17」、L161「18181818」、L171「20」），修复需用户操作 `library/Classical_Detection/CenterNet：Objects as Points.md`。
- [claim-sparseocc-note-conversational-residue](../../claims/claim-sparseocc-note-conversational-residue.md)：SparseOcc 笔记 L123 对话式问句残留（另有 §2.4 小节编号重号，未立卡）。
- 这两张卡本身是缺陷记录而非方法主张，建议笔记修复后由主人裁定保留或作废，**不进 signoff 流程**。

### 3.2 单源自报数字、且 round2 未覆盖的卡（共 23 张，全部 ★）

- **centernettriplets ×4**：oracle AP 56.5、CRE +2.3、CTP +0.9、CCP +0.5 均笔记单源自报。
- **fastrcnn ×4**：58.7→59.9、58.7 vs 53.9 等数字仅笔记转录。
- **sgdet3d ×4**：mAP_EAA 59.49 / mAP_DC 77.11 等，且 EAA 口径本身未定义（cross M1）。
- **pdquant ×4**、**qdbev ×3**（tiny 卡为双源，其余单源）、**repqvit ×4**。
- 处理建议：补一轮 round2 式复审（quote 逐字 + arXiv 原文数字逐格）后再评估。

### 3.3 含「待回原文 / 待人工核对」限定的卡（19 张，strict 命中）

claim-centernettriplets-ccp-ap-gain-large-objects、claim-centernettriplets-cre-ap-gain-small-objects、claim-centernettriplets-ctp-ap-gain-large-objects、claim-centernettriplets-gt-center-oracle-ap-565、claim-centernetpoints-center-collision-rare-on-coco、claim-centernetpoints-inference-fps-gain-over-cornernet、claim-hgsfusion-dark-scene-gain-dominates、claim-hgsfusion-rhgm-dsm-superadditive-roi-gain、claim-hgsfusion-2d-spatial-mode-beats-3d、claim-njusparseocc-decoder-pruning-complexity-onactive、claim-radarocc-s2c-deformable-avoids-interp-degradation、claim-r4det-pdf-depth-supervision-monotonic-gain、claim-rcbevdet-camf-alignment-then-fusion-robust、claim-rcbevdet-dmsa-gaussian-mask-early-convergence、claim-rcbevdet-rcs-aware-scattering-dense-bev、claim-rcbevdet-dualstream-injection-extraction-interactive、claim-sgdet3d-depth-supervision-density-gain、claim-sparseocc-miou141-beats-dense-baselines、claim-sparseocc-flops-749pct-below-dense。

（放宽措辞后的更全命中为 33 张；差异主要是「原文未能抓取」类自我声明，如 alibevfusion ×4、vqmap-tiny、qdbev-tiny 等。）

### 3.4 其他需注意的暂缓点

- **claim-qwt-r2-gate-nonregression**：专项 verify 报告结论为**部分支持**——「保证不劣于」只覆盖 R²≤0 置零分支（逐位等于原 PTQ）；R²>0 分支仅校准集意义成立，论文补充材料 Table 4 自带逐数据集小幅退化实例（BoolQ −0.03 / HellaSwag −0.51）。卡标题超出论文原文强度，**建议先按报告 §4 修订卡（拆分主张/补论文原句证据）再谈 signoff**。
- **alibevfusion ×4**：scope 自认论文原文与官方仓库「本次均未能抓取核验」，paper 字段待人工补核（QA 外部抽查已确定 arXiv:2205.13790 / 2111.03759，可回填）。
- **claim-emc2-orin-sub400ms-leading-accuracy**：372.5ms 为全场景平均期望延迟而非上界（APE 单专家 526ms），且对比表多列为 N/A 或跨硬件数字——引用与签署时须带卡内两条限定。
- **claim-omniquant-w4a16g128-llama13b-a100-913toks**：含「笔记 FP16 基线行与原表不符（实际 24.3GB/27.1tok/s，加速 ≈1.74×）」的更正记录，签署前须确认采用论文口径。
- **claim-rcbevdet-camf-alignment-then-fusion-robust**：核心雷达失效数字已核 CVPR v1，但坐标噪声（−1.3/−2.3 NDS）部分仅由 `nightshift/drafts/RCBEVDetPP.md` 草稿转录，待人工核对。
- **HGSFusion 笔记侧存疑（未立卡）**：Table 1 LXL 行 Ped 与 mAP (RoI) 同为 72.93，无法离线裁定，cross §6.3 已记录。

---

## 4. 数字与 id 核对记录

- 卡文件总数 114 = 本报告各组之和（27+29+17+5+28+3+5）；全部 `status: asserted`、`signoff: null`，与 `index/claims.jsonl`（114 行）一致。
- 七份 round2 报告共提及 81 个 distinct claim id，逐一比对 `claims/` 文件全部存在；唯一例外是 round2-radarocc-r4det.md 遗留问题一节使用了简写「claim-r4det-pdf」，实际指向 [claim-r4det-pdf-depth-supervision-monotonic-gain](../../claims/claim-r4det-pdf-depth-supervision-monotonic-gain.md)，非缺卡。
- QA 判定汇总：复审 75 张 = PASS 56（quant-fusion 4 + bevplanner 5 + classical 15 + ali-mq-lingoqa 11 + hgsfusion-nju 6 + radarocc-r4det 6 + sparseocc-surroundocc-centernet 9）+ FIXED 19（12+1+0+2+2+2）+ ISSUED 2（均为本轮新建缺陷卡）。
- `node tools/ka.mjs validate` → `OK: 114 claim(s) validated`（报告完成后复跑）。
- 本报告为 nightshift/reports/ 下新文件；未改动任何卡、library/、index/、QUEUE/LOCK/RULES/AGENTS/TODO；未 git 提交。
