/**
 * 通用工具函数
 */
import type { Strategy, StrategyInput } from './types'

/**
 * 合并策略：将自定义策略与基础策略合并
 *
 * @param base - 基础策略
 * @param override - 自定义策略（可以是完整或部分策略）
 * @returns 合并后的完整策略
 *
 * @example
 * ```typescript
 * const base = {
 *   match: (r) => r.status === 200,
 *   handler: (r) => r.data
 * };
 *
 * // 只覆盖 match
 * const partial = { match: (r) => r.status >= 200 };
 * const merged1 = mergeStrategy(base, partial);
 * // merged1.match === partial.match
 * // merged1.handler === base.handler
 *
 * // 完整覆盖
 * const full = {
 *   match: (r) => r.status === 201,
 *   handler: (r) => r.data.result
 * };
 * const merged2 = mergeStrategy(base, full);
 * // merged2 === full
 * ```
 */
export function mergeStrategy<T, R>(
  base: Strategy<T, R>,
  override: StrategyInput<T, R>
): Strategy<T, R> {
  // 如果 override 是完整的（两者都有），直接返回
  if (override.match !== undefined && override.handler !== undefined) {
    return { match: override.match, handler: override.handler }
  }

  // 否则进行属性级合并
  return {
    match: override.match !== undefined ? override.match : base.match,
    handler: override.handler !== undefined ? override.handler : base.handler
  }
}

/**
 * 判断是否为完整策略
 *
 * @param input - 策略输入
 * @returns 是否为完整策略
 *
 * @example
 * ```typescript
 * const full = { match: () => true, handler: () => {} };
 * isCompleteStrategy(full); // true
 *
 * const partial = { match: () => true };
 * isCompleteStrategy(partial); // false
 * ```
 */
export function isCompleteStrategy<T, R>(input: StrategyInput<T, R>): input is Strategy<T, R> {
  return input.match !== undefined && input.handler !== undefined
}
