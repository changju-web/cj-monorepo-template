/**
 * 工厂函数统一导出
 */

// 策略创建
export { createStrategy, createSuccessStrategy, createErrorStrategy } from './createStrategy'

// 处理器创建
export { createHandlers } from './createHandlers'
export type { Handlers } from './createHandlers'
