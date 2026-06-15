/*
 * +----------------------------------------------------------------------
 * | @project   BenXinAdmin
 * | @mission   通用接口（联调 ping）
 * | @author    仗键天涯(daxing)
 * | @email     3442535897@qq.com
 * | @date      2026-06-08
 * +----------------------------------------------------------------------
 */

import { requestRaw, type ApiResponse } from '@/utils/request'

/** ping 接口返回的 data 结构（按后端实际可再补充） */
export interface PingData {
  [key: string]: unknown
}

/**
 * 联调用 ping：GET /api/v1/ping。
 * 返回完整报文（含 code/msg/request_id），供首页展示联调结果。
 */
export function ping(): Promise<ApiResponse<PingData>> {
  return requestRaw<PingData>({ url: '/v1/ping', method: 'GET' })
}
