<!--
 +----------------------------------------------------------------------
 | @project   BenXinAdmin
 | @mission   设置 — 演示占位页（开关不做假持久化，诚实标注，守 §1/诚信底线）
 | @author    仗键天涯(daxing)
 | @email     3442535897@qq.com
 | @date      2026-06-16
 +----------------------------------------------------------------------
-->
<script setup lang="ts">
import { ref } from 'vue'

// 仅本地 UI 态（演示占位）：刻意不写 storage、不调接口——开关刷新即复位，不假装已保存。
const notify = ref(true)
const privacy = ref(false)

function toast(msg: string) {
  uni.showToast({ title: msg, icon: 'none' })
}

/** 清除缓存：演示占位，不造功能。 */
function onClearCache() {
  toast('清除缓存为演示占位')
}
</script>

<template>
  <view class="page">
    <!-- 诚实横幅 -->
    <view class="banner">
      <text class="banner-text">以下为演示占位，开关与操作不会持久化保存</text>
    </view>

    <view class="card">
      <view class="row">
        <view class="row-left">
          <text class="row-text">消息通知</text>
          <text class="demo-tag">演示</text>
        </view>
        <wd-switch v-model="notify" />
      </view>
      <view class="row">
        <view class="row-left">
          <text class="row-text">隐私模式</text>
          <text class="demo-tag">演示</text>
        </view>
        <wd-switch v-model="privacy" />
      </view>
      <view class="row" @click="onClearCache">
        <view class="row-left">
          <text class="row-text">清除缓存</text>
          <text class="demo-tag">演示</text>
        </view>
        <text class="row-arrow">›</text>
      </view>
    </view>

    <text class="foot">演示占位项仅展示界面，正式功能由上层业务按需扩展。</text>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bx-bg;
  padding: $bx-gap-page;
}
.banner {
  padding: 20rpx 24rpx;
  background: $bx-primary-soft;
  border-radius: $bx-radius-thumb;
  margin-bottom: 24rpx;
}
.banner-text {
  font-size: 24rpx;
  color: $bx-primary;
}
.card {
  background: $bx-card;
  border: 1rpx solid $bx-border;
  border-radius: $bx-radius-card;
  box-shadow: $bx-shadow-card;
  overflow: hidden;
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 28rpx;
  border-bottom: 1rpx solid $bx-border;
}
.row:last-child {
  border-bottom: none;
}
.row-left {
  display: flex;
  align-items: center;
  gap: 14rpx;
}
.row-text {
  font-size: 28rpx;
  color: $bx-text;
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
.row-arrow {
  font-size: 36rpx;
  color: $bx-text-weak;
}
.foot {
  display: block;
  margin-top: 28rpx;
  padding: 0 8rpx;
  font-size: 23rpx;
  line-height: 1.6;
  color: $bx-text-weak;
}
</style>
