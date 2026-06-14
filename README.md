# BenXinAdmin · C 端（benxin-admin-uniapp）

> [BenXinAdmin](https://gitee.com/binxin-admin/binxin-admin-server) 通用管理后台底座的 **C 端**（uni-app + Vue3 + TS + Vite），**一套代码输出微信小程序 + H5**（H5 主要跑在公众号环境内）。开源协议：**Apache-2.0**。

## 特性

- **懒登录**（ADR-3）：用到核心业务前所有页面（含「我的」）不强制登录；登录即注册，**微信 + 手机号缺一不可**。
- **双端登录流**：小程序 `wx.login` + `getPhoneNumber`（新版免 session_key）；H5 公众号 oauth（`snsapi_base` 静默）+ 短信验证码，非微信环境降级提示。
- **请求层**：封装 `uni.request`——token 可选携带、业务码解包、**401 单飞 refresh 静默续期**、429 按 body code 分流。

<!-- 截图占位：首页 / 内容详情 / 登录 / 我的 -->

## 技术栈

| 组件 | 选型 |
|---|---|
| 框架 | uni-app + Vue 3 + TypeScript + Vite |
| UI | wot-design-uni（MIT，TS 优先） |
| 状态/请求 | Pinia + 封装 `uni.request` |
| 产物 | 微信小程序 + H5 双端 |

## 快速开始

```bash
npm install
cp .env.example .env.development   # 按需改 VITE_API_BASE_URL（默认 http://127.0.0.1:8801/api）

npm run dev:h5          # H5（或 npm run build:h5）
npm run dev:mp-weixin   # 微信小程序（产物用微信开发者工具打开；或 npm run build:mp-weixin）
npm run type-check      # vue-tsc 类型检查
```

> 也可用 HBuilderX 打开本目录运行/发行（项目惯例）。后端先起（`php think run -p 8801`）。

## 配置说明

- **接口地址**：`.env.*` 的 `VITE_API_BASE_URL`（默认 `http://127.0.0.1:8801/api`），`.env*` 不入库。
- **微信小程序 appid**：`src/manifest.json` 的 `mp-weixin.appid` 仓库内**留空**，由开发者本地自填真实 appid，**请勿提交真实 appid 入库**。建议本地执行 `git update-index --skip-worktree src/manifest.json` 让 git 忽略本地填值，防误提交。
- **C 端报文加密**（AES-256-CBC）默认关（`VITE_ENABLE_ENCRYPT=false`），按需开启。

## 许可证

[Apache-2.0](LICENSE)。完整文档见[后端主仓](https://gitee.com/binxin-admin/binxin-admin-server) `docs/ARCHITECTURE.md`。
