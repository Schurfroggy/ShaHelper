/**
 * 在闭区间 [min, max] 内生成随机数，支持整数 BigInt 与普通浮点数。
 * 返回值：{ kind: 'string'|'number', value }
 */
export function randomInRange(minRaw, maxRaw) {
  const minStr = String(minRaw ?? "").trim();
  const maxStr = String(maxRaw ?? "").trim();

  if (minStr === "" || maxStr === "") {
    throw new Error("请输入最小值和最大值");
  }

  const minInt = tryParseIntegerString(minStr);
  const maxInt = tryParseIntegerString(maxStr);

  if (minInt && maxInt) {
    let lo = minInt;
    let hi = maxInt;
    if (lo > hi) {
      const t = lo;
      lo = hi;
      hi = t;
    }
    const value = randomBigIntInclusive(lo, hi);
    return { kind: "string", value: String(value) };
  }

  const minNum = Number(minStr);
  const maxNum = Number(maxStr);
  if (!Number.isFinite(minNum) || !Number.isFinite(maxNum)) {
    throw new Error("请输入有效数字");
  }
  let lo = minNum;
  let hi = maxNum;
  if (lo > hi) {
    const t = lo;
    lo = hi;
    hi = t;
  }
  const value = Math.random() * (hi - lo) + lo;
  return { kind: "number", value };
}

export function pickRandomOption(options) {
  if (!Array.isArray(options)) {
    throw new Error("选项格式错误");
  }
  const normalized = options.map((s) => String(s ?? "").trim()).filter(Boolean);
  if (!normalized.length) {
    throw new Error("没有可随机的选项");
  }
  const index = Math.floor(Math.random() * normalized.length);
  return normalized[index];
}

/** @returns {{ index: number, text: string }} */
export function pickUniformOptionWithIndex(options) {
  if (!Array.isArray(options)) {
    throw new Error("选项格式错误");
  }
  const list = options.map((s) => String(s ?? "").trim()).filter(Boolean);
  if (!list.length) {
    throw new Error("没有可随机的选项");
  }
  const index = Math.floor(Math.random() * list.length);
  return { index, text: list[index] };
}

function tryParseIntegerString(s) {
  if (!/^-?\d+$/.test(s)) return null;
  try {
    return BigInt(s);
  } catch {
    return null;
  }
}

/** 均匀随机整数，闭区间 [min, max] */
function randomBigIntInclusive(min, max) {
  const span = max - min;
  if (span === 0n) return min;
  const range = span + 1n;
  const bitLen = range.toString(2).length;
  for (;;) {
    let acc = 0n;
    let built = 0;
    while (built < bitLen) {
      const chunk = Math.min(53, bitLen - built);
      const part = BigInt(Math.floor(Math.random() * 2 ** chunk));
      acc = (acc << BigInt(chunk)) + part;
      built += chunk;
    }
    const mask = (1n << BigInt(bitLen)) - 1n;
    let candidate = acc & mask;
    if (candidate < range) {
      return min + candidate;
    }
  }
}
