<template>
  <view class="page">
    <view class="header">
      <view class="reset-btn" @click="onResetTap">重置</view>
      <text class="title">{{ title }}</text>
      <text class="title-hint">长按武将条目查看详情</text>
    </view>

    <view v-if="phase === 'idle'" class="idle">
      <button class="draw-cta" :disabled="loading" @click="onDrawThree">
        抽取化身
      </button>
    </view>

    <scroll-view
      v-else
      scroll-y
      class="scroll"
      :show-scrollbar="false"
    >
      <view class="waterfall">
        <view class="col">
          <view
            v-for="card in columnLeft"
            :key="card.id"
            class="gen-card"
            :class="{ 'gen-card--sel': isSelected(card.id) }"
            @click="onCardTap(card.id)"
            @longpress.stop="onCardLongPress(card)"
          >
            <view
              class="gen-card__img"
              :style="{ backgroundColor: placeholderBg(card.id) }"
            />
            <text class="gen-card__name">{{ card.name }}</text>
            <text
              v-for="(sk, i) in card.skillNames"
              :key="i"
              class="gen-card__skill"
            >{{ sk }}</text>
          </view>
        </view>
        <view class="col">
          <view
            v-for="card in columnRight"
            :key="card.id"
            class="gen-card"
            :class="{ 'gen-card--sel': isSelected(card.id) }"
            @click="onCardTap(card.id)"
            @longpress.stop="onCardLongPress(card)"
          >
            <view
              class="gen-card__img"
              :style="{ backgroundColor: placeholderBg(card.id) }"
            />
            <text class="gen-card__name">{{ card.name }}</text>
            <text
              v-for="(sk, i) in card.skillNames"
              :key="i"
              class="gen-card__skill"
            >{{ sk }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view v-if="phase === 'playing'" class="footer">
      <button class="ft-btn ft-btn--secondary" @click="onRecast">重铸化身</button>
      <button class="ft-btn" @click="onXinSheng">新生</button>
    </view>

    <!-- 武将详情（长按打开） -->
    <view v-if="detailVisible" class="detail-mask">
      <view class="detail-sheet" @click.stop>
        <view class="detail-close" @click="closeDetail">✕</view>
        <scroll-view scroll-y class="detail-scroll" :show-scrollbar="false">
          <view
            class="detail-img"
            :style="{ backgroundColor: placeholderBg(detailGeneralId) }"
          />
          <view v-if="detailLoading" class="detail-loading">加载中…</view>
          <template v-else-if="detailPayload">
            <text class="detail-name">{{ detailPayload.name }}</text>
            <view
              v-for="sk in detailSkillsDisplay"
              :key="sk.key"
              class="detail-skill-block"
            >
              <text class="detail-skill-title">{{ sk.title }}</text>
              <text class="detail-skill-desc">{{ sk.description }}</text>
            </view>
          </template>
          <view v-else class="detail-loading">暂无武将数据</view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { placeholderColorForGeneralId } from "@/utils/generalPlaceholderColor.js";
import {
  clearJieZuociSession,
  loadJieZuociSession,
  saveJieZuociSession,
} from "@/utils/jieZuociSessionStore.js";
import {
  getSgsGeneralWithSkills,
  listAllGeneralsWithSkillNames,
} from "@/utils/sgsWarriorStore.js";

const props = defineProps({
  title: { type: String, default: "" },
  /** 用于会话恢复与区分条目 */
  itemId: { type: Number, default: 0 },
});

/** @typedef {{ id: number; name: string; skillNames: string[] }} GenCard */

const IMG_RPX = 180;
const NAME_BLOCK_RPX = 52;
const SKILL_LINE_RPX = 34;
const CARD_PAD_RPX = 24;
const CARD_GAP_RPX = 18;

const loading = ref(false);
/** idle | playing */
const phase = ref("idle");
/** 全表武将缓存 */
const catalog = ref(/** @type {GenCard[]} */ ([]));
/** 已从随机池中消耗的 id（被重铸换下者不可再抽） */
const consumedIds = ref(/** @type {number[]} */ ([]));
/** 当前展示的化身 */
const displayed = ref(/** @type {GenCard[]} */ ([]));
/** 框选顺序，最多 2；再选则顶掉最早 */
const selectedQueue = ref(/** @type {number[]} */ ([]));

const columnLeft = ref(/** @type {GenCard[]} */ ([]));
const columnRight = ref(/** @type {GenCard[]} */ ([]));

/** 化身中不可使用的技能类型（slug） */
const SLUG_UNAVAILABLE = new Set(["lord", "limited", "mission", "awaken"]);

/** 长按后短时间内忽略点击，避免误触框选（时间戳 ms） */
let ignoreCardTapUntilMs = 0;
const detailVisible = ref(false);
const detailLoading = ref(false);
/** @type {import('vue').Ref<number>} */
const detailGeneralId = ref(0);
/** @type {import('vue').Ref<Awaited<ReturnType<typeof getSgsGeneralWithSkills>>>} */
const detailPayload = ref(null);

const detailSkillsDisplay = computed(() => {
  const p = detailPayload.value;
  if (!p?.skills?.length) return [];
  return p.skills.map((s, i) => {
    const slug = String(s.skillTypeSlug || "").trim();
    const suffix = SLUG_UNAVAILABLE.has(slug) ? "（不可用）" : "";
    return {
      key: `${s.id ?? i}-${s.skillOrder}`,
      title: `${s.skillName}${suffix}`,
      description: s.description,
    };
  });
});

function placeholderBg(generalId) {
  return placeholderColorForGeneralId(Number(generalId) || 0);
}

const idToCard = computed(() => {
  const m = new Map();
  for (const c of catalog.value) m.set(c.id, c);
  return m;
});

function estimateCardHeightRpx(card) {
  const n = Math.max(0, card.skillNames?.length ?? 0);
  return IMG_RPX + NAME_BLOCK_RPX + n * SKILL_LINE_RPX + CARD_PAD_RPX * 2;
}

function distributeWaterfall(list) {
  let hL = 0;
  let hR = 0;
  const left = [];
  const right = [];
  for (const card of list) {
    const est = estimateCardHeightRpx(card) + CARD_GAP_RPX;
    if (hL <= hR) {
      left.push(card);
      hL += est;
    } else {
      right.push(card);
      hR += est;
    }
  }
  return { left, right };
}

function refreshColumns() {
  const { left, right } = distributeWaterfall(displayed.value);
  columnLeft.value = left;
  columnRight.value = right;
}

watch(displayed, () => refreshColumns(), { deep: true });

function persistSession() {
  const id = Number(props.itemId) || 0;
  if (!id) return;
  saveJieZuociSession(id, {
    phase: phase.value,
    consumedIds: [...consumedIds.value],
    displayed: displayed.value.map((c) => ({
      id: c.id,
      name: c.name,
      skillNames: [...c.skillNames],
    })),
    selectedQueue: [...selectedQueue.value],
  });
}

function forbiddenForDraw() {
  const s = new Set(consumedIds.value);
  for (const c of displayed.value) s.add(c.id);
  return s;
}

/** 从可选 id 中无放回抽取 n 个 */
function sampleUniqueIds(n, forbidden) {
  const allIds = catalog.value.map((c) => c.id);
  const cand = allIds.filter((id) => !forbidden.has(id));
  if (cand.length < n) return null;
  const shuffled = [...cand];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
}

function cardsFromIds(ids) {
  const m = idToCard.value;
  const out = [];
  for (const id of ids) {
    const c = m.get(id);
    if (c) out.push({ ...c, skillNames: [...c.skillNames] });
  }
  return out;
}

async function ensureCatalog() {
  if (catalog.value.length) return;
  loading.value = true;
  try {
    catalog.value = await listAllGeneralsWithSkillNames();
  } catch (e) {
    uni.showToast({
      title: e?.message || "读取武将库失败",
      icon: "none",
    });
    throw e;
  } finally {
    loading.value = false;
  }
}

async function onDrawThree() {
  await ensureCatalog();
  if (catalog.value.length < 3) {
    uni.showToast({ title: "武将不足 3 名，请先导入数据", icon: "none" });
    return;
  }
  const ids = sampleUniqueIds(3, forbiddenForDraw());
  if (!ids) {
    uni.showToast({ title: "可用武将不足", icon: "none" });
    return;
  }
  consumedIds.value = [];
  selectedQueue.value = [];
  displayed.value = cardsFromIds(ids);
  phase.value = "playing";
  persistSession();
}

function isSelected(id) {
  return selectedQueue.value.includes(id);
}

function onCardTap(id) {
  if (Date.now() < ignoreCardTapUntilMs) return;
  if (phase.value !== "playing") return;
  const idx = selectedQueue.value.indexOf(id);
  if (idx >= 0) {
    selectedQueue.value = selectedQueue.value.filter((x) => x !== id);
    persistSession();
    return;
  }
  const q = [...selectedQueue.value, id];
  while (q.length > 2) q.shift();
  selectedQueue.value = q;
  persistSession();
}

async function onCardLongPress(card) {
  ignoreCardTapUntilMs = Date.now() + 420;
  const gid = Number(card?.id) || 0;
  if (!gid) return;
  detailGeneralId.value = gid;
  detailVisible.value = true;
  detailLoading.value = true;
  detailPayload.value = null;
  try {
    const data = await getSgsGeneralWithSkills(gid);
    detailPayload.value = data;
  } catch (e) {
    uni.showToast({
      title: e?.message || "加载武将失败",
      icon: "none",
    });
    detailPayload.value = null;
  } finally {
    detailLoading.value = false;
  }
}

function closeDetail() {
  detailVisible.value = false;
  detailPayload.value = null;
  detailGeneralId.value = 0;
}

function onRecast() {
  const sel = [...new Set(selectedQueue.value)];
  if (sel.length === 0) {
    uni.showToast({ title: "请先框选武将", icon: "none" });
    return;
  }
  const forbidden = forbiddenForDraw();
  const newIds = sampleUniqueIds(sel.length, forbidden);
  if (!newIds) {
    uni.showToast({ title: "剩余可用武将不足", icon: "none" });
    return;
  }
  for (const oid of sel) {
    if (!consumedIds.value.includes(oid)) consumedIds.value = [...consumedIds.value, oid];
  }
  const pair = new Map();
  sel.forEach((oldId, i) => pair.set(oldId, newIds[i]));

  displayed.value = displayed.value.map((card) => {
    const nid = pair.get(card.id);
    if (nid === undefined) return card;
    const nc = idToCard.value.get(nid);
    if (!nc) return card;
    return { ...nc, skillNames: [...nc.skillNames] };
  });
  selectedQueue.value = [];
  persistSession();
}

function onXinSheng() {
  const forbidden = forbiddenForDraw();
  const picked = sampleUniqueIds(1, forbidden);
  if (!picked) {
    uni.showToast({ title: "没有可新生的武将", icon: "none" });
    return;
  }
  displayed.value = [...displayed.value, ...cardsFromIds(picked)];
  persistSession();
}

function onResetTap() {
  uni.showModal({
    title: "重置化身",
    content: "将清空化身展示并回到抽取界面，已消耗武将记录也会清空。是否继续？",
    success: (res) => {
      if (!res.confirm) return;
      const id = Number(props.itemId) || 0;
      if (id) clearJieZuociSession(id);
      phase.value = "idle";
      displayed.value = [];
      consumedIds.value = [];
      selectedQueue.value = [];
    },
  });
}

async function restoreSessionIfAny() {
  const id = Number(props.itemId) || 0;
  if (!id) return;
  const snap = loadJieZuociSession(id);
  if (!snap || snap.phase !== "playing" || !snap.displayed?.length) return;
  phase.value = "playing";
  consumedIds.value = [...(snap.consumedIds || [])];
  displayed.value = snap.displayed.map((c) => ({
    id: c.id,
    name: c.name,
    skillNames: [...(c.skillNames || [])],
  }));
  selectedQueue.value = [...(snap.selectedQueue || [])];
  refreshColumns();
}

onMounted(async () => {
  try {
    await ensureCatalog();
    await restoreSessionIfAny();
  } catch {
    /* ensureCatalog 已 toast */
  }
});
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: #f0f0f0;
  box-sizing: border-box;
  /* 安全区外再下移一段，避免整块贴顶 */
  padding-top: calc(36rpx + constant(safe-area-inset-top));
  padding-top: calc(36rpx + env(safe-area-inset-top));
  padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
}

