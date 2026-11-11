"""MAE + decayed identity shortcuts on CIFAR-100 -- minimal validation.

对照：alpha_min = 1.0（标准残差） vs alpha_min = 0.6（衰减捷径）。
只验证方向，不复现论文绝对值。

设计约束：Kaggle T4 单次可用约 4 小时 GPU 配额，两组串行，
每组的 epoch 数按前几个 epoch 的实测速度动态确定。
"""

import os
import sys
import glob
import json
import math
import time
import pickle
import random

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader

# ----------------------------------------------------------------------------
# config
# ----------------------------------------------------------------------------
SEED = 0
IMG = 32
PATCH = 4
DIM = 384
DEPTH = 12
HEADS = 6
DEC_DIM = 192
DEC_DEPTH = 4
DEC_HEADS = 6
MASK_RATIO = 0.75
BATCH = 256
LR = 1.5e-4
WD = 0.05
WARMUP = 5
MIN_EPOCHS = 60
MAX_EPOCHS = 400

# 每组训练时间预算（秒）。两组 + 评估要落在 ~3.2h 内。
BUDGET_TRAIN = 4800
BUDGET_LP = 600

ALPHAS = [1.0, 0.6]
OUT_DIR = "/kaggle/working"
DATA_ROOTS = ["/kaggle/input/cifar100", "/kaggle/input/cifar-100-python"]
INPUT_BASE = "/kaggle/input"


def log(*a):
    print(*a, flush=True)


def describe_inputs(max_dirs=40):
    """只读打印挂载布局。Kaggle 的数据集目录层级会变，失败时据此定位。"""
    if not os.path.isdir(INPUT_BASE):
        log("[probe] /kaggle/input does not exist")
        return
    shown = 0
    for dirpath, dirnames, filenames in os.walk(INPUT_BASE):
        rel = os.path.relpath(dirpath, INPUT_BASE)
        if rel.count(os.sep) >= 2:
            dirnames[:] = []
        entries = []
        for f in filenames[:10]:
            try:
                entries.append((f, os.path.getsize(os.path.join(dirpath, f))))
            except OSError:
                entries.append((f, -1))
        log(f"[probe] {rel}/ dirs={sorted(dirnames)[:10]} files={entries}")
        shown += 1
        if shown >= max_dirs:
            log("[probe] ...truncated")
            break


# ----------------------------------------------------------------------------
# data
# ----------------------------------------------------------------------------
MEAN = torch.tensor([0.5071, 0.4865, 0.4409]).view(3, 1, 1)
STD = torch.tensor([0.2673, 0.2564, 0.2762]).view(3, 1, 1)


def _has_split(root):
    return (os.path.isfile(os.path.join(root, "train"))
            and os.path.isfile(os.path.join(root, "test")))


def find_root():
    for r in DATA_ROOTS:
        if _has_split(r):
            return r
    # 递归兜底：镜像可能把 train/test 再套一层目录（如 cifar-100-python/）
    for p in glob.glob("/kaggle/input/**/train", recursive=True):
        root = os.path.dirname(p)
        if _has_split(root):
            return root
    return None


def load_split(root, train):
    fn = os.path.join(root, "train" if train else "test")
    with open(fn, "rb") as f:
        d = pickle.load(f, encoding="bytes")

    def pick(key):
        if key in d:
            return d[key]
        alt = key.encode() if isinstance(key, str) else key.decode()
        if alt in d:
            return d[alt]
        raise KeyError(f"{fn}: missing key {key!r}; keys={list(d)[:8]}")

    x = np.asarray(pick(b"data")).reshape(-1, 3, IMG, IMG)
    y = np.asarray(pick(b"fine_labels"), dtype=np.int64)
    return x, y


class CIFAR(Dataset):
    def __init__(self, x, y, train):
        self.x = x
        self.y = y
        self.train = train

    def __len__(self):
        return len(self.y)

    def __getitem__(self, i):
        img = torch.from_numpy(self.x[i]).float().div_(255.0)
        if self.train:
            # random crop with padding + hflip
            # 用 torch 的 RNG：DataLoader 会给每个 worker 正确播种，
            # 而 python random 模块的种子不会跟着 worker 走。
            img = F.pad(img, (4, 4, 4, 4), mode="reflect")
            top = int(torch.randint(0, 9, (1,)))
            left = int(torch.randint(0, 9, (1,)))
            img = img[:, top:top + IMG, left:left + IMG]
            if float(torch.rand(1)) < 0.5:
                img = torch.flip(img, dims=[2])
        return (img - MEAN) / STD, self.y[i]


