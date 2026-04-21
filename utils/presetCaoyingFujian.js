/** 「曹婴-伏间」动态选项：总人数 n∈[3,8]（含曹婴） */

export const CAOYING_FUJIAN_N_MIN = 3;
export const CAOYING_FUJIAN_N_MAX = 8;

/** 可选总人数列表（含曹婴） */
export const CAOYING_FUJIAN_N_CHOICES = [3, 4, 5, 6, 7, 8];

/** @returns {number} 合法范围内的 n */
export function normalizeCaoyingFujianN(n) {
  const v = Math.floor(Number(n));
  if (!Number.isFinite(v)) return CAOYING_FUJIAN_N_MIN;
  return Math.min(CAOYING_FUJIAN_N_MAX, Math.max(CAOYING_FUJIAN_N_MIN, v));
}

/** 给定 n，应生成的选项条数：2 + max(0, n-3) */
export function expectedCaoyingFujianOptionCount(n) {
  const n0 = normalizeCaoyingFujianN(n);
  return 2 + Math.max(0, n0 - 3);
}

/**
 * 生成曹婴-伏间在人数 n 下的完整选项文案（顺序固定）。
 * @param {number} n
 * @returns {string[]}
 */
export function buildCaoyingFujianOptions(n) {
  const n0 = normalizeCaoyingFujianN(n);
  const out = ["查看曹婴上家的X张手牌", "查看曹婴下家的X张手牌"];
  for (let seat = 3; seat <= n0 - 1; seat += 1) {
    out.push(`曹婴为1号位，查看${seat}号位的X张手牌`);
  }
  return out;
}
