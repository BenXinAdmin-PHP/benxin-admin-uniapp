# CLAUDE.md · benxin-admin-uniapp（C 端）

> 本文件是 Claude Code 在本仓库的执行铁律。完整背景见后端仓库 `docs/ARCHITECTURE.md`（架构基线与约定），冲突时以基线文档为准；本文件冲突处先停下来问 daxing。

## 你的职责边界
- 你负责：编码、构建自测（微信小程序 + H5）、Git 提交与双推、回填可复制 Markdown 完成报告。
- 你不负责：架构决策（由 PM/架构师任务书给出）。任务书未覆盖处先问。**真机/小程序的最终测试由 daxing 做**。
- 全程中文。

## 项目命名（唯一权威拼写）
- 代码、文档、注释、`manifest.json` 名称、README 一律用 **`BenXinAdmin`**。
- ⚠️ **仓库名是例外**：Gitee `binxin`、GitHub `benxin`，两边不一致。只有 `git remote` 地址按实际值。

## 技术栈（锁定）
- uni-app + Vue3 + **TypeScript** + Vite。
- UI 用 **wot-design-uni**（MIT，TS 优先）。
- Pinia + 封装 `uni.request`（业务码拦截）。
- **一套代码同时输出微信小程序 + H5**（H5 主要跑在公众号环境内）。

## 关键约束
- **懒登录**：用到核心业务前所有页面（含「我的」页）都不强制登录。
- 登录设计：登录即注册，**微信 + 手机号缺一不可**。
- 小程序端兼容性：注意不支持部分 ES 特性、不能用 DOM API，写法须兼容小程序端。

## 页面（按任务书逐步实现）
`index`（首页：banner / 搜索 / 文章）、`mine`（我的）、`login`（登录）。首页结构初期固定，后台拖拽搭建延后。

## 对接后端 API（业务码风格 A）
- C 端接口前缀 `/api/v1/...`；统一返回 `{ code, msg, data, ... }`，`code=0` 成功；请求封装做业务码拦截。
- C 端报文加密（AES-256-CBC）为**可配置开关，默认关**，按任务书指示再启用。

## 文件注释头（每个新建/修改文件强制）
```ts
/*
 * +----------------------------------------------------------------------
 * | @project   BenXinAdmin
 * | @mission   <中文模块名>
 * | @author    仗键天涯(daxing)
 * | @email     3442535897@qq.com
 * | @date      <创建时间>
 * | @updated   <修改时间，仅修改时追加>
 * +----------------------------------------------------------------------
 */
```

## 资源合规
- 只用开源可商用字体/图标/图片。禁用商用字库与来源不明素材。

## 安全
- 任何密钥/appid secret 不得硬编码或入库；敏感配置走后端下发或 `.env.example` 占位，`.env*` 入 `.gitignore`。

## Git 双推（Gitee 主、GitHub 镜像）
首次初始化（仓库根目录执行一次）：
```bash
git init
git branch -M main
git remote add origin https://gitee.com/binxin-admin/binxin-admin-uniapp.git
git remote set-url --add --push origin https://gitee.com/binxin-admin/binxin-admin-uniapp.git
git remote set-url --add --push origin https://github.com/BenXinAdmin-PHP/benxin-admin-uniapp.git
git checkout -b dev
```
日常提交 + 双推：
```bash
git add -A
git commit -m "feat: xxx"   # Conventional Commits
git push origin dev         # 同时推 Gitee 与 GitHub
```
验证：`git remote -v` 中 origin 有两个 push 地址。

## 完成任务后
回填任务书的「完成报告」模板（可复制 Markdown），记录实际版本号、双端构建结果、偏差与待 daxing 确认项。
