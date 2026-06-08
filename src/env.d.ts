/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

/** BenXinAdmin 自定义环境变量（见 .env.example） */
interface ImportMetaEnv {
  /** 后端接口 baseURL，走 /api 前缀 */
  readonly VITE_API_BASE_URL?: string
  /** C 端报文加密开关（'true' 启用），默认关 */
  readonly VITE_ENABLE_ENCRYPT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
