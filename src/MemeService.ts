/**
 * MemeService.ts
 * Provides searchable, tagged animated memes (GIFs) from GIPHY and Tenor.
 * Integrates with GIPHY and Tenor APIs for a massive library.
 */

export interface MemeResult {
  url: string;
  caption: string;
  tags: string[];
  type: 'static' | 'animated';
}

import { staticFile } from 'remotion';

// 🔑 API Keys from Environment Variables
const GIPHY_API_KEY = process.env.REMOTION_GIPHY_API_KEY || 'dc6zaTOxFJmzC'; 
const TENOR_API_KEY = process.env.REMOTION_TENOR_API_KEY || '';

const MOCKED_MEMES: MemeResult[] = [
  {
    url: staticFile('meme_coding_choice.png'),
    caption: 'CHOOSE YOUR STYLE',
    tags: ['coding', 'choice', 'vibe'],
    type: 'static'
  },
  {
    url: staticFile('meme_coding_fail.png'),
    caption: 'BUT IT\'S COMPLICATED',
    tags: ['bug', 'fail', 'angry', 'prod'],
    type: 'static'
  },
  {
    url: staticFile('meme_success.png'),
    caption: 'SUCCESS! IT WORKS!',
    tags: ['success', 'kid'],
    type: 'static'
  },
  {
    url: staticFile('meme_fine.jpg'),
    caption: 'Everything is fine.',
    tags: ['stress', 'crisis', 'fine'],
    type: 'static'
  },
  {
    url: staticFile('meme_think.jpg'),
    caption: 'Think Smart',
    tags: ['brain', 'logic', 'thinking smart'],
    type: 'static'
  }
];

export const searchGifs = async (query: string, limit: number = 5): Promise<MemeResult[]> => {
  let results: MemeResult[] = [];

  // 1. Try GIPHY (Using public beta key if none provided)
  try {
    const giphyResp = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=${limit}&rating=g`
    );
    const giphyData = await giphyResp.json();
    if (giphyData.data) {
      results = results.concat(giphyData.data.map((g: any) => ({
        url: g.images.original.url,
        caption: g.title,
        tags: [query, 'giphy'],
        type: 'animated'
      })));
    }
  } catch (e) {
    console.error("GIPHY API Error:", e);
  }

  // 2. Try Tenor (If key provided)
  if (TENOR_API_KEY) {
    try {
      const tenorResp = await fetch(
        `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${TENOR_API_KEY}&limit=${limit}`
      );
      const tenorData = await tenorResp.json();
      if (tenorData.results) {
        results = results.concat(tenorData.results.map((t: any) => ({
          url: t.media_formats.gif.url,
          caption: t.content_description,
          tags: [query, 'tenor'],
          type: 'animated'
        })));
      }
    } catch (e) {
      console.error("Tenor API Error:", e);
    }
  }

  return results;
};

/**
 * Combined search that prefers animated GIFs but falls back to static memes
 */
export const searchAllMemes = async (query: string): Promise<MemeResult[]> => {
  const animated = await searchGifs(query);
  if (animated.length > 0) return animated;

  // Search in MOCKED_MEMES if API fails or returns no results
  const lowerQuery = query.toLowerCase();
  const matches = MOCKED_MEMES.filter(meme => 
    meme.tags.some(tag => tag.includes(lowerQuery)) || 
    meme.caption.toLowerCase().includes(lowerQuery)
  );

  return matches.length > 0 ? matches : [MOCKED_MEMES[0]]; 
};

/**
 * Returns a guaranteed meme for a given tag, prioritizing local stable assets.
 */
export const getMemeByTagSync = (tag: string): MemeResult => {
  const matches = MOCKED_MEMES.filter(m => m.tags.includes(tag) || m.caption.toLowerCase().includes(tag));
  return matches.length > 0 ? matches[0] : MOCKED_MEMES[0];
};
