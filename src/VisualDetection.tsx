import React from 'react';
import { interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';

export const VisualDetection: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const boxes = [
    { label: 'CAT 98%', x: 100, y: 150, w: 300, h: 400, color: '#38BDF8' },
    { label: 'LAPTOP 92%', x: 500, y: 400, w: 400, h: 300, color: '#F472B6' },
    { label: 'COFFEE 85%', x: 850, y: 300, w: 100, h: 100, color: '#FACC15' },
  ];

  return (
    <div style={{
      width: '1000px',
      height: '700px',
      background: 'rgba(255,255,255,0.05)',
      position: 'relative',
      borderRadius: '20px',
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.2)'
    }}>
      {/* Background "Ghost" Image placeholder */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(45deg, #111, #222)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'rgba(255,255,255,0.1)',
        fontSize: '100px',
        fontWeight: 'bold'
      }}>IMAGE ASSET</div>

      {boxes.map((box, i) => {
        const delay = i * 15;
        const grow = spring({
          frame: frame - delay,
          fps,
          config: { damping: 10 },
        });

        return (
          <div key={i} style={{
            position: 'absolute',
            left: box.x,
            top: box.y,
            width: box.w * grow,
            height: box.h * grow,
            border: `4px solid ${box.color}`,
            boxShadow: `0 0 20px ${box.color}44`,
            opacity: grow,
            pointerEvents: 'none'
          }}>
            <div style={{
              position: 'absolute',
              top: '-35px',
              left: '-4px',
              background: box.color,
              color: 'black',
              padding: '2px 10px',
              fontSize: '18px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap'
            }}>
              {box.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
