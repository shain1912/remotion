// 이미 생성된 음성 mp3를 음량 정규화(loudnorm)한다 — 사이드카 normalized 플래그 없는 것만(멱등).
//   node factory/normalize-audio.mjs <id>        # 한 클립
//   node factory/normalize-audio.mjs --all       # public/factory 전체
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';

const arg = process.argv[2];
if (!arg) { console.error('usage: node factory/normalize-audio.mjs <id>|--all'); process.exit(1); }
const root = path.resolve('public/factory');
const ids = arg === '--all'
  ? fs.readdirSync(root).filter((d) => fs.existsSync(path.join(root, d, 'audio')))
  : [arg];

let normd = 0, skip = 0;
for (const id of ids) {
  const dir = path.join(root, id, 'audio');
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.mp3'))) {
    const mp3 = path.join(dir, f), metaP = path.join(dir, f.replace(/\.mp3$/, '.json'));
    let meta = {}; try { meta = JSON.parse(fs.readFileSync(metaP, 'utf8')); } catch {}
    if (meta.normalized) { skip++; continue; }
    const tmp = path.join(os.tmpdir(), `norm_${id}_${f}`);
    const r = spawnSync(ffmpegPath, ['-y', '-i', mp3, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', tmp], { stdio: 'pipe' });
    if (r.status !== 0) { console.log(`  ${id}/${f} ✗ ffmpeg`); try { fs.unlinkSync(tmp); } catch {}; continue; }
    fs.copyFileSync(tmp, mp3); try { fs.unlinkSync(tmp); } catch {}
    meta.normalized = true; fs.writeFileSync(metaP, JSON.stringify(meta));
    normd++;
  }
}
console.log(`[normalize] 정규화 ${normd} · 이미됨 ${skip}`);
