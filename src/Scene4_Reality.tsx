import React from 'react';
import { useCurrentFrame, spring, interpolate, useVideoConfig } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont('normal', {
  weights: ['700', '900'],
});

export const Scene4_Reality: React.FC<{ issues: string[] }> = ({ issues }) => {
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
      <div style={{
        fontSize: '80px',
        color: '#FF0055',
        fontWeight: '900',
        marginBottom: '60px',
        transform: `scale(${entrance})`,
        opacity: entrance
      }}>
        REALITY CHECK ⚠️
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '800px' }}>
        {issues.map((issue, i) => {
          const itemSpring = spring({
            frame: frame - (20 + i * 10),
            fps,
          });

          return (
            <div key={i} style={{
              background: 'rgba(255, 0, 85, 0.1)',
              padding: '24px 32px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 0, 85, 0.3)',
              color: 'white',
              fontSize: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              transform: `translateX(${interpolate(itemSpring, [0, 1], [-50, 0])}px)`,
              opacity: itemSpring
            }}>
              <span style={{ color: '#FF0055' }}>✕</span>
              {issue}
            </div>
          );
        })}
      </div>
    </div>
  );
};
