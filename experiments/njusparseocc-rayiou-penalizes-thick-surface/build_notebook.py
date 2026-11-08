#!/usr/bin/env python3
"""生成 K-probe-2 notebook（ka-verify-probe-rayiou-nf4-flops）。

服务卡：claim-njusparseocc-rayiou-penalizes-thick-surface（主）
      + claim-qlora-nf4-info-theoretic-optimal-datatype（P2）
      + claim-sparseocc-flops-749pct-below-dense（P3）
预注册：EXP/README.md（commit eafa8a0，先于 push；运行后不得回调）。
"""
import json

CELLS = []

CELLS.append({'cell_type': 'markdown', 'metadata': {}, 'source': """# K-probe-2 机制探针·计数侧（ka-verify-probe-rayiou-nf4-flops）

- 主卡：claim-njusparseocc-rayiou-penalizes-thick-surface；关联卡：claim-qlora-nf4-info-theoretic-optimal-datatype、claim-sparseocc-flops-749pct-below-dense。
- 预注册：EXP/README.md（eafa8a0）；算子口径依据 nightshift/reports/njusparseocc-rayiou-deep-read.md §1.5。
- 输出：/kaggle/working/results/{rayiou, nf4, flops}/ + pip freeze（首格即存，修复 K-probe-1 模板缺口）。"""})

CELLS.append({'cell_type': 'code', 'execution_count': None, 'metadata': {}, 'outputs': [], 'source': """import json, os, subprocess, sys, time, hashlib

os.makedirs('/kaggle/working/results/rayiou', exist_ok=True)
os.makedirs('/kaggle/working/results/nf4', exist_ok=True)
os.makedirs('/kaggle/working/results/flops', exist_ok=True)
RES = {'kernel': 'ka-verify-probe-rayiou-nf4-flops', 'started': time.strftime('%F %T'),
       'git_note': 'preregister commit eafa8a0 (EXP/README)'}
with open('/kaggle/working/pip-freeze.txt', 'w') as f:
    subprocess.run([sys.executable, '-m', 'pip', 'freeze'], stdout=f, text=True)
RES['pip_freeze_file'] = '/kaggle/working/pip-freeze.txt'
import numpy as np
RES['numpy'] = np.__version__
print(json.dumps({k: RES[k] for k in ('kernel', 'started', 'numpy')}), flush=True)"""})

