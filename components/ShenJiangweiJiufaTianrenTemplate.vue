<template>
  <view class="page">
    <view class="header">
      <view class="reset-all-btn" @click="onFullResetTap">重置</view>
      <text class="title">{{ title }}</text>
    </view>

    <!-- 1 体力上限 -->
    <view class="section">
      <text class="section-label">体力上限</text>
      <view class="step-row">
        <view class="step-btn" @click="onDecHp">−</view>
        <view class="step-center">
          <view class="hearts">
            <text v-for="n in maxHp" :key="n" class="heart">♥</text>
          </view>
          <text class="value-num">{{ maxHp }}</text>
        </view>
        <view class="step-btn" @click="onIncHp">+</view>
      </view>
    </view>

    <!-- 2 九伐标记 -->
    <view class="section section--jiufa">
      <text class="section-label">九伐标记</text>
      <view class="card-grid">
        <template v-for="(cell, idx) in jiufaCells" :key="cell.key">
          <view v-if="dividerBefore(idx)" class="card-grid__gap" />
          <view
            v-if="cell.kind === 'normal'"
            class="card-grid__cell"
            :class="cell.pressed ? 'card-grid__cell--pressed' : 'card-grid__cell--idle'"
            @click="onJiufaNormalTap(cell.pressIndex)"
          >
            <text class="card-grid__text">{{ cell.label }}</text>
          </view>
          <view
            v-else-if="cell.kind === 'disabled'"
            class="card-grid__cell card-grid__cell--disabled"
          >
            <text class="card-grid__text">{{ cell.label }}</text>
          </view>
          <view
            v-else-if="cell.kind === 'weapon'"
            class="card-grid__cell"
            :class="weaponTaps > 0 ? 'card-grid__cell--pressed' : 'card-grid__cell--idle'"
            @click="onWeaponTap"
            @longpress.stop="onWeaponLongPress"
          >
            <text class="card-grid__text">武器：{{ weaponTaps }}</text>
          </view>
          <view
            v-else-if="cell.kind === 'reset'"
            class="card-grid__cell card-grid__cell--reset"
            @click="onJiufaResetTap"
          >
            <text class="card-grid__text">{{ cell.label }}</text>
          </view>
        </template>
      </view>
    </view>

    <!-- 3 天任标记 -->
    <view class="section">
      <text class="section-label">天任标记</text>
      <view class="step-row">
        <view class="step-btn" @click="onDecTianren">−</view>
        <text class="tianren-num">{{ tianren }}</text>
        <view class="step-btn" @click="onIncTianren">+</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import {
  SHENJIANGWEI_JIEFA_DIVIDER_AFTER_ROWS,
  SHENJIANGWEI_JIEFA_GRID_LABELS,
  SHENJIANGWEI_JIEFA_INIT_DISABLED_LABELS,
} from "@/utils/presetShenjiangweiJiufa.js";

const WEAPON = "__weapon__";
const RESET = "__reset__";
const PRESS_LEN = 22;
const INITIAL_MAX_HP = 4;
const INITIAL_TIANREN = 0;

/** 长按武器后短时间内忽略单击，避免误加次数 */
let ignoreWeaponClickUntilMs = 0;

const props = defineProps({
  title: { type: String, default: "" },
  itemId: { type: Number, default: 0 },
});

const maxHp = ref(INITIAL_MAX_HP);
const tianren = ref(INITIAL_TIANREN);
const weaponTaps = ref(0);
/** 前 22 格（含乐不思蜀…奇正相生），可反复切换 */
const pressedSlots = ref(/** @type {boolean[]} */ (Array(PRESS_LEN).fill(false)));

const dividerCut = SHENJIANGWEI_JIEFA_DIVIDER_AFTER_ROWS * 3;

const jiufaDisabledLabels = new Set(
  SHENJIANGWEI_JIEFA_INIT_DISABLED_LABELS.map((s) => String(s).trim()),
);

function isJiufaLabelDisabled(label) {
  return jiufaDisabledLabels.has(String(label ?? "").trim());
}

/** 火杀/雷杀等不可用格不得计为已按下 */
function normalizePressedAgainstDisabled() {
  const labels = SHENJIANGWEI_JIEFA_GRID_LABELS;
  const next = [...pressedSlots.value];
  let changed = false;
  for (let i = 0; i < PRESS_LEN; i += 1) {
    const lab = String(labels[i] ?? "").trim();
    if (isJiufaLabelDisabled(lab) && next[i]) {
      next[i] = false;
      changed = true;
    }
  }
  if (changed) pressedSlots.value = next;
}

