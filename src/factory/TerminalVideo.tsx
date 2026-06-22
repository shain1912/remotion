import React from 'react';
import {
  AbsoluteFill, Sequence, Audio, staticFile, useCurrentFrame, useVideoConfig,
  interpolate, spring, Easing, CalculateMetadataFunction,
} from 'remotion';
import { loadFont as loadMono } from '@remotion/google-fonts/CascadiaMono';
import { loadFont as loadSans } from '@remotion/google-fonts/NotoSansKR';

const monoF = loadMono('normal', { weights: ['400', '600', '700'], ignoreTooManyRequestsWarning: true }).fontFamily;
const sansF = loadSans('normal', { weights: ['400', '700'], ignoreTooManyRequestsWarning: true }).fontFamily;
const MONO = `${monoF}, ${sansF}, monospace`; // mono for ascii, NotoSansKR fallback for 한글
const SANS = `${sansF}, sans-serif`;

// terminal palette (dark — visually opposite of the warm-paper slides)
const BG = '#0A0D13';
const WIN = '#0E131A';
const BAR = '#19212B';
const BORDER = '#232E3A';
const PROMPT = '#5BD68A';
const CMD = '#EAEEF2';
const OUT = '#9FB3C4';
const MUTE = '#5E6E7E';

type Scene = {
  id: string; narration: string; durationFrames: number; audio: string;
  phase?: 'title' | 'outro';
  kicker?: string; title?: string; subtitle?: string; bullets?: string[];
  prompt?: string; commands?: string[]; output?: string[]; okLines?: number[]; note?: string;
  diagram?: { kind?: string; lines: string[]; callouts?: { line: number; label: string; color?: string }[] };
};
type Manifest = {
  id: string; title: string; format: { width: number; height: number; fps: number };
  style?: { accent?: string }; scenes: Scene[]; totalFrames: number;
};
type Props = { projectId: string; manifest?: Manifest };

export const calculateTerminalMetadata: CalculateMetadataFunction<Props> = async ({ props }) => {
  const res = await fetch(staticFile(`factory/${props.projectId}/build.json`));
  const manifest: Manifest = await res.json();
  return {
    durationInFrames: manifest.totalFrames, fps: manifest.format.fps,
    width: manifest.format.width, height: manifest.format.height,
    props: { ...props, manifest },
  };
};

const Dot: React.FC<{ c: string }> = ({ c }) => (
  <div style={{ width: 18, height: 18, borderRadius: '50%', background: c }} />
);

