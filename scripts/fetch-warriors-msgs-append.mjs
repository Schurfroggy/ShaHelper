#!/usr/bin/env node
/**
 * 从 wiki.biligame.com/msgs 抓取武将经典技能，追加写入 武将技能信息.md
 * 用法：node scripts/fetch-warriors-msgs-append.mjs
 */
import { readFileSync, appendFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_MD = resolve(__dirname, "../武将技能信息.md");
const LOG_FILE = resolve(__dirname, "warriors-fetch-log.txt");

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const NAMES = [
  "虞翻",
  "界吕布",
  "鲁芝",
  "界马超",
  "马岱",
  "朱然",
  "界关羽",
  "界刘表",
  "界张辽",
  "凌操",
  "界张飞",
  "简雍",
  "界孙尚香",
  "界张角",
  "廖化",
  "郭淮",
  "公孙瓒",
  "朱灵",
  "潘璋马忠",
  "曹冲",
  "李丰",
  "界吴国太",
  "界孙策",
  "韩当",
  "关兴张苞",
  "界司马懿",
  "刘封",
  "界孙权",
  "界颜良文丑",
  "界徐盛",
  "界卧龙诸葛",
  "界甄姬",
  "界孟获",
  "界典韦",
  "界高顺",
  "界于吉",
  "界曹仁",
  "步练师",
  "界华雄",
  "界周瑜",
  "界姜维",
  "界刘备",
  "李儒",
  "界黄月英",
  "界法正",
  "界邓艾",
  "界徐晃",
  "界黄忠",
  "界祝融",
  "界张昭张纮",
  "界蔡文姬",
  "界黄盖",
  "界郭嘉",
  "关平",
  "界陆逊",
  "钟会",
  "界董卓",
  "界于禁",
];

const DELAY_MS = 600;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function stripHtml(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** 底部摘要块：武将名 → 体力 →（技能名 + 描述）* */
function parseFooterSkills(lines, warriorName) {
  const ix = lines.lastIndexOf(warriorName);
  if (ix < 0) return null;
  const tail = lines.slice(ix);
  let i = 1;
  if (/^[2345]$/.test(tail[i])) i += 1;

  const skills = [];
  while (i < tail.length) {
    const L = tail[i];
    if (!L || L.startsWith("【武将获取方式")) break;
    if (L.includes("本网络游戏适合")) break;

    const nm = L;
    i += 1;
    const desc = [];
    while (i < tail.length) {
      const t = tail[i];
      if (t.startsWith("【武将获取方式")) break;
      if (t.includes("本网络游戏适合")) break;

      const maybeNextTitle =
        desc.length > 0 &&
        /^[\u4e00-\u9fff·]{2,8}$/.test(t) &&
        !t.includes("。") &&
        !t.startsWith("①") &&
        !t.startsWith("②") &&
        !t.startsWith("③") &&
        tail[i + 1] &&
        tail[i + 1].length > 10;

      if (maybeNextTitle) break;

      desc.push(t);
      i += 1;
    }
    const body = desc.join("\n\n").trim();
    if (nm && body) skills.push({ name: nm, body });
  }

  return skills.length ? skills : null;
}

/** 经典区内「技能」～「台词」备用 */
function extractClassicChunk(lines) {
  let cidx = lines.indexOf("经典");
  if (cidx < 0) cidx = 0;
  let sidx = -1;
  for (let j = cidx; j < lines.length; j++) {
    if (lines[j] === "技能") {
      sidx = j;
      break;
    }
    if (lines[j] === "## 皮肤") break;
  }
  if (sidx < 0) return null;
  let eidx = -1;
  for (let j = sidx + 1; j < lines.length; j++) {
    if (lines[j] === "台词") {
      eidx = j;
      break;
    }
  }
  if (eidx < 0) return null;
  return lines
    .slice(sidx + 1, eidx)
    .filter((ln) => ln && !ln.includes("http") && !ln.includes(".character-lines") && ln !== "×");
}

function chunkToSkills(parts) {
  if (!parts?.length) return [];
  let i = 0;
  if (/^[2345]$/.test(parts[0])) i = 1;
  const skills = [];
  while (i < parts.length) {
    const nm = parts[i];
    i += 1;
    const desc = [];
    while (i < parts.length) {
      const line = parts[i];
      const splitNext =
        desc.length > 0 &&
        /^[\u4e00-\u9fff·]{2,8}$/.test(line) &&
        !line.includes("。") &&
        line.length <= 8 &&
        parts[i + 1] &&
        parts[i + 1].length > 12;
      if (splitNext) break;
      desc.push(line);
      i += 1;
    }
    const body = desc.join("\n\n").trim();
    if (nm && body) skills.push({ name: nm, body });
  }
  return skills;
}

async function fetchWarrior(name) {
  const api = `https://wiki.biligame.com/msgs/api.php?action=parse&page=${encodeURIComponent(
    name,
  )}&prop=text&format=json`;
  const res = await fetch(api, { headers: { "User-Agent": UA } });
  const text = await res.text();
  if (!text.trim().startsWith("{")) throw new Error("响应非 JSON（可能被 WAF 拦截）");
  const data = JSON.parse(text);
  const html = data?.parse?.text?.["*"];
  if (!html) throw new Error("无 wiki 正文");

  const lines = stripHtml(html)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let skills = parseFooterSkills(lines, name);
  if (!skills?.length) {
    const chunk = extractClassicChunk(lines);
    skills = chunk ? chunkToSkills(chunk) : null;
  }
  if (!skills?.length) throw new Error("未能解析技能文本");
  return skills;
}

function formatBlock(index, warriorName, skills) {
  const out = [`${index}.${warriorName}`, ""];
  skills.forEach((s, si) => {
    out.push(`${si + 1}）${s.name}：${s.body}`);
    out.push("");
  });
  return `${out.join("\n").trimEnd()}\n\n`;
}

function nextStartIndex(md) {
  const m = [...md.matchAll(/^(\d+)\.[^\n]*$/gm)].map((x) => parseInt(x[1], 10));
  return m.length ? Math.max(...m) + 1 : 1;
}

async function main() {
  let md = readFileSync(OUT_MD, "utf8");
  md = md.replace(/\n*27\.\s*$/m, "\n");
  writeFileSync(OUT_MD, md.trimEnd() + "\n", "utf8");

  let idx = nextStartIndex(readFileSync(OUT_MD, "utf8"));
  const log = [];

  for (const name of NAMES) {
    try {
      await sleep(DELAY_MS);
      const skills = await fetchWarrior(name);
      const block = formatBlock(idx, name, skills);
      appendFileSync(OUT_MD, block, "utf8");
      log.push(`OK ${idx} ${name}`);
      console.error(`OK ${idx} ${name}`);
      idx += 1;
    } catch (e) {
      const msg = e?.message || String(e);
      log.push(`FAIL ${name}: ${msg}`);
      console.error(`FAIL ${name}: ${msg}`);
    }
  }
  writeFileSync(LOG_FILE, log.join("\n"), "utf8");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
