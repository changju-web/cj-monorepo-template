# @cj-monorepo/http

HTTP 响应适配器 - 基于策略模式的 axios 响应处理工具库。

## 特性

- **策略模式**: 基于谓词函数匹配响应，灵活可扩展
- **部分覆盖**: 支持只覆盖 `match` 或 `handler`，无需重写整个策略
- **类型安全**: 完整的 TypeScript 类型支持，编译时类型检查
- **开箱即用**: 提供默认策略集，快速上手
- **易于扩展**: 轻松添加自定义策略或覆盖默认策略

## 安装

```bash
pnpm add @cj-monorepo/http
```

## 快速开始

### 基础用法

```typescript
import { adaptSuccess, adaptError } from '@cj-monorepo/http'
import axios from 'axios'

// 使用默认策略处理成功响应
const data = await axios.get('/api/users').then(adaptSuccess)

// 错误处理
try {
  const data = await axios.get('/api/data').then(adaptSuccess)
} catch (error) {
  const result = adaptError(error)
  console.log(result)
}
```

### 统一适配

```typescript
import { adapt } from '@cj-monorepo/http'

// 自动判断是响应还是错误
const result = await axios.get('/api/data').then((r) => adapt(r))
```

## 高级用法

### 自定义策略

#### 只覆盖 match 条件

```typescript
import { adaptSuccess } from '@cj-monorepo/http'

// 扩展成功条件为 2xx 状态码
const data = await axios.get('/api/users').then((response) =>
  adaptSuccess(response, {
    success: {
      match: (r) => r.status >= 200 && r.status < 300
      // handler 保持默认
    }
  })
)
```

#### 只覆盖 handler

```typescript
// 增强响应数据
const enhanced = await axios.get('/api/users').then((response) =>
  adaptSuccess(response, {
    success: {
      handler: (r) => ({
        data: r.data,
        timestamp: Date.now(),
        status: r.status
      })
      // match 保持默认
    }
  })
)
```

### 使用匹配辅助函数

```typescript
import { adaptSuccess, matchSuccess } from '@cj-monorepo/http'

// 使用预定义的匹配器
const data = await axios.get('/api/data').then((response) =>
  adaptSuccess(response, {
    ok: {
      match: matchSuccess.statusRange(200, 299),
      handler: (r) => r.data
    },
    created: {
      match: matchSuccess.status(201),
      handler: (r) => ({ id: r.data.id, created: true })
    }
  })
)
```

### 错误处理

```typescript
import { adaptError, matchError } from '@cj-monorepo/http'

try {
  const data = await axios.get('/api/data').then(adaptSuccess)
} catch (error) {
  // 自定义错误处理
  const result = adaptError(error, {
    fallback: {
      handler: (e) => ({
        offline: !e.response,
        message: e.message,
        code: e.code
      })
    },
    // 添加新策略
    unauthorized: {
      match: matchError.status(401),
      handler: () => ({ needLogin: true })
    },
    forbidden: {
      match: matchError.status(403),
      handler: () => ({ noPermission: true })
    },
    notFound: {
      match: matchError.status(404),
      handler: () => ({ notFound: true })
    }
  })
}
```

### Promise 链式处理

```typescript
import { createHandlers } from '@cj-monorepo/http'

// 创建处理器
const handlers = createHandlers(
  { success: { handler: (r) => r.data } },
  { fallback: { handler: (e) => ({ error: e.message }) } }
)

// 使用处理器
axios.get('/api/data').then(handlers.onSuccess).catch(handlers.onError)
```

### 创建自定义策略

```typescript
import { createSuccessStrategy, createErrorStrategy } from '@cj-monorepo/http'

// 创建成功策略
const successStrategy = createSuccessStrategy(
  (r) => r.status >= 200 && r.status < 300,
  (r) => r.data
)

// 创建错误策略
const errorStrategy = createErrorStrategy(
  (e) => e.response?.status === 404,
  () => ({ notFound: true })
)
```

## API 参考

### 适配器函数

| 函数             | 描述                         |
| ---------------- | ---------------------------- |
| `adaptSuccess()` | 处理成功响应                 |
| `adaptError()`   | 处理错误响应                 |
| `adapt()`        | 统一适配器，自动判断响应类型 |

### 匹配辅助函数

#### matchSuccess

