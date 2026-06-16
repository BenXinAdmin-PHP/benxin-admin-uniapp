<!--
 +----------------------------------------------------------------------
 | @project   BenXinAdmin
 | @mission   我的 — 游客态/登录态 + 登出 + 懒登录守卫示例（ADR-3）
 | @author    仗键天涯(daxing)
 | @email     3442535897@qq.com
 | @date      2026-06-08
 | @updated   2026-06-16（C 端演示升级：视觉统一 design token，功能与登录流不变）
 +----------------------------------------------------------------------
-->
<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { ensureLogin } from '@/utils/login'
import { maskMobile } from '@/utils/format'

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

/** 退出登录。 */
async function onLogout() {
  await store.logout()
  toast('已退出登录')
}

/** 懒登录守卫示例：未登录先登录、已登录执行（供上层核心操作复刻 ADR-3）。 */
function onProtectedAction() {
  if (!ensureLogin()) return // 未登录已跳登录页，本次操作中止
  toast('已登录，执行核心操作（示例）')
}

onShow(() => {
  // 登录态进入「我的」时刷新一次用户信息（懒登录：游客态不请求）
  if (store.isLogin && !store.userInfo) store.fetchProfile()
})
</script>

<template>
  <view class="page">
    <!-- 头部：品牌渐变卡（登录态 / 游客态） -->
    <view class="header">
      <view v-if="isLogin" class="hero-user">
        <image
          class="avatar"
          :src="user?.avatar || '/static/logo.png'"
          mode="aspectFill"
        />
        <view class="info">
          <text class="nickname">{{ user?.nickname || '微信用户' }}</text>
          <text class="sub">{{ maskMobile(user?.mobile || '') }} · {{ genderText }}</text>
        </view>
      </view>

      <view v-else class="hero-user" @click="goLogin">
        <image class="avatar" src="/static/logo.png" mode="aspectFill" />
        <view class="info">
          <text class="nickname">点击登录 / 注册</text>
          <text class="sub">登录后体验完整功能</text>
        </view>
        <text class="enter">›</text>
      </view>
    </view>

    <!-- 菜单（占位，具体业务由上层叠加） -->
    <view class="menu">
      <view class="menu-item" @click="onProtectedAction">
        <text class="menu-text">需要登录的示例操作</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item">
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
  padding: $bx-gap-page;
}

/* ---- 头部渐变卡 ---- */
.header {
  border-radius: $bx-radius-card;
  background: $bx-gradient-hero;
  box-shadow: $bx-shadow-card;
  padding: 44rpx 32rpx;
  margin-bottom: 28rpx;
}
.hero-user {
  display: flex;
  align-items: center;
  gap: 24rpx;
}
.avatar {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 2rpx solid rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
}
.info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}
.nickname {
  font-size: 34rpx;
  font-weight: 600;
  color: $bx-text-inverse;
}
.sub {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}
.enter {
  font-size: 40rpx;
  color: rgba(255, 255, 255, 0.7);
}

/* ---- 菜单 ---- */
.menu {
  background: $bx-card;
  border: 1rpx solid $bx-border;
  border-radius: $bx-radius-card;
  box-shadow: $bx-shadow-card;
  overflow: hidden;
  margin-bottom: 48rpx;
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
.menu-arrow {
  font-size: 36rpx;
  color: $bx-text-weak;
}
.logout-wrap {
  padding: 0 8rpx;
}
</style>
