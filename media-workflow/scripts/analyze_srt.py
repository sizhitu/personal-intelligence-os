#!/usr/bin/env python3
"""Create a ChatGPT-ready prompt from an original-timeline SRT (no API key needed)."""
from __future__ import annotations
import argparse
from pathlib import Path

PROMPT = Path(__file__).resolve().parents[1] / "prompts" / "analyze-highlights-zh.md"

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("srt", type=Path)
    parser.add_argument("-o", "--output", type=Path, default=Path("analysis_prompt.md"))
    args = parser.parse_args()
    if not args.srt.is_file():
        parser.error(f"SRT not found: {args.srt}")
    if not PROMPT.is_file():
        parser.error(f"Prompt template not found: {PROMPT}")
    transcript = args.srt.read_text(encoding="utf-8-sig").strip()
    if not transcript:
        parser.error("SRT is empty")
    content = PROMPT.read_text(encoding="utf-8") + "\n\n" + f"原始视频文件名：{args.srt.stem}\n\n" + transcript + "\n"
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(content, encoding="utf-8")
    print(f"Created {args.output}. Paste it into ChatGPT and save the returned JSON as highlights.json.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
