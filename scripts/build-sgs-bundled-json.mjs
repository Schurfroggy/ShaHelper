#!/usr/bin/env node
/**
 * 从 武将技能信息.md 生成 utils/sgsBundledWarriors.json，供 App 首次启动注入武将库。
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const { parseWarriorsMd } = await import(resolve(__dirname, "../utils/parseWarriorsMd.js"));

const mdPath = resolve(__dirname, "../武将技能信息.md");
const outPath = resolve(__dirname, "../utils/sgsBundledWarriors.json");

const md = readFileSync(mdPath, "utf8");
const list = parseWarriorsMd(md);

const payloads = list.map((w) => ({
  name: w.name,
  skills: w.skills.map((s) => ({
    skillName: s.skillName,
    description: s.description,
    skillOrder: s.skillOrder,
    skillType: s.skillTypeSlug,
  })),
}));

writeFileSync(outPath, JSON.stringify(payloads), "utf8");
console.error(`已写入 ${payloads.length} 名武将 → ${outPath}`);
