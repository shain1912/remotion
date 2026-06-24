#!/bin/bash
# Phase B: 섹션별로 Lambda 렌더 → mp4 검증(길이·오디오·크기) → 그 섹션 R2 업로드. 실패 편 1회 재시도.
cd /h/remotion
export AWS_REGION=ap-northeast-2 REMOTION_AWS_REGION=ap-northeast-2
LOG(){ echo "[$(date +%H:%M:%S)] $*"; }
FF=node_modules/ffmpeg-static/ffmpeg.exe

LOG "===== PHASE B START ====="
LOG "사이트 재배포(전 클립 포함)..."; npx remotion lambda sites create src/index.ts --site-name=factory >/dev/null 2>&1 && LOG "재배포 OK"

# mp4 검증: 길이>30s & 오디오스트림 존재 & 1MB 이상
verify_mp4(){
  local f=$1
  [ -s "$f" ] || return 1
  local sz=$(stat -c %s "$f" 2>/dev/null); [ "${sz:-0}" -lt 1000000 ] && return 1
  local info=$("$FF" -i "$f" 2>&1)
  echo "$info" | grep -q "Audio:" || return 1
  echo "$info" | grep -qE "Duration: 00:0[1-9]|Duration: 00:[1-9]" || return 1
  return 0
}

ids_of(){ node -e "const fs=require('fs');const d=fs.readdirSync('factory/projects').filter(x=>fs.existsSync('factory/projects/'+x+'/project.json'));console.log(d.filter(x=>new RegExp('$1').test(x)).sort().join(' '))"; }

# 섹션: "폴더명:정규식:orderBase"
SECTIONS=(
  "S1:^byb-s1-:100" "S2:^byb-s2-:120" "S3:^byb-s3-:140" "S4:^byb-s4-[0-9]:160"
  "S4B:^byb-s4b-:180" "S5:^byb-s5-:200" "S6:^byb-s6-:220"
  "W:^byb-w-:300" "AI:^byb-ai-:320" "ESP:^byb-esp-:340"
  "B2-S1:^byb2-s1-:400" "B2-S4:^byb2-s4-[0-9]:420" "B2-S4B:^byb2-s4b-:440" "B2-S5:^byb2-s5-:460" "B2-S6:^byb2-s6-:480"
)

for entry in "${SECTIONS[@]}"; do
  IFS=':' read -r sec re base <<< "$entry"
  ids=$(ids_of "$re")
  [ -z "$ids" ] && continue
  LOG "▶ 섹션 $sec 렌더 ($(echo $ids|wc -w)편)..."
  echo "$ids" | tr ' ' '\n' | xargs -P 2 -I {} bash factory/_lambda-render-one.sh {} >/dev/null 2>&1
  # 검증 + 실패 재시도 1회
  fail=""
  for id in $ids; do verify_mp4 "out/$id.mp4" || fail="$fail $id"; done
  if [ -n "$fail" ]; then
    LOG "  재시도:$fail"
    for id in $fail; do rm -f "out/$id.mp4"; bash factory/_lambda-render-one.sh $id >/dev/null 2>&1; done
  fi
  ok=0; bad=""
  for id in $ids; do verify_mp4 "out/$id.mp4" && ok=$((ok+1)) || bad="$bad $id"; done
  LOG "  $sec 검증: 정상 $ok / 실패:${bad:- 없음}"
  node factory/organize-sections.mjs >/dev/null 2>&1
  if [ -d "강의완성본/섹션별/$sec" ]; then
    LOG "  R2 업로드: $sec"
    (cd /h/moodle && node _upload_section.mjs "$sec" "H:/remotion/강의완성본/섹션별/$sec" $base) 2>&1 | grep -E "↑|✗|upload" | sed 's/^/    /'
  fi
  LOG "✔ 섹션 $sec 완료"
done
LOG "===== PHASE B DONE — 전 섹션 렌더·검증·업로드 완료 ====="
