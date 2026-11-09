# Agent 规则

本仓库是个人研究知识库，核心约束是：**只有用户本人能把 claim 标记为 verified。**

## 可读

- `library/`：论文笔记（L1，内容归论文）。
- `claims/`：claim 卡（L2/L3）。
- `index/claims.jsonl`：派生索引，可重建。

## 可写

- 可以创建或修改 `claims/` 中 `status: asserted` 的卡片。
- 可以创建和修改 `experiments/` 下的实验代码与结果（约定见 `experiments/README.md`）；实验数字必须如实记录，失败与反例同样入库，不得先有结论再凑数据；实验不改变任何 claim 的 status；数据集、checkpoint 等大文件不得入 git。
- 可以建议修改 `library/` 笔记，但未经用户同意不要直接改。
- 不得修改任何 `status: verified / refuted / stale` 的 claim；不得修改 `signoff`。
- 不得把 `asserted` 改为 `verified`；本仓库没有供 Agent 使用的 verify 命令。

## 引用规则

1. 使用知识时必须保留 claim 的 `status` 和 `stance`，并给出 claim id / 来源。
2. `asserted` 表示用户尚未签署。引用时按实际证据说明是作者报告、本库实测、复算还是理论推导。有影响结论的核查缺口时，说明缺的是哪项证据。
3. 高风险决策（选型、部署、写进方案）只使用 `verified`。
4. 不要编造 source、locator、quote；证据不足时保持 `asserted` 并说明缺口，不为补齐栏目编凑可推翻条件。

## 起草 claim

- `id` 用 `claim-<论文或方法>-<结论>` 的小写 kebab-case（如 `claim-qwt-r2-gate-nonregression`），文件名必须与 id 相同；已提交或被引用的 id 不得改名。
- 一条 claim 只写一个明确、可核查的判断或统计结论，不写“某方法很好”这类评价；评价放进 `stance` 和正文。
- 必须写 `scope`（数据集/模型/硬件/条件）。统计记录不强制设置 `falsifiers`；有明确待检验预测的主张再填写具体的可推翻条件。不把“数据或代码有错就重算”等通用要求凑成可推翻条件。
- 证据优先链接 `library/` 中的笔记，并给出章节/页码和原文引文。
- 完成后运行 `node tools/ka.mjs validate`。

## 用户确认

`verified` 只能由用户手工签署。用户可在本机可写网页点击「签署」并确认，或手工编辑源文件。`signoff` 填写 `by`（签署人）和 `at`（签署日期）。证据由 `evidence` 定位。签署后结束复核排程。Agent 不得代填或调用签署入口。
