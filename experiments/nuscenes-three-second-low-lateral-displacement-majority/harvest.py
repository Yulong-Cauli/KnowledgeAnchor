"""Verify downloaded output and archive compact evidence without rewriting it."""
import csv
import gzip
import hashlib
import json
import shutil
from pathlib import Path
from census import sha256_file, json_write, summarize

ROOT = Path(__file__).resolve().parent
download = ROOT / "data/run-v1"
out = ROOT / "results"
out.mkdir(exist_ok=True)
kernel_manifest = []
unavailable_platform_files = []
for line in (download / "sha256-manifest.txt").read_text(encoding="utf-8").splitlines():
    sha, name = line.split(None, 1)
    if name == "__notebook__.ipynb" and not (download / name).exists():
        unavailable_platform_files.append({"name": name, "sha256_at_execution": sha,
                                           "reason": "Kaggle working-directory internal notebook not returned by output API; code-cell equality checked through kernels pull"})
        continue
    assert sha256_file(download / name) == sha, f"Downloaded hash mismatch: {name}"
    kernel_manifest.append({"name": name, "sha256": sha})
local = json.loads((ROOT / "motion-census.ipynb").read_text(encoding="utf-8"))
pulled_path = next((ROOT / "data/pulled-v1").glob("*.ipynb"))
pulled = json.loads(pulled_path.read_text(encoding="utf-8"))
code = lambda n: ["".join(c["source"]) for c in n["cells"] if c["cell_type"] == "code"]
assert code(local) == code(pulled), "Local code differs from actual submitted code"
assert code(local)[0] == (ROOT / "census.py").read_text(encoding="utf-8")
result = json.loads((download / "results.json").read_text(encoding="utf-8"))
assert result["provenance"]["code_sha256"] == sha256_file(ROOT / "census.py")
protocol_file = ROOT / "README-trainval-v1.md"
if not protocol_file.exists():
    protocol_file = ROOT / "README.md"
assert result["provenance"]["protocol_readme_sha256"] == sha256_file(protocol_file)
official = json.loads((download / "official-comparison.json").read_text(encoding="utf-8"))
assert official["status"] == "matched" and len(official["files"]) == 4

# Recompute every split/state summary directly from archived per-sample metrics.
with (download / "sample-metrics.csv").open(encoding="utf-8", newline="") as f:
    rows = list(csv.DictReader(f))
assert len(rows) == 29049 and len({r["sample_token"] for r in rows}) == len(rows)
for row in rows:
    for key in ("primary_low_lateral", "endpoint_only_excursion", "crosscheck_eligible"):
        assert row[key] in ("True", "False")
        row[key] = row[key] == "True"
    for key in ("abs_endpoint_lateral_m", "max_abs_lateral_m", "path_length_m"):
        row[key] = float(row[key])
    assert row["primary_low_lateral"] == (row["abs_endpoint_lateral_m"] < 2)
    assert row["max_abs_lateral_m"] >= row["abs_endpoint_lateral_m"]
for name, expected in result["populations"].items():
    split, state = name.split("_", 1)
    selected = [r for r in rows if (split == "trainval" or r["split"] == split) and
                (state == "all" or r["motion_state"] == state or
                 state == "non_stopped" and r["motion_state"] != "stopped")]
    assert summarize(selected) == expected, "Population differs from sample metrics: " + name

with (download / "sensitivity.csv").open(encoding="utf-8", newline="") as f:
    sensitivity = list(csv.DictReader(f))
for row in sensitivity:
    selected = [r for r in rows if (row["split"] == "trainval" or r["split"] == row["split"]) and
                (row["motion_state"] == "all" or r["motion_state"] == row["motion_state"] or
                 row["motion_state"] == "non_stopped" and r["motion_state"] != "stopped")]
    hits = sum(float(r[row["metric"]]) < float(row["threshold"]) for r in selected)
    assert hits == int(row["count"]) and len(selected) == int(row["n"])
    assert not selected or float(row["ratio"]) == hits / len(selected)

for path in download.iterdir():
    if path.name == "sample-metrics.csv":
        # Original is >5MB; archive losslessly with a deterministic gzip header.
        with (out / "sample-metrics.csv.gz").open("wb") as target:
            with gzip.GzipFile(filename="", mode="wb", fileobj=target, mtime=0) as compressed:
                compressed.write(path.read_bytes())
        assert gzip.decompress((out / "sample-metrics.csv.gz").read_bytes()) == path.read_bytes()
    elif path.name == "sha256-manifest.txt":
        shutil.copyfile(path, out / "kernel-output-sha256.txt")
    elif path.suffix == ".log":
        shutil.copyfile(path, out / "kaggle-execution-log.txt")
    else:
        shutil.copyfile(path, out / path.name)
shutil.copyfile(ROOT / "data/pulled-v1/kernel-metadata.json", ROOT / "sources/executed-kernel-metadata.json")
json_write(out / "harvest.json", {
    "kaggle_kernel_url": "https://www.kaggle.com/code/cauliyulong/claim-nuscenes-low-lateral-census",
    "kaggle_version_number": 1,
    "version_record": "sources/kernel-version.json",
    "executed_code_cells_equal_local": True,
    "local_notebook_sha256": sha256_file(ROOT / "motion-census.ipynb"),
    "downloaded_notebook_sha256": sha256_file(pulled_path),
    "sample_csv_original_sha256": sha256_file(download / "sample-metrics.csv"),
    "sample_csv_archive": "sample-metrics.csv.gz",
    "sample_csv_lossless_roundtrip": True,
    "kernel_output_hashes_checked": kernel_manifest,
    "unavailable_platform_files": unavailable_platform_files,
    "all_15_population_summaries_recomputed_from_sample_rows": True,
    "all_sensitivity_rows_recounted": len(sensitivity),
    "actual_kernel_slug_note": "launch provenance preserves requested slug; API returned claim-nuscenes-low-lateral-census",
    "clock_note": "client date is 2026-11-08; raw API last_run_time is retained separately and differs from execution log date",
})
manifest = [f"{sha256_file(p)}  {p.name}" for p in sorted(out.iterdir())
            if p.is_file() and p.name != "sha256-manifest.txt"]
(out / "sha256-manifest.txt").write_text("\n".join(manifest) + "\n", encoding="utf-8")
assert all(p.stat().st_size < 5_000_000 for p in out.iterdir() if p.is_file())
print("Verified execution code, official metadata hashes, all 15 populations, 210 sensitivity rows, and lossless sample archive.")
