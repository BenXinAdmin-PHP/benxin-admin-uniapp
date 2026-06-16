<!--
 +----------------------------------------------------------------------
 | @project   BenXinAdmin
 | @mission   首页 — 自定义导航全屏 hero + 介绍 + 视频区 + 精选文章（免登录浏览）
 | @author    仗键天涯(daxing)
 | @email     3442535897@qq.com
 | @date      2026-06-08
 | @updated   2026-06-16（C 端演示升级：门面化重构）
 +----------------------------------------------------------------------
-->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app'
import {
  getContents,
  getContentCategories,
  type ContentListItem,
  type ContentCategory,
} from '@/api/content'
import { HERO_SLIDES, ABOUT, DEMO_VIDEOS } from '@/config/demo'
import ArticleCard from '@/components/ArticleCard.vue'

const slides = HERO_SLIDES
const about = ABOUT
const videos = DEMO_VIDEOS

// 状态栏安全区（自定义导航：hero 让出状态栏 + 小程序胶囊区，文字不被遮挡）
const statusBarHeight = ref(20)
try {
  const info = uni.getWindowInfo ? uni.getWindowInfo() : uni.getSystemInfoSync()
  statusBarHeight.value = info.statusBarHeight || 20
} catch {
  statusBarHeight.value = 20
}
const heroPadTop = computed(() => `${statusBarHeight.value + 28}px`)
const heroHeight = computed(() => `${statusBarHeight.value + 232}px`)

// 精选文章（前 6 篇，置顶优先由后端保证）
const featured = ref<ContentListItem[]>([])
const categories = ref<ContentCategory[]>([])
const loaded = ref(false)

const catMap = computed(() => {
  const m: Record<number, string> = {}
  categories.value.forEach((c) => (m[c.id] = c.name))
  return m
})
function catName(id: number): string | undefined {
  return catMap.value[id]
}

// 视频区：当前正在播放的卡（-1 表示都显示海报）
const activeVideo = ref(-1)

async function loadCategories() {
  try {
    categories.value = await getContentCategories()
  } catch {
    categories.value = []
  }
}

async function loadFeatured() {
  try {
    const res = await getContents({ page: 1, page_size: 6 })
    featured.value = res.list
  } catch {
    // 错误已由 request 统一 toast
  } finally {
    loaded.value = true
  }
}

function goDetail(id: number) {
  uni.navigateTo({ url: `/pages/content/detail?id=${id}` })
}

function goArticles() {
  uni.switchTab({ url: '/pages/article/article' })
}

/** 视频卡点击：无 src 优雅提示；有 src 则播（小程序附域名提示，守 §1 默认态不报错）。 */
function onVideoTap(i: number) {
  const v = videos[i]
  if (!v.src) {
    uni.showToast({ title: '演示视频待配置', icon: 'none' })
    return
  }
  // #ifdef MP-WEIXIN
  uni.showToast({ title: '如无法播放，请在小程序后台配置业务域名', icon: 'none' })
  // #endif
  activeVideo.value = i
}

onLoad(() => {
  loadCategories()
  loadFeatured()
})

onPullDownRefresh(async () => {
  activeVideo.value = -1
  await Promise.all([loadCategories(), loadFeatured()])
  uni.stopPullDownRefresh()
})
</script>

