#!/usr/bin/env python3
"""生成 K-probe-1 notebook（ka-verify-probe-pointnet-mobilenet）。

服务卡：claim-pointnetpillars-pointnet-permutation-invariance-symmetric-function（主）
      + claim-pointnetpillars-pointnet-maxpool-skeleton-noise-robustness
      + claim-mobilenet-dsc-8to9x-compute-reduction
预注册判定带：EXP/README.md（commit b555f02，先于本 notebook push）。运行后阈值不得回调。
"""
import json

CELLS = []

CELLS.append({'cell_type': 'markdown', 'metadata': {}, 'source': """# K-probe-1 机制探针·结构侧（ka-verify-probe-pointnet-mobilenet）

- 主卡：claim-pointnetpillars-pointnet-permutation-invariance-symmetric-function；关联卡：claim-pointnetpillars-pointnet-maxpool-skeleton-noise-robustness、claim-mobilenet-dsc-8to9x-compute-reduction。
- 预注册判定带：EXP/README.md（preregister commit b555f02，先于运行；运行后不得回调）。P1/P2 判据为**预设判据（非卡面锚点）**。
- 输出：/kaggle/working/results/{pointnet-perm, pointnet-skel, mobilenet-dsc}/ + log 末尾三行结论摘要。
- 纪律：所有判定只陈述实测落带，不写"已验证"；失败/部分结果照常落盘。"""})

CELLS.append({'cell_type': 'code', 'execution_count': None, 'metadata': {}, 'outputs': [], 'source': """import os, json, time, math, subprocess, sys
import numpy as np
import torch, torch.nn as nn

CFG = dict(seed=0, n_train=3000, n_val=200, n_pts=256, k=4, epochs=25, batch=64,
           perm_trials=20, skel_frac=0.10, noise_sigma=0.05,
           band_identical=1e-6, band_noisy=1e-3, feat_rel_l2=0.05, flip_rate=0.05,
           train_gate=0.95, aggs=['max', 'mean', 'sum'])
SEED = CFG['seed']
torch.manual_seed(SEED); np.random.seed(SEED)
torch.set_num_threads(max(1, os.cpu_count() or 1))
DEV = 'cpu'
RES = {'kernel': 'ka-verify-probe-pointnet-mobilenet', 'cfg': CFG,
       'git_note': 'preregister commit b555f02 (EXP/README)', 'started': time.strftime('%F %T')}
os.makedirs('/kaggle/working/results/pointnet-perm', exist_ok=True)
os.makedirs('/kaggle/working/results/pointnet-skel', exist_ok=True)
os.makedirs('/kaggle/working/results/mobilenet-dsc', exist_ok=True)
print(json.dumps(CFG, ensure_ascii=False), flush=True)"""})

