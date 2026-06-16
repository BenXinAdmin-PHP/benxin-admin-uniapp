/*
 * +----------------------------------------------------------------------
 * | @project   BenXinAdmin
 * | @mission   C 端演示门面常量 — hero 文案 / 介绍 / 演示视频（均可改）
 * | @author    仗键天涯(daxing)
 * | @email     3442535897@qq.com
 * | @date      2026-06-16
 * +----------------------------------------------------------------------
 *
 * 门面演示用硬编码文案/视频常量（守底座铁律 §1：默认占位、纯本地可跑）。
 * 文案配置化（bx_config）记后续增强，本阶段 C 端硬编码即可，下方均可直接改。
 */

/** 首页 hero 轮播文案（可改）。每张 = 渐变背景 + 标题 + 副标题。 */
export const HERO_SLIDES: { title: string; subtitle: string }[] = [
  {
    title: '本心通用管理后台底座',
    subtitle: 'PHP8 + Vue3 + uni-app，一套代码三端通吃',
  },
  {
    title: '代码生成器护城河',
    subtitle: 'bx:make 一条命令复刻 CRUD / 树形 / 授权链路三类范式',
  },
  {
    title: '开箱即用·安全合规',
    subtitle: '八项安全基线贯穿全程，纯本地零配置即可跑通',
  },
]

/** 首页「关于」介绍卡文案（可改）。 */
export const ABOUT = {
  title: '关于 BenXinAdmin',
  body:
    'BenXinAdmin 是一套开箱即用的通用管理后台开源底座（Apache-2.0）。后端 ThinkPHP8 多应用，' +
    '后台 Vue3 + Element Plus，C 端 uni-app 一码出微信小程序与 H5。代码生成器复刻三类范式、' +
    '数据权限横切贯穿、安全基线作为每个模块的验收硬指标——让你把精力留给真正的业务。',
}

/**
 * 演示视频：默认占位（空 src）。daxing 填自有录屏 / CC0 短视频 URL 后可播。
 * H5 直接 inline 播；小程序需在「小程序后台 → 开发管理 → 业务域名」加该 URL 域名。
 * 海报随 uniapp 仓打包（/static/demo/*.jpg），即便 src 为空也始终渲染，保证默认态门面完整。
 */
export const DEMO_VIDEOS: { title: string; poster: string; src: string }[] = [
  { title: '功能速览', poster: '/static/demo/video-1.jpg', src: '' },
  { title: '代码生成器演示', poster: '/static/demo/video-2.jpg', src: '' },
]

/**
 * 应用元信息（「我的」关于弹层 / 文档入口用，可改）。
 * 版本号随发布手动更新；仓库地址用 Gitee 主仓（GitHub 镜像见 README）。
 */
export const APP_META = {
  name: 'BenXinAdmin',
  version: 'v0.2.1',
  license: 'Apache-2.0',
  repo: 'https://gitee.com/binxin-admin/binxin-admin-server',
}
