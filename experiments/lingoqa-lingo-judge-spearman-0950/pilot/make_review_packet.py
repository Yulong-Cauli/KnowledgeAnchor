"""Separate answer texts for blind review from their model identities."""

import hashlib
import json
import sys
from collections import Counter
from pathlib import Path


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path, value):
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main(results_dir):
    questions = read_json(results_dir / "questions.json")
    expected = read_json(Path(__file__).with_name("question-manifest.json"))
    manifest = [{key: row[key] for key in ("segment_id", "question_id", "images")} for row in questions]
    if manifest != expected:
        raise ValueError("Kaggle question set differs from the frozen manifest")
    by_id = {(row["segment_id"], row["question_id"]): row for row in questions}
    answers = read_json(results_dir / "model-answers.json")
    coverage = Counter(row["model"] for row in answers)
    seen = set()
    cases = []
    key = {}
    for row in answers:
        pair = row["segment_id"], row["question_id"]
        identity = (row["model"], *pair)
        if identity in seen:
            raise ValueError(f"Duplicate answer for {identity}")
        seen.add(identity)
        if coverage[row["model"]] != len(questions):
            continue
        case_id = hashlib.sha256(("ka-lingo-blind-20261109:" + ":".join(identity)).encode()).hexdigest()[:16]
        cases.append({
            "case_id": case_id,
            **by_id[pair],
            "answer": row["answer"],
            "human_label": None,
            "note": "",
        })
        key[case_id] = {"model": row["model"], "revision": row["revision"]}
    if not cases:
        raise ValueError("No model produced records for every frozen question")
    write_json(results_dir / "blind-review.json", sorted(cases, key=lambda case: case["case_id"]))
    write_json(results_dir / "review-key.json", key)
    print(f"Prepared {len(cases)} blind cases")


if __name__ == "__main__":
    main(Path(sys.argv[1]))
