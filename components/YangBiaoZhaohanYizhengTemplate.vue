<template>
  <view class="page">
    <view class="header">
      <view class="reset-all-btn" @click="onFullResetTap">重置</view>
      <text class="title">{{ title }}</text>
    </view>

    <view class="top-bar">
      <text class="phase-text">{{ phaseLine }}</text>
      <view class="top-btn-row">
        <view class="top-btn" @click="onRoundAdvance">
          <text class="top-btn__text">{{ roundButtonLabel }}</text>
        </view>
        <view class="top-btn top-btn--secondary" @click="onYizhengFail">
          <text class="top-btn__text">义争拼点失败</text>
        </view>
      </view>
    </view>

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

    <view class="section section--log">
      <text class="section-label">变更记录</text>
      <view class="log-table">
        <view class="log-row log-row--head">
          <text class="log-cell log-cell--reason">血量上限变化原因</text>
          <text class="log-cell log-cell--result">变化后结果</text>
        </view>
        <scroll-view scroll-y class="log-scroll" :show-scrollbar="true">
          <view v-if="!logRows.length" class="log-empty">暂无记录</view>
          <view v-for="(row, i) in logRows" :key="i" class="log-row">
            <view class="log-cell log-cell--reason">
              <template v-for="(ch, j) in reasonChunks(row.reason)" :key="j">
                <text v-if="ch.kind === 'plain'" class="reason-plain">{{ ch.text }}</text>
                <text v-else-if="ch.kind === 'inc'" class="reason-inc">{{ ch.text }}</text>
                <text v-else class="reason-dec">{{ ch.text }}</text>
              </template>
            </view>
            <text class="log-cell log-cell--result">{{ row.result }}</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";

const INITIAL_MAX_HP = 3;
const PHASE_BEFORE = "当前为游戏开始阶段，未进入任何回合";

const props = defineProps({
  title: { type: String, default: "" },
  itemId: { type: Number, default: 0 },
});

const maxHp = ref(INITIAL_MAX_HP);
/** 已进入的回合数：0 表示尚未开始第 1 回合 */
const enteredRound = ref(0);
const logRows = ref([]);

const roundButtonLabel = computed(() =>
  enteredRound.value === 0 ? "开始第一回合" : "下一回合",
);

const phaseLine = computed(() =>
  enteredRound.value === 0 ? PHASE_BEFORE : `当前为第${enteredRound.value}回合`,
);

function storageKey() {
  return `yangbiao_zh_yz_${Number(props.itemId) || 0}`;
}

function zhaohanDeltaAtRoundStart(round) {
  if (round >= 1 && round <= 4) return 1;
  if (round >= 5 && round <= 7) return -1;
  return 0;
}

/** 将原因文案拆成片段，便于「增加」「减少」上色 */
function reasonChunks(reason) {
  const s = String(reason ?? "");
  const re = /(增加|减少)/g;
  const out = [];
  let last = 0;
  let m;
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) {
      out.push({ kind: "plain", text: s.slice(last, m.index) });
    }
    out.push({ kind: m[0] === "增加" ? "inc" : "dec", text: m[0] });
    last = m.index + m[0].length;
  }
  if (last < s.length) {
    out.push({ kind: "plain", text: s.slice(last) });
  }
  if (!out.length) {
    out.push({ kind: "plain", text: s });
  }
  return out;
}

function appendLog(reason, resultVal) {
  logRows.value.push({ reason, result: String(resultVal) });
}

