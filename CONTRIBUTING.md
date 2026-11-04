# 贡献指南

欢迎来到 **餐这儿**！无论是修 Bug、调数值、加菜品，还是完善文案与图标，都欢迎你参与。

## 渠道

| 场景 | 方式 |
|------|------|
| 报 Bug / 反馈体验问题 | [GitHub Issues](../../issues) |
| 功能建议 / 玩法讨论 | [GitHub Discussions](../../discussions) |
| 提交代码 / 资料 | Fork → 分支 → Pull Request |
| 安全漏洞 | 私下联系维护者，**不要**直接发公开 Issue |

## 贡献类型

### 1. 内容贡献（最简单，无需懂代码）

所有菜品、店铺、时令菜都已外置到 `data/` 目录下的 JSON，**直接编辑 JSON 即可参与**：

| 数据 | 文件 | 说明 |
|------|------|------|
| 基础菜品 | `data/dishes.json` | 单品定义（名称、价格、烹饪时间、所属类别…） |
| 店铺配置 | `data/shops.json` | 店铺类型（名称、专营品类、初始加成、菜单…） |
| 时令菜品 | `data/seasonal_dishes.json` | 季节性特供 |
| 事件 / 数值 / 评价 | `data/events.json`、`data/upgrades.json`、`data/reviews.json`、`data/config.json` | 见下方 |

> 每个 JSON 的**完整字段说明与示例**见 [`docs/MODDING.md`](./docs/MODDING.md)。

> 修改后用**本地服务器**打开（见 README 方式二）刷新即生效。
>
> 若希望 `file://` 双击模式也用上你的改动，执行一次：
>
> ```bash
> node tools/build-data-bundle.js
> ```
>
> 它会重新生成 `js/data-bundle.js`，请把该文件一起提交。
>
> 图片请放到 `dishes/`（按品类前缀：`ck_` 炸鸡、`hb_` 汉堡、`pz_` 饺子面食、`cp_` 中式餐厅、`mt_` 奶茶、`ds_` 甜品…）。

### 2. 代码贡献

```
fork → git clone → 新建分支 → 修改 → 本地验证 → 提交 PR
```

- 分支命名：`feat/<topic>`、`fix/<topic>`、`docs/<topic>`
- Commit 风格：`动词 + 范围`，例如 `feat: 加盟招商新增退款流程`
- 一次 PR 只解决一个问题，便于 Review
- 修改 `js/game.js` 时注意保持全局命名空间不污染

### 3. 美术 / 图标

- 菜品图：`dishes/`，方形 PNG（建议 256×256），按现有品类前缀放置
- UI 图标：`icons/`，SVG，与 [Feather Icons](https://feathericons.com/) 风格保持一致
- 头像：`img/avatars/`，命名 `avatar-<name>-<时间戳>.png`

## 数据驱动化约定（Mod 兼容）

为未来 `mods/` 目录与第三方内容做准备，新增 JSON 字段时请：

- **只做加法**，不要删除或重命名已有字段（影响玩家存档兼容）
- 新字段必须提供默认值，详见 `js/game.js` 中 `loadGame` 的字段补全逻辑
- 未知字段请忽略而非报错

## 行为准则

- 保持友善与建设性
- 尊重原创内容许可证：代码 PolyForm Noncommercial 1.0.0（非商业使用免费，商用需联系作者授权）、素材 CC BY 4.0（详见 [LICENSE](./LICENSE)）
- 商业品牌 / 商标请走通用品类词（如「炸鸡」而非具体品牌名）

## 联系方式

- 问题反馈邮箱：<developrobin130@163.com>
- GitHub Discussions（首选）
- Issues（用于明确问题追踪）

感谢你的贡献 🙏