<!--
 +----------------------------------------------------------------------
 | @project   BenXinAdmin
 | @mission   首页（banner/搜索/文章占位 + ping 联调演示）
 | @author    仗键天涯(daxing)
 | @email     3442535897@qq.com
 | @date      2026-06-08
 +----------------------------------------------------------------------
-->
<script setup lang="ts">
import { ref } from 'vue'
import { ping } from '@/api/common'
import { request } from '@/utils/request'

interface PingResult {
  code?: number
  msg?: string
  request_id?: string
  timestamp?: number
}

const loading = ref(false)
/** 联调结果展示 */
const result = ref<PingResult | null>(null)
/** 错误分支展示文本 */
const errorText = ref('')

/** 正常路径：GET /api/v1/ping，展示 code/msg/request_id */
async function onPing() {
  loading.value = true
  errorText.value = ''
  result.value = null
  try {
    const res = await ping()
    result.value = {
      code: res.code,
      msg: res.msg,
      request_id: res.request_id,
      timestamp: res.timestamp,
    }
  } catch (e) {
    errorText.value = (e as Error).message || '请求失败'
  } finally {
    loading.value = false
  }
}

/** 失败路径：请求不存在的接口，验证拦截器走错误分支并 toast */
async function onPingFail() {
  loading.value = true
  errorText.value = ''
  result.value = null
  try {
    await request({ url: '/v1/__not_exist__', method: 'GET' })
  } catch (e) {
    errorText.value = '已进入错误分支：' + ((e as Error).message || '请求失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <view class="page">
    <view class="header">
      <text class="title">BenXinAdmin</text>
      <text class="subtitle">C 端脚手架 · M0-C</text>
    </view>

    <!-- 首页结构占位：banner / 搜索 / 文章（后续任务书实现）-->
    <view class="placeholder">
      <text class="placeholder-text">banner / 搜索 / 文章（占位）</text>
    </view>

    <!-- ping 联调演示 -->
    <view class="card">
      <text class="card-title">后端联调（GET /api/v1/ping）</text>
      <view class="btn-row">
        <wd-button type="primary" :loading="loading" @click="onPing">
          请求 ping
        </wd-button>
        <wd-button type="error" plain :loading="loading" @click="onPingFail">
          触发失败路径
        </wd-button>
      </view>

      <view v-if="result" class="result">
        <text class="result-line">code: {{ result.code }}</text>
        <text class="result-line">msg: {{ result.msg }}</text>
        <text class="result-line">request_id: {{ result.request_id }}</text>
        <text class="result-line">timestamp: {{ result.timestamp }}</text>
      </view>

      <view v-if="errorText" class="error">
        <text class="error-line">{{ errorText }}</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  padding: 32rpx;
}
.header {
  display: flex;
  flex-direction: column;
  margin-bottom: 24rpx;
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
.placeholder {
  height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f2f3f5;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
}
.placeholder-text {
  color: #aaa;
  font-size: 26rpx;
}
.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}
.card-title {
  font-size: 30rpx;
  font-weight: 500;
}
.btn-row {
  display: flex;
  gap: 24rpx;
  margin: 24rpx 0;
}
.result {
  display: flex;
  flex-direction: column;
  padding: 20rpx;
  background: #f0f9eb;
  border-radius: 12rpx;
}
.result-line {
  font-size: 26rpx;
  line-height: 1.8;
  color: #529b2e;
}
.error {
  padding: 20rpx;
  background: #fef0f0;
  border-radius: 12rpx;
}
.error-line {
  font-size: 26rpx;
  color: #c45656;
}
</style>
