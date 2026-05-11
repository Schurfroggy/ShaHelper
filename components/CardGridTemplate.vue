<template>
  <view class="page" :class="{ flash: flashOn }" :style="{ backgroundColor: bgColor }">
    <view class="overlay">
      <view class="reset-btn" @click="onResetTap">重置</view>
      <text class="title">{{ title }}</text>
      <text v-if="hint" class="hint">{{ hint }}</text>

      <view class="card-grid" :style="pressedThemeVars">
        <template v-for="(cell, idx) in cells" :key="idx">
          <view v-if="showDividerBefore(idx)" class="card-grid__gap" />
          <view
            class="card-grid__cell"
            :class="
              cell.isPlaceholder ? 'card-grid__cell--placeholder' : cellClass(cell.state)
            "
            @click="onCellTap(idx)"
          >
            <text v-if="!cell.isPlaceholder" class="card-grid__text">{{ cell.label }}</text>
          </view>
        </template>
      </view>

      <view v-if="showQizhengFab" class="qizheng-fab-wrap">
        <view class="qizheng-fab" :style="pressedThemeVars" @click="openQizhengModal">
          <text class="qizheng-fab__text">奇正相生</text>
        </view>
      </view>
    </view>

    <view v-if="qizhengModalOpen" class="qizheng-mask" @click="closeQizhengModal">
      <view class="qizheng-dialog" :style="pressedThemeVars" @click.stop>
        <view class="qizheng-type-row">
          <view
            class="qizheng-type-btn"
            :class="{ 'qizheng-type-btn--on': qizhengMode === 'zheng' }"
            @click="setQizhengMode('zheng')"
          >
            <text class="qizheng-type-btn__text">选择正兵</text>
          </view>
          <view
            class="qizheng-type-btn"
            :class="{ 'qizheng-type-btn--on': qizhengMode === 'qi' }"
            @click="setQizhengMode('qi')"
          >
            <text class="qizheng-type-btn__text">选择奇兵</text>
          </view>
        </view>
        <view class="qizheng-body">
          <view v-if="qizhengMode === 'zheng'" class="qizheng-cols">
            <text class="qizheng-col-text">{{ qizhengZhengLeft }}</text>
            <text class="qizheng-col-text">{{ qizhengZhengRight }}</text>
          </view>
          <view v-else-if="qizhengMode === 'qi'" class="qizheng-cols">
            <text class="qizheng-col-text">{{ qizhengQiLeft }}</text>
            <text class="qizheng-col-text">{{ qizhengQiRight }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  itemId: {
    type: Number,
    default: 0,
  },
  /** 行优先展平的牌名列表 */
  labels: {
    type: Array,
    default: () => [],
  },
  /** 初始为「不可用」的牌名子集 */
  initialDisabledLabels: {
    type: Array,
    default: () => [],
  },
  /** 在「上 row 列」与下方区域之间加分隔（默认第 3 行前，即两行之后） */
  dividerAfterRows: {
    type: Number,
    default: 2,
  },
  hint: {
    type: String,
    default: "点击切换「未按下 / 已按下」；灰色为不可用，无法点击。",
  },
  resetModalTitle: {
    type: String,
    default: "重置",
  },
  resetModalContent: {
    type: String,
    default: "将所有可用按钮恢复为未按下，不可用项保持不变。是否继续？",
  },
  /** 为 true：只能从「未按下」变为「已按下」，不能再点回去，仅能通过「重置」恢复 */
  pressLatch: {
    type: Boolean,
    default: false,
  },
  /** 已按下态渐变起点（默认沿用原深绿色） */
  pressedGradientFrom: {
    type: String,
    default: "",
  },
  /** 已按下态渐变终点 */
  pressedGradientTo: {
    type: String,
    default: "",
  },
  /** 已按下态主文字颜色 */
  pressedTextColor: {
    type: String,
    default: "",
  },
  /** 已按下态外发光颜色（建议带透明度） */
  pressedGlow: {
    type: String,
    default: "",
  },
  /** 神荀彧页：底部「奇正相生」圆形入口与说明弹层 */
  showQizhengFab: {
    type: Boolean,
    default: false,
  },
  /** 为 true：任意时刻至多一格为「已按下」；点新格时其余恢复未按下；再点当前已按下格可取消 */
  exclusiveSinglePress: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["reset"]);

const qizhengModalOpen = ref(false);
const qizhengMode = ref(null);

const qizhengZhengLeft = "目标未打出【闪】\n 获得其一张牌";
const qizhengZhengRight = "目标打出【闪】\n 无事发生";
const qizhengQiLeft = "目标未打出【杀】\n 你对其造成一点伤害";
const qizhengQiRight = "目标打出【杀】\n 无事发生";

