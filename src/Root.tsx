import { Composition } from 'remotion';
import { VibeCodingVideo } from './Main';
import { TechReview } from './TechReview';
import { FactoryVideo, calculateFactoryMetadata } from './factory/FactoryVideo';
import { FactoryThumbnail } from './factory/FactoryThumbnail';
import { SlideVideo, calculateSlideMetadata } from './factory/SlideVideo';
import { TheoryVideo, calculateTheoryMetadata } from './factory/TheoryVideo';
import { GitGraphVideo, calculateGitGraphMetadata } from './factory/GitGraphVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GitGraphVideo"
        component={GitGraphVideo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ projectId: 'demo-gitgraph' }}
        calculateMetadata={calculateGitGraphMetadata}
      />
      <Composition
        id="TheoryVideo"
        component={TheoryVideo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ projectId: 'demo-theory' }}
        calculateMetadata={calculateTheoryMetadata}
      />
      <Composition
        id="SlideVideo"
        component={SlideVideo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ projectId: 'demo-slides' }}
        calculateMetadata={calculateSlideMetadata}
      />
      <Composition
        id="FactoryThumbnail"
        component={FactoryThumbnail}
        durationInFrames={1}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{
          bg: 'factory/demo-git/thumb_bg.jpg',
          accent: '#22d3a6',
          align: 'left' as const,
          lines: [{ text: '깃 명령어' }, { text: '외우지 마세요', accent: true }],
        }}
      />
      <Composition
        id="FactoryVideo"
        component={FactoryVideo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ projectId: 'demo-git' }}
        calculateMetadata={calculateFactoryMetadata}
      />
      <Composition
        id="TechReview"
        component={TechReview}
        durationInFrames={2400} 
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="VisionOverview"
        component={VibeCodingVideo}
        durationInFrames={150 * 20 - 20 * 19}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
