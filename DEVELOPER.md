# ShaHelper 开发与运维说明

本文档承接 [README.md](./README.md) 中的概览，补充**封面与资源**、**npm 脚本**、**数据库与接口细节**、**武将数据工具**及**新增预设**等实现级说明。

---

## DCloud 与 `manifest.json`

当 `manifest.json` 中 `appid` 仍为占位（如 `__UNI__TESTAPP01`）时，与 DCloud 开发者中心绑定一致。若需上架或独立应用标识，请在 [DCloud 开发者中心](https://dev.dcloud.net.cn/) 创建应用后替换 `appid`。

### Android 状态栏（避免叠在内容上）

- `app-plus.statusbar`：**`immersed` 必须为字符串** `"none"` / `"suggestedDevice"` / `"supportedDevice"`；**不要写布尔值 `false`**，否则可能被忽略，仍按沉浸式绘制导致系统栏压在 WebView 上。
- 当前仓库：`immersed: "none"`，`style` / `background` 与浅灰页面一致；并配置 `safearea.background`。
- `App.vue`（`APP-ANDROID`）：`plusready` 后调用 `setFullscreen(false)`、`setStatusBarBackground`、`setStatusBarStyle`，并在短延迟后重复应用，减少窗口晚就绪导致的异常。
- **修改 manifest 后须重新打 Android 包或自定义基座**，仅热重载不会更新安装包内原生配置。

### H5 发行（路径与资源）

- `manifest.json` → `h5.router.base` 与根目录 `vite.config.js` 的 `base` 当前为 `"./"`，便于静态托管在子目录；若部署在域名根路径且需绝对资源路径，可按环境改回 `/` 等并保持一致。
- 生产构建产物目录：**`dist/build/h5/`**（以当前 uni-cli 为准）。

---

## 封面存储（方案 B）

### 字段含义

| 字段 | 预设（builtin） | 用户（user） |
|------|------------------|--------------|
| `generator_items.cover_source` | `builtin` | `user` |
| `generator_items.cover_ref` | 预设 slug（与目录名一致） | App：`uni.saveFile` 等返回的本地路径；**H5**：入库前转为 **data URL** 写入库 |
| `generator_items.image_uri` | 旧版兼容，新数据一般留空 | 历史数据可能仍有值 |

删除用户自建条目时：App 上对本地路径尝试 `getFileSystemManager().unlinkSync`；**H5** 上 `data:` 不删文件，`blob:` 会 `URL.revokeObjectURL`。

### 目录约定

- **素材源（建议只在此维护图）**：`resource/presets/<preset-slug>/cover.png`  
  - `preset-slug`：小写字母、数字、短横线；须与 `cover_ref` 及 `utils/coverResolve.js` 中常量**完全一致**。
  - 主封面文件名固定为 **`cover.png`**（若改用 WebP，需同步修改 `builtinCoverStaticPath` 等逻辑）。
- **打进包内路径**：`static/presets/<slug>/cover.png`，运行时通过 `/static/presets/...` 访问。

### 同步脚本

```bash
npm run sync:presets
```

递归复制 `resource/presets` → `static/presets`（忽略 `.DS_Store` 等）。`package.json` 中 `dev:h5`、`dev:app`、`build:h5`、`build:app` 已在启动构建前执行该步骤。

**注意**：长期维护以 `resource/` 为准；若仅在 `static/` 手改图，下次同步时可能被 `resource` 侧覆盖。

### 当前内置预设 slug（与 `coverResolve.js` 一致）

| slug | 对应预设（标题） |
|------|------------------|
| `lique-langxi` | 李傕-狼袭 |
| `xurong-baoli` | 徐荣-暴戾 |
| `zhouqun-tiansuan` | 周群-天算 |
| `caoying-fujian` | 曹婴-伏间 |
| `chengyu-shefu` | 程昱-设伏 |
| `zhangrang-taoluan` | 张让-滔乱 |
| `shenxunyu-dinghan` | 神荀彧-定汉 |
| `jiezuoci-huashen` | 界左慈-化身 / 新生 |
| `shenjiangwei-jiufa-tianren` | 神姜维-九伐 / 天任 |
| `zhangqiying-falu-zhenyi` | 张琪瑛-法箓 / 真仪 |

未放置 `cover.png` 时，首页仍会请求对应 URL，可能出现空白或加载失败。

### 新增预设封面 checklist

1. 在 `resource/presets/<slug>/` 放置 `cover.png`（及同目录需打包资源）。
2. 在 `utils/coverResolve.js` 增加 `PRESET_SLUG_*` 常量；在 `utils/itemStore.js` 的 `PRESET_DEFINITIONS` 中增加 `title` / `slug` / `options`。
3. 若需专用 UI，在 `pages/generator/index.vue` 增加 `v-else-if` 与对应组件。
4. 执行 `npm run sync:presets`（或 `npm run dev:app` / `build:app`）。
5. 重新安装/运行验证首页封面与功能页。

---

## npm 脚本

本仓库 **源码在仓库根目录**（无默认的 `src/`），uni-cli 默认 `UNI_INPUT_DIR` 指向 `src` 会找不到 `manifest.json`。因此脚本中已使用 **`cross-env UNI_INPUT_DIR=.`**（需先 `npm install` 安装 devDependency）。

| 命令 | 作用 |
|------|------|
| `npm run sync:presets` | `resource/presets` → `static/presets` |
| `npm run dev:app` | 同步预设后 `uni -p app`（`UNI_INPUT_DIR=.`） |
| `npm run dev:h5` | 同步预设后 `uni` 默认 H5（`UNI_INPUT_DIR=.`） |
| `npm run build:app` | 同步预设后 `uni build -p app` |
| `npm run build:h5` | 同步预设后 `uni build -p h5` |
| `npm run warrior:sql` | 从示例 JSON 生成插入武将的 SQL 并打印（见下） |
| `npm run sgs:import` | 从 Markdown 等导入武将（见 `scripts/import-sgs-warriors-from-md.mjs`） |
| `npm run sgs:bundle` | 构建内置 `sgsBundledWarriors.json`（见 `scripts/build-sgs-bundled-json.mjs`） |

**依赖**：生产依赖含 **`sql.js`**（仅 H5 打包使用）；`cross-env` 为 devDependency。

---

## 多端存储与 `itemStore`

| 端 | 实现文件 | 说明 |
|----|----------|------|
| App（5+） | `utils/itemStoreDbPlus.js` | `plus.sqlite`，库名 `random_generator_db`，路径 `_doc/random_generator.db` |
| H5 | `utils/itemStoreDbH5.js` | `sql.js` WASM + IndexedDB（库名 `shahelper_itemstore`）整库 `export` 快照 debounce 写回 |

`utils/itemStore.js` 通过条件编译 `#ifdef H5` / `#ifndef H5` 引用上述驱动；建表、迁移、`seedPresetsIfNeeded` 等逻辑共用。

**H5 注意**：数据仅存当前浏览器；**无痕模式**等若禁用 IndexedDB，启动时会 Toast 提示。大库写回会有短暂开销，已在驱动内 debounce。

---

## 数据库补充说明

### `generator_options.weight`

列通过迁移 `ALTER TABLE ... ADD COLUMN weight REAL` 添加；新建选项时写入均匀初始权重。自适应随机命中某选项后会调用 `adjustAdaptiveWeightsAfterPick` 更新权重。

### 武将表 `skill_type_slug`

合法 slug 与中文含义见 **`utils/sgsSkillTypes.js`**（含 `SGS_SKILL_TYPE_LABEL_ZH`）。JSON 校验与规范化见 **`utils/sgsWarriorNormalize.js`**（技能名可用 `skillName` / `name`，序号可用 `skillOrder` / `order` / `skill_order`，类型可用 `skillType` / `skill_type` / `type`）。

---

## `utils/sgsWarriorStore.js`（App / H5）

依赖 `withItemStoreDb`（即 `initItemStore()` 完成后同一套 SQL）。**App** 底层为 `plus.sqlite`；**H5** 底层为 sql.js，接口一致。

| 函数 | 说明 |
|------|------|
| `seedBundledWarriorsIfNeeded()` | 若 `sgs_generals` 少于 3 条，从 `sgsBundledWarriors.json` 批量插入（同名跳过）。 |
| `insertGeneralWithSkills({ name, skills })` | 事务插入一名武将及全部技能，更新 `skill_count`，返回新武将 `id`。 |
| `listSgsGenerals()` | 列出 `id / name / skill_count`。 |
| `listAllGeneralsWithSkillNames()` | 全部武将 + 技能名数组（界左慈列表用）；内部会先 `seedBundledWarriorsIfNeeded`。 |
| `getSgsGeneralWithSkills(generalId)` | 单将详情 + 按 `skill_order` 排序的技能（含 `description`、`skill_type_slug`）。 |
| `buildWarriorInsertSqlStatements` | 从本模块再导出（实现见 `sgsWarriorSqlExport.js`），用于生成离线 SQL。 |

---

## 命令行：从 JSON 生成插入 SQL

在无 App 环境下，可用 JSON 描述武将，生成可在任意 SQLite 客户端执行的语句。

**示例 JSON**：`scripts/examples/warrior-sample.json`

```json
{
  "name": "示例武将",
  "skills": [
    { "skillName": "一技能名", "description": "描述……", "skillOrder": 1, "skillType": "normal" },
    { "skillName": "二技能名", "description": "描述……", "skillOrder": 2, "skillType": "locked" }
  ]
}
```

**命令：**

```bash
# 打印到终端
node scripts/insert-sgs-warrior.mjs scripts/examples/warrior-sample.json

# 写入文件
node scripts/insert-sgs-warrior.mjs path/to/warrior.json --output /tmp/warrior.sql
```

快捷方式：`npm run warrior:sql`

真机数据库位于沙盒 `_doc/random_generator.db`，通常需导出 DB 或在调试环境执行。**线上包内**推荐直接调用 `insertGeneralWithSkills`，避免手写 SQL。

---

## 武将资料采编（维基）

技能正文与进度清单以仓库内 **`武将技能信息.md`** 为准。

采编时可参考萌娘三国杀 Wiki，URL 形式：

```text
https://wiki.biligame.com/msgs/<武将名>
```

例如界徐盛：`https://wiki.biligame.com/msgs/界徐盛`

（README 改版前曾附长列表记录「已填写」武将名；若需恢复该清单，请从 Git 历史或 `武将技能信息.md` 中查阅，以免与本文重复维护。）

---

## 界面组件提示（查阅代码时）

- **`PageBackBar`**：`pages/generator/index.vue` 使用 **`fixed`** 胶囊叠在内容左上（与模板内「重置」按钮同形：圆角 pill、`padding`/`font-size` 对齐）；`pages/add-item/index.vue` 使用内联样式；点击回主页或 `navigateBack`（见组件与页面内 `goBack`）。
- **`CardGridTemplate`**：通过 props `labels`、`initialDisabledLabels`、`dividerAfterRows`、`pressLatch`、按下态颜色 `pressedGradientFrom` 等区分程昱 / 张让 / 神荀彧。
- **`RandomGeneratorTemplate`**：通用随机；周群「命运签」、曹婴「伏间」人数等通过标题判断分支逻辑（见 `pages/generator/index.vue`）。
- **`JieZuoCiTemplate`**：会话状态见 `utils/jieZuociSessionStore.js`（按 `itemId` 内存恢复，仅重置按钮清空）。
- **界左慈详情**：长按化身卡 `getSgsGeneralWithSkills`；主公技 / 限定技 / 使命技 / 觉醒技在技能名侧显示「（不可用）」。

---

## HBuilderX

除命令行 `uni` 外，也可使用 HBuilderX 打开项目运行。若仅用 HBuilderX 点「运行」而未走 npm 脚本，建议在根目录先执行一次 `npm run sync:presets`，保证 `static/presets` 与 `resource` 一致。
