# Change: 重构项目为 Monorepo 架构

## Why

当前项目是单一应用架构，限制了未来扩展性。随着业务发展，可能需要：

1. 支持多个前端应用（如管理后台、数据可视化大屏、移动端 H5）
2. 提取共享的业务逻辑和组件到独立包
3. 独立管理和发布各个应用和包

Monorepo 架构可以：

- 统一管理多个应用和共享包
- 提高代码复用率，减少重复开发
- 简化依赖管理和版本控制
- 支持跨应用的代码重构和优化

## What Changes

- **BREAKING**: 重构目录结构，将 `src/` 移至 `apps/web/src/`
- 添加 Monorepo 工作区配置（`pnpm-workspace.yaml`）
- 调整构建配置支持多入口构建
- 更新路径别名和导入引用
- 调整 ESLint、TypeScript 等工具配置

## Impact

- 受影响规范: 无（新增 monorepo-setup 规范）
- 受影响代码:
  - `src/` → `apps/web/src/`（所有源代码）
  - `package.json`（根 scripts 调整）
  - `vite.config.ts`（多入口构建配置）
  - `tsconfig.json`（路径别名调整）
  - ESLint、Prettier、Stylelint 配置
  - 构建脚本和开发命令
