import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont('normal', {
  weights: ['400', '700'],
});

export const Subtitle: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame % 30, [0, 5, 25, 30], [0, 1, 1, 0]);

  if (!text) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: '80px',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      zIndex: 1000,
      pointerEvents: 'none'
    }}>
      <div style={{
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '12px 32px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(8px)',
        color: 'white',
        fontSize: '32px',
        fontFamily,
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: '80%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        {text}
      </div>
    </div>
  );
};
