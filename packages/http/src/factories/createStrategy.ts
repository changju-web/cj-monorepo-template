/**
 * 策略创建工厂函数
 */
import type { AxiosResponse, AxiosError } from 'axios'
import type { StrategyConstructor } from '../common/types'

/**
 * 创建通用策略对象
 *
 * @param predicate - 谓词函数
 * @param handler - 处理函数
 * @returns 策略对象
 *
 * @example
 * ```typescript
 * const strategy = createStrategy(
 *   (r: AxiosResponse) => r.status === 201,
 *   (r: AxiosResponse) => r.data
 * );
 * ```
 */
export const createStrategy: StrategyConstructor<unknown> = (predicate, handler) => {
  return { match: predicate, handler }
}

/**
 * 创建成功响应策略
 *
 * @param predicate - 谓词函数
 * @param handler - 处理函数
 * @returns 成功响应策略对象
 *
 * @example
 * ```typescript
 * const strategy = createSuccessStrategy(
 *   (r) => r.status >= 200 && r.status < 300,
 *   (r) => r.data
 * );
 * ```
 */
export const createSuccessStrategy: StrategyConstructor<AxiosResponse> = (predicate, handler) => {
  return createStrategy(predicate, handler)
}

/**
 * 创建错误策略
 *
 * @param predicate - 谓词函数
 * @param handler - 处理函数
 * @returns 错误策略对象
 *
 * @example
 * ```typescript
 * const strategy = createErrorStrategy(
 *   (e) => e.response?.status === 404,
 *   () => ({ error: 'Not Found' })
 * );
 * ```
 */
export const createErrorStrategy: StrategyConstructor<AxiosError> = (predicate, handler) => {
  return createStrategy(predicate, handler)
}