function persist() {
  try {
    uni.setStorageSync(
      storageKey(),
      JSON.stringify({
        maxHp: maxHp.value,
        enteredRound: enteredRound.value,
        logRows: logRows.value.map((r) => ({ reason: r.reason, result: r.result })),
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
    const er = Number(o.enteredRound);
    if (Number.isFinite(mh) && mh >= 0) maxHp.value = mh;
    if (Number.isFinite(er) && er >= 0) enteredRound.value = er;
    const logs = o.logRows;
    if (Array.isArray(logs)) {
      logRows.value = logs
        .filter((x) => x && typeof x === "object")
        .map((x) => ({
          reason: String(x.reason ?? ""),
          result: String(x.result ?? ""),
        }));
    }
  } catch {
    /* ignore */
  }
}

function applyInitialState() {
  maxHp.value = INITIAL_MAX_HP;
  enteredRound.value = 0;
  logRows.value = [];
}

function checkDeathThenReset() {
  if (maxHp.value > 0) return;
  uni.showModal({
    title: "提示",
    content: "你已死亡",
    showCancel: false,
    success: () => {
      applyInitialState();
      persist();
    },
  });
}

function onRoundAdvance() {
  const r = enteredRound.value + 1;
  enteredRound.value = r;
  const d = zhaohanDeltaAtRoundStart(r);
  const before = maxHp.value;
  let after = before;
  if (d !== 0) {
    after = Math.max(0, before + d);
    maxHp.value = after;
  }
  if (d === 1) {
    appendLog(`开始第${r}回合，增加1点体力上限`, after);
  } else if (d === -1) {
    appendLog(`开始第${r}回合，减少1点体力上限`, after);
  } else {
    appendLog(`开始第${r}回合，体力上限无变化`, after);
  }
  checkDeathThenReset();
  persist();
}

function onYizhengFail() {
  const next = Math.max(0, maxHp.value - 1);
  maxHp.value = next;
  appendLog("因义争拼点失败，减少1点体力上限", next);
  checkDeathThenReset();
  persist();
}

function onDecHp() {
  const next = Math.max(0, maxHp.value - 1);
  maxHp.value = next;
  appendLog("手动减少1点体力上限", next);
  checkDeathThenReset();
  persist();
}

function onIncHp() {
  maxHp.value += 1;
  appendLog("手动增加1点体力上限", maxHp.value);
  persist();
}

function onFullResetTap() {
  uni.showModal({
    title: "重置",
    content: "将恢复为初始状态并清空变更记录。是否继续？",
    success: (res) => {
      if (!res.confirm) return;
      applyInitialState();
      persist();
      uni.showToast({ title: "已重置", icon: "none" });
    },
  });
}

onMounted(() => {
  loadState();
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

.top-bar {
  margin: 12rpx 24rpx 0;
  padding: 24rpx 20rpx 22rpx;
  background: #fafafa;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0;
}

.phase-text {
  display: block;
  width: 100%;
  font-size: 34rpx;
  font-weight: 600;
  line-height: 1.45;
  color: #222;
  text-align: center;
  margin-bottom: 22rpx;
}

.top-btn-row {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 20rpx;
  width: 100%;
}

.top-btn {
  flex: 1;
  min-height: 96rpx;
  padding: 22rpx 20rpx;
  border-radius: 16rpx;
  background: #ffffff;
  border: 2rpx solid rgba(0, 0, 0, 0.12);
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.07);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.top-btn--secondary {
  background: #fff8f0;
  border-color: rgba(180, 90, 30, 0.35);
}

.top-btn__text {
  font-size: 30rpx;
  font-weight: 700;
  color: #1a1a1a;
  text-align: center;
  line-height: 1.35;
}

.section {
  margin: 24rpx 24rpx 0;
  padding: 24rpx 20rpx 28rpx;
  background: #fafafa;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.section--log {
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

.log-table {
  border: 2rpx solid rgba(0, 0, 0, 0.1);
  border-radius: 12rpx;
  overflow: hidden;
  background: #fff;
}

.log-scroll {
  max-height: 420rpx;
}

.log-row {
  display: flex;
  flex-direction: row;
  border-top: 2rpx solid rgba(0, 0, 0, 0.08);
}

.log-row:first-child {
  border-top: none;
}

.log-row--head {
  background: #eef2f7;
  font-weight: 700;
}

.log-cell {
  padding: 16rpx 12rpx;
  font-size: 22rpx;
  line-height: 1.4;
  color: #222;
  box-sizing: border-box;
}

.log-cell--reason {
  flex: 1.35;
  border-right: 2rpx solid rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: baseline;
}

.reason-plain {
  font-size: 22rpx;
  line-height: 1.45;
  color: #222;
}

.reason-inc {
  font-size: 22rpx;
  line-height: 1.45;
  font-weight: 700;
  color: #0d7d3d;
}

.reason-dec {
  font-size: 22rpx;
  line-height: 1.45;
  font-weight: 700;
  color: #c41e1e;
}

.log-cell--result {
  flex: 0.65;
  text-align: center;
  font-weight: 600;
}

.log-row--head .log-cell {
  font-size: 24rpx;
  color: #111;
}

.log-row--head .log-cell--reason {
  display: block;
}

.log-empty {
  padding: 28rpx;
  text-align: center;
  font-size: 24rpx;
  color: #888;
}
</style>
