# BLOCKED — 班 B（qwt-r2-gate-nonregression）

- phase: **blocked_awaiting_competition_rules**
- 阻塞点：Kaggle 账号未接受 `imagenet-object-localization-challenge` 比赛规则 → `kernels push` 挂其为主持数据源被拒（API 级拒绝，kernel 未创建）。
- 勘误：Phase 0 预检①曾用 `kaggle competitions files` 判定"规则已接受"——该端点不做此验证，结论错误，已在 README Phase 0 注记勘误。

## 恢复指令（主人操作后，任何一班或手动执行）

1. 主人在浏览器打开 https://www.kaggle.com/c/imagenet-object-localization-challenge/rules 并点 "I Understand and Accept"（一次性，账号级）。
2. 之后重推即可（notebook 与 kernel-metadata.json 已就绪，无需任何改动）：
   ```
   cd experiments/qwt-r2-gate-nonregression && kaggle kernels push -p .
   ```
3. 推送后按 STATE.md 原计划执行：锚点（DeiT-T 58.2→61.4）→ Phase 2 → Phase 3 扫描（5.5h 自检点）→ 收割回写。
4. 已验证就绪的部分：repo pinned sha 克隆、timm==0.9.16 依赖路径、val 三级 fallback、PTQ 复刻与补偿机制代码（本地语法全过 + 机制级核对 E5 行号）。
