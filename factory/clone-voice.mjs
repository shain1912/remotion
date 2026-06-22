// Re-clone a voice onto a chosen MiniMax key (account), so TTS can run on a key
// that still has balance. The cloned voice is NOT copyable between accounts — you
// must re-clone from the ORIGINAL voice sample audio.
//
// Usage:
//   node factory/clone-voice.mjs --key 2 --sample path/to/original_voice.mp3 --voice shainvoice02
//   (optional) --preview "안녕하세요, 테스트입니다."   # generates a charged preview to activate the voice
//
// Steps it performs on the chosen key's account:
//   1) upload the sample audio  (POST /v1/files/upload, purpose=voice_clone)  -> file_id
//   2) clone it to <voice>      (POST /v1/voice_clone)
// Then set in .env:  MINIMAX_TTS_KEY=<keyNum>   and in each project.json: voice.voiceId=<voice>
import fs from 'node:fs';
import path from 'node:path';

function loadEnv() {
  const t = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
  for (const line of t.split(/\r?\n/)) { const m = line.match(/^([A-Z0-9_]+)=(.*)$/); if (m && !(m[1] in process.env)) process.env[m[1]] = m[2]; }
}
loadEnv();
const HOST = process.env.MINIMAX_API_HOST || 'https://api.minimax.io';
const arg = (f, d) => { const i = process.argv.indexOf(f); return i > -1 ? process.argv[i + 1] : d; };

const keyNum = arg('--key', '2');
const sample = arg('--sample');
const voiceId = arg('--voice', 'shainvoice02');
const preview = arg('--preview');
const KEY = process.env[`MINIMAX_API_KEY${keyNum}`];
const mask = (s) => (s ? s.slice(0, 10) + '...' + s.slice(-4) : 'none');

if (!KEY) { console.error(`MINIMAX_API_KEY${keyNum} not set in .env`); process.exit(1); }
if (!sample || !fs.existsSync(sample)) { console.error(`--sample file not found: ${sample}`); process.exit(1); }
if (!/^[A-Za-z][A-Za-z0-9]{7,}$/.test(voiceId)) { console.error(`--voice "${voiceId}" invalid: must start with a letter, alphanumeric, >=8 chars`); process.exit(1); }

console.log(`[clone] key=KEY${keyNum} (${mask(KEY)}) sample=${sample} -> voiceId=${voiceId}`);

// 1) upload sample
const fd = new FormData();
fd.append('purpose', 'voice_clone');
fd.append('file', new Blob([fs.readFileSync(sample)]), path.basename(sample));
const up = await fetch(`${HOST}/v1/files/upload`, { method: 'POST', headers: { Authorization: `Bearer ${KEY}` }, body: fd });
const upJson = await up.json();
const fileId = upJson?.file?.file_id;
if (!fileId) { console.error('[clone] upload failed:', JSON.stringify(upJson?.base_resp || upJson)); process.exit(1); }
console.log(`[clone] uploaded -> file_id=${fileId}`);

// 2) clone
const body = { file_id: fileId, voice_id: voiceId };
if (preview) { body.text = preview; body.model = 'speech-2.6-hd'; }   // preview => charged generation
const cl = await fetch(`${HOST}/v1/voice_clone`, { method: 'POST', headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const clJson = await cl.json();
const rc = clJson?.base_resp?.status_code;
if (rc !== 0) { console.error('[clone] voice_clone failed:', JSON.stringify(clJson?.base_resp || clJson)); process.exit(1); }
console.log(`[clone] ✓ cloned voice "${voiceId}" on KEY${keyNum}`);
console.log('');
console.log('NEXT:');
console.log(`  1) .env 에 추가:   MINIMAX_TTS_KEY=${keyNum}`);
console.log(`  2) project.json voice.voiceId 를 "${voiceId}" 로 (일괄 치환)`);
console.log(`  3) node factory/probe.mjs 로 KEY${keyNum} 에 "${voiceId}" 보이는지 확인 후 렌더 재개`);
