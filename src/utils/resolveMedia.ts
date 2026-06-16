/*
 * +----------------------------------------------------------------------
 * | @project   BenXinAdmin
 * | @mission   媒体解析 — 封面/海报路径解析 + 无封面分类色渐变回退（守 §1/§10）
 * | @author    仗键天涯(daxing)
 * | @email     3442535897@qq.com
 * | @date      2026-06-16
 * +----------------------------------------------------------------------
 */

/**
 * 封面/海报解析约定（甲口径）：
 *  - `/static/` 开头 → 本仓静态资源，直接用（演示封面/海报随 uniapp 打包）；
 *  - `http(s)://` 绝对 URL → 直接用（云公网 / 未来公开路由）；
 *  - 其它（本地存储 key / 空）→ 返回空串，调用方回退分类色渐变块，绝不破图。
 * 本端不碰后台上传文件的鉴权取流（那是 daxing 的真实云联调，本次不做）。
 */
export function resolveMedia(val?: string | null): string {
  const v = (val || '').trim()
  if (!v) return ''
  if (v.startsWith('/static/')) return v
  if (/^https?:\/\//.test(v)) return v
  return ''
}

/**
 * 分类色渐变板（与 design token 品牌色呼应）：给无封面文章一个体面的缩略图回退。
 * 6 组渐变，按分类 id / 名称 hash 稳定映射（同分类恒定同色）。
 */
const CATEGORY_GRADIENTS: string[] = [
  'linear-gradient(135deg, #1c3f86 0%, #2b6fff 100%)', // 品牌蓝
  'linear-gradient(135deg, #0a1f44 0%, #1c3f86 100%)', // 深海蓝
  'linear-gradient(135deg, #2b6fff 0%, #5aa0ff 100%)', // 亮蓝
  'linear-gradient(135deg, #3a3f8c 0%, #6f74d6 100%)', // 蓝紫
  'linear-gradient(135deg, #0e7490 0%, #22b8cf 100%)', // 青蓝
  'linear-gradient(135deg, #334155 0%, #64748b 100%)', // 商务灰蓝
]

/** 稳定 hash（数字直接取模；字符串按码点累加），用于分类→渐变的恒定映射。 */
function seedIndex(seed: number | string | null | undefined): number {
  if (typeof seed === 'number' && Number.isFinite(seed)) {
    return Math.abs(seed) % CATEGORY_GRADIENTS.length
  }
  const s = String(seed ?? '')
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h + s.charCodeAt(i)) % CATEGORY_GRADIENTS.length
  return h
}

/** 取分类色渐变 CSS（无封面回退块 background 用）。 */
export function categoryGradient(seed: number | string | null | undefined): string {
  return CATEGORY_GRADIENTS[seedIndex(seed)]
}
