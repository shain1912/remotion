# FactoryVideo internals (deep reference)

Field-by-field grounding for `src/factory/FactoryVideo.tsx`, the `build.json` it consumes,
and the headless render scripts. Everything here is read straight from the engine — if you
change the engine, update this file.

---

## 1. Composition registration (src/Root.tsx)

```tsx
<Composition
  id="FactoryVideo"
  component={FactoryVideo}
  durationInFrames={300}        // placeholder; OVERRIDDEN by calculateMetadata
  fps={30}                       // placeholder; overridden
  width={1920} height={1080}     // placeholder; overridden
  defaultProps={{ projectId: 'demo-git' }}
  calculateMetadata={calculateFactoryMetadata}
/>
```

The hardcoded `300 / 30 / 1920x1080` are placeholders Remotion needs before metadata
resolves. The real values come from `build.json` via `calculateFactoryMetadata`. Don't tune
these for output; tune `project.json.format` instead.

`src/index.ts` is the entry: `registerRoot(RemotionRoot)`. The render/still scripts bundle
`src/index.ts` with `publicDir: public`, which is why `staticFile()` resolves under
`public/`.

---

## 2. calculateFactoryMetadata (the metadata function)

```ts
export const calculateFactoryMetadata: CalculateMetadataFunction<FactoryProps> =
  async ({ props }) => {
    const res = await fetch(staticFile(`factory/${props.projectId}/build.json`));
    const manifest = await res.json();
    return {
      durationInFrames: manifest.totalFrames,
      fps:    manifest.format.fps,
      width:  manifest.format.width,
      height: manifest.format.height,
      props: { ...props, manifest },   // manifest injected so the component gets it as a prop
    };
  };
```

Implications:
- `build.json` MUST exist before `selectComposition` runs, or the fetch throws. Run
  `build.mjs` first.
- The component receives `manifest` as a prop — it never fetches anything itself.
- `durationInFrames` is exactly `totalFrames`; there is no extra tail/lead.

---

## 3. Timing math (factory/build.mjs)

Per scene, after TTS:

```js
sc.durationMs = r.ms ?? Math.round(r.subtitles.at(-1)?.time_end || 3000);
```

In the manifest step:

```js
const PAD_S = 0.35;
const durationFrames = Math.max(1, Math.ceil((sc.durationMs / 1000 + PAD_S) * fps));
...
manifest.totalFrames = manifest.scenes.reduce((a, s) => a + s.durationFrames, 0);
```

- `fps` comes from `project.format.fps`.
- Worked example @30fps: a 2.10s line → `ceil((2.10 + 0.35) * 30) = ceil(73.5) = 74` frames
  ≈ 2.47s on screen.
- `PAD_S` is the only padding. Raise it for a calmer pace, lower it for machine-gun cuts.
  It is global (same pad for every scene). It lives in `build.mjs` — not in any JSON.

The TTS also returns word/line `subtitles` with ms timing; `build.mjs` caches them in
`public/factory/<id>/audio/sNN.json` but the current composition shows the whole `narration`
statically (it does not karaoke per-word). The cached subtitle timing is available if you
later want per-word highlighting — that would be a composition change.

---

## 4. The four render layers (per Scene)

Back-to-front, all inside one `<AbsoluteFill opacity={fade}>`:

### 4a. Fade (per-cut)
```ts
const fade = interpolate(frame,
  [0, 4, durationInFrames - 5, durationInFrames],
  [0, 1, 1, 0.0],
  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
```
Fade in over 4 frames, hold, fade out over the last 5. `durationInFrames` here is the
*Sequence's* duration (the scene length), because `useVideoConfig()` inside a `Sequence`
reports the sequence duration. This gives the "quick fade at each cut" feel.

### 4b. Visual
```tsx
{scene.clip ? (
  <Video src={staticFile(scene.clip)} muted
         style={{ width:'100%', height:'100%', objectFit:'cover' }} />
) : (
  <Img src={staticFile(scene.image)}
       style={{ width:'100%', height:'100%', objectFit:'cover',
                transform: motionTransform(scene.motion, frame, durationInFrames) }} />
)}
```
- Clip path wins when `scene.clip` is non-null. Clip is **muted** (TTS is the audio).
- `objectFit:'cover'` means images/clips fill the frame and crop — generate 16:9 assets to
  match 1920x1080 so nothing important is cropped.
- Motion only applies to the still branch.

### 4c. Legibility gradient
```tsx
<AbsoluteFill style={{ background:
  'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 38%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.35) 100%)' }} />
```
Darkens top and bottom so white text reads over any image. Keep it.

