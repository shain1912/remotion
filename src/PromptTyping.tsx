import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont('normal', {
  weights: ['700'],
});

export const PromptTyping: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Manim-style Grow animation
  const grow = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100, mass: 0.5 },
  });

  const charsToShow = Math.floor((frame / 30) * text.length);
  const textToShow = text.slice(0, Math.max(0, charsToShow));

  return (
    <div style={{ 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      width: '100%',
      transform: `scale(${grow})`,
      opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' })
    }}>
      <div style={{ 
        fontSize: '72px', 
        color: '#FFFFFF', 
        fontWeight: 'bold',
        fontFamily,
        textAlign: 'center',
        letterSpacing: '-2px'
      }}>
        {textToShow}
        <span style={{ 
          opacity: Math.round(frame / 15) % 2 === 0 ? 1 : 0,
          color: '#FFFFFF',
          marginLeft: '8px',
          width: '20px',
          display: 'inline-block'
        }}>|</span>
      </div>
    </div>
  );
};
