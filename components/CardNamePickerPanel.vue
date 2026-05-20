<template>
  <view v-if="visible" class="picker-mask" @click="onMaskTap">
    <view class="picker-sheet" @click.stop>
      <view class="picker-head">
        <text class="picker-head__title">{{ editingId ? "编辑牌名" : "选择牌名" }}</text>
        <view class="picker-close" @click="close">
          <text class="picker-close__icon">×</text>
        </view>
      </view>

      <scroll-view scroll-y class="picker-scroll" :show-scrollbar="true">
        <view class="section">
          <view class="section-label-row">
            <text class="section-label">花色</text>
            <text class="section-label-hint">（非必选）</text>
          </view>
          <view class="suit-row">
            <view
              v-for="s in CARD_SUITS"
              :key="s.id"
              class="chip chip--suit"
              :class="{ 'chip--on': draft.suit === s.symbol }"
              @click="toggleSuit(s.symbol)"
            >
              <text
                class="chip__text"
                :class="{
                  'chip__text--red': s.red,
                  'chip__text--red-on': s.red && draft.suit === s.symbol,
                }"
              >{{ s.symbol }}</text>
            </view>
          </view>
        </view>

        <view class="section">
          <view class="section-label-row">
            <text class="section-label">点数</text>
            <text class="section-label-hint">（非必选）</text>
          </view>
          <view class="rank-grid">
            <view
              v-for="r in CARD_RANKS"
              :key="r"
              class="chip chip--rank"
              :class="{ 'chip--on': draft.rank === r }"
              @click="toggleRank(r)"
            >
              <text class="chip__text">{{ r }}</text>
            </view>
          </view>
        </view>

        <view class="section">
          <text class="section-label section-label--block">牌的类型</text>
          <view class="type-row">
            <view
              v-for="t in CARD_TYPE_OPTIONS"
              :key="t.id"
              class="chip chip--type"
              :class="{ 'chip--on': draft.cardType === t.id }"
              @click="selectCardType(t.id)"
            >
              <text class="chip__text">{{ t.label }}</text>
            </view>
          </view>
        </view>

        <view v-if="draft.cardType" class="section">
          <text class="section-label section-label--block">名称</text>

          <template v-if="nameGroups">
            <view
              v-for="group in nameGroups"
              :key="group.key"
              class="name-group"
            >
              <text class="name-group__label">{{ group.label }}</text>
              <view class="name-grid">
                <view
                  v-for="n in group.names"
                  :key="n"
                  class="chip chip--name"
                  :class="{ 'chip--on': draft.name === n }"
                  @click="selectName(n)"
                >
                  <text class="chip__text chip__text--name">{{ n }}</text>
                </view>
              </view>
            </view>
          </template>
          <view v-else class="name-grid">
            <view
              v-for="n in currentNames"
              :key="n"
              class="chip chip--name"
              :class="{ 'chip--on': draft.name === n }"
              @click="selectName(n)"
            >
              <text class="chip__text chip__text--name">{{ n }}</text>
            </view>
          </view>

          <view class="other-block">
            <view
              class="chip chip--name chip--other-inline"
              :class="{ 'chip--on': isOtherActive }"
            >
              <text class="chip__text chip__text--name chip--other-label">其他</text>
              <input
                class="other-inline-input"
                type="text"
                :value="draft.customName"
                placeholder="请输入牌名"
                maxlength="20"
                confirm-type="done"
                @focus="focusOtherInput"
                @input="onOtherInput"
              />
            </view>
          </view>
        </view>
      </scroll-view>

      <view class="picker-foot">
        <button type="button" class="confirm-btn" @click="onConfirm">确认</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import {
  CARD_RANKS,
  CARD_SUITS,
  CARD_TYPE_EQUIP,
  CARD_TYPE_TRICK,
  CARD_TYPE_OPTIONS,
  EQUIP_NAME_GROUPS,
  TRICK_NAME_GROUPS,
  OTHER_NAME_OPTION,
  createEmptyPickerState,
  namesForCardType,
  isCardLabelComplete,
  resolveDisplayName,
} from "@/utils/cardNamePickerData.js";

const props = defineProps({
  visible: { type: Boolean, default: false },
  /** 编辑时传入已有条目 */
  initial: { type: Object, default: null },
  editingId: { type: String, default: "" },
});

const emit = defineEmits(["update:visible", "confirm", "close"]);

const draft = ref(createEmptyPickerState());

const currentNames = computed(() => namesForCardType(draft.value.cardType));

const nameGroups = computed(() => {
  const t = draft.value.cardType;
  if (t === CARD_TYPE_EQUIP) return EQUIP_NAME_GROUPS;
  if (t === CARD_TYPE_TRICK) return TRICK_NAME_GROUPS;
  return null;
});

const isOtherActive = computed(
  () =>
    draft.value.name === OTHER_NAME_OPTION ||
    String(draft.value.customName ?? "").trim().length > 0,
);

function applyInitial(val) {
  const o = val && typeof val === "object" ? val : {};
  draft.value = {
    suit: String(o.suit ?? ""),
    rank: String(o.rank ?? ""),
    cardType: String(o.cardType ?? ""),
    name: String(o.name ?? ""),
    customName: String(o.customName ?? ""),
  };
}

watch(
  () => [props.visible, props.initial],
  ([vis]) => {
    if (vis) applyInitial(props.initial);
  },
);

function close() {
  emit("update:visible", false);
  emit("close");
}

