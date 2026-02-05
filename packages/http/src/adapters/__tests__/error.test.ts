/**
 * adaptError 单元测试
 */
import { describe, it, expect } from 'vitest'
import { adaptError } from '../error'
import type { AxiosError } from 'axios'

// 创建模拟错误
const createError = <T = unknown>(
  code?: string,
  response?: { status: number; data: T },
  request?: object
): AxiosError<T> => {
  const error: Partial<AxiosError<T>> = {
    message: 'Test error',
    name: 'Error',
    code,
    response: response
      ? ({
          status: response.status,
          data: response.data,
          headers: {},
          config: {} as any,
          statusText: 'Error'
        } as any)
      : undefined,
    request: request ?? (response ? undefined : {}),
    config: {} as any,
    isAxiosError: true
  }
  return error as AxiosError<T>
}

describe('adaptError', () => {
  describe('HTTP 错误响应', () => {
    it('有 response 属性时匹配 httpResponse', () => {
      const error = createError('undefined', { status: 404, data: { error: 'Not Found' } })
      const result = adaptError(error)
      expect(result).toEqual({
        error: 'HTTP Error',
        status: 404,
        data: { error: 'Not Found' }
      })
    })

    it('应正确返回 500 错误', () => {
      const error = createError('undefined', { status: 500, data: 'Internal Server Error' })
      const result = adaptError(error)
      expect(result).toEqual({
        error: 'HTTP Error',
        status: 500,
        data: 'Internal Server Error'
      })
    })
  })

  describe('网络错误', () => {
    it('有 request 无 response 时匹配 networkError', () => {
      const error = createError('ECONNREFUSED')
      const result = adaptError(error)
      expect(result).toEqual({
        error: 'Network Error',
        code: 'ECONNREFUSED',
        message: 'Test error'
      })
    })

    it('ENOTFOUND 错误应识别为网络错误', () => {
      const error = createError('ENOTFOUND')
      const result = adaptError(error)
      expect(result).toEqual({
        error: 'Network Error',
        code: 'ENOTFOUND',
        message: 'Test error'
      })
    })
  })

  describe('请求超时', () => {
    it('code === ECONNABORTED 时匹配 timeout', () => {
      const error = createError('ECONNABORTED')
      const result = adaptError(error)
      expect(result).toEqual({
        error: 'Request Timeout',
        message: 'Test error'
      })
    })
  })

  describe('请求被取消', () => {
    it('__CANCEL__ === true 时匹配 canceled', () => {
      const error: Partial<AxiosError> = {
        message: 'Cancel',
        name: 'Cancel',
        config: {} as any,
        isAxiosError: true
      }
      ;(error as any).__CANCEL__ = true

      const result = adaptError(error as AxiosError)
      expect(result).toEqual({
        error: 'Request Canceled'
      })
    })
  })

  describe('兜底策略', () => {
    it('没有其他策略匹配时使用 fallback', () => {
      const error: Partial<AxiosError> = {
        message: 'Unknown error',
        name: 'Error',
        config: {} as any,
        isAxiosError: true
      }

      const result = adaptError(error as AxiosError)
      expect(result).toEqual({
        error: 'Unknown Error',
        message: 'Unknown error'
      })
    })
  })

  describe('自定义策略覆盖', () => {
    it('应支持与成功适配器相同的覆盖逻辑', () => {
      const error = createError('ECONNREFUSED')
      const result = adaptError(error, {
        networkError: {
          handler: (e) => ({
            offline: true,
            retryable: true,
            message: e.message
          })
        }
      })
      expect(result).toEqual({
        offline: true,
        retryable: true,
        message: 'Test error'
      })
    })

    it('只覆盖 match', () => {
      const error = createError('ECONNREFUSED')
      const result = adaptError(error, {
        networkError: {
          match: (e) => e.code === 'ECONNREFUSED'
          // handler 隐式继承默认行为
        }
      })
      expect(result).toEqual({
        error: 'Network Error',
        code: 'ECONNREFUSED',
        message: 'Test error'
      })
    })
  })

  describe('添加新策略', () => {
    it('应支持添加新的错误策略', () => {
      const error = createError('undefined', { status: 401, data: 'Unauthorized' })
      const result = adaptError(error, {
        unauthorized: {
          match: (e) => e.response?.status === 401,
          handler: () => ({ needLogin: true })
        }
      })
      expect(result).toEqual({ needLogin: true })
    })

    it('新策略必须在默认策略之前匹配', () => {
      const error = createError('undefined', { status: 403, data: 'Forbidden' })
      const result = adaptError(error, {
        forbidden: {
          match: (e) => e.response?.status === 403,
          handler: () => ({ noPermission: true })
        }
      })
      expect(result).toEqual({ noPermission: true })
    })

    it('新策略必须完整定义', () => {
      const error = createError('undefined', { status: 401, data: 'Unauthorized' })
      expect(() => {
        adaptError(error, {
          unauthorized: {
            match: (e) => e.response?.status === 401
            // 缺少 handler
          } as any
        })
      }).toThrow('Error strategy "unauthorized" must provide both')
    })
  })
})
