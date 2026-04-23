<script setup>
import { onLaunch } from "@dcloudio/uni-app";
import { initItemStore, seedPresetsIfNeeded } from "./utils/itemStore.js";

/**
 * Android：关闭全屏、同步状态栏样式。
 * manifest 中 statusbar.immersed 须为字符串 "none"（布尔 false 会被忽略，仍可能沉浸式叠在内容上）。
 */
function applyAndroidStatusBarLayout() {
  try {
    if (typeof plus === "undefined" || !plus.navigator) return;
    if (plus.navigator.setFullscreen) {
      plus.navigator.setFullscreen(false);
    }
    if (plus.navigator.setStatusBarBackground) {
      plus.navigator.setStatusBarBackground("#f0f0f0");
    }
    if (plus.navigator.setStatusBarStyle) {
      plus.navigator.setStatusBarStyle("dark");
    }
  } catch (e) {
    console.error(e);
  }
}

function scheduleAndroidStatusBarLayout() {
  applyAndroidStatusBarLayout();
  setTimeout(applyAndroidStatusBarLayout, 80);
  setTimeout(applyAndroidStatusBarLayout, 280);
}

onLaunch(() => {
  initItemStore()
    .then(() => seedPresetsIfNeeded())
    .catch((e) => {
      uni.showToast({ title: e.message || "数据库初始化失败", icon: "none" });
    });
  // #ifdef APP-ANDROID
  if (typeof plus !== "undefined") {
    scheduleAndroidStatusBarLayout();
  } else if (typeof document !== "undefined") {
    document.addEventListener("plusready", scheduleAndroidStatusBarLayout, { once: true });
  }
  // #endif
});
</script>

<style lang="scss">
page {
  height: 100%;
  background-color: #f0f0f0;
}
</style>
