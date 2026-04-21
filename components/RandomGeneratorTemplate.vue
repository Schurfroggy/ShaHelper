<template>
  <view class="page" :class="{ flash: flashOn }" :style="{ backgroundColor: bgColor }">
    <view class="overlay">
      <view class="reset-btn" @click="emit('reset')">重置</view>
      <text class="title">{{ title }}</text>
      <view v-if="caoyingFujianEnabled" class="fate-wrap">
        <text class="fate-hint">
          总人数 n（3～8，含曹婴）。切换下方选项人数会重新生成选项并清空本条目历史。
        </text>
        <picker
          mode="selector"
          :range="caoyingNLabelList"
          :value="caoyingPickerIdxSafe"
          @change="onCaoyingFujianPickerChange"
        >
          <view class="fate-btn fate-btn--block">
            <text class="fate-btn-text">总人数：{{ caoyingDisplayN }}（含曹婴）</text>
          </view>
        </picker>
      </view>
      <view v-if="fateSignEnabled" class="fate-wrap">
        <text class="fate-hint">{{ fateSignStatusText }}</text>
        <view class="fate-btn" @click="openFateSignPicker">
          <text class="fate-btn-text">命运签</text>
        </view>
      </view>
      <text class="result" :class="{ 'result--compact': fateSignEnabled }">{{ resultText }}</text>
      <button class="draw-btn" @click="onDrawTap">随机</button>
      <view class="history">
        <text class="history-title">历史记录</text>
        <text
          v-for="(record, index) in displayHistory"
          :key="`${index}-${record}`"
          class="history-item"
          :class="`history-item--${index}`"
        >
          {{ record }}
        </text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { weightedPickIndex } from "@/utils/adaptiveRandom.js";
import { pickUniformOptionWithIndex } from "@/utils/random.js";
import { ALGO_ADAPTIVE, ALGO_UNIFORM } from "@/utils/itemStore.js";

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  algorithm: {
    type: String,
    default: ALGO_ADAPTIVE,
  },
  optionRows: {
    type: Array,
    default: () => [],
  },
  historyRecords: {
    type: Array,
    default: () => [],
  },
  fateSignEnabled: {
    type: Boolean,
    default: false,
  },
  /** -1：不放；0..n-1：将该签复制一次参与本次随机（周群-天算） */
  fateSignBaseIndex: {
    type: Number,
    default: -1,
  },
  caoyingFujianEnabled: {
    type: Boolean,
    default: false,
  },
  /** 可选人数列表，如 [3,4,5,6,7,8] */
  caoyingNChoices: {
    type: Array,
    default: () => [3, 4, 5, 6, 7, 8],
  },
  /** 与 caoyingNChoices 对应的 picker 下标 */
  caoyingPickerIdx: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits([
  "draw",
  "reset",
  "update:fateSignBaseIndex",
  "update:caoyingPickerIdx",
  "caoyingPlayerCountChange",
]);

const resultText = ref("点击随机");
const bgColor = ref("#ececec");
const flashOn = ref(false);
const displayHistory = computed(() => {
  const normalized = props.historyRecords.map((s) => String(s || "").trim()).filter(Boolean);
  while (normalized.length < 3) normalized.push("暂无记录");
  return normalized.slice(0, 3);
});

function filterOptionRows() {
  return props.optionRows
    .map((r) => ({
      optionId: Number(r.optionId),
      text: String(r.text ?? "").trim(),
      weight: Number(r.weight),
    }))
    .filter((r) => r.text && Number.isFinite(r.optionId));
}

function shortenLabel(s, maxLen = 40) {
  const t = String(s ?? "").trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen)}…`;
}

const caoyingNLabelList = computed(() =>
  (props.caoyingNChoices || []).map((n) => `${n} 人（含曹婴）`),
);

const caoyingPickerIdxSafe = computed(() => {
  const max = Math.max(0, (props.caoyingNChoices?.length || 1) - 1);
  const v = Math.floor(Number(props.caoyingPickerIdx));
  if (!Number.isFinite(v) || v < 0) return 0;
  return Math.min(max, v);
});

const caoyingDisplayN = computed(() => {
  const choices = props.caoyingNChoices || [];
  const idx = caoyingPickerIdxSafe.value;
  return choices[idx] ?? choices[0] ?? 3;
});

function onCaoyingFujianPickerChange(e) {
  const idx = Number(e.detail.value);
  const choices = props.caoyingNChoices?.length ? props.caoyingNChoices : [3, 4, 5, 6, 7, 8];
  const max = Math.max(0, choices.length - 1);
  const safeIdx = Number.isFinite(idx) ? Math.min(max, Math.max(0, idx)) : 0;
  emit("update:caoyingPickerIdx", safeIdx);
  const newN = choices[safeIdx];
  emit("caoyingPlayerCountChange", newN);
}

const fateSignStatusText = computed(() => {
  if (!props.fateSignEnabled) return "";
  const rows = filterOptionRows();
  const idx = Number(props.fateSignBaseIndex);
  if (!Number.isFinite(idx) || idx < 0 || idx >= rows.length) {
    return "命运签：本次不放（可将某一签额外放入签筒，增加其中签机会）";
  }
  return `命运签：已放入「${shortenLabel(rows[idx].text, 36)}」`;
});

function openFateSignPicker() {
  const rows = filterOptionRows();
  if (!rows.length) {
    uni.showToast({ title: "暂无选项", icon: "none" });
    return;
  }
  const labels = rows.map((r) => shortenLabel(r.text, 42));
  uni.showActionSheet({
    itemList: ["本次不放", ...labels],
    success: (res) => {
      const tap = Number(res.tapIndex);
      if (!Number.isFinite(tap)) return;
      if (tap === 0) emit("update:fateSignBaseIndex", -1);
      else emit("update:fateSignBaseIndex", tap - 1);
    },
  });
}

/** 若有命运签，将对应项复制一条加入本次随机池（不改变数据库中的选项） */
function expandRowsForDraw(baseRows) {
  const idx = Number(props.fateSignBaseIndex);
  if (
    !props.fateSignEnabled ||
    !Number.isFinite(idx) ||
    idx < 0 ||
    idx >= baseRows.length
  ) {
    return baseRows;
  }
  const extra = baseRows[idx];
  return [...baseRows, { ...extra }];
}

function randomPastel() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue} 80% 88%)`;
}

