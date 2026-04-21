<script setup>
import { onLaunch } from "@dcloudio/uni-app";
import { initItemStore, seedPresetsIfNeeded } from "./utils/itemStore.js";

function enterAndroidFullscreen() {
  try {
    plus.navigator.setFullscreen(true);
  } catch (e) {
    console.error(e);
  }
}

onLaunch(() => {
  initItemStore()
    .then(() => seedPresetsIfNeeded())
    .catch((e) => {
      uni.showToast({ title: e.message || "数据库初始化失败", icon: "none" });
    });
  // Android：隐藏系统状态栏（时间、电量等），应用内容区占满屏幕
  // #ifdef APP-ANDROID
  if (typeof plus !== "undefined") {
    enterAndroidFullscreen();
  } else if (typeof document !== "undefined") {
    document.addEventListener("plusready", enterAndroidFullscreen, { once: true });
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
