#!/usr/bin/env python3
"""生成 K-env-v2 探针 notebook（ka-verify-env-probe2-conda）。

背景：K-env v1 结论——默认 py3.13 环境 openmmlab 全家不可装；PlanB conda 骨架已成。
v2 目标（详见 nightshift/verify/recon/recon-2026-11.md §下一步）：
  Route A 新栈: conda py3.10 + torch 2.0.1+cu118 + mmcv-full 1.7.2 官方轮 + mmdet 2.28.2 import
  Route B 旧栈补完: py3.8 + torch1.10 + mmcv-full1.5.3（v1 已证）+ 固定 setuptools/numpy/cython 再战 mmdet 与 mmdet3d 0.17.1
产出: /kaggle/working/env-matrix2.json (+env-routeA.sh 若 A 通)
注: mmdet3d 源码构建若因 CPU 无 nvcc 失败 → 结论记"T4 kernel 首格内构建"（对组 2/3 kernel 的影响如实写进结论）。
"""
import json

CELLS = []

CELLS.append({'cell_type': 'markdown', 'metadata': {}, 'source': """# K-env-v2：conda 双路线探针（ka-verify-env-probe2-conda）

- 前置结论：v1（ka-verify-env-probe-mmlab v1）默认 py3.13 全家不可装；本 kernel 探 conda 双路线。
- 无 claim 卡；产出 `/kaggle/working/env-matrix2.json`（+ env-routeA.sh 若 Route A 成功）。
- 纪律：每步 rc/tail 照实入库；时间盒写死；结论只述实测。mmdet3d 源码构建失败不判死——记录"CPU 无 nvcc 编译 CUDA ops 受限"，T4 kernel 首格内构建为兜底路径（对组 2/3 会话预算的影响写进结论）。"""})

CELLS.append({'cell_type': 'code', 'execution_count': None, 'metadata': {}, 'outputs': [], 'source': """import json, subprocess, sys, os, time, urllib.request

RES = {'kernel': 'ka-verify-env-probe2-conda', 'started': time.strftime('%F %T'),
       'python_host': sys.version.split()[0]}
MATRIX = []

def run(cmd, timeout, executable='/bin/bash'):
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, executable=executable)
        return r.returncode, ((r.stdout or '') + chr(10) + (r.stderr or ''))[-2500:]
    except subprocess.TimeoutExpired:
        return 124, 'TIMEOUT'

def head(url):
    try:
        req = urllib.request.Request(url, method='HEAD')
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status
    except Exception as e:
        return 'ERR ' + type(e).__name__

def sh(tag, cmd, timeout, store=True):
    item = {'tag': tag, 'start': time.strftime('%T'), 'rc': None}
    item['rc'], item['tail'] = run(['bash', '-lc', cmd], timeout)
    if store:
        MATRIX.append(item)
    print(json.dumps({k: item[k] for k in ('tag', 'rc')}, ensure_ascii=False), flush=True)
    if item['rc'] != 0:
        print(item['tail'][-600:], flush=True)
    return item

# index 可得性探测（记录，不判死）
RES['index_probe'] = {
    'mmcvfull_cu118_torch2.0': head('https://download.openmmlab.com/mmcv/dist/cu118/torch2.0/index.html'),
    'mmcvfull_cu121_torch2.1': head('https://download.openmmlab.com/mmcv/dist/cu121/torch2.1/index.html'),
    'pytorch_cu118_stable': head('https://download.pytorch.org/whl/cu118/torch_stable.html')}
print(json.dumps(RES['index_probe']), flush=True)

# miniconda 底座（v1 已证可行，重装一遍）
sh('download-miniforge', 'rm -f /kaggle/tmp/miniforge2.sh; (curl --retry 5 --retry-delay 3 -fsSL https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-Linux-x86_64.sh -o /kaggle/tmp/miniforge2.sh || curl --retry 5 --retry-delay 3 -fsSL https://mirrors.tuna.tsinghua.edu.cn/github-release/conda-forge/miniforge/LatestRelease/Miniforge3-Linux-x86_64.sh -o /kaggle/tmp/miniforge2.sh) && ls -la /kaggle/tmp/miniforge2.sh', 900)
sh('install-miniconda', 'bash /kaggle/tmp/miniforge2.sh -b -p /kaggle/tmp/mc2', 1200)
sh('verify-conda', 'test -x /kaggle/tmp/mc2/bin/conda && /kaggle/tmp/mc2/bin/conda --version', 120)"""})

