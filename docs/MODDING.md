# 内容 Mod 制作指南

> **适用版本**：数据驱动化完成之后（菜品 / 评价 / 事件 / 升级表全部外置到 `data/*.json`）
> **难度**：会改 JSON 即可，**不需要写 JavaScript**
> **许可证**：代码 PolyForm Noncommercial 1.0.0（Mod 与二次创作免费，商用需联系作者授权），素材 CC BY 4.0（见 [LICENSE](../LICENSE)、[LICENSE-assets](../LICENSE-assets)）

餐这儿的所有静态内容都已经从 `js/game.js` 抽到 `data/` 目录下的 7 个 JSON 文件里。
**改 JSON = 改游戏内容**，这就是目前的 Mod 方式。

---

## 0. 我想改什么 → 改哪个文件

| 目标 | 文件 | 需要懂代码 |
|------|------|-----------|
| 新增 / 改价 / 改出餐时间的菜品 | `data/dishes.json` | 否 |
| 调整店铺（店型、初始资金、初始员工、菜单） | `data/shops.json` | 否 |
| 新增时令菜（春夏秋冬限定） | `data/seasonal_dishes.json` | 否 |
| 加随机事件、改事件概率与效果 | `data/events.json` | 否（效果用声明式 DSL） |
| 加评价文案、差评回复话术、聊天话术 | `data/reviews.json` | 否 |
| 调平衡性数值（升级、贷款、人才、加盟、季节系数） | `data/upgrades.json` | 否 |
| 调全局参数（1 天多长、订单间隔、评分分布、教程、3D 配色） | `data/config.json` | 否 |
| 改游戏逻辑 / 加玩法 | `js/game.js` | 是 |

---

## 1. 运行模式（决定你改完要不要重新打包）

游戏有两条取数路径，由 `js/game.js` 的 `ensureDataLoaded()` 决定：

| 模式 | 怎么开 | 读的是哪份数据 | 改完要做什么 |
|------|--------|----------------|--------------|
| **本地服务器**（推荐做 Mod 用） | `python -m http.server 8000` 或 `npx serve .`，访问 <http://localhost:8000> | **直接读 `data/*.json`** | 刷新页面即可 |
| **`file://` 双击** | 直接双击 `index.html` | `js/data-bundle.js` 里的内置副本（浏览器拦截 XHR 时的兜底） | 执行一次 `node tools/build-data-bundle.js` 重新生成副本 |

> **提交 PR 时**：如果你改了 `data/*.json`，请顺手跑一次
> `node tools/build-data-bundle.js`，并把生成的 `js/data-bundle.js` 一起提交，
> 否则双击模式下的玩家看不到你的改动。

---

## 2. 数据文件总览

| 文件 | 顶层结构 | 注入到 `game.js` 的全局变量 |
|------|----------|------------------------------|
| `data/dishes.json` | `{dishes[], brandMenus{}}` | `DISHES`、`BRAND_MENUS` |
| `data/shops.json` | `[shop]` | `SHOP_TYPES` |
| `data/seasonal_dishes.json` | `[dish]` | `SEASONAL_DISHES` |
| `data/events.json` | `{slangEvents, realEvents, competitorEvents, competitorNames, personEvents, newsPool, spyTexts}` | `SLANG_EVENTS`、`REAL_EVENTS`、`PERSON_EVENTS`… |
| `data/reviews.json` | 28 个评价 / 聊天 / 黑话题 | `REVIEWS`、`WAIMAI_REVIEWS`、`REVIEW_TOPIC_RULES`… |
| `data/upgrades.json` | 18 张数值表 | `ACHIEVEMENTS`、`TALENT_POOL`、`FRANCHISES`… |
| `data/config.json` | 全局参数 + `stateDefaults` | `CONFIG`、`DINE_HOURS`、`SHOP3D_THEMES`… |

加载顺序见 `js/game.js` 的 `DATA_FILES` 数组；全部就绪后执行 `finalizeData()`
（把事件效果 DSL 编译成函数、把 `brandMenus` 回挂到对应加盟品牌）。

---

## 3. 字段参考

### 3.1 `data/dishes.json` — 菜品

