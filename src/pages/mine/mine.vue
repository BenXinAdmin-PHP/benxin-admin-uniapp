<!--
 +----------------------------------------------------------------------
 | @project   BenXinAdmin
 | @mission   我的（空壳，懒登录不强制登录）
 | @author    仗键天涯(daxing)
 | @email     3442535897@qq.com
 | @date      2026-06-08
 +----------------------------------------------------------------------
-->
<script setup lang="ts">
// 懒登录（ADR-3）：本页不强制登录，登录/用户信息逻辑留待 M1/M5
function goLogin() {
  uni.navigateTo({ url: '/pages/login/login' })
}
</script>

<template>
  <view class="page">
    <view class="header">
      <text class="title">我的</text>
      <text class="subtitle">空壳页 · 不强制登录</text>
    </view>
    <view class="actions">
      <wd-button type="primary" plain @click="goLogin">去登录（占位）</wd-button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  padding: 48rpx 32rpx;
}
.header {
  display: flex;
  flex-direction: column;
  margin-bottom: 48rpx;
}
.title {
  font-size: 44rpx;
  font-weight: 600;
}
.subtitle {
  margin-top: 8rpx;
  font-size: 26rpx;
  color: #888;
}
</style>
