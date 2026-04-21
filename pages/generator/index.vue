<template>
  <view class="wrap">
    <ShenJiangweiJiufaTianrenTemplate
      v-if="item && isShenJiangweiJiufa"
      :title="item.title"
      :item-id="itemId"
    />
    <ZhangQiyingFaluZhenyiTemplate
      v-else-if="item && isZhangqiyingFaluZhenyi"
      :title="item.title"
      :item-id="itemId"
    />
    <JieZuoCiTemplate
      v-else-if="item && isJieZuoCi"
      :title="item.title"
      :item-id="itemId"
    />
    <CardGridTemplate
      v-else-if="item && isChengyuShefu"
      :title="item.title"
      :item-id="itemId"
      :labels="SHEFU_GRID_LABELS"
      :initial-disabled-labels="SHEFU_INIT_DISABLED_LABELS"
      :divider-after-rows="2"
      pressed-gradient-from="#153a62"
      pressed-gradient-to="#0a2848"
      pressed-text-color="#e8f1fc"
      pressed-glow="rgba(18, 55, 100, 0.48)"
      reset-modal-title="重置设伏"
      reset-modal-content="将所有可用牌恢复为未按下，火杀 / 雷杀仍为不可用。是否继续？"
    />
    <CardGridTemplate
      v-else-if="item && isZhangrangTaoluan"
      :title="item.title"
      :item-id="itemId"
      :labels="ZHANGRANG_TAOLUAN_GRID_LABELS"
      :initial-disabled-labels="[]"
      :divider-after-rows="2"
      :press-latch="true"
      hint="点击后将保持为「已按下」，无法再点回；全部恢复请点右上角「重置」。"
      reset-modal-title="重置滔乱"
      reset-modal-content="将所有牌恢复为未标记状态。是否继续？"
    />
    <CardGridTemplate
      v-else-if="item && isShenxunyuDinghan"
      :title="item.title"
      :item-id="itemId"
      :labels="SHENXUNYU_DINGHAN_GRID_LABELS"
      :initial-disabled-labels="[]"
      :divider-after-rows="0"
      :hint="SHENXUNYU_DINGHAN_HINT"
      pressed-gradient-from="#9a7f12"
      pressed-gradient-to="#5c4d08"
      pressed-text-color="#fff9e6"
      pressed-glow="rgba(110, 85, 10, 0.42)"
      reset-modal-title="重置定汉"
      reset-modal-content="将所有可点选牌恢复为未标记。是否继续？"
    />
    <RandomGeneratorTemplate
      v-else-if="item"
      :title="item.title"
      :algorithm="effectiveAlgorithm"
      :option-rows="item.optionRows || []"
      :history-records="historyRecords"
      :fate-sign-enabled="isZhouqunTiansuan"
      v-model:fate-sign-base-index="fateSignBaseIndex"
      :caoying-fujian-enabled="isCaoyingFujian"
      :caoying-n-choices="CAOYING_FUJIAN_N_CHOICES"
      v-model:caoying-picker-idx="caoyingPickerIdx"
      @caoying-player-count-change="onCaoyingPlayerCountChange"
      @draw="onDraw"
      @reset="onReset"
    />
    <view v-else class="loading">正在加载条目...</view>
  </view>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import ShenJiangweiJiufaTianrenTemplate from "@/components/ShenJiangweiJiufaTianrenTemplate.vue";
