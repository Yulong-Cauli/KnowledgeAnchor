"""Embed immutable measurement and the fixed full-profile protocol."""
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PARENT = ROOT.parent
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
measurement = (PARENT / "census.py").read_text(encoding="utf-8")
analysis = (ROOT / "profile_stats.py").read_text(encoding="utf-8")
splits = json.loads((PARENT / "all-splits/sources/splits-all.json").read_text(encoding="utf-8"))
test = json.loads((PARENT / "all-splits/results/official-test-source.json").read_text(encoding="utf-8"))
trainval = json.loads((PARENT / "results/results.json").read_text(encoding="utf-8"))
expected = {"baseline_outputs": {name: sha(PARENT / "all-splits/results" / name) for name in ("sample-metrics.csv.gz", "results.json")},
            "trainval_json": trainval["data"]["sha256"], "test_json": {k: v["sha256"] for k, v in test["files"].items()}}
provenance = {"startup_git_head": subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip(),
              "measurement_code_sha256": sha(PARENT / "census.py"), "analysis_code_sha256": sha(ROOT / "profile_stats.py"),
              "protocol_readme_sha256": sha(ROOT / "README.md"),
              "splits_manifest_sha256": sha(PARENT / "all-splits/sources/splits-all.json"),
              "kaggle_kernel": "cauliyulong/claim-nuscenes-motion-profile", "expected_inputs": expected}
driver = ("import types\nCORE = types.SimpleNamespace(motion_metrics=motion_metrics, quat_yaw=quat_yaw)\n" +
          "PROVENANCE = " + repr(provenance) + "\nSPLITS_MANIFEST = " + repr(splits) +
          "\nEXPECTED = " + repr(expected) + "\nRESULT = run_profile(CORE, PROVENANCE, SPLITS_MANIFEST, EXPECTED)\n")
def cell(source):
    return {"cell_type": "code", "metadata": {}, "execution_count": None, "outputs": [], "source": source.splitlines(True)}
notebook = {"nbformat": 4, "nbformat_minor": 5, "metadata": {"kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"}},
            "cells": [{"cell_type": "markdown", "metadata": {}, "source": ["# nuScenes full ego-motion profile: no model training\n"]},
                      cell(measurement), cell(analysis), cell(driver)]}
(ROOT / "motion-profile.ipynb").write_bytes((json.dumps(notebook, ensure_ascii=False, indent=1) + "\n").encode())
(ROOT / "launch-provenance.json").write_bytes((json.dumps(provenance, indent=2) + "\n").encode())
print("Built profile notebook; measurement unchanged: " + provenance["measurement_code_sha256"])
