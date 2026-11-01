#!/usr/bin/env bash
# Linux rpm 构建脚本：在 WSL openEuler-22.03 中运行（root）
# 产物: ~/canzher-build/dist/*.rpm + GPG 公钥/私钥导出 → 拷回 dist-linux
set -euo pipefail

WIN_SRC="/mnt/c/Users/MECHREVO/Documents/HBuilderProjects/餐这儿-3d - 副本 (2)/desktop"
OUT="/mnt/c/Users/MECHREVO/Documents/HBuilderProjects/餐这儿-3d - 副本 (2)/desktop/dist-linux"
BUILD="$HOME/canzher-build"

echo "=== install nodejs + rpm-build ==="
dnf install -y rpm-build >/dev/null 2>&1 || dnf install -y rpm-build
which rpmbuild rpmsign gpg

# openEuler 22.03 自带 node v12 过老，用 npmmirror 的 Node 20 二进制包
NODE_VER=v20.18.1
if [ ! -x /opt/node20/bin/node ]; then
  curl -fsSL "https://npmmirror.com/mirrors/node/$NODE_VER/node-$NODE_VER-linux-x64.tar.xz" -o /tmp/node20.tar.xz
  mkdir -p /opt/node20
  tar xf /tmp/node20.tar.xz -C /opt/node20 --strip-components=1
fi
export PATH="/opt/node20/bin:$PATH"
node -v
npm -v

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
cp -f "$BUILD"/dist/*.rpm "$BUILD"/dist/*.asc "$OUT/"

echo "=== RPM BUILD DONE ==="
ls -la "$OUT"
