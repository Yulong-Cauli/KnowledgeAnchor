# 实验设计：QwT R² 门控是否保证测试集不劣于原 PTQ

- **对应卡**：[claim-qwt-r2-gate-nonregression](../../claims/claim-qwt-r2-gate-nonregression.md)（status: asserted）
- **复核问题**：R² > 0（校准集）分支的补偿，在**测试集**（ImageNet val 整模型 top-1）上是否可能出现低于原 PTQ 的反例？
- **文献核验基线**：[nightshift/verify/claim-qwt-r2-gate-nonregression.md](../../nightshift/verify/claim-qwt-r2-gate-nonregression.md)（2026-11-02，结论"部分支持"：R²≤0 置零分支为逻辑保证；R²>0 分支仅校准集意义下成立；公开反例缺失，其遗留问题 3 明确"需自行复现并记录 per-module R² 与测试集表现"）
- **执行环境**：Kaggle T4 16GB（FP16 tensor core，无 bf16）
- **设计定稿**：2026-11-07。**§2 判定阈值预注册，实验开始后不得回调。**

---

## 0. 事实锚点（文献侧已核，实验侧据此对齐）

| 项 | 值 | 出处 |
| --- | --- | --- |
| 官方仓库 | https://github.com/wujx2001/QwT | 笔记头部 + verify §0 |
| 校准协议 | 从 ImageNet **训练集**随机抽 512 张图，逐模块收集输入 X、输出 Y，闭式解 W*=(Y−Y^Z)X^Zᵀ(XX^Zᵀ)⁻¹ | 论文 p.4465 §3.3/§4.1；代码 `LINEAR_COMPENSATION_SAMPLES = 512`（verify E1/E2/E5） |
| R² 计算 | 每个补偿模块在校准张量上算 `R² = 1 − ‖Y−Y_pred‖²/‖Y−Ȳ‖²`；阈值 0；R²≤0 → W=b=0 | 代码 `qwt_vit_and_deit.py` L44/L62-69/L124-129（verify E5） |
| 锚点数字（**arXiv v4 / CVPR camera-ready**） | ResNet-50 4/4：Percentile 62.3 → +QwT 68.5；DeiT-T 4/4：RepQ-ViT 58.2 → 61.4；ViT-B 4/4：RepQ-ViT 68.5 → 76.3 | 笔记 §4.1（v4 标注）；verify E7 |
| 版本警告 | v1 数字为 68.4/74.5/75.8（作者 v1→v4 下修）；**引用任何复现对照必须注明版本，本实验一律对 v4** | 笔记 §4.1 版本标注 |
| 论文自述 | "<5% 的 QwT 模块 R² notably low、有害精度"→ 门控动机；无 with/without-gate 消融 | verify E4 |

## 1. 配对设计原理（为什么 Δ 是精确量、不含评测噪声）

QwT 不改动量化权重，只在量化模块后并联线性补偿层。因此：

- **固定量化模型 + 固定校准集**时，PTQ 臂与 QwT 臂共享同一量化网络，推理确定性 → Δ = top1(QwT) − top1(PTQ) 是精确差值，**没有评测随机性**；
- 全部随机性来自**校准集抽样**（哪个 512 张图）——这正是主张里"校准集意义"的载体，所以种子扫描就是对其不确定性的直接测量；
- 实现要点：**PTQ 量化模型只跑一次并固化**（保存 checkpoint），随后每种子只重跑补偿层回归。若官方管线把 PTQ 校准与 QwT 校准耦合在同一 loader，需在 Phase 0 确认并解耦（解耦方式记录进结果）。

**materiality 阈值取 0.1% 的依据**：50k val 上 0.1% ≈ 50 张图；配对比较无噪声，任何 Δ<0 都"真实"，但 <0.1% 的漂移视为非实质性，只记录不判反例。

## 2. 预注册判定标准

