<template>
  <view class="page">
    <view class="page-top">
      <view v-if="batchMode" class="batch-bar">
        <view class="batch-bar__side" @click="toggleSelectAll">
          <text class="batch-bar__link">{{ allSelected ? "取消全选" : "全选" }}</text>
        </view>
        <text class="page-title page-title--in-bar">牌名标注</text>
        <view class="batch-bar__side batch-bar__side--end" @click="onBatchDelete">
          <text class="batch-bar__link batch-bar__link--danger">删除</text>
        </view>
      </view>
      <view v-else class="title-bar">
        <text class="page-title">牌名标注</text>
        <view
          class="top-edit-btn"
          :class="{ 'top-edit-btn--disabled': !cardItems.length }"
          @click="enterBatchMode"
        >
          <text class="top-edit-btn__text">编辑</text>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="list-scroll" :show-scrollbar="false">
      <view class="list-inner">
        <text v-if="!cardItems.length" class="empty-bg-hint">
          目前还没有任何牌名，点击按钮添加牌名
        </text>

        <view v-if="cardItems.length" class="card-list">
          <view
            v-for="item in cardItems"
            :key="item.id"
            class="name-card"
            :class="{ 'name-card--batch': batchMode }"
            @click="onCardClick(item)"
            @longpress.stop="onCardLongPress(item)"
          >
            <view
              v-if="batchMode"
              class="name-card__check"
              @click.stop="toggleSelect(item.id)"
            >
              <view class="checkbox" :class="{ 'checkbox--on': isSelected(item.id) }">
                <text v-if="isSelected(item.id)" class="checkbox__mark">✓</text>
              </view>
            </view>
            <view class="name-card__main">
              <text
                v-if="item.suit || item.rank"
                class="name-card__meta"
                :class="{ 'name-card__meta--red': metaRed(item) }"
              >{{ formatSuitRank(item) }}</text>
              <text v-if="displayName(item)" class="name-card__name">{{ displayName(item) }}</text>
              <text v-if="typeChar(item)" class="name-card__type">{{ typeChar(item) }}</text>
            </view>
            <view class="name-card__actions">
              <view
                v-if="!batchMode"
                class="name-card__edit"
                @click.stop="openEdit(item)"
              >
                <text class="name-card__pen">✎</text>
              </view>
              <view class="name-card__del" @click.stop="onDelete(item)">
                <text class="name-card__cross">×</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view v-if="batchMode" class="batch-done-wrap">
      <button type="button" class="batch-done-btn" @click="exitBatchMode">完成</button>
    </view>
    <view v-else class="add-btn-wrap">
      <button type="button" class="add-name-btn" @click="openAdd">添加牌名</button>
    </view>

    <CardNamePickerPanel
      v-model:visible="pickerVisible"
      :initial="pickerInitial"
      :editing-id="editingId"
      @confirm="onPickerConfirm"
    />
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onBackPress, onShow } from "@dcloudio/uni-app";
import CardNamePickerPanel from "@/components/CardNamePickerPanel.vue";
import { TYPE_CHAR, isSuitRankRed, resolveDisplayName } from "@/utils/cardNamePickerData.js";
import {
  createCardLabelItem,
  loadCardLabelItems,
  saveCardLabelItems,
} from "@/utils/cardLabelStore.js";

const cardItems = ref([]);
const pickerVisible = ref(false);
const pickerInitial = ref(null);
const editingId = ref("");
const batchMode = ref(false);
/** @type {import('vue').Ref<Record<string, boolean>>} */
const selectedIds = ref({});

const allSelected = computed(() => {
  const list = cardItems.value;
  if (!list.length) return false;
  return list.every((it) => selectedIds.value[it.id]);
});

function refreshList() {
  cardItems.value = loadCardLabelItems();
  if (!cardItems.value.length && batchMode.value) {
    exitBatchMode();
  }
  pruneSelection();
}

function pruneSelection() {
  const ids = new Set(cardItems.value.map((it) => it.id));
  const next = {};
  for (const id of Object.keys(selectedIds.value)) {
    if (ids.has(id)) next[id] = true;
  }
  selectedIds.value = next;
}

onShow(() => {
  refreshList();
});

