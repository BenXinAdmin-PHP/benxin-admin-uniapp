/*
 * +----------------------------------------------------------------------
 * | @project   BenXinAdmin
 * | @mission   Pinia 实例（全局状态入口）
 * | @author    仗键天涯(daxing)
 * | @email     3442535897@qq.com
 * | @date      2026-06-08
 * +----------------------------------------------------------------------
 */

import { createPinia } from 'pinia'

/** 全局唯一 Pinia 实例，在 main.ts 中 app.use 注册 */
export const pinia = createPinia()

export default pinia
