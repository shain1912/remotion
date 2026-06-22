// Headless Remotion render with SECTION support (for long, editable videos).
//
//   node factory/render.mjs <id>                 # render all sections, concat -> out/<id>.mp4
//   node factory/render.mjs <id> --only intro    # re-render ONE section, then re-concat (fast edit)
//   node factory/render.mjs <id> --force         # re-render every section
//   node factory/render.mjs <id> out/x.mp4       # custom final output path
//
// Sections come from scene.section tags in project.json (contiguous runs). No tags = one
// section = whole video rendered straight to the output (no concat). Each section is rendered
// to out/<id>/sections/<sec>.mp4 so editing one ~2-min section never re-renders the other 28.
import path from 'node:path';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { bundle } from '@remotion/bundler';
import { selectComposition, renderMedia } from '@remotion/renderer';
import ffmpegPath from 'ffmpeg-static';

const projectId = process.argv[2] || 'demo-git';
const rest = process.argv.slice(3);
const onlyArg = (() => { const i = rest.indexOf('--only'); return i > -1 ? rest[i + 1].split(',') : null; })();
const FORCE = rest.includes('--force');
const outArg = rest.find((a) => a.endsWith('.mp4'));
const outFile = path.resolve(outArg || `out/${projectId}.mp4`);
fs.mkdirSync(path.dirname(outFile), { recursive: true });

const COMP_BY_TEMPLATE = { montage: 'FactoryVideo', slides: 'SlideVideo', theory: 'TheoryVideo', gitgraph: 'GitGraphVideo', terminal: 'TerminalVideo' };
const project = JSON.parse(fs.readFileSync(path.resolve(`factory/projects/${projectId}/project.json`), 'utf8'));
const template = project.template || 'montage';
const compId = COMP_BY_TEMPLATE[template];
const manifest = JSON.parse(fs.readFileSync(path.resolve(`public/factory/${projectId}/build.json`), 'utf8'));

// group scenes into contiguous sections by scene.section tag
const sections = [];
let cursor = 0;
for (const sc of manifest.scenes) {
  const secId = sc.section || 'full';
  let sec = sections[sections.length - 1];
  if (!sec || sec.id !== secId) { sec = { id: secId, start: cursor, end: cursor, count: 0 }; sections.push(sec); }
  sec.end = cursor + sc.durationFrames - 1;
  sec.count++;
  cursor += sc.durationFrames;
}
const multi = sections.length > 1;
const inputProps = { projectId };

console.log(`[render] ${projectId} template=${template} comp=${compId} sections=${sections.length}`);
console.log(`[render] bundling…`);
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public') });
const composition = await selectComposition({ serveUrl, id: compId, inputProps });
console.log(`[render] ${composition.width}x${composition.height} ${composition.durationInFrames}f @ ${composition.fps}fps`);

async function renderRange(out, frameRange) {
  let last = -1;
  // concurrency = parallel Chromium tabs rendering frames. Default 8 of 16 cores (env-overridable).
  // gl:'angle' routes browser GL through the GPU (RTX 3080 via D3D11) instead of software swiftshader.
  const concurrency = Number(process.env.RENDER_CONCURRENCY) || 8;
  await renderMedia({
    composition, serveUrl, codec: 'h264', outputLocation: out, inputProps, frameRange, concurrency,
    chromiumOptions: { gl: 'angle' },          // browser/WebGL rendering on the GPU (RTX 3080 via D3D11)
    hardwareAcceleration: 'if-possible',        // H.264 ENCODE on the GPU (NVENC) when available, else CPU fallback
    onProgress: ({ progress }) => { const p = Math.round(progress * 100); if (p !== last && p % 10 === 0) { process.stdout.write(`\r   ${path.basename(out)} ${p}%   `); last = p; } },
  });
  process.stdout.write('\n');
}

if (!multi) {
  console.log(`[render] single section -> ${outFile}`);
  await renderRange(outFile, [0, composition.durationInFrames - 1]);
} else {
  const secDir = path.resolve(`out/${projectId}/sections`);
  fs.mkdirSync(secDir, { recursive: true });
  for (const sec of sections) {
    const out = path.join(secDir, `${sec.id}.mp4`);
    const shouldRender = FORCE || (onlyArg ? onlyArg.includes(sec.id) : !fs.existsSync(out));
    if (!shouldRender) { console.log(`[section] ${sec.id} kept (${sec.count} scenes, frames ${sec.start}-${sec.end})`); continue; }
    console.log(`[section] ${sec.id} rendering (${sec.count} scenes, frames ${sec.start}-${sec.end})`);
    await renderRange(out, [sec.start, sec.end]);
  }
  // concat (stream copy — all sections share codec params)
  const list = path.join(secDir, 'concat.txt');
  fs.writeFileSync(list, sections.map((s) => `file '${path.join(secDir, s.id + '.mp4').replace(/\\/g, '/')}'`).join('\n'));
  console.log(`[render] concatenating ${sections.length} sections -> ${outFile}`);
  const r = spawnSync(ffmpegPath, ['-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', outFile], { stdio: 'pipe' });
  if (r.status !== 0) { console.error('[render] ffmpeg concat failed:', r.stderr?.toString().slice(-600)); process.exit(1); }
}
console.log(`[render] done -> ${outFile} (${(fs.statSync(outFile).size / 1e6).toFixed(1)} MB)`);
