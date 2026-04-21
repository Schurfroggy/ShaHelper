/** 方案 B：封面来源 */
export const COVER_BUILTIN = "builtin";
export const COVER_USER = "user";

/** 内置预设 slug（与 static/presets/<slug>/cover.png 目录名一致；无图时仍为占位路径） */
export const PRESET_SLUG_LIQUE_LANGXI = "lique-langxi";
export const PRESET_SLUG_XURONG_BAOLI = "xurong-baoli";
export const PRESET_SLUG_ZHOUQUN_TIANSUAN = "zhouqun-tiansuan";
export const PRESET_SLUG_CAOYING_FUJIAN = "caoying-fujian";
export const PRESET_SLUG_CHENGYU_SHEFU = "chengyu-shefu";
export const PRESET_SLUG_ZHANGRANG_TAOLUAN = "zhangrang-taoluan";
export const PRESET_SLUG_SHENXUNYU_DINGHAN = "shenxunyu-dinghan";
export const PRESET_SLUG_JIEZUOCI_HUASHEN = "jiezuoci-huashen";
export const PRESET_SLUG_SHENJIANGWEI_JIEFA_TIANREN = "shenjiangwei-jiufa-tianren";
export const PRESET_SLUG_ZHANGQIYING_FALU_ZHENYI = "zhangqiying-falu-zhenyi";

/** 所有预设封面统一像素比例（宽 × 高），用于首页瀑布流占位 */
export const PRESET_COVER_WIDTH = 574;
export const PRESET_COVER_HEIGHT = 761;

/** 打包进 APK 的静态资源路径前缀（对应项目内 static/presets/<slug>/cover.png） */
export function builtinCoverStaticPath(slug) {
  const s = String(slug || "").trim();
  if (!s) return "";
  return `/static/presets/${s}/cover.png`;
}

/**
 * 将数据库行解析为 <image> 可用的 src。
 * 兼容旧字段 image_uri。
 */
export function resolveCoverDisplaySrc(row) {
  const srcType = String(row?.cover_source ?? "").trim();
  const ref = String(row?.cover_ref ?? "").trim();

  if (srcType === COVER_BUILTIN && ref) {
    return builtinCoverStaticPath(ref);
  }
  if (srcType === COVER_USER && ref) {
    return ref;
  }

  const legacy = String(row?.image_uri ?? "").trim();
  if (legacy) return legacy;

  return "";
}
