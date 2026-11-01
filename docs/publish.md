# 发布到 GitHub / GitCode 操作指南

> 仓库已完成首次提交（分支 `main`）。构建产物（约 2.5GB）**不进 git**，
> 通过两个平台的 **Release（发行版）附件** 分发，发布文案用
> [docs/RELEASE-NOTES-v1.0.0.md](RELEASE-NOTES-v1.0.0.md)。

## 1. 推送仓库代码

### GitHub

1. 在 https://github.com/new 新建仓库（如 `canzher-3d`），**不要**勾选初始化 README/.gitignore/License（本地已有）。
2. 推送（首次推送会弹出 Git Credential Manager 登录窗口，浏览器授权即可，无需手工创建 Token）：

   ```bash
   git remote add origin https://github.com/<你的用户名>/canzher-3d.git
   git push -u origin main
   ```

### GitCode

方式 A（最省事）：GitCode 首页 →「新建仓库」→「导入已有仓库」→ 填 GitHub 仓库地址，一键导入。

方式 B（独立推送）：在 https://gitcode.com 新建同名空仓库，然后：

```bash
git remote add gitcode https://gitcode.com/<你的用户名>/canzher-3d.git
git push -u gitcode main
```

HTTPS 推送 GitCode 时密码处填「私人令牌」（GitCode 头像 → 设置 → 安全设置 → 私人令牌）。

> 以后每次发版：`git push` + `git push gitcode` 即可同步两边。

## 2. 上传 Release 安装包

### GitHub

- 网页方式：仓库页 → Releases → Draft a new release → 标签填 `v1.0.0` →
  说明粘贴 `docs/RELEASE-NOTES-v1.0.0.md` 内容 → 把下列文件拖进附件区 → Publish：

  - `release/windows/`：全部 `.exe` 和 `.zip`（blockmap 可不传）
  - `release/linux/`：全部 `.deb` `.deb.sig` `.rpm`

  > 注意：不要上传任何密钥/证书文件（公钥也不传，验签公钥需要时私下提供）。

- 命令行方式（更快，2.5GB 推荐这种）：

  ```powershell
  winget install GitHub.cli   # 已装可跳过
  gh auth login
  gh release create v1.0.0 `
    release/windows/*.exe release/windows/*.zip `
    release/linux/*.deb release/linux/*.deb.sig release/linux/*.rpm `
    --title "餐这儿 3D v1.0.0" --notes-file docs/RELEASE-NOTES-v1.0.0.md
  ```

### GitCode

仓库页 → 「发行版」→「新建发行版」→ 标签 `v1.0.0` → 粘贴同样的说明 → 上传附件 → 发布。
若 GitCode 单文件有大小限制，大文件只放 GitHub Release，GitCode 侧保留说明与校验和即可。

## 3. 注意事项

- **绝不上传**：`cert/` 目录（keystore、PFX、GPG 私钥、密码说明）——已被 .gitignore 排除，别手动加进来。
- `manifest.json` 里 Android 打包密码已清空（避免公开泄露）：云打包时在 HBuilderX 界面输入，
  本地明文密码备份在 `cert/readme.txt`。若仓库设为私有想恢复，把该行填回即可。
- 本仓库 git 身份是 `CanZher <canzher@canzher.local>`（仓库级配置），如需改成自己的账号：
  `git config user.name 你的名字 && git config user.email 你的邮箱`。
