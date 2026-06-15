/*
 * +----------------------------------------------------------------------
 * | @project   BenXinAdmin
 * | @mission   认证接口薄壳 — 登录(双端)/刷新/登出/oauth-url/短信验证码
 * | @author    仗键天涯(daxing)
 * | @email     3442535897@qq.com
 * | @date      2026-06-14
 * +----------------------------------------------------------------------
 */

import { request } from '@/utils/request'

/** 登录成功令牌（与后端 BxJwt::issueForApi 一致） */
export interface TokenBundle {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  refresh_expires_in: number
}

/**
 * 小程序登录。POST /api/v1/login/mini
 * 老用户仅传 code 静默登录；新用户带 phone_code（getPhoneNumber 回调）注册。
 * hideErrorToast：150001（需补手机号）等业务码由登录流接管，不弹通用 toast。
 */
export function loginMini(payload: {
  code: string
  phone_code?: string
}): Promise<TokenBundle> {
  return request<TokenBundle>({
    url: '/v1/login/mini',
    method: 'POST',
    data: payload,
    noAuth: true,
    hideErrorToast: true,
  })
}

/**
 * H5 公众号登录。POST /api/v1/login/h5
 * 老用户仅传 code 静默登录；新用户带 mobile + sms_code 注册。
 */
export function loginH5(payload: {
  code: string
  mobile?: string
  sms_code?: string
}): Promise<TokenBundle> {
  return request<TokenBundle>({
    url: '/v1/login/h5',
    method: 'POST',
    data: payload,
    noAuth: true,
    hideErrorToast: true,
  })
}

/**
 * H5 网页授权跳转 URL。GET /api/v1/login/wechat/oauth-url
 * 返回 { url, state }，前端 location.href 跳转微信授权，回调时比对 state（防 CSRF）。
 */
export function getOauthUrl(
  redirectUri: string,
  scope = 'snsapi_base',
  state = '',
): Promise<{ url: string; state: string }> {
  return request({
    url: '/v1/login/wechat/oauth-url',
    method: 'GET',
    data: { redirect_uri: redirectUri, scope, state },
    noAuth: true,
  })
}

/**
 * 发送登录短信验证码。POST /api/v1/sms/code（接口级 1/m，前端配 60s 倒计时）。
 * hideErrorToast：频繁/限流文案由登录流按 code 处理。
 */
export function sendSmsCode(mobile: string): Promise<{ mobile: string }> {
  return request({
    url: '/v1/sms/code',
    method: 'POST',
    data: { mobile, scene: 'login' },
    noAuth: true,
    hideErrorToast: true,
  })
}

/** 登出。POST /api/v1/logout（拉黑 access + 撤 refresh 白名单，需登录）。 */
export function logout(): Promise<null> {
  return request<null>({ url: '/v1/logout', method: 'POST' })
}
