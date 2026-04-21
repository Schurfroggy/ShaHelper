import { SHEFU_GRID_LABELS } from "./presetChengyuShefu.js";

/** 九伐网格：上 2×3 + 下 4×3，与设伏前 18 格一致，再接两行扩展 */
export const SHENJIANGWEI_JIEFA_GRID_LABELS = [
  ...SHEFU_GRID_LABELS.slice(0, 18),
  "乐不思蜀",
  "兵粮寸断",
  "闪电",
  "奇正相生",
  "__weapon__",
  "__reset__",
];

export const SHENJIANGWEI_JIEFA_DIVIDER_AFTER_ROWS = 2;

/** 九伐中与设伏一致：火杀 / 雷杀格不可用、不可点击 */
export const SHENJIANGWEI_JIEFA_INIT_DISABLED_LABELS = ["火杀", "雷杀"];
