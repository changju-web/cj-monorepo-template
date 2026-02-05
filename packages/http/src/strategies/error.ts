/**
 * 默认错误响应策略集
 */
import type { AxiosError } from 'axios'
import type { Strategy } from '../common/types'

/**
 * HTTP 响应错误结果类型
 */
export interface HttpErrorResponse {
  error: string
  status?: number
  data?: unknown
}

/**
 * 网络错误结果类型
 */
export interface NetworkErrorResponse {
  error: string
  code?: string
  message?: string
}

/**
 * 超时错误结果类型
 */
export interface TimeoutErrorResponse {
  error: string
  message?: string
}

/**
 * 取消错误结果类型
 */
export interface CanceledErrorResponse {
  error: string
}

/**
 * 未知错误结果类型
 */
export interface UnknownErrorResponse {
  error: string
  message?: string
}

/**
 * 默认错误响应策略集
 *
 * 注意：策略顺序很重要！更具体的策略应该放在前面。
 * - timeout 和 canceled 需要在 networkError 之前检查
 * - 因为 ECONNABORTED 错误同时满足 timeout 和 networkError 的条件
 */
export const defaultErrorStrategies = {
  /**
   * HTTP 响应错误策略
   * 匹配条件: 有 response 属性
   * 处理方式: 返回包含 error、status、data 的对象
   */
  httpResponse: {
    match: <T>(error: AxiosError<T>) => error.response !== undefined,
    handler: <T>(error: AxiosError<T>): HttpErrorResponse => ({
      error: 'HTTP Error',
      status: error.response?.status,
      data: error.response?.data
    })
  },

  /**
   * 超时错误策略
   * 匹配条件: error.code === 'ECONNABORTED'
   * 处理方式: 返回包含 error、message 的对象
   * 注意：必须在 networkError 之前检查
   */
  timeout: {
    match: <T>(error: AxiosError<T>) => error.code === 'ECONNABORTED',
    handler: <T>(error: AxiosError<T>): TimeoutErrorResponse => ({
      error: 'Request Timeout',
      message: error.message
    })
  },

  /**
   * 取消错误策略
   * 匹配条件: 请求被取消
   * 处理方式: 返回包含 error 的对象
   * 注意：必须在 networkError 之前检查
   */
  canceled: {
    match: <T>(error: AxiosError<T>) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (error as any).__CANCEL__ === true
    },
    handler: <T>(): CanceledErrorResponse => ({
      error: 'Request Canceled'
    })
  },

  /**
   * 网络错误策略
   * 匹配条件: 有 request 但没有 response
   * 处理方式: 返回包含 error、code、message 的对象
   * 注意：必须在 timeout 和 canceled 之后检查
   */
  networkError: {
    match: <T>(error: AxiosError<T>) => error.request !== undefined && error.response === undefined,
    handler: <T>(error: AxiosError<T>): NetworkErrorResponse => ({
      error: 'Network Error',
      code: error.code,
      message: error.message
    })
  },

  /**
   * 兜底策略
   * 匹配条件: 总是匹配（作为最后一个策略）
   * 处理方式: 返回包含 error、message 的对象
   */
  fallback: {
    match: () => true,
    handler: <T>(error: AxiosError<T>): UnknownErrorResponse => ({
      error: 'Unknown Error',
      message: error.message
    })
  }
} satisfies Record<string, Strategy<unknown, unknown>>

/**
 * 默认错误响应策略集类型
 */
export type DefaultErrorStrategies = typeof defaultErrorStrategies

/**
 * 所有可能的错误响应结果类型
 */
export type ErrorResponse =
  | HttpErrorResponse
  | NetworkErrorResponse
  | TimeoutErrorResponse
  | CanceledErrorResponse
  | UnknownErrorResponse
