import React from 'react';
import { useCurrentFrame, spring, interpolate, useVideoConfig, AbsoluteFill } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont('normal', {
  weights: ['900'],
});

interface DynamicMemeProps {
  url: string;
  caption: string;
  type?: 'static' | 'animated';
}

export const DynamicMeme: React.FC<DynamicMemeProps> = ({ url, caption, type = 'static' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 100 },
  });

  const drift = interpolate(frame, [0, 150], [0, 20]);

  if (!url) {
    return (
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', background: '#000' }}>
         <div style={{ color: 'white', fontSize: '40px', fontFamily }}>Searching Meme...</div>
      </AbsoluteFill>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      transform: `scale(${entrance}) rotate(${interpolate(entrance, [0, 1], [-5, 0])}deg) translateY(${drift}px)`,
      opacity: entrance
    }}>
      <div style={{
        position: 'relative',
        padding: '16px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 50px 100px rgba(0,0,0,0.9)',
        border: '8px solid white',
        overflow: 'hidden'
      }}>
        <img 
          src={url} 
          style={{ 
            width: '700px', 
            height: '450px', 
            objectFit: 'cover',
            borderRadius: '2px',
            filter: 'contrast(1.1) brightness(1.05)'
          }} 
        />
        
        <div style={{
          position: 'absolute',
          bottom: '20px',
          width: 'calc(100% - 32px)',
          textAlign: 'center',
          color: 'white',
          fontSize: '44px',
          fontFamily,
          fontWeight: '900',
          textShadow: '3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 0 8px 15px rgba(0,0,0,0.8)',
          padding: '0 20px',
          textTransform: 'uppercase'
        }}>
          {caption}
        </div>
      </div>
    </div>
  );
};
