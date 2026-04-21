/**
 * 每名武将占位图背景色：由 id 确定性推导，列表与详情一致。
 * 使用 HSL，饱和度与明度控制在舒适范围内。
 *
 * @param {number} generalId
 * @returns {string} CSS color, e.g. hsl(212, 48%, 52%)
 */
export function placeholderColorForGeneralId(generalId) {
  const id = Number(generalId) || 0;
  const mix = (id * 9301 + 49297) >>> 0;
  const hue = mix % 360;
  const sat = 38 + (mix % 22);
  const light = 44 + ((mix >>> 8) % 18);
  return `hsl(${hue}, ${sat}%, ${light}%)`;
}
