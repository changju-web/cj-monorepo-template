# Project Context

## Purpose

基于 **vue-pure-admin** 精简版的企业级前端管理系统脚手架，采用 **Monorepo 架构**，为构建大型管理后台应用提供最佳实践的技术方案和完善的工程化体系。

项目核心目标：

- 提供开箱即用的权限系统（RBAC）
- 支持动态路由和静态路由混合模式
- 优化构建体积和运行时性能
- 提供完整的代码质量保障体系
- 支持多应用和共享包管理

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

## Tech Stack

### 核心框架

- **Vue 3.5+**: 使用 Composition API 和响应式系统
- **TypeScript 5.9+**: 类型安全保障
- **Vite 7+**: 高性能构建工具
- **Vue Router 4+**: 路由管理
- **Pinia 3+**: 状态管理

### UI 层

- **Element Plus 2+**: 核心组件库
- **TailwindCSS 4+**: 原子化样式方案
- **@iconify/vue**: 图标按需加载
- **Animate.css**: 动画库
- **ECharts 6+**: 数据可视化

### 工程化工具

- **ESLint 9+**: 代码检查（支持 Vue 3 和 TypeScript）
- **Prettier 3+**: 代码格式化
- **Stylelint 16+**: 样式检查
- **Husky + lint-staged**: Git 钩子和暂存文件检查
- **Commitlint**: 约定式提交规范
- **pnpm**: 包管理器（强制使用）

### 构建优化

- **vite-plugin-cdn-import**: CDN 模式支持
- **vite-plugin-compression**: Gzip/Brotli 压缩
- **code-inspector**: 代码快速定位
- **vite-plugin-fake-server**: Mock 服务

### 其他依赖

- **Axios**: HTTP 请求
- **dayjs**: 日期处理
- **js-cookie**: Cookie 管理
- **localforage**: 本地存储
- **mitt**: 事件总线
- **nprogress**: 进度条
- **sortablejs**: 拖拽排序

## Project Conventions

### Code Style

#### 命名规范

- **组件命名**:
  - 公共组件使用 `Re` 前缀（如 ReAuth、ReIcon、RePerms）
  - 布局组件使用 `lay-` 前缀（如 lay-navbar、lay-sidebar）
  - 多单词组件名称不受限制（`vue/multi-word-component-names: off`）
- **文件命名**: kebab-case（小写短横线分隔）
- **TypeScript 接口**: PascalCase

#### 格式化规则

- **单引号**: 否（使用双引号）
- **箭头函数参数括号**: 避免不必要的括号（`arrowParens: "avoid"`）
- **尾随逗号**: 无（`trailingComma: "none"`）
- **HTML 标签**: 自闭合（void 元素、普通元素、组件都自闭合）
- **行尾**: 自动检测（`endOfLine: "auto"`）

#### TypeScript 规范

- 类型导入使用内联类型导入（`import type { ... }`）
- 未使用变量前缀使用 `_` 忽略检查
- 允许 `any` 类型（`@typescript-eslint/no-explicit-any: off`）
- 枚举成员优先使用字面量（`@typescript-eslint/prefer-literal-enum-member`）

#### Vue 规范

- 不要求默认 prop（`vue/require-default-prop: off`）
- 不要求显式声明 emits（`vue/require-explicit-emits: off`）
- 允许 setup props 响应性丢失（`vue/no-setup-props-reactivity-loss: off`）

### Architecture Patterns

#### 目录结构

```
apps/web/src/
├── api/              # API 接口定义
├── assets/           # 静态资源
├── components/       # 公共组件（Re 前缀）
├── directives/       # 自定义指令
├── layout/           # 布局组件（lay- 前缀）
├── router/           # 路由配置
│   ├── index.ts      # 路由入口和守卫
│   ├── utils.ts      # 路由工具函数
│   └── modules/      # 静态路由模块（自动导入）
├── store/            # Pinia 状态管理
│   └── modules/      # 状态模块
├── styles/           # 全局样式
├── utils/            # 工具函数
│   └── http/         # HTTP 请求封装
└── views/            # 页面组件
```

#### 路由系统

- **静态路由**: 位于 `apps/web/src/router/modules/`，通过 Vite 的 `import.meta.glob` 自动导入
- **动态路由**: 后端返回，在 `initRouter()` 中处理
- **路由扁平化**: 三级及以上路由被拍平为二级路由
- **路由白名单**: 配置在 `apps/web/src/router/index.ts`，默认包含 `/login`
- **路由守卫**: 在 `router.beforeEach` 中处理登录权限和动态路由加载

#### 状态管理

- **app.ts**: 应用全局状态（侧边栏、设备类型）
- **user.ts**: 用户认证和权限信息
- **permission.ts**: 动态路由权限控制
- **multiTags.ts**: 多标签页管理
- **settings.ts**: 系统设置
- **epTheme.ts**: Element Plus 主题配置

#### 权限系统

- 基于 RBAC 的路由级权限控制
- `v-auth` 和 `v-perms` 指令用于按钮级权限控制
- ReAuth 组件提供声明式权限控制

### Testing Strategy

项目当前未配置测试工具。

### Git Workflow

#### 分支策略

- **main**: 主分支，生产环境代码
- 推荐功能分支开发模式

#### 提交规范

使用 **约定式提交**（Conventional Commits）：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**提交类型（type）**:

- `feat`: 新功能
- `fix`: Bug 修复
- `perf`: 性能优化
- `style`: 代码格式调整（不影响功能）
- `docs`: 文档更新
- `test`: 测试相关
- `refactor`: 代码重构
- `build`: 构建相关
- `ci`: CI/CD 配置
- `chore`: 杂项（依赖更新等）
- `revert`: 回滚提交
- `wip`: 工作进行中
- `workflow`: 工作流相关
- `types`: 类型定义
- `release`: 发布版本

**提交规则**:

- 标题不超过 108 字符
- 标题不能为空
- 类型不能为空
- body 和 footer 前需要空行

#### Git 钩子

- **pre-commit**: 运行 lint-staged 对暂存文件进行检查和修复
- **commit-msg**: 使用 Commitlint 验证提交信息格式

## Domain Context

### 权限模型

- **RBAC**: 基于角色的访问控制
- **路由权限**: 通过后端返回的路由配置动态注册
- **按钮权限**: 通过自定义指令和组件控制
- **数据权限**: 可扩展的权限标识系统

### 多标签页

- 支持标签页缓存和持久化
- 可通过 `multiTags` store 管理
- 支持关闭其他、关闭所有等操作

### 主题系统

- 支持 Element Plus 主题定制
- 支持暗黑模式切换
- 通过 `epTheme` store 管理

## Important Constraints

### 技术约束

- **Node 版本**: ^20.19.0 || >=22.13.0
- **pnpm 版本**: >=9（强制使用，preinstall 钩子检查）
- **ESM**: 项目使用 ES 模块（`type: "module"`）

### 构建约束

- 开发服务器最大内存: 4GB
- 生产构建最大内存: 8GB
- 开启 CDN + Brotli 后打包体积 < 350KB

### 代码约束

- TypeScript strict 模式已关闭（但类型检查仍然重要）
- 未使用变量必须使用 `_` 前缀忽略检查
- 避免使用 `any` 类型（虽然规则关闭，但建议使用具体类型）

## External Dependencies

### 开发依赖

- 无外部服务依赖

### 生产依赖

- 后端 API 接口（动态路由、用户认证等）
- CDN 资源（可选，通过 `VITE_CDN` 环境变量控制）

### 可选服务

- Mock 服务（通过 `vite-plugin-fake-server`）
