/**
 * 界左慈化身界面会话：退出随机页再进入时不丢失，仅「重置」清空。
 * 按 generator 条目 itemId 区分。
 */

/** @typedef {{ id: number; name: string; skillNames: string[] }} GenCardSnap */
/** @typedef {{ phase: 'idle'|'playing'; consumedIds: number[]; displayed: GenCardSnap[]; selectedQueue: number[] }} JieZuociSnap */

/** @type {Map<number, JieZuociSnap>} */
const sessions = new Map();

/**
 * @param {number} itemId
 * @returns {JieZuociSnap | null}
 */
export function loadJieZuociSession(itemId) {
  const id = Number(itemId) || 0;
  if (!id) return null;
  const s = sessions.get(id);
  return s ? cloneSnap(s) : null;
}

/**
 * @param {number} itemId
 * @param {JieZuociSnap} snap
 */
export function saveJieZuociSession(itemId, snap) {
  const id = Number(itemId) || 0;
  if (!id) return;
  sessions.set(id, cloneSnap(snap));
}

/**
 * @param {number} itemId
 */
export function clearJieZuociSession(itemId) {
  sessions.delete(Number(itemId) || 0);
}

/** @param {JieZuociSnap} s */
function cloneSnap(s) {
  return {
    phase: s.phase,
    consumedIds: [...(s.consumedIds || [])],
    displayed: (s.displayed || []).map((c) => ({
      id: c.id,
      name: c.name,
      skillNames: [...(c.skillNames || [])],
    })),
    selectedQueue: [...(s.selectedQueue || [])],
  };
}
