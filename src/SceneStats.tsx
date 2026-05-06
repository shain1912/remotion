import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';

export const SceneStats: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const progress = spring({
    frame,
    fps,
    config: { damping: 12 }
  });

  return (
    <AbsoluteFill style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#0a0a0a' 
    }}>
      <div style={{
        fontSize: '120px',
        fontWeight: 'bold',
        color,
        textShadow: `0 0 40px ${color}66`,
        transform: `scale(${interpolate(progress, [0, 1], [0.5, 1])})`
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '60px',
        color: 'white',
        marginTop: '20px',
        opacity: progress
      }}>
        {label}
      </div>
      <div style={{
        width: '800px',
        height: '20px',
        background: '#333',
        borderRadius: '10px',
        marginTop: '50px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${interpolate(progress, [0, 1], [0, 100])}%`,
          height: '100%',
          background: color,
          boxShadow: `0 0 20px ${color}`
        }} />
      </div>
    </AbsoluteFill>
  );
};
