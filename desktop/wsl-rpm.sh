#!/usr/bin/env bash
# 续跑脚本：deepin 已完成 deb 构建，这里补装 rpm 工具链、构建 rpm、生成 GPG 密钥并收集产物
set -euo pipefail

OUT="/mnt/c/Users/MECHREVO/Documents/HBuilderProjects/餐这儿-3d - 副本 (2)/desktop/dist-linux"
BUILD="$HOME/canzher-build"

echo "=== install rpm toolchain ==="
export DEBIAN_FRONTEND=noninteractive
apt-get install -y -qq rpm >/dev/null 2>&1 || apt-get install -y rpm
which rpmbuild rpmsign || true

cd "$BUILD"
export ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
export ELECTRON_BUILDER_BINARIES_MIRROR="https://npmmirror.com/mirrors/electron-builder-binaries/"
export npm_config_registry="https://registry.npmmirror.com"

echo "=== build rpm x64/arm64/armv7l ==="
npx electron-builder --linux rpm --x64 --arm64 --armv7l -p never

echo "=== generate GPG key ==="
export GNUPGHOME="$HOME/.gnupg-canzher"
mkdir -p "$GNUPGHOME"
chmod 700 "$GNUPGHOME"
if ! gpg --batch --list-keys 'canzher@canzher.local' >/dev/null 2>&1; then
  gpg --batch --pinentry-mode loopback --passphrase '' \
      --quick-gen-key 'CanZher Release <canzher@canzher.local>' rsa3072 sign 0
fi
gpg --list-keys 'canzher@canzher.local'
gpg --armor --export 'canzher@canzher.local' > "$BUILD/dist/CANZHER-GPG-PUBLIC-KEY.asc"
gpg --armor --export-secret-keys 'canzher@canzher.local' > "$BUILD/dist/CANZHER-GPG-SECRET-KEY.asc"

mkdir -p "$OUT"
cp -f "$BUILD"/dist/*.deb "$BUILD"/dist/*.rpm "$BUILD"/dist/*.asc "$OUT/"

echo "=== COLLECT DONE ==="
ls -la "$OUT"
