/*
 * +----------------------------------------------------------------------
 * | @project   BenXinAdmin
 * | @mission   uni.request 封装 — token 可选携带 / 业务码解包 / 401 单飞续期 / 429 分流
 * | @author    仗键天涯(daxing)
 * | @email     3442535897@qq.com
 * | @date      2026-06-08
 * | @updated   2026-06-14
 * +----------------------------------------------------------------------
 */

import { API_BASE_URL } from '@/config'
import { getAccess, getRefresh, setAccess, clearTokens } from './token'

/** 后端统一返回报文（业务码风格 A） */
export interface ApiResponse<T = unknown> {
  code: number
  msg: string
  data: T
  request_id?: string
  timestamp?: number
}

/** 请求参数（在 uni.request 选项基础上做收敛） */
export interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: Record<string, unknown> | string
  header?: Record<string, string>
  /** 关闭默认错误 toast（由调用方按业务码自行处理，如登录流 150001） */
  hideErrorToast?: boolean
  /** 不携带 token（登录/刷新等匿名接口） */
  noAuth?: boolean
  /** 内部：本请求已因 401 续期重放过一次（防无限重试） */
  _retried?: boolean
}

/** 业务/网络错误统一异常体（code 为业务码或 HTTP 状态） */
export class RequestError extends Error {
  code: number
  constructor(message: string, code: number) {
    super(message)
    this.name = 'RequestError'
    this.code = code
  }
}

/** 后端错误码（与 server ErrorCode 同源，前端分流用） */
export const BIZ = {
  SUCCESS: 0,
  UNAUTHORIZED: 401001, // 未登录/无效 → 清会话
  TOKEN_EXPIRED: 401003, // access 过期 → 单飞 refresh 续期
  REFRESH_INVALID: 401004, // refresh 失效 → 清会话
  TOO_MANY_REQUESTS: 429000, // 限流（注意：HTTP 仍 200，判 body code）
  LOGIN_NEED_MOBILE: 150001, // 新用户需补手机号（登录流接管）
} as const

/** 会话失效事件名：store 监听后重置登录态（避免 request 反向依赖 store） */
export const SESSION_EXPIRED_EVENT = 'bx:session-expired'

function buildUrl(url: string): string {
  return /^https?:\/\//.test(url) ? url : `${API_BASE_URL}${url}`
}

function toastError(message: string): void {
  uni.showToast({ title: message, icon: 'none' })
}

/**
 * 底层请求：发起 uni.request，返回 { statusCode, body }，不做业务分流。
 */
function rawRequest<T = unknown>(
  options: RequestOptions,
): Promise<{ statusCode: number; body: ApiResponse<T> }> {
  const { url, method = 'GET', data, header = {}, noAuth = false } = options

  if (!noAuth) {
    const token = getAccess()
    if (token) header.Authorization = `Bearer ${token}`
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: buildUrl(url),
      method,
      data,
      header: { 'Content-Type': 'application/json', ...header },
      success: (res) => {
        const body = res.data as ApiResponse<T>
        if (!body || typeof body.code !== 'number') {
          reject(new RequestError('返回数据格式异常', -1))
          return
        }
        resolve({ statusCode: res.statusCode, body })
      },
      fail: (err) =>
        reject(new RequestError(err?.errMsg || '网络请求失败', -1)),
    })
  })
}

// ---- 401 单飞续期（复刻 web 侧 M1-D：并发挂起，仅一条刷新，成功后重放）----
let refreshPromise: Promise<boolean> | null = null

async function doRefresh(): Promise<boolean> {
  const refreshToken = getRefresh()
  if (!refreshToken) return false
  try {
    const { body } = await rawRequest<{ access_token: string }>({
      url: '/v1/refresh',
      method: 'POST',
      data: { refresh_token: refreshToken },
      noAuth: true,
    })
    if (body.code === BIZ.SUCCESS && body.data?.access_token) {
      setAccess(body.data.access_token) // refresh 不轮换，仅换 access
      return true
    }
    return false
  } catch {
    return false
  }
}

/** 单飞：刷新进行中其它请求复用同一 Promise，避免并发多次刷新。 */
function ensureRefreshed(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

/** 清会话并广播：token 清除 + 通知 store 重置登录态（懒登录，不在此强制跳转）。 */
function expireSession(): void {
  clearTokens()
  uni.$emit(SESSION_EXPIRED_EVENT)
}

/**
 * 核心请求：业务码解包 + 401 分流 + 429 分流。
 * - code===0 → resolve(data)。
 * - 401003（access 过期）→ 单飞 refresh 续期后重放一次；续期失败 → 清会话 + 抛错。
 * - 401001/401004 → 清会话 + 抛错（页面按场景决定是否跳登录，懒登录浏览页不打扰）。
 * - 429000 → 限流提示（判 body code，HTTP 仍 200，承 M5-B 已知项①）。
 * - 其它非 0 → 抛 RequestError（默认 toast，可 hideErrorToast 交调用方）。
 */
export async function request<T = unknown>(options: RequestOptions): Promise<T> {
  const { body } = await rawRequest<T>(options)
  const code = body.code

  if (code === BIZ.SUCCESS) return body.data

  // access 过期：单飞续期 + 重放一次
  if (code === BIZ.TOKEN_EXPIRED && !options._retried && getRefresh()) {
    const ok = await ensureRefreshed()
    if (ok) return request<T>({ ...options, _retried: true })
    expireSession()
    throw new RequestError('登录已失效，请重新登录', BIZ.REFRESH_INVALID)
  }

  // 未登录 / refresh 失效：清会话
  if (code === BIZ.UNAUTHORIZED || code === BIZ.REFRESH_INVALID) {
    expireSession()
    throw new RequestError(body.msg || '登录已失效，请重新登录', code)
  }

  // 限流：按 body code 命中（不看 HTTP 状态）
  if (code === BIZ.TOO_MANY_REQUESTS) {
    if (!options.hideErrorToast) toastError('操作过于频繁，请稍后再试')
    throw new RequestError(body.msg || '请求过于频繁', code)
  }

  // 其它业务错误
  const err = new RequestError(body.msg || '请求失败', code)
  if (!options.hideErrorToast) toastError(err.message)
  throw err
}

/**
 * 返回完整报文（不解包、不抛错、不 toast），用于 ping 联调等场景。
 */
export function requestRaw<T = unknown>(
  options: RequestOptions,
): Promise<ApiResponse<T>> {
  return rawRequest<T>(options).then((r) => r.body)
}

export default request
