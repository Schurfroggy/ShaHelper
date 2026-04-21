#!/usr/bin/env node
/**
 * 武将数据插入助手：校验 JSON → 打印可执行的 SQLite 脚本（或写入文件）。
 * 不依赖 App 运行时；勿直接引用 itemStore（含 uni/plus）。
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const { buildWarriorInsertSqlStatements } = await import(
  resolve(__dirname, "../utils/sgsWarriorSqlExport.js"),
);

function usage() {
  console.error(`用法:
  node scripts/insert-sgs-warrior.mjs <武将.json> [--output <xxx.sql>]

示例:
  node scripts/insert-sgs-warrior.mjs scripts/examples/warrior-sample.json
  node scripts/insert-sgs-warrior.mjs ./my.json --output ./out.sql

说明:
  - JSON 字段见 README「武将数据库」一节。
  - 默认将 SQL 打印到 stdout；提供 --output 时写入文件。
`);
}

const argv = process.argv.slice(2);
const outIdx = argv.indexOf("--output");
let outPath = "";
if (outIdx >= 0) {
  outPath = argv[outIdx + 1] || "";
  argv.splice(outIdx, 2);
}

const jsonPath = argv.filter((a) => !a.startsWith("--"))[0];
if (!jsonPath) {
  usage();
  process.exit(1);
}

let raw;
try {
  raw = JSON.parse(readFileSync(resolve(process.cwd(), jsonPath), "utf8"));
} catch (e) {
  console.error("读取或解析 JSON 失败:", e.message || e);
  process.exit(1);
}

try {
  const { sql, normalized } = buildWarriorInsertSqlStatements(raw);
  const header = `-- 武将: ${normalized.name}（${normalized.skillCount} 个技能）\n`;
  const text = header + sql;

  if (outPath) {
    const p = resolve(process.cwd(), outPath);
    writeFileSync(p, text, "utf8");
    console.error(`已写入: ${p}`);
  } else {
    process.stdout.write(text);
  }
} catch (e) {
  console.error(e.message || e);
  process.exit(1);
}
