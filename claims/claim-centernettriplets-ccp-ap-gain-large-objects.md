---
id: claim-centernettriplets-ccp-ap-gain-large-objects
title: "CenterNet（Keypoint Triplets）论文声称：角点池化替换为级联角点池化（先看边界再看内部）再 +0.5 AP（40.8%→41.3%），全配置 AP_L 达 55.8%"
type: claim
status: asserted
scope: "笔记 §消融实验组件叠加消融的第三步（累计含 CRE+CTP）：将原 CornerNet 的角点池化替换为 Cascade Corner Pooling（先沿边界取最大值，再从该位置向物体内部取最大值，两者相加）；+0.5 AP 为该步增量、AP_L 55.8% 为全配置值，均论文自报；笔记未注明数据集与评测协议（待人工核对原文）；尚未独立验证"
tags: [centernet, cornernet, keypoint-triplets, cascade-corner-pooling, ablation, large-objects]
note: library/Classical_Detection/CenterNet：Keypoint Triplets.md#消融实验
paper: "ICCV 2019, CenterNet: Keypoint Triplets for Object Detection（开源：https://github.com/Duankaiwen/CenterNet）"
stance: watch
evidence:
  - source: library/Classical_Detection/CenterNet：Keypoint Triplets.md
    locator: "§消融实验 / 第三步：引入级联角点池化 (CCP) / 操作"
    quote: "- **操作：** 将原 CornerNet 的角点池化替换为 **Cascade Corner Pooling**（即“先看边，再看里”）。"
    relation: supports
  - source: library/Classical_Detection/CenterNet：Keypoint Triplets.md
    locator: "§消融实验 / 第三步：引入级联角点池化 (CCP) / 结果"
    quote: "- **结果：** AP 从 40.8% 提升到 **41.3%** (+0.5%)。"
    relation: supports
  - source: library/Classical_Detection/CenterNet：Keypoint Triplets.md
    locator: "§消融实验 / 第三步：引入级联角点池化 (CCP) / 关键发现"
    quote: "- **再次增强大物体：** 结合 CenterNet 使用时， $AP_L$ 进一步提升到了 55.8% 。"
    relation: supports
falsifiers:
  - "复现中 CCP 步增量 ≤0，或明显低于 +0.5"
  - "全配置（CRE+CTP+CCP）AP_L 明显低于 55.8%（如 <54.5）"
  - "在无中心点验证的纯 CornerNet 上单独加 CCP 导致 AP 下降且无法抑制（论文'CCP 引入内部噪声、由中心验证抑制'的协同解释不成立）"
  - "原论文消融表数字与笔记所载 40.8→41.3 / 55.8 不一致（待人工核对原文）"
review_due: 2026-12-02
related: [claim-centernettriplets-cre-ap-gain-small-objects, claim-centernettriplets-ctp-ap-gain-large-objects, claim-centernettriplets-gt-center-oracle-ap-565, claim-cornernet-corner-pooling-directional-maxsum]
signoff: null
---

## 我的理解

论文声称（尚未独立验证）：传统 Corner Pooling 只沿边界取最大值，角点对边缘敏感但缺乏物体内部信息；Cascade Corner Pooling 在此基础上再从边界最大值位置向物体内部取最大值、两者相加，让角点"既看边、又看里"。该步整卡增量 +0.5 AP（40.8→41.3），大物体收益更明显——全配置下 AP_L 达 55.8。

关键限定：笔记明确说 AP_L 55.8 是"结合 CenterNet 使用时"的数值，论文解释是 CCP 会引入内部噪声、需要中心点验证来抑制。所以 55.8 不能全部归因给 CCP 本身，它是 CCP 与 CRE（中心验证）协同后的全配置值；CCP 单独的净贡献只有 +0.5 AP 这一档可独立主张。

## 待验证

- 查原文消融表：核对 40.8→41.3 与全配置 AP_L 55.8，确认 CCP 是否同时替换左上/右下两处角点池化、数据集与评测协议。
- 官方实现上做三组对照：CCP-only（无中心验证）、CRE+CTP+CCP（全配置）、以及 CCP 池化内部项单独消融，验证"+0.5 与协同效应"是否成立。
- 观察 CCP 角点热图的误检分布，验证"内部噪声被中心验证抑制"的机制解释。

## 若成立 / 不成立意味着什么

成立：角点特征补内部信息是可行方向，但收益依赖与中心验证配合使用；复用该组件时应整组采纳而非单独移植 CCP。
不成立：CCP 增益依赖笔记转述或协同假设不成立，本卡收窄为"全配置 41.3 / AP_L 55.8 的组合结果记录"。
