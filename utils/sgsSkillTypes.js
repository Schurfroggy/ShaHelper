/**
 * 武将技能类型：数据库存英文字段标识（slug），便于查询与校验。
 * 中文展示名见 {@link SGS_SKILL_TYPE_LABEL_ZH}。
 */

/** @typedef {typeof SGS_SKILL_TYPE_NORMAL | typeof SGS_SKILL_TYPE_LORD | typeof SGS_SKILL_TYPE_LOCKED | typeof SGS_SKILL_TYPE_LIMITED | typeof SGS_SKILL_TYPE_AWAKEN | typeof SGS_SKILL_TYPE_TRANSFORM | typeof SGS_SKILL_TYPE_MISSION | typeof SGS_SKILL_TYPE_FACTION | typeof SGS_SKILL_TYPE_CHARGE | typeof SGS_SKILL_TYPE_PERSISTENT | typeof SGS_SKILL_TYPE_OTHER} SgsSkillTypeSlug */

export const SGS_SKILL_TYPE_NORMAL = "normal";
export const SGS_SKILL_TYPE_LORD = "lord";
export const SGS_SKILL_TYPE_LOCKED = "locked";
export const SGS_SKILL_TYPE_LIMITED = "limited";
export const SGS_SKILL_TYPE_AWAKEN = "awaken";
export const SGS_SKILL_TYPE_TRANSFORM = "transform";
export const SGS_SKILL_TYPE_MISSION = "mission";
export const SGS_SKILL_TYPE_FACTION = "faction";
export const SGS_SKILL_TYPE_CHARGE = "charge";
export const SGS_SKILL_TYPE_PERSISTENT = "persistent";
export const SGS_SKILL_TYPE_OTHER = "other";

/** 全部合法 slug（Set） */
export const SGS_SKILL_TYPE_SLUGS = new Set([
  SGS_SKILL_TYPE_NORMAL,
  SGS_SKILL_TYPE_LORD,
  SGS_SKILL_TYPE_LOCKED,
  SGS_SKILL_TYPE_LIMITED,
  SGS_SKILL_TYPE_AWAKEN,
  SGS_SKILL_TYPE_TRANSFORM,
  SGS_SKILL_TYPE_MISSION,
  SGS_SKILL_TYPE_FACTION,
  SGS_SKILL_TYPE_CHARGE,
  SGS_SKILL_TYPE_PERSISTENT,
  SGS_SKILL_TYPE_OTHER,
]);

/** slug → 中文类别名（文档 / 界面可用） */
export const SGS_SKILL_TYPE_LABEL_ZH = Object.freeze({
  [SGS_SKILL_TYPE_NORMAL]: "一般技",
  [SGS_SKILL_TYPE_LORD]: "主公技",
  [SGS_SKILL_TYPE_LOCKED]: "锁定技",
  [SGS_SKILL_TYPE_LIMITED]: "限定技",
  [SGS_SKILL_TYPE_AWAKEN]: "觉醒技",
  [SGS_SKILL_TYPE_TRANSFORM]: "转换技",
  [SGS_SKILL_TYPE_MISSION]: "使命技",
  [SGS_SKILL_TYPE_FACTION]: "势力技",
  [SGS_SKILL_TYPE_CHARGE]: "蓄力技",
  [SGS_SKILL_TYPE_PERSISTENT]: "持恒技",
  [SGS_SKILL_TYPE_OTHER]: "其他类别",
});

/** 默认类型 */
export const SGS_SKILL_TYPE_DEFAULT = SGS_SKILL_TYPE_NORMAL;

/**
 * @param {string} slug
 * @returns {slug is SgsSkillTypeSlug}
 */
export function isValidSkillTypeSlug(slug) {
  return SGS_SKILL_TYPE_SLUGS.has(String(slug || "").trim());
}
