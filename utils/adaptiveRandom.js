/** 从选中项权重中取出一部分，均分给其余项，总和保持不变；返回归一化后的新权重数组 */
export function adjustAdaptiveWeights(weights, pickedIndex, shiftFraction = 0.14) {
  const n = weights.length;
  if (!n) return [];
  if (n === 1) return [1];

  let w = weights.map((x) => Number(x));
  if (w.some((x) => !Number.isFinite(x) || x <= 0)) {
    const eq = 1 / n;
    w = Array(n).fill(eq);
  }

  let sum = w.reduce((a, b) => a + b, 0);
  w = w.map((x) => x / sum);

  const idx = pickedIndex;
  const delta = shiftFraction * w[idx];
  const share = delta / (n - 1);

  const next = w.slice();
  next[idx] -= delta;
  for (let i = 0; i < n; i += 1) {
    if (i !== idx) next[i] += share;
  }

  const EPS = 1e-12;
  const clamped = next.map((x) => Math.max(x, EPS));
  const s2 = clamped.reduce((a, b) => a + b, 0);
  return clamped.map((x) => x / s2);
}

/** weights 已归一化（和为 1） */
export function weightedPickIndex(weights) {
  const n = weights.length;
  if (!n) throw new Error("没有可随机的选项");
  let r = Math.random();
  for (let i = 0; i < n; i += 1) {
    if (r < weights[i] || i === n - 1) return i;
    r -= weights[i];
  }
  return n - 1;
}
