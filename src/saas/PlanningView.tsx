import React, { useState } from 'react';
import { Sparkles, ArrowRight, Edit3 } from 'lucide-react';
import { useVideoStore } from './store';

export const PlanningView: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { scenes, updateScene } = useVideoStore();
  const [isPlanning, setIsPlanning] = useState(false);

  const handlePlanAI = async () => {
    setIsPlanning(true);
    setTimeout(() => setIsPlanning(false), 1500);
  };

  return (
    <div style={{ background: 'hsl(var(--background))', minHeight: '100%' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 40px 20px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '12px' }}>AI Video Plan</h2>
        <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '16px' }}>
          자료 분석을 통해 생성된 20개의 장면입니다. 내용을 수정하거나 AI에게 개선을 요청하세요.
        </p>
      </div>

      <div className="planning-grid">
        {scenes.map((scene, index) => (
          <div key={scene.id} className="planning-card">
            <div style={{ 
              width: '28px', height: '28px', background: 'hsl(var(--accent))', border: '1px solid hsl(var(--border))', 
              borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' 
            }}>
              {index + 1}
            </div>
            <div className="planning-input-group">
               <input 
                 className="planning-title"
                 value={scene.title}
                 onChange={(e) => updateScene(scene.id, { title: e.target.value })}
               />
               <textarea 
                 className="planning-desc"
                 value={scene.subtitle}
                 rows={1}
                 onChange={(e) => updateScene(scene.id, { subtitle: e.target.value })}
                 onInput={(e) => {
                   const target = e.target as HTMLTextAreaElement;
                   target.style.height = 'auto';
                   target.style.height = target.scrollHeight + 'px';
                 }}
               />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '8px' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', border: '1px solid hsl(var(--border))', padding: '2px 8px', borderRadius: '4px', background: 'hsl(var(--background))' }}>
                {scene.type}
              </span>
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px', paddingBottom: '100px' }}>
           <div style={{ display: 'flex', gap: '12px', background: 'hsl(var(--secondary))', padding: '8px 16px', borderRadius: '12px', border: '1px solid hsl(var(--border))', width: '500px' }}>
              <Sparkles size={18} color="var(--vibe-purple)" />
              <input style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, fontSize: '14px', outline: 'none' }} placeholder="전체 구조를 좀 더 드라마틱하게 바꿔줘..." />
              <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={handlePlanAI}>
                {isPlanning ? 'Analyzing...' : 'Refine Plan'}
              </button>
           </div>
           
           <button className="btn-primary" style={{ padding: '16px 32px', fontSize: '16px', display: 'flex', gap: '12px', alignItems: 'center' }} onClick={onComplete}>
             Confirm & Generate Video <ArrowRight size={20} />
           </button>
        </div>
      </div>
    </div>
  );
};
