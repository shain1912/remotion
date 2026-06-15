// Generate a high-CTR thumbnail: MiniMax bg (no text) + bold Korean overlay via Remotion still.
//   node factory/thumbnail.mjs <projectId>
// Reads optional `thumbnail` block from factory/projects/<id>/project.json:
//   "thumbnail": { "bgPrompt": "...", "lines": [{"text":"깃 명령어"},{"text":"외우지 마세요","accent":true}], "align": "left" }
import fs from 'node:fs';
import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { selectComposition, renderStill } from '@remotion/renderer';
import { generateImage } from './lib/minimax.mjs';

const projectId = process.argv[2] || 'demo-git';
const project = JSON.parse(fs.readFileSync(path.join('factory', 'projects', projectId, 'project.json'), 'utf8'));
const t = project.thumbnail || {
  bgPrompt: 'extreme close-up of a frustrated developer face lit by red error-code reflections, intense, dramatic rim light',
  lines: [{ text: project.title?.split('|')[0]?.trim() || '제목' }],
  align: 'left',
};

const pub = path.join('public', 'factory', projectId);
fs.mkdirSync(pub, { recursive: true });
const bgRel = `factory/${projectId}/thumb_bg.jpg`;
const bgAbs = path.join('public', bgRel);

if (!fs.existsSync(bgAbs)) {
  console.log('[thumb] generating background…');
  const buf = await generateImage({ prompt: `${t.bgPrompt}, ${project.style.imageSuffix}`, aspectRatio: '16:9' });
  fs.writeFileSync(bgAbs, buf);
  console.log(`[thumb] bg ${(buf.length / 1024 | 0)}KB -> ${bgRel}`);
} else {
  console.log('[thumb] bg cached');
}

const inputProps = { bg: bgRel, lines: t.lines, accent: project.style.accent || '#22d3a6', align: t.align || 'left' };
const out = path.resolve(`out/${projectId}-thumb.png`);
fs.mkdirSync(path.dirname(out), { recursive: true });

const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public') });
const composition = await selectComposition({ serveUrl, id: 'FactoryThumbnail', inputProps });
await renderStill({ composition, serveUrl, output: out, inputProps });
console.log(`[thumb] done -> ${out}`);
