/**
 * 错误响应适配器
 */
import type { AxiosError } from 'axios'
import { defaultErrorStrategies } from '../strategies/error'
import { mergeStrategy, isCompleteStrategy } from '../common/utils'
import type { ErrorStrategyInput, CompleteStrategy } from '../common/types'

/**
 * 错误响应适配函数
 *
 * @param error - Axios 错误对象
 * @param customStrategies - 自定义策略（可选）
 * @returns 处理后的结果
 *
 * @example
 * ```typescript
 * try {
 *   const data = await axios.get('/api/users').then(adaptSuccess);
 * } catch (error) {
 *   const result = adaptError(error);
 *   console.log(result.error); // 'Network Error' 或 'HTTP Error'
 * }
 *
 * // 自定义策略
 * const custom = adaptError(error, {
 *   networkError: {
 *     handler: (e) => ({ offline: true, message: e.message })
 *   }
 * });
 *
 * // 添加新策略
 * const detailed = adaptError(error, {
 *   unauthorized: {
 *     match: (e) => e.response?.status === 401,
 *     handler: () => ({ needLogin: true })
 *   }
 * });
 * ```
 */
export function adaptError<E = unknown, T = unknown>(
  error: AxiosError<T>,
  customStrategies?: Record<string, ErrorStrategyInput<E, T>>
): E {
  // 1. 首先收集所有策略，使用数组保证顺序
  const strategyList: Array<{
    key: string
    strategy: CompleteStrategy<AxiosError<T>, E>
  }> = []

  // 1.1 添加自定义策略（优先级高）
  const customKeys = Object.keys(customStrategies ?? {})
  for (const key of customKeys) {
    const customStrategy = customStrategies![key]
    // 检查是否覆盖默认策略
    if (key in defaultErrorStrategies) {
      // 合并策略
      const baseStrategy = defaultErrorStrategies[
        key as keyof typeof defaultErrorStrategies
      ] as CompleteStrategy<AxiosError<T>, E>
      strategyList.push({
        key,
        strategy: mergeStrategy<AxiosError<T>, E>(baseStrategy, customStrategy)
      })
    } else {
      // 新策略必须完整
      if (!isCompleteStrategy(customStrategy)) {
        throw new Error(
          `Error strategy "${key}" must provide both 'match' and 'handler' when adding new strategy`
        )
      }
      strategyList.push({ key, strategy: customStrategy as CompleteStrategy<AxiosError<T>, E> })
    }
  }

  // 1.2 添加未被覆盖的默认策略
  for (const key of Object.keys(defaultErrorStrategies)) {
    if (!customKeys.includes(key)) {
      strategyList.push({
        key,
        strategy: defaultErrorStrategies[
          key as keyof typeof defaultErrorStrategies
        ] as CompleteStrategy<AxiosError<T>, E>
      })
    }
  }

  // 2. 按顺序匹配第一个命中的策略
  for (const { strategy } of strategyList) {
    // 部分策略处理：如果 match 存在则使用，否则使用默认的 true
    const shouldMatch = strategy.match !== undefined ? strategy.match(error) : true
    if (shouldMatch) {
      // 如果 handler 存在则使用，否则使用 fallback（返回原始错误）
      return strategy.handler !== undefined ? strategy.handler(error) : (error as E)
    }
  }

  throw new Error('No error strategy matched and no fallback strategy provided')
}
