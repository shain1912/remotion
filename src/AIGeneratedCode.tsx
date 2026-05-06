import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { loadFont } from '@remotion/google-fonts/FiraCode';

const { fontFamily } = loadFont('normal', {
  weights: ['400'],
});

const mockCode = `import React from 'react';
import { Particles } from 'react-tsparticles';

export default function SpaceLogin() {
  return (
    <div className="space-bg">
      <Particles options={universeConfig} />
      <div className="glassmorphism-card">
        <h1 className="glow-text">LOGIN</h1>
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button className="neon">Access</button>
      </div>
    </div>
  );
}`;

export const AIGeneratedCode: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const entrance = spring({
    frame: frame,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  const codeLength = Math.min(mockCode.length, frame * 60);
  const visibleCode = mockCode.slice(0, codeLength);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      width: '100%',
      transform: `scale(${entrance}) translateY(${interpolate(entrance, [0, 1], [50, 0])}px)`,
      opacity: entrance,
    }}>
      <div style={{
        background: 'rgba(0, 0, 0, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        padding: '40px',
        boxShadow: '0 30px 60px rgba(0, 0, 0, 0.5)',
        width: 'fit-content',
        maxWidth: '1200px'
      }}>
        <pre style={{ 
          fontSize: '32px', 
          lineHeight: '1.4',
          color: '#FFFFFF',
          fontFamily,
          margin: 0,
          overflow: 'hidden',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all'
        }}>
          {visibleCode}
        </pre>
      </div>
    </div>
  );
};
