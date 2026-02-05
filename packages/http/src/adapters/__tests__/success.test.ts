/**
 * adaptSuccess 单元测试
 */
import { describe, it, expect } from 'vitest'
import { adaptSuccess } from '../success'
import type { AxiosResponse } from 'axios'

// 创建模拟响应
const createResponse = <T = unknown>(status: number, data: T): AxiosResponse<T> => ({
  status,
  statusText: status === 200 ? 'OK' : 'Error',
  data,
  headers: {},
  config: {} as any
})

describe('adaptSuccess', () => {
  describe('默认策略', () => {
    it('status === 200 时返回 data', () => {
      const response = createResponse(200, { id: 1, name: 'test' })
      const result = adaptSuccess(response)
      expect(result).toEqual({ id: 1, name: 'test' })
    })

    it('status !== 200 时使用 fallback 返回原始响应', () => {
      const response = createResponse(404, { error: 'Not Found' })
      const result = adaptSuccess(response)
      expect(result).toBe(response)
    })
  })

  describe('自定义策略完全覆盖', () => {
    it('应使用自定义策略替换默认策略', () => {
      const response = createResponse(201, { id: 1 })
      const result = adaptSuccess(response, {
        success: {
          match: (r) => r.status === 201,
          handler: (r) => ({ created: r.data })
        }
      })
      expect(result).toEqual({ created: { id: 1 } })
    })
  })

  describe('部分覆盖 - 只覆盖 match', () => {
    it('应使用自定义 match 和默认 handler', () => {
      const response = createResponse(204, null)
      const result = adaptSuccess(response, {
        success: {
          match: (r) => r.status >= 200 && r.status < 300
          // handler 隐式继承默认行为，返回 r.data
        }
      })
      expect(result).toBeNull() // r.data === null
    })

    it('status 204 应使用部分覆盖的 match', () => {
      const response = createResponse(204, { success: true })
      const result = adaptSuccess(response, {
        success: {
          match: (r) => r.status >= 200 && r.status < 300
        }
      })
      expect(result).toEqual({ success: true })
    })
  })

  describe('部分覆盖 - 只覆盖 handler', () => {
    it('应使用默认 match 和自定义 handler', () => {
      const response = createResponse(200, { id: 1, name: 'test' })
      const result = adaptSuccess(response, {
        success: {
          handler: (r) => ({
            data: r.data,
            timestamp: Date.now(),
            status: r.status
          })
        }
      })
      expect(result).toHaveProperty('data', { id: 1, name: 'test' })
      expect(result).toHaveProperty('timestamp')
      expect(result).toHaveProperty('status', 200)
    })
  })

  describe('添加新策略', () => {
    it('应将新策略添加到策略集合中', () => {
      const response = createResponse(404, { error: 'Not Found' })
      const result = adaptSuccess(response, {
        notFound: {
          match: (r) => r.status === 404,
          handler: () => ({ error: 'Resource not found', code: 404 })
        }
      })
      expect(result).toEqual({ error: 'Resource not found', code: 404 })
    })

    it('新策略必须完整定义', () => {
      const response = createResponse(401, {})
      expect(() => {
        adaptSuccess(response, {
          unauthorized: {
            match: (r) => r.status === 401
            // 缺少 handler
          } as any
        })
      }).toThrow('Strategy "unauthorized" must provide both')
    })

    it('新策略可以匹配在默认策略之前', () => {
      const response = createResponse(200, { id: 1 })
      const result = adaptSuccess(response, {
        custom: {
          match: () => true, // 总是匹配
          handler: () => ({ custom: true })
        }
      })
      expect(result).toEqual({ custom: true })
    })
  })

  describe('策略执行顺序', () => {
    it('应只执行第一个匹配的策略', () => {
      const response = createResponse(200, { data: 'test' })
      const result = adaptSuccess(response, {
        custom: {
          match: () => true,
          handler: () => ({ first: true })
        },
        success: {
          match: (r) => r.status === 200,
          handler: () => ({ second: true })
        }
      })
      expect(result).toEqual({ first: true })
    })
  })
})
