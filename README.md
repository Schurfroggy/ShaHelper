# ShaHelper（三国杀助手）

面向**线下三国杀**的手机小工具（uni-app / Vue 3），英文名 **ShaHelper**。主页以卡片形式列出各武将技能辅助页，点进去即用。

---

## 主要功能


| 条目              | 功能                      |
| --------------- | ----------------------- |
| **李傕-狼袭**       | 随机抽签判定伤害（0 / 1 / 2 点）   |
| **徐荣-暴戾**       | 随机三种「暴戾」效果之一            |
| **周群-天算**       | 随机抽一支签；可将某一签多放一次再参与本次抽签 |
| **曹婴-伏间**       | 先选场上总人数，再随机「伏间」结果       |
| **程昱-设伏**       | 在牌名格子上点选设伏              |
| **张让-滔乱**       | 在牌名格子上标记已「滔乱」的牌         |
| **神荀彧-定汉**      | 在牌名格子上点选要记录的锦囊          |
| **界左慈-化身 / 新生** | 从武将库抽化身，可重铸、新生；含技能详情    |
| **神姜维-九伐 / 天任** | 调体力上限、在九伐牌阵上打点、记天任标记    |
| **张琪瑛-法箓 / 真仪** | 四个标记记录                  |


另：**添加条目**可自建其它随机项并上传封面；**设置**里可切换随机方式。抽取历史、权重与武将库表结构等实现细节见 **[DEVELOPER.md](./DEVELOPER.md)**。

---

## 技术栈与运行环境

- **框架**：uni-app（Vue 3）+ Vite，主要目标为 **App（Android）**，同时可构建 **H5**。
- **数据**：
  - **App**：SQLite（`plus.sqlite`），库文件在应用沙盒内（见下文「数据库」）。
  - **H5**：浏览器内 **sql.js**（SQLite WASM）+ **IndexedDB** 保存整库快照；业务 SQL 与 App 共用 `utils/itemStore.js`（平台驱动见 `utils/itemStoreDbH5.js` / `itemStoreDbPlus.js`）。
- **语言**：页面与逻辑以 JavaScript / Vue 单文件组件为主，样式使用 SCSS。

**本地运行（简要）**

```bash
npm install
npm run dev:app    # App 调试（先 sync:presets；需 UNI_INPUT_DIR=.，见 DEVELOPER.md）
# 或
npm run dev:h5     # H5 调试
```

更完整的命令、封面资源流程、H5/App 存储差异、DCloud 应用标识与开发注意事项见 **[DEVELOPER.md](./DEVELOPER.md)**。

---

## 软件架构

```
App.vue
  └─ onLaunch：初始化条目库（App：plus.sqlite；H5：sql.js+IDB）、seed 预设；Android 上同步状态栏样式（见 DEVELOPER.md）

pages/
  ├─ home/index      主页：条目列表
  ├─ generator/index 功能页：按 item.title 分支挂载不同模板组件
  ├─ add-item/index  新建条目
  └─ settings/index  全局设置

components/
  ├─ PageBackBar.vue               左上角「返回」（H5/无侧滑手势；生成器页 fixed、添加条目内联）
  ├─ RandomGeneratorTemplate.vue   通用随机 UI（选项、历史、部分武将特化逻辑）
  ├─ CardGridTemplate.vue         通用 3 列牌名网格（设伏、滔乱、定汉等复用）
  ├─ JieZuoCiTemplate.vue         界左慈：化身抽取 / 重铸 / 新生
  ├─ ShenJiangweiJiufaTianrenTemplate.vue  神姜维：体力上限、九伐、天任
  └─ ZhangQiyingFaluZhenyiTemplate.vue     张琪瑛：四象按钮

utils/
  ├─ itemStore.js       条目、选项、历史、KV、建表与迁移（平台 SQL 由下方驱动提供）
  ├─ itemStoreDbPlus.js / itemStoreDbH5.js  App：`plus.sqlite`；H5：sql.js + IndexedDB
  ├─ sgsWarriorStore.js 武将 / 技能 CRUD 与内置种子
  ├─ coverResolve.js    封面 builtin / user 解析
  ├─ preset*.js         各预设的常量（牌表、标题常量等）
  └─ …                 自适应随机、规范化等
```