.header {
  position: relative;
  flex-shrink: 0;
  padding: 40rpx 36rpx 20rpx;
}

.reset-btn {
  position: absolute;
  right: 28rpx;
  top: 44rpx;
  color: #111111;
  font-size: 30rpx;
  font-weight: 600;
  padding: 14rpx 22rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.85);
  z-index: 2;
}

.title {
  display: block;
  text-align: center;
  font-size: 34rpx;
  font-weight: 700;
  color: #1f1f1f;
  padding-right: 120rpx;
  padding-left: 120rpx;
  box-sizing: border-box;
}

.title-hint {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: #666;
  margin-top: 12rpx;
  padding-right: 120rpx;
  padding-left: 120rpx;
  line-height: 1.4;
  box-sizing: border-box;
}

.idle {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 56rpx 40rpx 40rpx;
}

.draw-cta {
  min-width: 280rpx;
  padding: 28rpx 48rpx;
  border-radius: 999rpx;
  background: #111111;
  color: #ffffff;
  font-size: 34rpx;
  font-weight: 700;
  border: none;
}

.scroll {
  flex: 1;
  height: 0;
  padding: 20rpx 18rpx 24rpx;
  box-sizing: border-box;
}

.waterfall {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
}

.col {
  width: calc(50% - 10rpx);
  display: flex;
  flex-direction: column;
}