function storageKey() {
  return `shen_jw_jiufa_${Number(props.itemId) || 0}`;
}

function jiufaTotalCount() {
  let c = weaponTaps.value;
  for (const p of pressedSlots.value) {
    if (p) c += 1;
  }
  return c;
}

function persist() {
  try {
    uni.setStorageSync(
      storageKey(),
      JSON.stringify({
        maxHp: maxHp.value,
        tianren: tianren.value,
        weaponTaps: weaponTaps.value,
        pressedSlots: [...pressedSlots.value],
      }),
    );
  } catch {
    /* ignore */
  }
}

function loadState() {
  try {
    const raw = uni.getStorageSync(storageKey());
    const o = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!o || typeof o !== "object") return;
    const mh = Number(o.maxHp);
    const tr = Number(o.tianren);
    const wt = Number(o.weaponTaps);
    if (Number.isFinite(mh) && mh >= 1) maxHp.value = mh;
    if (Number.isFinite(tr) && tr >= 0) tianren.value = tr;
    if (Number.isFinite(wt) && wt >= 0) weaponTaps.value = wt;
    const ps = o.pressedSlots;
    if (Array.isArray(ps) && ps.length === PRESS_LEN) {
      pressedSlots.value = ps.map((x) => !!x);
    }
    normalizePressedAgainstDisabled();
  } catch {
    /* ignore */
  }
}

function runTianrenResolve() {
  let showed = false;
  for (let g = 0; g < 50; g += 1) {
    if (tianren.value < maxHp.value) break;
    tianren.value -= maxHp.value;
    maxHp.value += 1;
    showed = true;
  }
  if (showed) {
    uni.showToast({
      title: "已自动增加一点体力上限，请摸两张牌。",
      icon: "none",
      duration: 2600,
    });
  }
}

function clearJiufaMarks() {
  weaponTaps.value = 0;
  pressedSlots.value = Array(PRESS_LEN).fill(false);
}

function showJiufaNineModal() {
  uni.showModal({
    title: "九伐中原，以圆先帝遗志！",
    content:
      "你可以亮出牌堆顶的九张牌，然后若其中有点数相同的牌，你选择并获得其中每个重复点数的牌各一张。",
    showCancel: false,
  });
}

function tryCompleteJiufaNine() {
  if (jiufaTotalCount() < 9) return false;
  clearJiufaMarks();
  showJiufaNineModal();
  return true;
}

const jiufaCells = computed(() => {
  const labels = SHENJIANGWEI_JIEFA_GRID_LABELS;
  return labels.map((label, idx) => {
    const s = String(label ?? "");
    if (s === WEAPON) {
      return { key: `w-${idx}`, kind: "weapon", label: s };
    }
    if (s === RESET) {
      return { key: `r-${idx}`, kind: "reset", label: "重置" };
    }
    const pressIndex = idx < PRESS_LEN ? idx : -1;
    if (pressIndex >= 0 && isJiufaLabelDisabled(s)) {
      return { key: `d-${idx}`, kind: "disabled", label: s };
    }
    return {
      key: `n-${idx}`,
      kind: "normal",
      label: s,
      pressIndex,
      pressed: pressIndex >= 0 ? !!pressedSlots.value[pressIndex] : false,
    };
  });
});

function dividerBefore(idx) {
  return idx === dividerCut;
}

function onDecHp() {
  maxHp.value = Math.max(1, maxHp.value - 1);
  runTianrenResolve();
  persist();
}

function onIncHp() {
  maxHp.value += 1;
  runTianrenResolve();
  persist();
}

function onDecTianren() {
  tianren.value = Math.max(0, tianren.value - 1);
  runTianrenResolve();
  persist();
}

function onIncTianren() {
  tianren.value += 1;
  runTianrenResolve();
  persist();
}

function onJiufaNormalTap(pressIndex) {
  if (pressIndex < 0 || pressIndex >= PRESS_LEN) return;
  const lab = String(SHENJIANGWEI_JIEFA_GRID_LABELS[pressIndex] ?? "").trim();
  if (isJiufaLabelDisabled(lab)) return;
  const next = [...pressedSlots.value];
  next[pressIndex] = !next[pressIndex];
  pressedSlots.value = next;
  if (tryCompleteJiufaNine()) {
    persist();
    return;
  }
  persist();
}

