# 桌面版构建与签名说明（Windows / Linux）

本文说明如何把本项目（纯 H5 小游戏，入口 `index.html`）打包成 Windows 与 Linux 桌面应用并签名。

桌面版基于 **Electron** 封装，工程在 [`desktop/`](../desktop/)：

- `desktop/main.js` —— Electron 主进程：注册 `app://` 自定义协议承载游戏资源（保证页面内
  XHR/fetch 能加载本地 `data/*.json`，`file://` 下会被 Chromium 拦截）；放行媒体/全屏/指针锁定权限；
  单实例锁；游戏完全运行在沙箱（无 Node 集成）。
- `desktop/app/` —— 游戏本体（由根目录 `index.html`、`privacy.html`、`css/`、`js/`、`data/`、`img/`、`dishes/` 拷贝生成）。
- `desktop/package.json` —— electron-builder 打包配置（`build` 字段）。
- `desktop/build/icon.png` —— 应用图标源（1024×1024，electron-builder 自动生成 ico/桌面图标）。
- `desktop/patch-nsis-uninstaller.js` —— electron-builder 25.1.8 的 arm64 NSIS 补丁（见第五节）。

## 1. 产物一览（`release/`）

所有文件 SHA256 校验和见 [`release/SHA256SUMS.txt`](../release/SHA256SUMS.txt)。

### Windows（x64 / x86(ia32) / arm64 三架构，全部已 Authenticode 签名）

| 文件 | 说明 |
|------|------|
| `release/windows/CanZher-1.0.0-Setup-x64.exe` | x64 安装器（NSIS） |
| `release/windows/CanZher-1.0.0-Setup-ia32.exe` | 32 位（x86/ia32）安装器 |
| `release/windows/CanZher-1.0.0-Setup-arm64.exe` | ARM64 安装器（Surface Pro X 等 Windows on ARM） |
| `release/windows/CanZher-1.0.0-Setup.exe` | 三架构**合并安装器**（自动选择匹配架构） |
| `release/windows/CanZher-1.0.0-Portable-*.exe` | 免安装便携版（三种架构 + 合并版），同样已签名 |
| `release/windows/CanZher-1.0.0-{x64,ia32,arm64}.zip` | 免安装 zip（解压即用，运行 exe 为解压目录内 `餐这儿.exe`） |
| `*.exe.blockmap` | 自动更新差分包元数据，可不分发 |

### Linux（deb + rpm × amd64/arm64/armhf，已 GPG 签名）

| 文件 | 适用 |
|------|------|
| `release/linux/canzher-3d_1.0.0_amd64.deb` | Debian/Ubuntu/Deepin/UOS 等 x86_64 |
| `release/linux/canzher-3d_1.0.0_arm64.deb` | 上述系的 arm64（鲲鹏、飞腾等） |
| `release/linux/canzher-3d_1.0.0_armv7l.deb` | 上述系的 32 位 armhf |
| `release/linux/canzher-3d-1.0.0.x86_64.rpm` | openEuler/Fedora/CentOS/openKylin 等 x86_64 |
| `release/linux/canzher-3d-1.0.0.aarch64.rpm` | RPM 系 arm64 |
| `release/linux/canzher-3d-1.0.0.armv7l.rpm` | RPM 系 armv7hl |
| `release/linux/apt-repo/` | 已签名的本地 apt 仓库（含 InRelease/Release.gpg） |

> Electron 官方不再提供 linux-x86(32位) 与 armel 构建，故 Linux 侧为 amd64/arm64/armhf 三架构。

## 2. Windows 签名说明

签名使用本地生成的**自签代码签名证书**（对外正式发布建议购买正式证书替换，见下文）：

| 项 | 值 |
|----|----|
| 主题 | `CN=CanZher, O=CanZher, C=CN` |
| 指纹（SHA-1） | `8C14FC73C1851BC902FEB9D4878D372339471A5F` |
| 算法 | RSA 3072 / SHA-256，RFC3161 时间戳（timestamp.digicert.com） |
| 有效期 | 2026-11-01 至 2036-11-01 |
| PFX（含私钥） | `cert/canzher-codesign.pfx`，密码见 `cert/desktop-signing-readme.txt`（本地文件，不入库） |
| 公钥证书 | `cert/canzher-codesign.cer`（用户信任时安装的文件；不随仓库/Release 分发，需要时向作者索取） |

签名覆盖：应用主程序 `餐这儿.exe`（各架构）、卸载器、全部 NSIS 安装器、全部便携版 exe。
重新生成证书：`powershell -File tools/gen-codesign-cert.ps1`。

**用户侧验证签名**（PowerShell）：

```powershell
Get-AuthenticodeSignature .\CanZher-1.0.0-Setup-x64.exe | Format-List Status, StatusMessage, TimeStamperCertificate
```

自签证书验证结果为 `UnknownError`+「证书链在不受信任的根证书中终止」属**预期现象**；
只要 `SignerCertificate` 指纹为上表值且报错不是 `HashMismatch`，即签名完好。

**让 Windows 识别为受信任发布者**（消除"未知发布者"提示）：双击 `canzher-codesign.cer`
→「安装证书」→ 存储位置选「本地计算机」→ 放入「受信任的根证书颁发机构」。
注意：自签签名**不能**消除 SmartScreen 警告，正式对外分发请购买代码签名证书（OV/EV）。

**换用正式证书重签**：把正式 PFX 路径/密码设为环境变量 `CSC_LINK` / `CSC_KEY_PASSWORD`
后重新打包即可（流程同第五节），或对现有 exe 重签：

