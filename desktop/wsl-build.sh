#!/usr/bin/env bash
# Linux 构建脚本：在 WSL deepin 中运行（root）
# 产物: ~/canzher-build/dist/*.deb *.rpm + GPG 公钥/私钥导出
set -euo pipefail

WIN_SRC="/mnt/c/Users/MECHREVO/Documents/HBuilderProjects/餐这儿-3d - 副本 (2)/desktop"
OUT="/mnt/c/Users/MECHREVO/Documents/HBuilderProjects/餐这儿-3d - 副本 (2)/desktop/dist-linux"
BUILD="$HOME/canzher-build"

rm -rf "$BUILD"
mkdir -p "$BUILD"
cd "$WIN_SRC"
tar cf - --exclude=node_modules --exclude=dist --exclude=dist-linux . | tar xf - -C "$BUILD"
cd "$BUILD"

export ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
export ELECTRON_BUILDER_BINARIES_MIRROR="https://npmmirror.com/mirrors/electron-builder-binaries/"
export npm_config_registry="https://registry.npmmirror.com"

echo "=== npm install ==="
npm install --no-audit --no-fund

echo "=== electron-builder linux deb+rpm x64/arm64/armv7l ==="
npx electron-builder --linux deb rpm --x64 --arm64 --armv7l -p never

echo "=== generate GPG key ==="
export GNUPGHOME="$HOME/.gnupg-canzher"
mkdir -p "$GNUPGHOME"
chmod 700 "$GNUPGHOME"
if ! gpg --batch --list-keys 'canzher@canzher.local' >/dev/null 2>&1; then
  gpg --batch --pinentry-mode loopback --passphrase '' \
      --quick-gen-key 'CanZher Release <canzher@canzher.local>' rsa3072 sign 0
fi
gpg --armor --export 'canzher@canzher.local' > "$BUILD/dist/CANZHER-GPG-PUBLIC-KEY.asc"
gpg --armor --export-secret-keys 'canzher@canzher.local' > "$BUILD/dist/CANZHER-GPG-SECRET-KEY.asc"

mkdir -p "$OUT"
cp -f "$BUILD"/dist/*.deb "$BUILD"/dist/*.rpm "$BUILD"/dist/*.asc "$OUT/"

echo "=== BUILD DONE ==="
ls -la "$OUT"
