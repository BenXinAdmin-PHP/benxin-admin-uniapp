<!--
 +----------------------------------------------------------------------
 | @project   BenXinAdmin
 | @mission   登录页 — 双端登录流（小程序 getPhoneNumber / H5 oauth+短信）
 | @author    仗键天涯(daxing)
 | @email     3442535897@qq.com
 | @date      2026-06-08
 | @updated   2026-06-14
 +----------------------------------------------------------------------
-->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  loginMiniSilent,
  loginMiniWithPhone,
  isWechatEnv,
  startH5OAuth,
  loginH5WithCode,
  loginH5WithMobile,
} from '@/utils/login'
import { sendSmsCode } from '@/api/auth'
import { RequestError } from '@/utils/request'

/** UI 模式：idle 初始 / mp-need-phone 小程序待补手机号 / h5-need-mobile H5 待补手机号+验证码 */
const mode = ref<'idle' | 'mp-need-phone' | 'h5-need-mobile'>('idle')
const loading = ref(false)
/** H5：非微信环境降级提示 */
const notWechat = ref(false)

// 补手机号表单（H5）
const mobile = ref('')
const smsCode = ref('')
const countdown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

function toast(msg: string) {
  uni.showToast({ title: msg, icon: 'none' })
}

/** 登录完成后返回来源页（无栈则回我的页）。 */
function goAfterLogin() {
  toast('登录成功')
  setTimeout(() => {
    const pages = getCurrentPages()
    if (pages.length > 1) uni.navigateBack()
    else uni.switchTab({ url: '/pages/mine/mine' })
  }, 600)
}

// ------------------------------------------------------------------
// 小程序登录
// ------------------------------------------------------------------
// #ifdef MP-WEIXIN
async function onMpLogin() {
  loading.value = true
  try {
    const r = await loginMiniSilent()
    if (r === 'ok') goAfterLogin()
    else mode.value = 'mp-need-phone' // 150001：展示 getPhoneNumber 按钮
  } catch (e) {
    toast((e as Error).message || '登录失败')
  } finally {
    loading.value = false
  }
}

/** getPhoneNumber 原生按钮回调：e.detail.code 为新版手机号 code。 */
async function onGetPhone(e: { detail: { code?: string; errMsg?: string } }) {
  if (!e.detail.code || !/ok/.test(e.detail.errMsg || '')) {
    toast('需授权手机号才能完成登录')
    return
  }
  loading.value = true
  try {
    await loginMiniWithPhone(e.detail.code)
    goAfterLogin()
  } catch (err) {
    toast((err as Error).message || '登录失败')
  } finally {
    loading.value = false
  }
}
// #endif

// ------------------------------------------------------------------
// H5 公众号登录
// ------------------------------------------------------------------
// #ifdef H5
/** 从 location.search 解析 oauth 回调 code/state，并清理 URL（防残留/重放）。 */
function readOAuthCallback(): { code: string; state: string } | null {
  const sp = new URLSearchParams(window.location.search)
  const code = sp.get('code') || ''
  const state = sp.get('state') || ''
  if (!code) return null
  // 清理 URL 上的 code/state（保留其余 query 与 hash）
  sp.delete('code')
  sp.delete('state')
  const rest = sp.toString()
  const cleaned =
    window.location.pathname + (rest ? `?${rest}` : '') + window.location.hash
  window.history.replaceState({}, document.title, cleaned)
  return { code, state }
}

async function startOAuth() {
  loading.value = true
  try {
    // 回调地址 = 当前登录页完整 URL（hash 模式下微信可能丢弃 # 片段，详见完成报告已知项）
    await startH5OAuth(window.location.href)
  } catch (e) {
    toast((e as Error).message || '发起微信授权失败')
    loading.value = false
  }
}

async function handleCallback(code: string, state: string) {
  loading.value = true
  try {
    const r = await loginH5WithCode(code, state)
    if (r === 'ok') goAfterLogin()
    else mode.value = 'h5-need-mobile' // 150001：展示手机号+验证码表单
  } catch (e) {
    toast((e as Error).message || '登录失败')
  } finally {
    loading.value = false
  }
}
// #endif

// ------------------------------------------------------------------
// 补手机号（H5）：发码（60s 倒计时）+ 提交
// ------------------------------------------------------------------
function startCountdown() {
  countdown.value = 60
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0 && timer) {
      clearInterval(timer)
      timer = null
    }
  }, 1000)
}