```jsonc
{
  "dishes": [
    {
      "id": "egg_rice",        // 唯一 ID，英文小写下划线；存档按 id 记录，改 id = 旧档失效
      "name": "蛋炒饭",         // 显示名
      "icon": "egg",           // Feather 图标名（js/game.js 内置图标表）
      "price": 15,             // 售价（元）
      "cookTime": 4,           // 出餐耗时（游戏内分钟/节拍）
      "unlocked": true,        // 是否开局就有；false 则需要花 cost 解锁
      "region": "家常",         // 分类标签，仅展示与筛选
      "cost": 0                // 解锁费用（可选，unlocked=false 时有意义）
    }
  ],
  "brandMenus": {
    "golden_rice": [           // key = 加盟品牌 id（见 upgrades.json 的 franchises[].id）
      { "id": "g_egg", "name": "黄金蛋炒饭", "icon": "egg",
        "e": "🍳",             // emoji，菜品卡片/气泡上显示
        "price": 20, "cookTime": 4, "unlocked": true, "cost": 0, "region": "品牌" }
    ]
  }
}
```

**加一道菜**：往 `dishes` 数组里追加一条即可，`unlocked: false` 会变成需要解锁的菜。

### 3.2 `data/shops.json` — 店铺类型

```jsonc
{
  "id": "milktea",           // 与 shopFoodMap / themes / sloganPools 的 key 对应
  "shopEmoji": "🥤",
  "name": "奶茶小铺",
  "icon": "coffee",
  "desc": "…",
  "cost": 3000,              // 开店成本
  "income": 35,              // 基础收入系数
  "type": "饮品",
  "startMoney": 2000,
  "priceBonus": 0.15,        // 售价加成（0.15 = +15%）
  "trafficBonus": 0,         // 客流加成（可选）
  "speedBonus": 0,           // 出餐速度加成（可选）
  "staff":  [ { "id","name","role","roleIcon","icon","speed","salary","age","tag","desc","color" } ],
  "estaff": [ … ],           // 可雇佣员工池
  "dishes": [ { "id","name","e","price","cookTime","unlocked","cost","region" } ]
}
```

> `staff` / `estaff` 的字段与 `upgrades.json` 的 `startEmployees` / `talentPool` 一致
> （`roleIcon` 用 Feather 图标名，`speed` 是速度加成小数，`salary` 是日薪）。
> 但 `config.json` 的 `staff.baseSalary`（统一基准工资，当前 200）开着时，这里的 `salary`
> 会被它覆盖——入职、名单卡片显示、日结账单都按统一基准走，见 §4 前的说明。

### 3.3 `data/seasonal_dishes.json` — 时令菜

```jsonc
{
  "id": "se_sp_cai", "name": "春笋炒肉", "icon": "utensils",
  "e": "🎋",                       // emoji
  "img": "chao_rou.png",           // 图片文件名，位于 dishes/
  "price": 22, "cookTime": 5,
  "region": "时令",
  "season": "spring",              // spring / summer / autumn / winter
  "cat": "dish"                    // dish / juice
}
```

每个季节目前 5 条（3 菜 + 2 饮）。冬季结束会自动切换到下一个季节的池子。

### 3.4 `data/events.json` — 随机事件

普通事件：

```jsonc
{ "type": "poach", "name": "同行挖人", "desc": "隔壁连锁高薪挖你的员工！",
  "chance": 0.15,          // 每次判定的触发概率
  "minShops": 2 }          // 竞品事件用 minShops（最少门店数）
```

带效果的事件用 **effectSpec**（不要用闭包函数，JSON 存不了）：

```jsonc
{
  "type": "equip_break", "name": "设备故障", "desc": "冰柜坏了！食材报废+维修费",
  "chance": 0.08, "minLevel": 3,
  "notif": "下雨天订单暴增！…",                  // 可选：触发时的系统通知
  "effectSpec": {
    "ops": [
      { "kind": "moneySub", "pctOf": "dailyIncome", "pct": 0.05, "rand": [50, 200] }
    ],
    "result": "冰柜故障！报废食材+维修费 -{money}元"
  }
}
```

**`ops` 支持的 `kind`**（解释器见 `js/game.js` 的 `makeEventEffect`）：

| kind | 参数 | 作用 |
|------|------|------|
| `moneySub` | `pctOf`(状态字段) + `pct`(比例)，或 `rand:[min,max]` | 扣钱，结果写入 `{money}` |
| `setFlag` | `key`, `value` | 直接写状态字段（置标记 / 计数） |
| `setFromMul` | `from`(源字段), `key`(目标字段), `mul`, `fallback`, `round:'ceil'` | 按倍率派生一个字段（如订单暴增） |
| `locAdd` | `key`, `value` | 修改当前选址类型（`LOCATION_TYPES`）的数值，如租金上涨 |
| `adjAdd` | `key`, `pick:[up,down]` | 二选一增减（如平台抽佣上调/下调） |