function openQizhengModal() {
  qizhengMode.value = null;
  qizhengModalOpen.value = true;
}

function closeQizhengModal() {
  qizhengModalOpen.value = false;
}

function setQizhengMode(mode) {
  qizhengMode.value = mode;
}

/** 与历史默认一致：深绿按下 */
const DEFAULT_PRESS_FROM = "#1d6b4a";
const DEFAULT_PRESS_TO = "#145236";
const DEFAULT_PRESS_TEXT = "#f4fff9";
const DEFAULT_PRESS_GLOW = "rgba(20, 82, 54, 0.35)";

const pressedThemeVars = computed(() => {
  const from = String(props.pressedGradientFrom || "").trim() || DEFAULT_PRESS_FROM;
  const to = String(props.pressedGradientTo || "").trim() || DEFAULT_PRESS_TO;
  const text = String(props.pressedTextColor || "").trim() || DEFAULT_PRESS_TEXT;
  const glow = String(props.pressedGlow || "").trim() || DEFAULT_PRESS_GLOW;
  return {
    "--cg-press-from": from,
    "--cg-press-to": to,
    "--cg-press-text": text,
    "--cg-press-glow": glow,
  };
});

const bgColor = ref("#ececec");
const flashOn = ref(false);

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

/** 与本条目绑定的存储键（不同条目互不干扰） */
function storageKey() {
  return `card_grid_${props.itemId}`;
}

const cells = ref([]);

const dividerBeforeIndex = computed(() => {
  const cols = 3;
  const rows = Number(props.dividerAfterRows);
  if (!Number.isFinite(rows) || rows < 1) return null;
  return rows * cols;
});

function showDividerBefore(idx) {
  const cut = dividerBeforeIndex.value;
  return cut != null && idx === cut;
}

function cellClass(state) {
  if (state === "pressed") return "card-grid__cell--pressed";
  if (state === "disabled") return "card-grid__cell--disabled";
  return "card-grid__cell--idle";
}

function buildInitialStates() {
  const labels = props.labels || [];
  const dis = new Set((props.initialDisabledLabels || []).map(String));
  return labels.map((label) => {
    const s = String(label ?? "").trim();
    if (!s) return "disabled";
    return dis.has(s) ? "disabled" : "idle";
  });
}

function parseStoredStates(raw) {
  try {
    const arr = typeof raw === "string" ? JSON.parse(raw) : raw;
    const len = (props.labels || []).length;
    if (!Array.isArray(arr) || arr.length !== len || !len) return null;
    const ok = new Set(["idle", "pressed", "disabled"]);
    for (let i = 0; i < arr.length; i += 1) {
      if (!ok.has(arr[i])) return null;
    }
    return arr;
  } catch {
    return null;
  }
}

function loadCells() {
  const labels = props.labels || [];
  if (!labels.length) {
    cells.value = [];
    return;
  }
  let states = null;
  try {
    states = parseStoredStates(uni.getStorageSync(storageKey()));
  } catch {
    states = null;
  }
  const list = states || buildInitialStates();
  cells.value = labels.map((label, i) => {
    const isPlaceholder = !String(label ?? "").trim();
    let state = list[i];
    if (isPlaceholder) state = "disabled";
    return {
      label,
      state,
      isPlaceholder,
    };
  });
  normalizeExclusivePressedStates();
}

/** 互斥单选：持久化若出现多格按下，只保留最先一格 */
function normalizeExclusivePressedStates() {
  if (!props.exclusiveSinglePress) return;
  let kept = -1;
  for (let i = 0; i < cells.value.length; i += 1) {
    const c = cells.value[i];
    if (c.isPlaceholder) continue;
    if (c.state !== "pressed") continue;
    if (kept < 0) {
      kept = i;
    } else {
      c.state = "idle";
    }
  }
}

function persist() {
  try {
    const states = cells.value.map((c) => c.state);
    uni.setStorageSync(storageKey(), JSON.stringify(states));
  } catch {
    /* ignore */
  }
}

onMounted(() => {
  loadCells();
});

watch(
  () => [props.itemId, props.labels, props.initialDisabledLabels, props.exclusiveSinglePress],
  () => {
    loadCells();
  },
  { deep: true },
);

watch(
  () => props.itemId,
  () => {
    bgColor.value = "#ececec";
    flashOn.value = false;
  },
);

function onCellTap(index) {
  const row = cells.value[index];
  if (!row || row.isPlaceholder || row.state === "disabled") return;

  if (props.exclusiveSinglePress) {
    if (row.state === "pressed") {
      row.state = "idle";
      persist();
      return;
    }
    for (let i = 0; i < cells.value.length; i += 1) {
      const c = cells.value[i];
      if (c.isPlaceholder || c.state === "disabled") continue;
      c.state = i === index ? "pressed" : "idle";
    }
    persist();
    bgColor.value = randomPastel();
    flashOnce();
    return;
  }

  if (row.state === "idle") {
    row.state = "pressed";
    persist();
    bgColor.value = randomPastel();
    flashOnce();
    return;
  }
  if (props.pressLatch) {
    return;
  }
  row.state = "idle";
  persist();
}

