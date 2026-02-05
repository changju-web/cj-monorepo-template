# Change: 添加 HTTP 响应适配器到 packages/http

## Why

当前项目中 HTTP 请求处理散落在各个应用中，缺乏统一的响应和错误处理机制。通过在 `packages/http` 中实现基于策略模式的响应适配器，可以：

1. 提供统一的响应处理接口，减少重复代码
2. 支持灵活的策略配置和部分覆盖
3. 便于扩展新的适配器类型（如重试、缓存等）
4. 提高代码的可测试性和可维护性

## What Changes

- 在 `packages/http` 中实现 HTTP 响应适配器模块
- 采用策略模式设计，支持成功响应和错误响应适配
- 支持策略的部分覆盖（只覆盖 `match` 或 `handler`）
- 提供默认策略集和匹配辅助函数
- 完整的 TypeScript 类型支持

## Impact

- 受影响的规范: 新增 `http-adapter` 规范
- 受影响的代码:
  - `packages/http/src/` - 新增适配器模块
  - `packages/http/src/adapters/` - 适配器层
  - `packages/http/src/strategies/` - 策略层
  - `packages/http/src/matchers/` - 匹配器层
  - `packages/http/src/common/` - 通用模块
  - `packages/http/src/factories/` - 工厂函数
