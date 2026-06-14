# BenXinAdmin · C 端（benxin-admin-uniapp）

> 本心通用管理后台底座 —— C 端（uni-app + Vue3 + TS + Vite），**一套代码输出微信小程序 + H5**（H5 主要跑在公众号环境内）。
>
> 架构基线与全部约定见后端仓库 [`docs/ARCHITECTURE.md`](https://gitee.com/binxin-admin/binxin-admin-server)。开源协议：**Apache-2.0**。

## 技术栈（锁定）

| 组件 | 选型 |
|---|---|
| 框架 | uni-app + Vue 3 + TypeScript + Vite |
| UI | wot-design-uni（MIT，TS 优先） |
| 状态/请求 | Pinia + 封装 `uni.request`（业务码拦截 + 401 单飞续期） |
| 产物 | 微信小程序 + H5 双端 |

## 快速开始

```bash
npm install
cp .env.example .env.development   # 按需改 VITE_API_BASE_URL（默认指向后端 8801）

# H5
npm run dev:h5         # 或 npm run build:h5
# 微信小程序
npm run dev:mp-weixin  # 或 npm run build:mp-weixin（产物用微信开发者工具打开）
npm run type-check     # vue-tsc 类型检查
```

> 也可用 HBuilderX 打开本目录运行/发行（项目惯例）。

## 配置说明

- **接口地址**：`.env.*` 的 `VITE_API_BASE_URL`（默认 `http://127.0.0.1:8801/api`），`.env*` 不入库。
- **微信小程序 appid**：`src/manifest.json` 的 `mp-weixin.appid` 仓库内留空，**由开发者在本地/开发者工具自填真实 appid，请勿提交真实 appid 入库**。
- **C 端报文加密**（AES-256-CBC）默认关（`VITE_ENABLE_ENCRYPT=false`），按需开启。

## 懒登录

用到核心业务前所有页面（含「我的」）不强制登录；登录即注册，微信 + 手机号缺一不可。小程序走 `wx.login` + `getPhoneNumber`，H5 走公众号 oauth + 短信验证码。

## 许可证

[Apache-2.0](LICENSE)。完整项目文档建设中。
