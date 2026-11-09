"""Independently check full-profile outputs against NumPy and old rows."""
import csv
import gzip
import hashlib
import json
import math
import shutil
from collections import Counter
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parent
PARENT = ROOT.parent
download = ROOT / "data/run-v1"
pulled = ROOT / "data/pulled-v1"
out = ROOT / "results"
out.mkdir(exist_ok=True)
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
checked = []
for line in (download / "sha256-manifest.txt").read_text(encoding="utf-8").splitlines():
    expected, name = line.split(None, 1)
    assert sha(download / name) == expected, name
    checked.append({"name": name, "sha256": expected})
local_nb, remote_nb = ROOT / "motion-profile.ipynb", next(pulled.glob("*.ipynb"))
code = lambda p: ["".join(c["source"]) for c in json.loads(p.read_text(encoding="utf-8"))["cells"] if c["cell_type"] == "code"]
assert code(local_nb) == code(remote_nb)
assert code(local_nb)[0] == (PARENT / "census.py").read_text(encoding="utf-8")
assert code(local_nb)[1] == (ROOT / "profile_stats.py").read_text(encoding="utf-8")
profile = json.loads((download / "profile.json").read_text(encoding="utf-8"))
for file, key in [(PARENT / "census.py", "measurement_code_sha256"), (ROOT / "profile_stats.py", "analysis_code_sha256"),
                  (ROOT / "README.md", "protocol_readme_sha256"), (PARENT / "all-splits/sources/splits-all.json", "splits_manifest_sha256")]:
    assert sha(file) == profile["provenance"][key]

STRING_FIELDS = {"sample_token", "scene", "split", "motion_state", "start_speed_missing_reason"}
BOOL_FIELDS = {"crosscheck_eligible", "primary_low_lateral", "endpoint_only_excursion"}
def read_samples(path):
    with gzip.open(path, "rt", encoding="utf-8", newline="") as stream:
        rows = list(csv.DictReader(stream))
    for row in rows:
        for key, value in list(row.items()):
            if key in STRING_FIELDS:
                continue
            if key in BOOL_FIELDS:
                assert value in ("True", "False")
                row[key] = value == "True"
            else:
                row[key] = float(value) if value else None
    return rows

rows = []
for split in ("train", "val", "test"):
    loaded = read_samples(download / f"profile-samples-{split}.csv.gz")
    assert {r["split"] for r in loaded} == {split}
    rows += loaded
assert len(rows) == len({r["sample_token"] for r in rows}) == 34157
baseline = {r["sample_token"]: r for r in read_samples(PARENT / "all-splits/results/sample-metrics.csv.gz")}
assert set(baseline) == {r["sample_token"] for r in rows}
missing = Counter()
for row in rows:
    assert all(row[key] == value for key, value in baseline[row["sample_token"]].items())
    assert math.isclose(row["mean_speed_mps"], row["path_length_m"] / row["horizon_seconds"], rel_tol=1e-14)
    if row["start_speed_mps"] is None:
        assert row["start_speed_missing_reason"] == "first_keyframe" and row["start_speed_interval_seconds"] is None
        missing[row["scene"]] += 1
    else:
        assert row["start_speed_mps"] >= 0 and row["start_speed_interval_seconds"] > 0
        assert row["start_speed_missing_reason"] == ""
assert len(missing) == 1000 and set(missing.values()) == {1}

def selected(scope):
    return [r for r in rows if scope == "all" or r["split"] == scope or scope == "trainval" and r["split"] in ("train", "val")]

qs = {"min": 0, "p10": .1, "p25": .25, "p50": .5, "p75": .75, "p90": .9, "p95": .95, "p99": .99, "max": 1}
for summary in profile["quantiles"]:
    base = selected(summary["scope"])
    values = np.array([r[summary["metric"]] for r in base if r[summary["metric"]] is not None])
    assert len(values) == summary["n"] and len(base) - len(values) == summary["missing_n"]
    for key, q in qs.items():
        assert np.isclose(np.quantile(values, q, method="linear"), summary[key], rtol=1e-12, atol=1e-12)
    assert np.isclose(values.mean(), summary["mean"], rtol=1e-12, atol=1e-12)
    assert np.isclose(values.std(ddof=0), summary["population_std"], rtol=1e-12, atol=1e-12)
for threshold in profile["lateral_thresholds"]:
    base = selected(threshold["scope"])
    hits = sum(r[threshold["metric"]] < threshold["threshold_m"] for r in base)
    assert hits == threshold["count_lt"] and len(base) == threshold["n"] and hits / len(base) == threshold["fraction_lt"]
