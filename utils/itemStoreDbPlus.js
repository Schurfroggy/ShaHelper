/** App 端：5+ Runtime SQLite（仅 APP-PLUS 打包） */

const DB_NAME = "random_generator_db";
const DB_PATH = "_doc/random_generator.db";

let readyPromise = null;

export function ensureDbReady() {
  if (readyPromise) return readyPromise;
  readyPromise = new Promise((resolve, reject) => {
    if (typeof plus === "undefined" || !plus.sqlite) {
      reject(new Error("当前环境不支持 SQLite"));
      return;
    }
    plus.sqlite.openDatabase({
      name: DB_NAME,
      path: DB_PATH,
      success: resolve,
      fail: (err) => reject(new Error(err?.message || "打开数据库失败")),
    });
  });
  return readyPromise;
}

export function execSql(sql) {
  return new Promise((resolve, reject) => {
    plus.sqlite.executeSql({
      name: DB_NAME,
      sql,
      success: resolve,
      fail: (err) => reject(new Error(err?.message || "执行 SQL 失败")),
    });
  });
}

export function selectSql(sql) {
  return new Promise((resolve, reject) => {
    plus.sqlite.selectSql({
      name: DB_NAME,
      sql,
      success: (data) => resolve(Array.isArray(data) ? data : []),
      fail: (err) => reject(new Error(err?.message || "查询 SQL 失败")),
    });
  });
}
