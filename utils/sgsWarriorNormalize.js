/**
 * 武将/技能 JSON 校验与规范化（无 uni-app 依赖，可供 Node 脚本与运行时共用）。
 *
 * 约定字段：
 * - name：武将名称
 * - skills：数组，每项含 skillName（或 name）、description、skillOrder（或 order，从 1 起）
 * - skillType（或 skill_type、type）：技能类型 slug（见 `sgsSkillTypes.js`）；缺省为 normal（一般技）
 */

import {
  isValidSkillTypeSlug,
  SGS_SKILL_TYPE_DEFAULT,
  SGS_SKILL_TYPE_LABEL_ZH,
} from "./sgsSkillTypes.js";

function slugHint() {
  const pairs = Object.entries(SGS_SKILL_TYPE_LABEL_ZH).map(([k, v]) => `${k}＝${v}`);
  return pairs.join("；");
}

export function normalizeWarriorPayload(input) {
  const name = String(input?.name ?? "").trim();
  if (!name) throw new Error("武将名称不能为空");

  const rawSkills = input?.skills;
  if (!Array.isArray(rawSkills) || rawSkills.length === 0) {
    throw new Error("至少包含一条技能");
  }

  const skills = rawSkills.map((raw, idx) => {
    const skillName = String(raw?.skillName ?? raw?.name ?? "").trim();
    const description = String(raw?.description ?? "").trim();
    const orderRaw = raw?.skillOrder ?? raw?.order ?? raw?.skill_order;
    const skillOrder = Number(orderRaw);

    if (!skillName) throw new Error(`第 ${idx + 1} 条技能缺少名称`);
    if (!description) throw new Error(`技能「${skillName}」描述不能为空`);
    if (!Number.isFinite(skillOrder) || skillOrder < 1 || !Number.isInteger(skillOrder)) {
      throw new Error(`技能「${skillName}」序号须为正整数（1＝一技能，2＝二技能……）`);
    }

    const typeRaw = raw?.skillType ?? raw?.skill_type ?? raw?.type;
    const skillTypeSlug = String(
      typeRaw === undefined || typeRaw === null || typeRaw === "" ? SGS_SKILL_TYPE_DEFAULT : typeRaw,
    ).trim();
    if (!isValidSkillTypeSlug(skillTypeSlug)) {
      throw new Error(
        `技能「${skillName}」类型标识无效：「${skillTypeSlug}」。合法值：${slugHint()}`,
      );
    }

    return { skillName, description, skillOrder, skillTypeSlug };
  });

  const orders = skills.map((s) => s.skillOrder);
  const uniq = new Set(orders);
  if (uniq.size !== orders.length) throw new Error("同一武将的技能序号不能重复");

  skills.sort((a, b) => a.skillOrder - b.skillOrder);

  return {
    name,
    skills,
    skillCount: skills.length,
  };
}
