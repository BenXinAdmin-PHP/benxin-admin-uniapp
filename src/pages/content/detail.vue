<!--
 +----------------------------------------------------------------------
 | @project   BenXinAdmin
 | @mission   内容详情 — 头图 + 正文(rich-text 净化)，浏览量后端 +1（免登录）
 | @author    仗键天涯(daxing)
 | @email     3442535897@qq.com
 | @date      2026-06-14
 | @updated   2026-06-16（C 端演示升级 v2：头图 + design token 排版 + 加载/错误态）
 +----------------------------------------------------------------------
-->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import {
  getContentDetail,
  getContentCategories,
  type ContentDetail,
  type ContentCategory,
} from '@/api/content'
import { resolveMedia, categoryGradient } from '@/utils/resolveMedia'
import { shortDate } from '@/utils/format'

const detail = ref<ContentDetail | null>(null)
const categories = ref<ContentCategory[]>([])
const loading = ref(true)
const failed = ref(false)

// 头图：cover 经 resolveMedia 解析；无封面回退分类色渐变块（与卡片一致，不破图）
const headImage = computed(() => (detail.value ? resolveMedia(detail.value.cover) : ''))
const headGradient = computed(() =>
  categoryGradient(detail.value?.category_id ?? 0),
)
const categoryName = computed(() => {
  const id = detail.value?.category_id
  if (!id) return ''
  return categories.value.find((c) => c.id === id)?.name || ''
})
const dateText = computed(() =>
  shortDate(detail.value?.publish_at || detail.value?.created_at),
)

async function loadCategories() {
  try {
    categories.value = await getContentCategories()
  } catch {
    categories.value = []
  }
}

async function load(id: number) {
  loading.value = true
  failed.value = false
  try {
    detail.value = await getContentDetail(id)
  } catch {
    failed.value = true // request 已统一 toast（含 404 不存在/未发布）
  } finally {
    loading.value = false
  }
}

onLoad((query) => {
  const id = Number((query as { id?: string })?.id || 0)
  loadCategories()
  if (id > 0) load(id)
  else {
    loading.value = false
    failed.value = true
  }
})
</script>

<template>
  <view class="page">
    <!-- 加载骨架 -->
    <view v-if="loading" class="skeleton">
      <view class="sk-head" />
      <view class="sk-line sk-title" />
      <view class="sk-line sk-meta" />
      <view class="sk-line" />
      <view class="sk-line" />
      <view class="sk-line short" />
    </view>

    <!-- 正文 -->
    <view v-else-if="detail" class="article">
      <!-- 头图（封面或分类色渐变回退） -->
      <view class="head">
        <image
          v-if="headImage"
          class="head-img"
          :src="headImage"
          mode="aspectFill"
        />
        <view v-else class="head-fallback" :style="{ background: headGradient }" />
      </view>

      <view class="body">
        <text class="title">{{ detail.title }}</text>
        <view class="meta">
          <text v-if="categoryName" class="pill">{{ categoryName }}</text>
          <text v-if="detail.author" class="meta-item">{{ detail.author }}</text>
          <text v-if="dateText" class="meta-item">{{ dateText }}</text>
          <text class="meta-item">{{ detail.view_count }} 阅读</text>
        </view>

        <!-- 正文：后端已 HtmlPurifier 净化入库，rich-text 不执行脚本，双重防 XSS -->
        <rich-text class="content" :nodes="detail.content" />
      </view>
    </view>

    <!-- 错误态 -->
    <view v-else class="state">
      <view class="state-icon" :style="{ background: headGradient }" />
      <text class="state-text">内容不存在或已下架</text>
      <text class="state-sub">换一篇看看吧</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bx-bg;
}

/* ---- 头图 ---- */
.head {
  width: 100%;
  height: 0;
  padding-bottom: 42%;
  position: relative;
  background: $bx-grad-mid;
}
.head-img,
.head-fallback {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* ---- 正文容器 ---- */
.body {
  margin: -28rpx 0 0;
  position: relative;
  background: $bx-bg;
  border-radius: 28rpx 28rpx 0 0;
  padding: 36rpx $bx-gap-page 48rpx;
}
.title {
  display: block;
  font-size: 42rpx;
  font-weight: 700;
  line-height: 1.45;
  color: $bx-text;
}
.meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16rpx;
  margin: 22rpx 0 32rpx;
}
.pill {
  padding: 2rpx 18rpx;
  font-size: 22rpx;
  line-height: 1.7;
  color: $bx-primary;
  background: $bx-primary-soft;
  border-radius: $bx-radius-pill;
}
.meta-item {
  font-size: 24rpx;
  color: $bx-text-weak;
}
.content {
  font-size: 30rpx;
  line-height: 1.85;
  color: $bx-text-sub;
}

/* ---- 加载骨架 ---- */
.skeleton {
  padding-bottom: 48rpx;
}
.sk-head {
  width: 100%;
  height: 0;
  padding-bottom: 42%;
  background: #e9ecf2;
}
.sk-line {
  height: 28rpx;
  margin: 24rpx $bx-gap-page 0;
  border-radius: 8rpx;
  background: #e9ecf2;
}
.sk-title {
  height: 44rpx;
  width: 70%;
}
.sk-meta {
  width: 45%;
}
.sk-line.short {
  width: 55%;
}

/* ---- 错误态 ---- */
.state {
  padding: 160rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}
.state-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 28rpx;
  opacity: 0.5;
  margin-bottom: 8rpx;
}
.state-text {
  font-size: 28rpx;
  color: $bx-text-sub;
}
.state-sub {
  font-size: 23rpx;
  color: $bx-text-weak;
}
</style>
