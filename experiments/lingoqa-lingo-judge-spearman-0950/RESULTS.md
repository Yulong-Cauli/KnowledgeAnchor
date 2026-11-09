# Lingo-Judge v1 预检与论文表格复算

关联 `claim-lingoqa-lingo-judge-spearman-0950`（`asserted / watch`）。v1 完成了数据与权重预检。原运行中的 Table 9 算术使用了错误输入，按论文原表另行复算。原相关性实验仍缺逐题模型回答及可与回答对齐的人工分。

## v1 实测

- [Kaggle notebook v1 与日志](https://www.kaggle.com/code/cauliyulong/ka-verify-lingoqa-judge/logs)。[Kaggle 版本记录](results/v1/kernel-version.json)确认服务端为 v1，拉回的 notebook 代码单元与仓库源码逐字一致。运行源码记录的预注册提交为 `4ce893924bb62a002d41cc4ac895d952191fb12e`，本地提交记录与 Kaggle 返回的原始 `last_run_time` 日期不一致，归档以版本号和代码匹配定位。
- [运行日志](results/v1/kaggle-execution-log.txt)和[依赖快照](requirements-frozen.txt)从 Kaggle 原样取回。CPU、PyTorch 四线程、Python 3.13.18、PyTorch 2.11.0+cpu、Transformers 4.52.4。权重固定为 `wayveai/Lingo-Judge@a1a6e2194fd1aedaba02bde82316a6b73753d1d5`。
- [参考数据检查](results/v1/reference-integrity.json)通过。100 个片段、500 道题、每题两条参考，共 1,000 行。片段 ID、题目 ID、题干、参考答案均无空值。同组两行的题干相同。
- [评分试跑](results/v1/judge-smoke.json)按 `(segment_id, question_id)` 排序取前 8 题。原样参考答案 8/8 通过，固定无关回答 `unrelated test response` 有 7/8 被拒绝、1/8 通过。16 个候选回答共 32 次参考配对，CPU 评分循环用时 10.883 秒，包含分词和推理，计时从权重加载之后开始。此处只记录试跑表现与用时，A100 全评测集耗时另测。

误判发生在题目 `5bb70f548212e262aa85332f29d3b1e8`（片段 `00fb5ab9e2d508c573d588652cf0d025`）。题目询问是否应该停车及原因，两条参考都答无需完全停车，给出的理由不同。固定无关回答在两条参考下的分数分别为 0.641573 和 0.042534，最大值超过 0.5 后通过。题干和参考答案已在哈希相同的公开 Parquet 中回查。本次取题按 ID 排序，且正例直接复用参考答案，不能据此估计真实模型回答的准确率。

## ECCV Table 9 算术更正

按 [ECCV 补充材料 Table 9](https://www.ecva.net/papers/eccv_2024/papers_ECCV/papers/09911-supp.pdf#page=12)逐行核对 Lingo-Judge 与 Human 两列。v1 有 7 个模型行至少一列录入错误（C、D、G、H、I、J、K），例如 H 在原表是 `50.0 / 0.520`，v1 使用 `54.9 / 0.529`。[v1 算术原始输出](results/v1/table9-arithmetic.json)保留作历史记录，其中相关系数作为 Table 9 复算证据无效。

| 输入 | 点数 | Pearson | Spearman |
| --- | ---: | ---: | ---: |
| 论文 Table 1 报告值 | — | 0.993 | 0.950 |
| Table 9 模型 A–O | 15 | 0.973911 | 0.932023 |
| Table 9 模型 A–O 加两组人工参照 | 17 | 0.993094 | 0.953375 |

[Figure 9](https://www.ecva.net/papers/eccv_2024/papers_ECCV/papers/09911-supp.pdf#page=7)的散点图可见两组人工参照。加入这两组后，用公开汇总分复算的结果接近论文报告值，仍有差异。两组复算均未重新给模型回答打分，也不适用正式实验的预注册判定带。[复算脚本](recompute_table9.py)用 SciPy 计算 Pearson 及按平均秩处理并列的 Spearman，输出[原表输入、逐行差异和系数](results/table9-recomputed.json)。

## 原始实验材料查找

2026-11-09 检查了以下公开入口，未找到 Table 9 的 A–O 逐题模型输出：

- [官方评测下载目录](https://drive.google.com/drive/folders/1oA7W8-Ej_uJEuUxZIjPP5K8hQGGzYsPq)列出 `images.zip` 和 `val.parquet`。v1 读取的 Parquet 字段为题目 ID、片段 ID、图像索引、问题与参考答案。
- [官方仓库](https://github.com/wayveai/LingoQA)提供评测脚本，要求使用者提供自己的预测文件。[Releases](https://github.com/wayveai/LingoQA/releases)无发布包。[裁判权重目录](https://huggingface.co/wayveai/Lingo-Judge/tree/a1a6e2194fd1aedaba02bde82316a6b73753d1d5)提供模型与分词器文件。
- [ECCV 补充材料](https://www.ecva.net/papers/eccv_2024/papers_ECCV/papers/09911-supp.pdf)有个例和模型级汇总表。若取得与 Table 9 人工均分确切对应的逐题模型回答，可以独立重算裁判侧的模型级分数，再与这些人工均分计算相关性。逐题错误分析需要逐题人工评分。

如果无法取得原始输出，后续独立实验使用一批新的模型回答和新的人评，作为不同范围的结果记录。各模型回答同一批题，人评在看不到模型身份和裁判分的条件下进行。Lingo-Judge 和对照指标使用同一批回答。按片段选题，并分别报告逐题一致性、模型级相关性和人评之间的分歧。

## 文件完整性

[SHA256 清单](results/sha256-manifest.txt)路径以本实验目录为准。原始输出与从 Kaggle 取回的文件逐一比对哈希，其中运行日志仅改了存档文件名。参考数据和权重由源地址取得，仓库只记录定位信息。
