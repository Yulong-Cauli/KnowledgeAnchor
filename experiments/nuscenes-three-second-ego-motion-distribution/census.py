"""Deterministic census of six-keyframe ego motion; Python standard library only."""
import csv
import gc
import hashlib
import json
import math
import os
import platform
import statistics
import subprocess
import sys
import tarfile
import time
import urllib.request
from collections import Counter, defaultdict
from pathlib import Path

CLAIM_ID = "claim-nuscenes-three-second-low-lateral-displacement-majority"
OFFICIAL_META_URL = "https://motional-nuscenes.s3.amazonaws.com/public/v1.0/v1.0-trainval_meta.tgz"
TABLES = ("scene.json", "sample.json", "sample_data.json", "ego_pose.json")
PROTOCOL = {
    "horizon_keyframes": 6,
    "nominal_horizon_seconds": 3,
    "primary_abs_endpoint_lateral_lt_m": 2.0,
    "majority_ratio_strictly_gt": 0.5,
    "stopped_path_length_le_m": 0.3,
    "low_speed_path_length_le_m": 1.5,
    "crosscheck_min_each_step_gt_m": 0.3,
    "crosscheck_accumulated_difference_gt_deg": 15.0,
    "lateral_sensitivity_m": [0.5, 1.0, 2.0, 3.0],
    "heading_sensitivity_deg": [3, 5, 10, 15, 20, 30],
    "design_origin": "post-exploration definition frozen before this follow-up census; not the original preregistration",
}


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def json_write(path, value):
    Path(path).write_text(json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + "\n", encoding="utf-8")


def wrap(angle):
    return (angle + math.pi) % (2 * math.pi) - math.pi


def quat_yaw(q):
    assert len(q) == 4 and all(math.isfinite(v) for v in q)
    assert abs(sum(v * v for v in q) - 1) < 1e-3, "Non-unit ego quaternion"
    w, x, y, z = q
    return math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z))


def motion_metrics(poses):
    """poses: seven (x, y, yaw, timestamp_us) values in global coordinates."""
    assert len(poses) == 7
    assert all(all(math.isfinite(v) for v in p) for p in poses)
    assert all(b[3] > a[3] for a, b in zip(poses, poses[1:])), "Non-increasing timestamps"
    x0, y0, yaw0, t0 = poses[0]
    lateral = [-(x - x0) * math.sin(yaw0) + (y - y0) * math.cos(yaw0) for x, y, _, _ in poses[1:]]
    lengths = [math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(poses, poses[1:])]
    yaw_steps = [abs(wrap(b[2] - a[2])) for a, b in zip(poses, poses[1:])]
    path_length = sum(lengths)
    state = "stopped" if path_length <= 0.3 else "low_speed" if path_length <= 1.5 else "moving"
    eligible = all(v > 0.3 for v in lengths)
    disp_cum = yaw_mid_cum = gap = None
    if eligible:
        directions = [math.atan2(b[1] - a[1], b[0] - a[0]) for a, b in zip(poses, poses[1:])]
        # Compare both methods on the same six segment midpoints (five differences).
        yaw_mid = [wrap(a[2] + wrap(b[2] - a[2]) / 2) for a, b in zip(poses, poses[1:])]
        disp_cum = math.degrees(sum(abs(wrap(b - a)) for a, b in zip(directions, directions[1:])))
        yaw_mid_cum = math.degrees(sum(abs(wrap(b - a)) for a, b in zip(yaw_mid, yaw_mid[1:])))
        gap = abs(disp_cum - yaw_mid_cum)
    return {
        "endpoint_lateral_m": lateral[-1],
        "abs_endpoint_lateral_m": abs(lateral[-1]),
        "max_abs_lateral_m": max(abs(v) for v in lateral),
        "path_length_m": path_length,
        "motion_state": state,
        "cum_yaw_deg": math.degrees(sum(yaw_steps)),
        "max_step_yaw_deg": math.degrees(max(yaw_steps)),
        "horizon_seconds": (poses[-1][3] - t0) / 1e6,
        "min_step_seconds": min((b[3] - a[3]) / 1e6 for a, b in zip(poses, poses[1:])),
        "max_step_seconds": max((b[3] - a[3]) / 1e6 for a, b in zip(poses, poses[1:])),
        "crosscheck_eligible": eligible,
        "displacement_cum_deg": disp_cum,
        "yaw_midpoint_cum_deg": yaw_mid_cum,
        "crosscheck_gap_deg": gap,
        "primary_low_lateral": abs(lateral[-1]) < 2.0,
        "endpoint_only_excursion": abs(lateral[-1]) < 2.0 and max(abs(v) for v in lateral) >= 2.0,
    }


