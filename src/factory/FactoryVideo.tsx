import React from 'react';
import {
  AbsoluteFill, Sequence, Img, Video, Audio, staticFile,
  useCurrentFrame, useVideoConfig, interpolate, spring, Easing,
  CalculateMetadataFunction,
} from 'remotion';
import { loadFont as loadSans } from '@remotion/google-fonts/NotoSansKR';
import { loadFont as loadSerif } from '@remotion/google-fonts/NotoSerifKR';
import { loadFont as loadMono } from '@remotion/google-fonts/CascadiaMono';

const sans = loadSans('normal', { weights: ['400', '700', '900'], ignoreTooManyRequestsWarning: true }).fontFamily;
const serif = loadSerif('normal', { weights: ['600', '700', '900'], ignoreTooManyRequestsWarning: true }).fontFamily;
const mono = loadMono('normal', { weights: ['400', '600'], ignoreTooManyRequestsWarning: true }).fontFamily;

// Claude design language (matches the reference keynote)
const PAPER = '#F0EEE6';
const INK = '#26241F';
const MUTE = '#76726A';
const CORAL = '#CC785C';
const CODEBG = '#10141B';
const CODEFG = '#E7ECF1';

type Sub = { text: string; time_begin: number; time_end: number };
export type FactoryScene = {
  id: string; narration: string; audio: string; durationFrames: number;
  // layout: 'slide' = clean keynote, 'split' = bullets + code/image panel, 'full' = full-bleed visual.
  // Default: 'slide' if it carries bullets/title, else 'full'. Visuals only where they belong.
  layout?: 'slide' | 'split' | 'full';
  motion?: string; image?: string; clip?: string | null; caption?: string;
  kicker?: string; title?: string; bullets?: string[]; note?: string; code?: string[];
  diagram?: { kind: 'flow' | 'pair'; nodes?: { label: string; sub?: string }[]; a?: string; b?: string; result?: string };
  subtitles?: Sub[];
};
export type FactoryManifest = {
  id: string; title: string;
  format: { width: number; height: number; fps: number };
  style: { accent: string; bg: string; imageSuffix?: string };
  scenes: FactoryScene[];
  totalFrames: number;
};
export type FactoryProps = { projectId: string; manifest?: FactoryManifest };

export const calculateFactoryMetadata: CalculateMetadataFunction<FactoryProps> = async ({ props }) => {
  const res = await fetch(staticFile(`factory/${props.projectId}/build.json`));
  const manifest: FactoryManifest = await res.json();
  return {
    durationInFrames: manifest.totalFrames, fps: manifest.format.fps,
    width: manifest.format.width, height: manifest.format.height,
    props: { ...props, manifest },
  };
};

function motionTransform(motion: string, frame: number, dur: number): string {
  const p = interpolate(frame, [0, dur], [0, 1], { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.ease) });
  switch (motion) {
    case 'kenburns-out': return `scale(${interpolate(p, [0, 1], [1.16, 1.04])})`;
    case 'pan-left': return `scale(1.12) translateX(${interpolate(p, [0, 1], [2, -2])}%)`;
    case 'pan-right': return `scale(1.12) translateX(${interpolate(p, [0, 1], [-2, 2])}%)`;
    default: return `scale(${interpolate(p, [0, 1], [1.04, 1.16])})`;
  }
}

// Split TTS phrases into per-sentence timed cues so the subtitle advances ONE line at a time.
function sentenceCues(subs?: Sub[]) {
  const out: { text: string; b: number; e: number }[] = [];
  for (const s of subs || []) {
    const parts = (s.text || '').split(/(?<=[.?!])\s*/).map((x) => x.trim()).filter(Boolean);
    const tot = parts.reduce((a, p) => a + p.length, 0) || 1;
    const dur = Math.max(1, s.time_end - s.time_begin);
    let t = s.time_begin;
    for (const p of parts) { const d = dur * (p.length / tot); out.push({ text: p, b: t, e: t + d }); t += d; }
  }
  return out;
}

