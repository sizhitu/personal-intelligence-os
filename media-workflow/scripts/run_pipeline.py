#!/usr/bin/env python3
"""Run local transcription, Auto-Editor rough cut, and prepare manual AI highlight analysis."""
from __future__ import annotations
import argparse, shutil, subprocess
from pathlib import Path

def require(program: str) -> str:
    found = shutil.which(program)
    if not found:
        raise SystemExit(f"Required program not found in PATH: {program}")
    return found

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("video", type=Path, help="Original video; never overwritten")
    parser.add_argument("-o", "--output", type=Path, default=Path("video-workspace"))
    parser.add_argument("--whisper-cli", default="whisper-cli")
    parser.add_argument("--model", type=Path, required=True, help="Path to whisper.cpp model file")
    parser.add_argument("--auto-editor", default="auto-editor")
    parser.add_argument("--skip-transcription", action="store_true")
    parser.add_argument("--skip-rough-cut", action="store_true")
    args = parser.parse_args()
    source, model = args.video.expanduser().resolve(), args.model.expanduser().resolve()
    if not source.is_file():
        parser.error(f"Video not found: {source}")
    if not model.is_file():
        parser.error(f"Whisper model not found: {model}")
    require("ffmpeg")
    require("ffprobe")
    args.output.mkdir(parents=True, exist_ok=True)
    subs, rough, analysis = (args.output / n for n in ("subtitles", "rough_cut", "analysis"))
    for folder in (subs, rough, analysis):
        folder.mkdir(exist_ok=True)
    prefix = subs / "transcript"
    if not args.skip_transcription:
        whisper = require(args.whisper_cli)
        # Standard whisper.cpp CLI flags; check whisper-cli --help if your build differs.
        command = [whisper, "-m", str(model), "-f", str(source), "-l", "zh",
                   "-osrt", "-oj", "-of", str(prefix)]
        print("Transcribing original source with whisper.cpp...")
        subprocess.run(command, check=True)
    else:
        print("Skipping transcription.")
    srt = prefix.with_suffix(".srt")
    if srt.exists():
        script = Path(__file__).with_name("analyze_srt.py")
        subprocess.run(["python3", str(script), str(srt), "-o", str(analysis / "analysis_prompt.md")], check=True)
    else:
        print(f"SRT not found at {srt}; prompt generation skipped.")
    if not args.skip_rough_cut:
        editor = require(args.auto_editor)
        print("Creating Shotcut project from original source with Auto-Editor...")
        subprocess.run([editor, str(source), "--export", "shotcut"], cwd=rough, check=True)
    else:
        print("Skipping Auto-Editor rough cut.")
    print("\nPipeline stage complete.")
    print(f"Workspace: {args.output.resolve()}")
    print("Next: paste analysis/analysis_prompt.md into ChatGPT; save its JSON response as analysis/highlights.json.")
    print("Then run generate_shorts.py using the ORIGINAL source video and ORIGINAL SRT.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