import ZhangQiyingFaluZhenyiTemplate from "@/components/ZhangQiyingFaluZhenyiTemplate.vue";
import JieZuoCiTemplate from "@/components/JieZuoCiTemplate.vue";
import CardGridTemplate from "@/components/CardGridTemplate.vue";
import RandomGeneratorTemplate from "@/components/RandomGeneratorTemplate.vue";
import {
  SHEFU_GRID_LABELS,
  SHEFU_INIT_DISABLED_LABELS,
} from "@/utils/presetChengyuShefu.js";
import { ZHANGRANG_TAOLUAN_GRID_LABELS } from "@/utils/presetZhangrangTaoluan.js";
import { SHENXUNYU_DINGHAN_GRID_LABELS } from "@/utils/presetShenxunyuDinghan.js";
import {
  buildCaoyingFujianOptions,
  CAOYING_FUJIAN_N_CHOICES,
} from "@/utils/presetCaoyingFujian.js";
import {
  addDrawHistory,
  adjustAdaptiveWeightsAfterPick,
  ALGO_ADAPTIVE,
  ALGO_UNIFORM,
  clearHistoryByItem,
  getItemDetail,
  getRandomAlgorithm,
  getRecentHistory,
  ITEM_TITLE_CAOYING_FUJIAN,
  ITEM_TITLE_CHENGYU_SHEFU,
  ITEM_TITLE_ZHANGRANG_TAOLUAN,
  ITEM_TITLE_SHENXUNYU_DINGHAN,
  ITEM_TITLE_JIEZUOCI_HUASHEN,
  ITEM_TITLE_SHENJIANGWEI_JIEFA_TIANREN,
  ITEM_TITLE_ZHANGQIYING_FALU_ZHENYI,
  ITEM_TITLE_ZHOUQUN_TIANSUAN,
  normalizeWeightsForItem,
  replaceItemOptionsFromTexts,
} from "@/utils/itemStore.js";

/** 神荀彧「定汉」技能说明（标题下提示） */
const SHENXUNYU_DINGHAN_HINT =
  "1.当你成为未被记录的锦囊牌的目标时，你记录此牌名，然后取消之；\n2.回合开始时，你可以在已记录的牌名中增加或移出一种锦囊牌的牌名。";

const item = ref(null);
const itemId = ref(0);
const historyRecords = ref([]);
const algorithm = ref(ALGO_ADAPTIVE);
/** -1：不放命运签；0..n-1：将对应签额外放入一次（仅周群-天算） */
const fateSignBaseIndex = ref(-1);

/** 曹婴：当前生效的总人数（与 picker 同步） */
const caoyingN = ref(3);
const caoyingPickerIdx = ref(0);

const isZhouqunTiansuan = computed(
  () => String(item.value?.title ?? "").trim() === ITEM_TITLE_ZHOUQUN_TIANSUAN,
);

const isCaoyingFujian = computed(
  () => String(item.value?.title ?? "").trim() === ITEM_TITLE_CAOYING_FUJIAN,
);

const isChengyuShefu = computed(
  () => String(item.value?.title ?? "").trim() === ITEM_TITLE_CHENGYU_SHEFU,
);

const isZhangrangTaoluan = computed(
  () => String(item.value?.title ?? "").trim() === ITEM_TITLE_ZHANGRANG_TAOLUAN,
);

const isShenxunyuDinghan = computed(
  () => String(item.value?.title ?? "").trim() === ITEM_TITLE_SHENXUNYU_DINGHAN,
);

const isJieZuoCi = computed(
  () => String(item.value?.title ?? "").trim() === ITEM_TITLE_JIEZUOCI_HUASHEN,
);

const isShenJiangweiJiufa = computed(
  () => String(item.value?.title ?? "").trim() === ITEM_TITLE_SHENJIANGWEI_JIEFA_TIANREN,
);

const isZhangqiyingFaluZhenyi = computed(
  () => String(item.value?.title ?? "").trim() === ITEM_TITLE_ZHANGQIYING_FALU_ZHENYI,
);

/** 周群-天算固定均匀随机，不受设置页全局算法影响 */
const effectiveAlgorithm = computed(() =>
  isZhouqunTiansuan.value ? ALGO_UNIFORM : algorithm.value,
);

watch(
  () => item.value?.title,
  (t) => {
    const title = String(t ?? "").trim();
    if (title !== ITEM_TITLE_ZHOUQUN_TIANSUAN) fateSignBaseIndex.value = -1;
  },
);

function caoyingStorageKey() {
  return `caoying_fujian_player_n_${itemId.value}`;
}

function readStoredCaoyingN() {
  try {
    const raw = uni.getStorageSync(caoyingStorageKey());
    const n = Number(raw);
    if (Number.isFinite(n) && CAOYING_FUJIAN_N_CHOICES.includes(n)) return n;
  } catch {
    /* ignore */
  }
  return null;
}