// One-line sequential subtitle synced to the audio (replaces the old 6-line narration block).
const Caption: React.FC<{ subs?: Sub[]; dark: boolean }> = ({ subs, dark }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const cues = React.useMemo(() => sentenceCues(subs), [subs]);
  if (!cues.length) return null;
  const last = cues[cues.length - 1];
  const cur = cues.find((c) => ms >= c.b && ms < c.e) || (ms >= last.e ? last : cues[0]);
  if (!cur) return null;
  const op = interpolate(ms, [cur.b - 60, cur.b + 110, cur.e - 110, cur.e], [0, 1, 1, 0.9], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 52, pointerEvents: 'none' }}>
      <div style={{
        maxWidth: 1480, textAlign: 'center', opacity: op,
        fontFamily: sans, fontWeight: 700, fontSize: 40, lineHeight: 1.32,
        color: dark ? '#fff' : '#2C2A25',
        background: dark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.82)',
        padding: '10px 30px', borderRadius: 12,
        textShadow: dark ? '0 2px 10px rgba(0,0,0,0.9)' : 'none',
        boxShadow: '0 8px 26px rgba(0,0,0,0.16)',
      }}>{cur.text}</div>
    </AbsoluteFill>
  );
};

const Kicker: React.FC<{ text: string; accent: string; o: number }> = ({ text, accent, o }) => (
  <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 30, letterSpacing: 5, color: accent, opacity: o, marginBottom: 22 }}>{text.toUpperCase()}</div>
);

// staggered bullets (sequential reveal) — the reference reveals points one by one
const Bullets: React.FC<{ items: string[]; accent: string; frame: number; fps: number; dur: number; size?: number }> = ({ items, accent, frame, fps, dur, size = 48 }) => {
  const cad = Math.min(26, Math.max(13, Math.floor((dur - 30) / Math.max(1, items.length))));
  return (
    <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 26 }}>
      {items.map((b, i) => {
        const s = spring({ fps, frame: frame - (18 + i * cad), config: { damping: 16, stiffness: 110 } });
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 22, opacity: s, transform: `translateX(${interpolate(s, [0, 1], [22, 0])}px)` }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: accent, flexShrink: 0, marginTop: size * 0.32 }} />
            <div style={{ fontFamily: sans, fontWeight: 400, fontSize: size, color: INK, lineHeight: 1.34 }}>{b}</div>
          </div>
        );
      })}
    </div>
  );
};

const CodePanel: React.FC<{ lines: string[]; o: number; title?: string }> = ({ lines, o, title }) => (
  <div style={{ background: CODEBG, borderRadius: 16, padding: '30px 34px', boxShadow: '0 30px 80px rgba(0,0,0,0.28)', opacity: o, width: '100%', boxSizing: 'border-box' }}>
    {title && <div style={{ fontFamily: mono, fontSize: 24, color: '#6f8294', marginBottom: 16 }}>{title}</div>}
    {lines.map((l, i) => (
      <div key={i} style={{ fontFamily: mono, fontSize: 32, lineHeight: 1.5, color: l.startsWith('#') || l.startsWith('//') ? '#6f8294' : CODEFG, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{l || ' '}</div>
    ))}
  </div>
);

// code-drawn schematic — flow (chips + arrows) or pair (A + B = C). Adds 도식화 without images.
const DNode: React.FC<{ label: string; sub?: string; accent: string; o: number; hi?: boolean; big?: boolean }> = ({ label, sub, accent, o, hi, big }) => (
  <div style={{ opacity: o, transform: `translateY(${interpolate(o, [0, 1], [14, 0])}px)`, background: hi ? accent : '#FBFAF6', border: `2.5px solid ${accent}`, borderRadius: 18, padding: big ? '24px 30px' : '18px 22px', textAlign: 'center', boxShadow: '0 14px 34px rgba(0,0,0,0.10)' }}>
    <div style={{ fontFamily: sans, fontWeight: 800, fontSize: big ? 42 : 34, color: hi ? '#fff' : INK, whiteSpace: 'pre-line', lineHeight: 1.2 }}>{label}</div>
    {sub && <div style={{ fontFamily: mono, fontSize: big ? 26 : 22, color: hi ? 'rgba(255,255,255,0.88)' : MUTE, marginTop: 7 }}>{sub}</div>}
  </div>
);
const Conn: React.FC<{ accent: string; o: number; vertical?: boolean; sym?: string }> = ({ accent, o, vertical, sym }) => (
  <div style={{ opacity: o, color: accent, fontFamily: sans, fontWeight: 900, fontSize: 48, lineHeight: 1, padding: vertical ? '8px 0' : '0 6px' }}>{sym || (vertical ? '↓' : '→')}</div>
);
const Diagram: React.FC<{ d: NonNullable<FactoryScene['diagram']>; accent: string; frame: number; fps: number; vertical?: boolean; big?: boolean }> = ({ d, accent, frame, fps, vertical, big }) => {
  const o = (i: number) => spring({ fps, frame: frame - (16 + i * 11), config: { damping: 18, stiffness: 110 } });
  if (d.kind === 'pair') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
        <DNode label={d.a || ''} accent={accent} o={o(0)} big={big} />
        <Conn accent={accent} o={o(1)} sym="+" />
        <DNode label={d.b || ''} accent={accent} o={o(2)} big={big} />
        <Conn accent={accent} o={o(3)} sym="=" />
        <DNode label={d.result || ''} accent={accent} o={o(4)} hi big={big} />
      </div>
    );
  }
  const nodes = d.nodes || [];
  return (
    <div style={{ display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: vertical ? 2 : 8, flexWrap: 'nowrap' }}>
      {nodes.map((n, i) => (
        <React.Fragment key={i}>
          {i > 0 && <Conn accent={accent} o={o(i)} vertical={vertical} />}
          <DNode label={n.label} sub={n.sub} accent={accent} o={o(i)} hi={i === nodes.length - 1} big={big} />
        </React.Fragment>
      ))}
    </div>
  );
};

