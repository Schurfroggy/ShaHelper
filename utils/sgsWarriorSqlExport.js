/**
 * 仅生成 SQL 文本，无 SQLite / uni-app 依赖，供 Node 命令行脚本使用。
 */
import { normalizeWarriorPayload } from "./sgsWarriorNormalize.js";

const TABLE_GENERALS = "sgs_generals";
const TABLE_SKILLS = "sgs_general_skills";

function escQuote(s) {
  return String(s ?? "").replace(/'/g, "''");
}

function nowMs() {
  return Date.now();
}

/**
 * @param {Record<string, unknown>} payloadRaw
 * @returns {{ sql: string, normalized: ReturnType<typeof normalizeWarriorPayload> }}
 */
export function buildWarriorInsertSqlStatements(payloadRaw) {
  const normalized = normalizeWarriorPayload(payloadRaw);
  const { name, skills } = normalized;
  const t = nowMs();
  const q = escQuote;

  const lines = [];
  lines.push("BEGIN TRANSACTION;");
  lines.push(
    `INSERT INTO ${TABLE_GENERALS} (name, skill_count, created_at, updated_at) VALUES ('${q(
      name,
    )}', ${skills.length}, ${t}, ${t});`,
  );
  for (const s of skills) {
    lines.push(
      `INSERT INTO ${TABLE_SKILLS} (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM ${TABLE_GENERALS}), '${q(s.skillName)}', '${q(
        s.description,
      )}', ${s.skillOrder}, '${q(s.skillTypeSlug)}', ${t});`,
    );
  }
  lines.push("COMMIT;");
  return { sql: `${lines.join("\n")}\n`, normalized };
}