function flashOnce() {
  flashOn.value = true;
  setTimeout(() => {
    flashOn.value = false;
  }, 380);
}

function onDrawTap() {
  try {
    const rows = expandRowsForDraw(filterOptionRows());

    if (!rows.length) {
      throw new Error("没有可随机的选项");
    }

    let payload;
    if (props.algorithm === ALGO_UNIFORM) {
      const texts = rows.map((r) => r.text);
      const { index, text } = pickUniformOptionWithIndex(texts);
      const optionId = rows[index].optionId;
      payload = { text, optionId };
    } else {
      let weights = rows.map((r) => r.weight);
      if (weights.some((w) => !Number.isFinite(w) || w <= 0)) {
        const eq = 1 / rows.length;
        weights = rows.map(() => eq);
      }
      const sum = weights.reduce((a, b) => a + b, 0);
      const norm = weights.map((w) => w / sum);
      const idx = weightedPickIndex(norm);
      payload = { text: rows[idx].text, optionId: rows[idx].optionId };
    }

    resultText.value = payload.text;
    bgColor.value = randomPastel();
    flashOnce();
    emit("draw", payload);
  } catch (e) {
    uni.showToast({
      title: e.message || "随机失败",
      icon: "none",
    });
  }
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  transition: background-color 0.35s ease;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}

.flash {
  animation: flash 0.38s ease;
}

@keyframes flash {
  0% {
    filter: brightness(1);
  }
  40% {
    filter: brightness(1.35);
  }
  100% {
    filter: brightness(1);
  }
}

.overlay {
  position: relative;
  min-height: calc(100vh - env(safe-area-inset-top));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx 36rpx 120rpx;
  backdrop-filter: blur(2px);
}

.reset-btn {
  position: absolute;
  right: 28rpx;
  top: 54rpx;
  color: #111111;
  font-size: 34rpx;
  font-weight: 600;
  padding: 18rpx 26rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.75);
}

.title {
  font-size: 40rpx;
  font-weight: 700;
  color: #1f1f1f;
  margin-bottom: 24rpx;
}

.fate-wrap {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  max-width: 640rpx;
  margin-bottom: 28rpx;
  padding: 16rpx 20rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.65);
  box-sizing: border-box;
}

.fate-hint {
  display: block;
  font-size: 24rpx;
  line-height: 1.45;
  color: rgba(0, 0, 0, 0.72);
  margin-bottom: 14rpx;
}

.fate-btn {
  align-self: flex-start;
  padding: 14rpx 36rpx;
  border-radius: 999rpx;
  background: rgba(26, 26, 26, 0.92);
}

.fate-btn--block {
  align-self: stretch;
  width: 100%;
  box-sizing: border-box;
  text-align: center;
}

.fate-btn-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #ffffff;
}

.result {
  font-size: min(13vw, 108rpx);
  line-height: 1.2;
  color: #101010;
  text-align: center;
  word-break: break-all;
  font-weight: 700;
  margin-bottom: 80rpx;
  text-shadow: 0 2rpx 12rpx rgba(255, 255, 255, 0.5);
}

/* 周群-天算：选项文案较长，略缩小结果区字号 */
.result--compact {
  font-size: min(8vw, 62rpx);
  line-height: 1.38;
  margin-bottom: 72rpx;
}

.draw-btn {
  width: 220rpx;
  height: 220rpx;
  border-radius: 999rpx;
  border: 0;
  background: #111111;
  color: #ffffff;
  font-size: 40rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 18rpx 40rpx rgba(0, 0, 0, 0.2);
}

.history {
  margin-top: 56rpx;
  width: 100%;
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.history-title {
  font-size: 24rpx;
  color: rgba(0, 0, 0, 0.7);
  margin-bottom: 8rpx;
}

.history-item {
  font-size: 30rpx;
  line-height: 1.35;
  text-align: center;
  word-break: break-all;
}

.history-item--0 {
  color: rgba(0, 0, 0, 1);
}

.history-item--1 {
  color: rgba(0, 0, 0, 0.65);
}

.history-item--2 {
  color: rgba(0, 0, 0, 0.4);
}
</style>
