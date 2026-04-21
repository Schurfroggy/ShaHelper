#!/usr/bin/env node
/**
 * 从 武将技能信息.md 解析全部武将/技能，写入本地 SQLite（与 itemStore 中 sgs_* 表结构一致）。
 * 星号 * 不写入；**类别，** 行首标记映射为 skill_type_slug 后从正文中剥除。
 *
 * 用法:
 *   node scripts/import-sgs-warriors-from-md.mjs
 *   node scripts/import-sgs-warriors-from-md.mjs --db ./data/sgs_warriors.db
 *   node scripts/import-sgs-warriors-from-md.mjs --sql-only   # 只写 .sql 不执行 sqlite3
 */
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));

const { parseWarriorsMd } = await import(resolve(__dirname, "../utils/parseWarriorsMd.js"));
const { buildWarriorInsertSqlStatements } = await import(resolve(__dirname, "../utils/sgsWarriorSqlExport.js"));

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS sgs_generals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  skill_count INTEGER NOT NULL DEFAULT 0 CHECK (skill_count >= 0),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sgs_general_skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  general_id INTEGER NOT NULL,
  skill_name TEXT NOT NULL,
  description TEXT NOT NULL,
  skill_order INTEGER NOT NULL CHECK (skill_order >= 1),
  skill_type_slug TEXT NOT NULL DEFAULT 'normal',
  created_at INTEGER NOT NULL,
  UNIQUE(general_id, skill_order)
);
CREATE INDEX IF NOT EXISTS idx_sgs_general_skills_gid ON sgs_general_skills(general_id);
`;

function parseArgs(argv) {
  let dbPath = resolve(process.cwd(), "data/sgs_warriors.db");
  let mdPath = resolve(process.cwd(), "武将技能信息.md");
  let sqlOnly = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--db") dbPath = resolve(process.cwd(), argv[++i] || "");
    else if (a === "--md") mdPath = resolve(process.cwd(), argv[++i] || "");
    else if (a === "--sql-only") sqlOnly = true;
  }
  return { dbPath, mdPath, sqlOnly };
}

const { dbPath, mdPath, sqlOnly } = parseArgs(process.argv.slice(2));

const mdText = readFileSync(mdPath, "utf8");
const parsed = parseWarriorsMd(mdText);

const chunks = [];
chunks.push("-- 武将库：由 import-sgs-warriors-from-md 自 武将技能信息.md 生成\n");
chunks.push("PRAGMA foreign_keys = OFF;\n");
chunks.push(SCHEMA_SQL.trim() + "\n\n");
chunks.push("DELETE FROM sgs_general_skills;\n");
chunks.push("DELETE FROM sgs_generals;\n\n");

for (const w of parsed) {
  const { sql, normalized } = buildWarriorInsertSqlStatements({
    name: w.name,
    skills: w.skills.map((s) => ({
      skillName: s.skillName,
      description: s.description,
      skillOrder: s.skillOrder,
      skillType: s.skillTypeSlug,
    })),
  });
  chunks.push(`-- ${normalized.name}（${normalized.skillCount}）\n`);
  chunks.push(sql);
  chunks.push("\n");
}

const fullSql = chunks.join("");

const sqlOut = resolve(process.cwd(), "data/sgs_warriors_import.sql");
mkdirSync(dirname(sqlOut), { recursive: true });
writeFileSync(sqlOut, fullSql, "utf8");
console.error(`已写入 SQL: ${sqlOut}`);
console.error(`武将数: ${parsed.length}`);

if (sqlOnly) {
  process.exit(0);
}

function hasSqlite3() {
  try {
    execFileSync("sqlite3", ["--version"], { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

if (!hasSqlite3()) {
  console.error("未找到 sqlite3 命令，已仅生成 SQL。安装 SQLite CLI 后执行：");
  console.error(`  sqlite3 "${dbPath}" < "${sqlOut}"`);
  process.exit(0);
}

mkdirSync(dirname(dbPath), { recursive: true });
execFileSync("sqlite3", [dbPath], { input: fullSql, stdio: ["pipe", "inherit", "inherit"] });
console.error(`已导入数据库: ${dbPath}`);
