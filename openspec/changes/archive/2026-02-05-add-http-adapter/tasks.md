# 实现任务清单

## 1. 项目初始化

- [x] 1.1 创建 `packages/http/package.json`
- [x] 1.2 创建 `packages/http/tsconfig.json`
- [x] 1.3 创建 `packages/http/src/` 目录结构
- [x] 1.4 创建 `packages/http/README.md`

## 2. 通用模块实现

- [x] 2.1 实现 `src/common/types.ts`
  - [x] 定义 `Strategy<Predicate, Handler>` 接口
  - [x] 定义 `PartialStrategy<Predicate, Handler>` 接口
  - [x] 定义 `StrategyInput<Predicate, Handler>` 类型
  - [x] 导出 Axios 响应和错误类型
- [x] 2.2 实现 `src/common/utils.ts`
  - [x] 实现 `mergeStrategy()` 函数
  - [x] 实现 `isCompleteStrategy()` 类型守卫
- [x] 2.3 创建 `src/common/index.ts` 统一导出

## 3. 匹配器层实现

- [x] 3.1 实现 `src/matchers/success.ts`
  - [x] 实现 `matchSuccess.status()`
  - [x] 实现 `matchSuccess.statusRange()`
  - [x] 实现 `matchSuccess.header()`
  - [x] 实现 `matchSuccess.custom()`
- [x] 3.2 实现 `src/matchers/error.ts`
  - [x] 实现 `matchError.status()`
  - [x] 实现 `matchError.statusRange()`
  - [x] 实现 `matchError.code()`
  - [x] 实现 `matchError.hasResponse()`
  - [x] 实现 `matchError.isNetworkError()`
  - [x] 实现 `matchError.isTimeout()`
  - [x] 实现 `matchError.isCanceled()`
  - [x] 实现 `matchError.custom()`
- [x] 3.3 创建 `src/matchers/index.ts` 统一导出

## 4. 策略层实现

- [x] 4.1 实现 `src/strategies/success.ts`
  - [x] 定义 `success` 策略（status === 200）
  - [x] 定义 `fallback` 策略
  - [x] 导出 `defaultSuccessStrategies`
- [x] 4.2 实现 `src/strategies/error.ts`
  - [x] 定义 `httpResponse` 策略
  - [x] 定义 `networkError` 策略
  - [x] 定义 `timeout` 策略
  - [x] 定义 `canceled` 策略
  - [x] 定义 `fallback` 策略
  - [x] 导出 `defaultErrorStrategies`
- [x] 4.3 创建 `src/strategies/index.ts` 统一导出

## 5. 适配器层实现

- [x] 5.1 实现 `src/adapters/success.ts`
  - [x] 实现 `adaptSuccess()` 函数
  - [x] 实现策略合并逻辑
  - [x] 实现策略匹配和执行
  - [x] 添加新策略完整性检查
- [x] 5.2 实现 `src/adapters/error.ts`
  - [x] 实现 `adaptError()` 函数
  - [x] 实现策略合并逻辑
  - [x] 实现策略匹配和执行
  - [x] 添加新策略完整性检查
- [x] 5.3 创建 `src/adapters/index.ts` 统一导出

## 6. 工厂函数实现

- [x] 6.1 实现 `src/factories/createStrategy.ts`
  - [x] 实现 `createStrategy()` 通用函数
  - [x] 实现 `createSuccessStrategy()` 便捷函数
  - [x] 实现 `createErrorStrategy()` 便捷函数
- [x] 6.2 实现 `src/factories/createHandlers.ts`
  - [x] 实现 `createHandlers()` 函数
- [x] 6.3 创建 `src/factories/index.ts` 统一导出

## 7. 核心模块实现

- [x] 7.1 实现 `src/core.ts`
  - [x] 实现 `adapt()` 统一适配函数
  - [x] 实现响应/错误自动判断逻辑

## 8. 主入口和导出

- [x] 8.1 创建 `src/index.ts`
  - [x] 导出适配器层 (`adaptSuccess`, `adaptError`)
  - [x] 导出策略层 (`defaultSuccessStrategies`, `defaultErrorStrategies`)
  - [x] 导出匹配器层 (`matchSuccess`, `matchError`)
  - [x] 导出通用模块
  - [x] 导出工厂函数
  - [x] 导出核心函数 (`adapt`)

## 9. 测试

- [x] 9.1 编写 `src/adapters/__tests__/success.test.ts`
  - [x] 测试默认策略
  - [x] 测试自定义策略覆盖
  - [x] 测试部分覆盖（只覆盖 match）
  - [x] 测试部分覆盖（只覆盖 handler）
  - [x] 测试新策略添加
  - [x] 测试新策略不完整时抛出错误
- [x] 9.2 编写 `src/adapters/__tests__/error.test.ts`
  - [x] 测试所有默认错误策略
  - [x] 测试策略覆盖逻辑
  - [x] 测试新策略添加
- [x] 9.3 配置测试环境（Vitest 或 Jest）

## 10. 文档

- [x] 10.1 完善 `README.md`
  - [x] 添加安装说明
  - [x] 添加基础使用示例
  - [x] 添加自定义策略示例
  - [x] 添加 API 文档
- [x] 10.2 添加代码注释（JSDoc 格式）

## 11. 验证

- [x] 11.1 运行 TypeScript 类型检查 (`tsc --noEmit`)
- [x] 11.2 运行所有测试
- [x] 11.3 验证导出正确性
- [x] 11.4 验证在各应用中可正常引用
