# STATE — K-probe-2（ka-verify-probe-rayiou-nf4-flops）

- **2026-11-09 收回 v3，部分完成。** Kaggle 状态为 `COMPLETE`。P1 合成对照和 P3 论文算术已归档，P1b 的官方评测器核对仍有缺口。
- **P2 NF4 阻塞。** v3 下载了源码，执行时遇到相对导入错误，四项数值均未产出。两次修复额度已用完。
- 预注册为 `eafa8a0`。分项结果、环境快照和校验记录见 [RESULTS.md](RESULTS.md)。

## v4 修复配方（2026-11-10 00:4x 主人授权修复 1 次，待火次执行）

真源码：sha256 `520a9e9d3afba11124734df60e48a27e38b6389305df888834405b435e285817`（v3 kernel 内实抓，metrics.json 在案）。获取：`kaggle kernels output cauliyulong/ka-verify-probe-rayiou-nf4-flops --file-pattern "results/nf4/*"` 重拉，或用主会话暂存 `/tmp/ka-nf4v3out/results/nf4/bnb_functional_fetched.py`（同机；/tmp 被清则走重拉）。

**两个 bug（v3 实测，均须修）：**

1. **L18 `from .cextension import lib` 相对导入**——v2/v3 stub 只盖了 L16 绝对导入。修法：exec 命名空间改包内 + sys.modules 预置三模块：`bitsandbytes`（ModuleType，`__path__=[]`）、`bitsandbytes.utils`（pack_dict_to_tensor/unpack_tensor_to_dict 两 no-op，L16 用）、`bitsandbytes.cextension`（`lib=types.SimpleNamespace()`——L18 仅模块级绑定，`create_normal_map`/`get_4bit_type` 均不调 lib）；exec 命名空间 `{'__name__': 'bitsandbytes.functional', '__package__': 'bitsandbytes', '__file__': 'bnb_functional.py'}`。
2. **预注册符号名与 main 现 API 不符**（只修 import 会死在符号断言）：现行 main 无模块级 `nf4` 常量、无 `create_quantize_nf4`。适配（**判定带与四项计算不变，仅换取数入口**）：硬编码 16 值 = `get_4bit_type('nf4', device='cpu')`（16 元素 tensor；L780 注释明示由 create_normal_map(offset=0.9677083, use_extra_value=True) 生成）；公式复算 = `create_normal_map()[:16]`（256 元素前 16 位为排序码点，其余为 8-bit 索引 padding 零）；`P2['fn_used']` 记 `'create_normal_map(offset=0.9677083, use_extra_value=True)[:16]'`；LOG/POOL 注明「预注册符号适配，非判定回调」。

执行流程：改 build_notebook.py P2 cell（**该脚本是 ipynb 生成源头，直接改 ipynb 会被下次生成覆盖**）→ 重新生成 ipynb → **本地真源码冒烟必做**（exec 拉回的真文件：验证 nf4_table 16 值 + computed 16 值 + check1 max_err < 1e-6；本地 /tmp/ka-venv 有 numpy/scipy，缺 torch 先补环境，不得跳过冒烟）→ push CPU → 状态置 running。v3 环境（pip-freeze 在案）：py3.13 / numpy 2.1.3 / scipy 1.16.3 / torch 2.11.0+cpu。
