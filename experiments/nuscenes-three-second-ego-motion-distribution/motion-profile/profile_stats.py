"""Recompute ego motion and describe lateral displacement versus speed."""
import bisect
import csv
import gc
import gzip
import hashlib
import io
import json
import math
import os
import platform
import statistics
import subprocess
import sys
import tarfile
import tempfile
import time
import urllib.request
from collections import Counter
from pathlib import Path

SCOPES = ("all", "trainval", "train", "val", "test")
SPLITS = ("train", "val", "test")
METRICS = ("abs_endpoint_lateral_m", "max_abs_lateral_m", "mean_speed_mps", "start_speed_mps")
SPEEDS = ("start_speed_mps", "mean_speed_mps")
LATERAL_THRESHOLDS = (0.1, 0.25, 0.5, 1.0, 1.5, 2.0, 3.0, 5.0, 10.0)
SPEED_EDGES = (0.0, 0.5, 2.0, 5.0, 10.0, 15.0, 20.0)
TAIL_CUTS = (5.0, 10.0, 15.0, 20.0)
QUANTILES = {"min": 0.0, "p10": 0.1, "p25": 0.25, "p50": 0.5,
             "p75": 0.75, "p90": 0.9, "p95": 0.95, "p99": 0.99, "max": 1.0}
TABLES = ("scene.json", "sample.json", "sample_data.json", "ego_pose.json")
TEST_URL = "https://motional-nuscenes.s3.amazonaws.com/public/v1.0/v1.0-test_meta.tgz"


def file_hash(path):
    result = hashlib.sha256()
    with open(path, "rb") as stream:
        for block in iter(lambda: stream.read(1 << 20), b""):
            result.update(block)
    return result.hexdigest()


def save_json(path, value):
    Path(path).write_text(json.dumps(value, indent=2, ensure_ascii=False, allow_nan=False) + "\n", encoding="utf-8")


def write_csv(path, rows, compressed=False):
    def write(stream):
        writer = csv.DictWriter(stream, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    if compressed:
        with open(path, "wb") as raw:
            with gzip.GzipFile(filename="", fileobj=raw, mode="wb", mtime=0) as gz:
                with io.TextIOWrapper(gz, encoding="utf-8", newline="") as stream:
                    write(stream)
    else:
        with open(path, "w", encoding="utf-8", newline="") as stream:
            write(stream)


def describe(values):
    values = sorted(v for v in values if v is not None)
    if not values:
        return {"n": 0, "mean": None, "population_std": None, **{key: None for key in QUANTILES}}
    assert all(math.isfinite(v) for v in values)
    result = {"n": len(values), "mean": statistics.mean(values), "population_std": statistics.pstdev(values)}
    for key, q in QUANTILES.items():
        h = (len(values) - 1) * q
        left = math.floor(h)
        right = math.ceil(h)
        result[key] = values[left] + (values[right] - values[left]) * (h - left)
    return result


def average_speed(metrics):
    assert metrics["horizon_seconds"] > 0
    return metrics["path_length_m"] / metrics["horizon_seconds"]


def past_speed(previous, current):
    if previous is None:
        return None, None
    dt = (current[3] - previous[3]) / 1e6
    assert dt > 0, "Previous keyframe timestamp is not earlier"
    return math.hypot(current[0] - previous[0], current[1] - previous[1]) / dt, dt


def subset(rows, scope):
    return [r for r in rows if scope == "all" or r["split"] == scope or
            scope == "trainval" and r["split"] in ("train", "val")]


def decode_baseline(path):
    with gzip.open(path, "rt", encoding="utf-8", newline="") as stream:
        rows = list(csv.DictReader(stream))
    for row in rows:
        for key, value in list(row.items()):
            if key in ("sample_token", "scene", "split", "motion_state"):
                continue
            if key in ("crosscheck_eligible", "primary_low_lateral", "endpoint_only_excursion"):
                assert value in ("True", "False")
                row[key] = value == "True"
            else:
                row[key] = float(value) if value else None
    return {r["sample_token"]: r for r in rows}


def find_inputs(root):
    metadata, baseline = [], []
    for directory, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d.lower() not in ("samples", "sweeps", "maps") and not d.startswith(".")]
        if Path(directory).name == "v1.0-trainval" and set(TABLES) <= set(files):
            metadata.append(Path(directory))
        if {"sample-metrics.csv.gz", "results.json"} <= set(files):
            baseline.append(Path(directory))
    assert len(metadata) == len(baseline) == 1, (metadata, baseline)
    return metadata[0], baseline[0]