const TerminalScene: React.FC<{ scene: Scene; accent: string; index: number; total: number }> = ({ scene, accent, index, total }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const enter = spring({ fps, frame, config: { damping: 20, stiffness: 90 } });
  const exit = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const op = Math.min(enter, exit);

  // title / outro = big centered text on the dark terminal bg
  if (scene.phase === 'title' || scene.phase === 'outro') {
    const y = interpolate(enter, [0, 1], [28, 0]);
    return (
      <AbsoluteFill style={{ backgroundColor: BG, justifyContent: 'center', alignItems: 'center', opacity: op }}>
        <div style={{ fontFamily: MONO, color: PROMPT, fontSize: 40, opacity: 0.85, marginBottom: 22 }}>~/vibe-coding $</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: scene.phase === 'title' ? 132 : 104, color: CMD, textAlign: 'center', transform: `translateY(${y}px)`, lineHeight: 1.1, maxWidth: 1500 }}>{scene.title}</div>
        {scene.subtitle && <div style={{ fontFamily: SANS, fontSize: 46, color: accent, marginTop: 24 }}>{scene.subtitle}</div>}
      </AbsoluteFill>
    );
  }

  // diagram mode: animated callouts drawn on top of REAL code/traceback (theory-on-real-screen, reusable)
  if (scene.diagram) {
    const lines = scene.diagram.lines ?? [];
    const callouts = scene.diagram.callouts ?? [];
    const tIndex = new Map(callouts.map((c, k) => [c.line, k] as const));
    const lineH = 56, padTop = 32, padX = 36, panelW = 1100, fs = 27;
    const colOf = (c?: string) => (!c || c === 'accent' ? accent : c);
    const calloutStart = 14 + lines.length * 4 + 10;
    return (
      <AbsoluteFill style={{ backgroundColor: BG, opacity: op }}>
        <div style={{ position: 'absolute', top: -180, right: -120, width: 560, height: 560, borderRadius: '50%', background: accent, opacity: 0.06 }} />
        {scene.kicker && <div style={{ position: 'absolute', top: 96, left: 130, fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 5, color: accent }}>{scene.kicker.toUpperCase()}</div>}
        {scene.title && <div style={{ position: 'absolute', top: 150, left: 130, right: 130, fontFamily: SANS, fontWeight: 800, fontSize: 70, lineHeight: 1.15, color: CMD, opacity: enter }}>{scene.title}</div>}
        <div style={{ position: 'absolute', left: 130, top: 332 }}>
          <div style={{ position: 'relative', width: 1660, height: lines.length * lineH + padTop * 2 }}>
            {/* real code/traceback panel */}
            <div style={{ position: 'absolute', left: 0, top: 0, width: panelW, padding: `${padTop}px ${padX}px`, background: WIN, border: `1px solid ${BORDER}`, borderRadius: 14, boxShadow: '0 40px 120px rgba(0,0,0,0.5)', boxSizing: 'border-box' }}>
              {lines.map((ln, i) => {
                const bo = spring({ fps, frame: frame - (10 + i * 4), config: { damping: 22, stiffness: 110 } });
                const isT = tIndex.has(i);
                const k = tIndex.get(i) ?? 0;
                const co = spring({ fps, frame: frame - (calloutStart + k * 16), config: { damping: 18, stiffness: 90 } });
                const col = isT ? colOf(callouts[k].color) : undefined;
                return (
                  <div key={i} style={{ position: 'relative', height: lineH, display: 'flex', alignItems: 'center', whiteSpace: 'pre', fontFamily: MONO, fontSize: fs, color: isT ? CMD : OUT, opacity: bo }}>
                    {isT && <div style={{ position: 'absolute', left: -padX + 4, right: -padX + 4, top: 4, bottom: 4, background: col, opacity: 0.13 * co, borderRadius: 7 }} />}
                    {isT && <div style={{ position: 'absolute', left: -padX + 4, top: 6, bottom: 6, width: 5, background: col, opacity: co, borderRadius: 4 }} />}
                    <span style={{ position: 'relative' }}>{ln || ' '}</span>
                  </div>
                );
              })}
            </div>
            {/* callouts on the right, aligned to their target line */}
            {callouts.map((c, k) => {
              const y = padTop + c.line * lineH + lineH / 2;
              const co = spring({ fps, frame: frame - (calloutStart + k * 16), config: { damping: 18, stiffness: 90 } });
              const col = colOf(c.color);
              return (
                <React.Fragment key={k}>
                  <div style={{ position: 'absolute', left: panelW + 4, top: y - 1.5, width: interpolate(co, [0, 1], [0, 64]), height: 3, background: col, opacity: co }} />
                  <div style={{ position: 'absolute', left: panelW + 84, top: y - 38, width: 384, boxSizing: 'border-box', opacity: co, transform: `translateX(${interpolate(co, [0, 1], [22, 0])}px)`, background: '#10161E', border: `2px solid ${col}`, borderRadius: 12, padding: '14px 22px' }}>
                    <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, color: CMD, lineHeight: 1.3 }}>{c.label}</div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
        {scene.note && <div style={{ position: 'absolute', bottom: 76, left: 130, right: 130, fontFamily: SANS, fontSize: 35, color: MUTE, textAlign: 'center' }}>{scene.note}</div>}
        <div style={{ position: 'absolute', bottom: 36, right: 60, fontFamily: MONO, fontSize: 24, color: MUTE }}>{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</div>
      </AbsoluteFill>
    );
  }

  // card mode: a scene with no commands (concept / 개념요소 / 숙제) rendered as a dark card
  if (!(scene.commands && scene.commands.length)) {
    const bullets = (scene as any).bullets as string[] | undefined;
    const cadence = Math.min(26, Math.max(12, Math.floor((durationInFrames - 26) / Math.max(1, (bullets?.length || 1)))));
    return (
      <AbsoluteFill style={{ backgroundColor: BG, opacity: op, padding: '140px 150px', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', top: -180, right: -120, width: 560, height: 560, borderRadius: '50%', background: accent, opacity: 0.06 }} />
        <div style={{ position: 'absolute', left: 120, top: 150, bottom: 150, width: 6, background: accent, borderRadius: 6, transform: `scaleY(${enter})`, transformOrigin: 'top' }} />
        {scene.kicker && <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 5, color: accent, marginBottom: 22, opacity: enter }}>{scene.kicker.toUpperCase()}</div>}
        {scene.title && <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 92, lineHeight: 1.14, color: CMD, transform: `translateY(${interpolate(enter, [0, 1], [24, 0])}px)`, opacity: enter, maxWidth: 1500 }}>{scene.title}</div>}
        {bullets && bullets.map((b, i) => {
          const bo = spring({ fps, frame: frame - (18 + i * cadence), config: { damping: 18, stiffness: 90 } });
          return (
            <div key={i} style={{ display: 'flex', gap: 22, alignItems: 'flex-start', marginTop: i === 0 ? 44 : 26, opacity: bo, transform: `translateX(${interpolate(bo, [0, 1], [-16, 0])}px)` }}>
              <div style={{ width: 16, height: 16, marginTop: 18, background: accent, borderRadius: 3, flexShrink: 0 }} />
              <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 50, color: OUT, lineHeight: 1.35 }}>{b}</div>
            </div>
          );
        })}
        {scene.note && <div style={{ fontFamily: SANS, fontSize: 36, color: MUTE, marginTop: 40, opacity: enter, maxWidth: 1400 }}>{scene.note}</div>}
        <div style={{ position: 'absolute', bottom: 36, right: 60, fontFamily: MONO, fontSize: 24, color: MUTE }}>{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</div>
      </AbsoluteFill>
    );
  }

  // typing animation
  const cmds = scene.commands ?? [];
  const prompt = scene.prompt ?? '❯';
  const fullText = cmds.join('\n');
  const total2 = Math.max(1, fullText.length);
  const typeDur = Math.max(12, Math.min(Math.floor(durationInFrames * 0.5), Math.round(total2 * 1.6)));
  const revealed = Math.round(interpolate(frame, [10, 10 + typeDur], [0, total2], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const shown = fullText.slice(0, revealed).split('\n');
  const typing = revealed < total2 && frame > 8;
  const cursorOn = Math.floor(frame / 15) % 2 === 0;

  const out = scene.output ?? [];
  const outStart = 12 + typeDur + 6;
  const ok = new Set(scene.okLines ?? []);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, justifyContent: 'center', alignItems: 'center', opacity: op }}>
      {/* faint accent glow */}
      <div style={{ position: 'absolute', top: -180, right: -120, width: 560, height: 560, borderRadius: '50%', background: accent, opacity: 0.06 }} />
      {scene.kicker && (
        <div style={{ position: 'absolute', top: 90, left: 130, fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 5, color: accent }}>
          {scene.kicker.toUpperCase()}
        </div>
      )}
      <div style={{ width: 1560, background: WIN, borderRadius: 16, border: `1px solid ${BORDER}`, boxShadow: '0 40px 120px rgba(0,0,0,0.55)', transform: `translateY(${interpolate(enter, [0, 1], [24, 0])}px)`, overflow: 'hidden' }}>
        {/* title bar */}
        <div style={{ height: 64, background: BAR, display: 'flex', alignItems: 'center', padding: '0 26px', gap: 12, borderBottom: `1px solid ${BORDER}` }}>
          <Dot c="#FF5F57" /><Dot c="#FEBC2E" /><Dot c="#28C840" />
          <div style={{ flex: 1, textAlign: 'center', fontFamily: MONO, fontSize: 28, color: MUTE }}>{scene.title ?? 'terminal'}</div>
          <div style={{ width: 54 }} />
        </div>
        {/* body */}
        <div style={{ padding: '40px 48px', minHeight: 420, fontFamily: MONO, fontSize: 40, lineHeight: 1.5 }}>
          {cmds.map((c, i) => {
            const line = i < shown.length ? shown[i] : null;
            if (line === null) return null;
            const isLast = i === shown.length - 1;
            return (
              <div key={i} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: CMD }}>
                <span style={{ color: PROMPT, fontWeight: 700 }}>{prompt} </span>{line}
                {isLast && typing && cursorOn && <span style={{ color: CMD }}>█</span>}
              </div>
            );
          })}
          {!typing && out.map((line, i) => {
            const o = interpolate(frame, [outStart + i * 5, outStart + i * 5 + 9], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            return (
              <div key={'o' + i} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: ok.has(i) ? PROMPT : OUT, opacity: o, marginTop: i === 0 ? 14 : 2 }}>
                {line}
              </div>
            );
          })}
        </div>
      </div>
      {scene.note && (
        <div style={{ position: 'absolute', bottom: 80, fontFamily: SANS, fontSize: 36, color: MUTE, maxWidth: 1400, textAlign: 'center' }}>{scene.note}</div>
      )}
      <div style={{ position: 'absolute', bottom: 36, right: 60, fontFamily: MONO, fontSize: 24, color: MUTE }}>{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</div>
    </AbsoluteFill>
  );
};

export const TerminalVideo: React.FC<Props> = ({ manifest }) => {
  if (!manifest) return <AbsoluteFill style={{ backgroundColor: BG }} />;
  const accent = manifest.style?.accent ?? '#5BD68A';
  const starts: number[] = [];
  let acc = 0;
  for (const s of manifest.scenes) { starts.push(acc); acc += s.durationFrames; }
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {manifest.scenes.map((s, i) => (
        <Sequence key={s.id} from={starts[i]} durationInFrames={s.durationFrames}>
          <Audio src={staticFile(s.audio)} />
          <TerminalScene scene={s} accent={accent} index={i} total={manifest.scenes.length} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
