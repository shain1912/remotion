---
name: topic-miner
description: >-
  Mine YouTube for the next video to make. Surveys current top-view videos in a
  niche (filtered by views + this week), spots the hot angle/trend, weights
  toward high-CPM niches, and returns 5-10 ranked video ideas — each with a
  Korean hook line — ready to hand to the script writer. THE FIRST STEP of the
  factory pipeline (before viral-script-writer / scene-storyboard / build).
  Trigger this whenever the user is deciding what to produce: "주제 선정", "주제
  추천", "뭐 만들지", "뭐 만들까", "다음 영상 뭐 찍지", "trending 주제", "요즘 뜨는
  주제", "니치 추천", "떡상 주제", "what video should I make next", "find me a
  topic", "trending topics", "topic ideas", "what's hot in <niche>". Use even
  when the user does not name this skill — if they are at the "what to make"
  stage, run this.
---

# topic-miner — pick what to make (VIDEO-2 topic mining)

## Why this exists
The factory's whole economics depend on **publishing MANY videos cheaply** ("시간
단축이 살길"). The single most leveraged decision is *what* to make: a hot topic in a
high-CPM niche earns multiples of a cold topic at the same production cost (~2,000
KRW / video). So before any TTS or image dollars are spent, mine the market and
hand the script writer a topic that is already proven to pull views.

This skill encodes VIDEO 2's method: **scrape current top-view videos in a niche →
read the trend → rank ideas**. The human picks from the ranked list; the machine
does the surveying. Do NOT skip to generation — picking a winner here is cheaper
than re-rolling a flop later.

## The channel's niches (bias the ranking toward these)
These are where this operation has voice, reach, and CPM. Weight ideas in these
buckets higher unless the user explicitly asks for a new lane.
- **경제·시사 (economy / current affairs)** — highest CPM. Finance, policy, market
  moves, "왜 ~한가" explainers. Advertiser-dense → top earnings per view.
- **무협 애니메이션 (martial-arts anime, senior audience)** — huge watch-time, loyal
  older viewers, cheap to mass-produce as image-driven story. High CPM via volume.
- **AI·개발 교육 (AI / dev education)** — THIS channel's home turf (see the
  `demo-git` project: "깃 명령어 외우던 시대는 끝났다"). Bias toward AI tools, vibe
  coding, Claude/Cursor/agents, "이거 모르면 손해" angles.

When you present results, label each idea with its niche and note the CPM tier so
the user sees the money tradeoff, not just the view count.

## How to mine (the procedure)

### 1) Get the niche keyword(s)
Ask the user, or infer from their message. If vague ("뭐 만들지?"), default to a
quick scan across all three channel niches and let them choose a lane.

### 2) Pull current top-view videos with yt-dlp
`yt-dlp` is installed (confirmed on PATH). Use it to fetch metadata WITHOUT
downloading video — `--flat-playlist --dump-json` over a YouTube search URL is fast
and free. The magic URL is `ytsearchN:<query>`; bias toward fresh + popular by
appending YouTube's search filter for **this week + sort by view count**.

```bash
# Top ~40 results for a query, this-week + view-sorted, metadata only (no download).
# EgQIAxAB = YouTube search filter "Upload date: This week, Sort by: View count".
yt-dlp --flat-playlist --dump-single-json \
  "https://www.youtube.com/results?search_query=<URL-ENCODED QUERY>&sp=EgQIAxAB" \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const j=JSON.parse(s);for(const e of (j.entries||[]).slice(0,40))console.log([e.view_count||0,e.duration||0,(e.title||"").replace(/\s+/g," "),e.url||e.id].join("\t"))})'
```

Notes that matter:
- Run several queries in parallel (one per sub-angle / per niche) — they are
  independent, so fire them in one batch.
- `view_count` on flat search results can be null for some entries; keep the ones
  that have it and sort by it. If too many are null, drop `&sp=...` (the filter)
  and re-run, or hit a known niche channel's `/videos` tab instead.
- If a search returns junk (shorts spam, unrelated), tighten the query in Korean
  (the audience searches in Korean) and re-run. Korean queries surface the real
  competitive set.
- This is a **read-only survey**. Never download the videos. yt-dlp here is a
  metadata scraper, nothing more.

See `references/yt-dlp-recipes.md` for filter codes (this week / this month /
sort-by-views), channel-tab scraping, and fallbacks.

### 3) Read the trend, don't just list it
Looking at the top ~40 by views, extract the *pattern*, not the individual videos:
- **Recurring angle** — what framing keeps winning? (e.g. "X 끝났다", "이거 모르면
  손해", "왜 지금 Y인가", a number-list "3가지").
- **Hot subject** — a tool/event/person spiking right now (an AI release, a market
  event, a policy change).
- **Title grammar** — the hook shape that's working this week (curiosity gap,
  contrarian claim, loss-aversion).
