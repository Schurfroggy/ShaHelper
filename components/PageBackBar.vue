<template>
  <view
    class="back-bar"
    :class="{ 'back-bar--fixed': fixed, 'back-bar--inline': !fixed }"
    @click.stop="onBack"
  >
    <text class="back-bar__chev">‹</text>
    <text class="back-bar__text">返回</text>
  </view>
</template>

<script setup>
defineProps({
  /** 生成器类全屏页：固定在安全区下方左上角，与各模板「重置」胶囊对齐 */
  fixed: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["back"]);

function onBack() {
  emit("back");
}
</script>

<style scoped lang="scss">
/* 与 RandomGeneratorTemplate / CardGridTemplate 的 .reset-btn 同高、同圆角胶囊形 */
.back-bar {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  box-sizing: border-box;
  padding: 18rpx 26rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.06);
}

.back-bar__chev {
  font-size: 38rpx;
  font-weight: 600;
  line-height: 1;
  color: #111111;
  margin-top: -2rpx;
}

.back-bar__text {
  font-size: 34rpx;
  font-weight: 600;
  line-height: 1;
  color: #111111;
}

.back-bar--inline {
  margin-top: 12rpx;
  margin-bottom: 20rpx;
  margin-left: 0;
}

.back-bar--fixed {
  position: fixed;
  left: 28rpx;
  z-index: 99999;
  /* 与 RandomGeneratorTemplate .reset-btn（overlay 内 top: 54rpx）同一视觉基线 */
  top: calc(constant(safe-area-inset-top) + 54rpx);
  top: calc(env(safe-area-inset-top) + 54rpx);
  margin: 0;
}
</style>