`result` 是结果文案，支持 `{占位符}`（占位符 = op 写入的 key，如 `{money}`、`{dir}`、`{absPct}`）。
`locAdd` 找不到对应选址时，可配 `resultFallback` 作为兜底文案。

其他子表：

| 键 | 结构 | 说明 |
|----|------|------|
| `slangEvents` / `realEvents` | 数组，同上 | 加载时 `realEvents = realEvents.concat(slangEvents)`，两者都会生效 |
| `competitorEvents` | `{type,name,desc,chance,minShops}` | 竞品事件，无 effectSpec |
| `competitorNames` | `[string]` | 竞品公司名池 |
| `personEvents` | `{性格: [{msg, effect}]}` | `effect` 是字符串枚举（如 `strike`），性格 key 与员工 `personality` 对应 |
| `newsPool` | `{type,title,body,effect:{type:'cash',amt}}` | 每日新闻，`effect.type` 支持 `cash` / `buff` / `info` |
| `spyTexts` | `{neighbor:[], rival:[], boss:[]}` | 探子情报，元素 `{title,text,type,buff:{traffic}}` |

### 3.5 `data/upgrades.json` — 数值表

| 键 | 元素字段 |
|----|----------|
| `achievements` | `id,name,desc,icon` |
| `startEmployees` | `id,name,role,roleIcon,icon,speed,salary,baseSalary,age,tag,desc,color,isStart,fatigue,mood,shift` |
| `shopSelect` | `id,name,icon,desc,bonus,startMoney` |
| `mallTypes` | `id,name,icon,desc,cost,reqShops,bonus,desc2,slots,rent` |
| `locationTypes` | `id,name,icon,desc,rent,propertyFee,trafficMult,orderBaseMult,platformFee,color,tag,difficulty,suit` |
| `supplyTypes` | `{drink:[],food:[],noodle:[]}`，元素 `{id,name,icon,color,cookMult,costMult,qualityMod,desc,tag}` |
| `costTiers` | `{L1…L5:{platform,rent,utility,…}}` 各等级解锁哪些成本项 |
| `seasonData` | `{spring|summer|autumn|winter:{name,utilityMult,foodPriceMult}}` |
| `customerTypes` | `id,name,icon,budget,priceMult,tipChance,tipAmt,weight,tag,desc` |
| `promoTypes` | `id,name,icon,cost,days,priceMul,trafficMult,desc,shortDesc` |
| `lenders` | `{loanShark|bank|investor:{bankName,bossName,bossIcon,bossDesc,greet,warns[]}}` |
| `loanPlans` | `{folk:[],bank:[]}`，元素 `{id,name,amount,days,rate,fee,note,bossSay}` |
| `investPlans` | `id,name,amount,share,days,note,bossSay` |
| `talentPool` / `talentSpies` | `name,role,roleIcon,speed,salary,cost,age,tag` |
| `huntTargets` | `id,name,role,roleIcon,icon,speed,salary,fee,personality,personTag,color` |
| `franchises` | `id,name,icon,desc,bonusType,bonusVal,joinCost,dailyFee,desc2,unlockReq,goal`（`menu` 由 `dishes.json` 的 `brandMenus[id]` 自动回挂） |
| `quickBrands` | 同上 + `closeChance` |

### 3.6 `data/reviews.json` — 评价与聊天

| 键 | 结构 |
|----|------|
| `reviews` | `{1..5, invest, dine, dine_bad}` → 字符串数组，通用评价 |
| `waimaiReviews` | 200 条 `{id,rating,text,category,foodType,userType}`，带 schema 的「真实评价库」 |
| `dishReviewTemplates` | `{1..5}` 按星级生成评价的模板，含 `{dish}` 占位符 |
| `unrelatedReviews` | `[{rating,text}]` 跑题评价 |
| `reviewTopicRules` | `[{key,w:[]}]` 关键词 → 话题；`reviewTopicLabel` 是话题显示名 |
| `unrelatedMarkers` / `unrelatedSubRules` | 跑题判定关键词与规则 |
| `reviewReplyOptions` / `reviewReplyOptionsInvest` | 回复候选话术 |
| `reviewReplyTopics` / `investReplyTopics` | 按话题分组的回复库 |
| `shopFoodMap` | 店铺类型 → 评价 `foodType`（如 `milktea → 饮品`） |
| `starCat` | 星级 → `good/medium/bad` |
| `restaurantSlang` | `[{cat,term,meaning,game,example}]` 餐饮黑话词条 |
| `slangCats` / `slangToasts` | 黑话分类、触发时的 Toast |
| `chat*` | 聊天系统模板、话题规则、回复库、昵称与头像 |

