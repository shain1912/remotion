import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { ManimSlide } from './ManimSlide';
import { ManimText } from './ManimText';
import { slides, SlideData } from './slides';
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { VisualPixelMatrix } from './VisualPixelMatrix';
import { VisualNeuralNet } from './VisualNeuralNet';
import { VisualDetection } from './VisualDetection';
import { NavigationOverlay } from './NavigationOverlay';
import { staticFile } from 'remotion';

const SlideContent: React.FC<{ slide: SlideData, index: number }> = ({ slide, index }) => {
  // Use visual infographics for specific slides
  if (index === 3) return <VisualPixelMatrix />; // Slide 4: Image as Matrix
  if (index === 6) return <VisualDetection />; // Slide 7: Object Detection
  if (index === 11) return <VisualNeuralNet />; // Slide 12: CNN
  if (index === 14) {
    // Slide 15: Generative Meme
    return (
        <div style={{ textAlign: 'center' }}>
            <img 
                src={staticFile('meme.png')} 
                style={{ width: '800px', borderRadius: '20px', boxShadow: '0 40px 100px rgba(0,0,0,0.8)' }}
            />
            <ManimText text="When the robot is too logical..." size={24} delay={30} />
        </div>
    );
  }

  return (
    <>
      <ManimText text={slide.title} size={80} bold delay={10} />
      {slide.subtitle && <ManimText text={slide.subtitle} size={40} color="rgba(255,255,255,0.7)" delay={20} />}
      
      {slide.bullets && (
        <div style={{ marginTop: '40px' }}>
          {slide.bullets.map((bullet, i) => (
            <ManimText key={i} text={`• ${bullet}`} size={32} delay={30 + i * 10} />
          ))}
        </div>
      )}
    </>
  );
};

export const VibeCodingVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  const slideDuration = 150; // Increased to 5 seconds per slide for better recording

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <TransitionSeries>
        {slides.map((slide, index) => (
          <React.Fragment key={index}>
            <TransitionSeries.Sequence durationInFrames={slideDuration}>
              <ManimSlide>
                <SlideContent slide={slide} index={index} />
              </ManimSlide>
            </TransitionSeries.Sequence>
            {index < slides.length - 1 && (
              <TransitionSeries.Transition
                presentation={fade()}
                timing={linearTiming({ durationInFrames: 20 })}
              />
            )}
          </React.Fragment>
        ))}
      </TransitionSeries>
      
      {/* Interaction Helper Overlay */}
      <NavigationOverlay totalSlides={slides.length} slideDuration={slideDuration} />
    </AbsoluteFill>
  );
};
