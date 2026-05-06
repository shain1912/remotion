import { staticFile } from 'remotion';

export interface MemeEntry {
  id: string;
  name: string;
  url: string;
  category: 'Western' | 'Korean' | 'Global';
  caption: string;
}

export const memeGallery: MemeEntry[] = [
  // --- Global / Multi-culture Memes ---
  {
    id: 'g1',
    name: 'This is Fine',
    url: staticFile('meme_fine.jpg'),
    category: 'Global',
    caption: 'Everything is fine. (Me during server outage)'
  },
  {
    id: 'g2',
    name: 'Spiderman Pointing',
    url: staticFile('meme_spiderman.jpg'),
    category: 'Global',
    caption: 'My bug meeting your bug in production'
  },
  {
    id: 'g3',
    name: 'Success Kid',
    url: staticFile('meme_success.jpg'),
    category: 'Global',
    caption: 'IT COMPILED ON THE FIRST TRY!'
  },

  // --- Western Tech Memes ---
  {
    id: 'w1',
    name: 'Drake Hotline Bling',
    url: staticFile('meme_drake.jpg'),
    category: 'Western',
    caption: 'Manual Coding (NO), Vibe Coding (YES)'
  },
  {
    id: 'w2',
    name: 'Distracted Boyfriend',
    url: staticFile('meme_distracted.jpg'),
    category: 'Western',
    caption: 'Ignoring clean architecture for AI prompts'
  },
  {
    id: 'w3',
    name: 'Thinking Smart',
    url: staticFile('meme_think.jpg'),
    category: 'Western',
    caption: 'No bugs if you delete the feature'
  },
  {
    id: 'w4',
    name: 'Change My Mind',
    url: staticFile('meme_change_mind.jpg'),
    category: 'Western',
    caption: 'AI is just spicy autocomplete. Change my mind.'
  },
  {
    id: 'w5',
    name: 'Expanding Brain',
    url: staticFile('meme_brain.jpg'),
    category: 'Western',
    caption: 'Copying from SO -> Using Copilot -> Vibe Coding'
  },
  {
    id: 'w6',
    name: 'Clown Outfit',
    url: staticFile('meme_clown.jpg'),
    category: 'Western',
    caption: '"I don\'t need tests" -> Production is down'
  },
  {
    id: 'w7',
    name: 'Office Comparison',
    url: staticFile('meme_office.jpg'),
    category: 'Western',
    caption: 'AI code vs My senior code: They are the same picture'
  },

  // --- Korean Tech Memes ---
  {
    id: 'k1',
    name: 'Angry Developer',
    url: staticFile('meme_angry_dev.jpg'), 
    category: 'Korean',
    caption: '어이없네... 이게 진짜로 되네?'
  },
  {
    id: 'k2',
    name: 'Fried Chicken Shop',
    url: staticFile('meme_chicken.jpg'),
    category: 'Korean',
    caption: '개발자의 마지막 종착역... 치킨집 엔딩'
  },
  {
    id: 'k3',
    name: 'SI Spicy',
    url: staticFile('meme_griffith.jpg'), // Using a replacement for generic dramatic image
    category: 'Korean',
    caption: 'SI의 매운맛... AI는 해결해주지 않는다'
  },
  {
    id: 'k4',
    name: 'Logic Meme',
    url: staticFile('meme_button.jpg'),
    category: 'Korean',
    caption: '건드리지 마라... 어떻게 돌아가는지 나도 모른다'
  },
  {
    id: 'k5',
    name: 'Wait, what?',
    url: staticFile('meme_think.jpg'),
    category: 'Korean',
    caption: '수정했는데 왜 안 바뀌어? (Cache: ㅋ)'
  }
];
