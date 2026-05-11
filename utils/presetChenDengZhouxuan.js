import { SHEFU_GRID_LABELS } from "./presetChengyuShefu.js";

/** 与设伏第一行相同：酒、闪、桃 */
const SHEFU_ROW1 = SHEFU_GRID_LABELS.slice(0, 3);

/**
 * 陈登-周旋：3 列 × 2 行
 * - 第一行与设伏相同
 * - 第二行：杀，并将原火杀 / 雷杀位置改为锦囊牌、装备牌（不再显示属性杀）
 */
export const CHENDENG_ZHOUXUAN_GRID_LABELS = [
  ...SHEFU_ROW1,
  "杀",
  "锦囊牌",
  "装备牌",
];

export const CHENDENG_ZHOUXUAN_INIT_DISABLED_LABELS = [];
