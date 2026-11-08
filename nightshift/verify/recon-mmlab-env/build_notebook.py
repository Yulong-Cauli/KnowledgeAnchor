#!/usr/bin/env python3
"""生成 K-env 探针 notebook（ka-verify-env-probe-mmlab）。

服务对象：无 claim 卡——为组 2/3 全部 openmmlab 系 kernel 产出版本 pin 矩阵。
任务书：tmp_docs/05-夜间验证班任务书-四组验证池.md §4 K-env 节。
输出：env-probe.ipynb（本目录）→ kaggle kernels push → /kaggle/working/{env-matrix.json, pip-freeze-base.txt}
"""
import json

CELLS = []

# ---------- cell 1: header ----------
CELLS.append({"cell_type": "markdown", "metadata": {}, "source": """# K-env 探针：mmdet/mmcv/mmdet3d wheel 矩阵（ka-verify-env-probe-mmlab）

- 服务：组 2/3 openmmlab 系 kernel（K-bevdet / K-bevplanner / K-unidad / K-fcos / K-points-nms）的 **push 前提**（任务书 §3：探针结论入库才能 push）。
- 无 claim 卡：本 kernel 只产侦察结论，产出到 `/kaggle/working/env-matrix.json`。
- 纪律：每步 try/except 全包、失败照样落 JSON；时间盒写死；结论只记录实测，不猜测。
- 偏离预注：本 kernel 为 CPU 会话——若镜像无 nvcc，则 DCNv2 编译验证无法进行（CUDA op 编译需 nvcc），降级为 fork 兼容性静态检查并显式记录，编译实测移交目标 T4 kernel 首格（任务书允许的偏离标注）。"""})

