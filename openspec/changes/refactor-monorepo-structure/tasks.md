# 任务列表：Monorepo 架构重构

## 1. 准备工作

- [x] 1.1 创建 `apps/` 和 `packages/` 目录
- [x] 1.2 添加 `pnpm-workspace.yaml` 配置文件
- [x] 1.3 创建 `apps/web/` 应用目录
- [x] 1.4 创建 `apps/web/package.json`（应用配置）

## 2. 代码迁移

- [x] 2.1 使用 `git mv` 移动 `src/` → `apps/web/src/`
- [x] 2.2 使用 `git mv` 移动 `index.html` → `apps/web/index.html`
- [x] 2.3 使用 `git mv` 移动 `build/` → `apps/web/build/`
- [x] 2.4 使用 `git mv` 移动 `types/` → `apps/web/types/`
- [x] 2.5 使用 `git mv` 移动 `mock/` → `apps/web/mock/`

## 3. 配置文件调整

- [x] 3.1 更新 `apps/web/vite.config.ts`（调整 root、alias、路径）
- [x] 3.2 更新 `apps/web/tsconfig.json`（paths 映射到 apps/web/src）
- [x] 3.3 更新根 `tsconfig.json`（reference 配置）
- [x] 3.4 更新 `eslint.config.js`（扫描 apps/web/src）
- [x] 3.5 更新 `.prettierrc.js`（如需调整）
- [x] 3.6 更新 `stylelint.config.js`（扫描 apps/web）

## 4. 根配置更新

- [x] 4.1 更新根 `package.json` scripts（使用 `pnpm --filter web`）
- [x] 4.2 移除根 `package.json` 的 dependencies（迁移到 apps/web）
- [x] 4.3 保留 devDependencies 在根目录
- [x] 4.4 更新 `build/utils.ts`（路径解析）

## 5. 验证测试

- [x] 5.1 运行 `pnpm install` 验证依赖安装
- [x] 5.2 运行 `pnpm dev` 验证开发服务器启动
- [x] 5.3 运行 `pnpm build` 验证生产构建
- [x] 5.4 运行 `pnpm typecheck` 验证类型检查
- [x] 5.5 运行 `pnpm lint:eslint` 验证 ESLint
- [x] 5.6 运行 `pnpm lint:prettier` 验证 Prettier
- [x] 5.7 运行 `pnpm lint:stylelint` 验证 Stylelint

## 6. 文档更新

- [x] 6.1 更新 `CLAUDE.md` 项目概述（目录结构）
- [x] 6.2 更新 `CLAUDE.md` 常用开发命令
- [x] 6.3 更新 `openspec/project.md`（目录结构规范）
- [x] 6.4 更新 `README.md`（如需要）

## 7. 提交记录

- [ ] 7.1 创建 Git 提交：重构目录结构为 Monorepo
- [ ] 7.2 验证提交历史完整性（git log --follow）
