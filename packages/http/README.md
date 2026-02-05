# @cj-monorepo/http

HTTP 响应适配器 - 基于策略模式的 axios 响应处理工具库。

## 特性

- 🎯 **策略模式**: 基于谓词函数匹配响应
- 🔧 **部分覆盖**: 支持只覆盖 `match` 或 `handler`
- 📦 **开箱即用**: 提供默认策略集
- 🎨 **类型安全**: 完整的 TypeScript 类型支持
- 🧩 **易于扩展**: 轻松添加自定义策略

## 安装

```bash
pnpm add @cj-monorepo/http
```

## 基础使用

### 成功响应适配

```typescript
import { adaptSuccess } from '@cj-monorepo/http';
import axios from 'axios';

// 使用默认策略（status === 200 返回 data）
const data = await axios.get('/api/users').then(adaptSuccess);
```

### 错误响应适配

```typescript
import { adaptError } from '@cj-monorepo/http';

try {
  const data = await axios.get('/api/data').then(adaptSuccess);
} catch (error) {
  const result = adaptError(error);
  console.log(result.error); // 'Network Error' 或 'HTTP Error'
}
```

### 统一适配

```typescript
import { adapt } from '@cj-monorepo/http';

const result = await axios.get('/api/data')
  .then(r => adapt(r));
// 自动判断是响应还是错误
```

## 高级用法

### 自定义策略

```typescript
import { adaptSuccess, matchSuccess } from '@cj-monorepo/http';

// 只覆盖 match 条件
const data = await axios.get('/api/users').then(response =>
  adaptSuccess(response, {
    success: {
      match: (r) => r.status >= 200 && r.status < 300
      // handler 保持默认，返回 r.data
    }
  })
);

// 只覆盖 handler
const enhanced = await axios.get('/api/users').then(response =>
  adaptSuccess(response, {
    success: {
      handler: (r) => ({
        data: r.data,
        timestamp: Date.now(),
        status: r.status
      })
      // match 保持默认，status === 200
    }
  })
);

// 使用匹配辅助函数
import { matchSuccess } from '@cj-monorepo/http';

const custom = await axios.get('/api/data').then(response =>
  adaptSuccess(response, {
    success: {
      match: matchSuccess.statusRange(200, 299),
      handler: (r) => r.data
    }
  })
);
```

### 添加新策略

```typescript
import { adaptSuccess } from '@cj-monorepo/http';

// 新策略必须完整定义
const result = await axios.get('/api/users/123').then(response =>
  adaptSuccess(response, {
    notFound: {
      match: (r) => r.status === 404,
      handler: () => ({ error: 'Resource not found', code: 404 })
    },
    unauthorized: {
      match: (r) => r.status === 401,
      handler: () => ({ needAuth: true })
    }
  })
);
```

### 错误处理

```typescript
import { adaptError, matchError } from '@cj-monorepo/http';

try {
  const data = await axios.get('/api/data').then(adaptSuccess);
} catch (error) {
  // 只覆盖 handler
  const result = adaptError(error, {
    networkError: {
      handler: (e) => ({
        offline: true,
        retryable: true,
        message: e.message
      })
    }
  });

  // 添加新策略
  const detailed = adaptError(error, {
    unauthorized: {
      match: matchError.status(401),
      handler: () => ({ needLogin: true })
    },
    forbidden: {
      match: matchError.status(403),
      handler: () => ({ noPermission: true })
    }
  });
}
```

### Promise 链式处理

```typescript
import { adaptSuccess, adaptError } from '@cj-monorepo/http';

// 标准用法
axios.get('/api/data')
  .then(adaptSuccess)
  .catch(adaptError);

// 使用工厂创建处理器
import { createHandlers } from '@cj-monorepo/http';

const handlers = createHandlers(
  { success: { handler: (r) => r.data } },
  { networkError: { handler: (e) => ({ offline: true }) } }
);

axios.get('/api/data')
  .then(handlers.onSuccess)
  .catch(handlers.onError);
```

## API

### 适配器

| 函数 | 说明 |
|------|------|
| `adaptSuccess()` | 成功响应适配器 |
| `adaptError()` | 错误响应适配器 |
| `adapt()` | 统一适配器 |

### 匹配器

#### matchSuccess

| 方法 | 说明 |
|------|------|
| `status(code)` | 匹配指定状态码 |
| `statusRange(min, max)` | 匹配状态码范围 |
| `header(name, value)` | 匹配响应头 |
| `custom(predicate)` | 自定义匹配 |

#### matchError

| 方法 | 说明 |
|------|------|
| `status(code)` | 匹配 HTTP 状态码 |
| `statusRange(min, max)` | 匹配状态码范围 |
| `code(errorCode)` | 匹配错误代码 |
| `hasResponse()` | 匹配有响应的错误 |
| `isNetworkError()` | 匹配网络错误 |
| `isTimeout()` | 匹配超时错误 |
| `isCanceled()` | 匹配取消错误 |
| `custom(predicate)` | 自定义匹配 |

### 工厂函数

| 函数 | 说明 |
|------|------|
| `createStrategy()` | 创建策略对象 |
| `createSuccessStrategy()` | 创建成功策略 |
| `createErrorStrategy()` | 创建错误策略 |
| `createHandlers()` | 创建 Promise 处理器 |

### 默认策略

#### defaultSuccessStrategies

| 策略 | 匹配条件 | 处理方式 |
|------|----------|----------|
| `success` | `status === 200` | 返回 `response.data` |
| `fallback` | 总是匹配 | 返回原始响应 |

#### defaultErrorStrategies

| 策略 | 匹配条件 | 处理方式 |
|------|----------|----------|
| `httpResponse` | 有 `response` 属性 | 返回 `{ error, status, data }` |
| `networkError` | 有 `request` 无 `response` | 返回 `{ error, code, message }` |
| `timeout` | `code === 'ECONNABORTED'` | 返回 `{ error, message }` |
| `canceled` | `axios.isCancel(error)` | 返回 `{ error }` |
| `fallback` | 总是匹配 | 返回 `{ error, message }` |

## 目录结构

```
src/
├── adapters/          # 适配器层
│   ├── success.ts     # adaptSuccess()
│   ├── error.ts       # adaptError()
│   └── index.ts
├── strategies/        # 策略层
│   ├── success.ts     # defaultSuccessStrategies
│   ├── error.ts       # defaultErrorStrategies
│   └── index.ts
├── matchers/          # 匹配器层
│   ├── success.ts     # matchSuccess
│   ├── error.ts       # matchError
│   └── index.ts
├── common/            # 通用模块
│   ├── types.ts       # 类型定义
│   ├── utils.ts       # 工具函数
│   └── index.ts
├── factories/         # 工厂函数
│   ├── createStrategy.ts
│   ├── createHandlers.ts
│   └── index.ts
├── core.ts            # adapt() 统一适配
└── index.ts           # 主入口
```

## 按需导入

```typescript
// 只导入适配器
import { adaptSuccess, adaptError } from '@cj-monorepo/http/adapters';

// 只导入策略
import { defaultSuccessStrategies } from '@cj-monorepo/http/strategies';

// 只导入匹配器
import { matchSuccess, matchError } from '@cj-monorepo/http/matchers';
```

## License

MIT
