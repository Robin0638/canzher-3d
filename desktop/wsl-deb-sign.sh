#!/usr/bin/env bash
# deb 签名脚本：在 WSL deepin 中运行（root）
# 依赖 dist-linux/CANZHER-GPG-SECRET-KEY.asc（由 openEuler 构建脚本导出）
# 产出: 每个 .deb 的分离签名 .sig + 标准 apt 仓库（InRelease/Release.gpg 签名）
set -euo pipefail

DIST_LINUX="/mnt/c/Users/MECHREVO/Documents/HBuilderProjects/餐这儿-3d - 副本 (2)/desktop/dist-linux"
KEY="$DIST_LINUX/CANZHER-GPG-SECRET-KEY.asc"
REPO="$HOME/apt-repo"
BUILD="$HOME/canzher-build"

export GNUPGHOME="$HOME/.gnupg-canzher"
mkdir -p "$GNUPGHOME"
chmod 700 "$GNUPGHOME"
gpg --batch --import "$KEY"
gpg --list-keys 'canzher@canzher.local'

mkdir -p "$REPO/pool/main/c/canzher-3d"
cp -f "$BUILD"/dist/*.deb "$REPO/pool/main/c/canzher-3d/"

for f in "$REPO"/pool/main/c/canzher-3d/*.deb; do
  gpg --batch --yes --armor --detach-sign --output "$f.sig" "$f"
done

cd "$REPO"
for ARCH in amd64 arm64 armhf; do
  mkdir -p "dists/stable/main/binary-$ARCH"
  apt-ftparchive packages pool \
    > "dists/stable/main/binary-$ARCH/Packages"
  gzip -k -f "dists/stable/main/binary-$ARCH/Packages"
done

cat > dists/stable/main/binary-amd64/Release <<'EOF'
Origin: CanZher
Label: CanZher
Suite: stable
Codename: stable
Components: main
Architectures: amd64 arm64 armhf
Description: CanZher (餐这儿) apt repository
EOF
for ARCH in arm64 armhf; do
  cp dists/stable/main/binary-amd64/Release "dists/stable/main/binary-$ARCH/Release"
done

cd "$REPO/dists/stable"
apt-ftparchive release . > Release
gpg --batch --yes --clearsign --output InRelease Release
gpg --batch --yes --armor --detach-sign --output Release.gpg Release

rm -f dists/stable/main/binary-*/Release
cp -f "$REPO"/pool/main/c/canzher-3d/*.deb "$BUILD/dist/"
cp -f "$REPO"/pool/main/c/canzher-3d/*.deb.sig "$BUILD/dist/"
mkdir -p "$DIST_LINUX/apt-repo"
cp -rf "$REPO"/. "$DIST_LINUX/apt-repo/"

echo "=== DEB SIGNING DONE ==="
ls -la "$BUILD/dist/" | grep -E "deb|asc"
