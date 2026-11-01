# KnowledgeAnchor

一个双层、分信任等级的个人研究知识库。目标不是收集摘要，而是记录：这条知识从哪来、我验证到什么程度、在什么条件下可用。

## 两层

- `library/` — **L1 来源层**：从论文、教材、博客等来源整理的知识，记录来源说了什么、怎么推导。论文笔记和数学基础都在这一层；来源类型不改变 L1 状态，统一表示“尚未由我独立验证”。
- `claims/` — **L2/L3 判决层**：原子 claim 卡。每条一句可证伪的主张，带证据指针、适用范围、我的立场和复核日期，记录“我愿意据此行动”的判断。

`library/` 是“来源与知识”，`claims/` 是“敢不敢用”。一条笔记可以提炼出多条 claim；一条 claim 也可以引用多篇笔记。

## 信任等级

| 等级 | 位置 | 含义 |
|---|---|---|
| L1 | `library/` | 从来源整理，尚未由本人独立验证；可用于定义/背景查询 |
| L2 asserted | `claims/`，`status: asserted` | 已抽成可检验主张，尚未独立验证 |
| L3 verified | `claims/`，`status: verified` | 有独立证据并由本人签署 |
| refuted / stale | `claims/` | 被推翻或过期，保留可追溯 |

“好不好用”是独立的一轴：`stance: adopt | trial | watch | avoid`。一条 claim 可以是真的，同时被你标成 `avoid`。

教材里的经典定义、定理和公式通常停在 L1：它们是查询和推导的工具，不是需要复现的实证 claim。只有当某条知识变成你愿意据此做选型、部署或写方案的判断时，才把它提炼成 claim，并写清 `scope` 与 `falsifiers`。

## 来源头

`library/` 的论文笔记沿用原来的三行头（出处会议 / 是否开源 / 关键词）。教材、数学与通用笔记在标题下加一行：

**类型：** 通用基础 / 特定来源 / 综述

- **通用基础**：定义、标准定理、常见公式，不要求指定单一书目，不写 `来源`。
- **特定来源**：某个方法、实验结论或非标准约定，必须写 `来源`（书名 + 版次 + 章节，或论文/URL）；混合笔记把来源放到对应小节。
- **综述**：综合多份来源，参考文献列在文末。

这类笔记默认停留在 L1：可用于定义、背景和公式查询；涉及选型或部署的结论仍需落到 `verified` claim。

## 一条 claim 的生命周期

1. 读论文或教材，写/更新 `library/` 笔记（L1）。
2. 从笔记里提炼 claim，`status: asserted`，写清 `scope`、`evidence`、`falsifiers`、`stance`。
3. 做一次独立验证（复现、交叉来源、自测），在 `signoff` 记录方法、日期和证据 hash，改为 `verified`。
4. `node tools/ka.mjs review` 查看待审/到期条目；`node tools/ka.mjs index` 生成 Agent 可读索引。

## Claim 命名

`id` 采用 `claim-<slug>`，slug 是描述内容的小写英文 kebab-case，例如 `claim-qwt-r2-gate-nonregression`。

- 用论文/方法 + 具体结论或机制命名，不用流水号；`tags` 负责分类，`id` 负责可读和可检索。
- 只用小写 ASCII 字母、数字和连字符；文件名必须与 id 相同（`claims/<id>.md`）。
- id 是永久句柄：一旦提交或被 `related` 引用，即使标题、scope 调整也不要改名。主张被替换时新建一条 claim 并在 `related` 中关联旧条目，旧条目改为 `refuted`/`stale`。
- 撞名时不要加 `-2`，用限定词区分范围，例如 `claim-qwt-r2-gate-calibration` 与 `claim-qwt-r2-gate-testset`；若无法区分，说明两条应合并。

## Agent 怎么用

Agent 可以检索 `library/` 与 `claims/`，但引用时必须携带状态：

- `asserted` → “论文声称 / 尚未验证”
- `verified` → “已由本人验证（方法：…，日期：…）”
- 高风险决策只允许使用 `verified`。

Agent 只能起草/修改 `asserted` 条目，不能把状态改为 `verified`、`refuted` 或 `stale`。详见 `AGENTS.md`。

## 工具

```bash
node tools/ka.mjs validate   # 校验 claim 结构与链接
node tools/ka.mjs index      # 生成 index/claims.jsonl
node tools/ka.mjs review     # 列出待验证/到期条目
```

## 说明

`library/` 来自 `D:\Research\Notes`，保留了原 git 历史；原仓库未改动。旧的论文索引在 `library/README.md`。