def official_test(meta, expected_hashes, log):
    info = {"url": TEST_URL, "files": {}}
    request = urllib.request.Request(TEST_URL, headers={"User-Agent": "KnowledgeAnchor-motion-profile"})
    with urllib.request.urlopen(request, timeout=90) as response:
        info.update({"http_status": response.status, "etag": response.headers.get("ETag"),
                     "last_modified": response.headers.get("Last-Modified"), "content_length": response.headers.get("Content-Length")})
        with tarfile.open(fileobj=response, mode="r|gz") as archive:
            for member in archive:
                name = member.name.replace("\\", "/").split("/")[-1]
                if member.isfile() and name in TABLES:
                    assert name not in info["files"]
                    with (meta / name).open("wb") as target:
                        source = archive.extractfile(member)
                        for block in iter(lambda: source.read(1 << 20), b""):
                            target.write(block)
                    sha = file_hash(meta / name)
                    assert sha == expected_hashes[name], "Changed official test metadata: " + name
                    info["files"][name] = {"sha256": sha, "bytes": member.size}
                    log("test input matched previous official bytes: " + name)
    assert set(info["files"]) == set(TABLES)
    return info


def collect(meta, version, split_manifest, baseline, core, log):
    def load(name):
        with (meta / name).open(encoding="utf-8") as stream:
            return json.load(stream)
    scenes, samples = load("scene.json"), load("sample.json")
    names = {s["name"] for s in scenes}
    expected_names = set(split_manifest["splits"]["test"]) if version == "test" else set(split_manifest["splits"]["train"] + split_manifest["splits"]["val"])
    assert names == expected_names
    assert len(samples) == (6008 if version == "test" else 34149)
    by_token = {s["token"]: s for s in samples}
    assert len(by_token) == len(samples)
    sd = load("sample_data.json")
    lidar = {}
    for row in sd:
        channel = row.get("filename", "").split("__")
        if row["is_key_frame"] and len(channel) >= 3 and channel[1] == "LIDAR_TOP":
            assert row["sample_token"] not in lidar
            lidar[row["sample_token"]] = (row["ego_pose_token"], row["timestamp"])
    assert set(lidar) == set(by_token)
    del sd
    gc.collect()
    needed = {v[0] for v in lidar.values()}
    ep = load("ego_pose.json")
    poses = {e["token"]: (e["translation"][0], e["translation"][1], core.quat_yaw(e["rotation"]), e["timestamp"])
             for e in ep if e["token"] in needed}
    assert set(poses) == needed
    del ep
    gc.collect()
    split_of = {name: split for split, entries in split_manifest["splits"].items() for name in entries}
    records, visited, no_previous = [], set(), 0
    for scene in sorted(scenes, key=lambda s: s["name"]):
        chain, token = [], scene["first_sample_token"]
        while token:
            assert token not in visited
            visited.add(token)
            sample = by_token[token]
            assert sample["scene_token"] == scene["token"]
            assert sample["prev"] == (chain[-1] if chain else "")
            chain.append(token)
            token = sample["next"]
        assert len(chain) == scene["nbr_samples"] and len(chain) >= 7 and chain[-1] == scene["last_sample_token"]
        sequence = []
        for token in chain:
            ep_token, timestamp = lidar[token]
            pose = poses[ep_token]
            assert pose[3] == timestamp
            sequence.append(pose)
        for i in range(len(chain) - 6):
            original = {"sample_token": chain[i], "scene": scene["name"], "split": split_of[scene["name"]],
                        **core.motion_metrics(sequence[i:i + 7])}
            assert original == baseline[chain[i]], "Original per-sample measurement changed: " + chain[i]
            speed, dt = past_speed(sequence[i - 1] if i else None, sequence[i])
            no_previous += speed is None
            records.append({**original, "mean_speed_mps": average_speed(original), "start_speed_mps": speed,
                            "start_speed_interval_seconds": dt, "start_speed_missing_reason": "first_keyframe" if speed is None else ""})
    assert visited == set(by_token)
    assert len(records) == (5108 if version == "test" else 29049)
    assert no_previous == len(scenes)
    log(f"{version}: recomputed {len(records)} original rows exactly; start-speed missing={no_previous}")
    return records


