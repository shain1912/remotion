import React from 'react';
import { interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';

export const VisualPixelMatrix: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const matrixSize = 8;
  const pixels = Array.from({ length: matrixSize * matrixSize }).map((_, i) => ({
    val: Math.floor(Math.random() * 255),
    r: Math.floor(Math.random() * 255),
    g: Math.floor(Math.random() * 255),
    b: Math.floor(Math.random() * 255),
  }));

  const entrance = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 100 },
  });

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${matrixSize}, 60px)`,
      gap: '4px',
      padding: '20px',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      transform: `scale(${entrance}) rotateX(${interpolate(entrance, [0, 1], [45, 0])}deg)`,
      boxShadow: '0 50px 100px rgba(0,0,0,0.5)'
    }}>
      {pixels.map((p, i) => {
        const delay = (i % matrixSize + Math.floor(i / matrixSize)) * 2;
        const pop = spring({
          frame: frame - delay,
          fps,
          config: { damping: 12 },
        });

        return (
          <div key={i} style={{
            width: '60px',
            height: '60px',
            backgroundColor: `rgb(${p.r}, ${p.g}, ${p.b})`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: p.r + p.g + p.b > 400 ? 'black' : 'white',
            fontSize: '14px',
            fontWeight: 'bold',
            borderRadius: '4px',
            transform: `scale(${pop})`,
            opacity: pop
          }}>
            {p.val}
          </div>
        );
      })}
    </div>
  );
};
