const STORAGE_KEY = "card_label_items_v1";

function nowId() {
  return `cl_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function loadCardLabelItems() {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY);
    const arr = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(arr)) return [];
    return arr.filter((x) => x && typeof x === "object" && x.id);
  } catch {
    return [];
  }
}

export function saveCardLabelItems(items) {
  try {
    uni.setStorageSync(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export function createCardLabelItem(fields) {
  return {
    id: nowId(),
    suit: String(fields.suit ?? ""),
    rank: String(fields.rank ?? ""),
    cardType: String(fields.cardType ?? ""),
    name: String(fields.name ?? ""),
    customName: String(fields.customName ?? ""),
    createdAt: Date.now(),
  };
}
