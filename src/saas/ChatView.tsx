import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  User, 
  Bot, 
  ArrowRight, 
  Plus, 
  FileText, 
  Link as LinkIcon, 
  History,
  X,
  Upload
} from 'lucide-react';
import { useVideoStore } from './store';

export const ChatView: React.FC = () => {
  const { messages, sources, addMessage, addSource, setScenes, setWorkflowStep } = useVideoStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAddSource, setShowAddSource] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    addMessage({ role: 'user', content: userMsg });
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:3001/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg, sources })
      });

      if (!response.ok) throw new Error('API call failed');
      
      const data = await response.json();
      
      if (data.scenes) {
        setScenes(data.scenes);
        addMessage({ 
          role: 'assistant', 
          content: `${sources.length}개의 참고자료를 분석하여 ${data.scenes.length}개의 장면으로 구성된 테크 리뷰 플랜을 생성했습니다. 상세 내용을 확인해보시겠어요?` 
        });
      }
    } catch (error) {
      console.error(error);
      addMessage({ 
        role: 'assistant', 
        content: '죄송합니다. AI 엔진과 통신 중 오류가 발생했습니다. (API Key가 설정되어 있는지 확인해주세요!)' 
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      addSource({ id: Math.random().toString(), title: file.name, type: 'file' });
      setShowAddSource(false);
    }
  };

  const handleAddLink = () => {
    if (linkInput.trim()) {
      addSource({ id: Math.random().toString(), title: linkInput, type: 'link' });
      setLinkInput('');
      setShowAddSource(false);
    }
  };

  return (
    <div className="saas-container" style={{ display: 'flex' }}>
      {/* NotebookLM-style Source Sidebar */}
      <aside className="notebook-sidebar">
        <div className="notebook-sidebar-header">
          <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Sources</span>
          <button 
            style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
            onClick={() => setShowAddSource(!showAddSource)}
          >
            <Plus size={16} />
          </button>
        </div>

        {showAddSource && (
          <div style={{ padding: '16px', background: 'hsl(var(--secondary))', borderBottom: '1px solid hsl(var(--border))' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary" 
                  style={{ fontSize: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}
                >
                  <Upload size={14} /> File Upload
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleFileUpload} 
                />
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <input 
                    className="input-field" 
                    style={{ flex: 1, fontSize: '11px' }} 
                    placeholder="Paste link..." 
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                  />
                  <button className="btn-primary" style={{ padding: '4px 8px' }} onClick={handleAddLink}>
                    <Plus size={14} />
                  </button>
                </div>
             </div>
          </div>
        )}

        <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
          {sources.length === 0 ? (
            <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', textAlign: 'center', marginTop: '20px' }}>
              자료를 추가해 보세요
            </div>
          ) : (
            sources.map(s => (
              <div key={s.id} className="source-item">
                {s.type === 'file' ? <FileText size={16} color="#818cf8" /> : <LinkIcon size={16} color="#fbbf24" />}
                <span style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</span>
              </div>
            ))
          )}
        </div>
        <div style={{ padding: '16px', borderTop: '1px solid hsl(var(--border))' }}>
          <button className="btn-secondary" style={{ width: '100%', fontSize: '12px', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
            <History size={14} /> 가이드 읽기
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="saas-content">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} style={{ 
              display: 'flex', 
              gap: '24px', 
              maxWidth: '800px', 
              margin: '0 auto',
              width: '100%',
              animation: 'fadeIn 0.3s ease forwards'
            }}>
              <div style={{ 
                width: '32px', height: '32px', borderRadius: '8px', 
                background: msg.role === 'assistant' ? 'var(--vibe-purple)' : 'hsl(var(--secondary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
              </div>
              <div style={{ flex: 1, fontSize: '16px', lineHeight: '1.7', color: 'white' }}>
                 <p>{msg.content}</p>
                 {msg.role === 'assistant' && i === messages.length - 1 && !isTyping && i > 0 && (
                   <button className="btn-primary" style={{ marginTop: '24px', display: 'flex', gap: '8px', alignItems: 'center' }} onClick={() => setWorkflowStep('planning')}>
                     플래닝 상세 보기 <ArrowRight size={16} />
                   </button>
                 )}
              </div>
            </div>
          ))}
          {isTyping && (
             <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', display: 'flex', gap: '24px' }}>
                <div style={{ width: '32px', height: '32px', background: 'var(--vibe-purple)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={18} />
                </div>
                <div style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', fontStyle: 'italic' }}>자료 분석 중...</div>
             </div>
          )}
        </div>

        {/* Input Bar */}
        <div style={{ padding: '24px 40px', background: 'linear-gradient(to top, hsl(var(--background)), transparent)' }}>
          <div style={{ 
            maxWidth: '800px', margin: '0 auto', background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))', 
            borderRadius: '16px', padding: '12px 20px', display: 'flex', gap: '16px', alignItems: 'center'
          }}>
            <Sparkles size={18} color="var(--vibe-purple)" />
            <input 
              className="saas-input" 
              style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: '15px', outline: 'none' }}
              placeholder={sources.length > 0 ? "자료를 바탕으로 궁금한 점을 묻거나 영상을 설계해보세요..." : "먼저 왼쪽에서 참고 자료를 추가하면 더 정확한 분석이 가능합니다."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="btn-primary" onClick={handleSend} style={{ padding: '8px' }}>
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