CELLS.append({'cell_type': 'code', 'execution_count': None, 'metadata': {}, 'outputs': [], 'source': """# P1 RayIoU toy：实心球 GT + thin/thick_in 两版预测，首中语义 + 三档 tau
# 场景/参数预注册（EXP/README）：64^3 voxel=0.25m，球半径 3m class1，8192 射线，步进 0.125m
import numpy as np, json, time

P1 = {'grid': 64, 'voxel_m': 0.25, 'sphere_r_m': 3.0, 'n_rays_per_site': 1024, 'n_sites': 8,
      'step_m': 0.125, 'tau_m': [1.0, 2.0, 4.0]}
rng = np.random.default_rng(20261109)
G = P1['grid']; VS = P1['voxel_m']; R = P1['sphere_r_m']
centers = (np.arange(G) + 0.5 - G / 2) * VS          # voxel center coords (m), centered at origin
X, Y, Z = np.meshgrid(centers, centers, centers, indexing='ij')
dist = np.sqrt(X ** 2 + Y ** 2 + Z ** 2)
gt_occ = dist <= R                                    # 实心球（GT），class1

def make_pred(thick):
    shell = np.abs(dist - R) <= VS                    # 表面带（1 voxel 厚）
    if thick == 'thin':
        return shell
    if thick == 'thick_in':                           # falsifier a 方向：表面带 + 向内填充实心
        return shell | (dist <= R)
    raise ValueError(thick)

def ray_set():
    sites = []
    for k in range(P1['n_sites']):
        ang = 2 * np.pi * k / P1['n_sites']
        sites.append([6.0 * np.cos(ang), 6.0 * np.sin(ang), 0.0])
    sites = np.array(sites)
    # 75% 射线瞄准球内随机点（保证命中），25% 纯随机方向（可脱靶，练习"无 GT 交点剔除"分支）
    targets = rng.uniform(-R, R, size=(P1['n_sites'], P1['n_rays_per_site'], 3))
    aimed = targets - sites[:, None, :] + rng.normal(0, 0.4, targets.shape)
    random_dirs = rng.normal(size=aimed.shape)
    pick = rng.random(aimed.shape[:2]) < 0.75
    dirs = np.where(pick[:, :, None], aimed, random_dirs)
    dirs /= np.linalg.norm(dirs, axis=2, keepdims=True)
    return sites, dirs

def first_hit_depth(occ, origin, direction, tmax=12.0, step=P1['step_m']):
    ts = np.arange(0, tmax, step)
    pts = origin[None, :] + ts[:, None] * direction[None, :]
    ix = (pts[:, 0] / VS + G / 2).astype(int)
    iy = (pts[:, 1] / VS + G / 2).astype(int)
    iz = (pts[:, 2] / VS + G / 2).astype(int)
    ok = (ix >= 0) & (ix < G) & (iy >= 0) & (iy < G) & (iz >= 0) & (iz < G)
    ix = np.clip(ix, 0, G - 1); iy = np.clip(iy, 0, G - 1); iz = np.clip(iz, 0, G - 1)
    hit_idx = np.nonzero(ok & occ[ix, iy, iz])[0]
    return float(ts[hit_idx[0]]) if len(hit_idx) else None

sites, dirs = ray_set()
gt_depth_march = np.zeros(dirs.shape[:2], dtype=object)
for s in range(P1['n_sites']):
    for r in range(P1['n_rays_per_site']):
        gt_depth_march[s, r] = first_hit_depth(gt_occ, sites[s], dirs[s, r])
gt_mask = np.array([[gt_depth_march[s, r] is not None for r in range(P1['n_rays_per_site'])] for s in range(P1['n_sites'])])
print('rays intersecting GT sphere:', int(gt_mask.sum()), '/', gt_mask.size, flush=True)

def rayiou(pred_occ):
    tp = {t: 0 for t in P1['tau_m']}
    g_rays = {t: 0 for t in P1['tau_m']}
    p_rays = {t: 0 for t in P1['tau_m']}
    for s in range(P1['n_sites']):
        for r in range(P1['n_rays_per_site']):
            if not gt_mask[s, r]:
                continue
            gd = gt_depth_march[s, r]
            g_rays_add = False
            pd = first_hit_depth(pred_occ, sites[s], dirs[s, r])
            for t in P1['tau_m']:
                g_rays[t] += 1
                if pd is not None:
                    p_rays[t] += 1
                    if abs(pd - gd) < t:
                        tp[t] += 1
    ious = []
    for t in P1['tau_m']:
        denom = g_rays[t] + p_rays[t] - tp[t]
        ious.append(tp[t] / denom if denom else 0.0)
    return float(np.mean(ious)), {str(t): ious[i] for i, t in enumerate(P1['tau_m'])}

def miou(occ):
    inter = int((occ & gt_occ).sum()); union = int((occ | gt_occ).sum())
    return inter / union if union else 0.0

preds = {'thin': make_pred('thin'), 'thick_in': make_pred('thick_in')}
P1R = {'params': P1, 'rays_hit_gt': int(gt_mask.sum())}
for name, occ in preds.items():
    riou, per_tau = rayiou(occ)
    P1R[name] = {'rayiou': riou, 'per_tau': per_tau, 'miou': miou(occ), 'voxels': int(occ.sum())}
d_ray = P1R['thick_in']['rayiou'] - P1R['thin']['rayiou']
d_miou = P1R['thick_in']['miou'] - P1R['thin']['miou']
P1R['delta_rayiou'] = d_ray
P1R['delta_miou'] = d_miou
if d_ray > 0.01 * P1R['thin']['rayiou']:
    P1R['verdict'] = 'FALSIFIER-1 DIRECTION HIT: 加厚使 RayIoU 上升 >1%'
elif d_miou > 0.05 and d_ray <= 0.01:
    P1R['verdict'] = 'SUPPORT: mIoU 获利 >0.05 而 RayIoU 不升（加厚换不了分）'
else:
    P1R['verdict'] = 'OUT_OF_BAND: 落带外，照实记录（d_miou=%.4f d_ray=%.4f）' % (d_miou, d_ray)
RES['p1'] = P1R
with open('/kaggle/working/results/rayiou/metrics.json', 'w') as f:
    json.dump(P1R, f, indent=1)
print(json.dumps({k: P1R[k] for k in ['rays_hit_gt', 'delta_rayiou', 'delta_miou', 'verdict']}, ensure_ascii=False))
print('thin :', P1R['thin'])
print('thick:', P1R['thick_in'])
print('=== P1 ===', P1R['verdict'], flush=True)"""})