# ----------------------------------------------------------------------------
# model
# ----------------------------------------------------------------------------
class Block(nn.Module):
    def __init__(self, dim, heads, mlp_ratio=4.0, decay=(1.0, 1.0)):
        super().__init__()
        self.decay = decay
        self.norm1 = nn.LayerNorm(dim, eps=1e-6)
        self.attn = nn.MultiheadAttention(dim, heads, batch_first=True)
        self.norm2 = nn.LayerNorm(dim, eps=1e-6)
        self.fc1 = nn.Linear(dim, int(dim * mlp_ratio))
        self.fc2 = nn.Linear(int(dim * mlp_ratio), dim)
        # 3.2 的残差零初始化：子层出口线性层置零
        nn.init.constant_(self.attn.out_proj.weight, 0)
        nn.init.constant_(self.attn.out_proj.bias, 0)
        nn.init.constant_(self.fc2.weight, 0)
        nn.init.constant_(self.fc2.bias, 0)

    def forward(self, x):
        h = self.norm1(x)
        x = self.decay[0] * x + self.attn(h, h, h, need_weights=False)[0]
        h = self.norm2(x)
        x = self.decay[1] * x + self.fc2(F.gelu(self.fc1(h)))
        return x


def make_decay(depth, alpha_min):
    """与官方实现同口径：2*depth 个系数，每层两条支路各一个。"""
    if alpha_min >= 1.0:
        return [[1.0, 1.0] for _ in range(depth)]
    v = np.linspace(0.0, 1.0, 2 * depth).reshape(-1, 2)
    d = 1.0 - v * (1.0 - alpha_min)
    return d.tolist()