async function syncCaoyingOptionsIfNeeded(n) {
  const expected = buildCaoyingFujianOptions(n);
  const detail = await getItemDetail(itemId.value);
  const actual = (detail?.optionRows ?? []).map((r) => String(r.text ?? ""));
  if (actual.length !== expected.length) {
    await replaceItemOptionsFromTexts(itemId.value, expected, { clearHistory: false });
    return;
  }
  for (let i = 0; i < expected.length; i += 1) {
    if (actual[i] !== expected[i]) {
      await replaceItemOptionsFromTexts(itemId.value, expected, { clearHistory: false });
      return;
    }
  }
}

async function hydrateCaoyingState() {
  if (String(item.value?.title ?? "").trim() !== ITEM_TITLE_CAOYING_FUJIAN) {
    return;
  }
  const stored = readStoredCaoyingN();
  const n = stored ?? 3;
  caoyingN.value = n;
  const idx = CAOYING_FUJIAN_N_CHOICES.indexOf(n);
  caoyingPickerIdx.value = idx >= 0 ? idx : 0;
  await syncCaoyingOptionsIfNeeded(n);
  item.value = await getItemDetail(itemId.value);
}

async function applyCaoyingN(n, clearHistory) {
  const opts = buildCaoyingFujianOptions(n);
  await replaceItemOptionsFromTexts(itemId.value, opts, { clearHistory });
  try {
    uni.setStorageSync(caoyingStorageKey(), n);
  } catch {
    /* ignore */
  }
  caoyingN.value = n;
  const idx = CAOYING_FUJIAN_N_CHOICES.indexOf(n);
  if (idx >= 0) caoyingPickerIdx.value = idx;
  item.value = await getItemDetail(itemId.value);
  await loadRecentHistory();
}

async function onCaoyingPlayerCountChange(newN) {
  if (!isCaoyingFujian.value) return;
  const n = Number(newN);
  if (!Number.isFinite(n) || n === caoyingN.value) return;
  try {
    await applyCaoyingN(n, true);
    uni.showToast({ title: "已切换人数并重新生成选项", icon: "none" });
  } catch (e) {
    uni.showToast({ title: e?.message || "更新失败", icon: "none" });
  }
}

onLoad(async (query) => {
  itemId.value = Number(query?.itemId) || 0;
  if (!itemId.value) {
    uni.showToast({ title: "条目参数无效", icon: "none" });
    return;
  }
  try {
    algorithm.value = await getRandomAlgorithm();
    item.value = await getItemDetail(itemId.value);
    await hydrateCaoyingState();
    await loadRecentHistory();
    if (!item.value) {
      uni.showToast({ title: "条目不存在", icon: "none" });
    }
  } catch (e) {
    uni.showToast({ title: e.message || "加载失败", icon: "none" });
  }
});

onShow(async () => {
  if (!itemId.value) return;
  try {
    algorithm.value = await getRandomAlgorithm();
    item.value = await getItemDetail(itemId.value);
    await hydrateCaoyingState();
    await loadRecentHistory();
  } catch (e) {
    // 保持当前页
  }
});

async function loadRecentHistory() {
  const rows = await getRecentHistory(itemId.value, 3);
  historyRecords.value = rows.map((row) => row.result_text);
}

async function onDraw({ text, optionId }) {
  try {
    if (effectiveAlgorithm.value === ALGO_ADAPTIVE) {
      await adjustAdaptiveWeightsAfterPick(itemId.value, optionId);
    }
    await addDrawHistory({
      itemId: itemId.value,
      resultText: text,
    });
    item.value = await getItemDetail(itemId.value);
    await loadRecentHistory();
    fateSignBaseIndex.value = -1;
  } catch (e) {
    uni.showToast({ title: e.message || "记录失败", icon: "none" });
  }
}

function onReset() {
  uni.showModal({
    title: "确认重置",
    content: "将清空该条目的历史记录，并将各选项权重恢复为平均。是否继续？",
    success: async (res) => {
      if (!res.confirm) return;
      try {
        await clearHistoryByItem(itemId.value);
        await normalizeWeightsForItem(itemId.value);
        item.value = await getItemDetail(itemId.value);
        await loadRecentHistory();
        fateSignBaseIndex.value = -1;
        uni.showToast({ title: "已重置", icon: "none" });
      } catch (e) {
        uni.showToast({ title: e.message || "重置失败", icon: "none" });
      }
    },
  });
}
</script>

<style scoped lang="scss">
.wrap {
  min-height: 100vh;
}

.loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #777;
  font-size: 28rpx;
}
</style>
