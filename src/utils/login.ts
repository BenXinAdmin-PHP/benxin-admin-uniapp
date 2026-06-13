/*
 * +----------------------------------------------------------------------
 * | @project   BenXinAdmin
 * | @mission   登录编排 — 双端登录流 + 懒登录守卫（条件编译 MP/H5）
 * | @author    仗键天涯(daxing)
 * | @email     3442535897@qq.com
 * | @date      2026-06-14
 * +----------------------------------------------------------------------
 */

import { useUserStore } from '@/stores/user'
import { loginMini, loginH5, getOauthUrl, type TokenBundle } from '@/api/auth'
import { BIZ, RequestError } from '@/utils/request'

/** H5 oauth state 暂存键（回调比对，防 CSRF） */
const H5_STATE_KEY = 'bx_oauth_state'
/** H5 150001 时暂存同轮 oauth code，供补手机号复用 */
const H5_OAUTH_CODE_KEY = 'bx_h5_oauth_code'

/**
 * 懒登录守卫（ADR-3）：已登录放行；未登录跳登录页并返回 false，调用方据此中止本次核心操作。
 * 放在 login.ts 而非 store，避免 store ↔ login 循环依赖（store 不感知具体登录流）。
 */
export function ensureLogin(): boolean {
  const store = useUserStore()
  if (store.isLogin) return true
  uni.navigateTo({ url: '/pages/login/login' })
  return false
}

/** 登录成功统一收尾：写 token + 置登录态 + 拉 profile。 */
async function onLoginSuccess(tokens: TokenBundle): Promise<void> {
  const store = useUserStore()
  store.setLogin(tokens)
  await store.fetchProfile()
}

// ------------------------------------------------------------------
// 小程序（MP-WEIXIN）
// ------------------------------------------------------------------

/** uni.login 拿一次性 code。 */
function wxLoginCode(): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: (res) =>
        res.code ? resolve(res.code) : reject(new Error('微信登录失败：未返回 code')),
      fail: () => reject(new Error('微信登录失败，请重试')),
    })
  })
}

/**
 * 小程序静默登录：wx.login → /login/mini。
 * 返回 'ok'（老用户已登录）| 'need-phone'（150001，需 getPhoneNumber 补手机号）。
 */
export async function loginMiniSilent(): Promise<'ok' | 'need-phone'> {
  const code = await wxLoginCode()
  try {
    const tokens = await loginMini({ code })
    await onLoginSuccess(tokens)
    return 'ok'
  } catch (e) {
    if (e instanceof RequestError && e.code === BIZ.LOGIN_NEED_MOBILE) return 'need-phone'
    throw e
  }
}

/**
 * 小程序手机号登录：getPhoneNumber 回调拿 phoneCode → 重新 uni.login 拿新 code（旧 code 可能已消费）
 * → /login/mini { code, phone_code } 注册并登录。
 */
export async function loginMiniWithPhone(phoneCode: string): Promise<void> {
  const code = await wxLoginCode()
  const tokens = await loginMini({ code, phone_code: phoneCode })
  await onLoginSuccess(tokens)
}

// ------------------------------------------------------------------
// H5 公众号
// ------------------------------------------------------------------

/** 是否微信内置浏览器（D5：非微信环境降级提示，不进 oauth）。 */
export function isWechatEnv(): boolean {
  let wechat = false
  // #ifdef H5
  wechat = /MicroMessenger/i.test(navigator.userAgent)
  // #endif
  return wechat
}

/**
 * H5 发起静默 oauth：取授权 URL（snsapi_base）→ 暂存 state → location.href 跳微信授权。
 * @param redirectUri 回调地址（当前登录页完整 URL，后端负责 urlencode）
 */
export async function startH5OAuth(redirectUri: string): Promise<void> {
  const { url, state } = await getOauthUrl(redirectUri)
  uni.setStorageSync(H5_STATE_KEY, state)
  // #ifdef H5
  window.location.href = url
  // #endif
}

/**
 * H5 回调：校验 state → /login/h5 { code }。
 * 返回 'ok'（老用户）| 'need-mobile'（150001，需手机号 + 短信验证码）。
 */
export async function loginH5WithCode(
  code: string,
  state: string,
): Promise<'ok' | 'need-mobile'> {
  const saved = uni.getStorageSync(H5_STATE_KEY)
  if (!saved || saved !== state) {
    throw new Error('登录校验失败（state 不一致），请重试')
  }
  uni.removeStorageSync(H5_STATE_KEY)
  try {
    const tokens = await loginH5({ code })
    await onLoginSuccess(tokens)
    return 'ok'
  } catch (e) {
    if (e instanceof RequestError && e.code === BIZ.LOGIN_NEED_MOBILE) {
      uni.setStorageSync(H5_OAUTH_CODE_KEY, code) // 暂存同轮 code 供补手机号
      return 'need-mobile'
    }
    throw e
  }
}

/**
 * H5 新用户补手机号：用同轮 oauth code + mobile + sms_code → /login/h5 注册并登录。
 */
export async function loginH5WithMobile(mobile: string, smsCode: string): Promise<void> {
  const code = uni.getStorageSync(H5_OAUTH_CODE_KEY)
  if (!code) throw new Error('授权已过期，请重新进入页面')
  const tokens = await loginH5({ code, mobile, sms_code: smsCode })
  uni.removeStorageSync(H5_OAUTH_CODE_KEY)
  await onLoginSuccess(tokens)
}
