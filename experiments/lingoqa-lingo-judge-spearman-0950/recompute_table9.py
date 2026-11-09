"""Recompute Lingo-Judge correlations from the scores printed in ECCV Table 9."""

import json
from pathlib import Path

import scipy
from scipy.stats import pearsonr, spearmanr


SOURCE = "https://www.ecva.net/papers/eccv_2024/papers_ECCV/papers/09911-supp.pdf#page=12"
MODELS = [
    ("Model A", 59.6, 0.571),
    ("Model B", 59.6, 0.564),
    ("Model C", 57.4, 0.563),
    ("Model D", 58.2, 0.559),
    ("Model E", 59.0, 0.553),
    ("Model F", 58.0, 0.552),
    ("Model G", 54.8, 0.529),
    ("Model H", 50.0, 0.520),
    ("Model I", 53.0, 0.510),
    ("Model J", 52.6, 0.509),
    ("Model K", 53.0, 0.500),
    ("Model L", 51.2, 0.485),
    ("Model M", 43.2, 0.371),
    ("Model N", 35.8, 0.361),
    ("Model O", 33.6, 0.279),
]
HUMAN_GROUPS = [
    ("Human labellers group A", 96.6, 0.934),
    ("Human labellers group B", 91.2, 0.894),
]


def correlations(rows):
    _, judge, human = zip(*rows)
    return {
        "n": len(rows),
        "pearson": float(pearsonr(judge, human).statistic),
        "spearman": float(spearmanr(judge, human).statistic),
    }


def main():
    root = Path(__file__).resolve().parent
    original_path = root / "results/v1/table9-arithmetic.json"
    original = json.loads(original_path.read_text(encoding="utf-8"))
    mismatches = []
    for (row, judge, human), v1_judge, v1_human in zip(
        MODELS, original["judge_scores"], original["human_scores"], strict=True
    ):
        if (judge, human) != (v1_judge, v1_human):
            mismatches.append({"row": row, "v1": [v1_judge, v1_human], "table9": [judge, human]})

    result = {
        "scope": "Arithmetic on published aggregate scores, no model inference or new human ratings",
        "source": SOURCE,
        "scipy": scipy.__version__,
        "columns": ["row", "lingo_judge_percent", "human_mean"],
        "rows": MODELS + HUMAN_GROUPS,
        "models_only": correlations(MODELS),
        "models_and_human_groups": correlations(MODELS + HUMAN_GROUPS),
        "v1_input_mismatches": mismatches,
    }
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
