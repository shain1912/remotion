#!/bin/bash
# Lambda 렌더 준비: 128편 voice(qwen) + normalize + build(--no-video). 렌더 안 함.
cd /h/remotion
IDS=$(node -e 'const fs=require("fs");const d=fs.readdirSync("factory/projects").filter(x=>fs.existsSync("factory/projects/"+x+"/project.json"));const ex=d.filter(x=>/^byb-s[1-6]-\d+$/.test(x)||/^byb-s4b-\d+$/.test(x)||/^byb2-/.test(x));const nt=d.filter(x=>/^byb-(w|ai|esp)-\d+$/.test(x));console.log([...ex,...nt].sort().join(" "))')
N=$(echo $IDS | wc -w); i=0; ok=0; fail=""
echo "[prep] 대상 $N편 시작"
for id in $IDS; do
  i=$((i+1))
  node factory/gen-voice-qwen.mjs "$id" > /tmp/prep_v.log 2>&1
  vc=$?
  node factory/normalize-audio.mjs "$id" > /dev/null 2>&1
  node factory/build.mjs "$id" --no-video > /tmp/prep_b.log 2>&1
  bc=$?
  if [ $bc -eq 0 ]; then ok=$((ok+1)); st="OK"; else st="BUILD_FAIL"; fail="$fail $id"; fi
  [ $vc -ne 0 ] && st="$st (qwen일부실패)"
  echo "[prep] $i/$N $id $st  $(grep -oE '[0-9]+ scenes, [0-9]+ frames' /tmp/prep_b.log | tail -1)"
done
echo "[prep] DONE — 성공 $ok/$N. 실패:${fail:- 없음}"
