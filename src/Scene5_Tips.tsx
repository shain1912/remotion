import React from 'react';
import { useCurrentFrame, spring, interpolate, useVideoConfig } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont('normal', {
  weights: ['700', '900'],
});

export const Scene5_Tips: React.FC<{ tips: string[] }> = ({ tips }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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
      <div style={{ fontSize: '64px', color: '#00FFAA', fontWeight: '900', marginBottom: '80px' }}>
        PRACTICAL TIPS 💡
      </div>

      <div style={{ display: 'flex', gap: '40px' }}>
        {tips.map((tip, i) => {
          const cardSpring = spring({
            frame: frame - (15 + i * 15),
            fps,
            config: { damping: 10, stiffness: 100 },
          });

          return (
            <div key={i} style={{
              width: '350px',
              background: '#1a1a1a',
              padding: '40px',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transform: `translateY(${interpolate(cardSpring, [0, 1], [100, 0])}px)`,
              opacity: cardSpring,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#00FFAA',
                color: 'black',
                fontSize: '32px',
                fontWeight: '900',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '30px'
              }}>
                {i + 1}
              </div>
              <div style={{ fontSize: '28px', color: 'white', textAlign: 'center', lineHeight: '1.4' }}>
                {tip}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