**分级口径**：Tier A = 协议忠实配置（官方 PTQ 基线 + 官方 QwT 代码路径 + 校准图来自 ImageNet 训练分布 + 4-bit），其结论**证伪级**；Tier B = 压力测试（域移校准、val 校准、极小校准集），其结论**仅证据级**（scope 边界参考），不触发 falsifier 判定。

| 判定 | 条件 | 处置 |
| --- | --- | --- |
| **稳定反例**（触发 falsifier #1） | 任一 Tier A 配置：Δ ≤ −0.1% 且在 ≥2/3 校准种子中复现 | 卡片如实记录命中；拆卡/降级方案交主人裁定（对应 verify §4 建议 1 的待决） |
| **疑似反例** | 任一 Tier A 配置：Δ ≤ −0.1%，单种子 | 种子加跑到 5 个再判；结果照实入库 |
| **扫描范围内未发现反例** | 全部 Tier A 配置 min Δ ≥ −0.1% | Δ 分布（min/median/最差配置）写入 RESULTS.md 与 verify 报告附录，作为 R²>0 分支的**经验性**支持证据（非保证性） |
| **门控分支核验** | R²≤0 模块置零后，固定 batch 输出与 PTQ 模型**逐位一致**（bit-identical 断言） | 逻辑保证分支的直接实验确认（verify §2.1） |

**防择优规则**：所有配置（含失败、异常、锚点不中）全部进 metrics.json；阈值不得事后修改；如需追加维度，另立附录配置并标 "post-hoc"。

## 3. 阶段设计

### Phase 0：官方仓库对齐（本地/网络，0.5h）——2026-11-08 01:4x 完成

- [x] 确认仓库结构：ResNet 线（Percentile 基线）与 ViT 线（`QwT-cls-RepQ-ViT/qwt_vit_and_deit.py`）各自的入口脚本、依赖版本、checkpoint 获取方式；
  → **checkpoint 不需要**：管线自含——`build_model`（utils/build_model.py L67）用 `timm.create_model(pretrained=True)` 在线拉 FP 权重，PTQ（RepQ-ViT 规模重参数化 / ResNet Percentile）在脚本内完成；repo 克隆 + API 实测 default 分支 sha=`8a927da86be764a85b7d552bcdfa937af8211f90`（2025-09-30 "update readme"），kernel 按 pinned sha 运行时克隆。timm 版本约束实测确认：vendor `utils/vision_transformer.py`（带 `forward_before_blocks` L333，注册覆盖 vit_*/deit_* 同名模型）依赖 `timm.models.helpers`/`timm.models.layers`（1.x 已删除）→ **kernel 需 pin timm==0.9.16**。
  → **⚠ 预检①勘误（2026-11-08 01:5x，push 实测）**：`kaggle competitions files` 端点**不验证**比赛规则接受状态，先前"规则已接受"结论错误；`kernels push` 挂 `imagenet-object-localization-challenge` 为数据源时被拒（"You must accept this competition's rules"）。**实际规则未接受 → 本实验 BLOCKED，待主人在浏览器接受规则后重推**（恢复指令见 STATE.md / BLOCKED.md）。备选 sautkin 镜像数据集经查为分片哈希文件名、标签格式未验证——不引入未验证数据源，保持 BLOCKED。
- [x] 确认 PTQ 校准与 QwT 补偿校准是否共用 loader（影响 §1 解耦实现）；
  → **确认耦合**：PTQ 校准 = `loader_train` 首批（L323-325，batch_size 32）；QwT 补偿 = `loader_train` 顺序前 512 张（L141-147）。官方重跑 `--seed s` 会同时重抽两者。按 §1 解耦设计：PTQ 用 seed 0 校准一次并固化 state_dict，逐种子只换补偿集（每 seed 按官方协议重建 loader 取其顺序前 512 张）；此为**文档化偏离**（偏离官方"整脚本重跑"，系 §1 有意设计），Tier A 结论照此标注。