function onMaskTap() {
  close();
}

function toggleSuit(symbol) {
  draft.value.suit = draft.value.suit === symbol ? "" : symbol;
}

function toggleRank(rank) {
  draft.value.rank = draft.value.rank === rank ? "" : rank;
}

function selectCardType(typeId) {
  if (draft.value.cardType !== typeId) {
    draft.value.cardType = typeId;
    draft.value.name = "";
    draft.value.customName = "";
  }
}

function selectName(n) {
  draft.value.name = draft.value.name === n ? "" : n;
  if (draft.value.name !== OTHER_NAME_OPTION) {
    draft.value.customName = "";
  }
}

function focusOtherInput() {
  draft.value.name = OTHER_NAME_OPTION;
}

function onOtherInput(e) {
  draft.value.name = OTHER_NAME_OPTION;
  draft.value.customName = String(e?.detail?.value ?? "");
}

function onConfirm() {
  if (!String(draft.value.cardType ?? "").trim()) {
    uni.showToast({ title: "请选择牌的类型", icon: "none" });
    return;
  }
  if (!isCardLabelComplete(draft.value)) {
    const hint =
      draft.value.name === OTHER_NAME_OPTION ? "请输入其他牌名" : "请选择牌名";
    uni.showToast({ title: hint, icon: "none" });
    return;
  }
  const nameText = resolveDisplayName(draft.value);
  emit("confirm", {
    suit: draft.value.suit,
    rank: draft.value.rank,
    cardType: draft.value.cardType,
    name: draft.value.name,
    customName: draft.value.customName,
    displayName: nameText,
  });
  close();
}
</script>

<style scoped lang="scss">
.picker-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.picker-sheet {
  max-height: 92vh;
  background: #f8f8f8;
  border-radius: 24rpx 24rpx 0 0;
  display: flex;
  flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom);
}

.picker-head {
  position: relative;
  padding: 28rpx 88rpx 20rpx 28rpx;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  border-bottom: 1rpx solid #eee;
}

.picker-head__title {
  font-size: 34rpx;
  font-weight: 700;
  color: #1a1a1a;
  text-align: center;
  display: block;
}

.picker-close {
  position: absolute;
  right: 20rpx;
  top: 20rpx;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.picker-close__icon {
  font-size: 44rpx;
  line-height: 1;
  color: #333;
  margin-top: -4rpx;
}

.picker-scroll {
  flex: 1;
  max-height: calc(92vh - 220rpx);
  padding: 16rpx 24rpx 8rpx;
  box-sizing: border-box;
}

.section {
  background: #fff;
  border-radius: 16rpx;
  padding: 22rpx 20rpx;
  margin-bottom: 18rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.section-label-row {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.section-label {
  font-size: 26rpx;
  font-weight: 600;
  color: #444;
}

.section-label-hint {
  font-size: 22rpx;
  font-weight: 400;
  color: #999;
}

.section-label--block {
  display: block;
  margin-bottom: 16rpx;
}

.suit-row {
  display: flex;
  flex-direction: row;
  gap: 16rpx;
}

.chip {
  border-radius: 12rpx;
  border: 2rpx solid #e0e0e0;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.chip--on {
  border-color: #111;
  background: #111;
}

.chip--on .chip__text {
  color: #fff;
}

.chip--suit {
  flex: 1;
  height: 80rpx;
}

.chip--suit .chip__text {
  font-size: 40rpx;
}

.chip__text--red {
  color: #c41e1e;
}

.chip--on .chip__text--red-on {
  color: #ffb8b8;
}

.rank-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12rpx;
}

.chip--rank {
  width: calc((100% - 60rpx) / 7);
  min-width: 72rpx;
  height: 64rpx;
}

.chip--rank .chip__text {
  font-size: 28rpx;
  font-weight: 600;
}

.type-row {
  display: flex;
  flex-direction: row;
  gap: 12rpx;
}

.chip--type {
  flex: 1;
  height: 72rpx;
}

.chip--type .chip__text {
  font-size: 26rpx;
  font-weight: 600;
}

.name-group {
  margin-bottom: 22rpx;
}

.name-group:last-of-type {
  margin-bottom: 8rpx;
}

.name-group__label {
  display: block;
  font-size: 24rpx;
  font-weight: 600;
  color: #666;
  margin-bottom: 12rpx;
  padding-left: 4rpx;
}

.name-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 14rpx;
}

.chip--name {
  padding: 16rpx 22rpx;
  min-height: 72rpx;
}

.chip--other-inline {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  gap: 12rpx;
  padding: 12rpx 22rpx;
}

.chip--other-label {
  flex-shrink: 0;
}

.chip__text--name {
  font-size: 30rpx;
  font-weight: 600;
  color: #1a1a1a;
  text-align: center;
  line-height: 1.3;
}

.chip--on .chip__text--name {
  color: #fff;
}

.other-block {
  margin-top: 20rpx;
  padding-top: 18rpx;
  border-top: 1rpx solid #eee;
}

.other-inline-input {
  flex: 1;
  min-width: 0;
  height: 48rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #1a1a1a;
  background: transparent;
}

.chip--on .other-inline-input {
  color: #fff;
}

.picker-foot {
  padding: 16rpx 24rpx 24rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
}

.confirm-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  border: 0;
  border-radius: 999rpx;
  background: #111;
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
}

.confirm-btn::after {
  border: none;
}
</style>
