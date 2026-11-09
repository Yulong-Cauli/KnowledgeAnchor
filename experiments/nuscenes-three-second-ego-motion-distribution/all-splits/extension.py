"""Add official test ego motion to the immutable trainval-v1 measurement."""
import csv
import gc
import gzip
import hashlib
import io
import json
import os
import platform
import statistics
import subprocess
import sys
import tarfile
import tempfile
import time
import urllib.request
from collections import Counter, defaultdict
from pathlib import Path

OFFICIAL_TEST_URL = "https://motional-nuscenes.s3.amazonaws.com/public/v1.0/v1.0-test_meta.tgz"
TABLES = ("scene.json", "sample.json", "sample_data.json", "ego_pose.json")
STATES = ("all", "stopped", "low_speed", "moving", "non_stopped")
SCOPES = ("all", "trainval", "train", "val", "test")


def digest(path):
    h = hashlib.sha256()
    with open(path, "rb") as stream:
        for chunk in iter(lambda: stream.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def save_json(path, value):
    Path(path).write_text(json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + "\n", encoding="utf-8")


def fetch_test(meta, log):
    info = {"url": OFFICIAL_TEST_URL, "origin": "official metadata archive, not a mirror", "files": {}}
    request = urllib.request.Request(OFFICIAL_TEST_URL, headers={"User-Agent": "KnowledgeAnchor-motion-census"})
    with urllib.request.urlopen(request, timeout=90) as response:
        info.update({"http_status": response.status, "etag": response.headers.get("ETag"),
                     "last_modified": response.headers.get("Last-Modified"),
                     "content_length": response.headers.get("Content-Length")})
        with tarfile.open(fileobj=response, mode="r|gz") as archive:
            for member in archive:
                name = member.name.replace("\\", "/").split("/")[-1]
                if member.isfile() and name in TABLES:
                    assert name not in info["files"], "Duplicate metadata member"
                    # Use only fixed filenames, never an archive-supplied extraction path.
                    source = archive.extractfile(member)
                    h = hashlib.sha256()
                    size = 0
                    with (meta / name).open("wb") as target:
                        for chunk in iter(lambda: source.read(1 << 20), b""):
                            h.update(chunk)
                            target.write(chunk)
                            size += len(chunk)
                    assert size == member.size
                    info["files"][name] = {"sha256": h.hexdigest(), "bytes": size}
                    log("official test table read: " + name)
    assert set(info["files"]) == set(TABLES)
    return info


def read_test_records(meta, test_scenes, core, log):
    def load(name):
        with (meta / name).open(encoding="utf-8") as stream:
            return json.load(stream)
    scenes, samples = load("scene.json"), load("sample.json")
    assert len(scenes) == 150 and len(samples) == 6008
    assert {s["name"] for s in scenes} == set(test_scenes)
    assert len({s["token"] for s in scenes}) == len(scenes)
    by_token = {r["token"]: r for r in samples}
    assert len(by_token) == len(samples)
    sd = load("sample_data.json")
    sd_count = len(sd)
    assert len({r["token"] for r in sd}) == len(sd)
    lidar = {}
    for row in sd:
        parts = row.get("filename", "").split("__")
        if row["is_key_frame"] and len(parts) >= 3 and parts[1] == "LIDAR_TOP":
            token = row["sample_token"]
            assert token not in lidar
            lidar[token] = (row["ego_pose_token"], row["timestamp"])
    assert set(lidar) == set(by_token)
    del sd
    gc.collect()
    required = {value[0] for value in lidar.values()}
    ep = load("ego_pose.json")
    ep_count = len(ep)
    assert len({r["token"] for r in ep}) == len(ep)
    pose = {r["token"]: (r["translation"][0], r["translation"][1], core.quat_yaw(r["rotation"]), r["timestamp"])
            for r in ep if r["token"] in required}
    assert set(pose) == required
    del ep
    gc.collect()
    visited, records = set(), []
    incomplete = 0
    for scene in sorted(scenes, key=lambda r: r["name"]):
        chain, token = [], scene["first_sample_token"]
        while token:
            assert token not in visited, "Cycle or shared sample"
            visited.add(token)
            sample = by_token[token]
            assert sample["scene_token"] == scene["token"]
            assert sample["prev"] == (chain[-1] if chain else "")
            chain.append(token)
            token = sample["next"]
        assert len(chain) == scene["nbr_samples"] and chain[-1] == scene["last_sample_token"]
        assert len(chain) >= 7
        incomplete += 6
        for i in range(len(chain) - 6):
            window = []
            for token in chain[i:i + 7]:
                ep_token, timestamp = lidar[token]
                p = pose[ep_token]
                assert p[3] == timestamp
                window.append(p)
            records.append({"sample_token": chain[i], "scene": scene["name"], "split": "test",
                            **core.motion_metrics(window)})
    assert visited == set(by_token)
    assert len(records) == 5108 and incomplete == 900
    log(f"test chain census: {len(records)} complete; {incomplete} incomplete")
    return records, {"scenes": len(scenes), "samples": len(samples), "sample_data": sd_count,
                     "ego_pose": ep_count, "complete_windows": len(records), "incomplete_windows": incomplete,
                     "missing_lidar": 0}


def read_sample_csv(path):
    with open(path, encoding="utf-8", newline="") as stream:
        rows = list(csv.DictReader(stream))
    return parse_sample_rows(rows)


def parse_sample_rows(rows):
    strings = {"sample_token", "scene", "split", "motion_state"}
    booleans = {"crosscheck_eligible", "primary_low_lateral", "endpoint_only_excursion"}
    for row in rows:
        for key, value in list(row.items()):
            if key in strings:
                continue
            if key in booleans:
                assert value in ("True", "False")
                row[key] = value == "True"
            else:
                row[key] = float(value) if value else None
    return rows


def select(rows, scope, state):
    return [r for r in rows if (scope == "all" or scope == "trainval" and r["split"] in ("train", "val") or
                                r["split"] == scope) and
            (state == "all" or r["motion_state"] == state or state == "non_stopped" and r["motion_state"] != "stopped")]


def combine(trainval, test, manifest):
    assert {r["split"] for r in trainval} == {"train", "val"}
    assert {r["split"] for r in test} == {"test"}
    assert not ({r["sample_token"] for r in trainval} & {r["sample_token"] for r in test}), "Cross-split duplicate token"
    assert not ({r["scene"] for r in trainval} & {r["scene"] for r in test}), "Cross-split duplicate scene"
    rows = trainval + test
    assert len({r["sample_token"] for r in rows}) == len(rows)
    for split, scenes in manifest["splits"].items():
        assert {r["scene"] for r in rows if r["split"] == split} == set(scenes)
    assert len(rows) == 34157 and len({r["scene"] for r in rows}) == 1000
    return rows


def csv_write(path, rows, compressed=False):
    def write(stream):
        writer = csv.DictWriter(stream, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    if compressed:
        with open(path, "wb") as target:
            with gzip.GzipFile(filename="", fileobj=target, mode="wb", mtime=0) as gz:
                with io.TextIOWrapper(gz, encoding="utf-8", newline="") as text:
                    write(text)
    else:
        with open(path, "w", encoding="utf-8", newline="") as stream:
            write(stream)


def run_extension(core, provenance, split_manifest, expected_inputs, input_root="/kaggle/input", output="/kaggle/working"):
    start = time.time()
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
        log("started official test extension; measurement protocol unchanged")
        candidates = [p for p in Path(input_root).rglob("sample-metrics.csv") if (p.parent / "results.json").is_file()]
        assert len(candidates) == 1, f"Expected one immutable trainval source: {candidates}"
        source = candidates[0].parent
        for name, expected in expected_inputs.items():
            assert digest(source / name) == expected, "Changed trainval input: " + name
        old = json.loads((source / "results.json").read_text(encoding="utf-8"))
        assert old["protocol"] == core.PROTOCOL
        assert old["provenance"]["code_sha256"] == provenance["measurement_code_sha256"]
        trainval = read_sample_csv(source / "sample-metrics.csv")
        assert len(trainval) == 29049
        for name, expected in old["populations"].items():
            scope, state = name.split("_", 1)
            assert core.summarize(select(trainval, scope, state)) == expected
        log("original trainval rows and all 15 summaries verified")
        with tempfile.TemporaryDirectory(prefix="nuscenes-test-census-") as scratch:
            meta = Path(scratch)
            official = fetch_test(meta, log)
            save_json(out / "official-test-source.json", official)
            test, test_counts = read_test_records(meta, split_manifest["splits"]["test"], core, log)
        rows = combine(trainval, test, split_manifest)
        summaries, sensitive = {}, []
        for scope in SCOPES:
            for state in STATES:
                selected = select(rows, scope, state)
                summaries[f"{scope}_{state}"] = core.summarize(selected)
                for limit in core.PROTOCOL["lateral_sensitivity_m"]:
                    for metric in ("abs_endpoint_lateral_m", "max_abs_lateral_m"):
                        hits = sum(r[metric] < limit for r in selected)
                        sensitive.append({"split": scope, "motion_state": state, "metric": metric, "threshold": limit,
                                          "count": hits, "n": len(selected), "ratio": hits / len(selected) if selected else None})
                for limit in core.PROTOCOL["heading_sensitivity_deg"]:
                    hits = sum(r["cum_yaw_deg"] < limit for r in selected)
                    sensitive.append({"split": scope, "motion_state": state, "metric": "cum_yaw_deg", "threshold": limit,
                                      "count": hits, "n": len(selected), "ratio": hits / len(selected) if selected else None})
        assert summaries["all_all"]["counts"]["endpoint_lt_2m"] == sum(summaries[s + "_all"]["counts"]["endpoint_lt_2m"] for s in ("train", "val", "test"))
        grouped = defaultdict(list)
        for row in rows:
            grouped[row["scene"]].append(row)
        scenes = [{"scene": name, "split": group[0]["split"], "n": len(group),
                   "endpoint_lt_2m_count": sum(r["primary_low_lateral"] for r in group),
                   "endpoint_lt_2m_ratio": sum(r["primary_low_lateral"] for r in group) / len(group),
                   "moving_n": sum(r["motion_state"] == "moving" for r in group)} for name, group in sorted(grouped.items())]
        diagnostics = {}
        for scope in SCOPES:
            base = select(rows, scope, "all")
            eligible = [r for r in base if r["crosscheck_eligible"]]
            diagnostics[scope] = {
                "horizon_seconds": core.quantiles([r["horizon_seconds"] for r in base]),
                "horizon_outside_2p75_3p25_n": sum(abs(r["horizon_seconds"] - 3) > .25 for r in base),
                "crosscheck_eligible_n": len(eligible), "crosscheck_excluded_n": len(base) - len(eligible),
                "crosscheck_gap_gt_15deg_n": sum(r["crosscheck_gap_deg"] > 15 for r in eligible),
                "crosscheck_gap_deg_distribution": core.quantiles([r["crosscheck_gap_deg"] for r in eligible])}
        csv_write(out / "sample-metrics.csv.gz", rows, compressed=True)
        csv_write(out / "sensitivity.csv", sensitive)
        csv_write(out / "scene-metrics.csv", scenes)
        freeze = subprocess.run([sys.executable, "-m", "pip", "freeze"], capture_output=True, text=True, check=True).stdout
        (out / "pip-freeze.txt").write_text(freeze, encoding="utf-8")
        result = {"claim_id": old["claim_id"], "scope": "nuScenes v1.0 all 1000 scenes (train, val, test)",
                  "protocol": core.PROTOCOL, "provenance": provenance,
                  "trainval_reused": {"kernel": "cauliyulong/claim-nuscenes-low-lateral-census", "version": 1,
                                      "input_sha256": expected_inputs, "all_15_original_summaries_recounted": True},
                  "official_test_counts": test_counts,
                  "all_counts": {"scenes": 1000, "samples": 40157, "complete_windows": len(rows), "incomplete_windows": 6000},
                  "populations": summaries, "diagnostics": diagnostics,
                  "scene_level": {"n": len(scenes), "equal_scene_mean_ratio": statistics.mean(r["endpoint_lt_2m_ratio"] for r in scenes),
                                  "ratio_distribution": core.quantiles([r["endpoint_lt_2m_ratio"] for r in scenes])},
                  "environment": {"python": sys.version, "platform": platform.platform(), "gpu_used": False,
                                  "pip_freeze_sha256": digest(out / "pip-freeze.txt")},
                  "runtime_seconds": time.time() - start,
                  "limits": ["same descriptive analysis extended to test; no model training or causal experiment",
                             "test metadata from official archive; trainval reuses original byte-verified evidence",
                             "six-keyframe nominal 3s windows, not whole-scene simplicity"]}
        save_json(out / "results.json", result)
        log("finished test: " + json.dumps(summaries["test_all"]))
        log("finished all: " + json.dumps(summaries["all_all"]))
        names = ("official-test-source.json", "sample-metrics.csv.gz", "scene-metrics.csv", "sensitivity.csv",
                 "pip-freeze.txt", "results.json", "run-log.txt")
        assert all((out / name).stat().st_size < 5_000_000 for name in names)
        (out / "sha256-manifest.txt").write_text("\n".join(f"{digest(out / name)}  {name}" for name in names) + "\n", encoding="utf-8")
        return result
    except Exception as exc:
        log("FAILED " + type(exc).__name__ + ": " + str(exc))
        raise
