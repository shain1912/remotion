import React from 'react';
import { useCurrentFrame, spring, interpolate, useVideoConfig } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont('normal', {
  weights: ['700', '900'],
});

export const Scene2_Core: React.FC<{ left: string; right: string; comparison: string }> = ({ left, right, comparison }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const split = spring({
    frame: frame - 10,
    fps,
    config: { damping: 15 },
  });

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      width: '100%',
      fontFamily,
      background: '#0A0A0A'
    }}>
      {/* Left Panel */}
      <div style={{
        flex: 1,
        background: '#111',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        transform: `translateX(${interpolate(split, [0, 1], [-100, 0])}%)`,
        opacity: split,
        borderRight: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ fontSize: '40px', color: 'rgba(255,255,255,0.5)', marginBottom: '20px' }}>ASSET A</div>
        <div style={{ fontSize: '64px', color: 'white', fontWeight: '900' }}>{left}</div>
      </div>

      {/* Connection Indicator */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100px',
        height: '100px',
        background: '#00FFAA',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        opacity: split,
        scale: split.toString()
      }}>
        <div style={{ fontSize: '40px' }}>⚡</div>
      </div>

      {/* Right Panel */}
      <div style={{
        flex: 1,
        background: '#0A0A0A',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        transform: `translateX(${interpolate(split, [0, 1], [100, 0])}%)`,
        opacity: split
      }}>
        <div style={{ fontSize: '40px', color: 'rgba(255,255,255,0.5)', marginBottom: '20px' }}>ASSET B</div>
        <div style={{ fontSize: '64px', color: '#00FFAA', fontWeight: '900' }}>{right}</div>
      </div>

      {/* Bottom Comparison Text */}
      <div style={{
        position: 'absolute',
        bottom: '150px',
        width: '100%',
        textAlign: 'center',
        fontSize: '32px',
        color: 'white',
        opacity: interpolate(frame, [40, 50], [0, 1]),
        fontWeight: 'bold'
      }}>
        {comparison}
      </div>
    </div>
  );
};
