#!/usr/bin/env bash
# 上传 GitHub Release v1.0.0 及全部安装包附件（幂等：重跑会跳过已上传文件）
# 用法: bash tools/upload-gh-release.sh
set -uo pipefail

TOKEN=$(tr -d ' \r\n' < "/c/Users/MECHREVO/AppData/Local/Temp/zcode-gh-token.txt")
REPO="Robin0638/canzher-3d"
ROOT="/c/Users/MECHREVO/Documents/HBuilderProjects/餐这儿-3d - 副本 (2)"
API="https://api.github.com"

cd "$ROOT" || exit 1

# 生成 Release 说明 JSON（正文取自 docs/RELEASE-NOTES-v1.0.0.md）
if [ ! -f release/.rel-payload.json ]; then
node -e '
const fs=require("fs");
const body=fs.readFileSync("docs/RELEASE-NOTES-v1.0.0.md","utf8");
fs.writeFileSync("release/.rel-payload.json", JSON.stringify({tag_name:"v1.0.0",target_commitish:"main",name:"餐这儿 3D v1.0.0 桌面版",body:body,draft:false,prerelease:false}));
' || exit 1
fi

# 取已有 release id；没有则创建
RID=$(curl -s -H "Authorization: Bearer $TOKEN" "$API/repos/$REPO/releases/tags/v1.0.0" | grep -m1 '^  "id"' | tr -dc '0-9')
if [ -z "$RID" ]; then
  RID=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    --data-binary @release/.rel-payload.json "$API/repos/$REPO/releases" | grep -m1 '^  "id"' | tr -dc '0-9')
  echo "created release id=$RID"
else
  echo "release exists id=$RID"
fi
[ -z "$RID" ] && { echo "FATAL: cannot obtain release id"; exit 1; }

# 已存在的附件名
EXIST=$(curl -s -H "Authorization: Bearer $TOKEN" "$API/repos/$REPO/releases/$RID/assets?per_page=100" | grep '"name"' | sed 's/.*: "//; s/".*//')

upload() {
  local f="$1" name code i size
  name=$(basename "$f")
  if echo "$EXIST" | grep -qx "$name"; then echo "SKIP $name"; return 0; fi
  size=$(du -k "$f" | cut -f1)
  echo "UP  $name (${size}KB) $(date +%T)"
  for i in 1 2 3; do
    code=$(curl -s -o /tmp/gh-up.json -w '%{http_code}' -X POST \
      -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/octet-stream" \
      --data-binary @"$f" \
      "https://uploads.github.com/repos/$REPO/releases/$RID/assets?name=$name")
    if [ "$code" = "201" ]; then echo "OK  $name $(date +%T)"; return 0; fi
    echo "RETRY($i) $name http=$code $(head -c 200 /tmp/gh-up.json 2>/dev/null)"
    sleep 3
  done
  echo "FAIL $name"
  return 1
}

FAILED=0
for f in release/windows/*.exe release/windows/*.zip release/linux/*.deb release/linux/*.rpm; do
  upload "$f" || FAILED=$((FAILED+1))
done
N=$(curl -s -H "Authorization: Bearer $TOKEN" "$API/repos/$REPO/releases/$RID/assets?per_page=100" | grep -c '"name"')
echo "DONE failed=$FAILED assets_total=$N"
