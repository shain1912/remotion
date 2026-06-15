// Factory Studio backend — project CRUD + build/render with live (SSE) progress + preview.
//   node factory/server.mjs   (port 3030)
import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const ROOT = process.cwd();
const PROJ = path.join(ROOT, 'factory', 'projects');
const OUT = path.join(ROOT, 'out');
const app = express();
app.use(cors());
app.use(express.json({ limit: '4mb' }));

const stripAnsi = (s) => s.replace(/\x1b\[[0-9;]*m/g, '').replace(/\r/g, '');

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// list projects
app.get('/api/projects', (_req, res) => {
  if (!fs.existsSync(PROJ)) return res.json([]);
  const ids = fs.readdirSync(PROJ).filter((d) => fs.existsSync(path.join(PROJ, d, 'project.json')));
  res.json(ids.map((id) => {
    const p = JSON.parse(fs.readFileSync(path.join(PROJ, id, 'project.json'), 'utf8'));
    const built = fs.existsSync(path.join(ROOT, 'public', 'factory', id, 'build.json'));
    const rendered = fs.existsSync(path.join(OUT, `${id}.mp4`));
    return { id, title: p.title, template: p.template || 'montage', scenes: p.scenes?.length || 0, built, rendered };
  }));
});

app.get('/api/projects/:id', (req, res) => {
  const f = path.join(PROJ, req.params.id, 'project.json');
  if (!fs.existsSync(f)) return res.status(404).json({ error: 'not found' });
  res.json(JSON.parse(fs.readFileSync(f, 'utf8')));
});

// create / update
app.put('/api/projects/:id', (req, res) => {
  const id = req.params.id.replace(/[^a-z0-9-_]/gi, '');
  if (!id) return res.status(400).json({ error: 'bad id' });
  const dir = path.join(PROJ, id);
  fs.mkdirSync(dir, { recursive: true });
  const project = { ...req.body, id };
  fs.writeFileSync(path.join(dir, 'project.json'), JSON.stringify(project, null, 2));
  res.json({ ok: true, id });
});

// run a factory script with SSE streaming (GET so EventSource works)
function stream(res, args) {
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
  res.flushHeaders?.();
  const child = spawn('node', args, { cwd: ROOT });
  const send = (ev, data) => res.write(`event: ${ev}\ndata: ${JSON.stringify(data)}\n\n`);
  send('start', { args });
  const onData = (buf) => stripAnsi(buf.toString()).split('\n').forEach((l) => { if (l.trim()) send('log', l); });
  child.stdout.on('data', onData);
  child.stderr.on('data', onData);
  child.on('close', (code) => { send('done', { code }); res.end(); });
  res.on('close', () => child.kill());
}

app.get('/api/build/:id', (req, res) => {
  const args = ['factory/build.mjs', req.params.id];
  if (req.query.limit) args.push('--limit', String(req.query.limit));
  if (req.query.novideo === '1') args.push('--no-video');
  stream(res, args);
});

app.get('/api/render/:id', (req, res) => {
  const args = ['factory/render.mjs', req.params.id];
  if (req.query.only) args.push('--only', String(req.query.only));
  if (req.query.force === '1') args.push('--force');
  stream(res, args);
});

// serve rendered videos + public assets for preview
app.use('/out', express.static(OUT));
app.use('/pub', express.static(path.join(ROOT, 'public')));

const PORT = 3030;
app.listen(PORT, () => console.log(`Factory Studio API → http://localhost:${PORT}`));
