import puppeteer from 'puppeteer';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, dirname, basename, extname, join } from 'node:path';
import { mkdirSync, existsSync } from 'node:fs';

const inputs = process.argv.slice(2);
if (inputs.length === 0) {
  console.error('Usage: node scripts/capture.mjs <slide.html> [more.html ...]');
  process.exit(1);
}

const PROJECT_ROOT = resolve('.');
const PORT = parseInt(process.env.CAPTURE_PORT || '0', 10); // 0 = auto-pick free port

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.jsx':  'text/babel; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.ttf':  'font/ttf',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
};

const server = createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    const filePath = join(PROJECT_ROOT, urlPath);
    if (!filePath.startsWith(PROJECT_ROOT)) { res.statusCode = 403; return res.end(); }
    const s = await stat(filePath);
    if (s.isDirectory()) { res.statusCode = 403; return res.end(); }
    const data = await readFile(filePath);
    res.setHeader('Content-Type', MIME[extname(filePath).toLowerCase()] || 'application/octet-stream');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(data);
  } catch (e) {
    res.statusCode = 404; res.end(String(e.message));
  }
});
await new Promise((r) => server.listen(PORT, '127.0.0.1', r));
const actualPort = server.address().port;

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

page.on('pageerror', (e) => console.error('  pageerror:', e.message));
page.on('console', (m) => {
  if (m.type() === 'error') console.error('  console.error:', m.text());
});

for (const rel of inputs) {
  const abs = resolve(rel);
  const previewDir = resolve(dirname(abs), 'preview');
  if (!existsSync(previewDir)) mkdirSync(previewDir, { recursive: true });
  const out = resolve(previewDir, basename(abs).replace(/\.html$/, '.png'));

  const url = `http://127.0.0.1:${actualPort}/${abs.slice(PROJECT_ROOT.length + 1).replace(/\\/g, '/')}`;
  console.log('->', url);
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForFunction(() => {
    const s = document.getElementById('stage');
    return s && s.children.length > 0;
  }, { timeout: 30000 });
  await page.evaluate(async () => { await document.fonts.ready; });
  await new Promise((r) => setTimeout(r, 1500));

  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
  console.log('   saved:', out);
}

await browser.close();
server.close();
