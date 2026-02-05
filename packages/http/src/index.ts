/**
 * @cj-monorepo/http
 *
 * HTTP 响应适配器 - 基于策略模式的 axios 响应处理工具库
 *
 * @example
 * ```typescript
 * import { adaptSuccess, adaptError, adapt } from '@cj-monorepo/http';
 *
 * // 使用默认策略
 * const data = await axios.get('/api/users').then(adaptSuccess);
 *
 * // 错误处理
 * try {
 *   const data = await axios.get('/api/data').then(adaptSuccess);
 * } catch (error) {
 *   const result = adaptError(error);
 * }
 *
 * // 统一适配
 * const result = await axios.get('/api/data').then(r => adapt(r));
 * ```
 */

// 适配器层
export * from './adapters'

// 策略层
export * from './strategies'

// 匹配器层
export * from './matchers'

// 通用模块
export * from './common'

// 工厂函数
export * from './factories'

// 核心函数
export { adapt } from './core'
