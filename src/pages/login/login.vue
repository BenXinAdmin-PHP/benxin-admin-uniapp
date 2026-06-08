<!--
 +----------------------------------------------------------------------
 | @project   BenXinAdmin
 | @mission   登录（空壳，登录即注册：微信+手机号，留待 M5）
 | @author    仗键天涯(daxing)
 | @email     3442535897@qq.com
 | @date      2026-06-08
 +----------------------------------------------------------------------
-->
<script setup lang="ts">
// 登录设计：登录即注册，微信 + 手机号缺一不可（懒登录，真实逻辑留待 M5）
</script>

<template>
  <view class="page">
    <view class="header">
      <text class="title">登录</text>
      <text class="subtitle">空壳页 · 登录即注册（微信 + 手机号）留待 M5</text>
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
