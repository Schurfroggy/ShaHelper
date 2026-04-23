/**
 * H5：sql.js（WASM）+ IndexedDB 整库快照持久化
 * 仅由 itemStore 在 #ifdef H5 下引用；勿在 App 端 import。
 */

import initSqlJs from "sql.js";
import sqlWasmUrl from "sql.js/dist/sql-wasm-browser.wasm?url";

const IDB_NAME = "shahelper_itemstore";
const IDB_VER = 1;
const IDB_STORE = "kv";
const IDB_KEY = "sqlite";

let readyPromise = null;
/** @type {import("sql.js").Database | null} */
let db = null;
/** @type {import("sql.js").SqlJsStatic | null} */
let SQL = null;
let txDepth = 0;
let persistTimer = 0;

function dualCaseRow(obj) {
  const out = { ...obj };
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    out[k.toUpperCase()] = v;
  }
  return out;
}

function openIdb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VER);
    req.onerror = () => reject(req.error || new Error("IndexedDB 打开失败"));
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(IDB_STORE)) {
        req.result.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
  });
}

async function idbGetBytes() {
  const idb = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(IDB_STORE, "readonly");
    const r = tx.objectStore(IDB_STORE).get(IDB_KEY);
    r.onerror = () => reject(r.error || new Error("IndexedDB 读取失败"));
    r.onsuccess = () => resolve(r.result);
  });
}

async function idbPutBytes(u8) {
  const idb = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(IDB_STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error("IndexedDB 写入失败"));
    tx.objectStore(IDB_STORE).put(u8, IDB_KEY);
  });
}

function schedulePersist() {
  if (txDepth > 0 || !db) return;
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persistTimer = 0;
    if (txDepth > 0 || !db) return;
    try {
      const data = db.export();
      idbPutBytes(data).catch((e) => console.error("ShaHelper IDB persist:", e));
    } catch (e) {
      console.error("ShaHelper db.export:", e);
    }
  }, 280);
}

export function ensureDbReady() {
  if (readyPromise) return readyPromise;
  readyPromise = (async () => {
    SQL = await initSqlJs({
      locateFile: (file) => (file.endsWith(".wasm") ? sqlWasmUrl : file),
    });
    let bytes = null;
    try {
      bytes = await idbGetBytes();
    } catch (e) {
      throw new Error(
        e?.message?.includes("IndexedDB") || e?.name === "InvalidStateError"
          ? "无法使用本地存储（如无痕模式）。请在普通窗口打开。"
          : e?.message || "IndexedDB 不可用",
      );
    }
    let u8 = null;
    if (bytes instanceof Uint8Array) u8 = bytes;
    else if (bytes instanceof ArrayBuffer) u8 = new Uint8Array(bytes);
    db = u8 && u8.byteLength > 0 ? new SQL.Database(u8) : new SQL.Database();
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden" && txDepth === 0 && db) {
          try {
            idbPutBytes(db.export()).catch(() => {});
          } catch (_) {}
        }
      });
    }
  })();
  return readyPromise;
}

export async function execSql(sql) {
  await ensureDbReady();
  if (!db) throw new Error("数据库未初始化");
  const u = sql.trim().toUpperCase();
  try {
    db.run(sql);
  } catch (e) {
    throw new Error(e?.message || "执行 SQL 失败");
  }
  if (u.startsWith("BEGIN")) {
    txDepth += 1;
  } else if (u.startsWith("COMMIT") || u.startsWith("ROLLBACK")) {
    txDepth = Math.max(0, txDepth - 1);
  }
  if (txDepth === 0) {
    schedulePersist();
  }
}

export async function selectSql(sql) {
  await ensureDbReady();
  if (!db) throw new Error("数据库未初始化");
  try {
    const stmt = db.prepare(sql);
    const rows = [];
    while (stmt.step()) {
      rows.push(dualCaseRow(stmt.getAsObject()));
    }
    stmt.free();
    return rows;
  } catch (e) {
    throw new Error(e?.message || "查询 SQL 失败");
  }
}