CELLS.append({'cell_type': 'code', 'execution_count': None, 'metadata': {}, 'outputs': [], 'source': """# 合成点云 + PointNet-small（共享 1x1 Conv MLP + 可切换对称聚合）
import numpy as np, torch, torch.nn as nn

def rotmat(rng):
    a, b, c = rng.random(3) * 2 * np.pi
    ca, sa, cb, sb, cc, sc = np.cos(a), np.sin(a), np.cos(b), np.sin(b), np.cos(c), np.sin(c)
    Rx = np.array([[1, 0, 0], [0, ca, -sa], [0, sa, ca]])
    Ry = np.array([[cb, 0, sb], [0, 1, 0], [-sb, 0, cb]])
    Rz = np.array([[cc, -sc, 0], [sc, cc, 0], [0, 0, 1]])
    return (Rz @ Ry @ Rx).astype('float32')

def make_cloud(kind, rng, n):
    if kind == 0:      # sphere surface
        v = rng.normal(size=(n, 3)).astype('float32')
        v /= np.linalg.norm(v, axis=1, keepdims=True) + 1e-9
        pts = v * (0.30 + 0.15 * rng.random())
    elif kind == 1:    # solid box
        pts = (rng.random((n, 3)) - 0.5) * (0.5 + 0.3 * rng.random())
    elif kind == 2:    # torus
        th = rng.random(n) * 2 * np.pi
        R = 0.30 + 0.12 * rng.random(); r = 0.07 + 0.05 * rng.random()
        pts = np.stack([R * np.cos(th) + r * np.cos(3 * th),
                        R * np.sin(th) + r * np.sin(3 * th),
                        (rng.random(n) - 0.5) * 0.08], 1)
    else:              # thin plate
        pts = np.stack([(rng.random(n) - 0.5) * 0.7,
                        (rng.random(n) - 0.5) * 0.7,
                        (rng.random(n) - 0.5) * 0.03], 1)
    pts = pts.astype('float32') + rng.normal(0, 0.01, pts.shape).astype('float32')
    pts = pts @ rotmat(rng)
    return (pts + rng.normal(0, 0.02, 3).astype('float32'))

def make_split(n, seed):
    rng = np.random.default_rng(seed)
    xs = np.stack([make_cloud(i % CFG['k'], rng, CFG['n_pts']) for i in range(n)])
    ys = np.array([i % CFG['k'] for i in range(n)], dtype='int64')
    return xs, ys

class PointNetSmall(nn.Module):
    def __init__(self, k=4, agg='max'):
        super().__init__()
        self.agg = agg
        self.mlp = nn.Sequential(
            nn.Conv1d(3, 64, 1), nn.BatchNorm1d(64), nn.ReLU(),
            nn.Conv1d(64, 128, 1), nn.BatchNorm1d(128), nn.ReLU(),
            nn.Conv1d(128, 256, 1), nn.BatchNorm1d(256), nn.ReLU())
        self.head = nn.Sequential(
            nn.Linear(256, 128), nn.BatchNorm1d(128), nn.ReLU(),
            nn.Dropout(0.3), nn.Linear(128, k))

    def forward(self, x):            # x: B,N,3
        y = self.mlp(x.transpose(1, 2))          # B,C,N
        if self.agg == 'max':   g = y.max(dim=2)[0]
        elif self.agg == 'mean': g = y.mean(dim=2)
        else:                    g = y.sum(dim=2)
        return self.head(g), y

def train_model(agg, seed):
    torch.manual_seed(seed); np.random.seed(seed)
    xs, ys = make_split(CFG['n_train'], 1000 + seed)
    vx, vy = make_split(CFG['n_val'], 2000 + seed)
    tx = torch.tensor(xs); ty = torch.tensor(ys)
    model = PointNetSmall(CFG['k'], agg).to(DEV)
    opt = torch.optim.Adam(model.parameters(), 1e-3)
    for ep in range(CFG['epochs']):
        model.train()
        perm = torch.randperm(len(tx))
        for i in range(0, len(tx), CFG['batch']):
            idx = perm[i:i + CFG['batch']]
            opt.zero_grad()
            loss = nn.functional.cross_entropy(model(tx[idx].to(DEV))[0], ty[idx].to(DEV))
            loss.backward(); opt.step()
    model.eval()
    with torch.no_grad():
        correct = 0
        for i in range(0, len(vx), CFG['batch']):
            pred = model(torch.tensor(vx[i:i + CFG['batch']]).to(DEV))[0].argmax(1)
            correct += int((pred == torch.tensor(vy[i:i + CFG['batch']]).to(DEV)).sum())
    acc = correct / len(vx)
    print(f'agg={agg} seed={seed} val_acc={acc:.4f}', flush=True)
    return model, acc, (vx, vy)

MODELS = {}
TRAIN_LOG = []
for agg in CFG['aggs']:
    for seed in (0, 1):
        model, acc, val = train_model(agg, seed)
        TRAIN_LOG.append({'agg': agg, 'seed': seed, 'val_acc': acc})
        if acc >= CFG['train_gate']:
            MODELS[agg] = (model, val)
            break
    else:
        MODELS[agg] = None
RES['train_log'] = TRAIN_LOG
RES['gate_pass'] = {a: (MODELS.get(a) is not None) for a in CFG['aggs']}
print('gate:', RES['gate_pass'], flush=True)"""})