def verify_official(hashes, log):
    """Stream official metadata without storing the large archive or sensor files."""
    result = {"url": OFFICIAL_META_URL, "status": "not_completed", "files": {}}
    try:
        req = urllib.request.Request(OFFICIAL_META_URL, headers={"User-Agent": "KnowledgeAnchor-motion-census"})
        with urllib.request.urlopen(req, timeout=90) as response:
            result["etag"] = response.headers.get("ETag")
            result["last_modified"] = response.headers.get("Last-Modified")
            result["content_length"] = response.headers.get("Content-Length")
            with tarfile.open(fileobj=response, mode="r|gz") as archive:
                for member in archive:
                    name = member.name.replace("\\", "/").split("/")[-1]
                    if member.isfile() and name in hashes:
                        assert name not in result["files"], "Duplicate official metadata member"
                        h = hashlib.sha256()
                        f = archive.extractfile(member)
                        for chunk in iter(lambda: f.read(1 << 20), b""):
                            h.update(chunk)
                        result["files"][name] = {"sha256": h.hexdigest(), "bytes": member.size,
                                                 "matches_mirror": h.hexdigest() == hashes[name]}
                        log("official metadata hashed: " + name)
        assert set(result["files"]) == set(hashes), "Official tables incomplete"
        result["status"] = "matched" if all(v["matches_mirror"] for v in result["files"].values()) else "mismatch"
    except Exception as exc:
        result["error"] = type(exc).__name__ + ": " + str(exc)
        log("official comparison incomplete: " + result["error"])
    return result


def load_records(meta, split_manifest, log):
    def load(name):
        with open(meta / name, encoding="utf-8") as f:
            return json.load(f)
    scenes, samples = load("scene.json"), load("sample.json")
    assert len(scenes) == 850 and len(samples) == 34149
    by_token = {v["token"]: v for v in samples}
    assert len(by_token) == len(samples)
    split_of = {name: split for split, names in split_manifest["splits"].items() for name in names}
    assert len(split_of) == 850 and {s["name"] for s in scenes} == set(split_of)
    sd = load("sample_data.json")
    sd_count = len(sd)
    lidar = {}
    for row in sd:
        parts = row.get("filename", "").split("__")
        if row["is_key_frame"] and len(parts) >= 3 and parts[1] == "LIDAR_TOP":
            tok = row["sample_token"]
            assert tok not in lidar, "Duplicate LIDAR keyframe"
            lidar[tok] = (row["ego_pose_token"], row["timestamp"])
    assert set(lidar) == set(by_token), "Missing or extra LIDAR keyframe"
    del sd
    gc.collect()
    needed = {v[0] for v in lidar.values()}
    ep = load("ego_pose.json")
    ep_count = len(ep)
    poses = {v["token"]: (v["translation"][0], v["translation"][1], quat_yaw(v["rotation"]), v["timestamp"])
             for v in ep if v["token"] in needed}
    assert set(poses) == needed
    del ep
    gc.collect()
    visited = set()
    records = []
    population = Counter()
    tails = Counter()
    for scene in sorted(scenes, key=lambda s: s["name"]):
        chain = []
        token = scene["first_sample_token"]
        while token:
            assert token not in visited, "Repeated sample or scene cycle"
            visited.add(token)
            row = by_token[token]
            assert row["scene_token"] == scene["token"]
            assert row["prev"] == (chain[-1] if chain else "")
            chain.append(token)
            token = row["next"]
        assert len(chain) == scene["nbr_samples"] and chain[-1] == scene["last_sample_token"]
        assert len(chain) >= 7
        split = split_of[scene["name"]]
        population[split] += len(chain)
        tails[split] += min(6, len(chain))
        for i in range(len(chain) - 6):
            tokens = chain[i:i + 7]
            window = []
            for tok in tokens:
                ep_token, timestamp = lidar[tok]
                pose = poses[ep_token]
                assert pose[3] == timestamp, "ego_pose/sample_data timestamp mismatch"
                window.append(pose)
            metrics = motion_metrics(window)
            records.append({"sample_token": tokens[0], "scene": scene["name"], "split": split, **metrics})
    assert visited == set(by_token)
    assert population == {"train": 28130, "val": 6019}
    assert Counter(v["split"] for v in records) == {"train": 23930, "val": 5119}
    log(f"complete windows={len(records)}; excluded tails={dict(tails)}")
    return records, {"scenes": len(scenes), "samples": len(samples), "sample_data": sd_count,
                     "ego_pose": ep_count, "all_samples_by_split": dict(population),
                     "excluded_incomplete_by_split": dict(tails), "missing_lidar": 0}