for group in profile["speed_conditioned"]:
    base = selected(group["scope"])
    eligible = [r for r in base if r[group["speed_metric"]] is not None]
    sample = [r for r in eligible if r[group["speed_metric"]] >= group["speed_lo_mps"] and
              (group["speed_hi_mps"] is None or r[group["speed_metric"]] < group["speed_hi_mps"])]
    assert len(sample) == group["n"] and len(eligible) == group["eligible_n"]
    assert len(base) - len(eligible) == group["missing_speed_n"]
    assert len({r["scene"] for r in sample}) == group["n_scenes"]
    for prefix, field in [("endpoint", "abs_endpoint_lateral_m"), ("maximum", "max_abs_lateral_m")]:
        for key, q in [("p50", .5), ("p90", .9), ("p95", .95)]:
            expected = np.quantile([r[field] for r in sample], q, method="linear") if sample else None
            actual = group[f"{prefix}_{key}_m"]
            assert actual is None if expected is None else np.isclose(expected, actual, rtol=1e-12, atol=1e-12)
        for limit in profile["definitions"]["lateral_thresholds_m"]:
            count = sum(r[field] < limit for r in sample)
            key = f"{prefix}_lt_{limit:g}m"
            assert count == group[key + "_count"]
            assert group[key + "_ratio"] == (count / len(sample) if sample else None)

for metric in ("abs_endpoint_lateral_m", "max_abs_lateral_m", "mean_speed_mps", "start_speed_mps"):
    values = np.sort([r[metric] for r in rows if r[metric] is not None])
    with gzip.open(download / f"ecdf-{metric}.csv.gz", "rt", encoding="utf-8", newline="") as stream:
        curve = list(csv.DictReader(stream))
    assert len(curve) == len(np.unique(values))
    x = np.array([float(r["value"]) for r in curve])
    left, right = np.searchsorted(values, x, side="left"), np.searchsorted(values, x, side="right")
    assert np.array_equal(left, [int(r["count_lt"]) for r in curve])
    assert np.array_equal(right, [int(r["count_le"]) for r in curve])
    assert all(int(r["n"]) == len(values) for r in curve)

# CSV tables must be exact representations of the corresponding JSON rows.
for file, key in [("quantiles.csv", "quantiles"), ("lateral-thresholds.csv", "lateral_thresholds"), ("speed-conditioned.csv", "speed_conditioned")]:
    with (download / file).open(encoding="utf-8", newline="") as stream:
        csv_rows = list(csv.DictReader(stream))
    assert len(csv_rows) == len(profile[key])
    for raw, actual in zip(csv_rows, profile[key]):
        for field, value in actual.items():
            assert raw[field] == "" if value is None else raw[field] == value if isinstance(value, str) else float(raw[field]) == value

for path in download.iterdir():
    target = "kernel-output-sha256.txt" if path.name == "sha256-manifest.txt" else "kaggle-execution-log.txt" if path.suffix == ".log" else path.name
    shutil.copyfile(path, out / target)
(ROOT / "sources").mkdir(exist_ok=True)
shutil.copyfile(pulled / "kernel-metadata.json", ROOT / "sources/executed-kernel-metadata.json")
record = {"kaggle_url": "https://www.kaggle.com/code/cauliyulong/claim-nuscenes-motion-profile", "version_number": 1,
          "code_cells_equal_submitted": True, "original_34157_rows_recomputed_equal": True,
          "start_speed_missing_first_frame_each_scene": 1000, "numpy_quantiles_checks": len(profile["quantiles"]),
          "threshold_rows_recounted": len(profile["lateral_thresholds"]), "speed_groups_recounted": len(profile["speed_conditioned"]),
          "full_ecdf_metrics_checked": 4, "numpy_version": np.__version__, "output_hashes_checked": checked,
          "local_notebook_sha256": sha(local_nb), "downloaded_notebook_sha256": sha(remote_nb)}
(out / "harvest.json").write_bytes((json.dumps(record, indent=2) + "\n").encode())
(out / "sha256-manifest.txt").write_bytes(("\n".join(f"{sha(p)}  {p.name}" for p in sorted(out.iterdir())
                                                     if p.is_file() and p.name != "sha256-manifest.txt") + "\n").encode())
assert all(p.stat().st_size < 5_000_000 for p in out.iterdir() if p.is_file())
print("Verified original rows, both speed definitions, 20 distributions, 90 threshold rows, 110 speed groups and 4 complete ECDFs.")
