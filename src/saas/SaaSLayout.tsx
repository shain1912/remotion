import React from 'react';
import { 
  Video, 
  Settings, 
  ChevronRight, 
  Play, 
  Pause, 
  Sparkles, 
  Search,
  MessageSquare,
  Layout,
  FileVideo
} from 'lucide-react';
import { useVideoStore } from './store';
import { ChatView } from './ChatView';
import { PlanningView } from './PlanningView';
import { VideoPreview } from './VideoPreview';
import { staticFile } from 'remotion';
import './SaaS.css';

export const SaaSLayout: React.FC = () => {
  const { workflowStep, scenes, currentSceneId, setCurrentSceneId, setWorkflowStep } = useVideoStore();

  return (
    <div className="saas-container">
      {/* Universal Side Navigation (Shadcn Style) */}
      <aside className="saas-sidebar" style={{ width: '64px', borderRight: '1px solid hsl(var(--border))', alignItems: 'center', paddingTop: '20px', paddingBottom: '20px' }}>
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black' }}>
            <Video size={20} />
          </div>
          <div 
            onClick={() => setWorkflowStep('chat')}
            style={{ color: workflowStep === 'chat' ? 'white' : 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
          >
            <MessageSquare size={20} />
          </div>
          <div 
            onClick={() => setWorkflowStep('planning')}
            style={{ color: workflowStep === 'planning' ? 'white' : 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
          >
            <Layout size={20} />
          </div>
          <div 
            onClick={() => setWorkflowStep('editor')}
            style={{ color: workflowStep === 'editor' ? 'white' : 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
          >
            <FileVideo size={20} />
          </div>
        </div>
        <div style={{ marginTop: 'auto', marginBottom: '20px', color: 'rgba(255,255,255,0.4)' }}>
          <Settings size={20} />
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Navbar */}
        <header className="saas-navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>VibeVideo SaaS</span>
            <div style={{ width: '1px', height: '16px', background: 'hsl(var(--border))' }} />
            <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
              {workflowStep === 'chat' && 'Phase 0: Ideation'}
              {workflowStep === 'planning' && 'Phase 1: Scene Planning'}
              {workflowStep === 'editor' && 'Phase 2: Video Production'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="btn-ghost">Share</button>
            <button className="btn-primary">Export</button>
          </div>
        </header>

        {/* Dynamic View Content */}
        <main style={{ flex: 1, overflowY: 'auto', background: workflowStep === 'editor' ? '#000' : 'hsl(var(--background))' }}>
          {workflowStep === 'chat' && <ChatView />}
          {workflowStep === 'planning' && <PlanningView onComplete={() => setWorkflowStep('editor')} />}
          
          {workflowStep === 'editor' && (
            <div style={{ display: 'flex', height: '100%' }}>
              {/* Scene Sidebar for Editor */}
              <aside style={{ width: '280px', borderRight: '1px solid hsl(var(--border))', padding: '20px', overflowY: 'auto' }}>
                 <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', marginBottom: '16px' }}>Scenes</div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {scenes.map(s => (
                      <button 
                        key={s.id}
                        onClick={() => setCurrentSceneId(s.id)}
                        style={{ 
                          textAlign: 'left', 
                          padding: '8px 12px', 
                          borderRadius: '8px',
                          background: currentSceneId === s.id ? 'hsl(var(--accent))' : 'transparent',
                          border: 'none',
                          color: currentSceneId === s.id ? 'white' : 'hsl(var(--muted-foreground))',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        {s.id}. {s.title}
                      </button>
                    ))}
                 </div>
              </aside>

              {/* Editor Canvas */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                  <div style={{ width: '100%', maxWidth: '800px', borderRadius: '12px', overflow: 'hidden', border: '1px solid hsl(var(--border))', boxShadow: '0 40px 100px rgba(0,0,0,0.8)' }}>
                    <VideoPreview />
                  </div>
                </div>
                
                {/* AI Chat Bar for Editor */}
                <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '600px' }}>
                  <div style={{ background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))', borderRadius: '14px', padding: '10px 16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Sparkles size={18} color="#8b5cf6" />
                    <input style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: '14px', outline: 'none' }} placeholder="Ask AI to refine this scene..." />
                    <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '11px' }}>Apply</button>
                  </div>
                </div>
              </div>

              {/* Inspector */}
              <aside style={{ width: '300px', borderLeft: '1px solid hsl(var(--border))', padding: '24px' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', marginBottom: '20px' }}>Inspector</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>Meme Asset</label>
                    <div style={{ gridTemplateColumns: '1fr 1fr', display: 'grid', gap: '8px' }}>
                       {['meme_success.png', 'meme_think.jpg'].map(m => (
                         <div key={m} style={{ aspectRatio: 1, background: 'hsl(var(--accent))', borderRadius: '8px', overflow: 'hidden' }}>
                            <img src={staticFile(m)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
