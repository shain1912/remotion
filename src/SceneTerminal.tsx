import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { PromptTyping } from './PromptTyping';

export const SceneTerminal: React.FC<{ prompt: string; code: string }> = ({ prompt, code }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame, fps, config: { damping: 20 } });

  return (
    <AbsoluteFill style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#121212',
      padding: '80px'
    }}>
      <div style={{
        width: '100%',
        height: '100%',
        background: '#1e1e1e',
        borderRadius: '15px',
        border: '1px solid #333',
        boxShadow: '0 50px 100px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transform: `scale(${entrance}) translateY(${100 * (1 - entrance)}px)`
      }}>
        <div style={{
          height: '40px',
          background: '#2d2d2d',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', background: '#ff5f56', borderRadius: '50%' }} />
            <div style={{ width: '12px', height: '12px', background: '#ffbd2e', borderRadius: '50%' }} />
            <div style={{ width: '12px', height: '12px', background: '#27c93f', borderRadius: '50%' }} />
          </div>
          <div style={{ marginLeft: 'auto', color: '#666', fontSize: '14px' }}>VS Code - vibe_review.ts</div>
        </div>
        
        <div style={{ padding: '40px', flex: 1, fontFamily: 'monospace', fontSize: '24px' }}>
          <div style={{ color: '#00ff88', marginBottom: '20px' }}>
            <PromptTyping text={`> ${prompt}`} />
          </div>
          {frame > 60 && (
            <div style={{ color: '#abb2bf', transition: 'opacity 0.5s' }}>
              <pre style={{ margin: 0 }}>{code}</pre>
              <div style={{ color: '#5c6370', fontStyle: 'italic' }}>// AI Generated Code...</div>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
