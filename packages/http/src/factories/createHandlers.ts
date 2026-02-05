/**
 * Promise 处理器创建工厂函数
 */
import type { AxiosResponse, AxiosError } from 'axios'
import { adaptSuccess } from '../adapters/success'
import { adaptError } from '../adapters/error'
import type { SuccessStrategyInput, ErrorStrategyInput } from '../common/types'

/**
 * Promise 处理器类型
 */
export interface Handlers<R = unknown, E = unknown, T = unknown> {
  /** 成功处理器 */
  onSuccess: (response: AxiosResponse<T>) => R
  /** 错误处理器 */
  onError: (error: AxiosError<T>) => E
}

/**
 * 创建 Promise then/catch 处理器
 *
 * @param responseStrategies - 成功响应策略（可选）
 * @param errorStrategies - 错误策略（可选）
 * @returns 包含 onSuccess 和 onError 的处理器对象
 *
 * @example
 * ```typescript
 * const handlers = createHandlers(
 *   { success: { handler: (r) => r.data } },
 *   { networkError: { handler: (e) => ({ offline: true }) } }
 * );
 *
 * axios.get('/api/data')
 *   .then(handlers.onSuccess)
 *   .catch(handlers.onError);
 * ```
 */
export function createHandlers<R = unknown, E = unknown, T = unknown>(
  responseStrategies?: Record<string, SuccessStrategyInput<R, T>>,
  errorStrategies?: Record<string, ErrorStrategyInput<E, T>>
): Handlers<R, E, T> {
  return {
    onSuccess: (response: AxiosResponse<T>) => adaptSuccess(response, responseStrategies),
    onError: (error: AxiosError<T>) => adaptError(error, errorStrategies)
  }
}
