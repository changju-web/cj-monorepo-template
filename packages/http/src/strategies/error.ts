/**
 * 默认错误响应策略集
 */
import type { ErrorStrategies } from '../common/types'
import { createErrorStrategy } from '../factories'

/**
 * 默认错误响应策略集
 */
export const defaultErrorStrategies = {
  /**
   * 兜底策略
   * 匹配条件: 总是匹配（作为最后一个策略）
   * 处理方式: 返回 error 的对象
   */
  fallback: createErrorStrategy(
    () => true,
    (error) => error
  )
} satisfies ErrorStrategies

/**
 * 默认错误响应策略集类型
 */
export type DefaultErrorStrategies = typeof defaultErrorStrategies
