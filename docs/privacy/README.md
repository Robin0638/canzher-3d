# 隐私政策与合规文件说明

本目录存放《餐这儿》各平台的隐私政策，以及与 DCloud（HBuilderX）官方要求、应用商店审核要求相对应的核对与填报指引。

## 文件清单

| 文件 | 用途 |
|------|------|
| [`privacy-policy-android.md`](./privacy-policy-android.md) | Android 版隐私政策全文（国内应用市场 / Google Play 提交用） |
| [`privacy-policy-ios.md`](./privacy-policy-ios.md) | iOS 版隐私政策全文（App Store Connect「隐私政策 URL」提交用） |
| [`privacy-policy-web.md`](./privacy-policy-web.md) | 网页 / H5 版隐私政策全文（托管网页版挂载用） |
| [`../../privacy.html`](../../privacy.html) | 应用内离线隐私政策页（安卓隐私弹窗的链接目标，无需联网即可打开） |
| [`../androidPrivacy.json`](../../androidPrivacy.json) | HBuilderX 3.2.1+ 原生隐私政策提示框配置（新方式） |
| 根目录 `manifest.json` → `plus.privacy` | 5+ App 隐私政策提示框配置（旧方式，与上一条内容一致、双保险） |

> 政策版本 V1.0，生效日期 2026-10-25。**修改政策文本后，务必同步更新：三份 md、`privacy.html`、政策顶部版本号与日期，并把 `androidPrivacy.json` 的 `version` 加一**（这样老用户升级后会重新弹出隐私弹窗）。

## 一、政策条款与代码实际行为的对照（核对表）

下表是每条政策表述在代码里的依据，保证"协议与软件各功能一一对应"。改动对应功能时必须同步改政策。

| 政策表述 | 代码依据（核实于 2026-10-25） |
|----------|-------------------------------|
| 不联网、无任何对外网络请求 | `js/game.js` 全文无对外 `XMLHttpRequest`/`fetch` 调用（`fetch(` 仅存在于内联 three.js r147 的加载器代码中，未被实际调用）；`index.html` 不引用任何外部 CDN 资源 |
| 昵称仅存本地，2–12 字符 | `localStorage` 键 `cze_nick`；`cleanName(s,12)` 清洗 + `u.length<2` 校验；「修改昵称」`resetNick()` 清除该键 |
| 游戏存档仅存本地 | `localStorage` 键 `cze_users`（资金/店铺/成就等）；多存档即该对象的多个昵称键；无任何上传代码 |
| 旧版《餐志儿》存档一次性迁移 | 首次读不到 `cze_users` 时从旧键 `wmt_users` 复制（`getUsers()`） |
| 新手教程标记 | `localStorage` 键 `cze_tutorial_done` |
| 存储权限仅在导出/导入时申请 | `withStoragePermission()` 仅由「导出存档/导入存档」按钮触发，内部调用 `plus.android.requestPermissions(['android.permission.WRITE_EXTERNAL_STORAGE'],...)`；权限被拒时回退 `plus.io.PRIVATE_DOC`（应用私有目录）并提示真实路径 |
| 导出文件名为「餐这儿存档.json」，兼容旧名「餐志儿存档.json」 | `SAVE_FILE_NAME='餐这儿存档.json'`；`tryLegacy()`/`fromPublic()` 会按旧文件名再找一遍 |
| 分享仅走系统分享面板，用户自主选择对象 | App 端写入私有目录后拉起系统分享（`plus.android` Native.js Intent / iOS 分享面板）；浏览器端 `navigator.share`+`canShare`（Web Share API），不支持时退回下载 |
| 平台判断读取 User-Agent 且不上传 | `/android/i.test(navigator.userAgent||'')` 等仅用于选择存档路径分支 |
| 无广告/推送/统计/登录/支付 SDK | `manifest.json` 未勾选任何原生模块与 `nativePlugins`；代码无相应调用 |
| three.js r147、Feather Icons 本地开源库 | `js/game.js` 内联 three.js r147；许可见根目录 `THIRD-PARTY-NOTICES.md` |
| DCloud 引擎采集启动时间/异常日志（含设备识别码） | DCloud 官方要求披露的参考条款（见下节），来源：HBuilderX 云打包基座自身行为 |
| iOS 已关闭 IDFA | `manifest.json` → `plus.distribute.apple.idfa: false` |
| 反馈邮箱 developrobin130@163.com | `data/config.json` → `contactEmail`，游戏「关于」页与「我的」页渲染 mailto 链接 |
| 应用内可随时查看隐私政策（工信部要求） | 「关于」弹窗新增「隐私政策」卡片（`showAbout()`），点击以新窗口打开本地 `privacy.html`，离线可用 |

## 二、DCloud（HBuilderX）官方要求核对

