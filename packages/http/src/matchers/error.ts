/**
 * 错误响应匹配辅助函数
 */
import type { AxiosError } from 'axios'
import type { StrategyPredicate } from '../common/types'

/**
 * 错误响应匹配器
 */
export const matchError = {
  /**
   * 匹配 HTTP 状态码（针对有响应的错误）
   *
   * @param code - HTTP 状态码
   * @returns 谓词函数
   *
   * @example
   * ```typescript
   * const matcher = matchError.status(404);
   * matcher({ response: { status: 404 } }); // true
   * matcher({ response: { status: 500 } }); // false
   * ```
   */
  status:
    <T = unknown>(code: number): StrategyPredicate<AxiosError<T>> =>
    (error) =>
      error.response?.status === code,

  /**
   * 匹配状态码范围（针对有响应的错误）
   *
   * @param min - 最小状态码（包含）
   * @param max - 最大状态码（包含）
   * @returns 谓词函数
   *
   * @example
   * ```typescript
   * const matcher = matchError.statusRange(400, 499);
   * matcher({ response: { status: 404 } }); // true
   * matcher({ response: { status: 500 } }); // false
   * ```
   */
  statusRange: <T = unknown>(min: number, max: number): StrategyPredicate<AxiosError<T>> => {
    const predicate: StrategyPredicate<AxiosError<T>> = (error) => {
      const status = error.response?.status
      return status !== undefined && status >= min && status <= max
    }
    return predicate
  },

  /**
   * 匹配错误代码
   *
   * @param errorCode - 错误代码（如 'ECONNREFUSED', 'ECONNABORTED'）
   * @returns 谓词函数
   *
   * @example
   * ```typescript
   * const matcher = matchError.code('ECONNABORTED');
   * matcher({ code: 'ECONNABORTED' }); // true
   * matcher({ code: 'ECONNREFUSED' }); // false
   * ```
   */
  code:
    <T = unknown>(errorCode: string): StrategyPredicate<AxiosError<T>> =>
    (error) =>
      error.code === errorCode,

  /**
   * 匹配是否有响应对象
   *
   * @returns 谓词函数
   *
   * @example
   * ```typescript
   * const matcher = matchError.hasResponse();
   * matcher({ response: { status: 404 } }); // true
   * matcher({ request: {}, code: 'ECONNREFUSED' }); // false
   * ```
   */
  hasResponse:
    <T = unknown>(): StrategyPredicate<AxiosError<T>> =>
    (error) =>
      error.response !== undefined,

  /**
   * 匹配是否为网络错误（无响应）
   *
   * @returns 谓词函数
   *
   * @example
   * ```typescript
   * const matcher = matchError.isNetworkError();
   * matcher({ request: {}, code: 'ECONNREFUSED' }); // true
   * matcher({ response: { status: 500 } }); // false
   * ```
   */
  isNetworkError:
    <T = unknown>(): StrategyPredicate<AxiosError<T>> =>
    (error) =>
      error.request !== undefined && error.response === undefined,

  /**
   * 匹配是否为超时错误
   *
   * @returns 谓词函数
   *
   * @example
   * ```typescript
   * const matcher = matchError.isTimeout();
   * matcher({ code: 'ECONNABORTED' }); // true
   * matcher({ code: 'ECONNREFUSED' }); // false
   * ```
   */
  isTimeout:
    <T = unknown>(): StrategyPredicate<AxiosError<T>> =>
    (error) =>
      error.code === 'ECONNABORTED',

  /**
   * 匹配是否被取消
   *
   * @returns 谓词函数
   *
   * @example
   * ```typescript
   * import axios from 'axios';
   *
   * const source = axios.CancelToken.source();
   * source.cancel('Request canceled');
   *
   * const matcher = matchError.isCanceled();
   * matcher(axios.isCancel(error)); // true
   * ```
   */
  isCanceled: <T = unknown>(): StrategyPredicate<AxiosError<T>> => {
    // 动态导入 axios 以避免循环依赖
    const predicate: StrategyPredicate<AxiosError<T>> = (error) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (error as any).__CANCEL__ === true
    }
    return predicate
  },

  /**
   * 匹配自定义条件
   *
   * @param predicate - 自定义谓词函数
   * @returns 谓词函数
   *
   * @example
   * ```typescript
   * const matcher = matchError.custom((e) => e.message.includes('timeout'));
   * matcher({ message: 'Request timeout of 5000ms exceeded' }); // true
   * ```
   */
  custom: <T = unknown>(
    predicate: StrategyPredicate<AxiosError<T>>
  ): StrategyPredicate<AxiosError<T>> => predicate
} as const

/**
 * 错误响应匹配器类型
 */
export type MatchError = typeof matchError
