<template>
  <view class="page">
    <view class="section">
      <text class="label">条目标题</text>
      <input v-model="title" class="input" placeholder="例如：李傕-狼袭" maxlength="40" />
    </view>

    <view class="section">
      <text class="label">封面图片</text>
      <view class="cover-picker" @click="chooseCover">
        <image v-if="imageUri" :src="imageUri" class="cover" mode="aspectFill" />
        <view v-else class="cover placeholder">点击选择本地图片</view>
      </view>
    </view>

    <view class="section">
      <view class="row-between">
        <text class="label">随机选项</text>
        <text class="add-btn" @click="addOption">+ 添加</text>
      </view>
      <view v-for="(option, idx) in options" :key="idx" class="option-row">
        <input
          v-model="options[idx]"
          class="input option-input"
          :placeholder="`选项 ${idx + 1}`"
          maxlength="60"
        />
        <text class="del-btn" @click="removeOption(idx)">删除</text>
      </view>
    </view>

    <button class="save-btn" :disabled="saving" @click="saveItem">
      {{ saving ? "保存中..." : "保存条目" }}
    </button>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { COVER_USER } from "@/utils/coverResolve.js";
import { createItem } from "@/utils/itemStore.js";

const title = ref("");
const imageUri = ref("");
const options = ref([""]);
const saving = ref(false);

function addOption() {
  options.value.push("");
}

function removeOption(idx) {
  if (options.value.length <= 1) {
    uni.showToast({ title: "至少保留一个随机项", icon: "none" });
    return;
  }
  options.value.splice(idx, 1);
}

function chooseCover() {
  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"],
    sourceType: ["album"],
    success: (res) => {
      const path = res?.tempFilePaths?.[0];
      if (path) imageUri.value = path;
    },
  });
}

async function persistCoverPath(tempPath) {
  const p = String(tempPath || "").trim();
  if (!p) return "";
  try {
    const saved = await new Promise((resolve, reject) => {
      uni.saveFile({
        tempFilePath: p,
        success: (res) => resolve(res.savedFilePath || ""),
        fail: (err) => reject(err),
      });
    });
    return saved || p;
  } catch {
    return p;
  }
}

function getImageSize(src) {
  const s = String(src || "").trim();
  if (!s) return Promise.resolve({ width: 0, height: 0 });
  return new Promise((resolve) => {
    uni.getImageInfo({
      src: s,
      success: (res) => {
        resolve({
          width: Number(res.width) || 0,
          height: Number(res.height) || 0,
        });
      },
      fail: () => resolve({ width: 0, height: 0 }),
    });
  });
}

async function saveItem() {
  const t = title.value.trim();
  const opts = options.value.map((s) => s.trim()).filter(Boolean);
  if (!t) {
    uni.showToast({ title: "请填写标题", icon: "none" });
    return;
  }
  if (!opts.length) {
    uni.showToast({ title: "请至少填写一个随机项", icon: "none" });
    return;
  }
  saving.value = true;
  try {
    const coverPath = await persistCoverPath(imageUri.value);
    let coverWidth = 0;
    let coverHeight = 0;
    if (coverPath) {
      const dim = await getImageSize(coverPath);
      coverWidth = dim.width;
      coverHeight = dim.height;
    }
    await createItem({
      title: t,
      coverSource: coverPath ? COVER_USER : "",
      coverRef: coverPath,
      coverWidth,
      coverHeight,
      options: opts,
      isPreset: 0,
    });
    uni.showToast({ title: "保存成功", icon: "success" });
    title.value = "";
    imageUri.value = "";
    options.value = [""];
    setTimeout(() => {
      uni.switchTab({ url: "/pages/home/index" });
    }, 350);
  } catch (e) {
    uni.showToast({ title: e.message || "保存失败", icon: "none" });
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  box-sizing: border-box;
  background: #f4f4f4;
  padding-left: 24rpx;
  padding-right: 24rpx;
  padding-bottom: 140rpx;
  padding-top: calc(constant(safe-area-inset-top) + 56rpx);
  padding-top: calc(env(safe-area-inset-top) + 56rpx);
}

.section {
  background: #fff;
  border-radius: 16rpx;
  padding: 22rpx;
  margin-bottom: 18rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.input {
  height: 84rpx;
  border-radius: 12rpx;
  background: #f7f7f7;
  padding: 0 20rpx;
  font-size: 30rpx;
}

.cover-picker {
  border-radius: 12rpx;
  overflow: hidden;
}

.cover {
  width: 100%;
  height: 280rpx;
  background: #fff;
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 28rpx;
  border: 1rpx dashed #d8d8d8;
}

.row-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.add-btn {
  color: #1a1a1a;
  font-size: 26rpx;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 12rpx;
}

.option-input {
  flex: 1;
}

.del-btn {
  color: #c94444;
  font-size: 26rpx;
  padding: 8rpx 10rpx;
}

.save-btn {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: calc(env(safe-area-inset-bottom) + 20rpx);
  height: 88rpx;
  border: 0;
  border-radius: 999rpx;
  background: #111;
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
}

.save-btn[disabled] {
  opacity: 0.6;
}
</style>
