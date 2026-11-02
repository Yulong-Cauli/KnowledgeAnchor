# KnowledgeAnchor Web UI 设计文档（一期）

> 面向下游实现 Agent 的完整设计说明。目标：把"复核 claim"这件事从手工编辑 markdown 变成一个顺手的本地 Web 界面，同时不破坏仓库现有的文件即真相（file-as-source-of-truth）工作流。
>
> 本文档只描述方案，不涉及任何已实现代码。实施前请先通读 `AGENTS.md`、`README.md`、`tools/ka.mjs`、`templates/claim.md`、`schema/claim.schema.json`。

## 1. 背景与目标

KnowledgeAnchor 是双层个人研究知识库：`library/`（L1 来源层，39 篇笔记）+ `claims/`（L2/L3 判决层，114 张原子 claim 卡）。日常工作流靠 `node tools/ka.mjs validate / index / review` 和手工编辑 markdown。

**痛点**：复核 claim 不方便——要逐张打开 md 文件、对照证据、手工改 `review_due`。

**一期目标**：本地 Web 界面，覆盖"浏览 → 复核 → 编辑 asserted 卡 → 起草新卡"的完整闭环，亮/暗双主题。

**明确不做（一期）**：

- 图谱视图（论文→claim 归属图、tag 证据网络）→ 二期
- verified 签署引导流程 → 二期
- 多人协作 / 权限分级 → 搁置，仅留架构扩展点（见 §9）
- 移动端适配

**设计约束（来自用户，优先级最高）**：

1. 文件系统是唯一事实来源。界面等价于"一个更好用的编辑器"，不引入数据库或第二份数据。
2. 遵守 `AGENTS.md`：界面不允许修改 `status` 为 verified/refuted/stale 的卡（只读），不提供 status 流转入口，不触碰 `signoff`。
3. 风格：学术工具向，白底/暗底、细线、低饱和，无装饰。**不用红色制造逾期压力**——到期日只做中性展示与排序。
4. 成本敏感：零 npm 依赖、零构建步骤、原生 JS。

## 2. 技术选型

| 项 | 决策 | 理由 |
|---|---|---|
| 运行时 | Node.js ≥ 18（与 `ka.mjs` 一致） | 已有工具链同环境 |
| 服务端 | 原生 `node:http`，零依赖 | 数据量极小（114 卡 / 索引 108 KB），无需框架 |
| 前端 | 原生 HTML/CSS/JS，无框架无构建 | 三个视图 + 一个详情页，框架是过度工程 |
| 解析 | 复用 `ka.mjs` 的 YAML 子集解析器（见 §3.2） | 保证与 CLI 行为一致 |
| 端口 | 默认 `127.0.0.1:4780`，`--port` / `--host` 可配 | 默认仅本机回环，安全 |

## 3. 服务端设计

### 3.1 目录结构（新增/改动）

```
tools/
  ka.mjs            # 现有 CLI，改为从 ka-lib.mjs 导入（见 §3.2 重构说明）
  ka-lib.mjs        # 【新增】解析/校验/索引的共享库
  serve.mjs         # 【新增】Web 服务入口：node tools/serve.mjs
web/                # 【新增】前端静态文件，由 serve.mjs 托管
  index.html
  app.js
  styles.css
```

### 3.2 ka.mjs 重构（实施第一步）

`ka.mjs` 目前是"导入即执行"的脚本，无法被 `serve.mjs` 复用。实施时先做最小重构：

1. 新建 `tools/ka-lib.mjs`，把以下纯函数原样移出并导出：`parseFrontmatter`、`splitBody`、`loadClaims`、`validateClaims`、`buildIndex`、`todayString`、常量（`STATUSES`、`STANCES`、`CLAIM_ID` 等）。
2. `ka.mjs` 改为从 `ka-lib.mjs` 导入，CLI 行为（`validate / index / review / viz`）保持不变——这是回归红线：重构后四条命令输出与重构前一致。
3. `serve.mjs` 从 `ka-lib.mjs` 导入，**不在服务进程外另起 CLI 子进程**（validate/index 直接调函数）。

### 3.3 序列化器（本项目的核心技术风险）

读解析已有，但**写回需要一个此前不存在的 frontmatter 序列化器**。要求：

- 输出风格与现有卡片一致：`tags`/`related` 用行内数组（`tags: [a, b]`），`evidence`/`falsifiers` 用块数组，字符串按需加双引号（含冒号、井号、引号、首尾空格时），`signoff: null` 保持字面 `null`。
- 字段顺序固定为模板顺序：`id, title, type, status, scope, tags, note, paper, stance, evidence, falsifiers, review_due, related, signoff`。
- **往返保真验收测试**：对 `claims/` 全部 114 张卡执行"解析 → 序列化"，与原文逐字节比较，未修改的卡必须零 diff。这条不过，写功能不许交付。
- 正文（frontmatter 之后部分）原样保留，编辑时整体替换，不做任何重排。

### 3.4 写回管线

所有写操作走同一条管线：

