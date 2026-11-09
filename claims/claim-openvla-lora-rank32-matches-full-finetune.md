---
id: claim-openvla-lora-rank32-matches-full-finetune
title: "OpenVLA 论文声称：LoRA rank=32 只训 1.4% 参数即匹配全参微调成功率，单卡 A100 10-15 小时完成（8 倍省算力）"
type: claim
status: asserted
scope: "实验用简化版 OpenVLA（⚠ 非最终发布模型：预训练用 Octo 同款 OpenX 小混合、视觉编码器 SigLIP-only，见 §5.3 脚注）；任务为 select Franka-Tabletop 任务；LoRA r=32 应用于全部线性层；成功率为 33 rollouts 的 mean±StdErr；Full FT 为 8×A100×5-15 小时/任务，LoRA 为单卡 A100×10-15 小时；论文自报数字（CoRL 2024，arXiv:2406.09246v3）"
tags: [vla, openvla, lora, parameter-efficient-finetuning, robotics]
note: library/VLM_VLA/OpenVLA.md#3-实验
paper: "CoRL 2024, OpenVLA: An Open-Source Vision-Language-Action Model (arXiv:2406.09246)"
stance: watch
evidence:
  - source: library/VLM_VLA/OpenVLA.md
    locator: "§3.3 / Table 1（Full FT 行）"
    quote: "| Full FT | 69.7 ⟨MATH:\\pm⟩ 7.2 % | 7,188.1 | 163.3 GB* |"
    relation: supports
  - source: library/VLM_VLA/OpenVLA.md
    locator: "§3.3 / Table 1（LoRA rank=32 行）"
    quote: "| LoRA, rank=32 | 68.2 ⟨MATH:\\pm⟩ 7.5% | 97.6 | 59.7 GB |"
    relation: supports
  - source: library/VLM_VLA/OpenVLA.md
    locator: "§3.3 / §5.3 读数原句"
    quote: "Lastly, LoRA achieves the best trade-off between performance and training memory consumption, outperforming “sandwich fine-tuning” and matching full fine-tuning performance while fine-tuning only 1.4% of the parameters."
    relation: supports
  - source: library/VLM_VLA/OpenVLA.md
    locator: "§3.3 / §5.3 算力结论原句"
    quote: "With LoRA, we can fine-tune OpenVLA on a new task within 10-15 hours on a single A100 GPU – an 8x reduction in compute compared to full fine-tuning."
    relation: supports
  - source: library/VLM_VLA/OpenVLA.md
    locator: "§4 / ⚠ 措辞提示（简化版模型脚注）"
    quote: "we experiment with a version of the OpenVLA model that is pretrained with a smaller robot data mixture (the same OpenX dataset mixture as Octo) and has a slightly smaller architecture which only uses a SigLIP [79] vision backbone instead of the fused DinoSigLIP encoder."
    relation: supports
falsifiers:
  - "跨配置迁移检查（本条不判原命题伪——原主张 scope 是 §5.3 简化版模型——只判外推到最终发布模型失效）：在最终发布配置（DinoSigLIP 7B、970k 混合预训练）上复现，LoRA r=32 成功率显著低于全参微调（差值超出双方 StdErr）"
  - "同任务复现中 LoRA 所需 VRAM/时长远高于 59.7 GB / 10-15 小时（如 batch 16 口径不可复制）"
  - "发现 1.4% 参数的算法（97.6M）与 r=32 全线性层的理论参数量不符，或 LoRA rank 对性能影响并非『可忽略』"
review_due: 2026-12-03
related: [claim-openvla-7b-outperforms-rt2x-55b-16p5, claim-openvla-int4-quantization-matches-bf16]
signoff: null
---

## 主张

论文声称：对 OpenVLA 做下游任务适配时，LoRA（r=32，作用于全部线性层，97.6M 可训参数 ≈ 1.4%）成功率 68.2±7.5%，与全参微调（7,188.1M，69.7±7.2%）在 StdErr 内持平，VRAM 从 163.3 GB 降到 59.7 GB（batch 16），且单卡 A100 10-15 小时即可完成（8 倍省算力）。论文还称 rank 在 32/64 间对性能影响可忽略，推荐默认 r=32。

关键限定：§5.3 的实验模型是「Octo 同款小混合预训练 + SigLIP-only」的简化版 OpenVLA（§5.3 脚注），不是最终发布的 DinoSigLIP 7B——结论外推到发布模型时需自行复验。另外各策略 rollout 数均为 33（select Franka-Tabletop 任务），StdErr 约 ±7%，"matching" 的精度有限。

## 待验证

- 用官方 fine-tuning notebook 在最终发布权重上跑 LoRA r=32 vs Full FT 对照（select Franka-Tabletop 同任务）。
- 核对 97.6M 可训参数与 r=32 全线性层的理论量级。
- 测 rank=16 成功率是否仍与全参微调持平（论文只给了 32/64）。

## 成立/不成立的含义

成立：实验室单卡即可把 OpenVLA 适配到新任务，VLA 微调门槛与 LLM 的 LoRA 生态对齐。
不成立：需 8×A100 全参微调，落地成本按 8 倍重估。

## 核查记录

- 2026-11-05 表达整理（P1-B3b 班）：falsifier 第 1 条标注为跨配置迁移检查（原主张 scope 为 §5.3 简化版模型，发布配置复现属外推检验而非原范围反证）。数字未改写。
