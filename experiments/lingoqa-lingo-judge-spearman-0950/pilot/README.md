# Lingo-Judge 新回答盲评试验

关联 `claim-lingoqa-lingo-judge-spearman-0950`（`asserted / watch`）。这是独立的小规模试验。模型级相关性只作探索性结果，原 15 模型实验的判定带不用于本试验。

- 公共 LingoQA 评测集参考文件固定为 v1 记录的 SHA256。按 SHA256 对片段 ID 排序取前 10 个，再按相同规则每片段取 2 道题。抽样盐固定为 `ka-lingo-pilot-20261109`。取题与模型分数无关。
- 所有模型接收同一组按时序排列的 5 张 RGB 图像和同一英文题目。图像保持比例且最长边不超过 640 像素，作为多图输入，不附参考答案。统一要求直接回答并保留题目要求的理由。按贪心解码，最多生成 128 token，记录达到上限的回答。
- 使用公开权重推理，模型仓库与版本见 notebook。InternVL3.5-4B 使用 OpenGVLab 发布的 Transformers 格式版本。每次仅下载并加载一个模型，使用 GPU、FP16、单条推理。首题单独记录运行情况，再处理余题。下载完成后核对权重字节数。失败保留日志，其他模型继续，缺答仍记为缺失。
- 输出逐题回答与隐藏模型名的盲评材料。盲评材料按固定哈希次序混排，同一片段和题目可追溯，评分人不看模型身份、参考答案或裁判分，按图像和题目判断正确性，允许标记无法判断。保留独立人评，再和同一批回答的裁判分比较。
- 使用新的私有 Kaggle notebook，原 v1 预检可单独追溯。输出保存回答、环境、下载和推理记录，权重和原图不入库。

## 提交记录

- [Kaggle pilot v1](https://www.kaggle.com/code/cauliyulong/ka-lingoqa-blind-pilot/logs)已提交，指定 T4，时限 3,600 秒。提交时仓库 HEAD 为 `5cc2ba73ac422f7476902f7a22fda745e24402df`，pilot 源码在工作区，提交的 notebook SHA256 为 `bb39b6daab9dfd804660ea2353db04546052f5b5e8d6c452b291367d32fa6a6c`。
- [选题清单](question-manifest.json)SHA256 为 `fef18ef169cffb3bf62a05282f6d5e555955010fb3c958b0db01121d7859ceee`。已核对公开图像 ZIP 索引，50 个不同帧路径全部存在。
- 最近一次查询状态为 `QUEUED`，仍在等待 GPU 分配。
