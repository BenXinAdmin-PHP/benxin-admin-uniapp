<!--
 +----------------------------------------------------------------------
 | @project   BenXinAdmin
 | @mission   我的 — Style B(渐变头部+宫格+列表) + 懒登录守卫（ADR-3，登录流不变）
 | @author    仗键天涯(daxing)
 | @email     3442535897@qq.com
 | @date      2026-06-08
 | @updated   2026-06-16（C 端演示升级 v2：Style B 改版 + 灰默认头像 + 四宫格/列表）
 +----------------------------------------------------------------------
-->
<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { ensureLogin } from '@/utils/login'
import { maskMobile } from '@/utils/format'
import { APP_META } from '@/config/demo'

const store = useUserStore()
const isLogin = computed(() => store.isLogin)
const user = computed(() => store.userInfo)

const genderText = computed(() => {
  const g = user.value?.gender ?? 0
  return g === 1 ? '男' : g === 2 ? '女' : '未知'
})

function toast(msg: string) {
  uni.showToast({ title: msg, icon: 'none' })
}

/** 去登录（游客态入口）。 */
function goLogin() {
  uni.navigateTo({ url: '/pages/login/login' })
}

/** 退出登录（清会话，复用 store 登出逻辑，登录流不变）。 */
async function onLogout() {
  await store.logout()
  toast('已退出登录')
}

// ---- 四宫格入口（语义诚实，不造不存在的功能）----

/** 文章：切到文章 tab。 */
function goArticles() {
  uni.switchTab({ url: '/pages/article/article' })
}

/** 关于：弹层展示简介 + 版本 + 协议 + 仓库（确认可复制仓库地址）。 */
function openAbout() {
  uni.showModal({
    title: `关于 ${APP_META.name}`,
    content: `通用管理后台开源底座\n版本 ${APP_META.version} · 开源协议 ${APP_META.license}\n仓库 ${APP_META.repo}`,
    confirmText: '复制仓库',
    cancelText: '关闭',
    success: (res) => {
      if (res.confirm) {
        uni.setClipboardData({ data: APP_META.repo, success: () => toast('仓库地址已复制') })
      }
    },
  })
}

/** 文档：H5 新窗打开仓库；小程序无法直跳外链 → 复制链接提示（条件编译）。 */
function openDocs() {
  // #ifdef H5
  window.open(APP_META.repo, '_blank')
  // #endif
  // #ifndef H5
  uni.setClipboardData({
    data: APP_META.repo,
    success: () => toast('文档链接已复制，请在浏览器打开'),
  })
  // #endif
}

/** 设置：进设置页（演示占位项，不做假持久化）。 */
function goSettings() {
  uni.navigateTo({ url: '/pages/settings/settings' })
}

/** 意见反馈：演示占位，不造功能。 */
function onFeedback() {
  toast('意见反馈为演示占位')
}

onShow(() => {
  // 登录态进入「我的」时刷新一次用户信息（懒登录：游客态不请求）
  if (store.isLogin && !store.userInfo) store.fetchProfile()
})
</script>

