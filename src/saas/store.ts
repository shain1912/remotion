import { create } from 'zustand';
import { DetailedScene, techScenes } from '../techReviewData';

export type WorkflowStep = 'chat' | 'planning' | 'editor';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Source {
  id: string;
  title: string;
  type: 'file' | 'link' | 'text';
}

interface VideoState {
  scenes: DetailedScene[];
  currentSceneId: number | null;
  isPlaying: boolean;
  workflowStep: WorkflowStep;
  messages: Message[];
  sources: Source[];
  setScenes: (scenes: DetailedScene[]) => void;
  updateScene: (id: number, updates: Partial<DetailedScene>) => void;
  setCurrentSceneId: (id: number | null) => void;
  togglePlay: () => void;
  setWorkflowStep: (step: WorkflowStep) => void;
  addMessage: (msg: Message) => void;
  addSource: (source: Source) => void;
}

export const useVideoStore = create<VideoState>((set) => ({
  scenes: techScenes,
  currentSceneId: 1,
  isPlaying: false,
  workflowStep: 'chat',
  messages: [
    { role: 'assistant', content: '안녕하세요! 어떤 테크 리뷰 영상을 만들고 싶으신가요? 왼쪽 패널에 참고 자료(RAG)를 추가하면 더 정확한 영상을 만들 수 있습니다.' }
  ],
  sources: [
    { id: '1', title: '제품 사양서.pdf', type: 'file' },
    { id: '2', title: '기술 블로그 링크', type: 'link' }
  ],
  setScenes: (scenes) => set({ scenes }),
  updateScene: (id, updates) => set((state) => ({
    scenes: state.scenes.map((s) => s.id === id ? { ...s, ...updates } : s)
  })),
  setCurrentSceneId: (id) => set({ currentSceneId: id }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setWorkflowStep: (step) => set({ workflowStep: step }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  addSource: (source) => set((state) => ({ sources: [...state.sources, source] })),
}));
