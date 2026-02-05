/**
 * 通用类型定义
 */
import type { AxiosResponse, AxiosError } from 'axios'

// 导出 Axios 类型
export type { AxiosResponse, AxiosError }

/**
 * 策略谓词函数类型
 */
export type StrategyPredicate<T = unknown> = (input: T) => boolean

/**
 * 策略处理器类型
 */
export type StrategyHandler<I = unknown, O = unknown> = (input: I) => O

/**
 * 完整策略接口
 */
export interface Strategy<Predicate, Handler> {
  /** 谓词函数，返回 true 表示匹配该策略 */
  match: Predicate
  /** 处理函数，处理输入并返回结果 */
  handler: Handler
}

/**
 * 部分策略接口（用于覆盖）
 */
export interface PartialStrategy<Predicate, Handler> {
  /** 可选的谓词函数 */
  match?: Predicate
  /** 可选的处理函数 */
  handler?: Handler
}

/**
 * 策略输入类型（完整或部分）
 */
export type StrategyInput<Predicate, Handler> =
  | Strategy<Predicate, Handler>
  | PartialStrategy<Predicate, Handler>

/**
 * 成功响应策略类型
 */
export type SuccessStrategy<R = unknown, T = unknown> = Strategy<
  (response: import('axios').AxiosResponse<T>) => boolean,
  (response: import('axios').AxiosResponse<T>) => R
>

/**
 * 成功响应策略输入类型
 */
export type SuccessStrategyInput<R = unknown, T = unknown> = StrategyInput<
  (response: import('axios').AxiosResponse<T>) => boolean,
  (response: import('axios').AxiosResponse<T>) => R
>

/**
 * 错误策略类型
 */
export type ErrorStrategy<E = unknown, T = unknown> = Strategy<
  (error: import('axios').AxiosError<T>) => boolean,
  (error: import('axios').AxiosError<T>) => E
>

/**
 * 错误策略输入类型
 */
export type ErrorStrategyInput<E = unknown, T = unknown> = StrategyInput<
  (error: import('axios').AxiosError<T>) => boolean,
  (error: import('axios').AxiosError<T>) => E
>
