# experiments/ —— 实验复核区

> 建立于 2026-11-07（与主人商定）。本目录存放 claim 卡 falsifier 的**实验复核**：实验设计、代码、环境记录、小体积结果文件。
> 硬约束：实验只产出 evidence，**不改任何 claim 的 status**；`verified` 签署由主人手工完成（见 AGENTS.md）。实验数字必须如实记录——失败、反例、异常同样入库，不得先有结论再凑数据。

## 目录命名

`experiments/<claim id 去 claim- 前缀>/`，与卡片一一对应。一个实验目录只服务一张卡；多卡共用管线时以主卡命名，在该目录 README 里列明关联卡。

## 标准结构

```
experiments/<slug>/
├── README.md                  # 实验设计：问题、预注册判定阈值、扫描维度、数据与环境、结果回写流程
├── <name>.ipynb               # notebook 源文件（本地为唯一真源，经 kaggle kernels push 推到 Kaggle 执行）
├── requirements-frozen.txt    # Kaggle 实测环境 pip freeze（跑完后拉回提交）
├── RESULTS.md                 # 结果汇总（跑完后生成；含结果文件 sha256 清单）
├── results/                   # 小体积结果入库：metrics.json、CSV、日志；单文件上限 ~5 MB
├── data/                      # 本地临时数据（gitignore，不入库）
└── checkpoints/               # 模型权重（gitignore，不入库）
```

大文件（数据集、checkpoint、原始图像）一律不进 git：数据放 Kaggle 挂载，权重只存 Kaggle 输出区。

## 本地 ↔ Kaggle 工作流

1. 本地写 notebook → `kaggle kernels push`（kernel 元数据 title 注明 claim id）。
2. Kaggle 上 Save & Run All 执行 → 记录 notebook 版本 URL（`kaggle.com/<user>/<slug>/logs`）。
3. `kaggle kernels output` 拉回结果文件与 pip freeze，入库。
4. Kaggle 上的 notebook 版本与输出是临时载体，**本仓库才是存档真源**。

## 证据记录四件套

每次实验必须在 `RESULTS.md`（或 metrics.json 内）固定记录：

1. **git commit hash**（本仓库，实验启动时的 `HEAD`）；
2. **Kaggle notebook 版本 URL**；
3. **环境快照**：pip freeze + Kaggle GPU 型号 / CUDA / 驱动版本（T4 的库版本随时会变，不复现环境则证据三个月后说不清）；
4. **结果文件 sha256 清单**（将来 signoff 的 `evidence_hash` 原料）。

## 诚实规则（防"为证伪而证伪"）

- **判定阈值预注册**：反例判定标准写进实验 README，跑完之前不得回调阈值；所有运行（含失败与不利结果）全部留痕。
- **随机性记录**：每个配置记录随机种子与校准集抽样清单 hash。
- **偏离即标注**：任何偏离论文/官方代码口径的做法（如校准池子集化）必须在设计文档与结果里显式标注，并区分"证伪级"与"证据级"结论。

## 结果回写流程

1. 实验结束 → 填 `experiments/<slug>/RESULTS.md`（结论只表述为实验观察，不写"已验证"）。
2. 对应 claim 卡（须为 `asserted`）「核查记录」节追加一行，链接本目录。
3. 若触发 falsifier：在卡上如实记录命中情况，处置（拆卡/降级/维持）由主人裁定。
4. verify 报告（`nightshift/verify/`）如需引用实验结论，追加实验节，指向本目录。
