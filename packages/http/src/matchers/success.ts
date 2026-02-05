/**
 * 成功响应匹配辅助函数
 */
import type { AxiosResponse } from 'axios'
import type { StrategyPredicate } from '../common/types'

/**
 * 成功响应匹配器
 */
export const matchSuccess = {
  /**
   * 匹配指定状态码
   *
   * @param code - HTTP 状态码
   * @returns 谓词函数
   *
   * @example
   * ```typescript
   * const matcher = matchSuccess.status(200);
   * matcher({ status: 200, data: {} }); // true
   * matcher({ status: 404, data: {} }); // false
   * ```
   */
  status:
    <T = unknown>(code: number): StrategyPredicate<AxiosResponse<T>> =>
    (response) =>
      response.status === code,

  /**
   * 匹配状态码范围
   *
   * @param min - 最小状态码（包含）
   * @param max - 最大状态码（包含）
   * @returns 谓词函数
   *
   * @example
   * ```typescript
   * const matcher = matchSuccess.statusRange(200, 299);
   * matcher({ status: 200, data: {} }); // true
   * matcher({ status: 304, data: {} }); // true
   * matcher({ status: 404, data: {} }); // false
   * ```
   */
  statusRange:
    <T = unknown>(min: number, max: number): StrategyPredicate<AxiosResponse<T>> =>
    (response) =>
      response.status >= min && response.status <= max,

  /**
   * 匹配响应头
   *
   * @param name - 响应头名称（不区分大小写）
   * @param value - 响应头值
   * @returns 谓词函数
   *
   * @example
   * ```typescript
   * const matcher = matchSuccess.header('content-type', 'application/json');
   * matcher({
   *   status: 200,
   *   data: {},
   *   headers: { 'content-type': 'application/json' }
   * }); // true
   * ```
   */
  header:
    <T = unknown>(name: string, value: string): StrategyPredicate<AxiosResponse<T>> =>
    (response) => {
      const headerValue = response.headers[name?.toLowerCase()]
      return headerValue === value
    },

  /**
   * 匹配自定义条件
   *
   * @param predicate - 自定义谓词函数
   * @returns 谓词函数
   *
   * @example
   * ```typescript
   * const matcher = matchSuccess.custom((r) => r.data.success === true);
   * matcher({ status: 200, data: { success: true } }); // true
   * ```
   */
  custom: <T = unknown>(
    predicate: StrategyPredicate<AxiosResponse<T>>
  ): StrategyPredicate<AxiosResponse<T>> => predicate
} as const

/**
 * 成功响应匹配器类型
 */
export type MatchSuccess = typeof matchSuccess
