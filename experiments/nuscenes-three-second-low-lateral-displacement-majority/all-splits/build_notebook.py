"""Embed unchanged v1 measurement, test extension, pinned inputs and design."""
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PARENT = ROOT.parent
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
base = (PARENT / "census.py").read_text(encoding="utf-8")
extension = (ROOT / "extension.py").read_text(encoding="utf-8")
splits = json.loads((ROOT / "sources/splits-all.json").read_text(encoding="utf-8"))
inputs = {name: sha(PARENT / "results" / name) for name in ("results.json", "official-comparison.json")}
inputs["sample-metrics.csv"] = json.loads((PARENT / "results/harvest.json").read_text(encoding="utf-8"))["sample_csv_original_sha256"]
provenance = {"startup_git_head": subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip(),
              "measurement_code_sha256": sha(PARENT / "census.py"), "extension_code_sha256": sha(ROOT / "extension.py"),
              "protocol_readme_sha256": sha(ROOT / "README.md"), "splits_manifest_sha256": sha(ROOT / "sources/splits-all.json"),
              "devkit_commit": splits["devkit_commit"], "kaggle_kernel": "cauliyulong/claim-nuscenes-all-census"}
driver = ("import types\nCORE = types.SimpleNamespace(**{name: globals()[name] for name in "
          "['motion_metrics', 'quat_yaw', 'summarize', 'quantiles', 'PROTOCOL']})\n" +
          "PROVENANCE = " + repr(provenance) + "\nSPLIT_MANIFEST = " + repr(splits) +
          "\nEXPECTED_INPUTS = " + repr(inputs) +
          "\nRESULT = run_extension(CORE, PROVENANCE, SPLIT_MANIFEST, EXPECTED_INPUTS)\n")
def cell(source):
    return {"cell_type": "code", "metadata": {}, "execution_count": None, "outputs": [], "source": source.splitlines(True)}
notebook = {"nbformat": 4, "nbformat_minor": 5,
            "metadata": {"kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"}},
            "cells": [{"cell_type": "markdown", "metadata": {}, "source": ["# nuScenes all-split census: official test extension\n"]},
                      cell(base), cell(extension), cell(driver)]}
(ROOT / "all-splits-census.ipynb").write_text(json.dumps(notebook, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
(ROOT / "launch-provenance.json").write_text(json.dumps(provenance, indent=2) + "\n", encoding="utf-8")
print("Built official-test follow-up; unchanged measurement SHA256=" + provenance["measurement_code_sha256"])
