# STATE — 班 B（qwt-r2-gate-nonregression）

- phase: **blocked_awaiting_competition_rules**
- Phase 0: 完成（commit b5d27ce + 勘误注记）；checkpoint 免需、E5 行号零漂移、timm==0.9.16 依赖路径确认
- notebook: `qwt-r2-gate-tier-a.ipynb` 就绪（8 cells，本地 ast 全过），kernel-metadata.json 就绪（GPU + competition source）
- kernel: **未创建**（push 被 API 拒绝：比赛规则未接受）
- 阻塞解除动作（主人）：浏览器接受 https://www.kaggle.com/c/imagenet-object-localization-challenge/rules
- 解除后动作（值班班次或手动）：`cd experiments/qwt-r2-gate-nonregression && kaggle kernels push -p .` → 照任务书「班 B」收割流程走
- 详见 BLOCKED.md