- [x] 确认 R² 门控代码与 verify E5 行号一致（防仓库版本漂移）；
  → **逐行核对通过**：`qwt_vit_and_deit.py` L44 `LINEAR_COMPENSATION_SAMPLES = 512`、L62-69 门控（`linear_init and (r2_score > 0)` else 置零）、L127-129 R² 公式（ss_tot/ss_res），与 verify E5 引文逐字一致，无漂移。
- [x] 产出：本 README 勾选 + 实现细节补进 §3.1。

### Phase 1：锚点复现（1 个 GPU 会话内）

| 模型 | 位宽 | 期望（v4） | 容差 |
| --- | --- | --- | --- |
| DeiT-T（最便宜，先跑通） | 4/4 | RepQ-ViT 58.2 → +QwT 61.4 | ±0.5% |
| ResNet-50 | 4/4 | Percentile 62.3 → +QwT 68.5 | ±0.5% |
| ViT-B | 4/4 | RepQ-ViT 68.5 → 76.3 | ±0.5% |

容差依据：校准抽样随机性 + torch 版本差。锚点偏差 >1% 时**暂停主实验**，先排查管线（结果照实记录）。

### Phase 2：门控机制核验（同会话）

1. 全模型统计 R²≤0 模块占比，对照论文自述的 "<5%"（E4）；
2. 对每个 R²≤0 置零模块：固定 batch 上断言 `q_model_with_zeroed_module(x) == ptq_model(x)` 逐位一致；
3. 记录逐模块 R² 分布直方图（校准 R² 的分布形态本身就是后续所有分析的背景）。

### Phase 3：对抗扫描（主实验，Tier A）

**§3.1 实现注记（2026-11-08 Phase 0 后补，授权自 Phase 0 产出条目）**

- 运行时 `git clone https://github.com/wujx2001/QwT` 并 checkout pinned sha `8a927da`，`sys.path` 指向 `QwT-cls-RepQ-ViT/`；clone sha 记入 metrics（防漂移）。
- 数据：`/kaggle/input/imagenet-object-localization-challenge/ILSVRC/Data/CLS-LOC`。val 目录结构运行时探测：若已按类分目录直接用；若 flat 则解析 `ILSVRC/Annotations/CLS-LOC/val/*.xml` 的 `<name>`（wnid）把 50k val 图符号链接到 `/kaggle/working/val_sorted/<wnid>/`（与 train 同一 sorted-wnid 索引空间）；无 XML 再 fallback devkit ground truth。实际采用哪条路径记入 metrics。
- eval batch 64（官方 32——纯吞吐偏离，不影响逐样本精度，记录在案）；train loader batch 32 保持官方（PTQ 校准批与补偿流式语义不变）。
- Phase 3 每种子：按官方协议重建该 seed 的 loader_train → 顺序取前 512 张过 `forward_before_blocks` 收特征**一次**；`calib_size ∈ {512,128,64,32}` 对特征前 k 张切片各自回归（闭式解，秒级）；`gate on/off` 复用同一回归（off = CompensationBlock 以 r2_score=1.0 强制 linear init，即无视门控全部载入 W,b）；随后逐配置 eval。每 seed 实测 ≈ 8 次 eval（4 尺寸 × 2 门控）。
- PTQ 固化：seed 0 校准 + 量化 + 规模重参数化完成后 `state_dict` 存 `/kaggle/working/ptq_deit_tiny.pt`，Phase 3 每配置从固化权重载入（§1 解耦要点）。
- 会话自检点：**5.5h**——此后不启动新配置，收尾保存退出（保 08:10 收割火前完成）。

维度矩阵（每格 K=3 校准种子）：

| 维度 | 取值 |
| --- | --- |
| 模型 | DeiT-T（全扫描）、ResNet-50、ViT-B（关键点补扫） |
| PTQ 基线 | 各模型官方基线（Percentile / RepQ-ViT） |
| 位宽 | 4/4（claim scope）；Swin-S 6/6 视余量加 |
| 校准规模 | 512（官方）、128、64、32 |
| 门控 | on（官方）/ off（全部补偿，不做判定，只量化"无门控时多少模块有害"——回答 verify 遗留问题 1） |

