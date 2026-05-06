import React, { useEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export const NavigationOverlay: React.FC<{ 
  totalSlides: number, 
  slideDuration: number 
}> = ({ totalSlides, slideDuration }) => {
  const frame = useCurrentFrame();
  
  // This is a helper UI for developers/presenters
  // Since Remotion is frame-driven, we can't "statefully" navigate in the component itself
  // but we can provide a UI that tells the user which frame to go to or has buttons 
  // that (in a real browser environment) could interact with the Player.
  
  return (
    <div style={{
      position: 'absolute',
      bottom: '40px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '20px',
      alignItems: 'center',
      background: 'rgba(0,0,0,0.8)',
      padding: '10px 30px',
      borderRadius: '50px',
      border: '1px solid rgba(255,255,255,0.2)',
      zIndex: 1000,
      fontFamily: 'sans-serif',
      color: 'white',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ fontSize: '14px', opacity: 0.6 }}>PREVIEW NAV</div>
      <div style={{ fontWeight: 'bold' }}>
        Slide {Math.floor(frame / slideDuration) + 1} / {totalSlides}
      </div>
      <div style={{ fontSize: '12px', color: '#00FFAA' }}>
        Press <span style={{ background: '#333', padding: '2px 6px', borderRadius: '4px' }}>←</span> <span style={{ background: '#333', padding: '2px 6px', borderRadius: '4px' }}>→</span> to navigate frames
      </div>
      <div style={{ fontSize: '12px', opacity: 0.4 }}>
        Frame: {frame}
      </div>
    </div>
  );
};
