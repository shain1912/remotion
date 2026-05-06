import React from 'react';
import { useCurrentFrame, spring, interpolate, useVideoConfig } from 'remotion';
import { loadFont } from '@remotion/google-fonts/FiraCode';

const { fontFamily: codeFont } = loadFont('normal', {
  weights: ['400'],
});

export const Scene3_DeepDive: React.FC<{ code: string; highlight: string }> = ({ code, highlight }) => {
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
      padding: '80px'
    }}>
      <div style={{
        width: '1000px',
        background: '#1a1a1a',
        borderRadius: '16px',
        padding: '40px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
        transform: `perspective(1000px) rotateX(${interpolate(entrance, [0, 1], [10, 0])}deg) scale(${entrance})`,
        opacity: entrance
      }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FF5F56' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FFBD2E' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27C93F' }} />
        </div>
        <pre style={{
          fontFamily: codeFont,
          fontSize: '28px',
          color: '#D4D4D4',
          lineHeight: '1.5',
          margin: 0
        }}>
          {code}
        </pre>
      </div>

      <div style={{
        marginTop: '60px',
        background: '#00FFAA',
        color: 'black',
        padding: '12px 24px',
        fontSize: '32px',
        fontWeight: 'bold',
        borderRadius: '8px',
        opacity: interpolate(frame, [30, 40], [0, 1]),
        transform: `translateY(${interpolate(frame, [30, 40], [20, 0])}px)`
      }}>
        {highlight}
      </div>
    </div>
  );
};