def group_result(rows, scope, speed_metric, kind, lo, hi):
    eligible = [r for r in rows if r[speed_metric] is not None]
    group = [r for r in eligible if r[speed_metric] >= lo and (hi is None or r[speed_metric] < hi)]
    endpoint = describe([r["abs_endpoint_lateral_m"] for r in group])
    maximum = describe([r["max_abs_lateral_m"] for r in group])
    result = {"scope": scope, "speed_metric": speed_metric, "group_kind": kind, "speed_lo_mps": lo,
              "speed_hi_mps": hi, "n": len(group), "eligible_n": len(eligible), "missing_speed_n": len(rows) - len(eligible),
              "n_scenes": len({r["scene"] for r in group}), "fraction_of_speed_eligible": len(group) / len(eligible) if eligible else None,
              "endpoint_p50_m": endpoint["p50"], "endpoint_p90_m": endpoint["p90"], "endpoint_p95_m": endpoint["p95"],
              "maximum_p50_m": maximum["p50"], "maximum_p90_m": maximum["p90"], "maximum_p95_m": maximum["p95"]}
    for threshold in LATERAL_THRESHOLDS:
        for field, prefix in (("abs_endpoint_lateral_m", "endpoint"), ("max_abs_lateral_m", "maximum")):
            count = sum(r[field] < threshold for r in group)
            key = f"{prefix}_lt_{threshold:g}m"
            result[key + "_count"] = count
            result[key + "_ratio"] = count / len(group) if group else None
    return result


def full_ecdf(values):
    counts = Counter(v for v in values if v is not None)
    n = sum(counts.values())
    cumulative = 0
    rows = []
    for value, count in sorted(counts.items()):
        rows.append({"value": value, "count_lt": cumulative, "count_le": cumulative + count,
                     "n": n, "fraction_lt": cumulative / n, "fraction_le": (cumulative + count) / n})
        cumulative += count
    return rows


