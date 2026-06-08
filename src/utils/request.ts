/*
 * +----------------------------------------------------------------------
 * | @project   BenXinAdmin
 * | @mission   uni.request 封装（业务码拦截器）
 * | @author    仗键天涯(daxing)
 * | @email     3442535897@qq.com
 * | @date      2026-06-08
 * +----------------------------------------------------------------------
 */

import { API_BASE_URL } from '@/config'

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
  /** 关闭默认的错误 toast（由调用方自行处理错误） */
  hideErrorToast?: boolean
}

/** 业务/网络错误统一异常体 */
export class RequestError extends Error {
  code: number
  constructor(message: string, code: number) {
    super(message)
    this.name = 'RequestError'
    this.code = code
  }
}

/**
 * 获取登录 token。
 * 当前阶段恒为空，登录后写入逻辑留待 M1 实现。
 */
function getToken(): string {
  // TODO M1: 从 Pinia / Storage 读取真实 token
  return ''
}

/**
 * 处理 HTTP 401（未授权）。
 * 当前仅占位，真实跳转登录 / 刷新 token 逻辑留待 M1。
 */
function handleUnauthorized(): void {
  // TODO M1: 清理登录态并跳转 login（懒登录下按需触发）
  console.warn('[request] 收到 HTTP 401，登录态处理待 M1 实现')
}

/**
 * 核心请求方法：基于 uni.request 封装，统一做业务码判定。
 * - HTTP 200 且 code===0 视为成功，resolve(data)。
 * - code!==0 抛 RequestError 并默认 toast 提示。
 * - HTTP 401 走未授权钩子；其他 HTTP 错误统一抛错。
 */
export function request<T = unknown>(options: RequestOptions): Promise<T> {
  const { url, method = 'GET', data, header = {}, hideErrorToast = false } = options

  // token 注入占位
  const token = getToken()
  if (token) {
    header.Authorization = `Bearer ${token}` // TODO M1: 确认后端鉴权头格式
  }

  const fullUrl = /^https?:\/\//.test(url) ? url : `${API_BASE_URL}${url}`

  return new Promise<T>((resolve, reject) => {
    uni.request({
      url: fullUrl,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header,
      },
      success: (res) => {
        const statusCode = res.statusCode

        // HTTP 401：未授权钩子占位
        if (statusCode === 401) {
          handleUnauthorized()
          const err = new RequestError('登录已失效，请重新登录', 401)
          if (!hideErrorToast) toastError(err.message)
          reject(err)
          return
        }

        // 其他 HTTP 非 2xx
        if (statusCode < 200 || statusCode >= 300) {
          const err = new RequestError(`网络异常（HTTP ${statusCode}）`, statusCode)
          if (!hideErrorToast) toastError(err.message)
          reject(err)
          return
        }

        // 业务码判定
        const body = res.data as ApiResponse<T>
        if (!body || typeof body.code !== 'number') {
          const err = new RequestError('返回数据格式异常', -1)
          if (!hideErrorToast) toastError(err.message)
          reject(err)
          return
        }

        if (body.code === 0) {
          resolve(body.data)
        } else {
          const err = new RequestError(body.msg || '请求失败', body.code)
          if (!hideErrorToast) toastError(err.message)
          reject(err)
        }
      },
      fail: (err) => {
        const e = new RequestError(err?.errMsg || '网络请求失败', -1)
        if (!hideErrorToast) toastError(e.message)
        reject(e)
      },
    })
  })
}

/** 统一错误轻提示 */
function toastError(message: string): void {
  uni.showToast({ title: message, icon: 'none' })
}

/**
 * 返回完整报文（含 code/msg/request_id 等），用于联调展示等场景。
 * 与 request() 区别：不解包 data，业务码非 0 仍 resolve 完整 body（不抛错、不 toast）。
 */
export function requestRaw<T = unknown>(
  options: RequestOptions,
): Promise<ApiResponse<T>> {
  const { url, method = 'GET', data, header = {} } = options
  const fullUrl = /^https?:\/\//.test(url) ? url : `${API_BASE_URL}${url}`
  return new Promise<ApiResponse<T>>((resolve, reject) => {
    uni.request({
      url: fullUrl,
      method,
      data,
      header: { 'Content-Type': 'application/json', ...header },
      success: (res) => resolve(res.data as ApiResponse<T>),
      fail: (err) => reject(new RequestError(err?.errMsg || '网络请求失败', -1)),
    })
  })
}

export default request