```
接收请求 → 权限检查（§9 预留，一期恒放行）
  → 校验目标卡 status == asserted（编辑类操作）
  → 内存中构造新文件内容
  → 调用 lib 的 validateClaims 对"假设写入后的全集"做预校验
  → 预校验失败：不写盘，返回全部错误
  → 预校验通过：原子写入（写 claims/.<id>.tmp → rename 覆盖）→ 调 buildIndex 重建索引
  → 返回最新卡片数据
```

并发：单用户本地使用，但仍用一个 promise 队列串行化所有写请求，避免与手工编辑/git 操作撞车时的部分写入。

### 3.5 API 契约

全部 JSON。写请求必须带 `actor` 字段（字符串；一期前端固定发 `"local"`），服务端对所有写操作记录 `actor`——这是协作扩展的唯一预留（见 §9）。

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/meta` | 状态计数、tag 计数、复核队列计数、今日日期 |
| GET | `/api/claims?status=&stance=&tag=&q=&sort=` | 列表（摘要字段，同 index.jsonl 结构） |
| GET | `/api/claims/:id` | 完整卡：frontmatter 全字段 + 正文 |
| GET | `/api/note?path=library/...` | 笔记原文（详情页内联预览用）；路径必须限制在 `library/` 内，防目录穿越 |
| PUT | `/api/claims/:id` | 编辑 asserted 卡。Body: `{actor, patch}`。可编辑字段白名单：`title, scope, tags, note, paper, stance, evidence, falsifiers, review_due, related, body`。**禁止**：`id, type, status, signoff` |
| POST | `/api/claims` | 起草新卡。Body: `{actor, ...全字段}`。校验 id 格式（`CLAIM_ID` 正则）、id 不与现有卡冲突、文件名=id |
| POST | `/api/claims/:id/reviewed` | "标记已复核"。Body: `{actor}`。语义见 §3.6 |
| POST | `/api/claims/:id/postpone` | 顺延。Body: `{actor, days}`，`review_due = today + days` |

错误响应统一 `{error: string, details?: string[]}`，HTTP 400（校验失败）/ 403（只读卡）/ 404 / 409（id 冲突）。

### 3.6 "标记已复核"的语义（需用户最终确认）

一期定义：**`review_due = 今天 + 90 天`，其余字段不动**。它只表达"我看过了，下次再说"，不改变 status（是否 verified 永远由用户手工签署）。90 天的默认值做成 `serve.mjs` 的常量 `REVIEW_INTERVAL_DAYS`，方便调整。

## 4. 前端视图

路由用 hash（`#/queue`、`#/claims`、`#/claim/:id`、`#/new`），无刷新切换。整体布局：顶栏 + 左栏（筛选）+ 主区，与已确认的线框一致。

### 4.1 顶栏（所有视图共享）

- 左：产品名 `KnowledgeAnchor`；导航：复核队列 / 全部 Claim / 图谱（置灰，标"二期"）
- 右：搜索框（标题/id/tag 模糊匹配，作用于当前视图）、主题切换按钮（☾/☀）

### 4.2 复核队列（默认视图）

数据源逻辑与 `ka.mjs review` 完全一致：`asserted` + `stale` 全部入队；`verified` 仅当 `review_due <= 今天` 入队。排序：`review_due` 升序（空值排最后），并列按 id。

- 卡片行：标题 + status 徽章 + stance 徽章 + 到期日（**中性灰色文字**，如"到期 2026-11-20"；过期的写"已于 2026-10-03 到期"，同样中性色，不标红、不提醒天数）+ tags 摘要。
- 首条卡片默认展开：显示第一条证据的 quote + locator，操作按钮：**标记已复核**（主按钮）/ 编辑 / 打开详情 / 顺延 30 天。
- 左栏：状态筛选（复选）、tag 列表（点击筛选）、待复核计数。
- 空态：队列清空时显示一句安静的话即可，不庆祝、不炫耀。

### 4.3 全部 Claim

- 左栏筛选同 4.2；主区为紧凑列表（每行：标题、status、stance、review_due、tags）。
- 点击行进详情。支持搜索框实时过滤。

### 4.4 Claim 详情页

左栏（阅读）/ 右栏（编辑）两列，与暗色线框一致。

**左栏**：

- 头部：返回链接、标题、status + stance 徽章。
- meta 区：paper、来源笔记（`note` 字段，点击内联展开笔记对应锚点内容，调 `/api/note`）、scope。
- 证据：逐条渲染 quote（引用块样式）+ locator + relation。
- Falsifiers：列表。
- 关联 claim：chip 列表，点击跳对应详情。
- 正文三个 `##` 小节（我的理解 / 待验证 / 若成立…）用最简 markdown 渲染（标题、加粗、行内代码、链接、列表；**必须先 HTML 转义**，不引入第三方渲染库）。

**右栏（编辑面板）**：

