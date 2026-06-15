# yt-dlp recipes for topic mining

`yt-dlp` is installed and on PATH (verified: `yt-dlp --version` → 2026.06+). Use it
purely as a **metadata scraper** — never download the actual videos. All recipes
below pull JSON only and cost nothing.

## The two ways to query

### A) Keyword search (`results?search_query=`)
The richest path: it accepts YouTube's `&sp=` filter param so you can sort by views
and restrict to a time window — exactly the VIDEO-2 "top-view this week" survey.

```bash
yt-dlp --flat-playlist --dump-single-json \
  "https://www.youtube.com/results?search_query=<URL-ENCODED QUERY>&sp=<FILTER>"
```

### B) `ytsearchN:` shortcut
Simpler, but does NOT honor `&sp=` filters — it returns YouTube's default relevance
order. Good for a fast unranked pull; then sort by `view_count` yourself.

```bash
yt-dlp --flat-playlist --dump-single-json "ytsearch40:<query>"
```

## `&sp=` filter codes (the important ones)
These are YouTube's base64 search-filter tokens. They combine an upload-date window
with a sort order:

| Intent | `&sp=` value |
|---|---|
| This week + sort by **view count** | `EgQIAxAB` |
| This month + sort by **view count** | `EgQIBBAB` |
| Today + sort by **view count** | `EgQIAhAB` |
| This year + sort by **view count** | `EgQIBRAB` |
| Sort by view count (any date) | `CAMSAhAB` |
| This week (default relevance) | `EgIIAw%3D%3D` |
| Exclude Shorts, this week, by views | `EgQIAxABGAE` |

Primary survey filter = **`EgQIAxAB`** (this week, by views). If it returns too few
videos with non-null `view_count`, widen to month (`EgQIBBAB`).

## Parse to a ranked TSV
Flat-playlist entries expose `view_count`, `duration`, `title`, `url`/`id`,
`channel`, `uploader`. Sort by views, drop nulls, keep the top N:

```bash
yt-dlp --flat-playlist --dump-single-json \
  "https://www.youtube.com/results?search_query=AI%20%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8&sp=EgQIAxAB" \
| node -e '
let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
  const j=JSON.parse(s);
  const rows=(j.entries||[])
    .filter(e=>e && e.view_count!=null)
    .sort((a,b)=>b.view_count-a.view_count)
    .slice(0,30)
    .map(e=>[e.view_count,Math.round(e.duration||0),e.channel||e.uploader||"",(e.title||"").replace(/\s+/g," ").slice(0,70)].join("\t"));
  console.log("views\tsec\tchannel\ttitle");
  console.log(rows.join("\n"));
});'
```

Reading the TSV: `sec` tells you short (<90s) vs long-form; cluster the `title`
column to find the winning angle/grammar; the `channel` column reveals who owns the
niche (and whether there's room).

## Scrape a known niche channel's recent uploads
When you already know a strong channel in the niche, its `/videos` tab (newest
first) shows what THAT operator is betting on right now:

```bash
yt-dlp --flat-playlist --playlist-end 20 --dump-single-json \
  "https://www.youtube.com/@<HANDLE>/videos"
```

Pipe through the same Node parser. Useful for 무협 애니메이션 and 경제·시사 where a
few channels dominate and define the format.

## Run queries in parallel
Each query is independent — batch them. One angle per query gives wider trend
coverage than one broad query:

```bash
for q in "AI%20%EC%BD%94%EB%94%A9" "%ED%81%B4%EB%A1%9C%EB%93%9C%20%EC%BD%94%EB%93%9C" "%EB%B0%94%EC%9D%B4%EB%B8%8C%20%EC%BD%94%EB%94%A9"; do
  yt-dlp --flat-playlist --dump-single-json \
    "https://www.youtube.com/results?search_query=${q}&sp=EgQIAxAB" \
    > "/tmp/ytmine_${q:0:8}.json" &
done; wait
```

(From the agent harness, prefer firing several `yt-dlp` tool calls in a single
batch rather than shell backgrounding.)

## Gotchas & fallbacks
- **Null `view_count`** on many flat entries → drop `&sp=` and re-run (the date
  filter sometimes thins results), or use approach B (`ytsearch`) and accept
  relevance order, sorting by whatever counts are present.
- **Shorts spam** drowning the list → add `GAE` to the filter (`EgQIAxABGAE`) to
  exclude Shorts, or filter `duration > 90` in the parser.
- **Korean vs English query** → query in **Korean**; the real competitive audience
  searches in Korean, and English queries surface a different (often US) market.
- **Rate limit / empty JSON** → add `--sleep-requests 1`; if YouTube returns a
  consent wall, add `--extractor-args "youtube:player_client=web"`.
- **Stay read-only** → never add `-f`/`-o`/download flags. `--flat-playlist
  --dump-single-json` (or `--dump-json`) is the entire toolkit here.
