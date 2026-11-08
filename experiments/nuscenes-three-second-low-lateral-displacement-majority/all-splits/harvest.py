"""Verify and archive all-split results; preserve trainval-v1 evidence."""
import csv
import gzip
import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT.parent))
import census
import extension

download = ROOT / "data/run-v1"
pulled = ROOT / "data/pulled-v1"
out = ROOT / "results"
out.mkdir(exist_ok=True)
checked = []
for line in (download / "sha256-manifest.txt").read_text(encoding="utf-8").splitlines():
    sha, name = line.split(None, 1)
    assert census.sha256_file(download / name) == sha, name
    checked.append({"name": name, "sha256": sha})
local_nb = ROOT / "all-splits-census.ipynb"
remote_nb = next(pulled.glob("*.ipynb"))
get_code = lambda p: ["".join(c["source"]) for c in json.loads(p.read_text(encoding="utf-8"))["cells"] if c["cell_type"] == "code"]
assert get_code(local_nb) == get_code(remote_nb)
assert get_code(local_nb)[0] == (ROOT.parent / "census.py").read_text(encoding="utf-8")
assert get_code(local_nb)[1] == (ROOT / "extension.py").read_text(encoding="utf-8")
result = json.loads((download / "results.json").read_text(encoding="utf-8"))
for file, key in [(ROOT.parent / "census.py", "measurement_code_sha256"), (ROOT / "extension.py", "extension_code_sha256"),
                  (ROOT / "README.md", "protocol_readme_sha256"), (ROOT / "sources/splits-all.json", "splits_manifest_sha256")]:
    assert census.sha256_file(file) == result["provenance"][key]
with gzip.open(download / "sample-metrics.csv.gz", "rt", encoding="utf-8", newline="") as stream:
    rows = extension.parse_sample_rows(list(csv.DictReader(stream)))
assert len(rows) == 34157 and len({r["sample_token"] for r in rows}) == len(rows)
assert {r["split"] for r in rows} == {"train", "val", "test"}
for name, expected in result["populations"].items():
    scope, state = name.split("_", 1)
    assert census.summarize(extension.select(rows, scope, state)) == expected, name
for row in rows:
    assert row["primary_low_lateral"] == (row["abs_endpoint_lateral_m"] < 2)
    assert row["max_abs_lateral_m"] >= row["abs_endpoint_lateral_m"]
    assert row["endpoint_only_excursion"] == (row["primary_low_lateral"] and row["max_abs_lateral_m"] >= 2)
with (download / "sensitivity.csv").open(encoding="utf-8", newline="") as stream:
    sensitivity = list(csv.DictReader(stream))
assert len(sensitivity) == 350
for row in sensitivity:
    selected = extension.select(rows, row["split"], row["motion_state"])
    count = sum(r[row["metric"]] < float(row["threshold"]) for r in selected)
    assert count == int(row["count"]) and len(selected) == int(row["n"])
    assert not selected or count / len(selected) == float(row["ratio"])
with gzip.open(ROOT.parent / "results/sample-metrics.csv.gz", "rt", encoding="utf-8", newline="") as stream:
    previous = extension.parse_sample_rows(list(csv.DictReader(stream)))
assert extension.select(rows, "trainval", "all") == previous, "Old per-sample metrics changed"
old_results = json.loads((ROOT.parent / "results/results.json").read_text(encoding="utf-8"))
for name, old in old_results["populations"].items():
    assert result["populations"][name] == old, name
with (download / "scene-metrics.csv").open(encoding="utf-8", newline="") as stream:
    scenes = list(csv.DictReader(stream))
assert len(scenes) == len({r["scene"] for r in scenes}) == 1000
for scene in scenes:
    selected = [r for r in rows if r["scene"] == scene["scene"]]
    assert len(selected) == int(scene["n"])
    assert sum(r["primary_low_lateral"] for r in selected) == int(scene["endpoint_lt_2m_count"])
for p in download.iterdir():
    if p.name == "sha256-manifest.txt":
        shutil.copyfile(p, out / "kernel-output-sha256.txt")
    elif p.suffix == ".log":
        shutil.copyfile(p, out / "kaggle-execution-log.txt")
    else:
        shutil.copyfile(p, out / p.name)
shutil.copyfile(pulled / "kernel-metadata.json", ROOT / "sources/executed-kernel-metadata.json")
census.json_write(out / "harvest.json", {
    "kaggle_url": "https://www.kaggle.com/code/cauliyulong/claim-nuscenes-all-census", "version_number": 1,
    "code_cells_equal_submitted": True, "downloaded_output_hashes_checked": checked,
    "local_notebook_sha256": census.sha256_file(local_nb), "downloaded_notebook_sha256": census.sha256_file(remote_nb),
    "trainval_all_sample_rows_unchanged": True, "old_15_populations_unchanged": True,
    "all_25_populations_recounted": True, "all_350_sensitivity_rows_recounted": True,
    "all_1000_scene_counts_recounted": True,
    "sample_rows": len(rows), "version_record": "../sources/kernel-version.json"})
(out / "sha256-manifest.txt").write_text("\n".join(f"{census.sha256_file(p)}  {p.name}" for p in sorted(out.iterdir())
                                                   if p.is_file() and p.name != "sha256-manifest.txt") + "\n", encoding="utf-8")
assert all(p.stat().st_size < 5_000_000 for p in out.iterdir() if p.is_file())
print("Verified unchanged trainval rows, all 25 populations, all 350 sensitivity rows and 1000 scene counts.")
