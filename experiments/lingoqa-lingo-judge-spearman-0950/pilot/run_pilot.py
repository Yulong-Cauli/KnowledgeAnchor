"""Run the fixed five-frame, four-model LingoQA pilot in a Kaggle notebook."""

import gc
import hashlib
import io
import json
import os
import platform
import shutil
import subprocess
import sys
import tempfile
import time
import traceback
import zipfile
from pathlib import Path

import pandas as pd
import torch
import transformers
from huggingface_hub import snapshot_download
from PIL import Image
from transformers import AutoModelForImageTextToText, AutoProcessor


MODELS = (
    ("llava-hf/llava-onevision-qwen2-0.5b-ov-hf", "74dd0bf867a4cda7950c17663794267c60cf4b40", 1787445680),
    ("HuggingFaceTB/SmolVLM2-2.2B-Instruct", "482adb537c021c86670beed01cd58990d01e72e4", 8987224056),
    ("Qwen/Qwen3-VL-4B-Instruct", "ebb281ec70b05090aa6165b016eac8ec08e71b17", 8875719344),
    ("OpenGVLab/InternVL3_5-4B-HF", "6bd4487402110ef9889ba50eb7aefeb302526fed", 9465085464),
)
REFERENCE_URL = "https://drive.usercontent.google.com/u/1/uc?id=1I8u6uYysQUstoVYZapyRQkXmOwr-AG3d&export=download"
IMAGE_URL = "https://drive.usercontent.google.com/download?id=1U5tBTZjw0rH9ID1JuuWsOmIp2HNvQvQo&export=download&confirm=t"
REFERENCE_SHA256 = "435461a8a8038ad8d2a8fe98388f40530978149e60e7beaaa41174088fe53caf"
IMAGE_BYTES = 232101697
SALT = "ka-lingo-pilot-20261109"
MAX_TOKENS = 128
MAX_IMAGE_SIDE = 640
PROMPT = (
    "The images show five frames from a driving clip in chronological order. "
    "Answer the question directly in English. Include a reason when the question asks for one.\n\n"
)
OUTPUT = Path("/kaggle/working")


def digest(path):
    with path.open("rb") as source:
        return hashlib.file_digest(source, "sha256").hexdigest()


def rank_id(value):
    return hashlib.sha256(f"{SALT}:{value}".encode()).hexdigest()


def save_json(name, value):
    path = OUTPUT / name
    temporary = path.with_suffix(".tmp")
    temporary.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    temporary.replace(path)


def download(url, destination):
    subprocess.run(
        ["curl", "-fLsS", "--retry", "2", "--connect-timeout", "30", "--max-time", "300",
         "-o", str(destination), url],
        check=True,
        timeout=650,
    )


def select_questions(references):
    groups = references.groupby(["segment_id", "question_id"], sort=True)
    if len(references) != 1000 or groups.ngroups != 500 or references["segment_id"].nunique() != 100:
        raise ValueError("Unexpected reference dataset structure")
    segments = sorted(references["segment_id"].unique(), key=rank_id)[:10]
    questions = []
    for segment in segments:
        rows = references[references["segment_id"] == segment]
        for question_id in sorted(rows["question_id"].unique(), key=rank_id)[:2]:
            pair = groups.get_group((segment, question_id))
            first = pair.iloc[0]
            images = list(first["images"])
            if (len(pair) != 2 or pair["question"].nunique() != 1
                    or len(images) != 5 or images != list(pair.iloc[1]["images"])):
                raise ValueError(f"Unexpected reference pair for {question_id}")
            questions.append(dict(segment_id=segment, question_id=question_id,
                                  question=first["question"], images=images))
    if len(questions) != 20:
        raise ValueError("Expected 20 distinct questions")
    return questions


def load_frames(archive, paths):
    frames = []
    for path in paths:
        with Image.open(io.BytesIO(archive.read(path))) as image:
            rgb = image.convert("RGB")
        rgb.thumbnail((MAX_IMAGE_SIDE, MAX_IMAGE_SIDE), Image.Resampling.LANCZOS)
        frames.append(rgb)
    return frames


def predict(model, processor, frames, question):
    content = [{"type": "image", "image": frame} for frame in frames]
    content.append({"type": "text", "text": PROMPT + question})
    messages = [{"role": "user", "content": content}]
    inputs = processor.apply_chat_template(
        messages, tokenize=True, add_generation_prompt=True, return_tensors="pt", return_dict=True
    ).to("cuda:0", dtype=torch.float16)
    with torch.inference_mode():
        sequences = model.generate(**inputs, do_sample=False, max_new_tokens=MAX_TOKENS)
    completion = sequences[0, inputs["input_ids"].shape[1]:]
    answer = processor.decode(completion, skip_special_tokens=True).strip()
    return dict(answer=answer, generated_tokens=completion.numel(), token_limit_reached=completion.numel() == MAX_TOKENS)


