# Design: Monorepo 架构重构

## Context

当前项目是基于 vue-pure-admin 的单应用管理系统。为了支持未来多应用场景和代码复用，需要重构为 Monorepo 架构。

**约束条件**:
- 必须使用 pnpm 作为包管理器
- 保持现有构建工具链（Vite、TypeScript、ESLint）
- 最小化对现有功能的影响
- 确保 Git 历史保留

**相关方**:
- 开发团队：需要适应新的目录结构
- CI/CD：需要调整构建和部署流程

## Goals / Non-Goals

**Goals**:
- 建立 `apps/` 和 `packages/` 目录结构
- 将现有代码迁移到 `apps/web/`
- 配置 Monorepo 工作区
- 保持所有现有功能正常运行
- 更新文档和开发指南

**Non-Goals**:
- 不引入新的应用（仅 web 应用）
- 不创建新的共享包
- 不修改业务逻辑代码
- 不改变构建产物

## Decisions

### 1. 目录结构设计

采用标准的 Monorepo 目录结构：

```
.
├── apps/
│   └── web/              # 网页端应用（原 src/）
│       ├── src/
│       ├── index.html
│       ├── vite.config.ts
│       └── package.json
├── packages/             # 预留共享包目录
├── docs/                 # 文档站点（未来）
├── pnpm-workspace.yaml   # 工作区配置
└── package.json          # 根 scripts
```

**理由**:
- `apps/` 明确区分应用程序
- `packages/` 预留共享包空间
- 符合主流 Monorepo 实践（Nx、Turborepo）

**替代方案**:
- 将 `src/` 直接移至根目录：不利于多应用管理
- 使用 `projects/`：语义不如 `apps/` 清晰

### 2. pnpm Workspace 配置

使用 pnpm 内置的 workspace 功能：

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**理由**:
- pnpm 原生支持，无需额外工具
- 已有项目强制使用 pnpm（preinstall 钩子）
- 支持工作区内依赖链接

### 3. 多入口构建配置

Vite 配置支持多入口：

```ts
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
        // 未来可添加更多入口
      }
    }
  }
})
```

**理由**:
- 当前保持单入口，为未来扩展预留空间
- 支持按需添加新应用入口
- 构建产物可独立部署

### 4. 路径别名调整

更新 TypeScript 路径别名：

```json
{
  "paths": {
    "@/*": ["apps/web/src/*"],
    "@build/*": ["apps/web/build/*"]
  }
}
```

**理由**:
- 保持 `@/` 别名不变，减少代码修改
- 仅调整映射路径

**替代方案**:
- 使用 `@web/*`：需要修改所有导入，工作量较大
- 使用相对路径：不利于代码可维护性

### 5. 根 Scripts 设计

根 `package.json` 提供统一命令：

```json
{
  "scripts": {
    "dev": "pnpm --filter web dev",
    "build": "pnpm --filter web build",
    "lint": "pnpm --filter web lint"
  }
}
```

**理由**:
- 保持开发体验不变（命令一致）
- 支持未来多应用构建（`pnpm --filter <app>`）
- 利用 pnpm workspace 过滤功能

**替代方案**:
- 使用 Turborepo：增加工具复杂度，当前无需
- 在各应用独立运行：分散管理，不便统一

## Risks / Trade-offs

### 风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Git 历史丢失 | 代码回溯困难 | 使用 `git mv` 保留历史 |
| 路径别名失效 | 构建失败 | 更新所有配置文件 |
| 依赖路径错误 | 运行时报错 | 检查 workspace 链接 |

### 权衡

**复杂度 vs 可扩展性**:
- 增加：Monorepo 配置、workspace 管理
- 收益：多应用支持、代码复用、统一管理

**当前**：单应用简单直接
**未来**：多应用必须 Monorepo
**决策**：提前架构，避免后期重构成本

## Migration Plan

### 阶段 1：准备工作

1. 创建 `apps/` 和 `packages/` 目录
2. 添加 `pnpm-workspace.yaml`
3. 创建 `apps/web/package.json`

### 阶段 2：代码迁移

1. 使用 `git mv` 移动 `src/` → `apps/web/src/`
2. 移动其他文件（`index.html`、`build/`、`types/`）
3. 更新 Vite 配置路径

### 阶段 3：配置调整

1. 更新 `tsconfig.json` 路径别名
2. 更新 ESLint 配置
3. 更新根 `package.json` scripts

### 阶段 4：验证测试

1. 运行 `pnpm install` 确保依赖安装
2. 运行 `pnpm dev` 确保开发服务器启动
3. 运行 `pnpm build` 确保构建成功
4. 运行 `pnpm lint` 确保代码检查通过

### 阶段 5：文档更新

1. 更新 `CLAUDE.md` 目录结构说明
2. 更新开发指南和 README
3. 添加 Monorepo 使用说明

### 回滚方案

如果迁移失败：
1. 使用 `git reflog` 恢复到迁移前提交
2. 检查点：每个阶段完成后创建 Git 标签

## Open Questions

1. **是否需要立即创建 `docs/` 目录？**
   - 建议：先预留目录，内容后续添加

2. **是否需要配置 Turborepo？**
   - 建议：当前无需，项目规模较小

3. **是否需要调整 CI/CD 配置？**
   - 建议：本次不涉及，后续单独处理

4. **环境变量文件如何处理？**
   - 决策：保留在根目录，所有应用共享
