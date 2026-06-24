import os, sys, time, json, torch, soundfile as sf
os.environ.setdefault("HF_HUB_ENABLE_HF_TRANSFER", "1")
from qwen_tts import Qwen3TTSModel

SHARD = int(sys.argv[1]) if len(sys.argv) > 1 else 0
NSHARD = int(sys.argv[2]) if len(sys.argv) > 2 else 1
os.makedirs("/workspace/wavs", exist_ok=True)
items = json.load(open("/workspace/narrations.json", encoding="utf-8"))
items = [x for i, x in enumerate(items) if i % NSHARD == SHARD]

m = Qwen3TTSModel.from_pretrained(
    "Qwen/Qwen3-TTS-12Hz-1.7B-Base", device_map="cuda", torch_dtype=torch.bfloat16)
ref_text = open("/workspace/myvoice_ref.txt", encoding="utf-8").read().strip()
vp = m.create_voice_clone_prompt(
    ref_audio="/workspace/myvoice_ref.wav", ref_text=ref_text, x_vector_only_mode=False)
print(f"READY shard {SHARD}/{NSHARD} items {len(items)}", flush=True)

done = 0
t0 = time.time()
for x in items:
    out = f"/workspace/wavs/{x['id']}__{x['sid']}.wav"
    if os.path.exists(out) and os.path.getsize(out) > 2000:
        done += 1; continue
    try:
        wavs, sr = m.generate_voice_clone(
            text=x["text"], voice_clone_prompt=vp, language="korean", instruct=None)
        sf.write(out, wavs[0], sr)
        done += 1
        if done % 20 == 0:
            rate = (time.time() - t0) / done
            print(f"PROG {done}/{len(items)} ~{rate:.1f}s/scene eta {(len(items)-done)*rate/60:.0f}min", flush=True)
    except Exception as e:
        print(f"ERR {x['id']}__{x['sid']} {str(e)[:80]}", flush=True)
print(f"BATCH_DONE {done}/{len(items)}", flush=True)