- `status == asserted`：表单可编辑——title、stance（下拉）、review_due（日期）、tags（逗号分隔输入）、scope、paper、note、related；evidence / falsifiers 用结构化列表编辑器（每行 source/locator/quote/relation 四字段，可增删行）；正文为一个 markdown textarea。
- 保存按钮：文案"保存 → 自动校验"。保存后走 §3.4 管线；校验失败时错误逐条显示在面板顶部，文件未被写坏。
- `status != asserted`：整个右栏替换为只读说明："此卡为 verified/refuted/stale，不可在界面编辑。"无表单。

### 4.5 新建 Claim

- 表单基于 `templates/claim.md` 的字段与正文三节结构。
- id 输入框实时校验 `CLAIM_ID` 正则并提示命名规则（`claim-<论文或方法>-<结论>`，kebab-case，≤80 字符）。
- 创建成功跳详情页。创建即 `status: asserted`、`signoff: null`，不提供其他选项。

## 5. 主题系统

- CSS 自定义属性实现，`:root[data-theme="light"]` / `[data-theme="dark"]` 两套 token。
- 顶栏切换按钮；选择写入 `localStorage("ka-theme")`；首次访问跟随 `prefers-color-scheme`。
- 全部颜色必须走 token，组件里禁止硬编码色值（暗色才不会漏）。

Token 表（低饱和、细线；实现时可微调但保持气质）：

| Token | Light | Dark | 用途 |
|---|---|---|---|
| `--bg` | `#F7F7F8` | `#171717` | 页面底 |
| `--surface` | `#FFFFFF` | `#1F1F1F` | 卡片 |
| `--surface-muted` | `#EFEFF2` | `#262626` | 引用块/嵌套区 |
| `--text` | `#171717` | `#E5E5E5` | 正文 |
| `--text-muted` | `#52525B` | `#A1A1AA` | 次要文字、到期日 |
| `--border` | `rgba(23,23,23,.12)` | `rgba(229,229,229,.12)` | 全部描边（1px 细线） |
| `--brand` | `#0F7B4C` | `#32F08C` | 主按钮、激活态 |
| `--c-asserted` | `#92610E` | `#E8B04B` | status 徽章（低饱和琥珀） |
| `--c-verified` | `#1E7B4F` | `#4CC38A` | status 徽章 |
| `--c-refuted` | `#9E3B3B` | `#E06C6C` | status 徽章 |
| `--c-stale` | `#6B7280` | `#9CA3AF` | status 徽章 |

排版：正文 14px/20px，标题 16px/24px 中等字重，元信息 12px/18px；id/路径用等宽字体 13px。圆角：卡片 12px、控件 8px、徽章全圆角。间距取 4/8/12/16/20/24。

## 6. 与现有 `ka.mjs viz` 的关系

`node tools/ka.mjs viz` 生成的 `index/view.html`（只读静态页）继续保留，作为"无服务快照/可分享的只读导出"。新 Web UI 是日常主界面。两者共存，不互相依赖。一期不改动 `viz`。

## 7. 实施顺序（建议）

1. `ka-lib.mjs` 重构 + CLI 回归验证（四条命令输出不变）
2. 序列化器 + 往返保真测试（114 卡零 diff）
3. `serve.mjs`：静态托管 + 全部 GET API
4. 前端：队列视图 + 主题切换（此刻即可日常只读使用）
5. 写 API + 详情页编辑面板 + 新建
6. 笔记内联预览、体验打磨

## 8. 验收标准

- [ ] `node tools/ka.mjs validate/index/review/viz` 输出与重构前一致
- [ ] 往返保真：114 卡解析→序列化零 diff
- [ ] 编辑保存后 `validate` 自动通过；构造非法输入时写盘被拒绝且文件未变
- [ ] verified/refuted/stale 卡在前端无任何编辑入口；API 层同样拒绝（403）
- [ ] 队列排序与 `ka.mjs review` 结果一致
- [ ] 亮/暗主题切换即时生效、刷新后保持；暗色下无未换肤的硬编码颜色
- [ ] 全程无 npm install（`node tools/serve.mjs` 裸跑）

## 9. 协作扩展预留（一期不实现，仅约束代码组织）

用户设想中的终态：服务部署到服务器，权限分级（owner > 可添加 > 可评价 > 只读）。一期为此只留三个不花成本的扩展点：

1. **`actor` 贯穿写路径**：所有写 API 接收 `actor`，服务端写操作的唯一入口是 `handleWrite(actor, action, payload)`。将来鉴权中间件只需挂在这一个函数前，把"身份 → 允许的 action 集合"映射成放行/拒绝。
2. **前端不碰文件**：前端只调 API，将来后端从本地文件换成多人服务时前端零改动。
3. **不加登录、不改 schema**：复核意见、多人签署等字段等协作方案想清楚后再动 `AGENTS.md` 和 claim schema，届时加字段向后兼容。

## 10. 二期路线（备忘，不在本期实施）

- 图谱视图：论文→claim 归属图（library 笔记为源节点辐射 claim，颜色编码 status）；tag 证据网络（related 关系图）
- verified 签署引导：填 method（read/reproduced/cross-checked）+ evidence_hash，写 `signoff`，仍仅用户本人身份可用
- 队列的分组/批量顺延
- 移动端只读
