import json
import subprocess
from pathlib import Path


def cell(source):
    compile(source, '<notebook>', 'exec')
    return dict(cell_type='code', execution_count=None, metadata={}, outputs=[], source=source)


measure = r'''
import hashlib
import json
import math
import platform
import subprocess
import sys
import time
from pathlib import Path

import pandas as pd
from scipy.stats import pearsonr, spearmanr

output = Path('/kaggle/working')
judge_scores = [59.6, 59.6, 59.6, 59.1, 59.0, 58.0, 56.3, 54.9, 54.8, 54.0, 52.6, 51.2, 43.2, 35.8, 33.6]
human_scores = [.571, .564, .559, .555, .553, .552, .547, .529, .510, .500, .491, .485, .371, .361, .279]
assert len(judge_scores) == len(human_scores) == 15
table_check = dict(source='ECCV supplementary Table 9, rounded published scores, A–O only',
                   n=15, judge_scores=judge_scores, human_scores=human_scores,
                   spearman=float(spearmanr(judge_scores, human_scores).statistic),
                   pearson=float(pearsonr(judge_scores, human_scores).statistic))
(output / 'table9-arithmetic.json').write_text(json.dumps(table_check, indent=2), encoding='utf-8')
print(table_check, flush=True)

references_url = 'https://drive.usercontent.google.com/u/1/uc?id=1I8u6uYysQUstoVYZapyRQkXmOwr-AG3d&export=download'
references_file = Path('/tmp/ka-lingoqa-references.parquet')
subprocess.run(['curl', '-fLsS', '--retry', '3', '-o', str(references_file), references_url], check=True, timeout=120)
references = pd.read_parquet(references_file)
columns = ['segment_id', 'question_id', 'question', 'answer']
grouped = references.groupby(['segment_id', 'question_id'], sort=True)
dataset_check = dict(url=references_url, sha256=hashlib.sha256(references_file.read_bytes()).hexdigest(),
                     columns=references.columns.tolist(), rows=len(references), questions=grouped.ngroups,
                     segments=int(references['segment_id'].nunique()),
                     rows_per_question={int(size): int(count) for size, count in grouped.size().value_counts().items()},
                     null_cells=int(references[columns].isna().sum().sum()))
(output / 'reference-integrity.json').write_text(json.dumps(dataset_check, indent=2), encoding='utf-8')
print(dataset_check, flush=True)
assert dataset_check['rows'] == 1000 and dataset_check['segments'] == 100
assert dataset_check['rows_per_question'] == {2: 500} and dataset_check['null_cells'] == 0
assert (grouped['question'].nunique() == 1).all()

subprocess.run([sys.executable, '-m', 'pip', 'install', 'transformers==4.52.4', 'sentencepiece==0.2.1'],
               check=True, timeout=420)
with (output / 'pip-freeze.txt').open('w', encoding='utf-8') as record:
    subprocess.run([sys.executable, '-m', 'pip', 'freeze'], stdout=record, check=True)

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

torch.set_num_threads(4)
model_id = 'wayveai/Lingo-Judge'
revision = 'a1a6e2194fd1aedaba02bde82316a6b73753d1d5'
tokenizer = AutoTokenizer.from_pretrained(model_id, revision=revision, use_fast=True, trust_remote_code=False)
model = AutoModelForSequenceClassification.from_pretrained(model_id, revision=revision, trust_remote_code=False).eval()
cases = []
started = time.monotonic()
with torch.inference_mode():
    for index, ((segment_id, question_id), group) in enumerate(grouped):
        if index >= 8:
            break
        question = group['question'].iloc[0]
        answers = [str(answer).strip().lower() for answer in group['answer']]
        for arm, prediction in [('reference_self', answers[0]), ('unrelated', 'unrelated test response')]:
            texts = [f'{tokenizer.cls_token}\nQuestion: {question}\nAnswer: {answer}\nStudent: {prediction}' for answer in answers]
            tokens = tokenizer(texts, return_tensors='pt', padding=True, truncation=True, max_length=128)
            logits = model(**tokens).logits.squeeze(-1)
            assert logits.shape == (2,)
            probabilities = logits.sigmoid().tolist()
            assert all(math.isfinite(score) and 0 <= score <= 1 for score in probabilities)
            cases.append(dict(segment_id=str(segment_id), question_id=str(question_id), arm=arm,
                              per_reference=probabilities, maximum=max(probabilities), correct=float(logits.max()) > 0))
assert len(cases) == 16
result = dict(scope='public-asset smoke test, no model-human correlation', prereg_commit=PREREG_COMMIT,
              model=model_id, revision=revision, python=platform.python_version(), torch=str(torch.__version__),
              elapsed_s=time.monotonic() - started, cases=cases)
(output / 'judge-smoke.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
print(json.dumps(result, indent=2), flush=True)
'''

if __name__ == '__main__':
    commit = subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip()
    notebook = dict(nbformat=4, nbformat_minor=4, metadata={'kernelspec': {
        'display_name': 'Python 3', 'language': 'python', 'name': 'python3'}},
        cells=[cell(f'PREREG_COMMIT = {commit!r}\n' + measure)])
    Path(__file__).with_name('lingoqa-judge-preflight.ipynb').write_text(json.dumps(notebook, indent=1), encoding='utf-8')
