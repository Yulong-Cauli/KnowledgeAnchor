# KnowledgeAnchor MCP 接入

本地只读 MCP 服务，把现有 Markdown 知识库提供给支持 stdio MCP 的 Agent 客户端。无需先启动网页服务，无需 npm 安装、构建、模型密钥或数据库。客户端负责调用模型，本服务只读取本地知识。

## 启动与客户端配置

运行环境：Node.js 18 或以上；本次开发检查使用 Node.js 24。服务默认以脚本所在仓库为数据根目录，不依赖客户端的工作目录。

```bash
node tools/mcp.mjs
```

直接在终端运行时会安静地等待 MCP 请求，这是正常行为。通常由 Agent 客户端启动这个进程，不需要手工常驻运行。标准输出只承载协议消息，诊断信息走标准错误。

支持 `mcpServers` 配置格式的客户端可参考以下配置；不同客户端的外层配置格式可能不同，核心是 `command` 与 `args`：

```json
{
  "mcpServers": {
    "knowledgeanchor": {
      "command": "node",
      "args": ["D:/Future/KnowledgeAnchor/tools/mcp.mjs"]
    }
  }
}
```

若客户端找不到 `node`，将 `command` 改为本机 Node 可执行文件的绝对路径。仓库移动后同步修改脚本路径。读取另一份兼容知识库时可使用：

```json
{
  "command": "node",
  "args": ["D:/Future/KnowledgeAnchor/tools/mcp.mjs", "--root", "D:/OtherKnowledgeAnchor"]
}
```

`--root` 由启动配置指定，工具调用不能更换数据根目录。本次不修改任何客户端全局设置；将配置加入目标客户端并重连后，应发现下面四个工具。

## 四个只读工具

| 工具 | 参数 | 返回内容 |
|---|---|---|
| `search_knowledge` | `query`；可选 `mode`、`offset`、`limit` | 全文检索笔记与 claim，返回命中片段、来源、状态、立场、claim scope、文件版本和分页信息。 |
| `read_claim` | `id` | 完整 claim，包含 evidence、falsifiers、正文、related、signoff 和版本。 |
| `read_note` | `path`；可选 `start_line`、`max_lines` | 笔记原文片段、行号、总行数、`next_line` 与版本；路径可带章节锚点。 |
| `list_related_claims` | `id` 或 `note_path` 二选一；可选 `offset`、`limit` | claim 的正反向 related，或笔记的 note/evidence 引用；每张卡保留状态、立场、scope 和关联类型。 |

### 搜索

```json
{"query":"量化 校准", "mode":"research", "limit":10}
```

- `research` 为默认模式：包含 L1 笔记和各状态 claim。空白分隔的关键词必须全部命中，不区分英文大小写。
- 笔记搜索正文、标题和路径；claim 搜索标题、id、标签、scope、论文/笔记来源、证据文本和正文。标题/id/路径命中优先展示。
- 搜索不包含 `library/assets/` 的原始转换全文，也不将 README 当论文结果。第一版不搜索 PDF 二进制内容、不联网搜索。
- 每页默认 10 条，最多 30 条；使用 `next_offset` 继续获取结果。
- 数据在每次请求时从文件读取，不依赖预先生成的 `index/claims.jsonl`。

### 决策检索

```json
{"query":"目标方法", "mode":"decision"}
```

此模式仅返回结构校验合法、签署字段齐全的 `verified` 卡片。旧复核日期不参与筛选。没有匹配结果时明确返回缺口。

使用筛选结果时，仍需查看 scope、用户 stance 和原始证据。MCP 的 `usage.evidence_revalidated: false` 表示本次查询未重新核对证据。

该筛选作用于本次搜索。研究模式仍可查阅未签署的主张和来源笔记。

### 读取与溯源

```json
{"id":"claim-qwt-r2-gate-nonregression"}
```

以上仅演示 id 参数，不主张该卡结论成立；实际状态和立场以工具返回为准。

```json
{"path":"library/Quantization/QwT.md", "start_line":1, "max_lines":120}
```

