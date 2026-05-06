import React from 'react';
import { useCurrentFrame, spring, interpolate, useVideoConfig } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont('normal', {
  weights: ['700', '900'],
});

export const Scene6_Outro: React.FC<{ summary: string[] }> = ({ summary }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      width: '100%',
      background: '#0A0A0A',
      fontFamily
    }}>
      <div style={{ fontSize: '64px', color: 'white', fontWeight: '900', marginBottom: '60px' }}>
        FINISHING UP 🎬
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '800px', marginBottom: '80px' }}>
        {summary.map((line, i) => {
          const lineSpring = spring({
            frame: frame - (20 + i * 20),
            fps,
          });

          return (
            <div key={i} style={{
              fontSize: '32px',
              color: i === summary.length - 1 ? '#00FFAA' : 'white',
              opacity: lineSpring,
              transform: `translateX(${interpolate(lineSpring, [0, 1], [-20, 0])}px)`
            }}>
              {i + 1}. {line}
            </div>
          );
        })}
      </div>

      {/* Subscribe CTA */}
      <div style={{
        padding: '20px 60px',
        background: '#FF0000',
        borderRadius: '50px',
        color: 'white',
        fontSize: '32px',
        fontWeight: '900',
        transform: `scale(${spring({ frame: frame - 80, fps })})`,
        opacity: spring({ frame: frame - 80, fps })
      }}>
        SUBSCRIBE & LIKE ❤️
      </div>
    </div>
  );
};
