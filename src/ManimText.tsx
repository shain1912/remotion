import React from 'react';
import { useCurrentFrame, spring, interpolate, useVideoConfig } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont('normal', {
  weights: ['400', '700', '900'],
});

export const ManimText: React.FC<{ 
  text: string, 
  size?: number, 
  bold?: boolean, 
  color?: string,
  delay?: number 
}> = ({ text, size = 48, bold = false, color = 'white', delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  return (
    <div style={{
      fontFamily,
      fontSize: `${size}px`,
      fontWeight: bold ? '900' : '400',
      color,
      textAlign: 'center',
      opacity: entrance,
      transform: `translateY(${interpolate(entrance, [0, 1], [20, 0])}px)`,
      marginBottom: '20px',
      letterSpacing: bold ? '-2px' : 'normal'
    }}>
      {text}
    </div>
  );
};
