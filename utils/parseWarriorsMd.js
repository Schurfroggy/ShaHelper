/**
 * 解析 `武将技能信息.md`：
 * - 段落 `N.武将名`（如 `1.界曹植`）；
 * - 技能行 `k）技能名：` + 正文，续行直至下一个技能或武将标题。
 */

import {
  SGS_SKILL_TYPE_AWAKEN,
  SGS_SKILL_TYPE_LIMITED,
  SGS_SKILL_TYPE_LOCKED,
  SGS_SKILL_TYPE_LORD,
  SGS_SKILL_TYPE_NORMAL,
} from "./sgsSkillTypes.js";

const FULLWIDTH_RPAREN = "\uFF09"; // ）
const FULLWIDTH_COLON = "\uFF1A"; // ：

/** @param {string} raw */
function classifySkillOpening(raw) {
  let s = raw.trimStart();

  /**
   * 行首 **…** 仅用于分类 + 入库时写入 `skill_type_slug`；描述中保留对应中文（无 *），与武将信息原文一致。
   * 顺序：组合主公+觉醒 → 觉醒 → 限定 → 锁定 → 主公。
   */
  const rules = [
    {
      re: /^\*\*主公技\s*[，,、]\s*觉醒技\s*[，,、]?\*\*\s*/,
      slug: SGS_SKILL_TYPE_AWAKEN,
      plainPrefix: "主公技，觉醒技，",
    },
    {
      re: /^\*\*觉醒技\s*[，,、]?\*\*\s*/,
      slug: SGS_SKILL_TYPE_AWAKEN,
      plainPrefix: "觉醒技，",
    },
    {
      re: /^\*\*限定技\s*[，,、]?\*\*\s*/,
      slug: SGS_SKILL_TYPE_LIMITED,
      plainPrefix: "限定技，",
    },
    {
      re: /^\*\*锁定技\s*[，,、]?\*\*\s*/,
      slug: SGS_SKILL_TYPE_LOCKED,
      plainPrefix: "锁定技，",
    },
    {
      re: /^\*\*主公技\s*[，,、]?\*\*\s*/,
      slug: SGS_SKILL_TYPE_LORD,
      plainPrefix: "主公技，",
    },
  ];

  let slug = SGS_SKILL_TYPE_NORMAL;
  for (const { re, slug: sl, plainPrefix } of rules) {
    const m = s.match(re);
    if (m) {
      slug = sl;
      s = plainPrefix + s.slice(m[0].length);
      break;
    }
  }

  /** 去掉其余星号（卡牌名强调等），类型行已换成纯文本前缀 */
  const description = stripStars(s).trim();

  return { skillTypeSlug: slug, description };
}

/** @param {string} s */
function stripStars(s) {
  return s.replace(/\*/g, "");
}

/**
 * @param {string} mdText
 * @returns {{ order: number; name: string; skills: { skillOrder: number; skillName: string; description: string; skillTypeSlug: string }[] }[]}
 */
export function parseWarriorsMd(mdText) {
  const lines = mdText.replace(/\r\n/g, "\n").split("\n");

  /** @type {{ order: number; name: string; skillLines?: string[] }[]} */
  const warriors = [];

  /** @type {{ order: number; name: string; skillLines?: string[] } | null} */
  let curWarrior = null;
  /** @type {{ order: number; skillName: string; descLines: string[] } | null} */
  let curSkill = null;

  const warriorRe = /^(\d+)\.(.+)$/;
  /** 起始行：`1）落英：` */
  const skillHeadRe = new RegExp(`^(\\d+)${FULLWIDTH_RPAREN}([^${FULLWIDTH_COLON}]+)${FULLWIDTH_COLON}(.*)$`);

  function flushSkill() {
    if (!curWarrior || !curSkill) return;
    const rawDesc = curSkill.descLines.join("\n");
    const { skillTypeSlug, description } = classifySkillOpening(rawDesc);
    if (!description) {
      throw new Error(
        `武将「${curWarrior.name}」技能「${curSkill.skillName}」解析后描述为空`,
      );
    }
    curWarrior.skillLines = curWarrior.skillLines ?? [];
    curWarrior.skillLines.push({
      skillOrder: curSkill.order,
      skillName: stripStars(curSkill.skillName).trim(),
      description,
      skillTypeSlug,
    });
    curSkill = null;
  }

  function flushWarrior() {
    flushSkill();
    if (curWarrior?.skillLines?.length) {
      warriors.push({
        order: curWarrior.order,
        name: curWarrior.name.trim(),
        skills: [...curWarrior.skillLines],
      });
    }
    curWarrior = null;
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed && curSkill) {
      curSkill.descLines.push("");
      continue;
    }
    if (!trimmed) continue;

    const wm = trimmed.match(warriorRe);
    if (wm) {
      flushWarrior();
      curWarrior = {
        order: Number(wm[1]),
        name: wm[2],
        skillLines: [],
      };
      continue;
    }

    const sm = trimmed.match(skillHeadRe);
    if (sm && curWarrior) {
      flushSkill();
      curSkill = {
        order: Number(sm[1]),
        skillName: sm[2],
        descLines: [sm[3]],
      };
      continue;
    }

    if (curSkill) {
      curSkill.descLines.push(line);
    }
  }

  flushWarrior();

  for (const w of warriors) {
    w.skills.sort((a, b) => a.skillOrder - b.skillOrder);
    const orders = w.skills.map((s) => s.skillOrder);
    if (new Set(orders).size !== orders.length) {
      throw new Error(`武将「${w.name}」存在重复的 skill_order`);
    }
  }

  return warriors;
}
