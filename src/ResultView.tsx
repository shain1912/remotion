import React from 'react';
import { spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont('normal', {
  weights: ['700', '900'],
});

export const ResultView: React.FC<{ slideAnimation: number }> = ({ slideAnimation }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - 10,
    fps,
    config: { damping: 12, stiffness: 100, mass: 0.5 },
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      width: '100%',
      backgroundColor: 'transparent',
      opacity: entrance
    }}>
      {/* Manim-style Result Card (Minimalist) */}
      <div style={{
        padding: '60px', 
        borderRadius: '8px', 
        background: 'rgba(0, 0, 0, 0.9)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 40px 100px rgba(0, 0, 0, 0.8)',
        width: '500px',
        transform: `scale(${entrance})`
      }}>
        <h1 style={{ 
          color: '#FFFFFF', 
          fontSize: '60px', 
          fontWeight: '900', 
          fontFamily,
          marginBottom: '40px',
          textAlign: 'center',
          letterSpacing: '-2px'
        }}>
          SIGN IN
        </h1>
        <div style={{ height: '2px', backgroundColor: 'rgba(255, 255, 255, 0.2)', marginBottom: '40px' }}></div>
        <div style={{ 
          height: '70px', 
          backgroundColor: '#FFFFFF', 
          borderRadius: '4px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#000000',
          fontWeight: 'bold',
          fontFamily,
          fontSize: '24px'
        }}>
          CONTINUE
        </div>
      </div>
      
      {/* Centered Impactful Text */}
      <div style={{
        marginTop: '80px', 
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '72px', 
          fontWeight: '900', 
          fontFamily,
          color: '#FFFFFF',
          letterSpacing: '-3px',
          transform: `scale(${spring({ frame: frame - 40, fps, config: { damping: 10 } })})`
        }}>
          단 10초 컷.
        </div>
        <div style={{
          fontSize: '40px', 
          fontWeight: '700', 
          fontFamily,
          color: 'rgba(255, 255, 255, 0.7)',
          marginTop: '20px'
        }}>
          이것이 바이브 코딩 😎
        </div>
      </div>
    </div>
  );
};
