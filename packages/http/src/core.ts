/**
 * 统一适配函数
 */
import type { AxiosResponse, AxiosError } from 'axios'
import { adaptSuccess } from './adapters/success'
import { adaptError } from './adapters/error'
import type { SuccessStrategyInput, ErrorStrategyInput } from './common/types'

/**
 * 判断是否为 AxiosError
 *
 * @param item - 待判断的对象
 * @returns 是否为 AxiosError
 */
function isAxiosError<T = unknown>(item: unknown): item is AxiosError<T> {
  return (
    typeof item === 'object' &&
    item !== null &&
    'isAxiosError' in item &&
    (item as { isAxiosError?: boolean }).isAxiosError === true
  )
}

/**
 * 统一适配函数 - 自动判断是响应还是错误
 *
 * @param result - Axios 响应或错误对象
 * @param responseStrategies - 成功响应策略（可选）
 * @param errorStrategies - 错误策略（可选）
 * @returns 处理后的结果
 *
 * @example
 * ```typescript
 * // 自动判断类型
 * const result = await axios.get('/api/data')
 *   .then(r => adapt(r));
 *
 * // 带自定义策略
 * const result = await axios.get('/api/data')
 *   .then(r => adapt(r,
 *   //   { success: { handler: (r) => r.data } },
 *   //   { networkError: { handler: (e) => ({ offline: true }) } }
 *   // ));
 * ```
 */
export function adapt<R = unknown, E = unknown, T = unknown>(
  result: AxiosResponse<T> | AxiosError<T>,
  responseStrategies?: Record<string, SuccessStrategyInput<R, T>>,
  errorStrategies?: Record<string, ErrorStrategyInput<E, T>>
): R | E {
  return isAxiosError(result)
    ? adaptError(result, errorStrategies)
    : adaptSuccess(result as AxiosResponse<T>, responseStrategies)
}
