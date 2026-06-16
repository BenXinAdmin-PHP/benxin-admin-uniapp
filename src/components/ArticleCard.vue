<!--
 +----------------------------------------------------------------------
 | @project   BenXinAdmin
 | @mission   文章卡片 — 左缩略图(封面/渐变回退) + 标题/摘要/分类pill/日期（首页精选与文章页复用）
 | @author    仗键天涯(daxing)
 | @email     3442535897@qq.com
 | @date      2026-06-16
 +----------------------------------------------------------------------
-->
<script setup lang="ts">
import { computed } from 'vue'
import type { ContentListItem } from '@/api/content'
import { resolveMedia, categoryGradient } from '@/utils/resolveMedia'
import { shortDate } from '@/utils/format'

const props = defineProps<{
  item: ContentListItem
  /** 分类名（父组件按 category_id 映射；缺省则不显示 pill） */
  categoryName?: string
}>()

const emit = defineEmits<{ (e: 'tap', id: number): void }>()

/** 封面解析：/static 或 http 直接用，其它（空/本地 key）回退渐变块。 */
const cover = computed(() => resolveMedia(props.item.cover))
/** 无封面回退渐变（按 category_id 稳定着色，与品牌色呼应）。 */
const gradient = computed(() => categoryGradient(props.item.category_id))
/** 渐变块上的占位首字（分类名优先，否则标题首字）。 */
const glyph = computed(() => {
  const s = props.categoryName || props.item.title || '·'
  return s.trim().charAt(0)
})
const dateText = computed(() => shortDate(props.item.publish_at || props.item.created_at))
</script>

<template>
  <view class="bx-card" @click="emit('tap', item.id)">
    <view class="thumb">
      <image v-if="cover" class="thumb-img" :src="cover" mode="aspectFill" />
      <view v-else class="thumb-fallback" :style="{ background: gradient }">
        <text class="thumb-glyph">{{ glyph }}</text>
      </view>
    </view>

    <view class="body">
      <view class="title-row">
        <text v-if="item.is_top" class="top">置顶</text>
        <text class="title">{{ item.title }}</text>
      </view>
      <text v-if="item.summary" class="summary">{{ item.summary }}</text>
      <view class="meta">
        <text v-if="categoryName" class="pill">{{ categoryName }}</text>
        <text v-if="dateText" class="date">{{ dateText }}</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.bx-card {
  display: flex;
  gap: 20rpx;
  padding: 20rpx;
  background: $bx-card;
  border: 1rpx solid $bx-border;
  border-radius: $bx-radius-card;
  box-shadow: $bx-shadow-card;
}
.thumb {
  width: 124rpx;
  height: 124rpx;
  flex-shrink: 0;
  border-radius: $bx-radius-thumb;
  overflow: hidden;
}
.thumb-img {
  width: 124rpx;
  height: 124rpx;
  display: block;
}
.thumb-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.thumb-glyph {
  font-size: 48rpx;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.92);
}
.body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.title-row {
  display: flex;
  align-items: flex-start;
}
.top {
  flex-shrink: 0;
  margin: 4rpx 12rpx 0 0;
  padding: 2rpx 10rpx;
  font-size: 20rpx;
  line-height: 1.5;
  color: $bx-text-inverse;
  background: $bx-danger;
  border-radius: 6rpx;
}
.title {
  font-size: 30rpx;
  font-weight: 600;
  line-height: 1.4;
  color: $bx-text;
  /* 最多 2 行省略 */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
.summary {
  font-size: 24rpx;
  line-height: 1.5;
  color: $bx-text-sub;
  /* 1 行省略 */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}
.meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 4rpx;
}
.pill {
  padding: 2rpx 16rpx;
  font-size: 20rpx;
  line-height: 1.6;
  color: $bx-primary;
  background: $bx-primary-soft;
  border-radius: $bx-radius-pill;
}
.date {
  font-size: 22rpx;
  color: $bx-text-weak;
}
</style>
