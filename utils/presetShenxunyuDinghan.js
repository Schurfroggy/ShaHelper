import { SHEFU_GRID_LABELS } from "./presetChengyuShefu.js";

/** 原程昱网格第 3～6 行（过河拆桥 … 无中生有），共 12 张 */
const SHEFU_GRID_TAIL = SHEFU_GRID_LABELS.slice(6);

/**
 * 神荀彧-定汉（3 列 × 6 行）：
 * - 上四行：与原程昱网格下方四行相同
 * - 下两行：兵粮寸断 / 乐不思蜀 / 奇正相生；「闪电」居中（两侧空占位）
 */
export const SHENXUNYU_DINGHAN_GRID_LABELS = [
  ...SHEFU_GRID_TAIL,
  "兵粮寸断",
  "乐不思蜀",
  "奇正相生",
  "",
  "闪电",
  "",
];
