<template>
  <view class="page">
    <view class="header">
      <view class="reset-btn" @click="onResetTap">重置</view>
      <text class="title">{{ title }}</text>
    </view>

    <view class="center-wrap">
      <view class="grid">
        <view
          v-for="(btn, i) in ZHANGQIYING_FALU_BUTTONS"
          :key="i"
          class="cell"
          @click="onToggle(i)"
        >
          <view
            class="btn"
            :class="pressed[i] ? 'btn--on' : 'btn--off'"
          >
            <text class="btn-label">{{ btn.label }}</text>
          </view>
          <text class="hint">{{ btn.hint }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { ZHANGQIYING_FALU_BUTTONS } from "@/utils/presetZhangqiyingFaluZhenyi.js";

const N = 4;

const props = defineProps({
  title: { type: String, default: "" },
  itemId: { type: Number, default: 0 },
});

/** 与 CardGridTemplate 一致：true 为已按下（高亮） */
const pressed = ref(/** @type {boolean[]} */ (Array(N).fill(true)));

function storageKey() {
  return `zhang_qiying_falu_${Number(props.itemId) || 0}`;
}

function defaultPressed() {
  return Array(N).fill(true);
}

function persist() {
  try {
    uni.setStorageSync(storageKey(), JSON.stringify({ pressed: [...pressed.value] }));
  } catch {
    /* ignore */
  }
}

function loadState() {
  try {
    const raw = uni.getStorageSync(storageKey());
    const o = typeof raw === "string" ? JSON.parse(raw) : raw;
    const p = o?.pressed;
    if (!Array.isArray(p) || p.length !== N) {
      pressed.value = defaultPressed();
      return;
    }
    const next = p.map((x) => !!x);
    pressed.value = next;
  } catch {
    pressed.value = defaultPressed();
  }
}

function onToggle(i) {
  if (i < 0 || i >= N) return;
  const next = [...pressed.value];
  next[i] = !next[i];
  pressed.value = next;
  persist();
}

function onResetTap() {
  uni.showModal({
    title: "重置",
    content: "将所有按钮恢复为初始状态（全部已按下）。是否继续？",
    success: (res) => {
      if (!res.confirm) return;
      pressed.value = defaultPressed();
      persist();
      uni.showToast({ title: "已重置", icon: "none" });
    },
  });
}

onMounted(() => {
  loadState();
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
  display: flex;
  flex-direction: column;
}

.header {
  position: relative;
  flex-shrink: 0;
  padding: 16rpx 28rpx 32rpx;
}

.center-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 28rpx 32rpx;
  box-sizing: border-box;
}

.reset-btn {
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

.grid {
  width: 100%;
  max-width: 620rpx;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 36rpx 24rpx;
  box-sizing: border-box;
}

.cell {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.btn {
  min-height: 120rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 16rpx;
  box-sizing: border-box;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    transform 0.08s ease;
}

.btn-label {
  font-size: 32rpx;
  font-weight: 700;
  text-align: center;
  line-height: 1.3;
}

.btn--on {
  background: linear-gradient(145deg, #f2e8c8 0%, #e2cf9e 100%);
  border: 2rpx solid rgba(160, 130, 80, 0.35);
  box-shadow:
    inset 0 2rpx 8rpx rgba(255, 255, 255, 0.45),
    0 6rpx 16rpx rgba(160, 120, 60, 0.22);
}

.btn--on .btn-label {
  color: #4a3824;
}

.btn--off {
  background: #ffffff;
  border: 2rpx solid rgba(0, 0, 0, 0.12);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.btn--off .btn-label {
  color: #1a1a1a;
}

.hint {
  display: block;
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.45;
  color: #444;
  text-align: center;
}
</style>
