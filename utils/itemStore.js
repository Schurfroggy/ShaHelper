import { adjustAdaptiveWeights } from "./adaptiveRandom.js";
import {
  COVER_BUILTIN,
  COVER_USER,
  PRESET_SLUG_CAOYING_FUJIAN,
  PRESET_SLUG_CHENGYU_SHEFU,
  PRESET_SLUG_CHENDENG_ZHOUXUAN,
  PRESET_SLUG_ZHANGRANG_TAOLUAN,
  PRESET_SLUG_SHENXUNYU_DINGHAN,
  PRESET_SLUG_LIQUE_LANGXI,
  PRESET_SLUG_XURONG_BAOLI,
  PRESET_SLUG_ZHOUQUN_TIANSUAN,
  PRESET_SLUG_JIEZUOCI_HUASHEN,
  PRESET_SLUG_SHENJIANGWEI_JIEFA_TIANREN,
  PRESET_SLUG_ZHANGQIYING_FALU_ZHENYI,
  PRESET_SLUG_YANGBIAO_ZHAOHAN_YIZHENG,
} from "./coverResolve.js";
import { buildCaoyingFujianOptions } from "./presetCaoyingFujian.js";

// #ifdef H5
import { ensureDbReady, execSql, selectSql } from "./itemStoreDbH5.js";
// #endif
// #ifndef H5
import { ensureDbReady, execSql, selectSql } from "./itemStoreDbPlus.js";
// #endif

const TABLE_ITEMS = "generator_items";
const TABLE_OPTIONS = "generator_options";
const TABLE_HISTORY = "generator_history";
const TABLE_APP_KV = "app_kv";

export const KEY_RANDOM_ALGO = "random_algorithm";
const KEY_WEIGHTS_MIGRATED = "weights_migrated_v1";
const KEY_COVER_MIGRATED = "cover_fields_migrated_v1";
const KEY_PRESET_SHENXUNYU_TITLE_V2 = "preset_title_shenxunyu_dinghan_v2";
export const ALGO_ADAPTIVE = "adaptive";
export const ALGO_UNIFORM = "uniform";

let initialized = false;
/** 冷启动 {@link initItemStore} 时批量读的 app_kv，供 {@link seedPresetsIfNeeded} 复用 */
let startupKvCache = null;

function nowMs() {
  return Date.now();
}

