#!/usr/bin/env bash
# rpm 签名脚本：在 WSL openEuler-22.03 中运行（root）
# 对 dist 里的 *.rpm 做 GPG 签名（rpmsign），导入公钥后可用 rpm -K 验证
set -euo pipefail

BUILD="$HOME/canzher-build"
OUT="/mnt/c/Users/MECHREVO/Documents/HBuilderProjects/餐这儿-3d - 副本 (2)/desktop/dist-linux"

export GNUPGHOME="$HOME/.gnupg-canzher"

printf '%%_gpg_name CanZher Release <canzher@canzher.local>\n' > "$HOME/.rpmmacros"

cd "$BUILD/dist"
for f in *.rpm; do
  rpmsign --define "%_gpg_name CanZher Release <canzher@canzher.local>" --addsign "$f"
done

echo "=== verify (rpm -K) ==="
rpm --import "$BUILD/dist/CANZHER-GPG-PUBLIC-KEY.asc"
for f in *.rpm; do
  printf '%s => ' "$f"
  rpm -K "$f"
done

cp -f "$BUILD"/dist/*.rpm "$OUT/"
echo "=== RPM SIGNING DONE ==="