### 4d. Big hook caption (optional, `scene.caption`)
```ts
const capSpring = spring({ fps, frame: frame - 2, config: { damping: 14, stiffness: 120 } });
const capY = interpolate(capSpring, [0, 1], [40, 0]);   // slide up 40px -> 0
```
Styled: `fontWeight:900, fontSize:100, lineHeight:1.1`, heavy `textShadow`, a faint
`WebkitTextStroke`, centered with `paddingBottom:140`, plus an accent underline bar
(`background: style.accent`, glow). Springs in starting 2 frames into the scene. Omit
`caption` to skip this layer entirely.

### 4e. Narration subtitle (`scene.narration`)
Styled: `fontWeight:700, fontSize:38`, white-ish, dark pill (`rgba(0,0,0,0.45)`,
`borderRadius:12`), centered, `maxWidth:1500`, `paddingBottom:56`. Always shown. This is the
full spoken sentence.

### 4f. Audio
```tsx
<Audio src={staticFile(scene.audio)} />
```
The scene's TTS mp3 — the timing backbone the whole scene length is derived from.

Font: `loadFont('normal', { weights:['400','700','900'] })` from
`@remotion/google-fonts/NotoSansKR`; `fontFamily` applied to both caption (900) and
subtitle (700). Korean renders correctly because of this.

---

## 5. Motion transforms (exact)

```ts
function motionTransform(motion, frame, dur) {
  const p = interpolate(frame, [0, dur], [0, 1],
    { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.ease) });
  switch (motion) {
    case 'kenburns-out': return `scale(${interpolate(p,[0,1],[1.18,1.05])})`;
    case 'pan-left':     return `scale(1.14) translateX(${interpolate(p,[0,1],[ 2.5,-2.5])}%)`;
    case 'pan-right':    return `scale(1.14) translateX(${interpolate(p,[0,1],[-2.5, 2.5])}%)`;
    case 'kenburns-in':
    default:             return `scale(${interpolate(p,[0,1],[1.05,1.18])})`;
  }
}
```
`p` is normalized scene progress 0→1, eased in/out. Adding a new preset = add a `case` here
and use its name in `project.json` `scene.motion`. Keep scale ≥ ~1.05 so pan translateX
never reveals the image edge.

---

## 6. The render & still scripts

### factory/render.mjs
```
node factory/render.mjs <projectId> [outFile]      # default out/<id>.mp4
```
- `bundle({ entryPoint: 'src/index.ts', publicDir: 'public', onProgress })`
- `selectComposition({ serveUrl, id: 'FactoryVideo', inputProps: { projectId } })`
- `renderMedia({ composition, serveUrl, codec:'h264', outputLocation, inputProps,
   concurrency: 2, onProgress })`
- Prints `WxH durationInFrames@fps -> outFile`, then final size in MB.
- No Remotion CLI, no Studio. Pure `@remotion/bundler` + `@remotion/renderer`.

### factory/still.mjs
```
node factory/still.mjs <projectId> <frame> [out]    # default frame 150,
                                                    # out factory/_verify/still_<frame>.png
```
- Same bundle + `selectComposition`, then `renderStill({ frame, output })`.
- Prints the chosen frame and `composition.durationInFrames` — use that to pick a frame
  inside a specific scene (sum `durationFrames` up to the scene you want, add a few).

Both default `projectId` to `demo-git`. `concurrency:2` in render is conservative; the
engine sets it — leave it unless you have a reason.

---

## 7. Common edit recipes

| Want                                   | Do                                                                 |
|----------------------------------------|--------------------------------------------------------------------|
| Add a scene                            | append to `project.json.scenes`, `build.mjs <id>`, `render.mjs`    |
| Make a scene a video clip              | add `video:{prompt,model,duration,resolution}` to that scene       |
| Change a line's wording/length         | edit `narration`; delete that scene's `audio/sNN.{mp3,json}`; build |
| Change motion or caption only          | edit `project.json`; re-run `build.mjs` (rewrites build.json)       |
| Reorder scenes                         | reorder the array (cuts follow array order)                        |
| Calmer / faster overall pace           | raise / lower `PAD_S` in `build.mjs`, or `voice.speed` in project  |
| Different resolution / fps             | edit `project.json.format`; rebuild; re-render                     |
| New visual motion behavior             | add a `case` to `motionTransform()` in FactoryVideo.tsx            |
| QA one scene visually                  | `still.mjs <id> <frameInThatScene>`                                |

`build.mjs` is resumable: it skips any asset file that already exists. To force regeneration,
delete the specific asset under `public/factory/<id>/...` first, then rebuild. This is why
iterating is cheap — you only pay MiniMax for what you delete/add.