.gen-card {
  width: 100%;
  margin-bottom: 18rpx;
  padding: 24rpx 18rpx;
  border-radius: 18rpx;
  background: #ffffff;
  box-sizing: border-box;
  border: 3rpx solid transparent;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.gen-card--sel {
  border-color: rgba(0, 122, 255, 0.85);
  box-shadow:
    0 0 0 2rpx rgba(0, 122, 255, 0.35),
    0 8rpx 28rpx rgba(0, 122, 255, 0.35);
}

.gen-card__img {
  width: 100%;
  height: 180rpx;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
}

.detail-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  box-sizing: border-box;
}

.detail-sheet {
  position: relative;
  width: 100%;
  max-height: 78vh;
  border-radius: 24rpx 24rpx 0 0;
  background: #ffffff;
  padding-top: 56rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.detail-close {
  position: absolute;
  top: 16rpx;
  right: 20rpx;
  z-index: 2;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  line-height: 1;
  color: #555;
  border-radius: 999rpx;
  background: rgba(0, 0, 0, 0.06);
}

.detail-scroll {
  height: 70vh;
  max-height: 78vh;
  padding: 0 32rpx 12rpx;
  box-sizing: border-box;
}

.detail-img {
  width: 100%;
  height: 280rpx;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
}

.detail-loading {
  font-size: 28rpx;
  color: #666;
  text-align: center;
  padding: 40rpx 0;
}

.detail-name {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #111;
  text-align: center;
  margin-bottom: 28rpx;
}

.detail-skill-block {
  margin-bottom: 28rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.08);
}

.detail-skill-block:last-child {
  border-bottom: none;
  margin-bottom: 8rpx;
}

.detail-skill-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 12rpx;
  line-height: 1.45;
}

.detail-skill-desc {
  display: block;
  font-size: 26rpx;
  color: #444;
  line-height: 1.55;
  white-space: pre-wrap;
}

.gen-card__name {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #111;
  margin-bottom: 12rpx;
  text-align: center;
}

.gen-card__skill {
  display: block;
  font-size: 24rpx;
  color: #444;
  line-height: 1.35;
  text-align: center;
  margin-bottom: 6rpx;
}

.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16rpx 28rpx calc(16rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(8px);
  display: flex;
  gap: 20rpx;
  justify-content: center;
  align-items: center;
  border-top: 1rpx solid rgba(0, 0, 0, 0.06);
  z-index: 10;
}

.ft-btn {
  flex: 1;
  max-width: 320rpx;
  padding: 22rpx 24rpx;
  border-radius: 999rpx;
  background: #111111;
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
}

.ft-btn--secondary {
  background: #ffffff;
  color: #111;
  border: 2rpx solid #ccc;
}
</style>
