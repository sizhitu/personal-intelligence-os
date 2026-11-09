#!/usr/bin/env python3
"""Merge aligned Chinese and English SRT files into two-line bilingual SRT."""

from __future__ import annotations

import argparse
import re
from pathlib import Path

TIMESTAMP = re.compile(
    r"^\d{2}:\d{2}:\d{2},\d{3}\s+-->\s+\d{2}:\d{2}:\d{2},\d{3}$"
)


def parse_srt(path: Path) -> list[tuple[str, str, list[str]]]:
    raw = path.read_text(encoding="utf-8-sig").strip()
    if not raw:
        raise ValueError(f"{path}: file is empty")

    blocks = re.split(r"\r?\n\s*\r?\n", raw)
    cues: list[tuple[str, str, list[str]]] = []

    for block_number, block in enumerate(blocks, start=1):
        lines = block.splitlines()
        if len(lines) < 3:
            raise ValueError(f"{path}: cue {block_number} has fewer than 3 lines")

        cue_number = lines[0].strip()
        timestamp = lines[1].strip()
        if not cue_number.isdigit():
            raise ValueError(f"{path}: cue {block_number} has invalid cue number")
        if not TIMESTAMP.match(timestamp):
            raise ValueError(f"{path}: cue {block_number} has invalid timestamp")

        text_lines = [line.strip() for line in lines[2:] if line.strip()]
        if not text_lines:
            raise ValueError(f"{path}: cue {block_number} has no subtitle text")

        cues.append((cue_number, timestamp, text_lines))

    return cues


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Merge aligned Chinese and English SRT files."
    )
    parser.add_argument("chinese_srt", type=Path)
    parser.add_argument("english_srt", type=Path)
    parser.add_argument("-o", "--output", type=Path, default=Path("bilingual.srt"))
    args = parser.parse_args()

    zh_cues = parse_srt(args.chinese_srt)
    en_cues = parse_srt(args.english_srt)

    if len(zh_cues) != len(en_cues):
        raise SystemExit(
            f"Cue count mismatch: Chinese={len(zh_cues)}, English={len(en_cues)}. "
            "Regenerate the English SRT without changing cue boundaries."
        )

    merged: list[str] = []
    for index, (zh, en) in enumerate(zip(zh_cues, en_cues), start=1):
        zh_number, zh_time, zh_text = zh
        en_number, en_time, en_text = en

        if zh_number != en_number or zh_time != en_time:
            raise SystemExit(
                f"Cue {index} mismatch. Chinese: {zh_number} {zh_time}; "
                f"English: {en_number} {en_time}. Refusing to create misaligned output."
            )

        merged.append(
            "\n".join(
                [
                    str(index),
                    zh_time,
                    " ".join(zh_text),
                    " ".join(en_text),
                ]
            )
        )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text("\n\n".join(merged) + "\n", encoding="utf-8")
    print(f"Wrote {len(merged)} bilingual cues to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
