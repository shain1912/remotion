import React from 'react';
import {
  AbsoluteFill, Sequence, Audio, staticFile, useCurrentFrame, useVideoConfig,
  interpolate, spring, Easing, CalculateMetadataFunction,
} from 'remotion';
import { loadFont as loadSerif } from '@remotion/google-fonts/NotoSerifKR';
import { loadFont as loadSans } from '@remotion/google-fonts/NotoSansKR';

const serif = loadSerif('normal', { weights: ['400', '600', '700'], ignoreTooManyRequestsWarning: true }).fontFamily;
const sans = loadSans('normal', { weights: ['400', '700'], ignoreTooManyRequestsWarning: true }).fontFamily;

// 3Blue1Brown palette
const BG = '#0b0e16';
const GRID = '#222838';
const AXIS = '#7c8499';
const WHITE = '#ECECEC';
const C = { const: '#9aa4b8', log: '#58C4DD', linear: '#83C167', nlogn: '#FFD166', quad: '#FC6255' };

// normalized growth functions, value in [0,1] over t in [0,1]
const FN: Record<string, (t: number) => number> = {
  const: () => 0.05,
  log: (t) => 0.30 * (Math.log2(1 + t * 63) / 6),
  linear: (t) => 0.58 * t,
  nlogn: (t) => 0.80 * t * (Math.log2(1 + t * 63) / 6),
  quad: (t) => 0.96 * t * t,
};

type Scene = {
  id: string; phase: 'title' | 'axes' | 'curve' | 'compare' | 'outro';
  narration: string; durationFrames: number; audio: string;
  curve?: keyof typeof FN; label?: string; sub?: string; title?: string; subtitle?: string;
};
type Manifest = {
  id: string; title: string; format: { width: number; height: number; fps: number };
  scenes: Scene[]; totalFrames: number;
};
type Props = { projectId: string; manifest?: Manifest };

export const calculateTheoryMetadata: CalculateMetadataFunction<Props> = async ({ props }) => {
  const res = await fetch(staticFile(`factory/${props.projectId}/build.json`));
  const manifest: Manifest = await res.json();
  return {
    durationInFrames: manifest.totalFrames, fps: manifest.format.fps,
    width: manifest.format.width, height: manifest.format.height,
    props: { ...props, manifest },
  };
};

// plot region
const PX0 = 250, PX1 = 1690, PY0 = 905, PY1 = 175;
const X = (t: number) => PX0 + (PX1 - PX0) * t;
const Y = (v: number) => PY0 + (PY1 - PY0) * v;

function curvePath(fn: (t: number) => number, p: number, steps = 80) {
  if (p <= 0) return '';
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = (p * i) / steps;
    d += (i === 0 ? 'M' : 'L') + ` ${X(t).toFixed(1)} ${Y(fn(t)).toFixed(1)}`;
  }
  return d;
}