- **Gap** — an obvious adjacent topic nobody covered yet = your opening.

### 4) Rank and output 5-10 ideas
Each idea must be *makeable by this factory* (one topic → 15-26 scenes for a 60-90s
short, or more for long-form). For each idea give:
- **title (Korean)** — thumbnail-ready, hook-shaped.
- **hook line (Korean)** — the literal first-scene narration (s01) that stops the
  scroll. This becomes `scenes[0].narration` downstream.
- **niche + CPM tier** — 경제·시사(high) / 무협(high-volume) / AI·개발(home).
- **why now** — the trend evidence (e.g. "top 5 results this week all frame it as
  '~ 끝났다', 평균 80만 뷰").
- **proposed format** — short-form (60-90s) vs long-form, and whether the opening
  scene warrants a Hailuo video clip (stop-scroll hook).

Rank by: trend heat × CPM tier × fit-to-channel × low competition gap. Put the
single best bet first and say why it's #1.

## Output contract (what you hand back)
Return a ranked Markdown list the user can eyeball, then ONE recommended pick
formatted as a **starter `project.json` stub** so the next skill can run with zero
friction. Only fill the fields topic-mining decides; leave scene-level detail to
the storyboard step.

```jsonc
// Recommended pick — paste-ready stub for viral-script-writer / scene-storyboard.
{
  "id": "ai-agent-2026",                  // kebab-case, becomes factory/projects/<id>/
  "title": "AI 에이전트, 이제 진짜 일을 합니다",   // thumbnail-ready Korean title
  "niche": "ai-dev",                       // ai-dev | economy | wuxia
  "lang": "ko",
  "format": { "width": 1920, "height": 1080, "fps": 30 },
  "voice": { "voiceId": "shainvoice01", "model": "speech-2.6-hd", "speed": 1.05 },
  "style": { "imageSuffix": "", "accent": "", "bg": "" },  // storyboard fills these
  "_hook": "당신이 자는 동안, AI가 코드를 짰습니다.",  // s01 narration seed (drop the _ key once scenes exist)
  "_format": "short-form 60-90s, opening scene = Hailuo clip",
  "scenes": []                             // scene-storyboard fills this
}
```

The downstream `project.json` schema (the real source of truth) lives at
`factory/projects/<id>/project.json` — see `demo-git` for a complete, working
example. Match its `format` (1920×1080@30 for 16:9; use 1080×1920 for 9:16 shorts)
and `voice` exactly so the build step runs unchanged.

## Where this sits in the pipeline (don't overstep)
1. **topic-miner (you)** → ranked ideas + one recommended stub.
2. viral-script-writer + scene-storyboard → fill `scenes[]` (ASCII storyboard
   FIRST, confirm before spending — that's the VIDEO-1 discipline).
3. `node factory/build.mjs <id> --limit 3 --no-video` → smoke test → `still.mjs`.
4. `node factory/build.mjs <id>` (full, resumable) → `node factory/render.mjs <id>`.

You stop at step 1. Do not write scene prompts or call MiniMax — that wastes the
storyboard's ASCII-confirm gate. Your job is *what to make*, not *how to make it*.

## Quick example

**Input:** "요즘 AI 개발 쪽에서 뭐 만들지?"

**What you do:** run 3-4 yt-dlp searches in parallel — `ytsearch` /
`results?search_query=` for "AI 코딩 도구", "클로드 코드", "AI 에이전트 자동화",
"바이브 코딩" with `&sp=EgQIAxAB` (this week, by views). Read the top 40.

**Output (abridged):**

> **#1 — AI 에이전트가 밤새 일하는 법 (ai-dev, CPM: home)**
> Hook: "당신이 자는 동안, AI가 코드를 짰습니다."
> Why now: 이번 주 상위 6개 중 4개가 '자동화/에이전트' 프레임, 평균 50만 뷰. 'Claude
> Code' 검색 급상승, 정작 '밤새 자동 실행' 앵글은 빈 공간(gap).
> Format: short-form 75s, s01 = Hailuo 클립(스크롤 스톱).
>
> **#2 — 커서 vs 클로드 코드, 진짜 차이 (ai-dev, CPM: home)** …
> **#3 — "프롬프트 외우지 마세요" (ai-dev)** …
> *(…through #5-7, then the recommended-pick project.json stub above.)*

## Reference
- `references/yt-dlp-recipes.md` — search-filter codes (this week / month / sort by
  views), channel-tab scraping, parallel batching, null-view fallbacks.
