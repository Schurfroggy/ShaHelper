# ShaHelper（三国杀助手）

面向**线下桌游**的辅助应用（uni-app / Vue 3），英文名 **ShaHelper**。在手机上管理常用随机条目、记录抽取历史，并为部分武将技能提供专用界面（设伏牌阵、化身池、九伐计数等）。

---

## 主要功能

| 能力 | 说明 |
|------|------|
| **主页** | 瀑布流展示全部条目（内置预设 + 用户自建），点击进入对应功能页。 |
| **随机与专用页** | 按条目标题匹配不同界面：通用加权随机、牌阵网格、界左慈化身/新生、神姜维九伐·天任、张琪瑛法箓·真仪等。 |
| **添加条目** | 自建随机项、上传封面；写入本地数据库。 |
| **设置** | 全局随机算法（如自适应 / 均匀）、与随机相关的偏好项。 |
| **历史与权重** | 支持抽取历史、自适应权重调整（适用于通用随机模板）。 |
| **武将库** | 与「随机条目」分离的 SQLite 表，用于化身列表、技能详情等；可随包内置数据或后续导入扩充。 |

---

## 技术栈与运行环境

- **框架**：uni-app（Vue 3）+ Vite，主要目标为 **App（Android）**，同时可构建 H5。
- **数据**：SQLite（`plus.sqlite`），数据库文件位于应用沙盒内（见下文「数据库」）。
- **语言**：页面与逻辑以 JavaScript / Vue 单文件组件为主，样式使用 SCSS。

**本地运行（简要）**

```bash
npm install
npm run dev:app    # App 调试（脚本会先同步预设静态资源）
# 或
npm run dev:h5
```

更完整的命令、封面资源流程、DCloud 应用标识与开发注意事项见 **[DEVELOPER.md](./DEVELOPER.md)**。

---

## 软件架构

```
App.vue
  └─ onLaunch：初始化 SQLite、写入缺失的内置预设条目（seed）

pages/
  ├─ home/index      主页：条目列表
  ├─ generator/index 功能页：按 item.title 分支挂载不同模板组件
  ├─ add-item/index  新建条目
  └─ settings/index  全局设置

components/
  ├─ RandomGeneratorTemplate.vue   通用随机 UI（选项、历史、部分武将特化逻辑）
  ├─ CardGridTemplate.vue         通用 3 列牌名网格（设伏、滔乱、定汉等复用）
  ├─ JieZuoCiTemplate.vue         界左慈：化身抽取 / 重铸 / 新生
  ├─ ShenJiangweiJiufaTianrenTemplate.vue  神姜维：体力上限、九伐、天任
  └─ ZhangQiyingFaluZhenyiTemplate.vue     张琪瑛：四象按钮

utils/
  ├─ itemStore.js       条目、选项、历史、KV、建表与迁移
  ├─ sgsWarriorStore.js 武将 / 技能 CRUD 与内置种子
  ├─ coverResolve.js    封面 builtin / user 解析
  ├─ preset*.js         各预设的常量（牌表、标题常量等）
  └─ …                 自适应随机、规范化等
```

**数据流（概念）**：主页与功能页通过 `itemId` 查询 `generator_items` 及关联选项；专用模板可再读写 `uni.storage` 做会话级状态（如界左慈）；武将数据统一走 `sgs_*` 表。

---

## 数据库结构（概览）

所有业务表在同一 SQLite 库 **`random_generator.db`**（运行时路径 `_doc/random_generator.db`）中维护。

### 随机条目域

| 表名 | 作用 |
|------|------|
| **generator_items** | 随机条目主表：标题、是否预设、封面来源与引用、封面宽高、时间戳等。 |
| **generator_options** | 每个条目的可选结果文本、排序、**权重**（自适应随机用）。 |
| **generator_history** | 抽取历史：条目 id、结果文案、时间。 |
| **app_kv** | 键值配置（如全局随机算法、迁移标记等）。 |

预设条目在首次启动时由 `seedPresetsIfNeeded` 按标题去重插入；用户自建条目 `is_preset = 0`。

### 武将域（与随机条目独立）

| 表名 | 作用 |
|------|------|
| **sgs_generals** | 武将：`name` 唯一、`skill_count` 与技能行数一致等。 |
| **sgs_general_skills** | 技能：名称、描述、序号、**skill_type_slug**（技能类型英文标识，用于 UI 如「不可用」标注）。 |

建表与列补丁在 `initItemStore()` 中随应用启动执行。技能类型枚举与中文对照见 **`utils/sgsSkillTypes.js`**。

---

## 界左慈 · 化身范围

「**界左慈-化身 / 新生**」界面中的化身池**不是**写死在代码里的固定名单，而是：

1. **运行时**从表 **`sgs_generals`** 联表 **`sgs_general_skills`** 读出全部武将及其技能名列表；
2. 若库中武将 **不足 3 名**，会触发 **`seedBundledWarriorsIfNeeded`**：将内置 **`utils/sgsBundledWarriors.json`** 中的数据按名称去重写入数据库，用于冷启动或空库补全；
3. 抽取、重铸、新生等逻辑在「当前库中已有武将集合」上做无放回随机，并排除本局已消耗过的武将（具体规则见界面与组件实现）。

因此：**化身范围 = 当前 SQLite 中已存在的全部武将**。扩充方式包括：应用内导入/写入 API、离线 SQL 导入、或维护 `武将技能信息.md` / 构建脚本重新生成 bundled JSON 等（操作级说明见 **DEVELOPER.md**）。

---

## 内置预设条目（标题）

应用首次安装或缺少对应预设行时会自动创建（以标题匹配，已存在则跳过）：

- 李傕-狼袭、徐荣-暴戾、周群-天算、曹婴-伏间  
- 程昱-设伏、张让-滔乱、神荀彧-定汉  
- 界左慈-化身 / 新生、神姜维-九伐 / 天任、张琪瑛-法箓 / 真仪  

各条目对应的界面类型与封面 slug 由代码中的标题常量与 `utils/coverResolve.js` 维护。

---

## 相关文档

| 文档 | 内容 |
|------|------|
| **[DEVELOPER.md](./DEVELOPER.md)** | 封面与静态资源、npm 脚本、武将 SQL/JSON 工具、`sgsWarriorStore` 接口提示、新增预设 checklist、DCloud appid 等**开发与运维细节**。 |
| **武将技能信息.md** | 武将技能文案与数据采编来源（若仓库内保留）。 |

---

## 声明

本应用为同人向桌游辅助工具，与官方产品无隶属关系；规则与牌名请以线下约定及官方规则为准。
