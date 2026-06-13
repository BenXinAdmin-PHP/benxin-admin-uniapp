/*
 * +----------------------------------------------------------------------
 * | @project   BenXinAdmin
 * | @mission   C 端用户接口薄壳 — 当前用户信息（M5-C）
 * | @author    仗键天涯(daxing)
 * | @email     3442535897@qq.com
 * | @date      2026-06-14
 * +----------------------------------------------------------------------
 */

import { request } from '@/utils/request'

/** 当前用户精简信息（后端不外露 openid/unionid/tenant_id） */
export interface UserProfile {
  id: number
  nickname: string
  avatar: string
  gender: number
  mobile: string
  last_login_at: string | null
}

/** 当前登录用户信息。GET /api/v1/user/profile（需登录）。 */
export function getUserProfile(): Promise<UserProfile> {
  return request<UserProfile>({ url: '/v1/user/profile', method: 'GET' })
}
