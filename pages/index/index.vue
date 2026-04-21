<template>
  <view
    class="page"
    :class="{ 'page--flash': flashOn }"
    :style="{ backgroundColor: bgColor }"
    @click="onPageTap"
  >
    <view class="panel-top" @click.stop>
      <view class="field">
        <text class="label">最小值</text>
        <input
          class="input"
          v-model="minInput"
          type="text"
          placeholder="如 1 或 -999"
          confirm-type="done"
        />
      </view>
      <view class="field">
        <text class="label">最大值</text>
        <input
          class="input"
          v-model="maxInput"
          type="text"
          placeholder="如 100 或很大整数"
          confirm-type="done"
        />
      </view>
      <text class="hint">在下方空白处点击即可生成随机数（输入区点击不会触发）</text>
    </view>

    <view class="panel-center">
      <text class="result" selectable="true">{{ displayText }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { randomInRange } from "@/utils/random.js";
import { addHistoryRecord } from "@/utils/historyStore.js";

const minInput = ref("1");
const maxInput = ref("100");
const displayText = ref("—");
const bgColor = ref("#e8e8e8");
const flashOn = ref(false);

function randomPastel() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue} 72% 86%)`;
}

function triggerFlash() {
  flashOn.value = true;
  setTimeout(() => {
    flashOn.value = false;
  }, 420);
}

async function onPageTap() {
  try {
    const { kind, value } = randomInRange(minInput.value, maxInput.value);
    const text = kind === "number" ? formatNumber(value) : String(value);
    displayText.value = text;
    bgColor.value = randomPastel();
    triggerFlash();
    await addHistoryRecord({
      min: minInput.value.trim(),
      max: maxInput.value.trim(),
      result: text,
    });
  } catch (e) {
    uni.showToast({
      title: e.message || "生成失败",
      icon: "none",
    });
  }
}

function formatNumber(n) {
  if (typeof n !== "number") return String(n);
  if (Number.isInteger(n)) return String(n);
  const t = n.toFixed(8).replace(/\.?0+$/, "");
  return t;
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  transition: background-color 0.35s ease;
  /* 自定义导航；Android 全屏时无状态栏，仅保留刘海/挖孔安全区 */
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}

.page--flash {
  animation: flash-once 0.42s ease;
}

@keyframes flash-once {
  0% {
    filter: brightness(1);
  }
  35% {
    filter: brightness(1.35);
  }
  100% {
    filter: brightness(1);
  }
}

.panel-top {
  flex: 0 0 50vh;
  max-height: 50vh;
  padding: 32rpx 40rpx 24rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 24rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
}

.field {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.label {
  flex: 0 0 140rpx;
  font-size: 30rpx;
  color: #333;
}

.input {
  flex: 1;
  height: 88rpx;
  padding: 0 24rpx;
  border-radius: 12rpx;
  background: rgba(255, 255, 255, 0.85);
  font-size: 32rpx;
  color: #111;
}

.hint {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
}

.panel-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx 24rpx 80rpx;
  box-sizing: border-box;
}

.result {
  font-size: min(22vw, 160rpx);
  line-height: 1.15;
  font-weight: 700;
  color: #1a1a1a;
  text-align: center;
  word-break: break-all;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}
</style>
