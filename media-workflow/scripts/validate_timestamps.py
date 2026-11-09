#!/usr/bin/env python3
"""Validate AI highlight JSON against the original video's duration."""
from __future__ import annotations
import argparse, json, subprocess
from pathlib import Path

def media_duration(path: Path) -> float:
    command = ["ffprobe", "-v", "error", "-show_entries", "format=duration",
               "-of", "default=noprint_wrappers=1:nokey=1", str(path)]
    result = subprocess.run(command, check=True, capture_output=True, text=True)
    return float(result.stdout.strip())

def validate(data: dict, duration: float, min_seconds: float, max_seconds: float) -> list[str]:
    errors: list[str] = []
    if data.get("timebase") != "original":
        errors.append('timebase must be "original" (timestamps refer to source video)')
    clips = data.get("clips")
    if not isinstance(clips, list):
        return errors + ["clips must be an array"]
    seen: set[str] = set()
    for i, clip in enumerate(clips, 1):
        prefix = f"clips[{i}]"
        if not isinstance(clip, dict):
            errors.append(f"{prefix} must be an object")
            continue
        clip_id = str(clip.get("id", ""))
        if not clip_id:
            errors.append(f"{prefix}: missing id")
        elif clip_id in seen:
            errors.append(f"{prefix}: duplicate id {clip_id}")
        seen.add(clip_id)
        try:
            start, end = float(clip["start"]), float(clip["end"])
        except (KeyError, TypeError, ValueError):
            errors.append(f"{prefix}: start/end must be numbers")
            continue
        if start < 0 or end <= start:
            errors.append(f"{prefix}: require 0 <= start < end")
            continue
        if end > duration + 0.25:
            errors.append(f"{prefix}: end {end:.2f}s exceeds source duration {duration:.2f}s")
        length = end - start
        if length < min_seconds:
            errors.append(f"{prefix}: {length:.1f}s is shorter than {min_seconds:.1f}s")
        if length > max_seconds:
            errors.append(f"{prefix}: {length:.1f}s exceeds {max_seconds:.1f}s; review manually")
        for field in ("topic", "hook", "title", "reason"):
            if not str(clip.get(field, "")).strip():
                errors.append(f"{prefix}: missing {field}")
    return errors

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("video", type=Path)
    parser.add_argument("highlights", type=Path)
    parser.add_argument("--min-seconds", type=float, default=10)
    parser.add_argument("--max-seconds", type=float, default=120)
    args = parser.parse_args()
    if not args.video.is_file() or not args.highlights.is_file():
        parser.error("video and highlights JSON must both exist")
    try:
        data = json.loads(args.highlights.read_text(encoding="utf-8-sig"))
        duration = media_duration(args.video)
    except (json.JSONDecodeError, subprocess.CalledProcessError, ValueError) as exc:
        raise SystemExit(f"Cannot validate inputs: {exc}") from exc
    errors = validate(data, duration, args.min_seconds, args.max_seconds)
    if errors:
        print("Validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1
    print(f"OK: {len(data['clips'])} clips; source duration {duration:.2f}s; timebase=original")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
