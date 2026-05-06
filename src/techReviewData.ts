export type SceneType = 
  | 'title'      
  | 'split'      
  | 'terminal'   
  | 'meme'       
  | 'stats'      
  | 'tips'       
  | 'outro';     

export interface DetailedScene {
  id: number;
  type: SceneType;
  title: string;
  subtitle: string;
  data: any; // Dynamic data per scene type
}

export const techScenes: DetailedScene[] = [
  {
    id: 1,
    type: 'title',
    title: 'THE VIBE CODING REVOLUTION',
    subtitle: '기술 리뷰어들이 말하지 않는 바이브 코딩의 20가지 진실을 파헤쳐봅니다.',
    data: { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
  },
  {
    id: 2,
    type: 'split',
    title: 'TRADITIONAL vs AI',
    subtitle: '직접 타이핑하는 시대는 끝났을까요? 생산성 격차를 확인해보세요.',
    data: { left: 'Manual', right: 'Prompt', leftIcon: '⌨️', rightIcon: '🤖' }
  },
  {
    id: 3,
    type: 'terminal',
    title: 'PROMPT IN ACTION',
    subtitle: '프롬프트 한 줄에 수십 줄의 코드가 실시간으로 생성되는 마술.',
    data: { prompt: 'Make a responsive React navbar with dark mode support', code: 'export const Navbar = () => { ... }' }
  },
  {
    id: 4,
    type: 'meme',
    title: 'THE FIRST RUN SUCCESS',
    subtitle: '한 번에 성공했을 때의 그 느낌, 다들 아시죠?',
    data: { query: 'success kid', asset: 'meme_success.png' }
  },
  {
    id: 5,
    type: 'stats',
    title: 'PRODUTIVITY GAINS',
    subtitle: '실제로 투입 시간 대비 생산성이 300% 이상 향상되었습니다.',
    data: { label: 'Efficiency', value: '380%', color: '#00ff88' }
  },
  {
    id: 6,
    type: 'split',
    title: 'DEBUGGING FLOW',
    subtitle: '버그 수정도 이제는 AI에게 에러 로그만 던져주면 해결됩니다.',
    data: { left: 'StackOverflow', right: 'AI Debugger', leftIcon: '🔍', rightIcon: '✨' }
  },
  {
    id: 7,
    type: 'terminal',
    title: 'COMPLEX REFACTORING',
    subtitle: '지저분한 레거시 코드를 단숨에 클린 코드로 변환합니다.',
    data: { prompt: 'Refactor this messy callback to async/await', code: 'async function getData() { ... }' }
  },
  {
    id: 8,
    type: 'meme',
    title: 'BUT IT WORKS!',
    subtitle: '왜 돌아가는지 모르겠지만 어쨌든 돌아갑니다.',
    data: { query: 'thinking smart', asset: 'meme_think.jpg' }
  },
  {
    id: 9,
    type: 'stats',
    title: 'LEARNING CURVE',
    subtitle: '새로운 기술 스택을 배우는 속도가 5배 이상 빨라졌습니다.',
    data: { label: 'Learning Speed', value: '5.2x', color: '#00d2ff' }
  },
  {
    id: 10,
    type: 'tips',
    title: 'PROMPT ENGINEERING 101',
    subtitle: '좋은 결과를 얻기 위해서는 명확한 맥락 제공이 필수입니다.',
    data: { steps: ['Clear Goal', 'Context Provided', 'Iteration'] }
  },
  {
    id: 11,
    type: 'split',
    title: 'DESIGN TO CODE',
    subtitle: '디자인 파일이나 스크린샷만으로도 초안 코드가 생성됩니다.',
    data: { left: 'Figma', right: 'React Code', leftIcon: '🎨', rightIcon: '⚛️' }
  },
  {
    id: 12,
    type: 'meme',
    title: 'PRODUCTION DISASTER',
    subtitle: '하지만 검증 없는 배포는 대재앙을 부를 수 있습니다.',
    data: { query: 'angry dev', asset: 'meme_coding_fail.png' }
  },
  {
    id: 13,
    type: 'stats',
    title: 'ERROR REDUCTION',
    subtitle: '단순 오타나 사소한 문법 에러가 획기적으로 줄어들었습니다.',
    data: { label: 'Bug Rate', value: '-85%', color: '#ff0055' }
  },
  {
    id: 14,
    type: 'terminal',
    title: 'TEST CASE GENERATION',
    subtitle: '가장 귀찮은 단위 테스트 작성도 AI가 알아서 척척.',
    data: { prompt: 'Generate Jest tests for this auth hook', code: 'test("should login", () => { ... })' }
  },
  {
    id: 15,
    type: 'tips',
    title: 'SAFE ADOPTION STRATEGY',
    subtitle: '실무에 적용할 때는 작은 모듈부터 천천히 확장하세요.',
    data: { steps: ['Small Components', 'Utility Logic', 'Full Page'] }
  },
  {
    id: 16,
    type: 'meme',
    title: 'THE AI COLLABORATOR',
    subtitle: '이제 AI는 도구가 아니라 페어 프로그래밍 파트너입니다.',
    data: { query: 'spiderman', asset: 'meme_spiderman.jpg' }
  },
  {
    id: 17,
    type: 'stats',
    title: 'JOB MARKET IMPACT',
    subtitle: '단순 코딩 실력보다 AI를 다루는 능력이 더 중요해지는 시대.',
    data: { label: 'AI Skill Demand', value: '92%', color: '#9d50bb' }
  },
  {
    id: 18,
    type: 'split',
    title: 'FUTURE OF DEV',
    subtitle: '2025년, 우리는 더 창의적인 일에 집중하게 될 것입니다.',
    data: { left: 'Syntax', right: 'Architecture', leftIcon: '📝', rightIcon: '🏗️' }
  },
  {
    id: 19,
    type: 'tips',
    title: 'STAY UPDATED',
    subtitle: '매일 쏟아지는 새로운 AI 모델과 도구들을 놓치지 마세요.',
    data: { steps: ['Read Docs', 'Try New Tools', 'Join Community'] }
  },
  {
    id: 20,
    type: 'outro',
    title: 'JOIN THE REVOLUTION',
    subtitle: '바이브 코딩, 여러분도 지금 바로 시작해보세요! 구독은 필수!',
    data: { next: 'Subscribe for more Tech Updates' }
  }
];
