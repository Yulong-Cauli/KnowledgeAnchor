---
id: claim-rcbevdet-camf-alignment-then-fusion-robust
title: "RCBEVDet 的 alignment-then-fusion CAMF 在鲁棒性上稳于 fusion-then-alignment 的 CRN（论文声称，尚未独立验证）"
type: claim
status: asserted
scope: "RCBEVDet（CVPR 2024）的鲁棒性声明；口径：CAMF（双向 deformable 交叉注意力先对齐、再 concat+CBR 融合）对比 CRN 的 MDCA（先融合后对齐）（笔记 §三 总结）；雷达失效数字 CVPR 原文 §4.4/Table 7 已含（nuScenes，随机丢 1/3/全部视角雷达输入，Car class mAP），CRN 降 4.5/11.8/25.0、RCBEVDet 仅降 0.9/6.4/10.4，与扩展版草稿转录一致（nightshift/drafts/RCBEVDetPP.md §3.7）；雷达坐标噪声实验仍只在扩展版论文（待人工核对）"
tags: [radar-camera-fusion, bev, rcbevdet, camf, robustness, crn]
note: library/Multimodal_Fusion/RCBEVDet.md#三-camf交叉注意力多层融合
paper: "CVPR 2024, RCBEVDet: Radar-camera Fusion in Bird's Eye View for 3D Object Detection (arXiv:2403.16440)"
stance: watch
evidence:
  - source: library/Multimodal_Fusion/RCBEVDet.md
    locator: "§三 / CAMF 核心痛点"
    quote: "> *雷达虽然测距准，但在水平方位角（Azimuth）上经常有抖动和误差。如果直接把雷达图和摄像头图叠在一起（简单的 Concat），就像两张透写纸没对齐，影子是重影的，神经网络会学晕。"
    relation: supports
  - source: library/Multimodal_Fusion/RCBEVDet.md
    locator: "§三 / 总结：CAMF 强在哪里"
    quote: "2.  **RCBEVDet 的 CAMF (Alignment-then-Fusion)**：先各自对齐，再拼在一起。"
    relation: supports
  - source: library/Multimodal_Fusion/RCBEVDet.md
    locator: "§三 / 总结：CAMF 强在哪里"
    quote: "显然，CAMF 的逻辑更顺，不仅解决了雷达的**方位角误差**，还保留了更纯净的多模态信息。这就是为什么在鲁棒性实验中，它比 CRN 更稳的原因。"
    relation: supports
  - source: https://arxiv.org/pdf/2403.16440v1
    locator: "§4.4 Analysis of Robustness（雷达失效数字，跨行已按空格还原；pdftotext -layout 提取，抓取 2026-11-02）"
    quote: "Notably, the performance of CRN [13] decreases by 4.5, 11.8, and 25.0 mAP in three radar sensor failure cases, while RCBEVDet only drops by 0.9, 6.4, and 10.4 mAP."
    relation: supports
  - source: https://arxiv.org/pdf/2403.16440v1
    locator: "Table 7 caption（跨行已按空格还原；pdftotext -layout 提取，抓取 2026-11-02）"
    quote: "Table 7. Analysis of Robustness. We report Car class mAP in the same manner as CRN [13]."
    relation: supports
falsifiers:
  - "雷达失效或雷达错位（坐标加噪声）实验中，RCBEVDet 的 mAP/NDS 降幅大于或等于同条件 CRN"
  - "扩展版论文 Table XI/XII 复核结果与论文自报相反（自报口径：雷达失效三档 CRN 降 4.5/11.8/25.0 mAP、RCBEVDet 仅降 0.9/6.4/10.4——该组数字已对照 CVPR v1 §4.4/Table 7 核实一致；雷达坐标噪声 RCBEVDet 降 1.3 NDS/1.5 mAP、CRN 降 2.3 NDS/5.1 mAP；坐标噪声部分转录自 nightshift/drafts/RCBEVDetPP.md §3.7，待人工核对）"
  - "复现中去掉 deformable 对齐（直接 concat 融合）后鲁棒性不降反升，说明对齐步骤不是鲁棒性来源"
review_due: 2026-12-02
related: [claim-rcbevdet-rcs-aware-scattering-dense-bev, claim-rcbevdet-dualstream-injection-extraction-interactive]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：雷达在水平方位角上有抖动误差，直接 concat 两张未对齐的特征图会让网络学到重影。CAMF 采用『先对齐、后融合』（alignment-then-fusion）：先用双向 deformable cross-attention 让雷达/相机特征互相纠错对齐（雷达 query 查相机纹理、相机 query 查雷达反射点），再 concat + CBR（带残差）融合；对比对象 CRN 的 MDCA 是『先融合、后对齐』（fusion-then-alignment）。笔记给出的结论是：鲁棒性实验中 CAMF 比 CRN 更稳。本卡是机制归因 + 鲁棒性排序的窄主张——笔记只有定性表述，没有数据集与数字，故 scope 收窄为『论文声称的排序』。

关联：CAMF 的两路输入分别来自 RadarBEVNet 的双流骨干（[claim-rcbevdet-dualstream-injection-extraction-interactive](claim-rcbevdet-dualstream-injection-extraction-interactive.md)）与其 RCS-aware BEV 编码器（[claim-rcbevdet-rcs-aware-scattering-dense-bev](claim-rcbevdet-rcs-aware-scattering-dense-bev.md)）。**复审更新（2026-11-02）**：雷达失效的鲁棒性数字并非只在扩展版——CVPR 原文（arXiv v1）§4.4/Table 7 已含同一组数字（CRN −4.5/−11.8/−25.0 mAP vs RCBEVDet −0.9/−6.4/−10.4，随机丢 1/3/全部视角雷达输入），已核入 evidence；雷达坐标噪声实验（−1.3 vs −2.3 NDS 等）仍只在扩展版论文（草稿转录，待人工核对）。

## 待验证

- 已核对（2026-11-02）：CVPR 原文 arXiv v1 §4.4/Table 7 含雷达失效鲁棒性数字（与扩展版草稿转录一致），已升级为本卡 evidence。
- 从扩展版原文核对雷达坐标噪声实验（Table XI/XII）的数字与实验条件（雷达点 x/y 坐标均匀加噪声）。
- 复现：同条件下对比 RCBEVDet 与 CRN 在雷达失效/雷达错位下的 mAP、NDS 降幅。

## 若成立 / 不成立意味着什么

成立：雷达-相机融合选型时『先对齐后融合』应作为默认结构假设，尤其在意雷达标定误差、雷达失效场景的方案。
不成立：鲁棒性优势依赖论文自报口径或特定实验设置，CAMF 与 CRN 的取舍回到精度/开销对比，需重做对照实验再定。