class MAE(nn.Module):
    def __init__(self, alpha_min):
        super().__init__()
        n = (IMG // PATCH) ** 2
        self.patch_embed = nn.Conv2d(3, DIM, PATCH, PATCH)
        self.cls = nn.Parameter(torch.zeros(1, 1, DIM))
        self.pos = nn.Parameter(torch.zeros(1, n, DIM))
        self.mask_token = nn.Parameter(torch.zeros(1, 1, DIM))

        dec = make_decay(DEPTH, alpha_min)
        self.blocks = nn.ModuleList([
            Block(DIM, HEADS, decay=tuple(dec[i])) for i in range(DEPTH)
        ])
        self.norm = nn.LayerNorm(DIM, eps=1e-6)

        self.dec_embed = nn.Linear(DIM, DEC_DIM)
        self.dec_cls = nn.Parameter(torch.zeros(1, 1, DEC_DIM))
        self.dec_pos = nn.Parameter(torch.zeros(1, n, DEC_DIM))
        self.dec_blocks = nn.ModuleList([
            Block(DEC_DIM, DEC_HEADS, decay=(1.0, 1.0)) for _ in range(DEC_DEPTH)
        ])
        self.dec_norm = nn.LayerNorm(DEC_DIM, eps=1e-6)
        self.pred = nn.Linear(DEC_DIM, PATCH * PATCH * 3)
        nn.init.constant_(self.pred.weight, 0)
        nn.init.constant_(self.pred.bias, 0)

        nn.init.trunc_normal_(self.cls, std=0.02)
        nn.init.trunc_normal_(self.pos, std=0.02)
        nn.init.trunc_normal_(self.mask_token, std=0.02)
        nn.init.trunc_normal_(self.dec_cls, std=0.02)
        nn.init.trunc_normal_(self.dec_pos, std=0.02)

    def patchify(self, x):
        p = PATCH
        h = w = IMG // p
        x = x.reshape(x.shape[0], 3, h, p, w, p)
        x = x.permute(0, 2, 4, 1, 3, 5)
        return x.reshape(x.shape[0], h * w, p * p * 3)

    def forward_encoder(self, x, ratio):
        x = self.patch_embed(x).flatten(2).transpose(1, 2) + self.pos
        b, n, d = x.shape
        keep = int(n * (1 - ratio))
        noise = torch.rand(b, n, device=x.device)
        ids = torch.argsort(noise, dim=1)
        ids_restore = torch.argsort(ids, dim=1)
        x = torch.gather(x, 1, ids[:, :keep].unsqueeze(-1).expand(-1, -1, d))
        x = torch.cat([self.cls.expand(b, -1, -1), x], dim=1)
        for blk in self.blocks:
            x = blk(x)
        return self.norm(x), ids_restore, keep

    def forward(self, x):
        z, ids_restore, keep = self.forward_encoder(x, MASK_RATIO)
        b, n = x.shape[0], self.pos.shape[1]
        vis = z[:, 1:]
        m = self.mask_token.expand(b, n - keep, -1)
        y = torch.cat([vis, m], dim=1)
        y = torch.gather(y, 1, ids_restore.unsqueeze(-1).expand(-1, -1, y.shape[2]))
        y = self.dec_embed(y) + self.dec_pos
        y = torch.cat([self.dec_cls.expand(b, -1, -1), y], dim=1)
        for blk in self.dec_blocks:
            y = blk(y)
        y = self.dec_norm(y)[:, 1:]
        y = self.pred(y)

        target = self.patchify(x)
        mu = target.mean(-1, keepdim=True)
        var = target.var(-1, keepdim=True)
        target = (target - mu) / (var + 1e-6).sqrt()

        loss = ((y - target) ** 2).mean(-1)
        mask = torch.ones(b, n, device=x.device)
        mask[:, :keep] = 0
        mask = torch.gather(mask, 1, ids_restore)
        return (loss * mask).sum() / mask.sum()


# ----------------------------------------------------------------------------
# train / eval
# ----------------------------------------------------------------------------
def train_one(alpha_min, xtr, ytr, budget):
    torch.manual_seed(SEED)
    random.seed(SEED)
    np.random.seed(SEED)

    model = MAE(alpha_min).cuda()
    opt = torch.optim.AdamW(model.parameters(), lr=LR, weight_decay=WD,
                            betas=(0.9, 0.95))
    total = {"n": MAX_EPOCHS}

    def lr_fn(e):
        if e < WARMUP:
            return (e + 1) / WARMUP
        span = max(1, total["n"] - WARMUP)
        p = min(1.0, (e - WARMUP) / span)
        return 0.5 * (1 + math.cos(math.pi * p))

    sched = torch.optim.lr_scheduler.LambdaLR(opt, lr_fn)
    try:
        scaler = torch.amp.GradScaler("cuda")
    except Exception:
        scaler = torch.cuda.amp.GradScaler()

    ds = CIFAR(xtr, ytr, train=True)
    dl = DataLoader(ds, batch_size=BATCH, shuffle=True, num_workers=2,
                    drop_last=True, pin_memory=True)

    t0 = time.time()
    done = 0
    for ep in range(MAX_EPOCHS):
        model.train()
        run = 0.0
        for img, _ in dl:
            opt.zero_grad(set_to_none=True)
            with torch.autocast("cuda", dtype=torch.float16):
                loss = model(img.cuda(non_blocking=True))
            scaler.scale(loss).backward()
            scaler.step(opt)
            scaler.update()
            run += loss.item()
        sched.step()
        done = ep + 1
        el = time.time() - t0

        if done == WARMUP:
            per = el / done
            total["n"] = int(max(MIN_EPOCHS, min(MAX_EPOCHS, budget / per)))
            log(f"  [calib] {per:.1f}s/epoch -> total_epochs={total['n']}")
            total["n"] = max(total["n"], done + 1)

        if done % 10 == 0 or done == total["n"]:
            log(f"  ep {done}/{total['n']} loss {run/len(dl):.4f} "
                f"elapsed {el/60:.1f}m")

        if done >= total["n"] or el > budget * 1.15:
            log(f"  [stop] epoch {done} elapsed {el/60:.1f}m")
            break

    return model, done, time.time() - t0


@torch.no_grad()
def extract(model, x, y):
    model.eval()
    ds = CIFAR(x, y, train=False)
    dl = DataLoader(ds, batch_size=512, shuffle=False, num_workers=2)
    feats, labels = [], []
    for img, lab in dl:
        with torch.autocast("cuda", dtype=torch.float16):
            z, _, _ = model.forward_encoder(img.cuda(), 0.0)
        feats.append(z[:, 0].float().cpu())
        labels.append(lab)
    return torch.cat(feats), torch.cat(labels)


def linear_probe(ftr, ytr, fte, yte, budget):
    torch.manual_seed(SEED)
    head = nn.Linear(ftr.shape[1], 100).cuda()
    opt = torch.optim.AdamW(head.parameters(), lr=1e-3, weight_decay=0.0)
    ds = torch.utils.data.TensorDataset(ftr, ytr)
    dl = DataLoader(ds, batch_size=512, shuffle=True, drop_last=True)
    t0 = time.time()
    for ep in range(200):
        head.train()
        for a, b in dl:
            opt.zero_grad()
            loss = F.cross_entropy(head(a.cuda()), b.cuda())
            loss.backward()
            opt.step()
        if time.time() - t0 > budget:
            break
    head.eval()
    with torch.no_grad():
        acc = (head(fte.cuda()).argmax(1).cpu() == yte).float().mean().item()
    return acc


def eff_rank(f):
    f = f - f.mean(0, keepdim=True)
    c = torch.cov(f.T.double())
    s = torch.linalg.svdvals(c)
    s = s[s > 0]
    p = s / s.sum()
    return float(torch.exp(-(p * p.log()).sum()))


# ----------------------------------------------------------------------------
def main():
    describe_inputs()
    root = find_root()
    if root is None:
        log("DATA NOT FOUND")
        sys.exit(1)
    log("data root", root)

    xtr, ytr = load_split(root, True)
    xte, yte = load_split(root, False)
    log("train", xtr.shape, "test", xte.shape)
    log("gpu", torch.cuda.get_device_name(0))

    res = []
    for a in ALPHAS:
        log(f"\n=== alpha_min = {a} ===")
        model, eps, secs = train_one(a, xtr, ytr, BUDGET_TRAIN)
        ftr, ltr = extract(model, xtr, ytr)
        fte, lte = extract(model, xte, yte)
        acc = linear_probe(ftr, ltr, fte, lte, BUDGET_LP)
        r = eff_rank(fte)
        log(f"RESULT alpha={a} epochs={eps} lp_acc={acc:.4f} eff_rank={r:.2f}")
        res.append({"alpha_min": a, "epochs": eps, "train_sec": round(secs),
                    "lp_acc": round(acc, 4), "eff_rank": round(r, 2)})
        json.dump(res, open(os.path.join(OUT_DIR, "results.json"), "w"), indent=2)
        torch.cuda.empty_cache()

    log("\n=== SUMMARY ===")
    for r in res:
        log(r)


if __name__ == "__main__":
    main()
