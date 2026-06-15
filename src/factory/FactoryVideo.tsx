import React from 'react';
import {
  AbsoluteFill, Sequence, Img, Video, Audio, staticFile,
  useCurrentFrame, useVideoConfig, interpolate, spring, Easing,
  CalculateMetadataFunction,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/NotoSansKR';

const { fontFamily } = loadFont('normal', {
  weights: ['400', '700', '900'],
  ignoreTooManyRequestsWarning: true,
});

export type FactoryScene = {
  id: string;
  narration: string;
  caption?: string;
  motion: string;
  durationFrames: number;
  image: string;
  audio: string;
  clip: string | null;
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
    durationInFrames: manifest.totalFrames,
    fps: manifest.format.fps,
    width: manifest.format.width,
    height: manifest.format.height,
    props: { ...props, manifest },
  };
};

// Ken Burns / pan transform for still images, evaluated per frame within a scene.
function motionTransform(motion: string, frame: number, dur: number): string {
  const p = interpolate(frame, [0, dur], [0, 1], { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.ease) });
  switch (motion) {
    case 'kenburns-out': return `scale(${interpolate(p, [0, 1], [1.18, 1.05])})`;
    case 'pan-left': return `scale(1.14) translateX(${interpolate(p, [0, 1], [2.5, -2.5])}%)`;
    case 'pan-right': return `scale(1.14) translateX(${interpolate(p, [0, 1], [-2.5, 2.5])}%)`;
    case 'kenburns-in':
    default: return `scale(${interpolate(p, [0, 1], [1.05, 1.18])})`;
  }
}

const Scene: React.FC<{ scene: FactoryScene; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // quick cinematic fade at the head + tail of each cut
  const fade = interpolate(
    frame,
    [0, 4, durationInFrames - 5, durationInFrames],
    [0, 1, 1, 0.0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // caption pops in with a spring, then holds
  const capSpring = spring({ fps, frame: frame - 2, config: { damping: 14, stiffness: 120 } });
  const capY = interpolate(capSpring, [0, 1], [40, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', opacity: fade }}>
      {/* visual layer: clip if available, else Ken-Burns still */}
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        {scene.clip ? (
          <Video src={staticFile(scene.clip)} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Img
            src={staticFile(scene.image)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: motionTransform(scene.motion, frame, durationInFrames) }}
          />
        )}
      </AbsoluteFill>

      {/* legibility gradient */}
      <AbsoluteFill style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.0) 38%, rgba(0,0,0,0.0) 70%, rgba(0,0,0,0.35) 100%)' }} />

      {/* big hook caption */}
      {scene.caption && (
        <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 140 }}>
          <div style={{ transform: `translateY(${capY}px)`, opacity: capSpring, textAlign: 'center', padding: '0 80px' }}>
            <div style={{
              fontFamily, fontWeight: 900, fontSize: 100, color: '#fff', lineHeight: 1.1,
              textShadow: `0 6px 30px rgba(0,0,0,0.9), 0 0 1px ${accent}`,
              WebkitTextStroke: `2px rgba(0,0,0,0.25)`,
            }}>
              {scene.caption}
            </div>
            <div style={{ marginTop: 22, height: 8, width: 120, background: accent, borderRadius: 8, marginInline: 'auto', boxShadow: `0 0 24px ${accent}` }} />
          </div>
        </AbsoluteFill>
      )}

      {/* narration subtitle */}
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 56 }}>
        <div style={{
          fontFamily, fontWeight: 700, fontSize: 38, color: 'rgba(255,255,255,0.92)',
          background: 'rgba(0,0,0,0.45)', padding: '10px 26px', borderRadius: 12, maxWidth: 1500, textAlign: 'center',
          textShadow: '0 2px 10px rgba(0,0,0,0.9)',
        }}>
          {scene.narration}
        </div>
      </AbsoluteFill>

      <Audio src={staticFile(scene.audio)} />
    </AbsoluteFill>
  );
};

export const FactoryVideo: React.FC<FactoryProps> = ({ manifest }) => {
  if (!manifest) return <AbsoluteFill style={{ backgroundColor: '#0a0e14' }} />;
  let from = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: manifest.style.bg || '#0a0e14' }}>
      {manifest.scenes.map((scene) => {
        const seq = (
          <Sequence key={scene.id} from={from} durationInFrames={scene.durationFrames}>
            <Scene scene={scene} accent={manifest.style.accent || '#22d3a6'} />
          </Sequence>
        );
        from += scene.durationFrames;
        return seq;
      })}
    </AbsoluteFill>
  );
};
