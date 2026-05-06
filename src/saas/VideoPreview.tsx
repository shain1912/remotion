import React from 'react';
import { Player } from '@remotion/player';
import { TechReview } from '../TechReview';
import { useVideoStore } from './store';

export const VideoPreview: React.FC = () => {
  const { isPlaying } = useVideoStore();

  return (
    <div className="video-frame">
      <Player
        component={TechReview}
        durationInFrames={2400}
        fps={30}
        compositionWidth={1920}
        compositionHeight={1080}
        style={{
          width: '100%',
          height: '100%',
        }}
        controls
        autoPlay={isPlaying}
        loop
      />
    </div>
  );
};