function q(s) {
  return String(s ?? "").replace(/'/g, "''");
}

function tryRemoveUserCoverFile(filePath) {
  const p = String(filePath || "").trim();
  if (!p) return;
  if (p.startsWith("blob:")) {
    try {
      URL.revokeObjectURL(p);
    } catch (_) {}
    return;
  }
  if (p.startsWith("data:")) return;
  try {
    if (typeof uni !== "undefined" && uni.getFileSystemManager) {
      uni.getFileSystemManager().unlinkSync(p);
    }
  } catch (e) {
    /* 文件不存在或非本地路径时忽略 */
  }
}

async function withTx(work) {
  await execSql("BEGIN TRANSACTION");
  try {
    const result = await work();
    await execSql("COMMIT");
    return result;
  } catch (err) {
    try {
      await execSql("ROLLBACK");
    } catch {}
    throw err;
  }
}

export async function initItemStore() {
  if (initialized) return;
  await ensureDbReady();
  await execSql(
    `CREATE TABLE IF NOT EXISTS ${TABLE_ITEMS} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      image_uri TEXT,
      is_preset INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`,
  );
  await execSql(
    `CREATE TABLE IF NOT EXISTS ${TABLE_OPTIONS} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      option_text TEXT NOT NULL,
      sort_index INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    )`,
  );
  await execSql(
    `CREATE TABLE IF NOT EXISTS ${TABLE_HISTORY} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      result_text TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )`,
  );
  await execSql(
    `CREATE INDEX IF NOT EXISTS idx_options_item_id ON ${TABLE_OPTIONS}(item_id, sort_index)`,
  );
  await execSql(
    `CREATE INDEX IF NOT EXISTS idx_history_item_id ON ${TABLE_HISTORY}(item_id, created_at DESC)`,
  );
  await execSql(
    `CREATE TABLE IF NOT EXISTS ${TABLE_APP_KV} (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )`,
  );
  const startupKv = await readKvMap([
    KEY_RANDOM_ALGO,
    KEY_COVER_MIGRATED,
    KEY_WEIGHTS_MIGRATED,
    KEY_PRESET_SHENXUNYU_TITLE_V2,
  ]);
  startupKvCache = startupKv;
  await ensureDefaultAppSettings(startupKv);
  await migrateCoverColumnsIfNeeded(startupKv);
  await migrateCoverDimensionsIfNeeded();
  await migrateOptionWeightsIfNeeded(startupKv);
  initialized = true;
}

/** 一次查询读取多个 app_kv，减少冷启动往返 */
async function readKvMap(keys) {
  const uniq = [...new Set(keys)].filter(Boolean);
  if (!uniq.length) return new Map();
  const inClause = uniq.map((k) => `'${q(k)}'`).join(",");
  const rows = await selectSql(
    `SELECT key, value FROM ${TABLE_APP_KV} WHERE key IN (${inClause})`,
  );
  const m = new Map();
  for (const r of rows) {
    const k = String(r.key ?? r.KEY ?? "");
    if (k) m.set(k, String(r.value ?? r.VALUE ?? ""));
  }
  return m;
}

let sgsWarriorSchemaReady = false;

/** 武将库表；推迟到首次 {@link withItemStoreDb} 再建，加快首屏 init */
async function ensureSgsWarriorSchemaLazily() {
  if (sgsWarriorSchemaReady) return;
  await ensureSgsWarriorSchema();
  sgsWarriorSchemaReady = true;
}

/** 武将库：与随机条目无关的独立业务表 */
async function ensureSgsWarriorSchema() {
  await execSql(
    `CREATE TABLE IF NOT EXISTS sgs_generals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      skill_count INTEGER NOT NULL DEFAULT 0 CHECK (skill_count >= 0),
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`,
  );
  await execSql(
    `CREATE TABLE IF NOT EXISTS sgs_general_skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      general_id INTEGER NOT NULL,
      skill_name TEXT NOT NULL,
      description TEXT NOT NULL,
      skill_order INTEGER NOT NULL CHECK (skill_order >= 1),
      skill_type_slug TEXT NOT NULL DEFAULT 'normal',
      created_at INTEGER NOT NULL,
      UNIQUE(general_id, skill_order)
    )`,
  );
  await migrateSgsSkillTypeSlugColumnIfNeeded();
  await execSql(
    `CREATE INDEX IF NOT EXISTS idx_sgs_general_skills_gid ON sgs_general_skills(general_id)`,
  );
}

/** 旧库升级：补充技能类型列 */
async function migrateSgsSkillTypeSlugColumnIfNeeded() {
  try {
    await execSql(`ALTER TABLE sgs_general_skills ADD COLUMN skill_type_slug TEXT NOT NULL DEFAULT 'normal'`);
  } catch {
    /* 列已存在 */
  }
}

/**
 * 供武将库等扩展在同一 SQLite 上执行语句（会先 {@link initItemStore} 并懒建武将表）。
 */
export async function withItemStoreDb(work) {
  await initItemStore();
  await ensureSgsWarriorSchemaLazily();
  return work({ execSql, selectSql, withTx, q });
}

async function migrateCoverDimensionsIfNeeded() {
  try {
    await execSql(`ALTER TABLE ${TABLE_ITEMS} ADD COLUMN cover_width INTEGER`);
  } catch (e) {
    /* exists */
  }
  try {
    await execSql(`ALTER TABLE ${TABLE_ITEMS} ADD COLUMN cover_height INTEGER`);
  } catch (e) {
    /* exists */
  }
}

async function migrateCoverColumnsIfNeeded(kv) {
  try {
    await execSql(`ALTER TABLE ${TABLE_ITEMS} ADD COLUMN cover_source TEXT`);
  } catch {
    /* exists */
  }
  try {
    await execSql(`ALTER TABLE ${TABLE_ITEMS} ADD COLUMN cover_ref TEXT`);
  } catch {
    /* exists */
  }
  if (kv.get(KEY_COVER_MIGRATED) === "1") return;
  await execSql(
    `UPDATE ${TABLE_ITEMS}
     SET cover_source='${q(COVER_BUILTIN)}',
         cover_ref='${q(PRESET_SLUG_LIQUE_LANGXI)}'
     WHERE is_preset=1 AND title='${q("李傕-狼袭")}'
       AND (cover_source IS NULL OR cover_source='')`,
  );
  await execSql(
    `UPDATE ${TABLE_ITEMS}
     SET cover_source='${q(COVER_USER)}',
         cover_ref=image_uri
     WHERE is_preset=0
       AND IFNULL(image_uri,'')<>''
       AND (cover_source IS NULL OR cover_source='')`,
  );
  await execSql(
    `UPDATE ${TABLE_ITEMS}
     SET cover_source='',
         cover_ref=''
     WHERE cover_source IS NULL`,
  );
  await execSql(
    `INSERT OR REPLACE INTO ${TABLE_APP_KV} (key, value) VALUES ('${q(KEY_COVER_MIGRATED)}','1')`,
  );
  kv.set(KEY_COVER_MIGRATED, "1");
}

async function ensureDefaultAppSettings(kv) {
  if (kv.has(KEY_RANDOM_ALGO)) return;
  await execSql(
    `INSERT OR REPLACE INTO ${TABLE_APP_KV} (key, value) VALUES ('${q(KEY_RANDOM_ALGO)}', '${q(
      ALGO_ADAPTIVE,
    )}')`,
  );
  kv.set(KEY_RANDOM_ALGO, ALGO_ADAPTIVE);
}

async function migrateOptionWeightsIfNeeded(kv) {
  let added = false;
  try {
    await execSql(`ALTER TABLE ${TABLE_OPTIONS} ADD COLUMN weight REAL`);
    added = true;
  } catch {
    added = false;
  }
  const weightsDone = kv.get(KEY_WEIGHTS_MIGRATED) === "1";
  if (weightsDone && !added) return;
  await normalizeWeightsAllItemsInternal();
  await execSql(
    `INSERT OR REPLACE INTO ${TABLE_APP_KV} (key, value) VALUES ('${q(KEY_WEIGHTS_MIGRATED)}','1')`,
  );
  kv.set(KEY_WEIGHTS_MIGRATED, "1");
}

async function normalizeWeightsAllItemsInternal() {
  const items = await selectSql(`SELECT DISTINCT item_id FROM ${TABLE_OPTIONS}`);
  if (!items.length) return;
  await withTx(async () => {
    for (const row of items) {
      const itemId = row.item_id ?? row.ITEM_ID;
      await normalizeWeightsForItemTx(Number(itemId));
    }
  });
}

async function normalizeWeightsForItemTx(itemId) {
  const id = Number(itemId) || 0;
  if (!id) return;
  const opts = await selectSql(
    `SELECT id FROM ${TABLE_OPTIONS} WHERE item_id=${id} ORDER BY sort_index ASC, id ASC`,
  );
  const n = opts.length;
  if (!n) return;
  const w = 1 / n;
  for (const o of opts) {
    const oid = o.id ?? o.ID;
    await execSql(`UPDATE ${TABLE_OPTIONS} SET weight=${w} WHERE id=${Number(oid)}`);
  }
}

/** 与此标题匹配的条目启用「命运签」 */
export const ITEM_TITLE_ZHOUQUN_TIANSUAN = "周群-天算";
/** 与此标题匹配的条目需先选总人数 n（曹婴-伏间） */
export const ITEM_TITLE_CAOYING_FUJIAN = "曹婴-伏间";
/** CardGridTemplate：程昱-设伏 */
export const ITEM_TITLE_CHENGYU_SHEFU = "程昱-设伏";
/** CardGridTemplate：陈登-周旋（上两行同设伏，第三行锦囊/装备） */
export const ITEM_TITLE_CHENDENG_ZHOUXUAN = "陈登-周旋";
/** CardGridTemplate：张让-滔乱 */
export const ITEM_TITLE_ZHANGRANG_TAOLUAN = "张让-滔乱";
/** CardGridTemplate：神荀彧-定汉 / 奇正相生 */
export const ITEM_TITLE_SHENXUNYU_DINGHAN = "神荀彧-定汉 / 奇正相生";
/** 兼容库内旧标题 */
export const ITEM_TITLE_SHENXUNYU_DINGHAN_LEGACY = "神荀彧-定汉";
/** JieZuoCiTemplate：界左慈 */
export const ITEM_TITLE_JIEZUOCI_HUASHEN = "界左慈-化身 / 新生";
/** ShenJiangweiJiufaTianrenTemplate */
export const ITEM_TITLE_SHENJIANGWEI_JIEFA_TIANREN = "神姜维-九伐 / 天任";
/** ZhangQiyingFaluZhenyiTemplate */
export const ITEM_TITLE_ZHANGQIYING_FALU_ZHENYI = "张琪瑛-法箓 / 真仪";
/** YangBiaoZhaohanYizhengTemplate */
export const ITEM_TITLE_YANGBIAO_ZHAOHAN_YIZHENG = "杨彪-昭汉 / 义争";

const PRESET_DEFINITIONS = [
  {
    title: "李傕-狼袭",
    slug: PRESET_SLUG_LIQUE_LANGXI,
    options: ["造成0点伤害", "造成1点伤害", "造成2点伤害"],
  },
  {
    title: "徐荣-暴戾",
    slug: PRESET_SLUG_XURONG_BAOLI,
    options: [
      "受到1点火焰伤害且本回合不能对你使用【杀】",
      "失去1点体力且本回合手牌上限-1",
      "令你随机获得其两张牌",
    ],
  },
  {
    title: ITEM_TITLE_ZHOUQUN_TIANSUAN,
    slug: PRESET_SLUG_ZHOUQUN_TIANSUAN,
    options: [
      "上上签：防止受到的伤害",
      "上签：受到伤害时，若伤害值大于1，则将伤害值改为1；每受到1点伤害后，摸一张牌",
      "中签：受到伤害时，将伤害改为火焰伤害，若此伤害值大于1，则将伤害值改为1",
      "下签：受到伤害时，伤害值+1",
      "下下签：受到伤害时，伤害值+1；不能使用【桃】和【酒】",
    ],
  },
  {
    title: ITEM_TITLE_CAOYING_FUJIAN,
    slug: PRESET_SLUG_CAOYING_FUJIAN,
    options: buildCaoyingFujianOptions(3),
  },
  {
    title: ITEM_TITLE_CHENGYU_SHEFU,
    slug: PRESET_SLUG_CHENGYU_SHEFU,
    options: ["设伏标记"],
  },
  {
    title: ITEM_TITLE_CHENDENG_ZHOUXUAN,
    slug: PRESET_SLUG_CHENDENG_ZHOUXUAN,
    options: ["周旋标记"],
  },
  {
    title: ITEM_TITLE_ZHANGRANG_TAOLUAN,
    slug: PRESET_SLUG_ZHANGRANG_TAOLUAN,
    options: ["滔乱标记"],
  },
  {
    title: ITEM_TITLE_SHENXUNYU_DINGHAN,
    slug: PRESET_SLUG_SHENXUNYU_DINGHAN,
    options: ["定汉标记"],
  },
  {
    title: ITEM_TITLE_JIEZUOCI_HUASHEN,
    slug: PRESET_SLUG_JIEZUOCI_HUASHEN,
    options: ["化身"],
  },
  {
    title: ITEM_TITLE_SHENJIANGWEI_JIEFA_TIANREN,
    slug: PRESET_SLUG_SHENJIANGWEI_JIEFA_TIANREN,
    options: ["九伐", "天任"],
  },
  {
    title: ITEM_TITLE_ZHANGQIYING_FALU_ZHENYI,
    slug: PRESET_SLUG_ZHANGQIYING_FALU_ZHENYI,
    options: ["法箓", "真仪"],
  },
  {
    title: ITEM_TITLE_YANGBIAO_ZHAOHAN_YIZHENG,
    slug: PRESET_SLUG_YANGBIAO_ZHAOHAN_YIZHENG,
    options: ["昭汉", "义争"],
  },
];

/** 旧标题改名 + 按 cover_ref 去重（曾出现双预设）；`kv` 来自冷启动批量读 app_kv */
async function repairShenxunyuDinghanPresetsForSeed(kv) {
  if (kv.get(KEY_PRESET_SHENXUNYU_TITLE_V2) !== "1") {
    await execSql(
      `UPDATE ${TABLE_ITEMS}
       SET title='${q(ITEM_TITLE_SHENXUNYU_DINGHAN)}', updated_at=${nowMs()}
       WHERE is_preset=1 AND title='${q(ITEM_TITLE_SHENXUNYU_DINGHAN_LEGACY)}'`,
    );
    await execSql(
      `INSERT OR REPLACE INTO ${TABLE_APP_KV} (key, value) VALUES ('${q(KEY_PRESET_SHENXUNYU_TITLE_V2)}','1')`,
    );
    kv.set(KEY_PRESET_SHENXUNYU_TITLE_V2, "1");
  }
  const rows = await selectSql(
    `SELECT id FROM ${TABLE_ITEMS}
     WHERE is_preset=1 AND cover_ref='${q(PRESET_SLUG_SHENXUNYU_DINGHAN)}'
     ORDER BY id ASC`,
  );
  if (rows.length <= 1) return;
  const keepId = Number(rows[0]?.id ?? rows[0]?.ID ?? 0);
  if (!keepId) return;
  await withTx(async () => {
    for (let i = 1; i < rows.length; i += 1) {
      const rid = Number(rows[i]?.id ?? rows[i]?.ID ?? 0);
      if (!rid || rid === keepId) continue;
      await execSql(`DELETE FROM ${TABLE_HISTORY} WHERE item_id=${rid}`);
      await execSql(`DELETE FROM ${TABLE_OPTIONS} WHERE item_id=${rid}`);
      await execSql(`DELETE FROM ${TABLE_ITEMS} WHERE id=${rid} AND is_preset=1`);
    }
    await execSql(
      `UPDATE ${TABLE_ITEMS}
       SET title='${q(ITEM_TITLE_SHENXUNYU_DINGHAN)}', updated_at=${nowMs()}
       WHERE id=${keepId} AND is_preset=1`,
    );
  });
}

export async function seedPresetsIfNeeded() {
  await initItemStore();
  await repairShenxunyuDinghanPresetsForSeed(
    startupKvCache ?? (await readKvMap([KEY_PRESET_SHENXUNYU_TITLE_V2])),
  );
  for (const def of PRESET_DEFINITIONS) {
    const rows = await selectSql(
      `SELECT id FROM ${TABLE_ITEMS} WHERE title='${q(def.title)}' AND is_preset=1 LIMIT 1`,
    );
    if (rows.length) continue;
    await createItem({
      title: def.title,
      coverSource: COVER_BUILTIN,
      coverRef: def.slug,
      options: def.options,
      isPreset: 1,
    });
  }
}

export async function listItems() {
  await initItemStore();
  return await selectSql(
    `SELECT id, title, image_uri, cover_source, cover_ref, cover_width, cover_height, is_preset, created_at, updated_at
     FROM ${TABLE_ITEMS}
     ORDER BY is_preset DESC, id ASC`,
  );
}

export async function getItemDetail(itemId) {
  await initItemStore();
  const rows = await selectSql(
    `SELECT id, title, image_uri, cover_source, cover_ref, cover_width, cover_height, is_preset, created_at, updated_at
     FROM ${TABLE_ITEMS}
     WHERE id=${Number(itemId) || 0}
     LIMIT 1`,
  );
  if (!rows.length) return null;
  const item = rows[0];
  const options = await selectSql(
    `SELECT id, option_text, sort_index, weight
     FROM ${TABLE_OPTIONS}
     WHERE item_id=${item.id}
     ORDER BY sort_index ASC, id ASC`,
  );
  const detailRows = options.map((o) => ({
    optionId: Number(o.id ?? o.ID),
    text: String(o.option_text ?? ""),
    weight: Number(o.weight),
    sortIndex: Number(o.sort_index ?? o.sort_index ?? 0),
  }));
  const n = detailRows.length || 1;
  const normalizedRows = detailRows.map((row, idx) => {
    let wt = Number(row.weight);
    if (!Number.isFinite(wt) || wt <= 0) wt = 1 / n;
    return { ...row, weight: wt };
  });
  const sum = normalizedRows.reduce((acc, row) => acc + row.weight, 0);
  const optionRows = normalizedRows.map((row) => ({
    ...row,
    weight: row.weight / sum,
  }));
  return {
    ...item,
    options: optionRows.map((r) => r.text),
    optionRows,
  };
}

export async function createItem({
  title,
  options = [],
  isPreset = 0,
  coverSource = "",
  coverRef = "",
  imageUri = "",
  coverWidth,
  coverHeight,
}) {
  await initItemStore();
  const t = String(title || "").trim();
  const normalizedOptions = options.map((s) => String(s || "").trim()).filter(Boolean);
  if (!t) throw new Error("标题不能为空");
  if (!normalizedOptions.length) throw new Error("至少添加一个随机项");

  let cs = String(coverSource || "").trim();
  let cr = String(coverRef || "").trim();
  const legacyUri = String(imageUri || "").trim();
  if (!cs && legacyUri) {
    cs = COVER_USER;
    cr = legacyUri;
  }

  const cw = Number(coverWidth);
  const ch = Number(coverHeight);
  const cwSql = Number.isFinite(cw) && cw > 0 ? String(Math.round(cw)) : "NULL";
  const chSql = Number.isFinite(ch) && ch > 0 ? String(Math.round(ch)) : "NULL";

  const createdAt = nowMs();
  const weightEach = 1 / normalizedOptions.length;
  return await withTx(async () => {
    await execSql(
      `INSERT INTO ${TABLE_ITEMS} (title, image_uri, cover_source, cover_ref, cover_width, cover_height, is_preset, created_at, updated_at)
       VALUES ('${q(t)}', '', '${q(cs)}', '${q(cr)}', ${cwSql}, ${chSql}, ${Number(isPreset) ? 1 : 0}, ${createdAt}, ${createdAt})`,
    );
    const idRows = await selectSql("SELECT last_insert_rowid() AS item_id");
    const itemId = idRows[0]?.item_id;
    if (!itemId) throw new Error("创建条目失败");

    for (let i = 0; i < normalizedOptions.length; i += 1) {
      await execSql(
        `INSERT INTO ${TABLE_OPTIONS} (item_id, option_text, sort_index, created_at, weight)
         VALUES (${itemId}, '${q(normalizedOptions[i])}', ${i}, ${createdAt}, ${weightEach})`,
      );
    }
    return itemId;
  });
}

export async function addDrawHistory({ itemId, resultText }) {
  await initItemStore();
  const id = Number(itemId) || 0;
  if (!id) return;
  await execSql(
    `INSERT INTO ${TABLE_HISTORY} (item_id, result_text, created_at)
     VALUES (${id}, '${q(resultText)}', ${nowMs()})`,
  );
}

export async function getRecentHistory(itemId, limit = 20) {
  await initItemStore();
  const id = Number(itemId) || 0;
  if (!id) return [];
  const n = Math.min(Math.max(Number(limit) || 20, 1), 200);
  return await selectSql(
    `SELECT id, item_id, result_text, created_at
     FROM ${TABLE_HISTORY}
     WHERE item_id=${id}
     ORDER BY id DESC
     LIMIT ${n}`,
  );
}

export async function clearHistoryByItem(itemId) {
  await initItemStore();
  const id = Number(itemId) || 0;
  if (!id) return;
  await execSql(`DELETE FROM ${TABLE_HISTORY} WHERE item_id=${id}`);
}

/** 删除所有非预设条目及其选项、历史记录；预设（is_preset=1）保留 */
export async function deleteAllCustomItems() {
  await initItemStore();
  const toRemove = await selectSql(
    `SELECT id, cover_source, cover_ref FROM ${TABLE_ITEMS} WHERE is_preset=0`,
  );
  for (const row of toRemove) {
    const cs = String(row.cover_source ?? row.COVER_SOURCE ?? "").trim();
    const ref = String(row.cover_ref ?? row.COVER_REF ?? "").trim();
    if (cs === COVER_USER && ref) {
      tryRemoveUserCoverFile(ref);
    }
  }
  const rows = await selectSql(
    `SELECT COUNT(*) AS cnt FROM ${TABLE_ITEMS} WHERE is_preset=0`,
  );
  const cnt = Number(rows?.[0]?.cnt ?? rows?.[0]?.CNT ?? 0) || 0;
  await withTx(async () => {
    await execSql(
      `DELETE FROM ${TABLE_HISTORY} WHERE item_id IN (SELECT id FROM ${TABLE_ITEMS} WHERE is_preset=0)`,
    );
    await execSql(
      `DELETE FROM ${TABLE_OPTIONS} WHERE item_id IN (SELECT id FROM ${TABLE_ITEMS} WHERE is_preset=0)`,
    );
    await execSql(`DELETE FROM ${TABLE_ITEMS} WHERE is_preset=0`);
  });
  return cnt;
}

export async function getRandomAlgorithm() {
  await initItemStore();
  const rows = await selectSql(
    `SELECT value FROM ${TABLE_APP_KV} WHERE key='${q(KEY_RANDOM_ALGO)}' LIMIT 1`,
  );
  const v = String(rows[0]?.value ?? rows[0]?.VALUE ?? "").trim();
  if (v === ALGO_UNIFORM) return ALGO_UNIFORM;
  return ALGO_ADAPTIVE;
}

export async function setRandomAlgorithm(mode) {
  await initItemStore();
  const m = mode === ALGO_UNIFORM ? ALGO_UNIFORM : ALGO_ADAPTIVE;
  await execSql(
    `INSERT OR REPLACE INTO ${TABLE_APP_KV} (key, value) VALUES ('${q(KEY_RANDOM_ALGO)}', '${q(m)}')`,
  );
  return m;
}

/** 将所有条目的选项权重重置为均等（总和为 1） */
export async function normalizeWeightsAllItems() {
  await initItemStore();
  await normalizeWeightsAllItemsInternal();
}

export async function normalizeWeightsForItem(itemId) {
  await initItemStore();
  await withTx(async () => {
    await normalizeWeightsForItemTx(Number(itemId) || 0);
  });
}

/**
 * 用一组新文案替换某条目的全部选项（删旧插新；权重均等）。
 * @param {{ clearHistory?: boolean }} clearHistory 为 true 时清空该条目抽取历史
 */
export async function replaceItemOptionsFromTexts(itemId, optionTexts, { clearHistory = false } = {}) {
  await initItemStore();
  const id = Number(itemId) || 0;
  if (!id) throw new Error("条目无效");
  const opts = optionTexts.map((s) => String(s ?? "").trim()).filter(Boolean);
  if (!opts.length) throw new Error("至少添加一个随机项");

  const createdAt = nowMs();
  const weightEach = 1 / opts.length;

  await withTx(async () => {
    if (clearHistory) {
      await execSql(`DELETE FROM ${TABLE_HISTORY} WHERE item_id=${id}`);
    }
    await execSql(`DELETE FROM ${TABLE_OPTIONS} WHERE item_id=${id}`);
    for (let i = 0; i < opts.length; i += 1) {
      await execSql(
        `INSERT INTO ${TABLE_OPTIONS} (item_id, option_text, sort_index, created_at, weight)
         VALUES (${id}, '${q(opts[i])}', ${i}, ${createdAt}, ${weightEach})`,
      );
    }
    await execSql(`UPDATE ${TABLE_ITEMS} SET updated_at=${createdAt} WHERE id=${id}`);
  });
}

export async function adjustAdaptiveWeightsAfterPick(itemId, optionId) {
  await initItemStore();
  const id = Number(itemId) || 0;
  const oid = Number(optionId) || 0;
  if (!id || !oid) return;

  const opts = await selectSql(
    `SELECT id, weight FROM ${TABLE_OPTIONS} WHERE item_id=${id} ORDER BY sort_index ASC, id ASC`,
  );
  if (opts.length < 2) return;

  let weights = opts.map((o) => Number(o.weight ?? o.WEIGHT));
  if (weights.some((w) => !Number.isFinite(w) || w <= 0)) {
    const n = opts.length;
    weights = opts.map(() => 1 / n);
  }
  let sum = weights.reduce((a, b) => a + b, 0);
  weights = weights.map((w) => w / sum);

  const idx = opts.findIndex((o) => Number(o.id ?? o.ID) === oid);
  if (idx < 0) return;

  const next = adjustAdaptiveWeights(weights, idx);
  await withTx(async () => {
    for (let i = 0; i < opts.length; i += 1) {
      const rid = Number(opts[i].id ?? opts[i].ID);
      await execSql(`UPDATE ${TABLE_OPTIONS} SET weight=${next[i]} WHERE id=${rid}`);
    }
  });
}