/** App 物理返回 / 侧滑返回：批量编辑中先退出编辑，不离开本页 */
onBackPress(() => {
  if (!batchMode.value) return false;
  exitBatchMode();
  return true;
});

function isSelected(id) {
  return !!selectedIds.value[id];
}

function toggleSelect(id) {
  const next = { ...selectedIds.value };
  if (next[id]) delete next[id];
  else next[id] = true;
  selectedIds.value = next;
}

function toggleSelectAll() {
  if (allSelected.value) {
    selectedIds.value = {};
    return;
  }
  const next = {};
  for (const it of cardItems.value) {
    next[it.id] = true;
  }
  selectedIds.value = next;
}

function enterBatchMode(preselectId) {
  if (!cardItems.value.length) {
    uni.showToast({ title: "暂无牌名可编辑", icon: "none" });
    return;
  }
  batchMode.value = true;
  if (preselectId) {
    selectedIds.value = { [preselectId]: true };
  } else {
    selectedIds.value = {};
  }
}

/** 长按进入批量编辑，并默认勾选该条 */
function onCardLongPress(item) {
  if (!cardItems.value.length) return;
  if (batchMode.value) {
    const next = { ...selectedIds.value };
    next[item.id] = true;
    selectedIds.value = next;
    return;
  }
  enterBatchMode(item.id);
}

function onCardClick(item) {
  if (!batchMode.value) return;
  toggleSelect(item.id);
}

function exitBatchMode() {
  batchMode.value = false;
  selectedIds.value = {};
}

function removeByIds(ids) {
  const set = new Set(ids);
  const list = cardItems.value.filter((it) => !set.has(it.id));
  cardItems.value = list;
  saveCardLabelItems(list);
  const next = { ...selectedIds.value };
  for (const id of ids) delete next[id];
  selectedIds.value = next;
  if (!list.length) exitBatchMode();
}

function displayName(item) {
  return resolveDisplayName(item);
}

function typeChar(item) {
  return TYPE_CHAR[item.cardType] || "";
}

function metaRed(item) {
  return isSuitRankRed(item.suit);
}

function formatSuitRank(item) {
  const s = String(item.suit ?? "");
  const r = String(item.rank ?? "");
  if (!s && !r) return "";
  return `${s} ${r}`.trim();
}

function openAdd() {
  editingId.value = "";
  pickerInitial.value = null;
  pickerVisible.value = true;
}

function openEdit(item) {
  editingId.value = item.id;
  pickerInitial.value = {
    suit: item.suit,
    rank: item.rank,
    cardType: item.cardType,
    name: item.name,
    customName: item.customName,
  };
  pickerVisible.value = true;
}

function onDelete(item) {
  if (batchMode.value) {
    removeByIds([item.id]);
    return;
  }
  uni.showModal({
    title: "确认删除",
    content: "确定删除这条牌名记录吗？",
    confirmText: "删除",
    confirmColor: "#c94444",
    success: (res) => {
      if (!res.confirm) return;
      removeByIds([item.id]);
      if (editingId.value === item.id) {
        editingId.value = "";
        pickerVisible.value = false;
      }
    },
  });
}

function onBatchDelete() {
  const ids = Object.keys(selectedIds.value);
  if (!ids.length) {
    uni.showToast({ title: "请先勾选要删除的项", icon: "none" });
    return;
  }
  const n = ids.length;
  uni.showModal({
    title: "确认删除",
    content: n === cardItems.value.length ? "确定删除全部牌名吗？" : `确定删除选中的 ${n} 条牌名吗？`,
    confirmText: "删除",
    confirmColor: "#c94444",
    success: (res) => {
      if (!res.confirm) return;
      removeByIds(ids);
    },
  });
}

function onPickerConfirm(payload) {
  const fields = {
    suit: payload.suit,
    rank: payload.rank,
    cardType: payload.cardType,
    name: payload.name,
    customName: payload.customName,
  };
  if (editingId.value) {
    const list = cardItems.value.map((it) =>
      it.id === editingId.value ? { ...it, ...fields } : it,
    );
    cardItems.value = list;
    saveCardLabelItems(list);
  } else {
    const list = [...cardItems.value, createCardLabelItem(fields)];
    cardItems.value = list;
    saveCardLabelItems(list);
  }
  editingId.value = "";
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: #f4f4f4;
  box-sizing: border-box;
  padding-left: 24rpx;
  padding-right: 24rpx;
  padding-top: calc(constant(safe-area-inset-top) + 56rpx);
  padding-top: calc(env(safe-area-inset-top) + 56rpx);
  padding-bottom: calc(constant(safe-area-inset-bottom) + 200rpx);
  padding-bottom: calc(env(safe-area-inset-bottom) + 200rpx);
  display: flex;
  flex-direction: column;
}