CELLS.append({'cell_type': 'code', 'execution_count': None, 'metadata': {}, 'outputs': [], 'source': """# P1 置换不变性：val 全量 200 样本 × 20 置换，batch=1 CPU float32
import numpy as np, torch, json

P1 = {'trials': CFG['perm_trials'], 'per_sample_max_diff': {}, 'determinism_ok': None}
if MODELS.get('max'):
    model, (vx, vy) = MODELS['max']
    rng = np.random.default_rng(42)
    all_max = []
    first_double = None
    with torch.no_grad():
        for si in range(len(vx)):
            x0 = torch.tensor(vx[si:si + 1])
            l0 = model(x0)[0][0]
            if si == 0:
                l0b = model(x0)[0][0]
                P1['determinism_ok'] = bool(torch.equal(l0, l0b))
            m = 0.0
            for _ in range(CFG['perm_trials']):
                p = torch.tensor(rng.permutation(CFG['n_pts']))
                l1 = model(x0[:, p, :])[0][0]
                m = max(m, float((l0 - l1).abs().max()))
            all_max.append(m)
    all_max = np.array(all_max)
    P1['max_abs_logit_diff_global'] = float(all_max.max())
    P1['n_samples_gt_1e-6'] = int((all_max > CFG['band_identical']).sum())
    P1['n_samples_gt_1e-3'] = int((all_max > CFG['band_noisy']).sum())
    if all_max.max() < CFG['band_identical']:
        P1['verdict'] = 'SUPPORT: bitwise-identical under permutation (float32 CPU)'
    elif all_max.max() <= CFG['band_noisy']:
        P1['verdict'] = 'NUMERICAL_NOISE band (1e-6..1e-3), recorded'
    else:
        P1['verdict'] = 'FALSIFIER-1 DIRECTION HIT: permutation changes output >1e-3'
else:
    P1['verdict'] = 'SKIPPED: max model failed train gate'
RES['p1'] = P1
with open('/kaggle/working/results/pointnet-perm/metrics.json', 'w') as f:
    json.dump(P1, f, indent=1)
print(json.dumps(P1, ensure_ascii=False)[:800], flush=True)"""})

CELLS.append({'cell_type': 'code', 'execution_count': None, 'metadata': {}, 'outputs': [], 'source': """# P2 骨架鲁棒性：骨架点=池化前 256 维各维 argmax；只扰非骨架点（<=10%）；max/mean/sum 三聚合对照
import numpy as np, torch, json

P2 = {'noise_sigma': CFG['noise_sigma'], 'frac': CFG['skel_frac'], 'per_agg': {}}
if MODELS.get('max'):
    vx, vy = MODELS['max'][1]
    rng = np.random.default_rng(7)
    for agg in CFG['aggs']:
        entry = MODELS.get(agg)
        if not entry:
            P2['per_agg'][agg] = 'SKIPPED (gate fail)'
            continue
        model, _ = entry
        rels_noise, rels_del, flips_n, flips_d = [], [], 0, 0
        with torch.no_grad():
            for si in range(len(vx)):
                pts = vx[si].copy()
                x0 = torch.tensor(pts[None])
                head0, y0 = model(x0)
                g0 = y0[0]                                  # 256-d pre-head global feature
                skel = y0[0].argmax(dim=1).numpy()          # per-dim argmax point idx
                nonskel = np.setdiff1d(np.arange(CFG['n_pts']), skel)
                k = min(int(CFG['skel_frac'] * CFG['n_pts']), len(nonskel))
                sel = rng.choice(nonskel, size=k, replace=False)
                radius = float(np.linalg.norm(pts, axis=1).max())
                # (a) gaussian noise on selected non-skeleton points
                pts2 = pts.copy(); pts2[sel] += rng.normal(0, CFG['noise_sigma'] * radius, (k, 3)).astype('float32')
                head1, y1 = model(torch.tensor(pts2[None]))
                rels_noise.append(float((g0 - y1[0]).norm() / (g0.norm() + 1e-12)))
                flips_n += int(head1[0].argmax() != head0[0].argmax())
                # (b) delete selected non-skeleton points
                keep = np.setdiff1d(np.arange(CFG['n_pts']), sel)
                head2, y2 = model(torch.tensor(pts[keep][None]))
                rels_del.append(float((g0 - y2[0]).norm() / (g0.norm() + 1e-12)))
                flips_d += int(head2[0].argmax() != head0[0].argmax())
        rel_n, rel_d = float(np.median(rels_noise)), float(np.median(rels_del))
        fr_n, fr_d = flips_n / len(vx), flips_d / len(vx)
        P2['per_agg'][agg] = {
            'rel_l2_noise_median': rel_n, 'rel_l2_delete_median': rel_d,
            'flip_rate_noise': fr_n, 'flip_rate_delete': fr_d,
            'support_band': bool(max(rel_n, rel_d) < CFG['feat_rel_l2'] and max(fr_n, fr_d) <= CFG['flip_rate'])}
    m = P2['per_agg'].get('max', {})
    others = [v for k2, v in P2['per_agg'].items() if k2 != 'max' and isinstance(v, dict)]
    if m and others:
        worst_other = max(max(v['rel_l2_noise_median'], v['rel_l2_delete_median']) for v in others)
        m['max_not_more_sensitive_than_others'] = bool(
            max(m['rel_l2_noise_median'], m['rel_l2_delete_median']) <= worst_other)
        if not m['max_not_more_sensitive_than_others']:
            P2['verdict'] = 'FALSIFIER-2 DIRECTION HIT: max more noise-sensitive than mean/sum'
        elif m['support_band']:
            P2['verdict'] = 'SUPPORT: skeleton robustness band passed (preset criteria)'
        else:
            P2['verdict'] = 'OUT-OF-BAND: recorded, not falsifier-grade'
    else:
        P2['verdict'] = 'PARTIAL: gate-limited aggregations'
else:
    P2['verdict'] = 'SKIPPED: gate fail'
RES['p2'] = P2
with open('/kaggle/working/results/pointnet-skel/metrics.json', 'w') as f:
    json.dump(P2, f, indent=1)
print(P2.get('verdict'), flush=True)
for a, v in P2['per_agg'].items():
    print(a, v if isinstance(v, str) else json.dumps(v), flush=True)"""})

