/**
 * 将 resource/presets 同步到 static/presets（打包进 APK 使用 static）。
 * 忽略隐藏文件（如 .DS_Store）。
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "resource", "presets");
const DEST = path.join(ROOT, "static", "presets");

function shouldSkip(name) {
  return name.startsWith(".");
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) {
    console.warn("[sync-preset-assets] 源目录不存在，跳过:", from);
    return;
  }
  fs.mkdirSync(to, { recursive: true });
  for (const name of fs.readdirSync(from)) {
    if (shouldSkip(name)) continue;
    const s = path.join(from, name);
    const d = path.join(to, name);
    const stat = fs.statSync(s);
    if (stat.isDirectory()) {
      copyDir(s, d);
    } else if (stat.isFile()) {
      fs.copyFileSync(s, d);
      console.log("[sync-preset-assets]", path.relative(ROOT, s), "->", path.relative(ROOT, d));
    }
  }
}

copyDir(SRC, DEST);
console.log("[sync-preset-assets] 完成");
