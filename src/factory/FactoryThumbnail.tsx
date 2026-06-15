import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { loadFont } from '@remotion/google-fonts/NotoSansKR';

const { fontFamily } = loadFont('normal', { weights: ['700', '900'], ignoreTooManyRequestsWarning: true });

export type ThumbLine = { text: string; accent?: boolean };
export type ThumbnailProps = {
  bg: string;            // staticFile path, e.g. factory/demo-git/thumb_bg.jpg
  lines: ThumbLine[];    // 1-3 short, punchy Korean lines
  accent?: string;
  align?: 'left' | 'center';
};

// High-CTR thumbnail: dramatic image + huge bold Korean copy with heavy contrast.
export const FactoryThumbnail: React.FC<ThumbnailProps> = ({ bg, lines, accent = '#22d3a6', align = 'left' }) => {
  const left = align === 'left';
  return (
    <AbsoluteFill style={{ backgroundColor: '#05070b' }}>
      <Img src={staticFile(bg)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      {/* contrast scrim, stronger on the text side */}
      <AbsoluteFill style={{
        background: left
          ? 'linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.0) 80%)'
          : 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 55%, rgba(0,0,0,0.0) 100%)',
      }} />
      <AbsoluteFill style={{
        justifyContent: 'center', alignItems: left ? 'flex-start' : 'center',
        padding: left ? '0 70px' : '0 60px 70px', textAlign: left ? 'left' : 'center',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {lines.map((ln, i) => (
            <div key={i} style={{
              fontFamily, fontWeight: 900, fontSize: 132, lineHeight: 1.02,
              color: ln.accent ? accent : '#ffffff',
              textShadow: '0 8px 28px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.9)',
              WebkitTextStroke: '3px rgba(0,0,0,0.45)',
            }}>{ln.text}</div>
          ))}
        </div>
        <div style={{ marginTop: 26, height: 14, width: 220, background: accent, borderRadius: 10, boxShadow: `0 0 30px ${accent}` }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
