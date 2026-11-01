# 建议：library/README.md 补充 ADe2e 小节

- 提出日期：2026-11-02
- 提出者：nightshift 子代理（BEV-Planner 整理任务）
- 现状：`library/ADe2e/` 已存在（内含 `BEV-Planner.md`，以及 `UniAD/`、`AutoVLA/` 两个目前只放表格截图 `.png` 的子目录），但 `library/README.md` 的「📂 目录结构」表与正文小节均未收录 ADe2e。

## 建议追加 1：目录结构表加一行

位置：`## 📂 目录结构` 表内，插在 `3D_Occupancy/` 行之后、`QA dataset/` 行之前（格式照抄该表现有三列）：

```
| [`ADe2e/`](ADe2e) | 端到端自动驾驶 | 1 |
```

> 篇数按现有 `.md` 笔记计为 1（仅 `BEV-Planner.md`）；`UniAD/`、`AutoVLA/` 子目录目前只有截图、没有笔记，若后续补齐应同步更新篇数。

## 建议追加 2：正文新小节「端到端自动驾驶」

位置：`## 3D 占用预测` 小节之后、`## 驾驶 VQA` 小节之前。小节引导句与表格格式照抄其他小节（`| 论文 | 出处 | 关键词 | 代码 |` 四列）：

```markdown
## 端到端自动驾驶

关于开环端到端自动驾驶与规划评测的笔记。

| 论文 | 出处 | 关键词 | 代码 |
| --- | --- | --- | --- |
| [BEV-Planner](ADe2e/BEV-Planner.md) | CVPR 2024 | 端到端自动驾驶、开环评测、ego status、nuScenes、路沿碰撞率 (CCR) | [NVlabs/BEV-Planner](https://github.com/NVlabs/BEV-Planner) |
```

## 备注

- 关键词与笔记头部三行的「关键词」保持一致，便于横向检索。
- 代码列链接以论文摘要页原文为准："Code and models are available at https://github.com/NVlabs/BEV-Planner."（arXiv:2312.03031，抓取于 2026-11-02）。
- 本文件仅为建议，未改动 `library/README.md`（遵守 RULES.md：不修改 README，由主人决定是否采纳）。