function onWeaponTap() {
  if (Date.now() < ignoreWeaponClickUntilMs) return;
  weaponTaps.value += 1;
  if (tryCompleteJiufaNine()) {
    persist();
    return;
  }
  persist();
}

function onWeaponLongPress() {
  ignoreWeaponClickUntilMs = Date.now() + 450;
  weaponTaps.value = Math.max(0, weaponTaps.value - 1);
  persist();
}

function onFullResetTap() {
  uni.showModal({
    title: "重置",
    content:
      "将体力上限与天任恢复为初始值，并清除所有九伐标记。是否继续？",
    success: (res) => {
      if (!res.confirm) return;
      maxHp.value = INITIAL_MAX_HP;
      tianren.value = INITIAL_TIANREN;
      clearJiufaMarks();
      persist();
      uni.showToast({ title: "已重置", icon: "none" });
    },
  });
}

function onJiufaResetTap() {
  uni.showModal({
    title: "清除九伐",
    content: "将清除所有九伐记录（含武器次数与已标记格）。是否继续？",
    success: (res) => {
      if (!res.confirm) return;
      clearJiufaMarks();
      persist();
      uni.showToast({ title: "已清除", icon: "none" });
    },
  });
}

onMounted(() => {
  loadState();
  normalizePressedAgainstDisabled();
  runTianrenResolve();
  persist();
});
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: #ececec;
  box-sizing: border-box;
  padding-top: calc(72rpx + constant(safe-area-inset-top));
  padding-top: calc(72rpx + env(safe-area-inset-top));
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

.header {
  position: relative;
  padding: 16rpx 28rpx 8rpx;
}

.reset-all-btn {
  position: absolute;
  right: 24rpx;
  top: 8rpx;
  z-index: 2;
  color: #111111;
  font-size: 30rpx;
  font-weight: 600;
  padding: 14rpx 22rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.06);
}

.title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #1f1f1f;
  text-align: center;
  padding-left: 120rpx;
  padding-right: 120rpx;
  box-sizing: border-box;
}

.section {
  margin: 24rpx 24rpx 0;
  padding: 24rpx 20rpx 28rpx;
  background: #fafafa;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.section--jiufa {
  padding-bottom: 20rpx;
}

.section-label {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.step-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.step-btn {
  width: 88rpx;
  height: 88rpx;
  border-radius: 16rpx;
  background: #ffffff;
  border: 2rpx solid rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  font-weight: 600;
  color: #111;
  flex-shrink: 0;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.step-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
}

.hearts {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8rpx 10rpx;
  margin-bottom: 10rpx;
}

.heart {
  font-size: 44rpx;
  line-height: 1;
  color: #e02020;
  text-shadow: 0 2rpx 4rpx rgba(224, 32, 32, 0.25);
}

.value-num {
  font-size: 32rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.tianren-num {
  flex: 1;
  text-align: center;
  font-size: 40rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14rpx 12rpx;
  align-items: stretch;
}

.card-grid__gap {
  grid-column: 1 / -1;
  height: 0;
  margin: 10rpx 0 14rpx;
  border-top: 2rpx solid rgba(0, 0, 0, 0.12);
}

.card-grid__cell {
  min-height: 88rpx;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12rpx 8rpx;
  box-sizing: border-box;
}

.card-grid__text {
  font-size: 26rpx;
  font-weight: 600;
  text-align: center;
  line-height: 1.25;
  word-break: break-all;
}

.card-grid__cell--idle {
  background: #ffffff;
  border: 2rpx solid rgba(0, 0, 0, 0.12);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.card-grid__cell--idle .card-grid__text {
  color: #1a1a1a;
}

.card-grid__cell--pressed {
  background: linear-gradient(145deg, #8f1f1f 0%, #5a1010 100%);
  border: 2rpx solid rgba(255, 255, 255, 0.12);
  box-shadow:
    inset 0 2rpx 8rpx rgba(0, 0, 0, 0.28),
    0 6rpx 14rpx rgba(120, 24, 24, 0.4);
}

.card-grid__cell--pressed .card-grid__text {
  color: #ffe8e8;
}

.card-grid__cell--reset {
  background: #fff8f0;
  border: 2rpx solid rgba(180, 90, 30, 0.35);
}

.card-grid__cell--reset .card-grid__text {
  color: #8b4513;
}

.card-grid__cell--disabled {
  background: #d5d5d5;
  border: 2rpx solid rgba(0, 0, 0, 0.06);
  opacity: 0.72;
  pointer-events: none;
}

.card-grid__cell--disabled .card-grid__text {
  color: #777777;
}
</style>
