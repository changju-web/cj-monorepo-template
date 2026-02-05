/**
 * 默认成功响应策略集
 */
import type { AxiosResponse } from 'axios'
import type { Strategy } from '../common/types'

/**
 * 默认成功响应策略集
 */
export const defaultSuccessStrategies = {
  /**
   * 成功响应策略
   * 匹配条件: HTTP 状态码为 200
   * 处理方式: 返回 response.data
   */
  success: {
    match: <T>(response: AxiosResponse<T>) => response.status === 200,
    handler: <T, R = unknown>(response: AxiosResponse<T>) => response.data as unknown as R
  },

  /**
   * 兜底策略
   * 匹配条件: 总是匹配（作为最后一个策略）
   * 处理方式: 返回原始响应对象
   */
  fallback: {
    match: () => true,
    handler: <T, R = unknown>(response: AxiosResponse<T>) => response as unknown as R
  }
} satisfies Record<string, Strategy<unknown, unknown>>

/**
 * 默认成功响应策略集类型
 */
export type DefaultSuccessStrategies = typeof defaultSuccessStrategies
