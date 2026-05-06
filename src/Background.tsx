import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';

export const Background: React.FC = () => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000000',
        overflow: 'hidden',
      }}
    >
      {/* Manim-style Background Grid (Coordinate Plane) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), 
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
          backgroundPosition: 'center center',
          opacity: 0.3
        }}
      />
      {/* Finer Grid Lines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.05) 0.5px, transparent 0.5px), 
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0.5px, transparent 0.5px)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: 'center center',
          opacity: 0.2
        }}
      />
      
      {/* Central Axis Point (Subtle indicator) */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '4px',
        height: '4px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)'
      }} />
    </AbsoluteFill>
  );
};
