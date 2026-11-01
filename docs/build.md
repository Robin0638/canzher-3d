# 打包 APK / iOS App 步骤

本项目使用 DCloud 5+ Runtime（`manifest.json`），通过 **HBuilderX** 打包为原生 App。

## 1. 环境准备

- 下载 [HBuilderX](https://www.dcloud.io/hbuilderx.html)（标准版即可）
  - **注意**：项目结构里同时包含 `unpackage/`（HBuilderX 标准版产物）。如使用 **Alpha 版**，需自行重新生成资源。
- 安装 Android/iOS 真机或模拟器，用于本地运行验证
- 一个有效的 Android 签名 keystore（首次发布必备）

## 2. 打开项目

1. 启动 HBuilderX
2. 菜单 `文件 → 打开目录`，选择本仓库根目录（包含 `manifest.json` 的目录）
3. HBuilderX 会识别为 `5+ App` 项目

## 3. 配置 `manifest.json`

打开根目录的 `manifest.json`，按需修改：

| 字段 | 作用 | 示例 |
|------|------|------|
| `id` | 应用唯一标识（包名），**发布后不可更改** | `com.yourname.canzheer` |
| `name` | 桌面图标名称 | `餐这儿` |
| `version.name` / `version.code` | 版本号（每次发版递增 `code`） | `1.0` / `100` |
| `description` | 应用描述 | 餐饮公司经营小游戏 |
| `icons.*` | 应用图标（已指向 `unpackage/res/icons/`） | — |

修改后保存即可。

## 4. Android 签名

**首次打包必须配置签名**，否则无法上架。

1. 菜单 `发行 → 原生 APP-云打包`
2. 选择 `Android`，点击「生成自有证书」或「使用自有证书」
   - 推荐使用自有 `.keystore`（密码妥善保管，**丢失 = 无法升级 App**）
3. 在 `manifest.json` 的 `plus.distribute.google` 区块填入：
   ```json
   "google": {
     "packagename": "com.yourname.canzheer",
     "keystore": "your.keystore",
     "password": "******",
     "aliasname": "your-alias",
     "abiFilters": ["armeabi-v7a", "arm64-v8a"]
   }
   ```
4. 确认后提交云端打包

## 5. iOS 打包（可选）

需要 Apple 开发者账号（$99/年）。

1. 在 `plus.distribute.apple` 区块填入：
   - `appid`：Apple 开发者后台申请
   - `p12` / `mobileprovision` / `password`：打包证书三件套
2. 选择 `iOS`，提交云端打包
3. 下载 IPA 后用 Xcode / Transporter 上传 App Store Connect

## 6. 隐私合规（上架前必做）

项目已内置 DCloud 官方要求的 Android 原生隐私政策提示框与全套隐私政策文本，无需额外开发：

- **首启弹窗**：根目录 [`androidPrivacy.json`](../androidPrivacy.json)（HBuilderX 3.2.1+，真机运行可预览）+ `manifest.json` → `plus.privacy`（旧方式兜底）。**两处文案一致，改一处必须同步另一处**；`androidPrivacy.json` 内不能写注释
- **政策文本**：`docs/privacy/`（Android / iOS / 网页三版）与应用内离线页 [`privacy.html`](../privacy.html)
- **政策 ↔ 代码对照表、各市场填报指引**：[docs/privacy/README.md](./privacy/README.md)

上架前检查：

1. 真机运行确认：首启弹窗正常弹出 → 点「暂不同意」出现二次确认 → 可退出应用；弹窗内《隐私政策》链接离线可打开
2. 游戏内「关于 → 隐私政策」可打开 `privacy.html`
3. 若目标市场要求 https 政策链接，把 `privacy.html` 托管到静态空间（方法见 docs/privacy/README.md 第六节）
4. 政策文本如有改动：同步更新三份 md + `privacy.html` + 两个弹窗配置，并把 `androidPrivacy.json` 的 `version` 加一（老用户升级后会重新弹出确认）

## 7. 输出位置

- 云打包完成后下载链接会出现在 HBuilderX 控制台
- 默认下载到 `unpackage/release/`

## 8. 常见问题

| 问题 | 排查 |
|------|------|
| 打包失败：未配置签名 | 回到第 4 步 |
| 真机白屏 | 打开 `index.html` 直接在浏览器跑一遍，确认不是代码 Bug |
| 包名冲突 | `manifest.json` 的 `id` 必须全局唯一 |
| 升级时安装失败 | 确认 `version.code` 比上一版大；签名 keystore 一致 |

## 9. 本地预览（不打包）

打包前先用 HBuilderX 的 `运行 → 运行到手机或模拟器` 调试，或直接浏览器打开 `index.html`。

---

> 💡 云打包有免费额度（按 DCloud 政策）；高频发版可考虑本地打包工具链（gradle / Xcode）。