CELLS.append({'cell_type': 'code', 'execution_count': None, 'metadata': {}, 'outputs': [], 'source': """# P3 官方实现核查：charlesq34/pointnet 权重共享与对称聚合（只读代码事实，不跑其训练栈）
import subprocess, json, os, time

P3 = {'repo': 'https://github.com/charlesq34/pointnet', 'checked_at': time.strftime('%F %T'), 'facts': []}
def sh(cmd, timeout=300):
    try:
        r = subprocess.run(['bash', '-lc', cmd], capture_output=True, text=True, timeout=timeout)
        return r.returncode, ((r.stdout or '') + '\\n' + (r.stderr or ''))[-2500:]
    except subprocess.TimeoutExpired:
        return 124, 'TIMEOUT'

rc, out = sh('rm -rf /kaggle/tmp/pointnet && git clone --depth 1 https://github.com/charlesq34/pointnet /kaggle/tmp/pointnet 2>&1 | tail -1')
P3['clone_rc'] = rc
if rc == 0:
    rc2, out2 = sh('cd /kaggle/tmp/pointnet && git log -1 --format=%H && head -30 classify.py | grep -n import | head -6')
    P3['head'] = out2.strip()[:300]
    rc3, out3 = sh("cd /kaggle/tmp/pointnet && grep -n 'Conv1d\\|Conv2d' pointnet_util.py model.py 2>/dev/null | head -12")
    P3['conv_lines'] = out3.strip()[:1200]
    rc4, out4 = sh("cd /kaggle/tmp/pointnet && grep -n 'max\\|pool' pointnet_util.py model.py 2>/dev/null | grep -i 'pool\\|max' | head -8")
    P3['pool_lines'] = out4.strip()[:800]
    P3['facts'].append('逐点共享权重 = 1x1 Conv（见 conv_lines）；聚合 = max pool（见 pool_lines）——逐字行为仓库事实，与卡 falsifier2 的对照由收割时人工复核两段行文本定论')
else:
    P3['error'] = out[-400:]
RES['p3'] = P3
with open('/kaggle/working/results/pointnet-perm/official_code_check.json', 'w') as f:
    json.dump(P3, f, indent=1)
print(json.dumps(P3, ensure_ascii=False)[:1000], flush=True)"""})

