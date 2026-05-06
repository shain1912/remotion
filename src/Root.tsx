import { Composition } from 'remotion';
import { VibeCodingVideo } from './Main';
import { TechReview } from './TechReview';

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