.page-top {
  flex-shrink: 0;
  margin-bottom: 20rpx;
}

.title-bar {
  position: relative;
  min-height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.batch-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  min-height: 56rpx;
}

.batch-bar__side {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

.batch-bar__side--end {
  justify-content: flex-end;
}

.batch-bar__link {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
  padding: 8rpx 4rpx;
}

.batch-bar__link--danger {
  color: #c94444;
}

.page-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #1a1a1a;
  text-align: center;
}

.page-title--in-bar {
  flex: 0 0 auto;
  font-size: 34rpx;
  padding: 0 12rpx;
}

.top-edit-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.06);
}

.top-edit-btn--disabled {
  opacity: 0.45;
}

.top-edit-btn__text {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.list-scroll {
  flex: 1;
  height: 0;
  min-height: 200rpx;
}

.list-inner {
  position: relative;
  min-height: 480rpx;
  padding-bottom: 16rpx;
}

.empty-bg-hint {
  display: block;
  padding: 120rpx 32rpx 80rpx;
  text-align: center;
  font-size: 28rpx;
  line-height: 1.55;
  color: #b8b8b8;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.name-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx 20rpx 24rpx 24rpx;
  background: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
}

.name-card--batch {
  padding-left: 16rpx;
}

.name-card__check {
  flex-shrink: 0;
  padding: 4rpx 8rpx 4rpx 4rpx;
}

.checkbox {
  width: 40rpx;
  height: 40rpx;
  border-radius: 8rpx;
  border: 2rpx solid #ccc;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.checkbox--on {
  border-color: #111;
  background: #111;
}

.checkbox__mark {
  font-size: 26rpx;
  color: #fff;
  font-weight: 700;
  line-height: 1;
}

.name-card__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 8rpx 12rpx;
}

.name-card__meta {
  font-size: 30rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.name-card__meta--red {
  color: #c41e1e;
}

.name-card__name {
  font-size: 30rpx;
  color: #1a1a1a;
}

.name-card__type {
  font-size: 38rpx;
  font-weight: 700;
  color: #9a9a9a;
  line-height: 1;
  margin-left: 4rpx;
}

.name-card__actions {
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10rpx;
}

.name-card__edit,
.name-card__del {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  box-sizing: border-box;
}

.name-card__edit {
  background: #f5f5f5;
}

.name-card__del {
  background: #fff0f0;
}

.name-card__pen {
  font-size: 36rpx;
  color: #444;
  line-height: 1;
}

.name-card__cross {
  font-size: 44rpx;
  font-weight: 600;
  color: #c94444;
  line-height: 1;
  margin-top: -4rpx;
}

.add-btn-wrap,
.batch-done-wrap {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: calc(constant(safe-area-inset-bottom) + 20rpx);
  bottom: calc(env(safe-area-inset-bottom) + 20rpx);
  height: 88rpx;
  box-sizing: border-box;
  z-index: 10;
}

.add-name-btn,
.batch-done-btn {
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 999rpx;
  font-size: 32rpx;
  font-weight: 600;
  padding: 0;
  line-height: 88rpx;
}

.add-name-btn {
  background: #111111;
  color: #ffffff;
}

.batch-done-btn {
  background: #ffffff;
  color: #1a1a1a;
  border: 2rpx solid #ddd;
}

.add-name-btn::after,
.batch-done-btn::after {
  border: none;
}

/* #ifdef H5 */
.page {
  padding-bottom: calc(constant(safe-area-inset-bottom) + 200rpx);
  padding-bottom: calc(env(safe-area-inset-bottom) + 200rpx);
}

.add-btn-wrap,
.batch-done-wrap {
  bottom: calc(constant(safe-area-inset-bottom) + 100rpx);
  bottom: calc(env(safe-area-inset-bottom) + 100rpx);
}
/* #endif */
</style>
