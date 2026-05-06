import React from 'react';
import { interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';

export const VisualNeuralNet: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const layers = [4, 6, 6, 4];
  
  return (
    <div style={{
      display: 'flex',
      gap: '120px',
      alignItems: 'center',
      padding: '40px',
      height: '400px'
    }}>
      {layers.map((count, lIdx) => (
        <div key={lIdx} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          position: 'relative'
        }}>
          {Array.from({ length: count }).map((_, nIdx) => {
            const delay = lIdx * 10 + nIdx * 2;
            const pop = spring({
              frame: frame - delay,
              fps,
            });

            return (
              <div key={nIdx} style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: lIdx === 0 ? '#6366F1' : lIdx === layers.length - 1 ? '#EC4899' : '#FFFFFF',
                boxShadow: '0 0 15px rgba(255,255,255,0.3)',
                transform: `scale(${pop})`,
                zIndex: 2
              }} />
            );
          })}
          
          {/* Connections to next layer */}
          {lIdx < layers.length - 1 && Array.from({ length: count }).map((_, nIdx) => (
            Array.from({ length: layers[lIdx+1] }).map((_, nextIdx) => {
              const pulse = interpolate(frame, [0, 300], [0, 100], {
                extrapolateRight: 'clamp'
              });
              return (
                <div key={`${nIdx}-${nextIdx}`} style={{
                  position: 'absolute',
                  top: nIdx * 50 + 15,
                  left: 15,
                  width: '120px',
                  height: '1px',
                  background: `linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))`,
                  transformOrigin: 'left center',
                  transform: `rotate(${Math.atan2((nextIdx - nIdx) * 50, 120)}rad) scaleX(1)`,
                  zIndex: 1,
                  opacity: interpolate(frame, [lIdx * 20, lIdx * 20 + 20], [0, 1])
                }} />
              );
            })
          ))}
        </div>
      ))}
    </div>
  );
};
