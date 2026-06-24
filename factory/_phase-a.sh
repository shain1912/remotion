#!/bin/bash
# Phase A: 음성완료 대기 → WAV회수 → mp3+사이드카 → build 전체 → 음성검사 → 레퍼런스 STILL → 정지(검증 게이트)
cd /h/remotion
LOG(){ echo "[$(date +%H:%M:%S)] $*"; }
SK="-i $HOME/.ssh/id_ed25519 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=20"
TARGET=1949
mapfile -t PODS < factory/_pods.txt
total_wav(){ local t=0; for p in "${PODS[@]}"; do set -- $p; local w=$(ssh -n -p $2 $SK root@$1 "ls /workspace/wavs/*.wav 2>/dev/null|wc -l" 2>/dev/null|tr -d '\r'); t=$((t+${w:-0})); done; echo $t; }

LOG "===== PHASE A START ====="
prev=-1; stable=0
for i in $(seq 1 120); do
  t=$(total_wav); LOG "음성 $t/$TARGET"
  [ "$t" -ge "$TARGET" ] && { LOG "음성 완료"; break; }
  [ "$t" = "$prev" ] && stable=$((stable+1)) || stable=0; prev=$t
  [ "$stable" -ge 8 ] && { LOG "음성 정체(8회) — 진행($t)"; break; }
  sleep 60
done

mkdir -p output/wavs
LOG "WAV 다운로드..."
for p in "${PODS[@]}"; do set -- $p; scp -P $2 $SK "root@$1:/workspace/wavs/*.wav" output/wavs/ 2>/dev/null; done
LOG "받은 wav: $(ls output/wavs/*.wav 2>/dev/null|wc -l)"

node factory/_place-audio.mjs

IDS=$(node -e 'const fs=require("fs");const d=fs.readdirSync("factory/projects").filter(x=>fs.existsSync("factory/projects/"+x+"/project.json"));console.log(d.filter(x=>/^byb-s[1-6]-\d+$/.test(x)||/^byb-s4b-\d+$/.test(x)||/^byb2-/.test(x)||/^byb-(w|ai|esp)-\d+$/.test(x)).sort().join(" "))')
LOG "build..."
for id in $IDS; do node factory/build.mjs $id --no-video >/dev/null 2>&1 && echo -n "."; done; echo
LOG "build 완료: $(ls public/factory/*/build.json 2>/dev/null|wc -l)"

LOG "음성 완결성 검사..."
node factory/_audio-check.mjs | tee factory/_audio_check.txt

LOG "레퍼런스 STILL (byb-s1-01)..."
node factory/still.mjs byb-s1-01 245,1225,3185,5200 2>&1 | grep -iE "still ->" | tail -4

LOG "===== PHASE A DONE — ★검증 대기: factory/_audio_check.txt + factory/_verify/still_byb-s1-01_*.png 확인 후 Phase B 실행 ====="
