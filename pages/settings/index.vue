<template>
  <view class="page">
    <view class="card">
      <text class="card-title">随机算法</text>
      <text class="card-hint">默认使用自适应随机；切换为「自适应」时会重新均分所有条目的权重</text>
      <view
        class="row"
        :class="{ 'row--on': algorithm === ALGO_ADAPTIVE }"
        @click="selectAlgorithm(ALGO_ADAPTIVE)"
      >
        <view class="row-texts">
          <text class="row-title">自适应随机</text>
          <text class="row-sub">按权重抽取，被抽中项权重下降、其余项上升，总权重不变</text>
        </view>
        <text v-if="algorithm === ALGO_ADAPTIVE" class="mark">✓</text>
      </view>
      <view
        class="row"
        :class="{ 'row--on': algorithm === ALGO_UNIFORM }"
        @click="selectAlgorithm(ALGO_UNIFORM)"
      >
        <view class="row-texts">
          <text class="row-title">完全随机</text>
          <text class="row-sub">每项概率相同，不改变权重</text>
        </view>
        <text v-if="algorithm === ALGO_UNIFORM" class="mark">✓</text>
      </view>
    </view>

    <view class="card danger" @click="onDeleteCustom">
      <text class="card-title">删除所有自定义条目</text>
      <text class="card-desc">将移除所有非预设条目及其随机选项与历史记录，预设条目不受影响</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import {
  ALGO_ADAPTIVE,
  ALGO_UNIFORM,
  deleteAllCustomItems,
  getRandomAlgorithm,
  normalizeWeightsAllItems,
  setRandomAlgorithm,
} from "@/utils/itemStore.js";

const algorithm = ref(ALGO_ADAPTIVE);

onShow(async () => {
  try {
    algorithm.value = await getRandomAlgorithm();
  } catch (e) {
    algorithm.value = ALGO_ADAPTIVE;
  }
});

async function selectAlgorithm(mode) {
  const next = mode === ALGO_UNIFORM ? ALGO_UNIFORM : ALGO_ADAPTIVE;
  if (next === algorithm.value) return;
  try {
    await setRandomAlgorithm(next);
    if (next === ALGO_ADAPTIVE) {
      await normalizeWeightsAllItems();
      uni.showToast({ title: "已切换为自适应随机，权重已重置", icon: "none" });
    } else {
      uni.showToast({ title: "已切换为完全随机", icon: "none" });
    }
    algorithm.value = next;
  } catch (e) {
    uni.showToast({ title: e.message || "保存失败", icon: "none" });
  }
}

function onDeleteCustom() {
  uni.showModal({
    title: "确认删除",
    content: "将删除所有自定义条目（含选项与历史），此操作不可恢复。是否继续？",
    confirmText: "删除",
    confirmColor: "#c94444",
    success: async (res) => {
      if (!res.confirm) return;
      try {
        const n = await deleteAllCustomItems();
        uni.showToast({
          title: n > 0 ? `已删除 ${n} 个条目` : "没有可删除的自定义条目",
          icon: "none",
        });
      } catch (e) {
        uni.showToast({
          title: e.message || "删除失败",
          icon: "none",
        });
      }
    },
  });
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: #f4f4f4;
  box-sizing: border-box;
  padding-left: 24rpx;
  padding-right: 24rpx;
  padding-bottom: 40rpx;
  padding-top: calc(constant(safe-area-inset-top) + 56rpx);
  padding-top: calc(env(safe-area-inset-top) + 56rpx);
}

.card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 18rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
}

.card.danger {
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
}

.card-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 10rpx;
}

.card-hint {
  display: block;
  font-size: 24rpx;
  color: #888;
  line-height: 1.45;
  margin-bottom: 18rpx;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 18rpx 16rpx;
  border-radius: 12rpx;
  border: 1rpx solid #ededed;
  margin-bottom: 12rpx;
}

.row:last-child {
  margin-bottom: 0;
}

.row--on {
  border-color: #cfcfcf;
  background: #fafafa;
}

.row-texts {
  flex: 1;
}

.row-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 6rpx;
}

.row-sub {
  display: block;
  font-size: 24rpx;
  color: #777;
  line-height: 1.45;
}

.mark {
  font-size: 34rpx;
  color: #111;
  font-weight: 700;
  padding-left: 8rpx;
}

.card-desc {
  display: block;
  font-size: 26rpx;
  color: #777;
  line-height: 1.45;
}
</style>