**加一条差评**：往 `reviews["1"]` 或 `waimaiReviews` 追加即可（`waimaiReviews` 记得带 `rating` 与 `foodType`）。

### 3.7 `data/config.json` — 全局参数

| 键 | 说明 |
|----|------|
| `repoUrl` / `contactEmail` | 「关于」页的仓库入口与反馈邮箱（开源后必填） |
| `links` | 「关于」页的跳转入口：`{bilibili, douyin, repo}`，**留空则该行不显示**。公开发布建议留空——既不暴露个人账号，也避免应用内跳转第三方平台的审核风险；想挂自己的账号就填在这里，不要写死进 `game.js` |
| `time.dayLength` / `dineHours` / `bizHours` | 1 游戏天的现实秒数、营业时段选项 |
| `level` | 经验曲线 `expBase + lv*expLinear + lv²*expQuad`、等级解锁文案 |
| `staff` | **统一基准工资 `baseSalary`**、心情阈值 `moodRatios`、疲劳配色 `fatigueColorStops`、工资区间 `salaryMinRatio`/`salaryMaxRatio`/`salaryMinFloor`、摸鱼线 `slackingSalary` |
| `tuning` | 订单间隔、订单上限、评分分布、各类事件概率等**平衡性旋钮** |
| `names` | 顾客 / PK AI / 推理玩法玩家名、昵称前后缀、店名词素 |
| `dow` / `sloganPools` | 星期显示名、各店型 Slogan 库 |
| `tutorial.steps` | 新手引导步骤（`title/icon/body/target/placement`） |
| `themes` | 各店型的 3D 场景配色（`wall`/`floor`/`accent`/`kit` 等） |
| `scene3d` | 3D 厨房布局常量（灶台/备餐台/桌位坐标） |
| **`stateDefaults`** | **存档字段默认值，旧档缺字段时按此补全** |

> **`baseSalary` = 全员统一基准工资**（当前 200）。它一开，所有员工的**基准**和**入职工资**都取这一个数：
> 初始员工、人才市场雇佣、收购店铺带过来的店员、猎头挖来的人，以及人才市场/猎头名单卡片上还没雇时
> 显示的"日薪"，全部跟着它走，`data/*.json` 里每个人自己的 `salary` 就只是"没开统一基准时"的旧口径。
> 读老存档时会做一次**一次性迁移**（存档里记 `salaryBaseStamp`）：基准变了才重铺，同一基准下玩家之后
> 手动调的薪不会被每次读档刷回去；迁移会把当前工资也设成基准（比例 1.0 → 心情平稳），不会留下区间外的旧工资。
> 想恢复"每人按自己数据入职"就把 `baseSalary` 设成 `0` 或删掉这一行（已经铺过的存档保持现状，不会被反向重置）。
>
> 工资区间按**每个员工自己的基准** `baseSalary` 算：可调范围是
> `baseSalary × salaryMinRatio` ~ `baseSalary × salaryMaxRatio`（默认 0.3~3 倍，统一基准 200 时即 60~600），
> **`salaryMaxRatio` 设成 `0`（或任何 ≤0 的值）= 涨薪无上限**：`+1/+5` 按钮和留人加薪都不再顶格，
> 员工卡片显示「可调 60~无上限」；降薪下限、心情比例、摸鱼惩罚照旧生效。
> `salaryMinFloor` 是一道绝对下限，只在它**不高于该员工基准**时生效——设成比基准还大的值
> 会出现"点降薪反而涨钱"，所以代码里做了保护。`moodRatios` 按 `当前工资 ÷ 基准` 命中区间，
> 都没命中时用 `moodFallback`。
>
> 注意成本是**按人数**算的：日结工资 = Σ 每个在职员工的 `salary`，所以基准抬到 200 之后，
> 开局两个人就是 400 元/天，`slackingSalary`（摸鱼线 333）也离基准近多了——想调平衡就改这一个数。
> 改完 `config.json` 记得跑 `node tools/build-data-bundle.js`，否则 `file://` 直开的玩家仍读的是旧内联副本。

---

## 4. 实战：3 分钟加一道菜

1. 用本地服务器打开游戏（改完刷新即生效）：
   ```bash
   python -m http.server 8000     # 或 npx serve .
   ```