对照 DCloud 官方文档《[Android 平台隐私与政策提示框配置](https://uniapp.dcloud.net.cn/tutorial/app-privacy-android)》《[配置方法（DCloud 社区 36937）](https://ask.dcloud.net.cn/article/36937)》逐项核对：

| 官方要求 | 本项目落实情况 |
|----------|----------------|
| Android 首次启动必须弹出隐私政策提示框，用户同意前不得采集个人信息/申请权限 | 已配置 `manifest.json → plus.privacy`（template 原生模板，splash 阶段弹出）+ 根目录 `androidPrivacy.json`（HX 3.2.1+，真机运行可预览、离线打包优先级更高），两处内容一致 |
| 接受按钮文案须为"同意"类，不得写"我知道了" | 接受按钮为「同意并接受」/「同意并继续」 |
| 拒绝后需二次确认，仍拒绝则退出应用 | 已配置 `second` 二次确认弹窗，拒绝按钮「退出应用」 |
| 弹窗正文须含《隐私政策》链接 | 链接指向应用内离线页 `privacy.html`（HX 3.2.5+ 支持本地地址），无网络也可打开 |
| 《隐私政策》必须告知"基于 DCloud（5+ App/uni-app）开发"并附参考条款（采集启动时间、异常日志，含 IMEI/Android ID/DEVICE_ID/IDFA/SIM IMSI/OAID 等识别码用于统计） | 已写入 Android 版政策第五条第 1 款，含 DCloud 等保三级证书编号 11010813802-20001 及官方说明链接（iOS 版为对应的 IDFA 关闭表述） |
| 使用 HBuilderX 3.2.15+ 打包并使用 template 模式 | 使用较新 HBuilderX 云打包即可满足；项目两种配置方式都指向 template 模式 |
| 同意前不调用可能弹系统授权框的 API | 本应用唯一权限（存储）只在用户点击「导出存档/导入存档」时申请，远晚于首启弹窗 |
| androidPrivacy.json 内不得写注释 | 该文件为纯 JSON，无注释 |

## 三、上架 / 发布填报指引

### 1. 国内 Android 应用市场（华为、小米、OPPO、vivo、应用宝等）

1. **隐私政策 URL**：各市场要求一个可在线访问的政策地址。把根目录 `privacy.html` 上传到任意静态空间（GitHub Pages / Gitee Pages / 你的服务器），或直接提交市场后台使用 Android 版政策全文（`privacy-policy-android.md`）转成的页面。**不要**填本地路径。
2. **权限用途说明**（市场后台逐项填写）：`WRITE_EXTERNAL_STORAGE`/`READ_EXTERNAL_STORAGE` → 「用于用户主动导出/导入游戏存档文件到设备文档目录；用户拒绝授权后应用自动改存应用私有目录，功能不受影响」。
3. **SDK 清单**：DCloud 5+ App Runtime（数据用途见政策第五条）；无其他第三方 SDK。
4. **包名/签名**：见 [docs/build.md](../build.md) 第 3、4 节（当前包名 `com.canzher.game`，`manifest.json` 的 `packagename` 发布后不可更改）。

### 2. Google Play（Data safety 数据安全表）

| 表单项 | 建议填法（与政策对应） |
|--------|------------------------|
| Does your app collect or share any of the required user data types? | Yes（因 DCloud 引擎采集启动时间/崩溃日志，含设备识别码，用于 Analytics） |
| Collected data types | Device or other IDs；App activity（App interactions）与 App info and performance（Crash logs、Diagnostics），按 DCloud 引擎实际采集勾选 |
| Purpose | Analytics（应用分析） |
| Data shared | No（不与第三方共享） |
| Data encrypted in transit / deletion mechanism | 按 DCloud 引擎实现勾选；用户侧删除方式=卸载应用 |
| Permissions | Storage（旧系统上申请，用途：用户主动导出/导入存档） |

> 若后续构建改为纯离线打包且确认剥离了 DCloud 统计采集，可改为 Data Not Collected——以当次打包产物的实际行为为准。

### 3. App Store（隐私标签，App Store Connect）

| 表单项 | 建议填法 |
|--------|----------|
| Data Used to Track You | None（`idfa:false`，不追踪） |
| Data Linked to You | None（无账号体系） |
| Data Not Linked to You | Identifiers → Device ID；Diagnostics → Crash Data、Performance Data，用途均为 Analytics（对应 DCloud 引擎条款） |
| 隐私政策 URL | 托管后的 `privacy.html` 或 iOS 版政策页面地址 |

### 4. 网页版

托管网页版时，把 `privacy-policy-web.md`（或 `privacy.html`）一并放到站点，并在页面页脚或「关于」处给出链接即可。

## 四、日常维护约定

1. **换反馈邮箱**：改 `data/config.json → contactEmail` 后执行 `node tools/build-data-bundle.js`，**并同步修改三份政策与 `privacy.html` 第十节邮箱**；
2. **新增功能涉及新数据/权限/SDK**（例如未来加云存档、推送、广告）：先更新政策与对照表，再发版；
3. **政策文本更新**：递增政策顶部版本号、生效日期，并把 `androidPrivacy.json` 的 `version` 加一，让已安装用户升级后重新确认；
4. 每次发版前，用本 README 第一节对照表快速自查一遍"政策 ↔ 代码"仍然一致。