def run_profile(core, provenance, split_manifest, expected, input_root="/kaggle/input", output="/kaggle/working"):
    started = time.time()
    out = Path(output)
    out.mkdir(parents=True, exist_ok=True)
    logfile = out / "run-log.txt"
    logfile.write_text("", encoding="utf-8")
    def log(message):
        line = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()) + " " + message
        print(line, flush=True)
        with logfile.open("a", encoding="utf-8") as stream:
            stream.write(line + "\n")
    try:
        log("started full motion profile; no preselected conclusion")
        meta, source = find_inputs(input_root)
        for name, sha in expected["baseline_outputs"].items():
            assert file_hash(source / name) == sha, "Changed baseline output: " + name
        baseline = decode_baseline(source / "sample-metrics.csv.gz")
        assert len(baseline) == 34157
        trainval_hashes = {name: file_hash(meta / name) for name in TABLES}
        assert trainval_hashes == expected["trainval_json"]
        log("trainval metadata matches previous official hashes")
        rows = collect(meta, "trainval", split_manifest, baseline, core, log)
        with tempfile.TemporaryDirectory(prefix="nuscenes-profile-test-") as scratch:
            source_info = official_test(Path(scratch), expected["test_json"], log)
            rows += collect(Path(scratch), "test", split_manifest, baseline, core, log)
        assert len(rows) == len({r["sample_token"] for r in rows}) == 34157
        assert {r["sample_token"] for r in rows} == set(baseline)
        assert len({r["scene"] for r in rows}) == 1000
        assert sum(r["start_speed_mps"] is None for r in rows) == 1000
        source_info["trainval_sha256"] = trainval_hashes
        save_json(out / "input-integrity.json", source_info)
        summaries, thresholds, groups = [], [], []
        for scope in SCOPES:
            selected = subset(rows, scope)
            for metric in METRICS:
                summary = {"scope": scope, "metric": metric, "scope_n": len(selected), **describe([r[metric] for r in selected])}
                summary["missing_n"] = len(selected) - summary["n"]
                summaries.append(summary)
            for metric in ("abs_endpoint_lateral_m", "max_abs_lateral_m"):
                values = sorted(r[metric] for r in selected)
                for threshold in LATERAL_THRESHOLDS:
                    count = bisect.bisect_left(values, threshold)
                    thresholds.append({"scope": scope, "metric": metric, "threshold_m": threshold,
                                       "count_lt": count, "n": len(values), "fraction_lt": count / len(values)})
            for speed in SPEEDS:
                for i, lo in enumerate(SPEED_EDGES):
                    hi = SPEED_EDGES[i + 1] if i + 1 < len(SPEED_EDGES) else None
                    groups.append(group_result(selected, scope, speed, "bin", lo, hi))
                for lo in TAIL_CUTS:
                    groups.append(group_result(selected, scope, speed, "ge", lo, None))
        write_csv(out / "quantiles.csv", summaries)
        write_csv(out / "lateral-thresholds.csv", thresholds)
        write_csv(out / "speed-conditioned.csv", groups)
        for split in SPLITS:
            write_csv(out / f"profile-samples-{split}.csv.gz", subset(rows, split), compressed=True)
        for metric in METRICS:
            write_csv(out / f"ecdf-{metric}.csv.gz", full_ecdf([r[metric] for r in rows]), compressed=True)
        freeze = subprocess.run([sys.executable, "-m", "pip", "freeze"], capture_output=True, text=True, check=True).stdout
        (out / "pip-freeze.txt").write_text(freeze, encoding="utf-8")
        cpu = next((line.split(":", 1)[1].strip() for line in Path("/proc/cpuinfo").read_text().splitlines()
                    if line.startswith("model name")), "unknown") if Path("/proc/cpuinfo").exists() else platform.processor()
        profile = {"analysis": "descriptive nuScenes ego-motion profile", "provenance": provenance,
                   "definitions": {"average_speed": "sum of six XY segment lengths / actual future duration",
                                   "start_speed": "previous-keyframe XY distance / actual preceding duration; first frame missing",
                                   "speed_edges_mps": SPEED_EDGES, "tail_cuts_mps": TAIL_CUTS,
                                   "lateral_thresholds_m": LATERAL_THRESHOLDS, "quantile_method": "linear h=(n-1)q",
                                   "cdf_boundary": "threshold tables use strict <; full ECDF stores both < and <="},
                   "coverage": {"scenes": 1000, "future_windows": len(rows), "start_speed_available": 33157,
                                "start_speed_missing_first_keyframe": 1000, "all_original_rows_equal_baseline": True},
                   "quantiles": summaries, "lateral_thresholds": thresholds, "speed_conditioned": groups,
                   "environment": {"python": sys.version, "platform": platform.platform(), "cpu": cpu, "gpu_used": False,
                                   "pip_freeze_sha256": file_hash(out / "pip-freeze.txt")},
                   "runtime_seconds": time.time() - started}
        save_json(out / "profile.json", profile)
        log("finished: " + json.dumps(profile["coverage"]))
        for summary in summaries:
            if summary["scope"] == "all":
                log("distribution " + json.dumps(summary))
        names = [p.name for p in out.iterdir() if p.name.startswith(("ecdf-", "profile-samples-"))]
        names += ["profile.json", "input-integrity.json", "quantiles.csv", "lateral-thresholds.csv", "speed-conditioned.csv", "pip-freeze.txt", "run-log.txt"]
        assert all((out / name).stat().st_size < 5_000_000 for name in names)
        (out / "sha256-manifest.txt").write_text("\n".join(f"{file_hash(out / name)}  {name}" for name in sorted(names)) + "\n", encoding="utf-8")
        return profile
    except Exception as exc:
        log("FAILED " + type(exc).__name__ + ": " + str(exc))
        raise
