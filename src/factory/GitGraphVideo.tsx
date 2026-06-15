import React, { useMemo } from 'react';
import {
  AbsoluteFill, Sequence, Audio, staticFile, useCurrentFrame, useVideoConfig,
  interpolate, spring, Easing, CalculateMetadataFunction,
} from 'remotion';
import { loadFont as loadSerif } from '@remotion/google-fonts/NotoSerifKR';
import { loadFont as loadSans } from '@remotion/google-fonts/NotoSansKR';

const serif = loadSerif('normal', { weights: ['400', '700'], ignoreTooManyRequestsWarning: true }).fontFamily;
const sans = loadSans('normal', { weights: ['400', '700'], ignoreTooManyRequestsWarning: true }).fontFamily;

// 3Blue1Brown-ish palette
const BG = '#0b0e16', GRID = '#1b2233', WHITE = '#ECECEC', MUT = '#8b95a8';
const LANE_COLORS = ['#58C4DD', '#FFD166', '#83C167', '#C77DFF', '#FC6255'];

type Scene = {
  id: string; narration: string; durationFrames: number; audio: string;
  phase?: 'title' | 'outro'; op?: 'commit' | 'branch' | 'merge' | 'worktree';
  branch?: string; name?: string; from?: string; into?: string; branches?: string[];
  message?: string; title?: string; subtitle?: string; caption?: string;
};
type Manifest = { id: string; title: string; format: { width: number; height: number; fps: number }; scenes: Scene[]; totalFrames: number; };
type Props = { projectId: string; manifest?: Manifest };

export const calculateGitGraphMetadata: CalculateMetadataFunction<Props> = async ({ props }) => {
  const res = await fetch(staticFile(`factory/${props.projectId}/build.json`));
  const m: Manifest = await res.json();
  return { durationInFrames: m.totalFrames, fps: m.format.fps, width: m.format.width, height: m.format.height, props: { ...props, manifest: m } };
};

type Commit = { key: string; branch: string; col: number; lane: number; parents: string[]; si: number; message: string; merge: boolean };
type BranchLabel = { name: string; lane: number; tipKey: string; si: number };

// build the commit DAG from the ordered ops
function buildGraph(scenes: Scene[]) {
  const commits: Commit[] = [];
  const tip: Record<string, string> = {};       // branch -> commit key
  const lane: Record<string, number> = {};       // branch -> lane idx
  const branchSi: Record<string, number> = {};   // branch -> scene it appeared
  let nextLane = 0, col = 0;
  const laneFor = (b: string, si: number) => { if (lane[b] === undefined) { lane[b] = nextLane++; branchSi[b] = si; } return lane[b]; };

  scenes.forEach((s, si) => {
    if (s.op === 'commit' && s.branch) {
      const l = laneFor(s.branch, si);
      const key = s.id;
      commits.push({ key, branch: s.branch, col: col++, lane: l, parents: tip[s.branch] ? [tip[s.branch]] : [], si, message: s.message || '', merge: false });
      tip[s.branch] = key;
    } else if (s.op === 'branch' && s.name && s.from) {
      laneFor(s.name, si);
      tip[s.name] = tip[s.from];                 // shares parent tip, no commit yet
    } else if (s.op === 'merge' && s.from && s.into) {
      const l = laneFor(s.into, si);
      const key = s.id;
      commits.push({ key, branch: s.into, col: col++, lane: l, parents: [tip[s.into], tip[s.from]].filter(Boolean) as string[], si, message: s.message || 'merge', merge: true });
      tip[s.into] = key;
    }
  });

  // branch labels = each branch's current tip
  const labels: BranchLabel[] = Object.keys(lane).map((name) => ({ name, lane: lane[name], tipKey: tip[name], si: branchSi[name] }));
  return { commits, labels, lane };
}

