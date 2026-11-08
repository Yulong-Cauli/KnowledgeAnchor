# STATE — 班 A（bevplanner-straight-driving）

> 当前状态（2026-11-08）：**retired / superseded**。以下 done 是原收割状态，不代表审核通过；原解释已撤回、旧卡已移除，见 [审核说明](AUDIT-2026-11-08.md) 和 [后续普查](../nuscenes-three-second-low-lateral-displacement-majority/README.md)。

- phase: **done**（2026-11-08 11:16 收割完成）
- preregister_commit: 6720267（阈值族/判定带锁定先于运行）
- kernel: `cauliyulong/claim-bevplanner-straight-driving-imbalance` **version 8（成功）**；v1-v7 全程失败留痕（见 RESULTS.md §4）
- kernel_url: https://www.kaggle.com/code/cauliyulong/claim-bevplanner-straight-driving-imbalance
- 结果: falsifier 1 未触发；73.9% 带内复得（H_5°=71.7%/L_1m=78.6%）；附录 87% 复得（H_15°=87.7%/L_2m=87.9%/P=87.9%，分母 5119 与论文 Appendix B 逐位一致）
- 产出: results/{results.json, straight_ratio.csv, summary.txt, pip-freeze.txt, kernel log, sha256-manifest.txt} + RESULTS.md（四件套齐）
- 卡片: 「核查记录」已追加一行（status/stance/signoff 未动）
- 收尾: 卡片待主人裁决（是否升级"已复算"表述/signoff）；falsifier 2（因果隔离）另立实验
