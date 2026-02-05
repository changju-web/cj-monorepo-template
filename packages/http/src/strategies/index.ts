/**
 * 策略层统一导出
 */

// 成功响应策略
export { defaultSuccessStrategies } from './success'
export type { DefaultSuccessStrategies } from './success'

// 错误响应策略
export {
  defaultErrorStrategies,
  type ErrorResponse,
  type HttpErrorResponse,
  type NetworkErrorResponse,
  type TimeoutErrorResponse,
  type CanceledErrorResponse,
  type UnknownErrorResponse
} from './error'
export type { DefaultErrorStrategies } from './error'