def summarize(rows):
    n = len(rows)
    counts = {
        "endpoint_lt_2m": sum(r["primary_low_lateral"] for r in rows),
        "max_lateral_lt_2m": sum(r["max_abs_lateral_m"] < 2 for r in rows),
        "endpoint_only_excursion": sum(r["endpoint_only_excursion"] for r in rows),
    }
    return {"n": n, "counts": counts,
            "ratios": {k: v / n if n else None for k, v in counts.items()},
            "majority_gt_half": counts["endpoint_lt_2m"] * 2 > n if n else None,
            "motion_state_counts": dict(Counter(r["motion_state"] for r in rows))}


def quantiles(values):
    values = sorted(values)
    if not values:
        return None
    return {"min": values[0], "median": statistics.median(values),
            "p05": values[round((len(values) - 1) * .05)],
            "p95": values[round((len(values) - 1) * .95)], "max": values[-1]}


def write_csv(path, rows):
    assert rows
    with open(path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)


def run(meta_dir, out_dir, provenance, split_manifest):
    started = time.time()
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    logfile = out / "run-log.txt"
    logfile.write_text("", encoding="utf-8")
    def log(message):
        line = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()) + " " + message
        print(line, flush=True)
        with logfile.open("a", encoding="utf-8") as f:
            f.write(line + "\n")
    try:
        meta = Path(meta_dir)
        assert meta.name == "v1.0-trainval"
        log("started " + CLAIM_ID)
        hashes = {name: sha256_file(meta / name) for name in TABLES}
        official = verify_official(hashes, log)
        json_write(out / "official-comparison.json", official)
        assert official["status"] != "mismatch", "Mirror differs from official metadata; stop interpretation"
        records, counts = load_records(meta, split_manifest, log)
        write_csv(out / "sample-metrics.csv", records)
        populations = {}
        sensitivities = []
        for split in ("trainval", "train", "val"):
            base = [r for r in records if split == "trainval" or r["split"] == split]
            for state in ("all", "stopped", "low_speed", "moving", "non_stopped"):
                rows = [r for r in base if state == "all" or r["motion_state"] == state or
                        (state == "non_stopped" and r["motion_state"] != "stopped")]
                populations[f"{split}_{state}"] = summarize(rows)
                for threshold in PROTOCOL["lateral_sensitivity_m"]:
                    for field in ("abs_endpoint_lateral_m", "max_abs_lateral_m"):
                        hits = sum(r[field] < threshold for r in rows)
                        sensitivities.append({"split": split, "motion_state": state, "metric": field,
                                              "threshold": threshold, "count": hits, "n": len(rows),
                                              "ratio": hits / len(rows) if rows else None})
                for threshold in PROTOCOL["heading_sensitivity_deg"]:
                    hits = sum(r["cum_yaw_deg"] < threshold for r in rows)
                    sensitivities.append({"split": split, "motion_state": state, "metric": "cum_yaw_deg",
                                          "threshold": threshold, "count": hits, "n": len(rows),
                                          "ratio": hits / len(rows) if rows else None})
        write_csv(out / "sensitivity.csv", sensitivities)
        grouped = defaultdict(list)
        for row in records:
            grouped[row["scene"]].append(row)
        scene_rows = [{"scene": name, "split": rows[0]["split"], "n": len(rows),
                       "endpoint_lt_2m_count": sum(r["primary_low_lateral"] for r in rows),
                       "endpoint_lt_2m_ratio": sum(r["primary_low_lateral"] for r in rows) / len(rows),
                       "moving_n": sum(r["motion_state"] == "moving" for r in rows)}
                      for name, rows in sorted(grouped.items())]
        write_csv(out / "scene-metrics.csv", scene_rows)
        eligible = [r for r in records if r["crosscheck_eligible"]]
        conflicts = [r for r in eligible if r["crosscheck_gap_deg"] > 15]
        crosscheck = {"eligible_n": len(eligible), "excluded_short_step_n": len(records) - len(eligible),
                      "gap_gt_15deg_n": len(conflicts),
                      "gap_gt_15deg_ratio_of_eligible": len(conflicts) / len(eligible) if eligible else None,
                      "gap_deg_distribution": quantiles([r["crosscheck_gap_deg"] for r in eligible]),
                      "interpretation": "diagnostic only; compares accumulated directions at segment midpoints, not per-step orientation conflicts"}
        freeze = subprocess.run([sys.executable, "-m", "pip", "freeze"], capture_output=True, text=True, check=True).stdout
        (out / "pip-freeze.txt").write_text(freeze, encoding="utf-8")
        cpu = next((l.split(":", 1)[1].strip() for l in Path("/proc/cpuinfo").read_text().splitlines()
                    if l.startswith("model name")), "unknown") if Path("/proc/cpuinfo").exists() else platform.processor()
        result = {"claim_id": CLAIM_ID, "protocol": PROTOCOL, "provenance": provenance,
                  "environment": {"python": sys.version, "platform": platform.platform(), "cpu": cpu,
                                  "gpu_used": False, "pip_freeze_sha256": sha256_file(out / "pip-freeze.txt")},
                  "data": {"dataset": "sahangunasekara92/nuscenes-v1-0-full-keyframes", "version": "v1.0-trainval",
                           "sha256": hashes, "counts": counts, "official_comparison_status": official["status"]},
                  "populations": populations, "scene_level": {"n": len(scene_rows),
                       "equal_scene_mean_ratio": statistics.mean(r["endpoint_lt_2m_ratio"] for r in scene_rows),
                       "ratio_distribution": quantiles([r["endpoint_lt_2m_ratio"] for r in scene_rows])},
                  "crosscheck": crosscheck,
                  "timing": {"horizon_seconds": quantiles([r["horizon_seconds"] for r in records]),
                             "horizon_outside_2p75_3p25_n": sum(abs(r["horizon_seconds"] - 3) > .25 for r in records),
                             "min_step_seconds": min(r["min_step_seconds"] for r in records),
                             "max_step_seconds": max(r["max_step_seconds"] for r in records)},
                  "runtime_seconds": time.time() - started,
                  "limits": ["trainval only, excludes 150 test scenes", "endpoint low lateral displacement is not scene simplicity",
                             "does not test ego-status shortcut causality", "descriptive census, no independent held-out confirmation",
                             "strict thresholds; stopped and low_speed are operational path-length bins"]}
        json_write(out / "results.json", result)
        log("finished: " + json.dumps(populations["trainval_all"]))
        manifest = [f"{sha256_file(p)}  {p.name}" for p in sorted(out.iterdir()) if p.is_file() and p.name != "sha256-manifest.txt"]
        (out / "sha256-manifest.txt").write_text("\n".join(manifest) + "\n", encoding="utf-8")
        return result
    except Exception as exc:
        log("FAILED " + type(exc).__name__ + ": " + str(exc))
        raise


def locate_metadata(root="/kaggle/input"):
    found = []
    for directory, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d.lower() not in ("samples", "sweeps", "maps") and not d.startswith(".")]
        if Path(directory).name == "v1.0-trainval" and set(TABLES) <= set(files):
            found.append(directory)
            dirs[:] = []
    assert len(found) == 1, f"Expected one metadata source, got {found}"
    return found[0]
