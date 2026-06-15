// Probe MiniMax: detect host/region, list voices on each key (find user's cloned voice).
// Read-only queries (get_voice is free). Keys are masked in all output.
import fs from 'node:fs';
import path from 'node:path';

const envText = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
const env = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}
const keys = ['MINIMAX_API_KEY1', 'MINIMAX_API_KEY2', 'MINIMAX_API_KEY3', 'MINIMAX_API_KEY4']
  .map((k) => ({ name: k, val: env[k] }))
  .filter((x) => x.val);

const mask = (s) => (s ? s.slice(0, 10) + '...' + s.slice(-4) : 'none');
const HOSTS = ['https://api.minimax.io', 'https://api.minimaxi.com'];

async function getVoice(host, key) {
  const res = await fetch(`${host}/v1/get_voice`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ voice_type: 'all' }),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text.slice(0, 300) }; }
  return { httpStatus: res.status, json };
}

for (const { name, val } of keys) {
  console.log(`\n===== ${name} (${mask(val)}) =====`);
  for (const host of HOSTS) {
    try {
      const { httpStatus, json } = await getVoice(host, val);
      const code = json?.base_resp?.status_code;
      const msg = json?.base_resp?.status_msg;
      const cloned = json?.voice_cloning || [];
      const sysCount = (json?.system_voice || []).length;
      console.log(`  [${host}] http=${httpStatus} code=${code} msg=${msg} | system_voices=${sysCount} cloned=${cloned.length}`);
      if (cloned.length) {
        for (const v of cloned) {
          console.log(`     CLONED -> voice_id=${v.voice_id} desc=${JSON.stringify(v.description || v.voice_name || '')}`);
        }
      }
      // Only the working host returns code 0; break to avoid duplicate noise
      if (code === 0) break;
    } catch (e) {
      console.log(`  [${host}] ERROR ${e.message}`);
    }
  }
}
console.log('\n--- also present: STABILITY_API =', mask(env.STABILITY_API));
