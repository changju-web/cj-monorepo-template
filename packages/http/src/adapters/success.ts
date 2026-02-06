/**
 * 成功响应适配器
 */
import type { AxiosResponse } from 'axios'
import { defaultSuccessStrategies } from '../strategies/success'
import { mergeStrategy, isCompleteStrategy } from '../common/utils'
import type { SuccessStrategyInput, CompleteStrategy } from '../common/types'

/**
 * 成功响应适配函数
 *
 * @param response - Axios 响应对象
 * @param customStrategies - 自定义策略（可选）
 * @returns 处理后的结果
 *
 * @example
 * ```typescript
 * // 使用默认策略
 * const data = await axios.get('/api/users').then(adaptSuccess);
 *
 * // 自定义策略
 * const result = await axios.get('/api/users').then(response =>
 *   adaptSuccess(response, {
 *     success: {
 *       match: (r) => r.status >= 200 && r.status < 300,
 *       handler: (r) => r.data
 *     }
 *   })
 * );
 *
 * // 只覆盖 handler
 * const enhanced = await axios.get('/api/users').then(response =>
 *   adaptSuccess(response, {
 *     success: {
 *       handler: (r) => ({ data: r.data, timestamp: Date.now() })
 *     }
 *   })
 * );
 * ```
 */
export function adaptSuccess<R = unknown, T = unknown>(
  response: AxiosResponse<T>,
  customStrategies?: Record<string, SuccessStrategyInput<R, T>>
): R {
  // 1. 首先收集所有策略，使用数组保证顺序
  const strategyList: Array<{
    key: string
    strategy: CompleteStrategy<AxiosResponse<T>, R>
  }> = []

  // 1.1 添加自定义策略（优先级高）
  const customKeys = Object.keys(customStrategies ?? {})
  for (const key of customKeys) {
    const customStrategy = customStrategies![key]
    // 检查是否覆盖默认策略
    if (key in defaultSuccessStrategies) {
      // 合并策略
      const baseStrategy = defaultSuccessStrategies[
        key as keyof typeof defaultSuccessStrategies
      ] as CompleteStrategy<AxiosResponse<T>, R>
      strategyList.push({
        key,
        strategy: mergeStrategy<AxiosResponse<T>, R>(baseStrategy, customStrategy)
      })
    } else {
      // 新策略必须完整
      if (!isCompleteStrategy(customStrategy)) {
        throw new Error(
          `Strategy "${key}" must provide both 'match' and 'handler' when adding new strategy`
        )
      }
      strategyList.push({ key, strategy: customStrategy as CompleteStrategy<AxiosResponse<T>, R> })
    }
  }

  // 1.2 添加未被覆盖的默认策略
  for (const key of Object.keys(defaultSuccessStrategies)) {
    if (!customKeys.includes(key)) {
      strategyList.push({
        key,
        strategy: defaultSuccessStrategies[
          key as keyof typeof defaultSuccessStrategies
        ] as CompleteStrategy<AxiosResponse<T>, R>
      })
    }
  }

  // 2. 按顺序匹配第一个命中的策略
  for (const { strategy } of strategyList) {
    // 部分策略处理：如果 match 存在则使用，否则使用默认的 true
    const shouldMatch = strategy.match !== undefined ? strategy.match(response) : true
    if (shouldMatch) {
      // 如果 handler 存在则使用，否则使用 fallback（返回原始响应）
      return strategy.handler !== undefined ? strategy.handler(response) : (response as R)
    }
  }

  throw new Error('No strategy matched and no fallback strategy provided')
}
