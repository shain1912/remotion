import React from 'react';
import {
  AbsoluteFill, Sequence, Audio, staticFile, useCurrentFrame, useVideoConfig,
  interpolate, spring, Easing, CalculateMetadataFunction,
} from 'remotion';
import { loadFont as loadSans } from '@remotion/google-fonts/NotoSansKR';
import { loadFont as loadSerif } from '@remotion/google-fonts/NotoSerifKR';

const sans = loadSans('normal', { weights: ['400', '700', '900'], ignoreTooManyRequestsWarning: true }).fontFamily;
const serif = loadSerif('normal', { weights: ['600', '700', '900'], ignoreTooManyRequestsWarning: true }).fontFamily;

// Claude design language
const PAPER = '#F0EEE6';
const INK = '#26241F';
const MUTE = '#76726A';
const CORAL = '#CC785C';

type SlideScene = {
  id: string; narration: string; durationFrames: number; audio: string;
  kicker?: string; title: string; bullets?: string[]; stat?: { value: string; label: string }; note?: string;
};
type SlideManifest = {
  id: string; title: string; format: { width: number; height: number; fps: number };
  style?: { accent?: string }; scenes: SlideScene[]; totalFrames: number;
};
type Props = { projectId: string; manifest?: SlideManifest };

export const calculateSlideMetadata: CalculateMetadataFunction<Props> = async ({ props }) => {
  const res = await fetch(staticFile(`factory/${props.projectId}/build.json`));
  const manifest: SlideManifest = await res.json();
  return {
    durationInFrames: manifest.totalFrames, fps: manifest.format.fps,
    width: manifest.format.width, height: manifest.format.height,
    props: { ...props, manifest },
  };
};

const Slide: React.FC<{ scene: SlideScene; index: number; total: number; accent: string }> = ({ scene, index, total, accent }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = spring({ fps, frame, config: { damping: 18, stiffness: 90 } });
  const exit = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleY = interpolate(enter, [0, 1], [26, 0]);

  const bullets = scene.bullets ?? [];
  const cadence = Math.min(28, Math.max(14, Math.floor((durationInFrames - 30) / Math.max(1, bullets.length))));

  return (
    <AbsoluteFill style={{ backgroundColor: PAPER, opacity: Math.min(enter, exit) }}>
      {/* warm corner accent */}
      <div style={{ position: 'absolute', right: -160, top: -160, width: 520, height: 520, borderRadius: '50%', background: accent, opacity: 0.07 }} />
      <div style={{ position: 'absolute', left: 120, top: 150, bottom: 150, width: 6, background: accent, borderRadius: 6, transform: `scaleY(${enter})`, transformOrigin: 'top' }} />

      <AbsoluteFill style={{ padding: '150px 150px 150px 190px', justifyContent: 'center' }}>
        {scene.kicker && (
          <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: accent, opacity: enter, marginBottom: 26 }}>
            {scene.kicker.toUpperCase()}
          </div>
        )}
        <div style={{ fontFamily: serif, fontWeight: 900, fontSize: scene.stat ? 86 : 96, lineHeight: 1.12, color: INK, transform: `translateY(${titleY}px)`, opacity: enter, maxWidth: 1400 }}>
          {scene.title}
        </div>

        {scene.stat && (
          <div style={{ marginTop: 40, display: 'flex', alignItems: 'baseline', gap: 24, opacity: enter }}>
            <div style={{ fontFamily: serif, fontWeight: 900, fontSize: 200, color: accent, lineHeight: 1 }}>{scene.stat.value}</div>
            <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 40, color: MUTE }}>{scene.stat.label}</div>
          </div>
        )}

        {bullets.length > 0 && (
          <div style={{ marginTop: 54, display: 'flex', flexDirection: 'column', gap: 30 }}>
            {bullets.map((b, i) => {
              const bs = spring({ fps, frame: frame - (20 + i * cadence), config: { damping: 16, stiffness: 110 } });
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 26, opacity: bs, transform: `translateX(${interpolate(bs, [0, 1], [24, 0])}px)` }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, background: accent, flexShrink: 0 }} />
                  <div style={{ fontFamily: sans, fontWeight: 400, fontSize: 50, color: INK }}>{b}</div>
                </div>
              );
            })}
          </div>
        )}

        {scene.note && (
          <div style={{ marginTop: 46, fontFamily: sans, fontStyle: 'normal', fontSize: 34, color: MUTE, opacity: enter, maxWidth: 1300 }}>
            {scene.note}
          </div>
        )}
      </AbsoluteFill>

      {/* footer */}
      <div style={{ position: 'absolute', left: 190, right: 150, bottom: 90, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: enter }}>
        <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 26, color: MUTE, letterSpacing: 2 }}>VIBE CODING</div>
        <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 26, color: accent }}>{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</div>
      </div>

      <Audio src={staticFile(scene.audio)} />
    </AbsoluteFill>
  );
};

export const SlideVideo: React.FC<Props> = ({ manifest }) => {
  if (!manifest) return <AbsoluteFill style={{ backgroundColor: PAPER }} />;
  const accent = manifest.style?.accent || CORAL;
  let from = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: PAPER }}>
      {manifest.scenes.map((scene, i) => {
        const el = (
          <Sequence key={scene.id} from={from} durationInFrames={scene.durationFrames}>
            <Slide scene={scene} index={i} total={manifest.scenes.length} accent={accent} />
          </Sequence>
        );
        from += scene.durationFrames;
        return el;
      })}
    </AbsoluteFill>
  );
};
