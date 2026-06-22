// MiniMax API client — verified against api.minimax.io (2026-06).
// Image (image-01), Video (Hailuo I2V/T2V), TTS (speech-2.6-hd + cloned voice).
//
// Cost-aware key allocation:
//   KEY1  -> TTS only (holds the user's cloned voice `shainvoice01`, low balance)
//   KEY2/3/4 -> image + video generation (rich balance), round-robin + failover.
import fs from 'node:fs';
import path from 'node:path';

const HOST = process.env.MINIMAX_API_HOST || 'https://api.minimax.io';

function loadEnv() {
  const root = process.cwd();
  const envPath = path.join(root, '.env');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
    }
  }
}
loadEnv();

// Which key holds the cloned voice for TTS. Default KEY1; set MINIMAX_TTS_KEY=2
// (etc.) to route TTS to another account where the voice has been re-cloned.
const TTS_KEY_NUM = process.env.MINIMAX_TTS_KEY || '1';
const TTS_KEY = process.env[`MINIMAX_API_KEY${TTS_KEY_NUM}`];
const GEN_KEYS = [
  process.env.MINIMAX_API_KEY2,
  process.env.MINIMAX_API_KEY3,
  process.env.MINIMAX_API_KEY4,
].filter(Boolean);

if (!TTS_KEY) console.warn(`[minimax] WARN: MINIMAX_API_KEY${TTS_KEY_NUM} (TTS/voice) not set`);
if (!GEN_KEYS.length) console.warn('[minimax] WARN: no generation keys (KEY2/3/4) set');

let genIdx = 0;
const nextGenKey = () => GEN_KEYS[genIdx++ % GEN_KEYS.length];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function postJson(url, key, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { _raw: text.slice(0, 400) }; }
  return { http: res.status, json };
}

function ok(json) {
  return json?.base_resp?.status_code === 0;
}

// ---------------------------------------------------------------------------
// IMAGE — image-01. Returns a JPEG Buffer. Rotates generation keys on failure.
// `subjectReference`: optional URL/dataURL for character/style consistency.
// ---------------------------------------------------------------------------
export async function generateImage({ prompt, aspectRatio = '16:9', subjectReference = null, model = 'image-01' }) {
  const body = { model, prompt, aspect_ratio: aspectRatio, response_format: 'base64', n: 1 };
  if (subjectReference) body.subject_reference = [{ type: 'character', image_file: subjectReference }];

  let lastErr = 'unknown';
  for (let attempt = 0; attempt < GEN_KEYS.length * 2; attempt++) {
    const key = nextGenKey();
    try {
      const { http, json } = await postJson(`${HOST}/v1/image_generation`, key, body);
      const b64 = json?.data?.image_base64?.[0];
      if (ok(json) && b64) return Buffer.from(b64, 'base64');
      lastErr = `http=${http} base_resp=${JSON.stringify(json?.base_resp)}`;
    } catch (e) { lastErr = e.message; }
    await sleep(800);
  }
  throw new Error(`generateImage failed: ${lastErr}`);
}

// ---------------------------------------------------------------------------
// VIDEO — Hailuo. first_frame_image => I2V; omit => T2V. Returns an MP4 Buffer.
// Submits a task, polls until Success, downloads the file.
// ---------------------------------------------------------------------------
export async function generateVideo({
  prompt, firstFrameImage = null, model = 'MiniMax-Hailuo-2.3-Fast',
  duration = 6, resolution = '768P', pollMs = 5000, timeoutMs = 6 * 60 * 1000,
}) {
  const body = { model, prompt, duration, resolution };
  if (firstFrameImage) body.first_frame_image = firstFrameImage;

  // Submit fails over across generation keys (e.g. one key out of balance); the
  // winning key is then used for polling + file retrieve (task is bound to it).
  let key = null, taskId = null, lastErr = 'unknown';
  for (let attempt = 0; attempt < GEN_KEYS.length; attempt++) {
    const k = nextGenKey();
    const submit = await postJson(`${HOST}/v1/video_generation`, k, body);
    if (ok(submit.json) && submit.json.task_id) { key = k; taskId = submit.json.task_id; break; }
    lastErr = JSON.stringify(submit.json?.base_resp || submit.json);
  }
  if (!taskId) throw new Error(`video submit failed on all keys: ${lastErr}`);

  const started = Date.now();
  let fileId = null;
  while (Date.now() - started < timeoutMs) {
    await sleep(pollMs);
    const q = await fetch(`${HOST}/v1/query/video_generation?task_id=${taskId}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    const qj = await q.json();
    const status = qj.status;
    if (status === 'Success') { fileId = qj.file_id; break; }
    if (status === 'Fail') throw new Error(`video task failed: ${JSON.stringify(qj)}`);
  }
  if (!fileId) throw new Error(`video task timed out (task_id=${taskId})`);

  const f = await fetch(`${HOST}/v1/files/retrieve?file_id=${fileId}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  const fj = await f.json();
  const url = fj?.file?.download_url;
  if (!url) throw new Error(`file retrieve failed: ${JSON.stringify(fj)}`);
  const bin = await fetch(url);
  return Buffer.from(await bin.arrayBuffer());
}

// ---------------------------------------------------------------------------
// TTS — speech model + cloned voice. Returns { audio: Buffer(mp3), subtitles, ms }.
// `subtitles`: [{ text, time_begin, time_end }] in milliseconds (cut/caption sync).
// ---------------------------------------------------------------------------
export async function tts({
  text, voiceId = 'shainvoice01', model = 'speech-2.6-hd',
  speed = 1.0, vol = 1.0, pitch = 0, emotion = null, languageBoost = 'Korean',
}) {
  const body = {
    model, text, stream: false, language_boost: languageBoost,
    output_format: 'hex', subtitle_enable: true,
    voice_setting: { voice_id: voiceId, speed, vol, pitch, ...(emotion ? { emotion } : {}) },
    audio_setting: { sample_rate: 32000, format: 'mp3', bitrate: 128000, channel: 1 },
  };
  const { http, json } = await postJson(`${HOST}/v1/t2a_v2`, TTS_KEY, body);
  const hex = json?.data?.audio;
  if (!ok(json) || !hex) throw new Error(`tts failed: http=${http} ${JSON.stringify(json?.base_resp || json)}`);

  let subtitles = [];
  if (json?.data?.subtitle_file) {
    try {
      const s = await fetch(json.data.subtitle_file);
      const arr = await s.json();
      subtitles = arr.map((x) => ({ text: x.text, time_begin: x.time_begin, time_end: x.time_end }));
    } catch { /* timing optional */ }
  }
  return {
    audio: Buffer.from(hex, 'hex'),
    subtitles,
    ms: json?.extra_info?.audio_length ?? null,
  };
}

export async function listVoices(key = TTS_KEY, voiceType = 'all') {
  const { json } = await postJson(`${HOST}/v1/get_voice`, key, { voice_type: voiceType });
  return json;
}

export const config = { HOST, hasTTS: !!TTS_KEY, genKeyCount: GEN_KEYS.length };
