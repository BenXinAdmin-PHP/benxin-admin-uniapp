/*
 * +----------------------------------------------------------------------
 * | @project   BenXinAdmin
 * | @mission   前台内容接口薄壳 — banners / contents / 详情（免登录只读，M5-A）
 * | @author    仗键天涯(daxing)
 * | @email     3442535897@qq.com
 * | @date      2026-06-14
 * +----------------------------------------------------------------------
 */

import { request } from '@/utils/request'

/** 广告位（精简字段，与后端 M5-A 白名单一致） */
export interface Banner {
  id: number
  title: string
  image: string
  link: string
  position: string
  sort: number
}

/** 内容列表项（不含正文 content） */
export interface ContentListItem {
  id: number
  category_id: number
  title: string
  cover: string
  summary: string
  author: string
  source: string
  is_top: number
  view_count: number
  publish_at: string | null
  created_at: string
}

/** 内容详情（含正文 content） */
export interface ContentDetail extends ContentListItem {
  content: string
}

/** 分页结构（业务码风格 A） */
export interface Paginated<T> {
  list: T[]
  total: number
  page: number
  page_size: number
}

/** 广告位列表（按 position 过滤，启用 + 生效区间由后端把关）。 */
export function getBanners(position?: string): Promise<Banner[]> {
  return request<Banner[]>({
    url: '/v1/banners',
    method: 'GET',
    data: position ? { position } : {},
  })
}

/** 内容列表（已发布过滤、列表无正文；空搜索值不入参）。 */
export function getContents(params: {
  page?: number
  page_size?: number
  category_id?: number
  keyword?: string
}): Promise<Paginated<ContentListItem>> {
  const data: Record<string, unknown> = {}
  if (params.page) data.page = params.page
  if (params.page_size) data.page_size = params.page_size
  if (params.category_id) data.category_id = params.category_id
  if (params.keyword && params.keyword.trim()) data.keyword = params.keyword.trim()
  return request<Paginated<ContentListItem>>({
    url: '/v1/contents',
    method: 'GET',
    data,
  })
}

/** 内容详情（含正文，后端命中浏览量原子 +1）。 */
export function getContentDetail(id: number): Promise<ContentDetail> {
  return request<ContentDetail>({ url: `/v1/contents/${id}`, method: 'GET' })
}
