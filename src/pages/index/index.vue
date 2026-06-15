<!--
 +----------------------------------------------------------------------
 | @project   BenXinAdmin
 | @mission   首页 — banners 轮播 + 内容列表（免登录浏览，分页/下拉/触底）
 | @author    仗键天涯(daxing)
 | @email     3442535897@qq.com
 | @date      2026-06-08
 | @updated   2026-06-14
 +----------------------------------------------------------------------
-->
<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import {
  getBanners,
  getContents,
  type Banner,
  type ContentListItem,
} from '@/api/content'

const banners = ref<Banner[]>([])
const list = ref<ContentListItem[]>([])
const page = ref(1)
const pageSize = 10
const total = ref(0)
const loading = ref(false)
const finished = ref(false)

async function loadBanners() {
  try {
    banners.value = await getBanners('home_top')
  } catch {
    banners.value = []
  }
}

/** 加载内容列表；reset=true 重置到第一页（下拉刷新/首次）。 */
async function loadContents(reset = false) {
  if (loading.value) return
  if (reset) {
    page.value = 1
    finished.value = false
  }
  if (finished.value) return
  loading.value = true
  try {
    const res = await getContents({ page: page.value, page_size: pageSize })
    total.value = res.total
    list.value = reset ? res.list : list.value.concat(res.list)
    if (list.value.length >= res.total || res.list.length === 0) {
      finished.value = true
    } else {
      page.value++
    }
  } catch {
    // 错误已由 request 统一 toast
  } finally {
    loading.value = false
  }
}

function goDetail(id: number) {
  uni.navigateTo({ url: `/pages/content/detail?id=${id}` })
}

function onBannerTap(b: Banner) {
  if (b.link && /^https?:\/\//.test(b.link)) {
    // #ifdef H5
    window.location.href = b.link
    // #endif
  }
}

onLoad(() => {
  loadBanners()
  loadContents(true)
})

onPullDownRefresh(async () => {
  await Promise.all([loadBanners(), loadContents(true)])
  uni.stopPullDownRefresh()
})

onReachBottom(() => {
  loadContents(false)
})
</script>

<template>
  <view class="page">
    <!-- 轮播 -->
    <swiper
      v-if="banners.length"
      class="banner"
      circular
      autoplay
      :interval="4000"
      indicator-dots
      indicator-active-color="#4d80f0"
    >
      <swiper-item v-for="b in banners" :key="b.id" @click="onBannerTap(b)">
        <image class="banner-img" :src="b.image" mode="aspectFill" />
      </swiper-item>
    </swiper>

    <!-- 内容列表 -->
    <view class="list">
      <view
        v-for="item in list"
        :key="item.id"
        class="card"
        @click="goDetail(item.id)"
      >
        <image
          v-if="item.cover"
          class="cover"
          :src="item.cover"
          mode="aspectFill"
        />
        <view class="card-body">
          <view class="card-title-row">
            <text v-if="item.is_top" class="top-tag">置顶</text>
            <text class="card-title">{{ item.title }}</text>
          </view>
          <text v-if="item.summary" class="card-summary">{{ item.summary }}</text>
          <view class="card-meta">
            <text v-if="item.author" class="meta">{{ item.author }}</text>
            <text class="meta">{{ item.publish_at || item.created_at }}</text>
            <text class="meta">{{ item.view_count }} 阅读</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 状态 -->
    <view class="state">
      <text v-if="loading" class="state-text">加载中…</text>
      <text v-else-if="finished && list.length" class="state-text">没有更多了</text>
      <text v-else-if="!list.length && !loading" class="state-text">暂无内容</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  padding: 24rpx;
}
.banner {
  width: 100%;
  height: 300rpx;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
}
.banner-img {
  width: 100%;
  height: 300rpx;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
.card {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  padding: 20rpx;
  gap: 20rpx;
}
.cover {
  width: 200rpx;
  height: 150rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
  background: #f2f3f5;
}
.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}
.card-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.top-tag {
  font-size: 20rpx;
  color: #fff;
  background: #fa5151;
  border-radius: 6rpx;
  padding: 2rpx 10rpx;
  flex-shrink: 0;
}
.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #2c405a;
  line-height: 1.4;
}
.card-summary {
  font-size: 24rpx;
  color: #8a94a6;
  margin: 8rpx 0;
}
.card-meta {
  display: flex;
  gap: 20rpx;
}
.meta {
  font-size: 22rpx;
  color: #b0b6c0;
}
.state {
  text-align: center;
  padding: 32rpx 0;
}
.state-text {
  font-size: 24rpx;
  color: #b0b6c0;
}
</style>
