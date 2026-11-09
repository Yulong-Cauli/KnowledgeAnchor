---
id: claim-qlora-65b-finetune-single-48gb
title: "QLoRA 声称：65B 模型微调显存从 >780GB 降到单卡 48GB 以内且不损运行时/预测性能（NF4 双数据类型 + Paged Optimizers；7B 4-bit 底座权重仅 5,048 MB）"
type: claim
status: asserted
scope: "LLaMA-65B；QLoRA 完整配置（NF4 存储 / BF16 计算双数据类型、FP8 量化常数 DQ、LoRA 全线性层、Paged Optimizers）；>780GB 为 16-bit 全量微调的论文估算口径；48GB 为单卡上限（33B/65B 在 24/48GB 单卡上依赖 Paged Optimizers 兜长序列显存尖峰，§4 自述 paging 很少触发、未给硬测量）；'不损运行时'的实测口径：batch size 16 时 65B paged 与常规优化器同速；论文自报"
tags: [quantization, llm, qlora, memory, paged-optimizers, fine-tuning]
note: library/Quantization/QLoRA.md#1-概述
paper: "NeurIPS 2023（arXiv:2305.14314）, QLoRA: Efficient Finetuning of Quantized LLMs（开源：https://github.com/artidoro/qlora 、https://github.com/TimDettmers/bitsandbytes）"
stance: watch
evidence:
  - source: library/Quantization/QLoRA.md
    locator: "§1 显存对比句（原文 >、< 为单字符数学符号）"
    quote: "QLoRA reduces the average memory requirements of finetuning a 65B parameter model from >780GB of GPU memory to <48GB without degrading the runtime or predictive performance compared to a 16-bit fully finetuned baseline."
    relation: supports
  - source: library/Quantization/QLoRA.md
    locator: "Abstract（abs 页抓取引文）"
    quote: "We present QLoRA, an efficient finetuning approach that reduces memory usage enough to finetune a 65B parameter model on a single 48GB GPU while preserving full 16-bit finetuning task performance."
    relation: supports
  - source: library/Quantization/QLoRA.md
    locator: "§2 显存账（LoRA 输入梯度 vs LoRA 参数）"
    quote: "the LoRA input gradients have a memory footprint of 567 MB while the LoRA parameters take up only 26 MB"
    relation: supports
  - source: library/Quantization/QLoRA.md
    locator: "§2 显存账（4-bit 底座，gradient checkpointing 后）"
    quote: "In comparison, the 4-bit base model consumes 5,048 MB of memory."
    relation: supports
falsifiers:
  - "官方配置（NF4+DQ+paged optimizers、全线性层 LoRA）在单张 48GB GPU 上复现 LLaMA-65B 微调 OOM，或必须缩序列/降 batch 才可行（'48GB 内'不成立）"
  - "paged optimizers 触发频繁 paging 使训练速度显著低于常规优化器（batch 16 同速的口径不成立），或长序列场景反复换页导致不可用"
  - "发现 >780GB 的 16-bit 全量微调估算口径失真（如不含激活/优化器状态的合理口径远小于 780GB），16× 压缩比被高估"
review_due: 2026-12-03
related: [claim-qlora-nf4-info-theoretic-optimal-datatype, claim-qlora-nf4-dq-recovers-16bit-lora-mmlu, claim-qlora-guanaco-99p3-of-chatgpt-vicuna]
signoff: null
---

## 我的理解

论文声称（asserted）：QLoRA 用"NF4 4-bit 存储数据类型 + BF16 计算数据类型、只对 LoRA 参数反传"把微调显存大头（4-bit 权重 + 激活梯度）压下来，再靠 Paged Optimizers（NVIDIA unified memory 页切换）兜住梯度检查点的显存尖峰，使 LLaMA-65B 微调从 >780GB 降到 <48GB、单卡可跑，且运行时/预测性能不降。显存账的机理证据：7B 底座上 LoRA 参数只占 26 MB，而 LoRA 输入梯度 567 MB（gradient checkpointing 后 18 MB/序列）、4-bit 底座权重 5,048 MB——所以"激进砍 LoRA 参数省不了显存，可以每层都挂 adapter"（§2，这是全线性层 LoRA 策略的依据）。

必须记住的口径限定：

1. **"不损运行时/预测性能"是复合句**：预测性能部分即 [NF4+DQ 恢复卡](claim-qlora-nf4-dq-recovers-16bit-lora-mmlu.md) 的主张（对照 16-bit LoRA）；运行时部分论文只给了 batch=16 的 65B paged vs 常规优化器同速，且自述"do not provide hard measurements for Paged Optimizers"——本卡显存主张实，运行时主张证据薄。
2. **<48GB 是"平均显存需求"**：尖峰场景（长序列 mini-batch）靠 paging 换出到 CPU RAM，不是峰值恒在 48GB 内；复现时序列长度/批大小必须记录。
3. **48GB 是单卡上限口径**（A100 48GB 类），不是"任意 24GB 卡跑 65B"（24GB 对应 33B，§4）；摘要的 "single 48GB GPU" 不能缩水转述。
4. >780GB 是论文对 16-bit 全量微调的估算（权重+梯度+优化器状态+激活的量级推算），非实测数字。

## 待验证

- 单张 48GB GPU（如 A6000 48GB / A100 48GB）用官方仓库跑 LLaMA-65B QLoRA 微调，记录峰值显存、序列长度、batch size。
- 实测 batch=16 下 paged vs 常规优化器的吞吐差，并构造长序列场景测 paging 开销。
- 复算 16-bit 全量微调 65B 的显存账（AdamW 状态 2×、梯度 2 bytes、权重 2 bytes + 激活），核对 >780GB 量级。

## 若成立 / 不成立意味着什么

成立：单卡 48GB 微调 65B 成为标配能力，LLM 微调选型按"参数量优先、精度 4-bit"规划显存；全线性层 LoRA 有显存账支撑。
不成立：48GB 口径依赖特定序列/批配置或 paging 频繁触发拖慢训练，65B 微调仍需多卡，QLoRA 降级为 33B 级以下方案。