```powershell
signtool sign /fd SHA256 /tr http://timestamp.digicert.com /td SHA256 /f 正式.pfx /p 密码 文件.exe
```

## 3. Linux 签名说明

deb/rpm 均用同一把 GPG 密钥签名（本地生成，无口令保护，仅用于本包分发）：

| 项 | 值 |
|----|----|
| 身份 | `CanZher Release <canzher@canzher.local>` |
| 算法 | RSA 3072 |
| 指纹 | `D07040EF1614D539C4BC67B6D65E7A86D8553E14` |
| 公钥 | `release/keys/CANZHER-GPG-PUBLIC-KEY.asc`（仅存本地，不随仓库/Release 分发） |
| 私钥备份 | `cert/canzher-gpg-secret-key.asc`（勿提交/外传） |

### rpm 验证（openEuler/Fedora 等）

```bash
rpm --import CANZHER-GPG-PUBLIC-KEY.asc
rpm -K canzher-3d-1.0.0.x86_64.rpm        # 应输出: digests signatures OK
```

### deb 验证（Debian/Ubuntu/Deepin 等）

每个 deb 附带分离签名 `.deb.sig`：

```bash
gpg --import CANZHER-GPG-PUBLIC-KEY.asc
gpg --verify canzher-3d_1.0.0_amd64.deb.sig canzher-3d_1.0.0_amd64.deb
```

### 用 apt 仓库安装（自动验签）

把整个 `release/linux/apt-repo/` 目录放到任意 HTTP 服务或本地路径：

```bash
# 本地目录方式
echo "deb [trusted=no signed-by=/路径/CANZHER-GPG-PUBLIC-KEY.asc] file:/路径/apt-repo stable main" \
  > /etc/apt/sources.list.d/canzher.list
gpg --dearmor < CANZHER-GPG-PUBLIC-KEY.asc > /usr/share/keyrings/canzher.gpg   # 或用上面 signed-by 指明 asc
apt update && apt install canzher-3d
```

> 提示：apt 实际校验的是仓库元数据（`InRelease`/`Release.gpg`，已签名），
> `.deb.sig` 分离签名用于不开仓库时的手动校验，两者都基于同一把密钥。

## 4. 重新构建

前置：Windows 侧需要 Node.js ≥ 18；Linux 侧用 WSL（`deepin` 出 deb、`openEuler-22.03` 出 rpm，
用户名/发行版不同时改脚本里的 `wsl -d <发行版>`）。

### Windows（x64/ia32/arm64，NSIS+便携+zip，自动签名）

```powershell
cd desktop
npm install
node patch-nsis-uninstaller.js        # electron-builder 25.1.8 的 arm64 NSIS 补丁，见下
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
$env:ELECTRON_BUILDER_BINARIES_MIRROR="https://npmmirror.com/mirrors/electron-builder-binaries/"
$env:CSC_LINK="..\cert\canzher-codesign.pfx"          # 换正式证书时改这里
$env:CSC_KEY_PASSWORD="<PFX密码，见 cert/desktop-signing-readme.txt>"
npx electron-builder --win --x64 --ia32 --arm64 -p never
```

产物在 `desktop/dist/`，同时输出到 win-unpacked 目录（运行版 exe）。

### Linux

```bash
# 1) openEuler 构建+签名 rpm（含 GPG 密钥生成与导出）
wsl -d openEuler-22.03 -u root -e bash desktop/wsl-openEuler.sh
wsl -d openEuler-22.03 -u root -e bash desktop/wsl-rpm-sign.sh

# 2) deepin 构建 deb（脚本 1），再导入密钥做分离签名 + apt 仓库签名（脚本 2）
wsl -d deepin -u root -e bash desktop/wsl-build.sh
wsl -d deepin -u root -e bash desktop/wsl-deb-sign.sh
```

改动游戏代码后：同步根目录文件到 `desktop/app/`（或直接在 `desktop/app/` 内改），再重新构建。
版本号在 `desktop/package.json` 的 `version` 字段。

## 5. 已知问题与补丁

**arm64 NSIS 在 x64 Windows 上构建失败（`spawn UNKNOWN`）**：electron-builder 25.1.8 签名卸载器时
会直接执行刚生成的 arm64 安装器 stub，而 x64 Windows 无法运行 ARM64 可执行文件。
本工程用 `desktop/patch-nsis-uninstaller.js` 打补丁：执行失败时改走
`UninstallerReader.exec()`（纯解析 NSIS 存档提取卸载器，与 macOS 路径相同）。
`npm install` 后需重新执行一次（幂等）。升级 electron-builder 后若补丁不再需要可跳过。

**winCodeSign 解压报「客户端没有所需的特权」**：其压缩包含 macOS 符号链接，非管理员无法创建。
只需保证 `%LOCALAPPDATA%\electron-builder\Cache\winCodeSign\winCodeSign-2.6.0\` 存在
（缺失时可用 7-Zip 手动解压官方 `winCodeSign-2.6.0.7z` 到该目录，忽略两个 darwin 符号链接报错）。

## 6. 产物目录结构

```
release/
├── windows/           # 安装器 / 便携版 / zip（全部已签名）
├── linux/             # deb(+.sig) / rpm / apt-repo
└── SHA256SUMS.txt     # 全部产物校验和
```

> 公钥文件（`release/keys/` 下的 cer 与 GPG 公钥）仅保留在本地，不上传仓库与 Release。
