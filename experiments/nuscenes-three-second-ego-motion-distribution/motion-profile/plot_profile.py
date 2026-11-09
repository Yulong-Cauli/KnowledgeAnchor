"""Publication-style static figures drawn only from archived profile evidence."""
import csv
import gzip
import hashlib
import json
from pathlib import Path
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.ticker as mtick
from matplotlib import font_manager
import numpy as np

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "figures"
OUT.mkdir(exist_ok=True)
RESULTS = ROOT / "results"
profile = json.loads((RESULTS / "profile.json").read_text(encoding="utf-8"))
font = Path("C:/Windows/Fonts/msyh.ttc")
if font.exists():
    font_manager.fontManager.addfont(str(font))
    plt.rcParams["font.family"] = font_manager.FontProperties(fname=str(font)).get_name()
plt.rcParams.update({"font.size": 10, "axes.titlesize": 12, "axes.labelsize": 10,
                     "axes.spines.top": False, "axes.spines.right": False,
                     "axes.grid": True, "grid.alpha": .18, "svg.fonttype": "path"})
samples = []
for split in ("train", "val", "test"):
    with gzip.open(RESULTS / f"profile-samples-{split}.csv.gz", "rt", encoding="utf-8", newline="") as stream:
        samples += list(csv.DictReader(stream))
for row in samples:
    for key in ("abs_endpoint_lateral_m", "max_abs_lateral_m", "mean_speed_mps", "start_speed_mps"):
        row[key] = float(row[key]) if row[key] else None

def curve(axis, values, label, **kwargs):
    x = np.sort([v for v in values if v is not None])
    if len(x):
        axis.step(x, np.arange(1, len(x) + 1) / len(x), where="post", label=label, linewidth=1.65, **kwargs)

def cdf_axes(axis, xlabel, xlim):
    axis.set(xlabel=xlabel, ylabel="累计样本比例", xlim=xlim, ylim=(0, 1.01))
    axis.yaxis.set_major_formatter(mtick.PercentFormatter(1))

fig, axes = plt.subplots(2, 2, figsize=(13.2, 9.2), constrained_layout=True)
curve(axes[0, 0], [r['abs_endpoint_lateral_m'] for r in samples], '终点横向位移', color='#1766a5')
curve(axes[0, 0], [r['max_abs_lateral_m'] for r in samples], '窗口最大横向位移', color='#dc7c26', linestyle='--')
cdf_axes(axes[0, 0], '横向位移（米）', (0, 10))
axes[0, 0].axvline(2, color='#777777', linestyle=':', linewidth=1)
axes[0, 0].set_title('(a) 横向位移分布：34,157 个有效窗口')
axes[0, 0].legend(loc='lower right', frameon=False)
curve(axes[0, 1], [r['start_speed_mps'] for r in samples], '起点速度估计（33,157 个）', color='#1766a5')
curve(axes[0, 1], [r['mean_speed_mps'] for r in samples], '窗口平均速度（34,157 个）', color='#dc7c26', linestyle='--')
max_speed = max(r['mean_speed_mps'] for r in samples)
max_speed = max(max_speed, max(r['start_speed_mps'] or 0 for r in samples))
cdf_axes(axes[0, 1], '速度（m/s）', (0, max_speed * 1.03))
axes[0, 1].set_title('(b) 速度分布：两种定义分别统计')
axes[0, 1].legend(loc='lower right', frameon=False)
edges = profile['definitions']['speed_edges_mps']
palette = plt.cm.viridis(np.linspace(.08, .9, len(edges)))
for axis, metric, title in [(axes[1, 0], 'start_speed_mps', '(c) 按起点速度估计分组'),
                            (axes[1, 1], 'mean_speed_mps', '(d) 按窗口平均速度分组')]:
    for i, lo in enumerate(edges):
        hi = edges[i + 1] if i + 1 < len(edges) else None
        group = [r for r in samples if r[metric] is not None and r[metric] >= lo and (hi is None or r[metric] < hi)]
        interval = f'[{lo:g}, {hi:g})' if hi is not None else f'≥{lo:g}'
        curve(axis, [r['abs_endpoint_lateral_m'] for r in group], f'{interval} m/s（n={len(group):,}）', color=palette[i])
    cdf_axes(axis, '终点横向位移（米）', (0, 10))
    axis.axvline(2, color='#777777', linestyle=':', linewidth=1)
    axis.set_title(title)
    axis.legend(loc='lower right', frameon=False, fontsize=8)
