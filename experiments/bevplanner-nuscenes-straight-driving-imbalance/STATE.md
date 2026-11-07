# STATE — 班 A（bevplanner-straight-driving）

- phase: **running**
- preregister_commit: 6720267（阈值族/判定带锁定先于运行）
- kernel: `cauliyulong/claim-bevplanner-straight-driving-imbalance`
- kernel_url: https://www.kaggle.com/code/cauliyulong/claim-bevplanner-straight-driving-imbalance
- version: **v2**（v1 = 无数据集探针版本，metadata 排查用，预期 error，忽略）
- pushed_at: 2026-11-08 01:2x
- 会话: CPU（enable_gpu=false，不占 T4 配额），internet=true（拉 devkit splits.py）
- 数据: sahangunasekara92/nuscenes-v1-0-full-keyframes → /kaggle/input/.../v1.0-trainval/*.json（scene=850、sample=34149 已本地实拉验证）
- 预计完成: 推后 30–90 分钟（四 JSON ~3GB 载入 + 全量判据扫描）
- 收割火动作: kernels status → complete 则 output 拉 results.json/straight_ratio.csv/summary.txt/pip-freeze.txt → 完整性门 → RESULTS.md → 卡「核查记录」一行 → validate → flock commit
- push 备注（排障记录）: 首次 400 —— title 52 字符 + license "MIT" + enable_tpu 字段三者之一所致；工作配置 = 最简字段 + dataset_sources，title slug = claim id 缩写（43 字符，全 id 在本文件与本 README）；`kernel-metadata.json` 即工作版
