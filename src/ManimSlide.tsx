import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { Background } from './Background';

export const ManimSlide: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100, mass: 0.5 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Background />
      <AbsoluteFill style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        transform: `scale(${entrance})`,
        opacity: entrance,
        padding: '80px'
      }}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
