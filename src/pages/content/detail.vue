<!--
 +----------------------------------------------------------------------
 | @project   BenXinAdmin
 | @mission   内容详情 — 正文渲染（rich-text）+ 浏览量后端 +1（免登录）
 | @author    仗键天涯(daxing)
 | @email     3442535897@qq.com
 | @date      2026-06-14
 +----------------------------------------------------------------------
-->
<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getContentDetail, type ContentDetail } from '@/api/content'

const detail = ref<ContentDetail | null>(null)
const loading = ref(true)

async function load(id: number) {
  loading.value = true
  try {
    detail.value = await getContentDetail(id)
  } catch {
    // request 已统一 toast（含 404 不存在/未发布）
  } finally {
    loading.value = false
  }
}

onLoad((query) => {
  const id = Number((query as { id?: string })?.id || 0)
  if (id > 0) load(id)
  else loading.value = false
})
</script>

<template>
  <view class="page">
    <view v-if="loading" class="state">
      <text class="state-text">加载中…</text>
    </view>

    <view v-else-if="detail" class="article">
      <text class="title">{{ detail.title }}</text>
      <view class="meta">
        <text v-if="detail.author" class="meta-item">{{ detail.author }}</text>
        <text v-if="detail.source" class="meta-item">{{ detail.source }}</text>
        <text class="meta-item">{{ detail.publish_at || detail.created_at }}</text>
        <text class="meta-item">{{ detail.view_count }} 阅读</text>
      </view>
      <!-- 正文：后端已 HtmlPurifier 净化入库，rich-text 不执行脚本，双重防 XSS -->
      <rich-text class="content" :nodes="detail.content"></rich-text>
    </view>

    <view v-else class="state">
      <text class="state-text">内容不存在或已下架</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  padding: 32rpx;
}
.title {
  font-size: 40rpx;
  font-weight: 600;
  color: #2c405a;
  line-height: 1.5;
  display: block;
}
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin: 20rpx 0 32rpx;
}
.meta-item {
  font-size: 24rpx;
  color: #b0b6c0;
}
.content {
  font-size: 30rpx;
  line-height: 1.8;
  color: #3f536e;
}
.state {
  padding: 120rpx 0;
  text-align: center;
}
.state-text {
  font-size: 26rpx;
  color: #b0b6c0;
}
</style>
