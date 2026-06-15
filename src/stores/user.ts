/*
 * +----------------------------------------------------------------------
 * | @project   BenXinAdmin
 * | @mission   用户状态 — 登录态/token 持久化/profile/登出（懒登录 ADR-3）
 * | @author    仗键天涯(daxing)
 * | @email     3442535897@qq.com
 * | @date      2026-06-08
 * | @updated   2026-06-14
 * +----------------------------------------------------------------------
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAccess, setTokens, clearTokens } from '@/utils/token'
import { SESSION_EXPIRED_EVENT } from '@/utils/request'
import { getUserProfile, type UserProfile } from '@/api/user'
import { logout as apiLogout, type TokenBundle } from '@/api/auth'

/**
 * 用户 store（懒登录）：token 持久化于 storage（token.ts），本 store 维护响应式登录态 +
 * 精简 userInfo。会话失效经 request 广播 SESSION_EXPIRED_EVENT 同步重置（避免 request 反依赖 store）。
 * ensureLogin 守卫见 utils/login.ts（放那里避免 store ↔ login 循环依赖）。
 */
export const useUserStore = defineStore('user', () => {
  /** 响应式登录态（初始从 storage 恢复，懒登录不校验有效性，由首个受保护请求 401 兜底） */
  const loggedIn = ref(getAccess() !== '')
  /** 精简用户信息（登录态我的页消费） */
  const userInfo = ref<UserProfile | null>(null)

  const isLogin = computed(() => loggedIn.value)

  /** 登录成功：写双令牌 + 置登录态。 */
  function setLogin(tokens: TokenBundle): void {
    setTokens(tokens.access_token, tokens.refresh_token)
    loggedIn.value = true
  }

  /** 拉取当前用户信息（失败静默，返回 null）。 */
  async function fetchProfile(): Promise<UserProfile | null> {
    if (!loggedIn.value) return null
    try {
      userInfo.value = await getUserProfile()
      return userInfo.value
    } catch {
      return null
    }
  }

  /** 仅清本地会话（token + 响应式态）。 */
  function resetLocal(): void {
    clearTokens()
    loggedIn.value = false
    userInfo.value = null
  }

  /** 登出：调后端拉黑/撤白名单（失败也清本地）→ 清本地。 */
  async function logout(): Promise<void> {
    try {
      await apiLogout()
    } catch {
      // 后端登出失败不阻断本地清理
    }
    resetLocal()
  }

  // 会话失效广播（request 在 401001/401004/refresh 失败时触发）→ 同步重置登录态
  uni.$on(SESSION_EXPIRED_EVENT, () => {
    loggedIn.value = false
    userInfo.value = null
  })

  return { isLogin, userInfo, setLogin, fetchProfile, resetLocal, logout }
})
