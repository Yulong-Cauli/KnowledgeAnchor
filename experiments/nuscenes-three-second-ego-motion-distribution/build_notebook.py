"""Embed exactly the reviewed census source; run locally before Kaggle push."""
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
source = (ROOT / "census.py").read_text(encoding="utf-8")
splits = json.loads((ROOT / "sources/splits.json").read_text(encoding="utf-8"))
metadata = json.loads((ROOT / "sources/dataset-metadata.json").read_text(encoding="utf-8"))
version_record = ROOT / "sources/dataset-version.json"
dataset_version = json.loads(version_record.read_text(encoding="utf-8")) if version_record.exists() else {}
protocol_file = ROOT / "README-trainval-v1.md"
if not protocol_file.exists():
    protocol_file = ROOT / "README.md"
provenance = {
    "startup_git_head": subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip(),
    "code_sha256": hashlib.sha256(source.encode()).hexdigest(),
    "protocol_readme_sha256": hashlib.sha256(protocol_file.read_bytes()).hexdigest(),
    "splits_manifest_sha256": hashlib.sha256((ROOT / "sources/splits.json").read_bytes()).hexdigest(),
    "devkit_splits_commit": splits["devkit_commit"],
    "kaggle_source_metadata_sha256": hashlib.sha256((ROOT / "sources/dataset-metadata.json").read_bytes()).hexdigest(),
    "kaggle_source_ref": "sahangunasekara92/nuscenes-v1-0-full-keyframes",
    "kaggle_source_recorded_version": dataset_version.get("current_version_number", metadata.get("currentVersionNumber", metadata.get("versionNumber"))),
    "kaggle_kernel": "cauliyulong/claim-nuscenes-low-lateral-census",
    "version_binding": "exact version and downloaded-code equality recorded in local harvest.json",
}
driver = ("SPLIT_MANIFEST = " + repr(splits) + "\nPROVENANCE = " + repr(provenance) +
          "\nRESULT = run(locate_metadata(), '/kaggle/working', PROVENANCE, SPLIT_MANIFEST)\n")
notebook = {"nbformat": 4, "nbformat_minor": 5,
            "metadata": {"kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"}},
            "cells": [{"cell_type": "markdown", "metadata": {}, "source": ["# nuScenes six-keyframe low-lateral census\n", "Descriptive follow-up; no model training; no claim status changes.\n"]},
                      {"cell_type": "code", "metadata": {}, "execution_count": None, "outputs": [], "source": source.splitlines(True)},
                      {"cell_type": "code", "metadata": {}, "execution_count": None, "outputs": [], "source": driver.splitlines(True)}]}
(ROOT / "motion-census.ipynb").write_text(json.dumps(notebook, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
(ROOT / "launch-provenance.json").write_text(json.dumps(provenance, indent=2) + "\n", encoding="utf-8")
print("Built notebook; source sha256=" + provenance["code_sha256"])