CELLS.append({'cell_type': 'code', 'execution_count': None, 'metadata': {}, 'outputs': [], 'source': """# P1b 官方实现核查：MCG-NJU/SparseOcc RayIoU evaluator（只读代码事实）
import subprocess, json, time

P1B = {'repo': 'https://github.com/MCG-NJU/SparseOcc', 'checked_at': time.strftime('%F %T')}
def sh(cmd, timeout=600):
    try:
        r = subprocess.run(['bash', '-lc', cmd], capture_output=True, text=True, timeout=timeout)
        return r.returncode, ((r.stdout or '') + chr(10) + (r.stderr or ''))[-2500:]
    except subprocess.TimeoutExpired:
        return 124, 'TIMEOUT'

rc, out = sh('rm -rf /kaggle/tmp/sparseocc && git clone --depth 1 https://github.com/MCG-NJU/SparseOcc /kaggle/tmp/sparseocc 2>&1 | tail -1')
P1B['clone_rc'] = rc
if rc == 0:
    rc2, head = sh('cd /kaggle/tmp/sparseocc && git log -1 --format=%H')
    P1B['head'] = head.strip()[:120]
    rc3, files = sh('cd /kaggle/tmp/sparseocc && grep -rln rayiou --include=*.py | head -5')
    P1B['rayiou_files'] = files.strip()[:300]
    rc4, core = sh('cd /kaggle/tmp/sparseocc && grep -rn -A3 -B3 "abs\\\\|threshold\\\\|first" $(grep -rln rayiou --include=*.py | head -2) 2>/dev/null | grep -iE "mask|thres|first|argmax|tp" | head -20')
    P1B['operator_facts_grep'] = core.strip()[:1500]
    P1B['note'] = '四项核对（硬阈值/首中/tau 集合/聚合）由收割时按 operator_facts_grep 人工定论；grep 原文照录'
else:
    P1B['error'] = out[-300:]
RES['p1b'] = P1B
with open('/kaggle/working/results/rayiou/official_code_check.json', 'w') as f:
    json.dump(P1B, f, indent=1)
print(json.dumps(P1B, ensure_ascii=False)[:900], flush=True)"""})