def run_model(run, entry, questions, frames, cache):
    repo, revision, expected_bytes = entry
    record = dict(model=repo, revision=revision, expected_weight_bytes=expected_bytes, stage="download")
    run["models"].append(record)
    save_json("pilot-run.json", run)
    print(f"{repo}: download started", flush=True)
    model = processor = None
    answers = []
    started = time.monotonic()
    try:
        if shutil.disk_usage(cache).free < expected_bytes + 1_000_000_000:
            raise OSError("Insufficient free disk for this checkpoint")
        snapshot_download(
            repo, revision=revision, local_dir=cache, max_workers=2,
            allow_patterns=["model*.safetensors", "*.json", "*.txt", "*.jinja", "*.model"],
            ignore_patterns=["onnx/*"],
        )
        files = sorted(cache.glob("model*.safetensors"))
        record["weight_files"] = {file.name: file.stat().st_size for file in files}
        record["download_seconds"] = time.monotonic() - started
        if sum(record["weight_files"].values()) != expected_bytes:
            raise ValueError("Downloaded weight byte count differs from pinned manifest")
        print(f"{repo}: weights downloaded in {record['download_seconds']:.1f} s", flush=True)
        record["stage"] = "load"
        save_json("pilot-run.json", run)
        processor = AutoProcessor.from_pretrained(cache, local_files_only=True, trust_remote_code=False)
        model = AutoModelForImageTextToText.from_pretrained(
            cache, local_files_only=True, trust_remote_code=False, use_safetensors=True,
            torch_dtype=torch.float16, device_map={"": "cuda:0"}, attn_implementation="eager",
        ).eval()
        torch.cuda.reset_peak_memory_stats()
        record["stage"] = "generation"
        save_json("pilot-run.json", run)
        for question in questions:
            started = time.monotonic()
            result = predict(model, processor, frames[question["segment_id"]], question["question"])
            answers.append(dict(model=repo, revision=revision, segment_id=question["segment_id"],
                                question_id=question["question_id"], **result))
            if len(answers) == 1:
                record["first_question_seconds"] = time.monotonic() - started
                print(f"{repo}: first answer generated ({result['generated_tokens']} tokens)", flush=True)
                save_json("pilot-run.json", run)
        record["stage"] = "complete"
    except Exception as error:
        record["error"] = f"{type(error).__name__}: {error}"
        traceback.print_exc()
    finally:
        record["answers"] = len(answers)
        record["nonempty_answers"] = sum(bool(answer["answer"]) for answer in answers)
        record["peak_allocated_bytes"] = torch.cuda.max_memory_allocated()
        save_json("pilot-run.json", run)
        del model, processor
        gc.collect()
        torch.cuda.empty_cache()
    return answers


def main():
    subprocess.run(["nvidia-smi"], check=True)
    if not torch.cuda.is_available():
        raise RuntimeError("A CUDA GPU is required for this pilot")
    with (OUTPUT / "pip-freeze.txt").open("w", encoding="utf-8") as file:
        subprocess.run([sys.executable, "-m", "pip", "freeze"], check=True, stdout=file)
    run = {
        "python": platform.python_version(), "torch": torch.__version__,
        "transformers": transformers.__version__, "cuda": torch.version.cuda,
        "gpu": torch.cuda.get_device_name(0), "dtype": "float16", "models": [],
        "prompt_prefix": PROMPT, "max_new_tokens": MAX_TOKENS, "max_image_side": MAX_IMAGE_SIDE,
        "sampling_salt": SALT,
    }
    save_json("pilot-run.json", run)
    with tempfile.TemporaryDirectory(prefix="ka-lingo-pilot-") as directory:
        temporary = Path(directory)
        reference_file = temporary / "references.parquet"
        image_file = temporary / "images.zip"
        download(REFERENCE_URL, reference_file)
        if digest(reference_file) != REFERENCE_SHA256:
            raise ValueError("Reference dataset SHA256 differs from v1")
        questions = select_questions(pd.read_parquet(reference_file))
        save_json("questions.json", questions)
        download(IMAGE_URL, image_file)
        if image_file.stat().st_size != IMAGE_BYTES:
            raise ValueError("Unexpected official image archive size")
        run["references_sha256"] = REFERENCE_SHA256
        run["images_sha256"] = digest(image_file)
        with zipfile.ZipFile(image_file) as archive:
            frames = {question["segment_id"]: load_frames(archive, question["images"])
                      for question in questions[::2]}
        print(f"Loaded {len(questions)} questions from {len(frames)} clips", flush=True)
        answers = []
        for entry in MODELS:
            with tempfile.TemporaryDirectory(prefix="weights-", dir=temporary) as model_dir:
                answers.extend(run_model(run, entry, questions, frames, Path(model_dir)))
                save_json("model-answers.json", answers)
        if not answers:
            raise RuntimeError("No model completed a single question; see pilot-run.json")


if __name__ == "__main__":
    os.environ["HF_XET_CHUNK_CACHE_SIZE_BYTES"] = "0"
    main()
