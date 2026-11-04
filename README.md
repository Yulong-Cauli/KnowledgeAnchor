# KnowledgeAnchor

一个双层、分信任等级的个人研究知识库。目标不是收集摘要，而是记录：这条知识从哪来、我验证到什么程度、在什么条件下可用。

论文与通用笔记保存在 `library/`，可证伪的判断保存在 `claims/`。本地网页提供资料目录、全文检索、笔记阅读、今日复核、编辑与关系图谱；Markdown 文件是唯一数据源，索引和网页视图都由文件派生。

**只有用户本人能把 claim 标记为 `verified`。网页里的“本次处理完成，下次 90 天后”只调整复核日期，不代表验证通过。**

## 快速开始

需要本机安装 Node.js。服务端仅使用 Node.js 内置模块；前端渲染库已固定版本并本地托管，无需安装 npm 依赖、无需构建或运行时 CDN。在仓库根目录运行：

```bash
node tools/ka.mjs validate
node tools/serve.mjs
```

打开 [http://127.0.0.1:4780/](http://127.0.0.1:4780/)，默认进入资料页。服务默认只监听本机，可在启动终端按 `Ctrl+C` 停止。

仅浏览时使用只读模式：

```bash
node tools/serve.mjs --readonly
```

可通过 `--port 4781` 更换端口，通过 `--host <本机可访问的地址>` 指定监听地址。手机访问需要服务监听手机可达的地址，并放通对应网络与端口；建议另开只读实例，例如在受信任的局域网或私有网络中运行：

```bash
node tools/serve.mjs --host 0.0.0.0 --port 4781 --readonly
```

手机打开 `http://<电脑在该网络中的 IP>:4781/`。当前服务没有登录认证；可写实例应保持本机访问，不要直接暴露到公网。`--readonly` 会在服务端拒绝写请求，并在网页隐藏写入操作。

## 网页端怎么用

### 资料、搜索与阅读

默认入口 [资料](http://127.0.0.1:4780/#/materials) 从现有 `library/` 目录生成笔记清单，按分类浏览，不需要另外维护目录。`library/README.md` 标为目录入口；默认排除 `library/assets/` 内的论文转换全文。

- 搜索覆盖笔记的标题、路径、正文，以及 claim 的 id、title、tags、scope、证据与正文。多个关键词以空白分隔，要求全部命中，不区分英文大小写；关键词可以分布在不同字段。
- 结果区分“来源笔记 L1”和“Claim”，显示路径、命中片段；claim 保留 status 与 stance，asserted 明示“尚未独立验证”。笔记分类只筛笔记，侧栏状态/tag 只筛 claim。
- 点击笔记进入只读阅读页，尽可能定位命中章节。支持六级标题、段落、嵌套列表、引用、代码块、标准 Markdown 表格、行内/块级 LaTeX 数学、图片、章节目录和锚点。
- 表格和长公式在局部横向滚动；图片保持比例，点击或按 Enter 放大。相对链接按笔记目录解析，区分笔记、claim、图片/PDF、外部链接。含空格的 Markdown 链接需使用标准的尖括号语法或 URL 编码。
- 笔记旁按 `note` 与 `evidence.source` 显示引用该笔记的 claim，去锚点、规范路径并去重，标明“主要来源 / 证据引用”；不按标题相似或 tag 自动关联。每项保留状态、立场和限定条件。引用关系不表示结论已被证实。
- 笔记与 claim 都提供源文件入口。未提供的原论文/PDF 链接不会猜测补齐；原笔记已有的 PDF 链接可直接打开。返回上一页或使用浏览器返回可找回当前页面会话中的关键词、筛选和阅读位置；整页刷新后不恢复搜索会话。

每次资料检索、阅读请求都重新读取文件；顶部“刷新”同时刷新 claim 列表和计数。Markdown 文件仍是唯一持久知识源，网页不编辑 `library/`。

渲染不执行嵌入脚本，不加载危险协议；资源接口只读 `library/` 内允许类型、`claims/` 与 `nightshift/` 中的 Markdown 真实文件（后者用于已有核查材料引用），拒绝越界路径与指向目录外的符号链接。任意 HTML 排版不执行，仅兼容笔记常见的安全图片/居中容器；仓库自有 GitHub 插图链接使用已有本地素材。其他远程图片仍需要网络。Markdown 与公式库的固定版本、来源、许可证及校验值见 [web/vendor/README.md](web/vendor/README.md)。

### 今日复核与全部 Claim

| 入口 / 分类 | 纳入规则 |
|---|---|
| 今日复核 `/#/queue` → 今日待办 | asserted 且 `review_due <= 服务端今天`。 |
| 以后处理 | asserted 且日期在未来。 |
| 未安排 | asserted 且没有 `review_due`。 |
| 全部未验证 | 全部 asserted，与今日工作量分开。 |
| 待用户处理 | 全部 stale，以及到期（含今天）的 verified；只读。 |
| 全部 Claim `/#/claims` | 全部状态，含 refuted。 |
| 新建 `/#/new` | 顶部“新建 claim”入口；只读实例隐藏入口并拒绝写入。 |

列表支持状态多选、单 tag、全文关键词筛选，以及到期日/id/标题/状态排序。tag 面板可搜索、按数量或名称排序，默认前 30 个，可展开全部；两个 claim 列表的排序分别保存在浏览器。侧栏与分类按钮显示全库数量，标题明确标注筛选后的数量。“筛选无结果”和此分类没有待办使用不同提示。

调度写入仅适用于 asserted：

| 操作 | 实际效果 |
|---|---|
| 本次处理完成，下次 90 天后 | `review_due = 服务端今天 + 90 天`。 |
| 顺延 30 天 | `review_due = 服务端今天 + 30 天`，不在旧日期上累加。 |
| 今天处理 | 在其他 asserted 分类中主动把处理日期设为服务端今天。 |
| 编辑下次处理日期 | 可自选日期，清空则回到未安排。 |

处理或顺延后，卡片立即退出今日待办，刷新仍然如此，能在以后处理/全部未验证找到。单纯浏览不写日期；调度不改 status、stance、signoff，也不自动添加“已核对原文”等核查事实。若需记录核查经过，由操作者在卡片正文填写实际完成的事项。

现有未来日期不回填；今日为空是合理结果，可以主动查看未安排或全部未验证。`node tools/ka.mjs review` 保持原有的**完整待关注清单**语义（全部 asserted/stale 及到期 verified），与网页今日待办不同。

### 详情、编辑与起草

详情默认阅读，展示状态、立场、限定条件、证据引文与定位、可推翻条件、关联 claim 和正文。来源笔记及可解析的证据源可点击；“展开笔记”保留快速阅读能力。显式点击“编辑这张卡”后才显示表单。

可写实例中的 asserted 卡可编辑标题、立场、下次处理日期、tags、scope、paper、note、related、证据、falsifiers 和正文；仅提交实际修改的字段。id、type、status、signoff 不可编辑；verified/refuted/stale 完全只读。新卡固定 asserted、signoff: null，默认立场 watch、下次日期为服务端今天 + 90 天，可清空为未安排。

创建时校验“已有集合 + 新候选”，保存时校验“替换目标后的完整集合”，包括 id/文件名、必填非空白文本、完整证据、可推翻条件、有效日期、来源文件和关联 id。已有库非法时也会拒绝写入。校验失败不写卡片或索引，表单保留输入并显示错误；成功后原子写入卡片并重建索引。若卡片写入后索引重建失败，明确提示部分保存及重建方法，不报告完整成功。

切换页面或取消编辑时，页内对话框保护未保存输入；关闭/刷新浏览器使用原生离开提示。不提供完整草稿恢复。保存附带文件版本检查：若在表单打开后被外部编辑，返回冲突并保留输入，请重新读取后手动合并。该检查不能代替跨进程文件锁；检查与落盘间仍有很小的外部写入竞态，不支持多客户端协作。

### 图谱

桌面端的“图谱”入口（`/#/graph`）提供两种视图：

- **论文归属图**：根据 claim 的 `note` 字段连接来源笔记与 claim，同时显示 `related` 连边；只包含被 claim 引用的笔记，不是整个 `library/` 的目录图。
- **关联网络**：显示参与 `related` 关系的 claim 及其连边。

节点按 claim 状态着色，笔记用方形标识。支持状态/tag 筛选和标题/id 搜索、拖动节点、拖拽空白处平移、滚轮缩放及重新布局。悬停查看信息，点击 claim 打开详情，点击笔记节点切换关联高亮。

图谱中的边表示笔记归属或手工填写的关联，不代表主张已被验证或相互支持。

### 手机与主题

手机窄屏下，顶部“搜索”按钮展开搜索框，“筛选”按钮打开侧栏抽屉；详情页采用单列布局。图谱暂未适配移动端，请在桌面查看。

页面提供亮/暗主题，初次访问跟随系统，手工选择保存在当前浏览器中。仓库包含 Web App manifest 与主屏幕图标，可通过浏览器的“添加到主屏幕”等入口使用；当前没有离线缓存，访问时仍需服务运行且网络可达。

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
3. 做一次独立验证（复现、交叉来源、自测），**由用户本人手工编辑** claim 文件，填写 `signoff.by / at / method / evidence_hash` 并改为 `verified`；`method` 可用 `read / reproduced / cross-checked`，同时设置 `review_due`。Agent 不得代填或代签，网页与 CLI 都没有 verify 操作。
4. `node tools/ka.mjs review` 查看待审/到期条目；`node tools/ka.mjs index` 生成 Agent 可读索引。

## Claim 命名

`id` 采用 `claim-<slug>`，slug 是描述内容的小写英文 kebab-case，例如 `claim-qwt-r2-gate-nonregression`。

- 用论文/方法 + 具体结论或机制命名，不用流水号；`tags` 负责分类，`id` 负责可读和可检索。
- 只用小写 ASCII 字母、数字和连字符；`claim-` 后以字母开头，总长不超过 80 字符；文件名必须与 id 相同（`claims/<id>.md`）。
- id 是永久句柄：一旦提交或被 `related` 引用，即使标题、scope 调整也不要改名。主张被替换时新建一条 claim 并在 `related` 中关联旧条目，由用户处理旧条目的 `refuted`/`stale` 状态。
- 撞名时不要加 `-2`，用限定词区分范围，例如 `claim-qwt-r2-gate-calibration` 与 `claim-qwt-r2-gate-testset`；若无法区分，说明两条应合并。

## Agent 怎么用

Agent 可以检索 `library/` 与 `claims/`，但引用时必须携带 claim id / 来源、`status` 和 `stance`：

- `asserted` → “论文声称 / 尚未验证”
- `verified` → “已由本人验证（方法：…，日期：…）”
- 高风险决策只允许使用 `verified`。

Agent 只能起草/修改 `asserted` 条目；不得修改 `verified / refuted / stale` 卡或任何 `signoff`，不得代为升级状态。`library/` 的改动须有用户授权。详见 [AGENTS.md](AGENTS.md)。

## 目录

| 路径 | 用途 |
|---|---|
| [`library/`](library/) | L1 来源笔记；分类索引与笔记约定见 [library/README.md](library/README.md)。 |
| [`library/assets/`](library/assets/) | 论文插图、表格截图与原始转换素材。 |
| [`claims/`](claims/) | 带 YAML 元数据的原子 claim 卡，状态以卡片文件为准。 |
| [`templates/claim.md`](templates/claim.md) / [`schema/claim.schema.json`](schema/claim.schema.json) | 卡片模板与结构定义。 |
| [`web/`](web/) | 本地网页的页面、样式、交互与图标资源。 |
| [`tools/`](tools/) | CLI、网页服务、共享解析/校验逻辑、自检与素材检查。 |
| `index/` | 派生的 `claims.jsonl` 与静态 `view.html`；已被 Git 忽略，可重新生成。 |
| [`nightshift/`](nightshift/) | 分班任务队列、日志、报告、草稿、交叉对比与核验材料；核验报告不等于用户签署。 |
| [`TODO.md`](TODO.md) | 工作清单；若内容与实际文件不一致，以实际文件为准。 |

## 工具

```bash
node tools/ka.mjs validate   # 校验 claim 结构与链接
node tools/ka.mjs index      # 生成 index/claims.jsonl
node tools/ka.mjs review     # 列出待验证/到期条目
node tools/ka.mjs viz        # 生成静态 index/view.html
node tools/serve.mjs         # 启动可读写的本地网页
node tools/serve.mjs --readonly  # 启动只读网页
node tools/mcp.mjs           # 启动供 Agent 客户端连接的只读 MCP（stdio）
node --test tools/mcptest.mjs  # MCP 协议与知识读取回归
node tools/selftest.mjs      # 检查 claim 解析/序列化往返及字段保留
node tools/webtest.mjs       # 隔离目录中检查真实创建/保存/调度/资源接口
node tools/readertest.mjs    # 检查 Markdown、公式、图片与链接过滤
node tools/check-materials.mjs   # 检查笔记与素材目录、图片引用的一致性
```

`viz` 生成的是可直接打开的静态浏览快照；文件变更后需重新生成，不提供在线编辑。`serve.mjs` 提供实时读取文件的网页服务，启动前无需先运行 `index` 或 `viz`。

`validate` 检查必填字段、id/文件名、状态与立场、证据路径、关联 id、日期及 verified 的签署字段；它不判断原文引文是否准确，也不证明主张成立。`check-materials` 在素材目录无法匹配笔记或预期素材目录缺失/为空时返回失败，单独的未引用图片只作报告；加 `--verbose` 查看明细。

## Agent 通过 MCP 接入

只读 MCP 提供全文搜索、完整卡片读取、笔记读取和关联查询四个工具。由支持 stdio 的 Agent 客户端启动 `tools/mcp.mjs`，无需先运行网页；启动配置、参数与信任边界见 [MCP 接入说明](docs/mcp.md)。

返回结果携带状态、立场、适用范围与来源；`decision` 检索仅纳入已签署且未到复核日期的 verified 候选，没有匹配时明确返回缺口。MCP 不提供写入或签署能力，知识状态仍由用户掌握。

## 说明

`library/` 最初来自 `D:\Research\Notes`，迁移时保留了原 Git 历史且未修改原仓库。当前论文与通用笔记索引见 [library/README.md](library/README.md)。