| 方法                    | 描述                 |
| ----------------------- | -------------------- |
| `status(code)`          | 匹配指定 HTTP 状态码 |
| `statusRange(min, max)` | 匹配状态码范围       |
| `header(name, value)`   | 匹配响应头           |
| `custom(predicate)`     | 自定义匹配条件       |

#### matchError

| 方法                    | 描述                   |
| ----------------------- | ---------------------- |
| `status(code)`          | 匹配 HTTP 错误状态码   |
| `statusRange(min, max)` | 匹配错误状态码范围     |
| `code(errorCode)`       | 匹配错误代码           |
| `hasResponse()`         | 匹配有响应的错误       |
| `isNetworkError()`      | 匹配网络错误（无响应） |
| `isTimeout()`           | 匹配超时错误           |
| `isCanceled()`          | 匹配取消的请求         |
| `custom(predicate)`     | 自定义匹配条件         |

### 工厂函数

| 函数                      | 描述                |
| ------------------------- | ------------------- |
| `createStrategy()`        | 创建通用策略对象    |
| `createSuccessStrategy()` | 创建成功响应策略    |
| `createErrorStrategy()`   | 创建错误策略        |
| `createHandlers()`        | 创建 Promise 处理器 |

### 默认策略

#### defaultSuccessStrategies

| 策略       | 匹配条件               | 处理方式                        |
| ---------- | ---------------------- | ------------------------------- |
| `success`  | `status === 200`       | 返回原始响应对象                |
| `file`     | `data instanceof Blob` | 返回原始响应对象                |
| `fallback` | 总是匹配               | 返回 `Promise.reject(response)` |

#### defaultErrorStrategies

| 策略       | 匹配条件 | 处理方式         |
| ---------- | -------- | ---------------- |
| `fallback` | 总是匹配 | 返回原始错误对象 |

## 类型定义

### 核心类型

```typescript
// 策略谓词函数
type StrategyPredicate<T> = (params: T) => boolean

// 策略处理函数
type StrategyHandler<T, R> = (params: T) => R

// 完整策略接口
interface Strategy<T, R> {
  match: StrategyPredicate<T>
  handler: StrategyHandler<T, R>
}

// 部分策略接口（用于覆盖）
interface PartialStrategy<T, R> {
  match?: StrategyPredicate<T>
  handler?: StrategyHandler<T, R>
}

// 策略输入类型
type StrategyInput<T, R> = Strategy<T, R> | PartialStrategy<T, R>
```

### 成功响应类型

```typescript
// 成功响应策略
type SuccessStrategy<R, T> = Strategy<AxiosResponse<T>, R>

// 成功响应策略输入
type SuccessStrategyInput<R, T> = StrategyInput<AxiosResponse<T>, R>
```

### 错误响应类型

```typescript
// 错误策略
type ErrorStrategy<E, T> = Strategy<AxiosError<T>, E>

// 错误策略输入
type ErrorStrategyInput<E, T> = StrategyInput<AxiosError<T>, E>
```

## 目录结构

```
src/
├── adapters/              # 适配器层
│   ├── success.ts         # adaptSuccess()
│   ├── error.ts           # adaptError()
│   └── index.ts
├── strategies/            # 策略层
│   ├── success.ts         # defaultSuccessStrategies
│   ├── error.ts           # defaultErrorStrategies
│   └── index.ts
├── matchers/              # 匹配器层
│   ├── success.ts         # matchSuccess
│   ├── error.ts           # matchError
│   └── index.ts
├── common/                # 通用模块
│   ├── types.ts           # 类型定义
│   ├── utils.ts           # 工具函数
│   └── index.ts
├── factories/             # 工厂函数
│   ├── createStrategy.ts  # 策略创建函数
│   ├── createHandlers.ts  # 处理器创建函数
│   └── index.ts
├── core.ts                # adapt() 统一适配
└── index.ts               # 主入口
```

## 按需导入

```typescript
// 只导入适配器
import { adaptSuccess, adaptError } from '@cj-monorepo/http/adapters'

// 只导入策略
import { defaultSuccessStrategies } from '@cj-monorepo/http/strategies'

// 只导入匹配器
import { matchSuccess, matchError } from '@cj-monorepo/http/matchers'

// 只导入工厂函数
import { createStrategy, createHandlers } from '@cj-monorepo/http/factories'

// 只导入类型
import type {
  Strategy,
  StrategyInput,
  SuccessStrategy,
  ErrorStrategy
} from '@cj-monorepo/http/common'
```

## License

MIT