CELLS.append({'cell_type': 'code', 'execution_count': None, 'metadata': {}, 'outputs': [], 'source': """# Route A：新栈 conda py3.10 + torch 2.0.1+cu118 + mmcv-full 1.7.2 轮 + mmdet 2.28.2
ROUTE_A = {'env': '/kaggle/tmp/mc2/envs/a310', 'steps': []}
def ash(tag, cmd, timeout):
    it = sh('A:' + tag, cmd, timeout, store=False)
    ROUTE_A['steps'].append({'tag': tag, 'rc': it['rc'], 'tail': it['tail'][-1200:]})
    return it['rc']

P = ROUTE_A['env'] + '/bin/pip'
PY = ROUTE_A['env'] + '/bin/python'
ash('create-py310', '/kaggle/tmp/mc2/bin/conda create -y -n a310 python=3.10', 1800)
ash('torch-2.0.1-cu118', P + ' install torch==2.0.1+cu118 -f https://download.pytorch.org/whl/cu118/torch_stable.html -q', 1500)
ash('mmcv-full-1.7.2-cu118', P + ' install mmcv-full==1.7.2 -f https://download.openmmlab.com/mmcv/dist/cu118/torch2.0/index.html -q', 1500)
ash('mmdet-2.28.2', P + ' install mmdet==2.28.2 -q', 1200)
ash('import-test', PY + ' -c ' + chr(34) + 'import torch, mmcv, mmdet; print(ROUTE_A_OK, torch.__version__, mmcv.__version__, mmdet.__version__)' .replace('ROUTE_A_OK', chr(39)+'ROUTE_A_OK'+chr(39)) + chr(34), 300)
ash('mmcv-ops-import', PY + ' -c ' + chr(34) + 'from mmcv.ops import nms; print(OPS_OK)'.replace('OPS_OK', chr(39)+'OPS_OK'+chr(39)) + chr(34), 300)
RES['routeA'] = {'ok': any(s['tag'] == 'import-test' and s['rc'] == 0 for s in ROUTE_A['steps']),
                 'ops_ok': any(s['tag'] == 'mmcv-ops-import' and s['rc'] == 0 for s in ROUTE_A['steps'])}
print('ROUTE A:', RES['routeA'], flush=True)"""})

CELLS.append({'cell_type': 'code', 'execution_count': None, 'metadata': {}, 'outputs': [], 'source': """# Route B：旧栈补完（py3.8 + torch1.10 + mmcv-full1.5.3，v1 已证骨架可行；本轮固定构建依赖再战 mmdet/mmdet3d 0.17）
ROUTE_B = {'env': '/kaggle/tmp/mc2/envs/b38', 'steps': []}
def bsh(tag, cmd, timeout):
    it = sh('B:' + tag, cmd, timeout, store=False)
    ROUTE_B['steps'].append({'tag': tag, 'rc': it['rc'], 'tail': it['tail'][-1200:]})
    return it['rc']

P = ROUTE_B['env'] + '/bin/pip'
bsh('create-py38', '/kaggle/tmp/mc2/bin/conda create -y -n b38 python=3.8', 1800)
bsh('build-deps', P + ' install ' + chr(39) + 'setuptools<60' + chr(39) + ' ' + chr(39) + 'numpy<1.24' + chr(39) + ' cython wheel -q', 900)
bsh('torch-1.10-cpu', P + ' install torch==1.10.1+cpu -f https://download.pytorch.org/whl/cpu/torch_stable.html -q', 1500)
bsh('mmcv-full-1.5.3-cpu', P + ' install mmcv-full==1.5.3 -f https://download.openmmlab.com/mmcv/dist/cpu/torch1.10/index.html -q', 1500)
bsh('pycocotools-pre', P + ' install pycocotools -q', 900)
bsh('mmdet-2.25.0', P + ' install mmdet==2.25.0 -q', 1800)
bsh('mmdet3d-0.17.1-src', P + ' install mmdet3d==0.17.1 -q', 3300)
bsh('import-test', ROUTE_B['env'] + '/bin/python -c ' + chr(34) + 'import torch, mmcv, mmdet; import mmdet3d; print(ROUTE_B_OK, mmdet.__version__, mmdet3d.__version__)'.replace('ROUTE_B_OK', chr(39)+'ROUTE_B_OK'+chr(39)) + chr(34), 300)
RES['routeB'] = {'ok': any(s['tag'] == 'import-test' and s['rc'] == 0 for s in ROUTE_B['steps'])}
print('ROUTE B:', RES['routeB'], flush=True)"""})

