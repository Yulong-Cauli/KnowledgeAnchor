---
id: claim-lingoqa-late-fusion-beats-early-mid
title: "论文声称基线的 late fusion（60.80）优于 mid fusion（59.20）与 early fusion（48.40）"
type: claim
status: asserted
scope: "LingoQA 基线（CLIP ViT + Q-Former + Vicuna-1.5-7B），4 秒 5 帧输入，LingoQA Action+Scenery 两阶段微调，Lingo-Judge 打分（Table 4 视频融合消融）；early = 进 Q-Former 前多帧特征平均池化，mid = Q-Former 内 cross-attention 压成固定数量 token，late = 各帧独立编码后 token 按序拼接进 LLM；数字为论文自报"
tags: [lingoqa, autonomous-driving, vqa, video-fusion, ablation, blip-2]
note: library/QA dataset/LingoQA.md#43-视频融合late--mid--earlytable-4
paper: "ECCV 2024, LingoQA: Visual Question Answering for Autonomous Driving (arXiv:2312.14115)"
stance: watch
evidence:
  - source: library/QA dataset/LingoQA.md
    locator: "§4.3 / 视频融合消融 Table 4 摘录·early 行"
    quote: "| Early fusion | 进 Q-Former **之前**对多帧特征**平均池化**成一个向量 | 48.40 |"
    relation: supports
  - source: library/QA dataset/LingoQA.md
    locator: "§4.3 / 视频融合消融 Table 4 摘录·mid 行"
    quote: "| Mid fusion | 在 Q-Former 内用 cross-attention 把多帧合成固定数量 token | 59.20 |"
    relation: supports
  - source: library/QA dataset/LingoQA.md
    locator: "§4.3 / 视频融合消融 Table 4 摘录·late 行"
    quote: "| **Late fusion（基线）** | 各帧独立编码，token 按序拼接进 LLM | **60.80** |"
    relation: supports
  - source: library/QA dataset/LingoQA.md
    locator: "§4.3 / 解读"
    quote: "Mid fusion 保住部分时序但受固定 token 预算限制。Late fusion 把融合交给 LLM 的 self-attention（当前最好的时序关联模块），token 预算不受限。"
    relation: supports
falsifiers:
  - "〔同范围复现（主张侧+对照侧）〕复现中 early fusion ≥ late fusion 或 mid fusion ≥ late fusion（同数据同训练预算同裁判），排序不成立"
  - "〔同范围复现（效应量，多种子）〕排序保持但差距缩水：late−mid 的 1.6 分在多种子下不再稳定为正（符号翻转或置信区间跨 0），或 late−early 的 12.4 分量级差未复现（效应阈值未预设，以复现所得方差为准）"
  - "〔机制辨别（容量混淆）〕消融口径不对等：三种融合的参数量/训练步数/token 预算不同且未对齐，early 的惨败来自容量而非时序信息丢失"
review_due: 2026-12-02
related: [claim-lingoqa-7b-baseline-matches-gpt4v, claim-lingoqa-lingo-judge-spearman-0950]
signoff: null
---

## 主张

论文声称：在同一基线与训练配置下，多帧信息在何处融合显著影响分数——late fusion（各帧独立过 CLIP+Q-Former，token 拼接交 LLM self-attention）60.80 > mid fusion（Q-Former 内 cross-attention 压缩）59.20 > early fusion（Q-Former 前平均池化）48.40。机理解释（笔记作者解读口径，笔记原句为"惨败原因直观"，非逐字论文表述）：平均池化抹掉时序方向（红灯变绿 vs 绿灯变红同色），固定 token 预算限制 mid fusion，late fusion 把时序关联交给 LLM 且不受 token 预算限制。

限定：
1. 差距的主张主体是 early 与 late 之间的 12 分；late 与 mid 只差 1.6 分，接近噪声量级——"late 严格优于 mid"的说服力弱于"early 崩溃"。
2. 论文未报告该消融的方差/多种子重复，单次训练的 1.6 分差异不可过度解读。
3. 结论绑定 5 帧 @1Hz 与 Q-Former 架构；帧数更多、分辨率更高或不用 Q-Former 的设置不能直接外推。

## 待验证

- 用开源仓库复现三种融合（至少 early vs late 两端），同预算训练后核对 48.40 / 60.80 的量级差。
- 做 2~3 个种子的 mid vs late 对照，确认 1.6 分差距是否稳定为正。
- 检查三种融合的参数量与训练 token 预算是否对齐（排除容量混淆）。

## 成立/不成立的含义

成立：视频 VLM 的默认设计应避免在视觉塔内过早压缩时序（平均池化尤其不可取），把多帧 token 留给 LLM self-attention 处理——对后续端到端驾驶 VLM 的视觉接口设计有直接指导意义。
不成立：若差距来自容量或训练预算不对等，则"在哪融合"降级为工程调参问题，early fusion 在算力受限场景（token 预算紧张）仍可能是合理选择。

## 核查记录

- 2026-11-05（P1-B7b 零散组）：本卡 4 条 library 笔记引句经 grep -F 逐字验证全部命中（`library/QA dataset/LingoQA.md`：§4.3 视频融合 Table 4 摘录 early/mid/late 三行与解读句）；数字 48.40/59.20/60.80 与笔记表格一致，late−mid=1.6、late−early=12.4 为按表计算。内容审阅发现两处表达问题并已修：① 原 falsifier 2 的噪声阈值「<1 分 / <3 分」无论文依据，改为锚定论文自报差距（1.6 / 12.4）并把效应阈值标为未预设；② 机理解释一句按笔记原文（"惨败原因直观"）显式标为笔记作者解读口径，不冒充论文表述。LingoQA 论文原文本轮未实抓，论文数字未改写。