<template>
  <view class="page">
    <!-- 渐变头部 -->
    <view class="header">
      <view v-if="isLogin" class="user">
        <view class="avatar-wrap">
          <image
            v-if="user?.avatar"
            class="avatar"
            :src="user.avatar"
            mode="aspectFill"
          />
          <view v-else class="avatar avatar-default">
            <wd-icon name="user" size="56rpx" color="#aab0bb" />
          </view>
        </view>
        <view class="info">
          <text class="nickname">{{ user?.nickname || '微信用户' }}</text>
          <text class="sub">{{ maskMobile(user?.mobile || '') }} · {{ genderText }}</text>
        </view>
      </view>

      <view v-else class="user" @click="goLogin">
        <view class="avatar-wrap">
          <view class="avatar avatar-default">
            <wd-icon name="user" size="56rpx" color="#aab0bb" />
          </view>
        </view>
        <view class="info">
          <text class="nickname">点击登录 / 注册</text>
          <text class="sub">登录后体验完整功能</text>
        </view>
        <text class="enter">›</text>
      </view>
    </view>

    <!-- 四宫格（上移叠在渐变下沿） -->
    <view class="grid">
      <view class="grid-item" @click="goArticles">
        <view class="grid-icon"><wd-icon name="list" size="44rpx" color="#2b6fff" /></view>
        <text class="grid-label">文章</text>
      </view>
      <view class="grid-item" @click="openAbout">
        <view class="grid-icon"><wd-icon name="info-circle" size="44rpx" color="#2b6fff" /></view>
        <text class="grid-label">关于</text>
      </view>
      <view class="grid-item" @click="openDocs">
        <view class="grid-icon"><wd-icon name="file" size="44rpx" color="#2b6fff" /></view>
        <text class="grid-label">文档</text>
      </view>
      <view class="grid-item" @click="goSettings">
        <view class="grid-icon"><wd-icon name="setting" size="44rpx" color="#2b6fff" /></view>
        <text class="grid-label">设置</text>
      </view>
    </view>

    <!-- 列表卡 -->
    <view class="menu">
      <view class="menu-item" @click="openDocs">
        <text class="menu-text">项目文档</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="onFeedback">
        <text class="menu-text">意见反馈</text>
        <view class="menu-right">
          <text class="demo-tag">演示</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>
      <view class="menu-item" @click="openAbout">
        <text class="menu-text">关于 BenXinAdmin</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <view v-if="isLogin" class="logout-wrap">
      <wd-button type="error" plain block @click="onLogout">退出登录</wd-button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bx-bg;
  padding-bottom: 48rpx;
}

/* ---- 渐变头部 ---- */
.header {
  padding: 56rpx 32rpx 72rpx;
  background: linear-gradient(135deg, #0a1f44 0%, #21478f 52%, #2b6fff 100%);
}
.user {
  display: flex;
  align-items: center;
  gap: 24rpx;
}
.avatar-wrap {
  flex-shrink: 0;
}
.avatar {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  border: 3rpx solid rgba(255, 255, 255, 0.6);
}
.avatar-default {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9ebf0;
}
.info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}
.nickname {
  font-size: 36rpx;
  font-weight: 600;
  color: $bx-text-inverse;
}
.sub {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.82);
}
.enter {
  font-size: 40rpx;
  color: rgba(255, 255, 255, 0.7);
}

/* ---- 四宫格 ---- */
.grid {
  margin: -48rpx $bx-gap-page 0;
  display: flex;
  background: $bx-card;
  border: 1rpx solid $bx-border;
  border-radius: $bx-radius-card;
  box-shadow: $bx-shadow-card;
  padding: 32rpx 0;
}
.grid-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14rpx;
}
.grid-icon {
  width: 84rpx;
  height: 84rpx;
  border-radius: 24rpx;
  background: $bx-primary-soft;
  display: flex;
  align-items: center;
  justify-content: center;
}
.grid-label {
  font-size: 25rpx;
  color: $bx-text-sub;
}

/* ---- 列表卡 ---- */
.menu {
  margin: 28rpx $bx-gap-page 0;
  background: $bx-card;
  border: 1rpx solid $bx-border;
  border-radius: $bx-radius-card;
  box-shadow: $bx-shadow-card;
  overflow: hidden;
}
.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 28rpx;
  border-bottom: 1rpx solid $bx-border;
}
.menu-item:last-child {
  border-bottom: none;
}
.menu-text {
  font-size: 28rpx;
  color: $bx-text;
}
.menu-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.demo-tag {
  padding: 2rpx 14rpx;
  font-size: 20rpx;
  line-height: 1.7;
  color: $bx-text-weak;
  background: $bx-bg;
  border: 1rpx solid $bx-border;
  border-radius: $bx-radius-pill;
}
.menu-arrow {
  font-size: 36rpx;
  color: $bx-text-weak;
}
.logout-wrap {
  margin-top: 48rpx;
  padding: 0 $bx-gap-page;
}
</style>
