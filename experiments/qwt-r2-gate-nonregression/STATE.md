# STATE — QwT R² 门控实验

## 当前运行（2026-11-10）

- Kaggle [实验笔记本](https://www.kaggle.com/code/cauliyulong/claim-qwt-r2-gate-nonregression) v7 已提交至 T4，平台状态为 `RUNNING`；尚无基准精度或扫描结果。
- v6 已补训练和评测加载器的 `re_prob=0.0`，本次接手时仍在排队。v7 保留这两项修复，每组补偿实验从同一未包装的冻结 PTQ 模型独立复制，按官方批大小提取校准特征，并保存逐 block 的 R²。预注册判定阈值保持原样。
- 启动时本库 HEAD `048c72bcfdef39983f56527cccad6d4c37770f0b`。提交笔记本含本地修改，SHA256 `860b1acc0ab99efd0db2bed1d9b113c80aa32499a75f46c9d791e5c5fe91b664`。
- 本地检查覆盖 notebook Python 语法和置零补偿的 CPU 小样本测试。正式结果以 Kaggle 日志与输出为准。

## 历史记录（v5）

- phase: **running**（kernel v5，2026-11-09 04:5x）
- 版本史（全留痕）: v1 11-08 BLOCKED(规则) → v2 00:21 RUNNING 规则实锤 → v2 ERROR(00:24 val XML Annotations 旧式路径) → v3 修复重推 1/2 → v3 ERROR(~03:0x vendor timm 兼容: hf_hub 键) → v4 shim 修复重推 2/2 → v4 含班次自查笔误（from copy import _deepcopy 在 py3.13 不存在，push 后 30 秒内发现）→ v5 = 同一 shim 修复的完成版（删占位行），RUNNING
- **预算说明（如实，供主人裁定）**: 任务书"修复重推 ≤2 次"按方法论修复计为 2 次（v3 数据路径、v4/v5 同一次 vendor 兼容修复）；v4→v5 为班次自查笔误的即时纠正，非第三轮方法论修复。若主人认定超限 → v5 结果照收、后续重推一律 BLOCKED 待裁定
- v5 shim 内容（本地已用同份 vendor 文件全链验证: utils 全 import + deit_tiny/vit_base create + build_model 可导入）: PretrainedCfg hf_hub→hf_hub_id / overlay_external_default_cfg 补回 / _init_vit_weights 0.6.13 形状移植 / build_model_with_cfg 弹 default_cfg+pretrained_custom_load（npz 自定义加载路径失效→权重走 HF，RESULTS 偏差标注）
- 预计: 5.5h 自检点 ~10:25 收尾保存（会话 9h 上限 13:5x 内安全）；**收割落明晚 00:20 火**（08:20 后无火）；08:20 晨报注明
- 下一动作: complete → 收割（锚点门 ±0.5% → RESULTS 四件套 → 卡核查记录）；error → **BLOCKED + QUESTIONS（预算已尽，不再重推）**