**数据流（概念）**：主页与功能页通过 `itemId` 查询 `generator_items` 及关联选项；专用模板可再读写 `uni.storage` 做会话级状态（如界左慈）；武将数据统一走 `sgs_*` 表。

---

## 数据库结构（概览）

**App**：所有业务表在同一 SQLite 库 `**random_generator.db**`（运行时路径 `_doc/random_generator.db`）中维护。

**H5**：表结构与 App 一致，由 sql.js 执行；持久化介质为 IndexedDB 中的整库二进制快照（非独立 `.db` 文件路径）。

### 随机条目域


| 表名                    | 作用                                |
| --------------------- | --------------------------------- |
| **generator_items**   | 随机条目主表：标题、是否预设、封面来源与引用、封面宽高、时间戳等。 |
| **generator_options** | 每个条目的可选结果文本、排序、**权重**（自适应随机用）。    |
| **generator_history** | 抽取历史：条目 id、结果文案、时间。               |
| **app_kv**            | 键值配置（如全局随机算法、迁移标记等）。              |


预设条目在首次启动时由 `seedPresetsIfNeeded` 按标题去重插入；用户自建条目 `is_preset = 0`。

### 武将域（与随机条目独立）


| 表名                     | 作用                                                        |
| ---------------------- | --------------------------------------------------------- |
| **sgs_generals**       | 武将：`name` 唯一、`skill_count` 与技能行数一致等。                      |
| **sgs_general_skills** | 技能：名称、描述、序号、**skill_type_slug**（技能类型英文标识，用于 UI 如「不可用」标注）。 |


建表与列补丁在 `initItemStore()` 中随应用启动执行。技能类型枚举与中文对照见 `**utils/sgsSkillTypes.js`**。

---

## 界左慈 · 化身范围

界曹植、界甘宁、界夏侯惇、曹昂、程普、界袁术、王异、界吕蒙、界刘禅、荀攸、界赵云、界孙坚、界小乔、界曹操、界凌统、界荀彧、界魏延、界许褚、界夏侯渊、曹彰、界貂蝉、界华佗、伏皇后、界曹丕、界伊籍、界庞统、虞翻、界吕布、鲁芝、界马超、马岱、朱然、界关羽、界刘表、界张辽、凌操、界张飞、简雍、界孙尚香、界张角、廖化、郭淮、公孙瓒、朱灵、潘璋马忠、曹冲、李丰、界吴国太、界孙策、韩当、关兴张苞、界司马懿、刘封、界孙权、界颜良文丑、界徐盛、界卧龙诸葛、界甄姬、界孟获、界典韦、界高顺、界于吉、界曹仁、步练师、界华雄、界周瑜、界姜维、界刘备、李儒、界黄月英、界法正、界邓艾、界徐晃、界黄忠、界祝融、界张昭张纮、界蔡文姬、界黄盖、界郭嘉、关平、界陆逊、钟会、界董卓、界于禁、马良、界朱桓

---

## 相关文档


| 文档                                 | 内容                                                                                             |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- |
| **[DEVELOPER.md](./DEVELOPER.md)** | 封面与静态资源、npm 脚本、武将 SQL/JSON 工具、`sgsWarriorStore` 接口提示、新增预设 checklist、DCloud appid 等**开发与运维细节**。 |
| **武将技能信息.md**                      | 武将技能文案与数据采编来源。                                                                                 |


---

## 声明

本应用为同人向桌游辅助工具，与官方产品无隶属关系；规则与牌名请以线下约定及官方规则为准。