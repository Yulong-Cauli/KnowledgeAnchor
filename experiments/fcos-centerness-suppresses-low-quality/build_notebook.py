import json
import subprocess
from pathlib import Path


def cell(source):
    compile(source, '<notebook>', 'exec')
    return dict(cell_type='code', execution_count=None, metadata={}, outputs=[], source=source)


setup = r'''
import os
import subprocess
import time
from pathlib import Path

started = time.monotonic()
output = Path('/kaggle/working')
work = Path('/kaggle/tmp/fcos')
work.mkdir(parents=True, exist_ok=True)
with (output / 'gpu.txt').open('w') as record:
    subprocess.run(['nvidia-smi'], check=True, stdout=record)
miniforge = work / 'miniforge.sh'
subprocess.run(['curl', '-fLsS', '--retry', '3', '-o', str(miniforge),
                'https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-Linux-x86_64.sh'],
               check=True, timeout=600)
conda = work / 'conda'
subprocess.run(['bash', str(miniforge), '-b', '-p', str(conda)], check=True, timeout=900)
prefix = work / 'py310'
subprocess.run([str(conda / 'bin/conda'), 'create', '-y', '-p', str(prefix), 'python=3.10'],
               check=True, timeout=1200)
py = str(prefix / 'bin/python')
pip = [py, '-m', 'pip', 'install', '--disable-pip-version-check']
subprocess.run(pip + ['setuptools<70', 'numpy==1.26.4', 'opencv-python==4.10.0.84',
                       'pycocotools==2.0.10', 'yapf==0.40.1'], check=True, timeout=900)
subprocess.run(pip + ['torch==2.0.1+cu118', 'torchvision==0.15.2+cu118',
                       '--index-url', 'https://download.pytorch.org/whl/cu118'], check=True, timeout=1500)
subprocess.run(pip + ['mmcv-full==1.7.2', '--only-binary=mmcv-full', '-f',
                       'https://download.openmmlab.com/mmcv/dist/cu118/torch2.0/index.html'],
               check=True, timeout=900)
subprocess.run(pip + ['mmdet==2.28.2'], check=True, timeout=900)
with (output / 'pip-freeze.txt').open('w') as record:
    subprocess.run([py, '-m', 'pip', 'freeze'], check=True, stdout=record)
repo = work / 'mmdetection'
subprocess.run(['git', 'clone', '--depth', '1', '--branch', 'v2.28.2',
                'https://github.com/open-mmlab/mmdetection.git', str(repo)], check=True, timeout=300)
'''

