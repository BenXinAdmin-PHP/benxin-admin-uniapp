/*
 * +----------------------------------------------------------------------
 * | @project   BenXinAdmin
 * | @mission   应用入口（注册 Pinia）
 * | @author    仗键天涯(daxing)
 * | @email     3442535897@qq.com
 * | @date      2026-06-08
 * +----------------------------------------------------------------------
 */

import { createSSRApp } from 'vue'
import App from './App.vue'
import { pinia } from './stores'

export function createApp() {
  const app = createSSRApp(App)
  app.use(pinia)
  return {
    app,
  }
}
