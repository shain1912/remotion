#!/bin/bash
# 한 클립 Lambda 렌더(720p) + S3에서 out/로 다운로드. 멱등.
id=$1
cd /h/remotion
export AWS_REGION=ap-northeast-2 REMOTION_AWS_REGION=ap-northeast-2
AWS="/c/Program Files/Amazon/AWSCLIV2/aws.exe"
FN=remotion-render-4-0-436-mem3008mb-disk2048mb-300sec
[ -s "out/$id.mp4" ] && { echo "[render] $id exists"; exit 0; }
out=$(npx remotion lambda render factory FactoryVideo --props="{\"projectId\":\"$id\"}" --scale=0.6667 --function-name="$FN" 2>&1 | tr '\r' '\n')
url=$(echo "$out" | grep -oE "https://s3[^ ]+\.mp4" | tail -1)
if [ -z "$url" ]; then echo "[render] $id FAIL_RENDER ($(echo "$out" | grep -iE 'error' | tail -1))"; exit 1; fi
s3path=$(echo "$url" | sed -E 's#https://s3[^/]*/#s3://#')
"$AWS" s3 cp "$s3path" "out/$id.mp4" >/dev/null 2>&1
if [ -s "out/$id.mp4" ]; then echo "[render] $id OK $(echo "$out" | grep -oiE 'cost \$[0-9.]+' | tail -1)"; else echo "[render] $id FAIL_DL $s3path"; fi