evaluation = r'''
import copy
import hashlib
import json
import subprocess
from collections import Counter
from pathlib import Path
import time

import torch
import mmcv
from mmcv.ops import nms
from mmcv.parallel import scatter
from mmdet.apis import init_detector
from mmdet.core import bbox2result
from mmdet.datasets import build_dataloader, build_dataset

output = Path('/kaggle/working')
work = Path('/kaggle/tmp/fcos')
repo = work / 'mmdetection'
config_rel = 'configs/fcos/fcos_r50_caffe_fpn_gn-head_1x_coco.py'
checkpoint_name = 'fcos_r50_caffe_fpn_gn-head_1x_coco-821213aa.pth'
checkpoint_url = ('https://download.openmmlab.com/mmdetection/v2.0/fcos/'
                  'fcos_r50_caffe_fpn_gn-head_1x_coco/' + checkpoint_name)


def sha256(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest() if hasattr(hashlib, 'file_digest') else stream_sha256(stream)


def stream_sha256(stream):
    digest = hashlib.sha256()
    for chunk in iter(lambda: stream.read(1024 * 1024), b''):
        digest.update(chunk)
    return digest.hexdigest()


def log(record):
    line = json.dumps(record, ensure_ascii=False)
    with (output / 'metrics.jsonl').open('a', encoding='utf-8') as stream:
        stream.write(line + '\n')
    print(line, flush=True)


def box_set(detections, labels):
    return Counter((label, *box[:4]) for box, label in zip(detections.tolist(), labels.tolist()))


def run(deadline, prereg_commit, notebook_sha256):
    torch.manual_seed(0)
    torch.backends.cudnn.benchmark = False
    assert torch.cuda.is_available(), 'CUDA unavailable'
    boxes = torch.tensor([[0., 0., 10., 10.], [1., 1., 10., 10.]], device='cuda:0')
    _, kept = nms(boxes, torch.tensor([0.9, 0.8], device='cuda:0'), 0.5)
    assert kept.tolist() == [0], 'CUDA NMS smoke failed'
    log(dict(stage='cuda_nms_ok', gpu=torch.cuda.get_device_name(0), cuda=torch.version.cuda,
             prereg_commit=prereg_commit, notebook_sha256=notebook_sha256))

    ann_candidates = sorted(Path('/kaggle/input').rglob('instances_val2017.json'))
    image_candidates = sorted(Path('/kaggle/input').rglob('000000000139.jpg'))
    assert len(ann_candidates) == 1, f'Expected one COCO annotation file, found {ann_candidates}'
    image_dirs = [path.parent for path in image_candidates if path.parent.name == 'val2017']
    assert len(image_dirs) == 1, f'Expected one COCO val2017 image directory, found {image_dirs}'
    ann_file = ann_candidates[0]
    image_dir = image_dirs[0]
    annotations = json.loads(ann_file.read_text(encoding='utf-8'))
    image_ids = {image['id'] for image in annotations['images']}
    assert len(annotations['images']) == len(image_ids) == 5000
    assert len(annotations['annotations']) == 36781 and len(annotations['categories']) == 80
    assert all((image_dir / image['file_name']).is_file() for image in annotations['images'])
    log(dict(stage='data_ok', images=5000, instances=36781, ann_sha256=sha256(ann_file)))

    weights = work / checkpoint_name
    subprocess.run(['curl', '-fLsS', '--retry', '3', '-o', str(weights), checkpoint_url],
                   check=True, timeout=600)
    weights_hash = sha256(weights)
    assert weights_hash.startswith('821213aa'), f'Checkpoint SHA256 mismatch: {weights_hash}'
    cfg = mmcv.Config.fromfile(repo / config_rel)
    cfg.model.backbone.init_cfg = None
    detector = init_detector(cfg, device='cpu')
    state = torch.load(weights, map_location='cpu')['state_dict']
    detector.load_state_dict(state, strict=True)
    detector = detector.eval().to('cuda:0')
    cfg.dump(str(output / 'resolved-config.py'))
    log(dict(stage='weights_ok', weights_sha256=weights_hash, weights_bytes=weights.stat().st_size,
             weights_url=checkpoint_url, config_sha256=sha256(output / 'resolved-config.py'),
             mmdet_commit=subprocess.check_output(['git', '-C', str(repo), 'rev-parse', 'HEAD'], text=True).strip()))

    test_cfg = copy.deepcopy(cfg.data.test)
    test_cfg.ann_file = str(ann_file)
    test_cfg.img_prefix = str(image_dir)
    test_cfg.test_mode = True
    dataset = build_dataset(test_cfg)
    assert len(dataset) == 5000 and set(dataset.img_ids) == image_ids
    ids_bytes = json.dumps(dataset.img_ids, separators=(',', ':')).encode()
    log(dict(stage='split_ok', ordered_image_ids_sha256=hashlib.sha256(ids_bytes).hexdigest()))
    loader = build_dataloader(dataset, samples_per_gpu=1, workers_per_gpu=2, dist=False, shuffle=False)
    head = detector.bbox_head
    full_cfg = copy.deepcopy(head.test_cfg)
    limit = full_cfg.max_per_img
    assert limit == 100 and full_cfg.nms_pre == 1000
    full_cfg.max_per_img = 10000
    native_results, cls_results = [], []
    changed_nms = changed_final = 0
    with torch.inference_mode(), (output / 'paired-box-counts.csv').open('w', encoding='utf-8') as rows:
        rows.write('image_id,native_nms,cls_nms,nms_set_equal,final_set_equal\n')
        for index, batch in enumerate(loader):
            if time.monotonic() >= deadline:
                log(dict(stage='partial_time_limit', images=index, changed_nms=changed_nms, changed_final=changed_final))
                return
            sample = scatter(batch, [0])[0]
            image, metas = sample['img'][0], sample['img_metas'][0]
            cls, reg, center = head(detector.extract_feat(image))
            a, labels_a = head.get_bboxes(cls, reg, center, img_metas=metas, cfg=full_cfg, rescale=True)[0]
            b, labels_b = head.get_bboxes(cls, reg, None, img_metas=metas, cfg=full_cfg, rescale=True)[0]
            assert len(a) <= 5 * full_cfg.nms_pre and len(b) <= 5 * full_cfg.nms_pre
            capped_a = bbox2result(a[:limit], labels_a[:limit], head.num_classes)
            capped_b = bbox2result(b[:limit], labels_b[:limit], head.num_classes)
            if index < 8:
                import numpy as np
                reference = detector.simple_test(image, metas, rescale=True)[0]
                assert all(np.array_equal(left, right) for left, right in zip(capped_a, reference)), 'Native parity gate failed'
                if index == 7:
                    log(dict(stage='native_parity_ok', images=8))
            same_nms = box_set(a, labels_a) == box_set(b, labels_b)
            same_final = box_set(a[:limit], labels_a[:limit]) == box_set(b[:limit], labels_b[:limit])
            changed_nms += not same_nms
            changed_final += not same_final
            rows.write(f'{dataset.img_ids[index]},{len(a)},{len(b)},{int(same_nms)},{int(same_final)}\n')
            native_results.append(capped_a)
            cls_results.append(capped_b)
            if (index + 1) % 250 == 0:
                rows.flush()
                log(dict(stage='progress', images=index + 1, changed_nms=changed_nms, changed_final=changed_final))

    assert len(native_results) == len(cls_results) == 5000
    native = dataset.evaluate(native_results, metric='bbox')
    log(dict(stage='native_ap', metrics=native))
    cls_only = dataset.evaluate(cls_results, metric='bbox')
    log(dict(stage='cls_only_ap', metrics=cls_only))
    from decimal import Decimal
    native_ap = Decimal(str(native['bbox_mAP'])) * 100
    delta = Decimal(str(cls_only['bbox_mAP'])) * 100 - native_ap
    log(dict(stage='complete', images=5000, changed_nms=changed_nms, changed_final=changed_final,
             baseline_in_band=Decimal('36.1') <= native_ap <= Decimal('37.1'),
             cls_minus_native_ap_pp=float(delta)))
'''