<template>
  <view class="page">
    <!-- 全屏 hero 轮播（自定义导航，渐变延伸至状态栏下） -->
    <swiper
      class="hero"
      :style="{ height: heroHeight }"
      circular
      autoplay
      :interval="4500"
      :duration="600"
      indicator-dots
      indicator-active-color="#ffffff"
      indicator-color="rgba(255,255,255,0.4)"
    >
      <swiper-item v-for="(s, i) in slides" :key="i">
        <view class="hero-slide" :style="{ paddingTop: heroPadTop }">
          <text class="hero-brand">BenXinAdmin</text>
          <text class="hero-title">{{ s.title }}</text>
          <text class="hero-sub">{{ s.subtitle }}</text>
        </view>
      </swiper-item>
    </swiper>

    <!-- 介绍卡 -->
    <view class="section">
      <view class="intro">
        <text class="intro-title">{{ about.title }}</text>
        <text class="intro-body">{{ about.body }}</text>
      </view>
    </view>

    <!-- 视频区（两个视频左右并排） -->
    <view class="section">
      <view class="section-head">
        <text class="section-title">视频演示</text>
      </view>
      <view class="videos">
        <view v-for="(v, i) in videos" :key="i" class="video-card">
          <view class="aspect">
            <template v-if="activeVideo !== i">
              <image
                class="fill"
                :src="v.poster"
                mode="aspectFill"
                @click="onVideoTap(i)"
              />
              <view class="play-btn" @click="onVideoTap(i)">
                <view class="play-triangle" />
              </view>
            </template>
            <!-- #ifdef H5 || MP-WEIXIN -->
            <video
              v-else
              class="fill"
              :src="v.src"
              :poster="v.poster"
              autoplay
              controls
            />
            <!-- #endif -->
          </view>
          <text class="video-title">{{ v.title }}</text>
        </view>
      </view>
    </view>

    <!-- 精选文章 -->
    <view class="section">
      <view class="section-head">
        <text class="section-title">精选文章</text>
        <text class="section-more" @click="goArticles">全部 ›</text>
      </view>

      <view v-if="featured.length" class="list">
        <ArticleCard
          v-for="item in featured"
          :key="item.id"
          :item="item"
          :category-name="catName(item.category_id)"
          @tap="goDetail"
        />
      </view>

      <!-- 空数据态（未播种）：克制提示，不破图，hero/介绍/视频海报仍完整 -->
      <view v-else-if="loaded" class="empty">
        <text class="empty-text">演示内容待发布</text>
        <text class="empty-sub">配置演示数据后，这里将展示精选文章</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bx-bg;
  padding-bottom: 32rpx;
}

/* ---- hero ---- */
.hero {
  width: 100%;
}
.hero-slide {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 0 40rpx 56rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: $bx-gradient-hero;
}
.hero-brand {
  font-size: 26rpx;
  letter-spacing: 2rpx;
  color: rgba(255, 255, 255, 0.78);
  margin-bottom: 18rpx;
}
.hero-title {
  font-size: 48rpx;
  font-weight: 700;
  line-height: 1.3;
  color: $bx-text-inverse;
}
.hero-sub {
  margin-top: 16rpx;
  font-size: 26rpx;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.82);
}

/* ---- 区块通用 ---- */
.section {
  padding: 0 $bx-gap-page;
  margin-top: 28rpx;
}
.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 20rpx;
}
.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $bx-text;
}
.section-more {
  font-size: 24rpx;
  color: $bx-primary;
}

/* ---- 介绍卡 ---- */
.intro {
  padding: 32rpx;
  background: $bx-card;
  border: 1rpx solid $bx-border;
  border-radius: $bx-radius-card;
  box-shadow: $bx-shadow-card;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.intro-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $bx-text;
}
.intro-body {
  font-size: 27rpx;
  line-height: 1.7;
  color: $bx-text-sub;
}

/* ---- 视频区 ---- */
.videos {
  display: flex;
  gap: 20rpx;
}
.video-card {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.aspect {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 */
  border-radius: $bx-radius-thumb;
  overflow: hidden;
  background: $bx-grad-mid;
}
.fill {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 72rpx;
  height: 72rpx;
  margin: -36rpx 0 0 -36rpx;
  border-radius: 50%;
  background: rgba(10, 31, 68, 0.42);
  display: flex;
  align-items: center;
  justify-content: center;
}
.play-triangle {
  width: 0;
  height: 0;
  margin-left: 6rpx;
  border-style: solid;
  border-width: 14rpx 0 14rpx 22rpx;
  border-color: transparent transparent transparent #ffffff;
}
.video-title {
  font-size: 26rpx;
  color: $bx-text-sub;
  text-align: center;
}

/* ---- 列表与空态 ---- */
.list {
  display: flex;
  flex-direction: column;
  gap: $bx-gap-card;
}
.empty {
  padding: 64rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  background: $bx-card;
  border: 1rpx dashed $bx-border;
  border-radius: $bx-radius-card;
}
.empty-text {
  font-size: 28rpx;
  color: $bx-text-sub;
}
.empty-sub {
  font-size: 23rpx;
  color: $bx-text-weak;
}
</style>
