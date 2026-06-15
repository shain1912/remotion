// Launch the Factory Studio: backend API (3030) + Vite dev server (5173) together.
//   npm run studio
import { spawn } from 'node:child_process';
import path from 'node:path';

const opts = { stdio: 'inherit', cwd: process.cwd() };
const api = spawn(process.execPath, ['factory/server.mjs'], opts);
const web = spawn(process.execPath, [path.resolve('node_modules/vite/bin/vite.js')], opts);

const kill = () => { try { api.kill(); } catch {} try { web.kill(); } catch {} process.exit(0); };
process.on('SIGINT', kill);
process.on('SIGTERM', kill);
api.on('close', kill);
web.on('close', kill);