CELLS.append({'cell_type': 'code', 'execution_count': None, 'metadata': {}, 'outputs': [], 'source': """# 汇总：env-matrix2.json + env-routeA.sh（若 A 通）+ 结论打印
import json, time, os

def steps_of(route):
    return {s['tag']: s['rc'] for s in route['steps']}

CONCL = {
    'routeA_ok': RES['routeA']['ok'],
    'routeA_ops_importable': RES['routeA'].get('ops_ok', False),
    'routeA_steps': steps_of(ROUTE_A),
    'routeB_ok': RES['routeB']['ok'],
    'routeB_steps': steps_of(ROUTE_B),
    'mmdet3d_cpu_build_note': 'mmdet3d 源码构建含 CUDA ops 编译，CPU 会话无 nvcc 时若失败属预期——结论只能落在 T4 kernel 首格构建；本探针失败不构成路线否决',
    'impact_on_group23': 'Route A ok => K-bevdet/K-fcos(若走 mmdet2)/K-points 基座可行（mmdet3d 构建留 T4 首格 ~15-20min）；Route B ok => K-bevplanner/K-unidad 旧栈可行',
}
RES['finished'] = time.strftime('%F %T')
with open('/kaggle/working/env-matrix2.json', 'w') as f:
    json.dump({'res': RES, 'matrix': MATRIX, 'routeA': ROUTE_A, 'routeB': ROUTE_B, 'conclusions': CONCL}, f, ensure_ascii=False, indent=1)
if RES['routeA']['ok']:
    with open('/kaggle/working/env-routeA.sh', 'w') as f:
        f.write('#!/bin/bash\\nset -e\\n')
        for s in ROUTE_A['steps']:
            if s['rc'] == 0:
                pass
        f.write('conda create -y -n a310 python=3.10\\n')
        f.write('/kaggle/tmp/mc2/envs/a310/bin/pip install torch==2.0.1+cu118 -f https://download.pytorch.org/whl/cu118/torch_stable.html\\n')
        f.write('/kaggle/tmp/mc2/envs/a310/bin/pip install mmcv-full==1.7.2 -f https://download.openmmlab.com/mmcv/dist/cu118/torch2.0/index.html\\n')
        f.write('/kaggle/tmp/mc2/envs/a310/bin/pip install mmdet==2.28.2\\n')
print('=== CONCLUSIONS ===')
for k, v in CONCL.items():
    print(k, ':', v)
print('=== files ===')
for p in ['/kaggle/working/env-matrix2.json', '/kaggle/working/env-routeA.sh']:
    print(p, os.path.exists(p))"""})

NB = {'cells': CELLS, 'metadata': {'kernelspec': {'display_name': 'Python 3', 'language': 'python', 'name': 'python3'},
       'language_info': {'name': 'python', 'version': '3.10'}}, 'nbformat': 4, 'nbformat_minor': 4}
with open('env-probe2.ipynb', 'w') as f:
    json.dump(NB, f, ensure_ascii=False, indent=1)
print('cells:', len(CELLS))
