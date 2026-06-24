import os, time, torch, soundfile as sf
os.environ.setdefault("HF_HUB_ENABLE_HF_TRANSFER", "1")
from qwen_tts import Qwen3TTSModel

t = time.time()
m = Qwen3TTSModel.from_pretrained(
    "Qwen/Qwen3-TTS-12Hz-1.7B-Base", device_map="cuda", torch_dtype=torch.bfloat16)
print("MODEL_LOADED", round(time.time() - t), "s", flush=True)

ref_text = open("/workspace/myvoice_ref.txt", encoding="utf-8").read().strip()
vp = m.create_voice_clone_prompt(
    ref_audio="/workspace/myvoice_ref.wav", ref_text=ref_text, x_vector_only_mode=False)
print("PROMPT_OK", flush=True)

text = "안녕하세요, 바이브코딩 입문 강의에 오신 걸 정말 환영해요. 오늘부터 천천히, 하지만 확실하게 같이 만들어 볼게요."
t = time.time()
wavs, sr = m.generate_voice_clone(text=text, voice_clone_prompt=vp, language="korean", instruct=None)
sf.write("/workspace/sample.wav", wavs[0], sr)
print("GENERATED", round(time.time() - t), "s  sr", sr, "dur", round(len(wavs[0]) / sr, 2), "s", flush=True)
