/*
 * +----------------------------------------------------------------------
 * | @project   BenXinAdmin
 * | @mission   令牌存取（uni.setStorageSync，小程序/H5 通用）
 * | @author    仗键天涯(daxing)
 * | @email     3442535897@qq.com
 * | @date      2026-06-14
 * +----------------------------------------------------------------------
 */

/**
 * C 端 api guard 双令牌本地持久化（M5-A：access 短期 / refresh 长期）。
 * 底层 uni.setStorageSync/getStorageSync，小程序沙箱 / H5 localStorage 两端通用。
 * 安全已知项：H5 端 storage ≈ localStorage，有 XSS 读取风险（与 web 侧 M1-D 同口径）；
 * 小程序 storage 相对沙箱安全。C 端无服务端会话，本阶段不引入 httpOnly 方案。
 */

const ACCESS_KEY = 'bx_access_token'
const REFRESH_KEY = 'bx_refresh_token'

export function getAccess(): string {
  return uni.getStorageSync(ACCESS_KEY) || ''
}

export function getRefresh(): string {
  return uni.getStorageSync(REFRESH_KEY) || ''
}

/** 登录成功：写入双令牌。 */
export function setTokens(access: string, refresh: string): void {
  uni.setStorageSync(ACCESS_KEY, access)
  uni.setStorageSync(REFRESH_KEY, refresh)
}

/** 静默续期：仅更新 access（refresh 不轮换，复刻后端 M5-A）。 */
export function setAccess(access: string): void {
  uni.setStorageSync(ACCESS_KEY, access)
}

/** 清会话：清除双令牌（登出 / refresh 失效）。 */
export function clearTokens(): void {
  uni.removeStorageSync(ACCESS_KEY)
  uni.removeStorageSync(REFRESH_KEY)
}

export function hasToken(): boolean {
  return getAccess() !== ''
}
