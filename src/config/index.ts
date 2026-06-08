/*
 * +----------------------------------------------------------------------
 * | @project   BenXinAdmin
 * | @mission   运行时配置（环境变量读取）
 * | @author    仗键天涯(daxing)
 * | @email     3442535897@qq.com
 * | @date      2026-06-08
 * +----------------------------------------------------------------------
 */

/**
 * 后端接口 baseURL。
 * 优先读取 Vite 环境变量 VITE_API_BASE_URL（见 .env.example）；
 * 未配置时回落到本地后端默认地址（daxing 用 `php think run -p 8801` 起服务）。
 * 注意：走 /api 前缀（C 端业务码风格），不是 /admin。
 */
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8801/api'

/**
 * C 端报文加密（AES-256-CBC）开关，默认关。
 * 按任务书指示再启用，当前阶段仅占位。 // TODO M? 加密开关
 */
export const ENABLE_ENCRYPT: boolean =
  import.meta.env.VITE_ENABLE_ENCRYPT === 'true'