fig.suptitle('nuScenes v1.0 自车运动分布｜全部 1,000 段记录、约 3 秒窗口\n速度 ≥20 m/s 组无样本；横向位移曲线展示 0–10 米范围', fontsize=14)
fig.savefig(OUT / 'motion-profile.png', dpi=220)
fig.savefig(OUT / 'motion-profile.svg')
plt.close(fig)

groups = profile['speed_conditioned']
labels = [f'{lo:g}–{edges[i+1]:g}' if i + 1 < len(edges) else f'≥{lo:g}' for i, lo in enumerate(edges)]
fig, axes = plt.subplots(2, 1, figsize=(11.4, 8), constrained_layout=True)
x = np.arange(len(edges))
for j, (metric, label, color) in enumerate([('start_speed_mps', '起点速度估计', '#1766a5'), ('mean_speed_mps', '窗口平均速度', '#dc7c26')]):
    selected = [r for r in groups if r['scope'] == 'all' and r['speed_metric'] == metric and r['group_kind'] == 'bin']
    assert len(selected) == len(edges)
    offset = -.19 if j == 0 else .19
    axes[0].bar(x + offset, [r['fraction_of_speed_eligible'] for r in selected], .36, color=color, label=label)
    bars = axes[1].bar(x + offset, [r['endpoint_lt_2m_ratio'] if r['n'] else np.nan for r in selected], .36, color=color, label=label)
    for bar, row in zip(bars, selected):
        if row['n']:
            axes[1].text(bar.get_x() + bar.get_width()/2, bar.get_height()+.014, f"n={row['n']:,}",
                         ha='center', va='bottom', fontsize=8, rotation=35)
for axis in axes:
    axis.set_xticks(x, labels)
    axis.set_xlim(-.6, len(edges)-.4)
    axis.set_xlabel('速度分组（m/s，左闭右开；1 m/s = 3.6 km/h）')
    axis.yaxis.set_major_formatter(mtick.PercentFormatter(1))
    axis.legend(frameon=False, loc='upper right')
axes[0].set_ylabel('该速度组占比')
axes[0].set_title('(a) 各速度组的样本分布')
axes[0].set_ylim(0, max(r['fraction_of_speed_eligible'] for r in groups if r['scope']=='all' and r['group_kind']=='bin')*1.18)
axes[1].set_ylabel('横向位移 <2 米的比例')
axes[1].set_title('(b) 同一阈值在不同速度组中的占比')
axes[1].set_ylim(0, 1.16)
axes[1].set_yticks(np.linspace(0, 1, 6))
axes[1].text(x[-1], .5, '无样本', ha='center', va='center', color='#777777')
fig.suptitle('速度分组与低横向位移占比', fontsize=15)
fig.savefig(OUT / 'speed-groups.png', dpi=220)
fig.savefig(OUT / 'speed-groups.svg')
plt.close(fig)
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
for vector in OUT.glob('*.svg'):
    vector.write_bytes(('\n'.join(line.rstrip() for line in vector.read_text(encoding='utf-8').splitlines())+'\n').encode('utf-8'))
record = {'source_profile_sha256': sha(RESULTS/'profile.json'), 'plot_script_sha256': sha(Path(__file__)),
          'matplotlib_version': matplotlib.__version__, 'numpy_version': np.__version__,
          'curve_boundary': 'ECDF uses <=; threshold tables and bar proportions use strict <',
          'cdf_lateral_axis_m': [0, 10]}
(OUT/'plot-provenance.json').write_bytes((json.dumps(record,indent=2)+'\n').encode())
(OUT/'sha256-manifest.txt').write_bytes(('\n'.join(f'{sha(p)}  {p.name}' for p in sorted(OUT.iterdir()) if p.is_file() and p.name!='sha256-manifest.txt')+'\n').encode())
print('Rendered distribution and speed-group figures from archived rows.')
