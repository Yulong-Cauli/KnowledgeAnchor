---
id: claim-qwt-r2-gate-nonregression
title: "QwT 的 R² 门控能保证补偿后的模型不劣于原 PTQ"
type: claim
status: asserted
scope: "ImageNet 分类；4-bit PTQ；R² 在校准集上计算"
tags: [quantization, ptq, qwt]
note: library/Quantization/QwT.md#3-r2-门控机制判定系数
paper: "CVPR 2025, Quantization without Tears"
stance: watch
evidence:
  - source: library/Quantization/QwT.md
    locator: "§3 / 论文第 3 节"
    quote: "**如果 $R^2 \le 0$**：说明线性拟合失败，强制令 $W=0, b=0$ 。"
    relation: supports
  - source: library/Quantization/QwT.md
    locator: "§3"
    quote: "这一机制确保了 QwT 在最坏情况下也不会比原始 PTQ 模型差"
    relation: supports
falsifiers:
  - "找到 R² > 0（校准集）但测试集精度低于 PTQ 的案例"
  - "在检测/部署模型上复现，观察门控是否仍能兜底"
review_due: 2026-11-15
related: [claim-repqvit-w4a4-imagenet-leads-ptq-baselines, claim-pdquant-pd-loss-alone-overfits-calibration]
signoff: null
---

## 命题边界与证据缺口

- 本卡 title「QwT 的 R² 门控能保证补偿后的模型不劣于原 PTQ」是宽泛命题；**现有证据只支撑其中一部分**：① R² ≤ 0 置零分支的兜底是逻辑保证——论文原文 "by setting W and b to all zeros, QwT will not alter the quantized network"（CVPR 2025, p.4465，据笔记 L101 限定注转引）；② R² > 0 分支的「不劣于」仅在校准集意义下有定义，测试集表现无理论保证——论文补充材料 Table 4（LLaMA3）含逐数据集小幅退化实例（BoolQ −0.03、HellaSwag −0.51）。
- **证据缺口**：本卡 evidence 两条均为笔记转述句（quote 2 为笔记作者概括句，笔记已于 2026-11-03 加限定标注「非论文原话」），无论文原文逐字 evidence。
- **待主人裁定（拆分方案，登记不代行）**：a) 按分支拆为「R²≤0 置零分支的兜底保证」（可引论文原文逐字 evidence）与「R²>0 分支仅校准集意义下成立、测试集为经验观察」两张卡，related 双向关联，旧卡 id/命题不动；b) 保持现卡、在 title/scope 补分支限定；c) 维持现状。已提交 id 不得改名为更窄命题。

## 主张

> 附注（2026-11-03，笔记修正同步）：笔记 L101「意义」句后已按 verify 报告 §4 建议 1/3 加限定——标注该句为笔记概括，论文「理论上不会更差」仅覆盖 R²≤0 置零分支，R²>0 分支仅校准集意义下成立、测试集为经验观察（补充材料 Table 4 含 BoolQ −0.03 / HellaSwag −0.51 逐数据集退化实例）。本卡 evidence quote 2 所引原句未改动；verify §4 对本卡的拆分主张 / 增补论文原文 evidence 等建议仍待主人定夺，本卡未动。另 round3 终审（2026-11-03）：evidence quote 1 原为笔记该行的去 LaTeX 转写（「R² ≤ 0」），从未逐字命中，已同步为笔记原句逐字引文（仅换引文写法，未引入新事实，主张与 status 不变）。

按论文描述，R² ≤ 0 时令 W=0、b=0，补偿后的模型与原 PTQ 模型完全一致，这一部分是逻辑上的兜底。但 R² > 0 只说明线性补偿在校准集上解释了部分残差，**不保证测试集上一定不退化**。

“无痛”是论文的措辞，不是已经验证的结论。原始笔记见 [QwT](../library/Quantization/QwT.md#3-r2-门控机制判定系数)。

## 待验证

- 构造或找到一个案例：校准集 R² > 0，但测试集精度低于 PTQ。
- 固定一个检测/部署模型与其 4-bit PTQ 基线，加 QwT 补偿 + R² 门控后重测：观察 R² ≤ 0 置零分支是否触发、补偿后精度是否低于原 PTQ——低于即门控兜底在部署场景失效（falsifier 2）。

## 成立/不成立的含义

成立则 QwT 是一个低成本的 4-bit 补偿选项；不成立则说明“门控保证”只在校准集意义下成立，选型时需要额外留出退化余量。

## 核查记录

- 2026-11-03：笔记 L101「意义」句加限定（verify §4 建议 1/3，依据 nightshift/verify/claim-qwt-r2-gate-nonregression.md）；round3 终审把 evidence quote 1 同步为笔记原句逐字引文（原为去 LaTeX 转写，从未逐字命中）。
- 2026-11-05：本班表达整理——命题边界与证据缺口前置、拆分方案登记待决（命题、status、stance、数字未改写）；Grep 复核两条 evidence quote 逐字命中（quote 2 所在笔记行已带限定注，引用句本身仍逐字命中）。