function onResetTap() {
  uni.showModal({
    title: props.resetModalTitle,
    content: props.resetModalContent,
    success: (res) => {
      if (!res.confirm) return;
      const labels = props.labels || [];
      const initial = buildInitialStates();
      cells.value = labels.map((label, i) => {
        const isPlaceholder = !String(label ?? "").trim();
        let state = initial[i];
        if (isPlaceholder) state = "disabled";
        return { label, state, isPlaceholder };
      });
      bgColor.value = "#ececec";
      flashOn.value = false;
      persist();
      emit("reset");
      uni.showToast({ title: "已重置", icon: "none" });
    },
  });
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
  padding: 110rpx 28rpx 80rpx;
  box-sizing: border-box;
  backdrop-filter: blur(2px);
}

.reset-btn {
  position: absolute;
  right: 28rpx;
  top: 72rpx;
  color: #111111;
  font-size: 34rpx;
  font-weight: 600;
  padding: 18rpx 26rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.85);
}

.title {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #1f1f1f;
  text-align: center;
  margin-bottom: 16rpx;
  padding-top: 8rpx;
}

.hint {
  display: block;
  font-size: 22rpx;
  line-height: 1.45;
  color: #555;
  text-align: center;
  margin-bottom: 28rpx;
  white-space: pre-line;
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
  margin: 18rpx 0 22rpx;
  border-top: 2rpx solid rgba(0, 0, 0, 0.14);
}

.card-grid__cell {
  min-height: 88rpx;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12rpx 8rpx;
  box-sizing: border-box;
  transition:
    background 0.15s ease,
    opacity 0.15s ease,
    transform 0.08s ease;
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
  background: linear-gradient(
    145deg,
    var(--cg-press-from) 0%,
    var(--cg-press-to) 100%
  );
  border: 2rpx solid rgba(255, 255, 255, 0.12);
  box-shadow:
    inset 0 2rpx 8rpx rgba(0, 0, 0, 0.25),
    0 6rpx 14rpx var(--cg-press-glow);
}
.card-grid__cell--pressed .card-grid__text {
  color: var(--cg-press-text);
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

/* 布局占位（如「闪电」行两侧空槽），不占视觉样式、不可点 */
.card-grid__cell--placeholder {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  opacity: 0;
  pointer-events: none;
  min-height: 88rpx;
}

.qizheng-fab-wrap {
  display: flex;
  justify-content: center;
  margin-top: 88rpx;
  padding-bottom: 48rpx;
}

.qizheng-fab {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    145deg,
    var(--cg-press-from) 0%,
    var(--cg-press-to) 100%
  );
  box-shadow: 0 12rpx 28rpx var(--cg-press-glow);
  border: 2rpx solid rgba(255, 255, 255, 0.22);
}

.qizheng-fab__text {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--cg-press-text);
  text-align: center;
  line-height: 1.3;
  padding: 0 20rpx;
}

.qizheng-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 32rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.qizheng-dialog {
  width: 100%;
  max-width: 640rpx;
  background: #f6f6f6;
  border-radius: 20rpx;
  padding: 28rpx 22rpx 24rpx;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.22);
}

.qizheng-type-row {
  display: flex;
  gap: 16rpx;
}

.qizheng-type-btn {
  flex: 1;
  min-height: 76rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 2rpx solid rgba(0, 0, 0, 0.12);
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.06);
}

.qizheng-type-btn__text {
  font-size: 26rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.qizheng-type-btn--on {
  background: linear-gradient(
    145deg,
    var(--cg-press-from) 0%,
    var(--cg-press-to) 100%
  );
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow:
    inset 0 2rpx 8rpx rgba(0, 0, 0, 0.22),
    0 6rpx 14rpx var(--cg-press-glow);
}

.qizheng-type-btn--on .qizheng-type-btn__text {
  color: var(--cg-press-text);
}

.qizheng-body {
  margin-top: 22rpx;
  min-height: 200rpx;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 14rpx;
  border: 2rpx solid rgba(0, 0, 0, 0.08);
  padding: 22rpx 16rpx;
  box-sizing: border-box;
}

.qizheng-cols {
  display: flex;
  gap: 18rpx;
  align-items: flex-start;
}

.qizheng-col-text {
  flex: 1;
  font-size: 24rpx;
  line-height: 1.45;
  color: #222;
  white-space: pre-line;
  text-align: center;
}
</style>
