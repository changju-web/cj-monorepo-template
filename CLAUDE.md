<!-- OPENSPEC:START -->

# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:

- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:

- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是基于 **vue-pure-admin** 精简版的企业级前端管理系统脚手架，采用 **Monorepo 架构**，适用于构建大型管理后台应用。

- **版本**: 6.2.0
- **架构**: Monorepo（pnpm workspace）
- **技术栈**: Vue 3 + TypeScript + Vite + Element Plus + Pinia
- **包管理器**: **必须使用 pnpm**（项目配置了 preinstall 钩子强制使用）
- **Node 版本要求**: ^20.19.0 || >=22.13.0

### 目录结构

```
.
├── apps/                  # 所有应用
│   └── web/               # 网页端应用
│       ├── src/           # 源代码
│       ├── build/         # 构建配置
│       ├── types/         # 类型定义
│       ├── mock/          # Mock 数据
│       ├── index.html     # 入口文件
│       ├── vite.config.ts # Vite 配置
│       ├── tsconfig.json  # TypeScript 配置
│       └── package.json   # 应用依赖
├── packages/              # 共享包（预留）
├── pnpm-workspace.yaml    # Workspace 配置
└── package.json           # 根配置（开发脚本）
```

## 常用开发命令

### 开发与构建

```bash
pnpm dev              # 启动开发服务器
pnpm build            # 生产环境构建
pnpm build:staging    # 预发布环境构建
pnpm preview          # 预览构建产物
pnpm report           # 构建并生成包分析报告
```

### 代码质量检查

```bash
pnpm typecheck        # TypeScript 类型检查
pnpm lint:eslint      # ESLint 检查并修复
pnpm lint:prettier    # Prettier 格式化
pnpm lint:stylelint   # Stylelint 样式检查
pnpm lint             # 运行所有检查
```

### 缓存清理

```bash
pnpm clean:cache      # 清理所有缓存和 node_modules
```

## 核心架构

### 路由系统

- **静态路由**: 位于 `apps/web/src/router/modules/` 目录下，使用 Vite 的 `import.meta.glob` 自动导入
- **动态路由**: 通过后端接口返回，在 `apps/web/src/router/utils.ts` 的 `initRouter()` 中处理
- **路由扁平化**: 三级及以上路由会被拍平为二级路由（`formatTwoStageRoutes`）
- **路由白名单**: 配置在 `apps/web/src/router/index.ts`，默认包含 `/login`

**重要**: 新增静态路由时，只需在 `apps/web/src/router/modules/` 目录下创建 `.ts` 文件并导出路由配置，无需手动引入。

### 状态管理 (Pinia)

状态模块位于 `apps/web/src/store/modules/`：

- **app.ts**: 应用全局状态（侧边栏、设备类型）
- **user.ts**: 用户认证和权限信息
- **permission.ts**: 动态路由权限控制
- **multiTags.ts**: 多标签页管理
- **settings.ts**: 系统设置
- **epTheme.ts**: Element Plus 主题配置

### 组件体系

#### 组件命名规范

- 公共组件使用 `Re` 前缀（如 ReAuth、ReIcon、RePerms）
- 布局组件使用 `lay-` 前缀（如 lay-navbar、lay-sidebar）

#### 组件目录结构

```
apps/web/src/
├── components/           # 公共组件
│   ├── ReAuth           # 权限控制组件
│   ├── ReIcon           # 图标组件（支持 Iconify）
│   └── RePerms          # 权限指令组件
├── layout/              # 布局组件
│   ├── lay-navbar       # 顶部导航栏
│   ├── lay-sidebar      # 侧边栏（支持垂直/水平/混合模式）
│   ├── lay-tag          # 多标签页
│   └── lay-content      # 内容区域
└── views/               # 页面组件
```

### 自定义指令

位于 `apps/web/src/directives/` 目录：

- **auth**: 权限控制（`v-auth`）
- **copy**: 复制文本（`v-copy`）
- **longpress**: 长按事件（`v-longpress`）
- **optimize**: 优化长列表渲染（`v-optimize`）
- **perms**: 权限指令（`v-perms`）
- **ripple**: 点击波纹效果（`v-ripple`）

### API 层

- API 接口定义在 `apps/web/src/api/` 目录
- 使用 Axios 进行请求封装
- 请求拦截器位于 `apps/web/src/utils/http/index.ts`

## 路径别名

```typescript
@/*        → src/*
@build/*   → build/*
```

## 构建配置要点

### 环境变量

- `VITE_CDN`: 是否启用 CDN 模式
- `VITE_PORT`: 开发服务器端口
- `VITE_COMPRESSION`: 压缩算法（gzip/brotli/none）
- `VITE_PUBLIC_PATH`: 部署基础路径
- `VITE_ROUTER_HISTORY`: 路由模式（hash/history）
- `VITE_HIDE_HOME`: 是否隐藏首页

### 构建优化

- **代码分割**: 静态资源分类打包到 `static/` 目录
- **预加载**: Vite warmup 配置提前转换常用文件
- **Mock 服务**: 开发和生产环境都支持（vite-plugin-fake-server）
- **包分析**: 使用 `pnpm report` 生成可视化报告

### 特殊插件

- **vite-plugin-cdn-import**: CDN 替换本地库
- **vite-plugin-compression**: Gzip/Brotli 压缩
- **code-inspector**: 按 Option+Shift（Mac）或 Alt+Shift（Win）快速定位代码
- **unplugin-icons**: 自动按需加载 Iconify 图标

## Git 工作流

项目使用 Husky + lint-staged + Commitlint 确保代码质量：

- **Pre-commit**: 运行 lint-staged 对暂存文件进行检查
- **Commit-msg**: 使用 Commitlint 验证提交信息格式（约定式提交）

## 开发注意事项

1. **强制使用 pnpm**: 项目配置了 `only-allow pnpm`，使用 npm 或 yarn 会报错
2. **TypeScript 配置**: `strict` 模式已关闭，但类型检查仍然重要
3. **路由守卫**: 登录权限和动态路由加载在 `apps/web/src/router/index.ts` 的 `router.beforeEach` 中处理
4. **组件图标**: 优先使用 Iconify 图标（通过 `@iconify/vue`），而非传统 iconfont
5. **样式**: 支持 TailwindCSS 和 SCSS，推荐使用 TailwindCSS 原子化样式
6. **多标签页**: 通过 `multiTags` store 管理，支持缓存和持久化
7. **Monorepo**: 根命令会代理到 `web` 应用，使用 `pnpm --filter <app>` 可指定其他应用

## 项目特色

- **权限系统**: 基于角色的路由级权限控制（RBAC）
- **动态路由**: 支持后端返回路由配置，前端动态注册
- **多布局**: 支持垂直、水平、混合三种导航模式
- **主题定制**: 支持 Element Plus 主题和暗黑模式
- **打包优化**: 开启 CDN + Brotli 后打包体积 < 350KB
