# 第三方组件声明

本项目的运行时依赖已在仓库内内置，无需联网或安装。

## Three.js（r147）

- **位置**：`js/game.js` 第 7 行（压缩后内联，约 593 KB，UMD 形式挂载到 `window.THREE`）
- **用途**：店铺 3D 场景渲染
- **许可**：MIT License
- **版权**：Copyright © 2010–2022 three.js authors
- **主页**：<https://threejs.org> · <https://github.com/mrdoob/three.js>
- **许可证全文**：<https://github.com/mrdoob/three.js/blob/dev/LICENSE>

依据 MIT 条款，此处保留其版权声明。

## Feather Icons（图标来源）

- **位置**：`js/game.js` 中 `IP` 常量表（SVG path 内联，约 90 个图标）
- **许可**：MIT License
- **版权**：Copyright © 2013–2017 Cole Bemis
- **主页**：<https://feathericons.com>
- **许可证全文**：<https://github.com/feathericons/feather/blob/main/LICENSE>

`icons/` 目录下的 79 个 SVG 为同源导出文件，供设计与文档使用，运行时不加载。
该目录已附 MIT 许可证全文（[`icons/LICENSE`](./icons/LICENSE)）。

## AI 生成素材

`dishes/` 下的 181 张菜品图与 `img/avatars/` 下的 7 张头像，均由**百度智能云千帆大模型平台**（付费消耗积分）生成。
全部 PNG 文件内已写入符合《人工智能生成合成内容标识办法》的隐式标识（`tEXt AIGC` 块，含 `ContentProducer` 与 `ProduceID`）。

- **授权依据**：《百度千帆大模型服务及Agent开发平台用户协议》（2026-01-09 生效）第 8.1、9 条，
  生成输出的知识产权归用户所有，允许商用与再分发（详见 [`LICENSE-assets`](./LICENSE-assets)）。
- 应用内「关于」页已做显式标识（标注「部分图片由 AI 生成」），履行协议第 6.5 条标识义务。
- 其余素材（UI 图标、截图）不含 AIGC 标识，非 AI 生成。

---

## 维护提示

- 升级 Three.js 时，请同步更新本文件的版本号与版权年份。
- 新增任何内联第三方代码，都必须在此登记许可信息。
