# monorepo-setup Specification

## Purpose

TBD - created by archiving change refactor-monorepo-structure. Update Purpose after archive.

## Requirements

### Requirement: Monorepo 目录结构

项目 SHALL 采用标准的 Monorepo 目录结构，支持多应用和共享包管理。

#### Scenario: 目录结构定义

- **WHEN** 项目初始化
- **THEN** 应包含以下目录结构：
  ```
  .
  ├── apps/              # 所有应用
  │   └── web/           # 网页端应用
  │       ├── src/       # 源代码
  │       ├── index.html # 入口文件
  │       └── vite.config.ts
  ├── packages/          # 共享包（预留）
  ├── pnpm-workspace.yaml
  └── package.json       # 根配置
  ```

#### Scenario: 应用隔离

- **WHEN** 创建新的应用
- **THEN** 应用应放置在 `apps/<app-name>/` 目录下
- **AND** 应用应具有独立的 `package.json` 和构建配置

### Requirement: pnpm Workspace 配置

项目 MUST 使用 pnpm workspace 进行 Monorepo 管理。

#### Scenario: workspace 配置

- **WHEN** 配置 pnpm workspace
- **THEN** `pnpm-workspace.yaml` 应包含：
  ```yaml
  packages:
    - "apps/*"
    - "packages/*"
  ```

#### Scenario: 依赖安装

- **WHEN** 运行 `pnpm install` 在根目录
- **THEN** 所有应用和包的依赖应被正确安装
- **AND** 工作区内的依赖链接应自动建立

### Requirement: 根 Scripts 统一管理

根 `package.json` SHALL 提供统一的开发命令，代理到具体应用。

#### Scenario: 开发命令

- **WHEN** 运行 `pnpm dev`
- **THEN** 应启动 `web` 应用的开发服务器
- **AND** 命令应等价于 `pnpm --filter web dev`

#### Scenario: 构建命令

- **WHEN** 运行 `pnpm build`
- **THEN** 应构建 `web` 应用
- **AND** 命令应等价于 `pnpm --filter web build`

#### Scenario: 代码检查命令

- **WHEN** 运行 `pnpm lint`
- **THEN** 应运行 `web` 应用的所有检查（ESLint、Prettier、Stylelint）

### Requirement: 路径别名配置

TypeScript 和 Vite MUST 配置正确的路径别名，支持 `@/` 导入。

#### Scenario: TypeScript 路径别名

- **WHEN** 使用 `@/` 导入
- **THEN** `tsconfig.json` 应将 `@/*` 映射到 `apps/web/src/*`
- **AND** `@build/*` 应映射到 `apps/web/build/*`

#### Scenario: Vite 路径别名

- **WHEN** Vite 构建时
- **THEN** `vite.config.ts` 应正确解析 `@/` 别名
- **AND** 别名应与 TypeScript 配置一致

### Requirement: 代码质量工具配置

ESLint、Prettier、Stylelint MUST 适配新的目录结构。

#### Scenario: ESLint 配置

- **WHEN** 运行 ESLint 检查
- **THEN** `eslint.config.js` 应正确扫描 `apps/web/src/**/*.{vue,ts,tsx}`
- **AND** `mock/` 和 `build/` 目录也应被扫描

#### Scenario: Prettier 配置

- **WHEN** 运行 Prettier 格式化
- **THEN** `.prettierrc.js` 应正确格式化 `apps/web/src/**/*` 文件

#### Scenario: Stylelint 配置

- **WHEN** 运行 Stylelint 检查
- **THEN** `stylelint.config.js` 应正确扫描 `apps/web/**/*.{vue,css,scss}`

### Requirement: Git 历史保留

代码迁移 MUST 使用 `git mv` 命令，保留 Git 历史。

#### Scenario: 源代码迁移

- **WHEN** 迁移 `src/` 目录
- **THEN** 应使用 `git mv src apps/web/src`
- **AND** 所有文件的 Git 历史应被保留

#### Scenario: 配置文件迁移

- **WHEN** 迁移配置文件（`index.html`、`types/` 等）
- **THEN** 应使用 `git mv` 命令
- **AND** 文件历史应被保留

### Requirement: 应用独立配置

每个应用 SHALL 具有独立的 `package.json` 和构建配置。

#### Scenario: Web 应用配置

- **WHEN** 查看 `apps/web/package.json`
- **THEN** 应包含应用特定的配置
- **AND** 应依赖根包的共享依赖（通过 workspace）

#### Scenario: 多入口支持

- **WHEN** 配置 Vite 构建
- **THEN** `vite.config.ts` 应支持多入口配置
- **AND** 当前应配置单个 `index.html` 入口
