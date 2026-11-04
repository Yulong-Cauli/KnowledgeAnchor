# 本地阅读组件

只将发布包中的浏览器构建、许可证与 KaTeX 字体复制到此目录，不需要 npm 安装、前端构建或运行时 CDN。

| 组件 | 固定版本 | 用途 | 来源 / 许可证 |
|---|---|---|---|
| markdown-it | 15.0.3 | Markdown、标准表格与列表解析 | [官方项目](https://github.com/markdown-it/markdown-it) · [MIT](markdown-it/LICENSE) |
| KaTeX | 0.19.1 | 数学公式与本地 woff2 字体 | [官方项目](https://github.com/KaTeX/KaTeX) · [MIT](katex/LICENSE) |

发布包 URL 与 SHA-512 完整性值保存在 [manifest.json](manifest.json)，引入时已核对发布包字节。Markdown 配置 `html: false`；只额外解析图片和简单居中容器，不执行任意 HTML。KaTeX 配置 `trust: false`、展开次数/尺寸上限；URL 另经阅读器的路径与协议过滤。

更新时从上述官方 npm 包取得指定版本，核对 `dist.integrity` 后替换对应静态文件与许可证，并运行 `node tools/readertest.mjs` 及网页验收。不要手工编辑压缩后的第三方代码。