const Footer: React.FC<{ index: number; total: number; accent: string; o: number; dark?: boolean }> = ({ index, total, accent, o, dark }) => (
  <div style={{ position: 'absolute', left: 96, right: 96, bottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: o * 0.9 }}>
    <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 24, color: dark ? 'rgba(255,255,255,0.5)' : MUTE, letterSpacing: 2 }}>바이브코딩 입문</div>
    <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 24, color: accent }}>{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</div>
  </div>
);

const Scene: React.FC<{ scene: FactoryScene; accent: string; index: number; total: number }> = ({ scene, accent, index, total }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const enter = spring({ fps, frame, config: { damping: 18, stiffness: 90 } });
  const exit = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const op = Math.min(enter, exit);
  const layout = scene.layout || (scene.bullets || scene.title || scene.code ? 'slide' : 'full');
  const titleY = interpolate(enter, [0, 1], [24, 0]);

  // FULL — full-bleed image/clip + big hook caption (only for genuine hook/closing visuals)
  if (layout === 'full') {
    const fade = interpolate(frame, [0, 4, durationInFrames - 5, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return (
      <AbsoluteFill style={{ backgroundColor: '#000', opacity: fade }}>
        <AbsoluteFill style={{ overflow: 'hidden' }}>
          {scene.clip ? <Video src={staticFile(scene.clip)} muted loop style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <Img src={staticFile(scene.image!)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: motionTransform(scene.motion || 'kenburns-in', frame, durationInFrames) }} />}
        </AbsoluteFill>
        <AbsoluteFill style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 66%, rgba(0,0,0,0.4) 100%)' }} />
        {scene.caption && (
          <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', paddingBottom: 120 }}>
            <div style={{ textAlign: 'center', opacity: enter, transform: `translateY(${interpolate(enter, [0, 1], [30, 0])}px)`, padding: '0 80px' }}>
              <div style={{ fontFamily: serif, fontWeight: 900, fontSize: 104, color: '#fff', lineHeight: 1.12, textShadow: '0 6px 30px rgba(0,0,0,0.9)' }}>{scene.caption}</div>
              <div style={{ marginTop: 22, height: 7, width: 120, background: accent, borderRadius: 8, marginInline: 'auto', boxShadow: `0 0 24px ${accent}` }} />
            </div>
          </AbsoluteFill>
        )}
        <Caption subs={scene.subtitles} dark />
        <Audio src={staticFile(scene.audio)} />
      </AbsoluteFill>
    );
  }

  // SPLIT — bullets/title on the left, a code panel or relevant image on the right (reference 2-column)
  if (layout === 'split') {
    const right = scene.code?.length
      ? <CodePanel lines={scene.code} o={enter} />
      : scene.diagram ? <Diagram d={scene.diagram} accent={accent} frame={frame} fps={fps} vertical />
      : (scene.clip ? <Video src={staticFile(scene.clip)} muted loop style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16 }} />
        : scene.image ? <Img src={staticFile(scene.image)} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16 }} /> : null);
    return (
      <AbsoluteFill style={{ backgroundColor: PAPER, opacity: op }}>
        <div style={{ position: 'absolute', left: 96, top: 110, bottom: 150, width: 6, background: accent, borderRadius: 6, transform: `scaleY(${enter})`, transformOrigin: 'top' }} />
        <div style={{ position: 'absolute', left: 130, top: 110, right: 130, bottom: 150, display: 'flex', gap: 70, alignItems: 'center' }}>
          <div style={{ flex: 1.05 }}>
            {scene.kicker && <Kicker text={scene.kicker} accent={accent} o={enter} />}
            {scene.title && <div style={{ fontFamily: serif, fontWeight: 900, fontSize: 64, lineHeight: 1.16, color: INK, whiteSpace: 'pre-line', transform: `translateY(${titleY}px)`, opacity: enter }}>{scene.title}</div>}
            {scene.bullets && <Bullets items={scene.bullets} accent={accent} frame={frame} fps={fps} dur={durationInFrames} size={42} />}
            {scene.note && <div style={{ marginTop: 34, fontFamily: sans, fontSize: 32, color: MUTE, opacity: enter, maxWidth: 760 }}>{scene.note}</div>}
          </div>
          <div style={{ flex: 1, maxHeight: 760, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{right}</div>
        </div>
        <Footer index={index} total={total} accent={accent} o={enter} />
        <Caption subs={scene.subtitles} dark={false} />
        <Audio src={staticFile(scene.audio)} />
      </AbsoluteFill>
    );
  }

  // SLIDE — clean Claude keynote (default for concept/text scenes)
  return (
    <AbsoluteFill style={{ backgroundColor: PAPER, opacity: op }}>
      <div style={{ position: 'absolute', right: -160, top: -160, width: 520, height: 520, borderRadius: '50%', background: accent, opacity: 0.07 }} />
      <div style={{ position: 'absolute', left: 120, top: 150, bottom: 200, width: 6, background: accent, borderRadius: 6, transform: `scaleY(${enter})`, transformOrigin: 'top' }} />
      <AbsoluteFill style={{ padding: '150px 150px 200px 190px', justifyContent: 'center' }}>
        {scene.kicker && <Kicker text={scene.kicker} accent={accent} o={enter} />}
        {scene.title && <div style={{ fontFamily: serif, fontWeight: 900, fontSize: 84, lineHeight: 1.14, color: INK, whiteSpace: 'pre-line', transform: `translateY(${titleY}px)`, opacity: enter, maxWidth: 1500 }}>{scene.title}</div>}
        {scene.bullets && <Bullets items={scene.bullets} accent={accent} frame={frame} fps={fps} dur={durationInFrames} />}
        {scene.diagram && <div style={{ marginTop: 52, opacity: enter }}><Diagram d={scene.diagram} accent={accent} frame={frame} fps={fps} big /></div>}
        {scene.note && <div style={{ marginTop: 44, fontFamily: sans, fontSize: 34, color: MUTE, opacity: enter, maxWidth: 1300 }}>{scene.note}</div>}
      </AbsoluteFill>
      <Footer index={index} total={total} accent={accent} o={enter} />
      <Caption subs={scene.subtitles} dark={false} />
      <Audio src={staticFile(scene.audio)} />
    </AbsoluteFill>
  );
};

export const FactoryVideo: React.FC<FactoryProps> = ({ manifest }) => {
  if (!manifest) return <AbsoluteFill style={{ backgroundColor: PAPER }} />;
  const accent = manifest.style?.accent || CORAL;
  let from = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: PAPER }}>
      {manifest.scenes.map((scene, i) => {
        const el = (
          <Sequence key={scene.id} from={from} durationInFrames={scene.durationFrames}>
            <Scene scene={scene} accent={accent} index={i} total={manifest.scenes.length} />
          </Sequence>
        );
        from += scene.durationFrames;
        return el;
      })}
    </AbsoluteFill>
  );
};