async function onSendCode() {
  if (!/^1[3-9]\d{9}$/.test(mobile.value)) {
    toast('请输入正确的手机号')
    return
  }
  if (countdown.value > 0) return
  try {
    await sendSmsCode(mobile.value)
    toast('验证码已发送')
    startCountdown()
  } catch (e) {
    toast(e instanceof RequestError ? e.message : '发送失败')
  }
}

async function onSubmitMobile() {
  if (!/^1[3-9]\d{9}$/.test(mobile.value)) return toast('请输入正确的手机号')
  if (!/^\d{4,8}$/.test(smsCode.value)) return toast('请输入验证码')
  loading.value = true
  try {
    // #ifdef H5
    await loginH5WithMobile(mobile.value, smsCode.value)
    goAfterLogin()
    // #endif
  } catch (e) {
    toast((e as Error).message || '登录失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // #ifdef H5
  if (!isWechatEnv()) {
    notWechat.value = true
    return
  }
  const cb = readOAuthCallback()
  if (cb) handleCallback(cb.code, cb.state)
  // #endif
})
</script>

<template>
  <view class="page">
    <view class="brand">
      <text class="brand-title">BenXinAdmin</text>
      <text class="brand-sub">登录即注册 · 微信 + 手机号</text>
    </view>

    <!-- #ifdef MP-WEIXIN -->
    <view class="panel">
      <template v-if="mode === 'idle'">
        <wd-button type="primary" block :loading="loading" @click="onMpLogin">
          微信一键登录
        </wd-button>
      </template>
      <template v-else>
        <text class="tip">首次登录需授权手机号</text>
        <!-- 原生 button 承载 open-type=getPhoneNumber（wd-button 不支持开放能力） -->
        <button
          class="phone-btn"
          open-type="getPhoneNumber"
          :loading="loading"
          @getphonenumber="onGetPhone"
        >
          手机号快捷登录
        </button>
      </template>
    </view>
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <view class="panel">
      <view v-if="notWechat" class="downgrade">
        <text class="downgrade-text">请在微信客户端内打开本页面完成登录</text>
      </view>
      <template v-else-if="mode === 'h5-need-mobile'">
        <text class="tip">首次登录请绑定手机号</text>
        <wd-input
          v-model="mobile"
          type="number"
          placeholder="请输入手机号"
          :maxlength="11"
          custom-class="field"
        />
        <view class="sms-row">
          <wd-input
            v-model="smsCode"
            type="number"
            placeholder="验证码"
            :maxlength="8"
            custom-class="field sms-field"
          />
          <wd-button
            size="small"
            :disabled="countdown > 0"
            custom-class="sms-btn"
            @click="onSendCode"
          >
            {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
          </wd-button>
        </view>
        <wd-button type="primary" block :loading="loading" @click="onSubmitMobile">
          登录
        </wd-button>
      </template>
      <template v-else>
        <wd-button type="primary" block :loading="loading" @click="startOAuth">
          微信授权登录
        </wd-button>
      </template>
    </view>
    <!-- #endif -->

    <view class="footer">
      <text class="footer-text">登录即代表同意用户协议与隐私政策</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 120rpx 48rpx 48rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 96rpx;
}
.brand-title {
  font-size: 52rpx;
  font-weight: 600;
  color: #2c405a;
}
.brand-sub {
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #9aa4b2;
}
.panel {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
}
.tip {
  font-size: 26rpx;
  color: #888;
  text-align: center;
}
.phone-btn {
  background: #4d80f0;
  color: #fff;
  font-size: 30rpx;
  border-radius: 16rpx;
  line-height: 88rpx;
  height: 88rpx;
}
.phone-btn::after {
  border: none;
}
.field {
  margin-bottom: 8rpx;
}
.sms-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.sms-field {
  flex: 1;
}
.downgrade {
  padding: 48rpx 24rpx;
  background: #fff7e6;
  border-radius: 16rpx;
}
.downgrade-text {
  font-size: 28rpx;
  color: #d48806;
  text-align: center;
  display: block;
}
.footer {
  margin-top: auto;
  text-align: center;
}
.footer-text {
  font-size: 22rpx;
  color: #c0c4cc;
}
</style>