# ---------- cell 2: env info ----------
CELLS.append({"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [], "source": """import json, subprocess, sys, os, time, platform, shutil

RES = {"kernel": "ka-verify-env-probe-mmlab", "started": time.strftime("%F %T"),
       "python": sys.version, "platform": platform.platform()}
try:
    import torch
    RES["torch"] = torch.__version__
    RES["torch_cuda_build"] = torch.version.cuda
    RES["torch_cuda_available"] = torch.cuda.is_available()
except Exception as e:
    RES["torch_error"] = repr(e)
for name, cmd in [("nvidia_smi", ["nvidia-smi"]), ("nvcc", ["nvcc", "--version"]),
                  ("gcc", ["gcc", "--version"]), ("gxx", ["g++", "--version"])]:
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        RES[name] = (r.stdout or r.stderr).splitlines()[0] if (r.stdout or r.stderr) else "not found"
        RES[name + "_rc"] = r.returncode
    except Exception as e:
        RES[name] = f"ERR {e!r}"
with open("/kaggle/working/pip-freeze-base.txt", "w") as f:
    subprocess.run([sys.executable, "-m", "pip", "freeze"], stdout=f, text=True)
RES["pip_freeze_file"] = "/kaggle/working/pip-freeze-base.txt"
print(json.dumps(RES, indent=2, default=str))"""})

# ---------- cell 3: helper + wheel matrix ----------
CELLS.append({"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [], "source": """import json, subprocess, sys, time, urllib.request

MATRIX = []

def run(cmd, timeout):
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return r.returncode, ((r.stdout or "") + "\\n" + (r.stderr or ""))[-3000:]
    except subprocess.TimeoutExpired:
        return 124, f"TIMEOUT after {timeout}s"

def pip(args, timeout=2400):
    return run([sys.executable, "-m", "pip", *args, "--no-input", "-q"], timeout)

def try_import(mod):
    code = f"import {mod}, sys; print(getattr({mod}, '__version__', 'ok'))"
    rc, out = run([sys.executable, "-c", code], 180)
    tail = out.strip().splitlines()[-1] if out.strip() else ""
    return rc == 0, tail

def head(url):
    try:
        req = urllib.request.Request(url, method="HEAD")
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status
    except Exception as e:
        return f"ERR {type(e).__name__}"

def probe(tag, pkg, mod, index=None, timeout=2400, uninstall_after=True):
    \"\"\"装→import 测→卸载，一条记录。任何失败都照实入 MATRIX。\"\"\"
    item = {"tag": tag, "pkg": pkg, "index": index, "start": time.strftime("%T")}
    args = ["install"] + ([pkg] if isinstance(pkg, str) else list(pkg))
    if index:
        args += ["-f", index]
    rc, out = pip(args, timeout)
    item["install_rc"] = rc
    if rc != 0:
        item["install_tail"] = out[-1200:]
    else:
        ok, ver = try_import(mod)
        item["import_ok"] = ok
        item["import_version"] = ver
        if uninstall_after:
            rc2, _ = run([sys.executable, "-m", "pip", "uninstall", "-y",
                          *(mod.split(".")[:1]), "mmcv-full", "mmcv", "mmdet", "mmdet3d"], 600)
            item["uninstall_rc"] = rc2
    MATRIX.append(item)
    print(json.dumps(item, ensure_ascii=False)[:1600], flush=True)
    return item

# 0) 先探 openmmlab CPU wheel index 有哪些 torch 目录（mmcv 官方只发布到部分 torch 版本）
torch_idx = {}
for t in ["1.13", "2.0", "2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8"]:
    base = f"https://download.openmmlab.com/mmcv/dist/cpu/torch{t}/index.html"
    torch_idx[t] = head(base)
RES["openmmlab_cpu_index_probe"] = torch_idx
usable = sorted([t for t, s in torch_idx.items() if s == 200])
print("usable cpu index torch dirs:", usable, flush=True)
best = usable[-1] if usable else None
RES["best_cpu_torch_dir"] = best

# 1) mmcv-full 1.x：先试 best cpu index（1.x 轮若不存在会 404/无法解析），再源码兜底
if best:
    probe("mmcv-full-1.7.2@cpu-wheel", "mmcv-full==1.7.2", "mmcv-full",
          index=f"https://download.openmmlab.com/mmcv/dist/cpu/torch{best}/index.html", timeout=1200)
else:
    MATRIX.append({"tag": "mmcv-full-1.7.2@cpu-wheel", "skip": "no cpu index dir"})

# 2) mmcv 2.x（openmmlab 2.x 有 CPU 轮）
if best:
    probe("mmcv-2.2.0@cpu-wheel", "mmcv==2.2.0", "mmcv",
          index=f"https://download.openmmlab.com/mmcv/dist/cpu/torch{best}/index.html", timeout=1800)

# 3) mmdet 2.28.2（纯 python，但 import 需要 mmcv-full>=1.3；单独装+import 记录真实依赖错误）
probe("mmdet-2.28.2", "mmdet==2.28.2", "mmdet", timeout=1800, uninstall_after=False)

# 4) mmdet3d 0.17.1 / 1.0.0rc4 / 1.1.6：sdist 源码编译（CPU 可编译，时间盒内记录成败）
probe("mmdet3d-0.17.1", "mmdet3d==0.17.1", "mmdet3d", timeout=2700)
probe("mmdet3d-1.0.0rc4", "mmdet3d==1.0.0rc4", "mmdet3d", timeout=2700)
probe("mmdet3d-1.1.6", "mmdet3d==1.1.6", "mmdet3d", timeout=2700)
print("MATRIX entries:", len(MATRIX), flush=True)"""})

# ---------- cell 4: miniconda plan B ----------
CELLS.append({"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [], "source": """# Plan B：kernel 内 conda 旧栈（py3.8 + torch1.10-cpu + mmcv-full1.5.3-cpu + mmdet3d0.17.1）
# 记录每步 rc；整体失败也如实入库。目标：证明/证伪「旧栈退路」可行。
PLANB = {"enabled": True, "root": "/kaggle/tmp/miniconda", "steps": []}
import json, subprocess, os, time, sys

def step(tag, cmd, timeout):
    item = {"tag": tag, "start": time.strftime("%T")}
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, executable="/bin/bash")
        item["rc"] = r.returncode
        item["tail"] = ((r.stdout or "") + "\\n" + (r.stderr or ""))[-1200:]
    except subprocess.TimeoutExpired:
        item["rc"] = 124
        item["tail"] = f"TIMEOUT {timeout}s"
    PLANB["steps"].append(item)
    print(json.dumps(item, ensure_ascii=False)[:1200], flush=True)
    return item["rc"]

os.makedirs("/kaggle/tmp", exist_ok=True)
if not os.path.exists("/kaggle/tmp/miniforge.sh"):
    step("download-miniforge",
         ["bash", "-lc", "curl -fsSL https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-Linux-x86_64.sh -o /kaggle/tmp/miniforge.sh && ls -la /kaggle/tmp/miniforge.sh"], 600)
step("install-miniconda",
     ["bash", "-lc", "bash /kaggle/tmp/miniforge.sh -b -p /kaggle/tmp/miniconda"], 1200)
step("create-py38",
     ["bash", "-lc", "/kaggle/tmp/miniconda/bin/conda create -y -n old python=3.8"], 1800)
PIP = "/kaggle/tmp/miniconda/envs/old/bin/pip"
step("torch-1.10-cpu",
     ["bash", "-lc", f"{PIP} install torch==1.10.1+cpu -f https://download.pytorch.org/whl/cpu/torch_stable.html -q"], 2700)
step("mmcv-full-1.5.3-cpu",
     ["bash", "-lc", f"{PIP} install mmcv-full==1.5.3 -f https://download.openmmlab.com/mmcv/dist/cpu/torch1.10/index.html -q"], 2700)
step("mmdet-2.11",
     ["bash", "-lc", f"{PIP} install mmdet==2.11.0 -q"], 2400)
step("mmdet3d-0.17.1",
     ["bash", "-lc", f"{PIP} install mmdet3d==0.17.1 -q"], 3300)
step("import-test",
     ["bash", "-lc", "/kaggle/tmp/miniconda/envs/old/bin/python -c 'import torch, mmcv, mmdet; import mmdet3d; print(\\\"PLANB_OK\\\", torch.__version__, mmcv.__version__, mmdet.__version__, mmdet3d.__version__)'"], 300)
RES["planb"] = {"planb_ok": any(s["tag"] == "import-test" and s.get("rc") == 0 for s in PLANB["steps"])}"""})

# ---------- cell 5: DCNv2 static check ----------
CELLS.append({"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [], "source": """# DCNv2：CPU 会话大概率无 nvcc → 编译验证移交目标 T4 kernel；此处只做 fork 兼容性静态检查。
DCN = {"nvcc_present": RES.get("nvcc_rc") == 0}
import json, subprocess, time

def sh(cmd, timeout=600):
    try:
        r = subprocess.run(["bash", "-lc", cmd], capture_output=True, text=True, timeout=timeout)
        return r.returncode, ((r.stdout or "") + "\\n" + (r.stderr or ""))[-1500:]
    except subprocess.TimeoutExpired:
        return 124, f"TIMEOUT {timeout}s"

if not DCN["nvcc_present"]:
    rc, out = sh("rm -rf /kaggle/tmp/DCNv2_latest && git clone --depth 1 https://github.com/lucasjinreal/DCNv2_latest /kaggle/tmp/DCNv2_latest 2>&1 | tail -2")
    DCN["clone_rc"] = rc
    if rc == 0:
        rc2, out2 = sh("cd /kaggle/tmp/DCNv2_latest && git log -1 --format='%H %ci' && ls setup.py src 2>&1 | head -5")
        DCN["fork_head"] = out2.strip()[:400]
        # 静态兼容性线索：setup.py 的 torch 引用与 readme 声明
        rc3, out3 = sh("cd /kaggle/tmp/DCNv2_latest && grep -n 'torch' setup.py | head -10; echo ---; grep -rn 'torch2\\|2\\.[0-9]' README.md 2>/dev/null | head -5")
        DCN["static_hints"] = out3.strip()[:800]
    DCN["decision"] = "编译验证移交 K-points-nms T4 kernel 首格（偏离已标注：CPU 会话无 nvcc）"
RES["dcnv2"] = DCN
print(json.dumps(DCN, ensure_ascii=False, indent=1)[:1200])"""})

# ---------- cell 6: conclusions ----------
CELLS.append({"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [], "source": """# 汇总 env-matrix.json + 结论打印（只陈述实测，不推断未测组合）
import json, time

def find(tag):
    for it in MATRIX:
        if it.get("tag") == tag:
            return it
    return None

CONCL = {}
for tag in ["mmcv-full-1.7.2@cpu-wheel", "mmcv-2.2.0@cpu-wheel", "mmdet-2.28.2",
            "mmdet3d-0.17.1", "mmdet3d-1.0.0rc4", "mmdet3d-1.1.6"]:
    it = find(tag)
    if it is None:
        CONCL[tag] = "NOT_RUN"
    elif it.get("install_rc") != 0:
        CONCL[tag] = f"INSTALL_FAIL rc={it.get('install_rc')}"
    else:
        CONCL[tag] = f"IMPORT_OK={it.get('import_ok')} ver={it.get('import_version')}"
CONCL["planb_old_stack"] = RES.get("planb", {}).get("planb_ok", "NOT_RUN")
CONCL["best_cpu_torch_dir"] = RES.get("best_cpu_torch_dir")
CONCL["dcnv2"] = RES.get("dcnv2", {}).get("decision", "NOT_RUN")
RES["finished"] = time.strftime("%F %T")

with open("/kaggle/working/env-matrix.json", "w") as f:
    json.dump({"res": RES, "matrix": MATRIX, "conclusions": CONCL}, f, ensure_ascii=False, indent=1)
print("=== CONCLUSIONS ===")
for k, v in CONCL.items():
    print(f"{k}: {v}")
print("=== files ===")
for p in ["/kaggle/working/env-matrix.json", "/kaggle/working/pip-freeze-base.txt"]:
    import os
    print(p, os.path.exists(p), os.path.getsize(p) if os.path.exists(p) else 0)"""})

NB = {"cells": CELLS, "metadata": {
    "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
    "language_info": {"name": "python", "version": "3.10"}}, "nbformat": 4, "nbformat_minor": 4}

with open("env-probe.ipynb", "w") as f:
    json.dump(NB, f, ensure_ascii=False, indent=1)
print("cells:", len(CELLS))
