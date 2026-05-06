// Build module-level + global index.html files showing all slide previews.
// Usage: node scripts/build-index.mjs

import { readdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve('.');

const MODULE_INFO = {
  m1: { label: 'AI/LLM CORE',           range: '001–010', color: '#CCFB55' },
  m2: { label: 'PROMPT ENGINEERING',    range: '011–025', color: '#CCFB55' },
  m3: { label: 'CONTEXT ENGINEERING',   range: '026–035', color: '#CCFB55' },
  m4: { label: 'HARNESS · SKILLS · MCP',range: '036–045', color: '#CCFB55' },
  m5: { label: 'RESEARCH AUTOMATION',   range: '046–070', color: '#B49CFF' },
  m6: { label: 'PROPOSAL',              range: '071–095', color: '#B49CFF' },
  m7: { label: 'PRESENTATION',          range: '096–120', color: '#B49CFF' },
};

function listSlides(modDir) {
  const dir = resolve(ROOT, 'slides', modDir);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => /^slide-\d{3}\.html$/.test(f))
    .sort();
}

function moduleIndex(modKey) {
  const info = MODULE_INFO[modKey];
  const slides = listSlides(modKey);
  const cards = slides.map((html) => {
    const num = html.match(/slide-(\d{3})\.html/)[1];
    const png = `preview/slide-${num}.png`;
    return `
      <a class="card" href="${html}" target="_blank">
        <div class="thumb"><img src="${png}" alt="slide ${num}" loading="lazy"/></div>
        <div class="meta"><span class="num">${num}</span></div>
      </a>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="ko"><head>
<meta charset="UTF-8"/>
<title>${modKey.toUpperCase()} · ${info.label}</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet"/>
<link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet"/>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; background: #E6E7EB; color: #0A0A0A; font-family: 'Pretendard', system-ui, sans-serif; }
  header { padding: 48px 64px 24px; border-bottom: 1px solid #0A0A0A; display: flex; align-items: baseline; justify-content: space-between; }
  h1 { font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 64px; margin: 0; letter-spacing: -0.03em; }
  .eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 14px; letter-spacing: 0.2em; text-transform: uppercase; color: #3A3D44; margin-bottom: 12px; }
  .meta-top { display: flex; gap: 24px; font-family: 'JetBrains Mono', monospace; font-size: 13px; letter-spacing: 0.16em; text-transform: uppercase; color: #3A3D44; }
  main { padding: 32px 64px 64px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 24px; }
  .card { display: block; text-decoration: none; color: inherit; background: #FFFFFF; border: 1px solid #D1D3D8; border-radius: 16px; overflow: hidden; transition: transform .15s ease, border-color .15s ease; }
  .card:hover { transform: translateY(-2px); border-color: ${info.color}; }
  .thumb { aspect-ratio: 16/9; background: #E6E7EB; }
  .thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .meta { padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; }
  .num { font-family: 'JetBrains Mono', monospace; font-size: 14px; letter-spacing: 0.16em; }
  .swatch { width: 14px; height: 14px; border-radius: 999px; background: ${info.color}; }
  nav { padding: 14px 64px; background: #0A0A0A; color: #FFF; font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; }
  nav a { color: ${info.color}; text-decoration: none; margin-right: 18px; }
</style>
</head><body>
<nav><a href="../index.html">← all modules</a> · ${modKey.toUpperCase()} · ${info.label} · ${slides.length} / ${info.range}</nav>
<header>
  <div>
    <div class="eyebrow">${modKey.toUpperCase()} · ${info.label}</div>
    <h1>${info.label}</h1>
  </div>
  <div class="meta-top"><span>${slides.length} slides</span><span>${info.range}</span></div>
</header>
<main><div class="grid">${cards}</div></main>
</body></html>`;
  writeFileSync(resolve(ROOT, 'slides', modKey, 'index.html'), html);
  return slides.length;
}

function globalIndex(perModuleCounts) {
  const total = Object.values(perModuleCounts).reduce((a, b) => a + b, 0);
  const cards = Object.entries(MODULE_INFO).map(([key, info]) => {
    const count = perModuleCounts[key] || 0;
    const sample = listSlides(key)[0];
    const sampleNum = sample ? sample.match(/slide-(\d{3})\.html/)[1] : null;
    const sampleImg = sampleNum ? `${key}/preview/slide-${sampleNum}.png` : '';
    return `
      <a class="mod-card" href="${key}/index.html">
        <div class="mod-thumb">${sampleImg ? `<img src="${sampleImg}" alt="${key}" loading="lazy"/>` : ''}</div>
        <div class="mod-meta">
          <div class="mod-key">${key.toUpperCase()}</div>
          <div class="mod-label">${info.label}</div>
          <div class="mod-count">${count} / ${info.range}</div>
        </div>
      </a>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="ko"><head>
<meta charset="UTF-8"/>
<title>Gemini × Antigravity · 자체교재 ${total}/120</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet"/>
<link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet"/>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; background: #E6E7EB; color: #0A0A0A; font-family: 'Pretendard', system-ui, sans-serif; }
  header { padding: 64px; border-bottom: 1px solid #0A0A0A; }
  h1 { font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 96px; margin: 0; letter-spacing: -0.04em; line-height: 1; }
  .eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 14px; letter-spacing: 0.2em; text-transform: uppercase; color: #3A3D44; margin-bottom: 16px; }
  .progress { font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 32px; margin-top: 24px; }
  .lime { background: #CCFB55; padding: 0 12px; border-radius: 6px; }
  main { padding: 48px 64px 80px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 24px; }
  .mod-card { display: block; text-decoration: none; color: inherit; background: #FFFFFF; border: 1px solid #D1D3D8; border-radius: 20px; overflow: hidden; transition: transform .15s ease, border-color .15s ease; }
  .mod-card:hover { transform: translateY(-3px); border-color: #CCFB55; }
  .mod-thumb { aspect-ratio: 16/9; background: #E6E7EB; }
  .mod-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .mod-meta { padding: 24px 28px; }
  .mod-key { font-family: 'JetBrains Mono', monospace; font-size: 14px; letter-spacing: 0.2em; color: #3A3D44; }
  .mod-label { font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 36px; margin-top: 6px; letter-spacing: -0.02em; }
  .mod-count { margin-top: 12px; font-family: 'JetBrains Mono', monospace; font-size: 13px; letter-spacing: 0.16em; color: #6B707A; }
</style>
</head><body>
<header>
  <div class="eyebrow">2026 · CODE KOREA · 자체교재</div>
  <h1>Gemini × Antigravity</h1>
  <div class="progress"><span class="lime">${total}</span> / 120 slides built</div>
</header>
<main><div class="grid">${cards}</div></main>
</body></html>`;
  writeFileSync(resolve(ROOT, 'slides', 'index.html'), html);
}

const counts = {};
for (const key of Object.keys(MODULE_INFO)) {
  counts[key] = moduleIndex(key);
  console.log(`  ${key}: ${counts[key]} slides`);
}
globalIndex(counts);
console.log('\nIndex pages built:');
console.log('  slides/index.html   (global)');
for (const key of Object.keys(MODULE_INFO)) {
  console.log(`  slides/${key}/index.html`);
}
console.log(`\nTotal: ${Object.values(counts).reduce((a, b) => a + b, 0)} / 120`);