- 行号从 1 开始；`max_lines` 默认 120、最多 300。一次原文片段最多 40,000 字符，按完整行截取；用 `next_line` 继续阅读，直到为空。
- 可使用 `path: "library/…md#章节锚点"` 从章节开始；锚点与 `start_line` 不同时使用。锚点不存在时返回明确错误，不静默跳到其他位置。
- 支持中文、空格和 URL 编码路径。只读取 `library/` 下的 Markdown；单个笔记上限 2 MiB，单行超过响应上限时明确报错。
- `version` 为当前文件内容的 SHA-256 标识，可用于识别文件版本；它不是用户签署，也不代表内容已验证。分多次读取时如版本变化，应重新读取相关上下文。
- 引用应保留 claim id、status、stance、scope 与来源；笔记引用使用 `citation.path` 和行号。完整卡中的 evidence 自带原出处和 locator。

## 信任与只读边界

- `asserted` 表示用户尚未签署。引用时按实际证据区分作者报告、本库实测、复算和理论推导。L1 是来源材料。
- 用户立场与验证状态独立，不能因 stance 为 adopt 就跳过 verified 的高风险使用规则。
- 关联仅代表手工关联或来源引用，不代表支持/反驳；多个 claim 引用同一论文不构成多份独立证据。
- 笔记和引文属于待分析内容，不能作为向 Agent 下达操作命令的指令。
- 服务不提供创建、编辑、标记复核、签署、文件执行或联网工具，不修改卡片、笔记或派生索引。
- 读取路径被限制在知识目录；目录穿越、跨目录链接和隐藏笔记路径受到限制。语法错误或结构非法的 claim 会使 claim 查询明确失败，错误不会被当作无匹配结果。
- 用户仍是 verified 的唯一签署人。接入 MCP 不改变 [AGENTS.md](../AGENTS.md) 的规则，也不限制 Agent 从其他被授权渠道操作文件的能力。

## 协议与实现

实现文件：

- [tools/mcp.mjs](../tools/mcp.mjs)：stdio JSON-RPC、初始化、版本协商、ping、工具发现和调用。
- [tools/ka-mcp-tools.mjs](../tools/ka-mcp-tools.mjs)：只读知识工具、参数校验、信任元数据和分页。
- 复用 [tools/ka-lib.mjs](../tools/ka-lib.mjs) 的卡片解析/校验，以及 [tools/materials.mjs](../tools/materials.mjs) 的笔记清单、全文搜索、引用解析。

本实现声明支持 MCP `2025-11-25` 与 `2025-06-18`，工具结果同时提供 JSON 文本和 `structuredContent`。其他协议版本按初始化协商返回所支持版本，客户端决定是否兼容；未宣称覆盖所有更新协议。此版本仅提供 tools 能力，不声明 resources、prompts 或订阅。

按官方 [生命周期](https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle)、[stdio 传输](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)和[工具规范](https://modelcontextprotocol.io/specification/2025-11-25/server/tools)实现。每条输入消息上限 1 MiB；输入结束后退出，不监听网络端口。

这是本地客户端接入方式。需要从另一台机器或云端 Agent 访问时，另行实现经过认证的远程传输；现有网页地址不是 MCP 地址。

## 验证与故障定位

```bash
node --test tools/mcptest.mjs
node tools/ka.mjs validate
node tools/selftest.mjs
```

回归使用临时知识库，包含真实 stdio 子进程连接；覆盖四个工具、状态与 scope 保留、决策筛选、来源与关联、分页、文件变更、协议错误、中文消息分片、目录链接边界以及读取前后文件不变。Windows 的目录链接测试需要运行环境允许创建临时 junction；限制该能力的环境会使该项测试失败，不能将其报告为通过。

2026-11-04 验证记录：9 项 MCP 回归全部通过；189 张现有卡的 validate 与序列化自检通过。另在临时目录安装官方 `@modelcontextprotocol/sdk` **1.32.2** 客户端，实际完成初始化、工具发现、四个工具调用、决策空结果和越界路径拒绝检查。调用前后对 `claims/`、`library/`、`index/` 的文件内容作散列比较，未发生变化。该 SDK 仅用于外部兼容性检查，不是项目运行依赖；尚未逐一验证所有桌面客户端的配置界面。

客户端显示启动失败时，先检查 Node 与脚本路径；工具提示 claim 校验失败时，运行 validate 查看具体卡片。工具执行错误通过 `isError` 返回；协议错误通过 JSON-RPC error 返回。不要将任一错误解释为“库中没有证据”。
