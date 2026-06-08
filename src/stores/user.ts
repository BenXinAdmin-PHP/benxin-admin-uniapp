/*
 * +----------------------------------------------------------------------
 * | @project   BenXinAdmin
 * | @mission   用户状态（懒登录占位）
 * | @author    仗键天涯(daxing)
 * | @email     3442535897@qq.com
 * | @date      2026-06-08
 * +----------------------------------------------------------------------
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 用户 store 占位。
 * 懒登录（ADR-3）：默认未登录，所有页面不强制登录；
 * 真实登录态、token 持久化、微信+手机号登录逻辑留待 M1/M5 实现。
 */
export const useUserStore = defineStore('user', () => {
  /** 登录 token，当前为空 */
  const token = ref('')

  /** 是否已登录（懒登录下默认 false） */
  const isLogin = ref(false)

  // TODO M1: setToken / logout / 从 Storage 恢复登录态

  return { token, isLogin }
})
