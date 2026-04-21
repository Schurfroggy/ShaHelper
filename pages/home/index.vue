<template>
  <view class="page">
    <scroll-view scroll-y class="list-wrap">
      <view v-if="items.length" class="waterfall">
        <view class="col">
          <view
            v-for="item in columnLeft"
            :key="item.id"
            class="card"
            @click="openItem(item.id)"
          >
            <view :class="imgBoxClass(item)" :style="imgBoxStyle(item)">
              <image
                v-if="coverSrc(item)"
                class="img-fill"
                :src="coverSrc(item)"
                mode="aspectFill"
              />
              <view v-else class="img-fill img-placeholder" />
            </view>
            <text class="card-title">{{ item.title }}</text>
          </view>
        </view>
        <view class="col">
          <view
            v-for="item in columnRight"
            :key="item.id"
            class="card"
            @click="openItem(item.id)"
          >
            <view :class="imgBoxClass(item)" :style="imgBoxStyle(item)">
              <image
                v-if="coverSrc(item)"
                class="img-fill"
                :src="coverSrc(item)"
                mode="aspectFill"
              />
              <view v-else class="img-fill img-placeholder" />
            </view>
            <text class="card-title">{{ item.title }}</text>
          </view>
        </view>
      </view>
      <view v-if="!items.length" class="empty">暂无条目，请在“添加条目”创建</view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { listItems } from "@/utils/itemStore.js";
import { PRESET_COVER_HEIGHT, PRESET_COVER_WIDTH, resolveCoverDisplaySrc } from "@/utils/coverResolve.js";

/** 设计稿 750rpx：与样式 padding 横向 18+18、列间距 10 一致 */
const PAD_H_RPX = 36;
const COL_GAP_RPX = 10;
const COL_W_RPX = (750 - PAD_H_RPX - COL_GAP_RPX) / 2;
const TITLE_BLOCK_RPX = 88;
const USER_IMAGE_FALLBACK_RPX = 260;
const CARD_GAP_RPX = 18;
const PRESET_RATIO = PRESET_COVER_HEIGHT / PRESET_COVER_WIDTH;
/** 用户图过高时限制瀑布流卡片高度（相对列宽倍数） */
const USER_MAX_HEIGHT_FACTOR = 3.2;

const items = ref([]);
const columnLeft = ref([]);
const columnRight = ref([]);

function coverSrc(row) {
  return resolveCoverDisplaySrc(row);
}

function isPresetRow(item) {
  return Number(item?.is_preset) === 1;
}

function readCoverDims(item) {
  const w = Number(item?.cover_width ?? item?.COVER_WIDTH ?? 0);
  const h = Number(item?.cover_height ?? item?.COVER_HEIGHT ?? 0);
  return { w, h };
}

function userHasStoredAspect(item) {
  if (isPresetRow(item)) return false;
  const { w, h } = readCoverDims(item);
  return w > 0 && h > 0;
}

function imgBoxClass(item) {
  if (isPresetRow(item)) return "img-box img-box--preset";
  if (userHasStoredAspect(item)) return "img-box img-box--aspect";
  return "img-box img-box--user-fixed";
}

function imgBoxStyle(item) {
  if (isPresetRow(item)) return {};
  if (!userHasStoredAspect(item)) return {};
  const { w, h } = readCoverDims(item);
  return { paddingBottom: `${(h / w) * 100}%` };
}

function estimateCardHeightRpx(item) {
  if (isPresetRow(item)) {
    return COL_W_RPX * PRESET_RATIO + TITLE_BLOCK_RPX;
  }
  const { w, h } = readCoverDims(item);
  if (w > 0 && h > 0) {
    let imgH = COL_W_RPX * (h / w);
    const maxH = COL_W_RPX * USER_MAX_HEIGHT_FACTOR;
    if (imgH > maxH) imgH = maxH;
    return imgH + TITLE_BLOCK_RPX;
  }
  return USER_IMAGE_FALLBACK_RPX + TITLE_BLOCK_RPX;
}

function distributeWaterfall(list) {
  let hL = 0;
  let hR = 0;
  const left = [];
  const right = [];
  for (const item of list) {
    const est = estimateCardHeightRpx(item) + CARD_GAP_RPX;
    if (hL <= hR) {
      left.push(item);
      hL += est;
    } else {
      right.push(item);
      hR += est;
    }
  }
  return { left, right };
}

onShow(() => {
  loadItems();
});

async function loadItems() {
  try {
    items.value = await listItems();
    const { left, right } = distributeWaterfall(items.value);
    columnLeft.value = left;
    columnRight.value = right;
  } catch (e) {
    uni.showToast({
      title: e.message || "读取条目失败",
      icon: "none",
    });
  }
}

function openItem(id) {
  uni.navigateTo({
    url: `/pages/generator/index?itemId=${id}`,
  });
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: #f4f4f4;
  box-sizing: border-box;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}

.list-wrap {
  /* 预留 tabBar（约 100rpx）+ 顶/底安全区；避免高度与系统布局错位露出默认白底 */
  height: calc(
    100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 100rpx
  );
  padding: 44rpx 18rpx 20rpx;
  box-sizing: border-box;
  /* scroll-view 未设背景时常为白，与 #f4f4f4 页面叠加在底部像「白边」 */
  background-color: #f4f4f4;
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

.card {
  width: 100%;
  margin-bottom: 18rpx;
  border-radius: 18rpx;
  background: #ffffff;
  overflow: hidden;
}

.img-box {
  width: 100%;
  position: relative;
  overflow: hidden;
  background: #ffffff;
}

/* 预设：固定 574:761 */
.img-box--preset {
  height: 0;
  padding-bottom: calc(761 / 574 * 100%);
}

/* 用户：按库存宽高比（padding-bottom 由内联 style 提供） */
.img-box--aspect {
  height: 0;
}

/* 用户：无尺寸记录时的兜底固定高度 */
.img-box--user-fixed {
  height: 260rpx;
}

.img-fill {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.img-placeholder {
  background: #ffffff;
  border-bottom: 1rpx solid #f0f0f0;
}

.card-title {
  display: block;
  padding: 16rpx 16rpx 20rpx;
  font-size: 28rpx;
  color: #1e1e1e;
  line-height: 1.4;
  text-align: center;
}

.empty {
  padding: 80rpx 20rpx;
  text-align: center;
  color: #888;
  font-size: 28rpx;
}
</style>
