/*
 * +----------------------------------------------------------------------
 * | @project   BenXinAdmin
 * | @mission   展示格式化工具 — 手机号脱敏等
 * | @author    仗键天涯(daxing)
 * | @email     3442535897@qq.com
 * | @date      2026-06-14
 * +----------------------------------------------------------------------
 */

/** 手机号脱敏：11 位 → 前 3 + **** + 后 4；其它原样返回。 */
export function maskMobile(mobile: string): string {
  const m = (mobile || '').trim()
  if (/^\d{11}$/.test(m)) {
    return `${m.slice(0, 3)}****${m.slice(-4)}`
  }
  return m
}
