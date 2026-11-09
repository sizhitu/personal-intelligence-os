# Mac Personal Video & Bilingual Subtitle Workflow

A local-first workflow for turning Chinese spoken reflections into reviewed long-form videos and short-form candidates.

## What is automated

| Stage | Tool | Result |
|---|---|---|
| Chinese transcription | whisper.cpp | Original-timeline SRT and JSON |
| Long-video rough cut | Auto-Editor | Shotcut MLT project |
| Highlight selection | ChatGPT (manual paste; no API key) | Structured highlights JSON |
| Short-video extraction | Python + FFmpeg | 9:16 candidate MP4s and rebased Chinese SRTs |
| Bilingual subtitles | ChatGPT + included SRT merger | Timestamp-validated bilingual SRT |
| Final review | Shotcut | Correct framing, subtitle style, sound, final exports |

The pipeline is deliberately semi-automatic at first: the AI editorial decision is reviewed by you, while repetitive file processing is scripted. No paid API is required.

## Important: two independent timelines

**Never apply timestamps from the original transcript directly to the Auto-Editor rough-cut video.** Removing pauses changes the timeline.

This workflow therefore has two tracks:

1. **Long video:** original source → Auto-Editor → Shotcut MLT → human review.
2. **Short candidates:** original source + original SRT → ChatGPT highlight JSON → FFmpeg extracts from the original source.

The highlights JSON must contain `"timebase": "original"`. The extraction script refuses another timebase.

## Requirements

On macOS, make sure these commands work in Terminal:

- `python3 --version`
- `ffmpeg -version` and `ffprobe -version`
- `auto-editor --version`
- `whisper-cli --help` (the whisper.cpp CLI name may differ by build)

You also need a downloaded whisper.cpp model file, for example a multilingual model. The model is not included in this repository. Shotcut is used to open the MLT project and finish the edit.

If your whisper.cpp executable is named differently, pass its name with `--whisper-cli`. Check `whisper-cli --help` if the installed build does not recognize the standard flags used below.

## One-command preparation

From the repository root:

```bash
python3 media-workflow/scripts/run_pipeline.py "/path/to/original-video.mp4" \
  --model "/path/to/ggml-large-v3-turbo.bin" \
  --output "/path/to/video-workspace"
```

This will:

1. create local Chinese SRT and JSON files under `video-workspace/subtitles/`;
2. create `video-workspace/analysis/analysis_prompt.md` for ChatGPT;
3. ask Auto-Editor to export a Shotcut project under `video-workspace/rough_cut/`.

The script uses the standard whisper.cpp flags `-m -f -l zh -osrt -oj -of`. If your build has different flags, inspect its help and adjust the command in `scripts/run_pipeline.py`. The source video is never modified.

You can skip either stage if its output already exists:

```bash
python3 media-workflow/scripts/run_pipeline.py original.mp4 --model model.bin \
  --skip-transcription
python3 media-workflow/scripts/run_pipeline.py original.mp4 --model model.bin \
  --skip-rough-cut
```

## Select highlights with ChatGPT

Open `video-workspace/analysis/analysis_prompt.md`, paste its complete contents into ChatGPT, and ask it to return only the requested JSON. Save the result as:

`video-workspace/analysis/highlights.json`

The prompt asks for up to eight self-contained, non-repetitive highlights and requires timestamps against the original recording. Review the selected moments and timestamps before extraction.

## Validate and generate vertical candidates

First validate the timestamps against the original video duration:

```bash
python3 media-workflow/scripts/validate_timestamps.py \
  original.mp4 video-workspace/analysis/highlights.json
```

Then extract from the **original** video, with the original SRT:

```bash
python3 media-workflow/scripts/generate_shorts.py \
  original.mp4 video-workspace/analysis/highlights.json \
  --srt video-workspace/subtitles/transcript.srt \
  --output-dir video-workspace/shorts
```

This creates a 1080×1920 center-cropped MP4 and a matching, time-rebased Chinese SRT for each candidate. Center crop is only a first draft: manually reframe faces, objects, and scene changes in Shotcut. The script does not burn subtitles into the video.

## Natural English and bilingual subtitles

Use [the translation prompt](prompts/translate-zh-to-en.md) to translate the Chinese SRT. Require the English SRT to preserve every cue number and timestamp exactly. Then merge:

```bash
python3 media-workflow/scripts/merge_bilingual_srt.py \
  subtitles/zh.srt subtitles/en.srt -o subtitles/bilingual.srt
```

For each extracted short, translate its corresponding `.zh.srt` in the same way, then use the merger to produce a bilingual SRT. Check cue lengths and reading speed; literal one-to-one translation can sound unnatural, so prioritize concise spoken English without changing the Chinese meaning.

## Folder layout

```text
video-workspace/
├── subtitles/
│   ├── transcript.srt
│   └── transcript.json
├── analysis/
│   ├── analysis_prompt.md
│   └── highlights.json
├── rough_cut/
│   └── *.mlt
└── shorts/
    ├── 01_*.mp4
    └── 01_*.zh.srt
```

## Tests

Run the included standard-library tests:

```bash
python3 -m unittest discover -s media-workflow/tests -v
```

## Privacy, cost, and quality

- Transcription and extraction run locally. No OpenAI API key is needed for the manual ChatGPT step.
- ChatGPT subscription and API billing are separate. An API-driven version can be added later, but API use is optional and separately billed.
- Pasting SRT into a hosted AI service sends the transcript to that provider. Remove private details or use only local processing when confidentiality matters.
- Keep the original recording unchanged. Back up source footage, project files, SRTs, JSON decisions, and exports.
- Always review transcription, names/numbers, highlight boundaries, framing, subtitle timing, audio, and the final export.