export const GitGraphVideo: React.FC<Props> = ({ manifest }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!manifest) return <AbsoluteFill style={{ backgroundColor: BG }} />;
  const W = manifest.format.width, H = manifest.format.height;

  const starts = useMemo(() => { const a: number[] = []; let c = 0; for (const s of manifest.scenes) { a.push(c); c += s.durationFrames; } return a; }, [manifest]);
  const curIdx = useMemo(() => { let i = 0; for (let k = 0; k < starts.length; k++) if (frame >= starts[k]) i = k; return i; }, [frame, starts]);
  const { commits, labels } = useMemo(() => buildGraph(manifest.scenes), [manifest]);

  const byKey = useMemo(() => Object.fromEntries(commits.map((c) => [c.key, c])), [commits]);
  const maxCol = Math.max(1, ...commits.map((c) => c.col));
  const COLGAP = Math.min(230, (W - 460) / maxCol);
  const X0 = 250, LANE_Y = 360, LANEGAP = 230, R = 26;
  const px = (c: Commit) => X0 + c.col * COLGAP;
  const py = (c: Commit) => LANE_Y + c.lane * LANEGAP;

  const worktreeScene = manifest.scenes[curIdx]?.op === 'worktree' ? manifest.scenes[curIdx] : null;

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {manifest.scenes.map((s, i) => (
        <Sequence key={s.id} from={starts[i]} durationInFrames={s.durationFrames}><Audio src={staticFile(s.audio)} /></Sequence>
      ))}

      {/* faint grid */}
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={0} y1={(i + 1) * (H / 12)} x2={W} y2={(i + 1) * (H / 12)} stroke={GRID} strokeWidth={1} />)}
      </svg>

      {/* the commit graph */}
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        {/* edges */}
        {commits.filter((c) => c.si <= curIdx).map((c) => c.parents.map((pk) => {
          const p = byKey[pk]; if (!p) return null;
          const grow = c.si === curIdx ? interpolate(frame, [starts[curIdx], starts[curIdx] + 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }) : 1;
          const x1 = px(p), y1 = py(p), x2 = px(c), y2 = py(c);
          const ex = x1 + (x2 - x1) * grow, ey = y1 + (y2 - y1) * grow;
          const col = LANE_COLORS[c.lane % LANE_COLORS.length];
          const d = y1 === y2 ? `M ${x1} ${y1} L ${ex} ${ey}` : `M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${ex} ${ey}`;
          return <path key={c.key + pk} d={d} fill="none" stroke={col} strokeWidth={6} strokeLinecap="round" opacity={0.9} />;
        }))}
        {/* nodes */}
        {commits.filter((c) => c.si <= curIdx).map((c) => {
          const appear = c.si === curIdx ? spring({ fps, frame: frame - starts[curIdx] - 4, config: { damping: 13, stiffness: 130 } }) : 1;
          const col = LANE_COLORS[c.lane % LANE_COLORS.length];
          return (
            <g key={c.key} transform={`translate(${px(c)} ${py(c)}) scale(${appear})`} opacity={appear}>
              <circle r={R} fill={c.merge ? BG : col} stroke={col} strokeWidth={5} />
              {c.merge && <circle r={R - 11} fill={col} />}
              <text y={R + 34} textAnchor="middle" fill={WHITE} fontFamily={sans} fontSize={26} fontWeight={700}>{c.message}</text>
            </g>
          );
        })}
        {/* branch labels at tips */}
        {labels.filter((b) => b.si <= curIdx && byKey[b.tipKey] && byKey[b.tipKey].si <= curIdx).map((b) => {
          const t = byKey[b.tipKey]; const col = LANE_COLORS[b.lane % LANE_COLORS.length];
          const x = px(t) + R + 16, y = py(t) - R - 30; const w = b.name.length * 17 + 28;
          return (
            <g key={b.name}>
              <rect x={x} y={y} width={w} height={42} rx={9} fill={col} />
              <text x={x + w / 2} y={y + 29} textAnchor="middle" fill="#0b0e16" fontFamily={sans} fontWeight={700} fontSize={24}>{b.name}</text>
              <line x1={x} y1={y + 42} x2={px(t)} y2={py(t) - R} stroke={col} strokeWidth={3} strokeDasharray="3 5" />
            </g>
          );
        })}
      </svg>

      {/* worktree annotation */}
      {worktreeScene && (() => {
        const en = spring({ fps, frame: frame - starts[curIdx], config: { damping: 16, stiffness: 90 } });
        const brs = worktreeScene.branches || labels.map((l) => l.name);
        return (
          <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 90, opacity: en }}>
            <div style={{ display: 'flex', gap: 60 }}>
              {brs.map((bn, i) => {
                const col = LANE_COLORS[(labels.find((l) => l.name === bn)?.lane ?? i) % LANE_COLORS.length];
                return (
                  <div key={bn} style={{ background: '#121826', border: `2px solid ${col}`, borderRadius: 14, padding: '18px 26px', textAlign: 'center', minWidth: 300 }}>
                    <div style={{ fontFamily: sans, fontSize: 34 }}>📁 작업 트리 {i + 1}</div>
                    <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 30, color: col, marginTop: 6 }}>{bn}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontFamily: sans, fontSize: 30, color: MUT, marginTop: 22 }}>하나의 저장소(.git) · 두 개의 작업 디렉터리 — 브랜치를 오갈 필요 없이 동시에</div>
          </AbsoluteFill>
        );
      })()}

      {/* title / outro cards */}
      {(() => {
        const s = manifest.scenes[curIdx];
        if (s?.phase !== 'title' && s?.phase !== 'outro') return null;
        const en = spring({ fps, frame: frame - starts[curIdx], config: { damping: 16, stiffness: 80 } });
        return (
          <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: BG }}>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 132, color: WHITE, opacity: en, transform: `translateY(${interpolate(en, [0, 1], [28, 0])}px)`, textAlign: 'center' }}>{s.title}</div>
            {s.subtitle && <div style={{ fontFamily: sans, fontSize: 48, color: LANE_COLORS[0], marginTop: 16, opacity: en }}>{s.subtitle}</div>}
          </AbsoluteFill>
        );
      })()}

      {/* bottom caption = current scene narration gist (op label) */}
      {manifest.scenes[curIdx] && !manifest.scenes[curIdx].phase && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 90, textAlign: 'center', opacity: interpolate(frame, [starts[curIdx] + 4, starts[curIdx] + 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
          <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 40, color: WHITE, background: '#121826cc', padding: '10px 26px', borderRadius: 12 }}>{manifest.scenes[curIdx].caption || manifest.scenes[curIdx].message}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};
