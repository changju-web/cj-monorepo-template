/**
 * 默认成功响应策略集
 */
import type { SuccessStrategies } from '../common/types'
import { createSuccessStrategy } from '../factories'

/**
 * 默认成功响应策略集
 */
export const defaultSuccessStrategies = {
  /**
   * 成功响应策略
   * 匹配条件: HTTP 状态码为 200
   * 处理方式: 返回 response
   */
  success: createSuccessStrategy(
    (response) => response.status === 200,
    (response) => response
  ),

  /**
   * 响应数据为文件时，返回 Blob 对象
   * 匹配条件: response.data instanceof Blob
   * 处理方式: 返回 response
   */
  file: createSuccessStrategy(
    (response) => response.data instanceof Blob,
    (response) => response
  ),

  /**
   * 兜底策略
   * 匹配条件: 总是匹配（作为最后一个策略）
   * 处理方式: 返回原始响应对象
   */
  fallback: createSuccessStrategy(
    () => true,
    (response) => Promise.reject(response)
  )
} satisfies SuccessStrategies

/**
 * 默认成功响应策略集类型
 */
export type DefaultSuccessStrategies = typeof defaultSuccessStrategies
