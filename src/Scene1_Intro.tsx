import React from 'react';
import { useCurrentFrame, spring, interpolate, useVideoConfig } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont('normal', {
  weights: ['900'],
});

export const Scene1_Intro: React.FC<{ title: string; hook: string }> = ({ title, hook }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const textScale = interpolate(frame, [0, 20], [0.8, 1], { extrapolateRight: 'clamp' });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      width: '100%',
      fontFamily,
      background: '#0A0A0A'
    }}>
      <div style={{
        transform: `scale(${entrance * textScale})`,
        opacity: entrance,
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '120px',
          color: '#00FFAA',
          textShadow: '0 0 30px rgba(0, 255, 170, 0.3)',
          marginBottom: '20px',
          letterSpacing: '-5px'
        }}>
          {title}
        </div>
        <div style={{
          fontSize: '48px',
          color: 'white',
          opacity: interpolate(frame, [20, 30], [0, 1], { extrapolateRight: 'clamp' }),
          transform: `translateY(${interpolate(frame, [20, 30], [20, 0], { extrapolateRight: 'clamp' })}px)`
        }}>
          {hook}
        </div>
      </div>
    </div>
  );
};