CELLS.append({'cell_type': 'code', 'execution_count': None, 'metadata': {}, 'outputs': [], 'source': """# P4 MobileNetV1 计算量算术：式(2)/(5) 比值 + Table 4 逐层重建（Mult-Adds；stride-2 块的 PW/标准卷积按输出分辨率计）
import json, csv, math

def blocks_v1():
    # (in, out, stride)：dw 用输入分辨率，pw/标准 conv 用输出分辨率（本口径复算 Table 4）
    return [(32, 64, 1), (64, 128, 2), (128, 128, 1), (128, 256, 2), (256, 256, 1),
            (256, 512, 2)] + [(512, 512, 1)] * 5 + [(512, 1024, 2), (1024, 1024, 1)]

def macs(stem_in=3, stem_out=32, in_res=224, blocks=None, conv_mobile=False, fc=1024 * 1000):
    rows, total = [], 0
    h = w = in_res // 2                                  # stem s2 -> 112
    m = h * w * stem_in * stem_out * 9
    total += m; rows.append(('stem_conv3x3', stem_in, stem_out, 2, h * w, m))
    for (cin, cout, s) in (blocks or blocks_v1()):
        ho = h // 2 if s == 2 else h
        if conv_mobile:
            m = ho * ho * cin * cout * 9
            rows.append((f'conv3x3_{cin}-{cout}_s{s}', cin, cout, s, ho * ho, m))
        else:
            mdw = h * w * cin * 9                        # dw 保持输入分辨率
            mpw = ho * ho * cin * cout
            m = mdw + mpw
            rows.append((f'dsc_{cin}-{cout}_s{s}', cin, cout, s, ho * ho, m, mdw, mpw))
        h = ho
    m = fc; total += m; rows.append(('fc', 1024, 1000, 1, 1, m))
    return total, rows

dsc_total, dsc_rows = macs(conv_mobile=False)
conv_total, conv_rows = macs(conv_mobile=True)
ratio = conv_total / dsc_total
P4 = {'dsc_total_macs': dsc_total, 'conv_total_macs': conv_total,
      'ratio_recomputed': ratio, 'paper': {'conv': 4866e6, 'dsc': 569e6, 'ratio': 4866 / 569},
      'dev_conv_pct': (conv_total - 4866e6) / 4866e6 * 100,
      'dev_dsc_pct': (dsc_total - 569e6) / 569e6 * 100,
      'ratio_grid_N72plus': {str(n): 1 / (1 / n + 1 / 9) for n in [72, 96, 128, 256, 512, 1024]},
      'ratio_grid_all_in_8_9x': all(8.0 <= 1 / (1 / n + 1 / 9) <= 9.0 for n in [72, 96, 128, 256, 512, 1024])}
P4['verdict'] = ('SUPPORT' if (P4['ratio_grid_all_in_8_9x'] and abs(P4['dev_conv_pct']) < 2 and abs(P4['dev_dsc_pct']) < 2)
                 else ('DEVIATION_RECORDED' if max(abs(P4['dev_conv_pct']), abs(P4['dev_dsc_pct'])) < 5 else 'FALSIFIER-2-COMPUTE DIRECTION'))
RES['p4'] = P4
with open('/kaggle/working/results/mobilenet-dsc/metrics.json', 'w') as f:
    json.dump(P4, f, indent=1)
with open('/kaggle/working/results/mobilenet-dsc/layers.csv', 'w', newline='') as f:
    wcsv = csv.writer(f); wcsv.writerow(['layer', 'in', 'out', 'stride', 'out_hw', 'macs'])
    for r in dsc_rows: wcsv.writerow(r[:6])
    for r in conv_rows: wcsv.writerow(r[:6])
print(json.dumps({k: P4[k] for k in ['dsc_total_macs', 'conv_total_macs', 'ratio_recomputed', 'dev_conv_pct', 'dev_dsc_pct', 'verdict']}, indent=1), flush=True)"""})

CELLS.append({'cell_type': 'code', 'execution_count': None, 'metadata': {}, 'outputs': [], 'source': """# 汇总：结果落盘 + 三行结论摘要
import json, time, hashlib, os

RES['finished'] = time.strftime('%F %T')
with open('/kaggle/working/results/experiment-summary.json', 'w') as f:
    json.dump(RES, f, ensure_ascii=False, indent=1)
print('=== CONCLUSION 1 (P1 permutation) ===', RES['p1'].get('verdict'))
print('=== CONCLUSION 2 (P2 skeleton) ===', RES.get('p2', {}).get('verdict'))
print('=== CONCLUSION 3 (P4 mobile arithmetic) ===', RES.get('p4', {}).get('verdict'))
for root, _, files in os.walk('/kaggle/working/results'):
    for fn in sorted(files):
        p = os.path.join(root, fn)
        print(p, os.path.getsize(p), hashlib.sha256(open(p, 'rb').read()).hexdigest()[:16])"""})

NB = {'cells': CELLS, 'metadata': {
    'kernelspec': {'display_name': 'Python 3', 'language': 'python', 'name': 'python3'},
    'language_info': {'name': 'python', 'version': '3.10'}}, 'nbformat': 4, 'nbformat_minor': 4}

with open('probe-pointnet-mobilenet.ipynb', 'w') as f:
    json.dump(NB, f, ensure_ascii=False, indent=1)
print('cells:', len(CELLS))