export const TheoryVideo: React.FC<Props> = ({ manifest }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!manifest) return <AbsoluteFill style={{ backgroundColor: BG }} />;

  // scene start frames
  const starts: number[] = [];
  let acc = 0;
  for (const s of manifest.scenes) { starts.push(acc); acc += s.durationFrames; }

  const axesIdx = manifest.scenes.findIndex((s) => s.phase === 'axes');
  const axesStart = axesIdx >= 0 ? starts[axesIdx] : 0;
  const outroIdx = manifest.scenes.findIndex((s) => s.phase === 'outro');
  const outroStart = outroIdx >= 0 ? starts[outroIdx] : Infinity;
  const titleScene = manifest.scenes.find((s) => s.phase === 'title');
  const compareIdx = manifest.scenes.findIndex((s) => s.phase === 'compare');

  const planeOpacity = interpolate(frame, [axesStart, axesStart + 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    * interpolate(frame, [outroStart, outroStart + 20], [1, 0.12], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const axisDraw = interpolate(frame, [axesStart, axesStart + 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {/* per-scene narration audio */}
      {manifest.scenes.map((s, i) => (
        <Sequence key={s.id} from={starts[i]} durationInFrames={s.durationFrames}>
          <Audio src={staticFile(s.audio)} />
        </Sequence>
      ))}

      {/* coordinate plane + curves */}
      <svg width={manifest.format.width} height={manifest.format.height} style={{ position: 'absolute', opacity: planeOpacity }}>
        {/* grid */}
        {Array.from({ length: 9 }).map((_, i) => {
          const t = i / 8;
          return <line key={'gx' + i} x1={X(t)} y1={Y(0)} x2={X(t)} y2={Y(1)} stroke={GRID} strokeWidth={1} />;
        })}
        {Array.from({ length: 7 }).map((_, i) => {
          const v = i / 6;
          return <line key={'gy' + i} x1={X(0)} y1={Y(v)} x2={X(1)} y2={Y(v)} stroke={GRID} strokeWidth={1} />;
        })}
        {/* axes (drawn on) */}
        <line x1={X(0)} y1={Y(0)} x2={X(0) + (X(1) - X(0)) * axisDraw} y2={Y(0)} stroke={AXIS} strokeWidth={3} />
        <line x1={X(0)} y1={Y(0)} x2={X(0)} y2={Y(0) + (Y(1) - Y(0)) * axisDraw} stroke={AXIS} strokeWidth={3} />
        <text x={X(1)} y={Y(0) + 48} fill={AXIS} fontFamily={sans} fontSize={30} textAnchor="end">입력 크기 n →</text>
        <text x={X(0) - 24} y={Y(1) + 6} fill={AXIS} fontFamily={sans} fontSize={30} textAnchor="end" transform={`rotate(-90 ${X(0) - 24} ${Y(1) + 6})`}>연산 횟수 →</text>

        {/* compare: divergence marker */}
        {compareIdx >= 0 && frame >= starts[compareIdx] && (
          <line x1={X(0.82)} y1={Y(0)} x2={X(0.82)} y2={Y(1)} stroke={WHITE} strokeWidth={2} strokeDasharray="8 10"
            opacity={interpolate(frame, [starts[compareIdx], starts[compareIdx] + 15], [0, 0.6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
        )}

        {/* curves */}
        {manifest.scenes.map((s, i) => {
          if (s.phase !== 'curve' || !s.curve || frame < starts[i]) return null;
          const reveal = Math.min(48, Math.floor(s.durationFrames * 0.7));
          const p = interpolate(frame, [starts[i], starts[i] + reveal], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
          const fn = FN[s.curve];
          const col = C[s.curve];
          const tipX = X(p), tipY = Y(fn(p));
          const labOp = interpolate(p, [0.15, 0.5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const emphasize = compareIdx >= 0 && frame >= starts[compareIdx] && s.curve === 'quad';
          return (
            <g key={s.id}>
              <path d={curvePath(fn, p)} fill="none" stroke={col} strokeWidth={emphasize ? 8 : 5} strokeLinecap="round" strokeLinejoin="round" />
              <circle cx={tipX} cy={tipY} r={7} fill={col} opacity={p < 1 ? 1 : 0} />
              <text x={Math.min(tipX + 18, PX1 - 4)} y={tipY + 8} fill={col} fontFamily={serif} fontSize={38} fontWeight={700} opacity={labOp}>{s.label}</text>
            </g>
          );
        })}
      </svg>

      {/* title overlay */}
      {titleScene && (() => {
        const fadeOut = interpolate(frame, [axesStart - 18, axesStart], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const en = spring({ fps, frame, config: { damping: 16, stiffness: 80 } });
        return (
          <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: fadeOut }}>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 150, color: WHITE, opacity: en, transform: `translateY(${interpolate(en, [0, 1], [30, 0])}px)` }}>{titleScene.title}</div>
            <div style={{ fontFamily: sans, fontWeight: 400, fontSize: 52, color: C.log, marginTop: 18, opacity: en }}>{titleScene.subtitle}</div>
          </AbsoluteFill>
        );
      })()}

      {/* sub label for the current curve (bottom-left caption) */}
      {manifest.scenes.map((s, i) => {
        if (s.phase !== 'curve' || frame < starts[i] || frame >= starts[i] + s.durationFrames) return null;
        const op = interpolate(frame, [starts[i] + 6, starts[i] + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        return (
          <div key={'cap' + s.id} style={{ position: 'absolute', left: 250, bottom: 70, opacity: op, fontFamily: sans, fontSize: 40, color: s.curve ? C[s.curve] : WHITE, fontWeight: 700 }}>
            <span style={{ color: WHITE }}>{s.label}</span>　{s.sub}
          </div>
        );
      })}

      {/* compare + outro captions */}
      {compareIdx >= 0 && frame >= starts[compareIdx] && frame < (outroIdx >= 0 ? outroStart : Infinity) && (
        <div style={{ position: 'absolute', left: 250, bottom: 70, fontFamily: sans, fontSize: 40, color: WHITE, fontWeight: 700, opacity: interpolate(frame, [starts[compareIdx] + 6, starts[compareIdx] + 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
          n이 커질수록 <span style={{ color: C.quad }}>격차는 폭발</span>한다
        </div>
      )}
      {outroIdx >= 0 && frame >= outroStart && (() => {
        const en = spring({ fps, frame: frame - outroStart, config: { damping: 18, stiffness: 80 } });
        const os = manifest.scenes[outroIdx];
        return (
          <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 110, color: WHITE, opacity: en, transform: `translateY(${interpolate(en, [0, 1], [26, 0])}px)`, textAlign: 'center' }}>{os.title}</div>
          </AbsoluteFill>
        );
      })()}
    </AbsoluteFill>
  );
};
