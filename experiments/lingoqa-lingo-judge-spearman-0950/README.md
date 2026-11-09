# Lingo-Judge 公开资产预检

关联 `claim-lingoqa-lingo-judge-spearman-0950`（`asserted / watch`）。论文声称模型级 Spearman 为 0.950，尚待用原 15 个模型输出独立复算。公开评测参考答案和裁判权重已定位，尚未取得原相关性研究逐题模型输出与对应人工标签。

- CPU 预检固定 `wayveai/Lingo-Judge` 为 `a1a6e2194fd1aedaba02bde82316a6b73753d1d5`。按官方 `benchmark/constants.py` 下载评测 Parquet，记录文件哈希与字段，核对 500 题、100 个片段、每题两条参考，共 1,000 行。
- 以 `(segment_id, question_id)` 排序后取前 8 题。对每题分别把第一条人工参考答案和固定文本 `unrelated test response` 作为输入，记录两条参考各自的判分及最大分。按官方 `judge.py` 的输入格式、去首尾空白并小写、截断长度 128 和 `logit > 0` 规则。这个对照只检查数据、分数形状与评分入口，无准确率门槛。
- 单独用 ECCV 补充材料 Table 9 的 A–O 模型级公布分数重算 Spearman 和 Pearson，人工标注员两组参照行排除。由于输入为四舍五入后的论文表格，差异只登记为算术对照。
- 完整相关性实验沿用任务书 Spearman `[0.90, 1.0]` 判定带，须先取得逐题输出和人工分。公开资产预检和论文算术均不纳入该带判定。A100 的耗时主张不在 CPU 预检范围。

[官方评测代码](https://github.com/wayveai/LingoQA/tree/main/benchmark) · [裁判权重](https://huggingface.co/wayveai/Lingo-Judge/tree/a1a6e2194fd1aedaba02bde82316a6b73753d1d5) · [ECCV Table 9](https://www.ecva.net/papers/eccv_2024/papers_ECCV/papers/09911-supp.pdf)