CELLS.append({'cell_type': 'code', 'execution_count': None, 'metadata': {}, 'outputs': [], 'source': """# P2 NF4：kernel 内实抓 bnb main functional.py（记录 sha256+URL+日期），公式复算 + Eq.4 字面网格 + 等期望填充 + E|X-Q|
import json, urllib.request, hashlib, numpy as np

P2 = {'url': 'https://raw.githubusercontent.com/bitsandbytes-foundation/bitsandbytes/main/bitsandbytes/functional.py',
      'fetched_at': time.strftime('%F %T')}
try:
    src = urllib.request.urlopen(P2['url'], timeout=60).read()
    P2['sha256'] = hashlib.sha256(src).hexdigest()
    open('/kaggle/working/results/nf4/bnb_functional_fetched.py', 'wb').write(src)
    print('fetched bnb functional.py', P2['sha256'][:16], flush=True)
    import types, sys as _sys
    _utils_stub = types.ModuleType('bitsandbytes.utils')
    _utils_stub.pack_dict_to_tensor = lambda *a, **k: None
    _utils_stub.unpack_tensor_to_dict = lambda *a, **k: None
    _bnb_stub = types.ModuleType('bitsandbytes'); _bnb_stub.utils = _utils_stub
    _sys.modules.setdefault('bitsandbytes', _bnb_stub)
    _sys.modules.setdefault('bitsandbytes.utils', _utils_stub)   # v2 修复：functional.py L16 的包内绝对导入（仅 state 辅助，构造函数不用）
    ns_bnb = {}
    exec(compile(src, 'bnb_functional.py', 'exec'), ns_bnb)   # 隔离命名空间，不 import 安装版
    nf4_table = list(ns_bnb['nf4'])                            # 硬编码 16 值
    q_fn = ns_bnb.get('create_quantize_nf4')
    if q_fn is None:
        cands = [kk for kk, vv in ns_bnb.items() if kk.lower().startswith('create_') and 'nf4' in kk.lower() and callable(vv)]
        assert cands, 'bnb functional.py 中未找到 create_*nf4* 构造函数，nf4 相关符号: ' + str([kk for kk in ns_bnb if 'nf4' in kk.lower()][:12])
        q_fn = ns_bnb[cands[0]]
    P2['fn_used'] = getattr(q_fn, '__name__', str(q_fn))
    try:
        computed = [round(float(x), 8) for x in q_fn(4)]
    except TypeError:
        computed = [round(float(x), 8) for x in q_fn()]
    P2['bnb_table'] = [round(float(x), 8) for x in nf4_table]
    P2['computed'] = computed
    P2['max_err_formula_vs_table'] = float(np.max(np.abs(np.array(computed) - np.array(P2['bnb_table']))))
    P2['check1_formula_matches_table'] = P2['max_err_formula_vs_table'] < 1e-6
    # ② Eq.4 字面网格：i/(2^k+1) 相邻均值（k=4）
    from scipy.stats import norm
    k = 4; n = 2 ** k + 1
    ps = [(i + 1) / n for i in range(n)]                        # 内部网格点
    zs = norm.ppf(ps)
    eq4 = [float((zs[i] + zs[i + 1]) / 2) for i in range(n - 1)]
    pos = sorted([x for x in eq4 if x > 0 and np.isfinite(x)])
    P2['eq4_first_positive'] = round(float(pos[0]), 4)
    P2['appendixE_first_positive_1105'] = 0.0796
    P2['check2_eq4_mismatch_confirmed'] = abs(pos[0] - 0.0796) > 0.01   # Eq.4 字面网格 ≠ 论文表首位正值（#48 材料）
    # ③ 等期望填充：NF4 bin 质量 vs INT4-absmax 均匀格
    code = np.array(sorted(set([0.0] + [abs(x) for x in nf4_table] + [-abs(x) for x in nf4_table])))
    mids = (code[1:] + code[:-1]) / 2
    edges = np.concatenate([[-1e9], mids, [1e9]])
    from scipy.stats import norm as _n2
    samp = _n2.rvs(size=2_000_000, random_state=7)
    bins = np.searchsorted(edges, samp) - 1
    probs = np.bincount(bins, minlength=len(code)) / len(samp)
    P2['nf4_bin_probs'] = [round(float(x), 5) for x in probs]
    P2['nf4_bin_rel_dev_max'] = float(np.max(np.abs(probs - probs.mean())) / probs.mean())
    int_code = np.linspace(-1, 1, 2 ** k)
    imids = (int_code[1:] + int_code[:-1]) / 2
    iedges = np.concatenate([[-1e9], imids, [1e9]])
    ibins = np.searchsorted(iedges, samp) - 1
    iprobs = np.bincount(ibins, minlength=len(int_code)) / len(samp)
    P2['int4_bin_rel_dev_max'] = float(np.max(np.abs(iprobs - iprobs.mean())) / iprobs.mean())
    # ④ E|X-Q(X)|：NF4 vs INT4-absmax vs AF4
    def eq_err(codepts):
        c = np.sort(np.array(codepts))
        mids2 = (c[1:] + c[:-1]) / 2
        e2 = np.concatenate([[-1e9], mids2, [1e9]])
        idx = np.searchsorted(e2, samp) - 1
        return float(np.mean(np.abs(samp - c[np.clip(idx, 0, len(c) - 1)])))
    P2['eq_err_nf4'] = eq_err(nf4_table)
    P2['eq_err_int4'] = eq_err(int_code)
    P2['eq_err_af4'] = eq_err(np.linspace(-0.9677083 * 1.0, 0.9677083, 16))  # AF4 等距近似（同 bnb offset 幅度）
    P2['nf4_lowest'] = P2['eq_err_nf4'] <= min(P2['eq_err_int4'], P2['eq_err_af4'])
    P2['verdict_1'] = 'SUPPORT' if P2['check1_formula_matches_table'] else 'MISMATCH: 公式复算与硬编码表不符，如实记录'
    P2['verdict_2'] = 'Eq.4 字面网格不命中确认 -> #48 材料固化' if P2['check2_eq4_mismatch_confirmed'] else 'Eq.4 字面网格意外命中论文表值（与 11-05 结论冲突，如实记录）'
    P2['verdict_4'] = 'NF4 最低（自算）' if P2['nf4_lowest'] else 'NF4 非最低（自算），照实记录'
except Exception as e:
    P2['error'] = repr(e)
    P2['verdict_1'] = P2['verdict_2'] = P2['verdict_4'] = 'SKIPPED: ' + repr(e)
RES['p2'] = P2
with open('/kaggle/working/results/nf4/metrics.json', 'w') as f:
    json.dump(P2, f, ensure_ascii=False, indent=1)
for k in ['verdict_1', 'verdict_2', 'verdict_4', 'max_err_formula_vs_table', 'eq4_first_positive',
          'nf4_bin_rel_dev_max', 'int4_bin_rel_dev_max', 'eq_err_nf4', 'eq_err_int4', 'eq_err_af4']:
    print(k, '=', P2.get(k), flush=True)"""})

