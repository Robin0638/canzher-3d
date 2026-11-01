# 餐这儿 3D v1.0.0 发布说明（桌面版首发）

> 本文件是 GitHub / GitCode Release 页的说明草稿，附件请从本地 `release/` 目录上传
> （构建产物不进 git 仓库，通过 Release 分发）。

## 下载

### Windows（安装包已 Authenticode 代码签名）

| 文件 | 适用 |
|------|------|
| `CanZher-1.0.0-Setup-x64.exe` | Windows x64（大多数台式机/笔记本） |
| `CanZher-1.0.0-Setup-ia32.exe` | Windows 32 位（x86） |
| `CanZher-1.0.0-Setup-arm64.exe` | Windows on ARM（Surface Pro X 等） |
| `CanZher-1.0.0-Setup.exe` | 三架构合并安装器（自动选择） |
| `CanZher-1.0.0-Portable-*.exe` | 免安装便携版（单文件，已签名） |
| `CanZher-1.0.0-*.zip` | 免安装 zip 包 |

### Linux（deb/rpm 均已 GPG 签名，指纹 `D07040EF1614D539C4BC67B6D65E7A86D8553E14`）

| 文件 | 适用 |
|------|------|
| `canzher-3d_1.0.0_amd64.deb` | Debian/Ubuntu/Deepin/UOS x86_64 |
| `canzher-3d_1.0.0_arm64.deb` | Debian 系 arm64 |
| `canzher-3d_1.0.0_armv7l.deb` | Debian 系 armhf |
| `canzher-3d-1.0.0.x86_64.rpm` | openEuler/Fedora/CentOS x86_64 |
| `canzher-3d-1.0.0.aarch64.rpm` | RPM 系 arm64 |
| `canzher-3d-1.0.0.armv7l.rpm` | RPM 系 armv7hl |

验签方法与 apt 仓库用法见 [desktop-build.md](desktop-build.md) 第三、四节。

## 签名与安全

- Windows 包签名者：`CN=CanZher`（自签证书）。
  自签证书会触发 SmartScreen/未知发布者提示，属正常现象；签名者证书指纹
  `8C14FC73C1851BC902FEB9D4878D372339471A5F`。
- 每个 Linux 包附校验和与签名，`rpm -K` 或 `gpg --verify` 均可验证；
  验签公钥可向作者索取。

## SHA256 校验和

```
40d0a1ad5d35ef740bc65533da8e127266d5784a925985e45ab90e36b4d5d155 *release/windows/CanZher-1.0.0-Setup.exe
943886e5f7ac57f70605eb0ea821899346f80fa2336e296c0de0ff89272f42dd *release/windows/CanZher-1.0.0-Setup-x64.exe
c37576483842fd5d9a0c459f7458404a484c45245cfe7294716a521a6161cd3e *release/windows/CanZher-1.0.0-Setup-ia32.exe
b0f84a2c8a7e8ae48e89526eade67b37d170a6b16f461a45ff2df489712e88f6 *release/windows/CanZher-1.0.0-Setup-arm64.exe
40cbbd1449d3065b825f2baa5dccef416d0af35969f61fd4164ef018fd8306dc *release/windows/CanZher-1.0.0-Portable.exe
660cf86fc3e0b91637d8aea8c9d1d1c110ac8899bddd6dd74c5974f7d24870ce *release/windows/CanZher-1.0.0-Portable-x64.exe
630a8cfe42b66c83df7a32fdd44d0df9a4b8f679cf7c2cfe2695100f6e1b0057 *release/windows/CanZher-1.0.0-Portable-ia32.exe
a842455414262d68f55006170d260704f6fe0c24bb6da77fcaabc83dd28d7602 *release/windows/CanZher-1.0.0-Portable-arm64.exe
e305b203dba9881a1d473a63027d80d909f76d49c8b68c0a7ce0fa66eab8286d *release/windows/CanZher-1.0.0-x64.zip
44e1d35e3e07968c95be54853d24d9ce5ece983396b5c449e883ffc597f144c7 *release/windows/CanZher-1.0.0-ia32.zip
92c72e10e38cc70789736cbcb1cd1a55de7859245e3f36c695c6df002a283ec7 *release/windows/CanZher-1.0.0-arm64.zip
4884342b709341850e3528839b606b93aead43d785bd82666d6705313154dbf3 *release/linux/canzher-3d_1.0.0_amd64.deb
abe3e89a6cc965a629833216a18957170caa6be2651f676de2bc288a581143b6 *release/linux/canzher-3d_1.0.0_arm64.deb
a2abc660c2c1a798c06b871f0f9eeadab58f9adb4c8dfbad678ccaa4f37f2a66 *release/linux/canzher-3d_1.0.0_armv7l.deb
2c95083ea6a692d44b36911310be288006c93bb91957643de30555a55dce9ee1 *release/linux/canzher-3d-1.0.0.aarch64.rpm
df0c0e92b71860cd0da25829f850d62c0ec102673f2f7a6629c77c491b5596e5 *release/linux/canzher-3d-1.0.0.armv7l.rpm
767411644c7c8344e47ad58f3f0e07007d677fb0520a36e62895f066c79d56d6 *release/linux/canzher-3d-1.0.0.x86_64.rpm
65c8a917fab92268fb12fcc45448a4fb1c511fb2486646e72767e1985ae12d73 *release/linux/canzher-3d_1.0.0_amd64.deb.sig
f8ff86ababd13e4bbaaaeec45ca939b0b88b5b3123d7446a91b351e0b638f66c *release/linux/canzher-3d_1.0.0_arm64.deb.sig
b17da38dd18efd7f9e2f4de3ed758569c1bbc33d555b6ecdf5586cd2d52cb845 *release/linux/canzher-3d_1.0.0_armv7l.deb.sig
```
