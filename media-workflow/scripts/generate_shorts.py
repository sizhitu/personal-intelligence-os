#!/usr/bin/env python3
"""Extract vertical candidate clips from the ORIGINAL source and create matching SRT files."""
from __future__ import annotations
import argparse, json, re, subprocess
from pathlib import Path

STAMP = re.compile(r"^(\d{2}):(\d{2}):(\d{2}),(\d{3})$")

def stamp_seconds(value: str) -> float:
    match = STAMP.match(value.strip())
    if not match:
        raise ValueError(f"Invalid SRT timestamp: {value}")
    h, m, s, ms = map(int, match.groups())
    return h * 3600 + m * 60 + s + ms / 1000

def format_stamp(seconds: float) -> str:
    total = max(0, round(seconds * 1000))
    h, rem = divmod(total, 3600000)
    m, rem = divmod(rem, 60000)
    s, ms = divmod(rem, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"

def parse_srt(path: Path) -> list[tuple[float, float, str]]:
    raw = path.read_text(encoding="utf-8-sig").strip()
    cues = []
    for block in re.split(r"\r?\n\s*\r?\n", raw):
        lines = block.splitlines()
        if len(lines) < 3 or "-->" not in lines[1]:
            continue
        left, right = lines[1].split("-->", 1)
        cues.append((stamp_seconds(left), stamp_seconds(right), "\n".join(lines[2:])))
    return cues

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("video", type=Path)
    parser.add_argument("highlights", type=Path)
    parser.add_argument("--srt", type=Path, help="Original source Chinese SRT")
    parser.add_argument("-o", "--output-dir", type=Path, default=Path("shorts"))
    parser.add_argument("--width", type=int, default=1080)
    parser.add_argument("--height", type=int, default=1920)
    parser.add_argument("--crf", type=int, default=20)
    args = parser.parse_args()
    data = json.loads(args.highlights.read_text(encoding="utf-8-sig"))
    if data.get("timebase") != "original":
        raise SystemExit('Refusing to extract: highlights JSON must declare timebase="original"')
    clips = data.get("clips", [])
    if not clips:
        raise SystemExit("No clips found in highlights JSON")
    args.output_dir.mkdir(parents=True, exist_ok=True)
    cues = parse_srt(args.srt) if args.srt else []
    for index, clip in enumerate(clips, 1):
        start, end = float(clip["start"]), float(clip["end"])
        if start < 0 or end <= start:
            raise SystemExit(f"Invalid interval in clip {clip.get('id', index)}")
        safe = re.sub(r"[^A-Za-z0-9_-]+", "_", str(clip.get("title", "highlight"))).strip("_")[:40] or "highlight"
        stem = f"{index:02}_{safe}"
        target = args.output_dir / f"{stem}.mp4"
        vf = f"scale={args.width}:{args.height}:force_original_aspect_ratio=increase,crop={args.width}:{args.height}"
        command = ["ffmpeg", "-y", "-ss", f"{start:.3f}", "-i", str(args.video),
                   "-t", f"{end-start:.3f}", "-map", "0:v:0", "-map", "0:a?",
                   "-vf", vf, "-c:v", "libx264", "-preset", "medium", "-crf", str(args.crf),
                   "-c:a", "aac", "-movflags", "+faststart", str(target)]
        subprocess.run(command, check=True)
        if cues:
            selected = [(a, b, txt) for a, b, txt in cues if b > start and a < end]
            blocks = []
            for n, (a, b, txt) in enumerate(selected, 1):
                lo, hi = max(0.0, a-start), min(end-start, b-start)
                if hi > lo:
                    blocks.append(f"{n}\n{format_stamp(lo)} --> {format_stamp(hi)}\n{txt}")
            out_srt = args.output_dir / f"{stem}.zh.srt"
            out_srt.write_text("\n\n".join(blocks) + ("\n" if blocks else ""), encoding="utf-8")
        print(f"Created {target}")
    print("Center crop is a draft. Review faces, objects, framing, and subtitle safe areas in Shotcut.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
