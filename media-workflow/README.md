# Mac Personal Video & Bilingual Subtitle Workflow

A local-first workflow for recording Chinese personal reflections and publishing polished Chinese–English videos.

## Goal

Record a Chinese reflection on a Mac or iPhone, preserve the original Chinese wording, create natural English subtitles, and export a consistent bilingual video without spending time manually timing every line.

This is a creator workflow, not a new decision-engine dependency. It belongs to the Life / learning / expression area of Personal Intelligence OS.

## Recommended workflow

1. **Record** — record clean Chinese audio/video on iPhone or Mac. Prefer a quiet room, a close microphone, and a fixed camera position. Keep each thought as a short paragraph; pause briefly between ideas.
2. **Transcribe locally** — use MacWhisper with an appropriate Whisper model and export Chinese subtitles as SRT. Review names, numbers, technical terms, and punctuation. Local transcription keeps the recording on the Mac during this step.
3. **Translate** — give the Chinese SRT to an AI translator with the prompt in \`prompts/translate-zh-to-en.md\`. Require the English SRT to preserve every cue number and timestamp exactly. Translate for natural spoken English, not word-for-word equivalence.
4. **Validate and merge** — run \`scripts/merge_bilingual_srt.py\` with the Chinese and English SRT files. The script checks cue count and exact timestamps before creating a two-line bilingual SRT.
5. **Style and edit** — import the merged SRT into CapCut for desktop (剪映专业版) or Final Cut Pro. Apply the saved subtitle preset; edit pacing, pauses, framing, audio, and unnecessary dead air.
6. **Export** — keep a clean master without platform-specific overlays, then make vertical 9:16 versions for Shorts/Reels and a 16:9 version when appropriate.

## Mac tool choices

| Stage | First choice | Notes |
|---|---|---|
| Recording | iPhone / Mac camera and a close microphone | Prioritize clean sound over camera upgrades |
| Chinese transcription | MacWhisper | Convenient Mac GUI; choose a Whisper model and export SRT |
| Translation | ChatGPT or another chosen LLM | Keep Chinese source text unchanged; require timestamp preservation |
| Subtitle merge | Included Python script | Runs locally; no third-party Python packages |
| Editing and subtitle styling | CapCut desktop / 剪映专业版 | Fastest route to reusable social-video subtitle styling |
| Advanced editing | Final Cut Pro | Optional; useful for more involved edits and audio/video finishing |

The exact software used by the referenced Joy Liu video has not been verified. This workflow is selected for reproducibility on the user's Mac, not as a claim about that creator's production setup.

## Subtitle design baseline

Start with a restrained, readable two-line style and tune it against the actual reference screenshot:

- Chinese on the first line; English directly below.
- Chinese is the primary line; English is slightly smaller and lower contrast.
- Use a clean sans-serif font with sufficient weight and a subtle shadow or translucent backing only when the footage needs it.
- Keep each cue short: usually one thought, not a full paragraph.
- Avoid covering the mouth, important objects, or platform UI safe areas.
- Use consistent punctuation and line breaks. Do not animate every word unless the reference clearly requires it.
- Preview on a phone at normal viewing size before batch-exporting.

Suggested starting canvas: 1080 × 1920, 9:16, 30 fps. For landscape recordings, preserve a separate 1920 × 1080 master rather than cropping away useful context.

## Folder layout for each episode

    episode-001/
      source/
        camera-original.mov
        audio-original.m4a
      subtitles/
        zh.srt
        en.srt
        bilingual.srt
      exports/
        episode-001-master.mp4
        episode-001-vertical.mp4
      notes.md

Keep original media and subtitle files. Do not overwrite the source recording during editing.

## One-time setup

1. Install MacWhisper from its official website or Mac App Store and test a short recording before processing a long one.
2. Install CapCut desktop / 剪映专业版 if you want the quickest subtitle styling workflow. Use Final Cut Pro only if you need its deeper editing tools.
3. Check that Python 3 is available in Terminal: \`python3 --version\`.
4. Download this repository's \`scripts/merge_bilingual_srt.py\`.
5. Make one reusable subtitle preset in the editor and save it as a template/project.

No API key is required for local transcription or SRT merging. AI translation is a separate optional step and may send the subtitle text to the selected provider; remove private details before sharing if needed.

## Merge bilingual subtitles

    python3 scripts/merge_bilingual_srt.py subtitles/zh.srt subtitles/en.srt -o subtitles/bilingual.srt

The two input SRT files must have the same number of cues and exactly matching timestamps. If they do not, the script stops rather than silently creating misaligned subtitles.

## Quality checklist

- [ ] Chinese transcript matches the recording; names, numbers, and specialist terms checked.
- [ ] English reads naturally aloud and preserves the original meaning and tone.
- [ ] Cue count and timestamps match; merge script passes.
- [ ] Each cue is readable on a phone and not too long.
- [ ] Chinese and English line breaks are balanced.
- [ ] No subtitle overlaps the face or important visual content.
- [ ] Audio is clear and consistent; opening and ending are intentional.
- [ ] Export has been watched once from beginning to end.

## Privacy and rights

- Local transcription does not mean every later step is local: translation providers receive the text you submit.
- Do not upload confidential conversations or another person's identifiable recording without appropriate consent.
- Keep original footage, project files, SRT files, and final exports under your control.
