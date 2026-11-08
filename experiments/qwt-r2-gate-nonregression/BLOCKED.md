# BLOCKED — 班 B（qwt-r2-gate-nonregression）（2026-11-09 fire-0620 更新）

- phase: **blocked_repair_budget_exhausted**
- v5 失败点：`utils.utils.create_loader() missing 1 required positional argument: 're_prob'`（QwT vendor 自定义 loader 签名要求 re_prob；eval loader 应补 `re_prob=0.0`）
- **已验证全通的部分（v5 实测）**：timm 兼容 shim 四件套 ✓（"shim applied"）、QwT repo clone+pinned sha ✓、ImageNet 挂载+CLS-LOC 探测 ✓、val XML 排序 50,000 ✓、train 1,281,167 图载入 ✓ —— v6 只差一个 kwarg 即达 Phase 1 锚点复现
- **预算账**：任务书"修复重推 ≤2 次"——v3（val 路径）、v4/v5（vendor timm 兼容，同一次修复）已用尽；v5 败 → 按 STATE 承诺 BLOCKED，不再重推
- **主人动作（三选一）**：① 回复"授权 v6"→ 任何火次/手动补 `re_prob=0.0` 于 cell 2 的 create_loader(dataset_eval,...) 调用并 push（notebook 其余不动）；② 亲自修改重推；③ 维持 BLOCKED
- 详见 QUESTIONS #100；版本史 v1–v5 全部留痕（kernels 页 versions）