产出指标：每配置 `top1_ptq / top1_qwt / Δ`、逐模块 R²（min/median/分布）、R²≤0 占比。单配置估时：DeiT-T ~5 min、ResNet-50 ~10 min、ViT-B ~15 min（含 50k val FP16 eval）；预计 60–120 配置 ≈ 1–2 个 9h 会话。

### Phase 4：Tier B 压力测试（证据级，量力而行）

- 域移校准：灰度化 / ImageNet-C 风格扰动的训练图作校准集（R²>0 但分布失配的最直接诱导场景）；
- 极小校准集（16/8 张）+ 多种子，观察 R² 与 Δ 的失稳点；
- 全部结果标 `tier: B`，不参与 §2 的 falsifier 判定。

**明确 out of scope（留待后续实验）**：falsifier #2（检测/部署模型复现，如 DETR MinMax 6/6 39.5→40.0——需 COCO 管线，另立实验目录）；LLaMA3 逐数据集退化线（verify E6 已有文献证据，LLM 校准在 T4 上口径打折）。

## 4. 数据与环境（Kaggle）

- **val 集**：官方 `imagenet-object-localization-challenge` 数据集内 `ILSVRC2012_img_val.tar`（6.3GB）选择性解压；标签用 devkit 的 ground truth；
- **校准池**：官方协议要求训练集抽图。外层 `ILSVRC2012_img_train.tar`（138GB）不可整体解压，改为流式读取：每类 tar 抽前 ~160 张 → 全 1000 类约 16 万张（~20GB）校准池；512 张校准图按官方方式从池中随机抽取。
  - **文档化偏差**：池为每类前 160 张的子集，非全量训练集均匀抽样。Tier A 结论按"池 ⊂ 训练集"的近似口径标注；若 Phase 1 锚点复现正常，视为可接受偏差。
  - 备选：若流式读 tar 过慢（>40 min），降级为 150 类全量池，偏差升级标注。
- **可复现性**：每配置记录 `calib_seed` + 校准图像清单 sha256；环境记录 pip freeze + GPU/CUDA/驱动版本。

## 5. results/metrics.json 记录 schema

```json
{
  "claim_id": "claim-qwt-r2-gate-nonregression",
  "git_commit": "<head hash>",
  "kaggle_notebook_version": "<url>",
  "env": {"gpu": "T4", "cuda": "...", "torch": "...", "pip_freeze_sha256": "..."},
  "config": {"model": "deit-tiny", "ptq_method": "repq-vit", "w_bits": 4, "a_bits": 4,
             "calib_seed": 0, "calib_size": 512, "calib_pool": "first160_per_class",
             "gate": "on", "tier": "A", "paper_version": "v4"},
  "r2_stats": {"n_modules": 0, "n_zeroed": 0, "r2_min": 0, "r2_median": 0, "r2_hist": "..."},
  "top1_ptq": 0.0, "top1_qwt": 0.0, "delta": 0.0,
  "notes": "<任何异常/偏离口径的说明>"
}
```

## 6. 结果回写与状态边界

1. 跑完 → `RESULTS.md` 汇总（结论只写"实验观察"，不写"已验证/证伪"）；
2. 卡片「核查记录」追加一行，链到本目录；status 维持 `asserted`；
3. 若命中稳定反例：在卡上登记 falsifier 命中 + 把 verify §4 拆分方案的裁量材料补全，**拆不拆、怎么改 title 由主人定**；
4. signoff（`by/at/method/evidence_hash`）由主人手填；本实验产出的 sha256 清单即 evidence_hash 原料。

## 关联卡（管线可复用）

- `claim-pdquant-pd-loss-alone-overfits-calibration`（PD-Quant 校准 70.51% vs 验证 1.07% 反常数字复现）——同一 ImageNet PTQ 环境，第二实验候选。
