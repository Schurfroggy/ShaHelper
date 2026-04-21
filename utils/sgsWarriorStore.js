import { normalizeWarriorPayload } from "./sgsWarriorNormalize.js";
import { withItemStoreDb } from "./itemStore.js";
import bundledWarriors from "./sgsBundledWarriors.json";

export const TABLE_SGS_GENERALS = "sgs_generals";
export const TABLE_SGS_SKILLS = "sgs_general_skills";

function isLikelyUniqueConstraintError(err) {
  const m = String(err?.message ?? err ?? "");
  return /unique|constraint|UNIQUE|已存在/i.test(m);
}

/**
 * 若武将不足 3 名，则从内置 JSON 批量写入（与 武将技能信息.md 同步生成）。
 * 已存在的武将名会跳过（用于补全空库或部分导入后的缺口）。
 */
export async function seedBundledWarriorsIfNeeded() {
  const n = await withItemStoreDb(async ({ selectSql }) => {
    const r = await selectSql(
      `SELECT COUNT(*) AS cnt FROM ${TABLE_SGS_GENERALS}`,
    );
    return Number(r[0]?.cnt ?? r[0]?.CNT ?? r[0]?.c ?? r[0]?.C ?? 0);
  });
  if (n >= 3) return;

  for (const raw of bundledWarriors) {
    try {
      await insertGeneralWithSkills(raw);
    } catch (e) {
      if (isLikelyUniqueConstraintError(e)) continue;
      throw e;
    }
  }
}

function nowMs() {
  return Date.now();
}

/**
 * 插入一名武将及其全部技能（事务）。skill_count 始终等于本次插入的技能条数。
 * @param {{ name: string, skills: Array<{ skillName: string, description: string, skillOrder: number, skillTypeSlug?: string }> }} payload
 * @returns {Promise<number>} 新武将 id
 */
export async function insertGeneralWithSkills(payload) {
  const { name, skills } = normalizeWarriorPayload(payload);
  const skCount = skills.length;

  return withItemStoreDb(async ({ execSql, selectSql, withTx, q }) => {
    let newId = 0;
    await withTx(async () => {
      const t = nowMs();
      await execSql(
        `INSERT INTO ${TABLE_SGS_GENERALS} (name, skill_count, created_at, updated_at)
         VALUES ('${q(name)}', ${skCount}, ${t}, ${t})`,
      );
      const idRows = await selectSql("SELECT last_insert_rowid() AS gid");
      newId = Number(idRows[0]?.gid ?? idRows[0]?.GID ?? 0);
      if (!newId) throw new Error("插入武将失败");

      for (const s of skills) {
        await execSql(
          `INSERT INTO ${TABLE_SGS_SKILLS} (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
           VALUES (${newId}, '${q(s.skillName)}', '${q(s.description)}', ${s.skillOrder}, '${q(
             s.skillTypeSlug,
           )}', ${t})`,
        );
      }
    });
    return newId;
  });
}

/** @returns {Promise<Array<{ id: number, name: string, skill_count: number }>>} */
export async function listSgsGenerals() {
  return withItemStoreDb(async ({ selectSql }) => {
    const rows = await selectSql(
      `SELECT id, name, skill_count FROM ${TABLE_SGS_GENERALS} ORDER BY id ASC`,
    );
    return rows.map((r) => ({
      id: Number(r.id ?? r.ID),
      name: String(r.name ?? r.NAME ?? ""),
      skill_count: Number(r.skill_count ?? r.SKILL_COUNT ?? 0),
    }));
  });
}

/**
 * 列出全部武将及技能名（不含详情），用于化身等界面一次拉取。
 * @returns {Promise<Array<{ id: number, name: string, skillNames: string[] }>>}
 */
export async function listAllGeneralsWithSkillNames() {
  await seedBundledWarriorsIfNeeded();
  return withItemStoreDb(async ({ selectSql }) => {
    const rows = await selectSql(
      `SELECT g.id AS gid, g.name AS gname, s.skill_name AS skname, s.skill_order AS skord
       FROM ${TABLE_SGS_GENERALS} g
       LEFT JOIN ${TABLE_SGS_SKILLS} s ON s.general_id = g.id
       ORDER BY g.id ASC, s.skill_order ASC, s.id ASC`,
    );
    /** @type {Map<number, { id: number; name: string; skillNames: string[] }>} */
    const map = new Map();
    for (const r of rows) {
      const id = Number(r.gid ?? r.GID ?? 0);
      const name = String(r.gname ?? r.GNAME ?? "");
      if (!id) continue;
      if (!map.has(id)) {
        map.set(id, { id, name, skillNames: [] });
      }
      const sn = String(r.skname ?? r.SKNAME ?? "").trim();
      if (sn) map.get(id).skillNames.push(sn);
    }
    return Array.from(map.values());
  });
}

/**
 * @param {number} generalId
 * @returns {Promise<{ id: number, name: string, skill_count: number, skills: Array<{ id: number, skillName: string, description: string, skillOrder: number, skillTypeSlug: string }> } | null>}
 */
export async function getSgsGeneralWithSkills(generalId) {
  const gid = Number(generalId) || 0;
  if (!gid) return null;

  return withItemStoreDb(async ({ selectSql }) => {
    const gens = await selectSql(
      `SELECT id, name, skill_count FROM ${TABLE_SGS_GENERALS} WHERE id=${gid} LIMIT 1`,
    );
    if (!gens.length) return null;
    const g = gens[0];
    const skillsRows = await selectSql(
      `SELECT id, skill_name, description, skill_order, skill_type_slug
       FROM ${TABLE_SGS_SKILLS}
       WHERE general_id=${gid}
       ORDER BY skill_order ASC, id ASC`,
    );
    return {
      id: Number(g.id ?? g.ID),
      name: String(g.name ?? g.NAME ?? ""),
      skill_count: Number(g.skill_count ?? g.SKILL_COUNT ?? 0),
      skills: skillsRows.map((r) => ({
        id: Number(r.id ?? r.ID),
        skillName: String(r.skill_name ?? r.SKILL_NAME ?? ""),
        description: String(r.description ?? r.DESCRIPTION ?? ""),
        skillOrder: Number(r.skill_order ?? r.SKILL_ORDER ?? 0),
        skillTypeSlug: String(r.skill_type_slug ?? r.SKILL_TYPE_SLUG ?? "normal"),
      })),
    };
  });
}

export { buildWarriorInsertSqlStatements } from "./sgsWarriorSqlExport.js";