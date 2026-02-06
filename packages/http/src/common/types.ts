/**
 * 通用类型定义
 */
import type { AxiosResponse, AxiosError } from 'axios'

// 导出 Axios 类型
export type { AxiosResponse, AxiosError }

/**
 * 策略谓词函数类型
 */
export type StrategyPredicate<T = unknown> = (params: T) => boolean

/**
 * 策略处理器类型
 */
export type StrategyHandler<T = unknown, R = unknown> = (params: T) => R

/**
 * 完整策略接口
 */
export interface Strategy<T, R> {
  /** 谓词函数，返回 true 表示匹配该策略 */
  match: StrategyPredicate<T>
  /** 处理函数，处理输入并返回结果 */
  handler: StrategyHandler<T, R>
}

/**
 * 策略集合类型
 */
export type Strategies<T = unknown, R = unknown> = Record<string, Strategy<T, R>>

/**
 * 默认成功响应策略集
 */
export type SuccessStrategies = Strategies<AxiosResponse, unknown>

/**
 * 默认错误响应策略集
 */
export type ErrorStrategies = Strategies<AxiosError, unknown>

/**
 * 策略构造函数类型
 */
export type StrategyConstructor<T, R = any> = (
  predicate: StrategyPredicate<T>,
  handler: StrategyHandler<T, R>
) => Strategy<T, R>

/**
 * 策略接口（完整定义，用于类型断言）
 */
export interface CompleteStrategy<T, R> {
  /** 谓词函数，返回 true 表示匹配该策略 */
  match: StrategyPredicate<T>
  /** 处理函数，处理输入并返回结果 */
  handler: StrategyHandler<T, R>
}

/**
 * 部分策略接口（用于覆盖）
 * 与 Strategy 保持一致，但属性是可选的
 */
export interface PartialStrategy<T, R> {
  /** 可选的谓词函数 */
  match?: StrategyPredicate<T>
  /** 可选的处理函数 */
  handler?: StrategyHandler<T, R>
}

/**
 * 策略输入类型（完整或部分）
 */
export type StrategyInput<T, R> = Strategy<T, R> | PartialStrategy<T, R>

/**
 * 成功响应策略类型
 * @template R - 处理函数返回值类型
 * @template T - Axios 响应数据类型
 */
export type SuccessStrategy<R = unknown, T = unknown> = Strategy<AxiosResponse<T>, R>

/**
 * 成功响应策略输入类型
 * @template R - 处理函数返回值类型
 * @template T - Axios 响应数据类型
 */
export type SuccessStrategyInput<R = unknown, T = unknown> = StrategyInput<AxiosResponse<T>, R>

/**
 * 错误策略类型
 * @template E - 处理函数返回值类型
 * @template T - Axios 错误数据类型
 */
export type ErrorStrategy<E = unknown, T = unknown> = Strategy<AxiosError<T>, E>

/**
 * 错误策略输入类型
 * @template E - 处理函数返回值类型
 * @template T - Axios 错误数据类型
 */
export type ErrorStrategyInput<E = unknown, T = unknown> = StrategyInput<AxiosError<T>, E>
