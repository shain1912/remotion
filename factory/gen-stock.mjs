// Fetch free stock video clips (Pexels/Pixabay) for specific montage scenes and save them
// to public/factory/<id>/clip/<sceneId>.mp4 (1920x1080, normalized) so build.mjs uses them
// as cached clips (no MiniMax). Records attribution in credits.json.
//   node factory/gen-stock.mjs <id> s01="cozy desk window" s05="typing laptop" ...
import fs from 'node:fs';
import path from 'node:path';
import { fetchStockClip, stockConfig } from './lib/stock.mjs';

const id = process.argv[2];
const pairs = process.argv.slice(3).map((a) => { const i = a.indexOf('='); return [a.slice(0, i), a.slice(i + 1)]; });
if (!id || !pairs.length) { console.error('usage: node factory/gen-stock.mjs <id> sNN="query" ...'); process.exit(1); }
if (!stockConfig.hasPexels && !stockConfig.hasPixabay) { console.error('no PEXELS_API_KEY / PIXABAY_API_KEY in .env'); process.exit(1); }

const pub = path.resolve('public/factory', id);
fs.mkdirSync(path.join(pub, 'clip'), { recursive: true });
const credits = [];
for (const [sid, query] of pairs) {
  const mp4 = path.join(pub, 'clip', `${sid}.mp4`);
  try {
    console.log(`  ${sid} "${query}" ...`);
    const { buf, meta } = await fetchStockClip(query, { maxSec: 12 });
    fs.writeFileSync(mp4, buf);
    credits.push({ scene: sid, query, ...meta });
    console.log(`  ${sid} ✓ ${(buf.length / 1024 / 1024).toFixed(1)}MB  [${meta.src} / ${meta.author}]`);
  } catch (e) { console.log(`  ${sid} ✗ ${e.message}`); }
}
const cf = path.join(pub, 'credits.json');
let prev = []; try { prev = JSON.parse(fs.readFileSync(cf, 'utf8')); } catch {}
fs.writeFileSync(cf, JSON.stringify([...prev.filter((p) => !pairs.find(([s]) => s === p.scene)), ...credits], null, 2));
console.log(`credits -> ${cf} (${credits.length} clips)`);