execute = f'''
import hashlib
import os
import subprocess
import time
from pathlib import Path

source = {evaluation!r}
prereg_commit = {{commit!r}}
notebook_file = Path('/kaggle/working/__notebook__.ipynb')
notebook_sha256 = hashlib.sha256(notebook_file.read_bytes()).hexdigest() if notebook_file.exists() else None
remaining = int(5.5 * 3600 - (time.monotonic() - started))
assert remaining > 120, 'Setup consumed the available session budget'
entrypoint = work / 'evaluate.py'
entrypoint.write_text(source + '\\nrun(' + repr(started + 5.5 * 3600 - 120) + ', ' + repr(prereg_commit) + ', ' + repr(notebook_sha256) + ')\\n', encoding='utf-8')
subprocess.run([py, str(entrypoint)], env={{**os.environ, 'CUDA_VISIBLE_DEVICES': '0'}}, check=True, timeout=remaining)
'''

if __name__ == '__main__':
    compile(evaluation, '<evaluation>', 'exec')
    commit = subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip()
    notebook = dict(nbformat=4, nbformat_minor=4, metadata={'kernelspec': {
        'display_name': 'Python 3', 'language': 'python', 'name': 'python3'}},
        cells=[cell(setup), cell(execute.replace('{commit!r}', repr(commit)))])
    Path(__file__).with_name('fcos-centerness.ipynb').write_text(json.dumps(notebook, indent=1), encoding='utf-8')
