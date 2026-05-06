import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { AbsoluteFill, Series, useCurrentFrame, delayRender, continueRender, staticFile } from 'remotion';
import { Scene1_Intro } from './Scene1_Intro';
import { Scene2_Core } from './Scene2_Core';
import { Scene5_Tips } from './Scene5_Tips';
import { Scene6_Outro } from './Scene6_Outro';
import { SceneStats } from './SceneStats';
import { SceneTerminal } from './SceneTerminal';
import { Subtitle } from './Subtitle';
import { Background } from './Background';
import { DynamicMeme } from './DynamicMeme';
import { searchGifs, getMemeByTagSync } from './MemeService';
import type { MemeResult } from './MemeService';
import { useVideoStore } from './saas/store';

const DUR = 120; // Frame duration per scene

export const TechReview: React.FC = () => {
  const frame = useCurrentFrame();
  const { scenes } = useVideoStore();
  const [memes, setMemes] = useState<Record<number, MemeResult>>({});
  const [handle] = useState(() => delayRender('Connecting to SaaS Store...'));

  const fetchData = useCallback(async () => {
    try {
      const memePromises = scenes
        .filter(s => s.type === 'meme')
        .map(async (s) => {
          if (s.data.asset) {
            return { 
              id: s.id, 
              meme: { 
                url: staticFile(s.data.asset), 
                caption: s.title, 
                tags: [s.data.query], 
                type: 'static' as const 
              } 
            };
          }
          const res = await searchGifs(s.data.query!);
          return { id: s.id, meme: res[0] || getMemeByTagSync(s.data.query!) };
        });

      const resolvedMemes = await Promise.all(memePromises);
      const memeMap: Record<number, MemeResult> = {};
      resolvedMemes.forEach(({ id, meme }) => {
        memeMap[id] = meme;
      });
      setMemes(memeMap);
    } catch (e) {
      console.error("SaaS Sync Failed:", e);
    } finally {
      continueRender(handle);
    }
  }, [handle, scenes]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getSubtitle = (f: number) => {
    const sceneIndex = Math.floor(f / DUR);
    return scenes[sceneIndex]?.subtitle || "";
  };

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Background />
      
      <Series>
        {scenes.map((scene) => (
          <Series.Sequence key={scene.id} durationInFrames={DUR}>
            {scene.type === 'title' && (
              <Scene1_Intro title={scene.title} hook={scene.subtitle.substring(0, 30) + '...'} />
            )}
            {scene.type === 'split' && (
              <Scene2_Core left={scene.data.left} right={scene.data.right} comparison={scene.title} />
            )}
            {scene.type === 'terminal' && (
              <SceneTerminal prompt={scene.data.prompt} code={scene.data.code} />
            )}
            {scene.type === 'meme' && (
              <DynamicMeme 
                url={memes[scene.id]?.url || getMemeByTagSync(scene.data.query!).url} 
                caption={scene.title} 
                type={memes[scene.id]?.type || 'static'}
              />
            )}
            {scene.type === 'stats' && (
              <SceneStats label={scene.data.label} value={scene.data.value} color={scene.data.color} />
            )}
            {scene.type === 'tips' && (
              <Scene5_Tips tips={scene.data.steps} />
            )}
            {scene.type === 'outro' && (
              <Scene6_Outro summary={[scene.data.next, "Like & Subscribe", "Future of Tech"]} />
            )}
          </Series.Sequence>
        ))}
      </Series>

      <Subtitle text={getSubtitle(frame)} />
    </AbsoluteFill>
  );
};
