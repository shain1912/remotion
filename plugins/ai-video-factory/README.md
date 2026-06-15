# 🏭 AI Video Factory — Claude Code Plugin

10 skills that turn one topic into a finished, retention-optimized **Korean** video, using
**MiniMax** (image · video · TTS) + **Remotion** (assemble · render). Distilled know-how:
"align with text first, the machine generates" + "many images → fast cuts → watch-time".

## Skills

| Skill | Role |
|---|---|
| `youtube-factory` | orchestrator / entry point — drives the whole pipeline |
| `topic-miner` | pick what to make (trending-topic mining) |
| `viral-script-writer` | retention-optimized Korean script (hook → reframe → CTA) |
| `scene-storyboard` | ASCII-first storyboard + image prompts → `project.json` |
| `minimax-media` | generate images / video clips / voiceover via MiniMax |
| `remotion-assembler` | fast-cut assembly + headless render, 4-template routing |
| `slide-explainer` | clean Claude-aesthetic keynote slide videos (`slides`) |
| `theory-viz` | 3Blue1Brown-style theory/graph animations (`theory`) |
| `thumbnail-designer` | high-CTR thumbnails |
| `ad-creative` | card-news + short product ads (bonus) |

## Install

```text
/plugin marketplace add shain1912/remotion
/plugin install ai-video-factory@shain-factory
```

Skills then trigger automatically (e.g. "이 주제로 영상 만들어줘", "3b1b 스타일로 시각화해줘"),
or invoke explicitly as `/ai-video-factory:topic-miner`.

Update / remove later:

```text
/plugin marketplace update shain-factory   →  /reload-plugins
/plugin uninstall ai-video-factory@shain-factory
```

## ⚠️ Requires the factory engine

These skills document and drive a real pipeline (`node factory/build.mjs <id>` →
`node factory/render.mjs <id>`) implemented in the **[shain1912/remotion](https://github.com/shain1912/remotion)**
repo (`factory/` + `src/factory/` Remotion compositions), plus a **MiniMax API key** in `.env`.
The plugin gives you the methodology + commands; clone the repo and add your key to actually
generate. See `factory/README.md` in the repo for the engine, key allocation, and templates.
