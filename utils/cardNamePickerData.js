import { SHENXUNYU_DINGHAN_GRID_LABELS } from "./presetShenxunyuDinghan.js";

export const CARD_SUITS = [
  { id: "spade", symbol: "♠", red: false },
  { id: "heart", symbol: "♥", red: true },
  { id: "club", symbol: "♣", red: false },
  { id: "diamond", symbol: "♦", red: true },
];

export const CARD_RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export const CARD_TYPE_BASIC = "basic";
export const CARD_TYPE_TRICK = "trick";
export const CARD_TYPE_EQUIP = "equip";

export const CARD_TYPE_OPTIONS = [
  { id: CARD_TYPE_BASIC, label: "基本牌" },
  { id: CARD_TYPE_TRICK, label: "锦囊牌" },
  { id: CARD_TYPE_EQUIP, label: "装备牌" },
];

export const TYPE_CHAR = {
  [CARD_TYPE_BASIC]: "基",
  [CARD_TYPE_TRICK]: "锦",
  [CARD_TYPE_EQUIP]: "装",
};

export const BASIC_CARD_NAMES = ["酒", "闪", "桃", "杀", "火杀", "雷杀"];

/** 神荀彧-定汉网格中的锦囊名（不含「奇正相生」与空占位） */
export const TRICK_CARD_NAMES = SHENXUNYU_DINGHAN_GRID_LABELS.map((s) => String(s ?? "").trim()).filter(
  (s) => s && s !== "奇正相生",
);

export const TRICK_DELAYED_NAMES = ["兵粮寸断", "乐不思蜀", "闪电"];

const TRICK_DELAYED_SET = new Set(TRICK_DELAYED_NAMES);

export const TRICK_BASIC_NAMES = TRICK_CARD_NAMES.filter((n) => !TRICK_DELAYED_SET.has(n));

/** 锦囊牌名称分组（选择器展示用） */
export const TRICK_NAME_GROUPS = [
  { key: "basic", label: "基本锦囊", names: TRICK_BASIC_NAMES },
  { key: "delayed", label: "延时类锦囊", names: TRICK_DELAYED_NAMES },
];

export const EQUIP_WEAPON_NAMES = [
  "诸葛连弩",
  "雌雄双股剑",
  "青釭剑",
  "丈八蛇矛",
  "贯石斧",
  "青龙偃月刀",
  "方天画戟",
  "麒麟弓",
  "寒冰剑",
  "古锭刀",
  "朱雀羽扇",
];

export const EQUIP_ARMOR_NAMES = ["八卦阵", "仁王盾", "藤甲", "白银狮子", "太平要术"];

export const EQUIP_HORSE_NAMES = [
  "绝影（+1）",
  "骅骝（+1）",
  "的卢（+1）",
  "爪黄飞电（+1）",
  "紫骍（-1）",
  "大宛（-1）",
  "赤兔（-1）",
];

export const EQUIP_TREASURE_NAMES = ["木牛流马"];

/** 装备牌名称分组（选择器展示用） */
export const EQUIP_NAME_GROUPS = [
  { key: "weapon", label: "武器", names: EQUIP_WEAPON_NAMES },
  { key: "armor", label: "防具", names: EQUIP_ARMOR_NAMES },
  { key: "horse", label: "马", names: EQUIP_HORSE_NAMES },
  { key: "treasure", label: "宝物", names: EQUIP_TREASURE_NAMES },
];

export const EQUIP_CARD_NAMES = EQUIP_NAME_GROUPS.flatMap((g) => g.names);

export const OTHER_NAME_OPTION = "__other__";

export function namesForCardType(cardType) {
  if (cardType === CARD_TYPE_BASIC) return BASIC_CARD_NAMES;
  if (cardType === CARD_TYPE_TRICK) return TRICK_CARD_NAMES;
  if (cardType === CARD_TYPE_EQUIP) return EQUIP_CARD_NAMES;
  return [];
}

export function isSuitRankRed(suitSymbol) {
  return suitSymbol === "♥" || suitSymbol === "♦";
}

/** @param {{ suit?: string; rank?: string; name?: string; cardType?: string }} item */
export function resolveDisplayName(item) {
  if (item.name === OTHER_NAME_OPTION) return String(item.customName ?? "").trim();
  if (item.name) return String(item.name);
  return "";
}

/** 花色、点数可空；须已选类型且有名（列表项或「其他」自定义） */
export function isCardLabelComplete(item) {
  if (!String(item?.cardType ?? "").trim()) return false;
  return Boolean(resolveDisplayName(item));
}

export function createEmptyPickerState() {
  return {
    suit: "",
    rank: "",
    cardType: "",
    name: "",
    customName: "",
  };
}