CELLS.append({'cell_type': 'code', 'execution_count': None, 'metadata': {}, 'outputs': [], 'source': """# P3 SparseOcc FLOPs：论文侧算术自洽（运行时 profile 缩范围留池——需 mmdet3d，K-env 结论未出前不可行）
import json

P3 = {'paper': {'sparseocc_G': 455, 'cconet_G': 1810, 'claimed_reduction': 74.9}}
P3['recomputed_reduction_pct'] = (1 - 455 / 1810) * 100
P3['ratio'] = 455 / 1810
P3['arithmetic_consistent'] = abs(P3['recomputed_reduction_pct'] - 74.9) < 0.05   # 74.862 -> 74.9 四舍五入
P3['ratio_about_quarter'] = abs(P3['ratio'] - 0.25) < 0.01
P3['scope_note'] = '缩范围：本夜只闭合论文侧算术自洽（falsifier c 方向的转引结构核对另由卡片历史覆盖）；455G 运行时复算需 mmdet3d 栈，留池'
P3['verdict'] = 'PAPER-SIDE CONSISTENT' if P3['arithmetic_consistent'] else 'INCONSISTENT: 论文摘要 74.9 与 Table 1 数字算术不符，照实记录'
RES['p3'] = P3
with open('/kaggle/working/results/flops/metrics.json', 'w') as f:
    json.dump(P3, f, indent=1)
print(json.dumps(P3, ensure_ascii=False, indent=1))
print('=== P3 ===', P3['verdict'], flush=True)"""})

CELLS.append({'cell_type': 'code', 'execution_count': None, 'metadata': {}, 'outputs': [], 'source': """# 汇总
import json, time, os, hashlib

RES['finished'] = time.strftime('%F %T')
with open('/kaggle/working/results/experiment-summary.json', 'w') as f:
    json.dump(RES, f, ensure_ascii=False, indent=1)
print('=== CONCLUSION 1 (P1 rayiou toy) ===', RES['p1']['verdict'])
print('=== CONCLUSION 2 (P2 nf4) ===', RES['p2'].get('verdict_1'), '|', RES['p2'].get('verdict_2'), '|', RES['p2'].get('verdict_4'))
print('=== CONCLUSION 3 (P3 flops paper-side) ===', RES['p3']['verdict'])
for root, _, files in os.walk('/kaggle/working/results'):
    for fn in sorted(files):
        p = os.path.join(root, fn)
        print(p, os.path.getsize(p), hashlib.sha256(open(p, 'rb').read()).hexdigest()[:16])"""})

NB = {'cells': CELLS, 'metadata': {'kernelspec': {'display_name': 'Python 3', 'language': 'python', 'name': 'python3'},
       'language_info': {'name': 'python', 'version': '3.10'}}, 'nbformat': 4, 'nbformat_minor': 4}
with open('probe-rayiou-nf4-flops.ipynb', 'w') as f:
    json.dump(NB, f, ensure_ascii=False, indent=1)
print('cells:', len(CELLS))