2. 编辑 `data/dishes.json`，在 `dishes` 数组末尾追加：
   ```json
   {
     "id": "my_luroufan",
     "name": "秘制卤肉饭",
     "icon": "utensils",
     "price": 26,
     "cookTime": 6,
     "unlocked": false,
     "cost": 800,
     "region": "台式"
   }
   ```
3. 若希望某家店开局就有这道菜，编辑 `data/shops.json`，在对应店铺的 `dishes` 数组里加：
   ```json
   { "id": "my_luroufan", "name": "秘制卤肉饭", "e": "🍛",
     "price": 26, "cookTime": 6, "unlocked": true, "cost": 0, "region": "台式" }
   ```
4. 刷新页面验证；确认无误后：
   ```bash
   node tools/build-data-bundle.js    # 同步 file:// 模式的内置副本
   ```
5. 提交 PR（`data/*.json` + `js/data-bundle.js`）。

---

## 5. 图片与图标资源

| 目录 | 用途 | 命名 |
|------|------|------|
| `dishes/` | 菜品图（方形 PNG，建议 256×256） | 按品类前缀：`ck_` 炸鸡、`hb_` 汉堡、`pz_` 饺子面食、`cp_` 中式餐、`mt_` 奶茶、`ds_` 甜品、`bbq_` 烧烤、`sf_` 海鲜、`ss_` 寿司、`nd_` 面点；也允许无前缀的自释名（如 `roujiamo.png`） |
| `icons/` | UI 图标 SVG 源文件（运行时用内联图标表，此目录供设计参考） | [Feather Icons](https://feathericons.com/) 风格 |
| `img/avatars/` | 头像 | `avatar-<name>-<时间戳>.png` |
| `docs/screenshots/` | README 截图 | `01-home.png` … |

菜品对象的 `icon` 用 **Feather 图标名**，`e` 用 **emoji**，`img` 用 **`dishes/` 下的文件名**。三者可只用其一。

---

## 6. 存档兼容铁律

玩家存档存在浏览器 `localStorage`，**改数据可能让旧档读不出东西**。请遵守：

1. **字段只做加法**：不要删除或重命名已有字段，不要改已有 `id`（存档按 id 引用菜品 / 员工 / 店铺）。
2. 新增状态字段时，同时在 `data/config.json` 的 `stateDefaults` 里给默认值 —— `loadGame` 会用 `mergeStateDefaults` 递归补全旧档（只补缺失键，绝不覆盖玩家进度）。
3. **`stateDefaults.saveVersion` 是存档结构版本号**（当前 `1`）。将来做不兼容的结构变更时：递增版本号，并在 `loadGame` 里按 `saveVersion` 编写迁移函数——这样老档升级不丢数据。
3. 引擎对未知字段**忽略而非报错**，所以多写字段不会炸，但也别指望它生效。
4. 删菜品前先想清楚：老存档里已解锁/已上架的菜会引用不存在的 id。

---

## 7. 提交前自查清单

- [ ] JSON 合法（可用 `node -e "JSON.parse(require('fs').readFileSync('data/xxx.json','utf8'))"` 校验）
- [ ] 本地服务器模式实际进游戏验证过，没有白屏 / `console` 报错
- [ ] 跑过 `node tools/build-data-bundle.js`，并提交了 `js/data-bundle.js`
- [ ] 没改任何已有 `id`，新字段都给了默认值
- [ ] 文本不含真实商业品牌 / 商标（用「炸鸡」而不是具体品牌名）
- [ ] 新增素材符合 CC BY 4.0（自己画的或有权再分发的）

---

## 8. 暂不支持 / 路线图

当前**没有**独立 `mods/` 目录，也不支持运行时加载第三方 Mod 包。规划中的能力：

1. **Mod 加载器**：启动时扫描 `mods/<mod-id>/mod.json`，按声明合并 / 覆盖 `data/*.json`
2. **钩子 API**：把下单、出餐、日结算、差评等时机暴露成公开事件钩子
3. **Mod 索引页**：类似 ContentDB 的内容目录

在此之前，做 Mod 的方式就是**改 `data/*.json` 并提 PR**（或直接 fork 出自己的版本）。

---

## 9. 许可证与内容规范

- 代码：PolyForm Noncommercial 1.0.0；素材：CC BY 4.0 —— 你的内容贡献默认按上述许可分发，署名归你
- 二次分发请保留署名，并注明修改
- 内容规范：不使用真实商业品牌与商标；不添加违规、歧视性内容
- 有问题先开 [Issue](../issues) 或 [Discussion](../discussions)
